import { JSDOM } from "jsdom"; import fs from "fs";
const src=fs.readFileSync(new URL("simple.html", import.meta.url),"utf8");
const dom=new JSDOM(src,{runScripts:"dangerously",pretendToBeVisual:true});
const errs=[]; dom.virtualConsole.on("jsdomError",e=>errs.push(String(e).split("\n")[0]));
dom.window.onerror=x=>errs.push("onerror: "+x);
await new Promise(r=>setTimeout(r,200));
const w=dom.window,d=dom.window.document;
const toShop=()=>{ w.doReroll(); w.submit(); if(w.G.phase==="brace")(d.getElementById("brace-done")||{click(){}}).click(); w.nextRound(); };
const buttons=()=>[...d.querySelectorAll(".sbuy")].map(b=>b.textContent+(b.disabled?" [off]":" [on]")).join("  ");
w.newGame(); toShop();

w.G.you.energy=7; w.render();
console.log("with 7 energy :", buttons());
w.G.you.energy=0; w.render();
console.log("with 0 energy :", buttons());
w.G.you.energy=40; w.render();
console.log("with 40 energy:", buttons());

console.log("\nGROW: fleet before", w.G.you.dice.map(x=>"d"+x.s).join(","), "· energy", w.G.you.energy);
d.querySelector("[data-grow='0']").click();
console.log("      fleet after ", w.G.you.dice.map(x=>"d"+x.s).join(","), "· energy", w.G.you.energy);

console.log("\nUNLOCK: open slots before", w.openSlots(w.G.you), "· energy", w.G.you.energy);
d.querySelector("[data-unlock]").click();
console.log("        open slots after ", w.openSlots(w.G.you), "· energy", w.G.you.energy);

console.log("\nBUY: fleet before", w.G.you.dice.map(x=>"d"+x.s).join(","), "· energy", w.G.you.energy);
[...d.querySelectorAll(".sbuy")].find(b=>!b.disabled && b.getAttribute("data-buysize")==="10").click();
console.log("     fleet after ", w.G.you.dice.map(x=>"d"+x.s).join(","), "· energy", w.G.you.energy);

console.log("\nSCRAP: berth 1 button says", JSON.stringify(d.querySelector(".scrapb").textContent));
const before=w.G.you.dice.length, e0=w.G.you.energy;
d.querySelector(".scrapb").click();
console.log("       ships", before, "->", w.G.you.dice.length, "· energy", e0, "->", w.G.you.energy);

// fill every berth, then check the shipyard says so
while(w.openSlots(w.G.you)<w.K("maxDice")) w.G.you.slots++;
while(w.G.you.dice.length<w.K("maxDice")) w.G.you.dice.push(w.newShip(4));
w.render();
console.log("\nfull fleet   :", buttons());
console.log("shipyard says:", d.querySelector(".card p").textContent);

// a damaged ship must be unscrappable
w.G.you.dice[0].out=w.G.round+5; w.render();
const db=[...d.querySelectorAll(".scrapb")][0];
console.log("\ndamaged berth:", JSON.stringify(db.textContent), db.disabled?"[locked]":"[!! CLICKABLE]");
const n=w.G.you.dice.length; db.click();
console.log("clicking it  : ships", n, "->", w.G.you.dice.length, w.G.you.dice.length===n?"(held)":"(!! SCRAPPED)");
const gb=[...d.querySelectorAll(".growb")][0];
console.log("damaged growth:", gb.disabled?"locked ✓":"!! CLICKABLE");
console.log("\nerrors:", errs.length?errs:"none");
