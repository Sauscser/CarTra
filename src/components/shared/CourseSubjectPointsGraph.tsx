import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CBE_ATTEMPTED_POINTS_MAX, calculateCourseClusterScoreDetails, evaluateCourseSubjectPointRequirements, getCbeAchievementLevel, getCourseRequirementGroups, getCourseSubjectPoints, hasCompleteCourseScoringData, hasCompleteCourseSubjectRequirements, parseCourseClusterRequirements } from '../../utils/cluster';
import LearnerClusterTrendGraph from './LearnerClusterTrendGraph';
import useSupportSubjectFilter, { filterSupportSubjectsFromProfile } from '../../hooks/useSupportSubjectFilter';

const GRADES = [10, 11, 12] as const;

type Props = {
  learner: any;
  profile: any;
  showTrendGraph?: boolean;
};

function parseSupportProfile(profile: any) {
  const value = profile?.supportProfile;
  if (!value) return {};
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return {};
  }
}

function getLearnerSubjects(profile: any, supportProfile: any) {
  const historical = Array.isArray(profile?.historicalSelectedSubjects)
    ? profile.historicalSelectedSubjects
    : Array.isArray(supportProfile?.historicalSelectedSubjects) ? supportProfile.historicalSelectedSubjects : [];
  const selected = Array.isArray(profile?.selectedSubjects)
    ? profile.selectedSubjects
    : Array.isArray(supportProfile?.selectedSubjects) ? supportProfile.selectedSubjects : [];
  const subjectsById = new Map<string, any>();

  [...historical, ...selected].forEach((subject: any) => {
    const id = String(subject?.id || subject?.code || subject?.name || '').trim();
    if (!id) return;
    const previous = subjectsById.get(id);
    subjectsById.set(id, {
      ...(previous || {}),
      ...subject,
      history: [...(Array.isArray(previous?.history) ? previous.history : []), ...(Array.isArray(subject?.history) ? subject.history : [])],
    });
  });

  return subjectsById;
}

function getMarkForGrade(subject: any, grade: number, currentGrade: number) {
  const history = Array.isArray(subject?.history) ? subject.history : [];
  const historical = [...history].reverse().find((entry: any) => String(entry?.label) === String(grade));
  const hasCurrentMark = subject?.marksScored !== null && subject?.marksScored !== '' && Number.isFinite(Number(subject?.marksScored));
  const hasHistoricalMark = historical?.value !== null && historical?.value !== '' && Number.isFinite(Number(historical?.value));
  const mark = grade === currentGrade && hasCurrentMark ? Number(subject.marksScored) : hasHistoricalMark ? Number(historical.value) : NaN;
  if (!Number.isFinite(mark) || mark < 0) return null;
  return Math.max(0, Math.min(100, mark));
}

export default function CourseSubjectPointsGraph({ learner, profile, showTrendGraph = true }: Props) {
  const supportFilter = useSupportSubjectFilter();
  if (supportFilter.loading) {
    return <Text style={styles.noRequirements}>Checking the support-subject catalog before calculating senior course scores...</Text>;
  }
  if (supportFilter.error) {
    return <Text style={styles.noRequirements}>Senior course scores are hidden because support subjects could not be verified: {supportFilter.error}</Text>;
  }
  const filteredProfile = filterSupportSubjectsFromProfile(profile, supportFilter.ids);
  const supportProfile = parseSupportProfile(filteredProfile);
  const requirements = parseCourseClusterRequirements(
    filteredProfile?.clusterRequirements || supportProfile?.clusterRequirements || filteredProfile?.courseClusterRequirements,
  );
  const groups = getCourseRequirementGroups(requirements);
  const subjects = getLearnerSubjects(filteredProfile, supportProfile);
  const currentGrade = Number(String(learner?.gradeLevel || '').replace(/\D/g, '')) || 7;
  const requirementStatus = evaluateCourseSubjectPointRequirements(Array.from(subjects.values()), requirements);

  if (groups.length === 0) {
    return (
      <View style={styles.container}>
        {showTrendGraph ? <LearnerClusterTrendGraph learner={learner} profile={profile} supportSubjectIds={supportFilter.ids} /> : null}
        <Text style={styles.noRequirements}>No course subject groups are configured. Senior course cluster scores are unavailable.</Text>
      </View>
    );
  }
  if (!hasCompleteCourseSubjectRequirements(requirements)) {
    return (
      <View style={styles.container}>
        {showTrendGraph ? <LearnerClusterTrendGraph learner={learner} profile={profile} supportSubjectIds={supportFilter.ids} /> : null}
        <Text style={styles.heading}>Course subject requirements</Text>
        <Text style={styles.noRequirements}>The course subject groups or CBE minimum points are incomplete. Senior course cluster scores are unavailable.</Text>
      </View>
    );
  }
  if (!hasCompleteCourseScoringData(requirements)) {
    return (
      <View style={styles.container}>
        {showTrendGraph ? <LearnerClusterTrendGraph learner={learner} profile={profile} supportSubjectIds={supportFilter.ids} /> : null}
        <Text style={styles.heading}>Course subject requirements</Text>
        <Text style={styles.noRequirements}>Course scores are unavailable because the saved tertiary seven-best minimum or national CBE mark ranges are missing or invalid. The National Officer and tertiary officer must complete this setup before scores can be calculated.</Text>
      </View>
    );
  }

  const grades = GRADES.map((grade) => {
    const gradeSubjects = Array.from(subjects.values()).map((subject) => {
      const marksScored = getMarkForGrade(subject, grade, currentGrade);
      return marksScored === null ? null : { ...subject, marksScored };
    }).filter((subject): subject is any => subject !== null);
    return { grade, gradeSubjects, details: calculateCourseClusterScoreDetails(gradeSubjects, requirements) };
  });

  return (
    <View style={styles.container}>
      {showTrendGraph ? <LearnerClusterTrendGraph learner={learner} profile={profile} supportSubjectIds={supportFilter.ids} /> : null}
      <Text style={styles.heading}>Course subject requirements</Text>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Current subject minima</Text>
        <Text style={[
          styles.statusValue,
          requirementStatus === true && styles.statusMet,
          requirementStatus === false && styles.statusBelow,
        ]}>
          {requirementStatus === true ? 'Met' : requirementStatus === false ? 'Not yet met' : 'Not assessed'}
        </Text>
      </View>

      <View style={styles.scorePanel}>
        <Text style={styles.scoreHeading}>Course score by grade</Text>
        <Text style={styles.caption}>CBE score = (c/C) x (t/T) x C, where c is achieved cluster-subject points, C is 8 x {groups.length} groups, t is the learner's seven-best points, and T is {CBE_ATTEMPTED_POINTS_MAX}. Tertiary minimum for t: {requirements?.bestSubjectsMinimumPoints}/{CBE_ATTEMPTED_POINTS_MAX}.</Text>
        <Text style={styles.caption}>Subject-specific national CBE ranges are used for cluster subjects; the saved national ranges are used for other attempted subjects.</Text>
        {grades.map(({ grade, details }) => (
          <View key={grade} style={styles.scoreGradeRow}>
            <Text style={styles.gradeLabel}>{grade}</Text>
            <Text style={styles.scoreValue}>{details ? `${details.points.toFixed(2)} / ${details.clusterMaximum}` : 'Not available'}</Text>
            <Text style={styles.scoreBreakdown}>{details ? `c ${details.clusterPoints}/${details.clusterMaximum} · t ${details.sevenBestPoints}/${CBE_ATTEMPTED_POINTS_MAX}` : 'Cluster subject marks missing'}</Text>
          </View>
        ))}
      </View>

      {groups.map((group, groupIndex) => {
        const alternatives = group.map((item) => ({
          item,
          name: subjects.get(item.subjectId)?.name || subjects.get(item.subjectId)?.code || item.subjectName || item.subjectId,
        }));
        return (
          <View key={`group-${groupIndex}`} style={styles.subject}>
            <Text style={styles.groupTitle}>Required group {groupIndex + 1} of {groups.length}</Text>
            <Text style={styles.groupAlternatives}>
              {alternatives.map(({ item, name }, index) => `${index > 0 ? ' OR ' : ''}${name} (min ${Number.isInteger(item.minimumPoints) ? `${item.minimumPoints} ${getCbeAchievementLevel(Number(item.minimumPoints))}` : 'not set'})`).join('')}
            </Text>
            <View style={styles.scaleLabels}>
              <Text style={styles.gradeLabel}>Grade</Text>
              <View style={styles.scaleTrackLabels}>
                <Text style={styles.scaleLabel}>0</Text>
                <Text style={styles.scaleLabel}>4</Text>
                <Text style={styles.scaleLabel}>8</Text>
              </View>
              <Text style={styles.pointsValue}>Best</Text>
            </View>
            {grades.map(({ grade, gradeSubjects }) => {
              const best = alternatives
                .map(({ item, name }) => {
                  const subject = gradeSubjects.find((candidate) => String(candidate.id || candidate.code || candidate.name) === item.subjectId);
                  return subject ? { item, name, points: getCourseSubjectPoints(subject.marksScored, item.achievementRanges || requirements?.achievementRanges) } : null;
                })
                .filter((candidate): candidate is { item: typeof group[number]; name: string; points: number } => candidate !== null)
                .sort((left, right) => right.points - left.points)[0];
              const meetsMinimum = Boolean(best && Number.isInteger(best.item.minimumPoints) && best.points >= Number(best.item.minimumPoints));
              const minimum = best && Number.isInteger(best.item.minimumPoints) ? Number(best.item.minimumPoints) : null;
              return (
                <View key={grade} style={styles.gradeRow}>
                  <Text style={styles.gradeLabel}>{grade}</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${best ? (best.points / 8) * 100 : 0}%` }, meetsMinimum && styles.fillMet]} />
                    {minimum !== null ? <View style={[styles.minimumMarker, { left: `${(minimum / 8) * 100}%` }]} /> : null}
                  </View>
                  <Text style={[styles.pointsValue, best && (meetsMinimum ? styles.pointsMet : styles.pointsBelow)]}>
                    {best ? `${best.points}/8 · ${getCbeAchievementLevel(best.points)}` : '—'}
                  </Text>
                  <Text style={styles.bestLabel}>{best ? `${best.name}${minimum === null ? '' : ` · min ${minimum}`}` : 'No marks'}</Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12, paddingVertical: 10, borderTopWidth: 1, borderColor: '#dbe3ea' },
  heading: { color: '#111827', fontSize: 16, fontWeight: '700' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  statusLabel: { color: '#334155', fontSize: 13, fontWeight: '600' },
  statusValue: { color: '#475569', fontSize: 13, fontWeight: '700' },
  statusMet: { color: '#047857' },
  statusBelow: { color: '#b45309' },
  caption: { color: '#475569', fontSize: 12, lineHeight: 17, marginTop: 3 },
  scorePanel: { marginTop: 10, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  scoreHeading: { color: '#0f172a', fontSize: 14, fontWeight: '700' },
  scoreGradeRow: { paddingTop: 8 },
  scoreValue: { color: '#0f172a', fontSize: 14, fontWeight: '700' },
  scoreBreakdown: { color: '#475569', fontSize: 11, marginTop: 2 },
  subject: { paddingVertical: 10, borderTopWidth: 1, borderColor: '#e2e8f0' },
  groupTitle: { color: '#0f172a', fontSize: 14, fontWeight: '700' },
  groupAlternatives: { color: '#475569', fontSize: 11, lineHeight: 16, marginTop: 3, marginBottom: 7 },
  scaleLabels: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  scaleTrackLabels: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  scaleLabel: { color: '#64748b', fontSize: 10 },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 24, flexWrap: 'wrap' },
  gradeLabel: { color: '#475569', fontSize: 11, width: 34 },
  track: { height: 10, flex: 1, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'visible' },
  fill: { height: 10, backgroundColor: '#2563eb', borderRadius: 2 },
  fillMet: { backgroundColor: '#059669' },
  minimumMarker: { position: 'absolute', top: -3, width: 2, height: 16, backgroundColor: '#b45309' },
  pointsValue: { color: '#475569', fontSize: 11, fontWeight: '600', width: 54, textAlign: 'right' },
  pointsMet: { color: '#047857' },
  pointsBelow: { color: '#b45309' },
  bestLabel: { color: '#475569', fontSize: 10, width: '100%', marginLeft: 42, marginTop: -3 },
  noRequirements: { color: '#92400e', fontSize: 13, lineHeight: 19, marginTop: 8 },
});