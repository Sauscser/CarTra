import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { CbeAchievementRange } from '../../utils/cluster';

type Props = {
  rollups: NationalCbeRollup[];
  supportSubjectIds: ReadonlySet<string>;
  ranges: CbeAchievementRange[];
  rangesConfigured: boolean;
  showCumulativeDistribution?: boolean;
};

export type NationalCbeRollup = {
  id: string;
  nationGradeKey: string;
  academicYear: string;
  dimension: string;
  binKey: string;
  subjectId?: string | null;
  subjectName?: string | null;
  count: number;
  deviationSum?: number | null;
  deviationSquares?: number | null;
};

const GRADES = [7, 8, 9, 10, 11, 12] as const;
const COLORS = ['#176b87', '#38a3a5', '#84bc9c', '#f4b942', '#ee7d3b', '#cf4b36', '#9a5a75', '#554f7a'];

function describeRange(mark: number, ranges: CbeAchievementRange[]) {
  return ranges.find((range) => mark >= range.minimumMark && mark <= range.maximumMark)?.level;
}

function polarPoint(center: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: center + radius * Math.cos(radians), y: center + radius * Math.sin(radians) };
}

function makeSlicePath(center: number, radius: number, start: number, end: number) {
  if (end - start >= 359.99) return `M ${center} ${center} m 0 -${radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 -${radius * 2} Z`;
  const first = polarPoint(center, radius, start);
  const last = polarPoint(center, radius, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${center} ${center} L ${first.x} ${first.y} A ${radius} ${radius} 0 ${largeArc} 1 ${last.x} ${last.y} Z`;
}

function AchievementDistribution({ rollups, ranges }: { rollups: NationalCbeRollup[]; ranges: CbeAchievementRange[] }) {
  const levelCounts = new Map(ranges.map((range) => [range.level, 0]));
  rollups.forEach((item) => {
    const level = describeRange(Number(item.binKey), ranges);
    if (level) levelCounts.set(level, (levelCounts.get(level) || 0) + Number(item.count || 0));
  });
  const counts = ranges.map((range) => ({ level: range.level, count: levelCounts.get(range.level) || 0 }));
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  let angle = 0;

  return (
    <View style={styles.distribution}>
      {total ? (
        <Svg width={176} height={176} viewBox="0 0 176 176" accessibilityLabel="CBE achievement level distribution">
          {counts.map((item, index) => {
            const start = angle;
            const end = angle + (item.count / total) * 360;
            angle = end;
            if (!item.count) return null;
            return <Path key={item.level} d={makeSlicePath(88, 78, start, end)} fill={COLORS[index]} stroke="#fff" strokeWidth={1.4} />;
          })}
          <Circle cx={88} cy={88} r={43} fill="#fff" />
          <SvgText x={88} y={84} textAnchor="middle" fill="#263d43" fontSize={23} fontWeight="700">{total}</SvgText>
          <SvgText x={88} y={102} textAnchor="middle" fill="#607377" fontSize={10}>subject marks</SvgText>
        </Svg>
      ) : (
        <View style={styles.emptyPie}><Text style={styles.emptyPieText}>No recorded marks</Text></View>
      )}
      <View style={styles.legend}>
        {counts.map((item, index) => (
          <View key={item.level} style={styles.legendRow}>
            <View style={[styles.legendSwatch, { backgroundColor: COLORS[index] }]} />
            <Text style={styles.legendLabel}>{item.level}</Text>
            <Text style={styles.legendValue}>{total ? `${item.count}  ${Math.round((item.count / total) * 100)}%` : '0'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type Curve = { label: string; count: number; sum: number; squares: number; min: number; max: number; color: string };

function standardNormalCdf(value: number) {
  const absoluteValue = Math.abs(value);
  const t = 1 / (1 + 0.2316419 * absoluteValue);
  const tail = 0.3989422804014327 * Math.exp(-0.5 * absoluteValue ** 2) *
    t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return value >= 0 ? 1 - tail : tail;
}

function DeviationCurveChart({
  curves,
  kind,
}: {
  curves: Curve[];
  kind: 'density' | 'relative' | 'cumulative';
}) {
  const width = 344;
  const height = 258;
  const left = 54;
  const right = 10;
  const top = 20;
  const bottom = 46;
  const validCurves = curves.filter((curve) => curve.count > 0 && Number.isFinite(curve.sum) && Number.isFinite(curve.squares));
  if (!validCurves.length) return <Text style={styles.noData}>No complete target and achieved records for this grade.</Text>;

  const low = Math.floor(Math.min(...validCurves.map((curve) => curve.min)) / 25) * 25 - 25;
  const high = Math.max(low + 50, Math.ceil(Math.max(...validCurves.map((curve) => curve.max)) / 25) * 25 + 25);
  const samples = 60;
  const plotBottom = height - bottom;
  const plotHeight = plotBottom - top;
  const x = (value: number) => left + ((value - low) / (high - low)) * (width - left - right);
  const stats = validCurves.map((curve) => {
    const mean = curve.sum / curve.count;
    const variance = Math.max(0, curve.squares / curve.count - mean ** 2);
    const deviation = Math.max(Math.sqrt(variance), 1);
    return { ...curve, mean, deviation, densityPeak: 1 / (deviation * Math.sqrt(2 * Math.PI)) };
  });
  const yMax = kind === 'density'
    ? Math.max(...stats.map((curve) => curve.densityPeak))
    : kind === 'cumulative' ? 100 : 1;
  const y = (value: number) => plotBottom - (value / yMax) * plotHeight;
  const paths = stats.map((curve) => {
    const points = Array.from({ length: samples + 1 }, (_, index) => {
      const value = low + ((high - low) * index) / samples;
      const z = (value - curve.mean) / curve.deviation;
      const relativeHeight = Math.exp(-0.5 * z * z);
      const plotValue = kind === 'density'
        ? curve.densityPeak * relativeHeight
        : kind === 'cumulative' ? standardNormalCdf(z) * 100 : relativeHeight;
      return { x: x(value), y: y(plotValue) };
    });
    return {
      ...curve,
      path: points.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' '),
    };
  });
  const xTicks = Array.from({ length: 5 }, (_, index) => low + ((high - low) * index) / 4);
  if (low < 0 && high > 0 && !xTicks.some((tick) => Math.abs(tick) < (high - low) / 100)) xTicks.push(0);
  xTicks.sort((first, second) => first - second);
  const yTicks = Array.from({ length: 5 }, (_, index) => (yMax * index) / 4);
  const densityPrecision = yMax >= 0.1 ? 3 : yMax >= 0.01 ? 4 : 5;
  const formatY = (value: number) => kind === 'density'
    ? value.toFixed(densityPrecision)
    : kind === 'cumulative' ? `${value.toFixed(0)}%` : value.toFixed(2);
  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${Number(value.toFixed(1))}%`;
  const title = kind === 'density'
    ? 'Gaussian probability density'
    : kind === 'cumulative' ? 'Cumulative modeled probability' : 'Peak-normalized relative height';
  const explanation = kind === 'density'
    ? 'X is each achieved score’s percent difference from its matching learner target or course minimum. This fitted Gaussian density is calculated from the collected deviations’ count, mean, and standard deviation. Y is density per percentage point; the area under a section of the curve represents its modeled probability, not a learner count.'
    : kind === 'cumulative'
      ? 'At each x-value, Y is the fitted model’s estimated percentage of deviations at or below x. At x = 0%, it estimates the percentage at or below the benchmark.'
      : 'X is each achieved score’s percent difference from its matching learner target or course minimum. This is the same fitted shape scaled so its peak is 1.00. Y shows height relative to that curve’s peak, making shapes easy to compare; it is not probability, learner count, or percentage of learners.';

  return (
    <View style={styles.curveWrap}>
      <Text style={styles.curveTitle}>{title}</Text>
      <Text style={styles.chartNote}>{explanation}</Text>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {yTicks.map((tick) => (
          <React.Fragment key={`y-${tick}`}>
            <Path d={`M ${left} ${y(tick)} H ${width - right}`} stroke="#d9e3df" strokeWidth={1} />
            <SvgText x={left - 7} y={y(tick) + 3} textAnchor="end" fill="#52646a" fontSize={9}>{formatY(tick)}</SvgText>
          </React.Fragment>
        ))}
        {low < 0 && high > 0 ? <Path d={`M ${x(0)} ${top} V ${plotBottom}`} stroke="#73878b" strokeWidth={1} strokeDasharray="3 3" /> : null}
        <Path d={`M ${left} ${top} V ${plotBottom} H ${width - right}`} fill="none" stroke="#52646a" strokeWidth={1} />
        {xTicks.map((tick, index) => (
          <React.Fragment key={`x-${index}`}>
            <Path d={`M ${x(tick)} ${plotBottom} v 4`} stroke="#52646a" strokeWidth={1} />
            <SvgText x={x(tick)} y={plotBottom + 16} textAnchor="middle" fill="#52646a" fontSize={9}>{formatPercent(tick)}</SvgText>
          </React.Fragment>
        ))}
        <SvgText x={(left + width - right) / 2} y={height - 3} textAnchor="middle" fill="#52646a" fontSize={9}>Achieved vs benchmark (%)</SvgText>
        {paths.map((curve) => <Path key={curve.label} d={curve.path} fill="none" stroke={curve.color} strokeWidth={3} />)}
      </Svg>
      <View style={styles.curveLegend}>
        {paths.map((curve) => (
          <View key={curve.label} style={styles.curveLegendItem}>
            <View style={[styles.curveSwatch, { backgroundColor: curve.color }]} />
            <Text style={styles.curveLegendText}>
              {curve.label} · n={curve.count} · mean={formatPercent(curve.mean)} · SD={curve.deviation.toFixed(1)}%
              {kind === 'cumulative' ? ` · model at 0%: ${(standardNormalCdf((0 - curve.mean) / curve.deviation) * 100).toFixed(1)}%` : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function NationalCbeAnalytics({
  rollups,
  supportSubjectIds,
  ranges,
  rangesConfigured,
  showCumulativeDistribution = false,
}: Props) {
  const [grade, setGrade] = useState<number>(7);
  const [view, setView] = useState<'subjects' | 'clusters'>('subjects');
  const [subjectId, setSubjectId] = useState('all');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [academicYear, setAcademicYear] = useState('all');

  const gradeRows = rollups.filter((item) => item.count > 0 && item.nationGradeKey.endsWith(`#${grade}`));
  const academicYears = Array.from(new Set(gradeRows.map((item) => item.academicYear).filter(Boolean))).sort((left, right) => right.localeCompare(left));
  const selectedRows = gradeRows.filter((item) => academicYear === 'all' || item.academicYear === academicYear);
  const markRows = selectedRows.filter((item) => item.dimension.startsWith('MARK#') && (grade < 10 || !supportSubjectIds.has(String(item.subjectId || ''))));
  const subjectsById = new Map<string, string>();
  markRows.forEach((item) => {
    if (item.subjectId) subjectsById.set(item.subjectId, item.subjectName || item.subjectId);
  });
  const searchableSubjects = useMemo(() => Array.from(subjectsById, ([id, name]) => ({ id, name }))
    .filter((subject) => subject.name.toLowerCase().includes(subjectSearch.trim().toLowerCase()))
    .sort((left, right) => left.name.localeCompare(right.name))
    .slice(0, 20), [rollups, supportSubjectIds, grade, academicYear, subjectSearch]);
  const selectedMarks = markRows.filter((item) => subjectId === 'all' || item.subjectId === subjectId);
  const assessedRecords = selectedMarks.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const subjectDeviationRows = selectedRows.filter((item) => subjectId === 'all'
    ? item.dimension.startsWith('SUBJECT_DEVIATION#') && (grade < 10 || !supportSubjectIds.has(String(item.subjectId || '')))
    : item.dimension === `SUBJECT_DEVIATION#${subjectId}`);
  const clusterPersonalRows = selectedRows.filter((item) => item.dimension === 'CLUSTER_PERSONAL_DEVIATION_EXCLUDING_SUPPORT');
  const clusterTertiaryRows = selectedRows.filter((item) => item.dimension === 'CLUSTER_TERTIARY_DEVIATION_EXCLUDING_SUPPORT');
  const buildCurve = (rows: NationalCbeRollup[], label: string, color: string): Curve => {
    const count = rows.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const sum = rows.reduce((total, item) => total + Number(item.deviationSum || 0), 0);
    const squares = rows.reduce((total, item) => total + Number(item.deviationSquares || 0), 0);
    const values = rows.map((item) => item.binKey === '500+' ? 500 : Number(item.binKey)).filter(Number.isFinite);
    return { label, color, count, sum, squares, min: values.length ? Math.min(...values) : 0, max: values.length ? Math.max(...values) : 0 };
  };
  const deviations = view === 'subjects'
    ? [buildCurve(subjectDeviationRows, subjectId === 'all' ? 'Subject targets' : `${subjectsById.get(subjectId) || 'Subject'} target`, '#176b87')]
    : [
      buildCurve(clusterPersonalRows, 'Learner career targets', '#176b87'),
      buildCurve(clusterTertiaryRows, 'Tertiary course minimums', '#e17a38'),
    ];
  const meanDeviation = deviations[0].count ? deviations[0].sum / deviations[0].count : null;
  const comparisonCount = deviations[0].count;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>CBE INTELLIGENCE</Text>
        <Text style={styles.title}>Performance by grade</Text>
        <Text style={styles.subtitle}>Annual records, historical learner profile marks, and institution-defined course benchmarks.</Text>
      </View>

      <View style={styles.kpis}>
        <View style={styles.kpi}><Text style={styles.kpiValue}>{assessedRecords.toLocaleString()}</Text><Text style={styles.kpiLabel}>subject marks</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiValue}>{subjectsById.size.toLocaleString()}</Text><Text style={styles.kpiLabel}>subjects represented</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiValue}>{clusterPersonalRows.reduce((sum, item) => sum + Number(item.count || 0), 0).toLocaleString()}</Text><Text style={styles.kpiLabel}>career comparisons</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grade level</Text>
        <View style={styles.gradeRow}>
          {GRADES.map((item) => (
            <TouchableOpacity key={item} onPress={() => setGrade(item)} style={[styles.gradeButton, grade === item && styles.gradeButtonActive]} accessibilityRole="button" accessibilityState={{ selected: grade === item }}>
              <Text style={[styles.gradeText, grade === item && styles.gradeTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic year</Text>
        <View style={styles.gradeRow}>
          {[{ value: 'all', label: 'All years' }, ...academicYears.map((year) => ({ value: year, label: year }))].map((item) => (
            <TouchableOpacity key={item.value} onPress={() => setAcademicYear(item.value)} style={[styles.periodButton, academicYear === item.value && styles.periodButtonActive]} accessibilityRole="button" accessibilityState={{ selected: academicYear === item.value }}>
              <Text style={[styles.periodText, academicYear === item.value && styles.periodTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievement-level distribution</Text>
        <Text style={styles.sectionCaption}>Annual records and historical learner profile marks · Grade {grade} · {assessedRecords.toLocaleString()} subject marks</Text>
        {gradeRows.some((item) => item.academicYear === 'Not recorded') ? (
          <Text style={styles.noData}>Some historical profile marks have no academic year recorded. The “Not recorded” filter keeps them separate from year-stamped annual records.</Text>
        ) : null}
        {!rangesConfigured ? <Text style={styles.noData}>Configured CBE achievement ranges are unavailable; this chart currently uses the default bands.</Text> : null}
        <AchievementDistribution rollups={selectedMarks} ranges={ranges} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deviation distributions</Text>
        <View style={styles.modeRow}>
          {([
            { key: 'subjects' as const, label: 'Subject targets' },
            { key: 'clusters' as const, label: 'Career clusters' },
          ]).map((item) => (
            <TouchableOpacity key={item.key} onPress={() => setView(item.key)} style={[styles.modeButton, view === item.key && styles.modeButtonActive]}>
              <Text style={[styles.modeText, view === item.key && styles.modeTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {view === 'subjects' ? (
          <>
            <TextInput
              value={subjectSearch}
              onChangeText={setSubjectSearch}
              placeholder="Filter subjects"
              placeholderTextColor="#48585b"
              style={styles.search}
              accessibilityLabel="Filter subjects"
            />
            <View style={styles.subjectFilters}>
              <TouchableOpacity style={[styles.subjectChip, subjectId === 'all' && styles.subjectChipActive]} onPress={() => setSubjectId('all')}>
                <Text style={[styles.subjectChipText, subjectId === 'all' && styles.subjectChipTextActive]}>All subjects</Text>
              </TouchableOpacity>
              {searchableSubjects.map((subject) => (
                <TouchableOpacity key={subject.id} style={[styles.subjectChip, subjectId === subject.id && styles.subjectChipActive]} onPress={() => setSubjectId(subject.id)}>
                  <Text style={[styles.subjectChipText, subjectId === subject.id && styles.subjectChipTextActive]}>{subject.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}
        <DeviationCurveChart curves={deviations} kind="density" />
        <DeviationCurveChart curves={deviations} kind="relative" />
        {showCumulativeDistribution ? <DeviationCurveChart curves={deviations} kind="cumulative" /> : null}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{view === 'subjects' ? 'Subject records plotted' : 'Learner-grade comparisons plotted'}</Text>
          <Text style={styles.summaryValue}>{comparisonCount.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Mean learner-target deviation</Text>
          <Text style={styles.summaryValue}>{meanDeviation === null ? 'N/A' : `${meanDeviation > 0 ? '+' : ''}${meanDeviation.toFixed(1)}%`}</Text>
        </View>
        {view === 'clusters' && !clusterPersonalRows.length ? <Text style={styles.noData}>No complete annual course-cluster comparisons are available for Grade {grade}.</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  header: { backgroundColor: '#153f4a', padding: 16, borderRadius: 6 },
  kicker: { color: '#83cec4', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  subtitle: { color: '#d2e5e2', fontSize: 12, lineHeight: 18, marginTop: 4 },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpi: { flexGrow: 1, flexBasis: '30%', minWidth: 96, padding: 11, backgroundColor: '#edf3ef', borderLeftWidth: 3, borderLeftColor: '#d18b3f' },
  kpiValue: { color: '#173d46', fontSize: 20, fontWeight: '800' },
  kpiLabel: { color: '#52646a', fontSize: 10, marginTop: 2 },
  section: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#d8e1dc' },
  sectionTitle: { color: '#173d46', fontSize: 15, fontWeight: '800' },
  sectionCaption: { color: '#617176', fontSize: 11, marginTop: 3 },
  gradeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  gradeButton: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e7eeea', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  gradeButtonActive: { backgroundColor: '#173f4a', borderBottomColor: '#edaa56' },
  gradeText: { color: '#34484d', fontSize: 13, fontWeight: '700' },
  gradeTextActive: { color: '#fff' },
  periodButton: { paddingVertical: 7, paddingHorizontal: 10, backgroundColor: '#e7eeea', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  periodButtonActive: { backgroundColor: '#173f4a', borderBottomColor: '#edaa56' },
  periodText: { color: '#34484d', fontSize: 11, fontWeight: '700' },
  periodTextActive: { color: '#fff' },
  distribution: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  emptyPie: { width: 176, height: 176, borderRadius: 88, backgroundColor: '#edf3ef', alignItems: 'center', justifyContent: 'center' },
  emptyPieText: { color: '#617176', fontSize: 11 },
  legend: { flexGrow: 1, minWidth: 130, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendLabel: { flex: 1, color: '#43565b', fontSize: 11, fontWeight: '700' },
  legendValue: { color: '#173d46', fontSize: 11, fontWeight: '700' },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 9 },
  modeButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#e7eeea', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  modeButtonActive: { backgroundColor: '#173f4a', borderBottomColor: '#edaa56' },
  modeText: { color: '#34484d', fontSize: 12, fontWeight: '700' },
  modeTextActive: { color: '#fff' },
  search: { minHeight: 38, borderWidth: 1, borderColor: '#c4d0cb', backgroundColor: '#fff', paddingHorizontal: 10, marginTop: 9, color: '#222', fontWeight: 'bold' },
  subjectFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 },
  subjectChip: { paddingVertical: 6, paddingHorizontal: 9, backgroundColor: '#e7eeea', borderRadius: 4 },
  subjectChipActive: { backgroundColor: '#d4e9e4', borderWidth: 1, borderColor: '#2e7a77' },
  subjectChipText: { color: '#34484d', fontSize: 10, fontWeight: '700' },
  subjectChipTextActive: { color: '#155655' },
  curveWrap: { marginTop: 12, paddingTop: 10, alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e3e9e5' },
  curveTitle: { color: '#173d46', fontSize: 13, fontWeight: '800', alignSelf: 'stretch', marginBottom: 4 },
  curveLegend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingHorizontal: 8 },
  curveLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  curveSwatch: { width: 13, height: 3 },
  curveLegendText: { color: '#43565b', fontSize: 10 },
  chartNote: { color: '#718084', fontSize: 10, lineHeight: 15, marginTop: 7, alignSelf: 'stretch' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e3e9e5' },
  summaryLabel: { color: '#52646a', fontSize: 11 },
  summaryValue: { color: '#173d46', fontSize: 12, fontWeight: '800' },
  noData: { color: '#7b4e23', fontSize: 12, lineHeight: 17, marginTop: 8 },
});