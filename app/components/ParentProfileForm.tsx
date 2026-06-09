"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ParentProfile,
  saveParentProfile,
} from "@/lib/parent-profile";

const CONSULT_OPTIONS = ["お父さん", "お母さん", "両親", "その他"] as const;

const fields: {
  key: Exclude<keyof ParentProfile, "name">;
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
  name: "",
  age: "",
  personality: "",
  relationship: "",
  hobbies: "",
  avoidTopics: "",
};

export default function ParentProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<ParentProfile>(emptyProfile);
  const [consultTarget, setConsultTarget] = useState<string>("");

  function handleChange(key: keyof ParentProfile, value: string) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleConsultSelect(option: (typeof CONSULT_OPTIONS)[number]) {
    setConsultTarget(option);
    setProfile((prev) => ({
      ...prev,
      name: option === "その他" ? "" : option,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveParentProfile(profile);
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

      <button type="submit" className="gojikka-btn">
        相談を始める
      </button>
    </form>
  );
}
