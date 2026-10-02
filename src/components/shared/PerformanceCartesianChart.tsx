import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

type ChartPoint = {
  label: string;
  value?: number | null;
  target?: number | null;
  learnerTarget?: number | null;
  tertiaryTarget?: number | null;
};

type Props = {
  series: ChartPoint[];
  axisGrades?: readonly number[];
  nationalRequirement?: number | null;
};

const SERIES = [
  { key: 'target', label: 'Target', color: '#93c5fd' },
  { key: 'value', label: 'Achieved', color: '#1d4ed8' },
  { key: 'learnerTarget', label: 'Learner target', color: '#0f766e' },
  { key: 'tertiaryTarget', label: 'Tertiary minimum (ME2)', color: '#b45309' },
] as const;

export default function PerformanceCartesianChart({ series, axisGrades = [7, 8, 9, 10, 11, 12], nationalRequirement }: Props) {
  const chartWidth = Math.max(300, Math.min(420, Dimensions.get('window').width - 48));
  const chartHeight = 520;
  const paddingLeft = 32;
  const paddingRight = 18;
  const paddingTop = 12;
  const paddingBottom = 42;
  const majorStep = 10;
  const values = series.flatMap((point) => [point.value, point.target, point.learnerTarget, point.tertiaryTarget])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0);
  if (typeof nationalRequirement === 'number' && Number.isFinite(nationalRequirement) && nationalRequirement >= 0) values.push(nationalRequirement);
  const chartMaxY = Math.max(100, ...values);
  const yMajorTicks = Array.from({ length: Math.floor(chartMaxY / majorStep) + 1 }, (_, index) => index * majorStep);
  const yMinorTicks = Array.from({ length: Math.floor(chartMaxY) + 1 }, (_, index) => index);
  const axisLineY = chartHeight - paddingBottom;
  const gradeToX = (grade: number) => {
    const index = axisGrades.indexOf(grade);
    return paddingLeft + (Math.max(index, 0) / Math.max(axisGrades.length - 1, 1)) * (chartWidth - paddingLeft - paddingRight);
  };
  const valueToY = (value: number) => axisLineY - (Math.min(value, chartMaxY) / chartMaxY) * (chartHeight - paddingTop - paddingBottom);
  const plotPoints = series.filter((point) => axisGrades.includes(Number(point.label)));
  const drawLine = (key: 'value' | 'target' | 'learnerTarget' | 'tertiaryTarget', color: string) => {
    const points = plotPoints
      .filter((point) => typeof point[key] === 'number' && Number.isFinite(point[key]) && Number(point[key]) >= 0)
      .slice()
      .sort((left, right) => Number(left.label) - Number(right.label));

    return points.slice(1).map((point, index) => {
      const previous = points[index];
      const previousGrade = Number(previous.label);
      const grade = Number(point.label);
      if (grade - previousGrade !== 1 || (previousGrade === 9 && grade === 10)) return null;
      const x1 = gradeToX(previousGrade);
      const x2 = gradeToX(grade);
      const y1 = valueToY(Number(previous[key]));
      const y2 = valueToY(Number(point[key]));
      const length = Math.hypot(x2 - x1, y2 - y1) || 1;
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      return <View key={`${key}-${previousGrade}-${grade}`} style={{ position: 'absolute', left: (x1 + x2) / 2 - length / 2, top: (y1 + y2) / 2 - 1.5, width: length, height: 3, backgroundColor: color, borderRadius: 999, transform: [{ rotate: `${angle}deg` }] }} />;
    });
  };
  const requirementGrades = nationalRequirement !== null && nationalRequirement !== undefined && Number.isFinite(nationalRequirement)
    ? axisGrades.filter((grade) => grade >= 10 && grade <= 12)
    : [];

  return (
    <View style={styles.chartCard}>
      <View style={styles.legendRow}>
        {SERIES.map(({ key, label, color }) => {
          const present = key === 'value' || key === 'target' || plotPoints.some((point) => typeof point[key] === 'number' && Number.isFinite(point[key]));
          return present ? <View key={key} style={styles.legendItem}><View style={[styles.swatch, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View> : null;
        })}
        {requirementGrades.length > 0 ? <View style={styles.legendItem}><View style={[styles.swatch, { backgroundColor: '#22c55e' }]} /><Text style={styles.legendText}>National requirement</Text></View> : null}
      </View>
      <View style={{ width: chartWidth, height: chartHeight }}>
        {yMinorTicks.map((tick) => {
          const y = valueToY(tick);
          const major = tick === 1 || tick % majorStep === 0;
          return <View key={`minor-${tick}`} style={[styles.horizontalGrid, { left: paddingLeft, right: paddingRight, top: y, backgroundColor: major ? '#94a3b8' : '#dbeafe' }]} />;
        })}
        {yMajorTicks.map((tick) => <Text key={`y-${tick}`} style={[styles.yLabel, { top: valueToY(tick) - 8 }]}>{tick}</Text>)}
        <View style={[styles.axisLine, { left: paddingLeft, right: paddingRight, top: axisLineY }]} />
        {axisGrades.map((grade) => {
          const x = gradeToX(grade);
          return <View key={`x-grid-${grade}`} style={[styles.verticalGrid, { left: x, top: paddingTop, bottom: paddingBottom }]} />;
        })}
        <View style={{ position: 'absolute', left: 0, top: 0, width: chartWidth, height: chartHeight }}>
          {drawLine('target', '#93c5fd')}
          {drawLine('value', '#1d4ed8')}
          {drawLine('learnerTarget', '#0f766e')}
          {drawLine('tertiaryTarget', '#b45309')}
          {plotPoints.flatMap((point) => SERIES.map(({ key, color }) => {
            const mark = point[key];
            if (typeof mark !== 'number' || !Number.isFinite(mark) || mark < 0) return null;
            return <View key={`${key}-${point.label}`} style={[styles.dot, { backgroundColor: color, left: gradeToX(Number(point.label)) - 4, top: valueToY(mark) - 4 }]} />;
          }))}
          {requirementGrades.map((grade) => <View key={`national-${grade}`} style={[styles.dot, { backgroundColor: '#22c55e', left: gradeToX(grade) - 4, top: valueToY(Number(nationalRequirement)) - 4 }]} />)}
          {requirementGrades.slice(1).map((grade, index) => {
            const previous = requirementGrades[index];
            const x1 = gradeToX(previous);
            const x2 = gradeToX(grade);
            const y = valueToY(Number(nationalRequirement));
            return <View key={`national-line-${grade}`} style={{ position: 'absolute', left: x1, top: y - 1.5, width: x2 - x1, height: 3, backgroundColor: '#22c55e' }} />;
          })}
        </View>
        {axisGrades.map((grade) => <Text key={`grade-${grade}`} style={[styles.xLabel, { left: gradeToX(grade) - 10, top: chartHeight - 12 }]}>{grade}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dbeafe', borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 4 },
  legendText: { color: '#374151', fontSize: 11, fontWeight: '700' },
  horizontalGrid: { position: 'absolute', height: 1 },
  verticalGrid: { position: 'absolute', width: 1, backgroundColor: '#dbeafe' },
  yLabel: { position: 'absolute', left: 6, width: 20, textAlign: 'right', color: '#374151', fontSize: 10, fontWeight: '700' },
  xLabel: { position: 'absolute', width: 20, textAlign: 'center', color: '#374151', fontSize: 10, fontWeight: '700' },
  axisLine: { position: 'absolute', height: 1, backgroundColor: '#475569' },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
});
