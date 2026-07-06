export type TemplateStyle = 'slip' | 'sijil';

export interface Subject {
  id: string;
  code: string;
  name: string;
  grade: string;
  description: string;
}

export interface StudentInfo {
  name: string;
  icNumber: string;
  angkaGiliran: string;
  schoolName: string;
  examYear: string;
  serialNumber: string;
}

export interface OralResults {
  bmOral: string;
  biOral: string;
}

export interface SpmData {
  studentInfo: StudentInfo;
  subjects: Subject[];
  oralResults: OralResults;
  cefrLevel: string;
  templateStyle: TemplateStyle;
  isEligibleOverride: boolean | null; // null means auto-calculate
}
