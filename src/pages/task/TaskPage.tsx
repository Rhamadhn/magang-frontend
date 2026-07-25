import React, { useState, useEffect } from 'react';
import { taskService } from '../../api/taskService';
import TaskList from './components/TaskList';
import TaskDetailDrawer from './components/TaskDetailDrawer';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

import { 
  TaskIcon, 
  TimeIcon, 
  CheckCircleIcon, 
  ErrorIcon 
} from "../../icons"; 

// 1. Tambahkan 'ongoing' ke dalam Union Type TaskStatus
export type TaskStatus = 'todo' | 'ongoing' | 'review' | 'selesai' | 'revisi';

export interface Task {
  id: number;
  judul_tugas: string;
  deskripsi: string;
  status: TaskStatus;
  deadline?: string;
  catatan_mentor?: string;
}

const TaskPage: React.FC = () => {
  // 2. Set default tab awal ke 'todo'
  const [activeTab, setActiveTab] = useState<TaskStatus>('todo');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getTugasList();
      if (response.data && response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat list tugas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter data berdasarkan tab aktif
  const filteredTasks = tasks.filter(task => task.status === activeTab);

  const handleOpenDetail = (id: number) => {
    setSelectedTaskId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTaskId(null);
  };

  return (
    <>
      <PageMeta title="Manajemen Tugas | Sistem Magang Terintegrasi" description="Pantau dan kumpulkan tugas harian internship" />
      <PageBreadcrumb pageTitle="Tugas & Progres" />

      <div className="space-y-6">
        <ComponentCard title="Manajemen & Pengumpulan Tugas">
          <p className="text-xs text-gray-500 -mt-2 mb-6">
            Pantau tugas harian kamu dan kirimkan progres langsung ke mentor.
          </p>

          {/* 3. Mengubah grid md:grid-cols-4 menjadi md:grid-cols-5 agar muat 5 kolom secara simetris */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 bg-gray-50 dark:bg-white/[0.03] p-2 rounded-xl">
            {/* 4. Masukkan 'ongoing' ke dalam array pemetaan status */}
            {(['todo', 'ongoing', 'review', 'selesai', 'revisi'] as const).map((tab) => {
              let TabIcon = TaskIcon;
              let label = '';
              let activeColorClass = '';

              if (tab === 'todo') {
                TabIcon = TaskIcon;
                label = 'To-Do';
                activeColorClass = 'bg-amber-500 text-white shadow-lg shadow-amber-500/20';
              } else if (tab === 'ongoing') {
                TabIcon = TimeIcon; // Menggunakan icon waktu untuk penanda sedang berjalan
                label = 'Ongoing';
                activeColorClass = 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20';
              } else if (tab === 'review') {
                TabIcon = TaskIcon;
                label = 'Review';
                activeColorClass = 'bg-blue-500 text-white shadow-lg shadow-blue-500/20';
              } else if (tab === 'selesai') {
                TabIcon = CheckCircleIcon;
                label = 'Selesai';
                activeColorClass = 'bg-green-600 text-white shadow-lg shadow-green-500/20';
              } else if (tab === 'revisi') {
                TabIcon = ErrorIcon; // Konsisten menggunakan ErrorIcon untuk status bermasalah/revisi
                label = 'Revisi';
                activeColorClass = 'bg-red-500 text-white shadow-lg shadow-red-500/20';
              }

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                    activeTab === tab
                      ? activeColorClass
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Konten Utama (Tabel / List) */}
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">
              Menghubungkan ke server dan mengambil data tugas...
            </div>
          ) : (
            <TaskList tasks={filteredTasks} onOpenDetail={handleOpenDetail} activeTab={activeTab} />
          )}
        </ComponentCard>
      </div>

      {/* Drawer Detail & Pengumpulan */}
      <TaskDetailDrawer
        isOpen={isDrawerOpen}
        taskId={selectedTaskId}
        onClose={handleCloseDrawer}
        onRefresh={fetchTasks}
      />
    </>
  );
};

export default TaskPage;