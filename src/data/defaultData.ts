import { SpmData, Subject } from '../types';

export const GRADES_MAP: Record<string, { malay: string; english: string; isPass: boolean }> = {
  'A+': { malay: 'CEMERLANG TERTINGGI', english: 'SUPER BRONZE/HIGHEST DISTINCTION', isPass: true },
  'A': { malay: 'CEMERLANG TINGGI', english: 'HIGH DISTINCTION', isPass: true },
  'A-': { malay: 'CEMERLANG', english: 'DISTINCTION', isPass: true },
  'B+': { malay: 'KEPUJIAN TERTINGGI', english: 'HIGHEST MERIT', isPass: true },
  'B': { malay: 'KEPUJIAN TINGGI', english: 'HIGH MERIT', isPass: true },
  'C+': { malay: 'KEPUJIAN ATAS', english: 'UPPER CREDIT', isPass: true },
  'C': { malay: 'KEPUJIAN', english: 'CREDIT', isPass: true },
  'D': { malay: 'LULUS ATAS', english: 'UPPER PASS', isPass: true },
  'E': { malay: 'LULUS', english: 'PASS', isPass: true },
  'G': { malay: 'GAGAL', english: 'FAIL', isPass: false },
};

// Available grades list
export const GRADES = Object.keys(GRADES_MAP);

// Common SPM subjects catalog
export interface SubjectCatalogItem {
  code: string;
  nameMalay: string;
  nameEnglish: string;
}

export const COMMON_SUBJECTS: SubjectCatalogItem[] = [
  { code: '1103', nameMalay: 'BAHASA MELAYU', nameEnglish: 'MALAY LANGUAGE' },
  { code: '1119', nameMalay: 'BAHASA INGGERIS', nameEnglish: 'ENGLISH LANGUAGE' },
  { code: '1249', nameMalay: 'SEJARAH', nameEnglish: 'HISTORY' },
  { code: '1449', nameMalay: 'MATEMATIK', nameEnglish: 'MATHEMATICS' },
  { code: '1511', nameMalay: 'SAINS', nameEnglish: 'SCIENCE' },
  { code: '1223', nameMalay: 'PENDIDIKAN ISLAM', nameEnglish: 'ISLAMIC EDUCATION' },
  { code: '1225', nameMalay: 'PENDIDIKAN MORAL', nameEnglish: 'MORAL EDUCATION' },
  { code: '3472', nameMalay: 'MATEMATIK TAMBAHAN', nameEnglish: 'ADDITIONAL MATHEMATICS' },
  { code: '4531', nameMalay: 'FIZIK', nameEnglish: 'PHYSICS' },
  { code: '4541', nameMalay: 'KIMIA', nameEnglish: 'CHEMISTRY' },
  { code: '4551', nameMalay: 'BIOLOGI', nameEnglish: 'BIOLOGY' },
  { code: '3766', nameMalay: 'PERNIAGAAN', nameEnglish: 'BUSINESS' },
  { code: '3756', nameMalay: 'PRINSIP PERAKAUNAN', nameEnglish: 'PRINCIPLES OF ACCOUNTING' },
  { code: '3767', nameMalay: 'EKONOMI', nameEnglish: 'ECONOMICS' },
  { code: '2280', nameMalay: 'GEOGRAFI', nameEnglish: 'GEOGRAPHY' },
  { code: '2361', nameMalay: 'BAHASA ARAB', nameEnglish: 'ARABIC LANGUAGE' },
  { code: '5226', nameMalay: 'TASAWWUR ISLAM', nameEnglish: 'ISLAMIC VISIONS' },
  { code: '5227', nameMalay: 'PENDIDIKAN AL-QURAN DAN AL-SUNNAH', nameEnglish: 'AL-QURAN AND AL-SUNNAH EDUCATION' },
  { code: '5228', nameMalay: 'PENDIDIKAN SYARIAH ISLAMIAH', nameEnglish: 'ISLAMIC SHARIAH EDUCATION' },
  { code: '6351', nameMalay: 'BAHASA CINA', nameEnglish: 'CHINESE LANGUAGE' },
  { code: '6354', nameMalay: 'BAHASA TAMIL', nameEnglish: 'TAMIL LANGUAGE' },
  { code: '2215', nameMalay: 'KESUSASTERAAN MELAYU', nameEnglish: 'MALAY LITERATURE' },
  { code: '2220', nameMalay: 'KESUSASTERAAN INGGERIS', nameEnglish: 'ENGLISH LITERATURE' },
  { code: '2611', nameMalay: 'PENDIDIKAN SENI VISUAL', nameEnglish: 'VISUAL ARTS EDUCATION' },
  { code: '2621', nameMalay: 'PENDIDIKAN MUZIK', nameEnglish: 'MUSIC EDUCATION' },
  { code: '3765', nameMalay: 'SAINS KOMPUTER', nameEnglish: 'COMPUTER SCIENCE' },
  { code: '3763', nameMalay: 'REKA CIPTA', nameEnglish: 'INVENTION' },
  { code: '3762', nameMalay: 'GRAFIK KOMUNIKASI TEKNIKAL', nameEnglish: 'TECHNICAL COMMUNICATION GRAPHICS' },
  { code: '3769', nameMalay: 'SAINS RUMAH TANGGA', nameEnglish: 'HOME SCIENCE' },
  { code: '3770', nameMalay: 'SAINS SUKAN', nameEnglish: 'SPORTS SCIENCE' },
  { code: '6363', nameMalay: 'BAHASA JEPUN', nameEnglish: 'JAPANESE LANGUAGE' },
  { code: '6367', nameMalay: 'BAHASA KOREA', nameEnglish: 'KOREAN LANGUAGE' },
  { code: '6401', nameMalay: 'BAHASA KADAZANDUSUN', nameEnglish: 'KADAZANDUSUN LANGUAGE' },
  { code: '6405', nameMalay: 'BAHASA IBAN', nameEnglish: 'IBAN LANGUAGE' },
  { code: '3729', nameMalay: 'PERTANIAN', nameEnglish: 'AGRICULTURE' }
];

// Presets data
export const PRESETS: Record<string, { label: string; data: SpmData }> = {
  pureScience: {
    label: 'Aliran Sains Tulen (Cemerlang)',
    data: {
      studentInfo: {
        name: 'MUHAMMAD AFIQ AKMAL BIN MOHD TAMIZI',
        icNumber: '040903-03-0363',
        angkaGiliran: 'DF303C005',
        schoolName: 'SMU(A) AHMADIAH BANGGUL JUDAH',
        examYear: '2021',
        serialNumber: 'A 02651054',
      },
      templateStyle: 'slip',
      isEligibleOverride: null,
      cefrLevel: 'B2',
      oralResults: {
        bmOral: 'CEMERLANG',
        biOral: 'KEPUJIAN',
      },
      subjects: [
        { id: '1', code: '1103', name: 'BAHASA MELAYU', grade: 'A', description: 'CEMERLANG TINGGI' },
        { id: '2', code: '1119', name: 'BAHASA INGGERIS', grade: 'A-', description: 'CEMERLANG' },
        { id: '3', code: '1249', name: 'SEJARAH', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '4', code: '1449', name: 'MATEMATIK', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '5', code: '3472', name: 'MATEMATIK TAMBAHAN', grade: 'A-', description: 'CEMERLANG' },
        { id: '6', code: '4531', name: 'FIZIK', grade: 'A', description: 'CEMERLANG TINGGI' },
        { id: '7', code: '4541', name: 'KIMIA', grade: 'A', description: 'CEMERLANG TINGGI' },
        { id: '8', code: '4551', name: 'BIOLOGI', grade: 'B+', description: 'KEPUJIAN TERTINGGI' },
        { id: '9', code: '1223', name: 'PENDIDIKAN ISLAM', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
      ],
    },
  },
  perfectScore: {
    label: 'Keputusan Semua A+ (Perfect 10A+)',
    data: {
      studentInfo: {
        name: 'CHUA XIAO XUAN',
        icNumber: '050721-01-6386',
        angkaGiliran: 'JB081A019',
        schoolName: 'SMK SKUDAI',
        examYear: '2022',
        serialNumber: 'A 03948512',
      },
      templateStyle: 'sijil',
      isEligibleOverride: null,
      cefrLevel: 'C1',
      oralResults: {
        bmOral: 'CEMERLANG',
        biOral: 'CEMERLANG',
      },
      subjects: [
        { id: '1', code: '1103', name: 'BAHASA MELAYU', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '2', code: '1119', name: 'BAHASA INGGERIS', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '3', code: '1249', name: 'SEJARAH', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '4', code: '1449', name: 'MATEMATIK', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '5', code: '1511', name: 'SAINS', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '6', code: '3472', name: 'MATEMATIK TAMBAHAN', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '7', code: '4531', name: 'FIZIK', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '8', code: '4541', name: 'KIMIA', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '9', code: '4551', name: 'BIOLOGI', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
        { id: '10', code: '1225', name: 'PENDIDIKAN MORAL', grade: 'A+', description: 'CEMERLANG TERTINGGI' },
      ],
    },
  },
  humanitiesStream: {
    label: 'Aliran Perniagaan & Sastera',
    data: {
      studentInfo: {
        name: 'AINA SYAZWANI BINTI MOHD NIZAM',
        icNumber: '041215-10-0982',
        angkaGiliran: 'BA120K045',
        schoolName: 'SMK SERI KEMBANGAN',
        examYear: '2021',
        serialNumber: 'A 01183921',
      },
      templateStyle: 'slip',
      isEligibleOverride: null,
      cefrLevel: 'B1',
      oralResults: {
        bmOral: 'KEPUJIAN',
        biOral: 'MEMUASKAN',
      },
      subjects: [
        { id: '1', code: '1103', name: 'BAHASA MELAYU', grade: 'B+', description: 'KEPUJIAN TERTINGGI' },
        { id: '2', code: '1119', name: 'BAHASA INGGERIS', grade: 'C+', description: 'KEPUJIAN ATAS' },
        { id: '3', code: '1249', name: 'SEJARAH', grade: 'B', description: 'KEPUJIAN TINGGI' },
        { id: '4', code: '1449', name: 'MATEMATIK', grade: 'C', description: 'KEPUJIAN' },
        { id: '5', code: '1511', name: 'SAINS', grade: 'B+', description: 'KEPUJIAN TERTINGGI' },
        { id: '6', code: '3766', name: 'PERNIAGAAN', grade: 'B', description: 'KEPUJIAN TINGGI' },
        { id: '7', code: '3767', name: 'EKONOMI', grade: 'C+', description: 'KEPUJIAN ATAS' },
        { id: '8', code: '1223', name: 'PENDIDIKAN ISLAM', grade: 'A-', description: 'CEMERLANG' },
      ],
    },
  },
  failedSpm: {
    label: 'Tidak Layak Sijil (Gagal Sejarah/BM)',
    data: {
      studentInfo: {
        name: 'ARVINDRAN A/L BALAKRISHNAN',
        icNumber: '040810-08-5491',
        angkaGiliran: 'PK405B112',
        schoolName: 'SMK METHODIST IPOH',
        examYear: '2021',
        serialNumber: 'A 04392811',
      },
      templateStyle: 'slip',
      isEligibleOverride: null,
      cefrLevel: 'A2',
      oralResults: {
        bmOral: 'MEMUASKAN',
        biOral: 'MEMUASKAN',
      },
      subjects: [
        { id: '1', code: '1103', name: 'BAHASA MELAYU', grade: 'E', description: 'LULUS' },
        { id: '2', code: '1119', name: 'BAHASA INGGERIS', grade: 'E', description: 'LULUS' },
        { id: '3', code: '1249', name: 'SEJARAH', grade: 'G', description: 'GAGAL' },
        { id: '4', code: '1449', name: 'MATEMATIK', grade: 'D', description: 'LULUS ATAS' },
        { id: '5', code: '1511', name: 'SAINS', grade: 'C', description: 'KEPUJIAN' },
        { id: '6', code: '1225', name: 'PENDIDIKAN MORAL', grade: 'D', description: 'LULUS ATAS' },
      ],
    },
  },
};

// Calculate SPM Certificate eligibility
// Standard rule: Must pass BOTH Bahasa Melayu (code 1103) and Sejarah (code 1249) with at least Grade E.
export function checkSpmEligibility(subjects: Subject[]): {
  isEligible: boolean;
  reason: string;
} {
  const bmSub = subjects.find(s => s.code === '1103');
  const sejarahSub = subjects.find(s => s.code === '1249');

  if (!bmSub) {
    return {
      isEligible: false,
      reason: 'Bahasa Melayu (1103) wajib diambil.',
    };
  }

  if (!sejarahSub) {
    return {
      isEligible: false,
      reason: 'Sejarah (1249) wajib diambil.',
    };
  }

  const bmPass = GRADES_MAP[bmSub.grade]?.isPass && bmSub.grade !== 'G';
  const sejarahPass = GRADES_MAP[sejarahSub.grade]?.isPass && sejarahSub.grade !== 'G';

  if (bmPass && sejarahPass) {
    return {
      isEligible: true,
      reason: 'Memenuhi syarat kelayakan SPM (Lulus BM & Sejarah).',
    };
  }

  const reasons: string[] = [];
  if (!bmPass) reasons.push('Gagal / Tidak Lulus Bahasa Melayu');
  if (!sejarahPass) reasons.push('Gagal / Tidak Lulus Sejarah');

  return {
    isEligible: false,
    reason: `Tidak memenuhi syarat: ${reasons.join(' & ')}.`,
  };
}

// Map English grade to estimated CEFR if CEFR is set to auto
export function estimateCefr(grade: string): string {
  switch (grade) {
    case 'A+': return 'C2';
    case 'A': return 'C1';
    case 'A-': return 'C1';
    case 'B+': return 'B2';
    case 'B': return 'B2';
    case 'C+': return 'B1';
    case 'C': return 'B1';
    case 'D': return 'A2';
    case 'E': return 'A2';
    default: return 'A1';
  }
}
