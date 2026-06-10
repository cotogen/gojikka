"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ParentProfile,
  saveParentProfile,
} from "@/lib/parent-profile";
import { clearConversation } from "@/lib/conversation-storage";

const CONSULT_OPTIONS = ["お父さん", "お母さん", "両親", "その他"] as const;

const fields: {
  key: Exclude<keyof ParentProfile, "name" | "consultTarget">;
  label: string;
  placeholder: string;
  multiline?: boolean;
  required: boolean;
}[] = [
  {
    key: "age",
    label: "年齢",
    placeholder: "例：72歳",
    required: false,
  },
  {
    key: "personality",
    label: "性格・口癖",
    placeholder: "例：物静かで、口数は少ない。よく「まあね」と言う。",
    multiline: true,
    required: true,
  },
  {
    key: "relationship",
    label: "子どもとの関係の現状",
    placeholder: "例：月に1回電話する程度。最近、会えていない。",
    multiline: true,
    required: true,
  },
  {
    key: "hobbies",
    label: "趣味・好きな話題",
    placeholder: "例：将棋、庭いじり、昔の家族旅行の話",
    multiline: true,
    required: false,
  },
  {
    key: "avoidTopics",
    label: "話しづらい話題",
    placeholder: "例：健康の話、孫の進路、実家の売却",
    multiline: true,
    required: false,
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
  const [consultTargetError, setConsultTargetError] = useState<string | null>(
    null
  );
  const [fieldErrors, setFieldErrors] = useState<{
    personality?: string;
    relationship?: string;
  }>({});

  const hasConsultTarget = Boolean(consultTarget || profile.consultTarget);
  const hasRequiredFields =
    Boolean(profile.personality.trim()) && Boolean(profile.relationship.trim());

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setConsultTarget(initialProfile.consultTarget);
    }
  }, [initialProfile]);

  function handleChange(key: keyof ParentProfile, value: string) {
    setProfile((prev) => ({ ...prev, [key]: value }));

    if (key === "personality" && value.trim()) {
      setFieldErrors((prev) => ({ ...prev, personality: undefined }));
    }

    if (key === "relationship" && value.trim()) {
      setFieldErrors((prev) => ({ ...prev, relationship: undefined }));
    }
  }

  function handleConsultSelect(option: (typeof CONSULT_OPTIONS)[number]) {
    setConsultTarget(option);
    setConsultTargetError(null);
    setProfile((prev) => ({
      ...prev,
      consultTarget: option,
      name: option === "その他" ? prev.name : option,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedTarget = consultTarget || profile.consultTarget;
    const nextFieldErrors: { personality?: string; relationship?: string } =
      {};

    if (!selectedTarget) {
      setConsultTargetError("選択してください。");
    }

    if (!profile.personality.trim()) {
      nextFieldErrors.personality = "入力してください。";
    }

    if (!profile.relationship.trim()) {
      nextFieldErrors.relationship = "入力してください。";
    }

    if (!selectedTarget || Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    const nextProfile: ParentProfile = {
      ...profile,
      consultTarget: selectedTarget,
    };

    setSaving(true);
    setError(null);
    setConsultTargetError(null);
    setFieldErrors({});

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
      clearConversation();
      saveParentProfile(nextProfile);
    }

    router.push("/chat");
  }

  return (
    <form onSubmit={handleSubmit} className="gojikka-form">
      <div className="gojikka-field">
        <p className="gojikka-label">
          誰のことを相談しますか？
          <span className="gojikka-required">（必須）</span>
        </p>
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
        {consultTargetError && (
          <p className="mt-3 text-[0.875rem] leading-[1.8] gojikka-muted">
            {consultTargetError}
          </p>
        )}
      </div>

      <div className="gojikka-field">
        <label htmlFor="name" className="gojikka-label">
          親の名前
          <span className="gojikka-required">（任意）</span>
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

      {fields.map(({ key, label, placeholder, multiline, required }) => (
        <div key={key} className="gojikka-field">
          <label htmlFor={key} className="gojikka-label">
            {label}
            <span className="gojikka-required">
              {required ? "（必須）" : "（任意）"}
            </span>
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
          {fieldErrors[key as keyof typeof fieldErrors] && (
            <p className="mt-3 text-[0.875rem] leading-[1.8] gojikka-muted">
              {fieldErrors[key as keyof typeof fieldErrors]}
            </p>
          )}
        </div>
      ))}

      {error && (
        <p className="text-[0.875rem] leading-[1.8] gojikka-muted">{error}</p>
      )}

      <button
        type="submit"
        className="gojikka-btn"
        disabled={saving || !hasConsultTarget || !hasRequiredFields}
      >
        {saving
          ? "保存中…"
          : mode === "edit"
            ? "変更を保存する"
            : "話してみる"}
      </button>
    </form>
  );
}
