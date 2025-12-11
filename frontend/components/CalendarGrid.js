import React from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isWeekend,
} from "date-fns";
import { el } from "date-fns/locale";
import StatusBadge from "./StatusBadge";

const ALLOWED_START = { month: 12, day: 17 };
const ALLOWED_END = { month: 1, day: 11 }; // επόμενο έτος

function isDateInAllowedPeriod(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  if (m === 12 && d >= ALLOWED_START.day) return true;
  if (m === 1 && d <= ALLOWED_END.day) return true;
  return false;
}

export default function CalendarGrid({
  currentDate,
  attendances,
  onDayClick,
  loading,
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // shift ώστε η εβδομάδα να ξεκινά Δευτέρα
  const offset = (getDay(monthStart) + 6) % 7;

  const attendanceByDate = attendances.reduce((map, a) => {
    map[a.date] = a;
    return map;
  }, {});

  return (
    <div className="mt-6">
      <div className="grid grid-cols-7 text-xs font-medium text-slate-500 mb-2">
        {["ΔΕΥ", "ΤΡΙ", "ΤΕΤ", "ΠΕΜ", "ΠΑΡ", "ΣΑΒ", "ΚΥΡ"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-sm">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const att = attendanceByDate[dateStr];
          const weekend = isWeekend(day);
          const allowed = isDateInAllowedPeriod(day);

          let border = "border-slate-200";
          let bg = "bg-white";
          let text = "text-slate-900";
          let extraLabel = null;

          if (weekend) {
            border = "border-rose-200";
            bg = "bg-rose-50";
            text = "text-rose-600";
            extraLabel = "Σ/Κ";
          }

          if (!allowed) {
            border = "border-slate-200";
            bg = "bg-slate-50";
          }

          const clickable = allowed && !weekend && !loading;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onDayClick(dateStr, att)}
              className={`min-h-[80px] rounded-lg border px-2 py-1 text-left flex flex-col justify-between ${
                clickable
                  ? "hover:border-slate-400 hover:bg-slate-50"
                  : "cursor-default opacity-80"
              } ${bg} ${text} ${border}`}
            >
              <div className="flex items-center justify-between text-xs">
                <span>{format(day, "d", { locale: el })}</span>
                {extraLabel && (
                  <span className="text-[10px] text-rose-500 font-medium">
                    {extraLabel}
                  </span>
                )}
              </div>
              <div className="mt-1">
                {att && <StatusBadge status={att.status} />}
              </div>
              {!allowed && !weekend && (
                <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="inline-block w-3 h-3 border border-slate-300 rounded-full text-[8px] leading-3 text-center">
                    🔒
                  </span>
                  <span>Κλειδωμένη μέρα</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
