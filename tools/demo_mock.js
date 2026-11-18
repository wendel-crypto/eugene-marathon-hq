/* Demo data for the public demo of Eugene Marathon Training HQ. Every number here is invented sample data. */
(()=>{
const d=n=>{const x=new Date(Date.now()-n*864e5);return x.toISOString().slice(0,10)};
const P={
 get_training_readiness:{score:68,level:"MODERATE"},
 get_body_battery:{most_recent:74,highest:92,lowest:31},
 get_hrv_trend:{trend:Array.from({length:27},(_,i)=>({date:d(27-i),last_night_avg_hrv_ms:48+Math.round(Math.sin(i/3)*8+i/4),weekly_avg_hrv_ms:52+Math.round(i/6)}))},
 get_vo2max_trend:{trend:Array.from({length:90},(_,i)=>({date:d(89-i),vo2_max:Math.round((50.2+i/150+Math.sin(i/9)/5)*10)/10}))},
 get_sleep_summary_range:{nights:Array.from({length:12},(_,i)=>({date:d(12-i),sleep_score:62+((i*7)%25),sleep_hours:6.4+((i*3)%20)/10,resting_heart_rate_bpm:50+(i%6)}))},
 get_race_predictions:{predictions:{"5K":{time:"21:10",time_seconds:1270},"10K":{time:"44:30",time_seconds:2670},half_marathon:{time:"1:39:40",time_seconds:5980},marathon:{time:"3:32:00",time_seconds:12720}}},
 get_body_composition:{dateWeightList:Array.from({length:14},(_,i)=>({calendarDate:d(i*2),weight:70200+((i*137)%700),bmi:22.8,bodyFat:0,bodyWater:58,boneMass:3500,muscleMass:30100}))},
 get_activities_by_date:{activities:[1,3,5,8,10,12,15,17,19,22,25,26,29,33,36].map((n,i)=>({start_time:d(n)+" 05:40:00",name:"Morning run",distance_meters:6000+((i*2311)%9000),duration_seconds:2000+i*290,avg_hr_bpm:138+(i%9),type:"running",id:9000+i}))}
};
const FIT=id=>{const recs=[],k=(id%5)+2;let dist=0;for(let i=0;i<1800;i++){const th=i/1800*Math.PI*2,sp=2.9+Math.sin(i/140+id)*0.55+(i>1200?0.5:0);dist+=sp;recs.push({timestamp:"2026-01-01 05:"+String(Math.floor(i/60)%60).padStart(2,"0")+":"+String(i%60).padStart(2,"0"),lat_deg:40+0.012*Math.sin(th)*(1+0.3*Math.sin(k*th)),lon_deg:-100+0.016*Math.cos(th)*(1+0.2*Math.cos((k-1)*th)),speed_mps:sp,distance_m:dist});}return {records:recs};};
const fc={};for(let i=0;i<7;i++){const x=new Date(Date.now()+i*864e5).toISOString().slice(0,10);fc[x]={date:x,tempC:21+(i*3)%6,tempF:70+((i*3)%6)*2,humidity:78+(i*5)%20,precipPct:(i*17)%70,sky:["Sunny","Mostly Sunny","Chance Showers","Partly Cloudy"][i%4],place:"Demo"};}
fc["2026-11-23"]=fc["2026-11-23"]||{date:"2026-11-23",tempC:22,tempF:71,humidity:93,precipPct:5,sky:"Sunny",place:"Demo"};fc["2026-11-24"]=fc["2026-11-24"]||{date:"2026-11-24",tempC:21,tempF:70,humidity:92,precipPct:14,sky:"Mostly Sunny",place:"Demo"};
const FB=[{date:d(1),score:8,headline:"Controlled easy run, heart rate stayed in zone 2 throughout.",bullets:["Pace drifted only 4 s/km from first to last kilometre.","Cadence held at 172."],next:"Keep the first kilometre this relaxed on Thursday."},{date:d(3),score:7,headline:"Good track session, last two reps a touch fast.",bullets:["Reps 1–3 inside the target pace.","Recovery jogs were honest."],next:"Lock the pace on the watch for the final reps."}];
const snap=docs=>({docs:docs.map(v=>({data:()=>v})),metadata:{fromCache:false}});
const col=name=>{const c={orderBy(){return c},limit(){return c},where(){return c},onSnapshot(cb){setTimeout(()=>cb(snap(name==="feedback"?FB:[])),30);return()=>{}}};return c;};
const DB={collection:col,doc(p){return {onSnapshot(cb){setTimeout(()=>cb(p==="forecast/days"?{exists:true,data:()=>({days:fc})}:p==="status/current"?{exists:true,data:()=>({headline:"Demo with sample data.",updatedAt:new Date().toISOString()})}:{exists:false,data:()=>null}),30);return()=>{}}}}};
window.claude={use:async n=>n==="db"?DB:n==="mcp"?{callTool:async(s,t,i)=>({payload:FIT(+i.activity_id||0)}),watchTool:(s,t,i,h)=>{setTimeout(()=>h({type:"data",result:{payload:P[t]}}),60);return()=>{}}}:null};
})();
