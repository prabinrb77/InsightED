import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useCurrentSchool from "./useCurrentSchool";
import useSession from "./useSession";

export type ScheduleCategory = "Class" | "Support" | "Meeting" | "Personal";
export type ScheduleEvent = { id: string; title: string; date: string; start: string; end: string; category: ScheduleCategory; student?: string; notes?: string; done: boolean };
const keyFor = (schoolId: string) => `mizanova.schedule.${schoolId}.v2`;
const dayKey = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function seeds(): ScheduleEvent[] {
  const today = new Date();
  const at = (offset: number) => { const d = new Date(today); d.setDate(d.getDate() + offset); return dayKey(d); };
  return [
    { id:"welcome", title:"Morning check-in", date:at(0), start:"08:30", end:"09:00", category:"Class", done:true },
    { id:"literacy", title:"Literacy stations", date:at(0), start:"09:15", end:"10:15", category:"Class", done:false },
    { id:"sensory", title:"Sensory regulation break", date:at(0), start:"10:30", end:"10:50", category:"Support", student:"Maya Reid", done:false },
    { id:"family", title:"Family support call", date:at(1), start:"11:30", end:"12:00", category:"Meeting", student:"Ethan Miller", done:false },
    { id:"planning", title:"Learning support planning", date:at(2), start:"14:00", end:"15:00", category:"Meeting", done:false },
    { id:"reading", title:"Guided reading group", date:at(4), start:"10:00", end:"10:45", category:"Class", student:"Leo Marsh", done:false },
    { id:"prep", title:"Prepare visual supports", date:at(7), start:"08:00", end:"08:30", category:"Personal", done:false },
  ];
}

export default function useScheduleEvents() {
  const session = useSession(); const { school, isDemo } = useCurrentSchool();
  const [events, setEvents] = useState<ScheduleEvent[]>([]); const [error, setError] = useState<string|null>(null);
  const load = useCallback(async () => {
    if (!school) return;
    if (isDemo || !supabase) {
      try { setEvents(JSON.parse(localStorage.getItem(keyFor(school.id)) || "null") || seeds()); } catch { setEvents(seeds()); }
      return;
    }
    const { data, error: e } = await supabase.from("schedule_events").select("*").eq("school_id", school.id).order("starts_at");
    if (e) { setError(e.message); return; }
    setEvents((data ?? []).map(r => { const a=new Date(r.starts_at), b=new Date(r.ends_at); return { id:r.id,title:r.title,date:dayKey(a),start:a.toTimeString().slice(0,5),end:b.toTimeString().slice(0,5),category:r.category,student:undefined,notes:r.notes??undefined,done:Boolean(r.completed_at) }; }));
  }, [isDemo, school?.id]);
  useEffect(() => { void load(); }, [load]);
  const save = useCallback(async (next: ScheduleEvent[], changed?: ScheduleEvent, removedId?: string) => {
    setEvents(next); if (!school) return;
    if (isDemo || !supabase || !session) { localStorage.setItem(keyFor(school.id), JSON.stringify(next)); return; }
    if (removedId) { const { error:e }=await supabase.from("schedule_events").delete().eq("id",removedId); if(e)setError(e.message); return; }
    if (changed) { const payload={id:changed.id,school_id:school.id,created_by:session.user.id,title:changed.title,category:changed.category,starts_at:`${changed.date}T${changed.start}:00`,ends_at:`${changed.date}T${changed.end}:00`,notes:changed.notes??null,completed_at:changed.done?new Date().toISOString():null}; const {error:e}=await supabase.from("schedule_events").upsert(payload); if(e)setError(e.message); }
  }, [isDemo, school?.id, session?.user.id]);
  return { events, save, error, isDemo, school };
}
