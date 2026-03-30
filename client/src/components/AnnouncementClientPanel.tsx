"use client";

import { useState } from "react";

const fields = ["전체 분야", "반도체", "이차전지", "바이오/헬스", "미래모빌리티", "AI/SW"];
const types = ["검색 유형", "기업 검색", "R&D 과제", "시험소 검색"];

export default function AnnouncementClientPanel() {
  const [field, setField] = useState(fields[0]);
  const [type, setType] = useState(types[0]);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string>("");

  const onSearch = () => {
    setRecent(`[${field} · ${type}] ${query || "전체 키워드"}`);
  };

  return (
    <div>
      <div className="flex flex-col gap-2 md:flex-row">
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-500"
        >
          {fields.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-500"
        >
          {types.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="기업명, 기술키워드, 과제명 검색..."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-500"
        />

        <button
          type="button"
          onClick={onSearch}
          className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
        >
          검색
        </button>
      </div>
      {recent ? <p className="mt-3 text-xs text-slate-500">최근 검색: {recent}</p> : null}
    </div>
  );
}
