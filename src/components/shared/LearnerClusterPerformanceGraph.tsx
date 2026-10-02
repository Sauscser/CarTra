import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import calculateHistoricalClusterSeries, { getMissingClusterGrades } from '../../utils/cluster';
import { parseLearnerSupportProfile } from '../../utils/learnerCareer';
import CourseSubjectPointsGraph from './CourseSubjectPointsGraph';
import PerformanceCartesianChart from './PerformanceCartesianChart';

type Props = {
  learner: any;
  profile: any;
  targetCareer?: string | null;
};

export default function LearnerClusterPerformanceGraph({ learner, profile, targetCareer }: Props) {
  const supportProfile = parseLearnerSupportProfile(profile?.supportProfile) || {};
  const selectedSubjects = Array.isArray(profile?.selectedSubjects)
    ? profile.selectedSubjects
    : Array.isArray(supportProfile.selectedSubjects) ? supportProfile.selectedSubjects : [];
  const historicalSelectedSubjects = Array.isArray(profile?.historicalSelectedSubjects)
    ? profile.historicalSelectedSubjects
    : Array.isArray(supportProfile.historicalSelectedSubjects) ? supportProfile.historicalSelectedSubjects : [];
  const normalizedProfile = {
    ...supportProfile,
    ...profile,
    clusterRequirements: profile?.clusterRequirements || supportProfile.clusterRequirements || profile?.courseClusterRequirements,
    selectedSubjects,
    historicalSelectedSubjects,
  };
  const series = calculateHistoricalClusterSeries(learner, normalizedProfile, selectedSubjects);
  const valid = series.filter((point: any) => Number.isFinite(Number(point.value)));
  const missingGrades = getMissingClusterGrades(series);
  const missingLearnerTargets = [10, 11, 12].filter((grade) => !Number.isFinite(Number(series.find((point: any) => Number(point.label) === grade)?.learnerTarget)));
  const missingTertiaryTargets = [10, 11, 12].filter((grade) => !Number.isFinite(Number(series.find((point: any) => Number(point.label) === grade)?.tertiaryTarget)));
  const averageCluster = valid.length
    ? Math.round(valid.reduce((sum: number, point: any) => sum + Number(point.value || 0), 0) / valid.length)
    : null;
  const averageDeviation = valid.length
    ? Math.round(valid.reduce((sum: number, point: any) => sum + Number(point.deviation || 0), 0) / valid.length)
    : null;
  const resolvedTargetCareer = targetCareer || normalizedProfile.targetCareer || 'Not set';

  return (
    <View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Target career</Text>
        <Text style={styles.summaryValue}>{resolvedTargetCareer}</Text>
      </View>
      <PerformanceCartesianChart series={series} />
      {missingGrades.length > 0 ? <Text style={styles.missing}>Cluster data missing for Grades {missingGrades.join(', ')}. Those grades are not plotted.</Text> : null}
      {missingLearnerTargets.length > 0 ? <Text style={styles.missing}>Learner target data missing for Grades {missingLearnerTargets.join(', ')}. That target line is not plotted for those grades.</Text> : null}
      {missingTertiaryTargets.length > 0 ? <Text style={styles.missing}>Tertiary benchmark data missing for Grades {missingTertiaryTargets.join(', ')}. That line is not plotted for those grades.</Text> : null}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Overall cluster points by year</Text>
        {valid.length ? <Text style={styles.summaryValue}>{valid.map((point: any) => `Grade ${point.label}: ${point.value}`).join(' • ')}</Text> : <Text style={styles.summaryValue}>No valid cluster points recorded yet.</Text>}
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Average overall cluster points</Text>
        <Text style={styles.summaryValue}>{averageCluster === null ? 'N/A' : averageCluster}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Average deviation</Text>
        <Text style={styles.summaryValue}>{averageDeviation === null ? 'N/A' : `${averageDeviation}%`}</Text>
      </View>
      <CourseSubjectPointsGraph learner={learner} profile={normalizedProfile} showTrendGraph={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 14, padding: 12, marginBottom: 10 },
  summaryTitle: { color: '#1f2937', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  summaryValue: { color: '#111827', fontSize: 14 },
  missing: { color: '#92400e', fontSize: 12, lineHeight: 17, marginTop: 4 },
});
