import React from 'react';
import { Subject } from '../types';

interface Props {
  subjects: Subject[];
  meritScore: number;
  pathway: 'spm' | 'stpm';
}

export const PrintableReport: React.FC<Props> = ({ subjects, meritScore, pathway }) => {
  return (
    <div className="p-12 bg-white text-slate-900 shadow-2xl rounded-lg max-w-4xl mx-auto" id="printable-report">
      <div className="flex justify-between items-start border-b-2 border-emerald-900 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase text-emerald-950 tracking-tighter">Laporan Kelayakan UPU</h1>
          <p className="text-sm text-slate-500 font-medium">Analisis Anggaran Markah Merit</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tarikh Laporan</div>
          <div className="text-sm font-mono font-bold text-slate-800">{new Date().toLocaleDateString('ms-MY')}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Aliran Pengajian</h3>
          <p className="text-2xl font-black text-slate-900">{pathway === 'spm' ? 'SIJIL PELAJARAN MALAYSIA (SPM)' : 'SIJIL TINGGI PERSEKOLAHAN MALAYSIA (STPM)'}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Markah Merit UPU</h3>
          <p className="text-5xl font-black text-emerald-950">{meritScore.toFixed(2)}%</p>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-5 text-slate-900 uppercase tracking-wide">Ringkasan Subjek</h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {subjects.map((s, i) => (
          <div key={i} className="flex justify-between items-center border-b border-slate-100 py-2">
            <span className="text-sm font-medium text-slate-700">{s.name}</span>
            <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-md">{s.grade}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-12 pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Laporan ini adalah anggaran sahaja. Sila rujuk portal rasmi UPU untuk maklumat tepat.
      </div>
    </div>
  );
};
