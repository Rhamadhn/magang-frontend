import React from 'react';
import { Task } from '../TaskPage';
import TaskCard from './TaskCard';

// Menggunakan icon bawaan template agar konsisten secara visual
import { TaskIcon } from "../../../icons"; 

interface TaskListProps {
  tasks: Task[];
  onOpenDetail: (id: number) => void;
  activeTab: string;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onOpenDetail, activeTab }) => {
  if (tasks.length === 0) {
    // 🛠️ PERBAIKAN: Menambahkan 'ongoing' ke dalam kamus mapping label status
    const statusLabels: Record<string, string> = {
      todo: 'To-Do',
      ongoing: 'Ongoing',
      review: 'Review',
      selesai: 'Selesai',
      revisi: 'Revisi'
    };

    const currentLabel = statusLabels[activeTab] || activeTab;

    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-12 flex flex-col items-center text-center bg-gray-50/30 dark:bg-white/[0.01]">
        {/* Mengganti emoji AI/Default dengan Icon Template yang dibungkus lingkaran estetik */}
        <div className="w-14 h-14 bg-gray-100 dark:bg-white/[0.05] text-gray-400 rounded-full flex items-center justify-center mb-4">
          <TaskIcon className="w-7 h-7" />
        </div>
        
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">
          Tidak Ada Tugas
        </h3>
        <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
          Saat ini tidak ada tugas dengan klasifikasi status <span className="font-semibold text-brand-500 dark:text-brand-400 uppercase">"{currentLabel}"</span> yang perlu ditampilkan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  );
};

export default TaskList;