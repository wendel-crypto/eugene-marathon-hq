(async function(){
const $=id=>document.getElementById(id);
const RACE=new Date("2027-04-25T07:00:00-07:00");
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const todayISO=iso(new Date());
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=s=>new Date(s+"T12:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short"});
const addDays=(s,n)=>{const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return iso(d);};
const hms=sec=>{sec=Math.round(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return (h?h+":"+pad(m):m)+":"+pad(s);};
const TYPE={track:"Track",long:"Long run",easy:"Easy",recovery:"Recovery",rest:"Rest",race:"Race"};
let PLAN,WEEKS={},DAILY={},STATUS=null,SEL=null,BODY=null;
let ACT=null,byDate={},VO2=[],HRVT=[],SLEEP=[],WLIST=[],PRED=null,FEED={};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
// own icon set, 24×24 strokes
const IC={
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
 battery:'<rect x="2" y="8" width="17" height="9" rx="2"/><path d="M22 11v3"/><path d="M6 11v3M9.5 11v3"/>',
 heart:'<path d="M12 20s-7-4.4-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4C19 15.6 12 20 12 20z"/>',
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
 pulse:'<path d="M2 12h5l3-7 4 14 3-7h5"/>',
 trend:'<path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/>',
 scale:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 11a4 4 0 0 1 8 0M12 11l1.5-2.5"/>',
 flag:'<path d="M5 21V3M5 4h12l-2.5 4 2.5 4H5"/>',
 route:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18c5 0 3-12 8-12"/>',
 bolt:'<path d="M13 2L4 14h7l-1 8 10-13h-7z"/>',
 drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>',
 snow:'<path d="M12 2v20M3.3 7l17.400 10M3.3 17l17.400-10"/>',
 flame:'<path d="M12 3c1 4 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 2 1.500 2.500 2 2.500C11 9 10 6 12 3z"/>',
 boot:'<path d="M8 3h6v10l5 3v4H8z"/><path d="M8 16h6"/>',
 light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
 roller:'<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M8 9v6M12 9v6M16 9v6"/>',
 ball:'<circle cx="12" cy="12" r="8"/><path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01"/>',
 cup:'<path d="M7 12a5 5 0 0 1 10 0v2H7z"/><path d="M5 14h14M12 7V4"/>',
 wind:'<path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h7"/>',
 gel:'<path d="M9 3h6l2 5-2 13H9L7 8z"/><path d="M8 8h8"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 check:'<path d="M4 12l5 5L20 6"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/>',
 home:'<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
 book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
 share:'<path d="M12 15V3M8 7l4-4 4 4M5 12v8h14v-8"/>',
 up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
 dumb:'<path d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"/>'
};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||IC.check}</svg>`;
document.querySelectorAll("[data-ic]").forEach(el=>el.insertAdjacentHTML("afterbegin",ic(el.dataset.ic)));

try{PLAN=await (await fetch("plan.json")).json();}catch(e){$("syncstatus").textContent="Could not load the plan file. Reload the page.";return;}
PLAN.weeks.forEach(w=>WEEKS[w.id]=w);
const PSTART=PLAN.weeks[0].start;
const sorted=()=>Object.values(WEEKS).sort((a,b)=>a.week-b.week);
const started=()=>todayISO>=PSTART;
function curWeek(){let c=null;for(const w of sorted()) if(w.start<=todayISO) c=w;return c||WEEKS.W01;}
function findDay(d){for(const w of sorted()) for(const x of w.days) if(x.date===d) return {w,d:x};return null;}
