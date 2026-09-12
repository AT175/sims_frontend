/**
 * GES Class Levels and Subjects for Frontend
 * Used by the AI Lesson Assistant for dropdowns.
 */

export interface GESClassLevelOption {
  key: string;
  label: string;
  level: 'kg' | 'primary' | 'jhs' | 'shs';
}

export const GES_CLASS_LEVELS: GESClassLevelOption[] = [
  { key: 'kg1', label: 'KG 1', level: 'kg' },
  { key: 'kg2', label: 'KG 2', level: 'kg' },
  { key: 'basic1', label: 'Basic 1', level: 'primary' },
  { key: 'basic2', label: 'Basic 2', level: 'primary' },
  { key: 'basic3', label: 'Basic 3', level: 'primary' },
  { key: 'basic4', label: 'Basic 4', level: 'primary' },
  { key: 'basic5', label: 'Basic 5', level: 'primary' },
  { key: 'basic6', label: 'Basic 6', level: 'primary' },
  { key: 'basic7', label: 'Basic 7 (JHS 1)', level: 'jhs' },
  { key: 'basic8', label: 'Basic 8 (JHS 2)', level: 'jhs' },
  { key: 'basic9', label: 'Basic 9 (JHS 3)', level: 'jhs' },
  { key: 'shs1', label: 'SHS 1', level: 'shs' },
  { key: 'shs2', label: 'SHS 2', level: 'shs' },
  { key: 'shs3', label: 'SHS 3', level: 'shs' },
];

export const GES_SUBJECTS_BY_CLASS: Record<string, string[]> = {
  kg1: ['English Language', 'Mathematics', 'Our World Our People', 'Creative Arts'],
  kg2: ['English Language', 'Mathematics', 'Our World Our People', 'Creative Arts'],
  basic1: ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Religious and Moral Education', 'History', 'Ghanaian Language', 'Creative Arts', 'Physical Education'],
  basic2: ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Religious and Moral Education', 'History', 'Ghanaian Language', 'Creative Arts', 'Physical Education'],
  basic3: ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Religious and Moral Education', 'History', 'Ghanaian Language', 'Creative Arts', 'Physical Education'],
  basic4: ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Religious and Moral Education', 'History', 'Ghanaian Language', 'Creative Arts', 'Computing', 'Physical Education'],
  basic5: ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Religious and Moral Education', 'History', 'Ghanaian Language', 'Creative Arts', 'Computing', 'Physical Education'],
  basic6: ['English Language', 'Mathematics', 'Science', 'Our World Our People', 'Religious and Moral Education', 'History', 'Ghanaian Language', 'Creative Arts', 'Computing', 'Physical Education'],
  basic7: ['English Language', 'Mathematics', 'Integrated Science', 'Social Studies', 'Ghanaian Language', 'Religious and Moral Education', 'Career Technology', 'Computing', 'Creative Arts and Design', 'Physical Education'],
  basic8: ['English Language', 'Mathematics', 'Integrated Science', 'Social Studies', 'Ghanaian Language', 'Religious and Moral Education', 'Career Technology', 'Computing', 'Creative Arts and Design', 'Physical Education'],
  basic9: ['English Language', 'Mathematics', 'Integrated Science', 'Social Studies', 'Ghanaian Language', 'Religious and Moral Education', 'Career Technology', 'Computing', 'Creative Arts and Design', 'Physical Education'],
  shs1: ['English Language', 'Mathematics (Core)', 'Integrated Science (Core)', 'Social Studies (Core)', 'Information and Communication Technology (Core)', 'Physical Education (Core)', 'Physics (Elective)', 'Chemistry (Elective)', 'Biology (Elective)', 'Economics (Elective)', 'Government (Elective)', 'Literature in English (Elective)', 'Geography (Elective)', 'Accounting (Elective)', 'Business Management (Elective)', 'History (Elective)', 'French (Elective)'],
  shs2: ['English Language', 'Mathematics (Core)', 'Integrated Science (Core)', 'Social Studies (Core)', 'Information and Communication Technology (Core)', 'Physical Education (Core)', 'Physics (Elective)', 'Chemistry (Elective)', 'Biology (Elective)', 'Economics (Elective)', 'Government (Elective)', 'Literature in English (Elective)', 'Geography (Elective)', 'Accounting (Elective)', 'Business Management (Elective)', 'History (Elective)', 'French (Elective)'],
  shs3: ['English Language', 'Mathematics (Core)', 'Integrated Science (Core)', 'Social Studies (Core)', 'Information and Communication Technology (Core)', 'Physical Education (Core)', 'Physics (Elective)', 'Chemistry (Elective)', 'Biology (Elective)', 'Economics (Elective)', 'Government (Elective)', 'Literature in English (Elective)', 'Geography (Elective)', 'Accounting (Elective)', 'Business Management (Elective)', 'History (Elective)', 'French (Elective)', 'Elective Mathematics'],
};

export const GES_WEEKS = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
export const GES_TERMS = ['Term 1', 'Term 2', 'Term 3'];

export function getSubjectsForClass(classKey: string): string[] {
  return GES_SUBJECTS_BY_CLASS[classKey] || [];
}
