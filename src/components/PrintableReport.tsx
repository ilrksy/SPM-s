import React from 'react';
import { Subject } from '../types';

interface EligibleCourseSummary {
  id: string;
  name: string;
  universities: string[];
  minMerit?: number;
}

interface Props {
  subjects: Subject[];
  meritScore: number;
  pathway: 'spm' | 'stpm';
  eligibleCourses?: EligibleCourseSummary[];
}

export const PrintableReport: React.FC<Props> = ({ subjects, meritScore, pathway, eligibleCourses = [] }) => {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8 md:p-10 lg:p-12" id="printable-report">
      <div className="flex flex-col gap-4 border-b-2 border-emerald-900 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-emerald-950 sm:text-3xl lg:text-4xl">Laporan Kelayakan UPU</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Analisis Anggaran Markah Merit</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tarikh Laporan</div>
          <div className="text-sm font-mono font-bold text-slate-800">{new Date().toLocaleDateString('ms-MY')}</div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Aliran Pengajian</h3>
          <p className="text-lg font-black text-slate-900 sm:text-xl">{pathway === 'spm' ? 'SIJIL PELAJARAN MALAYSIA (SPM)' : 'SIJIL TINGGI PERSEKOLAHAN MALAYSIA (STPM)'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700">Markah Merit UPU</h3>
          <p className="text-4xl font-black text-emerald-950 sm:text-5xl">{meritScore.toFixed(2)}%</p>
        </div>
      </div>

      <h2 className="mt-8 mb-4 text-sm font-black uppercase tracking-[0.2em] text-slate-900">Ringkasan Subjek</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {subjects.map((s, i) => (
          <div key={i} className="flex items-center justify-between border-b border-slate-100 py-2.5">
            <span className="text-sm font-medium text-slate-700">{s.name}</span>
            <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-black text-slate-900">{s.grade}</span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-slate-900">Kursus Yang Layak</h2>
        {eligibleCourses.length > 0 ? (
          <div className="space-y-3">
            {eligibleCourses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-emerald-950">{course.name}</p>
                    <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                      Minimum Merit: {course.minMerit?.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    <span className="uppercase tracking-[0.2em] text-slate-400">Universiti:</span>{' '}
                    {course.universities.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
            Tiada kursus yang layak pada tahap merit semasa.
          </div>
        )}
      </div>

      <div className="mt-10 border-t border-slate-200 pt-5 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
        Laporan ini adalah anggaran sahaja. Sila rujuk portal rasmi UPU untuk maklumat tepat.
      </div>
    </div>
  );
};
