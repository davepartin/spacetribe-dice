import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const errs=[], bad=[];
let shown=0;
for(let m=0;m<25;m++){
  const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
  dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
  dom.window.onerror=x=>errs.push("onerror: "+x);
  await new Promise(r=>setTimeout(r,120));
  const w=dom.window,d=dom.window.document; w.newGame();
  for(let r=0;r<200 && w.G.phase!=="over";r++){
    if(w.G.phase==="shop"){ w.startRound(); continue; }
    if(w.G.phase==="roll"){ w.submit(); continue; }
    if(w.G.phase==="brace"){ if(Math.random()<.5){const p=d.querySelector("[data-brace]"); if(p)p.click();}
      (d.getElementById("brace-done")||{click(){}}).click(); continue; }
    if(w.G.phase==="report"){
      // every ledger must add up: rows above the total must equal the total
      d.querySelectorAll(".led").forEach(led=>{
        const rows=[...led.querySelectorAll(".lr")];
        const end=rows.pop(); const sub=rows.findIndex(x=>x.classList.contains("sub"));
        const num=t=>parseInt(t.replace("−","-").replace("+",""),10);
        const above=rows.filter(x=>!x.classList.contains("sub"))
          .map(x=>num(x.querySelector("b").textContent));
        const sum=above.reduce((a,b)=>a+b,0), total=num(end.querySelector("b").textContent);
        if(sum!==total) bad.push(led.querySelector(".ledh span").textContent+": rows "+
          above.join(" ")+" = "+sum+" but total says "+total);
        // the subtotal must equal everything before it
        const pre=rows.slice(0,sub).map(x=>num(x.querySelector("b").textContent))
          .reduce((a,b)=>a+b,0);
        const subv=num(rows[sub].querySelector("b").textContent);
        if(Math.max(0,pre)!==subv) bad.push("subtotal "+pre+" vs "+subv);
      });
      shown++;
      w.nextRound(); continue;
    }
    break;
  }
  dom.window.close();
}
console.log("report screens checked:", shown);
console.log("ledgers that did not add up:", bad.length?[...new Set(bad)].slice(0,6):"none");
console.log("errors:", errs.length?[...new Set(errs)].slice(0,3):"none");
