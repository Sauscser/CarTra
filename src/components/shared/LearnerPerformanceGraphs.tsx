import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import CourseSubjectPointsGraph from './CourseSubjectPointsGraph';
import LearnerClusterTrendGraph from './LearnerClusterTrendGraph';
import calculateHistoricalClusterSeries, { calculateDeviationPercentage, hasCourseSubjectPointRequirements } from '../../utils/cluster';

type PerformancePoint = { label: string; value: number; target: number };
type SubjectSeries = { label: string; values: PerformancePoint[]; missingGrades: number[] };

type Props = {
  learner: any;
  profile: any;
  mode: 'cluster' | 'subjects';
};

const gradeAxis = [7, 8, 9, 10, 11, 12] as const;

function getSubjects(profile: any) {
  const historical = Array.isArray(profile?.historicalSelectedSubjects) ? profile.historicalSelectedSubjects : [];
  let selected = Array.isArray(profile?.selectedSubjects) ? profile.selectedSubjects : [];
  if (!selected.length && profile?.supportProfile) {
    try {
      const parsed = typeof profile.supportProfile === 'string' ? JSON.parse(profile.supportProfile) : profile.supportProfile;
      selected = Array.isArray(parsed?.selectedSubjects) ? parsed.selectedSubjects : [];
    } catch {
      selected = [];
    }
  }
  return [...historical, ...selected];
}

function getSubjectSeries(learner: any, profile: any): SubjectSeries[] {
  const currentGrade = Number(String(learner?.gradeLevel || '').replace(/\D/g, '')) || 7;
  const subjects = getSubjects(profile);
  const subjectMap = new Map<string, any>();

  subjects.forEach((subject: any) => {
    const key = String(subject?.id || subject?.code || subject?.name || 'subject').toLowerCase();
    const existing = subjectMap.get(key);
    if (!existing) {
      subjectMap.set(key, {
        label: subject?.name || subject?.code || 'Subject',
        target: Number(subject?.targetMarks ?? subject?.targetMark ?? NaN),
        achieved: Number(subject?.marksScored ?? NaN),
        history: Array.isArray(subject?.history) ? subject.history : [],
      });
      return;
    }
    existing.history = [...existing.history, ...(Array.isArray(subject?.history) ? subject.history : [])];
    if (!Number.isFinite(existing.target) && Number.isFinite(Number(subject?.targetMarks ?? subject?.targetMark))) existing.target = Number(subject.targetMarks ?? subject.targetMark);
    if (Number.isFinite(Number(subject?.marksScored))) existing.achieved = Number(subject.marksScored);
  });

  return Array.from(subjectMap.values()).map((subject) => {
    const allGradeValues = gradeAxis.map((grade) => {
      const entry = subject.history.find((item: any) => String(item?.label) === String(grade));
      const target = Number.isFinite(Number(entry?.target)) ? Number(entry.target) : grade === currentGrade ? subject.target : NaN;
      const value = Number.isFinite(Number(entry?.value)) ? Number(entry.value) : grade === currentGrade ? subject.achieved : NaN;
      return Number.isFinite(target) && target > 0 && Number.isFinite(value) ? { label: String(grade), value, target } : null;
    });
    const values = allGradeValues.filter((point): point is PerformancePoint => point !== null);
    const missingGrades: number[] = gradeAxis.filter((_, index) => allGradeValues[index] === null);
    return values.length ? { label: subject.label, values, missingGrades } : null;
  }).filter((subject): subject is SubjectSeries => subject !== null);
}

function LineChart({ series, requirement, maxY }: { series: PerformancePoint[]; requirement?: number | null; maxY?: number }) {
  const width = Math.max(300, Math.min(420, Dimensions.get('window').width - 72));
  const height = 440;
  const left = 34;
  const right = 32;
  const top = 12;
  const bottom = 42;
  const dataValues = series.flatMap((point) => [point.value, point.target]);
  const requirementValues = typeof requirement === 'number' && Number.isFinite(requirement) ? [requirement] : [];
  const max = Math.max(100, ...(Number.isFinite(maxY) ? [Number(maxY)] : []), ...dataValues, ...requirementValues, 0);
  const x = (label: string) => left + (gradeAxis.indexOf(Number(label) as (typeof gradeAxis)[number]) / 5) * (width - left - right);
  const y = (value: number) => {
    if (!Number.isFinite(value) || value < 0) return height - bottom;
    const plotValue = Math.min(value, max);
    return height - bottom - (plotValue / max) * (height - top - bottom);
  };
  const draw = (color: string, key: 'value' | 'target') => series.slice(1).map((point, index) => {
    const previous = series[index];
    const previousGrade = Number(previous.label);
    const currentGrade = Number(point.label);
    const shouldBreakPhase = previousGrade <= 9 && currentGrade >= 10;
    if (currentGrade - previousGrade > 1 || shouldBreakPhase) return null;
    const dx = x(point.label) - x(previous.label);
    const dy = y(point[key]) - y(previous[key]);
    const length = Math.hypot(dx, dy) || 1;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return <View key={`${key}-${index}`} style={{ position: 'absolute', left: (x(previous.label) + x(point.label)) / 2 - length / 2, top: (y(previous[key]) + y(point[key])) / 2 - 1.5, width: length, height: 3, backgroundColor: color, transform: [{ rotate: `${angle}deg` }] }} />;
  });
  const requirementPoints = typeof requirement === 'number' && Number.isFinite(requirement)
    ? gradeAxis.filter((grade) => grade >= 10 && grade <= 12).map((grade) => ({ label: String(grade), value: requirement, target: requirement }))
    : [];
  const drawNational = (color: string) => requirementPoints.slice(1).map((point, index) => {
    const previous = requirementPoints[index];
    if (!previous) return null;
    const dx = x(point.label) - x(previous.label);
    const dy = y(point.value) - y(previous.value);
    const length = Math.hypot(dx, dy) || 1;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return <View key={`national-${index}`} style={{ position: 'absolute', left: (x(previous.label) + x(point.label)) / 2 - length / 2, top: (y(previous.value) + y(point.value)) / 2 - 1.5, width: length, height: 3, backgroundColor: color, transform: [{ rotate: `${angle}deg` }] }} />;
  });

  return (
    <View style={[styles.chart, { width, height }]}>
      {Array.from({ length: Math.floor(max) + 1 }, (_, tick) => <View key={`grid-${tick}`} style={[styles.grid, { top: y(tick), left, right, backgroundColor: tick === 0 || tick % 10 === 0 ? '#94a3b8' : '#dbeafe' }]} />)}
      {Array.from({ length: 11 }, (_, index) => index * 10).map((tick) => <Text key={`y-label-${tick}`} style={[styles.yLabel, { top: y(tick) - 8, left: 4 }]}>{tick}</Text>)}
      {gradeAxis.map((grade) => <Text key={grade} style={[styles.grade, { left: x(String(grade)) - 10, top: height - bottom + 6 }]}>{grade}</Text>)}
      {draw('#93c5fd', 'target')}
      {draw('#1d4ed8', 'value')}
      {drawNational('#22c55e')}
      {series.map((point) => <View key={`target-dot-${point.label}`} style={[styles.dot, { backgroundColor: '#93c5fd', left: x(point.label) - 3, top: y(point.target) - 3 }]} />)}
      {series.map((point) => <View key={`value-dot-${point.label}`} style={[styles.dot, { backgroundColor: '#1d4ed8', left: x(point.label) - 3, top: y(point.value) - 3 }]} />)}
      {requirementPoints.map((point) => <View key={`national-dot-${point.label}`} style={[styles.dot, { backgroundColor: '#22c55e', left: x(point.label) - 3, top: y(point.value) - 3 }]} />)}
      <View style={styles.legend}><Text style={styles.legendTarget}>Target</Text><Text style={styles.legendValue}>Achieved</Text>{requirementPoints.length > 0 && <Text style={styles.legendNational}>National requirement</Text>}</View>
    </View>
  );
}

export default function LearnerPerformanceGraphs({ learner, profile, mode }: Props) {
  if (mode === 'cluster') {
    if (hasCourseSubjectPointRequirements(profile)) {
      return <CourseSubjectPointsGraph learner={learner} profile={profile} />;
    }
    const series = calculateHistoricalClusterSeries(learner, profile || {});
    const valid = series.filter((point: any) => Number.isFinite(Number(point.value)));
    const averageCluster = valid.length ? Math.round(valid.reduce((sum: number, point: any) => sum + Number(point.value || 0), 0) / valid.length) : null;
    const averageDeviation = valid.length ? Math.round((valid.reduce((sum: number, point: any) => sum + Number(point.deviation || 0), 0) / valid.length) * 100) / 100 : null;
    const targetCareer = profile?.targetCareer || 'Not set';
    return (
      <View>
        <LearnerClusterTrendGraph learner={learner} profile={profile} />
        <Text style={styles.summary}>Target career: {targetCareer}</Text>
        <Text style={styles.sectionTitle}>Overall cluster points by year</Text>
        <Text style={styles.summary}>{valid.length ? valid.map((point: any) => `Grade ${point.label}: ${point.value}`).join(' • ') : 'No valid cluster data recorded yet.'}</Text>
        <Text style={styles.summary}>Average overall cluster points: {averageCluster === null ? 'N/A' : averageCluster}</Text>
        <Text style={styles.summary}>Average deviation: {averageDeviation === null ? 'N/A' : `${averageDeviation}%`}</Text>
      </View>
    );
  }

  const subjects = getSubjectSeries(learner, profile);
  if (!subjects.length) return <Text style={styles.empty}>No subject data is available yet.</Text>;
  return <View><Text style={styles.heading}>Subject performance</Text>{subjects.map((subject, index) => { const deviations = subject.values.map((point) => ({ label: point.label, value: Math.round((calculateDeviationPercentage(point.value, point.target) || 0) * 100) / 100 })); const average = Math.round((deviations.reduce((sum, item) => sum + item.value, 0) / deviations.length) * 100) / 100; return <View key={`${subject.label}-${index}`} style={styles.subject}><Text style={styles.subjectTitle}>{subject.label}</Text><LineChart series={subject.values} /><Text style={styles.missing}>Missing subject data for Grades {subject.missingGrades.join(', ') || 'none'}{subject.missingGrades.length ? '; missing grades are not plotted.' : '.'}</Text><Text style={styles.sectionTitle}>Annual deviation</Text><Text style={styles.summary}>{deviations.map((item) => `Grade ${item.label}: ${item.value}%`).join(' • ')}</Text><Text style={styles.summary}>Average deviation: {average}%</Text></View>; })}</View>;
}

const styles = StyleSheet.create({
  heading: { fontWeight: '700', marginBottom: 8 },
  subject: { marginBottom: 14 },
  subjectTitle: { fontWeight: '700', marginBottom: 4 },
  sectionTitle: { fontWeight: '600', marginTop: 6 },
  chart: { borderWidth: 1, borderColor: '#dbeafe', borderRadius: 8, backgroundColor: '#fff', position: 'relative', marginBottom: 6 },
  grid: { position: 'absolute', height: 1, backgroundColor: '#dbeafe' },
  yLabel: { position: 'absolute', width: 26, textAlign: 'right', fontSize: 11, color: '#0f172a' },
  dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  grade: { position: 'absolute', width: 20, textAlign: 'center', fontSize: 11, color: '#0f172a' },
  legend: { position: 'absolute', top: 4, right: 8, flexDirection: 'row', gap: 8, flexWrap: 'wrap', maxWidth: 220 },
  legendTarget: { fontSize: 10, color: '#2563eb' },
  legendValue: { fontSize: 10, color: '#1d4ed8' },
  legendNational: { fontSize: 10, color: '#16a34a' },
  summary: { color: '#0f172a', fontSize: 14, marginTop: 4 },
  empty: { color: '#6b7280', fontSize: 14 },
  missing: { color: '#92400e', fontSize: 12, lineHeight: 17, marginTop: 4 },
});
