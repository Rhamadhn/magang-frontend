export interface CalendarEvent {
  id: string;
  title: string;
  start: string | undefined; 
  end: string | undefined;   
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    dbId: string;
    description: string;
    intern_id: string;
    status: string;
    priority: string;
    intern_name: string;
    type: 'tugas' | 'logbook';
    link_progres?: string | null;
    file_path?: string | null;
    catatan_mentor?: string | null;
  };
}

export interface Intern {
  id: string;
  name: string;
}

export interface NotificationState {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export interface Logbook {
  id: string;
  intern_id: string;
  tugas_id: string | null; // Untuk menampung assignment_tugas_id dari backend UNION
  tanggal: string;
  aktivitas: string;
  status: string; // Diubah ke string umum agar fleksibel menerima data status mentah/bersih dari backend
  catatan_mentor: string | null; // WAJIB DIUBAH: Menggantikan 'catatan' agar sinkron dengan modal & hook logic
  file_path?: string | null; 
  link_progres?: string | null; 
  nama_intern?: string; // Menyesuaikan properti response dari data UNION backend
  tipe_data?: 'logbook' | 'tugas'; // Penanda khusus asal objek data dari pipeline query backend
  tugas?: {
    id: string;
    judul_tugas: string;
  };
}