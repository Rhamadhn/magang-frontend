import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

// Import UI Komponen
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Alert from "../../components/ui/alert/Alert";

// Import Custom Hook & Sub-components
import { useCalendarLogic } from "./useCalendarLogic";
import { CalendarStyles } from "./components/CalendarStyles";
import { ActionMenuModal } from "./components/ActionMenuModal";
import { TaskFormModal } from "./components/TaskFormModal";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { LogbookVerifyModal } from "./components/LogbookVerifyModal";

// IMPORT SERVICE TUGAS UNTUK AKSES ENDPOINT VERIFIKASI PENGUMPULAN
import { taskService } from "../../api/taskService"; 

const TaskManagement: React.FC = () => {
  const {
    events,
    internList,
    logbooks,
    loading,
    isSubmitting,
    isSubmittingLogbook,
    menuModalOpen,
    setMenuModalOpen,
    formModalOpen,
    setFormModalOpen,
    detailModalOpen,
    setDetailModalOpen,
    verifyModalOpen,
    setVerifyModalOpen,
    selectedDate,
    tasksOnSelectedDate,
    notification,
    isEditMode,
    eventTitle,
    setEventTitle,
    eventDescription,
    setEventDescription,
    selectedIntern,
    setSelectedIntern,
    eventDeadline,
    setEventDeadline,
    eventPrioritas,
    setEventPrioritas,
    handleDateClick,
    openCreateForm,
    openEditForm,
    openDetailTask,
    handleSaveTugas,
    handleDeleteTugas,
    handleVerifyLogbook, // Handler logbook bawaan dari hook
    selectedTask,
    selectedLogbook,
    handleRangeChange,
  } = useCalendarLogic();

  // ================= HANDLER BARU KHUSUS VERIFIKASI PENGUMPULAN TUGAS =================
  const handleVerifyTask = async (id: string, data: { status: string; catatan: string }) => {
    try {
      // Petakan properti 'catatan' dari frontend ke payload yang diharapkan backend (jika perlu)
      const payload = {
        status_verifikasi: data.status,
        catatan_mentor: data.catatan
      };
      
      // Hit endpoint patch `/v1/pengumpulan/${id}/verify` yang sudah didefinisikan
      await taskService.verifySubmission(id, payload);
      
      // Menutup modal setelah berhasil mengeksekusi
      setDetailModalOpen(false);
      
      // Tips tambahan: Idealnya memicu fungsi refresh data global dari hook jika tersedia,
      // atau memicu reload halaman sementara agar state kalender diperbarui.
      window.location.reload(); 
    } catch (error) {
      console.error("Gagal melakukan verifikasi pengumpulan tugas:", error);
    }
  };

  // Memisahkan data berdasarkan tipe untuk dikirim ke ActionMenuModal
  const selectedTasks = tasksOnSelectedDate.filter(e => e.extendedProps.type === 'tugas');
  const selectedLogs = tasksOnSelectedDate.filter(e => e.extendedProps.type === 'logbook');

  return (
    <>
      <PageMeta title="Manajemen Tugas | Sistem Magang Terintergasi" description="Pantau tugas peserta magang melalui kalender" />
      <PageBreadcrumb pageTitle="Manajemen Tugas" />
      
      <CalendarStyles />

      {notification && (
        <div className="fixed bottom-6 right-6 z-[99999] w-full max-w-sm">
          <Alert variant={notification.variant} title={notification.title} message={notification.message} />
        </div>
      )}

      <div className="space-y-6">
        <ComponentCard title="Jadwal Penugasan Peserta Mangang">
          <div className="p-2 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center text-gray-500 font-medium">
                Menghubungkan ke server...
              </div>
            )}
            
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
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
              }}
              datesSet={(dateInfo) => {
                handleRangeChange(dateInfo.startStr, dateInfo.endStr);
              }}
            />
          </div>
        </ComponentCard>
      </div>

      {/* MODAL 1: Aksi Tanggal (List Tugas & Logbook) */}
      <ActionMenuModal
        isOpen={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
        selectedDate={selectedDate}
        tasks={selectedTasks}
        logbooks={selectedLogs}
        onOpenCreateForm={openCreateForm}
        onOpenEditForm={openEditForm}
        onDeleteTask={handleDeleteTugas}
        onOpenDetail={openDetailTask}
      />

      {/* MODAL 2: Form Create/Edit Tugas */}
      <TaskFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        internList={internList}
        selectedIntern={selectedIntern}
        setSelectedIntern={setSelectedIntern}
        eventPrioritas={eventPrioritas}
        setEventPrioritas={setEventPrioritas}
        eventTitle={eventTitle}
        setEventTitle={setEventTitle}
        eventDescription={eventDescription}
        setEventDescription={setEventDescription}
        eventDeadline={eventDeadline}
        setEventDeadline={setEventDeadline}
        onSubmit={handleSaveTugas}
      />

      {/* MODAL 3: Detail Tugas (DISESUAIKAN MENGGUNAKAN OPSI B) */}
      <TaskDetailModal 
        isOpen={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)} 
        task={selectedTask} 
        allLogbooks={logbooks} 
        onVerifyTask={handleVerifyTask} 
        onVerifyLogbook={handleVerifyLogbook} 
      />

      {/* MODAL 4: Verifikasi Logbook Mentor */}
      <LogbookVerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        logbook={selectedLogbook}
        onVerify={handleVerifyLogbook}
        isSubmitting={isSubmittingLogbook}
      />
    </>
  );
};

export default TaskManagement;