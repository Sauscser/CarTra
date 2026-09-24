import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { getUrl } from 'aws-amplify/storage';
import { listParentLearnerLinks, listLearnerProfiles, listParentProfiles, listLearnerDocumentResources } from '../../graphql/queries';
import useSessionUser from '../../hooks/useSessionUser';
import ViewPerformance from '../../components/teacher/ViewPerformance';
import LearnerComments from '../../components/shared/LearnerComments';

type Props = {
  parentProfileId?: string | null;
  parentNationalId?: string | null;
};

export default function ParentLinkedLearners({ parentProfileId, parentNationalId, parentTabFocused }: Props & { parentTabFocused?: boolean }) {
  const client = useMemo(() => generateClient(), []);
  const { sessionUser } = useSessionUser();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [linkedLearners, setLinkedLearners] = useState<Array<{ id: string; fullName: string; classCode?: string | null; gradeLevel?: string | null }>>([]);
  const [learnerFullMap, setLearnerFullMap] = useState<Record<string, any>>({});
  const [selectedLearner, setSelectedLearner] = useState<any | null>(null);
  const [performanceAction, setPerformanceAction] = useState<'viewMenu' | 'viewCluster' | 'viewSubjects' | 'viewGuidance' | 'viewEPortfolio' | null>(null);
  const [learnerDocuments, setLearnerDocuments] = useState<any[]>([]);
  const [selectedLearnerProfile, setSelectedLearnerProfile] = useState<any | null>(null);
  const [performanceSessionId, setPerformanceSessionId] = useState(0);
  const [performanceOpening, setPerformanceOpening] = useState<string | null>(null);
  const profileRequestRef = useRef(0);

  const resetPerformanceModal = () => {
    profileRequestRef.current += 1;
    setPerformanceSessionId((current) => current + 1);
    setPerformanceAction(null);
    setSelectedLearner(null);
    setSelectedLearnerProfile(null);
    setLearnerDocuments([]);
    setPerformanceOpening(null);
  };

  const beginPerformanceForLearner = (learner: any, action: 'viewCluster' | 'viewSubjects' | 'viewEPortfolio') => {
    const learnerId = learner?.id || null;
    const requestId = ++profileRequestRef.current;
    const profileSnapshot = learnerId ? learnerFullMap[learnerId] || null : null;
    const subjectList = Array.isArray(profileSnapshot?.selectedSubjects)
      ? profileSnapshot.selectedSubjects
      : Array.isArray(profileSnapshot?.historicalSelectedSubjects)
        ? profileSnapshot.historicalSelectedSubjects
        : [];

    console.log('[PARENT_LOG] learner clicked for performance selection', JSON.stringify({
      requestId,
      learnerId,
      fullName: learner?.fullName || null,
      gradeLevel: learner?.gradeLevel || null,
      subjectCount: subjectList.length,
      subjects: subjectList.map((subject: any) => ({
        id: subject?.id || null,
        name: subject?.name || null,
        code: subject?.code || null,
        historyCount: Array.isArray(subject?.history) ? subject.history.length : 0,
      })),
    }, null, 2));

    setPerformanceSessionId((current) => current + 1);
    setPerformanceAction(null);
    setSelectedLearner(null);
    setSelectedLearnerProfile(null);
    setLearnerDocuments([]);
    setSelectedLearner(learner);
    setSelectedLearnerProfile(profileSnapshot);
    setPerformanceAction(action);
  };

  useEffect(() => {
    // Load when parent identifiers change or when sessionUser becomes ready
    void loadLinkedLearners();
  }, [parentProfileId, parentNationalId, sessionUser?.username, parentTabFocused]);

  useEffect(() => {
    if (isFocused) {
      void loadLinkedLearners();
    }
  }, [isFocused]);

  useEffect(() => {
    // refresh the local learnerFullMap if linkedLearners change (safety)
    if (linkedLearners && linkedLearners.length && Object.keys(learnerFullMap).length === 0) {
      // attempt to populate learnerFullMap by re-querying the learner ids
      const ids = linkedLearners.map((l) => l.id);
      (async () => {
        try {
          const res = await client.graphql({ query: listLearnerProfiles, variables: { filter: { id: { in: ids } }, limit: 200 } } as any);
          const learners = (res as any).data?.listLearnerProfiles?.items || [];
          const map: Record<string, any> = {};
          learners.forEach((l: any) => { map[l.id] = l; });
          setLearnerFullMap(map);
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [linkedLearners]);

  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', () => {
      console.log('[DEBUG_PARENT_NAV_FOCUS] navigation focus event');
      void loadLinkedLearners();
    });
    return () => {
      try {
        if (!unsub) return;
        if (typeof unsub === 'function') {
          unsub();
          return;
        }
        const maybe = unsub as any;
        if (maybe && typeof maybe.remove === 'function') {
          maybe.remove();
        }
      } catch (e) {
        // ignore
      }
    };
  }, [navigation]);

  async function loadLinkedLearners() {
    try {
      setLoading(true);
      // Debug: log invocation context
      console.log('[DEBUG_LOAD_LINKED_LEARNERS] start', JSON.stringify({ parentProfileId, parentNationalId, sessionUsername: sessionUser?.username }));

      // If no parent identifiers passed, try to resolve the parent's profile for the signed-in user
      let resolvedParentProfileId = parentProfileId;
      let resolvedParentNationalId = parentNationalId;

      if (!resolvedParentProfileId && !resolvedParentNationalId && sessionUser?.username) {
        try {
          const p = await client.graphql({ query: listParentProfiles, variables: { filter: { userId: { eq: sessionUser.username } }, limit: 1 } } as any);
          const profile = (p as any).data?.listParentProfiles?.items?.[0];
          console.log('[DEBUG_LOAD_LINKED_LEARNERS] parentProfilesQuery', JSON.stringify({ raw: p, found: !!profile }));
          if (profile) {
            resolvedParentProfileId = profile.id;
            resolvedParentNationalId = resolvedParentNationalId || profile.nationalId || null;
          }
        } catch (e) {
          console.warn('[DEBUG_LOAD_LINKED_LEARNERS] parentProfilesQuery failed', e);
          // ignore and continue to fallback logic
        }
      }

      if (resolvedParentProfileId) {
        console.log('[DEBUG_LOAD_LINKED_LEARNERS] using resolvedParentProfileId', resolvedParentProfileId);
        const result = await client.graphql({ query: listParentLearnerLinks, variables: { filter: { parentUserId: { eq: resolvedParentProfileId } }, limit: 200 } } as any);
        const items = (result as any).data?.listParentLearnerLinks?.items || [];
        console.log('[DEBUG_LOAD_LINKED_LEARNERS] parentLearnerLinks', JSON.stringify({ count: items.length, items }));
        const learnerIds = items.map((i: any) => i.learnerId).filter(Boolean);
        if (learnerIds.length > 0) {
          const learnersResult = await client.graphql({ query: listLearnerProfiles, variables: { filter: { id: { in: learnerIds } }, limit: 200 } } as any);
          const learners = (learnersResult as any).data?.listLearnerProfiles?.items || [];
          console.log('[DEBUG_LOAD_LINKED_LEARNERS] learnersByIds', JSON.stringify({ count: learners.length, learners }));
          const normalizedLearners = learners.map((l: any) => {
            const parsedSupportProfile = (() => {
              try {
                if (!l?.supportProfile) return null;
                return typeof l.supportProfile === 'string' ? JSON.parse(l.supportProfile) : l.supportProfile;
              } catch {
                return null;
              }
            })();

            return {
              ...l,
              supportProfile: parsedSupportProfile || l.supportProfile || null,
              selectedSubjects: Array.isArray(parsedSupportProfile?.selectedSubjects) ? parsedSupportProfile.selectedSubjects : (Array.isArray(l?.selectedSubjects) ? l.selectedSubjects : []),
              historicalSelectedSubjects: Array.isArray(parsedSupportProfile?.historicalSelectedSubjects) ? parsedSupportProfile.historicalSelectedSubjects : (Array.isArray(l?.historicalSelectedSubjects) ? l.historicalSelectedSubjects : []),
              targetCareer: parsedSupportProfile?.targetCareer ?? l?.targetCareer ?? null,
              targetClusterPoints: parsedSupportProfile?.targetClusterPoints ?? l?.targetClusterPoints ?? 0,
            };
          });
          setLinkedLearners(normalizedLearners.map((l: any) => ({ id: l.id, fullName: l.fullName, classCode: l.classCode, gradeLevel: l.gradeLevel })));
          const map: Record<string, any> = {};
          normalizedLearners.forEach((l: any) => { map[l.id] = l; });
          setLearnerFullMap(map);
          return;
        }
      }

      if (resolvedParentNationalId) {
        console.log('[DEBUG_LOAD_LINKED_LEARNERS] using resolvedParentNationalId', resolvedParentNationalId);
        const learnersRes = await client.graphql({ query: listLearnerProfiles, variables: { filter: { parentNationalId: { eq: resolvedParentNationalId } }, limit: 200 } } as any);
        const learners = (learnersRes as any).data?.listLearnerProfiles?.items || [];
        console.log('[DEBUG_LOAD_LINKED_LEARNERS] learnersByNationalId', JSON.stringify({ count: learners.length, learners }));
        const normalizedLearners = learners.map((l: any) => {
          const parsedSupportProfile = (() => {
            try {
              if (!l?.supportProfile) return null;
              return typeof l.supportProfile === 'string' ? JSON.parse(l.supportProfile) : l.supportProfile;
            } catch {
              return null;
            }
          })();

          return {
            ...l,
            supportProfile: parsedSupportProfile || l.supportProfile || null,
            selectedSubjects: Array.isArray(parsedSupportProfile?.selectedSubjects) ? parsedSupportProfile.selectedSubjects : (Array.isArray(l?.selectedSubjects) ? l.selectedSubjects : []),
            historicalSelectedSubjects: Array.isArray(parsedSupportProfile?.historicalSelectedSubjects) ? parsedSupportProfile.historicalSelectedSubjects : (Array.isArray(l?.historicalSelectedSubjects) ? l.historicalSelectedSubjects : []),
            targetCareer: parsedSupportProfile?.targetCareer ?? l?.targetCareer ?? null,
            targetClusterPoints: parsedSupportProfile?.targetClusterPoints ?? l?.targetClusterPoints ?? 0,
          };
        });
        setLinkedLearners(normalizedLearners.map((l: any) => ({ id: l.id, fullName: l.fullName, classCode: l.classCode, gradeLevel: l.gradeLevel })));
        const map: Record<string, any> = {};
        normalizedLearners.forEach((l: any) => { map[l.id] = l; });
        setLearnerFullMap(map);
        return;
      }

      setLinkedLearners([]);
    } catch (error) {
      console.warn('loadLinkedLearners failed', error);
      setLinkedLearners([]);
    } finally {
      setLoading(false);
    }
  }

  const onViewCluster = async (learnerId?: string) => {
    if (!learnerId) return;
    setPerformanceOpening(`${learnerId}:cluster`);
    const found = linkedLearners.find((l) => l.id === learnerId) || { id: learnerId };
    const profile = learnerFullMap[learnerId] || null;
    const subjectList = Array.isArray(profile?.selectedSubjects) ? profile.selectedSubjects : Array.isArray(profile?.historicalSelectedSubjects) ? profile.historicalSelectedSubjects : [];
    console.log('[PARENT_LOG] learner selected for cluster view', JSON.stringify({
      learnerId,
      fullName: (found as any)?.fullName || null,
      gradeLevel: (found as any)?.gradeLevel || null,
      subjectCount: subjectList.length,
      subjects: subjectList.map((subject: any) => ({ id: subject?.id || null, name: subject?.name || null, code: subject?.code || null, historyCount: Array.isArray(subject?.history) ? subject.history.length : 0 })),
    }, null, 2));
    beginPerformanceForLearner(found, 'viewCluster');
    try {
      const nextProfile = await loadLearnerProfile(learnerId);
      if (nextProfile) {
        setSelectedLearnerProfile(nextProfile);
      }
    } finally {
      setPerformanceOpening(null);
    }
  };

  const onViewSubjects = async (learnerId?: string) => {
    if (!learnerId) return;
    setPerformanceOpening(`${learnerId}:subjects`);
    const found = linkedLearners.find((l) => l.id === learnerId) || { id: learnerId };
    const profile = learnerFullMap[learnerId] || null;
    const subjectList = Array.isArray(profile?.selectedSubjects) ? profile.selectedSubjects : Array.isArray(profile?.historicalSelectedSubjects) ? profile.historicalSelectedSubjects : [];
    console.log('[PARENT_LOG] learner selected for subjects view', JSON.stringify({
      learnerId,
      fullName: (found as any)?.fullName || null,
      gradeLevel: (found as any)?.gradeLevel || null,
      subjectCount: subjectList.length,
      subjects: subjectList.map((subject: any) => ({ id: subject?.id || null, name: subject?.name || null, code: subject?.code || null, historyCount: Array.isArray(subject?.history) ? subject.history.length : 0 })),
    }, null, 2));
    beginPerformanceForLearner(found, 'viewSubjects');
    try {
      const nextProfile = await loadLearnerProfile(learnerId);
      if (nextProfile) {
        setSelectedLearnerProfile(nextProfile);
      }
    } finally {
      setPerformanceOpening(null);
    }
  };

  const onViewEPortfolio = async (learnerId?: string) => {
    if (!learnerId) return;
    setPerformanceOpening(`${learnerId}:eportfolio`);
    const found = linkedLearners.find((l) => l.id === learnerId) || { id: learnerId };
    const profile = learnerFullMap[learnerId] || null;
    const subjectList = Array.isArray(profile?.selectedSubjects) ? profile.selectedSubjects : Array.isArray(profile?.historicalSelectedSubjects) ? profile.historicalSelectedSubjects : [];
    console.log('[PARENT_LOG] learner selected for eportfolio view', JSON.stringify({
      learnerId,
      fullName: (found as any)?.fullName || null,
      gradeLevel: (found as any)?.gradeLevel || null,
      subjectCount: subjectList.length,
      subjects: subjectList.map((subject: any) => ({ id: subject?.id || null, name: subject?.name || null, code: subject?.code || null, historyCount: Array.isArray(subject?.history) ? subject.history.length : 0 })),
    }, null, 2));
    beginPerformanceForLearner(found, 'viewEPortfolio');
    try {
      const profileResult = await loadLearnerProfile(learnerId);
      const schoolCode = (profileResult && 'schoolCode' in profileResult ? profileResult.schoolCode : null) || ('schoolCode' in found ? (found as any).schoolCode : null) || null;
      const filter = schoolCode
        ? { and: [{ schoolCode: { eq: schoolCode } }, { learnerId: { eq: learnerId } }] }
        : { learnerId: { eq: learnerId } };

      const docsRes = await client.graphql({ query: listLearnerDocumentResources, variables: { filter, limit: 200 } } as any);
      const items = ((docsRes as any).data?.listLearnerDocumentResources?.items || [])
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
        .filter((item: any) => !item.resourceCategory || item.resourceCategory === 'e_portfolio')
        .sort((left: any, right: any) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

      setLearnerDocuments(items);
    } catch (e) {
      setLearnerDocuments([]);
    } finally {
      setPerformanceOpening(null);
    }
  };

  const loadLearnerProfile = async (learnerId?: string) => {
    if (!learnerId) return null;
    const requestId = ++profileRequestRef.current;

    try {
      const res = await client.graphql({ query: listLearnerProfiles, variables: { filter: { id: { eq: learnerId } }, limit: 1 } } as any);
      const item = (res as any).data?.listLearnerProfiles?.items?.[0] || null;
      if (!item) {
        return null;
      }

      const parsedSupportProfile = (() => {
        try {
          if (!item?.supportProfile) return null;
          return typeof item.supportProfile === 'string' ? JSON.parse(item.supportProfile) : item.supportProfile;
        } catch {
          return null;
        }
      })();

      const normalizedItem = {
        ...item,
        supportProfile: parsedSupportProfile || item.supportProfile || null,
        selectedSubjects: Array.isArray(parsedSupportProfile?.selectedSubjects) ? parsedSupportProfile.selectedSubjects : (Array.isArray(item?.selectedSubjects) ? item.selectedSubjects : []),
        historicalSelectedSubjects: Array.isArray(parsedSupportProfile?.historicalSelectedSubjects) ? parsedSupportProfile.historicalSelectedSubjects : (Array.isArray(item?.historicalSelectedSubjects) ? item.historicalSelectedSubjects : []),
        targetCareer: parsedSupportProfile?.targetCareer ?? item?.targetCareer ?? null,
        targetClusterPoints: parsedSupportProfile?.targetClusterPoints ?? item?.targetClusterPoints ?? 0,
      };

      if (requestId !== profileRequestRef.current) {
        return normalizedItem;
      }

      setSelectedLearnerProfile(normalizedItem);
      setLearnerFullMap((current) => ({ ...current, [learnerId]: normalizedItem }));
      return normalizedItem;
    } catch (e) {
      return null;
    }
  };

  const openDocument = async (resource: any) => {
    if (!resource?.fileKey) return;

    const rawKey = String(resource.fileKey || '').trim();
    const normalizedKey = rawKey.replace(/^\/+/, '').replace(/^https?:\/\/[^/]+\//, '');

    if (rawKey.startsWith('http://') || rawKey.startsWith('https://')) {
      console.log('[ParentLinkedLearners] openDocument raw url', rawKey);
      await Linking.openURL(rawKey);
      return;
    }

    if (rawKey.startsWith('s3://')) {
      console.log('[ParentLinkedLearners] openDocument s3 url', rawKey);
      await Linking.openURL(rawKey.replace(/^s3:\/\//, 'https://'));
      return;
    }

    console.log('[ParentLinkedLearners] openDocument storage route', JSON.stringify({
      fileId: resource.id,
      rawKey,
      fileName: resource.fileName || null,
    }, null, 2));

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
  };

  const activeProfile = selectedLearner && selectedLearnerProfile && selectedLearnerProfile.id === selectedLearner.id ? selectedLearnerProfile : null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Linked learners</Text>
      {loading ? <ActivityIndicator /> : null}

      {linkedLearners.length === 0 ? <Text>No learners linked.</Text> : (
        <ScrollView
          style={styles.linkedLearnersScroll}
          contentContainerStyle={styles.linkedLearnersContent}
          showsVerticalScrollIndicator
        >
          {linkedLearners.map((l) => (
            <View key={l.id} style={styles.learnerRow}>
              <Text style={styles.learnerText}>{l.fullName} ({l.gradeLevel || ''} - {l.classCode || ''})</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => void onViewCluster(l.id)}
                  disabled={Boolean(performanceOpening)}
                  accessibilityState={{ disabled: Boolean(performanceOpening), busy: performanceOpening === `${l.id}:cluster` }}
                >
                  {performanceOpening === `${l.id}:cluster` ? <ActivityIndicator size="small" color="#1d4ed8" /> : <Text>Cluster</Text>}
                  {performanceOpening === `${l.id}:cluster` ? <Text>Opening... please wait</Text> : null}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => void onViewSubjects(l.id)}
                  disabled={Boolean(performanceOpening)}
                  accessibilityState={{ disabled: Boolean(performanceOpening), busy: performanceOpening === `${l.id}:subjects` }}
                >
                  {performanceOpening === `${l.id}:subjects` ? <ActivityIndicator size="small" color="#1d4ed8" /> : <Text>Subjects</Text>}
                  {performanceOpening === `${l.id}:subjects` ? <Text>Opening... please wait</Text> : null}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => void onViewEPortfolio(l.id)}
                  disabled={Boolean(performanceOpening)}
                  accessibilityState={{ disabled: Boolean(performanceOpening), busy: performanceOpening === `${l.id}:eportfolio` }}
                >
                  {performanceOpening === `${l.id}:eportfolio` ? <ActivityIndicator size="small" color="#1d4ed8" /> : <Text>E-portfolio</Text>}
                  {performanceOpening === `${l.id}:eportfolio` ? <Text>Opening... please wait</Text> : null}
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 8 }}>
                <LearnerComments learnerId={l.id} currentGrade={l.gradeLevel} authorRoleOverride="parent" />
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal transparent visible={!!performanceAction} animationType="slide" onRequestClose={resetPerformanceModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' }}>
          <View key={`${performanceSessionId}-${selectedLearner?.id ?? 'parent-performance'}`} style={{ margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 12, maxHeight: '90%', position: 'relative' }}>
            <Text style={{ fontWeight: '800', marginBottom: 6 }}>{performanceAction && selectedLearner ? `View performance for ${selectedLearner.fullName || selectedLearner.id}` : 'View performance'}</Text>
            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Grade {selectedLearner?.gradeLevel || 'N/A'}</Text>

            {performanceOpening ? (
              <View style={{ position: 'absolute', zIndex: 10, top: 0, right: 0, bottom: 0, left: 0, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text style={{ marginTop: 12, color: '#1d4ed8', fontWeight: '700', textAlign: 'center' }}>Opening performance data... please wait</Text>
              </View>
            ) : null}

            {!performanceOpening && performanceAction === 'viewMenu' ? (
              <ViewPerformance
                onViewCluster={() => setPerformanceAction('viewCluster')}
                onViewSubjects={() => setPerformanceAction('viewSubjects')}
                onViewGuidance={() => setPerformanceAction('viewGuidance')}
                onViewEPortfolio={() => setPerformanceAction('viewEPortfolio')}
              />
            ) : null}

            {!performanceOpening && performanceAction === 'viewCluster' ? (
              <ScrollView style={{ marginTop: 8 }}>
                {/* cluster chart */}
                <Text style={{ fontWeight: '700', marginBottom: 8 }}>Cluster points trend</Text>
                {(() => {
                  const profile = activeProfile;
                  const clusterSeries = getHistoricalClusterSeries(selectedLearner, profile, learnerFullMap);
                  try {
                    const rawSupportProfile = profile && profile.supportProfile ? profile.supportProfile : null;
                    const fallbackProfile = (profile && profile.supportProfile) ? profile : (learnerFullMap && learnerFullMap[selectedLearner?.id]) || null;
                    const subjects = (profile && profile.selectedSubjects) || (fallbackProfile && fallbackProfile.selectedSubjects) || [];
                    const subjectDebug = subjects.map((s: any) => ({ name: s.name || s.code, marksScored: s.marksScored, history: s.history }));
                    const numericVals = clusterSeries.map((p: any) => (Number.isFinite(Number(p.value)) ? Number(p.value) : NaN)).filter(Number.isFinite);
                    const domain = { min: numericVals.length ? Math.min(...numericVals) : NaN, max: numericVals.length ? Math.max(...numericVals) : NaN };
                    console.log('[PARENT_LOG] using data for cluster graph', JSON.stringify({
                      selectedLearnerId: selectedLearner?.id,
                      selectedLearnerFullName: selectedLearner?.fullName,
                      profileId: profile?.id || null,
                      rawSupportProfile: rawSupportProfile ? { id: rawSupportProfile?.id || null, targetClusterPoints: rawSupportProfile?.targetClusterPoints ?? null } : null,
                      fallbackProfileId: fallbackProfile?.id || null,
                      subjects: subjectDebug,
                      clusterSeries,
                      domain,
                    }, null, 2));
                  } catch (e) {
                    console.warn('DEBUG_PARENT_CLUSTER log failed', e);
                  }
                  const numericVals = clusterSeries.map((p: any) => (Number.isFinite(Number(p.value)) ? Number(p.value) : NaN)).filter(Number.isFinite);
                  const domainMin = numericVals.length ? Math.min(...numericVals) : 1;
                  const domainMax = numericVals.length ? Math.max(...numericVals) : 100;
                  const validClusterSeries = clusterSeries.filter((point: any) => point && Number.isFinite(Number(point.value)));
                  const requirement = getSelectedCourseClusterRequirement(profile);
                  const rendered = renderLineChart(validClusterSeries, '#93c5fd', '#1d4ed8', 100, { min: Math.max(0, domainMin - 4), max: Math.max(1, domainMax + 4) }, requirement);
                  const avgCluster = (() => {
                    if (!validClusterSeries || validClusterSeries.length === 0) return null;
                    return Math.round(validClusterSeries.reduce((sum: number, point: any) => sum + Number(point.value || 0), 0) / validClusterSeries.length);
                  })();
                  const avgDeviation = (() => {
                    if (!validClusterSeries || validClusterSeries.length === 0) return null;
                    return Math.round(
                      validClusterSeries.reduce((sum: number, point: any) => {
                        const value = Number(point.value || 0);
                        const target = Number(point.target || 100);
                        return sum + Number(point.deviation || 0);
                      }, 0) / validClusterSeries.length,
                    );
                  })();

                  return (
                    <>
                      {rendered}
                      <View style={{ marginTop: 8 }}>
                        <Text style={{ fontWeight: '600' }}>Cluster points by year</Text>
                        {validClusterSeries.length > 0 ? (
                          <Text style={{ color: '#0f172a', fontSize: 14 }}>{validClusterSeries.map((point: any) => `Grade ${point.label}: ${point.value}`).join(' • ')}</Text>
                        ) : (
                          <Text style={{ color: '#0f172a', fontSize: 14 }}>No valid cluster points recorded yet.</Text>
                        )}
                        <Text style={{ color: '#0f172a', fontSize: 16, marginTop: 8 }}>Average cluster points: {avgCluster === null ? 'N/A' : avgCluster}</Text>
                        <Text style={{ color: '#0f172a', fontSize: 16, marginTop: 4 }}>Average deviation: {avgDeviation === null ? 'N/A' : `${avgDeviation}%`}</Text>
                        {(() => {
                          const requirement = getSelectedCourseClusterRequirement(profile);
                          const deviations = requirement === null ? [] : validClusterSeries
                            .filter((point: any) => Number(point.label) >= 10 && Number(point.label) <= 12)
                            .map((point: any) => ({ label: point.label, deviation: calculateCourseClusterDeviation(Number(point.value), requirement) }))
                            .filter((point: any) => point.deviation !== null);
                          return <>
                            <Text style={{ fontWeight: '600', marginTop: 8 }}>Deviation from chosen course requirement</Text>
                            <Text style={{ color: '#0f172a', fontSize: 14 }}>{requirement === null ? 'Course cluster points are not available.' : deviations.length ? `Required: ${requirement} points • ${deviations.map((item: any) => `Grade ${item.label}: ${item.deviation.points >= 0 ? '+' : ''}${item.deviation.points} points (${item.deviation.percentage >= 0 ? '+' : ''}${item.deviation.percentage}%)`).join(' • ')}` : 'No Grade 10–12 cluster points recorded yet.'}</Text>
                          </>;
                        })()}
                      </View>
                    </>
                  );
                })()}

                {/* Comments */}
                <View style={{ marginTop: 12 }}>
                  <LearnerComments learnerId={selectedLearner?.id} authorRoleOverride="parent" />
                </View>
              </ScrollView>
            ) : null}

            {!performanceOpening && performanceAction === 'viewSubjects' ? (
              <ScrollView style={{ marginTop: 8 }}>
                {(() => {
                  const profile = activeProfile;
                  const subjectSeries = getHistoricalSubjectSeries(selectedLearner, profile, learnerFullMap);
                  console.log('[PARENT_LOG] using data for subject graph', JSON.stringify({
                    selectedLearnerId: selectedLearner?.id,
                    selectedLearnerFullName: selectedLearner?.fullName,
                    profileId: profile?.id || null,
                    subjectSeries,
                  }, null, 2));
                  if (!subjectSeries || subjectSeries.length === 0) return <Text style={{ color: '#6b7280' }}>No subject data is available yet.</Text>;

                  const allSeries = subjectSeries
                    .flatMap((subject: any) => Array.isArray(subject.values) ? subject.values : [])
                    .filter((point: any) => Number.isFinite(Number(point?.value)) && Number.isFinite(Number(point?.target)) && Number(point.target) > 0);

                  const maxValue = allSeries.length
                    ? Math.max(100, ...allSeries.map((point: any) => Math.max(Number(point.value || 0), Number(point.target || 0))))
                    : 100;

                  return subjectSeries.map((subject: any, index: number) => {
                    const visibleValues = (Array.isArray(subject.values) ? subject.values : [])
                      .map((point: any) => ({
                        label: point.label,
                        value: Number(point.value),
                        target: Number(point.target),
                      }))
                      .filter((point: any) => Number.isFinite(point.value) && Number.isFinite(point.target) && point.target > 0);

                    const deviations = visibleValues.map((point: any) => {
                      const target = Number(point.target);
                      const value = Number(point.value);
                      if (!Number.isFinite(target) || target <= 0) return null;
                      if (!Number.isFinite(value)) return null;
                      return {
                        label: point.label,
                        deviation: Number(Math.round((calculateDeviationPercentage(value, target) || 0) * 100) / 100),
                      };
                    }).filter((item: any) => item !== null);

                    const averageDeviation = deviations.length
                      ? Math.round(
                          deviations.reduce((sum: number, item: any) => sum + Number(item.deviation || 0), 0) / deviations.length,
                        )
                      : null;

                    return (
                      <View key={`${subject.label}-${index}`} style={{ marginBottom: 12 }}>
                        <Text style={{ fontWeight: '700', marginBottom: 6 }}>{subject.label}</Text>
                        {visibleValues.length > 0 ? renderLineChart(visibleValues, '#bfdbfe', '#2563eb', maxValue) : <Text style={{ color: '#0f172a', fontSize: 14 }}>No valid marks or targets to plot yet.</Text>}
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ fontWeight: '600' }}>Annual deviation</Text>
                          {deviations.length > 0 ? (
                            <Text style={{ color: '#0f172a', fontSize: 14 }}>
                              {deviations.map((item: any) => `Grade ${item.label}: ${item.deviation}%`).join(' • ')}
                            </Text>
                          ) : (
                            <Text style={{ color: '#0f172a', fontSize: 14 }}>No deviation recorded — no target or achieved mark set for this subject yet.</Text>
                          )}
                          <Text style={{ color: '#0f172a', fontSize: 14, marginTop: 4 }}>Average deviation: {averageDeviation === null ? 'N/A' : `${averageDeviation}%`}</Text>
                        </View>
                      </View>
                    );
                  });
                })()}
              </ScrollView>
            ) : null}

            {!performanceOpening && performanceAction === 'viewEPortfolio' ? (
              <ScrollView style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: '700', marginBottom: 8 }}>E-portfolio files</Text>
                {learnerDocuments.length === 0 ? <Text style={{ color: '#6b7280' }}>No e-portfolio files are linked to this learner yet.</Text> : (
                  learnerDocuments.map((resource) => (
                    <View key={resource.id} style={{ marginBottom: 10, padding: 8, borderWidth: 1, borderColor: '#eef2ff', borderRadius: 8 }}>
                      <Text style={{ fontWeight: '700' }}>{resource.title || resource.fileName}</Text>
                      <Text style={{ color: '#6b7280', marginBottom: 6 }}>{resource.fileName} • {resource.status}</Text>
                      <TouchableOpacity style={{ padding: 8, backgroundColor: '#eef2ff', borderRadius: 6 }} onPress={() => void openDocument(resource)}>
                        <Text style={{ color: '#1d4ed8', fontWeight: '700' }}>Open</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            ) : null}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity onPress={resetPerformanceModal} style={{ padding: 8 }}>
                <Text style={{ color: '#1d4ed8', fontWeight: '700' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18, flex: 1 },
  sectionTitle: { fontWeight: '800', marginBottom: 8 },
  linkedLearnersScroll: { flex: 1, minHeight: 260 },
  linkedLearnersContent: { paddingBottom: 140 },
  learnerRow: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
  learnerText: { fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { padding: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, backgroundColor: '#f8fafc' },
  chartCard: { borderWidth: 1, borderColor: '#dbeafe', borderRadius: 8, padding: 8, backgroundColor: '#fff' },
  chartLegendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  chartLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartLegendSwatch: { width: 12, height: 12, borderRadius: 3, marginRight: 6 },
  chartLegendText: { fontSize: 12 },
  chartAxisLabel: { fontSize: 12, color: '#0f172a' },
});

// Helper chart functions: replicate from TeacherHomeScreen
const GRADE_AXIS = [7, 8, 9, 10, 11, 12] as const;

import calculateHistoricalClusterSeries, { calculateCourseClusterDeviation, calculateDeviationPercentage, getSelectedCourseClusterRequirement } from '../../utils/cluster';

function getHistoricalClusterSeries(learner: any, profile: any, learnerMap?: Record<string, any>) {
  if (!learner?.id) return [];
  const activeProfile = profile && profile.id === learner.id ? profile : null;
  const cached = learnerMap && learnerMap[learner.id] && learnerMap[learner.id].id === learner.id ? learnerMap[learner.id] : null;
  const effectiveProfile = activeProfile || cached || null;
  const subjects = (effectiveProfile && effectiveProfile.selectedSubjects) || [];
  const currentCluster = typeof effectiveProfile?.targetClusterPoints !== 'undefined' ? Number(effectiveProfile.targetClusterPoints) : undefined;
  const series = calculateHistoricalClusterSeries(learner, effectiveProfile, subjects, currentCluster);
  return series;
}

function resolveSelectedSubjects(profile: any, learnerMap?: Record<string, any>, learnerId?: string) {
  let source = profile && profile.id === learnerId ? profile : (learnerMap && learnerId ? learnerMap[learnerId] : null) || null;
  if (!source && learnerMap && learnerId) {
    source = learnerMap[learnerId] || null;
  }

  const historicalSubjects = Array.isArray(source?.historicalSelectedSubjects) ? source.historicalSelectedSubjects : [];
  let selectedSubjects = Array.isArray(source?.selectedSubjects) ? source.selectedSubjects : [];
  if ((!selectedSubjects || selectedSubjects.length === 0) && source && source.supportProfile) {
    try {
      const parsed = typeof source.supportProfile === 'string' ? JSON.parse(source.supportProfile) : source.supportProfile;
      if (parsed && Array.isArray(parsed.selectedSubjects)) {
        selectedSubjects = parsed.selectedSubjects;
      }
    } catch (e) {
      // ignore
    }
  }

  return [...historicalSubjects, ...((Array.isArray(selectedSubjects) ? selectedSubjects : []))];
}

function getHistoricalSubjectSeries(learner: any, profile: any, learnerMap?: Record<string, any>) {
  const selectedSubjects = resolveSelectedSubjects(profile, learnerMap, learner?.id);
  if (!Array.isArray(selectedSubjects) || selectedSubjects.length === 0) return [];

  const currentGrade = Number(String(learner?.gradeLevel || '').replace(/\D/g, '')) || 7;
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
      const normalized = {
        id: subject?.id || undefined,
        name: subject?.name || subject?.code || 'Unnamed subject',
        code: subject?.code || undefined,
        history: filteredHistory,
        targetMarks: Number.isFinite(Number(subject?.targetMarks ?? subject?.targetMark)) ? Number(subject.targetMarks ?? subject.targetMark) : null,
        marksScored: Number.isFinite(Number(subject?.marksScored)) ? Number(subject.marksScored) : null,
      };

      if (!existing) {
        subjectMap.set(key, normalized);
        return;
      }

      existing.history = collapseHistoryByGrade([...existing.history, ...normalized.history]);
      if (normalized.targetMarks !== null && (existing.targetMarks === null || normalized.targetMarks > 0)) {
        existing.targetMarks = normalized.targetMarks;
      }
      if (normalized.marksScored !== null) {
        existing.marksScored = normalized.marksScored;
      }
    });
  };

  selectedSubjects.forEach((subject: any) => {
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
    rawSubjects: selectedSubjects.map((subject: any) => ({
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
        const entry = history.find((h: any) => String(h.label) === String(grade));
        const targetMark = Number(
          Number.isFinite(Number(entry?.target)) ? Number(entry.target) :
            (grade === currentGrade ? (Number.isFinite(Number(subject.targetMarks)) ? Number(subject.targetMarks) : 0) : (subject.targetMarks ?? 0)),
        );
        const achieved = Number.isFinite(Number(entry?.value)) ? Number(entry.value) :
          (grade === currentGrade && Number.isFinite(Number(subject.marksScored)) ? Number(subject.marksScored) : NaN);

        if (!Number.isFinite(targetMark) || targetMark <= 0 || !Number.isFinite(achieved)) {
          return null;
        }

        return { label: String(grade), value: achieved, target: targetMark };
      })
      .filter((point): point is { label: string; value: number; target: number } => point !== null);

    if (values.length === 0) return null;
    console.log('[DEBUG_SUBJECT_SERIES_VALUES]', JSON.stringify({
      subject: subject.name,
      currentGrade,
      gradeKeys,
      values,
    }, null, 2));
    return { label: subject.name || subject.code || 'Subject', values };
  }).filter((subject): subject is { label: string; values: Array<{ label: string; value: number; target: number }> } => subject !== null);
}

function renderLineChart(
  series: Array<{ label: string; value: number; target?: number }>,
  targetColor: string,
  valueColor: string,
  maxY: number,
  valueDomain?: { min: number; max: number },
  nationalRequirement?: number | null,
) {
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

  const axisLineY = chartHeight - paddingBottom;

  const gradeToX = (grade: number) => {
    const gradeIndex = axisGrades.indexOf(grade as (typeof axisGrades)[number]);
    const safeIndex = gradeIndex >= 0 ? gradeIndex : 0;
    return paddingLeft + (safeIndex / Math.max(axisGrades.length - 1, 1)) * (chartWidth - paddingLeft - paddingRight);
  };

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
    if (values.length < 2) return null;

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

  const targetSegments = buildSegments(targetPoints);
  const valueSegments = buildSegments(valuePoints);

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
            const labelWidth = 24;
            const safeLeft = Math.min(Math.max(x - labelWidth / 2, 10), chartWidth - labelWidth - 10);
            return (
              <Text
                key={`axis-${grade}`}
                style={[
                  styles.chartAxisLabel,
                  {
                    position: 'absolute',
                    left: safeLeft,
                    width: labelWidth,
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
}
