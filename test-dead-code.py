import re, sys
s=open("/sessions/lucid-amazing-edison/mnt/spacetribe-dice/simple.html").read()
# strip comments so a name mentioned only in prose does not look "used"
code=re.sub(r"//[^\n]*","",s)
code=re.sub(r"/\*.*?\*/","",code,flags=re.S)

print("── unreferenced FUNCTIONS ──")
for m in re.finditer(r"function ([A-Za-z_$][\w$]*)\s*\(", code):
    n=m.group(1)
    uses=len(re.findall(r"\b"+re.escape(n)+r"\b", code))
    if uses<=1: print("  %-22s declared, never called" % n)

print("\n── unreferenced top-level VARS ──")
for m in re.finditer(r"^var ([A-Za-z_$][\w$]*)\s*=", code, re.M):
    n=m.group(1)
    if len(re.findall(r"\b"+re.escape(n)+r"\b", code))<=1: print("  %-22s declared, never read" % n)

print("\n── Tune settings never read by K() ──")
cfg=re.search(r"var C = \{(.*?)\n\};", s, re.S).group(1)
keys=re.findall(r"^\s{2}(\w+):\s*\{", cfg, re.M)
for k in keys:
    if len(re.findall(r'K\("'+k+r'"\)', code))==0 and len(re.findall(r'K\("'+k[:-1]+r'" \+', code))==0:
        print("  %-14s in the Tune panel, never used" % k)

print("\n── CSS classes never used in markup ──")
css=re.findall(r"\.([a-zA-Z][\w-]*)", re.search(r"<style>(.*?)</style>", s, re.S).group(1))
html=s[s.index("<style>"):]
for c in sorted(set(css)):
    # look for the class appearing in any string in the JS/HTML
    if not re.search(r'["\'\s]'+re.escape(c)+r'[\s"\']', html.replace("<style>"+re.search(r"<style>(.*?)</style>", s, re.S).group(1)+"</style>","")):
        print("  .%-18s styled, never applied" % c)
