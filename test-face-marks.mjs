import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,220));
const w=dom.window,d=dom.window.document;
w.newGame();
console.log("What each face pays, straight from the engine:");
for(let n=1;n<=10;n++){
  const e=w.energyOf(n), h=w.healOf(n), dr=w.directOf(n);
  console.log("  "+String(n).padStart(2)+"  "+(n%2?"blocks":"hits  ")+" "+String(n).padStart(2)+
    "   "+(e?"⚡".repeat(e)+" "+e+" Energy":"").padEnd(14)+
    (h?"✚".repeat(h)+" "+h+" repair":"").padEnd(14)+
    (dr?"»".repeat(dr)+" "+dr+" Direct":""));
}
// what actually gets DRAWN on each hull face
console.log("\nMarks drawn on the die faces (d10 hull):");
for(let n=1;n<=10;n++){
  const svg=w.hullSvg(10,n,n%2?"defense":"attack");
  const bolts=(svg.match(/class="mk"/g)||[]).length;
  const cross=(svg.match(/class="cr"/g)||[]).length;
  const chev =(svg.match(/class="ch"/g)||[]).length;
  console.log("  "+String(n).padStart(2)+"  bolts:"+bolts+"  crosses:"+cross+"  chevrons:"+chev);
}
w.G.phase="help"; w.render();
console.log("\nLegend as a player reads it:");
[...d.querySelectorAll(".krow")].forEach(r=>console.log("   "+
  r.querySelector("b").textContent.padEnd(3)+" "+r.querySelector(".kdoes").textContent.replace(/\s+/g," ")));
console.log("\nFlagship faces:", [...d.querySelectorAll(".fref")].map(f=>
  f.querySelector("b").textContent+"="+f.querySelector("span").textContent).join("  "));
console.log("\nerrors:", errs.length?errs:"none");
