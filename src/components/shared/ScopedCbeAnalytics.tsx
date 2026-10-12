import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { learnerSubjectPerformancesByNationGrade, listLearnerProfiles, listOrgHierarchies } from '../../graphql/queries';
import { loadSupportSubjectIds } from '../../hooks/useSupportSubjectFilter';
import {
  buildHistoricalPerformanceFactsFromProfiles,
  buildNationalCbeRollupsFromFacts,
} from '../../utils/nationalCbeAnalytics';
import { hasValidCbeAchievementRanges, parseCbeAchievementRanges } from '../../utils/cluster';
import NationalCbeAnalytics from './NationalCbeAnalytics';
import SectionCard from './SectionCard';

type ScopeType = 'school' | 'subCounty' | 'county' | 'region';
type ScopeField = 'schoolCode' | 'subCountyCode' | 'countyCode' | 'regionCode';

type Props = {
  scopeType: ScopeType;
  scopeCode?: string | null;
  scopeName?: string | null;
  nationCode?: string | null;
  showCumulativeDistribution?: boolean;
};

const SCOPE_FIELDS: Record<ScopeType, ScopeField> = {
  school: 'schoolCode',
  subCounty: 'subCountyCode',
  county: 'countyCode',
  region: 'regionCode',
};

async function loadPages<T>(
  client: any,
  query: string,
  connectionName: string,
  variables: Record<string, unknown>,
): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | null = null;
  do {
    const result: any = await client.graphql({
      query,
      variables: { ...variables, limit: 500, nextToken },
    } as any);
    if (result?.errors?.length) {
      throw new Error(result.errors.map((item: any) => item?.message || 'Unknown GraphQL error').join('; '));
    }
    const connection = result?.data?.[connectionName];
    if (!connection) throw new Error(`The ${connectionName} response was empty.`);
    items.push(...(connection?.items || []));
    nextToken = connection?.nextToken || null;
  } while (nextToken);
  return items;
}

function ScopedCbeAnalytics({ scopeType, scopeCode, scopeName, nationCode, showCumulativeDistribution }: Props) {
  const client = useMemo(() => generateClient(), []);
  const [rollups, setRollups] = useState<any[]>([]);
  const [supportSubjectIds, setSupportSubjectIds] = useState<ReadonlySet<string>>(new Set());
  const [achievementRangeValue, setAchievementRangeValue] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const requestRef = useRef(0);
  const scopeField = SCOPE_FIELDS[scopeType];

  useEffect(() => {
    if (!scopeCode || !nationCode) return;
    const requestId = ++requestRef.current;
    const grades = new Set([7, 8, 9, 10, 11, 12]);
    const scopeFilter = {
      and: [
        { nationCode: { eq: nationCode } },
        { [scopeField]: { eq: scopeCode } },
      ],
    };

    const load = async () => {
      setLoading(true);
      setNotice('');
      setRollups([]);
      try {
        const [annualFacts, profiles, supportIds, nations] = await Promise.all([
          Promise.all(Array.from(grades, async (grade) => loadPages<any>(
            client,
            learnerSubjectPerformancesByNationGrade,
            'learnerSubjectPerformancesByNationGrade',
            {
              nationGradeKey: `${nationCode.trim().toUpperCase()}#${grade}`,
              filter: scopeFilter,
            },
          ))).then((pages) => pages.flat()),
          loadPages<any>(client, listLearnerProfiles, 'listLearnerProfiles', { filter: scopeFilter }),
          loadSupportSubjectIds(),
          loadPages<any>(client, listOrgHierarchies, 'listOrgHierarchies', {
            filter: {
              and: [
                { entityType: { eq: 'nation' } },
                { code: { eq: nationCode } },
              ],
            },
          }),
        ]);
        const annualFactKeys = new Set(annualFacts
          .filter((fact) => {
            const cycle = String(fact?.termOrCycle || '').replace(/[^a-z]/gi, '').toLowerCase();
            const achieved = Number(fact?.achievedMark);
            return fact?.subjectId &&
              fact.subjectId !== '__ANNUAL_CLUSTER__' &&
              cycle === 'endofyear' &&
              grades.has(Number(fact.gradeLevel)) &&
              Number.isFinite(achieved) &&
              achieved >= 0;
          })
          .map((fact) => `${fact.learnerId}#${fact.gradeLevel}#${fact.subjectId}`));
        const profileFacts = buildHistoricalPerformanceFactsFromProfiles(profiles, grades)
          .filter((fact) => !annualFactKeys.has(`${fact.learnerId}#${fact.gradeLevel}#${fact.subjectId}`));
        const nextRollups = [
          ...buildNationalCbeRollupsFromFacts(annualFacts),
          ...buildNationalCbeRollupsFromFacts(profileFacts),
        ];
        if (requestId !== requestRef.current) return;
        setRollups(nextRollups);
        setSupportSubjectIds(supportIds);
        let nationMetadata = nations[0]?.metadata ?? null;
        if (typeof nationMetadata === 'string') nationMetadata = JSON.parse(nationMetadata);
        setAchievementRangeValue((nationMetadata as any)?.cbeAchievementRanges ?? null);
      } catch (error) {
        console.warn(`load ${scopeType} CBE analytics failed`, error);
        if (requestId === requestRef.current) {
          setNotice('Could not load complete learner data for this jurisdiction. Refresh before interpreting these statistics.');
        }
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    };

    void load();
    return () => {
      requestRef.current += 1;
    };
  }, [client, nationCode, refreshKey, scopeCode, scopeField, scopeType]);

  return (
    <View>
      {loading ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
          <ActivityIndicator size="small" color="#176b87" />
          <Text style={{ marginLeft: 10, color: '#374151' }}>Loading annual learner performance records...</Text>
        </View>
      ) : null}
      {notice ? <Text style={{ color: '#b91c1c', marginVertical: 8 }}>{notice}</Text> : null}
      {!loading && !notice && rollups.length ? (
        <NationalCbeAnalytics
          rollups={rollups}
          supportSubjectIds={supportSubjectIds}
          ranges={parseCbeAchievementRanges(achievementRangeValue)}
          rangesConfigured={hasValidCbeAchievementRanges(achievementRangeValue)}
          showCumulativeDistribution={showCumulativeDistribution}
        />
      ) : null}
      {!loading && !notice && !rollups.length ? (
        <Text style={{ color: '#6b7280', marginVertical: 8 }}>
          No annual end-of-year performance data is available for {scopeName || 'this jurisdiction'} yet.
        </Text>
      ) : null}
      {!loading ? (
        <Text
          onPress={() => setRefreshKey((current) => current + 1)}
          accessibilityRole="button"
          style={{ color: '#176b87', fontWeight: '700', marginTop: 8 }}
        >
          {notice ? 'Retry analytics' : 'Refresh analytics'}
        </Text>
      ) : null}
    </View>
  );
}

export function ScopedCbeAnalyticsSection(props: Props) {
  const [expanded, setExpanded] = useState(false);
  const label = props.scopeType === 'school' ? 'School' : props.scopeType === 'subCounty'
    ? 'Sub-county' : props.scopeType === 'county' ? 'County' : 'Regional';

  return (
    <SectionCard
      title={`${label} CBE analytics`}
      subtitle={`Grade-level analysis for learners in ${props.scopeName || `your ${label.toLowerCase()}`}.`}
      defaultExpanded={false}
      expanded={expanded}
      onToggle={setExpanded}
    >
      {expanded ? (
        props.scopeCode && props.nationCode ? (
          <ScopedCbeAnalytics {...props} />
        ) : (
          <Text style={{ color: '#b91c1c' }}>The assigned {label.toLowerCase()} and nation must be available before analytics can be loaded.</Text>
        )
      ) : null}
    </SectionCard>
  );
}
