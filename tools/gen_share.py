#!/usr/bin/env python3
"""Builds share/card.html from the card-drawing code in app/new_rest.js.
Usage: python3 tools/gen_share.py app/new_rest.js share/card.html"""
import sys, re
r = open(sys.argv[1], encoding="utf-8").read()
cut = lambda a, b: r[r.index(a):r.index(b)]
ramp = cut('const RAMP=', 'function outdoorRuns')
draw = cut('function drawRoute(', 'function routePanel(')
core = cut('function caption(i)', 'const HOLD=')
a = core.index('function cover('); b = core.index('let LOGO=null;'); core = core[:a] + core[b:]
core = core.replace('$("sh-img")', '$("img")').replace('$("sh-cap")', '$("cap")')
s = core.index('  {const d0=new Date(i.date+"T12:00:00");'); e = core.index('q.toString();}', s) + len('q.toString();}')
core = core[:s] + core[e:]
HEAD = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex"><title>Run card</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}html,body{margin:0}body{font:500 16px 'DM Sans',system-ui,sans-serif;background:#0d1024;color:#fff;min-height:100dvh;display:flex;flex-direction:column;align-items:center;padding:12px 14px calc(110px + env(safe-area-inset-bottom))}
main{width:100%;max-width:460px;display:grid;gap:10px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
button,.btn{min-height:48px;border-radius:14px;border:1.5px solid rgba(255,255,255,.28);background:transparent;color:#fff;font:700 15px 'DM Sans',system-ui,sans-serif;cursor:pointer;display:grid;place-items:center;text-align:center;padding:8px 10px;position:relative;overflow:hidden}
button[aria-pressed=true]{background:#fff;color:#11142D;border-color:#fff}
.btn input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
#img{width:100%;border-radius:18px;display:block;-webkit-touch-callout:default}
.bar{position:fixed;left:0;right:0;bottom:0;padding:12px 14px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(13,16,36,0),#0d1024 35%);display:grid;justify-items:center}
#go{width:100%;max-width:460px;min-height:58px;border:0;border-radius:18px;background:linear-gradient(100deg,#3D5AFE,#B5179E);font:800 18px 'DM Sans',system-ui,sans-serif}
#msg{margin:0;min-height:1.3em;text-align:center;font-weight:600;color:#cfd4ff;font-size:14px}
input[type=range]{width:100%}[hidden]{display:none!important}
</style></head><body><main>
<div class="row"><label class="btn"><span id="fl">Add your photo</span><input type="file" id="file" accept="image/*"></label><button id="nophoto" hidden>Remove photo</button></div>
<div id="pctl" hidden style="display:grid;gap:8px"><div class="row"><button id="frame" aria-pressed="true">Photo in frame</button><button id="full" aria-pressed="false">Full photo</button></div><input type="range" id="pos" min="0" max="100" value="40" aria-label="Move photo up or down"></div>
<div class="row"><label class="btn"><span id="ll">Add race logo</span><input type="file" id="logo" accept="image/*"></label><button id="nologo" hidden>Remove logo</button></div>
<label id="rl" hidden style="display:flex;gap:8px;align-items:center;font-weight:600;font-size:14px"><input type="checkbox" id="route" checked style="width:20px;height:20px"> Show the route on the card</label>
<img id="img" alt="Your run card">
<p id="msg"></p>
<button id="copy">Copy caption</button>
<p id="cap" style="margin:0;color:#aab0d6;font-size:14px"></p>
</main>
<div class="bar"><button id="go">Save or share</button></div>
<a id="dl" hidden></a>
<script>
const $=id=>document.getElementById(id);
const q=new URLSearchParams(location.hash.slice(1)),num=k=>+q.get(k)||0;
const INFO={date:q.get("d")||new Date().toISOString().slice(0,10),a:{km:num("km"),sec:num("s"),hr:num("hr")},title:q.get("t")||"Run",
  week:num("w")?{week:num("w"),phaseName:q.get("p")||""}:null,f:q.get("c")?{headline:q.get("c"),score:num("cs")||null}:null,done:num("dn"),all:num("al")||1599,
  days:Math.max(0,Math.ceil((new Date("2027-04-25T07:00:00-07:00")-new Date())/864e5))};
const shareInfo=()=>INFO.a.km?INFO:null;
function hms(s){s=Math.round(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=String(s%60).padStart(2,"0");return h?h+":"+String(m).padStart(2,"0")+":"+x:m+":"+x;}
const SH={date:INFO.date,fmt:"story",blob:null,photo:null,layout:"frame",pos:40};
function routeFromHash(){const s=q.get("r");if(!s||s.length<25)return null;const n=[];for(let i=0;i+5<=s.length;i+=5){const gap=s[i+4]==="x";n.push([parseInt(s.slice(i,i+2),36)/1295,parseInt(s.slice(i+2,i+4),36)/1295,gap?.5:(+s[i+4]||0)/9,0,null,gap?1:0]);}return n.length>4?{n}:null;}
const ROUTE=routeFromHash(),routeFor=()=>ROUTE;
function cover(g,img,x,y,w,h,pos){const s=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/s,sh=h/s;g.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)*pos/100,sw,sh,x,y,w,h);}
'''
TAIL = '''
function ui(){const on=!!SH.photo;$("nophoto").hidden=!on;$("pctl").hidden=!on;$("fl").textContent=on?"Change photo":"Add your photo";$("nologo").hidden=!LOGO;$("ll").textContent=LOGO?"Change race logo":"Add race logo";
  $("frame").setAttribute("aria-pressed",SH.layout==="frame");$("full").setAttribute("aria-pressed",SH.layout==="full");}
const say=t=>$("msg").textContent=t;
$("frame").onclick=()=>{SH.layout="frame";ui();drawCard();};$("full").onclick=()=>{SH.layout="full";ui();drawCard();};
$("pos").oninput=e=>{SH.pos=+e.target.value;drawCard();};$("nophoto").onclick=()=>{SH.photo=null;ui();drawCard();};
$("file").onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;const im=new Image();im.onload=()=>{SH.photo=im;ui();drawCard();say("");};im.onerror=()=>say("That photo could not be opened. Try another one.");im.src=URL.createObjectURL(f);};
/* Race logo: picked from the phone, kept only in this browser. A white or near-white background is made transparent. */
function setLogo(src,save){const im=new Image();im.onload=()=>{LOGO=im;ui();drawCard();if(save){try{localStorage.setItem("runCardLogo",src);}catch(e){}}};im.src=src;}
$("logo").onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;const im=new Image();im.onerror=()=>say("That logo could not be opened. Try a PNG or JPG.");
  im.onload=()=>{const k=Math.min(1,1100/im.naturalWidth),w=Math.round(im.naturalWidth*k),h=Math.round(im.naturalHeight*k),c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");g.drawImage(im,0,0,w,h);
    const d=g.getImageData(0,0,w,h),p=d.data;let x0=w,y0=h,x1=0,y1=0;
    for(let i=0;i<p.length;i+=4){if(p[i+3]<8)continue;const m=Math.min(p[i],p[i+1],p[i+2]);if(m>=244)p[i+3]=0;else if(m>205){const a=(244-m)/39;p[i+3]=Math.round(p[i+3]*a);}
      if(p[i+3]>24){const n=i/4,x=n%w,y=(n-x)/w;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
    g.putImageData(d,0,0);if(x1<=x0||y1<=y0){say("That image looks empty once the white is removed.");return;}
    const o=document.createElement("canvas");o.width=x1-x0+1;o.height=y1-y0+1;o.getContext("2d").drawImage(c,x0,y0,o.width,o.height,0,0,o.width,o.height);setLogo(o.toDataURL("image/png"),true);say("Logo added. It stays on this phone for next time.");};
  im.src=URL.createObjectURL(f);};
$("nologo").onclick=()=>{LOGO=null;try{localStorage.removeItem("runCardLogo");}catch(e){}ui();drawCard();};
try{const s=localStorage.getItem("runCardLogo");if(s)setLogo(s,false);}catch(e){}
$("copy").onclick=async()=>{try{await navigator.clipboard.writeText($("cap").textContent);say("Caption copied.");}catch(e){say("Could not copy the caption here.");}};
$("go").onclick=async()=>{if(!SH.blob)return;const file=new File([SH.blob],"run-"+SH.date+".jpg",{type:"image/jpeg"});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file]});say("Done.");}catch(e){if(e.name!=="AbortError")say("Sharing did not open. Press and hold the picture to save it.");}return;}
  const a=$("dl");a.href=URL.createObjectURL(SH.blob);a.download=file.name;a.click();say("Saved to your downloads.");};
if(ROUTE){$("rl").hidden=false;$("route").onchange=e=>{SH.route=e.target.checked;drawCard();};}
if(!shareInfo())say("Open this page from the Share button in your training app.");else{ui();drawCard();document.fonts&&document.fonts.ready.then(drawCard);}
</script></body></html>
'''
out = HEAD + ramp + draw + core + TAIL
open(sys.argv[2], "w", encoding="utf-8").write(out)
open("/tmp/card.js", "w").write(re.search(r"<script>([\s\S]*)</script>", out).group(1))
print(len(out))
