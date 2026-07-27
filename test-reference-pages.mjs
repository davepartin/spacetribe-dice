import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,220));
const w=dom.window,d=dom.window.document;
w.newGame(); w.G.you.energy=11; w.G.you.base=2; w.render();
console.log("HEADER buttons:", [...d.querySelectorAll("header button")].map(b=>
  '"'+b.textContent+'" (#'+b.id+')').join("  "));
console.log("DOCK buttons  :", [...d.querySelectorAll(".dock button")].map(b=>
  '"'+b.textContent.replace(/\s+/g," ")+'" (#'+b.id+')').join("  "));

d.getElementById("costs").click();
console.log("\n=== " + d.querySelector("h2").textContent.toUpperCase() + " ===");
console.log(d.querySelector(".say").textContent.trim());
[...d.querySelectorAll(".card")].forEach(c=>{
  const h=c.querySelector(".shead"); if(h) console.log("\n  ── "+h.querySelector("h3").textContent+
    " · "+h.querySelector(".ssub").textContent+" ──");
  [...c.querySelectorAll(".cr")].forEach(r=>console.log("    "+
    r.querySelector(".cw").textContent.padEnd(46,".")+" "+r.querySelector(".cp").textContent.padStart(7)+
    "\n        "+r.querySelector(".cy").textContent.replace(/\s+/g," ").trim()));
  const hint=c.querySelector(".hint"); if(hint) console.log("    · "+hint.textContent.trim());
  const line=c.querySelector(".rep .line"); if(line&&!h) console.log("  "+line.textContent.replace(/\s+/g," ").trim());
});
d.getElementById("back").click();
console.log("\nback →", w.G.phase);

d.getElementById("help").click();
console.log("\n=== " + d.querySelector("h2").textContent.toUpperCase() + " ===");
[...d.querySelectorAll(".card .shead")].forEach(h=>console.log("  ── "+
  h.querySelector("h3").textContent+" · "+h.querySelector(".ssub").textContent));
console.log("  legend rows:", d.querySelectorAll(".krow").length,
  "· straight table rows:", d.querySelectorAll("table tr, .strow").length,
  "· face reference:", [...d.querySelectorAll(".fref")].map(f=>f.querySelector("b").textContent+"="+f.querySelector("span").textContent).join(" "));
d.getElementById("back").click();
console.log("back →", w.G.phase);

d.getElementById("tune").click();
console.log("\nversion number opens:", w.G.phase);
d.getElementById("tune").click();
console.log("and closes back to:", w.G.phase);
console.log("\nerrors:", errs.length?errs:"none");
