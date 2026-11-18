import json, datetime as dt
START=dt.date(2026,11,23); RACE=dt.date(2027,4,25)
EASY=["hr",119,138]; LONG=["hr",125,145]
def p(lo,hi): return ["pace",lo,hi]  # lo=faster "4:15", hi=slower
PH={1:dict(T=("4:15","4:22"),R=("3:30","3:40"),I=("3:55","4:00"),MP=("4:30","4:36")),
    2:dict(T=("4:07","4:13"),R=("3:27","3:35"),I=("3:48","3:54"),MP=("4:22","4:28")),
    3:dict(T=("4:00","4:06"),R=("3:24","3:32"),I=("3:43","3:49"),MP=("4:16","4:23")),
    4:dict(T=("4:00","4:06"),R=("3:24","3:32"),I=("3:43","3:49"),MP=("4:16","4:23"))}
def phase(w): return 1 if w<=6 else 2 if w<=12 else 3 if w<=19 else 4
PHNAME={1:"Base rebuild",2:"Aerobic strength",3:"Marathon-specific",4:"Taper"}
TARGET=[38,46,52,56,46,62,66,72,60,78,84,68,88,94,76,96,101,82,100,82,63,62]
def S(k,d,tgt=None,n=1): return {"k":k,"d":d,"tgt":tgt,"n":n}
def R(n,steps): return {"rep":n,"steps":steps}
WU=lambda:[S("warmup",1000,EASY,3)]
CD=lambda:[S("cooldown",1000,EASY,2)]
def reps(n,dist,zone,ph,jog):
    return R(n,[S("interval",dist,p(*PH[ph][zone])),S("recovery",jog)])
def track(w,day):
    ph=phase(w)
    plan={ # (n,dist,zone,jog) or special
     1:{"Tue":(4,1000,"T",400),"Fri":(8,200,"R",200)},
     2:{"Tue":(5,1000,"T",400),"Fri":(10,200,"R",200)},
     3:{"Tue":(6,1000,"T",400),"Fri":(6,400,"R",400)},
     4:{"Tue":(3,2000,"T",400),"Fri":(8,400,"R",400)},
     5:{"Tue":(4,1000,"T",400),"Fri":(8,200,"R",200)},
     6:{"Tue":(4,1600,"T",400),"Fri":(12,200,"R",200)},
     7:{"Tue":(5,1600,"T",400),"Fri":(5,1000,"I",400)},
     8:{"Tue":(3,3200,"T",800),"Fri":(6,1000,"I",400)},
     9:{"Tue":(4,1600,"T",400),"Fri":(6,800,"I",400)},
     10:{"Tue":(6,1600,"T",400),"Fri":(5,1200,"I",400)},
     11:{"Tue":(4,2400,"T",600),"Fri":(6,1000,"I",400)},
     12:{"Tue":(4,1000,"T",400),"Fri":(6,200,"R",200)},
     13:{"Tue":(3,5000,"MP",1000),"Fri":(6,1000,"I",400)},
     14:{"Tue":(4,2400,"T",400),"Fri":(8,800,"I",400)},
     15:{"Tue":(5,1000,"T",400),"Fri":(8,200,"R",200)},
     16:{"Tue":(2,6000,"MP",1000),"Fri":(6,1000,"I",400)},
     17:{"Tue":(4,2400,"T",400),"Fri":(10,400,"I",200)},
     18:{"Tue":(5,1600,"T",400),"Fri":(8,200,"R",200)},
     19:{"Tue":(3,5000,"MP",1000),"Fri":(6,1000,"I",400)},
     20:{"Tue":(4,1600,"T",400),"Fri":(6,800,"I",400)},
     21:{"Tue":(3,3000,"MP",600),"Fri":(6,400,"I",200)},
     22:{"Tue":(2,2000,"MP",400)},
    }[w]
    if day not in plan: return None
    n,d,z,j=plan[day]
    zn={"T":"threshold","I":"VO2max","R":"speed/economy","MP":"marathon pace"}[z]
    lo,hi=PH[ph][z]
    title=f"Track · {n}×{d if d<1000 else str(d/1000).rstrip('0').rstrip('.')+'K'} {z}"
    if d<1000: title=f"Track · {n}×{d}m {z}"
    steps=WU()+[reps(n,d,z,ph,j)]+CD()
    desc=f"Tropical Park 5:30am. 3 km warm-up (HR ≤138) + drills, {n}×{d}m at {zn} {lo}–{hi}/km with {j}m jog, 2 km cool-down. Coach's session overrides if different."
    return dict(type="track",title=title,steps=steps,desc=desc)
LONGS={1:(14,0),2:(16,0),3:(20,0),4:(22,0),5:(18,0),6:(24,0),7:(26,0),8:(28,6),9:(22,0),10:(30,0),11:(32,10),
 12:"half",13:(32,0),14:(34,16),15:(26,0),16:(35,0),17:"3x6",18:(28,0),19:(32,14),20:(26,10),21:(18,8),22:"race"}
def longrun(w):
    ph=phase(w); L=LONGS[w]; mp=p(*PH[ph]["MP"])
    if L=="half":
        return dict(type="race",title="Tune-up half marathon",steps=WU()+[S("interval",1000,p("4:05","4:09"),21),S("interval",100,p("4:05","4:09"))]+CD(),
          desc="Half-marathon time trial or race (any local half that weekend). Goal 4:05–4:09/km, about 1:26–1:27, which keeps 3:00–3:05 on. 1:27–1:29 points to 3:05–3:09. Slower than 1:31 moves the target to 3:15.")
    if L=="race":
        return dict(type="race",title="EUGENE MARATHON",steps=[S("interval",1000,p("4:16","4:23"),42),S("interval",195,p("4:10","4:23"))],
          desc="Race day. 7:00am start, Hayward Field. Even pace at 4:16–4:23/km through 32 km, then race. Gel every 25 min.")
    if L=="3x6":
        steps=[S("interval",1000,LONG,9)]+[R(3,[S("interval",1000,mp,6),S("recovery",1000,LONG,2)])]
        return dict(type="long",title="Long 35K · 3×6K MP",steps=steps,desc="9 km easy, then 3×(6 km at marathon pace + 2 km easy). Practise race fuelling: gel every 30 min.")
    km,m=L
    if m==0:
        return dict(type="long",title=f"Long run {km}K",steps=[S("interval",1000,LONG,km)],desc=f"{km} km easy-steady, HR 125–145. Fuel from 60 min. Treadmill or early start if dew point >21°C.")
    e=km-m-2
    return dict(type="long",title=f"Long {km}K · {m}K MP",steps=[S("interval",1000,LONG,e),S("interval",1000,mp,m),S("cooldown",1000,EASY,2)],
        desc=f"{e} km easy (HR 125–145), {m} km at marathon pace {PH[ph]['MP'][0]}–{PH[ph]['MP'][1]}/km, 2 km easy. Race-day fuelling rehearsal.")
def km_of(steps):
    t=0
    for s in steps:
        if "rep" in s: t+=s["rep"]*sum(x["d"]*x["n"] for x in s["steps"])
        else: t+=s["d"]*s["n"]
    return t/1000
def easy(km,strides=False,title=None,recovery=False):
    km=max(5,int(round(km)))
    if title is None and km>=13 and not strides and not recovery: title=f"Medium-long {km}K"
    st=[S("interval",1000,EASY if not recovery else ["hr",110,132],km)]
    d=f"{km} km easy, HR cap 138 (pace is whatever it is — Miami humidity)."
    if strides:
        st.append(R(6,[S("interval",100,p("3:20","3:40")),S("recovery",100)])); d+=" Finish with 6×100m strides, walk back."
    if recovery: d=f"{km} km recovery, HR ≤132. Then 25 min strength (single-leg, calves, core)."
    return dict(type="recovery" if recovery else "easy",title=title or (f"Easy {km}K"+(" + strides" if strides else "")),steps=st,desc=d)
DOW=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
weeks=[]
for w in range(1,23):
    ws=START+dt.timedelta(weeks=w-1); ph=phase(w); tgt=TARGET[w-1]
    days={}
    for i,dn in enumerate(DOW):
        days[dn]=None
    days["Tue"]=track(w,"Tue"); days["Fri"]=track(w,"Fri"); days["Sun"]=longrun(w)
    if w==22:
        days["Mon"]=dict(type="rest",title="Rest",steps=[],desc="Rest. Hydrate, sleep 8h+.")
        days["Wed"]=easy(8,True); days["Thu"]=easy(6,False)
        days["Fri"]=dict(type="easy",title="Shakeout 4K + strides",steps=[S("interval",1000,EASY,4),R(4,[S("interval",100,p("3:30","3:50")),S("recovery",100)])],desc="Travel day. 4 km easy wherever you are + 4×100m strides.")
        days["Sat"]=dict(type="easy",title="Shakeout 3K",steps=[S("interval",1000,EASY,3)],desc="15 min shakeout, bib pickup, legs up.")
    else:
        fixed=sum(km_of(days[d]["steps"]) for d in ("Tue","Fri","Sun"))
        rem=tgt-fixed
        if rem<9: order=["Wed"]
        elif rem<17: order=["Wed","Sat"]
        elif rem<32: order=["Wed","Thu","Sat"]
        else: order=["Mon","Wed","Thu","Sat"]
        W={"Mon":.16,"Wed":.27,"Thu":.33,"Sat":.24}
        tot=sum(W[d] for d in order)
        for d in order:
            k=rem*W[d]/tot
            if d=="Mon": days[d]=easy(k,recovery=True)
            elif d=="Wed": days[d]=easy(k-0.6,strides=True)
            elif d=="Thu":
                days[d]=easy(k); 
                if days[d]["km"] if "km" in days[d] else False: pass
            else: days[d]=easy(k)
        for d in ("Wed","Thu","Sat"):
            if days[d] is None: days[d]=dict(type="rest",title="Rest",steps=[],desc="Rest day. Mobility 15 min, sleep 8h+.")
        mon_run = "Mon" in order
        if not mon_run: days["Mon"]=dict(type="rest",title="Rest + strength",steps=[],desc="No run. 30 min strength: single-leg squats, RDLs, calf raises 3×15, Copenhagen plank, dead bugs.")
    out=[]
    for i,dn in enumerate(DOW):
        dd=days[dn]; dd["date"]=(ws+dt.timedelta(days=i)).isoformat(); dd["dow"]=dn
        dd["km"]=round(km_of(dd["steps"]),1); dd["status"]="planned"
        out.append(dd)
    total=round(sum(x["km"] for x in out),1)
    focus={1:"Rebuild consistency. Every easy run HR ≤138.",2:"Threshold + VO2 on the track; long runs to 32K.",3:"Marathon pace volume; peak ~100 km.",4:"Freshen up. Keep the pace, drop the volume."}[ph]
    weeks.append(dict(id=f"W{w:02d}",week=w,start=ws.isoformat(),phase=ph,phaseName=PHNAME[ph],targetKm=tgt,plannedKm=total,focus=focus,days=out))
for wk in weeks: print(wk["id"],wk["start"],wk["phaseName"][:8],wk["targetKm"],wk["plannedKm"],[ (d["dow"],d["km"]) for d in wk["days"]])
meta=dict(race="Eugene Marathon",raceDate="2027-04-25",raceStart="07:00",goalA="3:00",goalB="3:05",goalC="sub-3:15 (BQ M45-49)",
 paces={str(k):v for k,v in PH.items()},hr=dict(z2=[119,138],long=[125,145],lthr=177,max=198),
 rules="Autolap-friendly: every step ends by distance (1 km chunks on runs), no lap-button steps.",
 created=dt.date.today().isoformat())
json.dump(dict(meta=meta,weeks=weeks),open("plan.json","w"),indent=1)
