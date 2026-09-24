import React, { useEffect, useMemo, useState } from 'react';
import useSessionUser from '../../hooks/useSessionUser';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { getUrl, uploadData } from 'aws-amplify/storage';
import * as DocumentPicker from 'expo-document-picker';
import awsmobile from '../../aws-exports';
import ViewPerformance from '../../components/teacher/ViewPerformance';
import SectionCard from '../../components/shared/SectionCard';
import calculateHistoricalClusterSeries, { calculateClusterPointsFromSubjects, calculateCourseClusterDeviation, calculateDeviationPercentage, getSelectedCourseClusterRequirement } from '../../utils/cluster';
import {
  createAssessmentRubric,
  createGrade12ResultSummary,
  createLearnerDocumentResource,
  createLearnerEnrollment,
  createLearnerProfile,
  createAcademicRecord,
  updateGrade12ResultSummary,
  updateLearnerEnrollment,
  createUser,
  updateLearnerProfile,
} from '../../graphql/mutations';
import {
  listCoreSubjects,
  listGrade12ResultSummaries,
  listInterventions,
  listJuniorSubjects,
  listLearnerDocumentResources,
  listLearnerEnrollments,
  listLearnerProfiles,
  listSchoolClasses,
  listSNESubjects,
  listSubjects,
  listSupportSubjects,
  listTeacherProfiles,
  listTertiaryCourses,
  listTertiaryInstitutionProfiles,
  listUsers,
} from '../../graphql/queries';

type TeacherContext = {
  id: string;
  userId: string;
  fullName: string;
  nationCode: string;
  regionCode: string;
  countyCode: string;
  subCountyCode: string;
  schoolCode: string;
  tscNumber?: string | null;
};

type AssignedClass = {
  id: string;
  schoolCode: string;
  classCode: string;
  className?: string | null;
  gradeLevel?: string | null;
  academicYear?: string | null;
};

type LearnerRecord = {
  id: string;
  learnerId?: string | null;
  fullName: string;
  assessmentNumber: string;
  gradeLevel?: string | null;
  classCode?: string | null;
  status?: string | null;
};

type LearnerDetails = {
  targetCareer: string;
  careerClusterPoints: string;
  targetClusterPoints: string;
};

type SubjectCatalogItem = {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  learningAreaCode?: string | null;
};

type LearnerDocumentResourceRecord = {
  id: string;
  learnerId: string;
  title: string;
  description?: string | null;
  resourceType: string;
  resourceCategory?: string | null;
  fileKey: string;
  fileName: string;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  status: string;
  createdAt?: string | null;
};

const ACADEMIC_YEAR = '2026';
const STORAGE_BUCKET = awsmobile.aws_user_files_s3_bucket;

export default function TeacherHomeScreen() {
  const client = useMemo(() => generateClient(), []);
  const { sessionUser } = useSessionUser();
  const logAwsError = (scope: string, error: unknown, extra?: Record<string, unknown>) => {
    const typed = error as {
      name?: string;
      message?: string;
      errors?: Array<{ message?: string; errorType?: string; path?: string[] }>;
      recoverySuggestion?: string;
      stack?: string;
    };

    const payload = {
      scope,
      name: typed?.name || 'UnknownError',
      message: typed?.message || String(error),
      graphqlErrors: typed?.errors || [],
      recoverySuggestion: typed?.recoverySuggestion || null,
      extra: extra || null,
    };

    console.log('[EPORTFOLIO_DEBUG]', JSON.stringify(payload, null, 2));
  };
  const [teacherContext, setTeacherContext] = useState<TeacherContext | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [selectedClassCode, setSelectedClassCode] = useState('');
  const [learners, setLearners] = useState<LearnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSubject, setSavingSubject] = useState(false);
  const [notice, setNotice] = useState('');
  const [fullName, setFullName] = useState('');
  const [assessmentNumber, setAssessmentNumber] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [gender, setGender] = useState('');
  const [learnerDetails, setLearnerDetails] = useState<LearnerDetails>({
    targetCareer: '',
    careerClusterPoints: '',
    targetClusterPoints: '',
  });
  const [parentNationalId, setParentNationalId] = useState('');
  const [showLearnerDetails, setShowLearnerDetails] = useState(false);
  const [subjectIntroVisible, setSubjectIntroVisible] = useState(false);
  const [subjectIntroLearner, setSubjectIntroLearner] = useState<LearnerRecord | null>(null);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [selectedLearnerForSubjects, setSelectedLearnerForSubjects] = useState<LearnerRecord | null>(null);
  const resetPerformanceModal = () => {
    setPerformanceSessionId((current) => current + 1);
    setPerformanceAction(null);
    setPerformanceLearner(null);
    setActiveGraphLearnerId(null);
    setSelectedPerformanceSubject(null);
    setPerformanceMarksInput('');
    setLearnerDocumentMap({});
    setLearnerGuidanceMap({});
  };
  const [learnerSubjectsMap, setLearnerSubjectsMap] = useState<
    Record<string, Array<{ id: string; name: string; code?: string; category?: string | null; targetMarks?: number | null; marksScored?: number | null }>>
  >({});
  const [learnerProfileMap, setLearnerProfileMap] = useState<Record<string, any>>({});
  const [learnerCareerMap, setLearnerCareerMap] = useState<Record<string, string | null>>({});
  const [performanceLearner, setPerformanceLearner] = useState<LearnerRecord | null>(null);
  const [activeGraphLearnerId, setActiveGraphLearnerId] = useState<string | null>(null);
  const [performanceAction, setPerformanceAction] = useState<'menu' | 'viewMenu' | 'subject' | 'documents' | 'cluster' | 'rubric' | 'viewCluster' | 'viewSubjects' | 'viewGuidance' | 'viewEPortfolio' | null>(null);
  const [performanceSessionId, setPerformanceSessionId] = useState(0);
  const [selectedPerformanceSubject, setSelectedPerformanceSubject] = useState<{ id: string; name: string; code?: string; category?: string | null; targetMarks?: number | null; marksScored?: number | null } | null>(null);
  const [performanceMarksInput, setPerformanceMarksInput] = useState('');
  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [promotionLearner, setPromotionLearner] = useState<LearnerRecord | null>(null);
  const [promotionGradeInput, setPromotionGradeInput] = useState('');
  const [careerTargetModalVisible, setCareerTargetModalVisible] = useState(false);
  const [careerTargetLearner, setCareerTargetLearner] = useState<LearnerRecord | null>(null);
  const [careerTargetInput, setCareerTargetInput] = useState('');
  const [careerPickerVisible, setCareerPickerVisible] = useState(false);
  const [courseFilterInstitution, setCourseFilterInstitution] = useState('');
  const [courseFilterCourseName, setCourseFilterCourseName] = useState('');
  const [careerOptions, setCareerOptions] = useState<Array<{
    id: string;
    institutionId: string | null;
    institutionName: string | null;
    courseName: string;
    minimumClusterScore?: number | null;
  }>>([]);
  const [careerOptionsLoading, setCareerOptionsLoading] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const filteredCareerOptions = useMemo(() => {
    const institutionQuery = courseFilterInstitution.trim().toLowerCase();
    const courseQuery = courseFilterCourseName.trim().toLowerCase();

    return careerOptions.filter((career) => {
      const institutionMatches = !institutionQuery || (career.institutionName || '').toLowerCase().includes(institutionQuery);
      const courseMatches = !courseQuery || career.courseName.toLowerCase().includes(courseQuery);
      return institutionMatches && courseMatches;
    });
  }, [careerOptions, courseFilterInstitution, courseFilterCourseName]);
  const [promotingLearner, setPromotingLearner] = useState(false);
  const [reassigningSubjects, setReassigningSubjects] = useState(false);
  const [resettingCareerTarget, setResettingCareerTarget] = useState(false);
  const [resettingSubjectTargets, setResettingSubjectTargets] = useState(false);
  const [expandedSubjectsLearnerId, setExpandedSubjectsLearnerId] = useState<string | null>(null);
  const [learnerGuidanceMap, setLearnerGuidanceMap] = useState<Record<string, Array<{ id: string; note: string; authorRole?: string | null; authorDisplayName?: string | null; schoolGrade?: string | null; createdAt?: string | null }>>>({});
  const [subjectPerformanceDrafts, setSubjectPerformanceDrafts] = useState<Record<string, string>>({});
  const [learnerClusterPointsMap, setLearnerClusterPointsMap] = useState<Record<string, number>>({});
  const [learnerDocumentMap, setLearnerDocumentMap] = useState<Record<string, LearnerDocumentResourceRecord[]>>({});
  const [rubricTitle, setRubricTitle] = useState('');
  const [rubricDescription, setRubricDescription] = useState('');
  const [rubricCriteriaText, setRubricCriteriaText] = useState('');
  const [savingRubric, setSavingRubric] = useState(false);
  const [savingPerformance, setSavingPerformance] = useState(false);
  const [savingSubjectMap, setSavingSubjectMap] = useState<Record<string, boolean>>({});
  const [calculatingClusterPoints, setCalculatingClusterPoints] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [openingDocumentId, setOpeningDocumentId] = useState('');
  const [documentTitleInput, setDocumentTitleInput] = useState('');
  const [documentDescriptionInput, setDocumentDescriptionInput] = useState('');
  const [documentDebugMessage, setDocumentDebugMessage] = useState('');
  const [subjectGroups, setSubjectGroups] = useState<Array<{ title: string; items: SubjectCatalogItem[] }>>([]);
  const [subjectGroupsLoading, setSubjectGroupsLoading] = useState(false);
  const [subjectSelectionStep, setSubjectSelectionStep] = useState<'category' | 'subjects' | 'details'>('category');
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState<'Junior Secondary' | 'Senior Secondary' | 'Vocational SNE' | ''>('');
  const [selectedSubjectCandidate, setSelectedSubjectCandidate] = useState<SubjectCatalogItem | null>(null);
  const [targetMarksInput, setTargetMarksInput] = useState('');

  useEffect(() => {
    void loadTeacherContext();
  }, [client]);

  useEffect(() => {
    void loadCareerOptions();
  }, [client]);

  const loadCareerOptions = async () => {
    try {
      setCareerOptionsLoading(true);
      const [coursesResult, institutionsResult] = await Promise.all([
        client.graphql({
          query: listTertiaryCourses,
          variables: { limit: 500 },
        }),
        client.graphql({
          query: listTertiaryInstitutionProfiles,
          variables: { limit: 500 },
        }),
      ]);

      const coursePayload = coursesResult as { data?: { listTertiaryCourses?: { items?: Array<any> } } };
      const institutionPayload = institutionsResult as { data?: { listTertiaryInstitutionProfiles?: { items?: Array<any> } } };

      const institutions = (institutionPayload.data?.listTertiaryInstitutionProfiles?.items || []).reduce((map: Record<string, string>, item: any) => {
        if (item?.id) {
          map[String(item.id)] = String(item.institutionName || 'Unknown institution').trim();
        }
        return map;
      }, {});

      const items = (coursePayload.data?.listTertiaryCourses?.items || [])
        .filter((item: any) => typeof item?.courseName === 'string' && item.courseName.trim())
        .slice()
        .sort((a: any, b: any) => String(a.courseName).localeCompare(String(b.courseName)));

      const mapped = items.map((item: any) => ({
        id: String(item.id),
        institutionId: item?.institutionId ? String(item.institutionId) : null,
        institutionName: item?.institutionId ? (institutions[String(item.institutionId)] || null) : null,
        courseName: String(item.courseName).trim(),
        minimumClusterScore: typeof item.minimumClusterScore === 'number' ? item.minimumClusterScore : Number(item.minimumClusterScore) || null,
      }));

      setCareerOptions(mapped);
    } catch (error) {
      console.warn('[CAREER_OPTIONS_LOAD_FAILED]', error);
      setCareerOptions([]);
    } finally {
      setCareerOptionsLoading(false);
    }
  };

  const loadTeacherContext = async () => {
    try {
      setLoading(true);
      setNotice('');

      const session = await fetchAuthSession();
      const sessionEmail = (
        (session.tokens?.idToken?.payload as { email?: string } | undefined)?.email ||
        (session.tokens?.accessToken?.payload as { username?: string } | undefined)?.username ||
        ''
      )
        .trim()
        .toLowerCase();

      if (!sessionEmail) {
        const currentUser = await getCurrentUser();
        const fallbackEmail = currentUser.username || '';
        if (!fallbackEmail) {
          throw new Error('No signed-in teacher email was found.');
        }
      }

      const userQuery = await client.graphql({
        query: listUsers,
        variables: {
          filter: {
            email: { eq: sessionEmail },
          },
          limit: 20,
        },
      });

      const userPayload = userQuery as { data?: { listUsers?: { items?: Array<any> } } };
      const userRecord = userPayload.data?.listUsers?.items?.[0];

      if (!userRecord?.id) {
        throw new Error('Your teacher account could not be matched to a user record.');
      }

      const teacherQuery = await client.graphql({
        query: listTeacherProfiles,
        variables: {
          filter: {
            userId: { eq: userRecord.id },
          },
          limit: 20,
        },
      });

      const teacherPayload = teacherQuery as { data?: { listTeacherProfiles?: { items?: Array<any> } } };
      const teacherRecord = teacherPayload.data?.listTeacherProfiles?.items?.[0];

      if (!teacherRecord?.id) {
        throw new Error('No teacher profile was found for this account.');
      }

      const teacher: TeacherContext = {
        id: teacherRecord.id,
        userId: teacherRecord.userId,
        fullName: teacherRecord.fullName,
        nationCode: teacherRecord.nationCode,
        regionCode: teacherRecord.regionCode,
        countyCode: teacherRecord.countyCode,
        subCountyCode: teacherRecord.subCountyCode,
        schoolCode: teacherRecord.schoolCode,
        tscNumber: teacherRecord.tscNumber,
      };

      setTeacherContext(teacher);

      const classesQuery = await client.graphql({
        query: listSchoolClasses,
        variables: {
          filter: {
            and: [{ schoolCode: { eq: teacher.schoolCode } }, { teacherIds: { contains: teacher.id } }],
          },
          limit: 200,
        },
      });

      const classPayload = classesQuery as { data?: { listSchoolClasses?: { items?: Array<any> } } };
      const assigned = (classPayload.data?.listSchoolClasses?.items || [])
        .filter((item: any) => item?.schoolCode === teacher.schoolCode)
        .map((item: any) => ({
          id: item.id,
          schoolCode: item.schoolCode,
          classCode: item.classCode,
          className: item.className,
          gradeLevel: item.gradeLevel,
          academicYear: item.academicYear,
        }));

      const unique = assigned.filter(
        (item, index, array) => array.findIndex((candidate) => candidate.classCode === item.classCode) === index,
      );

      setAssignedClasses(unique);

      if (unique.length > 0) {
        setSelectedClassCode(unique[0].classCode || '');
      } else {
        setSelectedClassCode('');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load your teacher class data.';
      setNotice(message);
      setTeacherContext(null);
      setAssignedClasses([]);
      setSelectedClassCode('');
    } finally {
      setLoading(false);
    }
  };

  const loadClassLearners = async (classCode: string) => {
    if (!teacherContext || !classCode) {
      setLearners([]);
      setLearnerDocumentMap({});
      return;
    }

    try {
      const result = await client.graphql({
        query: listLearnerProfiles,
        variables: {
          filter: {
            and: [
              { schoolCode: { eq: teacherContext.schoolCode } },
              { classCode: { eq: classCode } },
            ],
          },
          limit: 200,
        },
      });

      const payload = result as { data?: { listLearnerProfiles?: { items?: Array<any> } } };
      const mapped = (payload.data?.listLearnerProfiles?.items || []).map((item: any) => ({
        id: item.id,
        learnerId: item.learnerId || item.id,
        fullName: item.fullName,
        assessmentNumber: item.assessmentNumber,
        gradeLevel: item.gradeLevel,
        classCode: item.classCode,
        status: item.status,
      }));

      setLearners(mapped);
      await Promise.all([
        ...mapped.map((learner) => loadSelectedLearnerSubjects(learner.id)),
        loadClassLearnerDocuments(classCode),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load class learners.';
      setNotice(message);
      setLearners([]);
      setLearnerDocumentMap({});
    }
  };

  useEffect(() => {
    if (selectedClassCode) {
      void loadClassLearners(selectedClassCode);
    }
  }, [selectedClassCode, teacherContext]);

  const loadSelectedLearnerSubjects = async (learnerId: string) => {
    try {
      const result = await client.graphql({
        query: listLearnerProfiles,
        variables: {
          filter: {
            id: { eq: learnerId },
          },
          limit: 20,
        },
      });

      const payload = result as { data?: { listLearnerProfiles?: { items?: Array<any> } } };
      const learnerRecord = payload.data?.listLearnerProfiles?.items?.[0];
      const supportProfile = learnerRecord?.supportProfile;

      if (!supportProfile) {
        setLearnerSubjectsMap((current) => ({ ...current, [learnerId]: [] }));
        return;
      }

      const parsedProfile = typeof supportProfile === 'string' ? JSON.parse(supportProfile) : supportProfile;
      const selectedSubjects = Array.isArray(parsedProfile?.selectedSubjects) ? parsedProfile.selectedSubjects : [];
      const savedClusterPoints = Number(parsedProfile?.targetClusterPoints ?? 0);
      const savedCareerTarget = typeof parsedProfile?.targetCareer === 'string' && parsedProfile.targetCareer.trim().length > 0
        ? parsedProfile.targetCareer.trim()
        : null;

      console.log('[DEBUG_SUPPORT_PROFILE]', JSON.stringify({
        learnerId,
        gradeLevel: learnerRecord?.gradeLevel,
        selectedSubjectsCount: selectedSubjects.length,
        historicalSelectedSubjectsCount: Array.isArray(parsedProfile?.historicalSelectedSubjects) ? parsedProfile.historicalSelectedSubjects.length : 0,
        selectedSubjects: selectedSubjects.map((subject: any) => ({ name: subject?.name, targetMarks: subject?.targetMarks, marksScored: subject?.marksScored, history: Array.isArray(subject?.history) ? subject.history : [] })),
        historicalSelectedSubjects: Array.isArray(parsedProfile?.historicalSelectedSubjects) ? parsedProfile.historicalSelectedSubjects.map((subject: any) => ({ name: subject?.name, targetMarks: subject?.targetMarks, marksScored: subject?.marksScored, history: Array.isArray(subject?.history) ? subject.history : [] })) : [],
        targetCareer: savedCareerTarget,
        targetClusterPoints: savedClusterPoints,
      }, null, 2));

      const mappedSubjects = selectedSubjects.map((item: any) => ({
        id: item?.id || `${item?.code || item?.name || 'subject'}-${Math.random()}`,
        name: item?.name || 'Unnamed subject',
        code: item?.code || undefined,
        category: item?.category || null,
        targetMarks: item?.targetMarks ?? null,
        marksScored: item?.marksScored ?? null,
      }));

      setLearnerProfileMap((current) => ({ ...current, [learnerId]: parsedProfile }));
      setLearnerSubjectsMap((current) => ({ ...current, [learnerId]: mappedSubjects }));
      setLearnerCareerMap((current) => ({ ...current, [learnerId]: savedCareerTarget }));
      setLearnerClusterPointsMap((current) => ({
        ...current,
        [learnerId]: Number.isFinite(savedClusterPoints) ? savedClusterPoints : 0,
      }));
    } catch {
      setLearnerSubjectsMap((current) => ({ ...current, [learnerId]: [] }));
    }
  };

  const loadClassLearnerDocuments = async (classCode: string) => {
    if (!teacherContext || !classCode) {
      setLearnerDocumentMap({});
      return;
    }

    try {
      const result = await client.graphql({
        query: listLearnerDocumentResources,
        variables: {
          filter: {
            and: [
              { schoolCode: { eq: teacherContext.schoolCode } },
              { classCode: { eq: classCode } },
            ],
          },
          limit: 500,
        },
      });

      const payload = result as { data?: { listLearnerDocumentResources?: { items?: Array<any> } } };
      const items = (payload.data?.listLearnerDocumentResources?.items || [])
        .filter((item: any) => item?.id && item?.learnerId && item?.fileKey)
        .map((item: any) => ({
          id: item.id,
          learnerId: item.learnerId,
          title: item.title,
          description: item.description || null,
          resourceType: item.resourceType || 'document',
          resourceCategory: item.resourceCategory || null,
          fileKey: item.fileKey,
          fileName: item.fileName,
          fileType: item.fileType || null,
          fileSizeBytes: typeof item.fileSizeBytes === 'number' ? item.fileSizeBytes : null,
          status: item.status || 'pending_review',
          createdAt: item.createdAt || null,
        }))
        .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

      const grouped = items.reduce<Record<string, LearnerDocumentResourceRecord[]>>((accumulator, item) => {
        if (!accumulator[item.learnerId]) {
          accumulator[item.learnerId] = [];
        }
        accumulator[item.learnerId].push(item);
        return accumulator;
      }, {});

      setLearnerDocumentMap(grouped);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load learner documents.';
      setNotice(message);
      setLearnerDocumentMap({});
    }
  };

  const loadLearnerGuidance = async (learnerId: string) => {
    if (!learnerId) {
      return;
    }

    try {
      const result = await client.graphql({
        query: listInterventions,
        variables: {
          filter: {
            learnerId: { eq: learnerId },
          },
          limit: 200,
        },
      } as any);

      const rows = (result as any).data?.listInterventions?.items || [];
      const userIds = Array.from(new Set(rows.map((row: any) => row.authorUserId).filter(Boolean)));
      let usersMap: Record<string, any> = {};

      if (userIds.length > 0) {
        try {
          const usersResult = await client.graphql({
            query: listUsers,
            variables: {
              filter: { id: { in: userIds } },
              limit: 200,
            },
          } as any);
          const users = (usersResult as any).data?.listUsers?.items || [];
          usersMap = users.reduce((acc: Record<string, any>, user: any) => {
            if (user && user.id) acc[user.id] = user;
            return acc;
          }, {} as Record<string, any>);
        } catch {
          usersMap = {};
        }
      }

      const mapped = rows
        .map((row: any) => ({
          id: row.id,
          note: row.note || 'No comment text available.',
          authorRole: row.authorRole || 'Unknown',
          authorDisplayName: row.authorUserId ? (usersMap[row.authorUserId]?.fullName || usersMap[row.authorUserId]?.email || row.authorUserId) : (row.authorRole || 'Unknown'),
          schoolGrade: row.jurisdictionCode || null,
          createdAt: row.createdAt || null,
        }))
        .sort((left: any, right: any) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

      setLearnerGuidanceMap((current) => ({
        ...current,
        [learnerId]: mapped,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load guidance comments.';
      setNotice(message);
      setLearnerGuidanceMap((current) => ({
        ...current,
        [learnerId]: [],
      }));
    }
  };

  const loadLearnerDocuments = async (learnerId: string) => {
    if (!teacherContext || !learnerId) {
      return;
    }

    try {
      console.log('[EPORTFOLIO_DEBUG] loadLearnerDocuments:start', JSON.stringify({ learnerId, schoolCode: teacherContext.schoolCode }));
      const result = await client.graphql({
        query: listLearnerDocumentResources,
        variables: {
          filter: {
            and: [
              { schoolCode: { eq: teacherContext.schoolCode } },
              { learnerId: { eq: learnerId } },
            ],
          },
          limit: 500,
        },
      });

      const payload = result as { data?: { listLearnerDocumentResources?: { items?: Array<any> } } };
      const items = (payload.data?.listLearnerDocumentResources?.items || [])
        .filter((item: any) => item?.id && item?.learnerId && item?.fileKey)
        .map((item: any) => ({
          id: item.id,
          learnerId: item.learnerId,
          title: item.title,
          description: item.description || null,
          resourceType: item.resourceType || 'document',
          resourceCategory: item.resourceCategory || null,
          fileKey: item.fileKey,
          fileName: item.fileName,
          fileType: item.fileType || null,
          fileSizeBytes: typeof item.fileSizeBytes === 'number' ? item.fileSizeBytes : null,
          status: item.status || 'pending_review',
          createdAt: item.createdAt || null,
        }))
        .filter((item) => !item.resourceCategory || item.resourceCategory === 'e_portfolio')
        .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

      setLearnerDocumentMap((current) => ({
        ...current,
        [learnerId]: items,
      }));
      console.log('[EPORTFOLIO_DEBUG] loadLearnerDocuments:success', JSON.stringify({ learnerId, loadedItems: items.length }));
      setDocumentDebugMessage(`Loaded ${items.length} e-portfolio file(s) for learner.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load learner e-portfolio files.';
      setNotice(message);
      setDocumentDebugMessage(`Load failed: ${message}`);
      logAwsError('loadLearnerDocuments', error, { learnerId, selectedClassCode });
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) {
      return 'Size unavailable';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDocumentDate = (value?: string | null) => {
    if (!value) {
      return 'Date unavailable';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Date unavailable';
    }

    return parsed.toLocaleDateString();
  };

  const pickAndUploadLearnerDocument = async (learner: LearnerRecord) => {
    if (!teacherContext) {
      setNotice('Teacher context is not ready for document upload.');
      return;
    }

    try {
      setUploadingDocument(true);
      setDocumentDebugMessage('Opening file picker...');
      console.log('[EPORTFOLIO_DEBUG] upload:start', JSON.stringify({ learnerId: learner.id, classCode: learner.classCode || selectedClassCode }));

      const picked = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: '*/*',
      });

      if (picked.canceled || !picked.assets?.length) {
        setDocumentDebugMessage('Upload cancelled from picker.');
        console.log('[EPORTFOLIO_DEBUG] upload:cancelled');
        return;
      }

      const asset = picked.assets[0];
      setDocumentDebugMessage(`Selected ${asset.name}. Uploading to storage...`);
      const uploadTitle = documentTitleInput.trim() || asset.name.replace(/\.[^.]+$/, '') || 'Learner document';
      const sanitizedName = asset.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const relativeKey = `eportfolio/${teacherContext.schoolCode}/${learner.id}/${Date.now()}-${sanitizedName}`;
      const fileKey = `protected/${relativeKey}`;
      console.log('[EPORTFOLIO_DEBUG] upload:selected', JSON.stringify({
        name: asset.name,
        mimeType: asset.mimeType || null,
        size: asset.size || null,
        relativeKey,
      }));
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      await uploadData({
        path: fileKey,
        data: blob,
        options: {
          contentType: asset.mimeType || 'application/octet-stream',
          metadata: {
            learnerId: learner.id,
            classCode: learner.classCode || selectedClassCode,
            resourceCategory: 'e_portfolio',
          },
        },
      }).result;
      setDocumentDebugMessage('Storage upload complete. Saving metadata...');
      console.log('[EPORTFOLIO_DEBUG] upload:storageSuccess', JSON.stringify({ fileKey, relativeKey }));

      const createResult = await client.graphql({
        query: createLearnerDocumentResource,
        variables: {
          input: {
            learnerId: learner.id,
            schoolCode: teacherContext.schoolCode,
            classCode: learner.classCode || selectedClassCode || null,
            uploadedByUserId: teacherContext.userId,
            uploadedByRole: 'teacher',
            resourceType: asset.mimeType?.startsWith('image/') ? 'image' : 'document',
            resourceCategory: 'e_portfolio',
            title: uploadTitle,
            description: documentDescriptionInput.trim() || null,
            s3Bucket: STORAGE_BUCKET,
            fileKey,
            fileName: asset.name,
            fileType: asset.mimeType || null,
            fileSizeBytes: typeof asset.size === 'number' ? asset.size : null,
            checksum: null,
            relatedCompetencyId: null,
            relatedCoreValueId: null,
            relatedAssessmentId: null,
            relatedObservationId: null,
            isPublished: false,
            status: 'pending_review',
            metadata: JSON.stringify({
              source: 'teacher_documents',
              resourceCategory: 'e_portfolio',
            }),
          },
        },
      });

      const createPayload = createResult as { data?: { createLearnerDocumentResource?: any } };
      const created = createPayload.data?.createLearnerDocumentResource;
      console.log('[EPORTFOLIO_DEBUG] upload:metadataCreateResult', JSON.stringify({
        createdId: created?.id || null,
        learnerId: created?.learnerId || learner.id,
        category: created?.resourceCategory || 'e_portfolio',
      }));
      if (created?.id) {
        const createdRecord: LearnerDocumentResourceRecord = {
          id: created.id,
          learnerId: created.learnerId,
          title: created.title,
          description: created.description || null,
          resourceType: created.resourceType || 'document',
          resourceCategory: created.resourceCategory || null,
          fileKey: created.fileKey,
          fileName: created.fileName,
          fileType: created.fileType || null,
          fileSizeBytes: typeof created.fileSizeBytes === 'number' ? created.fileSizeBytes : null,
          status: created.status || 'pending_review',
          createdAt: created.createdAt || null,
        };

        setLearnerDocumentMap((current) => {
          const existing = current[learner.id] || [];
          return {
            ...current,
            [learner.id]: [createdRecord, ...existing.filter((item) => item.id !== createdRecord.id)],
          };
        });
      }

      setDocumentTitleInput('');
      setDocumentDescriptionInput('');
      setDocumentDebugMessage('Metadata saved. Refreshing learner files...');
      await loadLearnerDocuments(learner.id);
      setNotice(`${asset.name} was uploaded to e-portfolio for ${learner.fullName}.`);
      setDocumentDebugMessage(`Upload successful: ${asset.name}`);
      console.log('[EPORTFOLIO_DEBUG] upload:success', JSON.stringify({ learnerId: learner.id, fileName: asset.name }));
    } catch (error) {
      const graphqlError = error as { errors?: Array<{ message?: string }>; message?: string } | undefined;
      const extractedMessage = graphqlError?.errors?.[0]?.message || graphqlError?.message || 'Could not upload the learner document.';
      setNotice(extractedMessage);
      setDocumentDebugMessage(`Upload failed: ${extractedMessage}`);
      logAwsError('pickAndUploadLearnerDocument', error, {
        learnerId: learner.id,
        classCode: learner.classCode || selectedClassCode,
        schoolCode: teacherContext.schoolCode,
        bucket: STORAGE_BUCKET,
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const openLearnerDocument = async (resource: LearnerDocumentResourceRecord) => {
    try {
      setOpeningDocumentId(resource.id);
      console.log('[EPORTFOLIO_DEBUG] open:start', JSON.stringify({ id: resource.id, fileKey: resource.fileKey }));
      const signed = await getUrl({
        path: resource.fileKey,
        options: {
          validateObjectExistence: true,
          expiresIn: 900,
        },
      });

      await Linking.openURL(signed.url.toString());
      console.log('[EPORTFOLIO_DEBUG] open:success', JSON.stringify({ id: resource.id }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not open the selected document.';
      setNotice(message);
      logAwsError('openLearnerDocument', error, { resourceId: resource.id, fileKey: resource.fileKey });
    } finally {
      setOpeningDocumentId('');
    }
  };

  const openSubjectCategoryModal = async (learner: LearnerRecord) => {
    setSelectedLearnerForSubjects(learner);
    setSelectedSubjectCandidate(null);
    setTargetMarksInput('');
    setSubjectGroups([]);
    setSubjectGroupsLoading(false);
    setSelectedSubjectCategory('');
    setSubjectSelectionStep('category');
    setSubjectModalVisible(true);
    await loadSelectedLearnerSubjects(learner.id);
  };

  const loadCategorySubjects = async (
    category: 'Junior Secondary' | 'Senior Secondary' | 'Vocational SNE',
    learner: LearnerRecord | null = selectedLearnerForSubjects,
  ) => {
    if (!learner) {
      return;
    }

    setSubjectGroups([]);
    setSubjectGroupsLoading(true);

    try {
      if (category === 'Junior Secondary') {
        const result = await client.graphql({
          query: listJuniorSubjects,
          variables: { limit: 200 },
        });

        const payload = result as { data?: { listJuniorSubjects?: { items?: Array<any> } } };
        const items = (payload.data?.listJuniorSubjects?.items || [])
          .filter((item: any) => item?.id && item?.name)
          .map((item: any) => ({
            id: item.id,
            code: item.code || 'JNR',
            name: item.name,
            learningAreaCode: item.learningAreaCode,
            category: 'Junior Secondary',
          }));

        setSubjectGroups([{ title: 'Junior Secondary subjects', items }]);
        return;
      }

      if (category === 'Senior Secondary') {
        const [coreResult, supportResult, electiveResult] = await Promise.all([
          client.graphql({ query: listCoreSubjects, variables: { limit: 200 } }),
          client.graphql({ query: listSupportSubjects, variables: { limit: 200 } }),
          client.graphql({ query: listSubjects, variables: { limit: 200 } }),
        ]);

        const corePayload = coreResult as { data?: { listCoreSubjects?: { items?: Array<any> } } };
        const supportPayload = supportResult as { data?: { listSupportSubjects?: { items?: Array<any> } } };
        const electivesPayload = electiveResult as { data?: { listSubjects?: { items?: Array<any> } } };

        const coreItems = (corePayload.data?.listCoreSubjects?.items || [])
          .filter((item: any) => item?.id && item?.name)
          .map((item: any) => ({
            id: item.id,
            code: item.code || 'CORE',
            name: item.name,
            category: 'Core subjects',
          }));

        const supportItems = (supportPayload.data?.listSupportSubjects?.items || [])
          .filter((item: any) => item?.id && item?.name)
          .map((item: any) => ({
            id: item.id,
            code: item.code || 'SUPP',
            name: item.name,
            category: 'Support subjects',
          }));

        const electives = (electivesPayload.data?.listSubjects?.items || [])
          .filter((item: any) => item?.id && item?.name)
          .map((item: any) => ({
            id: item.id,
            code: item.code || 'ELEC',
            name: item.name,
            category: 'Electives',
          }));

        const organizedElectives = electives.filter((item) => item.name).length > 0 ? electives : [];

        const normalizedElectiveTitle = 'Electives';

        setSubjectGroups([
          { title: 'Core subjects', items: coreItems },
          { title: 'Support subjects', items: supportItems },
          { title: normalizedElectiveTitle, items: organizedElectives },
        ]);
        return;
      }

      const result = await client.graphql({
        query: listSNESubjects,
        variables: { limit: 200 },
      });

      const payload = result as { data?: { listSNESubjects?: { items?: Array<any> } } };
      const items = (payload.data?.listSNESubjects?.items || [])
        .filter((item: any) => item?.id && item?.name)
        .map((item: any) => ({
          id: item.id,
          code: item.code || 'SNE',
          name: item.name,
          learningAreaCode: item.learningAreaCode,
          category: 'Vocational SNE',
        }));

      setSubjectGroups([{ title: 'Vocational SNE subjects', items }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load the subject catalog.';
      setNotice(message);
      setSubjectGroups([{ title: 'Unable to load subjects', items: [] }]);
    } finally {
      setSubjectGroupsLoading(false);
    }
  };

  const removeSubjectFromLearner = async (learnerId: string, subjectId: string) => {
    try {
      const learnerQuery = await client.graphql({
        query: listLearnerProfiles,
        variables: {
          filter: {
            id: { eq: learnerId },
          },
          limit: 20,
        },
      });

      const learnerPayload = learnerQuery as { data?: { listLearnerProfiles?: { items?: Array<any> } } };
      const learnerRecord = learnerPayload.data?.listLearnerProfiles?.items?.[0];

      if (!learnerRecord?.id) {
        throw new Error('Learner record could not be found for removal.');
      }

      const currentProfile = (() => {
        if (!learnerRecord.supportProfile) return {};
        if (typeof learnerRecord.supportProfile === 'string') {
          try {
            return JSON.parse(learnerRecord.supportProfile);
          } catch {
            return {};
          }
        }
        return typeof learnerRecord.supportProfile === 'object' ? learnerRecord.supportProfile : {};
      })();

      const existingSubjects = Array.isArray(currentProfile.selectedSubjects) ? currentProfile.selectedSubjects : [];
      const nextSubjects = existingSubjects.filter((item: any) => item?.id !== subjectId);

      await client.graphql({
        query: updateLearnerProfile,
        variables: {
          input: {
            id: learnerRecord.id,
            supportProfile: JSON.stringify({ ...currentProfile, selectedSubjects: nextSubjects }),
          },
        },
      });

      await loadSelectedLearnerSubjects(learnerId);
      setNotice('Subject removed from learner.');
    } catch (error) {
      const graphqlError = error as { errors?: Array<{ message?: string }>; message?: string } | undefined;
      const extractedMessage = graphqlError?.errors?.[0]?.message || graphqlError?.message || 'Could not remove the subject from the learner.';
      setNotice(extractedMessage);
    }
  };

  const addSubjectToLearner = async (subject: SubjectCatalogItem, targetMarks?: string) => {
    if (!selectedLearnerForSubjects) {
      setNotice('No learner was selected for subject assignment.');
      return;
    }

    setSavingSubject(true);

    try {
      const learnerQuery = await client.graphql({
        query: listLearnerProfiles,
        variables: {
          filter: {
            id: { eq: selectedLearnerForSubjects.id },
          },
          limit: 20,
        },
      });

      const learnerPayload = learnerQuery as { data?: { listLearnerProfiles?: { items?: Array<any> } } };
      const learnerRecord = learnerPayload.data?.listLearnerProfiles?.items?.[0];

      if (!learnerRecord?.id) {
        throw new Error('Learner record could not be found for subject assignment.');
      }

      const currentProfile = (() => {
        if (!learnerRecord.supportProfile) {
          return {};
        }

        if (typeof learnerRecord.supportProfile === 'string') {
          try {
            return JSON.parse(learnerRecord.supportProfile);
          } catch {
            return {};
          }
        }

        return typeof learnerRecord.supportProfile === 'object' ? learnerRecord.supportProfile : {};
      })();

      const existingSubjects = Array.isArray((currentProfile as any).selectedSubjects)
        ? (currentProfile as any).selectedSubjects
        : [];

      const alreadyExists = existingSubjects.some((item: any) => {
        const currentId = String(item?.id || '').trim();
        const incomingId = String(subject.id || '').trim();
        const currentName = String(item?.name || '').trim().toLowerCase();
        const incomingName = String(subject.name || '').trim().toLowerCase();
        return currentId === incomingId || currentName === incomingName;
      });

      if (alreadyExists) {
        Alert.alert(
          'Subject already assigned',
          `${subject.name} is already assigned to ${selectedLearnerForSubjects.fullName}.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setSubjectModalVisible(false);
                setSelectedLearnerForSubjects(null);
                setSelectedSubjectCandidate(null);
                setSelectedSubjectCategory('');
                setSubjectGroups([]);
                setTargetMarksInput('');
              },
            },
          ],
        );
        return;
      }

      const normalizedSubject = {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        category: subject.category || selectedSubjectCategory || null,
        learningAreaCode: subject.learningAreaCode || null,
        targetMarks: targetMarks && targetMarks.trim() ? Number(targetMarks.trim()) : null,
        marksScored: 0,
      };

      const nextSubjects = [...existingSubjects, normalizedSubject];

      const supportProfilePayload = {
        ...currentProfile,
        selectedSubjects: nextSubjects,
      };

      const jsonSafeSupportProfile = JSON.stringify(supportProfilePayload);
      console.log('supportProfile payload for subject update:', jsonSafeSupportProfile);

      await client.graphql({
        query: updateLearnerProfile,
        variables: {
          input: {
            id: learnerRecord.id,
            supportProfile: jsonSafeSupportProfile,
          },
        },
      });

      setNotice(`${subject.name} was added to ${selectedLearnerForSubjects.fullName}.`);
      if (selectedLearnerForSubjects?.id) {
        await loadSelectedLearnerSubjects(selectedLearnerForSubjects.id);
      }
      setSubjectModalVisible(false);
      setSelectedLearnerForSubjects(null);
      setSelectedSubjectCandidate(null);
      setSelectedSubjectCategory('');
      setSubjectGroups([]);
      setTargetMarksInput('');
    } catch (error) {
      const graphqlError = error as { errors?: Array<{ message?: string }>; message?: string } | undefined;
      const extractedMessage = graphqlError?.errors?.[0]?.message || graphqlError?.message || 'Could not assign the subject to the learner.';
      console.error('Subject assignment failed:', error);
      setNotice(extractedMessage);
    } finally {
      setSavingSubject(false);
    }
  };

  const calculateLearnerClusterPoints = (learner: LearnerRecord) => {
    const subjects = learnerSubjectsMap[learner.id] || [];
    const attempted = subjects
      .filter((subject) => typeof subject.marksScored === 'number' && !Number.isNaN(subject.marksScored))
      .map((subject) => ({
        ...subject,
        marksScored: Number(subject.marksScored || 0),
      }));

    const grade = Number(String(learner.gradeLevel || '').replace(/\D/g, '')) || 0;
    if (grade < 10 || attempted.length === 0) {
      return 0;
    }

    return calculateClusterPointsFromSubjects(attempted);
  };

  const syncGrade12ResultSummaryForLearner = async (learnerRecord: any) => {
    try {
      const gradeNumber = Number(String(learnerRecord?.gradeLevel || '').replace(/\D/g, '')) || 0;
      if (gradeNumber !== 12) {
        return;
      }

      const supportProfile = (() => {
        if (!learnerRecord?.supportProfile) return {};
        if (typeof learnerRecord.supportProfile === 'string') {
          try {
            return JSON.parse(learnerRecord.supportProfile);
          } catch {
            return {};
          }
        }
        return typeof learnerRecord.supportProfile === 'object' ? learnerRecord.supportProfile : {};
      })();

      const selectedCareerId = supportProfile?.targetCareerId || learnerRecord?.selectedCareerId || supportProfile?.selectedCareerId || null;
      const targetCareerName = typeof supportProfile?.targetCareer === 'string' ? supportProfile.targetCareer.trim() : null;
      const institutionId = supportProfile?.targetInstitutionId || supportProfile?.institutionId || null;
      const institutionName = typeof supportProfile?.targetInstitutionName === 'string' ? supportProfile.targetInstitutionName.trim() : null;
      const requiredAggregatePoints = Number.isFinite(Number(supportProfile?.minimumClusterScore)) ? Number(supportProfile.minimumClusterScore) : 0;
      const nextAggregatePoints = calculateLearnerClusterPoints({
        id: learnerRecord.id,
        learnerId: learnerRecord.learnerId || learnerRecord.id,
        fullName: learnerRecord.fullName || 'Learner',
        assessmentNumber: learnerRecord.assessmentNumber || '',
        gradeLevel: learnerRecord.gradeLevel || '12',
        classCode: learnerRecord.classCode || '',
        status: learnerRecord.status || 'active',
      });
      const aggregateGap = requiredAggregatePoints > 0 ? Math.max(0, requiredAggregatePoints - nextAggregatePoints) : 0;
      const wasTargetCareerReached = requiredAggregatePoints > 0 ? nextAggregatePoints >= requiredAggregatePoints : false;
      const resultStatus = requiredAggregatePoints > 0 ? (wasTargetCareerReached ? 'met_target' : 'below_target') : 'not_assessed';
      const placementStatus = requiredAggregatePoints > 0 ? (wasTargetCareerReached ? 'eligible' : 'pending') : 'not_configured';

      const summaryInput = {
        learnerId: learnerRecord.id,
        schoolCode: learnerRecord.schoolCode,
        countyCode: learnerRecord.countyCode || null,
        regionCode: learnerRecord.regionCode || null,
        nationCode: learnerRecord.nationCode || '',
        academicYear: ACADEMIC_YEAR,
        gradeLevel: String(learnerRecord.gradeLevel || '12'),
        targetCareerId: selectedCareerId,
        targetCareerName: targetCareerName || null,
        pathwayId: supportProfile?.pathwayId || null,
        pathwayName: supportProfile?.pathwayName || null,
        finalAggregatePoints: nextAggregatePoints,
        requiredAggregatePoints: requiredAggregatePoints || null,
        aggregateGap,
        resultStatus,
        wasTargetCareerReached,
        placementStatus,
        institutionId,
        institutionName,
        courseId: selectedCareerId,
        courseName: targetCareerName || null,
        recordedByUserId: teacherContext?.userId || teacherContext?.id || learnerRecord.createdByTeacherId || learnerRecord.id,
        recordedAt: new Date().toISOString(),
        status: 'active',
      };

      const existingQuery = await client.graphql({
        query: listGrade12ResultSummaries,
        variables: {
          filter: {
            and: [
              { learnerId: { eq: learnerRecord.id } },
              { academicYear: { eq: ACADEMIC_YEAR } },
            ],
          },
          limit: 20,
        },
      });

      const existingPayload = existingQuery as { data?: { listGrade12ResultSummaries?: { items?: Array<any> } } };
      const existingSummary = existingPayload.data?.listGrade12ResultSummaries?.items?.[0];

      if (existingSummary?.id) {
        await client.graphql({
          query: updateGrade12ResultSummary,
          variables: {
            input: {
              id: existingSummary.id,
              ...summaryInput,
            },
          },
        });
        return;
      }

      await client.graphql({
        query: createGrade12ResultSummary,
        variables: {
          input: summaryInput,
        },
      });
    } catch (error) {
      console.warn('[GRADE12_RESULT_SUMMARY_SYNC_FAILED]', error);
    }
  };

  const updateSubjectPerformance = async (learnerId: string, subjectId: string, marksScored: number) => {
    try {
      setSavingPerformance(true);
      setSavingSubjectMap((m) => ({ ...m, [subjectId]: true }));

      const learnerQuery = await client.graphql({
        query: listLearnerProfiles,
        variables: { filter: { id: { eq: learnerId } }, limit: 20 },
      });

      const learnerPayload = learnerQuery as { data?: { listLearnerProfiles?: { items?: Array<any> } } };
      const learnerRecord = learnerPayload.data?.listLearnerProfiles?.items?.[0];

      if (!learnerRecord?.id) {
        throw new Error('Learner record could not be found for performance update.');
      }

      const currentProfile = (() => {
        if (!learnerRecord.supportProfile) return {};
        if (typeof learnerRecord.supportProfile === 'string') {
          try {
            return JSON.parse(learnerRecord.supportProfile);
          } catch {
            return {};
          }
        }
        return typeof learnerRecord.supportProfile === 'object' ? learnerRecord.supportProfile : {};
      })();

      const existingSubjects = Array.isArray(currentProfile.selectedSubjects) ? currentProfile.selectedSubjects : [];
      const currentGrade = Number(String(learnerRecord.gradeLevel || '').replace(/\D/g, '')) || 7;
      const updatedSubjects = existingSubjects.map((item: any) => {
        if (String(item?.id || '').trim() !== String(subjectId || '').trim()) {
          return item;
        }

        const nextSubject = {
          ...item,
          marksScored: Number.isFinite(marksScored) ? marksScored : 0,
        };

        const history = Array.isArray(item?.history) ? item.history.slice() : [];
        const entry = {
          label: String(currentGrade),
          value: Number.isFinite(marksScored) ? Number(marksScored) : 0,
          target: Number.isFinite(Number(item?.targetMarks)) && Number(item.targetMarks) > 0 ? Number(item.targetMarks) : undefined,
        };
        const existingIndex = history.findIndex((entryItem: any) => String(entryItem?.label) === String(currentGrade));
        if (existingIndex >= 0) {
          history[existingIndex] = entry;
        } else {
          history.push(entry);
        }

        return {
          ...nextSubject,
          history,
        };
      });

      await client.graphql({
        query: updateLearnerProfile,
        variables: {
          input: {
            id: learnerRecord.id,
            supportProfile: JSON.stringify({ ...currentProfile, selectedSubjects: updatedSubjects }),
          },
        },
      });

      await loadSelectedLearnerSubjects(learnerId);
      setNotice(`Performance updated for ${selectedPerformanceSubject?.name || 'the selected subject'}.`);
      // keep the teacher in the subject-update view; update the draft value for the subject
      setSubjectPerformanceDrafts((current) => ({ ...current, [subjectId]: String(marksScored) }));
      setPerformanceMarksInput('');
      const subjectName = (learnerSubjectsMap[learnerId] || []).find((s) => s.id === subjectId)?.name || 'the subject';
      Alert.alert('Performance updated', `${subjectName} updated to ${marksScored}.`);
    } catch (error) {
      const graphqlError = error as { errors?: Array<{ message?: string }>; message?: string } | undefined;
      const extractedMessage = graphqlError?.errors?.[0]?.message || graphqlError?.message || 'Could not update the learner performance.';
      Alert.alert('Performance update failed', extractedMessage);
    } finally {
      setSavingPerformance(false);
      setSavingSubjectMap((m) => ({ ...m, [subjectId]: false }));
    }
  };

  const saveRubricForLearner = async (learner: LearnerRecord) => {
    if (!teacherContext || !learner.id) {
      Alert.alert('Rubric not saved', 'Teacher or learner context is missing.');
      return;
    }

    if (!rubricTitle.trim()) {
      Alert.alert('Rubric title required', 'Please enter a rubric title before saving.');
      return;
    }

    try {
      setSavingRubric(true);

      const criteria = rubricCriteriaText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 12);

      const rubricConfig = {
        title: rubricTitle.trim(),
        description: rubricDescription.trim() || 'Teacher-authored learner rubric',
        criteria,
        columns: ['Emerging', 'Developing', 'Proficient', 'Exemplary'],
        createdBy: teacherContext.fullName,
      };

      await client.graphql({
        query: createAssessmentRubric,
        variables: {
          input: {
            learnerId: learner.id,
            teacherId: teacherContext.id,
            schoolCode: teacherContext.schoolCode,
            classCode: learner.classCode || selectedClassCode,
            rubricType: 'learner_rubric',
            title: rubricTitle.trim(),
            description: rubricDescription.trim() || 'Teacher-authored learner rubric',
            academicYear: ACADEMIC_YEAR,
            termOrCycle: 'Term 1',
            status: 'active',
            rubricConfigJson: JSON.stringify(rubricConfig),
          },
        },
      });

      setRubricTitle('');
      setRubricDescription('');
      setRubricCriteriaText('');
      setPerformanceAction('menu');
      setNotice(`Rubric saved for ${learner.fullName}.`);
      Alert.alert('Rubric saved', `The rubric for ${learner.fullName} was created successfully.`);
    } catch (error) {
      const graphqlError = error as { errors?: Array<{ message?: string }>; message?: string } | undefined;
      const extractedMessage = graphqlError?.errors?.[0]?.message || graphqlError?.message || 'Could not save the learner rubric.';
      Alert.alert('Rubric save failed', extractedMessage);
    } finally {
      setSavingRubric(false);
    }
  };

  const saveCalculatedClusterPoints = async (learner: LearnerRecord) => {
    try {
      setCalculatingClusterPoints(true);

      const subjects = learnerSubjectsMap[learner.id] || [];
      const attempted = subjects.filter((subject) => typeof subject.marksScored === 'number' && !Number.isNaN(subject.marksScored));

      if (attempted.length === 0) {
        Alert.alert('No marks available', 'Add at least one subject mark before calculating cluster points.');
        return;
      }

      const learnerQuery = await client.graphql({
        query: listLearnerProfiles,
        variables: { filter: { id: { eq: learner.id } }, limit: 20 },
      });

      const learnerPayload = learnerQuery as { data?: { listLearnerProfiles?: { items?: Array<any> } } };
      const learnerRecord = learnerPayload.data?.listLearnerProfiles?.items?.[0];

      if (!learnerRecord?.id) {
        throw new Error('Learner record could not be found for cluster point calculation.');
      }

      const currentProfile = (() => {
        if (!learnerRecord.supportProfile) return {};
        if (typeof learnerRecord.supportProfile === 'string') {
          try {
            return JSON.parse(learnerRecord.supportProfile);
          } catch {
            return {};
          }
        }
        return typeof learnerRecord.supportProfile === 'object' ? learnerRecord.supportProfile : {};
      })();

      const nextClusterPoints = calculateLearnerClusterPoints(learner);

      await client.graphql({
        query: updateLearnerProfile,
        variables: {
          input: {
            id: learnerRecord.id,
            supportProfile: JSON.stringify({
              ...currentProfile,
              targetClusterPoints: nextClusterPoints,
            }),
          },
        },
      });

      const gradeNumber = Number(String(learnerRecord.gradeLevel || '').replace(/\D/g, '')) || 0;
      if (gradeNumber === 12) {
        await syncGrade12ResultSummaryForLearner({
          ...learnerRecord,
          supportProfile: JSON.stringify({
            ...currentProfile,
            targetClusterPoints: nextClusterPoints,
          }),
        });
      }

      await loadSelectedLearnerSubjects(learner.id);
      setLearnerClusterPointsMap((current) => ({ ...current, [learner.id]: nextClusterPoints }));
      setNotice(`Cluster points for ${learner.fullName} were updated to ${nextClusterPoints}.`);
      Alert.alert('Cluster points updated', `Cluster points for ${learner.fullName} are now ${nextClusterPoints}.`);
      setPerformanceAction(null);
      setPerformanceLearner(null);
    } catch (error) {
      const graphqlError = error as { errors?: Array<{ message?: string }>; message?: string } | undefined;
      const extractedMessage = graphqlError?.errors?.[0]?.message || graphqlError?.message || 'Could not calculate the learner cluster points.';
      Alert.alert('Cluster point update failed', extractedMessage);
    } finally {
      setCalculatingClusterPoints(false);
    }
  };

  const GRADE_AXIS = [7, 8, 9, 10, 11, 12] as const;

  const getHistoricalClusterSeries = (learner: LearnerRecord) => {
    const currentSubjects = learnerSubjectsMap[learner.id] || [];
    const supportProfile = learnerProfileMap[learner.id] || { targetClusterPoints: learnerClusterPointsMap[learner.id], selectedSubjects: currentSubjects, historicalSelectedSubjects: [] };
    const series = calculateHistoricalClusterSeries(
      learner,
      {
        ...supportProfile,
        selectedSubjects: Array.isArray(supportProfile?.selectedSubjects) ? supportProfile.selectedSubjects : currentSubjects,
        historicalSelectedSubjects: Array.isArray(supportProfile?.historicalSelectedSubjects) ? supportProfile.historicalSelectedSubjects : [],
        targetClusterPoints: learnerClusterPointsMap[learner.id],
      },
      currentSubjects,
      learnerClusterPointsMap[learner.id],
    );
    try {
      const numericValues = series.map((s: any) => (Number.isFinite(Number(s.value)) ? Number(s.value) : NaN)).filter(Number.isFinite);
      const domain = { min: numericValues.length ? Math.min(...numericValues) : NaN, max: numericValues.length ? Math.max(...numericValues) : NaN };
      console.log('[DEBUG_CLUSTER_SERIES]', JSON.stringify({
        learnerId: learner.id,
        learnerFullName: learner.fullName,
        currentGrade: learner.gradeLevel,
        activeGraphLearnerId,
        supportProfileKeys: Object.keys(supportProfile || {}),
        historicalSelectedSubjects: Array.isArray(supportProfile?.historicalSelectedSubjects) ? supportProfile.historicalSelectedSubjects.map((subject: any) => ({ name: subject?.name, history: Array.isArray(subject?.history) ? subject.history : [] })) : [],
        currentSubjects: currentSubjects.map((subject: any) => ({ name: subject?.name, history: Array.isArray((subject as any)?.history) ? (subject as any).history : [] })),
        series,
        domain,
      }, null, 2));
    } catch (err) {
      console.log('[DEBUG_CLUSTER_SERIES]', JSON.stringify({ learnerId: learner.id, learnerFullName: learner.fullName, activeGraphLearnerId, series }, null, 2));
    }

    return series;
  };

  const getHistoricalSubjectSeries = (learner: LearnerRecord) => {
    const currentSubjects = learnerSubjectsMap[learner.id] || [];
    const profile = learnerProfileMap[learner.id] || {};
    const historicalSubjects = Array.isArray(profile.historicalSelectedSubjects) ? profile.historicalSelectedSubjects : [];
    const mergedSubjects = [...historicalSubjects, ...currentSubjects];

    if (mergedSubjects.length === 0) return [];

    const currentGrade = Number(String(learner.gradeLevel || '').replace(/\D/g, '')) || 7;
    const subjectMap = new Map<string, { id?: string; name: string; code?: string; history: Array<any>; targetMarks: number | null; marksScored: number | null }>();
    const normalizeSubjectKey = (subject: any) => {
      const slug = String(subject?.name || subject?.code || subject?.id || 'subject').trim().toLowerCase();
      return slug.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    };
    const collapseHistoryByGrade = (entries: any[]) => {
      const byGrade = new Map<string, any>();
      entries.forEach((entry: any) => {
        const grade = Number(String(entry?.label || '').trim());
        if (!Number.isFinite(grade)) {
          return;
        }
        const gradeKey = String(grade);
        const current = byGrade.get(gradeKey);
        const currentValue = Number(current?.value ?? NaN);
        const candidateValue = Number(entry?.value ?? NaN);
        const currentTarget = Number(current?.target ?? NaN);
        const candidateTarget = Number(entry?.target ?? NaN);

        const candidateWins = !current ||
          (Number.isFinite(candidateValue) && candidateValue > 0 && (!Number.isFinite(currentValue) || currentValue <= 0)) ||
          (Number.isFinite(candidateValue) && candidateValue > 0 && Number.isFinite(currentValue) && currentValue > 0 && Number.isFinite(candidateTarget) && Number.isFinite(currentTarget) && candidateTarget > currentTarget);

        if (!current || candidateWins) {
          byGrade.set(gradeKey, { ...entry, label: `${grade}` });
        }
      });

      return Array.from(byGrade.values()).sort((left: any, right: any) => Number(left.label) - Number(right.label));
    };
    const assignSubjectByPhase = (subject: any) => {
      const historyGrades: number[] = Array.isArray(subject?.history)
        ? (subject.history as any[]).reduce<number[]>((accumulator: number[], entry: any) => {
            const grade = Number(String(entry?.label || '').trim());
            if (Number.isFinite(grade)) {
              accumulator.push(grade);
            }
            return accumulator;
          }, [])
        : [];
      const phaseCandidates: number[] = historyGrades.length > 0 ? historyGrades : [Number.isFinite(currentGrade) ? currentGrade : 7];
      const phases = Array.from(new Set<string>(phaseCandidates.map((grade: number) => (grade >= 10 ? 'senior' : 'junior'))));

      phases.forEach((phase) => {
        const key = `${normalizeSubjectKey(subject)}:${phase}`;
        const existing = subjectMap.get(key);
        const filteredHistory = Array.isArray(subject?.history)
          ? collapseHistoryByGrade(subject.history.filter((entry: any) => {
              const grade = Number(String(entry?.label || '').trim());
              return Number.isFinite(grade) && ((grade >= 10 && phase === 'senior') || (grade < 10 && phase === 'junior'));
            }))
          : [];
        const normalizedSubject = {
          id: subject?.id || undefined,
          name: subject?.name || subject?.code || 'Unnamed subject',
          code: subject?.code || undefined,
          history: filteredHistory,
          targetMarks: Number.isFinite(Number(subject?.targetMarks)) ? Number(subject.targetMarks) : null,
          marksScored: Number.isFinite(Number(subject?.marksScored)) ? Number(subject.marksScored) : null,
        };

        if (!existing) {
          subjectMap.set(key, normalizedSubject);
          return;
        }

        existing.history = collapseHistoryByGrade([...existing.history, ...normalizedSubject.history]);
        if (normalizedSubject.targetMarks !== null && (existing.targetMarks === null || normalizedSubject.targetMarks > 0)) {
          existing.targetMarks = normalizedSubject.targetMarks;
        }
        if (normalizedSubject.marksScored !== null) {
          existing.marksScored = normalizedSubject.marksScored;
        }
      });
    };

    mergedSubjects.forEach((subject: any) => {
      assignSubjectByPhase(subject);
    });

    const subjectSeriesDebug = Array.from(subjectMap.values()).map((subject) => ({
      name: subject.name,
      code: subject.code,
      targetMarks: subject.targetMarks,
      marksScored: subject.marksScored,
      history: Array.isArray(subject.history) ? subject.history.map((entry: any) => ({
        label: entry?.label,
        value: entry?.value,
        target: entry?.target,
      })) : [],
    }));

    console.log('[DEBUG_SUBJECT_SERIES_RAW]', JSON.stringify({
      learnerId: learner?.id,
      learnerGrade: learner?.gradeLevel,
      rawSubjects: mergedSubjects.map((subject: any) => ({
        name: subject?.name || subject?.code,
        code: subject?.code,
        id: subject?.id,
        targetMarks: subject?.targetMarks,
        marksScored: subject?.marksScored,
        history: Array.isArray(subject?.history) ? subject.history.map((entry: any) => ({
          label: entry?.label,
          value: entry?.value,
          target: entry?.target,
        })) : [],
      })),
      grouped: subjectSeriesDebug,
    }, null, 2));

    return Array.from(subjectMap.values()).map((subject) => {
      const history = subject.history || [];
      const phase = Array.isArray(history) && history.some((entry: any) => Number(String(entry?.label || '').trim()) >= 10) ? 'senior' : 'junior';
      const gradeKeys = Array.from(new Set([
        ...(phase === 'senior' ? [10, 11, 12] : [7, 8, 9]),
        ...history
          .map((entry: any) => Number(String(entry?.label || '').trim()))
          .filter((grade) => Number.isFinite(grade) && ((phase === 'senior' && grade >= 10 && grade <= 12) || (phase === 'junior' && grade >= 7 && grade <= 9))),
        ...(Number.isFinite(currentGrade) && ((phase === 'senior' && currentGrade >= 10) || (phase === 'junior' && currentGrade <= 9)) ? [currentGrade] : []),
      ])).sort((left, right) => left - right);

      const values = gradeKeys
        .map((grade) => {
          const entry = history.find((item: any) => String(item?.label) === String(grade));
          const targetMark = Number(
            Number.isFinite(Number(entry?.target)) ? Number(entry.target) :
              (grade === currentGrade ? (Number.isFinite(Number(subject.targetMarks)) ? Number(subject.targetMarks) : 0) : (subject.targetMarks ?? 0)),
          );
          const achieved = Number.isFinite(Number(entry?.value)) ? Number(entry.value) :
            (grade === currentGrade && Number.isFinite(Number(subject.marksScored)) ? Number(subject.marksScored) : NaN);

          if (!Number.isFinite(targetMark) || targetMark <= 0 || !Number.isFinite(achieved)) {
            return null;
          }

          return { label: `${grade}`, value: achieved, target: targetMark };
        })
        .filter((point): point is { label: string; value: number; target: number } => point !== null);

      if (values.length === 0) return null;

      console.log('[DEBUG_SUBJECT_SERIES_VALUES]', JSON.stringify({
        subject: subject.name,
        currentGrade,
        gradeKeys,
        values,
      }, null, 2));

      return {
        label: subject.name.split(' ')[0] || 'Subject',
        values,
      };
    }).filter((subject): subject is { label: string; values: Array<{ label: string; value: number; target: number }> } => subject !== null);
  };

  const renderLineChart = (
    series: Array<{ label: string; value: number; target?: number }>,
    targetColor: string,
    valueColor: string,
    maxY: number,
    nationalRequirement?: number | null,
  ) => {
    const { width: windowWidth } = require('react-native').Dimensions.get('window');
    const chartWidth = Math.max(300, Math.min(420, windowWidth - 48));
    const chartHeight = 520;
    const paddingLeft = 32;
    const paddingRight = 18;
    const paddingTop = 12;
    const paddingBottom = 42;
    const axisGrades = [7, 8, 9, 10, 11, 12] as const;
    const majorStep = 10;
    const minorStep = 1;
    const yMajorTicks = Array.from({ length: Math.floor(maxY / majorStep) + 1 }, (_, index) => index * majorStep);
    const yMinorTicks = Array.from({ length: maxY + 1 }, (_, index) => index * minorStep);

    type ChartPoint = {
      label: string;
      x: number;
      valueY: number | null;
      targetY: number | null;
    };

    const gradeToX = (grade: number) => {
      const gradeIndex = axisGrades.indexOf(grade as (typeof axisGrades)[number]);
      const safeIndex = gradeIndex >= 0 ? gradeIndex : 0;
      return paddingLeft + (safeIndex / Math.max(axisGrades.length - 1, 1)) * (chartWidth - paddingLeft - paddingRight);
    };

    const axisLineY = chartHeight - paddingBottom;
    const valueToY = (value: number) => {
      const safeValue = Math.max(0, Math.min(maxY, Number.isFinite(value) ? value : 0));
      const usableHeight = chartHeight - paddingTop - paddingBottom;
      return axisLineY - (safeValue / Math.max(maxY, 1)) * usableHeight;
    };

    const points: ChartPoint[] = series
      .filter((point) => Number.isFinite(Number(point.label)) && Number(point.label) >= 7 && Number(point.label) <= 12)
      .map((point) => {
        const grade = Number(point.label);
        const rawValue = Number(point.value);
        const rawTarget = Number(point.target);
        return {
          label: point.label,
          x: gradeToX(grade),
          valueY: Number.isFinite(rawValue) ? valueToY(rawValue) : null,
          targetY: Number.isFinite(rawTarget) ? valueToY(rawTarget) : null,
        };
      })
      .filter((point) => point.valueY !== null || point.targetY !== null)
      .sort((left, right) => Number(left.label) - Number(right.label));

    const buildSegments = (items: Array<{ label: string; x: number; y: number }>) => {
      if (!Array.isArray(items) || items.length === 0) {
        return [] as Array<Array<{ label: string; x: number; y: number }>>;
      }

      const segments: Array<Array<{ label: string; x: number; y: number }>> = [];
      let current: Array<{ label: string; x: number; y: number }> = [];

      items.forEach((item) => {
        if (current.length === 0) {
          current = [item];
          return;
        }

        const previousLabel = Number(current[current.length - 1].label);
        const currentLabel = Number(item.label);
        const shouldBreakPhase = previousLabel <= 9 && currentLabel >= 10;
        if (!Number.isFinite(previousLabel) || !Number.isFinite(currentLabel) || currentLabel - previousLabel > 1 || shouldBreakPhase) {
          segments.push(current);
          current = [item];
          return;
        }

        current.push(item);
      });

      if (current.length > 0) {
        segments.push(current);
      }

      return segments;
    };

    const drawPolyline = (color: string, values: Array<{ label: string; x: number; y: number }>, keyPrefix: string) => {
      if (values.length < 2) {
        return null;
      }

      return values.slice(1).map((point, index) => {
        const start = values[index];
        const end = point;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.hypot(dx, dy) || 1;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const thickness = 3;
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        return (
          <View
            key={`${keyPrefix}-segment-${index}`}
            style={{
              position: 'absolute',
              left: midX - distance / 2,
              top: midY - thickness / 2,
              width: distance,
              height: thickness,
              backgroundColor: color,
              borderRadius: 999,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      });
    };

    const targetPoints = points
      .filter((point) => typeof point.targetY === 'number')
      .map((point) => ({ label: point.label, x: point.x, y: point.targetY ?? axisLineY }));

    const valuePoints = points
      .filter((point) => typeof point.valueY === 'number')
      .map((point) => ({ label: point.label, x: point.x, y: point.valueY ?? axisLineY }));

    const requirementPoints = typeof nationalRequirement === 'number' && Number.isFinite(nationalRequirement)
      ? [10, 11, 12]
        .filter((grade) => grade >= 10 && grade <= 12)
        .map((grade) => ({ label: String(grade), x: gradeToX(grade), y: valueToY(nationalRequirement) }))
      : [];

    const targetSegments = buildSegments(targetPoints);
    const valueSegments = buildSegments(valuePoints);
    const requirementSegments = buildSegments(requirementPoints);

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartLegendRow}>
          <View style={styles.chartLegendItem}>
            <View style={[styles.chartLegendSwatch, { backgroundColor: targetColor }]} />
            <Text style={styles.chartLegendText}>Target</Text>
          </View>
          <View style={styles.chartLegendItem}>
            <View style={[styles.chartLegendSwatch, { backgroundColor: valueColor }]} />
            <Text style={styles.chartLegendText}>Achieved</Text>
          </View>
          {requirementPoints.length > 0 ? (
            <View style={styles.chartLegendItem}>
              <View style={[styles.chartLegendSwatch, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.chartLegendText}>National requirement</Text>
            </View>
          ) : null}
        </View>

        <View style={{ width: chartWidth, height: chartHeight }}>
          {yMinorTicks.map((tick) => {
            const y = valueToY(tick);
            const isMajorTick = tick === 1 || tick % majorStep === 0;
            return (
              <View
                key={`y-grid-${tick}`}
                style={{
                  position: 'absolute',
                  left: paddingLeft,
                  right: paddingRight,
                  top: y,
                  height: 1,
                  backgroundColor: isMajorTick ? '#94a3b8' : '#dbeafe',
                }}
              />
            );
          })}

          {yMajorTicks.map((tick) => {
            const y = valueToY(tick);
            return (
              <Text
                key={`y-label-${tick}`}
                style={[
                  styles.chartAxisLabel,
                  {
                    position: 'absolute',
                    left: 6,
                    top: y - 8,
                    width: paddingLeft - 12,
                    textAlign: 'right',
                    color: '#0f172a',
                  },
                ]}
              >
                {tick}
              </Text>
            );
          })}

          <View
            style={{
              position: 'absolute',
              left: paddingLeft,
              right: paddingRight,
              top: axisLineY,
              height: 1,
              backgroundColor: '#475569',
            }}
          />

          {axisGrades.map((grade) => {
            const x = gradeToX(grade);
            return (
              <View
                key={`x-grid-${grade}`}
                style={{
                  position: 'absolute',
                  top: paddingTop,
                  bottom: paddingBottom,
                  left: x,
                  width: 1,
                  backgroundColor: '#dbeafe',
                }}
              />
            );
          })}

          <View style={{ position: 'absolute', left: 0, top: paddingTop, width: chartWidth, height: chartHeight - paddingTop - paddingBottom }}>
            {targetSegments.map((segment, segmentIndex) => drawPolyline(targetColor, segment, `target-${segmentIndex}`))}
            {valueSegments.map((segment, segmentIndex) => drawPolyline(valueColor, segment, `value-${segmentIndex}`))}
            {requirementSegments.map((segment, segmentIndex) => drawPolyline('#22c55e', segment, `national-${segmentIndex}`))}
            {valuePoints.map((point, index) => (
              <View
                key={`achieved-dot-${index}`}
                style={{
                  position: 'absolute',
                  left: point.x - 4,
                  top: point.y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: valueColor,
                }}
              />
            ))}
            {targetPoints.map((point, index) => (
              <View
                key={`target-dot-${index}`}
                style={{
                  position: 'absolute',
                  left: point.x - 4,
                  top: point.y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: targetColor,
                }}
              />
            ))}
            {requirementPoints.map((point, index) => (
              <View
                key={`national-dot-${index}`}
                style={{
                  position: 'absolute',
                  left: point.x - 4,
                  top: point.y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#22c55e',
                }}
              />
            ))}
          </View>

          <View
            style={{
              position: 'absolute',
              left: 0,
              width: chartWidth,
              bottom: 0,
            }}
          >
            {axisGrades.map((grade) => {
              const x = gradeToX(grade);
              return (
                <Text
                  key={`axis-${grade}`}
                  style={[
                    styles.chartAxisLabel,
                    {
                      position: 'absolute',
                      left: x - 10,
                      width: 20,
                      textAlign: 'center',
                      color: '#0f172a',
                    },
                  ]}
                >
                  {grade}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const promptLearnerAction = (learner: LearnerRecord, action: 'view' | 'update' | 'addSubject') => {
    if ((action as any) === 'promote') {
      const currentGrade = Number(String(learner.gradeLevel || '').replace(/\D/g, '')) || 7;
      setPromotionLearner(learner);
      setPromotionGradeInput(String(Math.min(12, currentGrade + 1)));
      setCareerTargetModalVisible(false);
      setCareerTargetLearner(null);
      setCareerTargetInput('');
      setPromotionModalVisible(true);
      return;
    }

    if ((action as any) === 'updateCareerTarget') {
      const gradeNumber = Number(String(learner.gradeLevel || '').replace(/\D/g, '')) || 0;
      if (gradeNumber < 7 || gradeNumber > 9) {
        Alert.alert(
          'Career locked',
          `Career targets can only be changed for learners in Grades 7, 8, and 9. This learner is in Grade ${learner.gradeLevel || 'Not set'}, so changes are not allowed.`,
        );
        return;
      }

      setCareerTargetLearner(learner);
      const currentCareer = learnerCareerMap[learner.id] || '';
      setCareerTargetInput(currentCareer);
      setPromotionModalVisible(false);
      setPromotionLearner(null);
      setPromotionGradeInput('');
      setCareerTargetModalVisible(true);
      return;
    }
    const actionMap = {
      view: {
        title: 'View learner performance',
        message: `This opens the learner performance view for ${learner.fullName}.`,
        confirmText: 'Open',
      },
      update: {
        title: 'Update learner performance',
        message: `This opens the performance update flow for ${learner.fullName}.`,
        confirmText: 'Proceed',
      },
      addSubject: {
        title: 'Add learner subject',
        message: `This lets you add a subject to ${learner.fullName}.`,
        confirmText: 'Proceed',
      },
    } as const;

    const config = actionMap[action];

    if (action === 'addSubject') {
      setSubjectIntroLearner(learner);
      setSubjectIntroVisible(true);
      return;
    }

    if (action === 'view') {
      console.log('[DEBUG_TEACHER_SELECTION]', JSON.stringify({
        event: 'view learner performance click',
        learnerId: learner.id,
        learnerName: learner.fullName,
        grade: learner.gradeLevel,
      }, null, 2));
      Alert.alert(config.title, config.message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: config.confirmText,
          onPress: () => {
            setPerformanceSessionId((current) => current + 1);
            setPerformanceAction(null);
            setPerformanceLearner(null);
            setActiveGraphLearnerId(learner.id);
            setSelectedPerformanceSubject(null);
            setPerformanceMarksInput('');
            setLearnerDocumentMap({});
            setLearnerGuidanceMap({});
            setPerformanceLearner(learner);
            setPerformanceAction('viewMenu');
            setNotice(`${config.title} for ${learner.fullName} is ready to view.`);
          },
        },
      ]);
      return;
    }

    if (action === 'update') {
      console.log('[DEBUG_TEACHER_SELECTION]', JSON.stringify({
        event: 'update learner performance click',
        learnerId: learner.id,
        learnerName: learner.fullName,
        grade: learner.gradeLevel,
      }, null, 2));
      Alert.alert(config.title, config.message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: config.confirmText,
          onPress: () => {
            setPerformanceSessionId((current) => current + 1);
            setPerformanceAction(null);
            setPerformanceLearner(null);
            setActiveGraphLearnerId(learner.id);
            setSelectedPerformanceSubject(null);
            setPerformanceMarksInput('');
            setLearnerDocumentMap({});
            setLearnerGuidanceMap({});
            setPerformanceLearner(learner);
            setPerformanceAction('menu');
            setNotice(`${config.title} for ${learner.fullName} is ready to update.`);
          },
        },
      ]);
      return;
    }

    Alert.alert(config.title, config.message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: config.confirmText,
        onPress: () => {
          setNotice(`${config.title} for ${learner.fullName} is ready to open.`);
        },
      },
    ]);
  };

  const handleCreateLearner = async () => {
    if (!teacherContext || !selectedClassCode) {
      setNotice('Please select a class before adding a learner.');
      return;
    }

    if (!gradeLevel.trim()) {
      setNotice('Please select the learner grade level before continuing.');
      Alert.alert('Missing grade level', 'Please select the learner grade level before continuing.');
      return;
    }

    if (!fullName.trim()) {
      setNotice('Please enter the learner full name.');
      Alert.alert('Missing learner name', 'Please enter the learner full name.');
      return;
    }

    if (!assessmentNumber.trim()) {
      setNotice('Please enter the learner assessment number.');
      Alert.alert('Missing assessment number', 'Please enter the learner assessment number.');
      return;
    }

    const normalizedCareerName = learnerDetails.targetCareer.trim();
    if (!normalizedCareerName) {
      setNotice('Please select the learner target career from the approved list.');
      Alert.alert('Missing target career', 'Please select the learner target career from the approved list.');
      return;
    }

    const selectedCareer = careerOptions.find((career) =>
      career.id === selectedCareerId || career.courseName.trim().toLowerCase() === normalizedCareerName.toLowerCase(),
    );

    if (!selectedCareer) {
      setNotice('The selected career was not found in the national list. Please choose a valid career option.');
      Alert.alert('Invalid career selection', 'The selected career was not found in the national list. Please choose a valid career option.');
      return;
    }

    if (!gender.trim()) {
      setNotice('Please choose the learner gender.');
      Alert.alert('Missing gender', 'Please choose the learner gender.');
      return;
    }

    if (!parentNationalId.trim()) {
      setNotice('Please enter the Parent/Guardian national ID.');
      Alert.alert('Missing parent national ID', 'Please enter the Parent/Guardian national ID.');
      return;
    }

    try {
      setSaving(true);
      setNotice('');

      const safeAssessment = assessmentNumber.trim();
      const dedupedEmail = `${safeAssessment.toLowerCase().replace(/\s+/g, '')}.${selectedClassCode.toLowerCase()}@cartra.local`;

      const userResult = await client.graphql({
        query: createUser,
        variables: {
          input: {
            email: dedupedEmail,
            phoneNumber: null,
            role: 'learner',
            status: 'active',
            fullName: fullName.trim(),
          },
        },
      });

      const userPayload = userResult as { data?: { createUser?: { id?: string } } };
      const createdUserId = userPayload.data?.createUser?.id;
      if (!createdUserId) {
        throw new Error('Learner user record could not be created.');
      }

      const supportProfilePayload = {
        targetCareer: selectedCareer.courseName,
        targetCareerId: selectedCareer.id,
        targetInstitutionId: selectedCareer.institutionId ?? null,
        targetInstitutionName: selectedCareer.institutionName ?? null,
        minimumClusterScore: selectedCareer.minimumClusterScore ?? null,
        careerClusterPoints: 0,
        targetClusterPoints: 0,
      };

      const supportProfileValue = Object.values(supportProfilePayload).some((value) => value !== null && value !== undefined && value !== '')
        ? JSON.stringify(supportProfilePayload)
        : null;

      console.log('Creating learner payload:', JSON.stringify({
        userId: createdUserId,
        learnerId: `${teacherContext.schoolCode}-${selectedClassCode}-${safeAssessment}`,
        fullName: fullName.trim(),
        assessmentNumber: safeAssessment,
        gender: gender.trim() || null,
        gradeLevel: gradeLevel.trim() || null,
        nationCode: teacherContext.nationCode,
        regionCode: teacherContext.regionCode,
        countyCode: teacherContext.countyCode,
        subCountyCode: teacherContext.subCountyCode,
        schoolCode: teacherContext.schoolCode,
        classCode: selectedClassCode,
        parentNationalId: parentNationalId.trim() || null,
        supportProfile: supportProfileValue,
        status: 'active',
        createdByTeacherId: teacherContext.id,
      }));

      const learnerCreate = await client.graphql({
        query: createLearnerProfile,
        variables: {
          input: {
            userId: createdUserId,
            learnerId: `${teacherContext.schoolCode}-${selectedClassCode}-${safeAssessment}`,
            fullName: fullName.trim(),
            assessmentNumber: safeAssessment,
            gender: gender.trim() || null,
            gradeLevel: gradeLevel.trim() || null,
            nationCode: teacherContext.nationCode,
            regionCode: teacherContext.regionCode,
            countyCode: teacherContext.countyCode,
            subCountyCode: teacherContext.subCountyCode,
            schoolCode: teacherContext.schoolCode,
            classCode: selectedClassCode,
            parentNationalId: parentNationalId.trim() || null,
            supportProfile: supportProfileValue,
            selectedCareerId: selectedCareer.id,
            status: 'active',
            createdByTeacherId: teacherContext.id,
          },
        },
      });

      const learnerPayload = learnerCreate as { data?: { createLearnerProfile?: { id?: string } } };
      const createdLearnerId = learnerPayload.data?.createLearnerProfile?.id;

      if (createdLearnerId) {
        await client.graphql({
          query: createLearnerEnrollment,
          variables: {
            input: {
              learnerId: createdLearnerId,
              schoolCode: teacherContext.schoolCode,
              classCode: selectedClassCode,
              academicYear: ACADEMIC_YEAR,
              termOrCycle: 'Term 1',
              enrollmentStatus: 'active',
            },
          },
        });
      }

      setFullName('');
      setAssessmentNumber('');
      setGradeLevel('');
      setGender('');
      setLearnerDetails({
        targetCareer: '',
        careerClusterPoints: '',
        targetClusterPoints: '',
      });
      setParentNationalId('');
      setShowLearnerDetails(false);
      setNotice('Learner added successfully to the class.');
      Alert.alert('Learner added', 'The learner was added successfully to the class.');
      await loadClassLearners(selectedClassCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not add learner.';
      console.error('Could not add learner:', error);
      setNotice(message);
      Alert.alert('Could not add learner', message);
    } finally {
      setSaving(false);
    }
  };

  const findLearnerProfileRecord = async (learner: LearnerRecord) => {
    const candidateFilters = [
      { id: { eq: learner.id } },
      ...(learner.learnerId ? [{ learnerId: { eq: learner.learnerId } }] : []),
      ...(learner.assessmentNumber && teacherContext?.schoolCode && learner.classCode
        ? [{ and: [{ schoolCode: { eq: teacherContext.schoolCode } }, { classCode: { eq: learner.classCode } }, { assessmentNumber: { eq: learner.assessmentNumber } }] }]
        : []),
    ];

    for (const filter of candidateFilters) {
      try {
        const learnerQuery = await client.graphql({
          query: listLearnerProfiles,
          variables: { filter, limit: 20 },
        });

        const learnerPayload = learnerQuery as { data?: { listLearnerProfiles?: { items?: Array<any> } } };
        const match = learnerPayload.data?.listLearnerProfiles?.items?.[0];
        if (match?.id) {
          return match;
        }
      } catch (error) {
        console.warn('[PROMOTE_LEARNER_LOOKUP_FAILED]', error);
      }
    }

    return null;
  };

  const handlePromoteLearner = async (learner: LearnerRecord) => {
    if (!teacherContext || !learner.id) {
      setNotice('Teacher context or learner missing.');
      return;
    }

    try {
      setPromotingLearner(true);
      setNotice('Promoting learner...');

      const enteredNextGrade = Number(String(promotionGradeInput || '').trim());
      const currentGrade = Number(String(learner.gradeLevel || '').replace(/\D/g, '')) || 7;
      const nextGrade = Number.isFinite(enteredNextGrade) && enteredNextGrade >= 7 && enteredNextGrade <= 12
        ? enteredNextGrade
        : Math.min(12, currentGrade + 1);

      const learnerRecord = await findLearnerProfileRecord(learner);
      if (!learnerRecord?.id) throw new Error('Learner profile not found');

      const parsedSupportProfile = (() => {
        if (!learnerRecord.supportProfile) return {};
        if (typeof learnerRecord.supportProfile === 'string') {
          try { return JSON.parse(learnerRecord.supportProfile); } catch { return {}; }
        }
        return typeof learnerRecord.supportProfile === 'object' ? learnerRecord.supportProfile : {};
      })();

      await client.graphql({
        query: createAcademicRecord,
        variables: {
          input: {
            learnerId: learnerRecord.id,
            academicYear: ACADEMIC_YEAR,
            termOrCycle: 'PromotionSnapshot',
            targetValues: null,
            achievedValues: null,
            subjectBreakdown: null,
            competencyBreakdown: null,
            deviationPercent: null,
            escalationLevel: null,
            escalationStatus: 'snapshot',
          },
        },
      });

      const enrollmentsQuery = await client.graphql({ query: listLearnerEnrollments, variables: { filter: { learnerId: { eq: learnerRecord.id } }, limit: 20 } });
      const enrollmentsPayload = enrollmentsQuery as { data?: { listLearnerEnrollments?: { items?: Array<any> } } };
      const activeEnrollment = (enrollmentsPayload.data?.listLearnerEnrollments?.items || []).find((e: any) => e.enrollmentStatus === 'active');
      if (activeEnrollment?.id) {
        await client.graphql({ query: updateLearnerEnrollment, variables: { input: { id: activeEnrollment.id, promotedToNextClass: true, enrollmentStatus: 'promoted' } } });
      }

      const priorSubjects = Array.isArray(parsedSupportProfile.selectedSubjects) ? parsedSupportProfile.selectedSubjects : [];
      const historicalSubjects = Array.isArray(parsedSupportProfile.historicalSelectedSubjects) ? parsedSupportProfile.historicalSelectedSubjects : [];

      const mergedHistoryMap = new Map<string, any>();
      const registerSubject = (subject: any) => {
        const key = String(subject?.code || subject?.name || subject?.id || 'subject').trim().toLowerCase();
        const merged = mergedHistoryMap.get(key) || {
          ...subject,
          name: subject?.name || subject?.code || 'Unnamed subject',
          code: subject?.code || undefined,
          history: Array.isArray(subject?.history) ? subject.history.slice() : [],
          marksScored: null,
          targetMarks: null,
        };

        const history = Array.isArray(merged.history) ? merged.history.slice() : [];
        const currentGradeValue = Number(String(learnerRecord.gradeLevel || '').replace(/\D/g, '')) || currentGrade;

        if (subject && Number.isFinite(Number(subject?.marksScored)) && Number(subject.marksScored) >= 0) {
          const entry = {
            label: String(currentGradeValue),
            value: Number(subject.marksScored),
            target: Number.isFinite(Number(subject?.targetMarks)) && Number(subject.targetMarks) > 0 ? Number(subject.targetMarks) : undefined,
          };
          const index = history.findIndex((existingEntry: any) => String(existingEntry?.label) === String(currentGradeValue));
          if (index >= 0) {
            history[index] = entry;
          } else {
            history.push(entry);
          }
        }

        merged.history = history;
        mergedHistoryMap.set(key, merged);
      };

      historicalSubjects.forEach(registerSubject);
      priorSubjects.forEach(registerSubject);

      const preservedHistoricalSubjects = Array.from(mergedHistoryMap.values()).map((subject: any) => ({
        ...subject,
        history: Array.isArray(subject.history) ? subject.history : [],
        marksScored: null,
        targetMarks: null,
      }));

      const nextSupportProfile = {
        ...parsedSupportProfile,
        targetCareer: null,
        careerClusterPoints: null,
        targetClusterPoints: null,
        selectedSubjects: [],
        historicalSelectedSubjects: preservedHistoricalSubjects,
      };

      await client.graphql({ query: createLearnerEnrollment, variables: { input: { learnerId: learnerRecord.id, schoolCode: learnerRecord.schoolCode, classCode: String(nextGrade), academicYear: ACADEMIC_YEAR, termOrCycle: 'Term 1', enrollmentStatus: 'active' } } });
      await client.graphql({ query: updateLearnerProfile, variables: { input: { id: learnerRecord.id, gradeLevel: String(nextGrade), classCode: String(nextGrade), supportProfile: JSON.stringify(nextSupportProfile) } } });

      setPromotionModalVisible(false);
      setPromotionLearner(null);
      setPromotionGradeInput('');
      setNotice(`${learner.fullName} promoted to Grade ${nextGrade}. Career and subject targets were reset for the next class.`);
      Alert.alert('Promotion complete', `${learner.fullName} was promoted to Grade ${nextGrade}. Career and subject targets were reset for the next class.`);
      await loadClassLearners(selectedClassCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Promotion failed';
      setNotice(message);
      Alert.alert('Promotion failed', message);
    } finally {
      setPromotingLearner(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
        <Text style={styles.screenLoadingText}>Loading your teacher class details...</Text>
      </View>
    );
  }

  if (!teacherContext) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{notice || 'Teacher context could not be loaded.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard title="Teacher Dashboard" subtitle="Manage your assigned class and add learners to it.">
        <Text style={styles.teacherName}>{teacherContext.fullName}</Text>
        <Text style={styles.metaText}>School: {teacherContext.schoolCode}</Text>
        <Text style={styles.metaText}>TSC: {teacherContext.tscNumber || 'Not set'}</Text>
        <Text style={styles.metaText}>Hierarchy: {teacherContext.nationCode} / {teacherContext.regionCode} / {teacherContext.countyCode} / {teacherContext.subCountyCode}</Text>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SectionCard>

      <SectionCard title="My Classes">
        {assignedClasses.length === 0 ? (
          <Text style={styles.empty}>No assigned classes were found for this teacher yet.</Text>
        ) : (
          <View style={styles.classRow}>
            {assignedClasses.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={[styles.classButton, selectedClassCode === classItem.classCode && styles.classButtonActive]}
                onPress={() => setSelectedClassCode(classItem.classCode || '')}
              >
                <Text style={[styles.classButtonText, selectedClassCode === classItem.classCode && styles.classButtonTextActive]}>
                  {classItem.className || `Grade ${classItem.classCode}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard title={selectedClassCode ? `Add learner to ${selectedClassCode}` : 'Add learner to class'}>
        {!showLearnerDetails ? (
          <>
            <Text style={styles.fieldLabel}>Select assigned class</Text>
            {assignedClasses.length === 0 ? (
              <Text style={styles.empty}>No assigned classes are available for this teacher yet.</Text>
            ) : (
              <View style={styles.gradeGrid}>
                {assignedClasses.map((classItem) => (
                  <TouchableOpacity
                    key={classItem.id}
                    style={[styles.gradeChip, selectedClassCode === classItem.classCode && styles.gradeChipSelected]}
                    onPress={() => {
                      const nextClassCode = classItem.classCode || '';
                      setSelectedClassCode(nextClassCode);
                      setGradeLevel(nextClassCode);
                      setShowLearnerDetails(true);
                    }}
                  >
                    <Text style={[styles.gradeChipText, selectedClassCode === classItem.classCode && styles.gradeChipTextSelected]}>
                      {classItem.className || `Grade ${classItem.classCode}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>Selected grade: {gradeLevel}</Text>

            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {['Male', 'Female'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.genderOption, gender === option && styles.genderOptionSelected]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[styles.genderOptionText, gender === option && styles.genderOptionTextSelected]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Learner full name"
              placeholderTextColor="#6b7280"
            />
            <TextInput
              style={styles.input}
              value={assessmentNumber}
              onChangeText={setAssessmentNumber}
              placeholder="Assessment number"
              placeholderTextColor="#6b7280"
            />

            <Text style={styles.fieldLabel}>Target career</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setCareerPickerVisible(true)}
              disabled={careerOptionsLoading}
            >
              <Text style={[styles.dropdownText, !learnerDetails.targetCareer && styles.placeholderText]}>
                {careerOptionsLoading ? 'Loading approved careers...' : learnerDetails.targetCareer || 'Select career from national list'}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={parentNationalId}
              onChangeText={setParentNationalId}
              placeholder="Parent/Guardian national ID"
              placeholderTextColor="#6b7280"
              autoCapitalize="characters"
            />

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setShowLearnerDetails(false);
                  setGender('');
                  setLearnerDetails({
                    targetCareer: '',
                    careerClusterPoints: '',
                    targetClusterPoints: '',
                  });
                  setParentNationalId('');
                  setFullName('');
                  setAssessmentNumber('');
                }}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton} onPress={() => void handleCreateLearner()} disabled={saving || !selectedClassCode}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Add learner to class'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SectionCard>

      <Modal transparent visible={promotionModalVisible} animationType="fade" onRequestClose={() => {
        setPromotionModalVisible(false);
        setPromotionLearner(null);
        setPromotionGradeInput('');
      }}>
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Promote learner</Text>
            <Text style={styles.dialogText}>
              {promotionLearner?.fullName || 'This learner'} will keep the same learner identity, but their class and support setup can be reset for the next grade.
            </Text>

            <Text style={styles.fieldLabel}>Next class / grade</Text>
            <TextInput
              style={styles.input}
              value={promotionGradeInput}
              onChangeText={setPromotionGradeInput}
              placeholder="e.g. 9"
              keyboardType="numeric"
              placeholderTextColor="#6b7280"
            />

            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setPromotionModalVisible(false);
                  setPromotionLearner(null);
                  setPromotionGradeInput('');
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, promotingLearner && styles.primaryButtonDisabled]}
                onPress={() => {
                  if (!promotionLearner || promotingLearner) return;
                  void handlePromoteLearner(promotionLearner);
                }}
                disabled={promotingLearner}
              >
                <View style={styles.buttonContentRow}>
                  {promotingLearner ? <ActivityIndicator size="small" color="#ffffff" /> : null}
                  <Text style={styles.primaryButtonText}>{promotingLearner ? 'Promoting...' : 'Promote to next class'}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.dialogActions, { marginTop: 12, justifyContent: 'space-between' }]}> 
              <TouchableOpacity
                style={[styles.secondaryButton, reassigningSubjects && styles.primaryButtonDisabled]}
                onPress={() => {
                  if (!promotionLearner || reassigningSubjects) return;
                  setReassigningSubjects(true);
                  setPromotionModalVisible(false);
                  setSelectedLearnerForSubjects(promotionLearner);
                  setSubjectSelectionStep('category');
                  setSelectedSubjectCategory('');
                  setSelectedSubjectCandidate(null);
                  setTargetMarksInput('');
                  setSubjectModalVisible(true);
                  Alert.alert('Reassign subjects', `Open the subject list for ${promotionLearner.fullName} and assign the next class subjects.`);
                  setTimeout(() => setReassigningSubjects(false), 250);
                }}
                disabled={reassigningSubjects}
              >
                <View style={styles.buttonContentRow}>
                  {reassigningSubjects ? <ActivityIndicator size="small" color="#111827" /> : null}
                  <Text style={styles.secondaryButtonText}>{reassigningSubjects ? 'Reassigning...' : 'Reassign subjects'}</Text>
                </View>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>

      <Modal transparent visible={careerTargetModalVisible} animationType="fade" onRequestClose={() => {
        setCareerTargetModalVisible(false);
        setCareerTargetLearner(null);
        setCareerTargetInput('');
        setSelectedCareerId(null);
      }}>
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Set learner career target</Text>
            <Text style={styles.dialogText}>
              Update the current career target for {careerTargetLearner?.fullName || 'this learner'}.
            </Text>

            <Text style={styles.fieldLabel}>Career target</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setCareerPickerVisible(true)}
              disabled={careerOptionsLoading}
            >
              <Text style={[styles.dropdownText, !careerTargetInput && styles.placeholderText]}>
                {careerOptionsLoading ? 'Loading approved careers...' : careerTargetInput || 'Select career from national list'}
              </Text>
            </TouchableOpacity>

            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setCareerTargetModalVisible(false);
                  setCareerTargetLearner(null);
                  setCareerTargetInput('');
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, resettingCareerTarget && styles.primaryButtonDisabled]}
                onPress={() => {
                  if (!careerTargetLearner || resettingCareerTarget) return;

                  const gradeNumber = Number(String(careerTargetLearner.gradeLevel || '').replace(/\D/g, '')) || 0;
                  if (gradeNumber < 7 || gradeNumber > 9) {
                    Alert.alert(
                      'Career locked',
                      `Career targets can only be changed for learners in Grades 7, 8, and 9. This learner is in Grade ${careerTargetLearner.gradeLevel || 'Not set'}, so changes are not allowed.`,
                    );
                    return;
                  }

                  const nextCareer = careerTargetInput.trim();
                  if (!nextCareer) {
                    Alert.alert('Career target required', 'Please select the learner career target from the approved list before saving.');
                    return;
                  }

                  const selectedCareer = careerOptions.find((career) =>
                    career.id === selectedCareerId || career.courseName.trim().toLowerCase() === nextCareer.toLowerCase(),
                  );

                  if (!selectedCareer) {
                    Alert.alert('Invalid career selection', 'The selected career was not found in the national list. Please choose a valid career option.');
                    return;
                  }

                  void (async () => {
                    try {
                      setResettingCareerTarget(true);
                      const learnerRecord = await findLearnerProfileRecord(careerTargetLearner);
                      if (!learnerRecord?.id) throw new Error('Learner record could not be found.');

                      const currentProfile = (() => {
                        if (!learnerRecord.supportProfile) return {};
                        if (typeof learnerRecord.supportProfile === 'string') {
                          try { return JSON.parse(learnerRecord.supportProfile); } catch { return {}; }
                        }
                        return typeof learnerRecord.supportProfile === 'object' ? learnerRecord.supportProfile : {};
                      })();

                      const nextProfile = {
                        ...currentProfile,
                        targetCareer: selectedCareer.courseName,
                        targetCareerId: selectedCareer.id,
                        targetInstitutionId: selectedCareer.institutionId ?? null,
                        targetInstitutionName: selectedCareer.institutionName ?? null,
                        minimumClusterScore: selectedCareer.minimumClusterScore ?? null,
                        careerClusterPoints: 0,
                        targetClusterPoints: 0,
                      };

                      await client.graphql({ query: updateLearnerProfile, variables: { input: { id: learnerRecord.id, selectedCareerId: selectedCareer.id, supportProfile: JSON.stringify(nextProfile) } } });
                      setLearnerCareerMap((current) => ({ ...current, [careerTargetLearner.id]: selectedCareer.courseName }));
                      setNotice(`${careerTargetLearner.fullName}'s career target was saved as ${selectedCareer.courseName}.`);
                      Alert.alert('Career target saved', `${careerTargetLearner.fullName}'s career target is now ${selectedCareer.courseName}.`);
                      setCareerTargetModalVisible(false);
                      setCareerTargetLearner(null);
                      setCareerTargetInput('');
                      setSelectedCareerId(null);
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Could not update the career target.';
                      setNotice(message);
                      Alert.alert('Update failed', message);
                    } finally {
                      setResettingCareerTarget(false);
                    }
                  })();
                }}
                disabled={resettingCareerTarget}
              >
                <View style={styles.buttonContentRow}>
                  {resettingCareerTarget ? <ActivityIndicator size="small" color="#ffffff" /> : null}
                  <Text style={styles.primaryButtonText}>{resettingCareerTarget ? 'Saving...' : 'Save career target'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={careerPickerVisible} animationType="slide" onRequestClose={() => {
        setCareerPickerVisible(false);
        setCourseFilterInstitution('');
        setCourseFilterCourseName('');
      }}>
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Approved programmes</Text>
            <Text style={styles.dialogText}>Select the institution-owned programme and its minimum cluster score for this learner.</Text>

            <Text style={styles.fieldLabel}>Institution name</Text>
            <TextInput
              style={styles.input}
              value={courseFilterInstitution}
              onChangeText={setCourseFilterInstitution}
              placeholder="Filter by institution"
              placeholderTextColor="#6b7280"
            />

            <Text style={styles.fieldLabel}>Course name</Text>
            <TextInput
              style={styles.input}
              value={courseFilterCourseName}
              onChangeText={setCourseFilterCourseName}
              placeholder="Filter by course name"
              placeholderTextColor="#6b7280"
            />

            <ScrollView style={styles.optionList} contentContainerStyle={styles.optionListContent}>
              {careerOptionsLoading ? (
                <View style={styles.centeredRow}><ActivityIndicator size="small" color="#1d4ed8" /><Text style={styles.optionHint}>Loading programmes...</Text></View>
              ) : filteredCareerOptions.length === 0 ? (
                <Text style={styles.optionHint}>No matching tertiary programmes found for the current filters.</Text>
              ) : (
                filteredCareerOptions.map((career) => (
                  <TouchableOpacity
                    key={career.id}
                    style={[styles.optionRow, selectedCareerId === career.id && styles.optionRowSelected]}
                    onPress={() => {
                      setSelectedCareerId(career.id);
                      setCareerTargetInput(career.courseName);
                      setLearnerDetails((current) => ({ ...current, targetCareer: career.courseName }));
                      setCareerPickerVisible(false);
                      setCourseFilterInstitution('');
                      setCourseFilterCourseName('');
                    }}
                  >
                    <Text style={styles.optionTitle}>{career.courseName}</Text>
                    <Text style={styles.optionMeta}>{career.institutionName || 'Unknown institution'}</Text>
                    {career.minimumClusterScore !== null && typeof career.minimumClusterScore !== 'undefined' ? (
                      <Text style={styles.optionMeta}>Minimum cluster points: {career.minimumClusterScore}</Text>
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => {
                setCareerPickerVisible(false);
                setCourseFilterInstitution('');
                setCourseFilterCourseName('');
              }}>
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={subjectIntroVisible} animationType="fade" onRequestClose={() => setSubjectIntroVisible(false)}>
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Add learner subject</Text>
            <Text style={styles.dialogText}>
              This lets you attach a subject to {subjectIntroLearner?.fullName || 'this learner'}.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setSubjectIntroVisible(false);
                  setSubjectIntroLearner(null);
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (subjectIntroLearner) {
                    setSelectedLearnerForSubjects(subjectIntroLearner);
                    setSelectedSubjectCandidate(null);
                    setTargetMarksInput('');
                    setSubjectGroups([]);
                    setSubjectGroupsLoading(false);
                    setSelectedSubjectCategory('');
                    setSubjectSelectionStep('category');
                    setSubjectModalVisible(true);
                    setSubjectIntroLearner(null);
                    setSubjectIntroVisible(false);
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SectionCard title={selectedClassCode ? `Learners in ${selectedClassCode}` : 'Learners'}>
        {learners.length === 0 ? (
          <Text style={styles.empty}>No learners have been added to this class yet.</Text>
        ) : (
          learners.map((learner) => (
            <View key={learner.id} style={styles.learnerRow}>
              <View style={styles.learnerLineRow}>
                <Text style={[styles.learnerName, { flexShrink: 1 }]}>{learner.fullName} - {learnerCareerMap[learner.id] || 'Career target not set'}</Text>
                <View style={styles.learnerActions}>
                  <TouchableOpacity
                    accessibilityLabel={`View learner performance for ${learner.fullName}`}
                    style={styles.iconButton}
                    onPress={() => promptLearnerAction(learner, 'view')}
                  >
                    <Text style={styles.iconText}>◌</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.learnerLineRow}>
                <Text style={[styles.metaText, styles.learnerMetaText]}>Assessment: Grade {learner.gradeLevel || 'Not set'} • Assessment no: {learner.assessmentNumber || 'Not set'}</Text>
                <View style={styles.learnerActions}>
                  <TouchableOpacity
                    accessibilityLabel={`Update learner performance for ${learner.fullName}`}
                    style={styles.iconButton}
                    onPress={() => promptLearnerAction(learner, 'update')}
                  >
                    <Text style={styles.iconText}>✎</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.learnerLineRow}>
                <Text style={[styles.metaText, styles.learnerMetaText]}>Grade {learner.gradeLevel || 'Not set'}: Status: {learner.status || 'active'}</Text>
                <View style={styles.learnerActions}>
                  {(() => {
                    const gradeNumber = Number(String(learner.gradeLevel || '').replace(/\D/g, '')) || 0;
                    if (gradeNumber === 7) {
                      return (
                        <TouchableOpacity
                          accessibilityLabel={`Add subject to ${learner.fullName}`}
                          style={styles.iconButton}
                          onPress={() => promptLearnerAction(learner, 'addSubject')}
                        >
                          <Text style={styles.iconText}>＋</Text>
                        </TouchableOpacity>
                      );
                    }
                    return null;
                  })()}
                  <TouchableOpacity
                    accessibilityLabel={`Update career target for ${learner.fullName}`}
                    style={styles.iconButton}
                    onPress={() => promptLearnerAction(learner, 'updateCareerTarget' as any)}
                  >
                    <Text style={styles.iconText}>✦</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel={`Promote ${learner.fullName}`}
                    style={styles.iconButton}
                    onPress={() => promptLearnerAction(learner, 'promote' as any)}
                  >
                    <Text style={styles.iconText}>⬆</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.subjectSummaryBox}>
                <View style={styles.learnerLineRow}>
                  <Text style={styles.subjectSummaryTitle}>Subjects</Text>
                  <TouchableOpacity
                    accessibilityLabel={expandedSubjectsLearnerId === learner.id ? `Hide subjects for ${learner.fullName}` : `Show subjects for ${learner.fullName}`}
                    style={styles.iconButton}
                    onPress={() => setExpandedSubjectsLearnerId((current) => current === learner.id ? null : learner.id)}
                  >
                    <Text style={styles.iconText}>{expandedSubjectsLearnerId === learner.id ? '◉' : '◌'}</Text>
                  </TouchableOpacity>
                </View>
                {expandedSubjectsLearnerId === learner.id ? (
                  (learnerSubjectsMap[learner.id] || []).length === 0 ? (
                    <Text style={styles.empty}>No subjects added yet.</Text>
                  ) : (
                    <View style={styles.subjectSummaryList}>
                      {(learnerSubjectsMap[learner.id] || []).map((subject) => (
                        <View key={subject.id} style={styles.subjectBadge}>
                          <Text style={styles.subjectBadgeText}>{subject.name}</Text>
                          {typeof subject.targetMarks === 'number' ? (
                            <Text style={styles.subjectBadgeMeta}>Target: {subject.targetMarks}</Text>
                          ) : null}
                          <TouchableOpacity
                            accessibilityLabel={`Remove ${subject.name} from ${learner.fullName}`}
                            style={styles.removeSubjectButton}
                            onPress={() => void removeSubjectFromLearner(learner.id, subject.id)}
                          >
                            <Text style={styles.removeSubjectButtonText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )
                ) : null}
              </View>

              {performanceLearner?.id === learner.id && performanceAction ? (
                <View key={`${performanceSessionId}-${performanceLearner?.id ?? 'teacher-performance'}`} style={styles.inlineSubjectSheet}>
                  <Text style={styles.modalTitle}>
                    {performanceAction === 'viewMenu' || performanceAction === 'viewCluster' || performanceAction === 'viewSubjects' || performanceAction === 'viewGuidance' || performanceAction === 'viewEPortfolio'
                      ? `View performance for ${learner.fullName}`
                      : `Update performance for ${learner.fullName}`}
                  </Text>
                  <Text style={styles.modalSubtitle}>Grade {learner.gradeLevel || 'Not set'}</Text>

                  {performanceAction === 'viewMenu' ? (
                    <ViewPerformance
                      onViewCluster={() => setPerformanceAction('viewCluster')}
                      onViewSubjects={() => setPerformanceAction('viewSubjects')}
                      onViewGuidance={() => {
                        void loadLearnerGuidance(learner.id);
                        setPerformanceAction('viewGuidance');
                      }}
                      onViewEPortfolio={() => {
                        void loadLearnerDocuments(learner.id);
                        setPerformanceAction('viewEPortfolio');
                      }}
                    />
                  ) : null}

                  {performanceAction === 'menu' || performanceAction === null ? (
                    <View style={styles.categoryList}>
                      <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => {
                          setPerformanceAction('subject');
                          setSelectedPerformanceSubject(null);
                          setPerformanceMarksInput('');
                        }}
                      >
                        <Text style={styles.categoryButtonText}>Update subject performance</Text>
                      </TouchableOpacity>

                      {!(sessionUser && sessionUser.groups.includes('teacher')) && (
                        <TouchableOpacity
                          style={styles.categoryButton}
                          onPress={() => setPerformanceAction('rubric')}
                        >
                          <Text style={styles.categoryButtonText}>Create rubric</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => {
                          void loadLearnerDocuments(learner.id);
                          setPerformanceAction('documents');
                        }}
                      >
                        <Text style={styles.categoryButtonText}>E-portfolio files</Text>
                      </TouchableOpacity>

                      {Number(String(learner.gradeLevel || '').replace(/\D/g, '')) === 12 ? (
                        <TouchableOpacity
                          style={styles.categoryButton}
                          onPress={() => void saveCalculatedClusterPoints(learner)}
                          disabled={calculatingClusterPoints}
                        >
                          <Text style={styles.categoryButtonText}>
                            {calculatingClusterPoints
                              ? 'Calculating cluster points...'
                              : `Calculate cluster points${typeof learnerClusterPointsMap[learner.id] === 'number' ? ` (${learnerClusterPointsMap[learner.id]})` : ''}`}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}

                  {performanceAction === 'subject' ? (
                    <View style={styles.subjectListBox}>
                      <Text style={styles.subjectListTitle}>Subjects to update</Text>
                      {(learnerSubjectsMap[learner.id] || []).length === 0 ? (
                        <Text style={styles.empty}>No subjects have been assigned to this learner yet.</Text>
                      ) : (
                        <View style={styles.subjectSummaryList}>
                          {(learnerSubjectsMap[learner.id] || []).map((subject) => {
                            const draftValue = subjectPerformanceDrafts[subject.id] ?? String(subject.marksScored ?? '');

                            return (
                              <View key={subject.id} style={styles.subjectPerformanceRow}>
                                <View style={styles.subjectPerformanceInfo}>
                                  <Text style={styles.subjectItemCode}>{subject.code || 'SUBJ'}</Text>
                                  <Text style={styles.subjectItemName}>{subject.name}</Text>
                                  <Text style={styles.subjectItemMeta}>Current: {subject.marksScored ?? 0}</Text>
                                </View>

                                <View style={styles.subjectPerformanceUpdateBox}>
                                  <TextInput
                                    style={styles.subjectPerformanceInput}
                                    value={draftValue}
                                    onChangeText={(value) => {
                                      setSubjectPerformanceDrafts((current) => ({ ...current, [subject.id]: value }));
                                    }}
                                    placeholder="Marks"
                                    keyboardType="numeric"
                                    placeholderTextColor="#6b7280"
                                  />

                                  <TouchableOpacity
                                    style={[styles.inlineSaveButton, savingSubjectMap[subject.id] && styles.primaryButtonDisabled]}
                                    onPress={() => {
                                      const numericValue = Number(draftValue);
                                      if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 100) {
                                        Alert.alert('Invalid mark', 'Marks scored must be a valid number between 0 and 100.');
                                        return;
                                      }

                                      void updateSubjectPerformance(learner.id, subject.id, numericValue);
                                    }}
                                    disabled={!!savingSubjectMap[subject.id]}
                                    accessibilityLabel={`Refresh marks for ${subject.name}`}
                                  >
                                    <Text style={styles.inlineSaveButtonText}>{savingSubjectMap[subject.id] ? '…' : '↻'}</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  ) : null}

                  {performanceAction === 'rubric' ? (
                    <View style={styles.subjectListBox}>
                      <Text style={styles.subjectListTitle}>Create learner rubric</Text>

                      <ScrollView
                        style={styles.rubricScrollView}
                        contentContainerStyle={styles.rubricScrollContent}
                        showsVerticalScrollIndicator
                        nestedScrollEnabled
                      >
                        <Text style={styles.detailLabel}>Rubric title</Text>
                        <TextInput
                          style={styles.subjectPerformanceInput}
                          value={rubricTitle}
                          onChangeText={setRubricTitle}
                          placeholder="e.g. Practical Skills Rubric"
                          placeholderTextColor="#6b7280"
                        />

                        <Text style={styles.detailLabel}>Description</Text>
                        <TextInput
                          style={[styles.subjectPerformanceInput, { minHeight: 52, textAlignVertical: 'top' }]}
                          value={rubricDescription}
                          onChangeText={setRubricDescription}
                          placeholder="Short description"
                          placeholderTextColor="#6b7280"
                          multiline
                        />

                        <Text style={styles.detailLabel}>Criteria</Text>
                        <TextInput
                          style={[styles.subjectPerformanceInput, { minHeight: 90, textAlignVertical: 'top' }]}
                          value={rubricCriteriaText}
                          onChangeText={setRubricCriteriaText}
                          placeholder="One criterion per line"
                          placeholderTextColor="#6b7280"
                          multiline
                        />

                        <View style={styles.detailActions}>
                          <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => setPerformanceAction('menu')}
                          >
                            <Text style={styles.secondaryButtonText}>Back</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.primaryButton, savingRubric && styles.primaryButtonDisabled]}
                            onPress={() => void saveRubricForLearner(learner)}
                            disabled={savingRubric}
                          >
                            <View style={styles.buttonContentRow}>
                              {savingRubric ? <ActivityIndicator size="small" color="#ffffff" /> : null}
                              <Text style={styles.primaryButtonText}>{savingRubric ? 'Saving...' : 'Save rubric'}</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    </View>
                  ) : null}

                  {performanceAction === 'documents' ? (
                    <View style={styles.subjectListBox}>
                      <Text style={styles.subjectListTitle}>E-portfolio files</Text>
                      {documentDebugMessage ? <Text style={styles.metaText}>{documentDebugMessage}</Text> : null}

                      <Text style={styles.detailLabel}>Document title</Text>
                      <TextInput
                        style={styles.subjectPerformanceInput}
                        value={documentTitleInput}
                        onChangeText={setDocumentTitleInput}
                        placeholder="e.g. Mid-term scan or portfolio reflection"
                        placeholderTextColor="#6b7280"
                      />

                      <Text style={styles.detailLabel}>Description</Text>
                      <TextInput
                        style={[styles.subjectPerformanceInput, { minHeight: 64, textAlignVertical: 'top' }]}
                        value={documentDescriptionInput}
                        onChangeText={setDocumentDescriptionInput}
                        placeholder="Short note for the teacher and learner file timeline"
                        placeholderTextColor="#6b7280"
                        multiline
                      />

                      <TouchableOpacity
                        style={[styles.primaryButton, styles.ePortfolioUploadButton, uploadingDocument && styles.primaryButtonDisabled]}
                        onPress={() => void pickAndUploadLearnerDocument(learner)}
                        disabled={uploadingDocument}
                      >
                        <View style={styles.buttonContentRow}>
                          {uploadingDocument ? <ActivityIndicator size="small" color="#ffffff" /> : null}
                          <Text style={styles.primaryButtonText}>{uploadingDocument ? 'Uploading...' : 'Pick and upload e-portfolio file'}</Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.linkedDocumentList}>
                        <Text style={styles.subjectListTitle}>Uploaded e-portfolio files</Text>
                        <Text style={styles.metaText}>Files loaded: {(learnerDocumentMap[learner.id] || []).length}</Text>
                        {(learnerDocumentMap[learner.id] || []).length === 0 ? (
                          <Text style={styles.empty}>No e-portfolio files are linked to this learner yet.</Text>
                        ) : (
                          (learnerDocumentMap[learner.id] || []).map((resource) => (
                            <View key={resource.id} style={styles.linkedDocumentCard}>
                              <View style={styles.linkedDocumentHeader}>
                                <View style={styles.linkedDocumentTextBlock}>
                                  <Text style={styles.linkedDocumentTitle}>{resource.title}</Text>
                                  <Text style={styles.linkedDocumentMeta}>
                                    E-portfolio file • {resource.status}
                                  </Text>
                                </View>

                                <TouchableOpacity
                                  style={styles.inlineSaveButton}
                                  onPress={() => void openLearnerDocument(resource)}
                                  disabled={openingDocumentId === resource.id}
                                >
                                  <Text style={styles.inlineSaveButtonText}>{openingDocumentId === resource.id ? '…' : 'Open'}</Text>
                                </TouchableOpacity>
                              </View>

                              {resource.description ? <Text style={styles.linkedDocumentDescription}>{resource.description}</Text> : null}

                              <Text style={styles.linkedDocumentMeta}>
                                {resource.fileName} • {formatFileSize(resource.fileSizeBytes)} • {formatDocumentDate(resource.createdAt)}
                              </Text>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  ) : null}

                  {performanceAction === 'viewGuidance' ? (
                    <View style={styles.subjectListBox}>
                      <Text style={styles.subjectListTitle}>Guidance & comments</Text>
                      {(() => {
                        const guidanceEntries = learnerGuidanceMap[learner.id] || [];
                        if (guidanceEntries.length === 0) {
                          return <Text style={styles.empty}>No guidance comments have been added for this learner yet.</Text>;
                        }

                        const formatRole = (role?: string | null) => {
                          if (!role) return 'Unknown';
                          const roleLabels: Record<string, string> = {
                            parent: 'Parent',
                            teacher: 'Teacher',
                            principal: 'Principal',
                            subCountyOfficer: 'Sub County Director',
                            countyOfficer: 'County Director',
                            regionalOfficer: 'Regional Director',
                            nationalOfficer: 'National Officer',
                          };
                          return roleLabels[role] || role;
                        };

                        return (
                          <View style={styles.linkedDocumentList}>
                            {guidanceEntries.map((entry) => (
                              <View key={entry.id} style={styles.linkedDocumentCard}>
                                <Text style={styles.linkedDocumentTitle}>{formatRole(entry.authorRole)}</Text>
                                <Text style={styles.linkedDocumentMeta}>{entry.authorDisplayName || 'Unknown author'}</Text>
                                <Text style={styles.linkedDocumentMeta}>Grade: {entry.schoolGrade || 'Not set'}</Text>
                                {entry.createdAt ? (
                                  <Text style={styles.linkedDocumentMeta}>Time: {new Date(entry.createdAt).toLocaleString()}</Text>
                                ) : null}
                                <Text style={[styles.linkedDocumentDescription, { marginTop: 8 }]}>{entry.note}</Text>
                              </View>
                            ))}
                          </View>
                        );
                      })()}
                    </View>
                  ) : null}

                  {performanceAction === 'viewEPortfolio' ? (
                    <View style={styles.subjectListBox}>
                      <Text style={styles.subjectListTitle}>View e-portfolio files</Text>
                      <Text style={styles.metaText}>Files loaded: {(learnerDocumentMap[learner.id] || []).length}</Text>
                      {(learnerDocumentMap[learner.id] || []).length === 0 ? (
                        <Text style={styles.empty}>No e-portfolio files are linked to this learner yet.</Text>
                      ) : (
                        <View style={styles.linkedDocumentList}>
                          {(learnerDocumentMap[learner.id] || []).map((resource) => (
                            <View key={resource.id} style={styles.linkedDocumentCard}>
                              <View style={styles.linkedDocumentHeader}>
                                <View style={styles.linkedDocumentTextBlock}>
                                  <Text style={styles.linkedDocumentTitle}>{resource.title}</Text>
                                  <Text style={styles.linkedDocumentMeta}>E-portfolio file • {resource.status}</Text>
                                </View>
                                <TouchableOpacity
                                  style={styles.inlineSaveButton}
                                  onPress={() => void openLearnerDocument(resource)}
                                  disabled={openingDocumentId === resource.id}
                                >
                                  <Text style={styles.inlineSaveButtonText}>{openingDocumentId === resource.id ? '…' : 'Open'}</Text>
                                </TouchableOpacity>
                              </View>

                              {resource.description ? <Text style={styles.linkedDocumentDescription}>{resource.description}</Text> : null}

                              <Text style={styles.linkedDocumentMeta}>
                                {resource.fileName} • {formatFileSize(resource.fileSizeBytes)} • {formatDocumentDate(resource.createdAt)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>
              ) : null}

              <Modal
                transparent
                visible={performanceLearner?.id === learner.id && (performanceAction === 'viewCluster' || performanceAction === 'viewSubjects')}
                animationType="slide"
                onRequestClose={resetPerformanceModal}
              >
                <View style={styles.graphModalBackdrop}>
                  <View key={`${performanceSessionId}-${performanceLearner?.id ?? 'teacher-graph'}`} style={styles.graphModalCard}>
                    <View style={styles.graphModalHeader}>
                      <Text style={styles.graphModalTitle}>
                        {performanceAction === 'viewCluster' ? 'Cluster points trend' : 'Subject performance trend'}
                      </Text>
                      <TouchableOpacity
                        style={styles.graphCloseButton}
                        onPress={resetPerformanceModal}
                      >
                        <Text style={styles.graphCloseButtonText}>Close</Text>
                      </TouchableOpacity>
                    </View>

                    {performanceAction === 'viewCluster' ? (
                      <ScrollView style={styles.graphModalScroll} contentContainerStyle={styles.graphModalContent}>
                        <View style={styles.summaryCard}>
                          <Text style={styles.summaryTitle}>Target career</Text>
                          <Text style={styles.summaryValue}>{learnerCareerMap[learner.id] || 'Not set'}</Text>
                        </View>

                        {(() => {
                          const series = getHistoricalClusterSeries(learner)
                            .map((point: any) => ({
                              label: point.label,
                              value: point.value,
                              target: point.target,
                            }))
                            .filter((point: any) => Number.isFinite(Number(point.value)));
                          const allVals = series.flatMap((p: any) => [Number(p.value || 0), Number(p.target || 0)]).filter((v: any) => Number.isFinite(v));
                          const minVal = allVals.length ? Math.min(...allVals) : 1;
                          const maxVal = allVals.length ? Math.max(...allVals) : 100;
                          const profile = learnerProfileMap[learner.id] || {};
                          const requirement = getSelectedCourseClusterRequirement(profile);
                          // eslint-disable-next-line no-console
                          console.log('[DEBUG_CLUSTER_SERIES]', JSON.stringify({ learnerId: learner.id, series, requirement, domain: { min: minVal, max: maxVal } }, null, 2));
                          return renderLineChart(series, '#93c5fd', '#1d4ed8', 100, requirement);
                        })()}

                        <View style={styles.summaryCard}>
                          <Text style={styles.summaryTitle}>Cluster points by year</Text>
                          {(() => {
                            const series = getHistoricalClusterSeries(learner).filter((point: any) => Number.isFinite(Number(point.value)));
                            if (!series || series.length === 0) return <Text style={styles.summaryValue}>No valid cluster points recorded yet.</Text>;
                            return <Text style={styles.summaryValue}>{series.map((point: any) => `Grade ${point.label}: ${point.value}`).join(' • ')}</Text>;
                          })()}
                        </View>

                        <View style={styles.summaryCard}>
                          <Text style={styles.summaryTitle}>Average cluster points</Text>
                          {(() => {
                            const series = getHistoricalClusterSeries(learner).filter((point: any) => Number.isFinite(Number(point.value)));
                            if (!series || series.length === 0) return <Text style={styles.summaryValue}>N/A</Text>;
                            const avgCluster = Math.round(series.reduce((sum: number, point: any) => sum + Number(point.value || 0), 0) / series.length);
                            return <Text style={styles.summaryValue}>{avgCluster}</Text>;
                          })()}
                        </View>

                        <View style={styles.summaryCard}>
                          <Text style={styles.summaryTitle}>Average deviation</Text>
                          {(() => {
                            const series = getHistoricalClusterSeries(learner).filter((point: any) => Number.isFinite(Number(point.value)));
                            if (!series || series.length === 0) return <Text style={styles.summaryValue}>N/A</Text>;
                            const avgDeviation = Math.round(
                              series.reduce((sum: number, point: any) => {
                                const value = Number(point.value || 0);
                                const target = Number(point.target || 100);
                                return sum + Number(point.deviation || 0);
                              }, 0) / series.length,
                            );
                            return <Text style={styles.summaryValue}>{avgDeviation}</Text>;
                          })()}
                        </View>

                        <View style={styles.summaryCard}>
                          <Text style={styles.summaryTitle}>Deviation from chosen course requirement</Text>
                          {(() => {
                            const profile = learnerProfileMap[learner.id] || {};
                            const requirement = getSelectedCourseClusterRequirement(profile);
                            const series = getHistoricalClusterSeries(learner)
                              .filter((point: any) => Number.isFinite(Number(point.value)) && Number(point.label) >= 10 && Number(point.label) <= 12);
                            const deviations = requirement === null
                              ? []
                              : series
                                .map((point: any) => ({ label: point.label, deviation: calculateCourseClusterDeviation(Number(point.value), requirement) }))
                                .filter((point: any) => point.deviation !== null);

                            if (requirement === null) return <Text style={styles.summaryValue}>Course cluster points are not available.</Text>;
                            if (deviations.length === 0) return <Text style={styles.summaryValue}>No Grade 10–12 cluster points recorded yet.</Text>;
                            return <Text style={styles.summaryValue}>Required: {requirement} points • {deviations.map((item: any) => `Grade ${item.label}: ${item.deviation.points >= 0 ? '+' : ''}${item.deviation.points} points (${item.deviation.percentage >= 0 ? '+' : ''}${item.deviation.percentage}%)`).join(' • ')}</Text>;
                          })()}
                        </View>

                        {/* Learner comments shown below the cluster chart */}
                        <View style={{ marginTop: 12 }}>
                          {/* lazy-load comments component */}
                          <React.Suspense fallback={null}>
                            {/* @ts-ignore dynamic import for component already added */}
                            {(() => {
                              const C = require('../../components/shared/LearnerComments').default;
                              return <C learnerId={learner.id} />;
                            })()}
                          </React.Suspense>
                        </View>
                      </ScrollView>
                    ) : null}

                    {performanceAction === 'viewSubjects' ? (
                      <ScrollView style={styles.graphModalScroll} contentContainerStyle={styles.graphModalContent}>
                        {(() => {
                          const subjectSeries = getHistoricalSubjectSeries(learner);
                          if (subjectSeries.length === 0) {
                            return <Text style={styles.empty}>No subject data is available yet.</Text>;
                          }

                          const allSeries = subjectSeries
                            .flatMap((subject: any) => Array.isArray(subject.values) ? subject.values : [])
                            .filter((point: any) => Number.isFinite(Number(point?.value)) && Number.isFinite(Number(point?.target)) && Number(point.target) > 0);

                          const maxValue = allSeries.length
                            ? Math.max(100, ...allSeries.map((point: any) => Math.max(Number(point.value || 0), Number(point.target || 0))))
                            : 100;

                          return subjectSeries.map((subject, index) => {
                            const visibleValues = (subject.values || [])
                              .map((point: any) => ({
                                label: point.label,
                                value: Number(point.value),
                                target: Number(point.target),
                              }))
                              .filter((point: any) => Number.isFinite(point.value) && Number.isFinite(point.target) && point.target > 0);

                            const deviations = visibleValues.map((point: any) => ({
                              label: point.label,
                              deviation: Number(Math.round((calculateDeviationPercentage(point.value, point.target) || 0) * 100) / 100),
                            }));

                            const averageDeviation = deviations.length
                              ? Math.round(
                                  deviations.reduce((sum: number, item: any) => sum + Number(item.deviation || 0), 0) / deviations.length,
                                )
                              : null;

                            return (
                              <View key={`${subject.label}-${index}`} style={styles.chartSection}>
                                <Text style={styles.chartSectionTitle}>{subject.label}</Text>
                                {visibleValues.length > 0 ? renderLineChart(visibleValues, '#bfdbfe', '#2563eb', maxValue) : <Text style={styles.summaryValue}>No valid marks or targets to plot yet.</Text>}
                                <View style={{ marginTop: 8 }}>
                                  <Text style={styles.chartSectionTitle}>Annual deviation</Text>
                                  {deviations.length > 0 ? (
                                    <Text style={styles.summaryValue}>
                                      {deviations.map((item: any) => `Grade ${item.label}: ${item.deviation}%`).join(' • ')}
                                    </Text>
                                  ) : (
                                    <Text style={styles.summaryValue}>No deviation recorded — no target or achieved mark set for this subject yet.</Text>
                                  )}
                                  <Text style={[styles.summaryValue, { marginTop: 4 }]}>Average deviation: {averageDeviation === null ? 'N/A' : `${averageDeviation}%`}</Text>
                                </View>
                              </View>
                            );
                          });
                        })()}
                      </ScrollView>
                    ) : null}
                  </View>
                </View>
              </Modal>

              {selectedLearnerForSubjects?.id === learner.id && subjectModalVisible ? (
                <View style={styles.inlineSubjectSheet}>
                  <Text style={styles.modalTitle}>Add subject to {selectedLearnerForSubjects?.fullName || 'learner'}</Text>
                  <Text style={styles.modalSubtitle}>Grade {selectedLearnerForSubjects?.gradeLevel || 'Not set'}</Text>

                  <View style={styles.subjectListBox}>
                    <Text style={styles.subjectListTitle}>Already added subjects</Text>
                    {(learnerSubjectsMap[learner.id] || []).length === 0 ? (
                      <Text style={styles.empty}>No subjects added yet.</Text>
                    ) : (
                      (learnerSubjectsMap[learner.id] || []).map((subject) => (
                        <View key={subject.id} style={styles.subjectBadge}>
                          <Text style={styles.subjectBadgeText}>{subject.name}</Text>
                          {typeof subject.targetMarks === 'number' ? (
                            <Text style={styles.subjectBadgeMeta}>Target: {subject.targetMarks}</Text>
                          ) : null}
                          <TouchableOpacity
                            accessibilityLabel={`Remove ${subject.name} from ${selectedLearnerForSubjects?.fullName || 'learner'}`}
                            style={styles.removeSubjectButton}
                            onPress={() => void removeSubjectFromLearner(learner.id, subject.id)}
                          >
                            <Text style={styles.removeSubjectButtonText}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>

                  {subjectSelectionStep === 'category' ? (
                    <View style={styles.categoryList}>
                      {(() => {
                        const grade = String(learner.gradeLevel || '').trim();
                        const normalizedGrade = grade.replace(/\D/g, '');
                        const options = ['Senior Secondary', 'Junior Secondary', 'Vocational SNE'];

                        if (['7', '8', '9'].includes(normalizedGrade)) {
                          return ['Junior Secondary'];
                        }

                        if (['10', '11', '12'].includes(normalizedGrade)) {
                          return ['Senior Secondary'];
                        }

                        return options;
                      })().map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.categoryButton}
                          onPress={() => {
                            const nextCategory = option as 'Senior Secondary' | 'Junior Secondary' | 'Vocational SNE';
                            setSelectedSubjectCategory(nextCategory);
                            setSubjectSelectionStep('subjects');
                            void loadCategorySubjects(nextCategory, learner);
                          }}
                        >
                          <Text style={styles.categoryButtonText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : subjectSelectionStep === 'subjects' ? (
                    subjectGroupsLoading ? (
                      <View style={styles.loadingBox}>
                        <ActivityIndicator size="small" color="#1d4ed8" />
                        <Text style={styles.modalLoadingText}>Loading subjects...</Text>
                      </View>
                    ) : subjectGroups.length === 0 ? (
                      <Text style={styles.empty}>No subjects are available for this selection yet.</Text>
                    ) : (
                      <ScrollView
                        style={styles.subjectList}
                        contentContainerStyle={styles.subjectListContent}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator
                      >
                        {subjectGroups.map((group) => {
                          const normalizedGroupTitle = group.title === 'Electives' || /PATHWAY|pathway/i.test(group.title)
                            ? 'Electives'
                            : group.title;

                          return (
                            <View key={normalizedGroupTitle || group.title} style={styles.subjectGroup}>
                              <Text style={styles.subjectGroupTitle}>{normalizedGroupTitle}</Text>
                              {group.items.length === 0 ? (
                                <Text style={styles.empty}>No subjects in this category yet.</Text>
                              ) : (
                                group.items.map((subject) => (
                                  <TouchableOpacity
                                    key={`${normalizedGroupTitle}-${subject.id}`}
                                    style={styles.subjectItem}
                                    onPress={() => {
                                      setSelectedSubjectCandidate(subject);
                                      setSubjectSelectionStep('details');
                                      setTargetMarksInput('');
                                    }}
                                  >
                                    <Text style={styles.subjectItemCode}>{subject.code}</Text>
                                    <Text style={styles.subjectItemName}>{subject.name}</Text>
                                  </TouchableOpacity>
                                ))
                              )}
                            </View>
                          );
                        })}
                      </ScrollView>
                    )
                  ) : (
                    <View>
                      <Text style={styles.detailLabel}>Selected subject</Text>
                      <Text style={styles.subjectDetailName}>{selectedSubjectCandidate?.name || 'Subject'}</Text>

                      <Text style={styles.detailLabel}>Target marks</Text>
                      <TextInput
                        style={styles.input}
                        value={targetMarksInput}
                        onChangeText={setTargetMarksInput}
                        placeholder="Target marks"
                        keyboardType="numeric"
                        placeholderTextColor="#6b7280"
                      />

                      <View style={styles.detailActions}>
                        <TouchableOpacity
                          style={styles.secondaryButton}
                          onPress={() => {
                            setSelectedSubjectCandidate(null);
                            setTargetMarksInput('');
                            setSubjectSelectionStep('subjects');
                          }}
                        >
                          <Text style={styles.secondaryButtonText}>Back</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.primaryButton, savingSubject && styles.primaryButtonDisabled]}
                          onPress={() => {
                            if (!selectedSubjectCandidate) {
                              setNotice('Please select a subject before saving.');
                              return;
                            }
                            void addSubjectToLearner(selectedSubjectCandidate, targetMarksInput);
                          }}
                          disabled={savingSubject}
                        >
                          <View style={styles.buttonContentRow}>
                            {savingSubject ? <ActivityIndicator size="small" color="#ffffff" /> : null}
                            <Text style={styles.primaryButtonText}>{savingSubject ? 'Saving...' : 'Save subject'}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setSubjectModalVisible(false);
                      setSelectedLearnerForSubjects(null);
                      setSelectedSubjectCandidate(null);
                      setSelectedSubjectCategory('');
                      setSubjectGroups([]);
                      setTargetMarksInput('');
                      setSubjectSelectionStep('category');
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))
        )}
      </SectionCard>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  screenLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#374151',
  },
  modalLoadingText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 15,
    color: '#b91c1c',
    fontWeight: '700',
    textAlign: 'center',
  },
  teacherName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  notice: {
    marginTop: 12,
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '600',
  },
  classRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  classButtonActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  classButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  classButtonTextActive: {
    color: '#ffffff',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  gradeChip: {
    minWidth: 54,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  gradeChipSelected: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  gradeChipText: {
    fontWeight: '700',
    color: '#374151',
  },
  gradeChipTextSelected: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
    color: '#111827',
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    paddingVertical: 2,
  },
  placeholderText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  centeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  optionList: {
    maxHeight: 300,
    minHeight: 120,
    marginTop: 10,
  },
  optionListContent: {
    paddingBottom: 8,
    gap: 8,
  },
  optionHint: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
  },
  optionRow: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  optionRowSelected: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  optionMeta: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  genderOption: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  genderOptionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#1d4ed8',
  },
  genderOptionText: {
    color: '#374151',
    fontWeight: '700',
  },
  genderOptionTextSelected: {
    color: '#1d4ed8',
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  dialogText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 18,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '700',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ePortfolioUploadButton: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  empty: {
    color: '#6b7280',
    fontSize: 14,
  },
  learnerRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    marginTop: 8,
  },
  learnerLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  learnerMetaText: {
    flexShrink: 1,
    flex: 1,
  },
  learnerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  learnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
    flex: 1,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  },
  iconText: {
    color: '#1d4ed8',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  inlineSubjectSheet: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 12,
  },
  categoryList: {
    gap: 10,
    marginBottom: 12,
  },
  categoryButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  subjectSummaryBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 6,
  },
  subjectSummaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  subjectSummaryList: {
    gap: 6,
  },
  subjectListBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  subjectListTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  subjectBadge: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    flexShrink: 1,
  },
  subjectBadgeMeta: {
    fontSize: 11,
    color: '#1d4ed8',
    fontWeight: '700',
  },
  removeSubjectButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  removeSubjectButtonText: {
    color: '#b91c1c',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 16,
  },
  subjectList: {
    maxHeight: 260,
    minHeight: 180,
  },
  subjectListContent: {
    paddingBottom: 8,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  chartLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 10,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartLegendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  chartLegendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  chartRows: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 32,
  },
  chartBarsWrap: {
    width: '100%',
    height: 88,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  chartTargetBar: {
    width: '100%',
    borderRadius: 4,
    opacity: 0.7,
  },
  chartValueBar: {
    width: '100%',
    borderRadius: 4,
  },
  chartLabel: {
    marginTop: 6,
    fontSize: 10,
    color: '#374151',
    fontWeight: '700',
    textAlign: 'center',
  },
  chartAxisLabel: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '700',
  },
  graphModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  graphModalCard: {
    width: '100%',
    maxWidth: 520,
    height: '90%',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  graphModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  graphModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  graphCloseButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  graphCloseButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  graphModalScroll: {
    flex: 1,
  },
  graphModalContent: {
    paddingBottom: 24,
    gap: 8,
  },
  summaryCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '800',
  },
  chartSection: {
    marginBottom: 12,
  },
  chartSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  linkedDocumentList: {
    marginTop: 14,
    gap: 10,
  },
  linkedDocumentCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  linkedDocumentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  linkedDocumentTextBlock: {
    flex: 1,
    gap: 2,
  },
  linkedDocumentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  linkedDocumentMeta: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  linkedDocumentDescription: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  rubricScrollView: {
    maxHeight: 360,
    minHeight: 220,
  },
  rubricScrollContent: {
    paddingBottom: 8,
    gap: 4,
  },
  subjectGroup: {
    marginBottom: 14,
  },
  subjectGroupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  subjectItem: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  subjectItemCode: {
    fontWeight: '800',
    color: '#1d4ed8',
    fontSize: 12,
  },
  subjectItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  subjectItemMeta: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  subjectPerformanceRow: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subjectPerformanceInfo: {
    flex: 1,
    minWidth: 0,
  },
  subjectPerformanceUpdateBox: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 4,
    width: 72,
  },
  subjectPerformanceInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 5,
    backgroundColor: '#f9fafb',
    color: '#111827',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: 28,
  },
  inlineSaveButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineSaveButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 8,
    marginBottom: 6,
  },
  subjectDetailName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: '700',
    color: '#111827',
  },
});
