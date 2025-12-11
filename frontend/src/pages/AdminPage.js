import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  adminClearOldSessions,
  adminDeleteUser,
  getAdminStats,
} from "../api";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        alert(err.message || "Σφάλμα φόρτωσης admin στατιστικών.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleClearSessions = async () => {
    if (!window.confirm("Σίγουρα για καθαρισμό ληγμένων sessions;")) return;
    setBusy(true);
    try {
      const res = await adminClearOldSessions();
      alert(res.message || "Ο καθαρισμός ολοκληρώθηκε.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Σφάλμα κατά τον καθαρισμό sessions.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Διαγραφή χρήστη και όλων των δεδομένων του;")) return;
    setBusy(true);
    try {
      const res = await adminDeleteUser(userId);
      alert(res.message || "Ο χρήστης διαγράφηκε.");
      // re-fetch
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      alert(err.message || "Σφάλμα διαγραφής χρήστη.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <button
          onClick={() => window.history.back()}
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          ← Πίσω
        </button>
        <span className="text-xs text-slate-400">|</span>
        <span className="text-xs text-slate-500">Admin</span>
      </div>

      <h1 className="text-2xl font-semibold text-slate-900 mb-1">
        Πίνακας Διαχείρισης
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        251 ΓΝΑ - Κέντρο Μηχανογράφησης
      </p>

      {loading && (
        <p className="text-sm text-slate-500 mb-4">Φόρτωση στατιστικών...</p>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500 mb-1">Χρήστες</p>
              <p className="text-2xl font-semibold text-slate-900">
                {stats.total_users}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500 mb-1">Παρουσίες</p>
              <p className="text-2xl font-semibold text-slate-900">
                {stats.total_attendances}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500 mb-1">Sessions</p>
              <p className="text-2xl font-semibold text-slate-900">
                {stats.total_sessions}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500 mb-2">Κατάσταση</p>
              <div className="text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span>Παρών:</span>
                  <span className="text-emerald-600 font-medium">
                    {stats.status_breakdown.present}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Απομ/να:</span>
                  <span className="text-amber-600 font-medium">
                    {stats.status_breakdown.remote}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Απών:</span>
                  <span className="text-rose-600 font-medium">
                    {stats.status_breakdown.absent}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <section className="mb-6 bg-white rounded-xl border border-slate-100 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Ενέργειες Βάσης Δεδομένων
            </h2>
            <button
              onClick={handleClearSessions}
              disabled={busy}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              Καθαρισμός ληγμένων Sessions
            </button>
          </section>

          {/* Εδώ απλά δείχνουμε ότι υπάρχει διαχείριση χρηστών – για πλήρη λίστα
              χρηστών θα χρειαστούμε επιπλέον endpoint από backend */}
          <section className="bg-white rounded-xl border border-slate-100 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Διαχείριση Χρηστών
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Για πλήρη λίστα χρηστών απαιτείται επιπλέον endpoint στο backend.
              Προς το παρόν, η διαγραφή χρήστη γίνεται με εισαγωγή του ID του.
            </p>
            <DeleteUserForm onDelete={handleDeleteUser} busy={busy} />
          </section>
        </>
      )}
    </Layout>
  );
}

function DeleteUserForm({ onDelete, busy }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onDelete(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 text-xs">
      <input
        type="text"
        placeholder="user_id προς διαγραφή"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 min-w-[200px] rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
      >
        Διαγραφή χρήστη
      </button>
    </form>
  );
}
