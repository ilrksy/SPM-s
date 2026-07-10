export interface UpuReportPdfCourse {
  name: string;
  universities: string[];
  minMerit?: number;
}

export interface UpuReportPdfSubject {
  name: string;
  grade: string;
}

export interface UpuReportPdfData {
  lang: 'bm' | 'en';
  pathway: 'spm' | 'stpm';
  meritScore: number;
  candidateName: string;
  icNumber?: string;
  indexNumber?: string;
  schoolName?: string;
  examYear?: string;
  serialNumber?: string;
  subjects: UpuReportPdfSubject[];
  eligibleCourses: UpuReportPdfCourse[];
}

export interface UpuReportPdfSection {
  title: string;
  lines: string[];
}

export const buildUpuReportPdfSections = (data: UpuReportPdfData): UpuReportPdfSection[] => {
  const isBm = data.lang === 'bm';
  const pathwayLabel = data.pathway === 'spm'
    ? (isBm ? 'SIJIL PELAJARAN MALAYSIA (SPM)' : 'MALAYSIAN CERTIFICATE OF EDUCATION (SPM)')
    : (isBm ? 'SIJIL TINGGI PERSEKOLAHAN MALAYSIA (STPM)' : 'MALAYSIAN HIGHER SCHOOL CERTIFICATE (STPM)');

  const title = isBm ? 'LAPORAN KELAYAKAN UPU' : 'UPU ELIGIBILITY REPORT';
  const summaryTitle = isBm ? 'RINGKASAN SUBJEK' : 'SUBJECT SUMMARY';
  const coursesTitle = isBm ? 'KURSUS YANG LAYAK' : 'ELIGIBLE COURSES';
  const footer = isBm
    ? 'Laporan ini adalah anggaran sahaja. Sila rujuk portal rasmi UPU untuk maklumat tepat.'
    : 'This report is an estimate only. Please refer to the official UPU portal for accurate information.';

  const profileLines = [
    `${isBm ? 'Nama Calon' : 'Candidate'}: ${data.candidateName || (isBm ? 'NAMA CALON' : 'CANDIDATE NAME')}`,
    `${isBm ? 'No. Kad Pengenalan' : 'IC Number'}: ${data.icNumber || '-'}`,
    `${isBm ? 'Angka Giliran' : 'Index Number'}: ${data.indexNumber || '-'}`,
    `${isBm ? 'Sekolah' : 'School'}: ${data.schoolName || '-'}`,
    `${isBm ? 'Tahun Peperiksaan' : 'Exam Year'}: ${data.examYear || '-'}`,
    `${isBm ? 'No. Siri' : 'Serial No.'}: ${data.serialNumber || '-'}`,
  ];

  const meritLines = [
    `${isBm ? 'Aliran Pengajian' : 'Study Pathway'}: ${pathwayLabel}`,
    `${isBm ? 'Markah Merit UPU' : 'UPU Merit Score'}: ${data.meritScore.toFixed(2)}%`,
  ];

  const subjectLines = data.subjects.length > 0
    ? data.subjects.map(subject => `${subject.name} — ${subject.grade}`)
    : [isBm ? 'Tiada maklumat subjek.' : 'No subject information available.'];

  const courseLines = data.eligibleCourses.length > 0
    ? data.eligibleCourses.map(course => {
        const meritValue = course.minMerit?.toFixed(1) ?? '-';
        const universitiesValue = course.universities.join(', ');
        return `${course.name} • ${isBm ? 'Minimum Merit' : 'Minimum Merit'}: ${meritValue}% • ${isBm ? 'Universiti' : 'Universities'}: ${universitiesValue}`;
      })
    : [isBm ? 'Tiada kursus yang layak pada tahap merit semasa.' : 'No eligible courses at the current merit level.'];

  return [
    {
      title,
      lines: [
        ...profileLines,
        '',
        ...meritLines,
      ],
    },
    {
      title: summaryTitle,
      lines: subjectLines,
    },
    {
      title: coursesTitle,
      lines: courseLines,
    },
    {
      title: isBm ? 'NOTA' : 'NOTE',
      lines: [footer],
    },
  ];
};
