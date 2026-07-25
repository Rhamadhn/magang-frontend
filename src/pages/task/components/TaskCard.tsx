import React from 'react';
import { Task } from '../TaskPage';

// Menggunakan icon bawaan template agar konsisten secara visual
import { CalenderIcon } from "../../../icons"; 

interface TaskCardProps {
  task: Task;
  onOpenDetail: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onOpenDetail }) => {
  // Menyelaraskan warna status badge dengan design system template
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'todo': 
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
      case 'ongoing': 
        // 🛠️ Ditambahkan: Aksen Indigo profesional untuk status pengerjaan aktif
        return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
      case 'review': 
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
      case 'selesai': 
        return 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20';
      case 'revisi': 
        return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20';
      default: 
        return 'bg-gray-50 dark:bg-white/[0.03] text-gray-500 border-gray-100 dark:border-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'To-Do';
      case 'ongoing': return 'Ongoing'; // 🛠️ Ditambahkan
      case 'review': return 'Review';
      case 'selesai': return 'Selesai';
      case 'revisi': return 'Revisi';
      default: return status;
    }
  };

  return (
    <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${getStatusStyle(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
          {task.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
              <CalenderIcon className="w-3.5 h-3.5" />
              <span>
                {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}
        </div>
        <h3 className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1 mb-1.5">{task.judul_tugas}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">{task.deskripsi}</p>
      </div>

      {/* Catatan Revisi Mentor */}
      {task.status === 'revisi' && task.catatan_mentor && (
        <div className="mb-4 p-3 bg-red-50/60 dark:bg-red-500/5 text-[11px] text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-500/10 line-clamp-2 leading-relaxed">
          <strong className="font-bold uppercase tracking-wider text-[10px] block mb-0.5 text-red-700 dark:text-red-300">Catatan Mentor:</strong> 
          "{task.catatan_mentor}"
        </div>
      )}

      {/* Tombol aksi disesuaikan dengan button style di DivisionPage */}
      <button
        onClick={() => onOpenDetail(task.id)}
        className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-300 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white border border-gray-100 dark:border-gray-800/80 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-200 outline-none"
      >
        Lihat Detail & Submit
      </button>
    </div>
  );
};

export default TaskCard;