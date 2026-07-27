import re, collections, sys
from pathlib import Path
s=Path(__file__).with_name("simple.html").read_text()
js=s[s.index("<script>"):]
js=re.sub(r"^\s*//[^\n]*$","",js,flags=re.M)          # drop comment lines
# player-facing strings: any quoted run containing a lowercase word of 3+ letters
strs=[]
for m in re.finditer(r"'((?:[^'\\]|\\.)*)'", js):
    t=m.group(1)
    if re.search(r"[a-z]{3}", t) and not t.startswith("<div class=") and "u00" not in t[:6]:
        strs.append(t)
for m in re.finditer(r'"((?:[^"\\]|\\.)*)"', js):
    t=m.group(1)
    if re.search(r"[a-z]{3}", t) and not re.fullmatch(r"[\w-]+", t):
        strs.append(t)
text=" ".join(strs)
text=re.sub(r"<[^>]+>"," ",text)
text=re.sub(r"\\u2014|\\u00b7|\\u26a1|\\u2192"," ",text)
words=re.findall(r"[A-Za-z][A-Za-z']+", text)
c=collections.Counter(w.lower() for w in words)

pairs=[("ship","ships"),("die","dice"),("hull","hulls"),("berth","berths"),("slot","slots"),
       ("repair","repairs"),("heal","heals"),("healing",""),("damaged","damage"),
       ("hurt",""),("scrap","scraps"),("sell","sold"),("volley","volleys"),
       ("direct",""),("bonus","bonuses"),("adds","pays"),("energy",""),("attack","attacks"),
       ("shield","shields"),("block","blocks"),("hit","hits"),("straight","straights"),
       ("flagship","flagships"),("level","levels"),("round","rounds"),("fleet","fleets"),
       ("reroll","rerolls"),("roll","rolls"),("upgrade","upgrades")]
print("── word counts across every player-facing string ──")
seen=set()
for a,b in pairs:
    for w in (a,b):
        if w and w not in seen:
            seen.add(w)
            if c[w]: print("  %-12s %d" % (w, c[w]))
print("\n── words that might be strays ──")
for w,n in sorted(c.items()):
    if w in ("sell","sold","selling","hurt","heal","heals","healing","slot","slots","pays","pay",
             "dark","docked","fuel","upkeep","panel","panels","pierce","nudge","cannon","fodder",
             "soak","soaks","health"):
        print("  %-12s %d" % (w, n))
