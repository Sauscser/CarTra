import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { getUrl } from 'aws-amplify/storage';
import SectionCard from '../../components/shared/SectionCard';
import ViewPerformance from '../../components/teacher/ViewPerformance';
import LearnerComments from '../../components/shared/LearnerComments';
import LearnerPerformanceGraphs from '../../components/shared/LearnerPerformanceGraphs';
import { getLearnerProfile, listGrade12ResultSummaries, listLearnerDocumentResources, listLearnerProfiles, listOrgHierarchies, listTertiaryCourses, listTertiaryInstitutionProfiles, listUsers } from '../../graphql/queries';
import calculateHistoricalClusterSeries, { calculateDeviationPercentage } from '../../utils/cluster';
import { NationalOfficerSetupContent } from './NationalOfficerSetupScreen';
import { NationalCatalogContent, NationalRegionsContent } from './NationalHomeScreen';

type NationalScreenKey = 'home' | 'setup' | 'regions' | 'catalog' | 'performance';

type NationalEntity = {
  id: string;
  code: string;
  name: string;
  assignedOfficerEmail?: string | null;
};

type NationalRegionEntity = { id: string; code: string; name: string };
type NationalCountyEntity = { id: string; code: string; name: string };
type NationalSubCountyEntity = { id: string; code: string; name: string };
type NationalSchoolEntity = { id: string; code: string; name: string };

const NATIONAL_ACTIONS: Array<{ key: Exclude<NationalScreenKey, 'home'>; title: string; description: string }> = [
  {
    key: 'setup',
    title: 'Create National Office',
    description: 'Create the national office record and national officer profile.',
  },
  {
    key: 'regions',
    title: 'Manage Regions',
    description: 'Create and review regions under the nation.',
  },
  {
    key: 'catalog',
    title: 'Master Catalog',
    description: 'Add subjects, tracks, pathways, competencies, and core values.',
  },
  {
    key: 'performance',
    title: 'Performance Summary',
    description: 'National Grade 12 outcome trends, tertiary coverage, and career targets.',
  },
];

function NationalPerformanceSummaryContent({
  nationalCareerSummary,
  tertiaryInstitutions,
  tertiaryCourses,
}: {
  nationalCareerSummary: {
    totalSummaries: number;
    metTarget: number;
    belowTarget: number;
    eligible: number;
    pending: number;
    institutionCount: number;
    courseCount: number;
    topCareers: Array<{ name: string; value: number }>;
  };
  tertiaryInstitutions: Array<{ id: string; institutionName: string; nationCode?: string | null; regionCode?: string | null; countyCode?: string | null; userId?: string | null; adminEmail?: string | null }>;
  tertiaryCourses: Array<{ id: string; institutionId?: string | null; institutionName?: string | null; courseCode?: string | null; courseName: string; minimumClusterScore?: number | null; status?: string | null }>;
}) {
  const [expandedInstitutionIds, setExpandedInstitutionIds] = useState<Record<string, boolean>>({});
  const [showInstitutionList, setShowInstitutionList] = useState(true);

  const toggleInstitution = (institutionId: string) => {
    setExpandedInstitutionIds((current) => ({
      ...current,
      [institutionId]: !current[institutionId],
    }));
  };

  const toggleInstitutionPanel = () => setShowInstitutionList((current) => !current);

  return (
    <SectionCard title="Performance Summary" subtitle="Final Grade 12 outcomes captured across this national office." defaultExpanded={false}>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryTile}><Text style={styles.summaryLabel}>Total summaries</Text><Text style={styles.summaryValue}>{nationalCareerSummary.totalSummaries}</Text></View>
        <View style={styles.summaryTile}><Text style={styles.summaryLabel}>Met target</Text><Text style={styles.summaryValue}>{nationalCareerSummary.metTarget}</Text></View>
        <View style={styles.summaryTile}><Text style={styles.summaryLabel}>Below target</Text><Text style={styles.summaryValue}>{nationalCareerSummary.belowTarget}</Text></View>
        <View style={styles.summaryTile}><Text style={styles.summaryLabel}>Eligible</Text><Text style={styles.summaryValue}>{nationalCareerSummary.eligible}</Text></View>
        <View style={styles.summaryTile}><Text style={styles.summaryLabel}>Pending</Text><Text style={styles.summaryValue}>{nationalCareerSummary.pending}</Text></View>
        <View style={styles.summaryTile}><Text style={styles.summaryLabel}>Institutions</Text><Text style={styles.summaryValue}>{tertiaryInstitutions.length || nationalCareerSummary.institutionCount}</Text></View>
        <View style={styles.summaryTile}><Text style={styles.summaryLabel}>Courses</Text><Text style={styles.summaryValue}>{tertiaryCourses.length || nationalCareerSummary.courseCount}</Text></View>
      </View>

      <View style={styles.catalogSection}>
        <TouchableOpacity onPress={toggleInstitutionPanel} activeOpacity={0.8} style={styles.sectionHeaderButton}>
          <Text style={styles.selectionTitle}>Institutions in this nation</Text>
          <Text style={styles.expandToggleText}>{showInstitutionList ? '−' : '+'}</Text>
        </TouchableOpacity>

        {showInstitutionList ? (
          tertiaryInstitutions.length ? (
            tertiaryInstitutions.map((institution) => {
              const institutionCourses = tertiaryCourses.filter((course) => String(course.institutionId || '') === String(institution.id || ''));
              const isExpanded = !!expandedInstitutionIds[institution.id];

              return (
                <View key={institution.id} style={styles.catalogRow}>
                  <TouchableOpacity style={styles.institutionToggleRow} onPress={() => toggleInstitution(institution.id)} activeOpacity={0.8}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catalogTitle}>{institution.institutionName}</Text>
                      <Text style={styles.catalogMeta}>Admin email: {institution.adminEmail || 'Unknown email'}</Text>
                      <Text style={styles.catalogMeta}>Region: {institution.regionCode || 'N/A'} • County: {institution.countyCode || 'N/A'}</Text>
                    </View>
                    <Text style={styles.expandToggleText}>{isExpanded ? '−' : '+'}</Text>
                  </TouchableOpacity>

                  {isExpanded ? (
                    <View style={styles.courseListContainer}>
                      {institutionCourses.length ? (
                        institutionCourses.map((course) => (
                          <View key={course.id} style={styles.courseRow}>
                            <Text style={styles.catalogTitle}>{course.courseName}</Text>
                            <Text style={styles.catalogMeta}>Code: {course.courseCode || 'N/A'} • Minimum cluster: {course.minimumClusterScore ?? 'Not set'}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.empty}>No courses have been added for this institution yet.</Text>
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })
          ) : (
            <Text style={styles.empty}>No tertiary institutions have been created for this nation yet.</Text>
          )
        ) : null}
      </View>

      {nationalCareerSummary.topCareers.length ? (
        <View style={styles.careerList}>
          <Text style={styles.selectionTitle}>Top career targets</Text>
          {nationalCareerSummary.topCareers.map((item) => (
            <View key={item.name} style={styles.careerRow}>
              <Text style={styles.careerName}>{item.name}</Text>
              <Text style={styles.careerCount}>{item.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No final Grade 12 career results have been captured for this nation yet.</Text>
      )}
    </SectionCard>
  );
}

export default function NationalOfficeScreen() {
  const [activeScreen, setActiveScreen] = useState<NationalScreenKey>('home');
  const client = useMemo(() => generateClient(), []);
  const [nation, setNation] = useState<NationalEntity | null>(null);
  const [nationalRegions, setNationalRegions] = useState<NationalRegionEntity[]>([]);
  const [nationalCounties, setNationalCounties] = useState<NationalCountyEntity[]>([]);
  const [nationalSubCounties, setNationalSubCounties] = useState<NationalSubCountyEntity[]>([]);
  const [nationalSchools, setNationalSchools] = useState<NationalSchoolEntity[]>([]);
  const [nationalLearners, setNationalLearners] = useState<Array<{ id: string; fullName: string; gradeLevel?: string | null; classCode?: string | null; assessmentNumber?: string | null; regionCode?: string | null; countyCode?: string | null; subCountyCode?: string | null; schoolCode?: string | null }>>([]);
  const [nationalCareerSummary, setNationalCareerSummary] = useState({
    totalSummaries: 0,
    metTarget: 0,
    belowTarget: 0,
    eligible: 0,
    pending: 0,
    institutionCount: 0,
    courseCount: 0,
    topCareers: Array<{ name: string; value: number }>(),
  });
  const [tertiaryInstitutions, setTertiaryInstitutions] = useState<Array<{ id: string; institutionName: string; nationCode?: string | null; regionCode?: string | null; countyCode?: string | null; userId?: string | null; adminEmail?: string | null }>>([]);
  const [tertiaryCourses, setTertiaryCourses] = useState<Array<{ id: string; institutionId?: string | null; institutionName?: string | null; courseCode?: string | null; courseName: string; minimumClusterScore?: number | null; status?: string | null }>>([]);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);
  const [selectedCountyCode, setSelectedCountyCode] = useState<string | null>(null);
  const [selectedSubCountyCode, setSelectedSubCountyCode] = useState<string | null>(null);
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string | null>(null);
  const [selectedLearnerGrade, setSelectedLearnerGrade] = useState<string | null>(null);
  const [learnerCareerMap, setLearnerCareerMap] = useState<Record<string, string | null>>({});
  const [selectedLearner, setSelectedLearner] = useState<any | null>(null);
  const [selectedLearnerProfile, setSelectedLearnerProfile] = useState<any | null>(null);
  const [performanceAction, setPerformanceAction] = useState<'viewMenu' | 'viewCluster' | 'viewSubjects' | 'viewGuidance' | 'viewEPortfolio' | null>(null);
  const [learnerDocuments, setLearnerDocuments] = useState<any[]>([]);
  const [performanceSessionId, setPerformanceSessionId] = useState(0);
  const profileRequestRef = useRef(0);

  const resetPerformanceModal = () => {
    profileRequestRef.current += 1;
    setPerformanceSessionId((current) => current + 1);
    setPerformanceAction(null);
    setSelectedLearner(null);
    setSelectedLearnerProfile(null);
    setLearnerDocuments([]);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void loadCurrentNationalOffice();
  }, [client]);

  useEffect(() => {
    if (nation?.code) {
      void loadNationalLearners();
      void loadNationalCareerSummary();
      void loadTertiaryCatalog();
    }
  }, [nation?.code]);

  useEffect(() => {
    if (selectedRegionCode) void loadNationalCounties(selectedRegionCode);
    else setNationalCounties([]);
    setSelectedCountyCode(null);
    setSelectedSubCountyCode(null);
    setSelectedSchoolCode(null);
    setSelectedLearnerGrade(null);
  }, [selectedRegionCode]);

  useEffect(() => {
    if (selectedCountyCode) void loadNationalSubCounties(selectedCountyCode);
    else setNationalSubCounties([]);
    setSelectedSubCountyCode(null);
    setSelectedSchoolCode(null);
    setSelectedLearnerGrade(null);
  }, [selectedCountyCode]);

  useEffect(() => {
    if (selectedSubCountyCode) void loadNationalSchools(selectedSubCountyCode);
    else setNationalSchools([]);
    setSelectedSchoolCode(null);
    setSelectedLearnerGrade(null);
  }, [selectedSubCountyCode]);

  const loadCurrentNationalOffice = async () => {
    try {
      setIsLoading(true);
      setNotice('');

      const session = await fetchAuthSession();
      const currentEmail = (session.tokens?.idToken?.payload as { email?: string } | undefined)?.email?.trim().toLowerCase();

      if (!currentEmail) {
        setNation(null);
        setNotice('No signed-in user email was found.');
        return;
      }

      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: {
            and: [{ entityType: { eq: 'nation' } }, { assignedOfficerEmail: { eq: currentEmail } }],
          },
          limit: 20,
        },
      });

      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const matchedNation = payload.data?.listOrgHierarchies?.items?.[0];

      if (!matchedNation) {
        setNation(null);
        setNotice(`No national office is assigned to ${currentEmail}.`);
        return;
      }

      setNation({
        id: matchedNation.id,
        code: matchedNation.code,
        name: matchedNation.name,
        assignedOfficerEmail: matchedNation.assignedOfficerEmail,
      });
    } catch {
      setNation(null);
      setNotice('Could not load the national account details for this user.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedLearnerCareer = async (learnerId: string) => {
    try {
      const result = await client.graphql({
        query: listLearnerProfiles,
        variables: { filter: { id: { eq: learnerId } }, limit: 20 },
      } as any);

      const payload = result as { data?: { listLearnerProfiles?: { items?: Array<any> } } };
      const learnerRecord = payload.data?.listLearnerProfiles?.items?.[0];
      const supportProfile = learnerRecord?.supportProfile;
      const parsedProfile = supportProfile ? (typeof supportProfile === 'string' ? JSON.parse(supportProfile) : supportProfile) : null;
      const savedCareerTarget = parsedProfile?.targetCareer ? String(parsedProfile.targetCareer).trim() : null;

      setLearnerCareerMap((current) => ({ ...current, [learnerId]: savedCareerTarget }));
    } catch {
      setLearnerCareerMap((current) => ({ ...current, [learnerId]: null }));
    }
  };

  const loadNationalCounties = async (regionCode: string) => {
    const result = await client.graphql({ query: listOrgHierarchies, variables: { filter: { and: [{ entityType: { eq: 'county' } }, { regionCode: { eq: regionCode } }] }, limit: 500 } } as any);
    const items = (result as any).data?.listOrgHierarchies?.items || [];
    setNationalCounties(items.filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name })));
  };

  const loadNationalSubCounties = async (countyCode: string) => {
    const result = await client.graphql({ query: listOrgHierarchies, variables: { filter: { and: [{ entityType: { eq: 'subCounty' } }, { countyCode: { eq: countyCode } }] }, limit: 500 } } as any);
    const items = (result as any).data?.listOrgHierarchies?.items || [];
    setNationalSubCounties(items.filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name })));
  };

  const loadNationalSchools = async (subCountyCode: string) => {
    const result = await client.graphql({ query: listOrgHierarchies, variables: { filter: { and: [{ entityType: { eq: 'school' } }, { subCountyCode: { eq: subCountyCode } }] }, limit: 500 } } as any);
    const items = (result as any).data?.listOrgHierarchies?.items || [];
    setNationalSchools(items.filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name })));
  };

  const getLatestClusterAssessment = (learner: any, profile: any) => {
    const clusterSeries = calculateHistoricalClusterSeries(learner, profile || {});
    if (!Array.isArray(clusterSeries) || clusterSeries.length === 0) return null;
    const ordered = [...clusterSeries].sort((left, right) => Number(left.label) - Number(right.label));
    const lastEntry = ordered[ordered.length - 1];
    if (!lastEntry) return null;

    const clusterValue = Number(lastEntry.value ?? 0);
    const target = Number(lastEntry.target ?? 0);
    const deviation = Number(lastEntry.deviation ?? calculateDeviationPercentage(clusterValue, target) ?? 0);
    return {
      lastGrade: Number(lastEntry.label),
      clusterValue,
      target,
      deviation,
    };
  };

  const loadLearnerProfile = async (learnerId?: string) => {
    if (!learnerId) return null;
    const requestId = ++profileRequestRef.current;

    try {
      const res = await client.graphql({ query: getLearnerProfile, variables: { id: learnerId } } as any);
      const item = (res as any).data?.getLearnerProfile || null;
      if (!item) {
        if (requestId === profileRequestRef.current) {
          setSelectedLearnerProfile(null);
        }
        return null;
      }

      const parsedSupportProfile = (() => {
        if (!item?.supportProfile) return null;
        try {
          return typeof item.supportProfile === 'string' ? JSON.parse(item.supportProfile) : item.supportProfile;
        } catch {
          return null;
        }
      })();

      const normalized = {
        ...item,
        supportProfile: parsedSupportProfile || item.supportProfile || null,
        selectedSubjects: Array.isArray(parsedSupportProfile?.selectedSubjects) ? parsedSupportProfile.selectedSubjects : (Array.isArray(item?.selectedSubjects) ? item.selectedSubjects : []),
        historicalSelectedSubjects: Array.isArray(parsedSupportProfile?.historicalSelectedSubjects) ? parsedSupportProfile.historicalSelectedSubjects : (Array.isArray(item?.historicalSelectedSubjects) ? item.historicalSelectedSubjects : []),
        targetCareer: parsedSupportProfile?.targetCareer ?? item?.targetCareer ?? null,
        targetClusterPoints: parsedSupportProfile?.targetClusterPoints ?? item?.targetClusterPoints ?? 0,
      };

      if (requestId !== profileRequestRef.current) {
        return normalized;
      }

      setSelectedLearnerProfile(normalized);
      return normalized;
    } catch (error) {
      console.warn('loadLearnerProfile failed', error);
      if (requestId === profileRequestRef.current) {
        setSelectedLearnerProfile(null);
      }
      return null;
    }
  };

  const openDocument = async (resource: any) => {
    if (!resource?.fileKey) return;
    const rawKey = String(resource.fileKey || '').trim();
    if (rawKey.startsWith('http://') || rawKey.startsWith('https://')) {
      await Linking.openURL(rawKey);
      return;
    }
    if (rawKey.startsWith('s3://')) {
      await Linking.openURL(rawKey.replace(/^s3:\/\//, 'https://'));
      return;
    }

    try {
      const signed = await getUrl({
        path: rawKey,
        options: {
          validateObjectExistence: true,
          expiresIn: 900,
        },
      });
      const url = String((signed as any)?.url || signed);
      if (url) {
        await Linking.openURL(url);
        return;
      }
    } catch (error) {
      console.warn('openDocument failed', error);
    }

    Alert.alert('Unable to open file', 'This file could not be opened right now.');
  };

  const loadNationalCareerSummary = async () => {
    if (!nation?.code) {
      setNationalCareerSummary({
        totalSummaries: 0,
        metTarget: 0,
        belowTarget: 0,
        eligible: 0,
        pending: 0,
        institutionCount: 0,
        courseCount: 0,
        topCareers: [],
      });
      return;
    }

    try {
      const result = await client.graphql({
        query: listGrade12ResultSummaries,
        variables: { limit: 500 },
      } as any);

      const items = ((result as any).data?.listGrade12ResultSummaries?.items || []) as Array<any>;
      const summaries = items.filter((item: any) => {
        const nationCode = String(item?.nationCode || '').trim();
        return Boolean(item?.learnerId) && nationCode.length > 0 && nationCode.toLowerCase() === String(nation.code).trim().toLowerCase();
      });

      const metTarget = summaries.filter((item: any) => item?.wasTargetCareerReached === true || item?.resultStatus === 'met_target').length;
      const belowTarget = summaries.filter((item: any) => item?.wasTargetCareerReached === false || item?.resultStatus === 'below_target').length;
      const eligible = summaries.filter((item: any) => item?.placementStatus === 'eligible').length;
      const pending = summaries.filter((item: any) => item?.placementStatus === 'pending').length;

      const careerMap = new Map<string, number>();
      summaries.forEach((item: any) => {
        const name = String(item?.targetCareerName || item?.courseName || item?.institutionName || 'Unassigned').trim();
        if (!name) return;
        careerMap.set(name, (careerMap.get(name) || 0) + 1);
      });

      const topCareers = Array.from(careerMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((left, right) => right.value - left.value)
        .slice(0, 5);

      setNationalCareerSummary({
        totalSummaries: summaries.length,
        metTarget,
        belowTarget,
        eligible,
        pending,
        institutionCount: new Set(summaries.map((item: any) => String(item?.institutionName || '').trim()).filter(Boolean)).size,
        courseCount: new Set(summaries.map((item: any) => String(item?.courseName || '').trim()).filter(Boolean)).size,
        topCareers,
      });
    } catch (error) {
      console.warn('loadNationalCareerSummary failed', error);
      setNationalCareerSummary({
        totalSummaries: 0,
        metTarget: 0,
        belowTarget: 0,
        eligible: 0,
        pending: 0,
        institutionCount: 0,
        courseCount: 0,
        topCareers: [],
      });
    }
  };

  const loadTertiaryCatalog = async () => {
    if (!nation?.code) {
      setTertiaryInstitutions([]);
      setTertiaryCourses([]);
      return;
    }

    try {
      const [institutionResult, courseResult, userResult] = await Promise.all([
        client.graphql({
          query: listTertiaryInstitutionProfiles,
          variables: { limit: 500 },
        } as any),
        client.graphql({
          query: listTertiaryCourses,
          variables: { limit: 500 },
        } as any),
        client.graphql({
          query: listUsers,
          variables: { limit: 500 },
        } as any),
      ]);

      const institutions = ((institutionResult as any).data?.listTertiaryInstitutionProfiles?.items || []) as Array<any>;
      const courses = ((courseResult as any).data?.listTertiaryCourses?.items || []) as Array<any>;
      const users = ((userResult as any).data?.listUsers?.items || []) as Array<any>;

      const emailMap = users.reduce((map: Record<string, string>, user: any) => {
        if (user?.id) {
          map[user.id] = user.email || user.username || 'Unknown email';
        }
        return map;
      }, {} as Record<string, string>);

      const nationInstitutions = institutions
        .filter((item: any) => String(item?.nationCode || '').trim().toLowerCase() === String(nation.code).trim().toLowerCase())
        .map((item: any) => ({
          id: item.id,
          institutionName: item.institutionName,
          nationCode: item.nationCode,
          regionCode: item.regionCode,
          countyCode: item.countyCode,
          userId: item.userId,
          adminEmail: emailMap[String(item.userId || '')] || emailMap[String(item?.userId || '').toLowerCase()] || 'Unknown email',
        }));

      const institutionMap = new Map<string, string>();
      nationInstitutions.forEach((institution: any) => {
        institutionMap.set(institution.id, institution.institutionName || 'Unknown institution');
      });

      const nationCourses = courses
        .filter((course: any) => {
          const institutionName = institutionMap.get(String(course?.institutionId || ''));
          return Boolean(course?.courseName) && (course?.institutionId ? institutionMap.has(String(course.institutionId)) : true);
        })
        .map((course: any) => ({
          id: course.id,
          institutionId: course.institutionId,
          institutionName: institutionMap.get(String(course?.institutionId || '')) || 'Unknown institution',
          courseCode: course.courseCode,
          courseName: course.courseName,
          minimumClusterScore: typeof course.minimumClusterScore === 'number' ? course.minimumClusterScore : Number(course.minimumClusterScore) || null,
          status: course.status,
        }));

      setTertiaryInstitutions(nationInstitutions);
      setTertiaryCourses(nationCourses);
    } catch (error) {
      console.warn('loadTertiaryCatalog failed', error);
      setTertiaryInstitutions([]);
      setTertiaryCourses([]);
    }
  };

  const loadNationalLearners = async () => {
    if (!nation?.code) return;
    try {
      const regionResult = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: {
            and: [{ entityType: { eq: 'region' } }, { nationCode: { eq: nation.code } }],
          },
          limit: 200,
        },
      });

      const regionPayload = regionResult as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const regionItems = (regionPayload.data?.listOrgHierarchies?.items || []).filter((item: any) => item?.id && item?.code && item?.name);
      setNationalRegions(regionItems.map((item: any) => ({ id: item.id, code: item.code, name: item.name })));
      const regionCodes = regionItems.map((item: any) => item.code).filter(Boolean);

      if (regionCodes.length === 0) {
        setNationalLearners([]);
        return;
      }

      const learnerBatches = await Promise.all(regionCodes.map(async (regionCode: string) => {
        const result = await client.graphql({
          query: listLearnerProfiles,
          variables: { filter: { regionCode: { eq: regionCode } }, limit: 500 },
        } as any);
        return ((result as any).data?.listLearnerProfiles?.items || []) as Array<any>;
      }));

      const items = learnerBatches.flat();
      const filteredItems = items.filter((learner: any) => {
        const supportProfile = (() => {
          if (!learner?.supportProfile) return null;
          try {
            return typeof learner.supportProfile === 'string' ? JSON.parse(learner.supportProfile) : learner.supportProfile;
          } catch {
            return null;
          }
        })();

        const normalizedProfile = {
          ...learner,
          supportProfile: supportProfile || learner.supportProfile || null,
          selectedSubjects: Array.isArray(supportProfile?.selectedSubjects) ? supportProfile.selectedSubjects : (Array.isArray(learner?.selectedSubjects) ? learner.selectedSubjects : []),
          historicalSelectedSubjects: Array.isArray(supportProfile?.historicalSelectedSubjects) ? supportProfile.historicalSelectedSubjects : (Array.isArray(learner?.historicalSelectedSubjects) ? learner.historicalSelectedSubjects : []),
          targetCareer: supportProfile?.targetCareer ?? learner?.targetCareer ?? null,
          targetClusterPoints: supportProfile?.targetClusterPoints ?? learner?.targetClusterPoints ?? 0,
        };

        const lastAssessment = getLatestClusterAssessment(learner, normalizedProfile);
        const includeLearner = !!lastAssessment && lastAssessment.deviation < -80;

        console.log('[NationalOfficeScreen] learner last grade cluster check', JSON.stringify({
          learnerId: learner.id,
          learnerName: learner.fullName,
          lastGrade: lastAssessment?.lastGrade ?? null,
          clusterValue: lastAssessment?.clusterValue ?? null,
          target: lastAssessment?.target ?? null,
          deviation: lastAssessment?.deviation ?? null,
          includeLearner,
        }, null, 2));

        return includeLearner;
      });

      setNationalLearners(filteredItems.map((learner: any) => ({
        id: learner.id,
        fullName: learner.fullName,
        gradeLevel: learner.gradeLevel,
        classCode: learner.classCode,
        assessmentNumber: learner.assessmentNumber,
        regionCode: learner.regionCode,
        countyCode: learner.countyCode,
        subCountyCode: learner.subCountyCode,
        schoolCode: learner.schoolCode,
      })));

      await Promise.all(filteredItems.map((learner: any) => loadSelectedLearnerCareer(learner.id)));
    } catch (error) {
      console.warn('loadNationalLearners failed', error);
      setNationalLearners([]);
    }
  };

  const modalContent = performanceAction && selectedLearner ? (
    <Modal transparent visible={!!performanceAction} animationType="slide" onRequestClose={resetPerformanceModal}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' }}>
        <View key={`${performanceSessionId}-${selectedLearner?.id ?? 'national-performance'}`} style={{ margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 12, maxHeight: '90%' }}>
          <Text style={{ fontWeight: '800', marginBottom: 6 }}>{selectedLearner.fullName}</Text>
          <Text style={{ color: '#6b7280', marginBottom: 8 }}>Grade {selectedLearner.gradeLevel || 'N/A'}</Text>

          {performanceAction === 'viewMenu' ? (
            <ViewPerformance
              onViewCluster={() => setPerformanceAction('viewCluster')}
              onViewSubjects={() => setPerformanceAction('viewSubjects')}
              onViewGuidance={() => setPerformanceAction('viewGuidance')}
              onViewEPortfolio={() => setPerformanceAction('viewEPortfolio')}
            />
          ) : null}

          {performanceAction === 'viewCluster' ? (
            <ScrollView style={{ marginTop: 8 }}>
              <LearnerPerformanceGraphs learner={selectedLearner} profile={selectedLearnerProfile || {}} mode="cluster" />
            </ScrollView>
          ) : null}

          {performanceAction === 'viewSubjects' ? (
            <ScrollView style={{ marginTop: 8 }}>
              <LearnerPerformanceGraphs learner={selectedLearner} profile={selectedLearnerProfile || {}} mode="subjects" />
            </ScrollView>
          ) : null}

          <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
            <TouchableOpacity onPress={resetPerformanceModal} style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
              <Text style={{ color: '#1d4ed8', fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>

          {performanceAction === 'viewGuidance' ? (
            <ScrollView style={{ marginTop: 8 }}>
              <LearnerComments learnerId={selectedLearner.id} currentGrade={selectedLearner.gradeLevel} authorRoleOverride="national" />
            </ScrollView>
          ) : null}

          {performanceAction === 'viewEPortfolio' ? (
            <ScrollView style={{ marginTop: 8 }}>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>E-portfolio files</Text>
              {(() => {
                const loadDocs = async () => {
                  const learnerSchoolCode = selectedLearnerProfile?.schoolCode || null;
                  const baseFilter = {
                    and: [
                      { learnerId: { eq: selectedLearner.id } },
                      { resourceCategory: { eq: 'e_portfolio' } },
                    ],
                  } as any;
                  const filter = learnerSchoolCode ? { and: [{ schoolCode: { eq: learnerSchoolCode } }, ...baseFilter.and] } : baseFilter;
                  const res = await client.graphql({ query: listLearnerDocumentResources, variables: { filter, limit: 200 } } as any);
                  const items = ((res as any).data?.listLearnerDocumentResources?.items || [])
                    .filter((item: any) => item?.id && item?.learnerId && item?.fileKey)
                    .map((item: any) => ({
                      id: item.id,
                      title: item.title,
                      fileName: item.fileName,
                      fileKey: item.fileKey,
                      status: item.status || 'pending_review',
                    }))
                    .sort((left: any, right: any) => String(right.title || '').localeCompare(String(left.title || '')));
                  setLearnerDocuments(items);
                };

                if (!learnerDocuments.length) {
                  void loadDocs();
                }

                if (!learnerDocuments.length) {
                  return <Text style={{ color: '#6b7280' }}>No e-portfolio files are attached to this learner yet.</Text>;
                }

                return learnerDocuments.map((doc: any) => (
                  <TouchableOpacity key={doc.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }} onPress={() => openDocument(doc)}>
                    <Text style={{ fontWeight: '600', color: '#1d4ed8' }}>{doc.title || doc.fileName || 'Untitled document'}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>{doc.fileName || 'Document file'} • {doc.status || 'pending_review'}</Text>
                  </TouchableOpacity>
                ));
              })()}
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  ) : null;

  const activeContent = useMemo(() => {
    switch (activeScreen) {
      case 'setup':
        return <NationalOfficerSetupContent />;
      case 'regions':
        return <NationalRegionsContent />;
      case 'catalog':
        return <NationalCatalogContent />;
      case 'performance':
        return (
          <NationalPerformanceSummaryContent
            nationalCareerSummary={nationalCareerSummary}
            tertiaryInstitutions={tertiaryInstitutions}
            tertiaryCourses={tertiaryCourses}
          />
        );
      default:
        return (
          <>
            <SectionCard
              title="National Office"
              subtitle="Choose a national task to begin."
              defaultExpanded={true}
            >
            </SectionCard>

            <SectionCard title="Regions, schools, and affected learners" subtitle="Select a region, county, sub-county, school, and grade to view affected learners." defaultExpanded={false}>
              {!nationalRegions.length ? <Text style={styles.empty}>No regions are available in this nation.</Text> : nationalRegions.map((regionItem) => (
                <TouchableOpacity key={regionItem.id} style={[styles.row, selectedRegionCode === regionItem.code && styles.rowSelected]} onPress={() => setSelectedRegionCode(regionItem.code)} accessibilityState={{ selected: selectedRegionCode === regionItem.code }}>
                  <Text style={styles.rowCode}>{regionItem.code}</Text>
                  <Text style={styles.rowName}>{regionItem.name}</Text>
                </TouchableOpacity>
              ))}
              {selectedRegionCode ? (
                <View style={styles.selectionBlock}>
                  <Text style={styles.selectionTitle}>Counties in {nationalRegions.find((item) => item.code === selectedRegionCode)?.name || selectedRegionCode}</Text>
                  {!nationalCounties.length ? <Text style={styles.empty}>No counties found in this region.</Text> : nationalCounties.map((county) => (
                    <TouchableOpacity key={county.id} style={[styles.schoolButton, selectedCountyCode === county.code && styles.schoolButtonActive]} onPress={() => setSelectedCountyCode(county.code)} accessibilityState={{ selected: selectedCountyCode === county.code }}>
                      <Text style={styles.rowCode}>{county.code}</Text><Text style={styles.rowName}>{county.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {selectedCountyCode ? (
                    <View style={styles.selectionBlock}>
                      <Text style={styles.selectionTitle}>Sub-counties in {nationalCounties.find((item) => item.code === selectedCountyCode)?.name || selectedCountyCode}</Text>
                      {!nationalSubCounties.length ? <Text style={styles.empty}>No sub-counties found in this county.</Text> : nationalSubCounties.map((subCounty) => (
                        <TouchableOpacity key={subCounty.id} style={[styles.schoolButton, selectedSubCountyCode === subCounty.code && styles.schoolButtonActive]} onPress={() => setSelectedSubCountyCode(subCounty.code)} accessibilityState={{ selected: selectedSubCountyCode === subCounty.code }}>
                          <Text style={styles.rowCode}>{subCounty.code}</Text><Text style={styles.rowName}>{subCounty.name}</Text>
                        </TouchableOpacity>
                      ))}
                      {selectedSubCountyCode ? (
                        <View style={styles.selectionBlock}>
                          <Text style={styles.selectionTitle}>Schools in {nationalSubCounties.find((item) => item.code === selectedSubCountyCode)?.name || selectedSubCountyCode}</Text>
                          {!nationalSchools.length ? <Text style={styles.empty}>No schools found in this sub-county.</Text> : nationalSchools.map((school) => (
                            <TouchableOpacity key={school.id} style={[styles.schoolButton, selectedSchoolCode === school.code && styles.schoolButtonActive]} onPress={() => { setSelectedSchoolCode(school.code); setSelectedLearnerGrade(null); }} accessibilityState={{ selected: selectedSchoolCode === school.code }}>
                              <Text style={styles.rowCode}>{school.code}</Text><Text style={styles.rowName}>{school.name}</Text>
                            </TouchableOpacity>
                          ))}
                          {selectedSchoolCode ? <View style={styles.gradeSelector}>{['7', '8', '9', '10', '11', '12'].map((grade) => (
                            <TouchableOpacity key={grade} style={[styles.gradeButton, selectedLearnerGrade === grade && styles.gradeButtonActive]} onPress={() => setSelectedLearnerGrade(grade)} accessibilityState={{ selected: selectedLearnerGrade === grade }}>
                              <Text style={[styles.gradeButtonText, selectedLearnerGrade === grade && styles.gradeButtonTextActive]}>Grade {grade}</Text>
                            </TouchableOpacity>
                          ))}</View> : null}
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </SectionCard>

            <SectionCard title="Affected learners" subtitle="Learners below the National latest-grade deviation threshold.">
              {!nationalLearners.length ? (
                <Text style={styles.empty}>No learners in this nation are below target by more than 80% in their last grade yet.</Text>
              ) : !selectedRegionCode || !selectedCountyCode || !selectedSubCountyCode || !selectedSchoolCode || !selectedLearnerGrade ? (
                <Text style={styles.empty}>Select a region, county, sub-county, school, and grade above to view learners.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 720 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator>
                  {nationalLearners.filter((learner) => {
                    const learnerGrade = String(learner.gradeLevel || learner.classCode || '').replace(/\D/g, '');
                    return learner.regionCode === selectedRegionCode && learner.countyCode === selectedCountyCode && learner.subCountyCode === selectedSubCountyCode && learner.schoolCode === selectedSchoolCode && learnerGrade === selectedLearnerGrade;
                  }).map((learner) => (
                    <View key={learner.id} style={styles.learnerRow}>
                      <Text style={styles.learnerText}>{learner.fullName} - {learnerCareerMap[learner.id] || 'Career target not set'}</Text>
                      <Text style={styles.learnerMeta}>{nationalSchools.find((school) => school.code === learner.schoolCode)?.name || learner.schoolCode || 'School N/A'} • {learner.schoolCode || 'Registration code N/A'}</Text>
                      <Text style={styles.learnerMeta}>Grade {learner.gradeLevel || learner.classCode || 'N/A'} • Class {learner.classCode || 'N/A'} • {learner.subCountyCode || 'N/A'} • {learner.countyCode || 'N/A'} • {learner.regionCode || 'N/A'}</Text>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={async () => {
                          profileRequestRef.current += 1;
                          setPerformanceSessionId((current) => current + 1);
                          setSelectedLearner(learner);
                          setSelectedLearnerProfile(null);
                          setPerformanceAction('viewMenu');
                          const profile = await loadLearnerProfile(learner.id);
                          if (!profile) {
                            Alert.alert('Learner profile unavailable', 'This learner record does not yet contain performance data.');
                            return;
                          }
                          setSelectedLearnerProfile(profile);
                        }}
                      >
                        <Text style={styles.actionButtonText}>View performance</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {!nationalLearners.some((learner) => {
                    const learnerGrade = String(learner.gradeLevel || learner.classCode || '').replace(/\D/g, '');
                    return learner.regionCode === selectedRegionCode && learner.countyCode === selectedCountyCode && learner.subCountyCode === selectedSubCountyCode && learner.schoolCode === selectedSchoolCode && learnerGrade === selectedLearnerGrade;
                  }) ? <Text style={styles.empty}>No affected learners match this selection.</Text> : null}
                </ScrollView>
              )}
            </SectionCard>
          </>
        );
    }
  }, [activeScreen, nationalLearners, learnerCareerMap, client, nationalRegions, nationalCounties, nationalSubCounties, nationalSchools, selectedRegionCode, selectedCountyCode, selectedSubCountyCode, selectedSchoolCode, selectedLearnerGrade]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionCard title="National Account" subtitle="Your assigned national office details.">
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#1d4ed8" />
              <Text style={styles.loadingText}>Loading your national account...</Text>
            </View>
          ) : null}

          {!isLoading && notice ? <Text style={styles.notice}>{notice}</Text> : null}

          {!isLoading && nation ? (
            <>
              <Text style={styles.heading}>{nation.name}</Text>
              <Text style={styles.meta}>Code: {nation.code}</Text>
              <Text style={styles.meta}>Assigned officer: {nation.assignedOfficerEmail || 'Not set'}</Text>
            </>
          ) : null}
        </SectionCard>

        <SectionCard
          title="National Office"
          subtitle="National administration hub for setup and regional management."
        >
          <View style={styles.buttonRow}>
            {NATIONAL_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={[styles.actionButton, activeScreen === action.key && styles.actionButtonActive]}
                onPress={() => setActiveScreen(action.key)}
              >
                <Text style={[styles.actionButtonText, activeScreen === action.key && styles.actionButtonTextActive]}>
                  {action.title}
                </Text>
                <Text style={[styles.actionButtonDescription, activeScreen === action.key && styles.actionButtonDescriptionActive]}>
                  {action.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {activeContent}
      </ScrollView>

      {modalContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 36,
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#374151',
    fontSize: 14,
  },
  notice: {
    color: '#b91c1c',
    fontSize: 14,
    marginTop: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  empty: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rowSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  rowCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
    marginBottom: 2,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  selectionBlock: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectionTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  summaryTile: {
    width: '31%',
    minWidth: 110,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    padding: 12,
  },
  summaryLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryValue: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '800',
  },
  catalogSection: {
    marginTop: 16,
    gap: 8,
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 4,
  },
  expandToggleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1d4ed8',
    lineHeight: 24,
  },
  catalogRow: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
  },
  institutionToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  courseListContainer: {
    marginTop: 10,
    gap: 8,
  },
  courseRow: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 8,
  },
  catalogTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 3,
  },
  catalogMeta: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 2,
  },
  careerList: {
    marginTop: 12,
    gap: 6,
  },
  careerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  careerName: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  careerCount: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '800',
  },
  schoolButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  schoolButtonActive: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  gradeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  gradeButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  gradeButtonActive: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  gradeButtonText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  gradeButtonTextActive: {
    color: '#1d4ed8',
  },
  buttonRow: {
    gap: 12,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  actionButtonActive: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  actionButtonTextActive: {
    color: '#1d4ed8',
  },
  actionButtonDescription: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  actionButtonDescriptionActive: {
    color: '#1e40af',
  },
  learnerRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  learnerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  learnerMeta: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 8,
  },
});
