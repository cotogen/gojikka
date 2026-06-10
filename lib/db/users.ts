import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function upsertUserByLineId(
  lineUserId: string,
  displayName: string | null
): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    console.warn(
      "[GOJIKKA] Supabase が未設定のため、users への保存をスキップしました。"
    );
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        line_user_id: lineUserId,
        display_name: displayName,
      },
      { onConflict: "line_user_id" }
    )
    .select("id")
    .single();

  if (error) {
    console.error("[GOJIKKA] users upsert error:", error.message);
    return null;
  }

  return data.id;
}

export async function getUserIdByLineId(
  lineUserId: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("line_user_id", lineUserId)
    .maybeSingle();

  if (error) {
    console.error("[GOJIKKA] users lookup error:", error.message);
    return null;
  }

  return data?.id ?? null;
}
