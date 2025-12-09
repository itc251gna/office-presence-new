import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ArrowLeft, Trash2, Database, Users, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPanel = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
      if (!userRes.data.is_admin) {
        toast.error('Δεν έχετε δικαίωμα πρόσβασης');
        navigate('/dashboard');
        return;
      }
      fetchData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, attendancesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/stats`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/users`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/attendances`, { withCredentials: true })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setAttendances(attendancesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Σφάλμα φόρτωσης δεδομένων');
      setLoading(false);
    }
  };

  const handleClearOldSessions = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/admin/clear-old-sessions`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      console.error('Error clearing sessions:', error);
      toast.error('Σφάλμα διαγραφής sessions');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/admin/users/${selectedUser.user_id}`, {
        withCredentials: true
      });
      toast.success('Ο χρήστης διαγράφηκε επιτυχώς');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Σφάλμα διαγραφής χρήστη');
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/attendances/${attendanceId}`, {
        withCredentials: true
      });
      toast.success('Η παρουσία διαγράφηκε');
      fetchData();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error('Σφάλμα διαγραφής');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Φόρτωση...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                data-testid="back-button"
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Πίσω
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Πίνακας Διαχείρισης
                </h1>
                <p className="text-sm text-slate-500 mt-1">251 ΓΝΑ - Κέντρο Μηχανογράφησης</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Χρήστες
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats?.total_users || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Παρουσίες
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats?.total_attendances || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats?.total_sessions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Κατάσταση</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Παρών:</span>
                  <span className="font-semibold text-emerald-600">{stats?.status_breakdown?.present || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Απομ/να:</span>
                  <span className="font-semibold text-amber-600">{stats?.status_breakdown?.remote || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Απών:</span>
                  <span className="font-semibold text-rose-600">{stats?.status_breakdown?.absent || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ενέργειες Βάσης Δεδομένων</CardTitle>
            <CardDescription>Διαχείριση και καθαρισμός δεδομένων</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                data-testid="clear-sessions-button"
                onClick={handleClearOldSessions}
                variant="outline"
                className="w-full justify-start"
              >
                <Database className="w-4 h-4 mr-2" />
                Καθαρισμός Ληγμένων Sessions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>Διαχείριση Χρηστών ({users.length})</CardTitle>
            <CardDescription>Προβολή και διαγραφή χρηστών</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.picture} />
                      <AvatarFallback className="bg-slate-200 text-slate-700">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      {user.is_admin && (
                        <span className="inline-block mt-1 text-[10px] bg-slate-700 text-white px-2 py-0.5 rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                  {!user.is_admin && (
                    <Button
                      data-testid={`delete-user-${user.user_id}`}
                      onClick={() => {
                        setSelectedUser(user);
                        setDeleteDialogOpen(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendances */}
        <Card>
          <CardHeader>
            <CardTitle>Πρόσφατες Παρουσίες ({attendances.length})</CardTitle>
            <CardDescription>Τελευταίες καταχωρήσεις παρουσιών</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {attendances.slice(0, 50).map((att) => (
                <div
                  key={att.attendance_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={att.user_picture} />
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                        {att.user_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{att.user_name}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">{att.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(att.status)}`} />
                        <span className="text-xs text-slate-600">{getStatusLabel(att.status)}</span>
                        {att.notes && (
                          <>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500 truncate">{att.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    data-testid={`delete-attendance-${att.attendance_id}`}
                    onClick={() => handleDeleteAttendance(att.attendance_id)}
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Διαγραφή Χρήστη</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη <strong>{selectedUser?.name}</strong>?
              <br />
              <br />
              Αυτή η ενέργεια θα διαγράψει:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Τον λογαριασμό χρήστη</li>
                <li>Όλες τις παρουσίες του</li>
                <li>Όλα τα sessions του</li>
              </ul>
              <br />
              <span className="text-rose-600 font-semibold">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;
