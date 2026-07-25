import React, { useEffect, useState } from "react";
import { evaluationService } from "../../api/evaluationService";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { CheckCircleIcon, InfoIcon } from "../../icons";

export default function MyEvaluationPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEval = async () => {
      try {
        const res = await evaluationService.getMyEvaluations();
        setEvaluations(res.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEval();
  }, []);

  return (
    <>
      <PageMeta title="Evaluasi Saya" description="Lihat hasil penilaian mentor" />
      <div className="space-y-6">
        <div className="p-8 rounded-[2rem] bg-brand-500 text-white shadow-xl shadow-brand-500/20">
          <h1 className="text-2xl font-black italic">RAPOR MAGANG</h1>
          <p className="opacity-80 text-sm">Pantau perkembangan kompetensimu setiap bulan di sini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Memuat hasil evaluasi...</p>
          ) : evaluations.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed">
               <p className="text-gray-500 text-sm italic">Belum ada evaluasi yang diterbitkan oleh Mentor.</p>
            </div>
          ) : evaluations.map((item) => (
            <ComponentCard key={item.periode} title={`Periode ${item.periode}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rata-rata</span>
                   <span className="text-lg font-black text-brand-600 uppercase">{item.average_level || "Menengah"}</span>
                </div>
                <button className="w-full py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                  Lihat Detail Nilai
                </button>
              </div>
            </ComponentCard>
          ))}
        </div>
      </div>
    </>
  );
}