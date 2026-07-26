import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync("/sessions/lucid-amazing-edison/mnt/spacetribe-dice/simple.html","utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,200));
const w=dom.window,d=dom.window.document;
const flat=x=>x.replace(/\s+/g," ").trim();
w.newGame(); w.G.you.energy=40; w.G.phase="shop"; w.render();
const card=[...d.querySelectorAll(".card")].find(c=>/Upgrade your flagship/.test(c.textContent));
console.log("── SHOP · flagship section ──");
console.log(" head:", flat(card.querySelector("h3").textContent), "|", flat(card.querySelector(".ssub").textContent));
console.log(" body:", flat(card.querySelector("p").textContent));
console.log(" ladder:", [...card.querySelectorAll(".lvl")].map(x=>
  flat(x.querySelector(".ln").textContent)+" "+flat(x.querySelector(".lp").innerHTML.replace("<br>"," "))).join("  ·  "));
console.log(" button:", flat(card.querySelector(".buy small").textContent));

d.querySelector("[data-flagup]").click();
console.log("\n after upgrading, ladder:", [...d.querySelectorAll(".lvl")].map(x=>
  flat(x.querySelector(".ln").textContent)+(x.classList.contains("now")?"◀":"")).join(" "));
w.G.you.flag.lvl=3; w.render();
const c3=[...d.querySelectorAll(".card")].find(c=>/level 3/.test(c.textContent));
console.log(" at the ceiling:", flat(c3.textContent));

w.G.phase="help"; w.render();
const hf=[...d.querySelectorAll(".card")].find(c=>/Your flagship/.test(c.textContent));
console.log("\n── HOW TO PLAY · flagship ──\n", flat(hf.querySelector("p").textContent));

console.log("\nany 'face pays' anywhere:", /face(s)? pays/.test(d.body.textContent)?"YES (!!)":"no");
console.log("errors:", errs.length?errs:"none");
