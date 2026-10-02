import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PerformanceCartesianChart from './PerformanceCartesianChart';
import { calculateDeviationPercentage } from '../../utils/cluster';
import { parseLearnerSupportProfile } from '../../utils/learnerCareer';

type MarkPoint = { label: string; value: number | null; target: number | null };
type SubjectSeries = {
  id?: string;
  label: string;
  code?: string;
  phase: 'junior' | 'senior';
  values: MarkPoint[];
};

type Props = {
  learner: any;
  profile: any;
  renderSubjectActions?: (subject: SubjectSeries) => React.ReactNode;
};

const JUNIOR_GRADES = [7, 8, 9] as const;
const SENIOR_GRADES = [10, 11, 12] as const;

function recordedMark(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getSubjectSeries(learner: any, profile: any): SubjectSeries[] {
  const supportProfile = parseLearnerSupportProfile(profile?.supportProfile) || {};
  const historicalSubjects = Array.isArray(profile?.historicalSelectedSubjects)
    ? profile.historicalSelectedSubjects
    : Array.isArray(supportProfile.historicalSelectedSubjects) ? supportProfile.historicalSelectedSubjects : [];
  const selectedSubjects = Array.isArray(profile?.selectedSubjects)
    ? profile.selectedSubjects
    : Array.isArray(supportProfile.selectedSubjects) ? supportProfile.selectedSubjects : [];
  const currentGrade = Number(String(learner?.gradeLevel || '').replace(/\D/g, '')) || 7;
  const subjects = new Map<string, any>();

  [...historicalSubjects, ...selectedSubjects].forEach((subject: any) => {
    const identity = String(subject?.id || subject?.code || subject?.name || '').trim().toLowerCase();
    if (!identity) return;
    const existing = subjects.get(identity);
    subjects.set(identity, {
      ...(existing || {}),
      ...subject,
      id: subject?.id || existing?.id,
      name: subject?.name || existing?.name || subject?.code || 'Subject',
      code: subject?.code || existing?.code,
      history: [...(Array.isArray(existing?.history) ? existing.history : []), ...(Array.isArray(subject?.history) ? subject.history : [])],
    });
  });

  return Array.from(subjects.values()).flatMap((subject): SubjectSeries[] => {
    const history = Array.isArray(subject.history) ? subject.history : [];
    const gradesInHistory = history
      .map((entry: any) => Number(String(entry?.label || '').trim()))
      .filter((grade: number) => Number.isInteger(grade) && grade >= 7 && grade <= 12);
    const phases = new Set<'junior' | 'senior'>([
      ...gradesInHistory.map((grade: number) => grade >= 10 ? 'senior' : 'junior'),
      currentGrade >= 10 ? 'senior' : 'junior',
    ]);

    return Array.from(phases).map((phase) => {
      const grades = phase === 'senior' ? SENIOR_GRADES : JUNIOR_GRADES;
      const values = grades.flatMap((grade) => {
        const entries = history.filter((entry: any) => Number(String(entry?.label || '').trim()) === grade);
        const entry = entries.at(-1);
        const historicalValue = recordedMark(entry?.value);
        const historicalTarget = recordedMark(entry?.target);
        const currentValue = grade === currentGrade ? recordedMark(subject.marksScored) : null;
        const currentTarget = grade === currentGrade ? recordedMark(subject.targetMarks ?? subject.targetMark) : null;
        const value = historicalValue ?? (currentValue !== null && currentValue >= 0 ? currentValue : null);
        const candidateTarget = historicalTarget ?? currentTarget;
        const target = candidateTarget !== null && candidateTarget > 0 ? candidateTarget : null;
        return value === null && target === null ? [] : [{ label: String(grade), value, target }];
      });

      return {
        id: subject.id ? String(subject.id) : undefined,
        label: String(subject.name || subject.code || 'Subject'),
        code: subject.code ? String(subject.code) : undefined,
        phase,
        values,
      };
    });
  });
}

export default function SubjectPerformanceGraph({ learner, profile, renderSubjectActions }: Props) {
  const subjects = getSubjectSeries(learner, profile || {});
  if (!subjects.length) return <Text style={styles.empty}>No subject assignments or performance records are available.</Text>;

  return (
    <View>
      <Text style={styles.heading}>Subject performance</Text>
      {subjects.map((subject, index) => {
        const grades = subject.phase === 'senior' ? SENIOR_GRADES : JUNIOR_GRADES;
        const missing = grades.flatMap((grade) => {
          const point = subject.values.find((value) => Number(value.label) === grade);
          const absent: string[] = [];
          if (!point || point.target === null) absent.push('target not recorded');
          if (!point || point.value === null) absent.push('achieved mark not recorded');
          return absent.length ? [`Grade ${grade}: ${absent.join(' and ')}`] : [];
        });
        const deviations = subject.values.flatMap((point) => point.value !== null && point.target !== null
          ? [{ label: point.label, value: Math.round((calculateDeviationPercentage(point.value, point.target) || 0) * 100) / 100 }]
          : []);
        const average = deviations.length
          ? Math.round(deviations.reduce((sum, point) => sum + point.value, 0) / deviations.length)
          : null;

        return (
          <View key={`${subject.id || subject.label}-${subject.phase}-${index}`} style={styles.subject}>
            <Text style={styles.subjectTitle}>{subject.label}{subject.code && subject.code !== subject.label ? ` (${subject.code})` : ''}</Text>
            <Text style={styles.phase}>{subject.phase === 'senior' ? 'Senior phase (Grades 10-12)' : 'Junior phase (Grades 7-9)'}</Text>
            <PerformanceCartesianChart series={subject.values} axisGrades={grades} />
            {missing.length ? <Text style={styles.missing}>Missing marks: {missing.join('; ')}.</Text> : null}
            <Text style={styles.sectionTitle}>Annual deviation</Text>
            {deviations.length
              ? <Text style={styles.summary}>{deviations.map((point) => `Grade ${point.label}: ${point.value}%`).join(' · ')}</Text>
              : <Text style={styles.summary}>No deviation recorded because target and achieved marks are missing.</Text>}
            <Text style={styles.summary}>Average deviation: {average === null ? 'N/A' : `${average}%`}</Text>
            {renderSubjectActions?.(subject)}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: '#0f172a', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  subject: { marginBottom: 16 },
  subjectTitle: { color: '#0f172a', fontWeight: '700', marginBottom: 3 },
  phase: { color: '#475569', fontSize: 12, marginBottom: 4 },
  missing: { color: '#92400e', fontSize: 12, lineHeight: 17, marginTop: 4 },
  sectionTitle: { color: '#0f172a', fontWeight: '600', marginTop: 8 },
  summary: { color: '#0f172a', fontSize: 13, marginTop: 4 },
  empty: { color: '#6b7280', fontSize: 14 },
});
