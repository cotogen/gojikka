import { StoredMessage } from "@/lib/conversation-storage";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function appendConversationMessages(
  userId: string,
  messages: StoredMessage[]
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  if (!supabase || messages.length === 0) {
    return messages.length === 0;
  }

  const { error } = await supabase.from("conversations").insert(
    messages.map((message) => ({
      user_id: userId,
      role: message.role,
      content: message.content,
      created_at: message.createdAt,
    }))
  );

  if (error) {
    console.error("[GOJIKKA] conversations append error:", error.message);
    return false;
  }

  return true;
}

export async function countConversationsByUserId(
  userId: string
): Promise<number | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return null;
  }

  const { count, error } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("[GOJIKKA] conversations count error:", error.message);
    return null;
  }

  return count ?? 0;
}

export async function insertConversationsIfEmpty(
  userId: string,
  messages: StoredMessage[]
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return false;
  }

  if (messages.length === 0) {
    return true;
  }

  const existingCount = await countConversationsByUserId(userId);
  if (existingCount === null) {
    return false;
  }

  if (existingCount > 0) {
    return true;
  }

  const { error } = await supabase.from("conversations").insert(
    messages.map((message) => ({
      user_id: userId,
      role: message.role,
      content: message.content,
      created_at: message.createdAt,
    }))
  );

  if (error) {
    console.error("[GOJIKKA] conversations insert error:", error.message);
    return false;
  }

  return true;
}

export async function getConversationsByUserId(
  userId: string
): Promise<StoredMessage[]> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) {
      console.error("[GOJIKKA] conversations lookup error:", error.message);
    }
    return [];
  }

  return data.map((row) => ({
    role: row.role as "user" | "assistant",
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function deleteMessageByUserId(
  userId: string,
  role: "user" | "assistant",
  createdAt: string,
  content: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("user_id", userId)
    .eq("role", role)
    .eq("created_at", createdAt)
    .eq("content", content);

  if (error) {
    console.error("[GOJIKKA] conversation delete error:", error.message);
    return false;
  }

  return true;
}

/** @deprecated use deleteMessageByUserId */
export async function deleteUserMessageByUserId(
  userId: string,
  createdAt: string,
  content: string
): Promise<boolean> {
  return deleteMessageByUserId(userId, "user", createdAt, content);
}

export async function deleteAllConversationsByUserId(
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("[GOJIKKA] conversations delete all error:", error.message);
    return false;
  }

  return true;
}
