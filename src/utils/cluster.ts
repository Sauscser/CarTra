import { isSupportSubject } from './supportSubjects';

export const GRADE_AXIS = [7, 8, 9, 10, 11, 12] as const;

const CBE_SUBJECT_POINTS_MAX = 8;
const CBE_TOP_SUBJECT_COUNT = 7;
export const CBE_ATTEMPTED_POINTS_MAX = CBE_SUBJECT_POINTS_MAX * CBE_TOP_SUBJECT_COUNT;

export type CbeAchievementRange = { level: string; minimumMark: number; maximumMark: number };

export const DEFAULT_CBE_ACHIEVEMENT_RANGES: CbeAchievementRange[] = [
  { level: 'BE1', minimumMark: 0, maximumMark: 9 },
  { level: 'BE2', minimumMark: 10, maximumMark: 19 },
  { level: 'AE1', minimumMark: 20, maximumMark: 29 },
  { level: 'AE2', minimumMark: 30, maximumMark: 39 },
  { level: 'ME1', minimumMark: 40, maximumMark: 57 },
  { level: 'ME2', minimumMark: 58, maximumMark: 74 },
  { level: 'EE1', minimumMark: 75, maximumMark: 89 },
  { level: 'EE2', minimumMark: 90, maximumMark: 100 },
];

const CBE_LEVEL_POINTS: Record<string, number> = {
  BE1: 1,
  BE2: 2,
  AE1: 3,
  AE2: 4,
  ME1: 5,
  ME2: 6,
  EE1: 7,
  EE2: 8,
};

type CourseClusterSubjectRequirement = {
  subjectId: string;
  operator: 'AND' | 'OR';
  minimumPoints?: number;
  subjectName?: string;
  achievementRanges?: CbeAchievementRange[];
};

export type CourseClusterRequirements = {
  version: 1 | 2 | 3;
  pointScale?: 'CBE_8';
  requiredSubjectIds: string[];
  alternativeSubjectIds: string[];
  subjectSequence?: CourseClusterSubjectRequirement[];
  bestSubjectsMinimumPoints?: number;
  achievementRanges?: CbeAchievementRange[];
};

export function getCbeAchievementLevel(points: number) {
  const labels = Object.fromEntries(Object.entries(CBE_LEVEL_POINTS).map(([level, value]) => [value, level]));
  return labels[points] || 'Not assessed';
}

export function parseCbeAchievementRanges(value: unknown): CbeAchievementRange[] {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return DEFAULT_CBE_ACHIEVEMENT_RANGES;
    }
  }
  const validRanges = hasValidCbeAchievementRanges(parsed) ? parsed as CbeAchievementRange[] : null;
  return validRanges ? validRanges.map((item) => ({
    level: String(item.level),
    minimumMark: Number(item.minimumMark),
    maximumMark: Number(item.maximumMark),
  })) : DEFAULT_CBE_ACHIEVEMENT_RANGES;
}

export function getSubjectCbeRanges(subjectLike: any): CbeAchievementRange[] {
  if (!subjectLike) return DEFAULT_CBE_ACHIEVEMENT_RANGES;
  const rawRanges = subjectLike.cbeAchievementRanges ?? subjectLike.achievementRanges ?? subjectLike.metadata?.cbeAchievementRanges;
  return parseCbeAchievementRanges(rawRanges);
}

export function hasValidCbeAchievementRanges(value: unknown) {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return false;
    }
  }
  if (!Array.isArray(parsed) || parsed.length !== DEFAULT_CBE_ACHIEVEMENT_RANGES.length) return false;
  const ranges: CbeAchievementRange[] = parsed.map((item: any) => ({
    level: String(item?.level || ''),
    minimumMark: Number(item?.minimumMark),
    maximumMark: Number(item?.maximumMark),
  }));
  const isValid = ranges.every((range, index) =>
    range.level === DEFAULT_CBE_ACHIEVEMENT_RANGES[index].level
      && Number.isInteger(range.minimumMark)
      && Number.isInteger(range.maximumMark)
      && range.minimumMark >= 0
      && range.maximumMark <= 100
      && range.minimumMark <= range.maximumMark
      && (index === 0 ? range.minimumMark === 0 : range.minimumMark === ranges[index - 1].maximumMark + 1),
  ) && ranges[ranges.length - 1].maximumMark === 100;

  return isValid;
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
  const candidate = parsed as { version?: unknown; pointScale?: unknown; requiredSubjectIds?: unknown; alternativeSubjectIds?: unknown; subjectSequence?: unknown; bestSubjectsMinimumPoints?: unknown; achievementRanges?: unknown };
  const bestSubjectsMinimumPoints = candidate.bestSubjectsMinimumPoints !== undefined
    && Number.isInteger(Number(candidate.bestSubjectsMinimumPoints))
    && Number(candidate.bestSubjectsMinimumPoints) >= 0
    && Number(candidate.bestSubjectsMinimumPoints) <= CBE_ATTEMPTED_POINTS_MAX
    ? Number(candidate.bestSubjectsMinimumPoints)
    : undefined;
  const achievementRanges = Array.isArray(candidate.achievementRanges)
    ? candidate.achievementRanges as CbeAchievementRange[]
    : undefined;
  if (Array.isArray(candidate.subjectSequence)) {
    const isCbeEightPointScale = candidate.pointScale === 'CBE_8' && Number(candidate.version) >= 3;
    const subjectSequence = candidate.subjectSequence
      .map((item: any): CourseClusterSubjectRequirement => ({
        subjectId: String(item?.subjectId || ''),
        operator: item?.operator === 'OR' ? 'OR' : 'AND',
        subjectName: typeof item?.subjectName === 'string' ? item.subjectName : undefined,
        achievementRanges: Array.isArray(item?.achievementRanges) ? parseCbeAchievementRanges(item.achievementRanges) : undefined,
        minimumPoints: isCbeEightPointScale ? normalizeCourseSubjectMinimum(item?.minimumPoints) : undefined,
      }))
      .filter((item) => item.subjectId);
    if (subjectSequence.length > 0) {
      return {
        version: 3,
        pointScale: 'CBE_8',
        subjectSequence,
        bestSubjectsMinimumPoints,
        achievementRanges,
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

export function hasCompleteCourseScoringData(requirementsValue?: unknown) {
  const requirements = parseCourseClusterRequirements(requirementsValue);
  return Boolean(
    hasCompleteCourseSubjectRequirements(requirements)
      && Number.isInteger(requirements?.bestSubjectsMinimumPoints)
      && Number(requirements?.bestSubjectsMinimumPoints) >= 0
      && Number(requirements?.bestSubjectsMinimumPoints) <= CBE_ATTEMPTED_POINTS_MAX
      && (
        hasValidCbeAchievementRanges(requirements?.achievementRanges)
        || requirements?.subjectSequence?.every((item) => hasValidCbeAchievementRanges(item.achievementRanges))
      ),
  );
}

export function hasCourseSubjectPointRequirements(profile: any) {
  const parsedSupportProfile = parseSupportProfileValue(profile);
  const requirements = parseCourseClusterRequirements(
    profile?.clusterRequirements || parsedSupportProfile?.clusterRequirements || profile?.courseClusterRequirements,
  );
  return getCourseRequirementGroups(requirements).length > 0;
}

export function getCourseSubjectPoints(marks: unknown, rangesValue?: unknown) {
  const numericMarks = Number(marks);
  if (!hasValidCbeAchievementRanges(rangesValue) || !Number.isFinite(numericMarks) || numericMarks < 0) return 0;
  const boundedMarks = Math.min(100, numericMarks);
  const ranges = rangesValue as CbeAchievementRange[];
  const range = ranges
    .find((item) => boundedMarks >= item.minimumMark && boundedMarks <= item.maximumMark);
  return range ? CBE_LEVEL_POINTS[range.level] : 0;
}

function getSubjectPoints(subject: any, rangesValue?: unknown) {
  return getCourseSubjectPoints(subject?.marksScored, rangesValue ?? subject?.cbeAchievementRanges);
}

function hasRecordedSubjectMark(subject: any) {
  return subject?.marksScored !== null && subject?.marksScored !== undefined && subject?.marksScored !== '' && Number.isFinite(Number(subject.marksScored)) && Number(subject.marksScored) >= 0;
}

export function evaluateCourseSubjectPointRequirements(subjects: any[] = [], requirementsValue?: unknown) {
  const requirements = parseCourseClusterRequirements(requirementsValue);
  const groups = getCourseRequirementGroups(requirements);
  if (!hasCompleteCourseScoringData(requirements)) return null;
  const achievementRanges = requirements?.achievementRanges;

  const byId = new Map<string, any>();
  subjects.forEach((subject) => {
    if (isSupportSubject(subject)) return;
    const id = String(subject?.id || subject?.code || subject?.name || '').trim();
    if (id && hasRecordedSubjectMark(subject)) byId.set(id, subject);
  });

  return groups.every((group) => {
    const best = group
      .map((item) => {
        const subject = byId.get(item.subjectId);
        return { item, subject: subject ? { ...subject, cbeAchievementRanges: item.achievementRanges || subject.cbeAchievementRanges } : undefined };
      })
      .filter((entry) => entry.subject)
      .sort((left, right) => getSubjectPoints(right.subject, right.item.achievementRanges || achievementRanges) - getSubjectPoints(left.subject, left.item.achievementRanges || achievementRanges))[0];
    return Boolean(best && Number.isInteger(best.item.minimumPoints) && getSubjectPoints(best.subject, best.item.achievementRanges || achievementRanges) >= Number(best.item.minimumPoints));
  });
}

export function calculateCourseClusterScoreDetails(subjects: any[] = [], requirementsValue?: unknown, rangesValue?: unknown) {
  const requirements = parseCourseClusterRequirements(requirementsValue);
  if (!hasCompleteCourseScoringData(requirements)) return null;
  const achievementRanges = rangesValue || requirements?.achievementRanges;

  const byId = new Map<string, any>();
  subjects.forEach((subject) => {
    if (isSupportSubject(subject)) return;
    const id = String(subject?.id || subject?.code || subject?.name || '').trim();
    if (id && hasRecordedSubjectMark(subject)) byId.set(id, { ...subject, marksScored: Number(subject.marksScored) });
  });

  const groups = getCourseRequirementGroups(requirements);
  const selected: any[] = [];
  groups.forEach((group) => {
    const available = group
      .map((item) => {
        const subject = byId.get(item.subjectId);
        return subject ? { ...subject, cbeAchievementRanges: item.achievementRanges || subject.cbeAchievementRanges || achievementRanges } : null;
      })
      .filter((subject) => subject !== null)
      .sort((left, right) => getSubjectPoints(right) - getSubjectPoints(left));
    if (available.length === 0) return;
    selected.push(available[0]);
  });
  if (selected.length !== groups.length) return null;
  if (selected.length === 0) return null;

  const selectedIds = new Set(selected.map((subject) => String(subject.id || subject.code || subject.name)));
  const topOtherSubjects = Array.from(byId.values())
    .filter((subject) => !selectedIds.has(String(subject.id || subject.code || subject.name)))
    .sort((left, right) => getSubjectPoints(right, achievementRanges) - getSubjectPoints(left, achievementRanges))
    .slice(0, CBE_TOP_SUBJECT_COUNT - selected.length);
  const clusterPoints = selected.reduce((sum, subject) => sum + getSubjectPoints(subject, achievementRanges), 0);
  const sevenBestSubjects = [...selected, ...topOtherSubjects];
  const sevenBestPoints = sevenBestSubjects.reduce((sum, subject) => sum + getSubjectPoints(subject, achievementRanges), 0);
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
  if (!hasCompleteCourseScoringData(requirements)) return null;

  const groups = getCourseRequirementGroups(requirements);
  const minimumClusterPoints = groups.reduce((sum, group) => {
    const leastDemandingAlternative = Math.min(...group.map((item) => Number(item.minimumPoints)));
    return sum + leastDemandingAlternative;
  }, 0);
  const clusterMaximum = CBE_SUBJECT_POINTS_MAX * groups.length;
  const sevenBestPoints = Number(requirements?.bestSubjectsMinimumPoints);
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

export function calculateHistoricalClusterSeries(learner: any, profile: any, subjectsIn?: any[] | undefined, supportSubjectIds: ReadonlySet<string> = new Set<string>()) {
  const currentGrade = Number(String(learner?.gradeLevel || '').replace(/\D/g, '')) || 7;
  const parsedSupportProfile = parseSupportProfile(profile);
  const supportProfileData = parseSupportProfileValue(profile) || {};
  const courseRequirements = parseCourseClusterRequirements(
    profile?.clusterRequirements || supportProfileData?.clusterRequirements || profile?.courseClusterRequirements,
  );
  const hasCourseRequirements = hasCompleteCourseScoringData(courseRequirements);
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
      category: subject?.category || previous?.category,
      subjectCategory: subject?.subjectCategory || previous?.subjectCategory,
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
    const gradeSubjectSource = grade >= 10 ? subjects.filter((subject) => !isSupportSubject(subject, supportSubjectIds)) : subjects;
    const gradeSubjects = gradeSubjectSource
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
      deviation: details && tertiaryTarget !== undefined
        ? calculateDeviationPercentage(details.points, tertiaryTarget) ?? 0
        : 0,
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
