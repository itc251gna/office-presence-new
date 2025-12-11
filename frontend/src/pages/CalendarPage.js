import React, { useEffect, useState } from "react";
import { format, addMonths } from "date-fns";
import { el } from "date-fns/locale";
import Layout from "../components/Layout";
import CalendarGrid from "../components/CalendarGrid";
import { createAttendance, getAttendances } from "../api";
import StatusBadge from "../components/StatusBadge";

const STATUS_OPTIONS = [
  { value: "present", label: "Παρών" },
  { value: "remote", label: "Απομακρυσμένα" },
  { value: "absent", label: "Απών" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState(null); // { date, status, notes }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const data = await getAttendances(year, month);
        setAttendances(data);
      } catch (err) {
        console.error(err);
        alert(err.message || "Σφάλμα φόρτωσης παρουσιών.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate((d) => addMonths(d, -1));
  const handleNextMonth = () => setCurrentDate((d) => addMonths(d, 1));

  const handleDayClick = (dateStr, existing) => {
    setDialog({
      date: dateStr,
      status: existing?.status || "present",
      notes: existing?.notes || "",
    });
  };

  const handleSave = async () => {
    if (!dialog) return;
    setSaving(true);
    try {
      await createAttendance({
        date: dialog.date,
        status: dialog.status,
        notes: dialog.notes || undefined,
      });
      // re-fetch month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await getAttendances(year, month);
      setAttendances(data);
      setDialog(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Σφάλμα αποθήκευσης παρουσίας.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Ημερολόγιο Παρουσιών
        </h1>
        <p className="text-sm text-slate-600">
          Δηλώστε και παρακολουθήστε τις ημέρες παρουσίας της ομάδας.
        </p>
      </header>

      <div className="mb-4 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-sky-600 text-lg">
          🔒
        </span>
        <p>
          <span className="font-medium">Περίοδος Δηλώσεων: </span>
          Οι δηλώσεις παρουσιών επιτρέπονται μόνο για το διάστημα{" "}
          <span className="font-semibold">17 Δεκεμβρίου - 11 Ιανουαρίου</span>.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm mb-2">
        <StatusBadge status="present" />
        <StatusBadge status="remote" />
        <StatusBadge status="absent" />
        <span className="inline-flex items-center gap-1 text-xs text-rose-600">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          Σ/Κ
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <span className="inline-block w-3 h-3 border border-slate-300 rounded-full text-[8px] leading-3 text-center">
            🔒
          </span>
          Κλειδωμένη ημέρα
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePrevMonth}
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          &lt;
        </button>
        <div className="text-sm font-medium text-slate-900">
          {format(currentDate, "LLLL yyyy", { locale: el })}
        </div>
        <button
          onClick={handleNextMonth}
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          &gt;
        </button>
      </div>

      <CalendarGrid
        currentDate={currentDate}
        attendances={attendances}
        onDayClick={handleDayClick}
        loading={loading || saving}
      />

      {dialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Δήλωση παρουσίας
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Ημερομηνία:{" "}
              <span className="font-medium">
                {format(new Date(dialog.date), "d MMMM yyyy", { locale: el })}
              </span>
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Κατάσταση</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setDialog((d) => ({ ...d, status: opt.value }))
                      }
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs border ${
                        dialog.status === opt.value
                          ? "bg-slate-900 text-white border-slate-900"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Σημειώσεις</p>
                <textarea
                  rows={3}
                  value={dialog.notes}
                  onChange={(e) =>
                    setDialog((d) => ({ ...d, notes: e.target.value }))
                  }
                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDialog(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
                disabled={saving}
              >
                Άκυρο
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Αποθήκευση..." : "Αποθήκευση"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
