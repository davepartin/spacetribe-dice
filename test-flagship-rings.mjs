import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
await new Promise(r=>setTimeout(r,200));
const w=dom.window,d=dom.window.document;
w.newGame();
// one ship of every size, values forced, so we can see exactly who gets a ring
const PANEL={atkEach:"#6 Attack",defEach:"#5 Shields",repair:"#3 Repair",
             energy2:"#4 Energy",direct:"#2 Direct",reactor:"#1 Reactor"};
const bad=[];
for(const [id,label] of Object.entries(PANEL)){
  // point the flagship at this face
  const face=w.G.you.flag.faces.indexOf(id);
  if(face<0){ console.log("!! no face carries",id); continue; }
  w.G.you.flag.face=face;
  w.startRound();
  w.G.you.values=[1,2,3,4,5,6].map((v,i)=>({sides:10,value:v}));
  w.G.you.flag.face=face;
  w.render();
  const cards=[...d.querySelectorAll(".grid > .die:not(.flag)")];
  const ring=cards.map(c=>{
    const v=c.querySelector("text")?.textContent ?? "?";
    const cls=["fr","fb","fh","fe","fd"].find(x=>c.classList.contains(x));
    return v+(cls?"●":"·");
  });
  console.log(label.padEnd(12), ring.join(" "));
  // cross-check against what applyPanel actually counts
  const t=w.tally(w.runDice(w.G.you), id, 2, null);
  const base=w.tally(w.runDice(w.G.you), null, 2, null);
  const paid=(t.attack-base.attack)+(t.defense-base.defense)+(t.heal-base.heal)+
             (t.energy-base.energy)+(t.direct-base.direct);
  const rings=cards.filter(c=>["fr","fb","fh","fe","fd"].some(x=>c.classList.contains(x))).length;
  if(id==="reactor"){ if(rings) bad.push("reactor drew "+rings+" rings"); }
  else if(rings*2!==paid) bad.push(id+": "+rings+" rings but the panel paid "+paid+" (expected "+paid/2+")");
}
console.log("\nrings match what the panel actually pays:", bad.length?bad:"yes, all six");
console.log("errors:", errs.length?errs:"none");
