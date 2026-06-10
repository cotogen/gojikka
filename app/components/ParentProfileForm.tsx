"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ParentProfile,
  saveParentProfile,
} from "@/lib/parent-profile";

const CONSULT_OPTIONS = ["お父さん", "お母さん", "両親", "その他"] as const;

const fields: {
  key: Exclude<keyof ParentProfile, "name" | "consultTarget">;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  {
    key: "age",
    label: "年齢",
    placeholder: "例：72歳",
  },
  {
    key: "personality",
    label: "性格・口癖",
    placeholder: "例：物静かで、口数は少ない。よく「まあね」と言う。",
    multiline: true,
  },
  {
    key: "relationship",
    label: "子どもとの関係の現状",
    placeholder: "例：月に1回電話する程度。最近、会えていない。",
    multiline: true,
  },
  {
    key: "hobbies",
    label: "趣味・好きな話題",
    placeholder: "例：将棋、庭いじり、昔の家族旅行の話",
    multiline: true,
  },
  {
    key: "avoidTopics",
    label: "苦手な話題や地雷",
    placeholder: "例：健康の話、孫の進路、実家の売却",
    multiline: true,
  },
];

const emptyProfile: ParentProfile = {
  consultTarget: "",
  name: "",
  age: "",
  personality: "",
  relationship: "",
  hobbies: "",
  avoidTopics: "",
};

type ParentProfileFormProps = {
  mode?: "create" | "edit";
  initialProfile?: ParentProfile;
  isLoggedIn?: boolean;
};

export default function ParentProfileForm({
  mode = "create",
  initialProfile,
  isLoggedIn = false,
}: ParentProfileFormProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ParentProfile>(
    initialProfile ?? emptyProfile
  );
  const [consultTarget, setConsultTarget] = useState(
    initialProfile?.consultTarget ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setConsultTarget(initialProfile.consultTarget);
    }
  }, [initialProfile]);

  function handleChange(key: keyof ParentProfile, value: string) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleConsultSelect(option: (typeof CONSULT_OPTIONS)[number]) {
    setConsultTarget(option);
    setProfile((prev) => ({
      ...prev,
      consultTarget: option,
      name: option === "その他" ? prev.name : option,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextProfile: ParentProfile = {
      ...profile,
      consultTarget: consultTarget || profile.consultTarget,
    };

    setSaving(true);
    setError(null);

    if (mode === "edit" && isLoggedIn) {
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: nextProfile }),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "保存に失敗しました。");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "保存に失敗しました。");
        setSaving(false);
        return;
      }
    } else {
      saveParentProfile(nextProfile);
    }

    router.push("/chat");
  }

  return (
    <form onSubmit={handleSubmit} className="gojikka-form">
      <div className="gojikka-field">
        <p className="gojikka-label">誰のことを相談しますか？</p>
        <div className="gojikka-choices" role="group" aria-label="誰のことを相談しますか？">
          {CONSULT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`gojikka-choice ${
                consultTarget === option ? "gojikka-choice--selected" : ""
              }`}
              aria-pressed={consultTarget === option}
              onClick={() => handleConsultSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="gojikka-field">
        <label htmlFor="name" className="gojikka-label">
          親の名前
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={profile.name}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="例：お父さん、お母さん"
          className="gojikka-input"
        />
      </div>

      {fields.map(({ key, label, placeholder, multiline }) => (
        <div key={key} className="gojikka-field">
          <label htmlFor={key} className="gojikka-label">
            {label}
          </label>
          {multiline ? (
            <textarea
              id={key}
              name={key}
              rows={4}
              value={profile[key]}
              onChange={(event) => handleChange(key, event.target.value)}
              placeholder={placeholder}
              className="gojikka-textarea"
            />
          ) : (
            <input
              id={key}
              name={key}
              type="text"
              value={profile[key]}
              onChange={(event) => handleChange(key, event.target.value)}
              placeholder={placeholder}
              className="gojikka-input"
            />
          )}
        </div>
      ))}

      {error && (
        <p className="text-[0.875rem] leading-[1.8] gojikka-muted">{error}</p>
      )}

      <button type="submit" className="gojikka-btn" disabled={saving}>
        {saving
          ? "保存中…"
          : mode === "edit"
            ? "変更を保存する"
            : "相談を始める"}
      </button>
    </form>
  );
}
