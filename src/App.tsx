import React, { useState, useEffect } from 'react';
import { SpmData } from './types';
import { PRESETS } from './data/defaultData';
import SpmForm from './components/SpmForm';
import SpmPreview from './components/SpmPreview';
import UpuEligibilityCalculator from './components/UpuEligibilityCalculator';
import { Download, FileDown, Award, Sparkles, BookOpen, GraduationCap, CheckCircle2, ChevronRight, HelpCircle, Sun, Moon, Database, Trash2, Save, Printer, X, ChevronLeft, Check, Play, Globe } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function App() {
  // Load standard Science stream preset or auto-saved state on startup
  const [data, setData] = useState<SpmData>(() => {
    const autoSaved = localStorage.getItem('spm-auto-saved-data');
    if (autoSaved) {
      try {
        const parsed = JSON.parse(autoSaved);
        if (parsed && parsed.studentInfo && Array.isArray(parsed.subjects)) {
          return parsed;
        }
      } catch (e) {
        console.error("Ralat membaca data draf automatik:", e);
      }
    }
    return JSON.parse(JSON.stringify(PRESETS.pureScience.data));
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(0.65);
  const [activeTab, setActiveTab] = useState<'edit' | 'upu' | 'info'>('edit');
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);
  const [autoSavedMessage, setAutoSavedMessage] = useState<string | null>(null);
  const [showQuickStart, setShowQuickStart] = useState<boolean>(() => {
    const seen = localStorage.getItem('spm-quickstart-seen');
    return seen !== 'true';
  });
  const [quickStartStep, setQuickStartStep] = useState<number>(0);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('spm-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Dual Language State ('bm' = Bahasa Melayu, 'en' = English)
  const [lang, setLang] = useState<'bm' | 'en'>(() => {
    const saved = localStorage.getItem('spm-lang');
    return saved === 'en' ? 'en' : 'bm';
  });

  // Sync language to localStorage
  useEffect(() => {
    localStorage.setItem('spm-lang', lang);
  }, [lang]);

  // Track theme changes
  useEffect(() => {
    localStorage.setItem('spm-theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-save form state to localStorage every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('spm-auto-saved-data', JSON.stringify(data));
      const now = new Date();
      const timeString = now.toLocaleTimeString(lang === 'bm' ? 'ms-MY' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setAutoSavedMessage(lang === 'bm' ? `Keputusan draf disimpan pada jam ${timeString}` : `Draft auto-saved at ${timeString}`);
      
      toast.success(lang === 'bm' ? 'Draf disimpan' : 'Draft saved', {
        position: 'bottom-right',
        duration: 2000,
      });

      const timer = setTimeout(() => {
        setAutoSavedMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }, 30000);

    return () => clearInterval(interval);
  }, [data]);

  const quickStartSteps = lang === 'en' ? [
    {
      title: "Welcome to SPM Generator!",
      subtitle: "Let's find out how to simulate your results & eligibility requirements.",
      icon: <GraduationCap className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            This interactive application helps you simulate SPM result slips and check tertiary education eligibility requirements dynamically.
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4" /> Key Points:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>Select existing streams (presets) to fill subjects rapidly.</li>
              <li>Provide custom profile details for student name, seat number, and school.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Manage Subjects & Update Grades",
      subtitle: "Modify your list of subjects directly.",
      icon: <BookOpen className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            In the <strong className="text-emerald-600 dark:text-emerald-450">Details & Grades</strong> tab, you can add or change grades for each subject as you wish.
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/25 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 space-y-2">
            <div className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5 text-xs uppercase">
              💡 Form Usage Tip:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>BM and History grades must be at least <strong className="text-emerald-600 dark:text-emerald-400">E (Pass)</strong> to be certificate eligible.</li>
              <li>Use the suggestions list below the form to add elective subjects quickly.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Real-Time UPU Eligibility Check",
      subtitle: "Calculate academic merit score and discover matching courses.",
      icon: <Award className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            Our system dynamically adjusts UPU merit calculations and automatically filters entry requirements for public universities/GLCs.
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs uppercase">
              🎓 UPU System Highlights:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>Calculates merit score (max 144 points) based on 5 core stream subjects and 3 best electives.</li>
              <li>Instantly displays course eligibility for 25 major universities.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Certificate Format & Clean Print Mode",
      subtitle: "Choose the best template and produce crisp PDF or prints.",
      icon: <Printer className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            Prepare physical certificates or high-quality digital files that can be saved and shared.
          </p>
          <div className="bg-indigo-50 dark:bg-indigo-950/35 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-2">
            <div className="font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5 text-xs uppercase">
              🖨️ Printing & PDF Guide:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>Select the style: <strong>Result Slip</strong> (plain white slip) or <strong>Official Certificate</strong> (bordered green).</li>
              <li>Click <strong>Download PDF (A4)</strong> to generate a high-quality PDF file (3x resolution scale).</li>
              <li>Enable <strong>Print Mode</strong> to hide the control panels for a perfectly clean browser print (Ctrl+P).</li>
            </ul>
          </div>
        </div>
      )
    }
  ] : [
    {
      title: "Selamat Datang ke Penjana SPM!",
      subtitle: "Mari ketahui cara mensimulasi keputusan & syarat kelayakan anda.",
      icon: <GraduationCap className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            Aplikasi interaktif ini membantu anda mensimulasikan slip keputusan SPM dan menyemak syarat kelayakan program pengajian tinggi secara dinamik.
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4" /> Perkara Utama:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>Pilih aliran sedia ada (presets) untuk mengisi subjek dengan pantas.</li>
              <li>Sediakan profil tersuai bagi nama calon, angka giliran, dan sekolah.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Urus Subjek & Kemaskini Gred",
      subtitle: "Ubah suai senarai mata pelajaran anda secara langsung.",
      icon: <BookOpen className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            Di tab <strong className="text-emerald-600 dark:text-emerald-455">Butiran & Gred</strong>, anda boleh menambah atau menukar gred bagi setiap subjek mengikut kehendak anda.
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/25 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 space-y-2">
            <div className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5 text-xs uppercase">
              💡 Tip Penggunaan Form:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>Gred subjek BM dan Sejarah mesti minimum <strong className="text-emerald-600 dark:text-emerald-400">E (Lulus)</strong> untuk layak mendapat sijil.</li>
              <li>Gunakan senarai cadangan subjek di bawah form untuk menambah subjek elektif dengan cepat.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Semak Kelayakan UPU Masa-Nyata",
      subtitle: "Kira mata merit akademik dan ketahui kursus yang padan.",
      icon: <Award className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            Sistem kami melaraskan pengiraan merit UPU secara dinamik dan menapis syarat kemasukan universiti awam/GLC secara automatik.
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
            <div className="font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 text-xs uppercase">
              🎓 Kelebihan Sistem UPU:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>Mengira mata merit (skor maksimum 144) berasaskan 5 subjek terbaik aliran.</li>
              <li>Menunjukkan kelayakan kursus daripada 25 universiti utama serta-merta.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Format Sijil & Mod Cetakan Bersih",
      subtitle: "Pilih templat terbaik dan hasilkan PDF atau cetakan yang kemas.",
      icon: <Printer className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed">
            Sediakan sijil fizikal atau fail digital berkualiti tinggi yang boleh disimpan dan dikongsi.
          </p>
          <div className="bg-indigo-50 dark:bg-indigo-950/35 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-2">
            <div className="font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5 text-xs uppercase">
              🖨️ Cara Cetak & PDF:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>Pilih gaya <strong>Slip Keputusan</strong> (slip putih) atau <strong>Sijil Rasmi</strong> (hijau berbingkai).</li>
              <li>Klik <strong>Muat Turun PDF (A4)</strong> untuk menjana fail berkualiti tinggi (skala 3x kualiti).</li>
              <li>Aktifkan <strong>Mod Cetak</strong> untuk menyembunyikan panel kawalan bagi cetakan pelayar (Ctrl+P) yang bersih.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  // Automatically adjust default zoom based on screen width on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setZoomScale(0.40); // small mobile
      } else if (window.innerWidth < 1024) {
        setZoomScale(0.55); // tablet
      } else if (window.innerWidth < 1400) {
        setZoomScale(0.65); // standard desktop (perfectly fits 1080p screen vertically!)
      } else {
        setZoomScale(0.75); // large screen
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // PDF Download function
  const handleDownloadPdf = async () => {
    const element = document.getElementById('spm-certificate-pdf-target');
    if (!element) return;

    const wasDark = document.documentElement.classList.contains('dark');
    try {
      setIsGeneratingPdf(true);

      // Force light mode during generation to avoid unsupported color functions in dark mode
      if (wasDark) {
        document.documentElement.classList.remove('dark');
      }

      // Create PDF with exact A4 dimensions: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Capture canvas with 3x scale for crystal-clear vector text and SVGs
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 0.95);
      
      // Add image to full size A4 page (210 x 297)
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      
      // Clean up filename
      const formattedName = data.studentInfo.name
        ? data.studentInfo.name.trim().replace(/\s+/g, '_').toUpperCase()
        : 'CALON';
      
      const fileName = `SPM_${data.studentInfo.examYear || '2021'}_${formattedName}_${data.templateStyle.toUpperCase()}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error compiling PDF:', error);
      alert('Terdapat ralat semasa menjana fail PDF. Sila cuba lagi.');
    } finally {
      // Restore dark mode
      if (wasDark) {
        document.documentElement.classList.add('dark');
      }
      setIsGeneratingPdf(false);
    }
  };

  // Compute stats for active grades
  const getGradeSummary = () => {
    const counts: Record<string, number> = {};
    let totalPoints = 0;
    let subjectsWithGrades = 0;

    data.subjects.forEach(s => {
      counts[s.grade] = (counts[s.grade] || 0) + 1;
      
      // Calculate a simple mock grade average (A+=9, A=8, A-=7, B+=6, B=5, C+=4, C=3, D=2, E=1, G=0)
      const gradePoints: Record<string, number> = {
        'A+': 9, 'A': 8, 'A-': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D': 2, 'E': 1, 'G': 0
      };
      if (s.grade in gradePoints) {
        totalPoints += gradePoints[s.grade];
        subjectsWithGrades++;
      }
    });

    const averagePoints = subjectsWithGrades > 0 ? (totalPoints / subjectsWithGrades) : 0;
    let averageGrade = 'Sederhana';
    if (averagePoints >= 8) averageGrade = 'Cemerlang Tinggi';
    else if (averagePoints >= 6.5) averageGrade = 'Cemerlang';
    else if (averagePoints >= 4.5) averageGrade = 'Kepujian';
    else if (averagePoints >= 1.5) averageGrade = 'Lulus';
    else averageGrade = 'Gagal';

    // Count all variants of A (A+, A, A-)
    const totalAs = (counts['A+'] || 0) + (counts['A'] || 0) + (counts['A-'] || 0);

    return { counts, totalAs, averageGrade, subjectsWithGrades };
  };

  const { totalAs, averageGrade, subjectsWithGrades } = getGradeSummary();

  // Save current profile
  const handleSaveProfile = (customName?: string) => {
    const candidateName = data.studentInfo.name.trim() || 'CALON TANPA NAMA';
    const profileName = customName || candidateName;
    
    const timestampStr = new Date().toLocaleString('ms-MY', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit'
    });

    const newProfile: SavedProfile = {
      id: Math.random().toString(36).substring(2, 11),
      name: profileName,
      timestamp: timestampStr,
      data: JSON.parse(JSON.stringify(data)),
      totalAs,
      averageGrade,
      subjectCount: data.subjects.length
    };

    setSavedProfiles(prev => [newProfile, ...prev]);
  };

  // Delete profile
  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Adakah anda pasti mahu memadam profil ini?')) {
      setSavedProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  // Load profile
  const handleLoadProfile = (profile: SavedProfile) => {
    setData(JSON.parse(JSON.stringify(profile.data)));
  };

  return (
    <div className={isPrintMode ? "min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8" : `min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50/70 text-slate-800'} antialiased selection:bg-emerald-500 selection:text-white`} id="main-app-container">
      {/* CSS overrides for print media */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          #app-header, #dashboard-summary, #saved-profiles-panel, #app-footer, .no-print, [id^="tab-"], .fixed-print-toolbar {
            display: none !important;
          }
          #app-main-content {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
          #spm-certificate-pdf-target {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 24px !important;
          }
        }
      `}} />

      {/* QUICK START WIZARD MODAL */}
      <AnimatePresence>
        {showQuickStart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickStart(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-700/80 flex flex-col z-10"
            >
              {/* Top accent bar */}
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowQuickStart(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Step content area */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col items-center text-center">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mb-4">
                  {quickStartSteps[quickStartStep].icon}
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {quickStartSteps[quickStartStep].title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 max-w-xs">
                  {quickStartSteps[quickStartStep].subtitle}
                </p>

                <div className="w-full mt-6 text-left border-t border-slate-100 dark:border-slate-700/60 pt-4">
                  {quickStartSteps[quickStartStep].content}
                </div>
              </div>

              {/* Footer controls */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Dots Indicator */}
                <div className="flex gap-1.5 order-2 sm:order-1">
                  {quickStartSteps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuickStartStep(idx)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        idx === quickStartStep
                          ? 'w-6 bg-emerald-600 dark:bg-emerald-400'
                          : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-450'
                      }`}
                      title={`Ke langkah ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
                  {quickStartStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setQuickStartStep(prev => prev - 1)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Kembali
                    </button>
                  )}

                  {quickStartStep < quickStartSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setQuickStartStep(prev => prev + 1)}
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      Seterusnya
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('spm-quickstart-seen', 'true');
                        setShowQuickStart(false);
                      }}
                      className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md animate-pulse"
                    >
                      <Check className="w-4 h-4" />
                      Selesai!
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTO SAVED TOAST MESSAGE */}
      <AnimatePresence>
        {autoSavedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-50 bg-slate-900/95 dark:bg-emerald-950/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-emerald-900 flex items-center gap-2 text-xs font-bold"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-slate-100">{autoSavedMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isPrintMode ? (
        <div className="w-full flex flex-col items-center justify-center py-12 min-h-screen bg-slate-100 dark:bg-slate-950/40 px-4">
          {/* FLOATING ACTION TOOLBAR */}
          <div className="fixed-print-toolbar fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-slate-700/60 shadow-2xl flex items-center gap-4 no-print select-none">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Mod Cetak Aktif
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak (Ctrl+P)
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              Muat Turun PDF (A4)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPrintMode(false);
                setZoomScale(window.innerWidth < 640 ? 0.40 : 0.65);
              }}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>

          <div 
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="origin-top"
          >
            <SpmPreview data={data} />
          </div>

          {/* Floating Zoom Slider for Print Mode */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 flex items-center gap-3 shadow-xl text-white text-xs z-50 no-print">
            <span className="font-bold">Skala Paparan: {Math.round(zoomScale * 100)}%</span>
            <input
              type="range"
              min="0.4"
              max="1.2"
              step="0.05"
              value={zoomScale}
              onChange={(e) => setZoomScale(parseFloat(e.target.value))}
              className="accent-emerald-500 w-24 cursor-pointer"
            />
            <button 
              type="button"
              onClick={() => setZoomScale(0.85)} 
              className="px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold cursor-pointer"
            >
              Format Sijil
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* HEADER BAR */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 w-full animate-fadeIn" id="app-header">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs ring-4 ring-emerald-500/10 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    {lang === 'bm' ? 'Penjana Sijil & Slip SPM Interaktif' : 'Interactive SPM Certificate & Slip Generator'}
                    <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full tracking-wider uppercase">
                      v2.0 PRO
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'bm' 
                      ? 'Bina keputusan SPM, tukar gred subjek, dan muat turun PDF berkualiti cetakan rasmi A4.' 
                      : 'Create SPM results, customize subject grades, and download official A4 print-ready PDFs.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* DUAL LANGUAGE TOGGLE */}
                <button
                  type="button"
                  id="lang-toggle-btn"
                  onClick={() => setLang(lang === 'bm' ? 'en' : 'bm')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 gap-1.5 font-bold text-xs shrink-0"
                  title={lang === 'bm' ? "Switch to English" : "Tukar ke Bahasa Melayu"}
                >
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
                  <span>{lang === 'bm' ? 'ENGLISH (EN)' : 'MELAYU (BM)'}</span>
                </button>

                {/* QUICK START / GUIDE BUTTON */}
                <button
                  type="button"
                  id="guide-tour-btn"
                  onClick={() => {
                    setQuickStartStep(0);
                    setShowQuickStart(true);
                  }}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 gap-1.5 font-bold text-xs"
                  title={lang === 'bm' ? "Buka Panduan Quick Start" : "Open Quick Start Guide"}
                >
                  <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline text-slate-700 dark:text-slate-300">{lang === 'bm' ? 'Panduan' : 'Guide'}</span>
                </button>

                {/* LIGHT/DARK MODE TOGGLE BUTTON */}
                <button
                  type="button"
                  id="theme-toggle-btn"
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700"
                  title={darkMode ? (lang === 'bm' ? "Tukar ke Mod Terang" : "Switch to Light Mode") : (lang === 'bm' ? "Tukar ke Mod Gelap" : "Switch to Dark Mode")}
                >
                  {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400" />}
                </button>

                <button
                  type="button"
                  id="download-pdf-top-btn"
                  disabled={isGeneratingPdf || subjectsWithGrades === 0}
                  onClick={handleDownloadPdf}
                  className={`px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{lang === 'bm' ? 'Menjana PDF...' : 'Generating PDF...'}</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>{lang === 'bm' ? 'Muat Turun PDF (A4)' : 'Download PDF (A4)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* DASHBOARD SUMMARY PANEL */}
          <div className="bg-emerald-950 dark:bg-slate-950 text-white py-6 px-4 border-b border-emerald-900 dark:border-slate-800" id="dashboard-summary">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  {lang === 'bm' ? 'Pratonton Maklumat Semasa Calon' : 'Candidate Current Profile Preview'}
                </div>
                <div className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans uppercase">
                  {data.studentInfo.name || (lang === 'bm' ? 'SILA MASUKKAN NAMA CALON' : 'PLEASE ENTER CANDIDATE NAME')}
                </div>
                <div className="text-xs text-emerald-200/80 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                  <span>IC: {data.studentInfo.icNumber || '-'}</span>
                  <span className="text-emerald-700 dark:text-slate-700">•</span>
                  <span>{lang === 'bm' ? 'GILIRAN' : 'INDEX'}: {data.studentInfo.angkaGiliran || '-'}</span>
                  <span className="text-emerald-700 dark:text-slate-700">•</span>
                  <span className="font-sans font-bold">{data.studentInfo.schoolName || '-'}</span>
                </div>
              </div>

              {/* Quick grade badge widgets */}
              <div className="flex flex-wrap gap-4 bg-emerald-900/40 dark:bg-slate-900/60 p-4 rounded-xl border border-emerald-800/60 dark:border-slate-800 w-full md:w-auto">
                <div className="text-center pr-4 border-r border-emerald-800/60 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-emerald-300 dark:text-slate-400 uppercase tracking-wider">{lang === 'bm' ? 'Jumlah Subjek' : 'Total Subjects'}</div>
                  <div className="text-lg font-extrabold font-mono mt-0.5">{data.subjects.length}</div>
                </div>
                <div className="text-center pr-4 border-r border-emerald-800/60 dark:border-slate-800 pl-2">
                  <div className="text-[10px] font-bold text-emerald-300 dark:text-slate-400 uppercase tracking-wider">{lang === 'bm' ? 'Pencapaian A' : 'A Achievements'}</div>
                  <div className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">{totalAs} A</div>
                </div>
                <div className="text-center pl-2">
                  <div className="text-[10px] font-bold text-emerald-300 dark:text-slate-400 uppercase tracking-wider">{lang === 'bm' ? 'Tahap Purata' : 'Average Standard'}</div>
                  <div className="text-xs font-extrabold mt-1 text-white bg-emerald-800 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    {lang === 'bm' ? averageGrade : (
                      averageGrade === 'Cemerlang Tinggi' ? 'High Excellence' :
                      averageGrade === 'Cemerlang' ? 'Excellence' :
                      averageGrade === 'Kepujian' ? 'Credit' :
                      averageGrade === 'Lulus' ? 'Pass' : 'Fail'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN TWO-COLUMN LAYOUT */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="app-main-content">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* COLUMN 1: CONTROLS (FORM) - xl:col-span-5 */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Tab selection */}
                <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap gap-1 md:flex-nowrap shadow-xs">
                  <button
                    type="button"
                    id="tab-edit"
                    onClick={() => setActiveTab('edit')}
                    className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer text-center ${
                      activeTab === 'edit'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    ✏️ {lang === 'bm' ? 'Butiran & Gred' : 'Details & Grades'}
                  </button>
                  <button
                    type="button"
                    id="tab-upu"
                    onClick={() => setActiveTab('upu')}
                    className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer text-center ${
                      activeTab === 'upu'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    🎓 {lang === 'bm' ? 'Kelayakan UPU' : 'UPU Eligibility'}
                  </button>
                  <button
                    type="button"
                    id="tab-info"
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer text-center ${
                      activeTab === 'info'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    ℹ️ {lang === 'bm' ? 'Syarat SPM' : 'SPM Criteria'}
                  </button>
                </div>

                {/* TAB CONTENT */}
                {activeTab === 'edit' && (
                  <SpmForm data={data} onChange={setData} lang={lang} />
                )}
                
                {activeTab === 'upu' && (
                  <UpuEligibilityCalculator spmData={data} lang={lang} />
                )}

                {activeTab === 'info' && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-5" id="info-tab-content">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                  <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Syarat Layak Mendapat Sijil SPM
                </h3>
                
                <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>
                    Sejak tahun 2013, Kementerian Pendidikan Malaysia (KPM) telah menetapkan bahawa semua calon SPM wajib lulus mata pelajaran berikut untuk melayakkan diri menerima <strong>Sijil Pelajaran Malaysia</strong>:
                  </p>
                  
                  <div className="bg-amber-50 dark:bg-amber-950/25 border-l-4 border-amber-500 p-3.5 rounded-r-xl space-y-1.5">
                    <div className="font-bold text-amber-900 dark:text-amber-300 text-xs">MATA PELAJARAN WAJIB LULUS:</div>
                    <ul className="list-disc list-inside space-y-1 font-semibold text-amber-800 dark:text-amber-200">
                      <li>Bahasa Melayu (Kod: 1103) — Gred E atau lebih tinggi</li>
                      <li>Sejarah (Kod: 1249) — Gred E atau lebih tinggi</li>
                    </ul>
                  </div>

                  <p>
                    Sekiranya calon mendapat gred <strong>G (Gagal)</strong> atau tidak menduduki salah satu daripada subjek ini, status calon akan bertukar kepada <strong>TIDAK LAYAK MENDAPAT SIJIL</strong> (hanya akan menerima slip keputusan sahaja).
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Penunjuk Pengiraan Gred KPM:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">A+, A, A-</span>
                      <span className="text-slate-500 dark:text-slate-400">Cemerlang</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between">
                      <span className="font-bold text-teal-700 dark:text-teal-400">B+, B</span>
                      <span className="text-slate-500 dark:text-slate-400">Kepujian Tinggi</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between">
                      <span className="font-bold text-blue-700 dark:text-blue-400">C+, C</span>
                      <span className="text-slate-500 dark:text-slate-400">Kepujian</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between">
                      <span className="font-bold text-amber-700 dark:text-amber-400">D, E</span>
                      <span className="text-slate-500 dark:text-slate-400">Lulus</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between col-span-2">
                      <span className="font-bold text-rose-600 dark:text-rose-450">G</span>
                      <span className="text-slate-500 dark:text-slate-400">Gagal (Tidak Layak Sijil jika BM/Sejarah)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Ciri-Ciri Khas Penjana Ini:
                  </h4>
                  <ul className="list-disc list-inside text-[11px] text-emerald-800/90 dark:text-emerald-300 mt-2 space-y-1.5 leading-relaxed">
                    <li>Sistem mengira kelayakan mendapat sijil secara masa nyata berdasarkan subjek yang tersenarai.</li>
                    <li>Sokongan dwi-bahasa automatik untuk format <strong>Sijil Rasmi</strong> berbingkai hijau.</li>
                    <li>Pelarasan tahap CEFR Bahasa Inggeris dwi-gred (Format SPM 1119 baharu).</li>
                    <li>Menjana PDF resolusi tinggi (3x kualiti kanvas) sedia untuk dicetak bersaiz A4.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: REAL-TIME PREVIEW & SCALING - xl:col-span-7 */}
          <div className="xl:col-span-7 space-y-4">
            
            {/* Preview controls panel */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Pratonton:
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    {Math.round(zoomScale * 100)}%
                  </span>
                </div>
                {/* Predefined quick zoom buttons */}
                <div className="flex gap-1 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setZoomScale(0.40)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                      zoomScale === 0.40 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Kecil (40%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(0.55)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                      zoomScale === 0.55 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Sederhana (55%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(0.65)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                      zoomScale === 0.65 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Besar (65%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(0.85)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                      zoomScale === 0.85 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Penuh (85%)
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full lg:w-auto flex-1 lg:max-w-[200px]">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">40%</span>
                <input
                  type="range"
                  id="preview-zoom-slider"
                  min="0.4"
                  max="1"
                  step="0.05"
                  value={zoomScale}
                  onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-600 dark:accent-emerald-400 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">100%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="reset-zoom-btn"
                  onClick={() => setZoomScale(window.innerWidth < 640 ? 0.40 : 0.65)}
                  className="px-2.5 py-1 text-slate-500 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-bold rounded-md border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                >
                  Suaikan Skrin
                </button>
                <button
                  type="button"
                  id="toggle-print-mode-btn"
                  onClick={() => {
                    setZoomScale(0.85); // Set scale for crisp printable sizing
                    setIsPrintMode(true);
                  }}
                  className="px-2.5 py-1 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-[10px] font-black rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  title="Aktifkan Mod Cetak Bersih"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Mod Cetak
                </button>
              </div>
            </div>

            {/* Simulated Live Stage for Preview with styling scale */}
            <div className="bg-slate-200/50 dark:bg-slate-950/40 rounded-2xl border border-slate-300/40 dark:border-slate-800/40 py-8 px-4 flex justify-center overflow-auto shadow-inner min-h-[500px]">
              <div 
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="origin-top"
              >
                {/* Real-time Renderer */}
                <SpmPreview data={data} />
              </div>
            </div>

            {/* Dummy placeholder spacer so scaled preview doesn't clip content below */}
            <div 
              style={{
                height: `${1123 * (zoomScale - 1) + 20}px`
              }}
              className="pointer-events-none hidden xl:block"
            />
          </div>

        </div>
      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-20 border-t border-slate-800" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-500" />
            <span className="font-extrabold text-white text-sm tracking-widest uppercase">Lembaga Peperiksaan Malaysia</span>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Aplikasi simulasi keputusan SPM ini direka untuk tujuan pendidikan, latihan, persediaan ujian, dan pemfailan rekod kemajuan peribadi murid secara mesra pengguna.
          </p>
          <div className="text-[10px] text-slate-600">
            © 2026 Kementerian Pendidikan Malaysia (KPM). Hak Cipta Terpelihara.
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
}
