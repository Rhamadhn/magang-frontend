import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg } from "@fullcalendar/core";

// Import Komponen Standar (Konsistensi UI)
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Alert from "../components/ui/alert/Alert";
import { Modal } from "../components/ui/modal";

// Import Icons
import { 
  PlusIcon, 
  InfoIcon, 
  PencilIcon, 
  TrashBinIcon, 
  HorizontaLDots 
} from "../icons";

import { taskService } from "../api/taskService";
import api from "../api/axios";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    dbId: string;
    description: string;
    intern_id: string;
    status: 'todo' | 'ongoing' | 'review' | 'selesai';
    priority: string;
    intern_name: string;
  };
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [internList, setInternList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal States
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  
  // Data States
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [tasksOnSelectedDate, setTasksOnSelectedDate] = useState<CalendarEvent[]>([]);
  const [notification, setNotification] = useState<{variant: any, title: string, message: string} | null>(null);

  // Form State
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedIntern, setSelectedIntern] = useState("");
  const [eventDeadline, setEventDeadline] = useState("");
  const [eventPrioritas, setEventPrioritas] = useState("normal");

  const priorityColors: Record<string, string> = {
    low: "#3B82F6", normal: "#10B981", high: "#F59E0B", urgent: "#EF4444",
  };

  const statusBadge: Record<string, string> = {
    todo: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    ongoing: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    review: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    selesai: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  };

  const showToast = (variant: any, title: string, message: string) => {
    setNotification({ variant, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTugasList();
      const apiData = response.data?.data || response.data || [];
      
      const mappedEvents = apiData.map((t: any): CalendarEvent => ({
        id: t.id,
        title: t.judul_tugas,
        start: t.created_at.split(' ')[0],
        end: t.deadline,
        allDay: true,
        backgroundColor: priorityColors[t.prioritas] || "#10B981",
        borderColor: priorityColors[t.prioritas] || "#10B981",
        extendedProps: {
          dbId: t.id,
          description: t.deskripsi || "",
          intern_id: t.intern_id,
          status: t.status,
          priority: t.prioritas,
          intern_name: t.nama_intern || t.intern?.nama || 'Intern'
        },
      }));
      setEvents(mappedEvents);
    } catch (err) {
      showToast("error", "Gagal", "Gagal memuat data tugas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterns = async () => {
    try {
      const res = await api.get("/v1/my-interns");
      const data = res.data?.data || [];
      setInternList(data.map((i: any) => ({ id: i.intern_id, name: i.intern?.user?.name || i.nama })));
    } catch (err) {
      console.error("Gagal load intern");
    }
  };

  useEffect(() => { 
    fetchTasks(); 
    fetchInterns(); 
  }, []);

  const handleDateClick = (selectInfo: DateSelectArg) => {
    const dateStr = selectInfo.startStr;
    setSelectedDate(dateStr);
    
    const activeTasks = events.filter(event => {
      const start = event.start;
      const end = event.end.split(' ')[0] || event.end.split('T')[0];
      return dateStr >= start && dateStr <= end;
    });

    setTasksOnSelectedDate(activeTasks);
    setMenuModalOpen(true); 
  };

  const openCreateForm = () => {
    setIsEditMode(false);
    setCurrentTaskId(null);
    setEventTitle("");
    setEventDescription("");
    setSelectedIntern("");
    setEventDeadline(selectedDate + "T23:59");
    setEventPrioritas("normal");
    setMenuModalOpen(false);
    setFormModalOpen(true);
  };

  const openEditForm = (task: CalendarEvent) => {
    setIsEditMode(true);
    setCurrentTaskId(task.extendedProps.dbId);
    setEventTitle(task.title);
    setEventDescription(task.extendedProps.description);
    setSelectedIntern(task.extendedProps.intern_id);
    const formattedDeadline = task.end.replace(" ", "T").substring(0, 16);
    setEventDeadline(formattedDeadline);
    setEventPrioritas(task.extendedProps.priority);
    setMenuModalOpen(false);
    setFormModalOpen(true);
  };

  const handleSaveTugas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        judul_tugas: eventTitle,
        deskripsi: eventDescription,
        intern_id: selectedIntern,
        deadline: eventDeadline.replace("T", " ") + (eventDeadline.length === 16 ? ":00" : ""),
        prioritas: eventPrioritas
      };

      if (isEditMode && currentTaskId) {
        // await taskService.updateTask(currentTaskId, payload);
        showToast("success", "Berhasil", "Tugas berhasil diperbarui.");
      } else {
        // await taskService.createTask(payload);
        showToast("success", "Berhasil", "Tugas baru telah dikirim.");
      }
      setFormModalOpen(false);
      fetchTasks();
    } catch (err) {
      showToast("error", "Kesalahan", "Gagal menyimpan data tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Kalender Monitoring" description="Pantau tugas intern melalui kalender" />
      <PageBreadcrumb pageTitle="Monitoring Mentor" />

      {notification && (
        <div className="fixed bottom-6 right-6 z-[99999] w-full max-w-sm">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      <style>{`
        .fc-event { border-radius: 6px; padding: 2px 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none !important; transition: all 0.2s; }
        .fc-event:hover { transform: translateY(-1px); filter: brightness(0.9); shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .fc-theme-standard .fc-scrollgrid { border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
        .dark .fc-theme-standard .fc-scrollgrid { border-color: #1f2937; }
        .fc-header-toolbar { margin-bottom: 24px !important; padding: 0 4px; }
        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 700 !important; color: #111827; }
        .dark .fc-toolbar-title { color: #f9fafb; }
        .fc-button-primary { background-color: #fff !important; border-color: #e5e7eb !important; color: #374151 !important; font-size: 13px !important; font-weight: 600 !important; text-transform: capitalize !important; }
        .fc-button-primary:hover { background-color: #f9fafb !important; }
        .fc-button-active { background-color: #4f46e5 !important; border-color: #4f46e5 !important; color: #fff !important; }
      `}</style>

      <div className="space-y-6">
        <ComponentCard title="Jadwal Penugasan Peserta Magang">
          <div className="p-2">
            {loading ? (
                <div className="h-[500px] flex items-center justify-center text-gray-500 animate-pulse font-medium">
                    Sinkronisasi jadwal tugas...
                </div>
            ) : (
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    selectable={true}
                    select={handleDateClick}
                    eventDisplay="block"
                    displayEventTime={false}
                    height="auto"
                    headerToolbar={{
                        left: 'Sebelumnya,Berikutnya Hari ini',
                        center: 'title',
                        right: 'dayGridMonth'
                    }}
                />
            )}
          </div>
        </ComponentCard>
      </div>

      {/* MODAL 1: QUICK ACTION (SAMA DENGAN DETAIL STYLE) */}
      <Modal isOpen={menuModalOpen} onClose={() => setMenuModalOpen(false)} className="max-w-[500px] p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center">
                    <HorizontaLDots className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Aksi Tanggal</h3>
                    <p className="text-xs text-gray-500">{new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                </div>
            </div>
        </div>
        
        <div className="p-6 space-y-6">
          <Button onClick={openCreateForm} className="w-full flex items-center justify-center gap-2 py-3">
            <PlusIcon /> Buat Tugas Baru
          </Button>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Tugas Aktif ({tasksOnSelectedDate.length})</h4>
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {tasksOnSelectedDate.map((task) => (
                    <div key={task.id} className="group p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.02] hover:border-brand-500/50 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusBadge[task.extendedProps.status]}`}>
                                {task.extendedProps.status}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditForm(task)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg">
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h5 className="font-bold text-sm text-gray-800 dark:text-white/90 leading-snug">{task.title}</h5>
                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            Intern: <span className="text-gray-700 dark:text-gray-300 font-semibold">{task.extendedProps.intern_name}</span>
                        </p>
                    </div>
                ))}
                {tasksOnSelectedDate.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                        <p className="text-xs text-gray-400 font-medium">Tidak ada jadwal tugas di tanggal ini.</p>
                    </div>
                )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-white/[0.02] flex justify-end">
             <Button variant="outline" size="sm" onClick={() => setMenuModalOpen(false)}>Tutup</Button>
        </div>
      </Modal>

      {/* MODAL 2: FORM CREATE/EDIT (SAMA DENGAN FORM STYLE) */}
      <Modal isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} className="max-w-[600px] p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center">
            {isEditMode ? <PencilIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{isEditMode ? "Ubah Instruksi Tugas" : "Kirim Tugas Baru"}</h3>
            <p className="text-xs text-gray-500">Lengkapi detail instruksi kerja untuk mahasiswa intern.</p>
          </div>
        </div>
        
        <form onSubmit={handleSaveTugas} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pilih Mahasiswa</label>
              <select 
                required
                value={selectedIntern} 
                onChange={(e) => setSelectedIntern(e.target.value)} 
                className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 text-sm focus:border-brand-500 outline-none transition-all"
              >
                <option value="">-- Pilih Mahasiswa --</option>
                {internList.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prioritas Tugas</label>
              <select 
                value={eventPrioritas} 
                onChange={(e) => setEventPrioritas(e.target.value)} 
                className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 text-sm focus:border-brand-500 outline-none transition-all"
              >
                <option value="low">Low (Santai)</option>
                <option value="normal">Normal</option>
                <option value="high">High (Penting)</option>
                <option value="urgent">Urgent (Segera!)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Judul Tugas</label>
            <input 
              required
              type="text" 
              placeholder="Misal: Optimasi Query Database" 
              value={eventTitle} 
              onChange={(e) => setEventTitle(e.target.value)} 
              className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 text-sm focus:border-brand-500 outline-none transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Deskripsi / Instruksi</label>
            <textarea 
              required
              placeholder="Berikan panduan pengerjaan..." 
              value={eventDescription} 
              onChange={(e) => setEventDescription(e.target.value)} 
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 text-sm focus:border-brand-500 outline-none transition-all min-h-[120px] resize-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Batas Waktu (Deadline)</label>
            <input 
              required
              type="datetime-local" 
              value={eventDeadline} 
              onChange={(e) => setEventDeadline(e.target.value)} 
              className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 text-sm focus:border-brand-500 outline-none transition-all" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" onClick={() => setFormModalOpen(false)} type="button">Batalkan</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : isEditMode ? "Simpan Perubahan" : "Kirim Tugas"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Calendar;