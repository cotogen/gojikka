export type ParentProfile = {
  consultTarget: string;
  name: string;
  age: string;
  personality: string;
  relationship: string;
  hobbies: string;
  avoidTopics: string;
};

const STORAGE_KEY = "gojikka-parent-profile";
const LEGACY_STORAGE_KEY = "gojikka-parent-profile";

function parseProfile(raw: string): ParentProfile | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ParentProfile>;
    return {
      consultTarget: parsed.consultTarget ?? "",
      name: parsed.name ?? "",
      age: parsed.age ?? "",
      personality: parsed.personality ?? "",
      relationship: parsed.relationship ?? "",
      hobbies: parsed.hobbies ?? "",
      avoidTopics: parsed.avoidTopics ?? "",
    };
  } catch {
    return null;
  }
}

export function saveParentProfile(profile: ParentProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadParentProfile(): ParentProfile | null {
  if (typeof window === "undefined") return null;

  const fromLocal = localStorage.getItem(STORAGE_KEY);
  if (fromLocal) {
    return parseProfile(fromLocal);
  }

  // 旧 sessionStorage からの移行（1回だけ）
  const fromSession = sessionStorage.getItem(LEGACY_STORAGE_KEY);
  if (fromSession) {
    const profile = parseProfile(fromSession);
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    return profile;
  }

  return null;
}

export function clearParentProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
