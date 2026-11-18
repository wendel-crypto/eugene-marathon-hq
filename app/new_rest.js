function flagChip(f){return f?`<span class="chip ${esc(f)}">${esc(f.toUpperCase())}</span>`:"";}
function recIcon(t){return /boots/i.test(t)?"boot":/plunge/i.test(t)?"snow":/sauna/i.test(t)?"flame":/red light/i.test(t)?"light":/theragun/i.test(t)?"bolt":/roller ball/i.test(t)?"ball":/roller/i.test(t)?"roller":/cupping/i.test(t)?"cup":/airofit/i.test(t)?"wind":/strength/i.test(t)?"dumb":/sleep|bed/i.test(t)?"moon":"check";}
// ---------- actuals from Garmin ----------
function weekRun(start){let s=0,n=0;for(let i=0;i<7;i++){const a=byDate[addDays(start,i)];if(a){s+=a.km;n++;}}return n?Math.round(s*10)/10:(ACT&&start<=todayISO?0:null);}
function weekActual(w){if(w.actualKm!=null)return w.actualKm;if(w.start>todayISO)return null;return weekRun(w.start);}
function dayStatus(d){
  if(!d.km)return "";const a=byDate[d.date];
  if(d.status==="done"||(a&&a.km>=0.8*d.km))return "done";
  if(a)return "partial";
  if(d.status==="missed"||(ACT&&d.date<todayISO))return "missed";
  return "";
}
function fbBlock(f){return `<div class="hl">${esc(f.headline||"")}</div>${Array.isArray(f.bullets)&&f.bullets.length?`<ul>${f.bullets.map(b=>`<li>${esc(b)}</li>`).join("")}</ul>`:""}${f.next?`<div class="nx">Next time: ${esc(f.next)}</div>`:""}`;}
let FC={};
function wx(d){const f=FC[d.date];if(!f||d.date<todayISO)return "";const hot=f.tempC>=26||f.humidity>=90,wet=f.precipPct>=50;
  return `<div class="wx" title="${esc(f.sky||"")} · ${esc(f.place||"")}, early morning"><span aria-label="Temperature">${ic("temp")}<b>${esc(f.tempC)}°C</b><small>${esc(f.tempF)}°F</small></span><span class="${f.humidity>=90?"warn":""}" aria-label="Humidity">${ic("drop")}<b>${esc(f.humidity)}%</b></span><span class="${wet?"warn":""}" aria-label="Chance of rain">${ic("rain")}<b>${esc(f.precipPct)}%</b></span><span class="sky">${hot&&d.km?"Ease pace 5–10 s/km · ":""}${esc(f.sky||"")}</span></div>`;}
function dayCard(d,w,big){
  const isT=d.date===todayISO;const daily=DAILY[d.date];const a=byDate[d.date];const st=dayStatus(d);const f=FEED[d.date];
  const rec=recovery(d,w);
  const checks=rec.map((t,i)=>{const k="rc:"+d.date+":"+i;const m=t.match(/^([^:]{2,22}):\s*(.*)$/);
    return `<label><input type="checkbox" id="c-${d.date}-${i}${big?"-t":""}" data-k="${k}" ${store.get(k)==="1"?"checked":""}>${ic(recIcon(t))}<span>${m?`<b>${esc(m[1])}:</b> ${esc(m[2])}`:esc(t)}</span></label>`;}).join("");
  const steps=stepLines(d.steps).map(s=>`<li>${s}</li>`).join("");
  const sync=st==="done"?`<span class="chip green">Done</span>`:st==="partial"?`<span class="chip amber">Partial</span>`:st==="missed"?`<span class="chip red">Missed</span>`:d.garminWorkoutId?`<span class="chip line">On Garmin</span>`:"";
  const act=a?`<div class="actual ${st==="partial"?"part":""}">${ic("check")}Ran ${a.km.toFixed(1)} km in ${hms(a.sec)}${a.km>0.5?" · "+hms(a.sec/a.km)+" /km":""}${a.hr?" · avg HR "+Math.round(a.hr):""}</div>`:"";
  return `<article class="day t-${esc(d.type)} ${isT?"today":""}"><div class="bar"></div><div class="in">
    <div class="dhead"><span class="dwhen">${ic("calendar")} ${esc(d.dow)} ${fmt(d.date)}${isT?" · today":""}</span><span style="display:flex;gap:6px;flex-wrap:wrap">${daily&&isT?flagChip(daily.flag):""}${sync}<span class="chip t-${esc(d.type)}">${TYPE[d.type]||esc(d.type)}</span></span></div>
    <div class="dtitle"><h3>${esc(d.title)}</h3><span class="kmz">${zoneBadges(d)}${d.km?`<span class="km">${d.km}<small> km</small></span>`:""}</span></div>
    ${wx(d)}
    ${act}${a?`<div><button class="sharebtn" data-share="${d.date}">${ic("share")} Share this run</button></div>`:""}
    ${d.adjustNote?`<div class="adj">Adjusted: ${esc(d.adjustNote)}</div>`:""}
    ${f?`<details class="more" ${big||isT?"open":""}><summary>${ic("chat")} Coach feedback${f.score?` · ${esc(f.score)}/10`:""}</summary><div class="fbk" style="margin-top:6px">${fbBlock(f)}</div></details>`:""}
    ${steps?`<ul class="steps">${steps}</ul>`:""}
    ${minis(d)}
    ${zoneOf(d)?`<div class="where">${ic("heart")} <span class="zone">Heart rate:</span> ${esc(zoneOf(d))}</div>`:""}
    ${place(d)?`<div class="where">${ic("route")} ${esc(place(d))}</div>`:""}
    ${fuel(d).text?`<div class="fuel">${ic("gel")} Fuel: ${esc(fuel(d).text)}</div>`:""}
    <details class="more" ${big?"open":""}><summary>Recovery checklist</summary><div class="checks">${checks}</div></details>
    ${d.desc?`<details class="more"><summary>Coach notes</summary><p class="small muted" style="margin:6px 0 0">${esc(d.desc)}</p></details>`:""}
  </div></article>`;
}
// ---------- small visuals ----------
function ring(id,val,max,color,label){
  const c=2*Math.PI*38,p=val==null?0:Math.max(0,Math.min(1,val/max));
  $(id).innerHTML=`<svg viewBox="0 0 92 92" aria-hidden="true"><circle class="tr" cx="46" cy="46" r="38"/><circle cx="46" cy="46" r="38" stroke="${color}" stroke-dasharray="${(c*p).toFixed(1)} ${c.toFixed(1)}"/></svg><div class="v">${val==null?"–":esc(label??val)}</div>`;
}
function battery(val){
  const col=val==null?"var(--line)":val>=60?"var(--ok)":val>=35?"var(--warn)":"var(--bad)",w=val==null?0:Math.max(3,val*0.78);
  $("r-bb").innerHTML=`<svg class="batt" viewBox="0 0 96 46" role="img" aria-label="Body Battery ${val??"no data"}"><rect x="2" y="4" width="84" height="38" rx="9" fill="none" stroke="var(--muted)" stroke-width="3"/><rect x="89" y="16" width="5" height="14" rx="2" fill="var(--muted)"/><rect x="6" y="8" width="${w}" height="30" rx="6" fill="${col}"/><text x="44" y="30" text-anchor="middle" style="font:800 20px var(--display);fill:var(--ink)">${val??"–"}</text></svg>`;
}
function spark(id,vals){
  const el=$(id);vals=vals.filter(v=>v!=null);if(vals.length<2){el.innerHTML="";return;}
  const mn=Math.min(...vals),mx=Math.max(...vals),r=(mx-mn)||1;
  const pts=vals.map((v,i)=>[(i/(vals.length-1))*116+2,26-((v-mn)/r)*22]);
  el.innerHTML=`<polyline points="${pts.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ")}" fill="none" stroke="var(--series)" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
}
// line chart: series=[{name,pts:[y|null],plan?}] on shared labels; one y axis
function lineChart(id,labels,series,o={}){
  const el=$(id);const all=series.flatMap(s=>s.pts).filter(v=>v!=null);
  if(all.length<2){el.innerHTML=`<p class="empty">${esc(o.empty||"Not enough data yet.")}</p>`;return;}
  const W=340,H=150,L=36,R=12,T=10,B=20;let mn=o.min??Math.min(...all),mx=o.max??Math.max(...all);
  if(o.min==null){const padv=(mx-mn||1)*0.15;mn-=padv;mx+=padv;}
  const n=labels.length,x=i=>L+(n<2?0:i/(n-1))*(W-L-R),y=v=>T+(1-(v-mn)/(mx-mn||1))*(H-T-B),f=o.fmt||(v=>Math.round(v*10)/10);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||"chart")}">`;
  for(let g=0;g<=2;g++){const v=mn+(mx-mn)*g/2;s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L-5}" y="${y(v)+3}" text-anchor="end">${esc(f(v))}</text>`;}
  s+=`<text x="${L}" y="${H-5}">${esc(o.x0||labels[0])}</text><text x="${W-R}" y="${H-5}" text-anchor="end">${esc(o.x1||labels[n-1])}</text>`;
  for(const se of series){let d="",open=false,last=null;
    se.pts.forEach((v,i)=>{if(v==null){open=false;return;}d+=(open?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)+" ";open=true;last=i;});
    s+=`<path d="${d}" fill="none" stroke="var(${se.plan?"--plan":"--series"})" stroke-width="2" ${se.plan?'stroke-dasharray="5 4"':""} stroke-linejoin="round" stroke-linecap="round"/>`;
    if(!se.plan&&last!=null)s+=`<circle cx="${x(last)}" cy="${y(se.pts[last])}" r="4.500" fill="var(--series)" stroke="var(--soft)" stroke-width="2"/>`;}
  s+=`<line class="cx" x1="0" x2="0" y1="${T}" y2="${H-B}" stroke="var(--muted)" stroke-width="1" style="display:none"/></svg><div class="tip"></div>`;
  el.innerHTML=s;const svg=el.querySelector("svg"),tip=el.querySelector(".tip"),cx=el.querySelector(".cx");
  const move=e=>{const r=svg.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*W;let i=Math.round((px-L)/(W-L-R)*(n-1));i=Math.max(0,Math.min(n-1,i));
    const rows=series.map(se=>se.pts[i]==null?null:(series.length>1?se.name+" ":"")+f(se.pts[i])+(o.unit||"")).filter(Boolean);if(!rows.length){tip.style.display="none";cx.style.display="none";return;}
    cx.setAttribute("x1",x(i));cx.setAttribute("x2",x(i));cx.style.display="";tip.textContent=labels[i]+" · "+rows.join(" · ");tip.style.display="block";
    const parent=el.closest(".ch").getBoundingClientRect();tip.style.left=Math.max(70,Math.min(parent.width-70,(r.left-parent.left)+x(i)/W*r.width))+"px";tip.style.top=(r.top-parent.top+4)+"px";};
  svg.addEventListener("pointermove",move);svg.addEventListener("pointerdown",move);svg.addEventListener("pointerleave",()=>{tip.style.display="none";cx.style.display="none";});
}
function barChart(id,labels,vals,o={}){
  const el=$(id);if(vals.filter(v=>v!=null).length<1){el.innerHTML=`<p class="empty">${esc(o.empty||"Not enough data yet.")}</p>`;return;}
  const W=340,H=150,L=30,R=8,T=10,B=20,mx=o.max||Math.max(...vals.filter(v=>v!=null)),n=vals.length,bw=(W-L-R)/n,y=v=>T+(1-v/mx)*(H-T-B);
  let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||"chart")}">`;
  for(const g of [0,mx/2,mx])s+=`<line x1="${L}" x2="${W-R}" y1="${y(g)}" y2="${y(g)}" stroke="var(--line)" stroke-width="1"/><text x="${L-5}" y="${y(g)+3}" text-anchor="end">${Math.round(g)}</text>`;
  vals.forEach((v,i)=>{if(v==null)return;const h=Math.max(2,y(0)-y(v));s+=`<path d="M${L+i*bw+2} ${y(0)}v${-(h-4)}q0 -4 4 -4h${bw-12}q4 0 4 4v${h-4}z" fill="var(--series)"><title>${esc(labels[i])}: ${v}${o.unit||""}</title></path>`;});
  s+=`<text x="${L}" y="${H-5}">${esc(labels[0])}</text><text x="${W-R}" y="${H-5}" text-anchor="end">${esc(labels[n-1])}</text></svg>`;el.innerHTML=s;
}
// ---------- renders ----------
function renderHero(){
  $("countdown").textContent=Math.max(0,Math.ceil((RACE-new Date())/864e5));
  const w=started()?curWeek():WEEKS.W01;
  $("curweek").textContent=started()?"Week "+w.week:"Starts 23 Nov";
  $("curphase").textContent=w.phaseName;
  const a=weekActual(w);
  $("curkm").textContent=(started()&&a!=null?a+" / ":"")+w.plannedKm;
  $("curkmsub").textContent=started()&&a!=null?"km run / planned":(started()?"km planned":"km in week 1");
  const mp=PLAN.meta.paces["3"].MP;$("mp").textContent="race pace "+mp[0]+"–"+mp[1]+" /km";
}
function renderToday(){
  let f=findDay(todayISO);
  if(!started()||!f){f=findDay(PSTART);$("todayhead").textContent="First day · Mon 23 Nov";}
  $("today").innerHTML=dayCard(f.d,f.w,true);
}
function renderVol(){
  const ws=sorted(),cur=curWeek().id,pre=[];
  if(ACT)for(let i=6;i>=1;i--){const st=addDays(PSTART,-7*i);pre.push({st,km:weekRun(st)||0});}
  const max=Math.max(110,...pre.map(p=>p.km));
  $("vol").innerHTML=pre.map(p=>`<button disabled aria-label="Week of ${fmt(p.st)}, before the plan, ${p.km} km run" title="${fmt(p.st)}: ${p.km} km (before the plan)"><div class="b" style="height:${Math.round(p.km/max*100)}%;background:var(--plan);opacity:.7"></div><div class="l">·</div></button>`).join("")+
   ws.map(w=>{const h=Math.round(w.plannedKm/max*100);const a=weekActual(w);const ah=a?Math.min(100,Math.round(a/w.plannedKm*100)):0;
    return `<button data-w="${w.id}" class="${w.id===SEL?"sel":""} ${w.id===cur&&started()?"cur":""}" aria-label="Week ${w.week}, ${w.plannedKm} km planned${a!=null?", "+a+" km run":""}" aria-pressed="${w.id===SEL}" title="Week ${w.week}: ${w.plannedKm} km planned${a!=null?", "+a+" km run":""}"><div class="b" style="height:${h}%;background:var(--plan)"><i style="height:${ah}%;background:var(--series);filter:none"></i></div><div class="l">${w.week}</div></button>`;}).join("");
}
function renderWeek(){
  const w=WEEKS[SEL];const a=weekActual(w);
  $("w-title").textContent="Week "+w.week+" · "+(a!=null&&w.start<=todayISO?a+" / ":"")+w.plannedKm+" km";
  $("w-sub").textContent=fmt(w.start)+" – "+fmt(addDays(w.start,6))+" · "+w.phaseName+(w.zoneSplit?" · "+w.zoneSplit.easyPct+"% easy zones":"")+" · Pack: "+weekFuel(w);
  $("days").innerHTML=w.days.map(d=>dayCard(d,w,false)).join("");
  $("prev").disabled=w.week===1;$("next").disabled=w.week===22;
}
function renderPaces(){
  const names={1:"Base",2:"Aerobic",3:"Specific",4:"Taper"};
  $("paces").innerHTML=Object.entries(PLAN.meta.paces).map(([k,v])=>`<tr><td>${names[k]}</td><td class="n">${v.MP[0]}–${v.MP[1]}</td><td class="n">${v.T[0]}–${v.T[1]}</td><td class="n">${v.I[0]}–${v.I[1]}</td><td class="n">${v.R[0]}–${v.R[1]}</td></tr>`).join("");
}
function renderLog(){
  const rows=Object.values(DAILY).sort((a,b)=>a.date<b.date?1:-1).slice(0,14);
  if(rows.length)$("log").innerHTML=rows.map(r=>`<div class="logrow"><b>${fmt(r.date)}</b><span>${flagChip(r.flag)}</span><span class="w">${esc(r.decision||"")}${r.heat?` <span class="muted">· ${esc(r.heat)}</span>`:""}</span></div>`).join("");
  const t=DAILY[todayISO];if(t){$("m-flag").innerHTML=flagChip(t.flag);$("m-flag-s").textContent=t.decision||"";}
}
function bodyFromGarmin(p){
  const list=(p&&p.dateWeightList||[]).filter(x=>x.weight>0).sort((a,b)=>a.calendarDate<b.calendarDate?1:-1);
  if(!list.length)return null;
  const ws=list.map(x=>x.weight/1000).sort((a,b)=>a-b);const med=ws[Math.floor(ws.length/2)];
  const ok=list.filter(x=>Math.abs(x.weight/1000-med)/med<=0.04);if(!ok.length)return null;
  WLIST=ok.slice().reverse().map(x=>({d:x.calendarDate,v:Math.round(x.weight/100)/10}));
  const last=ok[0];const comp=ok.find(x=>x.bodyFat>0);
  const lim=addDays(last.calendarDate,-7);const a7=ok.filter(x=>x.calendarDate>lim);const avg7=a7.reduce((s,x)=>s+x.weight,0)/a7.length/1000;
  return {date:last.calendarDate,weightKg:last.weight/1000,bmi:last.bmi,avg7,bodyFatPct:comp?comp.bodyFat:null,muscleKg:comp?comp.muscleMass/1000:null};
}
function renderBody(){
  const b=BODY;if(!b||b.weightKg==null)return;
  $("b-w").textContent=b.weightKg.toFixed(1)+" kg";$("b-w-s").textContent=(b.avg7!=null?"7-day avg "+b.avg7.toFixed(1):"")+(b.date?" · "+fmt(b.date):"");
  $("k-body").textContent=(b.bmi!=null?"BMI "+b.bmi.toFixed(1):"–");
  $("k-body-s").textContent=[b.bodyFatPct!=null?"body fat "+b.bodyFatPct.toFixed(1)+"%":"",b.muscleKg!=null?"muscle "+b.muscleKg.toFixed(1)+" kg":""].filter(Boolean).join(" · ")||"Index scale";
  spark("sp-w",WLIST.map(x=>x.v));
  if(WLIST.length>1){$("c-w-now").textContent=b.weightKg.toFixed(1)+" kg";lineChart("c-w",WLIST.map(x=>fmt(x.d)),[{name:"Weight",pts:WLIST.map(x=>x.v)}],{unit:" kg",label:"Weight over 30 days"});}
}
function plannedToDate(w){let s=0;for(const d of w.days)if(d.date<=todayISO)s+=d.km;return s;}
function renderTrack(){
  const ws=sorted();const cw=curWeek();
  // this week
  if(started()){const a=weekActual(cw)||0,ptd=plannedToDate(cw);$("k-week").textContent=a+" / "+cw.plannedKm+" km";$("k-week-b").style.width=Math.min(100,a/cw.plannedKm*100)+"%";
    $("k-week-s").textContent=ptd?Math.round(a/ptd*100)+"% of what was due by today":"Nothing due yet this week";}
  else{$("k-week").textContent=(ACT?(weekRun(addDays(PSTART,-7))||0):"–")+" km";$("k-week-s").textContent="Run this week, before the plan starts";$("k-week-b").style.width="0%";}
  // cumulative
  let planAll=0,due=0,done=0;for(const w of ws){planAll+=w.plannedKm;due+=plannedToDate(w);const a=weekActual(w);if(a)done+=a;}
  $("k-cum").textContent=Math.round(done)+" / "+Math.round(planAll)+" km";$("k-cum-b").style.width=Math.min(100,done/planAll*100)+"%";
  $("k-cum-s").textContent=started()?(due?Math.round(done/due*100)+"% of the "+Math.round(due)+" km due so far":""):"Counting starts Mon 23 Nov";
  // verdict
  let chip="",line="";
  if(!started()){chip=`<span class="chip line">Starts Mon 23 Nov</span>`;line="The plan has not started. Numbers below fill in from your first run.";}
  else if(!ACT){chip=`<span class="chip line">Waiting for Garmin</span>`;line="Open this page in Claude to load your runs.";}
  else{const r=due?done/due:1;const cls=r>=0.9?"green":r>=0.75?"amber":"red";chip=`<span class="chip ${cls}">${cls==="green"?"ON TRACK":cls==="amber"?"SLIGHTLY BEHIND":"BEHIND"}</span>`;
    line=cls==="green"?"You have run "+Math.round(r*100)+"% of the km due so far.":"You have run "+Math.round(r*100)+"% of the km due so far. The Sunday review will hold next week's volume if this stays under 80%.";}
  $("ot-chip").innerHTML=chip;$("ot-line").textContent=line;
  // phases
  const names={1:"Base rebuild",2:"Aerobic strength",3:"Marathon-specific",4:"Taper"};
  let html="";for(const ph of [1,2,3,4]){const pw=ws.filter(w=>w.phase===ph);let pl=0,dn=0,du=0;for(const w of pw){pl+=w.plannedKm;du+=plannedToDate(w);const a=weekActual(w);if(a)dn+=a;}
    const st=pw[0].start,en=addDays(pw[pw.length-1].start,6);const now=todayISO>=st&&todayISO<=en;const state=todayISO<st?"starts "+fmt(st):todayISO>en?"finished":"ends "+fmt(en);
    html+=`<div class="phase ${now?"now":""}"><div class="t"><b>${names[ph]}</b><span>Weeks ${pw[0].week}–${pw[pw.length-1].week} · ${Math.round(dn)} / ${Math.round(pl)} km · ${state}</span></div><div class="pb" role="img" aria-label="${names[ph]}: ${Math.round(dn)} of ${Math.round(pl)} km"><i style="width:${Math.min(100,dn/pl*100)}%"></i>${du>0&&du<pl?`<b style="left:calc(${du/pl*100}% - 1px)"></b>`:""}</div></div>`;}
  const tot=Math.max(0,Math.min(1,(new Date(todayISO)-new Date(PSTART))/(new Date("2027-04-25")-new Date(PSTART))));
  html+=`<div class="phase"><div class="t"><b>Whole program</b><span>${Math.round(tot*100)}% of the 22 weeks gone · ${Math.round(done)} / ${Math.round(planAll)} km</span></div><div class="pb"><i style="width:${Math.min(100,done/planAll*100)}%"></i>${tot>0?`<b style="left:calc(${due/planAll*100}% - 1px)"></b>`:""}</div></div>`;
  $("phases").innerHTML=html;
  // cumulative + long-run charts
  const labels=ws.map(w=>"Week "+w.week);let c=0;const cp=ws.map(w=>Math.round(c+=w.plannedKm));let ca=0;const cr=ws.map(w=>{const a=weekActual(w);if(a==null)return null;ca+=a;return Math.round(ca);});
  $("c-cum-now").textContent=Math.round(done)+" km";
  lineChart("c-cum",labels,[{name:"Planned",pts:cp,plan:true},{name:"Run",pts:cr}],{min:0,max:cp[cp.length-1],unit:" km",fmt:v=>Math.round(v),x0:"W1",x1:"W22",label:"Cumulative km, planned and run",empty:"Fills in from your first week."});
  if(cr.filter(v=>v!=null).length<2)$("c-cum").innerHTML=`<svg class="plot" viewBox="0 0 340 60" aria-hidden="true"></svg>`.replace(/<svg.*svg>/,"")+`<p class="empty">Fills in after your first two weeks. Planned total: ${cp[cp.length-1]} km.</p>`;
  const lp=ws.map(w=>Math.max(...w.days.map(d=>d.km)));const lr=ws.map(w=>{if(w.start>todayISO||!ACT)return null;let m=0;for(let i=0;i<7;i++){const a=byDate[addDays(w.start,i)];if(a&&a.km>m)m=a.km;}return Math.round(m*10)/10;});
  const lastLong=[...lr].reverse().find(v=>v);$("c-long-now").textContent=lastLong?lastLong+" km":"Peak planned: "+Math.max(...lp.slice(0,21))+" km";
  lineChart("c-long",labels,[{name:"Planned",pts:lp,plan:true},{name:"Run",pts:lr}],{min:0,max:45,unit:" km",fmt:v=>Math.round(v),x0:"W1",x1:"W22",label:"Longest run each week"});
  // zones from the last reviewed week
  const zw=[...ws].reverse().find(w=>w.zoneSplit&&w.zoneSplit.z1!=null);
  if(zw){const z=zw.zoneSplit,t=["z1","z2","z3","z4","z5"].map(k=>z[k]||0),sum=t.reduce((a,b)=>a+b,0)||1,col=["#6B7190","#008F5A","#3D5AFE","#F0431F","#D6006F"];
    $("c-zones").innerHTML=`<div class="now">${z.easyPct}% easy zones</div><div class="sub">Week ${zw.week} · target 75% or more in Z1–Z2</div><div class="zbar">${t.map((m,i)=>m?`<span style="flex:${m};background:${col[i]}" title="Z${i+1}: ${Math.round(m)} min">${m/sum>0.08?"Z"+(i+1):""}</span>`:"").join("")}</div><div class="sub" style="margin-top:6px">${t.map((m,i)=>"Z"+(i+1)+" "+Math.round(m)+" min").join(" · ")}</div>`;}
  // week summary
  const sw=[...ws].reverse().find(w=>w.summary&&w.summary.text);
  if(sw){const s=sw.summary;$("ws-chip").innerHTML=`<span class="chip line">Week ${sw.week}</span>`;$("ws").innerHTML=`<div class="hl">${esc(s.verdict||"")}</div><p style="margin:0;font-size:15px">${esc(s.text)}</p>${Array.isArray(s.wins)&&s.wins.length?`<ul>${s.wins.map(x=>`<li><b>Went well:</b> ${esc(x)}</li>`).join("")}${(s.fixes||[]).map(x=>`<li><b>Fix:</b> ${esc(x)}</li>`).join("")}</ul>`:""}${s.next?`<div class="nx">Next week: ${esc(s.next)}</div>`:""}`;}
}
function renderPred(){
  if(!PRED)return;const m=PRED.marathon&&PRED.marathon.time_seconds;const base=(PLAN.meta.baseline||{}).marathonPredSec||13122,goal=11100;
  if(m){$("k-pred").textContent=hms(m);$("k-pred-b").style.width=Math.max(0,Math.min(100,(base-m)/(base-goal)*100))+"%";
    $("k-pred-s").textContent=m<=goal?"Inside the 3:05 goal":hms(m-goal)+" to find to reach 3:05";}
  const rows=[["5K","5K"],["10K","10K"],["half_marathon","Half"],["marathon","Marathon"]].filter(r=>PRED[r[0]]);
  $("c-pred").innerHTML=`<div class="tw"><table style="margin-top:6px"><tbody>${rows.map(r=>`<tr><td>${r[1]}</td><td class="n">${esc(PRED[r[0]].time||hms(PRED[r[0]].time_seconds))}</td></tr>`).join("")}<tr><td>Goal marathon</td><td class="n">3:00–3:05</td></tr></tbody></table></div><div class="sub" style="margin-top:6px">Garmin's estimate from your recent running. The bar under “Marathon prediction” tracks the gap from 3:38:42 on 17 Nov down to 3:05.</div>`;
}
function renderFeedback(){
  const k=Object.keys(FEED).sort().pop();if(!k)return;const f=FEED[k];
  $("fb-score").innerHTML=f.score?`<span class="score" aria-label="Score ${esc(f.score)} out of 10">${esc(f.score)}</span>`:"";
  $("fb-latest").innerHTML=`<div class="sub muted small">${fmt(k)} · ${esc(f.title||"")}</div>${fbBlock(f)}`;
}
function renderCoachLists(){
  const ks=Object.keys(FEED).sort().reverse();
  if(ks.length)$("fb-list").innerHTML=ks.map(k=>{const f=FEED[k];return `<div class="fbrow">${f.score?`<span class="score">${esc(f.score)}</span>`:`<span class="score" style="background:var(--rest)">–</span>`}<div class="fbk"><div class="small muted">${fmt(k)} · ${esc(f.title||"")}</div>${fbBlock(f)}${byDate[k]?`<div><button class="sharebtn" data-share="${k}">${ic("share")} Share</button></div>`:""}</div></div>`;}).join("");
  const rs=Object.keys(byDate).sort().reverse().slice(0,8);
  if(rs.length)$("sh-recent").innerHTML=rs.map(k=>{const a=byDate[k],p=findDay(k);return `<div class="runrow"><span><b>${esc(p?p.d.title:"Run")}</b><br><span class="small muted">${fmt(k)} · ${a.km.toFixed(1)} km · ${hms(a.sec)}</span></span><button class="sharebtn" data-share="${k}">${ic("share")} Share</button></div>`;}).join("");
}
// ---------- share card ----------
let SH={date:null,fmt:"story",blob:null,png:null,photo:null,layout:"frame",pos:40,last:store.get("lastCard")};
function shareInfo(date){
  const a=byDate[date];if(!a)return null;const p=findDay(date),f=FEED[date];let done=0,all=0;for(const w of sorted()){all+=w.plannedKm;const x=weekActual(w);if(x)done+=x;}
  return {date,a,title:p?p.d.title:"Run",type:p?p.d.type:"easy",week:p?p.w:null,zone:p?zoneOf(p.d):"",f,done,all,days:Math.max(0,Math.ceil((RACE-new Date())/864e5))};
}
function caption(i){const pace=i.a.km>0.5?hms(i.a.sec/i.a.km)+"/km":"";
  return `${i.title}: ${i.a.km.toFixed(1)} km in ${hms(i.a.sec)}${pace?" ("+pace+")":""}. ${i.week?"Week "+i.week.week+" of 22":"Building up"} on the road to the Eugene Marathon, ${i.days} days to go. Goal 3:00–3:05. #EugeneMarathon #marathontraining #running`;}
function cover(g,img,x,y,w,h,pos){const s=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/s,sh=h/s;g.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)*pos/100,sw,sh,x,y,w,h);}
let LOGO=null;
function sIcon(g,k,x,y,s){g.save();g.translate(x,y);g.scale(s/24,s/24);g.lineWidth=2.3;g.lineCap="round";g.lineJoin="round";g.strokeStyle="#fff";g.fillStyle="#fff";g.beginPath();
  if(k==="time"){g.arc(12,13.5,8,0,7);g.moveTo(12,9.5);g.lineTo(12,13.5);g.lineTo(15,15.5);g.moveTo(9.5,2.6);g.lineTo(14.5,2.6);g.stroke();}
  else if(k==="pace"){g.arc(12,15,9,Math.PI,0);g.stroke();g.beginPath();g.moveTo(12,15);g.lineTo(16.6,9);g.stroke();g.beginPath();g.arc(12,15,1.7,0,7);g.fill();}
  else{g.moveTo(12,20.5);g.bezierCurveTo(-2,11,5,1.5,12,7.5);g.bezierCurveTo(19,1.5,26,11,12,20.5);g.closePath();g.fill();}
  g.restore();}
async function drawCard(){
  const i=shareInfo(SH.date);if(!i)return;try{await document.fonts.ready;}catch(e){}
  const W=1080,H=1920,c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
  const D="'Bricolage Grotesque',system-ui,sans-serif",B="'DM Sans',system-ui,sans-serif";
  const ph=SH.photo,frame=ph&&SH.layout==="frame",full=ph&&SH.layout==="full";
  if(full){cover(g,ph,0,0,W,H,SH.pos);const ov=g.createLinearGradient(0,0,0,H);ov.addColorStop(0,"rgba(10,12,29,.62)");ov.addColorStop(.28,"rgba(10,12,29,.08)");ov.addColorStop(.52,"rgba(10,12,29,.12)");ov.addColorStop(1,"rgba(10,12,29,.88)");g.fillStyle=ov;g.fillRect(0,0,W,H);}
  else{const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,"#2B3FE0");gr.addColorStop(.55,"#7B2FF7");gr.addColorStop(1,"#D6006F");g.fillStyle=gr;g.fillRect(0,0,W,H);g.strokeStyle="rgba(255,255,255,.08)";g.lineWidth=3;for(let r=180;r<1700;r+=150){g.beginPath();g.arc(-60,H+40,r,0,Math.PI*2);g.stroke();}}
  const Rt=SH.route!==false?routeFor(i):null,top=230,sh=on=>{g.shadowColor=on&&full?"rgba(0,0,0,.55)":"transparent";g.shadowBlur=on&&full?14:0;g.shadowOffsetY=on&&full?2:0;};
  const fit=(t,max)=>{while(g.measureText(t).width>max&&t.length>8)t=t.slice(0,-2);return t;};
  g.fillStyle="#fff";g.textAlign="left";
  if(LOGO){const lw=430,lh=lw*LOGO.naturalHeight/LOGO.naturalWidth,mh=Math.min(lh,290),mw=mh*lw/lh;g.imageSmoothingQuality="high";g.drawImage(LOGO,64,top-70,mw,mh);}
  else{sh(1);g.font="800 46px "+D;g.fillText("EUGENE MARATHON",80,top+10);sh(0);}
  if(Rt)drawRoute(g,Rt,W-70-340,top-80,340,290,8,false);
  const hy=top+280;sh(1);g.font="700 36px "+B;g.fillText(fit((i.week?"Week "+i.week.week+" of 22 · "+i.week.phaseName:"Pre-season")+" · "+new Date(i.date+"T12:00:00").toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"}),W-160),80,hy);sh(0);
  const pace=i.a.km>0.5?hms(i.a.sec/i.a.km):"–",km=i.a.km.toFixed(1);
  const cols=[["time",hms(i.a.sec),""],["pace",pace,"/km"],["hr",i.a.hr?String(Math.round(i.a.hr)):"–","bpm"]];
  const stats=y=>{const cw=(W-160)/3;sh(1);cols.forEach((col,n)=>{const x=80+n*cw;sIcon(g,col[0],x,y-52,58);g.font="800 64px "+D;g.fillText(col[1],x+72,y);const vw=g.measureText(col[1]).width;if(col[2]){g.font="700 30px "+B;g.globalAlpha=.9;g.fillText(col[2],x+80+vw,y);g.globalAlpha=1;}});sh(0);};
  const foot=()=>{const by=H-330;sh(1);g.fillStyle="rgba(255,255,255,.28)";g.beginPath();g.roundRect(80,by,W-160,18,9);g.fill();g.fillStyle="#fff";g.beginPath();g.roundRect(80,by,Math.max(18,(W-160)*Math.min(1,i.all?i.done/i.all:0)),18,9);g.fill();
    g.font="700 32px "+B;g.fillText(Math.round(i.done)+" of "+Math.round(i.all)+" plan km",80,by+66);g.textAlign="right";g.fillText(i.days+" days to go · goal 3:00–3:05",W-80,by+66);g.textAlign="left";sh(0);};
  const bigKm=(y,size)=>{sh(1);g.font="800 "+size+"px "+D;g.fillText(km,74,y);const kw=g.measureText(km).width;g.font="800 "+Math.round(size*.3)+"px "+D;g.fillText("km",94+kw,y);sh(0);};
  const coach=i.f&&i.f.headline?"Coach"+(i.f.score?" "+i.f.score+"/10":"")+": "+i.f.headline:"";
  if(frame){
    const fy=hy+50,fh=560,fx=60,fw=W-120;
    g.save();g.shadowColor="rgba(10,12,29,.35)";g.shadowBlur=40;g.shadowOffsetY=16;g.fillStyle="#fff";g.beginPath();g.roundRect(fx,fy,fw,fh,44);g.fill();g.restore();
    g.save();g.beginPath();g.roundRect(fx+12,fy+12,fw-24,fh-24,34);g.clip();cover(g,ph,fx+12,fy+12,fw-24,fh-24,SH.pos);g.restore();
    let y=fy+fh+92;g.fillStyle="#fff";g.font="800 66px "+D;g.fillText(fit(i.title,W-160),80,y);bigKm(y+190,190);stats(y+296);
  }else if(full){
    let y=H-860;sh(1);g.font="800 76px "+D;g.fillText(fit(i.title,W-160),80,y);sh(0);bigKm(y+250,250);stats(y+380);
  }else{
    let y=hy+170;g.font="800 86px "+D;g.fillText(fit(i.title,W-160),80,y);bigKm(y+330,310);stats(y+480);
    if(coach){g.font="700 42px "+D;const words=coach.split(" ");let line="",ly=y+620,n=0;for(const w of words){if(g.measureText(line+w).width>W-160){g.fillText(line.trim(),80,ly);ly+=58;line="";if(++n>=3)break;}line+=w+" ";}if(n<3)g.fillText(line.trim(),80,ly);}
  }
  foot();
  $("sh-img").src=c.toDataURL("image/jpeg",.92);$("sh-cap").textContent=caption(i);
  {const d0=new Date(i.date+"T12:00:00");d0.setDate(d0.getDate()-((d0.getDay()+6)%7));const q=new URLSearchParams({d:i.date,t:i.title,km:i.a.km.toFixed(2),s:Math.round(i.a.sec),dn:Math.round(i.done),al:Math.round(i.all),wk:(weekRun(iso(d0))||0).toFixed(1)});
   if(i.a.hr)q.set("hr",Math.round(i.a.hr));if(i.week){q.set("w",i.week.week);q.set("p",i.week.phaseName||"");}if(i.f&&i.f.headline){q.set("c",i.f.headline);if(i.f.score)q.set("cs",i.f.score);}
   if(Rt)q.set("r",encRoute(Rt)),q.set("rs",Rt.sl),q.set("rf",Rt.fl);$("sh-go").href="https://eugene-bay.vercel.app/card.html#"+q.toString();}
  SH.blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.92));
}
const HOLD="Tap the big button: your card opens in the browser, then Save or share puts it in Photos, Instagram or Strava. Add your photo there too.";
function photoUI(){const on=!!SH.photo;$("sh-nophoto").hidden=!on;$("sh-photo-ctl").hidden=!on;$("sh-photo-ctl").style.display=on?"grid":"none";$("sh-file-l").textContent=on?"Change photo":"Add your photo";$("sh-frame").setAttribute("aria-pressed",SH.layout==="frame");$("sh-full").setAttribute("aria-pressed",SH.layout==="full");}
function openShare(date){
  const ks=Object.keys(byDate).sort().reverse();
  if(!ks.length){$("sh-pick").innerHTML="";$("sh-img").removeAttribute("src");$("sh-cap").textContent="";$("sh-msg").textContent=ACT?"No runs in the last six weeks to share yet.":"Your runs load from Garmin when this page is open in Claude. Try again in a moment.";$("shdlg").showModal();return;}
  SH.date=date&&byDate[date]?date:ks[0];
  $("sh-pick").innerHTML=ks.slice(0,30).map(k=>{const p=findDay(k);return `<option value="${k}" ${k===SH.date?"selected":""}>${fmt(k)} · ${esc(p?p.d.title:"Run")} · ${byDate[k].km.toFixed(1)} km</option>`;}).join("");
  $("sh-msg").textContent=HOLD;
  if(!$("shdlg").open)$("shdlg").showModal();drawCard();
}
// ---------- app shell ----------
const VIEWS={today:"Today",plan:"Plan",stats:"Stats",coach:"Coach",guide:"Guide"};
function go(v,push=true){
  if(!VIEWS[v])v="today";
  for(const k in VIEWS)$("v-"+k).hidden=k!==v;
  document.querySelectorAll(".tabbar button").forEach(b=>{if(b.dataset.go===v)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
  $("ab-title").textContent=VIEWS[v];$("fab-today").hidden=v!=="plan";
  if(push){try{if(location.hash!=="#"+v)location.hash=v;}catch(e){}window.scrollTo(0,0);}
}
function renderAll(){renderCoachLists();renderRoutes();renderHero();renderEx();renderToday();renderVol();renderWeek();renderPaces();renderLog();renderBody();renderTrack();renderPred();renderFeedback();}
SEL=(started()?curWeek():WEEKS.W01).id;
ring("r-ready",null,100,"var(--series)");battery(null);ring("r-sleep",null,100,"var(--series)");
renderAll();
$("syncstatus").textContent="Showing the plan as built. Connecting to live data…";
$("ab-chip").textContent=Math.max(0,Math.ceil((RACE-new Date())/864e5))+" days to race";
$("fab-share").innerHTML=ic("share")+"Share";$("fab-today").innerHTML=ic("calendar");$("fab-top").innerHTML=ic("up");
go((location.hash||"").slice(1)||"today",false);
window.addEventListener("hashchange",()=>go((location.hash||"").slice(1)||"today",false));
document.querySelector(".tabbar").addEventListener("click",e=>{const b=e.target.closest("button[data-go]");if(b)go(b.dataset.go);});
window.addEventListener("scroll",()=>{$("fab-top").hidden=window.scrollY<900||!$("fab-today").hidden;},{passive:true});
$("fab-top").addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
$("fab-share").addEventListener("click",()=>openShare());
document.addEventListener("click",e=>{const b=e.target.closest("button[data-share]");if(b)openShare(b.dataset.share);});
$("sh-x").addEventListener("click",()=>$("shdlg").close());
$("shdlg").addEventListener("click",e=>{if(e.target===$("shdlg"))$("shdlg").close();});
$("sh-pick").addEventListener("change",e=>{SH.date=e.target.value;drawCard();});
$("sh-file").addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;$("sh-msg").textContent="Loading your photo…";
  const bad=()=>{$("sh-msg").textContent="That photo could not be opened. Try a JPG or PNG from your library.";};
  const load=(src,next)=>{const im=new Image();im.onload=()=>{SH.photo=im;photoUI();drawCard();$("sh-msg").textContent=HOLD;};im.onerror=next;im.src=src;};
  load(URL.createObjectURL(f),()=>{const fr=new FileReader();fr.onload=()=>load(fr.result,bad);fr.onerror=bad;fr.readAsDataURL(f);});
});
$("sh-nophoto").addEventListener("click",()=>{SH.photo=null;photoUI();drawCard();});
for(const [id,l] of [["sh-frame","frame"],["sh-full","full"]])$(id).addEventListener("click",()=>{SH.layout=l;photoUI();drawCard();});
$("sh-pos").addEventListener("input",e=>{SH.pos=+e.target.value;drawCard();});
$("sh-route").addEventListener("change",e=>{SH.route=e.target.checked;drawCard();});
$("rt-pick").addEventListener("change",e=>{RT.id=+e.target.value||e.target.value;if(ROUTES[RT.id]&&ROUTES[RT.id].err)delete ROUTES[RT.id];showRoute();});
$("rt-cv").addEventListener("pointerdown",routeTap);
$("rt-share").addEventListener("click",()=>{const a=outdoorRuns().find(x=>String(x.id)===String(RT.id));if(a)openShare(String(a.start_time).slice(0,10));});
$("sh-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("sh-cap").textContent);$("sh-msg").textContent="Caption copied.";}catch(e){$("sh-msg").textContent="Copy was blocked here. Select the caption text below and copy it.";}});

document.addEventListener("click",e=>{const b=e.target.closest("button[data-ex]");if(b)openEx(b.dataset.ex);});
$("exdlg-x").addEventListener("click",()=>$("exdlg").close());
$("exdlg").addEventListener("click",e=>{if(e.target===$("exdlg"))$("exdlg").close();});
$("vol").addEventListener("click",e=>{const b=e.target.closest("button[data-w]");if(!b)return;SEL=b.dataset.w;renderVol();renderWeek();go("plan");});
$("prev").addEventListener("click",()=>{const n=WEEKS[SEL].week-1;if(n>=1){SEL="W"+pad(n);renderVol();renderWeek();}});
$("next").addEventListener("click",()=>{const n=WEEKS[SEL].week+1;if(n<=22){SEL="W"+pad(n);renderVol();renderWeek();}});
$("fab-today").addEventListener("click",()=>{SEL=(started()?curWeek():WEEKS.W01).id;renderVol();renderWeek();window.scrollTo({top:0,behavior:"smooth"});});
document.addEventListener("change",e=>{const t=e.target;if(t.matches&&t.matches("input[data-k]")){store.set(t.dataset.k,t.checked?"1":"0");document.querySelectorAll(`input[data-k="${t.dataset.k}"]`).forEach(x=>x.checked=t.checked);}});

// ---------- db: plan overrides, log, coach feedback ----------
(async()=>{
  const db=await claude.use("db");
  if(!db){$("syncstatus").textContent="Showing the plan as built. Open this page in Claude while signed in to see live data and coach feedback.";return;}
  let got=false;const timer=setTimeout(()=>{if(!got)$("syncstatus").textContent="Live adjustments can't be reached right now. Showing the plan as built.";},10000);
  const head=()=>{$("syncstatus").textContent=(STATUS&&STATUS.headline?STATUS.headline:"Live plan connected.")+(STATUS&&STATUS.updatedAt?" Updated "+new Date(STATUS.updatedAt).toLocaleString(undefined,{weekday:"short",hour:"numeric",minute:"2-digit"})+".":"");};
  db.collection("weeks").onSnapshot(s=>{s.docs.forEach(doc=>{const v=doc.data();if(v&&v.days)WEEKS[doc.id]=v;});if(!s.metadata.fromCache){got=true;clearTimeout(timer);}head();renderAll();},
    e=>{clearTimeout(timer);$("syncstatus").textContent="Live adjustments are unavailable in this view. Showing the plan as built.";});
  db.doc("forecast/days").onSnapshot(s=>{FC=(s.exists&&s.data().days)||{};renderToday();renderWeek();},()=>{});
  db.collection("daily").orderBy("date","desc").limit(21).onSnapshot(s=>{DAILY={};s.docs.forEach(d=>{const v=d.data();if(v&&v.date)DAILY[v.date]=v;});renderLog();renderToday();},()=>{});
  db.collection("feedback").orderBy("date","desc").limit(40).onSnapshot(s=>{FEED={};s.docs.forEach(d=>{const v=d.data();if(v&&v.date)FEED[v.date]=v;});renderFeedback();renderToday();renderWeek();},()=>{});
  db.doc("status/current").onSnapshot(s=>{if(s.exists){STATUS=s.data();if(!BODY&&STATUS.body){BODY=STATUS.body;renderBody();}head();}},()=>{});
})();

// ---------- routes ----------
let MCP=null;const ROUTES={},RT={id:null};
const RAMP=["#7B5CFF","#C84BC4","#F2606A","#FBA238","#F5F02A"];
function ramp(c){c=Math.max(0,Math.min(1,c))*(RAMP.length-1);const i=Math.min(RAMP.length-2,Math.floor(c)),f=c-i,h=s=>[1,3,5].map(k=>parseInt(s.slice(k,k+2),16)),a=h(RAMP[i]),b=h(RAMP[i+1]);return "rgb("+a.map((v,k)=>Math.round(v+(b[k]-v)*f)).join(",")+")";}
function outdoorRuns(){return (ACT||[]).filter(a=>/running/.test(a.type||"")&&!/treadmill|indoor|virtual/.test(a.type||"")&&a.id).sort((a,b)=>String(b.start_time).localeCompare(String(a.start_time)));}
function findRecords(o,d){d=d||0;if(!o||typeof o!=="object"||d>4)return null;if(Array.isArray(o))return o.length>20&&o[0]&&typeof o[0]==="object"?o:null;let best=null;for(const k in o){const x=findRecords(o[k],d+1);if(x&&(!best||x.length>best.length||k==="records"))best=x;if(k==="records"&&x)break;}return best;}
function parseRoute(payload){
  const recs=findRecords(payload);if(!recs)return null;
  const num=(o,ks)=>{for(const k of ks){const v=o[k];if(typeof v==="number"&&isFinite(v))return v;}return null;},deg=v=>Math.abs(v)>180?v*180/2147483648:v;
  let raw=[];for(const o of recs){let la=num(o,["lat_deg","position_lat","lat","latitude","positionLat"]),lo=num(o,["lon_deg","position_long","lon","lng","longitude","position_lon","positionLong"]);if(la==null||lo==null)continue;la=deg(la);lo=deg(lo);if(!la&&!lo)continue;
    let t=o.timestamp!=null?o.timestamp:o.time!=null?o.time:o.elapsed_s;t=typeof t==="number"?t:t?Date.parse(String(t).replace(" ","T"))/1000:null;raw.push({la,lo,sp:num(o,["speed_mps","enhanced_speed","speed"]),d:num(o,["distance_m","distance"]),t});}
  if(raw.length<10)return null;
  const R=6371000,rad=Math.PI/180,hav=(a,b)=>{const x=(b.lo-a.lo)*rad*Math.cos((a.la+b.la)/2*rad),y=(b.la-a.la)*rad;return Math.sqrt(x*x+y*y)*R;};
  let cum=0;raw[0].m=0;for(let i=1;i<raw.length;i++){cum+=hav(raw[i-1],raw[i]);raw[i].m=cum;}
  const sps=raw.map(p=>p.sp).filter(v=>v!=null&&v>0).sort((a,b)=>a-b),kmh=sps.length&&sps[Math.floor(sps.length/2)]>7.5;
  const win=Math.max(4,Math.round(raw.length/120));
  for(let i=0;i<raw.length;i++){const a=raw[Math.max(0,i-win)],b=raw[Math.min(raw.length-1,i+win)];let v=null;
    if(sps.length>raw.length/2){let s=0,n=0;for(let j=Math.max(0,i-win);j<=Math.min(raw.length-1,i+win);j++)if(raw[j].sp!=null){s+=raw[j].sp;n++;}v=n?s/n/(kmh?3.6:1):null;}
    else if(a.t!=null&&b.t!=null&&b.t>a.t)v=(b.m-a.m)/(b.t-a.t);
    raw[i].pace=v&&v>0.8?1000/v:null;}
  const step=Math.max(1,Math.floor(raw.length/700)),pts=[];for(let i=0;i<raw.length;i+=step)pts.push(raw[i]);if(pts[pts.length-1]!==raw[raw.length-1])pts.push(raw[raw.length-1]);
  const ps=pts.map(p=>p.pace).filter(v=>v!=null).sort((a,b)=>a-b);if(!ps.length)return null;const pf=ps[Math.floor(ps.length*.08)],pl=ps[Math.floor(ps.length*.92)];
  const la0=Math.max(...pts.map(p=>p.la)),lo0=Math.min(...pts.map(p=>p.lo)),cm=Math.cos(pts[0].la*rad);let mx=0,my=0;
  for(const p of pts){p.x=(p.lo-lo0)*cm;p.y=la0-p.la;mx=Math.max(mx,p.x);my=Math.max(my,p.y);}const sc=Math.max(mx,my)||1;
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];b.gap=(b.m-a.m)>Math.max(120,step*12)||(a.t!=null&&b.t!=null&&b.t-a.t>Math.max(45,step*8))?1:0;}
  return {n:pts.map(p=>[p.x/sc,p.y/sc,p.pace==null?.5:1-Math.max(0,Math.min(1,(p.pace-pf)/((pl-pf)||1))),p.m/1000,p.pace,p.gap||0]),pf,pl,km:cum/1000};
}
function drawRoute(g,Rt,x,y,w,h,lw,marks){
  const n=Rt.n;let ax=0,ay=0;for(const p of n){ax=Math.max(ax,p[0]);ay=Math.max(ay,p[1]);}ax=ax||.01;ay=ay||.01;
  const s=Math.min(w/ax,h/ay),ox=x+(w-ax*s)/2,oy=y+(h-ay*s)/2,P=p=>[ox+p[0]*s,oy+p[1]*s];
  g.save();g.lineCap="round";g.lineJoin="round";g.beginPath();n.forEach((p,i)=>{const q=P(p);i&&!p[5]?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});g.strokeStyle="rgba(8,10,26,.85)";g.lineWidth=lw+Math.max(4,lw*.7);g.stroke();
  for(let i=1;i<n.length;i++){if(n[i][5])continue;const a=P(n[i-1]),b=P(n[i]);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.strokeStyle=ramp((n[i-1][2]+n[i][2])/2);g.lineWidth=lw;g.stroke();}
  if(marks){g.font="700 "+Math.round(lw*1.9)+"px 'DM Sans',system-ui,sans-serif";g.textAlign="center";g.textBaseline="middle";let next=1;for(const p of n){if(p[3]>=next){const q=P(p);g.beginPath();g.arc(q[0],q[1],lw*1.7,0,7);g.fillStyle="#11142D";g.fill();g.lineWidth=Math.max(1.5,lw*.25);g.strokeStyle="#fff";g.stroke();g.fillStyle="#fff";g.fillText(String(next),q[0],q[1]+.5);next++;}}g.textAlign="left";g.textBaseline="alphabetic";}
  const a=P(n[0]),b=P(n[n.length-1]);g.beginPath();g.arc(b[0],b[1],lw*1.25,0,7);g.fillStyle="#11142D";g.fill();g.lineWidth=lw*.5;g.strokeStyle="#fff";g.stroke();
  g.beginPath();g.arc(a[0],a[1],lw*1.25,0,7);g.fillStyle="#00D68F";g.fill();g.lineWidth=lw*.4;g.strokeStyle="#fff";g.stroke();g.restore();
  return {P,n};
}
function routePanel(g,Rt,x,y,w,h,big){
  g.save();g.fillStyle="rgba(13,16,36,.78)";g.beginPath();g.roundRect(x,y,w,h,28);g.fill();const pad=big?34:22,leg=big?64:0;
  drawRoute(g,Rt,x+pad,y+pad,w-pad*2,h-pad*2-leg,big?11:7,false);
  if(big){const by=y+h-52,bw=260,bx=x+w-pad-bw,gr=g.createLinearGradient(bx,0,bx+bw,0);RAMP.forEach((c,i)=>gr.addColorStop(i/(RAMP.length-1),c));g.fillStyle=gr;g.beginPath();g.roundRect(bx,by,bw,14,7);g.fill();
    g.fillStyle="#fff";g.font="700 26px 'DM Sans',system-ui,sans-serif";g.textAlign="left";g.fillText("Route · pace",x+pad,by+16);g.font="600 22px 'DM Sans',system-ui,sans-serif";g.globalAlpha=.9;g.fillText(Rt.sl||"slower",bx,by+42);g.textAlign="right";g.fillText(Rt.fl||"faster",bx+bw,by+42);g.textAlign="left";g.globalAlpha=1;}
  g.restore();
}
function actFor(date){return outdoorRuns().filter(a=>String(a.start_time).slice(0,10)===date).sort((a,b)=>(b.distance_meters||0)-(a.distance_meters||0))[0]||null;}
function routeFor(i){const a=actFor(i.date);if(!a)return null;const Rt=ROUTES[a.id];if(Rt&&Rt.n){Rt.sl=hms(Rt.pl)+"/km";Rt.fl=hms(Rt.pf)+"/km";return Rt;}if(Rt===undefined)loadRoute(a.id).then(x=>{if(x&&SH.date===i.date&&$("shdlg").open)drawCard();});return null;}
function encRoute(Rt){const k=Math.max(1,Math.ceil(Rt.n.length/260));let s="";for(let i=0;i<Rt.n.length;i+=k){const p=Rt.n[i],e=v=>Math.round(Math.max(0,Math.min(1,v))*1295).toString(36).padStart(2,"0");let gap=0;for(let j=Math.max(1,i-k+1);j<=i;j++)if(Rt.n[j][5])gap=1;s+=e(p[0])+e(p[1])+(gap?"x":Math.round(p[2]*9));}return s;}
async function loadRoute(id){
  if(ROUTES[id]!==undefined&&ROUTES[id]!=="loading")return ROUTES[id];
  if(ROUTES[id]==="loading")return new Promise(r=>{const iv=setInterval(()=>{if(ROUTES[id]!=="loading"){clearInterval(iv);r(ROUTES[id]);}},300);});
  try{const c=store.get("route2:"+id);if(c){ROUTES[id]=JSON.parse(c);return ROUTES[id];}}catch(e){}
  if(!MCP){return null;}ROUTES[id]="loading";
  try{const res=await MCP.callTool("Garmin","get_activity_fit_data",{activity_id:id,include_records:true});const Rt=parseRoute(res&&res.payload!==undefined?res.payload:res);ROUTES[id]=Rt||{err:"nogps"};if(Rt)store.set("route2:"+id,JSON.stringify({n:Rt.n.map(p=>p.map(v=>v==null?null:Math.round(v*10000)/10000)),pf:Rt.pf,pl:Rt.pl,km:Rt.km}));}
  catch(e){ROUTES[id]={err:(e&&e.code)||"failed",dbg:String((e&&e.message)||e).slice(0,160)};}
  return ROUTES[id];
}
function renderRoutes(){
  const runs=outdoorRuns().slice(0,30),sel=$("rt-pick");if(!sel)return;
  if(!runs.length){sel.innerHTML="";$("rt-msg").textContent=ACT?"No outdoor runs with GPS in the last six weeks.":"Your routes load from Garmin when this page is open in Claude.";$("rt-wrap").hidden=true;return;}
  if(!RT.id||!runs.some(a=>a.id===RT.id))RT.id=runs[0].id;
  sel.innerHTML=runs.map(a=>{const d=String(a.start_time).slice(0,10),p=findDay(d);return `<option value="${a.id}" ${a.id===RT.id?"selected":""}>${fmt(d)} · ${esc(p?p.d.title:a.name||"Run")} · ${((a.distance_meters||0)/1000).toFixed(1)} km</option>`;}).join("");
  showRoute();
}
async function showRoute(){
  const id=RT.id;$("rt-msg").textContent="Loading the route from Garmin…";$("rt-wrap").hidden=true;
  const Rt=await loadRoute(id);if(RT.id!==id)return;
  if(!Rt||Rt.err){$("rt-msg").textContent=!Rt?"Routes load when this page is open in Claude with Garmin connected.":Rt.err==="nogps"?"This run has no GPS track.":(Rt.err==="approval_required"||Rt.err==="not_in_manifest")?"Allow this page to read the activity file from Garmin, then pick the run again.":"Garmin did not return this route ("+Rt.err+(Rt.dbg?": "+Rt.dbg:"")+"). Pick the run again to retry.";return;}
  $("rt-wrap").hidden=false;const c=$("rt-cv"),cw=c.clientWidth||340,dpr=Math.min(3,window.devicePixelRatio||1),ch=Math.round(Math.min(cw*.78,460));c.width=cw*dpr;c.height=ch*dpr;c.style.height=ch+"px";
  const g=c.getContext("2d");g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle="#11142D";g.fillRect(0,0,cw,ch);g.strokeStyle="rgba(255,255,255,.06)";g.lineWidth=1;for(let x=0;x<cw;x+=34){g.beginPath();g.moveTo(x,0);g.lineTo(x,ch);g.stroke();}for(let y=0;y<ch;y+=34){g.beginPath();g.moveTo(0,y);g.lineTo(cw,y);g.stroke();}
  const dr=drawRoute(g,Rt,26,26,cw-52,ch-52,5,true);RT.dr=dr;RT.rt=Rt;
  $("rt-slow").textContent=hms(Rt.pl)+"/km";$("rt-fast").textContent=hms(Rt.pf)+"/km";$("rt-msg").textContent="Colour shows pace along the route. Green dot is the start. Tap the line for the pace at that point.";
}
function routeTap(e){const d=RT.dr,Rt=RT.rt;if(!d||!Rt)return;const r=$("rt-cv").getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=1e9;for(const p of Rt.n){const q=d.P(p),dd=(q[0]-x)**2+(q[1]-y)**2;if(dd<bd){bd=dd;best=p;}}
  if(best&&bd<45*45)$("rt-msg").textContent="At km "+best[3].toFixed(1)+": "+(best[4]?hms(best[4])+"/km":"no pace reading")+".";}

// ---------- live Garmin ----------
(async()=>{
  const mcp=await claude.use("mcp");MCP=mcp;
  if(!mcp){$("live-note").textContent="Live Garmin numbers and charts show when this page is open in Claude with the Garmin connector. The checks still run on their own.";return;}
  const S="Garmin",t=todayISO,ago=n=>addDays(t,-n),slow={cache:{staleTime:900000,gcTime:3600000},refetchInterval:1800000};
  const err=ev=>{const c=ev.error&&ev.error.code;
    $("live-note").textContent=c==="needs_reauth"?"Reconnect Garmin in claude.ai Settings → Connectors.":c==="server_not_connected"?"Add the Garmin connector in claude.ai Settings → Connectors.":(c==="approval_required"||c==="not_in_manifest")?"Allow this page to read Garmin to see live numbers.":"Garmin didn't answer just now. Numbers may be old.";};
  const fresh=r=>{$("live-note").textContent="Live from Garmin"+(r.cache?", cached "+new Date(r.cache.storedAt).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"}):"")+". Sync your watch if numbers look old.";};
  mcp.watchTool(S,"get_training_readiness",{date:t},ev=>{
    if(ev.type==="error")return err(ev);const p=ev.result.payload;fresh(ev.result);let score=null,level="";
    const pick=o=>{if(!o||typeof o!=="object")return;if(Array.isArray(o)){o.forEach(pick);return;}
      if(score==null)for(const k of["score","training_readiness_score","readiness_score"])if(typeof o[k]==="number"){score=o[k];break;}
      if(!level)for(const k of["level","feedback_short","status"])if(typeof o[k]==="string"){level=o[k];break;}
      Object.values(o).forEach(v=>{if(v&&typeof v==="object")pick(v);});};
    if(typeof p!=="string")pick(p);
    ring("r-ready",score,100,score==null?"var(--series)":score>=60?"var(--ok)":score>=40?"var(--warn)":"var(--bad)");
    $("m-ready-s").textContent=score!=null?(score>=60?"Ready":score>=40?"Moderate":"Low")+(level?" · "+String(level).replace(/_/g," ").toLowerCase():""):"No reading yet today";
  },{refetchInterval:300000});
  mcp.watchTool(S,"get_body_battery",{start_date:t,end_date:t},ev=>{
    if(ev.type==="error")return err(ev);let cur=null,hi=null,lo=null;
    const walk=o=>{if(!o||typeof o!=="object")return;if(Array.isArray(o)){o.forEach(walk);return;}
      for(const[k,v]of Object.entries(o)){if(typeof v==="number"){if(/most_recent|current|latest/i.test(k)&&cur==null)cur=v;if(/high|max|charged/i.test(k)&&hi==null)hi=v;if(/low|min|drained/i.test(k)&&lo==null)lo=v;}else if(v&&typeof v==="object")walk(v);}};
    walk(ev.result.payload);const v=cur!=null?cur:hi;battery(v!=null&&v<=100?Math.round(v):null);
    $("m-bb-s").textContent=((hi!=null?"high "+hi:"")+(lo!=null?" · low "+lo:""))||"No data yet today";
  },{refetchInterval:300000});
  mcp.watchTool(S,"get_hrv_trend",{start_date:ago(29),end_date:t},ev=>{
    if(ev.type==="error")return err(ev);HRVT=((ev.result.payload&&ev.result.payload.trend)||[]).filter(x=>x.last_night_avg_hrv_ms!=null);
    const last=HRVT[HRVT.length-1];if(!last){$("m-hrv-s").textContent="Wear the watch overnight";return;}
    $("m-hrv").textContent=last.last_night_avg_hrv_ms+" ms";const wa=last.weekly_avg_hrv_ms;const df=wa?Math.round((last.last_night_avg_hrv_ms-wa)/wa*100):null;
    $("m-hrv-s").textContent=(wa?"7-day "+wa+" ms ("+(df>=0?"+":"")+df+"%)":"")+" · "+fmt(last.date);
    spark("sp-hrv",HRVT.map(x=>x.last_night_avg_hrv_ms));$("c-hrv-now").textContent=last.last_night_avg_hrv_ms+" ms";
    lineChart("c-hrv",HRVT.map(x=>fmt(x.date)),[{name:"7-day avg",pts:HRVT.map(x=>x.weekly_avg_hrv_ms??null),plan:true},{name:"Night",pts:HRVT.map(x=>x.last_night_avg_hrv_ms)}],{unit:" ms",fmt:v=>Math.round(v),label:"Overnight HRV, 30 days"});
  },slow);
  mcp.watchTool(S,"get_vo2max_trend",{start_date:ago(89),end_date:t},ev=>{
    if(ev.type==="error")return err(ev);VO2=((ev.result.payload&&ev.result.payload.trend)||[]).filter(x=>x.vo2_max!=null);if(!VO2.length)return;
    const last=VO2[VO2.length-1],first=VO2[Math.max(0,VO2.length-29)];const d=Math.round((last.vo2_max-first.vo2_max)*10)/10;
    $("m-vo2").textContent=last.vo2_max;$("m-vo2-s").textContent=(d>=0?"+":"")+d+" in 4 weeks";spark("sp-vo2",VO2.map(x=>x.vo2_max));
    $("c-vo2-now").textContent=last.vo2_max;lineChart("c-vo2",VO2.map(x=>fmt(x.date)),[{name:"VO2 max",pts:VO2.map(x=>x.vo2_max)}],{label:"VO2 max, 90 days"});
  },slow);
  mcp.watchTool(S,"get_sleep_summary_range",{start_date:ago(13),end_date:t},ev=>{
    if(ev.type==="error")return err(ev);SLEEP=((ev.result.payload&&ev.result.payload.nights)||[]).filter(x=>x.sleep_hours<14);if(!SLEEP.length)return;
    const last=SLEEP[SLEEP.length-1];ring("r-sleep",last.sleep_score,100,last.sleep_score>=80?"var(--ok)":last.sleep_score>=60?"var(--warn)":"var(--bad)");
    $("m-sleep-s").textContent=last.sleep_hours.toFixed(1)+" h · "+fmt(last.date);
    const rh=SLEEP.map(x=>x.resting_heart_rate_bpm).filter(v=>v);if(rh.length){const avg=Math.round(rh.reduce((a,b)=>a+b,0)/rh.length);$("m-rhr").textContent=rh[rh.length-1]+" bpm";$("m-rhr-s").textContent="2-week avg "+avg+" bpm";spark("sp-rhr",rh);}
    const sc=SLEEP.map(x=>x.sleep_score);$("c-sleep-now").textContent=Math.round(sc.reduce((a,b)=>a+b,0)/sc.length)+" average";
    barChart("c-sleep",SLEEP.map(x=>fmt(x.date)),sc,{max:100,label:"Sleep score, 14 nights"});
  },slow);
  mcp.watchTool(S,"get_race_predictions",{},ev=>{if(ev.type==="error")return err(ev);PRED=(ev.result.payload&&ev.result.payload.predictions)||null;renderPred();},slow);
  mcp.watchTool(S,"get_body_composition",{start_date:ago(30),end_date:t},ev=>{if(ev.type==="error")return err(ev);const b=bodyFromGarmin(ev.result.payload);if(b){BODY=b;renderBody();}},slow);
  mcp.watchTool(S,"get_activities_by_date",{start_date:addDays(PSTART,-42),end_date:t,activity_type:"running",page_size:200},ev=>{
    if(ev.type==="error")return err(ev);const list=(ev.result.payload&&ev.result.payload.activities)||[];ACT=list;byDate={};
    for(const a of list){const d=String(a.start_time||"").slice(0,10);if(!d)continue;const o=byDate[d]||(byDate[d]={km:0,sec:0,hrw:0,hr:0});const km=(a.distance_meters||0)/1000;o.km+=km;o.sec+=a.duration_seconds||0;if(a.avg_hr_bpm){o.hrw+=a.avg_hr_bpm*km;o.hr=o.hrw/o.km;}}
    renderAll();
  },{cache:{staleTime:300000,gcTime:3600000},refetchInterval:600000});
})();
})();
