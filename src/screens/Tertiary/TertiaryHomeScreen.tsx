import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import SectionCard from '../../components/shared/SectionCard';
import { createTertiaryCourse, createTertiaryInstitutionProfile } from '../../graphql/mutations';
import { listTertiaryCourses, listTertiaryInstitutionProfiles, listUsers } from '../../graphql/queries';
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
  minimumClusterScore?: number | null;
  status?: string | null;
};

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
  const [minimumClusterScore, setMinimumClusterScore] = useState('');
  const [institutionRecord, setInstitutionRecord] = useState<TertiaryInstitution | null>(null);
  const [courses, setCourses] = useState<TertiaryCourse[]>([]);

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
        minimumClusterScore: typeof course.minimumClusterScore === 'number' ? course.minimumClusterScore : Number(course.minimumClusterScore) || null,
        status: course.status,
      }));

      setCourses(institutionCourses);
    } catch (error) {
      console.error('Tertiary debug: failed to refresh institution courses', error);
      setCourses([]);
    }
  };

  const loadTertiaryContext = async () => {
    try {
      setLoading(true);
      setNotice('');

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

    if (!courseCode.trim() || !courseName.trim()) {
      Alert.alert('Course details required', 'Please provide the course code and course name.');
      return;
    }

    const numericCluster = Number(minimumClusterScore);
    if (!Number.isFinite(numericCluster) || numericCluster < 0) {
      Alert.alert('Cluster score required', 'Please enter a valid minimum cluster score for this course.');
      return;
    }

    try {
      setSavingCourse(true);
      setNotice('');

      const payload = {
        input: {
          institutionId: institutionRecord.id,
          courseCode: courseCode.trim(),
          courseName: courseName.trim(),
          pathwayId: null,
          minimumClusterScore: numericCluster,
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
      setMinimumClusterScore('');

      if (createdCourse) {
        setCourses((current) => [
          {
            id: createdCourse.id,
            institutionId: createdCourse.institutionId,
            courseCode: createdCourse.courseCode,
            courseName: createdCourse.courseName,
            minimumClusterScore: createdCourse.minimumClusterScore ?? null,
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
        minimumClusterScore: Number(minimumClusterScore),
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

        <SectionCard title="Programme / course requirements" subtitle="Once the institution has been registered, the admin can add the courses it offers and their minimum cluster requirements.">
          <PrimaryTextInput value={courseCode} onChangeText={setCourseCode} placeholder="Course code" autoCapitalize="characters" />
          <PrimaryTextInput value={courseName} onChangeText={setCourseName} placeholder="Course name" />
          <PrimaryTextInput value={minimumClusterScore} onChangeText={setMinimumClusterScore} placeholder="Minimum cluster score (e.g. 46.5)" keyboardType="decimal-pad" />

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
                  <Text style={styles.courseScore}>Minimum cluster score: {course.minimumClusterScore ?? 'Not set'}</Text>
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
});
