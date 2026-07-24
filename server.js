import { createServer } from "node:http";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.SCOREBOARD_DATA_DIR
  ? resolve(process.env.SCOREBOARD_DATA_DIR)
  : join(root, ".data");
const scoreFile = join(dataDir, "scores.json");
const port = Number.parseInt(process.env.PORT || "4173", 10);
const adminToken = process.env.SCOREBOARD_ADMIN_TOKEN || "";
const rateLimit = new Map();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(body));
}

async function readScores() {
  try {
    const content = await readFile(scoreFile, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    console.error("Could not read scoreboard:", error.message);
    return [];
  }
}

async function persistScores(scores) {
  await mkdir(dataDir, { recursive: true });
  const temporary = join(dataDir, `scores-${process.pid}.tmp`);
  await writeFile(temporary, JSON.stringify(scores, null, 2), "utf8");
  await rename(temporary, scoreFile);
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

export function cleanEntry(input) {
  const name = String(input?.name || "").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, 18);
  const score = Number(input?.score);
  const scoreVersion = Number.parseInt(input?.scoreVersion ?? 1, 10);
  const runId = String(input?.runId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  if (!name || !runId || !Number.isInteger(score) || score < 0 || score > 999999 || !Number.isInteger(scoreVersion) || scoreVersion < 1 || scoreVersion > 99) return null;
  const breakdown = input?.breakdown && typeof input.breakdown === "object"
    ? {
        apogee: Math.max(0, Math.min(999999, Number.parseInt(input.breakdown.apogee, 10) || 0)),
        dice: Math.max(0, Math.min(8, Number.parseInt(input.breakdown.dice, 10) || 0)),
        ships: Math.max(0, Math.min(6, Number.parseInt(input.breakdown.ships, 10) || 0)),
        bestTrack: Math.max(0, Math.min(5, Number.parseInt(input.breakdown.bestTrack, 10) || 0)),
        hits: Math.max(0, Math.min(9999, Number.parseInt(input.breakdown.hits, 10) || 0)),
        distress: Math.max(0, Math.min(10, Number.parseInt(input.breakdown.distress, 10) || 0))
      }
    : { apogee: 0, dice: 0, ships: 0, bestTrack: 0, hits: 0, distress: 0 };
  return { name, score, scoreVersion, runId, createdAt: new Date().toISOString(), breakdown };
}

export function keepTopScoresByVersion(scores) {
  const groups = new Map();
  for (const score of scores) {
    const version = Number.isInteger(score.scoreVersion) ? score.scoreVersion : 1;
    const group = groups.get(version) || [];
    group.push(score);
    groups.set(version, group);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .flatMap(([, group]) => group
      .sort((left, right) => right.score - left.score || left.createdAt.localeCompare(right.createdAt))
      .slice(0, 10));
}

function allowScore(request) {
  const forwarded = request.headers["x-forwarded-for"]?.split(",")[0]?.trim();
  const address = forwarded || request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const history = (rateLimit.get(address) || []).filter((time) => now - time < 60 * 60 * 1000);
  if (history.length >= 10) return false;
  history.push(now);
  rateLimit.set(address, history);
  return true;
}

async function handleApi(request, response, pathname) {
  if (pathname === "/api/health" && request.method === "GET") {
    return sendJson(response, 200, { ok: true, service: "apogee-forge" });
  }
  if (pathname !== "/api/scores") return sendJson(response, 404, { error: "Not found" });

  if (request.method === "GET") {
    const scores = await readScores();
    return sendJson(response, 200, { scores });
  }

  if (request.method === "POST") {
    if (!allowScore(request)) return sendJson(response, 429, { error: "Score transmission limit reached" });
    try {
      const entry = cleanEntry(await readBody(request));
      if (!entry) return sendJson(response, 400, { error: "Invalid score entry" });
      const existing = await readScores();
      const scores = existing.filter((score) => score.runId !== entry.runId);
      scores.push(entry);
      const top = keepTopScoresByVersion(scores);
      await persistScores(top);
      return sendJson(response, 201, { scores: top, accepted: top.some((score) => score.runId === entry.runId) });
    } catch (error) {
      return sendJson(response, error.message === "Payload too large" ? 413 : 400, { error: error.message });
    }
  }

  if (request.method === "DELETE") {
    const supplied = request.headers["x-admin-token"] || "";
    if (!adminToken || supplied !== adminToken) return sendJson(response, 403, { error: "Administrator token required" });
    await persistScores([]);
    return sendJson(response, 200, { scores: [] });
  }

  response.setHeader("Allow", "GET, POST, DELETE");
  return sendJson(response, 405, { error: "Method not allowed" });
}

async function serveStatic(request, response, pathname) {
  const requested = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
  const safePath = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(root, safePath);
  if (!filePath.startsWith(root)) return sendJson(response, 403, { error: "Forbidden" });

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, "index.html");
    const content = await readFile(filePath);
    const extension = extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "SAMEORIGIN"
    });
    if (request.method === "HEAD") response.end();
    else response.end(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      const fallback = await readFile(join(root, "index.html"));
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      response.end(fallback);
      return;
    }
    sendJson(response, 500, { error: "Static file error" });
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) await handleApi(request, response, url.pathname);
    else if (request.method === "GET" || request.method === "HEAD") await serveStatic(request, response, url.pathname);
    else sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    if (!response.headersSent) sendJson(response, 500, { error: "Internal server error" });
    else response.end();
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Apogee Forge online at http://localhost:${port}`);
    if (!adminToken) console.log("Set SCOREBOARD_ADMIN_TOKEN to enable shared scoreboard resets.");
  });
}
