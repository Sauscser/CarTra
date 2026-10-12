import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import SectionCard from '../../components/shared/SectionCard';
import { CBE_ATTEMPTED_POINTS_MAX, DEFAULT_CBE_ACHIEVEMENT_RANGES, getCbeAchievementLevel, getCourseRequirementGroups, hasCompleteCourseScoringData, hasCompleteCourseSubjectRequirements, hasValidCbeAchievementRanges, parseCbeAchievementRanges, parseCourseClusterRequirements } from '../../utils/cluster';
import { createTertiaryCourse, createTertiaryInstitutionProfile, updateTertiaryCourse } from '../../graphql/mutations';
import { listCoreSubjects, listOrgHierarchies, listSubjects, listSupportSubjects, listTertiaryCourses, listTertiaryInstitutionProfiles, listUsers } from '../../graphql/queries';
import { RoleGroup } from '../../types/auth';

type TertiaryInstitution = {
  id: string;
  userId: string;
  institutionName: string;
  nationCode: string;
  regionCode?: string | null;
  countyCode?: string | null;
};

type TertiaryCourse = {
  id: string;
  institutionId: string;
  courseCode: string;
  courseName: string;
  clusterRequirements?: ClusterRequirementSequence | null;
  status?: string | null;
};

type CatalogSubject = {
  id: string;
  code: string;
  name: string;
  category: string;
  cbeAchievementRanges?: unknown;
};

type ClusterRequirementSequence = {
  version: 3;
  pointScale: 'CBE_8';
  subjectSequence: Array<{ subjectId: string; subjectName?: string; operator: 'AND' | 'OR'; minimumPoints?: number; achievementRanges?: typeof DEFAULT_CBE_ACHIEVEMENT_RANGES }>;
  bestSubjectsMinimumPoints?: number;
  achievementRanges?: typeof DEFAULT_CBE_ACHIEVEMENT_RANGES;
};

const SUBJECT_POINT_OPTIONS = Array.from({ length: 8 }, (_, index) => 8 - index);

function parseClusterRequirements(value: unknown): ClusterRequirementSequence | null {
  const parsed = parseCourseClusterRequirements(value);
  if (!parsed?.subjectSequence?.length) return null;
  return {
    version: 3,
    pointScale: 'CBE_8',
    subjectSequence: parsed.subjectSequence,
    bestSubjectsMinimumPoints: parsed.bestSubjectsMinimumPoints,
    achievementRanges: parsed.achievementRanges,
  };
}

export default function TertiaryHomeScreen() {
  const client = useMemo(() => generateClient(), []);
  const [loading, setLoading] = useState(true);
  const [savingInstitution, setSavingInstitution] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [notice, setNotice] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<RoleGroup | 'unknown'>('unknown');
  const [institutionName, setInstitutionName] = useState('');
  const [nationCode, setNationCode] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [countyCode, setCountyCode] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [bestSubjectsMinimumPoints, setBestSubjectsMinimumPoints] = useState('');
  const [achievementRanges, setAchievementRanges] = useState(DEFAULT_CBE_ACHIEVEMENT_RANGES);
  const [catalogSubjects, setCatalogSubjects] = useState<CatalogSubject[]>([]);
  const [selectedSubjectSequence, setSelectedSubjectSequence] = useState<Array<{ subjectId: string; operator: 'AND' | 'OR'; minimumPoints?: number; achievementRanges?: typeof DEFAULT_CBE_ACHIEVEMENT_RANGES }>>([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [institutionRecord, setInstitutionRecord] = useState<TertiaryInstitution | null>(null);
  const [courses, setCourses] = useState<TertiaryCourse[]>([]);
  const [expandedCourseId, setExpandedCourseId] = useState('');
  const [courseFieldDrafts, setCourseFieldDrafts] = useState<Record<string, { courseCode: string; courseName: string; status: string; bestSubjectsMinimumPoints: string }>>({});
  const [savingCourseField, setSavingCourseField] = useState('');
  const [courseSubjectSearch, setCourseSubjectSearch] = useState('');
  const [pendingCourseSubjectId, setPendingCourseSubjectId] = useState('');
  const selectedGroupCount = useMemo(
    () => getCourseRequirementGroups({ version: 3, pointScale: 'CBE_8', subjectSequence: selectedSubjectSequence }).length,
    [selectedSubjectSequence],
  );
  const canAddSelectedSubject = selectedGroupCount < 7 || selectedSubjectSequence[selectedSubjectSequence.length - 1]?.operator === 'OR';
  const selectedSubjectIds = useMemo(() => new Set(selectedSubjectSequence.map((item) => item.subjectId)), [selectedSubjectSequence]);
  const selectedCatalogSubjects = useMemo(
    () => selectedSubjectSequence.map((item) => catalogSubjects.find((subject) => subject.id === item.subjectId)).filter((subject): subject is CatalogSubject => Boolean(subject)),
    [catalogSubjects, selectedSubjectSequence],
  );
  const filteredCatalogSubjects = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();
    if (!query) return [];
    return catalogSubjects
      .filter((subject) => !selectedSubjectIds.has(subject.id))
      .filter((subject) => `${subject.name} ${subject.code} ${subject.category}`.toLowerCase().includes(query))
      .slice(0, 12);
  }, [catalogSubjects, selectedSubjectIds, subjectSearch]);
  const filteredCourseSubjects = useMemo(() => {
    const query = courseSubjectSearch.trim().toLowerCase();
    if (!query) return [];
    const course = courses.find((item) => item.id === expandedCourseId);
    const assignedIds = new Set(course?.clusterRequirements?.subjectSequence.map((item) => item.subjectId) || []);
    return catalogSubjects.filter((subject) => !assignedIds.has(subject.id))
      .filter((subject) => `${subject.name} ${subject.code} ${subject.category}`.toLowerCase().includes(query))
      .slice(0, 12);
  }, [catalogSubjects, courseSubjectSearch, expandedCourseId, courses]);

  useEffect(() => {
    void loadTertiaryContext();
  }, [client]);

  const refreshCoursesForInstitution = async (institutionId?: string) => {
    if (!institutionId) {
      setCourses([]);
      return;
    }

    try {
      const courseResult = await client.graphql({
        query: listTertiaryCourses,
        variables: {
          filter: { institutionId: { eq: institutionId } },
          limit: 200,
        },
      });

      const coursePayload = courseResult as { data?: { listTertiaryCourses?: { items?: Array<any> } } };
      const institutionCourses = (coursePayload.data?.listTertiaryCourses?.items || []).map((course: any) => ({
        id: course.id,
        institutionId: course.institutionId,
        courseCode: course.courseCode,
        courseName: course.courseName,
        clusterRequirements: parseClusterRequirements(course.clusterRequirements),
        status: course.status,
      }));

      setCourses(institutionCourses);
    } catch (error) {
      console.error('Tertiary debug: failed to refresh institution courses', error);
      setCourses([]);
    }
  };

  const validateUniqueCourseDetails = async (
    institutionId: string,
    courseCodeValue: string,
    courseNameValue: string,
    excludedCourseId?: string,
  ) => {
    const existingCourses: Array<{ id: string; courseCode?: string; courseName?: string }> = [];
    let nextToken: string | null = null;

    do {
      const result = await client.graphql({
        query: listTertiaryCourses,
        variables: {
          filter: { institutionId: { eq: institutionId } },
          limit: 500,
          nextToken,
        },
      }) as {
        data?: { listTertiaryCourses?: { items?: Array<{ id?: string; courseCode?: string; courseName?: string }>; nextToken?: string | null } };
        errors?: Array<{ message?: string }>;
      };
      if (result.errors?.length) {
        throw new Error(result.errors.map((error) => error.message || 'Unknown GraphQL error').join('; '));
      }

      const connection = result.data?.listTertiaryCourses;
      if (!connection) throw new Error('The institution course list response was empty.');
      existingCourses.push(...(connection.items || []).filter((course): course is { id: string; courseCode?: string; courseName?: string } => Boolean(course?.id)));
      nextToken = connection.nextToken || null;
    } while (nextToken);

    const normalizedCode = courseCodeValue.trim().toLowerCase();
    const normalizedName = courseNameValue.trim().toLowerCase();
    const duplicate = existingCourses.find((course) => {
      if (course.id === excludedCourseId) return false;
      return course.courseCode?.trim().toLowerCase() === normalizedCode
        || course.courseName?.trim().toLowerCase() === normalizedName;
    });
    if (!duplicate) return null;

    if (duplicate.courseCode?.trim().toLowerCase() === normalizedCode) {
      return `A course with code "${courseCodeValue.trim()}" already exists at this institution. Use a unique course code.`;
    }
    return `A course named "${courseNameValue.trim()}" already exists at this institution. Use a unique course name.`;
  };

  const loadTertiaryContext = async () => {
    try {
      setLoading(true);
      setNotice('');

      const [subjectResult, coreSubjectResult, supportSubjectResult] = await Promise.all([
        client.graphql({ query: listSubjects, variables: { limit: 200 } }),
        client.graphql({ query: listCoreSubjects, variables: { limit: 200 } }),
        client.graphql({ query: listSupportSubjects, variables: { limit: 200 } }),
      ]);
      const subjectItems = (subjectResult as any).data?.listSubjects?.items || [];
      const coreItems = (coreSubjectResult as any).data?.listCoreSubjects?.items || [];
      const supportItems = (supportSubjectResult as any).data?.listSupportSubjects?.items || [];
      const catalog = [...subjectItems.map((item: any) => ({ ...item, category: item.category || 'Elective' })), ...coreItems.map((item: any) => ({ ...item, category: 'Core' })), ...supportItems.map((item: any) => ({ ...item, category: 'Support' }))]
        .filter((item: any) => item?.id && item?.code && item?.name)
        .reduce((items: CatalogSubject[], item: any) => items.some((existing) => existing.id === item.id) ? items : [...items, {
          id: item.id,
          code: item.code,
          name: item.name,
          category: item.category,
          cbeAchievementRanges: item.cbeAchievementRanges,
        }], []);
      setCatalogSubjects(catalog.sort((left: CatalogSubject, right: CatalogSubject) => left.name.localeCompare(right.name)));

      const session = await fetchAuthSession();
      const idTokenPayload = session.tokens?.idToken?.payload as { email?: string; name?: string; given_name?: string; family_name?: string } | undefined;
      const sessionEmail = (
        (idTokenPayload?.email ?? '').trim() ||
        (await getCurrentUser()).username?.trim() ||
        ''
      ).toLowerCase();

      if (!sessionEmail) {
        throw new Error('No signed-in tertiary admin email was found.');
      }

      setCurrentEmail(sessionEmail);

      const userResult = await client.graphql({
        query: listUsers,
        variables: {
          filter: { email: { eq: sessionEmail } },
          limit: 20,
        },
      });

      const userPayload = userResult as { data?: { listUsers?: { items?: Array<any> } } };
      const matchingUser = userPayload.data?.listUsers?.items?.[0];
      const appUserId = matchingUser?.id as string | undefined;
      const resolvedRole = matchingUser?.role as RoleGroup | undefined;

      console.log('Tertiary debug: signed-in user lookup', {
        sessionEmail,
        matchingUser,
        appUserId,
        resolvedRole,
      });

      setCurrentUserId(appUserId || null);
      setCurrentUserRole(resolvedRole || 'unknown');

      if (!appUserId) {
        console.log('Tertiary debug: no matching User record found for this officer', {
          sessionEmail,
        });
        setInstitutionRecord(null);
        setInstitutionName('');
        setNationCode('');
        setRegionCode('');
        setCountyCode('');
        setCourses([]);
        setNotice('The tertiary institution must be registered by the county director before the admin can manage programme courses here.');
        return;
      }

      const allInstitutionResult = await client.graphql({
        query: listTertiaryInstitutionProfiles,
        variables: {
          limit: 200,
        },
      });

      const allInstitutionPayload = allInstitutionResult as { data?: { listTertiaryInstitutionProfiles?: { items?: Array<any> } } };
      const allInstitutionItems = allInstitutionPayload.data?.listTertiaryInstitutionProfiles?.items || [];

      console.log('Tertiary debug: unfiltered TertiaryInstitutionProfile list', {
        sessionEmail,
        appUserId,
        currentRole: resolvedRole,
        totalRecords: allInstitutionItems.length,
        allInstitutionItems,
        rawResponse: allInstitutionPayload,
      });

      const matchedInstitution = allInstitutionItems.find((item: any) => {
        const profileUserId = String(item?.userId ?? '').trim().toLowerCase();
        const currentUserKey = String(appUserId ?? '').trim().toLowerCase();
        return profileUserId === sessionEmail || profileUserId === currentUserKey;
      });

      console.log('Tertiary debug: matched institution by userId/email', {
        sessionEmail,
        appUserId,
        matchedInstitution,
      });

      const isAdminUser = resolvedRole === 'appOwner' || resolvedRole === 'nationalOfficer' || resolvedRole === 'tertiaryOfficer' || Boolean(matchedInstitution);
      if (!isAdminUser) {
        setInstitutionRecord(null);
        setInstitutionName('');
        setNationCode('');
        setRegionCode('');
        setCountyCode('');
        setCourses([]);
        setNotice('This tertiary setup is restricted to the app admin or the institution admin. Once the county director registers the institution, the admin can add the courses it offers here.');
        return;
      }

      const institution = matchedInstitution;

      console.log('Tertiary debug: mapped institution record', institution);

      if (institution) {
        setInstitutionRecord({
          id: institution.id,
          userId: institution.userId,
          institutionName: institution.institutionName,
          nationCode: institution.nationCode,
          regionCode: institution.regionCode,
          countyCode: institution.countyCode,
        });
        setInstitutionName(institution.institutionName || '');
        setNationCode(institution.nationCode || '');
        setRegionCode(institution.regionCode || '');
        setCountyCode(institution.countyCode || '');

        try {
          const nationResult = await client.graphql({
            query: listOrgHierarchies,
            variables: { filter: { and: [{ entityType: { eq: 'nation' } }, { code: { eq: institution.nationCode } }] }, limit: 1 },
          });
          const nation = (nationResult as any).data?.listOrgHierarchies?.items?.[0];
          const nationMetadata = typeof nation?.metadata === 'string'
            ? (() => { try { return JSON.parse(nation.metadata); } catch { return {}; } })()
            : nation?.metadata || {};
          const savedRanges = nationMetadata.cbeAchievementRanges;
          setAchievementRanges(hasValidCbeAchievementRanges(savedRanges) ? parseCbeAchievementRanges(savedRanges) : DEFAULT_CBE_ACHIEVEMENT_RANGES);
        } catch {
          setAchievementRanges(DEFAULT_CBE_ACHIEVEMENT_RANGES);
        }

        await refreshCoursesForInstitution(institution.id);
      } else {
        setInstitutionRecord(null);
        setInstitutionName('');
        setNationCode('');
        setRegionCode('');
        setCountyCode('');
        setCourses([]);
        setNotice('No tertiary institution has been registered yet. Ask the county director to register it first.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load your tertiary account.';
      setNotice(message);
      setInstitutionRecord(null);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstitution = async () => {
    if (!currentUserId) {
      Alert.alert('Missing user record', 'The signed-in user record could not be resolved.');
      return;
    }

    if (currentUserRole !== 'countyOfficer') {
      Alert.alert('Restricted access', 'The tertiary institution is registered by the county director before the admin can manage courses here.');
      return;
    }

    if (!institutionName.trim() || !nationCode.trim()) {
      Alert.alert('Institution details required', 'Please provide the institution name and nation code.');
      return;
    }

    try {
      setSavingInstitution(true);
      setNotice('');

      const result = await client.graphql({
        query: createTertiaryInstitutionProfile,
        variables: {
          input: {
            userId: currentUserId,
            institutionName: institutionName.trim(),
            nationCode: nationCode.trim(),
            regionCode: regionCode.trim() || null,
            countyCode: countyCode.trim() || null,
          },
        },
      });

      const payload = result as { data?: { createTertiaryInstitutionProfile?: { id?: string } } };
      const createdInstitutionId = payload.data?.createTertiaryInstitutionProfile?.id;

      if (!createdInstitutionId) {
        throw new Error('The institution profile was not created.');
      }

      setNotice('Institution profile created successfully. The admin can now add the courses it offers from the Tertiary Office screen.');
      await loadTertiaryContext();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create the institution profile.';
      Alert.alert('Institution creation failed', message);
      setNotice(message);
    } finally {
      setSavingInstitution(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!institutionRecord?.id) {
      Alert.alert('Institution required', 'Create or load your tertiary institution first.');
      return;
    }
    const subjectWithoutRanges = selectedSubjectSequence.find((item) => {
      const subject = catalogSubjects.find((candidate) => candidate.id === item.subjectId);
      return !subject || !hasValidCbeAchievementRanges(subject.cbeAchievementRanges);
    });
    if (subjectWithoutRanges) {
      const subjectName = catalogSubjects.find((subject) => subject.id === subjectWithoutRanges.subjectId)?.name || subjectWithoutRanges.subjectId;
      Alert.alert('Subject CBE ranges required', `The National Officer has not saved valid CBE achievement ranges for ${subjectName}. Ask them to configure this subject's eight achievement ranges before creating the course.`);
      return;
    }

    if (!courseCode.trim() || !courseName.trim()) {
      Alert.alert('Course details required', 'Please provide the course code and course name.');
      return;
    }
    try {
      const duplicateNotice = await validateUniqueCourseDetails(institutionRecord.id, courseCode, courseName);
      if (duplicateNotice) {
        Alert.alert('Duplicate course', duplicateNotice);
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not verify whether this course already exists.';
      Alert.alert('Course validation failed', message);
      setNotice(message);
      return;
    }

    if (selectedSubjectSequence.length === 0) {
      Alert.alert('Cluster subjects required', 'Select at least one required subject or alternative subject for this course.');
      return;
    }
    if (selectedGroupCount > 7) {
      Alert.alert('Too many cluster groups', 'A course can have up to seven required subject groups because the formula uses the seven best subjects. Use OR for alternatives within a group.');
      return;
    }
    if (selectedSubjectSequence.some((item) => !Number.isInteger(item.minimumPoints) || Number(item.minimumPoints) < 1 || Number(item.minimumPoints) > 8)) {
      Alert.alert('Subject points required', 'Choose the minimum points required for every selected subject.');
      return;
    }
    const bestSubjectsTarget = Number(bestSubjectsMinimumPoints);
    if (!Number.isInteger(bestSubjectsTarget) || bestSubjectsTarget < 0 || bestSubjectsTarget > CBE_ATTEMPTED_POINTS_MAX) {
      Alert.alert('Best-subject target required', `Enter a whole-number minimum from 0 to ${CBE_ATTEMPTED_POINTS_MAX} for the seven best subjects.`);
      return;
    }

    try {
      setSavingCourse(true);
      setNotice('');

      const payload = {
        input: {
          institutionId: institutionRecord.id,
          courseCode: courseCode.trim().toUpperCase(),
          courseName: courseName.trim(),
          pathwayId: null,
          clusterRequirements: JSON.stringify({ version: 3, pointScale: 'CBE_8', subjectSequence: selectedSubjectSequence, bestSubjectsMinimumPoints: bestSubjectsTarget, achievementRanges }),
          status: 'active',
        },
      };

      console.log('Tertiary debug: creating course payload', payload);

      const result = await client.graphql({
        query: createTertiaryCourse,
        variables: payload,
      });

      const createdCourse = (result as { data?: { createTertiaryCourse?: any } })?.data?.createTertiaryCourse;

      setCourseCode('');
      setCourseName('');
      setSelectedSubjectSequence([]);
      setSubjectSearch('');

      if (createdCourse) {
        setCourses((current) => [
          {
            id: createdCourse.id,
            institutionId: createdCourse.institutionId,
            courseCode: createdCourse.courseCode,
            courseName: createdCourse.courseName,
            clusterRequirements: parseClusterRequirements(createdCourse.clusterRequirements) || parseClusterRequirements(payload.input.clusterRequirements),
            status: createdCourse.status,
          },
          ...current,
        ]);
      } else {
        await refreshCoursesForInstitution(institutionRecord.id);
      }

      setNotice('Course created successfully for your institution.');
      Alert.alert('Course created', 'The institution course requirement was created successfully.');
    } catch (error) {
      console.error('Tertiary debug: course creation failed', {
        error,
        institutionId: institutionRecord?.id,
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        currentUserRole,
        currentUserId,
      });

      const message = error instanceof Error ? error.message : 'Could not create the course.';
      Alert.alert('Course creation failed', message);
      setNotice(message);
    } finally {
      setSavingCourse(false);
    }
  };

  const saveCourseField = async (course: TertiaryCourse, field: 'courseCode' | 'courseName' | 'status') => {
    const draft = courseFieldDrafts[course.id];
    const rawValue = draft?.[field]?.trim() || '';
    if (!rawValue) {
      Alert.alert('Course detail required', `${field === 'courseCode' ? 'Course code' : field === 'courseName' ? 'Course name' : 'Course status'} cannot be blank.`);
      return;
    }
    const value = field === 'courseCode' ? rawValue.toUpperCase() : rawValue;
    if (field === 'courseCode' || field === 'courseName') {
      try {
        const nextCode = field === 'courseCode' ? value : course.courseCode;
        const nextName = field === 'courseName' ? value : course.courseName;
        const duplicateNotice = await validateUniqueCourseDetails(course.institutionId, nextCode, nextName, course.id);
        if (duplicateNotice) {
          setNotice(duplicateNotice);
          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not verify whether this course already exists.';
        setNotice(message);
        return;
      }
    }
    try {
      setSavingCourseField(`${course.id}:${field}`);
      await client.graphql({ query: updateTertiaryCourse, variables: { input: { id: course.id, [field]: value || null } } });
      setCourses((current) => current.map((item) => item.id === course.id ? { ...item, [field]: value } : item));
      setNotice(`${field === 'courseCode' ? 'Course code' : field === 'courseName' ? 'Course name' : 'Course status'} saved for ${value || course.courseName}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `Could not save course ${field}.`);
    } finally {
      setSavingCourseField('');
    }
  };

  const saveCourseRequirements = async (course: TertiaryCourse, nextRequirements: ClusterRequirementSequence, saveKey: string) => {
    try {
      setSavingCourseField(`${course.id}:${saveKey}`);
      await client.graphql({
        query: updateTertiaryCourse,
        variables: { input: { id: course.id, clusterRequirements: JSON.stringify(nextRequirements) } },
      });
      setCourses((current) => current.map((item) => item.id === course.id ? { ...item, clusterRequirements: nextRequirements } : item));
      setNotice('Course scoring detail saved.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save this course scoring detail.');
    } finally {
      setSavingCourseField('');
    }
  };

  const saveCourseBestSubjectsMinimum = async (course: TertiaryCourse) => {
    const raw = courseFieldDrafts[course.id]?.bestSubjectsMinimumPoints?.trim() || '';
    const minimum = Number(raw);
    if (!raw || !Number.isInteger(minimum) || minimum < 0 || minimum > CBE_ATTEMPTED_POINTS_MAX) {
      Alert.alert('Seven-best minimum required', `Enter a whole number from 0 to ${CBE_ATTEMPTED_POINTS_MAX}.`);
      return;
    }
    const current = course.clusterRequirements;
    if (!current) {
      Alert.alert('Course requirements missing', 'Complete the course cluster subject requirements before editing its seven-best minimum.');
      return;
    }
    await saveCourseRequirements(course, { ...current, bestSubjectsMinimumPoints: minimum }, 'bestSubjectsMinimumPoints');
  };

  const saveCourseSubjectRequirement = async (course: TertiaryCourse, subjectId: string, change: { minimumPoints?: number; operator?: 'AND' | 'OR' }) => {
    const current = course.clusterRequirements;
    if (!current) return;
    const subjectSequence = current.subjectSequence.map((item) => item.subjectId === subjectId ? { ...item, ...change } : item);
    await saveCourseRequirements(course, { ...current, subjectSequence }, `subject-${subjectId}`);
  };

  const removeCourseSubjectRequirement = async (course: TertiaryCourse, subjectId: string) => {
    const current = course.clusterRequirements;
    if (!current) return;
    await saveCourseRequirements(course, { ...current, subjectSequence: current.subjectSequence.filter((item) => item.subjectId !== subjectId) }, `remove-${subjectId}`);
  };

  const addCourseSubjectRequirement = async (course: TertiaryCourse, subjectId: string, minimumPoints: number) => {
    const current = course.clusterRequirements || {
      version: 3 as const,
      pointScale: 'CBE_8' as const,
      subjectSequence: [],
      bestSubjectsMinimumPoints: undefined,
      achievementRanges,
    };
    const subject = catalogSubjects.find((item) => item.id === subjectId);
    if (!current || !subject) return;
    if (!hasValidCbeAchievementRanges(subject.cbeAchievementRanges)) {
      Alert.alert('Subject CBE ranges required', `The National Officer has not saved valid CBE achievement ranges for ${subject.name}. Ask them to configure this subject's eight achievement ranges before adding it to the course.`);
      setPendingCourseSubjectId('');
      return;
    }
    if (getCourseRequirementGroups(current).length >= 7) {
      Alert.alert('Course cluster limit reached', 'A course can have up to seven cluster subject groups.');
      return;
    }
    const subjectSequence = [...current.subjectSequence, {
      subjectId,
      subjectName: subject.name,
      operator: 'AND' as const,
      minimumPoints,
      achievementRanges: parseCbeAchievementRanges(subject.cbeAchievementRanges),
    }];
    await saveCourseRequirements(course, { ...current, subjectSequence }, `add-${subjectId}`);
    setPendingCourseSubjectId('');
    setCourseSubjectSearch('');
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#0f172a" />
        <Text style={styles.loaderText}>Loading tertiary admin setup...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.pageTitle}>Tertiary Office</Text>
          <Text style={styles.pageSubtitle}>Manage the registered tertiary institution and add the courses it offers.</Text>
        </View>

        <SectionCard title="Institution details" subtitle="The registered tertiary institution linked to this account.">
          <Text style={styles.infoLabel}>Institution name</Text>
          <Text style={styles.infoValue}>{institutionRecord?.institutionName || 'No institution profile linked yet'}</Text>
        </SectionCard>

        {currentUserRole === 'countyOfficer' ? (
          <SectionCard title="Institution registration" subtitle="The county director registers the tertiary institution before the admin can manage courses.">
            <PrimaryTextInput value={institutionName} onChangeText={setInstitutionName} placeholder="Institution name" />
            <PrimaryTextInput value={nationCode} onChangeText={setNationCode} placeholder="Nation code" autoCapitalize="characters" />
            <PrimaryTextInput value={regionCode} onChangeText={setRegionCode} placeholder="Region code (optional)" autoCapitalize="characters" />
            <PrimaryTextInput value={countyCode} onChangeText={setCountyCode} placeholder="County code (optional)" autoCapitalize="characters" />

            <TouchableOpacity style={styles.primaryButton} onPress={handleCreateInstitution} disabled={savingInstitution}>
              <Text style={styles.primaryButtonText}>{savingInstitution ? 'Creating...' : institutionRecord ? 'Update institution profile' : 'Create institution profile'}</Text>
            </TouchableOpacity>

            {institutionRecord ? (
              <View style={styles.ownerBox}>
                <Text style={styles.ownerTitle}>Registered institution</Text>
                <Text style={styles.ownerValue}>{institutionRecord.institutionName}</Text>
                <Text style={styles.ownerMeta}>Institution code: {institutionRecord.id}</Text>
              </View>
            ) : null}
          </SectionCard>
        ) : null}

        <SectionCard title="Programme / course requirements" subtitle="Set the minimum subject points a learner needs for each course.">
            <PrimaryTextInput value={courseCode} onChangeText={setCourseCode} placeholder="Course code" autoCapitalize="characters" />
          <PrimaryTextInput value={courseName} onChangeText={setCourseName} placeholder="Course name" />
          <Text style={styles.ruleLabel}>Minimum points from seven best subjects</Text>
          <Text style={styles.ruleHelp}>Set the minimum total across the learner's seven best attempted subjects, including the cluster subjects (0–56 points).</Text>
          <PrimaryTextInput value={bestSubjectsMinimumPoints} onChangeText={setBestSubjectsMinimumPoints} placeholder={`Seven-best minimum (0–${CBE_ATTEMPTED_POINTS_MAX})`} keyboardType="numeric" />

          <Text style={styles.ruleLabel}>Cluster subject rule</Text>
          <Text style={styles.ruleHelp}>Select up to seven cluster groups and set each minimum on the CBE 1–8 scale: EE2=8, EE1=7, ME2=6, ME1=5, AE2=4, AE1=3, BE2=2, BE1=1. Each row’s AND/OR buttons control how it connects to the next subject. AND requires both; OR makes alternatives in one group, where the best-performing subject counts. Groups: {selectedGroupCount}/7.</Text>
          {selectedCatalogSubjects.map((subject) => {
            const sequenceItem = selectedSubjectSequence.find((item) => item.subjectId === subject.id);
            const isAlternative = sequenceItem?.operator === 'OR';
            return (
              <View key={subject.id} style={styles.selectedSubjectCard}>
                <View style={styles.selectedSubjectRow}>
                  <View style={styles.selectedSubjectText}>
                    <Text style={styles.catalogSubject}>{subject.name} ({subject.code})</Text>
                    <Text style={styles.catalogCategory}>{subject.category}</Text>
                  </View>
                  <View style={styles.ruleActions}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      style={[styles.ruleButton, !isAlternative && styles.ruleButtonActive]}
                      onPress={() => setSelectedSubjectSequence((current) => current.map((item) => item.subjectId === subject.id ? { ...item, operator: 'AND' } : item))}
                    >
                      <Text style={styles.ruleButtonText}>AND</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      style={[styles.ruleButton, isAlternative && styles.ruleButtonAlternative]}
                      onPress={() => setSelectedSubjectSequence((current) => current.map((item) => item.subjectId === subject.id ? { ...item, operator: 'OR' } : item))}
                    >
                      <Text style={styles.ruleButtonText}>OR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      style={styles.removeSubjectButton}
                      onPress={() => setSelectedSubjectSequence((current) => current.filter((item) => item.subjectId !== subject.id))}
                    >
                      <Text style={styles.removeSubjectText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pointsRequirement}>
                  <Text style={styles.pointsRequirementLabel}>Minimum points required</Text>
                  <View style={styles.pointsOptions}>
                    {SUBJECT_POINT_OPTIONS.map((points) => (
                      <TouchableOpacity
                        key={points}
                        accessibilityRole="button"
                        accessibilityState={{ selected: sequenceItem?.minimumPoints === points }}
                        style={[styles.pointsOption, sequenceItem?.minimumPoints === points && styles.pointsOptionSelected]}
                        onPress={() => setSelectedSubjectSequence((current) => current.map((item) => item.subjectId === subject.id ? { ...item, minimumPoints: points } : item))}
                      >
                        <Text style={[styles.pointsOptionText, sequenceItem?.minimumPoints === points && styles.pointsOptionTextSelected]}>{points} {getCbeAchievementLevel(points)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
          <PrimaryTextInput
            value={subjectSearch}
            onChangeText={setSubjectSearch}
            placeholder="Type a subject name or code"
            autoCapitalize="words"
          />
          {filteredCatalogSubjects.length > 0 ? (
            <View style={styles.searchResults}>
              {filteredCatalogSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.searchResultRow}
                  disabled={!canAddSelectedSubject}
                  onPress={() => {
                    if (!hasValidCbeAchievementRanges(subject.cbeAchievementRanges)) {
                      Alert.alert('Subject CBE ranges required', `The National Officer has not saved valid CBE achievement ranges for ${subject.name}. Ask them to configure this subject's eight achievement ranges before adding it to the course.`);
                      return;
                    }
                    setSelectedSubjectSequence((current) => [...current, {
                      subjectId: subject.id,
                      operator: 'AND',
                      achievementRanges: parseCbeAchievementRanges(subject.cbeAchievementRanges),
                    }]);
                    setSubjectSearch('');
                  }}
                >
                  <Text style={styles.catalogSubject}>{subject.name} ({subject.code})</Text>
                  <Text style={styles.catalogCategory}>{subject.category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : subjectSearch.trim() ? (
            <Text style={styles.noSearchResults}>No National-catalog subject matches that search.</Text>
          ) : null}
          <Text style={styles.ruleSummary}>{selectedSubjectSequence.length > 0 ? selectedSubjectSequence.map((item, index) => `${index > 0 ? (selectedSubjectSequence[index - 1].operator === 'OR' ? ' / ' : ', ') : ''}${catalogSubjects.find((subject) => subject.id === item.subjectId)?.name || 'Unknown subject'} (${item.minimumPoints ?? '?'} ${Number.isInteger(item.minimumPoints) ? getCbeAchievementLevel(Number(item.minimumPoints)) : 'CBE pts'})`).join('') : 'No subjects selected yet.'}</Text>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleCreateCourse} disabled={savingCourse || !institutionRecord?.id}>
            <Text style={styles.primaryButtonText}>{savingCourse ? 'Saving course...' : 'Add course requirement'}</Text>
          </TouchableOpacity>

          {courses.length === 0 ? (
            <Text style={styles.placeholder}>No courses have been added for this institution yet.</Text>
          ) : (
            <View style={styles.courseList}>
              {courses.map((course) => (
                <View key={course.id} style={styles.courseItem}>
                  <Text style={styles.courseName}>{course.courseName}</Text>
                  <Text style={styles.courseCode}>{course.courseCode}</Text>
                  {hasCompleteCourseSubjectRequirements(course.clusterRequirements) ? <Text style={styles.courseScore}>CBE subjects: {(() => {
                    const sequence = course.clusterRequirements?.subjectSequence || [];
                    return sequence.length ? sequence.map((item, index) => `${index > 0 ? (sequence[index - 1].operator === 'OR' ? ' / ' : ', ') : ''}${catalogSubjects.find((subject) => subject.id === item.subjectId)?.name || 'Unknown subject'} (${item.minimumPoints ?? '?'} ${Number.isInteger(item.minimumPoints) ? getCbeAchievementLevel(Number(item.minimumPoints)) : 'CBE pts'})`).join('') : 'Not configured';
                  })()}</Text> : <Text style={styles.courseScore}>Not assignable: CBE subject groups or minimum points are missing.</Text>}
                  <Text style={styles.courseScore}>{hasCompleteCourseScoringData(course.clusterRequirements) ? `Seven-best minimum: ${course.clusterRequirements?.bestSubjectsMinimumPoints}/${CBE_ATTEMPTED_POINTS_MAX}` : 'Not ready: the explicit seven-best minimum or valid saved national CBE ranges are missing.'}</Text>
                  <TouchableOpacity
                    style={styles.editCourseToggle}
                    onPress={() => {
                      const nextExpandedId = expandedCourseId === course.id ? '' : course.id;
                      setExpandedCourseId(nextExpandedId);
                      setPendingCourseSubjectId('');
                      setCourseSubjectSearch('');
                      if (nextExpandedId) {
                        setCourseFieldDrafts((current) => ({
                          ...current,
                          [course.id]: {
                            courseCode: course.courseCode || '',
                            courseName: course.courseName || '',
                            status: course.status || 'active',
                            bestSubjectsMinimumPoints: Number.isInteger(course.clusterRequirements?.bestSubjectsMinimumPoints) ? String(course.clusterRequirements?.bestSubjectsMinimumPoints) : '',
                          },
                        }));
                      }
                    }}
                  >
                    <Text style={styles.editCourseToggleText}>{expandedCourseId === course.id ? 'Close course editor' : 'Edit course details'}</Text>
                  </TouchableOpacity>
                  {expandedCourseId === course.id ? <View style={styles.courseEditor}>
                    {([
                      { key: 'courseName' as const, label: 'Course name' },
                      { key: 'courseCode' as const, label: 'Course code' },
                      { key: 'status' as const, label: 'Status' },
                    ]).map(({ key, label }) => (
                      <View key={key} style={styles.editFieldRow}>
                        <View style={styles.editFieldInput}>
                          <Text style={styles.pointsRequirementLabel}>{label}</Text>
                          <PrimaryTextInput
                            value={courseFieldDrafts[course.id]?.[key] ?? ''}
                            onChangeText={(value) => setCourseFieldDrafts((current) => ({ ...current, [course.id]: { ...current[course.id], [key]: value } }))}
                            placeholder={label}
                            autoCapitalize={key === 'courseCode' ? 'characters' : 'sentences'}
                          />
                        </View>
                        <TouchableOpacity style={styles.saveFieldButton} onPress={() => void saveCourseField(course, key)} disabled={savingCourseField === `${course.id}:${key}`}>
                          <Text style={styles.saveFieldButtonText}>{savingCourseField === `${course.id}:${key}` ? 'Saving...' : 'Save'}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <View style={styles.editFieldRow}>
                      <View style={styles.editFieldInput}>
                        <Text style={styles.pointsRequirementLabel}>Seven-best minimum (0–{CBE_ATTEMPTED_POINTS_MAX})</Text>
                        <PrimaryTextInput
                          value={courseFieldDrafts[course.id]?.bestSubjectsMinimumPoints ?? ''}
                          onChangeText={(value) => setCourseFieldDrafts((current) => ({ ...current, [course.id]: { ...current[course.id], bestSubjectsMinimumPoints: value } }))}
                          placeholder="Seven-best minimum"
                          keyboardType="numeric"
                        />
                      </View>
                      <TouchableOpacity style={styles.saveFieldButton} onPress={() => void saveCourseBestSubjectsMinimum(course)} disabled={savingCourseField === `${course.id}:bestSubjectsMinimumPoints`}>
                        <Text style={styles.saveFieldButtonText}>{savingCourseField === `${course.id}:bestSubjectsMinimumPoints` ? 'Saving...' : 'Save'}</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.ruleLabel}>Cluster subject requirements</Text>
                    {course.clusterRequirements?.subjectSequence.map((requirement, index) => {
                      const subject = catalogSubjects.find((item) => item.id === requirement.subjectId);
                      const saveKey = `${course.id}:subject-${requirement.subjectId}`;
                      return (
                        <View key={requirement.subjectId} style={styles.courseRequirementRow}>
                          <Text style={styles.catalogSubject}>{subject?.name || requirement.subjectName || requirement.subjectId}</Text>
                          <Text style={styles.catalogCategory}>{subject?.code || 'Catalog subject'}</Text>
                          <View style={styles.ruleActions}>
                            <TouchableOpacity style={[styles.ruleButton, requirement.operator === 'AND' && styles.ruleButtonActive]} onPress={() => void saveCourseSubjectRequirement(course, requirement.subjectId, { operator: 'AND' })} disabled={savingCourseField === saveKey}>
                              <Text style={styles.ruleButtonText}>AND</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.ruleButton, requirement.operator === 'OR' && styles.ruleButtonAlternative]} onPress={() => void saveCourseSubjectRequirement(course, requirement.subjectId, { operator: 'OR' })} disabled={savingCourseField === saveKey}>
                              <Text style={styles.ruleButtonText}>OR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.removeSubjectButton} onPress={() => void removeCourseSubjectRequirement(course, requirement.subjectId)} disabled={savingCourseField === `${course.id}:remove-${requirement.subjectId}`}>
                              <Text style={styles.removeSubjectText}>Remove</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.pointsOptions}>
                            {SUBJECT_POINT_OPTIONS.map((points) => (
                              <TouchableOpacity key={points} style={[styles.pointsOption, requirement.minimumPoints === points && styles.pointsOptionSelected]} onPress={() => void saveCourseSubjectRequirement(course, requirement.subjectId, { minimumPoints: points })} disabled={savingCourseField === saveKey}>
                                <Text style={[styles.pointsOptionText, requirement.minimumPoints === points && styles.pointsOptionTextSelected]}>{points} {getCbeAchievementLevel(points)}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {index < (course.clusterRequirements?.subjectSequence.length || 0) - 1 ? <View style={styles.requirementDivider} /> : null}
                        </View>
                      );
                    })}

                    <Text style={styles.pointsRequirementLabel}>Add a cluster subject</Text>
                    <PrimaryTextInput value={courseSubjectSearch} onChangeText={setCourseSubjectSearch} placeholder="Search subject name or code" autoCapitalize="none" />
                    {filteredCourseSubjects.map((subject) => (
                      <TouchableOpacity key={subject.id} style={styles.searchResultRow} onPress={() => {
                        if (!hasValidCbeAchievementRanges(subject.cbeAchievementRanges)) {
                          Alert.alert('Subject CBE ranges required', `The National Officer has not saved valid CBE achievement ranges for ${subject.name}. Ask them to configure this subject's eight achievement ranges before adding it to the course.`);
                          return;
                        }
                        setPendingCourseSubjectId(subject.id);
                      }}>
                        <Text style={styles.catalogSubject}>{subject.name} ({subject.code})</Text>
                        <Text style={styles.catalogCategory}>{subject.category}</Text>
                      </TouchableOpacity>
                    ))}
                    {pendingCourseSubjectId ? <View style={styles.addSubjectBox}>
                      <Text style={styles.pointsRequirementLabel}>Choose the minimum before adding {catalogSubjects.find((item) => item.id === pendingCourseSubjectId)?.name || 'subject'}</Text>
                      <View style={styles.pointsOptions}>
                        {SUBJECT_POINT_OPTIONS.map((points) => (
                          <TouchableOpacity key={points} style={styles.pointsOption} onPress={() => void addCourseSubjectRequirement(course, pendingCourseSubjectId, points)} disabled={Boolean(savingCourseField)}>
                            <Text style={styles.pointsOptionText}>{points} {getCbeAchievementLevel(points)}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity style={styles.cancelPendingButton} onPress={() => setPendingCourseSubjectId('')}>
                        <Text style={styles.removeSubjectText}>Cancel</Text>
                      </TouchableOpacity>
                    </View> : null}
                  </View> : null}
                </View>
              ))}
            </View>
          )}
        </SectionCard>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 20,
    gap: 18,
    paddingBottom: 260,
    flexGrow: 1,
  },
  headerWrap: {
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  pageSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#374151',
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  loaderText: {
    color: '#111827',
    fontWeight: '600',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 10,
  },
  ownerBox: {
    marginTop: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  ownerTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#1d4ed8',
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  ownerValue: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 4,
  },
  ownerMeta: {
    fontSize: 13,
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  courseList: {
    marginTop: 14,
    gap: 10,
  },
  courseItem: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dfe7f1',
    borderRadius: 12,
    padding: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  courseCode: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  courseScore: {
    fontSize: 14,
    color: '#0f172a',
    marginTop: 8,
    fontWeight: '600',
  },
  editCourseToggle: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#0f766e', paddingVertical: 8, paddingHorizontal: 11, marginTop: 10, borderRadius: 6 },
  editCourseToggleText: { color: '#0f766e', fontWeight: '700', fontSize: 13 },
  courseEditor: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#cbd5e1', gap: 8 },
  editFieldRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  editFieldInput: { flex: 1 },
  saveFieldButton: { backgroundColor: '#0f766e', paddingVertical: 12, paddingHorizontal: 12, marginBottom: 12, borderRadius: 6 },
  saveFieldButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  courseRequirementRow: { borderWidth: 1, borderColor: '#dbe3ea', borderRadius: 6, padding: 10, gap: 8 },
  requirementDivider: { height: 1, backgroundColor: '#e2e8f0', marginTop: 2 },
  addSubjectBox: { borderWidth: 1, borderColor: '#99f6e4', backgroundColor: '#f0fdfa', padding: 10, gap: 8 },
  cancelPendingButton: { alignSelf: 'flex-start', padding: 6 },
  placeholder: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 14,
  },
  notice: {
    backgroundColor: '#ecfeff',
    borderColor: '#a5f3fc',
    borderWidth: 1,
    borderRadius: 10,
    color: '#0f172a',
    padding: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  ruleLabel: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
  },
  ruleHelp: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  catalogList: {
    marginTop: 10,
    gap: 8,
  },
  selectedSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedSubjectCard: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#eff6ff',
    marginTop: 8,
  },
  selectedSubjectText: {
    flex: 1,
  },
  catalogRow: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  catalogSubject: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  catalogCategory: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  ruleActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 0,
  },
  pointsRequirement: {
    marginTop: 10,
  },
  pointsRequirementLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  pointsOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pointsOption: {
    width: 58,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  pointsOptionSelected: {
    borderColor: '#1d4ed8',
    backgroundColor: '#1d4ed8',
  },
  pointsOptionText: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 11,
  },
  pointsOptionTextSelected: {
    color: '#ffffff',
  },
  ruleButton: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ruleButtonActive: {
    backgroundColor: '#dbeafe',
  },
  ruleButtonAlternative: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  ruleButtonText: {
    color: '#1e3a8a',
    fontSize: 12,
    fontWeight: '700',
  },
  removeSubjectButton: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removeSubjectText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  searchResults: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: '#ffffff',
  },
  searchResultRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 10,
  },
  noSearchResults: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 8,
  },
  ruleSummary: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
});
