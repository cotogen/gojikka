import { ParentProfile } from "@/lib/parent-profile";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function upsertParentProfile(
  userId: string,
  profile: ParentProfile
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from("parent_profiles").upsert(
    {
      user_id: userId,
      consult_target: profile.consultTarget || null,
      name: profile.name || null,
      age: profile.age || null,
      personality: profile.personality || null,
      relationship: profile.relationship || null,
      hobbies: profile.hobbies || null,
      avoid_topics: profile.avoidTopics || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[GOJIKKA] parent_profiles upsert error:", error.message);
    return false;
  }

  return true;
}

export async function getParentProfileByUserId(
  userId: string
): Promise<ParentProfile | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("parent_profiles")
    .select(
      "consult_target, name, age, personality, relationship, hobbies, avoid_topics"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[GOJIKKA] parent_profiles lookup error:", error.message);
    }
    return null;
  }

  return {
    consultTarget: data.consult_target ?? "",
    name: data.name ?? "",
    age: data.age ?? "",
    personality: data.personality ?? "",
    relationship: data.relationship ?? "",
    hobbies: data.hobbies ?? "",
    avoidTopics: data.avoid_topics ?? "",
  };
}
