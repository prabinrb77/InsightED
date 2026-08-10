import { useCallback, useEffect, useState } from "react";
import type { Student } from "../data/students";
import { archiveStudent, getStudents } from "../lib/educatorStore";
import { supabase } from "../lib/supabase";
import useCurrentSchool from "./useCurrentSchool";

export default function useStudents() {
  const { school, isDemo } = useCurrentSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (isDemo || !supabase || !school) { setStudents(getStudents()); return; }
    const { data, error: queryError } = await supabase.from("students")
      .select("id,student_code,first_name,last_name,class_group,archived_at")
      .eq("school_id", school.id).is("archived_at", null).order("last_name");
    if (queryError) { setError(queryError.message); return; }
    setStudents((data ?? []).map((row) => ({
      id: row.id, short: `${row.first_name} ${String(row.last_name).charAt(0)}.`,
      full: `${row.first_name} ${row.last_name}`, code: row.student_code ?? "—",
      studentId: `#${row.student_code ?? String(row.id).slice(0, 8)}`,
      grade: row.class_group ?? "Unassigned", guardian: "Available to linked staff",
      attendance: 100, trend: "steady",
    })));
  }, [isDemo, school?.id]);
  useEffect(() => { void load(); }, [load]);
  const archive = useCallback(async (id: string) => {
    if (isDemo || !supabase) archiveStudent(id);
    else {
      const { error: updateError } = await supabase.from("students").update({ archived_at: new Date().toISOString() }).eq("id", id);
      if (updateError) { setError(updateError.message); return false; }
    }
    await load(); return true;
  }, [isDemo, load]);
  return { students, archive, error, isDemo, reload: load };
}
