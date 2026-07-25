// src/pages/TaskManagement/useCalendarLogic.ts
import { useState, useEffect, useCallback } from "react";
import { DateSelectArg } from "@fullcalendar/core";
import { taskService } from "../../api/taskService";
import { logbookService } from "../../api/logbookService";
import api from "../../api/axios";
import { CalendarEvent, Intern, NotificationState, Logbook } from "./types";

export const useCalendarLogic = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [internList, setInternList] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);

  // --- STATE TANGGAL DINAMIS (TAMBAHKAN INI) ---
  const [currentRange, setCurrentRange] = useState<{ start: string; end: string } | null>(null);

  // --- Modal & Submitting States ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingLogbook, setIsSubmittingLogbook] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [logbookModalOpen, setLogbookModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  // --- Selected Data States ---
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [tasksOnSelectedDate, setTasksOnSelectedDate] = useState<CalendarEvent[]>([]);
  const [selectedTask, setSelectedTask] = useState<CalendarEvent | null>(null);
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null);

  // --- Form Input States ---
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

  const showToast = useCallback((variant: any, title: string, message: string) => {
    setNotification({ variant, title, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // --- API Fetching (DIUBAH MENJADI MENERIMA PARAMETER DINAMIS) ---
  const fetchAllData = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);

      // Gunakan parameter tanggal jika ada, jika tidak ada (initial load) pakai fallback bulan ini
      const queryStart = startDate || currentRange?.start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const queryEnd = endDate || currentRange?.end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

      const [taskRes, logbookRes] = await Promise.all([
        taskService.getTugasList(),
        logbookService.getLogbooks(queryStart, queryEnd) // Sekarang dinamis!
      ]);

      const tasks = taskRes.data?.data || taskRes.data || [];
      let rawLogs = [];
      if (logbookRes.data) {
        rawLogs = Array.isArray(logbookRes.data) ? logbookRes.data : (logbookRes.data.data || []);
      }

      const formatToIsoDate = (dateStr: string): string => {
        if (!dateStr || !dateStr.includes('-')) return dateStr;
        const parts = dateStr.split('-');
        if (parts[0].length === 4) return dateStr; 
        return `${parts[2]}-${parts[1]}-${parts[0]}`; 
      };

      const mappedTasks = tasks.map((t: any): CalendarEvent => {
        const rawStart = t.created_at;
        const rawEnd = t.deadline;
        const startDate = rawStart ? (rawStart.includes('T') ? rawStart.split('T')[0] : rawStart.split(' ')[0]) : null;
        const endDate = rawEnd ? (rawEnd.includes('T') ? rawEnd.split('T')[0] : rawEnd.split(' ')[0]) : null;

        return {
          id: `task-${t.id}`,
          title: `Task: ${t.judul_tugas}`,
          start: startDate ?? undefined,
          end: endDate ?? undefined,
          allDay: true,
          backgroundColor: priorityColors[t.prioritas] || "#10B981",
          borderColor: priorityColors[t.prioritas] || "#10B981",
          extendedProps: {
            dbId: t.id,
            description: t.deskripsi || "",
            intern_id: t.intern_id,
            status: t.status || 'pending',
            priority: t.prioritas,
            intern_name: t.intern?.nama || 'Intern',
            type: 'tugas',
            link_progres: null,
            file_path: null,
            catatan_mentor: null
          }
        };
      });

      const cleanedRawLogs = rawLogs.map((l: any): Logbook => ({
        id: l.id,
        tugas_id: l.assignment_tugas_id,
        tanggal: formatToIsoDate(l.tanggal),
        aktivitas: l.aktivitas,
        status: l.status || 'pending',
        nama_intern: l.nama_intern,
        intern_id: l.intern_id,
        tipe_data: l.tipe_data,
        link_progres: l.link_progres || null,
        file_path: l.file_path || null,
        catatan_mentor: l.catatan_pengumpulan || null
      }));

      setEvents(mappedTasks);
      setLogbooks(cleanedRawLogs);
    } catch (err) {
      showToast("error", "Gagal", "Gagal sinkronisasi data.");
    } finally {
      setLoading(false);
    }
  }, [currentRange, showToast]);

  // Fungsi jembatan untuk dipanggil dari component view kalender saat ganti bulan
  const handleRangeChange = useCallback((startStr: string, endStr: string) => {
    const cleanStart = startStr.split('T')[0];
    const cleanEnd = endStr.split('T')[0];
    setCurrentRange({ start: cleanStart, end: cleanEnd });
    fetchAllData(cleanStart, cleanEnd);
  }, [fetchAllData]);

  const fetchInterns = async () => {
    try {
      const res = await api.get("/v1/my-interns");
      const data = res.data?.data || [];
      setInternList(data.map((i: any) => ({ 
        id: i.intern_id, 
        name: i.nama_intern 
      })));
    } catch (err) {
      console.error("Gagal load intern");
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  // --- Event Handlers ---
  const handleDateClick = (selectInfo: DateSelectArg) => {
    const dateStr = selectInfo.startStr; 
    setSelectedDate(dateStr);
    
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const activeEvents = events.filter(event => {
      if (!event.start) return false;
      const eventStart = new Date(event.start);
      eventStart.setHours(0, 0, 0, 0);

      const eventEnd = event.end ? new Date(event.end) : new Date(event.start);
      eventEnd.setHours(23, 59, 59, 999);

      return targetDate >= eventStart && targetDate <= eventEnd;
    });

    setTasksOnSelectedDate(activeEvents);
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
    setEventTitle(task.title.replace("Task: ", ""));
    setEventDescription(task.extendedProps.description);
    setSelectedIntern(task.extendedProps.intern_id);
    const formattedDeadline = task.end?.replace(" ", "T").substring(0, 16) || "";
    setEventDeadline(formattedDeadline);
    setEventPrioritas(task.extendedProps.priority);
    setMenuModalOpen(false);
    setFormModalOpen(true);
  };

  const openDetailTask = (task: CalendarEvent) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const handleSaveTugas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        judul_tugas: eventTitle,
        deskripsi: eventDescription,
        intern_id: selectedIntern,
        deadline: eventDeadline.replace("T", " ") + ":00",
        prioritas: eventPrioritas
      };

      if (isEditMode && currentTaskId) {
        await taskService.updateTugas(currentTaskId, payload);
        showToast("success", "Berhasil", "Tugas diperbarui.");
      } else {
        await taskService.createTugas(payload);
        showToast("success", "Berhasil", "Tugas baru dikirim.");
      }
      setFormModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      showToast("error", "Kesalahan", err.response?.data?.message || "Gagal simpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTugas = async (id: string) => {
    if (!window.confirm("Hapus tugas ini?")) return;
    try {
      await taskService.deleteTugas(id);
      showToast("success", "Berhasil", "Tugas dihapus.");
      setMenuModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      showToast("error", "Gagal", err.response?.data?.message || "Gagal hapus.");
    }
  };

  const handleSaveLogbook = async (formData: FormData) => {
    setIsSubmittingLogbook(true);
    try {
      await logbookService.storeLogbook(formData);
      showToast("success", "Berhasil", "Logbook dikirim.");
      setLogbookModalOpen(false);
      fetchAllData();
    } catch (err) {
      showToast("error", "Gagal", "Gagal simpan logbook.");
    } finally {
      setIsSubmittingLogbook(false);
    }
  };

  const handleVerifyLogbook = async (id: string, data: { status: string; catatan: string }) => {
    setIsSubmittingLogbook(true);
    try {
      await logbookService.verifyLogbook(id, data);
      showToast("success", "Berhasil", "Verifikasi disimpan.");
      setVerifyModalOpen(false);
      setDetailModalOpen(false); 
      fetchAllData();
    } catch (err) {
      showToast("error", "Gagal", "Gagal verifikasi.");
    } finally {
      setIsSubmittingLogbook(false);
    }
  };

  return {
    events, internList, loading, notification,
    isSubmitting, isSubmittingLogbook,
    menuModalOpen, setMenuModalOpen,
    formModalOpen, setFormModalOpen,
    detailModalOpen, setDetailModalOpen,
    logbookModalOpen, setLogbookModalOpen,
    verifyModalOpen, setVerifyModalOpen, logbooks,     
    selectedDate, tasksOnSelectedDate,
    selectedTask, selectedLogbook, setSelectedLogbook,
    isEditMode, eventTitle, setEventTitle,
    eventDescription, setEventDescription,
    selectedIntern, setSelectedIntern,
    eventDeadline, setEventDeadline,
    eventPrioritas, setEventPrioritas,
    handleDateClick, openCreateForm, openEditForm, openDetailTask,
    handleSaveTugas, handleDeleteTugas, handleSaveLogbook, handleVerifyLogbook,
    handleRangeChange // Expose handler baru ke luar
  };
};