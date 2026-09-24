export const GRADE_AXIS = [7, 8, 9, 10, 11, 12] as const;

const CLUSTER_POINTS_MAX = 48;
const CLUSTER_CORE_MAX = 48;
const CLUSTER_ATTEMPTED_MAX = 84;

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

export function getSelectedCourseClusterRequirement(profile: any) {
  const parsed = parseSupportProfileValue(profile);
  const requirement = profile?.minimumClusterScore ?? parsed?.minimumClusterScore;
  const numericRequirement = Number(requirement);
  return Number.isFinite(numericRequirement) && numericRequirement > 0 ? numericRequirement : null;
}

export function calculateCourseClusterDeviation(achieved: number, requirement: number) {
  if (!Number.isFinite(achieved) || !Number.isFinite(requirement) || requirement <= 0) return null;
  const points = achieved - requirement;
  return {
    points: Math.round(points * 100) / 100,
    percentage: Math.round(((points / requirement) * 100) * 100) / 100,
  };
}

function parseSupportProfile(profile: any) {
  if (!profile) return null;
  if (Array.isArray(profile.selectedSubjects)) return { selectedSubjects: profile.selectedSubjects, targetClusterPoints: profile.targetClusterPoints };
  if (!profile.supportProfile) return null;
  try {
    const parsed = typeof profile.supportProfile === 'string' ? JSON.parse(profile.supportProfile) : profile.supportProfile;
    return { selectedSubjects: Array.isArray(parsed?.selectedSubjects) ? parsed.selectedSubjects : [], targetClusterPoints: parsed?.targetClusterPoints };
  } catch (e) {
    return null;
  }
}

function getLikelyCoreSubject(subject: any) {
  const category = String(subject?.category || '').toLowerCase();
  const name = String(subject?.name || '').toLowerCase();
  if (category.includes('core') || subject?.isCore === true) return true;
  if (category.includes('support') || subject?.isSupport === true) return false;
  if (category.includes('elective') || subject?.isElective === true) return false;
  return /english|kiswahili|mathematics|biology|chemistry|physics|geography|history|agriculture|computer|business studies/.test(name);
}

export function calculateClusterPointsFromSubjects(subjects: any[] = []) {
  const attempted = Array.isArray(subjects)
    ? subjects
      .filter((subject) => Number.isFinite(Number(subject?.marksScored)) && Number(subject.marksScored) >= 0)
      .map((subject) => ({ ...subject, marksScored: Number(subject.marksScored || 0) }))
    : [];

  if (attempted.length === 0) return 0;

  const nonSupportSubjects = attempted.filter((subject) => !String(subject?.category || '').toLowerCase().includes('support'));
  const coreSubjects = [...nonSupportSubjects]
    .filter((subject) => getLikelyCoreSubject(subject))
    .sort((left, right) => Number(right.marksScored || 0) - Number(left.marksScored || 0))
    .slice(0, 4);

  const selectedCoreIds = new Set(coreSubjects.map((subject) => String(subject.id || subject.code || subject.name || '')));
  const electiveSubjects = [...nonSupportSubjects]
    .filter((subject) => !selectedCoreIds.has(String(subject.id || subject.code || subject.name || '')))
    .sort((left, right) => Number(right.marksScored || 0) - Number(left.marksScored || 0))
    .slice(0, 3);

  const selectedSubjects = [...coreSubjects, ...electiveSubjects];
  if (selectedSubjects.length === 0) return 0;

  const toScaledSubjectPoints = (marks: number) => {
    const value = Number.isFinite(Number(marks)) ? Number(marks) : 0;
    return Math.max(0, Math.min(12, (value / 100) * 12));
  };

  const corePoints = coreSubjects.reduce((sum, subject) => sum + toScaledSubjectPoints(Number(subject.marksScored || 0)), 0);
  const totalPoints = selectedSubjects.reduce((sum, subject) => sum + toScaledSubjectPoints(Number(subject.marksScored || 0)), 0);

  const rawClusterPoints = (corePoints / CLUSTER_CORE_MAX) * (totalPoints / CLUSTER_ATTEMPTED_MAX) * CLUSTER_POINTS_MAX;
  return Math.min(CLUSTER_POINTS_MAX, Math.max(0, Number(rawClusterPoints.toFixed(2))));
}

export function calculateHistoricalClusterSeries(learner: any, profile: any, subjectsIn?: any[] | undefined, currentClusterIn?: number | undefined) {
  const currentGrade = Number(String(learner?.gradeLevel || '').replace(/\D/g, '')) || 7;

  let subjects = Array.isArray(subjectsIn) ? subjectsIn.slice() : [];
  if (profile) {
    const historicalSubjects = Array.isArray(profile.historicalSelectedSubjects) ? profile.historicalSelectedSubjects : [];
    const currentSubjects = Array.isArray(profile.selectedSubjects) ? profile.selectedSubjects : [];
    subjects = [...historicalSubjects, ...currentSubjects, ...subjects];

    if ((!subjects || subjects.length === 0) && profile) {
      const parsed = parseSupportProfile(profile);
      if (parsed) {
        subjects = parsed.selectedSubjects || [];
        if (typeof parsed.targetClusterPoints !== 'undefined' && parsed.targetClusterPoints !== null && typeof currentClusterIn === 'undefined') {
          currentClusterIn = Number(parsed.targetClusterPoints);
        }
      }
    }
  }

  const validMarkForGrade = (subject: any, grade: number) => {
    const history = Array.isArray(subject?.history) ? subject.history : [];
    const gradeEntry = history.find((h: any) => String(h?.label) === String(grade));

    const historyTarget = gradeEntry && Number.isFinite(Number(gradeEntry.target)) ? Number(gradeEntry.target) : NaN;
    const currentTarget = Number(subject?.targetMarks ?? subject?.targetMark ?? NaN);
    const target = Number.isFinite(historyTarget) && historyTarget > 0
      ? historyTarget
      : (grade === currentGrade && Number.isFinite(currentTarget) && currentTarget > 0 ? currentTarget : NaN);
    if (!Number.isFinite(target) || target <= 0) return null;

    const historicalValue = gradeEntry && Number.isFinite(Number(gradeEntry.value)) ? Number(gradeEntry.value) : NaN;
    const currentValue = grade === currentGrade && Number.isFinite(Number(subject?.marksScored)) ? Number(subject.marksScored) : NaN;
    const value = Number.isFinite(historicalValue) ? historicalValue : currentValue;

    if (!Number.isFinite(value) || value <= 0) return null;
    return { value, target };
  };

  const series = GRADE_AXIS.map((grade) => {
    const validSubjects = (subjects || [])
      .map((subject) => ({ subject, mark: validMarkForGrade(subject, grade) }))
      .filter((entry): entry is { subject: any; mark: { value: number; target: number } } => entry.mark !== null);

    if (validSubjects.length === 0) {
      return null;
    }

    if (grade <= 9) {
      const achievedAverage = validSubjects.reduce((sum, entry) => sum + Number(entry.mark.value || 0), 0) / validSubjects.length;
      const targetAverage = validSubjects.reduce((sum, entry) => sum + Number(entry.mark.target || 0), 0) / validSubjects.length;
      const deviationAverage = validSubjects.reduce((sum, entry) => sum + Number(calculateDeviationPercentage(entry.mark.value, entry.mark.target) || 0), 0) / validSubjects.length;
      return { label: `${grade}`, value: Math.round(achievedAverage), target: Math.round(targetAverage), deviation: Math.round(deviationAverage * 100) / 100 };
    }

    const clusterValue = calculateClusterPointsFromSubjects(validSubjects.map((entry) => ({ ...entry.subject, marksScored: entry.mark.value })));
    const targetAverage = validSubjects.reduce((sum, entry) => sum + Number(entry.mark.target || 0), 0) / validSubjects.length;
    const deviationAverage = validSubjects.reduce((sum, entry) => sum + Number(calculateDeviationPercentage(entry.mark.value, entry.mark.target) || 0), 0) / validSubjects.length;
    return { label: `${grade}`, value: clusterValue, target: Math.round(targetAverage), deviation: Math.round(deviationAverage * 100) / 100 };
  })
    .filter((entry): entry is { label: string; value: number; target: number; deviation: number } => entry !== null && Number.isFinite(Number(entry.value)) && Number.isFinite(Number(entry.target)));

  if (typeof currentClusterIn === 'number' && Number.isFinite(currentClusterIn)) {
    const lastIndex = series.length - 1;
    if (lastIndex >= 0) {
      series[lastIndex] = {
        ...series[lastIndex],
        value: Math.min(CLUSTER_POINTS_MAX, Math.max(0, Number(currentClusterIn))),
      };
    }
  }

  return series;
}

export default calculateHistoricalClusterSeries;
