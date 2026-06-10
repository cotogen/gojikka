import { clearParentProfile } from "@/lib/parent-profile";

export type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const STORAGE_KEY = "gojikka-conversation";

export function saveConversation(messages: StoredMessage[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function loadConversation(): StoredMessage[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredMessage[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        typeof message.createdAt === "string"
    );
  } catch {
    return [];
  }
}

export function clearConversation(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function clearGuestData(): void {
  clearParentProfile();
  clearConversation();
}
