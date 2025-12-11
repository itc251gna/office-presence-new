import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const goHome = () => navigate("/");

  return (
    <aside className="w-72 border-r border-slate-200 bg-white flex flex-col">
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <button onClick={goHome} className="text-left">
          <h1 className="text-lg font-semibold text-slate-900">251 ΓΝΑ</h1>
          <p className="text-xs text-slate-500">Κέντρο Μηχανογράφησης</p>
          <p className="text-[11px] text-slate-400 mt-1">
            ΔΙΑΧΕΙΡΙΣΗ ΠΑΡΟΥΣΙΩΝ
          </p>
        </button>
      </div>

      <div className="px-6 py-4 border-b border-slate-100">
        {user && (
          <>
            <p className="text-xs text-slate-400 mb-1">ΣΥΝΔΕΔΕΜΕΝΟΣ ΩΣ</p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 overflow-hidden">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (user.name || "?")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {user.email}
                </span>
              </div>
            </div>
            {user.is_admin && (
              <span className="inline-flex mt-2 w-fit items-center rounded-full bg-emerald-100 px-2 py-[2px] text-[10px] font-semibold text-emerald-700">
                ADMIN
              </span>
            )}
          </>
        )}
      </div>

      <nav className="px-3 py-4 flex-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`
          }
        >
          Ημερολόγιο Παρουσιών
        </NavLink>

        {user?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `mt-1 flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            Πίνακας Διαχείρισης
          </NavLink>
        )}
      </nav>

      <div className="px-6 py-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          Αποσύνδεση
        </button>
      </div>
    </aside>
  );
}
