"use client";

import { useMemo, useState } from "react";

const categories = [
  { id: "gen", label: "General / EWS", years: 0 },
  { id: "obc", label: "OBC (non-creamy layer)", years: 3 },
  { id: "scst", label: "SC / ST", years: 5 },
  { id: "pwbd-gen", label: "PwBD (General)", years: 10 },
  { id: "pwbd-obc", label: "PwBD (OBC)", years: 13 },
  { id: "pwbd-scst", label: "PwBD (SC/ST)", years: 15 },
];

function diff(from: Date, to: Date) {
  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  if (d < 0) {
    m -= 1;
    d += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y -= 1;
    m += 12;
  }
  return { y, m, d };
}

function addYears(date: Date, years: number) {
  const r = new Date(date);
  r.setFullYear(r.getFullYear() + years);
  return r;
}

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [asOn, setAsOn] = useState("");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(27);
  const [cat, setCat] = useState("gen");

  const out = useMemo(() => {
    if (!dob || !asOn) return null;
    const b = new Date(dob + "T00:00:00");
    const t = new Date(asOn + "T00:00:00");
    if (isNaN(b.getTime()) || isNaN(t.getTime()) || b > t) return { error: "Date of birth must be before the cut-off date." };
    const age = diff(b, t);
    const relax = categories.find((c) => c.id === cat)!.years;
    const upper = maxAge + relax;
    // Eligible if age >= minAge and age has not exceeded `upper` (i.e. not yet turned upper+1).
    const turnsMin = addYears(b, minAge);
    const crossesMax = addYears(b, upper + 1);
    const eligible = t >= turnsMin && t < crossesMax;
    // Born on or after `earliest` and on or before `latest` to be eligible.
    const earliest = addYears(t, -(upper + 1));
    earliest.setDate(earliest.getDate() + 1);
    const latest = addYears(t, -minAge);
    return { age, relax, upper, eligible, earliest, latest };
  }, [dob, asOn, minAge, maxAge, cat]);

  const input = "field mt-1";

  return (
    <div className="card p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="label block">Your date of birth</span>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={input} />
        </label>
        <label className="text-sm">
          <span className="label block">Age calculated “as on” (cut-off date from the notice)</span>
          <input type="date" value={asOn} onChange={(e) => setAsOn(e.target.value)} className={input} />
        </label>
        <label className="text-sm">
          <span className="label block">Minimum age</span>
          <input type="number" min={14} max={60} value={minAge} onChange={(e) => setMinAge(+e.target.value)} className={input} />
        </label>
        <label className="text-sm">
          <span className="label block">Maximum age (for General category)</span>
          <input type="number" min={14} max={70} value={maxAge} onChange={(e) => setMaxAge(+e.target.value)} className={input} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="label block">Category (typical central government relaxation)</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={input}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} {c.years ? `(+${c.years} years)` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5" aria-live="polite">
        {!out && <p className="text-sm text-ink-3">Enter your date of birth and the cut-off date to see your age.</p>}
        {out && "error" in out && <p className="rounded-lg bg-stamp-50 p-3 text-sm text-stamp">{out.error}</p>}
        {out && !("error" in out) && (
          <div className="rounded-xl border border-line bg-paper/60 p-5">
            <p className="font-display text-3xl font-extrabold text-ink">
              {out.age.y} years, {out.age.m} months, {out.age.d} days
            </p>
            <p className="mt-1 text-sm text-ink-2">on {fmt(new Date(asOn + "T00:00:00"))}</p>
            <p className={`mt-3 font-semibold ${out.eligible ? "text-ok" : "text-stamp"}`}>
              {out.eligible
                ? `✓ Within the ${minAge}–${out.upper} year age limit`
                : `✗ Outside the ${minAge}–${out.upper} year age limit`}
              {out.relax ? ` (includes ${out.relax} years relaxation)` : ""}
            </p>
            <p className="mt-2 text-sm text-ink-2">
              For this limit, candidates must be born between <strong>{fmt(out.earliest)}</strong> and{" "}
              <strong>{fmt(out.latest)}</strong> (both dates included).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
