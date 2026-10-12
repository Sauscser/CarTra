import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { createAnnualSchoolEnrollmentPlan, updateAnnualSchoolEnrollmentPlan } from '../../graphql/mutations';
import {
  listAcademicTargets,
  listAnnualSchoolEnrollmentPlans,
  listAssessmentSubmissions,
  listAssessmentTasks,
  listLearnerEnrollments,
  listLearnerProfiles,
  listLearnerSubjectPerformances,
  listOrgHierarchies,
} from '../../graphql/queries';
import SectionCard from './SectionCard';

type ScopeType = 'nation' | 'region' | 'county' | 'subCounty' | 'school';
type IssueType = 'targets' | 'promotion' | 'marks';
type HierarchyType = 'region' | 'county' | 'subCounty' | 'school';
type HierarchyRow = {
  id: string;
  entityType: HierarchyType;
  code: string;
  name: string;
  nationCode?: string | null;
  regionCode?: string | null;
  countyCode?: string | null;
  subCountyCode?: string | null;
  assignedOfficerEmail?: string | null;
};
type Learner = {
  id: string;
  fullName: string;
  gradeLevel?: string | null;
  classCode?: string | null;
  schoolCode: string;
  regionCode?: string | null;
  countyCode?: string | null;
  subCountyCode?: string | null;
  status?: string | null;
  supportProfile?: unknown;
};
type FollowUpItem = {
  learnerId: string;
  learnerName: string;
  schoolCode: string;
  classCode: string;
  regionCode: string;
  countyCode: string;
  subCountyCode: string;
  taskTitle?: string;
  dueDate?: string | null;
};
type ReportData = {
  learners: Learner[];
  schools: HierarchyRow[];
  hierarchy: HierarchyRow[];
  plans: any[];
  issues: Record<IssueType, FollowUpItem[]>;
  year: string;
  previousYear: string;
};
type DrillPathItem = { entityType: HierarchyType; code: string; name: string };
type Grade = '7' | '8' | '9' | '10' | '11' | '12';
type GradeCounts = Record<Grade, string>;
type EnrollmentPlan = {
  id: string;
  schoolCode: string;
  academicYear: string;
  expectedLearnersByGrade: unknown;
  declaredByUserId: string;
  declaredAt: string;
};
const GRADES: Grade[] = ['7', '8', '9', '10', '11', '12'];

type Props = {
  scopeType: ScopeType;
  scopeCode: string;
  scopeName: string;
  nationCode: string;
};

const SCOPE_FIELD: Record<Exclude<ScopeType, 'nation'>, keyof Learner> = {
  region: 'regionCode',
  county: 'countyCode',
  subCounty: 'subCountyCode',
  school: 'schoolCode',
};
const NEXT_LEVEL: Record<ScopeType, HierarchyType | null> = {
  nation: 'region',
  region: 'county',
  county: 'subCounty',
  subCounty: 'school',
  school: null,
};
const ISSUE_LABEL: Record<IssueType, string> = {
  targets: 'Targets not set',
  promotion: 'Promotion follow-up',
  marks: 'Marks not uploaded',
};
const ISSUE_DESCRIPTION: Record<IssueType, string> = {
  targets: 'Learners without a saved target for the current academic year.',
  promotion: 'Previous-year learners not marked promoted and without a current-year enrollment.',
  marks: 'Scores missing for assigned assessments. Past-due tasks are flagged.',
};

async function loadPages<T>(
  client: any,
  query: string,
  connectionName: string,
  filter?: Record<string, unknown>,
): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | null = null;
  do {
    const result: any = await client.graphql({
      query,
      variables: { filter, limit: 500, nextToken },
    } as any);
    if (result?.errors?.length) {
      throw new Error(result.errors.map((item: any) => item?.message || 'Unknown GraphQL error').join('; '));
    }
    const connection = result?.data?.[connectionName];
    if (!connection) throw new Error(`The ${connectionName} response was empty.`);
    items.push(...(connection.items || []));
    nextToken = connection.nextToken || null;
  } while (nextToken);
  return items;
}

function parseObject(value: unknown): Record<string, any> | null {
  let parsed = value;
  for (let attempt = 0; attempt < 3 && typeof parsed === 'string'; attempt += 1) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, any>
    : null;
}

function hasSavedTarget(target: any): boolean {
  const targetValues = parseObject(target?.targetValues) || target?.targetValues;
  const subjectTargets = parseObject(target?.subjectTargets) || target?.subjectTargets;
  const hasValues = (value: unknown) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') {
      return Object.values(value as Record<string, unknown>).some((item) =>
        item !== null && item !== undefined && String(item).trim() !== '',
      );
    }
    if (typeof value === 'number') return Number.isFinite(value);
    return typeof value === 'string' && value.trim().length > 0;
  };
  return hasValues(targetValues) || hasValues(subjectTargets) || Boolean(target?.careerId || target?.pathwayId);
}

function hasLearnerTarget(learner: Learner): boolean {
  const supportProfile = parseObject(learner.supportProfile);
  if (!supportProfile) return false;
  if (
    supportProfile.targetCareer ||
    supportProfile.targetCareerName ||
    supportProfile.targetCareerId
  ) return true;
  return Array.isArray(supportProfile.selectedSubjects) && supportProfile.selectedSubjects.some((subject: any) =>
    subject?.targetMarks !== null && subject?.targetMarks !== undefined &&
    subject?.targetMarks !== '' && Number.isFinite(Number(subject.targetMarks)),
  );
}

function toLearner(record: any): Learner | null {
  if (!record?.id || !record?.schoolCode) return null;
  return {
    id: record.id,
    fullName: record.fullName || 'Unnamed learner',
    gradeLevel: record.gradeLevel,
    classCode: record.classCode,
    schoolCode: record.schoolCode,
    regionCode: record.regionCode,
    countyCode: record.countyCode,
    subCountyCode: record.subCountyCode,
    status: record.status,
    supportProfile: record.supportProfile,
  };
}

function isActiveLearner(learner: Learner) {
  return !['inactive', 'withdrawn', 'transferred', 'deleted'].includes(String(learner.status || '').toLowerCase());
}

function emptyGradeCounts(): GradeCounts {
  return { '7': '', '8': '', '9': '', '10': '', '11': '', '12': '' };
}

function parseGradeCounts(value: unknown): Partial<Record<Grade, number>> {
  const parsed = parseObject(value);
  if (!parsed) return {};
  return GRADES.reduce<Partial<Record<Grade, number>>>((counts, grade) => {
    const count = Number(parsed[grade]);
    if (Number.isInteger(count) && count >= 0) counts[grade] = count;
    return counts;
  }, {});
}

function gradeForLearner(learner: Learner): Grade | null {
  const grade = String(learner.gradeLevel || learner.classCode || '').match(/\d+/)?.[0];
  return grade && GRADES.includes(grade as Grade) ? grade as Grade : null;
}

function buildReport(
  learners: Learner[],
  hierarchy: HierarchyRow[],
  plans: any[],
  targets: any[],
  performanceRecords: any[],
  enrollments: any[],
  tasks: any[],
  submissions: any[],
  year: string,
): ReportData {
  const currentYear = year;
  const previousYear = String(Number(year) - 1);
  const activeLearners = learners.filter(isActiveLearner);
  const learnerById = new Map(activeLearners.map((learner) => [learner.id, learner]));
  const schoolByCode = new Map(hierarchy.filter((row) => row.entityType === 'school').map((row) => [row.code, row]));
  const targetLearnerIds = new Set(targets.filter((target) =>
    target.academicYear === currentYear && hasSavedTarget(target),
  ).map((target) => target.learnerId));
  const targetFactLearnerIds = new Set(performanceRecords.filter((fact) =>
    fact.academicYear === currentYear &&
    fact.targetMark !== null && fact.targetMark !== undefined &&
    Number.isFinite(Number(fact.targetMark)),
  ).map((fact) => fact.learnerId));
  const targetsMissing = activeLearners.filter((learner) =>
    !targetLearnerIds.has(learner.id) &&
    !targetFactLearnerIds.has(learner.id) &&
    !hasLearnerTarget(learner),
  ).map((learner) => issueItem(learner));

  const currentEnrollments = new Set(enrollments
    .filter((enrollment) => enrollment.academicYear === currentYear)
    .map((enrollment) => enrollment.learnerId));
  const promotionByLearner = new Map<string, any>();
  enrollments
    .filter((enrollment) => enrollment.academicYear === previousYear)
    .forEach((enrollment) => {
      if (!promotionByLearner.has(enrollment.learnerId) ||
        enrollment.promotedToNextClass === true ||
        String(enrollment.enrollmentStatus || '').toLowerCase() === 'promoted') {
        promotionByLearner.set(enrollment.learnerId, enrollment);
      }
    });
  const promotionMissing: FollowUpItem[] = [];
  promotionByLearner.forEach((enrollment, learnerId) => {
    const learner = learnerById.get(learnerId);
    if (!learner || currentEnrollments.has(learnerId)) return;
    const previousGrade = Number(String(enrollment.classCode || learner.gradeLevel || '').replace(/\D/g, ''));
    if (!Number.isFinite(previousGrade) || previousGrade >= 12) return;
    if (enrollment.promotedToNextClass === true ||
      String(enrollment.enrollmentStatus || '').toLowerCase() === 'promoted') return;
    promotionMissing.push(issueItem(learner));
  });

  const scoredSubmissions = new Set(submissions.filter((submission) =>
    submission.score !== null && submission.score !== undefined && Number.isFinite(Number(submission.score)),
  ).map((submission) => `${submission.assessmentTaskId}#${submission.learnerId}`));
  const achievedSubjectMarks = new Set(performanceRecords.filter((fact) =>
    fact.academicYear === currentYear &&
    fact.achievedMark !== null && fact.achievedMark !== undefined &&
    Number.isFinite(Number(fact.achievedMark)),
  ).map((fact) => `${fact.learnerId}#${fact.subjectId}`));
  const marksMissing: FollowUpItem[] = [];
  activeLearners.forEach((learner) => {
    const profile = parseObject(learner.supportProfile);
    const selectedSubjects = Array.isArray(profile?.selectedSubjects) ? profile.selectedSubjects : [];
    const checkedSubjectKeys = new Set<string>();
    selectedSubjects.forEach((subject: any) => {
      const subjectKey = String(subject?.id || subject?.subjectId || subject?.code || subject?.name || '').trim();
      const subjectName = String(subject?.name || subject?.code || 'Selected subject').trim();
      if (!subjectKey || checkedSubjectKeys.has(subjectKey)) return;
      checkedSubjectKeys.add(subjectKey);
      const savedMark = subject?.marksScored;
      const profileHasMark = savedMark !== null && savedMark !== undefined &&
        savedMark !== '' && Number.isFinite(Number(savedMark)) && Number(savedMark) >= 0;
      if (!profileHasMark && !achievedSubjectMarks.has(`${learner.id}#${subjectKey}`)) {
        marksMissing.push({
          ...issueItem(learner),
          taskTitle: `Subject mark: ${subjectName}`,
        });
      }
    });
  });
  const currentTasks = tasks.filter((task) =>
    task.academicYear === currentYear &&
    !['draft', 'inactive', 'cancelled', 'deleted', 'archived'].includes(String(task.status || '').toLowerCase()),
  );
  currentTasks.forEach((task) => {
    const school = schoolByCode.get(task.schoolCode);
    if (!school) return;
    activeLearners
      .filter((learner) =>
        learner.schoolCode === task.schoolCode &&
        (!task.classCode || learner.classCode === task.classCode),
      )
      .forEach((learner) => {
        if (!scoredSubmissions.has(`${task.id}#${learner.id}`)) {
          marksMissing.push({
            ...issueItem(learner),
            taskTitle: task.title || task.assessmentType || 'Assessment',
            dueDate: task.dueDate || null,
          });
        }
      });
  });

  return {
    learners: activeLearners,
    schools: Array.from(schoolByCode.values()),
    hierarchy,
    plans: plans.filter((plan) => schoolByCode.has(plan.schoolCode)),
    issues: { targets: targetsMissing, promotion: promotionMissing, marks: marksMissing },
    year: currentYear,
    previousYear,
  };
}

function issueItem(learner: Learner): FollowUpItem {
  return {
    learnerId: learner.id,
    learnerName: learner.fullName,
    schoolCode: learner.schoolCode,
    classCode: learner.classCode || learner.gradeLevel || 'Class not set',
    regionCode: learner.regionCode || '',
    countyCode: learner.countyCode || '',
    subCountyCode: learner.subCountyCode || '',
  };
}

function nextDrillLevel(path: DrillPathItem[], scopeType: ScopeType): HierarchyType | null {
  const current = path[path.length - 1]?.entityType || scopeType;
  if (path.length === 0) return NEXT_LEVEL[scopeType];
  if (current === 'region') return 'county';
  if (current === 'county') return 'subCounty';
  if (current === 'subCounty') return 'school';
  return null;
}

function belongsTo(item: FollowUpItem, path: DrillPathItem[], scopeType: ScopeType, scopeCode: string) {
  const allPath = scopeType === 'nation'
    ? path
    : [{ entityType: scopeType as HierarchyType, code: scopeCode, name: '' }, ...path];
  return allPath.every((level) => {
    if (level.entityType === 'school') return item.schoolCode === level.code;
    if (level.entityType === 'subCounty') return item.subCountyCode === level.code;
    if (level.entityType === 'county') return item.countyCode === level.code;
    return item.regionCode === level.code;
  });
}

function LearnerFollowUpDashboard({ scopeType, scopeCode, scopeName, nationCode }: Props) {
  const client = useMemo(() => generateClient(), []);
  const [expanded, setExpanded] = useState(false);
  const [issueType, setIssueType] = useState<IssueType>('targets');
  const [path, setPath] = useState<DrillPathItem[]>([]);
  const [search, setSearch] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [planNotice, setPlanNotice] = useState('');
  const [planSaving, setPlanSaving] = useState(false);
  const [isPrincipal, setIsPrincipal] = useState(false);
  const [principalId, setPrincipalId] = useState('');
  const [gradeDrafts, setGradeDrafts] = useState<GradeCounts>(emptyGradeCounts);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestRef = useRef(0);
  const level = nextDrillLevel(path, scopeType);

  useEffect(() => {
    if (!expanded || !scopeCode || !nationCode) return;
    const requestId = ++requestRef.current;
    const load = async () => {
      setLoading(true);
      setNotice('');
      setReport(null);
      try {
        const year = String(new Date().getFullYear());
        const previousYear = String(Number(year) - 1);
        const learnerScopeFilter = scopeType === 'nation'
          ? { nationCode: { eq: nationCode } }
          : { [SCOPE_FIELD[scopeType]]: { eq: scopeCode } };
        const organizationFilter = scopeType === 'school'
          ? { and: [{ nationCode: { eq: nationCode } }, { entityType: { eq: 'school' } }, { code: { eq: scopeCode } }] }
          : { and: [{ nationCode: { eq: nationCode } }, { entityType: { ne: 'nation' } }] };
        const [rawLearners, rawHierarchy, plans, targets, performanceRecords, currentEnrollments, previousEnrollments, tasks] = await Promise.all([
          loadPages<any>(client, listLearnerProfiles, 'listLearnerProfiles', learnerScopeFilter),
          loadPages<any>(client, listOrgHierarchies, 'listOrgHierarchies', organizationFilter),
          loadPages<any>(client, listAnnualSchoolEnrollmentPlans, 'listAnnualSchoolEnrollmentPlans', {
            and: [{ nationCode: { eq: nationCode } }, { academicYear: { eq: year } }],
          }),
          loadPages<any>(client, listAcademicTargets, 'listAcademicTargets', { academicYear: { eq: year } }),
          loadPages<any>(
            client,
            listLearnerSubjectPerformances,
            'listLearnerSubjectPerformances',
            { and: [{ academicYear: { eq: year } }, { [scopeType === 'nation' ? 'nationCode' : SCOPE_FIELD[scopeType]]: { eq: scopeCode } }] },
          ),
          loadPages<any>(client, listLearnerEnrollments, 'listLearnerEnrollments', { academicYear: { eq: year } }),
          loadPages<any>(client, listLearnerEnrollments, 'listLearnerEnrollments', { academicYear: { eq: previousYear } }),
          loadPages<any>(client, listAssessmentTasks, 'listAssessmentTasks', { academicYear: { eq: year } }),
        ]);
        const learners = rawLearners.map(toLearner).filter((learner: Learner | null): learner is Learner => Boolean(learner));
        const session = await fetchAuthSession();
        const tokenPayload = session.tokens?.idToken?.payload as Record<string, unknown> | undefined;
        const groups = Array.isArray(tokenPayload?.['cognito:groups'])
          ? tokenPayload['cognito:groups'] as string[]
          : [];
        setIsPrincipal(groups.includes('principal'));
        setPrincipalId(typeof tokenPayload?.sub === 'string' ? tokenPayload.sub : '');
        const hierarchy: HierarchyRow[] = rawHierarchy
          .filter((row: any) => row?.id && row?.code && row?.name)
          .map((row: any) => ({
            id: row.id,
            entityType: row.entityType,
            code: row.code,
            name: row.name,
            nationCode: row.nationCode,
            regionCode: row.regionCode,
            countyCode: row.countyCode,
            subCountyCode: row.subCountyCode,
            assignedOfficerEmail: row.assignedOfficerEmail,
          }));
        const schoolsInScope = new Set(hierarchy.filter((row) => row.entityType === 'school').map((row) => row.code));
        const scopedTasks = tasks.filter((task) => schoolsInScope.has(task.schoolCode));
        const submissions = scopedTasks.length
          ? await loadPages<any>(client, listAssessmentSubmissions, 'listAssessmentSubmissions')
          : [];
        const scopedEnrollments = [...currentEnrollments, ...previousEnrollments].filter((enrollment) =>
          learners.some((learner: Learner) => learner.id === enrollment.learnerId),
        );
        const nextReport = buildReport(
          learners,
          hierarchy,
          plans,
          targets,
          performanceRecords,
          scopedEnrollments,
          scopedTasks,
          submissions,
          year,
        );
        const currentPlan = nextReport.plans.find((plan) => plan.schoolCode === scopeCode) as EnrollmentPlan | undefined;
        const savedCounts = parseGradeCounts(currentPlan?.expectedLearnersByGrade);
        setGradeDrafts(GRADES.reduce<GradeCounts>((drafts, grade) => {
          drafts[grade] = savedCounts[grade] === undefined ? '' : String(savedCounts[grade]);
          return drafts;
        }, emptyGradeCounts()));
        setPlanNotice('');
        if (requestId === requestRef.current) setReport(nextReport);
      } catch (error) {
        console.warn('load learner follow-up report failed', error);
        if (requestId === requestRef.current) {
          setNotice(error instanceof Error
            ? `Could not load a complete follow-up report: ${error.message}`
            : 'Could not load a complete follow-up report.');
        }
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    };
    void load();
    return () => { requestRef.current += 1; };
  }, [client, expanded, nationCode, refreshKey, scopeCode, scopeType]);

  const currentIssues = useMemo(() => (report?.issues[issueType] || [])
    .filter((item) => belongsTo(item, path, scopeType, scopeCode)), [issueType, path, report, scopeCode, scopeType]);
  const currentSchools = useMemo(() => {
    const codes = new Set(currentIssues.map((item) => item.schoolCode));
    return (report?.schools || []).filter((school) => codes.has(school.code));
  }, [currentIssues, report]);
  const searchableIssues = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return currentIssues;
    return currentIssues.filter((item) =>
      `${item.learnerName} ${item.schoolCode} ${item.classCode} ${item.taskTitle || ''}`
        .toLowerCase().includes(query),
    );
  }, [currentIssues, search]);

  const enrollmentSummaryForPath = (nextPath: DrillPathItem[]) => {
    const empty = {
      expected: 0,
      captured: 0,
      toCapture: 0,
      undeclaredSchools: 0,
      byGrade: GRADES.map((grade) => ({ grade, expected: 0, captured: 0, toCapture: 0, schoolsReported: 0 })),
    };
    if (!report) return empty;
    const allPath = scopeType === 'nation'
      ? nextPath
      : [{ entityType: scopeType as HierarchyType, code: scopeCode, name: '' }, ...nextPath];
    const scopedSchools = report.schools.filter((school) =>
      allPath.every((item) => {
        if (item.entityType === 'school') return school.code === item.code;
        if (item.entityType === 'subCounty') return school.subCountyCode === item.code;
        if (item.entityType === 'county') return school.countyCode === item.code;
        return school.regionCode === item.code;
      }),
    );
    const planBySchool = new Map(report.plans.map((plan) => [plan.schoolCode, plan]));
    const learnersBySchoolGrade = new Map<string, number>();
    report.learners.forEach((learner) => {
      const grade = gradeForLearner(learner);
      if (!grade || !scopedSchools.some((school) => school.code === learner.schoolCode)) return;
      const key = `${learner.schoolCode}#${grade}`;
      learnersBySchoolGrade.set(key, (learnersBySchoolGrade.get(key) || 0) + 1);
    });
    let undeclaredSchools = 0;
    scopedSchools.forEach((school) => {
      const plan = planBySchool.get(school.code);
      const counts = parseGradeCounts(plan?.expectedLearnersByGrade);
      const hasCompletePlan = Boolean(plan && GRADES.every((grade) => counts[grade] !== undefined));
      if (!hasCompletePlan) undeclaredSchools += 1;
      GRADES.forEach((grade, index) => {
        const captured = learnersBySchoolGrade.get(`${school.code}#${grade}`) || 0;
        empty.byGrade[index].captured += captured;
        if (!hasCompletePlan) return;
        const expected = counts[grade] || 0;
        empty.byGrade[index].expected += expected;
        empty.byGrade[index].toCapture += Math.max(0, expected - captured);
        empty.byGrade[index].schoolsReported += 1;
      });
    });
    const expected = empty.byGrade.reduce((total, item) => total + item.expected, 0);
    const captured = empty.byGrade.reduce((total, item) => total + item.captured, 0);
    const toCapture = empty.byGrade.reduce((total, item) => total + item.toCapture, 0);
    return { expected, captured, toCapture, undeclaredSchools, byGrade: empty.byGrade };
  };

  const children = useMemo(() => {
    if (!report || !level) return [];
    const parentPath = path.length
      ? path
      : scopeType === 'nation' ? [] : [{ entityType: scopeType as HierarchyType, code: scopeCode, name: scopeName }];
    const parent = parentPath[parentPath.length - 1];
    const expectedField: keyof HierarchyRow | null = level === 'region' ? null
      : level === 'county' ? 'regionCode'
        : level === 'subCounty' ? 'countyCode' : 'subCountyCode';
    return report.hierarchy.filter((item) =>
      item.entityType === level &&
      (level === 'region'
        ? item.nationCode === nationCode
        : item[expectedField as keyof HierarchyRow] === parent?.code) &&
      (currentIssues.some((issue) => belongsTo(issue, [...path, {
        entityType: item.entityType,
        code: item.code,
        name: item.name,
      }], scopeType, scopeCode)) ||
        enrollmentSummaryForPath([...path, {
          entityType: item.entityType,
          code: item.code,
          name: item.name,
        }]).expected > 0 ||
        enrollmentSummaryForPath([...path, {
          entityType: item.entityType,
          code: item.code,
          name: item.name,
        }]).undeclaredSchools > 0 ||
        report.learners.some((learner) => item.entityType === 'school'
          ? learner.schoolCode === item.code
          : item.entityType === 'subCounty'
            ? learner.subCountyCode === item.code
            : item.entityType === 'county'
              ? learner.countyCode === item.code
              : learner.regionCode === item.code)),
    );
  }, [currentIssues, level, nationCode, path, report, scopeCode, scopeName, scopeType]);

  const countsForPath = (nextPath: DrillPathItem[]) => {
    if (!report) return { learners: 0, schools: 0, overdue: 0, toCapture: 0, undeclaredSchools: 0 };
    const items = report.issues[issueType].filter((item) => belongsTo(item, nextPath, scopeType, scopeCode));
    const today = new Date().toISOString().slice(0, 10);
    const expected = enrollmentSummaryForPath(nextPath);
    return {
      learners: new Set(items.map((item) => item.learnerId)).size,
      schools: new Set(items.map((item) => item.schoolCode)).size,
      toCapture: expected.toCapture,
      undeclaredSchools: expected.undeclaredSchools,
      overdue: issueType === 'marks'
        ? items.filter((item) => item.dueDate && item.dueDate <= today).length
        : 0,
    };
  };

  const selectedSchool = path[path.length - 1]?.entityType === 'school'
    ? path[path.length - 1].code
    : scopeType === 'school' ? scopeCode : null;
  const classGroups = selectedSchool
    ? Array.from(new Set(currentIssues
      .filter((item) => item.schoolCode === selectedSchool)
      .map((item) => item.classCode)))
      .sort((left, right) => left.localeCompare(right))
    : [];
  const finalPathType = path[path.length - 1]?.entityType || scopeType;
  const isSchoolDetail = finalPathType === 'school' || scopeType === 'school';
  const today = new Date().toISOString().slice(0, 10);
  const enrollmentSummary = enrollmentSummaryForPath(path);
  const outstandingLearners = new Set(currentIssues.map((item) => item.learnerId)).size +
    (issueType === 'targets' ? enrollmentSummary.toCapture : 0);
  const outstandingSchools = new Set(currentIssues.map((item) => item.schoolCode)).size;
  const overdueCount = issueType === 'marks'
    ? currentIssues.filter((item) => item.dueDate && item.dueDate <= today).length
    : 0;
  const displayedTitle = path.length ? path[path.length - 1].name : scopeName;

  const saveEnrollmentPlan = async () => {
    if (!report || scopeType !== 'school') return;
    setPlanNotice('');
    const invalidGrade = GRADES.find((grade) =>
      gradeDrafts[grade].trim() === '' ||
      !/^\d+$/.test(gradeDrafts[grade].trim()) ||
      !Number.isSafeInteger(Number(gradeDrafts[grade]))
    );
    if (invalidGrade) {
      setPlanNotice(`Enter a whole-number expected learner count (0 or greater) for every grade. Grade ${invalidGrade} is missing or invalid.`);
      return;
    }
    if (!isPrincipal) {
      setPlanNotice('Only the school principal can declare expected learner counts.');
      return;
    }
    if (!principalId) {
      setPlanNotice('Your signed-in principal identity could not be verified. Sign in again and retry.');
      return;
    }
    const expectedLearnersByGrade = GRADES.reduce<Record<Grade, number>>((counts, grade) => {
      counts[grade] = Number(gradeDrafts[grade]);
      return counts;
    }, { '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0 });
    const existingPlan = report.plans.find((plan) => plan.schoolCode === scopeCode);
    const declaredAt = new Date().toISOString();
    const input = {
      ...(existingPlan?.id ? { id: existingPlan.id } : { id: `${scopeCode}#${report.year}` }),
      nationCode,
      regionCode: report.schools.find((school) => school.code === scopeCode)?.regionCode || '',
      countyCode: report.schools.find((school) => school.code === scopeCode)?.countyCode || '',
      subCountyCode: report.schools.find((school) => school.code === scopeCode)?.subCountyCode || '',
      schoolCode: scopeCode,
      academicYear: report.year,
      expectedLearnersByGrade: JSON.stringify(expectedLearnersByGrade),
      declaredByUserId: principalId,
      declaredAt,
    };
    try {
      setPlanSaving(true);
      const result: any = await client.graphql({
        query: existingPlan ? updateAnnualSchoolEnrollmentPlan : createAnnualSchoolEnrollmentPlan,
        variables: { input },
      } as any);
      if (result?.errors?.length) {
        throw new Error(result.errors.map((item: any) => item?.message || 'Unknown GraphQL error').join('; '));
      }
      const savedPlan = result?.data?.[existingPlan ? 'updateAnnualSchoolEnrollmentPlan' : 'createAnnualSchoolEnrollmentPlan'];
      if (!savedPlan?.id) throw new Error('The saved annual enrollment plan was not returned by the server.');
      setPlanNotice(`Grade 7–12 expected counts saved for academic year ${report.year}.`);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      console.warn('save annual school enrollment plan failed', error);
      setPlanNotice(error instanceof Error
        ? `Could not save the expected learner counts: ${error.message}`
        : 'Could not save the expected learner counts.');
    } finally {
      setPlanSaving(false);
    }
  };

  return (
    <SectionCard
      title="Progress follow-up"
      subtitle={`Outstanding targets, promotions, and assessment marks for ${scopeName}.`}
      defaultExpanded={false}
      expanded={expanded}
      onToggle={(next) => {
        setExpanded(next);
        if (!next) {
          requestRef.current += 1;
          setLoading(false);
        }
      }}
    >
      {expanded ? (
        <View>
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
              <ActivityIndicator size="small" color="#176b87" />
              <Text style={{ marginLeft: 10, color: '#374151' }}>Loading school, learner, target, and assessment records...</Text>
            </View>
          ) : null}
          {notice ? <Text style={{ color: '#b91c1c', marginVertical: 8 }}>{notice}</Text> : null}
          {!loading && !notice && report ? (
            <>
              <Text style={{ color: '#475569', fontSize: 13, marginBottom: 10 }}>
                Academic year {report.year}. Promotion follow-up checks the {report.previousYear} enrollment cohort against promotion flags and current-year enrollments.
              </Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 10 }}>
                Assessment tasks are marked past due from their saved due dates. Target and promotion records currently have academic-year tracking but no separate deadline configured.
              </Text>
              <View style={{ borderWidth: 1, borderColor: '#dbe3e5', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 16 }}>Annual expected enrolment · Grades 7–12</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4, marginBottom: 10 }}>
                  Declared school totals are compared with currently captured active learner profiles. {enrollmentSummary.undeclaredSchools} {enrollmentSummary.undeclaredSchools === 1 ? 'school has' : 'schools have'} not declared all six grade counts.
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  <SummaryPill label="Expected (declared)" value={enrollmentSummary.expected} />
                  <SummaryPill label="Captured" value={enrollmentSummary.captured} />
                  <SummaryPill label="Yet to capture" value={enrollmentSummary.toCapture} urgent />
                  <SummaryPill label="Schools to declare" value={enrollmentSummary.undeclaredSchools} urgent />
                </View>
                {enrollmentSummary.byGrade.map((item) => (
                  <View key={item.grade} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
                    <Text style={{ color: '#334155', fontWeight: '600' }}>Grade {item.grade}</Text>
                    <Text style={{ color: '#475569', fontSize: 12 }}>
                      {item.expected} expected · {item.captured} captured · {item.toCapture} yet to capture
                    </Text>
                  </View>
                ))}
                {scopeType === 'school' && isPrincipal ? (
                  <View style={{ borderTopWidth: 1, borderTopColor: '#cbd5e1', marginTop: 10, paddingTop: 10 }}>
                    <Text style={{ color: '#1f2937', fontWeight: '700', marginBottom: 4 }}>
                      Declare {report.year} expected learners
                    </Text>
                    <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 9 }}>
                      Enter the total learners your school expects to capture in each grade at the beginning of the year. Use 0 where no learners are expected.
                    </Text>
                    {GRADES.map((grade) => (
                      <View key={grade} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                        <Text style={{ color: '#334155', fontWeight: '600' }}>Grade {grade}</Text>
                        <TextInput
                          value={gradeDrafts[grade]}
                          onChangeText={(value) => {
                            if (/^\d*$/.test(value)) setGradeDrafts((current) => ({ ...current, [grade]: value }));
                          }}
                          keyboardType="number-pad"
                          accessibilityLabel={`Expected learners in Grade ${grade}`}
                          placeholder="Expected count"
                          maxLength={7}
                          style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, minWidth: 130, textAlign: 'right', color: '#111827' }}
                        />
                      </View>
                    ))}
                    <TouchableOpacity
                      onPress={() => void saveEnrollmentPlan()}
                      disabled={planSaving || loading}
                      accessibilityRole="button"
                      style={{ backgroundColor: planSaving ? '#94a3b8' : '#176b87', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 4 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>{planSaving ? 'Saving expected counts...' : 'Save annual expected counts'}</Text>
                    </TouchableOpacity>
                    {planNotice ? <Text style={{ color: planNotice.startsWith('Could not') ? '#b91c1c' : '#15803d', fontSize: 12, marginTop: 8 }}>{planNotice}</Text> : null}
                  </View>
                ) : scopeType === 'school' ? (
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>Only the assigned principal can declare or update expected annual counts.</Text>
                ) : null}
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {(Object.keys(ISSUE_LABEL) as IssueType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => { setIssueType(type); setPath([]); setSearch(''); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: issueType === type }}
                    style={{
                      paddingVertical: 9,
                      paddingHorizontal: 11,
                      borderRadius: 9,
                      borderWidth: 1,
                      borderColor: issueType === type ? '#176b87' : '#cbd5e1',
                      backgroundColor: issueType === type ? '#e8f4f7' : '#fff',
                    }}
                  >
                    <Text style={{ color: issueType === type ? '#176b87' : '#334155', fontWeight: '700', fontSize: 12 }}>
                      {ISSUE_LABEL[type]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ color: '#1f2937', fontWeight: '700', fontSize: 17 }}>{ISSUE_LABEL[issueType]} · {displayedTitle}</Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{ISSUE_DESCRIPTION[issueType]}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 }}>
                <SummaryPill label={issueType === 'marks' ? 'Missing scores' : 'Learners outstanding'} value={issueType === 'marks' ? currentIssues.length : outstandingLearners} />
                <SummaryPill label="Schools affected" value={outstandingSchools} />
                {issueType === 'marks' ? <SummaryPill label="Past due" value={overdueCount} urgent /> : null}
              </View>
              {path.length ? (
                <TouchableOpacity
                  onPress={() => { setPath((current) => current.slice(0, -1)); setSearch(''); }}
                  accessibilityRole="button"
                  style={{ alignSelf: 'flex-start', marginBottom: 10 }}
                >
                  <Text style={{ color: '#176b87', fontWeight: '700' }}>‹ Back to {path.length > 1 ? path[path.length - 2].name : scopeName}</Text>
                </TouchableOpacity>
              ) : null}
              {level && children.length ? (
                <View style={{ gap: 8, marginBottom: 12 }}>
                  <Text style={{ color: '#334155', fontWeight: '700' }}>Drill down by {level === 'subCounty' ? 'sub-county' : level}</Text>
                  {children.map((child) => {
                    const childPath = [...path, { entityType: child.entityType, code: child.code, name: child.name }];
                    const counts = countsForPath(childPath);
                    return (
                      <TouchableOpacity
                        key={child.id}
                        onPress={() => { setPath(childPath); setSearch(''); }}
                        accessibilityRole="button"
                        style={{ borderWidth: 1, borderColor: '#dbe3e5', borderRadius: 9, padding: 11 }}
                      >
                        <Text style={{ color: '#1f2937', fontWeight: '700' }}>{child.name}</Text>
                        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>
                          {counts.learners} learners affected · {counts.schools} schools with outstanding work
                          {issueType === 'marks' ? ` · ${counts.overdue} past-due scores` : ''}
                        </Text>
                        {issueType === 'targets' && counts.toCapture > 0 ? (
                          <Text style={{ color: '#92400e', fontSize: 12, marginTop: 3 }}>{counts.toCapture} additional learner places are yet to be captured.</Text>
                        ) : null}
                        {counts.undeclaredSchools > 0 ? (
                          <Text style={{ color: '#92400e', fontSize: 12, marginTop: 3 }}>{counts.undeclaredSchools} schools have not declared all six grade totals.</Text>
                        ) : null}
                        {(() => {
                          const enrollment = enrollmentSummaryForPath(childPath);
                          return enrollment.expected || enrollment.captured ? (
                            <Text style={{ color: '#475569', fontSize: 12, marginTop: 3 }}>
                              {enrollment.expected} expected · {enrollment.captured} captured · {enrollment.toCapture} yet to capture
                            </Text>
                          ) : null;
                        })()}
                        {child.assignedOfficerEmail ? (
                          <Text style={{ color: '#176b87', fontSize: 12, marginTop: 3 }}>
                            {child.entityType === 'school' ? 'Principal' : 'Responsible officer'}: {child.assignedOfficerEmail}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
              {isSchoolDetail || !level || !children.length ? (
                <>
                  {currentSchools.map((school) => (
                    <View key={school.code} style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 9, marginTop: 8 }}>
                      <Text style={{ color: '#1f2937', fontWeight: '700' }}>{school.name}</Text>
                      <Text style={{ color: '#64748b', fontSize: 12 }}>{school.code} · Principal: {school.assignedOfficerEmail || 'Contact not recorded'}</Text>
                    </View>
                  ))}
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search learner, class, school, or assessment"
                    accessibilityLabel="Search follow-up items"
                    style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginVertical: 12, color: '#111827' }}
                  />
                  {isSchoolDetail && classGroups.map((classCode) => {
                    const items = searchableIssues.filter((item) =>
                      item.schoolCode === selectedSchool && item.classCode === classCode,
                    );
                    if (!items.length) return null;
                    return (
                      <View key={classCode} style={{ backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 9 }}>
                        <Text style={{ color: '#1f2937', fontWeight: '700', marginBottom: 6 }}>Class {classCode} · {new Set(items.map((item) => item.learnerId)).size} learners · {items.length} items</Text>
                        {items.map((item, index) => (
                          <View key={`${item.learnerId}-${item.taskTitle || issueType}-${index}`} style={{ paddingVertical: 7, borderTopWidth: index ? 1 : 0, borderTopColor: '#e2e8f0' }}>
                            <Text style={{ color: '#334155', fontWeight: '600' }}>{item.learnerName}</Text>
                            <Text style={{ color: '#64748b', fontSize: 12 }}>
                              {item.taskTitle ? `${item.taskTitle} · ${item.dueDate ? `Due ${item.dueDate}${item.dueDate <= today ? ' · PAST DUE' : ''}` : 'No due date set'}` : `Learner ID: ${item.learnerId}`}
                            </Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                  {!currentIssues.length ? <Text style={{ color: '#15803d', marginTop: 10 }}>No outstanding {ISSUE_LABEL[issueType].toLowerCase()} were found in this scope.</Text> : null}
                  {searchableIssues.length === 0 && currentIssues.length > 0 ? <Text style={{ color: '#64748b' }}>No matching learners or assessments.</Text> : null}
                </>
              ) : null}
              <TouchableOpacity
                onPress={() => setRefreshKey((current) => current + 1)}
                accessibilityRole="button"
                style={{ alignSelf: 'flex-start', marginTop: 14 }}
              >
                <Text style={{ color: '#176b87', fontWeight: '700' }}>Refresh follow-up data</Text>
              </TouchableOpacity>
            </>
          ) : null}
          {!loading && notice ? (
            <TouchableOpacity onPress={() => setRefreshKey((current) => current + 1)} accessibilityRole="button">
              <Text style={{ color: '#176b87', fontWeight: '700' }}>Retry follow-up report</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </SectionCard>
  );
}

function SummaryPill({ label, value, urgent = false }: { label: string; value: number; urgent?: boolean }) {
  return (
    <View style={{ backgroundColor: urgent && value > 0 ? '#fef2f2' : '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}>
      <Text style={{ color: urgent && value > 0 ? '#b91c1c' : '#475569', fontSize: 11 }}>{label}</Text>
      <Text style={{ color: urgent && value > 0 ? '#b91c1c' : '#1f2937', fontSize: 16, fontWeight: '800', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

export default LearnerFollowUpDashboard;
