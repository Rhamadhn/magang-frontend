import React, { useEffect, useState } from "react";
import { evaluationService } from "../../../api/evaluationService";
import Button from "../../../components/ui/button/Button";
import { CheckCircleIcon, InfoIcon, HorizontaLDots } from "../../../icons";

interface Props {
  intern: any;
  periode: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const MentorEvaluationForm: React.FC<Props> = ({ intern, periode, onClose, onSuccess }) => {
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [penilaian, setPenilaian] = useState<Record<string, any>>({});
  
  // State Carousel & Validasi Backend
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, any>>({}); 

  // Definisi Opsi Enum Baru Sesuai Migration Database
  const LEVEL_OPTIONS = [
    { value: "cukup", label: "Cukup", badgeClass: "bg-amber-500 text-white" },
    { value: "baik", label: "Baik", badgeClass: "bg-blue-500 text-white" },
    { value: "sangat_baik", label: "Sangat Baik", badgeClass: "bg-green-500 text-white" },
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const resKriteria = await evaluationService.getKriteria();
        const rawKriteria = resKriteria.data.data || resKriteria.data;
        setKriteria(rawKriteria);

        const resExisting = await evaluationService.getInternEvaluation(intern.intern_id, periode);
        const existingData = resExisting.data.data || [];

        const initialPenilaian: any = {};
        rawKriteria.forEach((k: any) => {
          const match = existingData.find((ex: any) => ex.kriteria_id === k.id);
          initialPenilaian[k.id] = {
            kriteria_id: k.id,
            // Normalisasi ke lowercase agar pas dengan enum backend ('cukup', 'baik', 'sangat_baik')
            level: match ? match.level?.toLowerCase() : "cukup", 
            mengapa_level_ini: match ? match.mengapa_level_ini : "", 
            saran_pengembangan: match ? match.saran_pengembangan : ""
          };
        });

        setPenilaian(initialPenilaian);
      } catch (err) {
        console.error("Gagal sinkronisasi data evaluasi", err);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    if (intern && periode) {
      fetchAllData();
    }
  }, [intern, periode]);

  const handleLevelChange = (kriteriaId: string, level: string) => {
    setPenilaian(prev => ({
      ...prev,
      [kriteriaId]: { ...prev[kriteriaId], level }
    }));
    if (errors[kriteriaId]?.level) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[kriteriaId].level;
        return copy;
      });
    }
  };

  const handleInputChange = (kriteriaId: string, field: string, value: string) => {
    setPenilaian(prev => ({
      ...prev,
      [kriteriaId]: { ...prev[kriteriaId], [field]: value }
    }));
    if (errors[kriteriaId]?.[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[kriteriaId][field];
        return copy;
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const payload = {
        intern_id: intern.intern_id,
        periode: periode,
        penilaian: Object.values(penilaian)
      };
      await evaluationService.submitBulkEvaluation(payload);
      onSuccess();
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        const backendErrors = err.response.data.errors || {};
        const mappedErrors: Record<string, any> = {};
        let firstFailedIndex = -1;

        Object.keys(backendErrors).forEach((key) => {
          const match = key.match(/^penilaian\.(\d+)\.(.+)$/);
          if (match) {
            const indexInPayload = parseInt(match[1], 10);
            const fieldName = match[2];
            const targetKriteriaId = Object.keys(penilaian)[indexInPayload];

            if (targetKriteriaId) {
              if (!mappedErrors[targetKriteriaId]) {
                mappedErrors[targetKriteriaId] = {};
              }
              mappedErrors[targetKriteriaId][fieldName] = backendErrors[key][0] || backendErrors[key];
              
              if (firstFailedIndex === -1) {
                firstFailedIndex = kriteria.findIndex(k => k.id === targetKriteriaId);
              }
            }
          }
        });

        setErrors(mappedErrors);

        if (firstFailedIndex !== -1) {
          setCurrentStep(firstFailedIndex);
        }
      } else {
        console.error("Submit Error:", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="space-y-6 max-w-[850px] mx-auto animate-pulse">
      <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 flex justify-between items-center">
        <div className="flex items-center gap-4 w-2/3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
        <div className="w-24 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl h-[420px] p-8 space-y-6">
        <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
        <div className="grid grid-cols-12 gap-6 pt-4">
          <div className="col-span-5 space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
          </div>
          <div className="col-span-7 space-y-4">
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
            <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (kriteria.length === 0) return (
    <div className="p-12 text-center bg-gray-50 dark:bg-white/[0.02] rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
      <p className="text-gray-400 text-xs font-medium">Kriteria penilaian belum dikonfigurasi oleh Admin.</p>
      <Button variant="outline" className="mt-4 rounded-xl" onClick={onClose}>Kembali</Button>
    </div>
  );

  const activeKriteria = kriteria[currentStep];
  const totalSteps = kriteria.length;
  const currentKriteriaErrors = errors[activeKriteria?.id] || {};

  return (
    <div className="space-y-6 max-w-[850px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* HEADER UTAMA COMPONENT */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">Evaluasi Performa</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Peserta Magang: <span className="font-bold text-gray-700 dark:text-gray-300 uppercase">{intern.nama_intern}</span>
              <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
              Periode: <span className="font-bold text-gray-700 dark:text-gray-300">{periode}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-5 py-2.5 text-xs font-semibold">
            Batalkan
          </Button>
        </div>
      </div>

      {/* CAROUSEL CONTAINER CARD */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* CAROUSEL PROGRESS INDICATOR */}
        <div className="bg-gray-50/50 dark:bg-white/[0.01] px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">
              {currentStep + 1}
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Kriteria Kualitatif
            </span>
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Langkah {currentStep + 1} dari {totalSteps}
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-1 bg-gray-100 dark:bg-gray-800">
          <div 
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* SLIDE CONTENT AREA */}
        <div className="p-6 md:p-8 space-y-6 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-6">
            {/* Judul & Deskripsi Kriteria */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800/60">
              <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <HorizontaLDots className="w-4 h-4 text-brand-500" />
                {activeKriteria?.nama_kriteria}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic mt-1.5 pl-6">
                "{activeKriteria?.deskripsi_kriteria || "Tidak ada deskripsi panduan kriteria."}"
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* SELEKTOR TINGKAT LEVEL (Kiri) */}
              <div className="lg:col-span-5 space-y-3">
                <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                  Pilih Tingkat Kompetensi <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2.5">
                  {LEVEL_OPTIONS.map((opt) => {
                    const isSelected = penilaian[activeKriteria?.id]?.level === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleLevelChange(activeKriteria.id, opt.value)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all group ${
                          isSelected
                            ? 'border-brand-500 bg-brand-500/5 text-brand-600 dark:text-brand-400'
                            : 'border-gray-100 dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-white/[0.01] text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {opt.label}
                        </span>
                        
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md ${
                          isSelected 
                            ? opt.badgeClass
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600'
                        }`}>
                          {isSelected ? 'Terpilih' : 'Opsi'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* INPUT JUSTIFIKASI & SARAN (Kanan) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                    Justifikasi Penilaian <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Berikan bukti konkret atau alasan objektif mengapa peserta magang berada di level kompetensi ini..."
                    value={penilaian[activeKriteria?.id]?.mengapa_level_ini || ""}
                    onChange={(e) => handleInputChange(activeKriteria.id, 'mengapa_level_ini', e.target.value)}
                    className={`w-full text-xs rounded-xl border p-3.5 bg-transparent outline-none h-24 transition-all resize-none leading-relaxed ${
                      currentKriteriaErrors.mengapa_level_ini 
                        ? 'border-red-500 bg-red-50/5' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'
                    }`}
                  />
                  {currentKriteriaErrors.mengapa_level_ini && (
                    <span className="text-[11px] text-red-500 font-medium flex items-center gap-1 animate-in fade-in duration-200">
                      ● {currentKriteriaErrors.mengapa_level_ini}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                    Rekomendasi / Saran Pengembangan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Tuliskan saran konkret mengenai aspek teknis atau operasional yang perlu diperbaiki kedepannya..."
                    value={penilaian[activeKriteria?.id]?.saran_pengembangan || ""}
                    onChange={(e) => handleInputChange(activeKriteria.id, 'saran_pengembangan', e.target.value)}
                    className={`w-full text-xs rounded-xl border p-3.5 bg-transparent outline-none h-24 transition-all resize-none leading-relaxed ${
                      currentKriteriaErrors.saran_pengembangan 
                        ? 'border-red-500 bg-red-50/5' 
                        : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'
                    }`}
                  />
                  {currentKriteriaErrors.saran_pengembangan && (
                    <span className="text-[11px] text-red-500 font-medium flex items-center gap-1 animate-in fade-in duration-200">
                      ● {currentKriteriaErrors.saran_pengembangan}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INTERNAL CAROUSEL ACTION CONTROLS */}
          <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl px-5 font-semibold text-xs"
              onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
              disabled={currentStep === 0}
            >
              Kriteria Sebelumnya
            </Button>

            {currentStep < totalSteps - 1 ? (
              <Button
                size="sm"
                className="rounded-xl px-6 font-semibold text-xs"
                onClick={() => setCurrentStep(p => Math.min(totalSteps - 1, p + 1))}
              >
                Kriteria Berikutnya
              </Button>
            ) : (
              <Button
                size="sm"
                className="rounded-xl px-8 font-bold text-xs bg-brand-500 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Kunci & Kirim Seluruh Nilai"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER INFORMASI */}
      <div className="p-4 px-6 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800/60 rounded-xl flex items-center gap-3">
        <InfoIcon className="w-4 h-4 text-blue-500 shrink-0" />
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
          Seluruh rekaman form evaluasi bulanan ini akan dikunci dan dijadikan acuan penilaian akhir peserta magang secara permanen.
        </p>
      </div>
    </div>
  );
};