import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import calculateHistoricalClusterSeries from '../../utils/cluster';

const GRADES = [7, 8, 9, 10, 11, 12] as const;

type ClusterPoint = {
  label: string;
  value: number;
  target?: number;
  learnerTarget?: number;
  tertiaryTarget?: number;
};

type Props = {
  learner: any;
  profile: any;
};

export default function LearnerClusterTrendGraph({ learner, profile }: Props) {
  const series = calculateHistoricalClusterSeries(learner, profile || {}) as ClusterPoint[];
  const plottedGrades = new Set(series.filter((point) => Number.isFinite(point.value)).map((point) => Number(point.label)));
  const missingGrades = GRADES.filter((grade) => !plottedGrades.has(grade));
  const seniorGrades = GRADES.filter((grade) => grade >= 10);
  const missingLearnerTargets = seniorGrades.filter((grade) => {
    const point = series.find((item) => Number(item.label) === grade);
    return !Number.isFinite(point?.learnerTarget);
  });
  const missingTertiaryTargets = seniorGrades.filter((grade) => {
    const point = series.find((item) => Number(item.label) === grade);
    return !Number.isFinite(point?.tertiaryTarget);
  });
  const width = Math.max(300, Math.min(420, Dimensions.get('window').width - 72));
  const height = 300;
  const left = 36;
  const right = 12;
  const top = 16;
  const bottom = 34;
  const maximum = Math.max(100, ...series.flatMap((point) => [point.value, point.target ?? 0, point.learnerTarget ?? 0, point.tertiaryTarget ?? 0]), 0);
  const x = (grade: number) => left + (GRADES.indexOf(grade as (typeof GRADES)[number]) / (GRADES.length - 1)) * (width - left - right);
  const y = (value: number) => height - bottom - (Math.min(value, maximum) / maximum) * (height - top - bottom);

  const drawLine = (key: 'value' | 'target' | 'learnerTarget' | 'tertiaryTarget', color: string) => {
    const points = series
      .filter((point) => Number.isFinite(point[key]))
      .slice()
      .sort((first, second) => Number(first.label) - Number(second.label));

    return points.slice(1).map((point, index) => {
      const previous = points[index];
      const previousGrade = Number(previous.label);
      const grade = Number(point.label);
      if (grade - previousGrade !== 1 || (previousGrade === 9 && grade === 10)) return null;

      const startX = x(previousGrade);
      const endX = x(grade);
      const startY = y(Number(previous[key]));
      const endY = y(Number(point[key]));
      const distance = Math.hypot(endX - startX, endY - startY) || 1;
      const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;
      return (
        <View
          key={`${key}-${previousGrade}-${grade}`}
          style={{
            position: 'absolute',
            left: (startX + endX) / 2 - distance / 2,
            top: (startY + endY) / 2 - 1.5,
            width: distance,
            height: 3,
            borderRadius: 2,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cluster performance by grade</Text>
      <Text style={styles.caption}>Grades 7–9 show mean subject score (MSS); Grades 10–12 show course cluster points. The two phases are not connected.</Text>
      {series.length > 0 ? (
        <View style={[styles.chart, { width, height }]}>
          {Array.from({ length: Math.floor(maximum / 10) + 1 }, (_, index) => index * 10).map((tick) => (
            <View key={`grid-${tick}`} style={[styles.gridLine, { top: y(tick), left, right, backgroundColor: tick === 0 || tick % 20 === 0 ? '#94a3b8' : '#e2e8f0' }]} />
          ))}
          {Array.from({ length: Math.floor(maximum / 10) + 1 }, (_, index) => index * 10).map((tick) => (
            <Text key={`axis-${tick}`} style={[styles.axisValue, { top: y(tick) - 7 }]}>{tick}</Text>
          ))}
          {GRADES.map((grade) => (
            <Text key={`grade-${grade}`} style={[styles.gradeLabel, { left: x(grade) - 10, top: height - bottom + 8 }]}>{grade}</Text>
          ))}
          {drawLine('target', '#93c5fd')}
          {drawLine('value', '#1d4ed8')}
          {drawLine('learnerTarget', '#0f766e')}
          {drawLine('tertiaryTarget', '#b45309')}
          {([
            { key: 'target' as const, color: '#93c5fd' },
            { key: 'value' as const, color: '#1d4ed8' },
            { key: 'learnerTarget' as const, color: '#0f766e' },
            { key: 'tertiaryTarget' as const, color: '#b45309' },
          ]).flatMap(({ key, color }) => series.filter((point) => Number.isFinite(point[key])).map((point) => (
            <View key={`${key}-dot-${point.label}`} style={[styles.dot, { backgroundColor: color, left: x(Number(point.label)) - 4, top: y(Number(point[key])) - 4 }]} />
          )))}
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: '#93c5fd' }]} /><Text style={styles.legendText}>Target MSS (Grades 7–9)</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: '#1d4ed8' }]} /><Text style={styles.legendText}>Achieved MSS / course cluster points</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: '#0f766e' }]} /><Text style={styles.legendText}>Learner target (Grades 10–12)</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: '#b45309' }]} /><Text style={styles.legendText}>Tertiary minimum (ME2 floor)</Text></View>
          </View>
        </View>
      ) : null}
      {missingGrades.length > 0 ? (
        <Text style={styles.missing}>Cluster data missing for Grades {missingGrades.join(', ')}. Those grades are not plotted.</Text>
      ) : null}
      {missingLearnerTargets.length > 0 ? (
        <Text style={styles.missing}>Learner target data missing for Grades {missingLearnerTargets.join(', ')}. The learner-target line is not plotted for those grades.</Text>
      ) : null}
      {missingTertiaryTargets.length > 0 ? (
        <Text style={styles.missing}>Tertiary benchmark data missing for Grades {missingTertiaryTargets.join(', ')}. The tertiary line is not plotted for those grades.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, marginBottom: 12 },
  heading: { color: '#0f172a', fontSize: 15, fontWeight: '700' },
  caption: { color: '#475569', fontSize: 12, lineHeight: 17, marginTop: 3 },
  chart: { marginTop: 8, borderWidth: 1, borderColor: '#dbe3ea', borderRadius: 6, backgroundColor: '#fff', position: 'relative' },
  gridLine: { position: 'absolute', height: 1 },
  axisValue: { position: 'absolute', left: 3, width: 27, textAlign: 'right', color: '#475569', fontSize: 10 },
  gradeLabel: { position: 'absolute', width: 20, textAlign: 'center', color: '#334155', fontSize: 11 },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  legend: { position: 'absolute', left: 38, right: 8, top: 3, flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 10, height: 3, borderRadius: 2 },
  legendText: { color: '#475569', fontSize: 9 },
  missing: { marginTop: 6, color: '#92400e', fontSize: 12, lineHeight: 17 },
});