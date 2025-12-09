import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AttendanceDialog = ({ open, onOpenChange, date, currentUser, attendances, onUpdate }) => {
  const [status, setStatus] = useState('present');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('el-GR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const dayAttendances = attendances.filter(att => att.date === date);
  const myAttendance = dayAttendances.find(att => att.user_id === currentUser.user_id);

  useEffect(() => {
    if (myAttendance) {
      setStatus(myAttendance.status);
      setNotes(myAttendance.notes || '');
    } else {
      setStatus('present');
      setNotes('');
    }
  }, [myAttendance]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (myAttendance) {
        // Update existing attendance
        await axios.put(
          `${BACKEND_URL}/api/attendances/${myAttendance.attendance_id}`,
          { status, notes },
          { withCredentials: true }
        );
        toast.success('Η παρουσία ενημερώθηκε');
      } else {
        // Create new attendance
        await axios.post(
          `${BACKEND_URL}/api/attendances`,
          { date, status, notes },
          { withCredentials: true }
        );
        toast.success('Η παρουσία καταχωρήθηκε');
      }
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
        toast.error('Υπάρχει ήδη καταχώρηση για αυτή την ημέρα');
      } else {
        toast.error('Σφάλμα αποθήκευσης');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!myAttendance) return;
    
    setLoading(true);
    try {
      await axios.delete(
        `${BACKEND_URL}/api/attendances/${myAttendance.attendance_id}`,
        { withCredentials: true }
      );
      toast.success('Η παρουσία διαγράφηκε');
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error('Σφάλμα διαγραφής');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusVal) => {
    switch (statusVal) {
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

  const getStatusLabel = (statusVal) => {
    switch (statusVal) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="attendance-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Παρουσία
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* My Attendance */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-slate-700">Η παρουσία μου</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                data-testid="status-present"
                onClick={() => setStatus('present')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  status === 'present'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-slate-900">Παρών</span>
                </div>
              </button>
              <button
                data-testid="status-remote"
                onClick={() => setStatus('remote')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  status === 'remote'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-slate-900">Απομακρυσμένα</span>
                </div>
              </button>
              <button
                data-testid="status-absent"
                onClick={() => setStatus('absent')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  status === 'absent'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-rose-500" />
                  <span className="text-sm font-medium text-slate-900">Απών</span>
                </div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
              Σημειώσεις (προαιρετικό)
            </Label>
            <Textarea
              id="notes"
              data-testid="attendance-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="π.χ. Πρωί μόνο, Ραντεβού στις 14:00..."
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Other attendances */}
          {dayAttendances.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <Label className="text-sm font-medium text-slate-700">
                Άλλες παρουσίες ({dayAttendances.length})
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {dayAttendances.map((att) => (
                  <div key={att.attendance_id} className="flex items-start gap-3 p-2 rounded bg-slate-50">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={att.user_picture} />
                        <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                          {att.user_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(att.status)}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{att.user_name}</span>
                        <span className="text-xs text-slate-500">• {getStatusLabel(att.status)}</span>
                      </div>
                      {att.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{att.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {myAttendance && (
            <Button
              data-testid="delete-attendance-button"
              onClick={handleDelete}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              Διαγραφή
            </Button>
          )}
          <Button
            data-testid="save-attendance-button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-slate-700 hover:bg-slate-800"
          >
            {loading ? 'Αποθήκευση...' : myAttendance ? 'Ενημέρωση' : 'Αποθήκευση'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDialog;