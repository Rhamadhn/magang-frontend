// src/pages/TaskManagement/components/CalendarStyles.tsx
import React from "react";

export const CalendarStyles: React.FC = () => (
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
);