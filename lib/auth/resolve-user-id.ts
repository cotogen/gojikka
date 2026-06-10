import { auth } from "@/auth";
import { getUserIdByLineId, upsertUserByLineId } from "@/lib/db/users";

export async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  const lineUserId = session?.user?.lineUserId;

  if (!lineUserId) {
    return null;
  }

  if (session?.user?.id) {
    return session.user.id;
  }

  return (
    (await getUserIdByLineId(lineUserId)) ??
    (await upsertUserByLineId(
      lineUserId,
      session?.user?.displayName ?? null
    ))
  );
}
