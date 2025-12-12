import { Link, useLocation } from "react-router-dom";
import { CalendarDays, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <aside className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="text-xs uppercase text-slate-400">251 ΓΝΑ</div>
          <div className="font-semibold text-slate-900 dark:text-white">
            Σύστημα Παρουσιών
          </div>
        </div>

        <nav className="p-3 space-y-1 text-sm flex-1">
          <NavItem to="/" icon={<CalendarDays size={16} />} active={location.pathname === "/"}>
            Ημερολόγιο
          </NavItem>

          {user?.is_admin && (
            <NavItem
              to="/admin"
              icon={<LayoutDashboard size={16} />}
              active={location.pathname === "/admin"}
            >
              Διαχείριση
            </NavItem>
          )}
        </nav>

        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <LogOut size={16} /> Αποσύνδεση
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

function NavItem({ to, icon, children, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-md px-3 py-2 ${
        active
          ? "bg-slate-200 dark:bg-slate-700 font-medium"
          : "hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
