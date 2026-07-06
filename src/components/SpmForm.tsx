import React, { useState } from 'react';
import { SpmData, Subject, TemplateStyle, StudentInfo } from '../types';
import { COMMON_SUBJECTS, GRADES, GRADES_MAP, PRESETS, checkSpmEligibility } from '../data/defaultData';
import { Plus, Trash2, RotateCcw, Award, CheckCircle, AlertTriangle, FileText, Settings, User, BookOpen } from 'lucide-react';

interface SpmFormProps {
  data: SpmData;
  onChange: (newData: SpmData) => void;
  lang?: 'bm' | 'en';
}

export default function SpmForm({ data, onChange, lang = 'bm' }: SpmFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('pureScience');
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState<boolean>(false);

  // Load a preset
  const handleLoadPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const preset = PRESETS[presetKey];
    if (preset) {
      onChange(JSON.parse(JSON.stringify(preset.data)));
    }
  };

  // Reset to initial default template values (Pure Science stream)
  const handleResetToDefault = () => {
    setSelectedPreset('pureScience');
    onChange(JSON.parse(JSON.stringify(PRESETS.pureScience.data)));
  };

  // Update Student Info
  const handleStudentInfoChange = (field: keyof StudentInfo, value: string) => {
    onChange({
      ...data,
      studentInfo: {
        ...data.studentInfo,
        [field]: value.toUpperCase(),
      },
    });
  };

  // Update oral test results
  const handleOralChange = (field: 'bmOral' | 'biOral', value: string) => {
    onChange({
      ...data,
      oralResults: {
        ...data.oralResults,
        [field]: value.toUpperCase(),
      },
    });
  };

  // Update CEFR
  const handleCefrChange = (value: string) => {
    onChange({
      ...data,
      cefrLevel: value.toUpperCase(),
    });
  };

  // Update Template Style
  const handleStyleChange = (style: TemplateStyle) => {
    onChange({
      ...data,
      templateStyle: style,
    });
  };

  // Update Subject field
  const handleSubjectChange = (id: string, field: keyof Subject, value: string) => {
    const updatedSubjects = data.subjects.map((sub) => {
      if (sub.id === id) {
        let updatedSub = { ...sub, [field]: value };
        if (field === 'grade') {
          const gUpper = value.toUpperCase();
          updatedSub.grade = gUpper;
          updatedSub.description = GRADES_MAP[gUpper]?.malay || 'CEMERLANG';
        }
        if (field === 'code' || field === 'name') {
          updatedSub[field] = value.toUpperCase();
        }
        return updatedSub;
      }
      return sub;
    });

    onChange({
      ...data,
      subjects: updatedSubjects,
    });
  };

  // Delete Subject
  const handleDeleteSubject = (id: string) => {
    onChange({
      ...data,
      subjects: data.subjects.filter((sub) => sub.id !== id),
    });
  };

  // Add Custom Subject
  const handleAddSubject = (code = '', name = '', grade = 'A') => {
    const newSubject: Subject = {
      id: Math.random().toString(36).substring(2, 11),
      code: code || '',
      name: name.toUpperCase() || (lang === 'bm' ? 'SUBJEK BAHARU' : 'NEW SUBJECT'),
      grade: grade,
      description: GRADES_MAP[grade]?.malay || 'CEMERLANG',
    };

    onChange({
      ...data,
      subjects: [...data.subjects, newSubject],
    });
  };

  // Add from suggested subjects catalog
  const handleAddCatalogSubject = (item: typeof COMMON_SUBJECTS[0]) => {
    // Check if subject code already exists
    if (data.subjects.some(sub => sub.code === item.code)) {
      if (lang === 'bm') {
        alert(`Mata pelajaran ${item.nameMalay} (${item.code}) sudah ada dalam senarai.`);
      } else {
        alert(`Subject ${item.nameEnglish} (${item.code}) is already in the list.`);
      }
      return;
    }
    handleAddSubject(item.code, lang === 'bm' ? item.nameMalay : item.nameEnglish, 'A');
    setShowSubjectSuggestions(false);
  };

  // Calculate automated status
  const autoEligibility = checkSpmEligibility(data.subjects);

  // Autoeligibility reason localized text
  const getLocalizedReason = () => {
    if (lang === 'bm') return autoEligibility.reason;
    const isEligible = autoEligibility.isEligible;
    if (isEligible) {
      return "Candidate has successfully passed both Bahasa Melayu and History with Grade E or above, qualifying for the SPM Certificate.";
    } else {
      return "Candidate has failed to achieve at least Grade E (Pass) in either Bahasa Melayu or History, and is therefore not eligible for the certificate.";
    }
  };

  const getOralLabel = (val: string) => {
    if (lang === 'bm') return val;
    switch (val) {
      case 'CEMERLANG': return 'EXCELLENT';
      case 'KEPUJIAN': return 'CREDIT';
      case 'MEMUASKAN': return 'SATISFACTORY';
      case 'PENCAPAIAN MINIMUM': return 'MINIMUM ACHIEVEMENT';
      case 'TIDAK MENCAPAI TAHAP': return 'BELOW EXSPECTATIONS';
      default: return val;
    }
  };

  return (
    <div className="space-y-6" id="spm-form-container">
      {/* RESET TO DEFAULT ACTION CARD */}
      <div className="bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-lg shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
              {lang === 'bm' ? 'Set Semula Templat' : 'Reset Template'}
            </h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              {lang === 'bm' ? 'Kembalikan semua butiran & gred kepada nilai asal.' : 'Revert all details & grades to default values.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          id="btn-reset-to-default"
          onClick={handleResetToDefault}
          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {lang === 'bm' ? 'Semula Asal (Reset)' : 'Reset Default'}
        </button>
      </div>

      {/* 1. PRESETS BAR */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
          <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {lang === 'bm' ? 'Pilih Templat Keputusan Calon (Presets)' : 'Select Candidate Stream Presets'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, value]) => {
            const labelEn = key === 'pureScience' ? 'Science Stream (Excellent)' :
                           key === 'perfectScore' ? 'Perfect Score (Straight A+)' :
                           key === 'humanitiesStream' ? 'Business & Arts Stream' : value.label;
            return (
              <button
                key={key}
                type="button"
                id={`preset-btn-${key}`}
                onClick={() => handleLoadPreset(presetKey => key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-250 cursor-pointer ${
                  selectedPreset === key
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/80'
                }`}
              >
                {lang === 'bm' ? value.label : labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. STYLE SELECTOR */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {lang === 'bm' ? 'Format Dokumen / Gaya Cetakan' : 'Document Format / Print Style'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            id="style-btn-slip"
            onClick={() => handleStyleChange('slip')}
            className={`p-4 rounded-xl border text-left transition-all duration-200 relative ${
              data.templateStyle === 'slip'
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/25 ring-1 ring-emerald-500'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full">
                {lang === 'bm' ? 'Popular' : 'Popular'}
              </span>
              {data.templateStyle === 'slip' && <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 animate-pulse" />}
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {lang === 'bm' ? 'Slip Keputusan SPM' : 'SPM Result Slip'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {lang === 'bm' 
                ? 'Format slip putih kertas keputusan rasmi Kementerian Pendidikan Malaysia (KPM).' 
                : 'Official Ministry of Education (KPM) result slip white sheet layout.'}
            </p>
          </button>

          <button
            type="button"
            id="style-btn-sijil"
            onClick={() => handleStyleChange('sijil')}
            className={`p-4 rounded-xl border text-left transition-all duration-200 relative ${
              data.templateStyle === 'sijil'
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/25 ring-1 ring-emerald-500'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-400 tracking-wider uppercase bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-full">
                {lang === 'bm' ? 'Sijil Rasmi' : 'Official Cert'}
              </span>
              {data.templateStyle === 'sijil' && <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 animate-pulse" />}
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {lang === 'bm' ? 'Sijil Pelajaran Malaysia' : 'SPM Certificate'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {lang === 'bm' 
                ? 'Format sijil berbingkai hijau/cream dwi-bahasa Lembaga Peperiksaan.' 
                : 'Examinations Board green-framed high-contrast bilingual certificate format.'}
            </p>
          </button>
        </div>
      </div>

      {/* 3. CANDIDATE PERSONAL INFO */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {lang === 'bm' ? 'Butiran Peribadi Calon' : 'Candidate Personal Details'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              {lang === 'bm' ? 'Nama Penuh Calon' : 'Candidate Full Name'}
            </label>
            <input
              type="text"
              id="input-student-name"
              value={data.studentInfo.name}
              onChange={(e) => handleStudentInfoChange('name', e.target.value)}
              placeholder={lang === 'bm' ? "CONTOH: MUHAMMAD ALI BIN ABU" : "EXAMPLE: MUHAMMAD ALI BIN ABU"}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              {lang === 'bm' ? 'No. Kad Pengenalan' : 'Identity Card (IC) No.'}
            </label>
            <input
              type="text"
              id="input-student-ic"
              value={data.studentInfo.icNumber}
              onChange={(e) => handleStudentInfoChange('icNumber', e.target.value)}
              placeholder="CONTOH: 040903-03-0363"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              {lang === 'bm' ? 'Angka Giliran' : 'Seat / Index Number'}
            </label>
            <input
              type="text"
              id="input-student-index"
              value={data.studentInfo.angkaGiliran}
              onChange={(e) => handleStudentInfoChange('angkaGiliran', e.target.value)}
              placeholder="CONTOH: DF303C005"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              {lang === 'bm' ? 'Nama Sekolah' : 'School Name'}
            </label>
            <input
              type="text"
              id="input-student-school"
              value={data.studentInfo.schoolName}
              onChange={(e) => handleStudentInfoChange('schoolName', e.target.value)}
              placeholder="CONTOH: SMK SERI BINTANG UTARA"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              {lang === 'bm' ? 'Tahun Peperiksaan' : 'Examination Year'}
            </label>
            <input
              type="text"
              id="input-exam-year"
              value={data.studentInfo.examYear}
              onChange={(e) => handleStudentInfoChange('examYear', e.target.value)}
              placeholder="2021"
              maxLength={4}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === 'bm' ? 'No. Siri Sijil' : 'Certificate Serial No.'}</span>
              <span className="text-[9.5px] text-amber-600 dark:text-amber-400 font-bold normal-case">
                {lang === 'bm' ? 'Hanya format Sijil' : 'Cert format only'}
              </span>
            </label>
            <input
              type="text"
              id="input-serial-number"
              value={data.studentInfo.serialNumber}
              onChange={(e) => handleStudentInfoChange('serialNumber', e.target.value)}
              placeholder="A 02651054"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-900 text-rose-700 dark:text-rose-400 font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* 4. SUBJECT MANAGER */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider text-xs">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {lang === 'bm' ? `Mata Pelajaran & Gred (${data.subjects.length} Subjek)` : `Subjects & Grades (${data.subjects.length} Subjects)`}
          </h3>
          <div className="relative">
            <button
              type="button"
              id="add-subject-catalog-toggle"
              onClick={() => setShowSubjectSuggestions(!showSubjectSuggestions)}
              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-200/50 dark:border-emerald-900/50"
            >
              <Plus className="w-3.5 h-3.5" />
              {lang === 'bm' ? 'Pilih Subjek Lazim' : 'Choose Common Subject'}
            </button>

            {showSubjectSuggestions && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-2 max-h-64 overflow-y-auto">
                <div className="px-3 py-1.5 text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase border-b border-slate-100 dark:border-slate-700 mb-1">
                  {lang === 'bm' ? 'Mata Pelajaran KPM (SPM)' : 'KPM Subjects (SPM)'}
                </div>
                {COMMON_SUBJECTS.map((item) => {
                  const alreadyHas = data.subjects.some(sub => sub.code === item.code);
                  const nameStr = lang === 'bm' ? item.nameMalay : item.nameEnglish;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      disabled={alreadyHas}
                      onClick={() => handleAddCatalogSubject(item)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${
                        alreadyHas ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : 'cursor-pointer'
                      }`}
                    >
                      <div className="font-bold text-slate-700 dark:text-slate-200 truncate mr-2">
                        {item.code} - {nameStr}
                      </div>
                      {alreadyHas ? (
                        <span className="text-[9px] text-slate-400 font-normal">{lang === 'bm' ? 'Sudah Ada' : 'Added'}</span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                          {lang === 'bm' ? 'Tambah' : 'Add'}
                        </span>
                      )}
                    </button>
                  );
                })}
                <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-1 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSubject('', '', 'A');
                      setShowSubjectSuggestions(false);
                    }}
                    className="w-full text-center py-1.5 hover:bg-emerald-550 hover:text-white rounded-lg text-[10px] text-emerald-600 dark:text-emerald-400 font-bold transition-all cursor-pointer"
                  >
                    + {lang === 'bm' ? 'Bina Subjek Tersendiri' : 'Create Custom Subject'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subjects list rows */}
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {data.subjects.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {lang === 'bm' ? 'Tiada mata pelajaran disenaraikan.' : 'No subjects listed.'}
              </p>
              <button
                type="button"
                onClick={() => handleAddSubject('1103', 'BAHASA MELAYU', 'A')}
                className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
              >
                + {lang === 'bm' ? 'Tambah Subjek BM Pertama' : 'Add First BM Subject'}
              </button>
            </div>
          ) : (
            data.subjects.map((subject, index) => (
              <div
                key={subject.id}
                className="p-2.5 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/65 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 sm:gap-3 transition-colors duration-150"
              >
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-5 text-center font-mono">
                  {index + 1}
                </div>

                {/* Subject Code */}
                <div className="w-16 sm:w-20">
                  <input
                    type="text"
                    value={subject.code}
                    onChange={(e) => handleSubjectChange(subject.id, 'code', e.target.value)}
                    placeholder={lang === 'bm' ? "Kod" : "Code"}
                    maxLength={5}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md font-mono font-bold text-center bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Subject Name */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                    placeholder={lang === 'bm' ? "Nama Mata Pelajaran" : "Subject Name"}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Grade Dropdown */}
                <div className="w-16">
                  <select
                    value={subject.grade}
                    onChange={(e) => handleSubjectChange(subject.id, 'grade', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md font-black text-center bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="hidden lg:block text-slate-400 dark:text-slate-500 text-[10px] w-24 truncate font-bold uppercase">
                  {lang === 'bm' ? subject.description : (GRADES_MAP[subject.grade]?.english || subject.description)}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md text-slate-400 dark:text-slate-500 hover:text-rose-650 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title={lang === 'bm' ? "Padam subjek" : "Delete subject"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-2 justify-between items-center text-center">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
            {lang === 'bm' 
              ? '💡 Gred BM (1103) & Sejarah (1249) wajib sekurang-kurangnya gred E (Lulus) untuk layak Sijil.' 
              : '💡 BM (1103) & History (1249) require at least grade E (Pass) to be eligible for certificate.'}
          </span>
          <button
            type="button"
            id="btn-add-empty-subject"
            onClick={() => handleAddSubject('', '', 'B')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold flex items-center gap-1 shrink-0"
          >
            + {lang === 'bm' ? 'Bina Baris Subjek' : 'Add Subject Line'}
          </button>
        </div>
      </div>

      {/* 5. ORAL TESTS & CEFR LEVEL */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {lang === 'bm' ? 'Ujian Lisan & Tahap CEFR Bahasa Inggeris' : 'Oral Tests & English CEFR Standard'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              {lang === 'bm' ? 'Ujian Lisan BM' : 'BM Oral Test'}
            </label>
            <select
              value={data.oralResults.bmOral}
              onChange={(e) => handleOralChange('bmOral', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold outline-none"
            >
              <option value="CEMERLANG">{lang === 'bm' ? 'CEMERLANG' : 'EXCELLENT'}</option>
              <option value="KEPUJIAN">{lang === 'bm' ? 'KEPUJIAN' : 'CREDIT'}</option>
              <option value="MEMUASKAN">{lang === 'bm' ? 'MEMUASKAN' : 'SATISFACTORY'}</option>
              <option value="PENCAPAIAN MINIMUM">{lang === 'bm' ? 'PENCAPAIAN MINIMUM' : 'MINIMUM ACHIEVEMENT'}</option>
              <option value="TIDAK MENCAPAI TAHAP">{lang === 'bm' ? 'TIDAK MENCAPAI TAHAP' : 'BELOW EXPECTATIONS'}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              {lang === 'bm' ? 'Ujian Lisan BI' : 'BI Oral Test'}
            </label>
            <select
              value={data.oralResults.biOral}
              onChange={(e) => handleOralChange('biOral', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold outline-none"
            >
              <option value="CEMERLANG">{lang === 'bm' ? 'CEMERLANG' : 'EXCELLENT'}</option>
              <option value="KEPUJIAN">{lang === 'bm' ? 'KEPUJIAN' : 'CREDIT'}</option>
              <option value="MEMUASKAN">{lang === 'bm' ? 'MEMUASKAN' : 'SATISFACTORY'}</option>
              <option value="PENCAPAIAN MINIMUM">{lang === 'bm' ? 'PENCAPAIAN MINIMUM' : 'MINIMUM ACHIEVEMENT'}</option>
              <option value="TIDAK MENCAPAI TAHAP">{lang === 'bm' ? 'TIDAK MENCAPAI TAHAP' : 'BELOW EXPECTATIONS'}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              {lang === 'bm' ? 'Tahap CEFR BI (1119)' : 'BI CEFR Level (1119)'}
            </label>
            <select
              value={data.cefrLevel}
              onChange={(e) => handleCefrChange(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black outline-none"
            >
              <option value="C2">C2 ({lang === 'bm' ? 'Cemerlang Tertinggi' : 'Highest Excellence'})</option>
              <option value="C1">C1 ({lang === 'bm' ? 'Cemerlang' : 'Excellence'})</option>
              <option value="B2">B2 ({lang === 'bm' ? 'Kepujian Tinggi' : 'High Merit'})</option>
              <option value="B1">B1 ({lang === 'bm' ? 'Kepujian' : 'Merit'})</option>
              <option value="A2">A2 ({lang === 'bm' ? 'Lulus' : 'Pass'})</option>
              <option value="A1">A1 ({lang === 'bm' ? 'Asas' : 'Basic'})</option>
              <option value="TIADA">{lang === 'bm' ? 'TIADA TAHAP' : 'NO CEFR STANDARD'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. STATUS KELAYAKAN SIJIL */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2 uppercase tracking-wider text-xs">
          <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {lang === 'bm' ? 'Status Kelayakan Sijil KPM' : 'KPM Certificate Eligibility Status'}
        </h3>

        <div className="p-3.5 rounded-lg border flex items-start gap-3 bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-700">
          <div className="mt-0.5 shrink-0">
            {autoEligibility.isEligible ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase flex flex-wrap items-center gap-2">
              <span>{lang === 'bm' ? 'Pengiraan Automatik KPM:' : 'Automated KPM Calculation:'}</span>
              <span className={`px-2 py-0.5 rounded text-[9.5px] font-black ${
                autoEligibility.isEligible ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }`}>
                {autoEligibility.isEligible 
                  ? (lang === 'bm' ? 'LAYAK MENDAPAT SIJIL' : 'ELIGIBLE FOR CERTIFICATE') 
                  : (lang === 'bm' ? 'TIDAK LAYAK' : 'NOT ELIGIBLE')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {getLocalizedReason()}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
            {lang === 'bm' ? 'Override Kelayakan Manual (Papar di Dokumen)' : 'Manual Eligibility Override (Display on Document)'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              id="override-auto-btn"
              onClick={() => onChange({ ...data, isEligibleOverride: null })}
              className={`px-2 py-2 text-[10.5px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                data.isEligibleOverride === null
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {lang === 'bm' ? 'Automatik' : 'Automatic'}
            </button>
            <button
              type="button"
              id="override-eligible-btn"
              onClick={() => onChange({ ...data, isEligibleOverride: true })}
              className={`px-2 py-2 text-[10.5px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                data.isEligibleOverride === true
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {lang === 'bm' ? 'Paksa LAYAK' : 'Force PASS'}
            </button>
            <button
              type="button"
              id="override-not-eligible-btn"
              onClick={() => onChange({ ...data, isEligibleOverride: false })}
              className={`px-2 py-2 text-[10.5px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                data.isEligibleOverride === false
                  ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {lang === 'bm' ? 'Paksa GAGAL' : 'Force FAIL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
