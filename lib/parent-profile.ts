export type ParentProfile = {
  name: string;
  age: string;
  personality: string;
  relationship: string;
  hobbies: string;
  avoidTopics: string;
};

const STORAGE_KEY = "gojikka-parent-profile";

export function saveParentProfile(profile: ParentProfile): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadParentProfile(): ParentProfile | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ParentProfile;
  } catch {
    return null;
  }
}
