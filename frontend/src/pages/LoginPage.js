import React from "react";

const AUTH_URL = process.env.REACT_APP_AUTH_URL;

export default function LoginPage() {
  const handleLogin = () => {
    if (!AUTH_URL) {
      alert("Λείπει η μεταβλητή REACT_APP_AUTH_URL");
      return;
    }
    window.location.href = AUTH_URL;
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              251 ΓΝΑ
            </h1>
            <p className="text-slate-600">
              Κέντρο Μηχανογράφησης <br />
              <span className="text-slate-500 text-sm">
                Σύστημα Διαχείρισης Παρουσιών
              </span>
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900 text-xs font-bold">
              G
            </span>
            Σύνδεση με Google
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Συνδεθείτε για να δηλώσετε τις ημέρες παρουσίας σας και να δείτε το
            ημερολόγιο της ομάδας.
          </p>
        </div>
      </div>
      <div className="hidden md:block md:flex-1 bg-slate-900">
        {/* Μπορείς να βάλεις όποια φωτογραφία θέλεις στο public/ */}
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url(/server-room.jpg)",
          }}
        />
      </div>
    </div>
  );
}
