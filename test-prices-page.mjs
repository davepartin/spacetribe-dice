import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,200));
const w=dom.window,d=dom.window.document;
w.newGame();
for(const [e,base] of [[0,0],[7,2],[30,4]]){
  w.G.you.energy=e; w.G.you.base=base; w.G.phase="costs"; w.render();
  console.log("\n════ with "+e+" Energy ════");
  console.log(d.querySelector(".say").textContent.replace(/\s+/g," ").trim());
  if(e===7){
    [...d.querySelectorAll(".card")].forEach(c=>{
      const h=c.querySelector(".shead");
      if(h) console.log("\n  ── "+h.querySelector("h3").textContent+" · "+h.querySelector(".ssub").textContent);
      [...c.querySelectorAll(".cr")].forEach(r=>console.log("    "+
        r.querySelector(".cw").textContent.replace(/\s+/g," ").trim().padEnd(50,".")+" "+
        r.querySelector(".cp").textContent.padStart(8)));
      const hint=c.querySelector(".hint"); if(hint) console.log("    · "+hint.textContent.replace(/\s+/g," ").trim());
      const ln=c.querySelector(".rep .line"); if(ln&&!h) console.log("  "+ln.textContent.replace(/\s+/g," ").trim());
    });
  }
}
// the nudge must be gone from the roll screen too
w.G.you.energy=9; w.startRound();
w.sel={0:true}; w.render();
console.log("\nroll screen buttons:", [...d.querySelectorAll(".wrap button")].map(b=>
  '"'+b.textContent.replace(/\s+/g," ").trim()+'"').join(" "));
console.log("any nudge left in the page:", /nudge/i.test(d.body.innerHTML)?"YES (!!)":"no");
console.log("\nerrors:", errs.length?errs:"none");
