export const GRADE_AXIS = [7, 8, 9, 10, 11, 12] as const;

const CBE_SUBJECT_POINTS_MAX = 8;
const CBE_TOP_SUBJECT_COUNT = 7;
const CBE_ATTEMPTED_POINTS_MAX = CBE_SUBJECT_POINTS_MAX * CBE_TOP_SUBJECT_COUNT;

type CourseClusterSubjectRequirement = { subjectId: string; operator: 'AND' | 'OR'; minimumPoints?: number; subjectName?: string };

export type CourseClusterRequirements = {
  version: 1 | 2 | 3;
  pointScale?: 'CBE_8';
  requiredSubjectIds: string[];
  alternativeSubjectIds: string[];
  subjectSequence?: CourseClusterSubjectRequirement[];
};

export function getCbeAchievementLevel(points: number) {
  const labels: Record<number, string> = {
    1: 'BE2',
    2: 'BE1',
    3: 'AE2',
    4: 'AE1',
    5: 'ME2',
    6: 'ME1',
    7: 'EE2',
    8: 'EE1',
  };
  return labels[points] || 'Not assessed';
}

export function normalizeCourseSubjectMinimum(value: unknown) {
  const minimum = Number(value);
  if (!Number.isInteger(minimum) || minimum < 1) return undefined;
  return minimum <= CBE_SUBJECT_POINTS_MAX ? minimum : undefined;
}

export function parseCourseClusterRequirements(value: unknown): CourseClusterRequirements | null {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const candidate = parsed as { version?: unknown; pointScale?: unknown; requiredSubjectIds?: unknown; alternativeSubjectIds?: unknown; subjectSequence?: unknown };
  if (Array.isArray(candidate.subjectSequence)) {
    const isCbeEightPointScale = candidate.pointScale === 'CBE_8' && Number(candidate.version) >= 3;
    const subjectSequence = candidate.subjectSequence
      .map((item: any): CourseClusterSubjectRequirement => ({
        subjectId: String(item?.subjectId || ''),
        operator: item?.operator === 'OR' ? 'OR' : 'AND',
        subjectName: typeof item?.subjectName === 'string' ? item.subjectName : undefined,
        minimumPoints: isCbeEightPointScale ? normalizeCourseSubjectMinimum(item?.minimumPoints) : undefined,
      }))
      .filter((item) => item.subjectId);
    if (subjectSequence.length > 0) {
      return {
        version: 3,
        pointScale: 'CBE_8',
        subjectSequence,
        requiredSubjectIds: subjectSequence.filter((item) => item.operator === 'AND').map((item) => item.subjectId),
        alternativeSubjectIds: subjectSequence.filter((item) => item.operator === 'OR').map((item) => item.subjectId),
      };
    }
  }
  const requiredSubjectIds = Array.isArray(candidate.requiredSubjectIds)
    ? candidate.requiredSubjectIds.map(String).filter(Boolean)
    : [];
  const alternativeSubjectIds = Array.isArray(candidate.alternativeSubjectIds)
    ? candidate.alternativeSubjectIds.map(String).filter(Boolean)
    : [];

  if (requiredSubjectIds.length === 0 && alternativeSubjectIds.length === 0) return null;
  return { version: 1, requiredSubjectIds, alternativeSubjectIds };
}

export function getCourseRequirementGroups(requirementsValue?: unknown): CourseClusterSubjectRequirement[][] {
  const requirements = parseCourseClusterRequirements(requirementsValue);
  if (!requirements) return [];

  const sequence: CourseClusterSubjectRequirement[] = requirements.subjectSequence || [
    ...requirements.requiredSubjectIds.map((subjectId) => ({ subjectId, operator: 'AND' as const })),
    ...requirements.alternativeSubjectIds.map((subjectId) => ({ subjectId, operator: 'OR' as const })),
  ];
  const groups: Array<typeof sequence> = [];
  sequence.forEach((item, index) => {
    if (index > 0 && sequence[index - 1].operator === 'OR' && groups.length > 0) groups[groups.length - 1].push(item);
    else groups.push([item]);
  });
  return groups;
}

export function hasCompleteCourseSubjectRequirements(requirementsValue?: unknown) {
  const requirements = parseCourseClusterRequirements(requirementsValue);
  const groups = getCourseRequirementGroups(requirements);
  return Boolean(
    requirements?.pointScale === 'CBE_8'
      && requirements.subjectSequence?.length
      && groups.length >= 1
      && groups.length <= CBE_TOP_SUBJECT_COUNT
      && requirements.subjectSequence.every((item) => Number.isInteger(item.minimumPoints) && Number(item.minimumPoints) >= 1 && Number(item.minimumPoints) <= CBE_SUBJECT_POINTS_MAX),
  );
}

export function hasCourseSubjectPointRequirements(profile: any) {
  const parsedSupportProfile = parseSupportProfileValue(profile);
  const requirements = parseCourseClusterRequirements(
    profile?.clusterRequirements || parsedSupportProfile?.clusterRequirements || profile?.courseClusterRequirements,
  );
  return getCourseRequirementGroups(requirements).length > 0;
}

export function getCourseSubjectPoints(marks: unknown) {
  const numericMarks = Number(marks);
  if (!Number.isFinite(numericMarks) || numericMarks <= 0) return 0;
  const boundedMarks = Math.min(100, numericMarks);
  if (boundedMarks <= 10) return 1;
  if (boundedMarks <= 20) return 2;
  if (boundedMarks <= 30) return 3;
  if (boundedMarks <= 40) return 4;
  if (boundedMarks <= 57) return 5;
  if (boundedMarks <= 74) return 6;
  if (boundedMarks <= 89) return 7;
  return 8;
}

function getSubjectPoints(subject: any) {
  return getCourseSubjectPoints(subject?.marksScored);
}

function hasRecordedSubjectMark(subject: any) {
  return subject?.marksScored !== null && subject?.marksScored !== undefined && subject?.marksScored !== '' && Number.isFinite(Number(subject.marksScored)) && Number(subject.marksScored) >= 0;
}

export function evaluateCourseSubjectPointRequirements(subjects: any[] = [], requirementsValue?: unknown) {
  const requirements = parseCourseClusterRequirements(requirementsValue);
  const groups = getCourseRequirementGroups(requirements);
  if (!hasCompleteCourseSubjectRequirements(requirements)) return null;

  const byId = new Map<string, any>();
  subjects.forEach((subject) => {
    const id = String(subject?.id || subject?.code || subject?.name || '').trim();
    if (id && hasRecordedSubjectMark(subject)) byId.set(id, subject);
  });

  return groups.every((group) => {
    const best = group
      .map((item) => ({ item, subject: byId.get(item.subjectId) }))
      .filter((entry) => entry.subject)
      .sort((left, right) => getSubjectPoints(right.subject) - getSubjectPoints(left.subject))[0];
    return Boolean(best && Number.isInteger(best.item.minimumPoints) && getSubjectPoints(best.subject) >= Number(best.item.minimumPoints));
  });
}

export function calculateCourseClusterScoreDetails(subjects: any[] = [], requirementsValue?: unknown) {
  const requirements = parseCourseClusterRequirements(requirementsValue);
  if (!hasCompleteCourseSubjectRequirements(requirements)) return null;

  const byId = new Map<string, any>();
  subjects.forEach((subject) => {
    const id = String(subject?.id || subject?.code || subject?.name || '').trim();
    if (id && hasRecordedSubjectMark(subject)) byId.set(id, { ...subject, marksScored: Number(subject.marksScored) });
  });

  const groups = getCourseRequirementGroups(requirements);
  const selected: any[] = [];
  groups.forEach((group) => {
    const available = group.map((item) => byId.get(item.subjectId)).filter(Boolean).sort((left, right) => getSubjectPoints(right) - getSubjectPoints(left));
    if (available.length === 0) return;
    selected.push(available[0]);
  });
  if (selected.length !== groups.length) return null;
  if (selected.length === 0) return null;

  const selectedIds = new Set(selected.map((subject) => String(subject.id || subject.code || subject.name)));
  const topOtherSubjects = Array.from(byId.values())
    .filter((subject) => !selectedIds.has(String(subject.id || subject.code || subject.name)))
    .sort((left, right) => getSubjectPoints(right) - getSubjectPoints(left))
    .slice(0, CBE_TOP_SUBJECT_COUNT - selected.length);
  const clusterPoints = selected.reduce((sum, subject) => sum + getSubjectPoints(subject), 0);
  const sevenBestSubjects = [...selected, ...topOtherSubjects];
  const sevenBestPoints = sevenBestSubjects.reduce((sum, subject) => sum + getSubjectPoints(subject), 0);
  const clusterMaximum = CBE_SUBJECT_POINTS_MAX * groups.length;
  const coursePoints = (clusterPoints / clusterMaximum) * (sevenBestPoints / CBE_ATTEMPTED_POINTS_MAX) * clusterMaximum;
  return {
    points: Math.round(coursePoints * 100) / 100,
    clusterPoints: Math.round(clusterPoints * 100) / 100,
    clusterMaximum,
    sevenBestPoints: Math.round(sevenBestPoints * 100) / 100,
    groupsCount: groups.length,
    selectedSubjects: selected,
    sevenBestSubjects,
  };
}

export function calculateCourseClusterPoints(subjects: any[] = [], requirementsValue?: unknown) {
  return calculateCourseClusterScoreDetails(subjects, requirementsValue)?.points ?? null;
}

export function calculateTertiaryCourseClusterBenchmarkPoints(requirementsValue?: unknown) {
  const requirements = parseCourseClusterRequirements(requirementsValue);
  if (!hasCompleteCourseSubjectRequirements(requirements)) return null;

  const groups = getCourseRequirementGroups(requirements);
  const minimumClusterPoints = groups.reduce((sum, group) => {
    const leastDemandingAlternative = Math.min(...group.map((item) => Number(item.minimumPoints)));
    return sum + leastDemandingAlternative;
  }, 0);
  const clusterMaximum = CBE_SUBJECT_POINTS_MAX * groups.length;
  const remainingBestSubjectSlots = Math.max(0, CBE_TOP_SUBJECT_COUNT - groups.length);
  const sevenBestPoints = minimumClusterPoints + remainingBestSubjectSlots * 5;
  const benchmark = (minimumClusterPoints / clusterMaximum) * (sevenBestPoints / CBE_ATTEMPTED_POINTS_MAX) * clusterMaximum;

  return Math.round(benchmark * 100) / 100;
}

export function calculateDeviationPercentage(achieved: number, target: number) {
  if (!Number.isFinite(achieved) || !Number.isFinite(target) || target <= 0) return null;
  return ((achieved - target) / target) * 100;
}

function parseSupportProfileValue(profile: any) {
  if (!profile?.supportProfile) return null;
  try {
    return typeof profile.supportProfile === 'string' ? JSON.parse(profile.supportProfile) : profile.supportProfile;
  } catch {
    return null;
  }
}

function parseSupportProfile(profile: any) {
  if (!profile) return null;
  if (Array.isArray(profile.selectedSubjects)) return { selectedSubjects: profile.selectedSubjects };
  if (!profile.supportProfile) return null;
  try {
    const parsed = typeof profile.supportProfile === 'string' ? JSON.parse(profile.supportProfile) : profile.supportProfile;
    return { selectedSubjects: Array.isArray(parsed?.selectedSubjects) ? parsed.selectedSubjects : [] };
  } catch (e) {
    return null;
  }
}

export function calculateHistoricalClusterSeries(learner: any, profile: any, subjectsIn?: any[] | undefined) {
  const currentGrade = Number(String(learner?.gradeLevel || '').replace(/\D/g, '')) || 7;
  const courseRequirements = parseCourseClusterRequirements(profile?.clusterRequirements || profile?.courseClusterRequirements);
  const hasCourseRequirements = hasCompleteCourseSubjectRequirements(courseRequirements);

  const parsedSupportProfile = parseSupportProfile(profile);
  const supportProfileData = parseSupportProfileValue(profile) || {};
  const historicalSubjects = Array.isArray(profile?.historicalSelectedSubjects)
    ? profile.historicalSelectedSubjects
    : Array.isArray(supportProfileData.historicalSelectedSubjects) ? supportProfileData.historicalSelectedSubjects : [];
  const currentSubjects = Array.isArray(profile?.selectedSubjects)
    ? profile.selectedSubjects
    : Array.isArray(parsedSupportProfile?.selectedSubjects) ? parsedSupportProfile.selectedSubjects : [];
  const subjectMap = new Map<string, any>();
  [...historicalSubjects, ...currentSubjects, ...(Array.isArray(subjectsIn) ? subjectsIn : [])].forEach((subject: any) => {
    const id = String(subject?.id || subject?.code || subject?.name || '').trim();
    if (!id) return;
    const previous = subjectMap.get(id);
    subjectMap.set(id, {
      ...(previous || {}),
      ...subject,
      history: [...(Array.isArray(previous?.history) ? previous.history : []), ...(Array.isArray(subject?.history) ? subject.history : [])],
    });
  });
  const subjects = Array.from(subjectMap.values());

  const validMarkForGrade = (subject: any, grade: number) => {
    const history = Array.isArray(subject?.history) ? subject.history : [];
    const gradeEntry = [...history].reverse().find((h: any) => String(h?.label) === String(grade));

    const historyTarget = gradeEntry?.target !== null && gradeEntry?.target !== undefined && gradeEntry?.target !== '' && Number.isFinite(Number(gradeEntry.target))
      ? Number(gradeEntry.target)
      : NaN;
    const currentTarget = Number(subject?.targetMarks ?? subject?.targetMark ?? NaN);
    const target = Number.isFinite(historyTarget) && historyTarget > 0
      ? historyTarget
      : ((grade === currentGrade || grade >= 10) && Number.isFinite(currentTarget) && currentTarget > 0 ? currentTarget : NaN);
    const historicalValue = gradeEntry?.value !== null && gradeEntry?.value !== undefined && gradeEntry?.value !== '' && Number.isFinite(Number(gradeEntry.value))
      ? Number(gradeEntry.value)
      : NaN;
    const currentValue = grade === currentGrade && hasRecordedSubjectMark(subject) ? Number(subject.marksScored) : NaN;
    const value = Number.isFinite(historicalValue) ? historicalValue : currentValue;

    const validValue = Number.isFinite(value) && value >= 0 ? value : null;
    const validTarget = Number.isFinite(target) && target > 0 ? target : null;
    if (validValue === null && validTarget === null) return null;
    return { value: validValue, target: validTarget };
  };

  type ClusterSeriesPoint = {
    label: string;
    value: number;
    target?: number;
    learnerTarget?: number;
    tertiaryTarget?: number;
    deviation: number;
  };

  const series = GRADE_AXIS.map<ClusterSeriesPoint | null>((grade) => {
    const gradeSubjects = subjects
      .map((subject) => ({ subject, mark: validMarkForGrade(subject, grade) }))
      .filter((entry): entry is { subject: any; mark: { value: number; target: number | null } } => entry.mark !== null);

    if (gradeSubjects.length === 0 && grade < 10) {
      return null;
    }

    if (grade < 10) {
      const achievedSubjects = gradeSubjects.filter((entry) => entry.mark.value !== null);
      const targetSubjects = gradeSubjects.filter((entry) => entry.mark.target !== null);
      const value = achievedSubjects.length
        ? achievedSubjects.reduce((sum, entry) => sum + Number(entry.mark.value), 0) / achievedSubjects.length
        : NaN;
      const target = targetSubjects.length
        ? targetSubjects.reduce((sum, entry) => sum + Number(entry.mark.target), 0) / targetSubjects.length
        : NaN;
      if (!Number.isFinite(value) && !Number.isFinite(target)) return null;
      return {
        label: `${grade}`,
        value: Number.isFinite(value) ? Math.round(value * 100) / 100 : NaN,
        target: Number.isFinite(target) ? Math.round(target * 100) / 100 : undefined,
        deviation: Number.isFinite(value) && Number.isFinite(target) ? calculateDeviationPercentage(value, target) ?? 0 : 0,
      };
    }

    if (!hasCourseRequirements) return null;
    const achievedSubjects = gradeSubjects
      .filter((entry) => entry.mark.value !== null)
      .map((entry) => ({ ...entry.subject, marksScored: Number(entry.mark.value) }));
    const details = calculateCourseClusterScoreDetails(achievedSubjects, courseRequirements);
    const targetSubjects = gradeSubjects
      .filter((entry) => entry.mark.target !== null)
      .map((entry) => ({ ...entry.subject, marksScored: Number(entry.mark.target) }));
    const learnerTargetDetails = calculateCourseClusterScoreDetails(targetSubjects, courseRequirements);
    const learnerTarget = learnerTargetDetails?.sevenBestSubjects.length === CBE_TOP_SUBJECT_COUNT
      ? learnerTargetDetails.points
      : undefined;
    const tertiaryTarget = calculateTertiaryCourseClusterBenchmarkPoints(courseRequirements) ?? undefined;
    if (!details && learnerTarget === undefined && tertiaryTarget === undefined) return null;
    return {
      label: `${grade}`,
      value: details?.points ?? NaN,
      target: undefined,
      learnerTarget,
      tertiaryTarget,
      deviation: 0,
    };
  })
    .filter((entry): entry is ClusterSeriesPoint => entry !== null && Number.isFinite(Number(entry.value)));

  return series;
}

export function getMissingClusterGrades(series: Array<{ label?: string; value?: unknown }> = []) {
  const recordedGrades = new Set(
    series
      .filter((point) => Number.isFinite(Number(point.value)))
      .map((point) => Number(point.label)),
  );
  return GRADE_AXIS.filter((grade) => !recordedGrades.has(grade));
}

export default calculateHistoricalClusterSeries;
