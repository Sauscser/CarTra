import {
  calculateCourseClusterScoreDetails,
  calculateDeviationPercentage,
  calculateTertiaryCourseClusterBenchmarkPoints,
  parseCourseClusterRequirements,
  parseCbeAchievementRanges,
} from './cluster';

export type NationalSubjectAssessment = {
  grade: number;
  academicYear: string;
  subjectId: string;
  subjectName: string;
  achieved: number;
  target?: number;
  deviation?: number;
};

export type NationalClusterAssessment = {
  grade: number;
  academicYear: string;
  achieved: number;
  learnerTargetDeviation: number;
  tertiaryTargetDeviation: number;
};

export type NationalCbeAnalytics = {
  subjectAssessments: NationalSubjectAssessment[];
  clusterAssessments: NationalClusterAssessment[];
  subjectNames: Array<{ id: string; name: string }>;
  learnersWithSubjectData: number;
  learnersWithClusterData: number;
};

export type NationalCbeRollupRow = {
  id: string;
  nationGradeKey: string;
  academicYear: string;
  dimension: string;
  binKey: string;
  subjectId?: string | null;
  subjectName?: string | null;
  count: number;
  deviationSum: number;
  deviationSquares: number;
};

export function buildHistoricalPerformanceFactsFromProfiles(profiles: any[], grades: ReadonlySet<number>) {
  const facts: any[] = [];

  profiles.forEach((profile) => {
    let supportProfile: any = {};
    try {
      supportProfile = typeof profile?.supportProfile === 'string'
        ? JSON.parse(profile.supportProfile)
        : profile?.supportProfile || {};
    } catch {
      supportProfile = {};
    }

    const currentGrade = Number(String(profile?.gradeLevel || '').replace(/\D/g, ''));
    const subjects = [
      ...(Array.isArray(supportProfile?.historicalSelectedSubjects) ? supportProfile.historicalSelectedSubjects : []),
      ...(Array.isArray(supportProfile?.selectedSubjects) ? supportProfile.selectedSubjects : []),
    ];
    const subjectsById = new Map<string, any>();
    subjects.forEach((subject: any) => {
      const subjectId = String(subject?.id || subject?.code || subject?.name || '').trim();
      if (!subjectId) return;
      const existing = subjectsById.get(subjectId) || { ...subject, history: [] };
      existing.history = [
        ...(Array.isArray(existing.history) ? existing.history : []),
        ...(Array.isArray(subject?.history) ? subject.history : []),
      ];
      if (subject?.marksScored !== null && subject?.marksScored !== undefined) existing.marksScored = subject.marksScored;
      if (subject?.targetMarks !== null && subject?.targetMarks !== undefined) existing.targetMarks = subject.targetMarks;
      subjectsById.set(subjectId, existing);
    });

    subjectsById.forEach((subject, subjectId) => {
      const history = Array.isArray(subject.history) ? subject.history : [];
      const gradeValues = new Set<number>([
        ...history
          .map((entry: any) => Number(String(entry?.label || '').trim()))
          .filter((grade: number) => Number.isInteger(grade) && grades.has(grade)),
        ...(Number.isInteger(currentGrade) && grades.has(currentGrade) ? [currentGrade] : []),
      ]);

      gradeValues.forEach((grade) => {
        const entries = history.filter((entry: any) => Number(String(entry?.label || '').trim()) === grade);
        const entry = entries.at(-1);
        const rawMark = entry?.value ?? (grade === currentGrade ? subject.marksScored : null);
        const achievedMark = Number(rawMark);
        const achievedWasRecorded = rawMark !== null &&
          rawMark !== undefined &&
          rawMark !== '' &&
          Number.isFinite(achievedMark) &&
          achievedMark >= 0 &&
          (achievedMark > 0 || entry?.achievedRecorded === true);
        if (!achievedWasRecorded) return;
        const rawTarget = entry?.target ?? (grade === currentGrade ? subject.targetMarks : null);
        const targetMark = Number(rawTarget);
        facts.push({
          id: `PROFILE_HISTORY#${profile.id}#${grade}#${subjectId}`,
          learnerId: String(profile.id || ''),
          subjectId,
          subjectName: String(subject.name || subject.code || subjectId),
          gradeLevel: grade,
          academicYear: 'Not recorded',
          termOrCycle: 'EndOfYear',
          nationCode: profile.nationCode,
          achievedMark,
          targetMark: Number.isFinite(targetMark) && targetMark > 0 ? targetMark : null,
        });
      });
    });
  });

  return facts;
}

export function buildNationalCbeRollupsFromFacts(performanceFacts: any[]): NationalCbeRollupRow[] {
  const rollups = new Map<string, NationalCbeRollupRow>();

  const add = (
    fact: any,
    dimension: string,
    binKey: string,
    deviation?: number,
    subjectId?: string | null,
    subjectName?: string | null,
  ) => {
    const nationGradeKey = `${String(fact.nationCode).trim().toUpperCase()}#${Number(fact.gradeLevel)}`;
    const academicYear = String(fact.academicYear);
    const id = [nationGradeKey, academicYear, dimension, binKey].map(encodeURIComponent).join('#');
    const row = rollups.get(id) || {
      id,
      nationGradeKey,
      academicYear,
      dimension,
      binKey,
      subjectId: subjectId || null,
      subjectName: subjectName || null,
      count: 0,
      deviationSum: 0,
      deviationSquares: 0,
    };
    row.count += 1;
    if (Number.isFinite(deviation)) {
      row.deviationSum += Number(deviation);
      row.deviationSquares += Number(deviation) ** 2;
    }
    rollups.set(id, row);
  };

  performanceFacts.forEach((fact) => {
    const grade = Number(fact?.gradeLevel);
    const achievedValue = fact?.achievedMark;
    const achieved = Number(achievedValue);
    const academicYear = String(fact?.academicYear || '').trim();
    const nationCode = String(fact?.nationCode || '').trim();
    const captureCycle = String(fact?.termOrCycle || '').replace(/[^a-z]/gi, '').toLowerCase();
    if (
      !fact?.learnerId ||
      !nationCode ||
      !academicYear ||
      captureCycle !== 'endofyear' ||
      !Number.isInteger(grade) ||
      grade < 7 ||
      grade > 12 ||
      achievedValue === null ||
      achievedValue === undefined ||
      achievedValue === '' ||
      !Number.isFinite(achieved) ||
      achieved < 0
    ) return;

    if (String(fact.subjectId || '') === '__ANNUAL_CLUSTER__') {
      const learnerTarget = Number(fact.targetMark);
      if (Number.isFinite(learnerTarget) && learnerTarget > 0) {
        const deviation = ((achieved - learnerTarget) / learnerTarget) * 100;
        add(fact, 'CLUSTER_PERSONAL_DEVIATION_EXCLUDING_SUPPORT', deviationBinKey(deviation), deviation);
      }
      const tertiaryTarget = Number(fact.tertiaryBenchmark);
      if (Number.isFinite(tertiaryTarget) && tertiaryTarget > 0) {
        const deviation = ((achieved - tertiaryTarget) / tertiaryTarget) * 100;
        add(fact, 'CLUSTER_TERTIARY_DEVIATION_EXCLUDING_SUPPORT', deviationBinKey(deviation), deviation);
      }
      return;
    }

    const subjectId = String(fact.subjectId || '').trim();
    if (!subjectId) return;
    const subjectName = String(fact.subjectName || subjectId);
    const mark = Math.floor(Math.max(0, Math.min(100, achieved)));
    add(fact, `MARK#${subjectId}`, String(mark), undefined, subjectId, subjectName);

    const target = Number(fact.targetMark);
    if (Number.isFinite(target) && target > 0) {
      const deviation = ((achieved - target) / target) * 100;
      const binKey = deviationBinKey(deviation);
      add(fact, `SUBJECT_DEVIATION#${subjectId}`, binKey, deviation, subjectId, subjectName);
      add(fact, 'PERSONAL_DEVIATION', binKey, deviation);
    }
  });

  return Array.from(rollups.values());
}

function deviationBinKey(value: number) {
  if (value <= -100) return '-100';
  if (value >= 500) return '500+';
  return String(Math.floor(value / 5) * 5);
}

export function buildNationalCbeAnalytics(
  performanceFacts: any[],
  tertiaryCourses: any[],
  achievementRangesValue: unknown,
  supportSubjectIds: ReadonlySet<string> = new Set<string>(),
): NationalCbeAnalytics {
  const achievementRanges = parseCbeAchievementRanges(achievementRangesValue);
  const achievementRangesByCourse = new Map<string, unknown>();
  const coursesById = new Map<string, any>();
  tertiaryCourses.forEach((course) => {
    if (!course?.id) return;
    coursesById.set(String(course.id), course);
    const requirements = parseCourseClusterRequirements(course.clusterRequirements);
    if (requirements) achievementRangesByCourse.set(String(course.id), requirements.achievementRanges || achievementRanges);
  });

  const subjectAssessments: NationalSubjectAssessment[] = [];
  const clusterAssessments: NationalClusterAssessment[] = [];
  const subjectNames = new Map<string, string>();
  const learnersWithSubjectData = new Set<string>();
  const learnersWithClusterData = new Set<string>();
  const learnerGradeFacts = new Map<string, any[]>();

  performanceFacts.forEach((fact) => {
    const learnerId = String(fact?.learnerId || '').trim();
    const subjectId = String(fact?.subjectId || '').trim();
    const grade = Number(fact?.gradeLevel);
    const academicYear = String(fact?.academicYear || '');
    const captureCycle = String(fact?.termOrCycle || '').replace(/[^a-z]/gi, '').toLowerCase();
    const achieved = Number(fact?.achievedMark);
    if (!learnerId || !subjectId || !academicYear || captureCycle !== 'endofyear' || !Number.isInteger(grade) || grade < 7 || grade > 12 || !Number.isFinite(achieved) || achieved < 0) return;
    if (grade >= 10 && supportSubjectIds.has(subjectId)) return;

    const target = Number(fact?.targetMark);
    const targetIsValid = Number.isFinite(target) && target > 0;
    const deviation = targetIsValid ? calculateDeviationPercentage(achieved, target) : null;
    const subjectName = String(fact?.subjectName || subjectId);
    subjectNames.set(subjectId, subjectName);
    subjectAssessments.push({
      grade,
      academicYear,
      subjectId,
      subjectName,
      achieved,
      ...(targetIsValid ? { target } : {}),
      ...(deviation !== null ? { deviation } : {}),
    });
    learnersWithSubjectData.add(learnerId);
    const gradeKey = `${learnerId}#${grade}#${academicYear}`;
    const facts = learnerGradeFacts.get(gradeKey) || [];
    facts.push(fact);
    learnerGradeFacts.set(gradeKey, facts);
  });

  learnerGradeFacts.forEach((facts) => {
    const grade = Number(facts[0]?.gradeLevel);
    if (grade < 10 || grade > 12) return;
    const learnerId = String(facts[0]?.learnerId || '');
    const selectedCareerId = String(facts.find((fact) => fact?.targetCareerId)?.targetCareerId || '');
    const snapshot = facts.find((fact) => fact?.courseRequirementsSnapshot)?.courseRequirementsSnapshot;
    const requirements = parseCourseClusterRequirements(snapshot || coursesById.get(selectedCareerId)?.clusterRequirements);
    if (!requirements) return;

    const achievementRangesForCourse = achievementRangesByCourse.get(selectedCareerId) || requirements.achievementRanges || achievementRanges;
    const subjects = facts.map((fact) => ({ id: String(fact.subjectId), marksScored: Number(fact.achievedMark) }));
    const targetSubjects = facts
      .filter((fact) => fact.targetMark !== null && fact.targetMark !== undefined && Number.isFinite(Number(fact.targetMark)))
      .map((fact) => ({ id: String(fact.subjectId), marksScored: Number(fact.targetMark) }));
    const achieved = calculateCourseClusterScoreDetails(subjects, requirements, achievementRangesForCourse);
    const learnerTarget = calculateCourseClusterScoreDetails(targetSubjects, requirements, achievementRangesForCourse);
    const tertiaryTarget = calculateTertiaryCourseClusterBenchmarkPoints(requirements);
    if (!achieved || !learnerTarget || learnerTarget.points <= 0 || tertiaryTarget === null || tertiaryTarget <= 0) return;

    const learnerTargetDeviation = calculateDeviationPercentage(achieved.points, learnerTarget.points);
    const tertiaryTargetDeviation = calculateDeviationPercentage(achieved.points, tertiaryTarget);
    if (learnerTargetDeviation === null || tertiaryTargetDeviation === null) return;
    clusterAssessments.push({
      grade,
      academicYear: String(facts[0]?.academicYear || ''),
      achieved: achieved.points,
      learnerTargetDeviation,
      tertiaryTargetDeviation,
    });
    learnersWithClusterData.add(learnerId);
  });

  return {
    subjectAssessments,
    clusterAssessments,
    subjectNames: Array.from(subjectNames, ([id, name]) => ({ id, name })).sort((left, right) => left.name.localeCompare(right.name)),
    learnersWithSubjectData: learnersWithSubjectData.size,
    learnersWithClusterData: learnersWithClusterData.size,
  };
}

export { parseCbeAchievementRanges };