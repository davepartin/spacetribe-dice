import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const bad=[],errs=[]; let seen=0, boxes=0, sample=null;
for(let m=0;m<30;m++){
  const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
  dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
  dom.window.onerror=x=>errs.push("onerror: "+x);
  await new Promise(r=>setTimeout(r,120));
  const w=dom.window,d=dom.window.document; w.newGame();
  for(let r=0;r<200 && w.G.phase!=="over";r++){
    if(w.G.phase==="shop"){ w.startRound(); continue; }
    if(w.G.phase==="roll"){ if(w.G.you.rolls===0) w.doReroll(); w.submit(); continue; }
    if(w.G.phase==="brace"){ if(Math.random()<.5){const p=d.querySelector("[data-brace]");if(p)p.click();}
      (d.getElementById("brace-done")||{click(){}}).click(); continue; }
    if(w.G.phase==="report"){
      seen++;
      const rep=w.G.report, rows=[...d.querySelectorAll(".rr")];
      [["You",rep.you.run,rep.youDice],["Them",rep.them.run,rep.themDice]].forEach(([lbl,run,dice],ri)=>{
        const row=rows[ri];
        const chips=[...row.querySelectorAll(".chip")].map(c=>+c.textContent);
        const want=dice.map(x=>x.value).sort((a,b)=>a-b);
        if(chips.join()!==want.join()) bad.push(lbl+" chips "+chips+" != roll "+want);
        const box=row.querySelector(".runbox");
        if(run){
          if(!box) bad.push(lbl+" had a straight but no gold box");
          else{ boxes++;
            const inb=[...box.querySelectorAll(".chip")].map(c=>+c.textContent);
            if(inb.some(v=>v<run.start||v>run.top)) bad.push(lbl+" box holds "+inb+" outside "+run.start+"-"+run.top);
            for(let v=run.start;v<=run.top;v++) if(!inb.includes(v)) bad.push(lbl+" box missing "+v);
            const out=chips.filter((_,i)=>true).length-inb.length;
            if(chips.filter(v=>v>=run.start&&v<=run.top).length!==inb.length)
              bad.push(lbl+" a run value sits outside the box");
          }
        } else if(box) bad.push(lbl+" no straight but a gold box appeared");
        // exactly one flagship chip per row
        const fl=row.querySelectorAll(".chip.fl").length;
        if(fl!==1) bad.push(lbl+" had "+fl+" flagship chips");
      });
      if(!sample && (rep.you.run||rep.them.run)) sample={html:d.querySelector(".rolls").outerHTML, rep};
      w.nextRound(); continue;
    }
    break;
  }
  dom.window.close();
}
console.log("report screens:", seen, "· gold boxes drawn:", boxes);
console.log("faults:", bad.length?[...new Set(bad)].slice(0,6):"none");
console.log("errors:", errs.length?[...new Set(errs)].slice(0,3):"none");
if(sample){
  const t=sample.html.replace(/<span class="runbox">/g,"[").replace(/<\/span>/g,"")
    .replace(/<span class="chip fl">/g," ✦").replace(/<span class="chip \w+">/g," ")
    .replace(/<div class="rl">/g,"\n").replace(/<div class="verd[^"]*">/g,"\n      → ")
    .replace(/<div class="leg">/g,"\n\n").replace(/<[^>]+>/g,"").replace(/\n{3,}/g,"\n\n");
  console.log("\n--- sample (✦ = flagship, [ = start of the gold box) ---");
  console.log(t.split("[").join("[").trim());
}
