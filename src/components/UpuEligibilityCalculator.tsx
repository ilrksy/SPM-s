import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { SpmData, Subject } from '../types';
import { COMMON_SUBJECTS, GRADES_MAP, GRADES } from '../data/defaultData';
import { PrintableReport } from './PrintableReport';
import { 
  Award, 
  GraduationCap, 
  Check, 
  X, 
  Info, 
  Search, 
  Filter, 
  Sparkles, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  TrendingUp, 
  BookOpen, 
  CheckCircle, 
  HelpCircle,
  MapPin,
  Flame,
  Plus,
  Trash2,
  RotateCcw,
  Atom,
  Cpu,
  Globe,
  Shield,
  Compass,
  Leaf,
  School,
  Activity,
  Zap,
  Binary,
  Database,
  Building,
  Calendar,
  User,
  Printer,
  FileDown
} from 'lucide-react';

interface UpuEligibilityCalculatorProps {
  spmData: SpmData;
  lang?: 'bm' | 'en';
}

// Grade point map for UPU SPM calculations
const UPU_GRADE_POINTS: Record<string, number> = {
  'A+': 18,
  'A': 16,
  'A-': 14,
  'B+': 12,
  'B': 10,
  'C+': 8,
  'C': 6,
  'D': 4,
  'E': 2,
  'G': 0
};

// University definition
interface University {
  code: string;
  fullName: string;
  type: 'awam' | 'semi' | 'swasta'; // Awam, Semi-Government / GLC, Swasta
  logoColor: string; // Tailwind bg gradient color class (from-... to-...)
  location: string;
  iconName: string; // Dynamic icon selector
  motto?: string;   // Inspiring motto
}

const UNIVERSITIES: Record<string, University> = {
  // Awam (Public Universities)
  'UM': { code: 'UM', fullName: 'Universiti Malaya', type: 'awam', logoColor: 'from-blue-600 to-indigo-800', location: 'Kuala Lumpur', iconName: 'award', motto: 'Sains dan Budi' },
  'USM': { code: 'USM', fullName: 'Universiti Sains Malaysia', type: 'awam', logoColor: 'from-purple-600 to-indigo-900', location: 'Pulau Pinang', iconName: 'atom', motto: 'Kami Memimpin' },
  'UKM': { code: 'UKM', fullName: 'Universiti Kebangsaan Malaysia', type: 'awam', logoColor: 'from-red-600 to-amber-700', location: 'Selangor', iconName: 'shield', motto: 'Mengilham Harapan, Mencipta Masa Depan' },
  'UPM': { code: 'UPM', fullName: 'Universiti Putra Malaysia', type: 'awam', logoColor: 'from-emerald-600 to-teal-800', location: 'Selangor', iconName: 'leaf', motto: 'Berilmu Berbakti' },
  'UTM': { code: 'UTM', fullName: 'Universiti Teknologi Malaysia', type: 'awam', logoColor: 'from-rose-700 to-red-950', location: 'Johor', iconName: 'cpu', motto: 'Kerana Tuhan Untuk Manusia' },
  'UiTM': { code: 'UiTM', fullName: 'Universiti Teknologi MARA', type: 'awam', logoColor: 'from-indigo-700 to-purple-950', location: 'Selangor / Nasional', iconName: 'school', motto: 'Usaha, Taqwa, Mulia' },
  'UIAM': { code: 'UIAM', fullName: 'Universiti Islam Antarabangsa Malaysia', type: 'awam', logoColor: 'from-teal-600 to-emerald-900', location: 'Selangor', iconName: 'globe', motto: 'Taman Ilmu dan Budi' },
  'UUM': { code: 'UUM', fullName: 'Universiti Utara Malaysia', type: 'awam', logoColor: 'from-amber-700 to-yellow-800', location: 'Kedah', iconName: 'database', motto: 'Ilmu, Budi, Bakti' },
  'UPSI': { code: 'UPSI', fullName: 'Universiti Pendidikan Sultan Idris', type: 'awam', logoColor: 'from-sky-600 to-blue-800', location: 'Perak', iconName: 'book', motto: 'Pengetahuan Suluh Budiman' },
  'UniSZA': { code: 'UniSZA', fullName: 'Universiti Sultan Zainal Abidin', type: 'awam', logoColor: 'from-cyan-700 to-blue-900', location: 'Terengganu', iconName: 'compass', motto: 'Ilmu demi Kemaslahatan Insan' },
  'UTeM': { code: 'UTeM', fullName: 'Universiti Teknikal Malaysia Melaka', type: 'awam', logoColor: 'from-amber-600 to-orange-700', location: 'Melaka', iconName: 'binary', motto: 'Sumber Kompetensi Teknikal' },
  'UTHM': { code: 'UTHM', fullName: 'Universiti Tun Hussein Onn Malaysia', type: 'awam', logoColor: 'from-orange-600 to-red-700', location: 'Johor', iconName: 'zap', motto: 'Dengan Hikmah Kita Teroka' },
  'UMPSA': { code: 'UMPSA', fullName: 'Universiti Malaysia Pahang Al-Sultan Abdullah', type: 'awam', logoColor: 'from-blue-800 to-indigo-950', location: 'Pahang', iconName: 'activity', motto: 'Teknologi untuk Masyarakat' },
  'UNIMAS': { code: 'UNIMAS', fullName: 'Universiti Malaysia Sarawak', type: 'awam', logoColor: 'from-violet-600 to-fuchsia-900', location: 'Sarawak', iconName: 'sparkles', motto: 'Menjana Keunggulan Masa Hadapan' },
  'POLI': { code: 'POLI', fullName: 'Politeknik Premier / ILKA', type: 'awam', logoColor: 'from-slate-700 to-slate-900', location: 'Nasional', iconName: 'flame', motto: 'Pendidikan Teknikal dan Vokasional' },
  
  // Newly added IPTAs:
  'UNIMAP': { code: 'UNIMAP', fullName: 'Universiti Malaysia Perlis', type: 'awam', logoColor: 'from-blue-700 to-cyan-900', location: 'Perlis', iconName: 'cpu', motto: 'Ilmu, Keikhlasan, Kecemerlangan' },
  'UMT': { code: 'UMT', fullName: 'Universiti Malaysia Terengganu', type: 'awam', logoColor: 'from-blue-500 to-teal-700', location: 'Terengganu', iconName: 'compass', motto: 'Teraju Kelautan Negara' },
  'UMS': { code: 'UMS', fullName: 'Universiti Malaysia Sabah', type: 'awam', logoColor: 'from-rose-600 to-pink-900', location: 'Sabah', iconName: 'globe', motto: 'Bertekad Cemerlang' },
  'USIM': { code: 'USIM', fullName: 'Universiti Sains Islam Malaysia', type: 'awam', logoColor: 'from-emerald-700 to-teal-950', location: 'Negeri Sembilan', iconName: 'book', motto: 'Berdisiplin, Berakhlak, Berbakti' },
  'UMK': { code: 'UMK', fullName: 'Universiti Malaysia Kelantan', type: 'awam', logoColor: 'from-orange-500 to-amber-850', location: 'Kelantan', iconName: 'leaf', motto: 'Keusahawanan adalah Teras Kami' },
  'UPNM': { code: 'UPNM', fullName: 'Universiti Pertahanan Nasional Malaysia', type: 'awam', logoColor: 'from-red-700 to-rose-950', location: 'Kuala Lumpur', iconName: 'shield', motto: 'Kewajipan, Maruah, Integriti' },

  // Semi-Government / GLC (Semi-Swasta)
  'MMU': { code: 'MMU', fullName: 'Multimedia University', type: 'semi', logoColor: 'from-pink-700 to-rose-900', location: 'Selangor / Melaka', iconName: 'binary', motto: 'Inovasi untuk Kejayaan' },
  'UTP': { code: 'UTP', fullName: 'Universiti Teknologi PETRONAS', type: 'semi', logoColor: 'from-amber-600 to-yellow-950', location: 'Perak', iconName: 'atom', motto: 'Meneroka Sains, Mengubah Kehidupan' },
  'UNITEN': { code: 'UNITEN', fullName: 'Universiti Tenaga Nasional', type: 'semi', logoColor: 'from-red-800 to-orange-950', location: 'Selangor / Pahang', iconName: 'zap', motto: 'Peneraju Tenaga Lestari' },
  'UniKL': { code: 'UniKL', fullName: 'Universiti Kuala Lumpur', type: 'semi', logoColor: 'from-rose-600 to-red-800', location: 'Kuala Lumpur / Nasional', iconName: 'cpu', motto: 'Ke Arah Kecemerlangan Teknikal' },
  'TARUMT': { code: 'TARUMT', fullName: 'Tunku Abdul Rahman University of Management and Technology', type: 'semi', logoColor: 'from-orange-500 to-red-600', location: 'Kuala Lumpur / Nasional', iconName: 'school', motto: 'Kecemerlangan dalam Pendidikan' },

  // Swasta / IPTS (Private Universities)
  'TAYLOR': { code: 'TAYLOR', fullName: 'Taylor\'s University', type: 'swasta', logoColor: 'from-stone-800 to-stone-950', location: 'Selangor', iconName: 'award', motto: 'Wisdom, Integrity, Excellence' },
  'SUNWAY': { code: 'SUNWAY', fullName: 'Sunway University', type: 'swasta', logoColor: 'from-yellow-500 to-amber-600', location: 'Selangor', iconName: 'globe', motto: 'Kecemerlangan Berterusan' },
  'APU': { code: 'APU', fullName: 'Asia Pacific University of Technology & Innovation', type: 'swasta', logoColor: 'from-teal-850 to-cyan-950', location: 'Kuala Lumpur', iconName: 'cpu', motto: 'Di Sini Minda Terbuka Dilatih' },
  'UTAR': { code: 'UTAR', fullName: 'Universiti Tunku Abdul Rahman', type: 'swasta', logoColor: 'from-emerald-850 to-green-950', location: 'Perak / Selangor', iconName: 'book', motto: 'Kebajikan, Kebijaksanaan, Sains' },
  'UCSI': { code: 'UCSI', fullName: 'UCSI University', type: 'swasta', logoColor: 'from-indigo-850 to-blue-950', location: 'Kuala Lumpur', iconName: 'shield', motto: 'The University of Value' },
  'MONASH': { code: 'MONASH', fullName: 'Monash University Malaysia', type: 'swasta', logoColor: 'from-blue-900 to-slate-900', location: 'Selangor', iconName: 'award', motto: 'Ancora Imparo' },
  'MSU': { code: 'MSU', fullName: 'Management and Science University', type: 'swasta', logoColor: 'from-pink-600 to-purple-800', location: 'Selangor', iconName: 'activity', motto: 'Transforming Lives, Enriching Future' }
};

function getUniversityIcon(iconName: string, className = "w-5 h-5") {
  switch (iconName) {
    case 'award': return <Award className={className} />;
    case 'atom': return <Atom className={className} />;
    case 'cpu': return <Cpu className={className} />;
    case 'globe': return <Globe className={className} />;
    case 'shield': return <Shield className={className} />;
    case 'compass': return <Compass className={className} />;
    case 'leaf': return <Leaf className={className} />;
    case 'school': return <School className={className} />;
    case 'activity': return <Activity className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'binary': return <Binary className={className} />;
    case 'database': return <Database className={className} />;
    case 'sparkles': return <Sparkles className={className} />;
    case 'book': return <BookOpen className={className} />;
    case 'flame': return <Flame className={className} />;
    default: return <GraduationCap className={className} />;
  }
}

interface CourseProgram {
  id: string;
  name: string;
  category: 'sains' | 'sastera' | 'umum';
  level: 'Sarjana Muda' | 'Diploma';
  
  // SPM Settings
  minMeritSpm: number;
  requirementsTextSpm: string;
  checkRequirementsSpm: (subjects: Subject[]) => { eligible: boolean; reason?: string };
  
  // STPM Settings
  minMeritStpm: number;
  requirementsTextStpm: string;
  checkRequirementsStpm: (cgpa: number, muet: number) => { eligible: boolean; reason?: string };

  universities: string[]; // Codes of matching universities
}

// Grade comparison utility (A+ is better than A, etc.)
// Returns true if actualGrade is equal to or better than targetGrade
function isGradeAtLeast(actualGrade: string | undefined, targetGrade: string): boolean {
  if (!actualGrade) return false;
  const gradeRank: Record<string, number> = {
    'A+': 9, 'A': 8, 'A-': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D': 2, 'E': 1, 'G': 0
  };
  const actualRank = gradeRank[actualGrade] ?? -1;
  const targetRank = gradeRank[targetGrade] ?? -1;
  return actualRank >= targetRank;
}

const COURSE_PROGRAMS: CourseProgram[] = [
  // ----------------------- MEDICAL & SCIENCE -----------------------
  {
    id: 'mbbs',
    name: 'Ijazah Sarjana Muda Perubatan & Bedah (MBBS / Medicine)',
    category: 'sains',
    level: 'Sarjana Muda',
    minMeritSpm: 90.0,
    requirementsTextSpm: 'Sains Tulen: Kimia (min B), Biologi (min B), Fizik (min B) & Mat Tambahan (min B)',
    checkRequirementsSpm: (subjects) => {
      const kimia = subjects.find(s => s.code === '4541')?.grade;
      const biologi = subjects.find(s => s.code === '4551')?.grade;
      const fizik = subjects.find(s => s.code === '4531')?.grade;
      const addMath = subjects.find(s => s.code === '3472')?.grade;

      if (!kimia || !biologi || !fizik || !addMath) {
        return { eligible: false, reason: 'Memerlukan subjek Kimia, Biologi, Fizik & Matematik Tambahan.' };
      }
      if (!isGradeAtLeast(kimia, 'B') || !isGradeAtLeast(biologi, 'B') || !isGradeAtLeast(fizik, 'B') || !isGradeAtLeast(addMath, 'B')) {
        return { eligible: false, reason: 'Kimia, Biologi, Fizik & Mat Tambahan mesti sekurang-kurangnya gred B.' };
      }
      return { eligible: true };
    },
    minMeritStpm: 92.0,
    requirementsTextStpm: 'STPM: PNGK Akademik sekurang-kurangnya 3.50 & MUET sekurang-kurangnya Band 4.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 3.50) return { eligible: false, reason: 'PNGK STPM minimum mestilah 3.50.' };
      if (muet < 4.0) return { eligible: false, reason: 'Skor MUET minimum mestilah Band 4.0.' };
      return { eligible: true };
    },
    universities: ['UM', 'USM', 'UKM', 'UPM', 'UiTM', 'UniSZA', 'TAYLOR', 'UCSI', 'USIM', 'MSU', 'MONASH']
  },
  {
    id: 'pharmacy',
    name: 'Ijazah Sarjana Muda Farmasi (Pharmacy)',
    category: 'sains',
    level: 'Sarjana Muda',
    minMeritSpm: 82.0,
    requirementsTextSpm: 'Sains Tulen: Kimia (min B), Biologi/Fizik (min C) & Matematik/Mat Tambahan (min B)',
    checkRequirementsSpm: (subjects) => {
      const kimia = subjects.find(s => s.code === '4541')?.grade;
      const biologi = subjects.find(s => s.code === '4551')?.grade;
      const fizik = subjects.find(s => s.code === '4531')?.grade;
      const math = subjects.find(s => s.code === '1449')?.grade;
      const addMath = subjects.find(s => s.code === '3472')?.grade;

      if (!kimia) return { eligible: false, reason: 'Memerlukan subjek Kimia.' };
      if (!isGradeAtLeast(kimia, 'B')) return { eligible: false, reason: 'Kimia mesti sekurang-kurangnya gred B.' };
      
      const hasBio = biologi && isGradeAtLeast(biologi, 'C');
      const hasFiz = fizik && isGradeAtLeast(fizik, 'C');
      if (!hasBio && !hasFiz) return { eligible: false, reason: 'Memerlukan Biologi atau Fizik sekurang-kurangnya gred C.' };

      const hasMathB = math && isGradeAtLeast(math, 'B');
      const hasAddMathB = addMath && isGradeAtLeast(addMath, 'B');
      if (!hasMathB && !hasAddMathB) return { eligible: false, reason: 'Matematik atau Matematik Tambahan mesti sekurang-kurangnya gred B.' };

      return { eligible: true };
    },
    minMeritStpm: 84.0,
    requirementsTextStpm: 'STPM: PNGK Akademik sekurang-kurangnya 3.30 & MUET sekurang-kurangnya Band 3.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 3.30) return { eligible: false, reason: 'PNGK STPM minimum mestilah 3.30.' };
      if (muet < 3.0) return { eligible: false, reason: 'Skor MUET minimum mestilah Band 3.0.' };
      return { eligible: true };
    },
    universities: ['UM', 'USM', 'UKM', 'UiTM', 'TAYLOR', 'UCSI', 'UPM', 'UniSZA', 'USIM', 'MSU', 'MONASH']
  },
  {
    id: 'dentistry',
    name: 'Ijazah Sarjana Muda Perubatan Pergigian (Dentistry)',
    category: 'sains',
    level: 'Sarjana Muda',
    minMeritSpm: 88.0,
    requirementsTextSpm: 'Sains Tulen: Kimia (min B), Biologi (min B) & Fizik/Mat Tambahan (min B)',
    checkRequirementsSpm: (subjects) => {
      const kimia = subjects.find(s => s.code === '4541')?.grade;
      const biologi = subjects.find(s => s.code === '4551')?.grade;
      const fizik = subjects.find(s => s.code === '4531')?.grade;
      const addMath = subjects.find(s => s.code === '3472')?.grade;

      if (!kimia || !biologi) return { eligible: false, reason: 'Memerlukan subjek Kimia & Biologi.' };
      if (!isGradeAtLeast(kimia, 'B') || !isGradeAtLeast(biologi, 'B')) {
        return { eligible: false, reason: 'Kimia & Biologi mesti sekurang-kurangnya gred B.' };
      }
      const hasFiz = fizik && isGradeAtLeast(fizik, 'B');
      const hasAdd = addMath && isGradeAtLeast(addMath, 'B');
      if (!hasFiz && !hasAdd) {
        return { eligible: false, reason: 'Fizik atau Matematik Tambahan mesti sekurang-kurangnya gred B.' };
      }
      return { eligible: true };
    },
    minMeritStpm: 90.0,
    requirementsTextStpm: 'STPM: PNGK Akademik sekurang-kurangnya 3.50 & MUET sekurang-kurangnya Band 4.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 3.50) return { eligible: false, reason: 'PNGK STPM minimum mestilah 3.50.' };
      if (muet < 4.0) return { eligible: false, reason: 'Skor MUET minimum mestilah Band 4.0.' };
      return { eligible: true };
    },
    universities: ['UM', 'USM', 'UKM', 'UiTM', 'UCSI', 'USIM']
  },

  // ----------------------- COMPUTER SCIENCE & ENGINEERING -----------------------
  {
    id: 'cs_se',
    name: 'Ijazah Sarjana Muda Sains Komputer / Teknologi Maklumat / Kejuruteraan Perisian',
    category: 'umum',
    level: 'Sarjana Muda',
    minMeritSpm: 74.0,
    requirementsTextSpm: 'Matematik / Mat Tambahan (min B) & Lulus Bahasa Inggeris (min C)',
    checkRequirementsSpm: (subjects) => {
      const math = subjects.find(s => s.code === '1449')?.grade;
      const addMath = subjects.find(s => s.code === '3472')?.grade;
      const bi = subjects.find(s => s.code === '1119')?.grade;

      const hasMath = (math && isGradeAtLeast(math, 'B')) || (addMath && isGradeAtLeast(addMath, 'B'));
      if (!hasMath) return { eligible: false, reason: 'Matematik atau Matematik Tambahan mesti sekurang-kurangnya gred B.' };
      if (!bi || !isGradeAtLeast(bi, 'C')) return { eligible: false, reason: 'Bahasa Inggeris mesti sekurang-kurangnya gred C.' };
      
      return { eligible: true };
    },
    minMeritStpm: 68.0,
    requirementsTextStpm: 'STPM: PNGK sekurang-kurangnya 2.50 & MUET sekurang-kurangnya Band 2.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 2.50) return { eligible: false, reason: 'PNGK STPM minimum mestilah 2.50.' };
      if (muet < 2.0) return { eligible: false, reason: 'Skor MUET minimum mestilah Band 2.0.' };
      return { eligible: true };
    },
    universities: ['UM', 'UTM', 'USM', 'UKM', 'UPM', 'UiTM', 'UTeM', 'UNIMAS', 'MMU', 'UTP', 'UNITEN', 'UniKL', 'APU', 'UTAR', 'SUNWAY', 'TAYLOR', 'TARUMT', 'UNIMAP', 'UMT', 'UMS', 'USIM', 'UMK', 'MSU']
  },
  {
    id: 'engineering',
    name: 'Ijazah Sarjana Muda Kejuruteraan (Mekanikal / Elektrik / Awam / Kimia)',
    category: 'sains',
    level: 'Sarjana Muda',
    minMeritSpm: 70.0,
    requirementsTextSpm: 'Sains Tulen: Matematik Tambahan (min C), Fizik (min C) & Kimia (min C)',
    checkRequirementsSpm: (subjects) => {
      const addMath = subjects.find(s => s.code === '3472')?.grade;
      const fizik = subjects.find(s => s.code === '4531')?.grade;
      const kimia = subjects.find(s => s.code === '4541')?.grade;

      if (!addMath || !fizik || !kimia) {
        return { eligible: false, reason: 'Sains Tulen sahaja: Memerlukan Mat Tambahan, Fizik & Kimia.' };
      }
      if (!isGradeAtLeast(addMath, 'C') || !isGradeAtLeast(fizik, 'C') || !isGradeAtLeast(kimia, 'C')) {
        return { eligible: false, reason: 'Mat Tambahan, Fizik & Kimia mesti sekurang-kurangnya gred C.' };
      }
      return { eligible: true };
    },
    minMeritStpm: 72.0,
    requirementsTextStpm: 'STPM: PNGK sekurang-kurangnya 2.75 (Matematik T/Fizik) & MUET sekurang-kurangnya Band 3.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 2.75) return { eligible: false, reason: 'PNGK STPM minimum mestilah 2.75.' };
      if (muet < 3.0) return { eligible: false, reason: 'Skor MUET minimum mestilah Band 3.0.' };
      return { eligible: true };
    },
    universities: ['UTM', 'UM', 'USM', 'UKM', 'UPM', 'UTHM', 'UMPSA', 'UiTM', 'UTP', 'UNITEN', 'MMU', 'UniKL', 'TAYLOR', 'UCSI', 'UNIMAP', 'UPNM']
  },

  // ----------------------- LAW & SOCIAL SCIENCES -----------------------
  {
    id: 'law',
    name: 'Ijazah Sarjana Muda Undang-Undang (LL.B / Law)',
    category: 'sastera',
    level: 'Sarjana Muda',
    minMeritSpm: 84.0,
    requirementsTextSpm: 'Bahasa Inggeris (min A-), Bahasa Melayu (min A-) & Sejarah (min B)',
    checkRequirementsSpm: (subjects) => {
      const bi = subjects.find(s => s.code === '1119')?.grade;
      const bm = subjects.find(s => s.code === '1103')?.grade;
      const sejarah = subjects.find(s => s.code === '1249')?.grade;

      if (!bi || !bm || !sejarah) return { eligible: false, reason: 'Memerlukan BM, BI & Sejarah.' };
      if (!isGradeAtLeast(bm, 'A-')) return { eligible: false, reason: 'Bahasa Melayu mesti sekurang-kurangnya gred A-.' };
      if (!isGradeAtLeast(bi, 'A-')) return { eligible: false, reason: 'Bahasa Inggeris mesti sekurang-kurangnya gred A-.' };
      if (!isGradeAtLeast(sejarah, 'B')) return { eligible: false, reason: 'Sejarah mesti sekurang-kurangnya gred B.' };
      
      return { eligible: true };
    },
    minMeritStpm: 85.0,
    requirementsTextStpm: 'STPM: PNGK sekurang-kurangnya 3.00 & MUET sekurang-kurangnya Band 4.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 3.00) return { eligible: false, reason: 'PNGK STPM minimum mestilah 3.00.' };
      if (muet < 4.0) return { eligible: false, reason: 'Skor MUET minimum mestilah Band 4.0.' };
      return { eligible: true };
    },
    universities: ['UM', 'UIAM', 'UiTM', 'UKM', 'TAYLOR', 'UTAR', 'USIM', 'UPNM']
  },
  {
    id: 'accounting',
    name: 'Ijazah Sarjana Muda Perakaunan (Accounting)',
    category: 'sastera',
    level: 'Sarjana Muda',
    minMeritSpm: 76.0,
    requirementsTextSpm: 'Matematik (min B) & lulus subjek Akaun/Ekonomi/Perniagaan (min C)',
    checkRequirementsSpm: (subjects) => {
      const math = subjects.find(s => s.code === '1449')?.grade;
      const akaun = subjects.find(s => s.code === '3756')?.grade;
      const ekonomi = subjects.find(s => s.code === '3767')?.grade;
      const perniagaan = subjects.find(s => s.code === '3766')?.grade;

      if (!math || !isGradeAtLeast(math, 'B')) return { eligible: false, reason: 'Matematik mesti sekurang-kurangnya gred B.' };
      
      const hasBusinessSub = (akaun && isGradeAtLeast(akaun, 'C')) || 
                             (ekonomi && isGradeAtLeast(ekonomi, 'C')) || 
                             (perniagaan && isGradeAtLeast(perniagaan, 'C'));
      if (!hasBusinessSub) return { eligible: false, reason: 'Mesti mendapat sekurang-kurangnya C dalam salah satu: Perakaunan, Ekonomi, atau Perniagaan.' };
      
      return { eligible: true };
    },
    minMeritStpm: 75.0,
    requirementsTextStpm: 'STPM: PNGK sekurang-kurangnya 2.80 & MUET sekurang-kurangnya Band 3.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 2.80) return { eligible: false, reason: 'PNGK STPM minimum mestilah 2.80.' };
      if (muet < 3.0) return { eligible: false, reason: 'Skor MUET minimum mestilah Band 3.0.' };
      return { eligible: true };
    },
    universities: ['UM', 'UKM', 'UPM', 'UUM', 'UiTM', 'UIAM', 'UNITEN', 'MMU', 'SUNWAY', 'TAYLOR', 'TARUMT', 'UTAR', 'UMT', 'UMS', 'USIM', 'UMK', 'MSU']
  },
  {
    id: 'tesl',
    name: 'Ijazah Sarjana Muda Pendidikan (TESL)',
    category: 'sastera',
    level: 'Sarjana Muda',
    minMeritSpm: 75.0,
    requirementsTextSpm: 'Bahasa Inggeris (min A-) & Bahasa Melayu (min C)',
    checkRequirementsSpm: (subjects) => {
      const bi = subjects.find(s => s.code === '1119')?.grade;
      const bm = subjects.find(s => s.code === '1103')?.grade;

      if (!bi || !isGradeAtLeast(bi, 'A-')) return { eligible: false, reason: 'Bahasa Inggeris mesti sekurang-kurangnya gred A-.' };
      if (!bm || !isGradeAtLeast(bm, 'C')) return { eligible: false, reason: 'Bahasa Melayu mesti sekurang-kurangnya gred C.' };
      
      return { eligible: true };
    },
    minMeritStpm: 76.0,
    requirementsTextStpm: 'STPM: PNGK sekurang-kurangnya 3.00 & MUET sekurang-kurangnya Band 4.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 3.00) return { eligible: false, reason: 'PNGK STPM minimum mestilah 3.00.' };
      if (muet < 4.0) return { eligible: false, reason: 'Skor MUET minimum mestilah Band 4.0.' };
      return { eligible: true };
    },
    universities: ['UPSI', 'UiTM', 'UM', 'UKM', 'UNITEN', 'UniKL', 'UMS', 'USIM']
  },
  {
    id: 'business_admin',
    name: 'Ijazah Sarjana Muda Pentadbiran Perniagaan',
    category: 'sastera',
    level: 'Sarjana Muda',
    minMeritSpm: 64.0,
    requirementsTextSpm: 'Matematik (min C) & Lulus Bahasa Melayu & Sejarah',
    checkRequirementsSpm: (subjects) => {
      const math = subjects.find(s => s.code === '1449')?.grade;
      const bm = subjects.find(s => s.code === '1103')?.grade;
      const sejarah = subjects.find(s => s.code === '1249')?.grade;

      if (!math || !isGradeAtLeast(math, 'C')) return { eligible: false, reason: 'Matematik mesti sekurang-kurangnya gred C.' };
      if (!bm || !isGradeAtLeast(bm, 'E')) return { eligible: false, reason: 'Mesti lulus Bahasa Melayu.' };
      if (!sejarah || !isGradeAtLeast(sejarah, 'E')) return { eligible: false, reason: 'Mesti lulus Sejarah.' };
      
      return { eligible: true };
    },
    minMeritStpm: 60.0,
    requirementsTextStpm: 'STPM: PNGK sekurang-kurangnya 2.30 & MUET sekurang-kurangnya Band 2.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 2.30) return { eligible: false, reason: 'PNGK STPM minimum mestilah 2.30.' };
      if (muet < 2.0) return { eligible: false, reason: 'Skor MUET minimum mestilah Band 2.0.' };
      return { eligible: true };
    },
    universities: ['UUM', 'UiTM', 'UKM', 'UPM', 'UNIMAS', 'MMU', 'UNITEN', 'TAYLOR', 'SUNWAY', 'APU', 'UTAR', 'TARUMT', 'UMT', 'UMS', 'USIM', 'UMK', 'MSU']
  },

  // ----------------------- GENERAL DIPLOMA & POLYTECHNICS -----------------------
  // Note: Diplomas are mainly for SPM holders.
  {
    id: 'dip_cs',
    name: 'Diploma Sains Komputer / Teknologi Maklumat',
    category: 'umum',
    level: 'Diploma',
    minMeritSpm: 45.0,
    requirementsTextSpm: 'Matematik (min C) & Lulus 3 subjek lain',
    checkRequirementsSpm: (subjects) => {
      const math = subjects.find(s => s.code === '1449')?.grade;
      if (!math || !isGradeAtLeast(math, 'C')) return { eligible: false, reason: 'Matematik mesti sekurang-kurangnya gred C.' };
      
      const passes = subjects.filter(s => s.grade !== 'G').length;
      if (passes < 3) return { eligible: false, reason: 'Memerlukan sekurang-kurangnya 3 subjek lulus.' };
      
      return { eligible: true };
    },
    minMeritStpm: 40.0,
    requirementsTextStpm: 'STPM: PNGK sekurang-kurangnya 2.00 & MUET sekurang-kurangnya Band 1.0 (Bukan sasaran utama lepasan STPM)',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 2.00) return { eligible: false, reason: 'PNGK minimum Diploma mestilah 2.00.' };
      return { eligible: true };
    },
    universities: ['UiTM', 'UTeM', 'POLI', 'MMU', 'UNITEN', 'UniKL', 'TARUMT', 'APU', 'UTAR', 'UNIMAP', 'MSU']
  },
  {
    id: 'dip_eng',
    name: 'Diploma Kejuruteraan (Mekanikal/Elektrik/Awam)',
    category: 'sains',
    level: 'Diploma',
    minMeritSpm: 48.0,
    requirementsTextSpm: 'Matematik (min C), Fizik/Kimia/Sains (min C) & Lulus Sejarah',
    checkRequirementsSpm: (subjects) => {
      const math = subjects.find(s => s.code === '1449')?.grade;
      const fizik = subjects.find(s => s.code === '4531')?.grade;
      const kimia = subjects.find(s => s.code === '4541')?.grade;
      const sains = subjects.find(s => s.code === '1511')?.grade;
      const sejarah = subjects.find(s => s.code === '1249')?.grade;

      if (!math || !isGradeAtLeast(math, 'C')) return { eligible: false, reason: 'Matematik mesti sekurang-kurangnya gred C.' };
      
      const hasScience = (fizik && isGradeAtLeast(fizik, 'C')) || 
                         (kimia && isGradeAtLeast(kimia, 'C')) || 
                         (sains && isGradeAtLeast(sains, 'C'));
      if (!hasScience) return { eligible: false, reason: 'Fizik, Kimia, atau Sains mesti sekurang-kurangnya gred C.' };
      if (!sejarah || !isGradeAtLeast(sejarah, 'E')) return { eligible: false, reason: 'Sejarah mesti sekurang-kurangnya lulus.' };
      
      return { eligible: true };
    },
    minMeritStpm: 40.0,
    requirementsTextStpm: 'STPM: PNGK sekurang-kurangnya 2.00 & MUET sekurang-kurangnya Band 1.0',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 2.00) return { eligible: false, reason: 'PNGK STPM minimum Diploma mestilah 2.00.' };
      return { eligible: true };
    },
    universities: ['UiTM', 'UTHM', 'POLI', 'UNITEN', 'UniKL', 'MMU', 'TARUMT', 'UNIMAP']
  },
  {
    id: 'dip_business',
    name: 'Diploma Pengurusan Perniagaan / Perakaunan',
    category: 'sastera',
    level: 'Diploma',
    minMeritSpm: 40.0,
    requirementsTextSpm: 'Matematik (min D), Lulus Bahasa Melayu & Sejarah',
    checkRequirementsSpm: (subjects) => {
      const math = subjects.find(s => s.code === '1449')?.grade;
      const bm = subjects.find(s => s.code === '1103')?.grade;
      const sejarah = subjects.find(s => s.code === '1249')?.grade;

      if (!math || !isGradeAtLeast(math, 'D')) return { eligible: false, reason: 'Matematik mesti sekurang-kurangnya gred D.' };
      if (!bm || !isGradeAtLeast(bm, 'E')) return { eligible: false, reason: 'Mesti lulus Bahasa Melayu.' };
      if (!sejarah || !isGradeAtLeast(sejarah, 'E')) return { eligible: false, reason: 'Mesti lulus Sejarah.' };
      
      return { eligible: true };
    },
    minMeritStpm: 40.0,
    requirementsTextStpm: 'STPM: PNGK sekurang-kurangnya 2.00 (Lulus SPM Matematik)',
    checkRequirementsStpm: (cgpa, muet) => {
      if (cgpa < 2.00) return { eligible: false, reason: 'PNGK STPM minimum Diploma mestilah 2.00.' };
      return { eligible: true };
    },
    universities: ['UiTM', 'POLI', 'MMU', 'UNITEN', 'TARUMT', 'SUNWAY', 'TAYLOR', 'UTAR', 'MSU', 'UMK']
  }
];

export default function UpuEligibilityCalculator({ spmData, lang = 'bm' }: UpuEligibilityCalculatorProps) {
  // Mode configuration: SPM or STPM pathway
  const [pathway, setPathway] = useState<'spm' | 'stpm'>('spm');

  // SPM specific settings
  const [spmStream, setSpmStream] = useState<'sains' | 'sastera'>('sains');
  const [spmKokoScore, setSpmKokoScore] = useState<number>(8.0); // 0.0 - 10.0

  // STPM specific settings
  const [stpmCgpa, setStpmCgpa] = useState<number>(3.25); // 0.00 - 4.00
  const [stpmMuet, setStpmMuet] = useState<number>(3.5); // 1.0 to 6.0 (allows decimal bands like 3.5, 4.5 in new format)
  const [stpmKokoScore, setStpmKokoScore] = useState<number>(8.2); // 0.0 - 10.0

  // Common UI State
  const [viewTab, setViewTab] = useState<'courses' | 'universities'>('universities');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<'Semua' | 'Sarjana Muda' | 'Diploma'>('Semua');
  const [showIneligible, setShowIneligible] = useState<boolean>(true);
  
  // Filters
  const [selectedUnivType, setSelectedUnivType] = useState<'semua' | 'awam' | 'semi' | 'swasta'>('semua');
  const [selectedSpecificUniv, setSelectedSpecificUniv] = useState<string>('Semua');

  // Interactive state for university cards
  const [expandedUniv, setExpandedUniv] = useState<string | null>(null);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState<boolean>(true);

  // --- UPU SIMULATION SUBJECT STATE ---
  const [excludedSubjectIds, setExcludedSubjectIds] = useState<Set<string>>(new Set());
  const [additionalSubjects, setAdditionalSubjects] = useState<Subject[]>([]);
  const [gradeOverrides, setGradeOverrides] = useState<Record<string, string>>({});
  const [showSpmSimulationManager, setShowSpmSimulationManager] = useState<boolean>(false);
  
  // Quick-add states
  const [simSubjectCode, setSimSubjectCode] = useState<string>('');
  const [simSubjectName, setSimSubjectName] = useState<string>('');
  const [simSubjectGrade, setSimSubjectGrade] = useState<string>('A');
  const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);

  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  const handleDownloadReport = async () => {
    const element = document.getElementById('upu-report-pdf-target');
    if (!element) {
      alert('Ralat sistem: Sila tunggu seketika atau cuba lagi.');
      return;
    }

    setIsGeneratingReport(true);

    let clonedElement: HTMLElement | null = null;
    try {
      clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.id = 'upu-report-pdf-clone';
      clonedElement.style.position = 'fixed';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.width = '794px';
      clonedElement.style.minHeight = '1123px';
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.zIndex = '2147483647';
      clonedElement.style.overflow = 'visible';
      clonedElement.style.padding = '0';
      clonedElement.style.margin = '0';
      clonedElement.style.boxSizing = 'border-box';
      document.body.appendChild(clonedElement);

      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/png', 1);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');

      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const formattedName = spmData.studentInfo.name?.trim().replace(/\s+/g, '_').toUpperCase() || 'CALON';
      const fileName = `Laporan_Kelayakan_UPU_${spmData.studentInfo.examYear || '2024'}_${formattedName}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Ralat semasa menjana PDF. Sila cuba lagi.');
    } finally {
      if (clonedElement?.parentNode) {
        clonedElement.parentNode.removeChild(clonedElement);
      }
      setIsGeneratingReport(false);
    }
  };

  // Compute active subjects for UPU simulation
  const activeUpuSubjects = useMemo(() => {
    // 1. Base subjects from original slip (filtering out excluded)
    const baseList = spmData.subjects
      .filter(s => !excludedSubjectIds.has(s.id))
      .map(s => {
        if (gradeOverrides[s.id]) {
          const overGrade = gradeOverrides[s.id];
          const desc = GRADES_MAP[overGrade]?.malay || s.description;
          return { ...s, grade: overGrade, description: desc };
        }
        return s;
      });

    // 2. Additional simulation-only subjects
    const extraList = additionalSubjects.map(s => {
      if (gradeOverrides[s.id]) {
        const overGrade = gradeOverrides[s.id];
        const desc = GRADES_MAP[overGrade]?.malay || s.description;
        return { ...s, grade: overGrade, description: desc };
      }
      return s;
    });

    return [...baseList, ...extraList];
  }, [spmData.subjects, excludedSubjectIds, additionalSubjects, gradeOverrides]);

  // Check BM and Sejarah eligibility
  useEffect(() => {
    if (pathway !== 'spm') return;
    
    const bm = activeUpuSubjects.find(s => s.code === '1103');
    const sejarah = activeUpuSubjects.find(s => s.code === '1249');

    const bmFails = !bm || !isGradeAtLeast(bm.grade, 'E');
    const sejarahFails = !sejarah || !isGradeAtLeast(sejarah.grade, 'E');

    if (bmFails || sejarahFails) {
      toast.error('Amaran Kelayakan!', {
        description: `Gred anda untuk ${bmFails ? 'Bahasa Melayu' : ''}${bmFails && sejarahFails ? ' dan ' : ''}${sejarahFails ? 'Sejarah' : ''} tidak memenuhi kriteria lulus minimum (E). Sila pastikan anda mendapat sekurang-kurangnya E untuk subjek wajib ini.`,
        duration: 8000,
      });
    }
  }, [activeUpuSubjects, pathway]);

  // Compute academic analytics for student's profile & career path suggestions
  const academicAnalytics = useMemo(() => {
    const totalA = activeUpuSubjects.filter(s => ['A+', 'A', 'A-'].includes(s.grade)).length;
    const isScience = activeUpuSubjects.some(s => ['4531', '4541', '4551'].includes(s.code));
    
    let directionBm = "Sains Kemasyarakatan, Pentadbiran Awam, Komunikasi, atau Sastera Kreatif.";
    let directionEn = "Social Sciences, Public Administration, Communications, or Creative Arts.";
    
    if (isScience && totalA >= 5) {
      directionBm = "Sains Tulen, Perubatan, Kejuruteraan Elektrik/Mekanikal, atau Teknologi Maklumat & AI.";
      directionEn = "Pure Sciences, Medicine & Healthcare, Electrical/Mechanical Engineering, or IT & Artificial Intelligence.";
    } else if (isScience) {
      directionBm = "Sains Gunaan, Biosains, Kejuruteraan Mekatronik, Rekabentuk Grafik, atau Senibina.";
      directionEn = "Applied Sciences, Biosciences, Mechatronics Engineering, Graphic Design, or Architecture.";
    } else if (totalA >= 5) {
      directionBm = "Perakaunan Profesional, Pengurusan Kewangan, Undang-undang, atau Sains Data.";
      directionEn = "Professional Accounting, Financial Management, Law, or Data Science.";
    } else if (activeUpuSubjects.some(s => s.code === '3756' || s.code === '3766')) {
      directionBm = "Sains Pentadbiran, Ekonomi, Pengurusan Perniagaan, atau Keusahawanan Digital.";
      directionEn = "Administrative Sciences, Economics, Business Management, or Digital Entrepreneurship.";
    }
    
    return { totalA, isScience, directionBm, directionEn };
  }, [activeUpuSubjects]);

  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'E': 0, 'G': 0
    };
    activeUpuSubjects.forEach(s => {
      if (counts.hasOwnProperty(s.grade)) {
        counts[s.grade]++;
      }
    });
    return Object.entries(counts).map(([grade, count]) => ({ grade, count }));
  }, [activeUpuSubjects]);

  // Calculate SPM Merit
  const spmMeritCalculation = useMemo(() => {
    let coreSubjectCodes: string[] = [];
    if (spmStream === 'sains') {
      coreSubjectCodes = ['1449', '3472', '4531', '4541'];
    } else {
      coreSubjectCodes = ['1103', '1119', '1249', '1449', '1511'];
    }

    const coreList: { code: string; name: string; grade: string; points: number; isMissing: boolean }[] = [];
    const usedSubjectIds = new Set<string>();

    coreSubjectCodes.forEach(code => {
      const found = activeUpuSubjects.find(s => s.code === code);
      if (found) {
        coreList.push({
          code,
          name: found.name,
          grade: found.grade,
          points: UPU_GRADE_POINTS[found.grade] || 0,
          isMissing: false
        });
        usedSubjectIds.add(found.id);
      } else {
        coreList.push({
          code,
          name: code === '3472' ? 'MATEMATIK TAMBAHAN (Wajib)' : code === '4531' ? 'FIZIK (Wajib)' : code === '4541' ? 'KIMIA (Wajib)' : 'SUBJEK TERAS',
          grade: '-',
          points: 0,
          isMissing: true
        });
      }
    });

    if (spmStream === 'sains') {
      const bioSub = activeUpuSubjects.find(s => s.code === '4551');
      if (bioSub) {
        coreList.push({
          code: '4551',
          name: bioSub.name,
          grade: bioSub.grade,
          points: UPU_GRADE_POINTS[bioSub.grade] || 0,
          isMissing: false
        });
        usedSubjectIds.add(bioSub.id);
      } else {
        const otherScience = activeUpuSubjects.find(s => (s.code === '1511' || s.code === '1223' || s.code === '5226') && !usedSubjectIds.has(s.id));
        if (otherScience) {
          coreList.push({
            code: otherScience.code,
            name: otherScience.name,
            grade: otherScience.grade,
            points: UPU_GRADE_POINTS[otherScience.grade] || 0,
            isMissing: false
          });
          usedSubjectIds.add(otherScience.id);
        } else {
          coreList.push({
            code: '4551',
            name: 'BIOLOGI / SAINS (Wajib)',
            grade: '-',
            points: 0,
            isMissing: true
          });
        }
      }
    }

    const remainingSubjects = activeUpuSubjects.filter(s => !usedSubjectIds.has(s.id));
    remainingSubjects.sort((a, b) => (UPU_GRADE_POINTS[b.grade] || 0) - (UPU_GRADE_POINTS[a.grade] || 0));

    const bestThreeList: { code: string; name: string; grade: string; points: number }[] = [];
    for (let i = 0; i < 3; i++) {
      if (remainingSubjects[i]) {
        bestThreeList.push({
          code: remainingSubjects[i].code,
          name: remainingSubjects[i].name,
          grade: remainingSubjects[i].grade,
          points: UPU_GRADE_POINTS[remainingSubjects[i].grade] || 0
        });
      } else {
        bestThreeList.push({
          code: '-',
          name: 'TIADA SUBJEK PILIHAN',
          grade: '-',
          points: 0
        });
      }
    }

    const coreSum = coreList.reduce((sum, item) => sum + item.points, 0);
    const bestThreeSum = bestThreeList.reduce((sum, item) => sum + item.points, 0);
    const totalPoints = coreSum + bestThreeSum;
    const academicScore = (totalPoints / 144) * 90;
    const totalMerit = academicScore + spmKokoScore;

    return {
      coreList,
      bestThreeList,
      coreSum,
      bestThreeSum,
      totalPoints,
      academicScore,
      totalMerit
    };
  }, [activeUpuSubjects, spmStream, spmKokoScore]);

  // Calculate STPM Merit
  const stpmMeritCalculation = useMemo(() => {
    const academicScore = (stpmCgpa / 4.00) * 90;
    const totalMerit = academicScore + stpmKokoScore;
    return {
      academicScore,
      totalMerit
    };
  }, [stpmCgpa, stpmKokoScore]);

  // Active Merit Score based on Pathway
  const activeMerit = pathway === 'spm' ? spmMeritCalculation.totalMerit : stpmMeritCalculation.totalMerit;

  // Process and check eligibility for each course
  const coursesWithStatus = useMemo(() => {
    return COURSE_PROGRAMS.map(course => {
      let isEligible = false;
      let reason = '';
      let reqStatus: { eligible: boolean; reason?: string } = { eligible: false, reason: '' };

      if (pathway === 'spm') {
        const meritOk = spmMeritCalculation.totalMerit >= course.minMeritSpm;
        reqStatus = course.checkRequirementsSpm(activeUpuSubjects);
        isEligible = meritOk && reqStatus.eligible;
        
        if (!meritOk) {
          reason = `Markah merit SPM tidak mencukupi (Perlu ${course.minMeritSpm.toFixed(1)}%, merit anda ${spmMeritCalculation.totalMerit.toFixed(2)}%)`;
        } else if (!reqStatus.eligible) {
          reason = reqStatus.reason || 'Tidak memenuhi syarat khas gred subjek SPM.';
        }
      } else {
        // STPM Pathway
        const meritOk = stpmMeritCalculation.totalMerit >= course.minMeritStpm;
        reqStatus = course.checkRequirementsStpm(stpmCgpa, stpmMuet);
        isEligible = meritOk && reqStatus.eligible;

        if (!meritOk) {
          reason = `Markah merit STPM tidak mencukupi (Perlu ${course.minMeritStpm.toFixed(1)}%, merit anda ${stpmMeritCalculation.totalMerit.toFixed(2)}%)`;
        } else if (!reqStatus.eligible) {
          reason = reqStatus.reason || 'Tidak memenuhi syarat gred STPM / MUET.';
        }
      }

      return {
        ...course,
        isEligible,
        reason,
        reqStatus
      };
    });
  }, [pathway, spmMeritCalculation.totalMerit, stpmMeritCalculation.totalMerit, activeUpuSubjects, stpmCgpa, stpmMuet]);

  // Compute university status (how many eligible programs etc.)
  const universitiesWithEligibility = useMemo(() => {
    const list: Record<string, {
      university: University;
      eligibleCourses: typeof coursesWithStatus;
      ineligibleCourses: typeof coursesWithStatus;
      isEligible: boolean;
    }> = {};

    // Initialize all universities
    Object.keys(UNIVERSITIES).forEach(code => {
      list[code] = {
        university: UNIVERSITIES[code],
        eligibleCourses: [],
        ineligibleCourses: [],
        isEligible: false
      };
    });

    // Populate programs per university
    coursesWithStatus.forEach(course => {
      course.universities.forEach(uCode => {
        if (list[uCode]) {
          if (course.isEligible) {
            list[uCode].eligibleCourses.push(course);
            list[uCode].isEligible = true;
          } else {
            list[uCode].ineligibleCourses.push(course);
          }
        }
      });
    });

    return Object.values(list);
  }, [coursesWithStatus]);

  // Filters calculation
  const filteredUniversities = useMemo(() => {
    return universitiesWithEligibility.filter(item => {
      // 1. Category type filter
      const matchesType = selectedUnivType === 'semua' || item.university.type === selectedUnivType;
      
      // 2. Specific search filter
      const matchesSearch = searchQuery === '' || 
        item.university.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.university.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.university.location.toLowerCase().includes(searchQuery.toLowerCase());

      // 3. Show Ineligible filter
      const matchesEligibility = showIneligible || item.isEligible;

      return matchesType && matchesSearch && matchesEligibility;
    });
  }, [universitiesWithEligibility, selectedUnivType, searchQuery, showIneligible]);

  const filteredCourses = useMemo(() => {
    return coursesWithStatus.filter(course => {
      // 1. Search text
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (pathway === 'spm' ? course.requirementsTextSpm : course.requirementsTextStpm).toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Academic Level
      const matchesLevel = levelFilter === 'Semua' || course.level === levelFilter;
      
      // 3. Eligibility show/hide
      const matchesEligibility = showIneligible || course.isEligible;

      // 4. University filter
      const matchesUniv = selectedSpecificUniv === 'Semua' || course.universities.includes(selectedSpecificUniv);

      return matchesSearch && matchesLevel && matchesEligibility && matchesUniv;
    });
  }, [coursesWithStatus, searchQuery, levelFilter, showIneligible, selectedSpecificUniv, pathway]);

  const eligibleCount = coursesWithStatus.filter(c => c.isEligible).length;
  const totalCount = coursesWithStatus.length;

  const handleToggleUnivExpand = (code: string) => {
    if (expandedUniv === code) {
      setExpandedUniv(null);
    } else {
      setExpandedUniv(code);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs space-y-6 transition-all duration-200" id="upu-eligibility-wrapper">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          Kelayakan UPU
        </h2>
        <button 
          onClick={() => setIsEligibilityOpen(!isEligibilityOpen)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {isEligibilityOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* PATHWAY SELECTOR BAR (SPM VS STPM) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Pilih Laluan Kelayakan</span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  id="pathway-btn-spm"
                  onClick={() => setPathway('spm')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                    pathway === 'spm'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  📜 Lepasan SPM
                </button>
                <button
                  type="button"
                  id="pathway-btn-stpm"
                  onClick={() => setPathway('stpm')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                    pathway === 'stpm'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  🎓 Lepasan STPM / Setaraf
                </button>
              </div>
            </div>

      {/* 1. INPUT SETTINGS CONTAINER */}
      {pathway === 'spm' ? (
        /* SPM CONFIGURATIONS */
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wide">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Konfigurasi Pengiraan Merit SPM
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Aliran Permohonan UPU</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-stream-sains"
                  onClick={() => setSpmStream('sains')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    spmStream === 'sains'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  🔬 Aliran Sains
                </button>
                <button
                  type="button"
                  id="btn-stream-sastera"
                  onClick={() => setSpmStream('sastera')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    spmStream === 'sastera'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  🎨 Aliran Sastera
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Markah Kokurikulum (10%)</label>
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {spmKokoScore.toFixed(1)} / 10.0
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">0.0</span>
                <input
                  type="range"
                  id="spm-koko-slider"
                  min="0"
                  max="10"
                  step="0.1"
                  value={spmKokoScore}
                  onChange={(e) => setSpmKokoScore(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-600 dark:accent-emerald-400 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">10.0</span>
              </div>
            </div>
          </div>

          {/* UPU SUBJECT SIMULATION MANAGER ACCORDION */}
          <div className="border-t border-slate-200 dark:border-slate-700/60 pt-4 mt-2">
            <button
              type="button"
              id="toggle-spm-simulation-btn"
              onClick={() => setShowSpmSimulationManager(!showSpmSimulationManager)}
              className="flex items-center justify-between w-full py-2 px-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                    ⚙️ Urus Subjek & Simulasi UPU
                    {(excludedSubjectIds.size > 0 || additionalSubjects.length > 0 || Object.keys(gradeOverrides).length > 0) && (
                      <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full lowercase animate-pulse">
                        Simulasi Aktif
                      </span>
                    )}
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Tambah subjek aliran bercampur, buang subjek tak perlu, atau ubah gred simulasi tanpa mengacau slip asal.
                  </p>
                </div>
              </div>
              <div>
                {showSpmSimulationManager ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                )}
              </div>
            </button>

            {showSpmSimulationManager && (
              <div className="mt-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 animate-fadeIn">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      Senarai Subjek untuk Pengiraan UPU ({activeUpuSubjects.length} Subjek Terlibat)
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Tandakan checkbox untuk menyertakan subjek, atau pilih gred simulasi untuk menguji keputusan anda.
                    </p>
                  </div>
                  {(excludedSubjectIds.size > 0 || additionalSubjects.length > 0 || Object.keys(gradeOverrides).length > 0) && (
                    <button
                      type="button"
                      id="reset-simulation-btn"
                      onClick={() => {
                        setExcludedSubjectIds(new Set());
                        setAdditionalSubjects([]);
                        setGradeOverrides({});
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Set Semula Slip Asal
                    </button>
                  )}
                </div>

                {/* Subjek List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <th className="pb-2 text-center w-12">Sertakan</th>
                        <th className="pb-2">Kod & Subjek</th>
                        <th className="pb-2 text-center w-20">Jenis</th>
                        <th className="pb-2 text-center w-24">Gred Asal</th>
                        <th className="pb-2 text-center w-36">Simulasi Gred UPU</th>
                        <th className="pb-2 text-center w-12">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {/* 1. Original subjects from slip */}
                      {spmData.subjects.map((sub) => {
                        const isExcluded = excludedSubjectIds.has(sub.id);
                        const currentGrade = gradeOverrides[sub.id] || sub.grade;
                        const isCore = spmStream === 'sains' 
                          ? ['1449', '3472', '4531', '4541', '4551'].includes(sub.code)
                          : ['1103', '1119', '1249', '1449', '1511'].includes(sub.code);

                        return (
                          <tr 
                            key={sub.id} 
                            className={`transition-colors ${
                              isExcluded 
                                ? 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600' 
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <td className="py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={!isExcluded}
                                onChange={() => {
                                  setExcludedSubjectIds(prev => {
                                    const next = new Set(prev);
                                    if (next.has(sub.id)) next.delete(sub.id);
                                    else next.add(sub.id);
                                    return next;
                                  });
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5">
                              <div className="font-mono text-[10px] font-bold opacity-60">{sub.code}</div>
                              <div className="font-extrabold uppercase text-[11px] truncate max-w-[200px]">{sub.name}</div>
                            </td>
                            <td className="py-2.5 text-center">
                              {isCore ? (
                                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/30 rounded-full text-[9px] font-bold">
                                  Teras
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-bold">
                                  Pilihan
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 text-center font-bold font-mono text-slate-500">{sub.grade}</td>
                            <td className="py-2.5 text-center">
                              <select
                                disabled={isExcluded}
                                value={currentGrade}
                                onChange={(e) => {
                                  const overGrade = e.target.value;
                                  setGradeOverrides(prev => ({ ...prev, [sub.id]: overGrade }));
                                }}
                                className={`text-[11px] font-extrabold font-mono py-1 px-2 border rounded bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
                                  currentGrade !== sub.grade ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/20' : ''
                                }`}
                              >
                                {GRADES.map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 text-center">
                              <span className="text-[10px] text-slate-400">-</span>
                            </td>
                          </tr>
                        );
                      })}

                      {/* 2. Additional simulation subjects */}
                      {additionalSubjects.map((sub) => {
                        const currentGrade = gradeOverrides[sub.id] || sub.grade;
                        return (
                          <tr key={sub.id} className="text-slate-700 dark:text-slate-300 bg-emerald-50/10 dark:bg-emerald-950/5">
                            <td className="py-2.5 text-center">
                              <input
                                type="checkbox"
                                disabled
                                checked
                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 opacity-50 cursor-not-allowed"
                              />
                            </td>
                            <td className="py-2.5">
                              <div className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                {sub.code}
                                <span className="text-[8px] font-black tracking-wider bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-1 py-0.2 rounded uppercase">Simulasi</span>
                              </div>
                              <div className="font-extrabold uppercase text-[11px] truncate max-w-[200px]">{sub.name}</div>
                            </td>
                            <td className="py-2.5 text-center">
                              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/30 rounded-full text-[9px] font-bold">
                                Tambahan
                              </span>
                            </td>
                            <td className="py-2.5 text-center text-slate-400">-</td>
                            <td className="py-2.5 text-center">
                              <select
                                value={currentGrade}
                                onChange={(e) => {
                                  const overGrade = e.target.value;
                                  setGradeOverrides(prev => ({ ...prev, [sub.id]: overGrade }));
                                }}
                                className="text-[11px] font-extrabold font-mono py-1 px-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                              >
                                {GRADES.map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 text-center">
                              <button
                                type="button"
                                id={`delete-sim-sub-${sub.id}`}
                                onClick={() => {
                                  setAdditionalSubjects(prev => prev.filter(s => s.id !== sub.id));
                                  setGradeOverrides(prev => {
                                    const next = { ...prev };
                                    delete next[sub.id];
                                    return next;
                                  });
                                }}
                                className="text-rose-500 hover:text-rose-600 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Buang Subjek Simulasi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* No subjects message */}
                      {activeUpuSubjects.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                            Tiada subjek aktif. Sila sertakan subjek di atas atau tambah subjek simulasi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ADD ADDITIONAL SUBJECT FORM */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    Tambah Subjek Tambahan Simulasi
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    {/* Catalog selector */}
                    <div className="md:col-span-4">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Pilih Subjek Katalog</label>
                      <select
                        id="sim-catalog-select"
                        value={isCustomSubject ? 'custom' : simSubjectCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setIsCustomSubject(true);
                            setSimSubjectCode('');
                            setSimSubjectName('');
                          } else {
                            setIsCustomSubject(false);
                            setSimSubjectCode(val);
                            const catItem = COMMON_SUBJECTS.find(c => c.code === val);
                            setSimSubjectName(catItem ? catItem.nameMalay : '');
                          }
                        }}
                        className="w-full text-[11px] font-bold py-1.5 px-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">-- Pilih dari Katalog --</option>
                        {COMMON_SUBJECTS.filter(cat => 
                          !spmData.subjects.some(s => s.code === cat.code) && 
                          !additionalSubjects.some(s => s.code === cat.code)
                        ).map(cat => (
                          <option key={cat.code} value={cat.code}>{cat.code} - {cat.nameMalay}</option>
                        ))}
                        <option value="custom">✍️ Tulis Subjek Sendiri (Custom)</option>
                      </select>
                    </div>

                    {/* Subject Code (Custom) */}
                    <div className="md:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Kod</label>
                      <input
                        type="text"
                        id="sim-code-input"
                        placeholder="Kod"
                        disabled={!isCustomSubject}
                        value={simSubjectCode}
                        onChange={(e) => setSimSubjectCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        className="w-full text-[11px] font-mono font-bold py-1.5 px-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-600"
                      />
                    </div>

                    {/* Subject Name (Custom) */}
                    <div className="md:col-span-3">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Nama Subjek</label>
                      <input
                        type="text"
                        id="sim-name-input"
                        placeholder="NAMA SUBJEK"
                        disabled={!isCustomSubject}
                        value={simSubjectName}
                        onChange={(e) => setSimSubjectName(e.target.value.toUpperCase())}
                        className="w-full text-[11px] font-bold py-1.5 px-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:bg-slate-100 disabled:dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-600"
                      />
                    </div>

                    {/* Subject Grade */}
                    <div className="md:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Gred</label>
                      <select
                        id="sim-grade-select"
                        value={simSubjectGrade}
                        onChange={(e) => setSimSubjectGrade(e.target.value)}
                        className="w-full text-[11px] font-bold py-1.5 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                      >
                        {GRADES.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* Add button */}
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        id="sim-add-btn"
                        disabled={!simSubjectCode || !simSubjectName}
                        onClick={() => {
                          const newId = `sim-extra-${Date.now()}`;
                          const newSub: Subject = {
                            id: newId,
                            code: simSubjectCode.trim(),
                            name: simSubjectName.trim().toUpperCase(),
                            grade: simSubjectGrade,
                            description: GRADES_MAP[simSubjectGrade]?.malay || 'CEMERLANG'
                          };
                          setAdditionalSubjects(prev => [...prev, newSub]);
                          
                          // Reset inputs
                          setSimSubjectCode('');
                          setSimSubjectName('');
                          setIsCustomSubject(false);
                        }}
                        className="w-full text-[11px] font-bold py-2 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 cursor-pointer disabled:cursor-not-allowed transition-colors text-center"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STPM CONFIGURATIONS */
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wide">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Konfigurasi Gred Akademik STPM
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* STPM CGPA */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Purata Nilai Gred Kumulatif (PNGK / CGPA)</label>
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {stpmCgpa.toFixed(2)} / 4.00
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">2.00</span>
                <input
                  type="range"
                  id="stpm-cgpa-slider"
                  min="2.00"
                  max="4.00"
                  step="0.01"
                  value={stpmCgpa}
                  onChange={(e) => setStpmCgpa(parseFloat(e.target.value))}
                  className="flex-1 accent-indigo-600 dark:accent-indigo-400 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">4.00</span>
              </div>
            </div>

            {/* MUET BAND */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Keputusan MUET (Band)</label>
              <select
                id="stpm-muet-select"
                value={stpmMuet}
                onChange={(e) => setStpmMuet(parseFloat(e.target.value))}
                className="w-full text-xs font-bold py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="1.0" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Band 1.0 (Sangat Asas)</option>
                <option value="2.0" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Band 2.0 (Asas)</option>
                <option value="3.0" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Band 3.0 (Sederhana)</option>
                <option value="3.5" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Band 3.5 (Sederhana Atas)</option>
                <option value="4.0" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Band 4.0 (Baik)</option>
                <option value="4.5" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Band 4.5 (Baik Atas)</option>
                <option value="5.0" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Band 5.0 (Sangat Baik)</option>
                <option value="5.5" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Band 5.5 (Cemerlang)</option>
                <option value="6.0" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Band 6.0 (Cemerlang Tertinggi)</option>
              </select>
            </div>

            {/* STPM Koko */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Kokurikulum STPM (10%)</label>
                <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {stpmKokoScore.toFixed(1)} / 10.0
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">0.0</span>
                <input
                  type="range"
                  id="stpm-koko-slider"
                  min="0"
                  max="10"
                  step="0.1"
                  value={stpmKokoScore}
                  onChange={(e) => setStpmKokoScore(parseFloat(e.target.value))}
                  className="flex-1 accent-indigo-600 dark:accent-indigo-400 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">10.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC MAIN MERIT SCORE PANEL */}
      <div className={`p-5 sm:p-6 rounded-2xl border relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-md transition-all duration-300 ${
        pathway === 'spm'
          ? 'bg-gradient-to-r from-emerald-950 to-teal-900 border-emerald-900 text-white'
          : 'bg-gradient-to-r from-indigo-950 to-slate-900 border-indigo-900 text-white'
      }`}>
        <div className="absolute -top-10 -right-10 p-4 opacity-[0.04] pointer-events-none">
          <GraduationCap className="w-56 h-56 text-white" />
        </div>

        <div className="space-y-3.5 text-center md:text-left z-10 flex-1">
          <span className={`text-[10px] font-extrabold tracking-widest px-2.5 py-0.5 rounded-full uppercase ${
            pathway === 'spm' ? 'bg-emerald-800 text-emerald-100' : 'bg-indigo-800 text-indigo-100'
          }`}>
            Keputusan Anggaran Merit UPU • Lepasan {pathway === 'spm' ? 'SPM' : 'STPM'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight uppercase font-sans">
            {pathway === 'spm' ? `ALIRAN ${spmStream}` : 'SIJIL TINGGI PERSEKOLAHAN MALAYSIA'}
          </h2>
          <p className="text-xs text-slate-300/90 max-w-md font-medium leading-relaxed">
            {pathway === 'spm' 
              ? 'Dikira berdasarkan sistem UPU: 5 subjek teras kokurikulum dan 3 subjek elektif terbaik.'
              : `Pengiraan automatik akademik PNGK (${stpmCgpa.toFixed(2)}) diselaraskan bersama wajaran kokurikulum.`
            }
          </p>
          <div className="pt-1 flex flex-wrap justify-center md:justify-start">
            <button
              type="button"
              id="preview-upu-report-btn"
              onClick={() => setShowPrintPreview(true)}
              className={`px-4.5 py-2 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border hover:shadow-lg active:scale-[0.98] ${
                pathway === 'spm'
                  ? 'bg-amber-400 hover:bg-amber-500 border-amber-300 text-emerald-950 hover:border-amber-400'
                  : 'bg-emerald-400 hover:bg-emerald-500 border-emerald-300 text-indigo-950 hover:border-emerald-400'
              }`}
            >
              <FileDown className="w-4 h-4 shrink-0" />
              Pratonton & Muat Turun (PDF)
            </button>
          </div>
        </div>

        {/* Big Merit Percent Badge */}
        <div className={`border px-6 py-4 rounded-2xl text-center md:min-w-[190px] z-10 shadow-lg ${
          pathway === 'spm' 
            ? 'bg-emerald-900/60 border-emerald-800/80' 
            : 'bg-indigo-900/60 border-indigo-800/80'
        }`}>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Markah Merit UPU</div>
          <div className="text-3xl sm:text-4.5xl font-extrabold font-mono text-amber-400 mt-1">
            {activeMerit.toFixed(2)}<span className="text-lg">%</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-200/90 font-mono flex justify-center gap-2">
            <span>Akad: {(pathway === 'spm' ? spmMeritCalculation.academicScore : stpmMeritCalculation.academicScore).toFixed(2)}</span>
            <span className="opacity-50">|</span>
            <span>Koko: {(pathway === 'spm' ? spmKokoScore : stpmKokoScore).toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* GRADE DISTRIBUTION CHART */}
      <div className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-6 uppercase tracking-tight">Taburan Gred Subjek</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeDistribution}>
              <XAxis dataKey="grade" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#10b981' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <AnimatePresence>
        {showPrintPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl relative">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <PrintableReport 
                subjects={activeUpuSubjects} 
                meritScore={activeMerit} 
                pathway={pathway} 
              />
              <div className="p-4 flex justify-end gap-2 border-t">
                <button onClick={() => setShowPrintPreview(false)} className="px-4 py-2 bg-slate-200 rounded-lg font-bold">Tutup</button>
                <button onClick={handleDownloadReport} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Muat Turun PDF</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SPM FORMULA BREAKDOWN COLLAPSIBLE - ONLY FOR SPM MODE */}
      {pathway === 'spm' && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs bg-slate-50/40 dark:bg-slate-900/10">
          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Perincian Formula Matrik SPM (Wajaran 144 Mata)
            </h4>
            <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              Mata: {spmMeritCalculation.totalPoints} / 144
            </span>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {/* Teras List */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 border-b border-dashed border-slate-300 dark:border-slate-700 pb-1.5 flex justify-between">
                <span className="flex items-center gap-1">📚 5 Subjek Teras Aliran:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">+{spmMeritCalculation.coreSum} mata</span>
              </div>
              <div className="space-y-1">
                {spmMeritCalculation.coreList.map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded-lg flex justify-between items-center border transition-colors ${
                      item.isMissing 
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-100/40 dark:border-rose-900/30' 
                        : 'bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold font-mono text-[10px] text-slate-500 dark:text-slate-400">{item.code}</span>
                      <span className="text-[10px] font-bold truncate max-w-[170px] uppercase">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                        item.isMissing ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}>
                        Gred: {item.grade}
                      </span>
                      <span className="font-mono font-extrabold w-5 text-right text-slate-900 dark:text-white">{item.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Remaining List */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200 border-b border-dashed border-slate-300 dark:border-slate-700 pb-1.5 flex justify-between">
                <span className="flex items-center gap-1">🌟 3 Subjek Pilihan Terbaik:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">+{spmMeritCalculation.bestThreeSum} mata</span>
              </div>
              <div className="space-y-1">
                {spmMeritCalculation.bestThreeList.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold font-mono text-[10px] text-slate-500 dark:text-slate-400">{item.code || '-'}</span>
                      <span className="text-[10px] font-bold truncate max-w-[170px] uppercase">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-[9px] font-black">
                        Gred: {item.grade}
                      </span>
                      <span className="font-mono font-extrabold w-5 text-right text-slate-900 dark:text-white">{item.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SWITCHABLE VIEW TABS: UNIVERSITIES CARD VIEW OR COURSES LIST VIEW */}
      <div className="space-y-4">
        
        {/* Toggle between "View Universities" and "View Courses" */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px">
          <button
            type="button"
            id="view-tab-btn-universities"
            onClick={() => setViewTab('universities')}
            className={`py-2 px-4 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'universities'
                ? 'border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Semakan mengikut Universiti ({filteredUniversities.length})
          </button>
          <button
            type="button"
            id="view-tab-btn-courses"
            onClick={() => setViewTab('courses')}
            className={`py-2 px-4 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'courses'
                ? 'border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Senarai Semua Kursus ({filteredCourses.length})
          </button>
        </div>

        {/* DYNAMIC SEARCH & MULTI-FILTER PANEL */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                id="search-input"
                placeholder={
                  viewTab === 'universities' 
                    ? "Cari nama universiti atau lokasi..." 
                    : "Cari bidang kursus, subjek teras, syarat khas..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg outline-none focus:border-emerald-600 dark:focus:border-emerald-400 transition-colors"
              />
            </div>

            {/* Specific Filter Select or Course Level Select depending on Active view tab */}
            {viewTab === 'courses' ? (
              <div className="sm:w-44">
                <select
                  id="level-filter"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg outline-none focus:border-emerald-600"
                >
                  <option value="Semua" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🎓 Semua Tahap</option>
                  <option value="Sarjana Muda" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Sarjana Muda (Degree)</option>
                  <option value="Diploma" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Diploma</option>
                </select>
              </div>
            ) : (
              <div className="sm:w-48">
                <select
                  id="univ-type-filter"
                  value={selectedUnivType}
                  onChange={(e) => setSelectedUnivType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg outline-none focus:border-emerald-600"
                >
                  <option value="semua" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🏛️ Semua Kategori (25)</option>
                  <option value="awam" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Awam (IPTA - 15)</option>
                  <option value="semi" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Semi-Kerajaan / GLC (5)</option>
                  <option value="swasta" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Swasta (IPTS - 5)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60 pt-3">
            {/* Show Ineligible Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                id="show-ineligible-toggle"
                checked={showIneligible}
                onChange={(e) => setShowIneligible(e.target.checked)}
                className="accent-emerald-600 dark:accent-emerald-400 rounded h-4 w-4"
              />
              Papar yang tidak layak & sebab sekatan
            </label>

            {/* Specific University Selector (Only in Courses View) */}
            {viewTab === 'courses' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Tapis Universiti:</span>
                <select
                  id="specific-univ-select"
                  value={selectedSpecificUniv}
                  onChange={(e) => setSelectedSpecificUniv(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md outline-none"
                >
                  <option value="Semua" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Semua Universiti</option>
                  {Object.keys(UNIVERSITIES).map(code => (
                    <option key={code} value={code} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">{code} - {UNIVERSITIES[code].fullName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* VIEW 1: UNIVERSITIES CARD VIEW ("buat card universiti apa yang layak dengan template") */}
        {viewTab === 'universities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="universities-card-grid">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((item) => {
                const totalMatching = item.eligibleCourses.length;
                const totalProgramCount = item.eligibleCourses.length + item.ineligibleCourses.length;
                const isExpanded = expandedUniv === item.university.code;

                return (
                  <div
                    key={item.university.code}
                    id={`univ-card-${item.university.code}`}
                    className={`border rounded-xl p-4 transition-all duration-200 relative flex flex-col justify-between ${
                      item.isEligible
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/15 dark:bg-emerald-950/5'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header Card */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Logo Badge */}
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br text-white font-black flex flex-col items-center justify-center text-[10px] shrink-0 shadow-md ${item.university.logoColor}`}>
                            {getUniversityIcon(item.university.iconName, "w-4 h-4 mb-0.5")}
                            <span className="text-[8px] tracking-tight leading-none uppercase">{item.university.code}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">
                              {item.university.fullName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{item.university.location}</span>
                              </span>
                            </div>
                            {item.university.motto && (
                              <p className="text-[9.5px] italic text-slate-500 dark:text-slate-500 mt-1 leading-tight font-medium break-words">
                                "{item.university.motto}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Category Badge */}
                        <span className={`text-[8.5px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.university.type === 'awam' 
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300' 
                            : item.university.type === 'semi'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {item.university.type === 'awam' ? 'Awam' : item.university.type === 'semi' ? 'Semi-Kerajaan' : 'Swasta / IPTS'}
                        </span>
                      </div>

                      {/* Middle Eligibility Stats */}
                      <div className="grid grid-cols-2 gap-2 py-1.5 border-y border-dashed border-slate-200 dark:border-slate-700 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Status Kemasukan</span>
                          <div className="mt-0.5 flex items-center gap-1 font-black">
                            {item.isEligible ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> LAYAK
                              </span>
                            ) : (
                              <span className="text-rose-500 dark:text-rose-400 flex items-center gap-1">
                                <X className="w-4 h-4" /> TIDAK LAYAK
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Kursus Ditawarkan</span>
                          <div className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{totalMatching}</span> / {totalProgramCount} Bidang
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action / Course Details Drawer */}
                    <div className="mt-3">
                      {totalMatching > 0 ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => handleToggleUnivExpand(item.university.code)}
                            className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10.5px] font-bold rounded-lg text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{isExpanded ? 'Sembunyikan Kursus Layak' : 'Lihat Kursus Layak'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/70 space-y-2 text-[11px] max-h-56 overflow-y-auto">
                              <p className="font-bold text-emerald-700 dark:text-emerald-400 text-[10px] uppercase tracking-wider">Tahniah! Anda Layak Untuk Kursus Berikut:</p>
                              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {item.eligibleCourses.map((course) => (
                                  <div key={course.id} className="py-2 first:pt-0 last:pb-0 flex justify-between items-start gap-2">
                                    <div className="space-y-0.5">
                                      <span className="font-extrabold text-slate-700 dark:text-slate-300">{course.name}</span>
                                      <span className="block text-[9.5px] text-slate-400 dark:text-slate-500">Min Merit: {pathway === 'spm' ? course.minMeritSpm : course.minMeritStpm}%</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-black rounded uppercase">
                                      {course.level}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-2 bg-rose-50/50 dark:bg-rose-950/10 text-center text-[10px] text-rose-600 dark:text-rose-400 font-bold rounded-lg border border-rose-100/30">
                          Sebab Sekatan: Gred minima SPM/STPM atau Merit tidak mencukupi untuk universiti ini.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 space-y-2">
                <Building2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Tiada universiti yang sepadan dengan penapis atau carian.</p>
                <p className="text-[10px]">Tukar pilihan penapis kategori atau aktifkan &quot;Papar yang tidak layak&quot;.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: SENARAI SEMUA KURSUS (COURSE LIST VIEW WITH DETAILS) */}
        {viewTab === 'courses' && (
          <div className="space-y-3" id="courses-list-view">
            <div className="flex justify-between items-center text-xs px-1">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {filteredCourses.length} Bidang Kursus Tersenarai
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                Layak: {eligibleCount} / {totalCount} Kursus
              </span>
            </div>

            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  id={`course-card-${course.id}`}
                  className={`border rounded-xl p-4 transition-all duration-150 relative ${
                    course.isEligible
                      ? 'border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/10 dark:bg-emerald-950/5 hover:bg-emerald-50/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      {/* Badge level & minimum merit */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          course.level === 'Sarjana Muda' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {course.level}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          Min Merit: {pathway === 'spm' ? course.minMeritSpm.toFixed(1) : course.minMeritStpm.toFixed(1)}%
                        </span>

                        {(() => {
                          if (!course.isEligible) return null;
                          const minMerit = pathway === 'spm' ? course.minMeritSpm : course.minMeritStpm;
                          const margin = activeMerit - minMerit;
                          if (margin >= 15) {
                            return (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-0.5">
                                🔥 Peluang Sangat Tinggi
                              </span>
                            );
                          } else if (margin >= 5) {
                            return (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-0.5">
                                ✨ Peluang Tinggi
                              </span>
                            );
                          } else if (margin >= 0) {
                            return (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-0.5">
                                ⚖️ Peluang Sederhana
                              </span>
                            );
                          } else {
                            return (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60 flex items-center gap-0.5">
                                ⚠️ Merit Kompetitif Tinggi
                              </span>
                            );
                          }
                        })()}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                        {course.name}
                      </h4>

                      {/* Requirements description */}
                      <div className="flex gap-1.5 items-start bg-white/70 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 text-[10.5px] text-slate-600 dark:text-slate-400">
                        <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-slate-700 dark:text-slate-300 font-bold">Syarat Kemasukan:</strong> {pathway === 'spm' ? course.requirementsTextSpm : course.requirementsTextStpm}
                        </div>
                      </div>

                      {/* Universities offer list */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Universiti Penawar:</span>
                        {course.universities.map(code => (
                          <span
                            key={code}
                            title={UNIVERSITIES[code]?.fullName}
                            className={`text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded-sm ${
                              UNIVERSITIES[code]?.logoColor || 'bg-slate-600'
                            }`}
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="shrink-0 text-center">
                      {course.isEligible ? (
                        <div className="flex flex-col items-center">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full shadow-2xs">
                            <Check className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 mt-1 uppercase tracking-wide">LAYAK</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-full border border-rose-100 dark:border-rose-900/30">
                            <X className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-rose-500 dark:text-rose-400 mt-1 uppercase tracking-wide">TIDAK LAYAK</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* If ineligible, show the exact blocker reason */}
                  {!course.isEligible && (
                    <div className="mt-3 bg-rose-50/70 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/30 text-[10px] font-bold text-rose-800 dark:text-rose-400 px-3 py-2 rounded-lg flex items-center gap-1.5 animate-pulse">
                      <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>Sebab Sekatan: {course.reason}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 space-y-2">
                <GraduationCap className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Tiada kursus yang sepadan dengan carian / penapis anda.</p>
                <p className="text-[10px]">Cuba tukar pilihan tapisan peringkat atau taip perkataan lain.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER INFORMATIONAL CARD */}
      <div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/10 border border-sky-100 dark:border-sky-900/30 rounded-xl text-[11px] text-sky-800 dark:text-sky-300 flex gap-2 items-start">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-extrabold uppercase tracking-wide">💡 Nota Semakan Merit:</p>
          <p className="leading-relaxed font-medium">Keputusan ini adalah berasaskan anggaran rasmi formula kemasukan UPU Kementerian Pendidikan Malaysia. Keputusan sebenar mungkin berbeza bergantung kepada persaingan tahunan, ketersediaan tempat di universiti awam, dan markah temu duga calon.</p>
        </div>
      </div>

      {/* ----------------- HIDDEN HIGH-FIDELITY A4 PDF REPORT TEMPLATE ----------------- */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', overflow: 'hidden', height: '0', width: '0' }}>
        <div id="upu-report-pdf-target" className="w-[794px] p-10 font-sans relative flex flex-col justify-between" style={{ backgroundColor: '#ffffff', color: '#0f172a', minHeight: '1123px', boxSizing: 'border-box' }}>
        <style>{`
          #upu-report-pdf-target, #upu-report-pdf-target * {
            color: black !important;
            border-color: black !important;
            background-color: white !important;
          }
        `}</style>
          
          <div>
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 right-0 h-2.5" style={{ background: 'linear-gradient(to right, #10b981, #059669, #047857)' }}></div>
            
            {/* Formal Header Block */}
            <div className="flex justify-between items-center pb-4 mt-2" style={{ borderBottom: '2px solid #047857' }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl border" style={{ background: 'linear-gradient(to bottom right, #10b981, #047857)', color: '#ffffff', borderColor: '#34d399', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  UPU
                </div>
                <div>
                  <h1 className="text-[10px] font-black tracking-widest uppercase leading-none" style={{ color: '#64748b' }}>
                    {lang === 'bm' ? 'Kementerian Pendidikan Tinggi Malaysia' : 'Ministry of Higher Education Malaysia'}
                  </h1>
                  <h2 className="text-base font-black leading-tight mt-1" style={{ color: '#0f172a' }}>
                    {lang === 'bm' ? 'SISTEM SYARAT KELAYAKAN KEMASUKAN UPU ONLINE' : 'UPU ONLINE ADMISSION ELIGIBILITY SYSTEM'}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: '#059669' }}>
                    {lang === 'bm' ? 'Laporan Semakan Kelayakan Calon & Anggaran Markah Merit' : 'Candidate Eligibility Review & Estimated Merit Score'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 text-[9px] font-black rounded-full uppercase border" style={{ backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
                  {lang === 'bm' ? 'LALUAN:' : 'PATHWAY:'} {pathway === 'spm' ? (lang === 'bm' ? 'LEPASAN SPM' : 'SPM LEAVER') : (lang === 'bm' ? 'LEPASAN STPM' : 'STPM LEAVER')}
                </span>
                <p className="text-[8px] mt-2 font-mono" style={{ color: '#94a3b8' }}>ID: {spmData.studentInfo.serialNumber || 'UPU-8594-A'}</p>
              </div>
            </div>

            {/* Candidate Profile Details */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl mt-5 text-xs border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
              <div className="space-y-1.5">
                <h3 className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  {lang === 'bm' ? 'Maklumat Peribadi Calon' : 'Candidate Personal Profile'}
                </h3>
                <div><span className="font-medium" style={{ color: '#64748b' }}>{lang === 'bm' ? 'Nama Penuh:' : 'Full Name:'}</span> <strong className="font-extrabold uppercase" style={{ color: '#0f172a' }}>{spmData.studentInfo.name || 'NAMA CALON'}</strong></div>
                <div><span className="font-medium" style={{ color: '#64748b' }}>{lang === 'bm' ? 'No. Kad Pengenalan:' : 'Identity Card (IC):'}</span> <strong className="font-mono font-bold" style={{ color: '#0f172a' }}>{spmData.studentInfo.icNumber || '000000-00-0000'}</strong></div>
                <div><span className="font-medium" style={{ color: '#64748b' }}>{lang === 'bm' ? 'Angka Giliran:' : 'Index Number:'}</span> <strong className="font-mono font-bold uppercase" style={{ color: '#0f172a' }}>{spmData.studentInfo.angkaGiliran || 'AB123456'}</strong></div>
                <div><span className="font-medium" style={{ color: '#64748b' }}>{lang === 'bm' ? 'Sekolah/Institusi:' : 'School/Institution:'}</span> <strong className="font-bold uppercase text-[10.5px]" style={{ color: '#0f172a' }}>{spmData.studentInfo.schoolName || 'SMK MALAYSIA'}</strong></div>
              </div>
              <div className="space-y-1.5 pl-6 flex flex-col justify-between border-l" style={{ borderLeftColor: '#e2e8f0' }}>
                <div>
                  <h3 className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                    {lang === 'bm' ? 'Rumusan Keputusan Merit' : 'Merit Score Summary'}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black font-mono" style={{ color: '#047857' }}>{activeMerit.toFixed(2)}</span>
                    <span className="text-xs font-black" style={{ color: '#64748b' }}>%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] mt-2 pt-2 border-t font-medium" style={{ borderTopColor: '#e2e8f0', color: '#475569' }}>
                  <div>{lang === 'bm' ? 'Wajaran Akademik:' : 'Academic Score:'} <strong className="font-extrabold" style={{ color: '#1e293b' }}>{(pathway === 'spm' ? spmMeritCalculation.academicScore : stpmMeritCalculation.academicScore).toFixed(2)}%</strong></div>
                  <div>{lang === 'bm' ? 'Wajaran Koko:' : 'Co-curriculum:'} <strong className="font-extrabold" style={{ color: '#1e293b' }}>{(pathway === 'spm' ? spmKokoScore : stpmKokoScore).toFixed(1)}%</strong></div>
                </div>
              </div>
            </div>

            {/* Grade Details Subtable */}
            <div className="mt-5">
              <h3 className="text-[10.5px] font-black uppercase tracking-wide pb-1 mb-2 border-b" style={{ color: '#1e293b', borderBottomColor: '#e2e8f0' }}>
                {pathway === 'spm' 
                  ? (lang === 'bm' ? 'I. Senarai Gred Mata Pelajaran SPM' : 'I. List of SPM Subject Grades') 
                  : (lang === 'bm' ? 'I. Senarai Gred Akademik & Kokurikulum STPM' : 'I. List of STPM Academic & Co-curricular Grades')}
              </h3>
              
              {pathway === 'spm' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8.5px] font-extrabold uppercase mb-1" style={{ color: '#047857' }}>
                      {lang === 'bm' ? `5 Subjek Teras Aliran (${spmStream === 'sains' ? 'Sains' : 'Sastera'})` : `5 Core Stream Subjects (${spmStream === 'sains' ? 'Science' : 'Arts'})`}
                    </p>
                    <table className="w-full text-[9px] text-left border" style={{ borderColor: '#e2e8f0' }}>
                      <thead>
                        <tr className="font-bold border-b" style={{ backgroundColor: '#f8fafc', borderBottomColor: '#e2e8f0', color: '#475569' }}>
                          <th className="py-1 px-2 text-[8px] uppercase">{lang === 'bm' ? 'Kod' : 'Code'}</th>
                          <th className="py-1 px-2 text-[8px] uppercase">{lang === 'bm' ? 'Nama Subjek' : 'Subject'}</th>
                          <th className="py-1 px-2 text-center text-[8px] uppercase">{lang === 'bm' ? 'Gred' : 'Grade'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spmMeritCalculation.coreList.map((sub, i) => (
                          <tr key={i} className="border-b" style={{ backgroundColor: sub.isMissing ? '#fff1f2' : '#ffffff', borderBottomColor: '#f1f5f9' }}>
                            <td className="py-1 px-2 font-mono" style={{ color: '#64748b' }}>{sub.code}</td>
                            <td className="py-1 px-2 font-semibold truncate max-w-[150px] uppercase" style={{ color: '#334155' }}>{sub.name}</td>
                            <td className="py-1 px-2 text-center font-black" style={{ color: '#0f172a' }}>{sub.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <p className="text-[8.5px] font-extrabold uppercase mb-1" style={{ color: '#047857' }}>
                      {lang === 'bm' ? '3 Subjek Elektif Terbaik Diambilkira' : 'Best 3 Elective Subjects Considered'}
                    </p>
                    <table className="w-full text-[9px] text-left border" style={{ borderColor: '#e2e8f0' }}>
                      <thead>
                        <tr className="font-bold border-b" style={{ backgroundColor: '#f8fafc', borderBottomColor: '#e2e8f0', color: '#475569' }}>
                          <th className="py-1 px-2 text-[8px] uppercase">{lang === 'bm' ? 'Kod' : 'Code'}</th>
                          <th className="py-1 px-2 text-[8px] uppercase">{lang === 'bm' ? 'Nama Subjek' : 'Subject'}</th>
                          <th className="py-1 px-2 text-center text-[8px] uppercase">{lang === 'bm' ? 'Gred' : 'Grade'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spmMeritCalculation.bestThreeList.map((sub, i) => (
                          <tr key={i} className="border-b" style={{ backgroundColor: '#ffffff', borderBottomColor: '#f1f5f9' }}>
                            <td className="py-1 px-2 font-mono" style={{ color: '#64748b' }}>{sub.code || '-'}</td>
                            <td className="py-1 px-2 font-semibold truncate max-w-[150px] uppercase" style={{ color: '#334155' }}>{sub.name}</td>
                            <td className="py-1 px-2 text-center font-black" style={{ color: '#0f172a' }}>{sub.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl flex justify-around text-center text-xs border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                  <div>
                    <div className="text-[8.5px] uppercase font-bold" style={{ color: '#94a3b8' }}>{lang === 'bm' ? 'PNGK Akademik STPM' : 'STPM Academic CGPA'}</div>
                    <div className="text-base font-black mt-0.5" style={{ color: '#1e1b4b' }}>{stpmCgpa.toFixed(2)} / 4.00</div>
                  </div>
                  <div className="border-l" style={{ borderLeftColor: '#e2e8f0' }}></div>
                  <div>
                    <div className="text-[8.5px] uppercase font-bold" style={{ color: '#94a3b8' }}>{lang === 'bm' ? 'Wajaran Akademik (90%)' : 'Academic Weightage (90%)'}</div>
                    <div className="text-base font-black mt-0.5" style={{ color: '#1e1b4b' }}>{stpmMeritCalculation.academicScore.toFixed(2)}%</div>
                  </div>
                  <div className="border-l" style={{ borderLeftColor: '#e2e8f0' }}></div>
                  <div>
                    <div className="text-[8.5px] uppercase font-bold" style={{ color: '#94a3b8' }}>{lang === 'bm' ? 'Tahap Band MUET' : 'MUET Band Level'}</div>
                    <div className="text-base font-black mt-0.5" style={{ color: '#1e1b4b' }}>Band {stpmMuet.toFixed(1)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* UPGRADED SECTION III: ACADEMIC PROFILE & CAREER PATHWAY ANALYSIS */}
            <div className="mt-5 p-3 rounded-xl border border-emerald-100 bg-emerald-50/20" style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)' }}>
              <h3 className="text-[10px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#047857' }}>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {lang === 'bm' ? 'II. Analisis Potensi Akademik & Syor Kerjaya' : 'II. Academic Potential & Career Direction Analysis'}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-[9.5px]">
                <div className="col-span-1 border-r pr-2 flex flex-col justify-center" style={{ borderRightColor: '#a7f3d0' }}>
                  <div className="text-[8px] font-bold uppercase text-slate-400">
                    {lang === 'bm' ? 'Pencapaian Cemerlang' : 'Academic Excellence'}
                  </div>
                  <div className="text-base font-black mt-0.5 text-slate-800 font-mono">
                    {academicAnalytics.totalA} A
                  </div>
                  <div className="text-[8px] text-slate-500 font-medium mt-0.5 leading-tight">
                    {lang === 'bm' ? 'Jumlah gred gred tertinggi (A+/A/A-)' : 'Total highest achievement grades'}
                  </div>
                </div>
                <div className="col-span-2 pl-1 leading-relaxed">
                  <div className="text-[8px] font-bold uppercase text-emerald-600">
                    {lang === 'bm' ? 'Cadangan Bidang Pengajian / Kerjaya UPU:' : 'Suggested Study Fields & UPU Career Pathways:'}
                  </div>
                  <p className="mt-0.5 font-bold text-slate-700">
                    {lang === 'bm' ? academicAnalytics.directionBm : academicAnalytics.directionEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Eligible Programs Table */}
            <div className="mt-5">
              <h3 className="text-[10.5px] font-black uppercase tracking-wide pb-1 mb-2 border-b" style={{ color: '#1e293b', borderBottomColor: '#e2e8f0' }}>
                {lang === 'bm' ? 'III. Senarai Kursus Pengajian Utama & Universiti Yang Layak Ditawarkan' : 'III. List of Eligible Main Courses & Offering Universities'}
              </h3>
              <table className="w-full text-[9px] text-left border" style={{ borderColor: '#e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                <thead>
                  <tr className="font-bold text-[8.5px] uppercase" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    <th className="py-1 px-3">{lang === 'bm' ? 'Bidang Pengajian' : 'Field of Study'}</th>
                    <th className="py-1 px-2">{lang === 'bm' ? 'Tahap' : 'Level'}</th>
                    <th className="py-1 px-2 text-center">{lang === 'bm' ? 'Min Merit' : 'Min Merit'}</th>
                    <th className="py-1 px-3">{lang === 'bm' ? 'Antara Universiti Awam & Swasta Penawar' : 'Offering Public & Private Universities'}</th>
                  </tr>
                </thead>
                <tbody>
                  {COURSE_PROGRAMS.map(course => {
                    const checkRes = pathway === 'spm' 
                      ? course.checkRequirementsSpm(activeUpuSubjects) 
                      : course.checkRequirementsStpm(stpmCgpa, stpmMuet);
                    const isEligible = checkRes.eligible && activeMerit >= (pathway === 'spm' ? course.minMeritSpm : course.minMeritStpm);
                    
                    if (!isEligible) return null;

                    const localizedCourseName = lang === 'bm' ? course.name : (
                      course.id === 'sains_tulen' ? 'Bachelor of Pure Science (Physics/Chemistry/Biology)' :
                      course.id === 'kejuruteraan' ? 'Bachelor of Engineering (Mechanical/Electrical/Civil)' :
                      course.id === 'perubatan' ? 'Bachelor of Medicine & Surgery (MBBS)' :
                      course.id === 'computer_science' ? 'Bachelor of Computer Science & Software Engineering' :
                      course.id === 'perniagaan' ? 'Bachelor of Business Administration & Marketing' :
                      course.id === 'perakaunan' ? 'Bachelor of Accounting (Honours)' :
                      course.id === 'ekonomi' ? 'Bachelor of Economics & Financial Analytics' :
                      course.id === 'undangan' ? 'Bachelor of Laws (LLB)' :
                      course.id === 'pendidikan' ? 'Bachelor of Education (TESL/Science/Math)' :
                      course.id === 'sastera' ? 'Bachelor of Arts & Mass Communications' :
                      course.id === 'reka_bentuk' ? 'Bachelor of Graphic Design & Creative Media' :
                      course.id === 'dip_kejuruteraan' ? 'Diploma in Engineering (Electrical/Mechanical)' :
                      course.id === 'dip_cs' ? 'Diploma in Computer Science & Information Technology' :
                      course.id === 'dip_business' ? 'Diploma in Business Management & Accounting' : course.name
                    );

                    const localizedLevel = lang === 'bm' ? course.level : (course.level === 'Sarjana Muda' ? 'Bachelor' : 'Diploma');

                    return (
                      <tr key={course.id} className="border-b" style={{ backgroundColor: '#ffffff', borderBottomColor: '#e2e8f0' }}>
                        <td className="py-1 px-3 font-bold text-[9.5px] max-w-[240px] uppercase leading-tight" style={{ color: '#1e293b' }}>
                          {localizedCourseName}
                        </td>
                        <td className="py-1 px-2 font-semibold" style={{ color: '#475569' }}>
                          {localizedLevel}
                        </td>
                        <td className="py-1 px-2 text-center font-mono font-bold" style={{ color: '#334155' }}>
                          {pathway === 'spm' ? course.minMeritSpm.toFixed(1) : course.minMeritStpm.toFixed(1)}%
                        </td>
                        <td className="py-1 px-3 font-mono font-black text-[8.5px] max-w-[200px] truncate" style={{ color: '#1e1b4b' }}>
                          {course.universities.slice(0, 6).join(', ')}{course.universities.length > 6 ? '...' : ''}
                        </td>
                      </tr>
                    );
                  }).filter(Boolean).slice(0, 6)}
                </tbody>
              </table>
              <p className="text-[8px] italic mt-1 font-medium" style={{ color: '#94a3b8' }}>
                {lang === 'bm' 
                  ? '* Menunjukkan senarai ringkasan kursus pengajian utama yang layak dicadangkan di IPTA / IPTS Malaysia.' 
                  : '* Displays a summary list of matching main course directions offered by public & private universities in Malaysia.'}
              </p>
            </div>

          </div>

          {/* Footer Stamp & Signature Box */}
          <div className="pt-3.5 flex justify-between items-center mt-auto border-t" style={{ borderTopColor: '#e2e8f0' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wide" style={{ color: '#1e293b' }}>
                {lang === 'bm' ? 'PENGESAHAN MAKLUMAT DIGITAL' : 'DIGITAL INFORMATION VERIFICATION'}
              </p>
              <p className="text-[8px] leading-relaxed max-w-[480px] mt-0.5 font-medium" style={{ color: '#64748b' }}>
                {lang === 'bm' ? (
                  <>Laporan ini dijana secara digital pada <strong className="font-extrabold">{new Date().toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>. Sijil keputusan ini direka bagi kegunaan rujukan kemasukan pra-syarat permohonan UPU Online dan persediaan akademik lepasan SPM/STPM.</>
                ) : (
                  <>This report was digitally generated on <strong className="font-extrabold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>. This results eligibility slip is designed as reference for UPU Online prerequisite admissions and academic preparation.</>
                )}
              </p>
            </div>
            
            <div className="text-center relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-40 mb-1" style={{ border: '1px dashed #10b981', color: '#059669' }}>
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-[8px] font-mono tracking-tight font-bold pt-0.5 px-3 border-t" style={{ color: '#047857', borderTopColor: '#a7f3d0' }}>
                {lang === 'bm' ? 'SEMAKAN DIGITAL UPU' : 'DIGITAL UPU VERIFICATION'}
              </div>
              <div className="text-[7px] font-mono mt-0.5" style={{ color: '#94a3b8' }}>KOD: UPU-{activeMerit.toFixed(0)}-{pathway.toUpperCase()}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
