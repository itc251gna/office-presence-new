import React from "react";

const statusConfig = {
  present: { label: "Παρών", color: "bg-emerald-500" },
  remote: { label: "Απομακρυσμένα", color: "bg-amber-500" },
  absent: { label: "Απών", color: "bg-rose-500" },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status];
  if (!cfg) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-700">
      <span className={`h-2 w-2 rounded-full ${cfg.color}`} />
      {cfg.label}
    </span>
  );
}
