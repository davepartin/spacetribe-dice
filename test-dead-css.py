import re
from pathlib import Path
s=Path(__file__).with_name("simple.html").read_text()
style=re.search(r"<style>(.*?)</style>",s,re.S).group(1)
body=s.replace(style,"")
# every class token that actually gets applied: inside class="..." strings
applied=set()
for m in re.finditer(r'class="([^"]*)"', body):
    for tok in re.split(r"[\s']+", m.group(1)):
        tok=tok.strip("+ ").strip()
        if tok and re.fullmatch(r"[a-zA-Z][\w-]*", tok): applied.add(tok)
# and classes built dynamically: " foo" / "foo " inside JS string concatenation
for m in re.finditer(r'["\']\s*([a-zA-Z][\w-]*)\s*["\']', body):
    applied.add(m.group(1))
styled=set()
for blk in re.finditer(r"([^{}]+)\{", style):
    for m in re.finditer(r"\.([a-zA-Z][\w-]*)", blk.group(1)): styled.add(m.group(1))
print("STYLED BUT NEVER APPLIED (%d candidates):" % len(styled))
for c in sorted(styled - applied): print("   ."+c)
