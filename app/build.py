import os
os.chdir("/home/claude/eugene")
old=open("index_prev.html").read()
head=old[:old.index("</style>")]+open("new_css.css").read()+"</style>\n</head>\n"
sc=old[old.index("<script>")+8:]
chunk=sc[sc.index("function stepLines"):sc.index("function flagChip(")]
for a,b in [("Wave Roller","Roller"),("Wave Solo","Roller Ball"),
  ('text:"Race plan: 4 Gel 160, 3 CAF 100, 1 Gel 100, 2 LMNT.",g160:4,caf:3,g100:1,l:2','text:"Race plan: 4 Gel 160, 3 CAF 100, 2 LMNT.",g160:4,caf:3,l:2')]:
    assert a in chunk; chunk=chunk.replace(a,b)
html=head+open("new_body.html").read()+"\n<script>\n"+open("new_pre.js").read()+chunk+open("new_rest.js").read()+"</script>\n</body>\n</html>\n"
html=html.replace('if(cr.filter(v=>v!=null).length<2)$("c-cum").innerHTML=`<svg class="plot" viewBox="0 0 340 60" aria-hidden="true"></svg>`.replace(/<svg.*svg>/,"")+`<p class="empty">','if(cr.filter(v=>v!=null).length<2)$("c-cum").innerHTML=`<p class="empty">')
open("index.html","w").write(html)
