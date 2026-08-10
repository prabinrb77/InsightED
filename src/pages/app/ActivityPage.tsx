import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBehaviourLogs, getStudents } from "../../lib/educatorStore";
import { supabase } from "../../lib/supabase";
import useCurrentSchool from "../../hooks/useCurrentSchool";
import useSession from "../../hooks/useSession";

type Activity = { id:string; title:string; date:string; period:string; student?:string; done:boolean };
const today = () => new Date().toISOString().slice(0,10);
const seeds: Activity[] = [
  {id:"arrival",title:"Arrival wellbeing check",date:today(),period:"8:30 AM",done:true},
  {id:"movement",title:"Whole-class movement break",date:today(),period:"10:30 AM",done:false},
  {id:"visual",title:"Prepare visual transition cards",date:today(),period:"Before lunch",student:"Maya Reid",done:false},
  {id:"reflection",title:"End-of-day student reflection",date:today(),period:"3:00 PM",done:false},
];

export default function ActivityPage() {
  const session=useSession(); const {school,isDemo}=useCurrentSchool();
  const [items,setItems]=useState<Activity[]>([]); const [error,setError]=useState<string|null>(null);
  const logs=getBehaviourLogs(); const students=getStudents();
  useEffect(()=>{ if(!school)return; if(isDemo||!supabase){try{setItems(JSON.parse(localStorage.getItem(`mizanova.activities.${school.id}`)||"null")||seeds)}catch{setItems(seeds)};return;}
    supabase.from("planned_activities").select("id,title,activity_date,period,completed_at,students(first_name,last_name)").eq("school_id",school.id).order("activity_date").then(({data,error:e})=>{if(e)setError(e.message);else setItems((data??[]).map(r=>{const s=r.students as unknown as {first_name:string;last_name:string}|null;return{id:r.id,title:r.title,date:r.activity_date,period:r.period,student:s?`${s.first_name} ${s.last_name}`:undefined,done:Boolean(r.completed_at)}}))});
  },[school?.id,isDemo]);
  async function persist(next:Activity[], changed?:Activity, remove?:string){setItems(next);if(!school)return;if(isDemo||!supabase||!session){localStorage.setItem(`mizanova.activities.${school.id}`,JSON.stringify(next));return}if(remove){const{error:e}=await supabase.from("planned_activities").delete().eq("id",remove);if(e)setError(e.message);return}if(changed){const{error:e}=await supabase.from("planned_activities").upsert({id:changed.id,school_id:school.id,created_by:session.user.id,title:changed.title,activity_date:changed.date,period:changed.period,completed_at:changed.done?new Date().toISOString():null});if(e)setError(e.message)}}
  function add(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const item={id:crypto.randomUUID(),title:String(f.get("title")),date:String(f.get("date")),period:String(f.get("period")),done:false};void persist([...items,item],item);e.currentTarget.reset()}
  return <div className="px-4 py-8 md:px-8">
    <h1 className="text-3xl font-bold text-ink">Everyday activity</h1><p className="pt-1 text-sm text-muted">{school?.name} · plan routines, complete tasks, and retain behaviour context.</p>
    {isDemo&&<p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-xs text-amber-800">Demo activities are isolated to this school and browser.</p>}{error&&<p role="alert" className="mt-4 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={add} className="mt-6 grid gap-3 rounded-xl border border-line bg-white p-4 sm:grid-cols-[1fr_160px_150px_auto]">
      <input required name="title" placeholder="Plan an everyday activity" className="h-11 rounded-lg border border-line px-3"/><input required name="date" type="date" defaultValue={today()} className="h-11 rounded-lg border border-line px-3"/><input required name="period" placeholder="e.g. 10:30 AM" className="h-11 rounded-lg border border-line px-3"/><button className="rounded-lg bg-brand px-5 font-semibold text-white">Add</button>
    </form>
    <section className="mt-5 rounded-xl border border-line bg-white"><h2 className="border-b border-line p-4 font-bold text-ink">Planned activities</h2><ol className="divide-y divide-line">{items.map(item=><li key={item.id} className="flex items-center gap-4 p-4"><button onClick={()=>{const changed={...item,done:!item.done};void persist(items.map(x=>x.id===item.id?changed:x),changed)}} className={`size-8 rounded-full border-2 ${item.done?"border-teal bg-teal text-white":"border-line-strong"}`}>{item.done?"✓":""}</button><div className="flex-1"><p className={`font-semibold text-ink ${item.done?"line-through opacity-50":""}`}>{item.title}</p><p className="text-xs text-muted">{item.date} · {item.period}{item.student?` · ${item.student}`:""}</p></div><button onClick={()=>void persist(items.filter(x=>x.id!==item.id),undefined,item.id)} className="text-sm font-semibold text-red-600">Remove</button></li>)}</ol></section>
    <section className="mt-6 rounded-xl border border-line bg-white"><h2 className="border-b border-line p-4 font-bold text-ink">Recent behaviour observations</h2>{logs.length?<ol className="divide-y divide-line">{logs.slice(0,5).map(log=><li key={log.id} className="p-4"><Link to={`/app/students/${log.studentId}`} className="font-semibold text-brand">{students.find(s=>s.id===log.studentId)?.full??"Student"}</Link><p className="text-sm text-slate">{log.behaviour} · {log.intensity}</p></li>)}</ol>:<p className="p-6 text-sm text-muted">No observations recorded yet. Planned routines above are ready to use.</p>}</section>
  </div>;
}
