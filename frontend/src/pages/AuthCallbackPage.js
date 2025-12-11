import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authCallback } from "../api";
import { useAuth } from "../AuthContext";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("Λείπει το session_id από το URL.");
      return;
    }

    async function run() {
      try {
        const data = await authCallback(sessionId);
        setUser(data.user);
        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
        setError(err.message || "Σφάλμα κατά την αυθεντικοποίηση.");
      }
    }

    run();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-xl shadow-sm px-8 py-6 max-w-md w-full">
        {!error ? (
          <>
            <h1 className="text-lg font-semibold text-slate-900 mb-2">
              Ολοκλήρωση σύνδεσης...
            </h1>
            <p className="text-sm text-slate-600">
              Παρακαλώ περιμένετε λίγο καθώς ολοκληρώνουμε τη διαδικασία
              σύνδεσης.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-red-600 mb-2">
              Πρόβλημα σύνδεσης
            </h1>
            <p className="text-sm text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Επιστροφή στη σελίδα σύνδεσης
            </button>
          </>
        )}
      </div>
    </div>
  );
}
