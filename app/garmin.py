import json,sys
KIND={"warmup":(1,"warmup"),"cooldown":(2,"cooldown"),"interval":(3,"interval"),"recovery":(4,"recovery")}
def mps(p): m,s=p.split(":"); return round(1000/(int(m)*60+int(s)),3)
def tgt(t):
    if not t: return {"targetType":{"workoutTargetTypeId":1,"workoutTargetTypeKey":"no.target"}}
    if t[0]=="hr": return {"targetType":{"workoutTargetTypeId":4,"workoutTargetTypeKey":"heart.rate.zone"},"targetValueOne":t[1],"targetValueTwo":t[2]}
    return {"targetType":{"workoutTargetTypeId":6,"workoutTargetTypeKey":"pace.zone"},"targetValueOne":mps(t[2]),"targetValueTwo":mps(t[1])}
def build(day,week):
    order=[0]
    def nxt(): order[0]+=1; return order[0]
    def exe(s):
        sid,skey=KIND[s["k"]]
        d={"type":"ExecutableStepDTO","stepOrder":nxt(),"stepType":{"stepTypeId":sid,"stepTypeKey":skey},
           "endCondition":{"conditionTypeId":3,"conditionTypeKey":"distance"},"endConditionValue":float(s["d"])}
        d.update(tgt(s["tgt"])); return d
    def grp(n,children):
        g={"type":"RepeatGroupDTO","stepOrder":nxt(),"stepType":{"stepTypeId":6,"stepTypeKey":"repeat"},
           "numberOfIterations":n,"endCondition":{"conditionTypeId":7,"conditionTypeKey":"iterations"},"endConditionValue":float(n),"smartRepeat":False}
        g["workoutSteps"]=[c() for c in children]; return g
    steps=[]
    for s in day["steps"]:
        if "rep" in s: steps.append(grp(s["rep"],[(lambda x=x: exe(x)) for x in s["steps"]]))
        elif s["n"]>1: steps.append(grp(s["n"],[lambda s=s: exe(s)]))
        else: steps.append(exe(s))
    name=f"EUG {week} {day['dow']} · {day['title']}"
    return {"workoutName":name[:80],"description":(day["desc"]+" [Eugene 2027 plan · autolap-friendly: 1 km steps]")[:1000],
            "sportType":{"sportTypeId":1,"sportTypeKey":"running"},
            "workoutSegments":[{"segmentOrder":1,"sportType":{"sportTypeId":1,"sportTypeKey":"running"},"workoutSteps":steps}]}
if __name__=="__main__":
    plan=json.load(open("plan.json")); out={}
    for w in plan["weeks"][:2]:
        for d in w["days"]:
            if d["steps"]: out[d["date"]]=build(d,w["id"])
    json.dump(out,open("w1w2_garmin.json","w"))
    print(len(out)); print(json.dumps(out["2026-11-24"])[:3000])
