import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpmData } from '../types';
import { GRADES_MAP, checkSpmEligibility, COMMON_SUBJECTS } from '../data/defaultData';

interface SpmPreviewProps {
  data: SpmData;
}

// Convert numbers to Malay words for subject count
function numberToMalayWord(num: number): string {
  const words: Record<number, string> = {
    1: 'SATU', 2: 'DUA', 3: 'TIGA', 4: 'EMPAT', 5: 'LIMA',
    6: 'ENAM', 7: 'TUJUH', 8: 'LAPAN', 9: 'SEMBILAN', 10: 'SEPULUH',
    11: 'SEBELAS', 12: 'DUA BELAS', 13: 'TIGA BELAS', 14: 'EMPAT BELAS', 15: 'LIMA BELAS'
  };
  return words[num] || num.toString();
}

export default function SpmPreview({ data }: SpmPreviewProps) {
  const { studentInfo, subjects, oralResults, cefrLevel, templateStyle, isEligibleOverride } = data;

  // Auto eligibility calculation
  const autoEligibility = checkSpmEligibility(subjects);
  const isEligible = isEligibleOverride !== null ? isEligibleOverride : autoEligibility.isEligible;

  const totalSubjectsMalay = numberToMalayWord(subjects.length);

  // Helper to get English translation of subject for bilingual certificate
  const getEnglishSubjectName = (code: string, malayName: string): string => {
    const found = COMMON_SUBJECTS.find(s => s.code === code);
    if (found) return found.nameEnglish;
    
    // Guess or format default translations
    if (malayName.includes('BAHASA MELAYU')) return 'MALAY LANGUAGE';
    if (malayName.includes('BAHASA INGGERIS')) return 'ENGLISH LANGUAGE';
    if (malayName.includes('SEJARAH')) return 'HISTORY';
    if (malayName.includes('MATEMATIK TAMBAHAN')) return 'ADDITIONAL MATHEMATICS';
    if (malayName.includes('MATEMATIK')) return 'MATHEMATICS';
    if (malayName.includes('FIZIK')) return 'PHYSICS';
    if (malayName.includes('KIMIA')) return 'CHEMISTRY';
    if (malayName.includes('BIOLOGI')) return 'BIOLOGY';
    if (malayName.includes('SAINS')) return 'SCIENCE';
    if (malayName.includes('PENDIDIKAN ISLAM')) return 'ISLAMIC EDUCATION';
    if (malayName.includes('PENDIDIKAN MORAL')) return 'MORAL EDUCATION';
    if (malayName.includes('PERNIAGAAN')) return 'BUSINESS';
    if (malayName.includes('EKONOMI')) return 'ECONOMICS';
    
    return malayName + ' (SUBJECT)';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex justify-center bg-slate-200 dark:bg-slate-900/60 p-2 md:p-6 rounded-2xl border border-slate-300/40 dark:border-slate-800/40 overflow-hidden shadow-inner"
    >
      {/* Container simulating A4 paper: Width 794px, Height 1123px (standard A4 at 96 DPI) */}
      <motion.div 
        id="spm-certificate-pdf-target"
        className="relative bg-white w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] max-w-[794px] max-h-[1123px] shadow-2xl p-12 flex flex-col justify-between overflow-hidden select-none"
        animate={{
          backgroundColor: templateStyle === 'sijil' ? '#E3EFE6' : '#ffffff',
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{
          boxSizing: 'border-box'
        }}
      >
        <style>{`
          #spm-certificate-pdf-target, #spm-certificate-pdf-target * {
            color: black !important;
            border-color: black !important;
            background-color: white !important;
          }
        `}</style>
        <AnimatePresence mode="wait">
          {templateStyle === 'slip' ? (
            /* ======================================================================
               STYLE 1: SLIP KEPUTUSAN SPM (WHITE SLIP - EXACTLY AS IMAGE 2)
               ====================================================================== */
            <motion.div 
              key="slip"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col justify-between text-[11px] text-black relative z-10"
              style={{
                fontFamily: "'Inter', 'Arial', sans-serif",
                lineHeight: '1.45'
              }}
            >
            {/* Watermark Logo Background exactly as image 2 (faint scale logo) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
              <svg width="480" height="480" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer dashed circle */}
                <circle cx="250" cy="250" r="230" stroke="#000" strokeWidth="2.5" strokeDasharray="14 10"/>
                
                {/* Balance scales graphic in the middle */}
                <path d="M250,120 L250,340" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
                <path d="M160,180 L340,180" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
                {/* Scale plates */}
                <path d="M160,180 L130,260 L190,260 Z" stroke="#000" strokeWidth="2.5" fill="none"/>
                <path d="M340,180 L310,260 L370,260 Z" stroke="#000" strokeWidth="2.5" fill="none"/>
                
                {/* Watermark arched texts */}
                <path id="slip-curve-top" d="M 100,250 A 150,150 0 0,1 400,250" fill="none" />
                <path id="slip-curve-bottom" d="M 400,250 A 150,150 0 0,1 100,250" fill="none" />
                <text fontSize="28" fontWeight="bold" fill="#000" letterSpacing="4">
                  <textPath href="#slip-curve-top" startOffset="50%" textAnchor="middle">Lembaga Peperiksaan</textPath>
                </text>
                <text fontSize="28" fontWeight="bold" fill="#000" letterSpacing="4">
                  <textPath href="#slip-curve-bottom" startOffset="50%" textAnchor="middle">Malaysia</textPath>
                </text>

                {/* Banners for "Amanah, Sahih, Adil" */}
                <path d="M 120,330 C 150,350 200,350 250,330" stroke="#000" strokeWidth="2" fill="none" />
                <path d="M 250,330 C 300,350 350,350 380,330" stroke="#000" strokeWidth="2" fill="none" />
                <text x="180" y="340" fontSize="12" fontWeight="bold" fill="#000">امانه</text>
                <text x="250" y="345" fontSize="12" fontWeight="bold" fill="#000" textAnchor="middle">صحيح</text>
                <text x="320" y="340" fontSize="12" fontWeight="bold" fill="#000" textAnchor="end">عديل</text>
              </svg>
            </div>

            {/* Header section with colorful Jata Negara */}
            <div className="text-center flex flex-col items-center">
              {/* Malaysian Crest representation */}
              <div className="mb-2">
                <svg width="74" height="74" viewBox="0 0 100 80" fill="none">
                  {/* Shield with gold border */}
                  <path d="M50,4 C50,4 18,14 18,41 C18,68 50,78 50,78 C50,78 82,68 82,41 C82,14 50,4 50,4 Z" fill="#FBFDFA" stroke="#D97706" strokeWidth="2.5"/>
                  <path d="M50,5 C50,5 20,15 20,41 C20,66 50,76 50,76 C50,76 80,66 80,41 C80,15 50,5 50,5 Z" fill="none" stroke="#065F46" strokeWidth="1.5"/>
                  
                  {/* Crescent & Star (Gold) */}
                  <path d="M50,14 C44,14 41,19 41,25 C41,31 46,34 50,34 C46,34 44,30 44,25 C44,20 47,16 50,16 C51,16 51,14 50,14 Z" fill="#FBBF24"/>
                  <polygon points="58,17 60,21 64,21 61,23 62,27 58,25 54,27 55,23 52,21 56,21" fill="#FBBF24"/>
                  
                  {/* Stripes */}
                  <rect x="25" y="38" width="13" height="16" fill="#EF4444" stroke="#D97706" strokeWidth="0.5"/>
                  <rect x="38" y="38" width="12" height="16" fill="#FBBF24" stroke="#D97706" strokeWidth="0.5"/>
                  <rect x="50" y="38" width="12" height="16" fill="#1E3A8A" stroke="#D97706" strokeWidth="0.5"/>
                  <rect x="62" y="38" width="13" height="16" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.5"/>
                  
                  {/* Tigers */}
                  <path d="M10,24 C4,24 2,36 14,46" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <path d="M90,24 C96,24 98,36 86,46" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  
                  {/* Gold bottom scroll banner */}
                  <path d="M14,64 C32,71 68,71 86,64" stroke="#D97706" strokeWidth="3" fill="none"/>
                </svg>
              </div>
              <div className="text-[10.5px] font-extrabold tracking-widest uppercase">KEMENTERIAN PENDIDIKAN</div>
              <div className="text-[10.5px] font-extrabold tracking-widest uppercase mt-0.5">LEMBAGA PEPERIKSAAN</div>
              
              <h1 className="text-[13px] font-extrabold tracking-wider text-black mt-4 uppercase" style={{ fontFamily: "'Georgia', serif" }}>
                SIJIL PELAJARAN MALAYSIA TAHUN <motion.span key={studentInfo.examYear} initial={{ opacity: 0.3, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }} className="inline-block">{studentInfo.examYear || '2021'}</motion.span>
              </h1>
            </div>

            {/* Candidate Info Block - aligned precisely as Image 2 */}
            <div className="my-6 space-y-1 text-[11px] font-bold text-black">
              <div className="flex">
                <span className="w-[180px] inline-block">NAMA :</span>
                <motion.span
                  key={studentInfo.name}
                  initial={{ opacity: 0.3, filter: 'blur(1px)', x: -3 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="uppercase inline-block"
                >
                  {studentInfo.name || 'NAMA CALON'}
                </motion.span>
              </div>
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-1">
                  <span className="w-[180px] inline-block">NO. PENGENALAN DIRI :</span>
                  <motion.span
                    key={studentInfo.icNumber}
                    initial={{ opacity: 0.3, filter: 'blur(1px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="inline-block"
                  >
                    {studentInfo.icNumber || '990101-01-1000'}
                  </motion.span>
                </div>
                <span className="mr-4 font-bold">:</span>
              </div>
              <div className="flex">
                <span className="w-[180px] inline-block">ANGKA GILIRAN :</span>
                <motion.span
                  key={studentInfo.angkaGiliran}
                  initial={{ opacity: 0.3, filter: 'blur(1px)', x: -3 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="uppercase inline-block"
                >
                  {studentInfo.angkaGiliran || 'AB123C456'}
                </motion.span>
              </div>
              <div className="flex">
                <span className="w-[180px] inline-block">SEKOLAH :</span>
                <motion.span
                  key={studentInfo.schoolName}
                  initial={{ opacity: 0.3, filter: 'blur(1px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="uppercase inline-block"
                >
                  {studentInfo.schoolName || 'SEKOLAH CALON'}
                </motion.span>
              </div>
              <div className="flex">
                <span className="w-[180px] inline-block">JUMLAH MATA PELAJARAN :</span>
                <motion.span
                  key={totalSubjectsMalay}
                  initial={{ opacity: 0.3, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className="uppercase inline-block"
                >
                  {totalSubjectsMalay}
                </motion.span>
              </div>
            </div>

            {/* Subjects Table with exact columns and layout - No borders as in Image 2 */}
            <div className="flex-1 py-4 relative z-10 bg-transparent">
              <div className="flex font-sans font-bold text-black pb-2 text-[10.5px] tracking-wider uppercase">
                <div className="w-[14%]">KOD</div>
                <div className="w-[51%]">NAMA MATA PELAJARAN</div>
                <div className="w-[35%]">GRED</div>
              </div>

              <div className="space-y-1.5 mt-3 text-[11px] font-bold">
                <AnimatePresence initial={false}>
                  {subjects.map((sub, index) => (
                    <motion.div
                      key={sub.id || index}
                      layout
                      initial={{ opacity: 0, y: 8, filter: 'blur(1.5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -8, filter: 'blur(1.5px)' }}
                      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                      className="flex items-start py-0.5"
                    >
                      <div className="w-[14%]">{sub.code || 'XXXX'}</div>
                      <div className="w-[51%] uppercase">{sub.name}</div>
                      <div className="w-[35%] flex justify-start items-center">
                        <motion.span
                          key={sub.grade}
                          initial={{ scale: 0.8, opacity: 0.3, filter: 'blur(1px)' }}
                          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                          className="w-[45px] inline-block font-mono font-black"
                        >
                          {sub.grade}
                        </motion.span>
                        <motion.span
                          key={sub.description}
                          initial={{ opacity: 0.3, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="text-[10px] font-sans font-medium text-black uppercase pl-1"
                        >
                          {sub.description}
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Certificate Status & Oral/CEFR Info - No borders as in Image 2 */}
            <div className="my-6 space-y-4 relative z-10 text-[11px] font-bold">
              <motion.div
                key={isEligible ? 'layak' : 'tidak-layak'}
                initial={{ opacity: 0.3, y: -4, filter: 'blur(0.5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="uppercase tracking-wider"
              >
                {isEligible ? 'LAYAK MENDAPAT SIJIL' : 'TIDAK LAYAK MENDAPAT SIJIL'}
              </motion.div>

              <div className="space-y-1 pt-1">
                <motion.div
                  key={oralResults.bmOral}
                  initial={{ opacity: 0.4, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  UJIAN LISAN BAHASA MELAYU: {oralResults.bmOral || 'CEMERLANG'}
                </motion.div>
                <motion.div
                  key={cefrLevel}
                  initial={{ opacity: 0.4, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  TAHAP KESELURUHAN CEFR BAHASA INGGERIS: {cefrLevel || 'B2'}
                </motion.div>
              </div>
            </div>

            {/* Footnote Disclaimers */}
            <div className="text-[8.5px] font-sans font-medium text-slate-700 leading-normal space-y-2 pt-4">
              <p>
                Slip keputusan ini bukan sijil/pernyataan. Lembaga Peperiksaan berhak meminda butir-butir kenyataan dalam slip keputusan ini sebelum sijil/pernyataan sebenar dikeluarkan. Keputusan muktamad adalah seperti yang tercatat dalam sijil/pernyataan.
              </p>
              <p>
                Semua pertanyaan berhubung dengan keputusan hendaklah dikemukakan terus kepada Pengarah Peperiksaan, Lembaga Peperiksaan dengan menggunakan borang khas yang boleh didapati daripada pihak sekolah (bagi calon sekolah) atau di Jabatan Pendidikan Negeri (bagi calon persendirian/perseorangan) dalam tempoh tiga puluh (30) hari dari tarikh pengumuman keputusan peperiksaan ini.
              </p>
            </div>

            {/* Signature & QR Section */}
            <div className="flex justify-between items-end pt-4 mt-2">
              {/* Left Column (Empty to center QR code) */}
              <div className="w-1/3"></div>

              {/* Center Column (QR Code representation) */}
              <div className="w-1/3 flex justify-center">
                <div className="bg-white p-1 border border-black rounded-xs">
                  <svg width="56" height="56" viewBox="0 0 29 29" fill="none">
                    <rect width="29" height="29" fill="white"/>
                    <rect x="1" y="1" width="7" height="7" fill="black"/>
                    <rect x="2" y="2" width="5" height="5" fill="white"/>
                    <rect x="3" y="3" width="3" height="3" fill="black"/>
                    
                    <rect x="21" y="1" width="7" height="7" fill="black"/>
                    <rect x="22" y="2" width="5" height="5" fill="white"/>
                    <rect x="23" y="3" width="3" height="3" fill="black"/>
                    
                    <rect x="1" y="21" width="7" height="7" fill="black"/>
                    <rect x="2" y="22" width="5" height="5" fill="white"/>
                    <rect x="3" y="23" width="3" height="3" fill="black"/>
                    
                    <rect x="10" y="2" width="2" height="2" fill="black"/>
                    <rect x="15" y="1" width="3" height="1" fill="black"/>
                    <rect x="13" y="4" width="2" height="3" fill="black"/>
                    <rect x="10" y="9" width="3" height="2" fill="black"/>
                    <rect x="16" y="8" width="2" height="4" fill="black"/>
                    <rect x="1" y="10" width="4" height="2" fill="black"/>
                    <rect x="6" y="14" width="3" height="1" fill="black"/>
                    <rect x="11" y="15" width="2" height="3" fill="black"/>
                    <rect x="15" y="14" width="4" height="2" fill="black"/>
                    <rect x="21" y="10" width="3" height="3" fill="black"/>
                    <rect x="25" y="12" width="2" height="2" fill="black"/>
                    <rect x="23" y="16" width="4" height="2" fill="black"/>
                    <rect x="10" y="21" width="2" height="4" fill="black"/>
                    <rect x="14" y="24" width="4" height="2" fill="black"/>
                    <rect x="20" y="20" width="3" height="3" fill="black"/>
                    <rect x="24" y="23" width="2" height="4" fill="black"/>
                  </svg>
                </div>
              </div>

              {/* Right Column (Just text PENGARAH PEPERIKSAAN - NO SIGNATURE LINE on the white slip) */}
              <div className="w-1/3 flex justify-end text-right">
                <div className="text-[11px] font-bold uppercase tracking-wider">PENGARAH PEPERIKSAAN</div>
              </div>
            </div>
          </motion.div>
          ) : (
            /* ======================================================================
               STYLE 2: SIJIL RASMI SPM (GREEN PARCHMENT - EXACTLY AS IMAGE 2)
               ====================================================================== */
            <motion.div 
              key="sijil"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col justify-between p-4 relative z-10 text-[10px] text-emerald-950 w-full"
              style={{
                backgroundColor: '#E3EFE6', // Accurate sage-green background color
                fontFamily: "'Georgia', serif",
                lineHeight: '1.4'
              }}
            >
            {/* Soft watermark coat of arms in center background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none z-0">
              <svg width="450" height="450" viewBox="0 0 100 80" fill="none" className="text-emerald-900">
                <path d="M50,5 C50,5 20,15 20,40 C20,65 50,75 50,75 C50,75 80,65 80,40 C80,15 50,5 50,5 Z" fill="currentColor"/>
              </svg>
            </div>

            {/* Document Content */}
            <div className="relative z-10 flex flex-col justify-between h-full p-4">
              
              {/* Bilingual Header labels top left and right */}
              <div className="flex justify-between items-start text-[7.5px] font-sans font-bold text-emerald-900/90 tracking-widest uppercase">
                <div className="text-left w-56 leading-normal">
                  KEMENTERIAN PENDIDIKAN<br />MALAYSIA
                </div>
                <div className="text-right w-56 leading-normal">
                  MINISTRY OF EDUCATION<br />MALAYSIA
                </div>
              </div>

              {/* Malaysian Coat of Arms Representation */}
              <div className="flex flex-col items-center mt-2">
                <div className="mb-2">
                  <svg width="74" height="74" viewBox="0 0 100 80" fill="none">
                    {/* Shield with gold border */}
                    <path d="M50,4 C50,4 18,14 18,41 C18,68 50,78 50,78 C50,78 82,68 82,41 C82,14 50,4 50,4 Z" fill="#FBFDFA" stroke="#D97706" strokeWidth="2.5"/>
                    <path d="M50,5 C50,5 20,15 20,41 C20,66 50,76 50,76 C50,76 80,66 80,41 C80,15 50,5 50,5 Z" fill="none" stroke="#065F46" strokeWidth="1.5"/>
                    
                    {/* Crescent & Star (Gold) */}
                    <path d="M50,14 C44,14 41,19 41,25 C41,31 46,34 50,34 C46,34 44,30 44,25 C44,20 47,16 50,16 C51,16 51,14 50,14 Z" fill="#FBBF24"/>
                    <polygon points="58,17 60,21 64,21 61,23 62,27 58,25 54,27 55,23 52,21 56,21" fill="#FBBF24"/>
                    
                    {/* Stripes */}
                    <rect x="25" y="38" width="13" height="16" fill="#EF4444" stroke="#D97706" strokeWidth="0.5"/>
                    <rect x="38" y="38" width="12" height="16" fill="#FBBF24" stroke="#D97706" strokeWidth="0.5"/>
                    <rect x="50" y="38" width="12" height="16" fill="#1E3A8A" stroke="#D97706" strokeWidth="0.5"/>
                    <rect x="62" y="38" width="13" height="16" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.5"/>
                    
                    {/* Tigers */}
                    <path d="M10,24 C4,24 2,36 14,46" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M90,24 C96,24 98,36 86,46" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    
                    {/* Gold bottom scroll banner */}
                    <path d="M14,64 C32,71 68,71 86,64" stroke="#D97706" strokeWidth="3" fill="none"/>
                  </svg>
                </div>

                <div className="text-center font-sans tracking-widest">
                  <h2 className="text-[12px] font-black text-emerald-950 uppercase leading-none">LEMBAGA PEPERIKSAAN</h2>
                  <h3 className="text-[8.5px] font-bold text-emerald-800 uppercase italic mt-1">EXAMINATIONS SYNDICATE</h3>
                </div>
              </div>

              {/* Award intro bilingual text block */}
              <div className="text-center mt-3 font-sans max-w-xl mx-auto leading-normal">
                <p className="text-[8.5px] font-bold text-emerald-900 uppercase tracking-wide">
                  Calon yang tersebut namanya di bawah telah mengambil Peperiksaan Sijil Pelajaran Malaysia dan dianugerahkan
                </p>
                <p className="text-[7.5px] font-semibold text-slate-500 uppercase tracking-wide italic">
                  The candidate whose name appears below has taken the Sijil Pelajaran Malaysia Examination and is awarded the
                </p>

                <h1 className="text-[16px] font-black tracking-widest text-emerald-950 uppercase mt-2" style={{ fontFamily: "'Georgia', serif" }}>
                  SIJIL PELAJARAN MALAYSIA
                </h1>

                <p className="text-[8.5px] font-bold text-emerald-900 uppercase tracking-wide mt-1.5">
                  Calon ini telah mencapai kelulusan seperti yang tercatat di bawah bagi mata pelajaran berkenaan.
                </p>
                <p className="text-[7.5px] font-semibold text-slate-500 uppercase tracking-wide italic">
                  The candidate has achieved the grades shown below in the respective subjects.
                </p>
              </div>

              {/* Candidate Info Columns */}
              <div className="grid grid-cols-12 gap-1 my-4 px-6 py-2 border-t border-b border-emerald-950/20 font-sans text-[10px]">
                <div className="col-span-8 space-y-1 text-left">
                  <motion.div 
                    key={studentInfo.name}
                    initial={{ opacity: 0.3, filter: 'blur(1px)', x: -3 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="font-extrabold text-emerald-950 tracking-wide text-[11px] uppercase"
                  >
                    {studentInfo.name || 'NAMA CALON'}
                  </motion.div>
                  <div className="text-slate-700 text-[9px] font-bold flex items-center gap-2 font-mono">
                    <motion.span
                      key={studentInfo.icNumber}
                      initial={{ opacity: 0.3, filter: 'blur(1px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="inline-block"
                    >
                      {studentInfo.icNumber || '990101-01-1000'}
                    </motion.span>
                    <motion.span
                      key={studentInfo.angkaGiliran}
                      initial={{ opacity: 0.3, filter: 'blur(1px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="inline-block"
                    >
                      {studentInfo.angkaGiliran || 'AB123C456'}
                    </motion.span>
                  </div>
                  <motion.div 
                    key={studentInfo.schoolName}
                    initial={{ opacity: 0.3, filter: 'blur(1px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="text-emerald-900/90 text-[9px] font-extrabold uppercase"
                  >
                    {studentInfo.schoolName || 'SEKOLAH CALON'}
                  </motion.div>
                </div>

                <div className="col-span-4 text-right flex flex-col justify-end space-y-0.5 font-sans text-[9px] text-emerald-900/90 font-bold">
                  {/* Left column empty or school, right column index */}
                </div>
              </div>

              {/* Two-Column Subjects & Grades Table */}
              <div className="flex-1 px-6 font-sans">
                <div className="grid grid-cols-12 border-b border-emerald-950/20 pb-1 text-[8.5px] font-extrabold tracking-wider text-emerald-950 uppercase">
                  <div className="col-span-7">Mata Pelajaran <br /><span className="text-slate-500 font-bold italic lowercase">Subject</span></div>
                  <div className="col-span-5 text-right">Gred <br /><span className="text-slate-500 font-bold italic lowercase">Grade</span></div>
                </div>

                {/* Subject items listing with bilingual translation */}
                <div className="space-y-1.5 mt-3">
                  <AnimatePresence initial={false}>
                    {subjects.map((sub, index) => (
                      <motion.div
                        key={sub.id || index}
                        layout
                        initial={{ opacity: 0, y: 8, filter: 'blur(1.5px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -8, filter: 'blur(1.5px)' }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                        className="grid grid-cols-12 text-[10px] items-center py-0.5 border-b border-emerald-950/5"
                      >
                        {/* Malay and English subject names */}
                        <div className="col-span-7 pr-4 text-left">
                          <div className="font-extrabold text-emerald-950 leading-tight uppercase text-[9.5px]">
                            {sub.name}
                          </div>
                          <div className="text-slate-500 text-[7.5px] font-bold italic uppercase leading-none mt-0.5">
                            {getEnglishSubjectName(sub.code, sub.name)}
                          </div>
                        </div>

                        {/* Grade format "A+ (CEMERLANG TERTINGGI)" */}
                        <div className="col-span-5 text-right font-semibold">
                          <motion.span
                            key={sub.grade}
                            initial={{ scale: 0.8, opacity: 0.3, filter: 'blur(1px)' }}
                            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                            className="font-mono font-extrabold text-emerald-950 text-[10.5px] mr-2 inline-block"
                          >
                            {sub.grade}
                          </motion.span>
                          <motion.span
                            key={sub.description}
                            initial={{ opacity: 0.3, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="text-[8.5px] font-black text-slate-500 uppercase tracking-tight"
                          >
                            ({sub.description})
                          </motion.span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sijil Footer */}
              <div className="grid grid-cols-12 items-end border-t border-emerald-950/20 pt-4 px-6">
                
                {/* Left side info block */}
                <div className="col-span-6 space-y-1 text-[8.5px] text-emerald-950 font-sans font-bold text-left">
                  <div className="uppercase">
                    JUMLAH MATA PELAJARAN: <motion.span key={totalSubjectsMalay} initial={{ opacity: 0.3, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }} className="text-emerald-950 font-extrabold inline-block">{totalSubjectsMalay}</motion.span>
                  </div>
                  <div className="uppercase">
                    PEPERIKSAAN TAHUN: <motion.span key={studentInfo.examYear} initial={{ opacity: 0.3, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 250, damping: 20 }} className="text-emerald-950 font-extrabold inline-block">{studentInfo.examYear || '2013'}</motion.span>
                  </div>
                  <div className="font-mono text-[8px] text-slate-600 mt-1">
                    233324
                  </div>
                  <div className="font-mono text-[10.5px] text-rose-700 font-extrabold mt-1">
                    <motion.span key={studentInfo.serialNumber} initial={{ opacity: 0.3, filter: 'blur(1px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.3 }} className="inline-block">{studentInfo.serialNumber || 'A 02651054'}</motion.span>
                  </div>
                </div>

                {/* Right side Signature of Director */}
                <div className="col-span-6 flex flex-col items-center text-center">
                  <div className="h-10 relative flex items-center justify-center">
                    <svg width="150" height="40" viewBox="0 0 150 40" className="text-emerald-950 opacity-90">
                      <path d="M10,25 C30,22 45,5 50,15 C55,25 35,38 60,35 C85,32 110,12 115,22 C120,32 125,25 140,25" fill="none" stroke="#022C22" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M42,12 C52,20 62,3 72,18" fill="none" stroke="#022C22" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="absolute bottom-1 font-serif text-[11px] font-bold text-emerald-900/90 tracking-wide">NaimahIshaak</span>
                  </div>
                  <div className="w-full border-t border-emerald-950/20 my-1"></div>
                  
                  <div className="text-[8px] font-extrabold tracking-wider text-emerald-950 uppercase leading-none">
                    Pengarah Peperiksaan
                  </div>
                  <div className="text-[7px] font-semibold text-slate-500 uppercase leading-none mt-0.5 italic">
                    Director of Examinations
                  </div>

                  <div className="text-[8px] font-extrabold tracking-wider text-emerald-900 uppercase leading-none mt-1.5">
                    Kementerian Pendidikan Malaysia
                  </div>
                  <div className="text-[7px] font-semibold text-slate-500 uppercase leading-none mt-0.5 italic">
                    Ministry of Education Malaysia
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
