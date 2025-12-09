import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import AttendanceDialog from '../components/AttendanceDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    fetchData();
  }, [currentYear, currentMonth]);

  const fetchData = async () => {
    try {
      const [userRes, usersRes, attendancesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/users`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/attendances?year=${currentYear}&month=${currentMonth + 1}`, {
          withCredentials: true
        })
      ]);

      setCurrentUser(userRes.data);
      setUsers(usersRes.data);
      setAttendances(attendancesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Σφάλμα φόρτωσης δεδομένων');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Σφάλμα αποσύνδεσης');
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert to Monday=0
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
  };

  const getAttendancesForDate = (dateStr) => {
    return attendances.filter(att => att.date === dateStr);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500';
      case 'remote':
        return 'bg-amber-500';
      case 'absent':
        return 'bg-rose-500';
      default:
        return 'bg-slate-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present':
        return 'Παρών';
      case 'remote':
        return 'Απομακρυσμένα';
      case 'absent':
        return 'Απών';
      default:
        return '';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    const weekDays = ['Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ'];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px]" />);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAttendances = getAttendancesForDate(dateStr);
      const today = new Date();
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      days.push(
        <div
          key={day}
          data-testid={`calendar-day-${dateStr}`}
          onClick={() => handleDateClick(dateStr)}
          className={`min-h-[120px] border border-slate-200 rounded-lg p-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg bg-white ${
            isToday ? 'ring-2 ring-slate-700' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-medium ${isToday ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
              {day}
            </span>
            {isToday && (
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Σήμερα</span>
            )}
          </div>
          <div className="space-y-1">
            {dayAttendances.slice(0, 3).map((att) => (
              <div
                key={att.attendance_id}
                className="flex items-center gap-2 text-xs"
              >
                <div className={`w-2 h-2 rounded-full ${getStatusColor(att.status)}`} />
                <span className="text-slate-700 truncate">{att.user_name}</span>
              </div>
            ))}
            {dayAttendances.length > 3 && (
              <div className="text-[10px] text-slate-400">+{dayAttendances.length - 3} άλλοι</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">{days}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Φόρτωση...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 space-y-6 flex flex-col">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">OfficePulse</h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Διαχείριση Παρουσιών</p>
        </div>

        <div className="flex-1 space-y-6">
          {/* Current User */}
          <div className="space-y-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Συνδεδεμένος ως</p>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={currentUser?.picture} />
                <AvatarFallback className="bg-slate-200 text-slate-700">
                  {currentUser?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-slate-900">{currentUser?.name}</p>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-3">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Μέλη Ομάδας ({users.length})</p>
            <div className="space-y-2">
              {users.map((user) => {
                const userAttendance = attendances.find(
                  att => att.user_id === user.user_id && att.date === new Date().toISOString().split('T')[0]
                );
                return (
                  <div key={user.user_id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.picture} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                          {user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {userAttendance && (
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(userAttendance.status)}`}
                        />
                      )}
                    </div>
                    <span className="text-sm text-slate-700">{user.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Button
          data-testid="logout-button"
          onClick={handleLogout}
          variant="outline"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Αποσύνδεση
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Ημερολόγιο Παρουσιών
              </h1>
              <p className="text-slate-500 mt-1">
                Δηλώστε και παρακολουθήστε τις ημέρες παρουσίας της ομάδας
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Παρών</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-600">Απομακρυσμένα</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-600">Απών</span>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
            <Button
              data-testid="prev-month-button"
              onClick={handlePrevMonth}
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold text-slate-900">
              {currentDate.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              data-testid="next-month-button"
              onClick={handleNextMonth}
              variant="ghost"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar */}
          {renderCalendar()}
        </div>
      </div>

      {/* Attendance Dialog */}
      {selectedDate && (
        <AttendanceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          date={selectedDate}
          currentUser={currentUser}
          attendances={attendances}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};

export default Dashboard;