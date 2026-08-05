import React, { useState, useEffect } from 'react';
import { taskService } from '../../api/taskService';
import TaskList from './components/TaskList';
import TaskDetailDrawer from './components/TaskDetailDrawer';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

import { 
  SearchIcon,
  ChevronDownIcon,
  AlertHexaIcon
} from "../../icons"; 

export type TaskStatus = 'todo' | 'ongoing' | 'review' | 'selesai' | 'revisi';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskFilterType = 'all' | TaskStatus;

export interface Task {
  id: string | number;
  judul_tugas: string;
  deskripsi: string;
  status: TaskStatus;
  prioritas?: TaskPriority;
  deadline?: string;
  catatan_mentor?: string;
}

const TaskPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TaskFilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isUrgentOnly, setIsUrgentOnly] = useState<boolean>(false);

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

  // Hitung jumlah tugas urgent yang belum selesai
  const urgentTasksCount = tasks.filter(
    t => t.prioritas === 'urgent' && t.status !== 'selesai' && t.status !== 'review'
  ).length;

  // Logika Filter: Jika Urgent Mode aktif, ambil prioritas 'urgent'. Jika tidak, ikuti Dropdown Status.
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.judul_tugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

    if (isUrgentOnly) {
      return task.prioritas === 'urgent' && matchesSearch;
    }

    const matchesStatus = activeTab === 'all' || task.status === activeTab;
    return matchesStatus && matchesSearch;
  });

  const handleOpenDetail = (id: string | number) => {
    setSelectedTaskId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTaskId(null);
  };

  // Switch Dropdown: Jika user ganti dropdown status, matikan filter urgent
  const handleStatusChange = (status: TaskFilterType) => {
    setIsUrgentOnly(false);
    setActiveTab(status);
  };

  // Toggle Banner Urgent: Jika diklik, reset dropdown ke 'all' dan toggle mode urgent
  const handleFilterUrgentToggle = () => {
    setActiveTab('all');
    setIsUrgentOnly(!isUrgentOnly);
  };

  return (
    <>
      <PageMeta title="Manajemen Tugas | Sistem Magang Terintegrasi" description="Pantau dan kumpulkan tugas harian internship" />
      <PageBreadcrumb pageTitle="Tugas & Progres" />

      {/* BANNER NOTIFIKASI TUGAS URGENT */}
      {urgentTasksCount > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-red-500/5">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center p-2.5 rounded-xl bg-red-600 text-white shrink-0 shadow-md shadow-red-600/30">
              <AlertHexaIcon 
                className="w-5 h-5 text-white fill-current" 
                style={{ fill: '#ffffff', color: '#ffffff', stroke: '#ffffff' }} 
              />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Perhatian Khusus!
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                Kamu memiliki <span className="font-extrabold text-red-600 dark:text-red-400">{urgentTasksCount} tugas URGENT</span> yang memerlukan penanganan segera!
              </p>
            </div>
          </div>
          
          <button
            onClick={handleFilterUrgentToggle}
            className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 shrink-0 shadow-md active:scale-95 ${
              isUrgentOnly
                ? 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-white dark:text-gray-900'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
            }`}
          >
            {isUrgentOnly ? 'Tampilkan Semua Tugas' : 'Tampilkan Tugas Urgent'}
          </button>
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Manajemen & Pengumpulan Tugas">
          <p className="text-xs text-gray-500 -mt-2 mb-6">
            Pantau tugas harian kamu dan kirimkan progres langsung ke mentor.
          </p>

          {/* BARIS FILTER & SEARCH */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <SearchIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari judul atau deskripsi tugas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 text-gray-800 dark:text-white transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {isUrgentOnly && (
                <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 rounded-lg">
                  🔥 Mode Urgent
                </span>
              )}
              <span className="text-xs font-medium text-gray-500 hidden md:inline">
                Filter Status:
              </span>
              <div className="relative w-full sm:w-48">
                <select
                  value={isUrgentOnly ? 'all' : activeTab}
                  onChange={(e) => handleStatusChange(e.target.value as TaskFilterType)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 text-xs font-semibold bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
                >
                  <option value="all" className="dark:bg-gray-900">Semua Status ({tasks.length})</option>
                  <option value="todo" className="dark:bg-gray-900">To-Do ({tasks.filter(t => t.status === 'todo').length})</option>
                  <option value="ongoing" className="dark:bg-gray-900">Ongoing ({tasks.filter(t => t.status === 'ongoing').length})</option>
                  <option value="review" className="dark:bg-gray-900">Review ({tasks.filter(t => t.status === 'review').length})</option>
                  <option value="selesai" className="dark:bg-gray-900">Selesai ({tasks.filter(t => t.status === 'selesai').length})</option>
                  <option value="revisi" className="dark:bg-gray-900">Revisi ({tasks.filter(t => t.status === 'revisi').length})</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <ChevronDownIcon className="w-4 h-4" />
                </span>
              </div>
            </div>

          </div>

          {/* Konten Utama */}
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">
              Menghubungkan ke server dan mengambil data tugas...
            </div>
          ) : (
            <TaskList tasks={filteredTasks} onOpenDetail={handleOpenDetail} activeTab={isUrgentOnly ? 'urgent' : activeTab} />
          )}
        </ComponentCard>
      </div>

      {/* Drawer Detail */}
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