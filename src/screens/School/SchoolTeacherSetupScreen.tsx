import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  createSchoolClass,
  createTeacherHandledSubject,
  createTeacherProfile,
  createTeacherSubjectAssignment,
  createUser,
} from '../../graphql/mutations';
import {
  listCoreSubjects,
  listJuniorSubjects,
  listOrgHierarchies,
  listSchoolClasses,
  listSNESubjects,
  listSubjects,
  listSupportSubjects,
  listTeacherHandledSubjects,
  listTeacherProfiles,
  listTeacherSubjectAssignments,
} from '../../graphql/queries';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import SectionCard from '../../components/shared/SectionCard';
import useScopePath from '../../hooks/useScopePath';

type TeacherItem = {
  id: string;
  fullName: string;
  schoolCode: string;
  tscNumber?: string | null;
  userId: string;
};

type SchoolOption = {
  id: string;
  code: string;
  name: string;
  nationCode?: string | null;
  regionCode?: string | null;
  countyCode?: string | null;
  subCountyCode?: string | null;
  assignedOfficerEmail?: string | null;
};

type SubjectCatalogItem = {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  learningAreaCode?: string | null;
  type: 'senior' | 'junior' | 'sne';
};

const CLASS_OPTIONS = ['7', '8', '9', '10', '11', '12'];

export default function SchoolTeacherSetupScreen() {
  return <SchoolTeacherSetupContent />;
}

export function SchoolTeacherSetupContent() {
  const client = useMemo(() => generateClient(), []);
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [selectedSchoolCode, setSelectedSchoolCode] = useState('');
  const [nationCode, setNationCode] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [countyCode, setCountyCode] = useState('');
  const [subCountyCode, setSubCountyCode] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [teacherFullName, setTeacherFullName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [tscNumber, setTscNumber] = useState('');
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [modalType, setModalType] = useState<'subject' | 'class' | null>(null);
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [catalogType, setCatalogType] = useState<'senior' | 'junior' | 'sne'>('senior');
  const [catalogItems, setCatalogItems] = useState<SubjectCatalogItem[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [detailType, setDetailType] = useState<'subjects' | 'classes' | null>(null);
  const [detailTeacher, setDetailTeacher] = useState<TeacherItem | null>(null);
  const [linkedSubjects, setLinkedSubjects] = useState<Array<{ id: string; subjectName: string; subjectCode?: string | null }>>([]);
  const [linkedClasses, setLinkedClasses] = useState<Array<{ id: string; className?: string | null; classCode?: string | null }>>([]);
  const [classMembers, setClassMembers] = useState<Array<{ id: string; fullName?: string | null; assessmentNumber?: string | null }>>([]);
  const [selectedClassForMembers, setSelectedClassForMembers] = useState<{ id: string; className?: string | null; classCode?: string | null } | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  const scopePath = useScopePath({ nationCode, regionCode, countyCode, subCountyCode, schoolCode });

  useEffect(() => {
    void loadLinkedSchools();
  }, []);

  const loadLinkedSchools = async () => {
    try {
      setIsLoading(true);
      setNotice('');

      const session = await fetchAuthSession();
      const currentEmail = (session.tokens?.idToken?.payload as { email?: string } | undefined)?.email?.trim().toLowerCase();

      if (!currentEmail) {
        setSchoolOptions([]);
        setSelectedSchoolCode('');
        setNationCode('');
        setRegionCode('');
        setCountyCode('');
        setSubCountyCode('');
        setSchoolCode('');
        setNotice('No signed-in user email was found.');
        return;
      }

      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: {
            and: [{ entityType: { eq: 'school' } }, { assignedOfficerEmail: { eq: currentEmail } }],
          },
          limit: 50,
        },
      });

      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const items = payload.data?.listOrgHierarchies?.items || [];
      const mappedSchools = items
        .filter((item: any) => Boolean(item?.id && item?.code && item?.name))
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          nationCode: item.nationCode,
          regionCode: item.regionCode,
          countyCode: item.countyCode,
          subCountyCode: item.subCountyCode,
          assignedOfficerEmail: item.assignedOfficerEmail,
        }));

      setSchoolOptions(mappedSchools);

      const defaultSchool = mappedSchools[0];
      if (defaultSchool) {
        setSelectedSchoolCode(defaultSchool.code);
        setNationCode(defaultSchool.nationCode || '');
        setRegionCode(defaultSchool.regionCode || '');
        setCountyCode(defaultSchool.countyCode || '');
        setSubCountyCode(defaultSchool.subCountyCode || '');
        setSchoolCode(defaultSchool.code);
      } else {
        setSelectedSchoolCode('');
        setNationCode('');
        setRegionCode('');
        setCountyCode('');
        setSubCountyCode('');
        setSchoolCode('');
        setNotice('No schools are linked to your account yet.');
      }

      await loadTeachers();
    } catch {
      setSchoolOptions([]);
      setSelectedSchoolCode('');
      setNationCode('');
      setRegionCode('');
      setCountyCode('');
      setSubCountyCode('');
      setSchoolCode('');
      setNotice('Could not load your linked schools.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolSelection = (schoolCodeValue: string) => {
    const school = schoolOptions.find((item) => item.code === schoolCodeValue);
    if (!school) {
      return;
    }

    setSelectedSchoolCode(school.code);
    setNationCode(school.nationCode || '');
    setRegionCode(school.regionCode || '');
    setCountyCode(school.countyCode || '');
    setSubCountyCode(school.subCountyCode || '');
    setSchoolCode(school.code);
  };

  const loadTeachers = async () => {
    try {
      const result = await client.graphql({
        query: listTeacherProfiles,
        variables: { limit: 100 },
      });

      const payload = result as { data?: { listTeacherProfiles?: { items?: Array<any> } } };
      const items = payload.data?.listTeacherProfiles?.items || [];
      const mapped = items
        .filter((item: any): item is TeacherItem => Boolean(item?.id && item?.fullName && item?.schoolCode && item?.userId))
        .map((item: any) => ({
          id: item.id,
          fullName: item.fullName,
          schoolCode: item.schoolCode,
          tscNumber: item.tscNumber,
          userId: item.userId,
        }));

      setTeachers(mapped);
    } catch {
      setNotice('Could not load teacher profiles right now.');
    }
  };

  const handleCreateTeacher = async () => {
    if (
      !scopePath.nationCode ||
      !scopePath.regionCode ||
      !scopePath.countyCode ||
      !scopePath.subCountyCode ||
      !scopePath.schoolCode ||
      !teacherFullName.trim() ||
      !teacherEmail.trim()
    ) {
      setNotice('Please fill the full school hierarchy and teacher identity details.');
      return;
    }

    try {
      setIsLoading(true);
      setNotice('');

      const userResponse = await client.graphql({
        query: createUser,
        variables: {
          input: {
            email: teacherEmail.trim().toLowerCase(),
            phoneNumber: teacherPhone.trim() || null,
            role: 'teacher',
            status: 'active',
            fullName: teacherFullName.trim(),
          },
        },
      });

      const userPayload = userResponse as { data?: { createUser?: { id?: string } } };
      const createdUserId = userPayload.data?.createUser?.id;
      if (!createdUserId) {
        throw new Error('Teacher user record was not created.');
      }

      await client.graphql({
        query: createTeacherProfile,
        variables: {
          input: {
            userId: createdUserId,
            fullName: teacherFullName.trim(),
            nationCode: scopePath.nationCode,
            regionCode: scopePath.regionCode,
            countyCode: scopePath.countyCode,
            subCountyCode: scopePath.subCountyCode,
            schoolCode: scopePath.schoolCode,
            tscNumber: tscNumber.trim() || null,
          },
        },
      });

      setNotice('Teacher profile created successfully. Next, create the teacher subject and class assignments separately.');
      setTeacherFullName('');
      setTeacherEmail('');
      setTeacherPhone('');
      setTscNumber('');
      await loadTeachers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create teacher profile.';
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalogItems = async (category: 'senior' | 'junior' | 'sne') => {
    setIsCatalogLoading(true);
    try {
      if (category === 'senior') {
        const [subjectResult, coreResult, supportResult] = await Promise.all([
          client.graphql({ query: listSubjects, variables: { limit: 200 } }),
          client.graphql({ query: listCoreSubjects, variables: { limit: 200 } }),
          client.graphql({ query: listSupportSubjects, variables: { limit: 200 } }),
        ]);
        const subjectPayload = subjectResult as { data?: { listSubjects?: { items?: Array<any> } } };
        const corePayload = coreResult as { data?: { listCoreSubjects?: { items?: Array<any> } } };
        const supportPayload = supportResult as { data?: { listSupportSubjects?: { items?: Array<any> } } };

        const merged = [
          ...(subjectPayload.data?.listSubjects?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            category: item.category,
            type: 'senior' as const,
          })),
          ...(corePayload.data?.listCoreSubjects?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            category: item.category || 'Core',
            type: 'senior' as const,
          })),
          ...(supportPayload.data?.listSupportSubjects?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            category: item.category || 'Support',
            type: 'senior' as const,
          })),
        ];
        setCatalogItems(merged);
        return merged;
      }

      if (category === 'junior') {
        const result = await client.graphql({ query: listJuniorSubjects, variables: { limit: 200 } });
        const payload = result as { data?: { listJuniorSubjects?: { items?: Array<any> } } };
        const merged = (payload.data?.listJuniorSubjects?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          category: item.learningAreaCode,
          learningAreaCode: item.learningAreaCode,
          type: 'junior' as const,
        }));
        setCatalogItems(merged);
        return merged;
      }

      const result = await client.graphql({ query: listSNESubjects, variables: { limit: 200 } });
      const payload = result as { data?: { listSNESubjects?: { items?: Array<any> } } };
      const merged = (payload.data?.listSNESubjects?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.learningAreaCode,
        learningAreaCode: item.learningAreaCode,
        type: 'sne' as const,
      }));
      setCatalogItems(merged);
      return merged;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load subject catalog.';
      setNotice(message);
      setCatalogItems([]);
      return [];
    } finally {
      setIsCatalogLoading(false);
    }
  };

  const openSubjectModal = async (teacherId: string) => {
    setActiveTeacherId(teacherId);
    setModalType('subject');
    setCatalogType('senior');
    await fetchCatalogItems('senior');
  };

  const openClassModal = (teacherId: string) => {
    setActiveTeacherId(teacherId);
    setModalType('class');
    setNotice('');
  };

  const handleSubjectLink = async (subject: SubjectCatalogItem) => {
    if (!activeTeacherId) {
      setNotice('Please select a teacher first.');
      return;
    }

    const teacher = teachers.find((item) => item.id === activeTeacherId);
    if (!teacher) {
      setNotice('Teacher record could not be found.');
      return;
    }

    try {
      setIsLoading(true);
      setNotice('');
      await client.graphql({
        query: createTeacherHandledSubject,
        variables: {
          input: {
            teacherId: activeTeacherId,
            schoolCode: teacher.schoolCode,
            subjectId: subject.id,
            subjectCode: subject.code,
            subjectName: subject.name,
            academicYear: '2026',
            status: 'active',
          },
        },
      });
      setModalType(null);
      setActiveTeacherId(null);
      setNotice(`Subject ${subject.name} linked to ${teacher.fullName}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not link subject.';
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassLink = async (classCode: string) => {
    if (!activeTeacherId) {
      setNotice('Please select a teacher first.');
      return;
    }

    const teacher = teachers.find((item) => item.id === activeTeacherId);
    if (!teacher) {
      setNotice('Teacher record could not be found.');
      return;
    }

    try {
      setIsLoading(true);
      setNotice('');

      const classInput = {
        nationCode: scopePath.nationCode,
        regionCode: scopePath.regionCode,
        countyCode: scopePath.countyCode,
        subCountyCode: scopePath.subCountyCode,
        schoolCode: teacher.schoolCode,
        classCode,
        className: `Grade ${classCode}`,
        gradeLevel: classCode,
        academicYear: '2026',
        teacherIds: [activeTeacherId],
        status: 'active',
      };

      await client.graphql({
        query: createSchoolClass,
        variables: {
          input: classInput,
        },
      });

      await client.graphql({
        query: createTeacherSubjectAssignment,
        variables: {
          input: {
            teacherId: activeTeacherId,
            schoolCode: teacher.schoolCode,
            classCode,
            className: `Grade ${classCode}`,
            academicYear: '2026',
            status: 'active',
          },
        },
      });

      setModalType(null);
      setActiveTeacherId(null);
      setNotice(`Class Grade ${classCode} was created and linked to ${teacher.fullName}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not link class.';
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeacherDetails = async (teacher: TeacherItem) => {
    setIsDetailLoading(true);
    setLinkedSubjects([]);
    setLinkedClasses([]);
    try {
      const [subjectsResult, classesResult] = await Promise.all([
        client.graphql({
          query: listTeacherHandledSubjects,
          variables: {
            filter: {
              teacherId: { eq: teacher.id },
            },
            limit: 100,
          },
        }),
        client.graphql({
          query: listSchoolClasses,
          variables: {
            filter: {
              and: [
                { schoolCode: { eq: teacher.schoolCode } },
                { teacherIds: { contains: teacher.id } },
              ],
            },
            limit: 100,
          },
        }),
      ]);

      const subjectPayload = subjectsResult as { data?: { listTeacherHandledSubjects?: { items?: Array<any> } } };
      const classPayload = classesResult as { data?: { listSchoolClasses?: { items?: Array<any> } } };

      const subjects = (subjectPayload.data?.listTeacherHandledSubjects?.items || []).map((item: any) => ({
        id: item.id,
        subjectName: item.subjectName || 'Unnamed subject',
        subjectCode: item.subjectCode,
      }));

      const classes = (classPayload.data?.listSchoolClasses?.items || []).map((item: any) => ({
        id: item.id,
        className: item.className || item.classCode || 'Unnamed class',
        classCode: item.classCode,
      }));

      setLinkedSubjects(subjects);
      setLinkedClasses(classes);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load teacher details.';
      setNotice(message);
      setLinkedSubjects([]);
      setLinkedClasses([]);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const openClassMembers = async (classItem: { id: string; className?: string | null; classCode?: string | null }) => {
    setSelectedClassForMembers(classItem);
    setIsMembersLoading(true);
    setClassMembers([]);

    try {
      const result = await client.graphql({
        query: listTeacherProfiles,
        variables: { limit: 200 },
      });

      const payload = result as { data?: { listTeacherProfiles?: { items?: Array<any> } } };
      const teacherNames = new Map<string, string>();
      (payload.data?.listTeacherProfiles?.items || []).forEach((teacherItem: any) => {
        if (teacherItem?.id) {
          teacherNames.set(teacherItem.id, teacherItem.fullName || 'Teacher');
        }
      });

      const members = [
        {
          id: classItem.id,
          fullName: teacherNames.get(classItem.id) || 'No members assigned yet',
          assessmentNumber: classItem.classCode || 'Class-only record',
        },
      ];

      setClassMembers(members);
    } catch {
      setClassMembers([]);
    } finally {
      setIsMembersLoading(false);
    }
  };

  const openSubjectDetail = async (teacher: TeacherItem) => {
    setDetailTeacher(teacher);
    setDetailType('subjects');
    await loadTeacherDetails(teacher);
  };

  const openClassDetail = async (teacher: TeacherItem) => {
    setDetailTeacher(teacher);
    setDetailType('classes');
    await loadTeacherDetails(teacher);
  };

  return (
    <>
      <SectionCard
        title="School Administration"
        subtitle="Register a teacher under this school and assign the teacher profile."
      >
        <Text style={styles.sectionLabel}>Linked schools</Text>
        {schoolOptions.length === 0 ? (
          <Text style={styles.placeholder}>No linked schools found for your account.</Text>
        ) : null}

        {schoolOptions.map((school) => (
          <TouchableOpacity
            key={school.id}
            style={[styles.schoolOption, selectedSchoolCode === school.code && styles.schoolOptionSelected]}
            onPress={() => handleSchoolSelection(school.code)}
          >
            <Text style={[styles.schoolOptionText, selectedSchoolCode === school.code && styles.schoolOptionTextSelected]}>
              {school.name}
            </Text>
            <Text style={styles.schoolOptionMeta}>{school.code}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.selectedSchoolBox}>
          <Text style={styles.selectedSchoolLabel}>Selected school</Text>
          <Text style={styles.selectedSchoolValue}>{schoolCode || 'No school selected'}</Text>
          <Text style={styles.selectedSchoolMeta}>Nation: {nationCode || 'Not set'} • Region: {regionCode || 'Not set'} • County: {countyCode || 'Not set'} • Sub-county: {subCountyCode || 'Not set'}</Text>
        </View>
        <PrimaryTextInput
          value={teacherFullName}
          onChangeText={setTeacherFullName}
          placeholder="Teacher full name"
        />
        <PrimaryTextInput
          value={teacherEmail}
          onChangeText={setTeacherEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Teacher email"
        />
        <PrimaryTextInput
          value={teacherPhone}
          onChangeText={setTeacherPhone}
          keyboardType="phone-pad"
          placeholder="Teacher phone (optional)"
        />
        <PrimaryTextInput
          value={tscNumber}
          onChangeText={setTscNumber}
          placeholder="Teacher TSC number (optional)"
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateTeacher} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Create Teacher Profile'}</Text>
        </TouchableOpacity>

        {notice ? <Text style={styles.message}>{notice}</Text> : null}
      </SectionCard>

      <SectionCard title="Existing Teachers in School">
        {teachers.length === 0 ? <Text style={styles.placeholder}>No teacher profiles found yet for this school.</Text> : null}
        {teachers.map((teacher) => (
          <View key={teacher.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowName}>{teacher.fullName}</Text>
              <View style={styles.eyeRow}>
                <TouchableOpacity
                  style={styles.eyeButton}
                  accessibilityLabel={`View subjects for ${teacher.fullName}`}
                  onPress={() => void openSubjectDetail(teacher)}
                >
                  <Ionicons name="eye-outline" size={18} color="#1d4ed8" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.eyeButton}
                  accessibilityLabel={`View classes for ${teacher.fullName}`}
                  onPress={() => void openClassDetail(teacher)}
                >
                  <Ionicons name="eye" size={18} color="#0f766e" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.rowMeta}>{teacher.schoolCode}</Text>
            <Text style={styles.rowMeta}>{teacher.tscNumber || 'No TSC number'}</Text>

            <View style={styles.rowActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => void openSubjectModal(teacher.id)}
              >
                <Text style={styles.actionButtonText}>Link subject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => openClassModal(teacher.id)}
              >
                <Text style={styles.actionButtonText}>Link class</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </SectionCard>

      <Modal
        visible={detailType !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setDetailType(null);
          setDetailTeacher(null);
          setLinkedSubjects([]);
          setLinkedClasses([]);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{detailTeacher?.fullName || 'Teacher details'}</Text>

            {detailType === 'subjects' ? (
              <>
                <Text style={styles.detailHeader}>Linked subjects</Text>
                {isDetailLoading ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#1d4ed8" />
                    <Text style={styles.loadingText}>Loading teacher subjects...</Text>
                  </View>
                ) : linkedSubjects.length === 0 ? (
                  <Text style={styles.placeholder}>No linked subjects yet for this teacher.</Text>
                ) : (
                  linkedSubjects.map((subject) => (
                    <View key={subject.id} style={styles.detailItem}>
                      <Text style={styles.detailItemTitle}>{subject.subjectName}</Text>
                      {subject.subjectCode ? <Text style={styles.detailItemMeta}>{subject.subjectCode}</Text> : null}
                    </View>
                  ))
                )}
              </>
            ) : (
              <>
                <Text style={styles.detailHeader}>Linked classes</Text>
                {isDetailLoading ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#0f766e" />
                    <Text style={styles.loadingText}>Loading teacher classes...</Text>
                  </View>
                ) : linkedClasses.length === 0 ? (
                  <Text style={styles.placeholder}>No linked classes yet for this teacher.</Text>
                ) : (
                  linkedClasses.map((item) => (
                    <View key={item.id} style={styles.classDetailRow}>
                      <TouchableOpacity
                        style={styles.classDetailButton}
                        onPress={() => void openClassMembers(item)}
                      >
                        <Text style={styles.detailItemTitle}>{item.className || 'Class'}</Text>
                        {item.classCode ? <Text style={styles.detailItemMeta}>{item.classCode}</Text> : null}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.memberEyeButton}
                        accessibilityLabel={`View members for ${item.className || item.classCode || 'class'}`}
                        onPress={() => void openClassMembers(item)}
                      >
                        <Ionicons name="eye" size={18} color="#0f766e" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setDetailType(null);
                setDetailTeacher(null);
                setLinkedSubjects([]);
                setLinkedClasses([]);
                setSelectedClassForMembers(null);
                setClassMembers([]);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedClassForMembers !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setSelectedClassForMembers(null);
          setClassMembers([]);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedClassForMembers?.className || selectedClassForMembers?.classCode || 'Class members'}</Text>

            {isMembersLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#0f766e" />
                <Text style={styles.loadingText}>Loading class members...</Text>
              </View>
            ) : classMembers.length === 0 ? (
              <Text style={styles.placeholder}>No class members have been added yet.</Text>
            ) : (
              classMembers.map((member) => (
                <View key={member.id} style={styles.detailItem}>
                  <Text style={styles.detailItemTitle}>{member.fullName || 'Unnamed learner'}</Text>
                  {member.assessmentNumber ? <Text style={styles.detailItemMeta}>{member.assessmentNumber}</Text> : null}
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedClassForMembers(null);
                setClassMembers([]);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalType !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalType(null);
          setActiveTeacherId(null);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {modalType === 'subject' ? (
              <>
                <Text style={styles.modalTitle}>Link Subject</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                  {[
                    { key: 'senior', label: 'Senior Secondary' },
                    { key: 'junior', label: 'Junior Secondary' },
                    { key: 'sne', label: 'Vocational SNE' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.categoryButton, catalogType === option.key ? styles.categoryButtonActive : null]}
                      onPress={async () => {
                        setCatalogType(option.key as 'senior' | 'junior' | 'sne');
                        await fetchCatalogItems(option.key as 'senior' | 'junior' | 'sne');
                      }}
                    >
                      <Text style={[styles.categoryButtonText, catalogType === option.key ? styles.categoryButtonTextActive : null]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <ScrollView style={styles.subjectList}>
                  {isCatalogLoading ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="small" color="#1d4ed8" />
                      <Text style={styles.loadingText}>Loading subjects...</Text>
                    </View>
                  ) : catalogItems.length === 0 ? (
                    <Text style={styles.placeholder}>No subjects available for this category yet.</Text>
                  ) : (
                    catalogItems.map((subject) => (
                      <TouchableOpacity
                        key={`${subject.type}-${subject.id}`}
                        style={styles.subjectItem}
                        onPress={() => void handleSubjectLink(subject)}
                      >
                        <Text style={styles.subjectItemCode}>{subject.code}</Text>
                        <Text style={styles.subjectItemName}>{subject.name}</Text>
                        {subject.category ? <Text style={styles.subjectItemMeta}>{subject.category}</Text> : null}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Link Class</Text>
                <View style={styles.classGrid}>
                  {CLASS_OPTIONS.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      style={styles.classOptionButton}
                      onPress={() => void handleClassLink(grade)}
                    >
                      <Text style={styles.classOptionText}>Grade {grade}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalType(null);
                setActiveTeacherId(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    marginTop: 12,
    color: '#374151',
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  schoolOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    marginBottom: 10,
  },
  schoolOptionSelected: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  schoolOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  schoolOptionTextSelected: {
    color: '#1d4ed8',
  },
  schoolOptionMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  selectedSchoolBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 12,
    marginBottom: 12,
  },
  selectedSchoolLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedSchoolValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  selectedSchoolMeta: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
  },
  placeholder: {
    color: '#6b7280',
    fontSize: 14,
  },
  row: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: '#f9fafb',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  eyeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMeta: {
    fontSize: 12,
    color: '#4b5563',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#0f766e',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  categoryRow: {
    paddingBottom: 8,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#1d4ed8',
  },
  categoryButtonText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 12,
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  subjectList: {
    maxHeight: 360,
    marginTop: 10,
  },
  subjectItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  subjectItemCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
    textTransform: 'uppercase',
  },
  subjectItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 3,
  },
  subjectItemMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  classOptionButton: {
    width: '30%',
    minWidth: 90,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  classOptionText: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  loadingText: {
    color: '#4b5563',
    fontSize: 13,
    fontWeight: '600',
  },
  detailHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  classDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  classDetailButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
  },
  memberEyeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailItem: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  detailItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  detailItemMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
