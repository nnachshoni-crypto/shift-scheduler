import { useState, useRef } from "react";

const C = {
  bg:"#f0f2f5", white:"#fff", primary:"#1a3a5c", accent:"#e85d2f",
  morningBg:"#e8f4fd", morningBorder:"#3a9bd5",
  eveningBg:"#fff4e6", eveningBorder:"#e8962a",
  nightBg:"#eef0ff", nightBorder:"#5c6bc0",
  green:"#2e7d32", red:"#c62828", gray:"#6b7280", lightGray:"#e5e7eb",
};

const ROLE_ORDER = ["אחראי א","אחראי ב","טריאז","מהלכים","אורתופדיה","שוכבים א","מיטות קדמיות","שוכבים ב","סטודנט"];
const DAY_NAMES = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const HE_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const PERM_LABELS = {
  chargeA:"אחראי א", chargeB:"אחראי ב", triage:"טריאז",
  walking:"מהלכים", front17:"מיטות 1-7", front815:"מיטות 8-14",
  front1520:"מיטות 15-20", bedA:"שוכבים א", bedB:"שוכבים ב", student:"סטודנט"
};
const PERM_COLORS = {
  chargeA:{bg:"#e8eaf6",c:"#283593"}, chargeB:{bg:"#f3e5f5",c:"#6a1b9a"},
  triage:{bg:"#fff3e0",c:"#e65100"}, walking:{bg:"#e3f2fd",c:"#1565c0"},
  front17:{bg:"#fce4ec",c:"#880e4f"}, front815:{bg:"#fce4ec",c:"#ad1457"},
  front1520:{bg:"#fce4ec",c:"#c2185b"},
  bedA:{bg:"#e8f5e9",c:"#2e7d32"}, bedB:{bg:"#e0f2f1",c:"#00695c"},
  student:{bg:"#f5f5f5",c:"#616161"}
};
const shiftHe = s => ({morning:"בוקר",evening:"ערב",night:"לילה"}[s]||s);

const SCHEDULING_RULES = `כללי שיבוץ חשובים:
1. שיבץ לפי הרשאות העובד בלבד – התעלם לחלוטין מהשיבוץ הרשום בסידור השבועי
2. תא ריק / חופש / לימודים / יום בחירה / סידור עבודה = לא עובד, התעלם
3. גלית וולף ומעיין טולידנו לסירוגין א/ב. אם רק אחת עובדת – תמיד אגף א
4. משמרות מיוחדות: 11-19=בוקר מ11+ערב עד19, 10-18=בוקר מ10+ערב עד18, 7-19=בוקר+ערב, 19-7=ערב מ19+לילה, 11-23=בוקר מ11+ערב מלא
5. מכסות בוקר/ערב (א-ה): אחראי א(1), אחראי ב(1), טריאז(2), מהלכים(3), אורתופדיה(1), שוכבים א(3 כולל מיטות קדמיות 1), שוכבים ב(3)
6. מכסות לילה: טריאז(1), מהלכים(2), אחראי א(1)+שוכבים א(3), אחראי ב(1)+שוכבים ב(1-2)
7. סטודנטים: עדיפות אורתופדיה ← אגף ב ← אגף א
8. מתן משולם מוצמד לקרין אלפרוביץ'. תמר אוסטרי מוצמדת ליוליה ניר`;

const DEFAULT_WORKERS = [
  {id:1,name:"וולף גלית",permissions:["chargeA","chargeB"],notes:"סגנית אחות אחראית. תמיד אחראית. לסירוגין עם מעיין טולדנו"},
  {id:2,name:"טולידנו מעיין",permissions:["chargeA","chargeB","triage"],notes:"סגנית אחות אחראית. לסירוגין עם גלית וולף"},
  {id:3,name:"אזוגי דליה",permissions:["chargeB","front1520"],notes:""},
  {id:4,name:"סופר אלגריה",permissions:["chargeA","chargeB","walking"],notes:"בבקרים מהלכים. בלילה/שבת אחראי"},
  {id:5,name:"אגבאריה אמיר",permissions:["chargeB","triage","walking"],notes:""},
  {id:6,name:"חמודה מקסים",permissions:["triage","walking","front815","bedB"],notes:""},
  {id:7,name:"הירש יעקובי ליאורה",permissions:["chargeA","chargeB","triage","walking","front1520"],notes:""},
  {id:8,name:"להב עינבר",permissions:["triage","walking","front1520","bedB"],notes:""},
  {id:9,name:"רג'ואן ג'ני",permissions:["triage","walking","front1520","front815","bedA","bedB"],notes:""},
  {id:10,name:"טל גליה",permissions:["chargeA","chargeB","triage","walking","bedA","bedB","front17"],notes:""},
  {id:11,name:"חן אילנה",permissions:["walking"],notes:"רק מהלכים"},
  {id:12,name:"וייס סיגל",permissions:["walking"],notes:""},
  {id:13,name:"אמיתי יעל",permissions:["chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:14,name:"כץ אירינה",permissions:["chargeA","chargeB","bedA","bedB","triage","front17"],notes:""},
  {id:15,name:"סונדרפן אוריאל חנניה",permissions:["chargeA","chargeB","bedA","bedB","walking","triage"],notes:"עדיפות אחרונה לאחריות"},
  {id:16,name:"גירון שרון",permissions:["chargeA","chargeB","triage","walking","bedA","bedB","front17"],notes:"עדיפות למיעוט אחריות"},
  {id:17,name:"סאוטה יערה אסתר",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:18,name:"גרינג ויקטוריה",permissions:["triage","walking"],notes:""},
  {id:19,name:"ניסנבוים נופר",permissions:["chargeA","chargeB","bedA","bedB","walking","triage"],notes:""},
  {id:20,name:"מלמד אילנה",permissions:["bedA","bedB","walking","triage"],notes:"עדיפות לשוכבים"},
  {id:21,name:"בנימין גל",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:22,name:"כהן נעמה",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:23,name:"ספיאל מונה",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:24,name:"דנילה ליזי",permissions:["bedA","bedB","walking","triage","chargeB"],notes:"לא אחראי ב כשיש אחר"},
  {id:25,name:"בלעום ריווא",permissions:["bedA","bedB","walking","triage"],notes:""},
  {id:26,name:"גוסלבסקי גלבר עדי",permissions:["bedA","bedB","triage","walking","chargeB"],notes:""},
  {id:27,name:"רשצ'יבינה ויאולטה",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:28,name:"אלפרוביץ' קרין",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:29,name:"לוביש-מאושר נעמה",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:30,name:"איבגי רונית",permissions:["chargeB","triage","walking","bedA","bedB"],notes:""},
  {id:31,name:"כהן נטע",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:32,name:"חאסקיה ביין",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:33,name:"דחבש נעמה",permissions:["chargeB","triage","walking","bedA","bedB","front17"],notes:""},
  {id:34,name:"מילוא איה זוריה",permissions:["chargeB","triage","walking","bedA","bedB","front17"],notes:""},
  {id:35,name:"פרי נוריאל עמרי",permissions:["bedA","bedB","walking"],notes:""},
  {id:36,name:"גזית פורטל מאי בטי",permissions:["bedA","bedB","walking"],notes:""},
  {id:37,name:"גלוחובסקי ניקול",permissions:["chargeA","chargeB","bedA","bedB","walking","triage","front17"],notes:""},
  {id:38,name:"מנסור דימה",permissions:["bedA","bedB","walking","triage"],notes:""},
  {id:39,name:"זרקו מירי",permissions:["bedA","bedB","walking","triage","chargeB","front17"],notes:""},
  {id:40,name:"ניר יוליה",permissions:["bedA","bedB","walking","triage","chargeB","front17"],notes:""},
  {id:41,name:"חנן מאי",permissions:["bedA","bedB","walking"],notes:""},
  {id:42,name:"מרגלית אילה",permissions:["bedA","bedB","walking"],notes:""},
  {id:43,name:"סבן נעמה",permissions:["chargeB","front17","bedA","bedB","walking"],notes:""},
  {id:44,name:"זבולון מירי",permissions:["chargeB","front17","bedA","bedB","walking","triage"],notes:""},
  {id:45,name:"פרגאמנט ולריה מעיין",permissions:["bedA","bedB","walking","front17"],notes:"1-7 רק אם אין אחר"},
  {id:46,name:"שפרה מירון",permissions:["walking","bedA","bedB"],notes:""},
  {id:47,name:"הדס כהן",permissions:["walking","bedA","bedB","front17"],notes:""},
  {id:48,name:"איתמר כהן",permissions:["bedA","bedB","walking"],notes:""},
  {id:49,name:"אביגיל ג'יקובס",permissions:["bedA","bedB","walking","front17","triage"],notes:""},
  {id:50,name:"עבדאללה מרעי",permissions:["bedA","bedB","walking","triage"],notes:""},
  {id:51,name:"עידן שירה נחמן",permissions:["bedA","bedB","walking","front17"],notes:""},
  {id:52,name:"עידו ברעם",permissions:["bedA","bedB","walking"],notes:""},
  {id:53,name:"פוחוביצקי אבינועם",permissions:["bedA","bedB","walking"],notes:""},
  {id:54,name:"קניגסברג אמיר",permissions:["bedA","bedB","walking"],notes:""},
  {id:55,name:"ורדית הלוי",permissions:["bedA","bedB","walking"],notes:""},
  {id:56,name:"תומר דיין",permissions:["bedA","bedB","walking"],notes:""},
  {id:57,name:"אביגיל גולדבלט",permissions:["bedA","bedB","walking"],notes:""},
  {id:58,name:"פלד אוסנת",permissions:["bedA","bedB","walking"],notes:""},
  {id:59,name:"דימה בסקין",permissions:["bedA","bedB","walking"],notes:""},
  {id:60,name:"אדינה חסן",permissions:["chargeB","front17","triage","bedA","bedB","walking"],notes:""},
  {id:61,name:"מזל דז'רייב",permissions:["bedA","bedB","walking"],notes:""},
  {id:62,name:"דנה שוסמן",permissions:["bedA","bedB","walking"],notes:""},
  {id:63,name:"סולסקי יעל",permissions:["bedA","bedB","walking"],notes:""},
  {id:64,name:"שני פקטור",permissions:["bedA","bedB","walking"],notes:""},
  {id:65,name:"שון מרכוס",permissions:["bedA","bedB","walking"],notes:""},
  {id:66,name:"מריה פורטנוי",permissions:["bedA","bedB","walking"],notes:""},
  {id:67,name:"שלמה שלזינגר",permissions:["walking","bedB"],notes:"שוכבים רק באגף ב"},
  {id:68,name:"חני קראוס",permissions:["bedA","bedB","walking"],notes:""},
  {id:69,name:"עבד אל סתאר גבארה",permissions:["bedA","bedB","walking"],notes:""},
  {id:70,name:"ירין גרמה",permissions:["bedA","bedB","walking"],notes:""},
  {id:71,name:"שיראל יוסופוב",permissions:["bedA","bedB","walking"],notes:""},
  {id:72,name:"צבי מרדכי עמיר",permissions:["bedA","bedB","walking"],notes:""},
  {id:73,name:"מתן משולם",permissions:["bedA","bedB"],notes:"בחניכה – מוצמד לקרין אלפרוביץ'"},
  {id:74,name:"מעיין מוקדי",permissions:["bedA","bedB","walking"],notes:""},
  {id:75,name:"תמר אוסטרי",permissions:["bedA","bedB"],notes:"בחניכה – מוצמדת ליוליה ניר"},
  {id:76,name:"דמארי יסכה",permissions:["walking"],notes:"צוות 1 או אורתופדיה אם 13 צוות. אחרת צוות 2-3"},
  {id:77,name:"הוניג שיליאן קרן קטה",permissions:["bedA","bedB","walking","chargeB","triage"],notes:"עדיפות לא אחראי/טריאז"},
  {id:78,name:"אמתי נועה",permissions:["bedA","bedB","chargeA","chargeB"],notes:""},
  {id:79,name:"שפירא קרן",permissions:["bedA","bedB"],notes:"עדיפות מיטות 8-14"},
  {id:80,name:"אלמוג קלמן",permissions:["bedA","bedB","walking"],notes:""},
  {id:81,name:"אניטה סטוליארוב",permissions:["student"],notes:"סטודנטית"},
  {id:82,name:"שמואלי שירה",permissions:["student"],notes:"סטודנטית"},
  {id:83,name:"אריקה קרנר",permissions:["student"],notes:"סטודנטית"},
  {id:84,name:"הילה גוטמן",permissions:["student"],notes:"סטודנטית"},
  {id:85,name:"אודיה זכריה",permissions:["student"],notes:"סטודנטית"},
  {id:86,name:"הדס שהואט",permissions:["student"],notes:"סטודנטית"},
  {id:87,name:"ליאן ברגיל",permissions:["student"],notes:"סטודנטית"},
  {id:88,name:"נינה איגנטנקו",permissions:["student"],notes:"סטודנטית"},
  {id:89,name:"נועה יפה בנימיני",permissions:["student"],notes:"סטודנטית"},
];

async function callClaude(messages, maxTokens=2500) {
  const res = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,messages})
  });
  if(!res.ok){const t=await res.text();let m=`שגיאה ${res.status}`;try{m=JSON.parse(t).error?.message||m;}catch(e){}throw new Error(m);}
  const d=await res.json();
  if(!d.content)throw new Error("תגובה ריקה");
  return d.content.map(i=>i.text||"").join("");
}

function parseJSON(raw){
  const c=raw.replace(/```json|```/g,"").trim();
  try{return JSON.parse(c);}catch(e){const m=c.match(/\{[\s\S]*\}/);if(m)return JSON.parse(m[0]);throw new Error("שגיאת פרסור JSON");}
}

function Toast({msg,type}){
  if(!msg)return null;
  return <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",
    background:type==="success"?C.green:type==="error"?C.red:C.primary,
    color:"#fff",padding:"10px 24px",borderRadius:20,fontSize:"0.88rem",fontWeight:600,
    zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>{msg}</div>;
}

function Spinner({text}){
  return <div style={{position:"fixed",inset:0,background:"rgba(255,255,255,0.93)",zIndex:999,
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{width:52,height:52,border:`4px solid ${C.lightGray}`,borderTopColor:C.primary,
      borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    <div style={{fontSize:"1rem",fontWeight:600,color:C.primary,textAlign:"center",maxWidth:260,padding:"0 20px"}}>{text}</div>
  </div>;
}

function Card({children,style}){
  return <div style={{background:C.white,borderRadius:12,boxShadow:"0 2px 12px rgba(0,0,0,0.08)",
    padding:18,marginBottom:14,...style}}>{children}</div>;
}

function Btn({children,onClick,color="primary",disabled,style,small}){
  const bg=color==="accent"?C.accent:color==="outline"?"transparent":C.primary;
  return <button onClick={onClick} disabled={disabled} style={{
    padding:small?"7px 13px":"11px 18px",background:bg,
    color:color==="outline"?C.primary:"#fff",
    border:color==="outline"?`1.5px solid ${C.primary}`:"none",
    borderRadius:9,fontFamily:"inherit",fontSize:small?"0.8rem":"0.9rem",fontWeight:700,
    cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,
    display:"flex",alignItems:"center",gap:6,...style}}>{children}</button>;
}

function StaffSlot({worker,shiftKey,onSick,onDragStart,onDrop}){
  const[hover,setHover]=useState(false);
  const[over,setOver]=useState(false);
  const empty=!worker.name;
  return <div
    draggable={!empty&&!worker.sick}
    onDragStart={()=>onDragStart&&onDragStart(worker,shiftKey)}
    onDragOver={e=>{e.preventDefault();setOver(true);}}
    onDragLeave={()=>setOver(false)}
    onDrop={e=>{e.preventDefault();setOver(false);onDrop&&onDrop(worker,shiftKey);}}
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:7,marginBottom:3,
      border:`1px ${over?"dashed":"solid"} ${over?C.accent:hover&&!empty?C.morningBorder:C.lightGray}`,
      background:over?"#fff3ef":hover&&!empty?C.morningBg:empty?"#f9f9f9":"#fafafa",
      cursor:empty||worker.sick?"default":"grab",minHeight:30,
      opacity:worker.sick?0.5:1,textDecoration:worker.sick?"line-through":"none"}}>
    <span style={{flex:1,fontSize:"0.8rem",fontWeight:500}}>
      {empty?"— פנוי —":worker.name+(worker.sick?" מ׳":"")}
    </span>
    {worker.time&&<span style={{fontSize:"0.64rem",color:C.gray,whiteSpace:"nowrap"}}>{worker.time}</span>}
    {worker.note&&<span style={{fontSize:"0.64rem",background:C.eveningBg,color:C.eveningBorder,borderRadius:4,padding:"1px 5px"}}>{worker.note}</span>}
    {!empty&&!worker.sick&&hover&&
      <button onClick={e=>{e.stopPropagation();onSick&&onSick(worker.name,shiftKey);}}
        style={{background:"none",border:"none",cursor:"pointer",fontSize:"0.75rem",color:C.red,padding:2}}>🤒</button>}
  </div>;
}

function ShiftCol({shiftKey,workers,onSick,onDragStart,onDrop}){
  const meta={
    morning:{label:"☀️ בוקר",time:"07:00–15:00",color:C.morningBorder},
    evening:{label:"🌆 ערב",time:"15:00–23:00",color:C.eveningBorder},
    night:{label:"🌙 לילה",time:"23:00–07:00",color:C.nightBorder},
  }[shiftKey];
  const groups={};
  (workers||[]).forEach(w=>{const r=w.role||"אחר";if(!groups[r])groups[r]=[];groups[r].push(w);});
  const roles=[...ROLE_ORDER.filter(r=>groups[r]),...Object.keys(groups).filter(r=>!ROLE_ORDER.includes(r))];
  return <div style={{borderRadius:10,overflow:"hidden",border:`1.5px solid ${meta.color}`,flex:1,minWidth:0}}>
    <div style={{background:meta.color,color:"#fff",padding:"8px 12px",fontWeight:700,fontSize:"0.82rem"}}>
      {meta.label}<br/><span style={{fontSize:"0.7rem",fontWeight:400}}>{meta.time}</span>
    </div>
    <div style={{padding:6,background:"#fff"}}>
      {roles.length===0
        ?<div style={{textAlign:"center",padding:20,color:"#9ca3af",fontSize:"0.8rem"}}>אין עובדים</div>
        :roles.map(role=><div key={role} style={{marginBottom:8}}>
          <div style={{fontSize:"0.67rem",fontWeight:700,color:C.gray,padding:"2px 6px",background:C.bg,borderRadius:4,marginBottom:3}}>{role}</div>
          {groups[role].map((w,i)=><StaffSlot key={i} worker={w} shiftKey={shiftKey} onSick={onSick} onDragStart={onDragStart} onDrop={onDrop}/>)}
        </div>)
      }
    </div>
  </div>;
}

export default function App(){
  const[tab,setTab]=useState("upload");
  const[files,setFiles]=useState([]);
  const[date,setDate]=useState(new Date().toISOString().slice(0,10));
  const[dayType,setDayType]=useState("weekday");
  const[notes,setNotes]=useState("");
  const[dragZone,setDragZone]=useState(false);
  const fileRef=useRef();
  const[schedule,setSchedule]=useState(null);
  const[dragSrc,setDragSrc]=useState(null);
  const[log,setLog]=useState([]);
  const[swapText,setSwapText]=useState("");
  const[sickKey,setSickKey]=useState("");
  const[extraWorkers,setExtraWorkers]=useState([]);
  const[newName,setNewName]=useState("");
  const[newNotes,setNewNotes]=useState("");
  const[newPerms,setNewPerms]=useState([]);
  const[jsonInput,setJsonInput]=useState("");
  const[jsonError,setJsonError]=useState("");

  const loadJson=()=>{
    setJsonError("");
    try{
      const clean=jsonInput.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      if(!parsed.morning&&!parsed.evening&&!parsed.night)throw new Error("חסרות משמרות בוקר/ערב/לילה");
      setSchedule(parsed);
      setJsonInput("");
      setTab("schedule");
      showToast("השיבוץ נטען! ✓","success");
    }catch(e){
      setJsonError("JSON לא תקין: "+e.message);
    }
  };
  const[loading,setLoading]=useState(false);
  const[loadTxt,setLoadTxt]=useState("");
  const[toast,setToast]=useState({msg:"",type:""});

  const allWorkers=[...DEFAULT_WORKERS,...extraWorkers];
  const showToast=(msg,type="")=>{setToast({msg,type});setTimeout(()=>setToast({msg:"",type:""}),3500);};
  const addLog=(text)=>setLog(prev=>[{text,time:new Date().toLocaleTimeString("he-IL")},...prev]);

  const handleFiles=fs=>{
    Array.from(fs).forEach(file=>{
      if(files.find(f=>f.name===file.name)){showToast(`${file.name} כבר הועלה`,"error");return;}
      const r=new FileReader();
      r.onload=e=>setFiles(prev=>[...prev,{
        id:Date.now()+Math.random(),file,name:file.name,size:file.size,
        base64:e.target.result,mimeType:file.type||"application/pdf",
        isImage:file.type.startsWith("image/"),isPDF:file.type==="application/pdf"
      }]);
      r.readAsDataURL(file);
      showToast(`${file.name} הועלה ✓`,"success");
    });
  };

  const analyze=async()=>{
    if(!files.length){showToast("העלי קבצים קודם","error");return;}
    setLoading(true);
    try{
      const dateObj=new Date(date);
      const dayName=DAY_NAMES[dateObj.getDay()];
      const dayTypeHe={weekday:"ראשון-חמישי",friday:"שישי",saturday:"שבת",holiday:"חג"}[dayType];
      const workersStr=allWorkers.map(w=>`${w.name}: ${(w.permissions||[]).map(p=>PERM_LABELS[p]||p).join(", ")}${w.notes?" ("+w.notes+")":""}`).join("\n");

      // Build content parts
      setLoadTxt("מכין קבצים...");
      const parts=[];
      for(const f of files){
        const b64=f.base64.split(",")[1];
        if(f.isImage){
          const comp=await new Promise(res=>{
            const img=new Image();
            img.onload=()=>{
              const MAX=1000;let w=img.width,h=img.height;
              if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}
              if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}
              const cv=document.createElement("canvas");cv.width=w;cv.height=h;
              cv.getContext("2d").drawImage(img,0,0,w,h);
              res(cv.toDataURL("image/jpeg",0.7).split(",")[1]);
            };
            img.onerror=()=>res(b64);img.src=f.base64;
          });
          parts.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:comp}});
        } else if(f.isPDF){
          parts.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}});
        }
      }

      // Step 1: extract who works
      setLoadTxt(`שלב 1/2: קורא את הסידור ליום ${dayName}...`);
      const p1=[...parts,{type:"text",text:`חלץ עובדים ביום ${dayName} (${date}).
חוקים: תא ריק/חופש/לימודים/יום בחירה/סידור עבודה = לא עובד, התעלם. "שע"=ערב, "של"=לילה, "7-15"=בוקר.
11-19=בוקר מ11+ערב. 10-18=בוקר מ10+ערב. 7-19=בוקר+ערב. 19-7=ערב מ19+לילה. 11-23=בוקר מ11+ערב מלא.
החזר JSON בלבד: {"morning":["שם"],"evening":["שם"],"night":["שם"],"special":[{"name":"שם","shifts":["morning","evening"],"time":"11:00","note":"מ-11"}]}`}];
      const r1=await callClaude([{role:"user",content:p1}],1500);
      const s1=parseJSON(r1);

      // Step 2: assign roles
      setLoadTxt("שלב 2/2: משבץ לפי הרשאות...");
      const mW=[...(s1.morning||[]),...(s1.special||[]).filter(x=>x.shifts?.includes("morning")).map(x=>x.name)];
      const eW=[...(s1.evening||[]),...(s1.special||[]).filter(x=>x.shifts?.includes("evening")).map(x=>x.name)];
      const nW=[...(s1.night||[]),...(s1.special||[]).filter(x=>x.shifts?.includes("night")).map(x=>x.name)];

      const p2=`יום: ${dayName} | ${dayTypeHe} | ${date}\nהערות: ${notes||"אין"}\n\nרשימת עובדים והרשאות:\n${workersStr}\n\nעובדים ביום זה:\nבוקר: ${mW.join(", ")||"אין"}\nערב: ${eW.join(", ")||"אין"}\nלילה: ${nW.join(", ")||"אין"}\nמיוחדים: ${JSON.stringify(s1.special||[])}\n\n${SCHEDULING_RULES}\n\nהחזר JSON בלבד:\n{"morning":[{"name":"שם","role":"תפקיד","time":"07:00-15:00","note":""}],"evening":[...],"night":[]}\nתפקידים: "אחראי א","אחראי ב","טריאז","מהלכים","אורתופדיה","שוכבים א","מיטות קדמיות","שוכבים ב","סטודנט"`;
      const r2=await callClaude([{role:"user",content:p2}],2500);
      const result=parseJSON(r2);

      setSchedule(result);
      setTab("schedule");
      showToast("השיבוץ נוצר! ✓","success");
    }catch(err){console.error(err);showToast("שגיאה: "+err.message,"error");}
    finally{setLoading(false);}
  };

  const markSick=(name,shiftKey)=>{
    setSchedule(prev=>{const n=JSON.parse(JSON.stringify(prev));const w=(n[shiftKey]||[]).find(ww=>ww.name===name);if(w)w.sick=true;return n;});
    addLog(`😷 ${name} – מחלה (${shiftHe(shiftKey)})`);showToast(`${name} סומן/ה כמחלה`,"error");
  };

  const handleDragStart=(worker,shiftKey)=>setDragSrc({worker,shiftKey});
  const handleDrop=(dst,dstShift)=>{
    if(!dragSrc)return;
    const{worker:src,shiftKey:srcShift}=dragSrc;
    setSchedule(prev=>{
      const n=JSON.parse(JSON.stringify(prev));
      const sa=n[srcShift]||[],da=n[dstShift]||[];
      const si=sa.findIndex(w=>w.name===src.name&&w.role===src.role);
      const di=da.findIndex(w=>w.name===dst.name&&w.role===dst.role);
      if(si===-1)return n;
      if(di!==-1){const t=sa[si].name;sa[si].name=da[di].name;da[di].name=t;}
      return n;
    });
    addLog(`↔️ ${src.name} ↔ ${dst.name||"פנוי"}`);
    showToast("שינוי בוצע ✓","success");setDragSrc(null);
  };

  const processSwap=async()=>{
    if(!swapText.trim()||!schedule)return;
    setLoading(true);setLoadTxt("מעבד החלפה...");
    try{
      const raw=await callClaude([{role:"user",content:`סידור:\n${JSON.stringify(schedule)}\nבקשה: "${swapText}"\nעדכן. החזר JSON בלבד.`}],1500);
      const p=parseJSON(raw);if(p.error){showToast(p.error,"error");return;}
      setSchedule(p);addLog(`💬 "${swapText}"`);setSwapText("");setTab("schedule");showToast("בוצע ✓","success");
    }catch(err){showToast("שגיאה: "+err.message,"error");}
    finally{setLoading(false);}
  };

  const printSchedule=()=>{
    if(!schedule)return;
    const d=new Date(date);
    const ds=`יום ${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${HE_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const get=(sh,r)=>(schedule[sh]||[]).filter(w=>w.role===r).map(w=>w.sick?`${w.name} מ׳`:w.name||"–").join(", ")||"–";
    const win=window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>סידור</title>
    <style>body{font-family:Arial;direction:rtl;padding:24px;font-size:11pt}h1{text-align:center;color:#1a3a5c}
    .sub{text-align:center;color:#666;font-size:10pt;margin-bottom:16px}
    table{width:100%;border-collapse:collapse}th{background:#1a3a5c;color:#fff;padding:8px;text-align:center}
    td{padding:6px 10px;border:1px solid #ddd;vertical-align:top}tr:nth-child(even) td{background:#f7f9fc}
    .r{font-weight:700;color:#1a3a5c;background:#eef2ff!important}
    .footer{margin-top:16px;font-size:8pt;color:#888;border-top:1px solid #eee;padding-top:8px}
    </style></head><body>
    <h1>סידור עבודה יומי – מיון וחירום</h1>
    <div class="sub">${ds}${notes?" | "+notes:""}</div>
    <table><thead><tr><th>תפקיד</th><th>☀️ בוקר</th><th>🌆 ערב</th><th>🌙 לילה</th></tr></thead><tbody>
    ${ROLE_ORDER.map(r=>{const m=get("morning",r),e=get("evening",r),n=get("night",r);
      if(m==="–"&&e==="–"&&n==="–")return"";
      return`<tr><td class="r">${r}</td><td>${m}</td><td>${e}</td><td>${n}</td></tr>`;}).join("")}
    </tbody></table>
    ${log.length?`<div class="footer"><b>יומן שינויים:</b><br>${log.map(l=>`${l.time} – ${l.text}`).join("<br>")}</div>`:""}
    <script>setTimeout(()=>window.print(),400);<\/script></body></html>`);
    win.document.close();
  };

  const statCount=s=>(schedule?.[s]||[]).filter(w=>w.name&&!w.sick).length;
  const swWorkers=schedule?["morning","evening","night"].flatMap(s=>(schedule[s]||[]).filter(w=>w.name).map(w=>({key:`${w.name}|${s}`,label:`${w.name} (${shiftHe(s)})`})))  :[];

  const iS={padding:"9px 12px",border:`1.5px solid ${C.lightGray}`,borderRadius:8,fontFamily:"inherit",fontSize:"0.88rem",outline:"none",width:"100%"};
  const lS={fontSize:"0.78rem",fontWeight:600,color:C.gray,display:"block",marginBottom:5};
  const tS=t=>({flex:1,padding:"10px 5px",background:"none",border:"none",
    borderBottom:tab===t?`3px solid ${C.accent}`:"3px solid transparent",
    color:tab===t?"#fff":"rgba(255,255,255,0.6)",
    fontFamily:"inherit",fontSize:"0.75rem",fontWeight:600,cursor:"pointer",textAlign:"center"});

  return(
    <div style={{fontFamily:"Arial,sans-serif",background:C.bg,minHeight:"100vh",direction:"rtl",color:"#1f2937"}}>
      {loading&&<Spinner text={loadTxt}/>}
      <Toast msg={toast.msg} type={toast.type}/>

      <div style={{background:C.primary,color:"#fff",padding:"14px 18px",display:"flex",alignItems:"center",gap:12,
        position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 16px rgba(0,0,0,0.2)"}}>
        <span style={{fontSize:"1.5rem"}}>🏥</span>
        <div>
          <div style={{fontWeight:800,fontSize:"1.05rem"}}>סידור עבודה יומי</div>
          <div style={{fontSize:"0.72rem",opacity:0.7}}>מיון וחירום – בילינסון-השרון</div>
        </div>
      </div>

      <div style={{background:C.primary,display:"flex",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
        {[["upload","📤 העלאה"],["schedule","📋 שיבוץ"],["workers","👥 עובדים"],["swaps","🔄 החלפות"],["oncall","📞 כוננות"]].map(([t,l])=>
          <button key={t} style={tS(t)} onClick={()=>setTab(t)}>{l}</button>)}
      </div>

      <div style={{padding:14}}>

        {tab==="upload"&&<>
          <Card>
            <div style={{fontWeight:700,color:C.primary,marginBottom:12,fontSize:"0.9rem"}}>📅 פרטי יום השיבוץ</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div><label style={lS}>תאריך</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={iS}/></div>
              <div><label style={lS}>סוג יום</label>
                <select value={dayType} onChange={e=>setDayType(e.target.value)} style={iS}>
                  <option value="weekday">ראשון–חמישי</option>
                  <option value="friday">שישי</option>
                  <option value="saturday">שבת</option>
                  <option value="holiday">חג</option>
                </select></div>
            </div>
            <div style={{background:"#fffdf0",border:"1.5px solid #f0c060",borderRadius:10,padding:12}}>
              <div style={{fontWeight:700,color:"#92600a",marginBottom:6,fontSize:"0.85rem"}}>📌 הערות / חגים / דגשים</div>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="לדוגמה: שישי ערב פסח..."
                style={{...iS,height:56,resize:"none",background:"transparent",border:"1.5px solid #f0c060"}}/>
            </div>
          </Card>

          <Card>
            <div style={{fontWeight:700,color:C.primary,marginBottom:10,fontSize:"0.9rem"}}>📤 העלאת סידור שבועי</div>
            <div
              onDragOver={e=>{e.preventDefault();setDragZone(true);}}
              onDragLeave={()=>setDragZone(false)}
              onDrop={e=>{e.preventDefault();setDragZone(false);handleFiles(e.dataTransfer.files);}}
              onClick={()=>fileRef.current.click()}
              style={{border:`2px dashed ${dragZone?C.morningBorder:C.lightGray}`,borderRadius:10,
                padding:"28px 16px",textAlign:"center",cursor:"pointer",background:dragZone?C.morningBg:"#fafafa"}}>
              <div style={{fontSize:"2rem",marginBottom:6}}>📄</div>
              <div style={{fontWeight:700,color:C.primary,fontSize:"0.9rem"}}>לחץ להעלאת קבצים</div>
              <div style={{fontSize:"0.78rem",color:C.gray,marginTop:4}}>PDF או תמונות – כל עמודי הסידור</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf,application/pdf" multiple
              onChange={e=>handleFiles(e.target.files)} style={{display:"none"}}/>
            {files.length>0&&<div style={{marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{background:C.morningBg,color:C.morningBorder,borderRadius:20,padding:"3px 10px",fontSize:"0.75rem",fontWeight:700}}>
                  📎 {files.length} קבצים
                </span>
                <button onClick={()=>setFiles([])} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:"0.8rem",fontWeight:600}}>הסר הכל</button>
              </div>
              {files.map(f=>(
                <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,background:C.morningBg,
                  border:`1.5px solid ${C.morningBorder}`,borderRadius:8,padding:"7px 10px",marginBottom:5}}>
                  <span style={{fontSize:"1.4rem"}}>{f.isPDF?"📑":"🖼️"}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.8rem",fontWeight:500,color:C.primary,wordBreak:"break-all"}}>{f.name}</div>
                    <div style={{fontSize:"0.68rem",color:C.gray}}>{(f.size/1024).toFixed(0)} KB</div>
                  </div>
                  <button onClick={()=>setFiles(prev=>prev.filter(x=>x.id!==f.id))}
                    style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:"1rem"}}>✕</button>
                </div>
              ))}
            </div>}
          </Card>

          <Btn onClick={analyze} disabled={!files.length} style={{width:"100%",justifyContent:"center",padding:13,fontSize:"0.95rem"}}>
            🤖 נתח סידור ושבץ אוטומטית
          </Btn>
        </>}

        {tab==="schedule"&&<>
          {!schedule
            ?<div style={{textAlign:"center",padding:"40px 20px",color:C.gray}}>
              <div style={{fontSize:"3rem",marginBottom:12}}>📋</div>
              <p>עדיין לא נוצר שיבוץ.<br/>עבור ל<strong>העלאה</strong>.</p>
            </div>
            :<>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:12}}>
                <div>
                  <div style={{fontWeight:700,fontSize:"1rem",color:C.primary}}>
                    {(()=>{const d=new Date(date);return`יום ${DAY_NAMES[d.getDay()]} | ${d.getDate()} ${HE_MONTHS[d.getMonth()]} ${d.getFullYear()}`;})()}
                  </div>
                  <span style={{fontSize:"0.72rem",padding:"2px 8px",borderRadius:20,fontWeight:600,marginTop:4,display:"inline-block",
                    background:{weekday:C.morningBg,friday:C.eveningBg,saturday:C.eveningBg,holiday:"#fce4ec"}[dayType],
                    color:{weekday:C.morningBorder,friday:C.eveningBorder,saturday:C.eveningBorder,holiday:C.red}[dayType]}}>
                    {{weekday:"ראשון–חמישי",friday:"שישי",saturday:"שבת",holiday:"חג"}[dayType]}
                  </span>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <Btn onClick={printSchedule} color="outline" small>🖨️ PDF</Btn>
                  <Btn onClick={printSchedule} color="accent" small>✅ אישור</Btn>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[["morning","☀️ בוקר"],["evening","🌆 ערב"],["night","🌙 לילה"]].map(([s,l])=>(
                  <div key={s} style={{background:C.white,borderRadius:8,padding:10,textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.07)"}}>
                    <div style={{fontSize:"1.5rem",fontWeight:800,color:C.primary}}>{statCount(s)}</div>
                    <div style={{fontSize:"0.7rem",color:C.gray,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"flex",gap:8,marginBottom:12}}>
                {["morning","evening","night"].map(s=>(
                  <ShiftCol key={s} shiftKey={s} workers={schedule[s]}
                    onSick={markSick} onDragStart={handleDragStart} onDrop={handleDrop}/>
                ))}
              </div>

              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>{if(confirm("לאפס שיבוץ?"))setSchedule(null);}} color="outline" small>🔄 איפוס</Btn>
                <Btn onClick={()=>setTab("swaps")} color="outline" small>↔️ החלפות</Btn>
              </div>
            </>}
        </>}

        {tab==="workers"&&<>
          <Card>
            <div style={{fontWeight:700,color:C.primary,marginBottom:4,fontSize:"0.9rem"}}>👥 רשימת עובדים ({allWorkers.length})</div>
            <div style={{fontSize:"0.75rem",color:C.gray,marginBottom:10}}>נטען מהקובץ. ניתן להוסיף עובדים נוספים.</div>
            <div style={{maxHeight:380,overflowY:"auto",marginBottom:12}}>
              {allWorkers.map(w=>(
                <div key={w.id} style={{padding:"7px 10px",background:C.white,borderRadius:8,marginBottom:5,border:`1.5px solid ${C.lightGray}`}}>
                  <div style={{fontWeight:600,fontSize:"0.85rem",marginBottom:3}}>{w.name}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:w.notes?3:0}}>
                    {(w.permissions||[]).map(p=>{const col=PERM_COLORS[p]||{bg:"#e3f2fd",c:"#1565c0"};
                      return<span key={p} style={{fontSize:"0.65rem",padding:"1px 6px",borderRadius:10,fontWeight:600,background:col.bg,color:col.c}}>{PERM_LABELS[p]||p}</span>;
                    })}
                  </div>
                  {w.notes&&<div style={{fontSize:"0.7rem",color:C.gray,fontStyle:"italic"}}>{w.notes}</div>}
                </div>
              ))}
            </div>
            <div style={{background:"#f8faff",border:`1.5px dashed ${C.lightGray}`,borderRadius:10,padding:12}}>
              <div style={{fontWeight:700,fontSize:"0.82rem",color:C.primary,marginBottom:8}}>➕ הוספת עובד/ת</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <div><label style={lS}>שם</label><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="שם מלא" style={iS}/></div>
                <div><label style={lS}>הערות</label><input value={newNotes} onChange={e=>setNewNotes(e.target.value)} placeholder="הגבלות" style={iS}/></div>
              </div>
              <div style={{marginBottom:10}}>
                <label style={lS}>הרשאות</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {Object.entries(PERM_LABELS).map(([v,l])=>(
                    <label key={v} style={{cursor:"pointer",padding:"3px 9px",borderRadius:14,fontSize:"0.78rem",fontWeight:600,
                      background:newPerms.includes(v)?(PERM_COLORS[v]?.bg||"#e3f2fd"):"#f5f5f5",
                      border:`1px solid ${newPerms.includes(v)?(PERM_COLORS[v]?.c||C.primary):C.lightGray}`,
                      color:newPerms.includes(v)?(PERM_COLORS[v]?.c||C.primary):"#888"}}>
                      <input type="checkbox" style={{display:"none"}} checked={newPerms.includes(v)}
                        onChange={()=>setNewPerms(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v])}/>{l}
                    </label>
                  ))}
                </div>
              </div>
              <Btn onClick={()=>{
                if(!newName.trim()){showToast("הכנס שם","error");return;}
                setExtraWorkers(prev=>[...prev,{id:Date.now(),name:newName.trim(),permissions:newPerms,notes:newNotes}]);
                setNewName("");setNewNotes("");setNewPerms([]);showToast("נוסף ✓","success");
              }} style={{width:"100%",justifyContent:"center"}}>➕ הוסף</Btn>
            </div>
          </Card>
        </>}

        {tab==="swaps"&&<>
          <Card>
            <div style={{fontWeight:700,color:C.primary,marginBottom:8,fontSize:"0.9rem"}}>🔄 רישום החלפה</div>
            <p style={{fontSize:"0.82rem",color:C.gray,marginBottom:10}}>כתוב/י בשפה חופשית:<br/><em>"אוריאל החליף שני ערב בשלישי בוקר"</em></p>
            <textarea value={swapText} onChange={e=>setSwapText(e.target.value)} placeholder="תאר/י את ההחלפה..."
              style={{...iS,height:74,resize:"none",marginBottom:10}}/>
            <Btn onClick={processSwap} style={{width:"100%",justifyContent:"center"}}>🤖 בצע החלפה</Btn>
          </Card>

          <Card>
            <div style={{fontWeight:700,color:C.primary,marginBottom:8,fontSize:"0.9rem"}}>😷 דיווח מחלה</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"flex-end"}}>
              <div><label style={lS}>בחר/י עובד/ת</label>
                <select value={sickKey} onChange={e=>setSickKey(e.target.value)} style={iS}>
                  <option value="">-- בחר/י --</option>
                  {swWorkers.map(w=><option key={w.key} value={w.key}>{w.label}</option>)}
                </select></div>
              <Btn onClick={()=>{if(!sickKey){showToast("בחר/י","error");return;}const[n,s]=sickKey.split("|");markSick(n,s);setSickKey("");}}>🤒 סמן</Btn>
            </div>
          </Card>

          <Card>
            <div style={{fontWeight:700,color:C.primary,marginBottom:8,fontSize:"0.9rem"}}>📜 יומן שינויים</div>
            {log.length===0
              ?<div style={{textAlign:"center",padding:16,color:C.gray,fontSize:"0.85rem"}}>אין שינויים.</div>
              :log.map((l,i)=><div key={i} style={{fontSize:"0.78rem",padding:"5px 8px",background:C.white,
                borderRadius:6,marginBottom:4,borderRight:`3px solid ${C.nightBorder}`}}>
                <strong>{l.time}</strong> – {l.text}</div>)
            }
          </Card>
        </>}

        {tab==="oncall"&&
          <div style={{textAlign:"center",padding:"40px 20px",color:C.gray}}>
            <div style={{fontSize:"3rem",marginBottom:12}}>📞</div>
            <p><strong>לשונית כוננויות</strong><br/>תפתח בשלב הבא.</p>
          </div>
        }

      </div>
    </div>
  );
}
