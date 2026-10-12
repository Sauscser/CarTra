import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { listOrgHierarchies } from '../../graphql/queries';
import { ScopedCbeAnalyticsSection } from './ScopedCbeAnalytics';

type Jurisdiction = { id: string; code: string; name: string };
type ScopeType = 'nation' | 'region' | 'county' | 'subCounty';
type EntityType = ScopeType | 'school';
const jurisdictionLevelStyle = { width: '100%' as const, marginTop: 14 };

type Props = {
  scopeType?: ScopeType;
  scopeCode?: string | null;
  scopeName?: string | null;
  nationCode?: string | null;
};

async function loadJurisdictions(
  client: any,
  nationCode: string,
  entityType: EntityType,
  parentFilter?: { field: string; code: string },
) {
  const items: Jurisdiction[] = [];
  let nextToken: string | null = null;
  do {
    const conditions = [
      { entityType: { eq: entityType } },
      { nationCode: { eq: nationCode } },
      ...(parentFilter ? [{ [parentFilter.field]: { eq: parentFilter.code } }] : []),
    ];
    const result: any = await client.graphql({
      query: listOrgHierarchies,
      variables: { filter: { and: conditions }, limit: 500, nextToken },
    } as any);
    if (result?.errors?.length) {
      throw new Error(result.errors.map((item: any) => item?.message || 'Unknown GraphQL error').join('; '));
    }
    const connection = result?.data?.listOrgHierarchies;
    if (!connection) throw new Error('The organisation hierarchy response was empty.');
    items.push(...(connection.items || [])
      .filter((item: any) => item?.id && item?.code && item?.name)
      .map((item: any) => ({ id: item.id, code: item.code, name: item.name })));
    nextToken = connection.nextToken || null;
  } while (nextToken);
  return items;
}

function JurisdictionChoices({
  title,
  items,
  selectedCode,
  onSelect,
}: {
  title: string;
  items: Jurisdiction[];
  selectedCode: string | null;
  onSelect: (item: Jurisdiction) => void;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: '#263d43', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>{title}</Text>
      {!items.length ? <Text style={{ color: '#6b7280' }}>No matching organisations are available.</Text> : items.map((item) => {
        const selected = selectedCode === item.code;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onSelect(item)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              borderWidth: 1,
              borderColor: selected ? '#176b87' : '#dbe3e5',
              backgroundColor: selected ? '#e8f4f7' : '#fff',
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 16,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: '#176b87', fontSize: 12, fontWeight: '700' }}>{item.code}</Text>
            <Text style={{ color: '#263d43', fontWeight: '600', marginTop: 2 }}>{item.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function CbeJurisdictionAnalytics({
  scopeType = 'nation',
  scopeCode,
  scopeName,
  nationCode,
}: Props) {
  const client = useMemo(() => generateClient(), []);
  const [regions, setRegions] = useState<Jurisdiction[]>([]);
  const [counties, setCounties] = useState<Jurisdiction[]>([]);
  const [subCounties, setSubCounties] = useState<Jurisdiction[]>([]);
  const [schools, setSchools] = useState<Jurisdiction[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Jurisdiction | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<Jurisdiction | null>(null);
  const [selectedSubCounty, setSelectedSubCounty] = useState<Jurisdiction | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<Jurisdiction | null>(null);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCounties, setLoadingCounties] = useState(false);
  const [loadingSubCounties, setLoadingSubCounties] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [notice, setNotice] = useState('');
  const requestRefs = useRef({ regions: 0, counties: 0, subCounties: 0, schools: 0 });
  const rootJurisdiction = useMemo(
    () => scopeCode && scopeName ? { id: `${scopeType}#${scopeCode}`, code: scopeCode, name: scopeName } : null,
    [scopeCode, scopeName, scopeType],
  );
  const activeRegion = scopeType === 'region' ? rootJurisdiction : selectedRegion;
  const activeCounty = scopeType === 'county' ? rootJurisdiction : selectedCounty;
  const activeSubCounty = scopeType === 'subCounty' ? rootJurisdiction : selectedSubCounty;

  useEffect(() => {
    if (scopeType !== 'nation' || !nationCode) {
      setRegions([]);
      setLoadingRegions(false);
      return;
    }
    const requestId = ++requestRefs.current.regions;
    setLoadingRegions(true);
    setNotice('');
    void loadJurisdictions(client, nationCode, 'region')
      .then((items) => {
        if (requestId === requestRefs.current.regions) setRegions(items);
      })
      .catch((error) => {
        console.warn('load national analytics regions failed', error);
        if (requestId === requestRefs.current.regions) setNotice('Could not load regions for this national office.');
      })
      .finally(() => {
        if (requestId === requestRefs.current.regions) setLoadingRegions(false);
      });
    return () => { requestRefs.current.regions += 1; };
  }, [client, nationCode, scopeType]);

  useEffect(() => {
    if (!nationCode || !activeRegion) {
      setCounties([]);
      setLoadingCounties(false);
      return;
    }
    const requestId = ++requestRefs.current.counties;
    setCounties([]);
    setLoadingCounties(true);
    void loadJurisdictions(client, nationCode, 'county', { field: 'regionCode', code: activeRegion.code })
      .then((items) => {
        if (requestId === requestRefs.current.counties) setCounties(items);
      })
      .catch((error) => {
        console.warn('load national analytics counties failed', error);
        if (requestId === requestRefs.current.counties) setNotice('Could not load counties for the selected region.');
      })
      .finally(() => {
        if (requestId === requestRefs.current.counties) setLoadingCounties(false);
      });
    return () => { requestRefs.current.counties += 1; };
  }, [activeRegion, client, nationCode]);

  useEffect(() => {
    if (!nationCode || !activeCounty) {
      setSubCounties([]);
      setLoadingSubCounties(false);
      return;
    }
    const requestId = ++requestRefs.current.subCounties;
    setSubCounties([]);
    setLoadingSubCounties(true);
    void loadJurisdictions(client, nationCode, 'subCounty', { field: 'countyCode', code: activeCounty.code })
      .then((items) => {
        if (requestId === requestRefs.current.subCounties) setSubCounties(items);
      })
      .catch((error) => {
        console.warn('load national analytics sub-counties failed', error);
        if (requestId === requestRefs.current.subCounties) setNotice('Could not load sub-counties for the selected county.');
      })
      .finally(() => {
        if (requestId === requestRefs.current.subCounties) setLoadingSubCounties(false);
      });
    return () => { requestRefs.current.subCounties += 1; };
  }, [activeCounty, client, nationCode]);

  useEffect(() => {
    if (!nationCode || !activeSubCounty) {
      setSchools([]);
      setLoadingSchools(false);
      return;
    }
    const requestId = ++requestRefs.current.schools;
    setSchools([]);
    setLoadingSchools(true);
    void loadJurisdictions(client, nationCode, 'school', { field: 'subCountyCode', code: activeSubCounty.code })
      .then((items) => {
        if (requestId === requestRefs.current.schools) setSchools(items);
      })
      .catch((error) => {
        console.warn('load national analytics schools failed', error);
        if (requestId === requestRefs.current.schools) setNotice('Could not load schools for the selected sub-county.');
      })
      .finally(() => {
        if (requestId === requestRefs.current.schools) setLoadingSchools(false);
      });
    return () => { requestRefs.current.schools += 1; };
  }, [activeSubCounty, client, nationCode]);

  const selectRegion = (region: Jurisdiction) => {
    setSelectedRegion(region);
    setSelectedCounty(null);
    setSelectedSubCounty(null);
    setSelectedSchool(null);
    setNotice('');
  };
  const selectCounty = (county: Jurisdiction) => {
    setSelectedCounty(county);
    setSelectedSubCounty(null);
    setSelectedSchool(null);
    setNotice('');
  };
  const selectSubCounty = (subCounty: Jurisdiction) => {
    setSelectedSubCounty(subCounty);
    setSelectedSchool(null);
    setNotice('');
  };

  return (
    <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#dbe3e5', paddingTop: 16 }}>
      <Text style={{ color: '#263d43', fontSize: 22, fontWeight: '800' }}>
        {scopeType === 'nation' ? 'Explore by jurisdiction' : `Explore below ${scopeName || 'your assigned area'}`}
      </Text>
      <Text style={{ color: '#607377', lineHeight: 22, marginTop: 6 }}>
        {scopeType === 'nation'
          ? 'Select a region, then optionally narrow the analysis to a county, sub-county, or school.'
          : 'View your assigned area and select a child jurisdiction to narrow the analysis.'}
      </Text>
      {notice ? <Text style={{ color: '#b91c1c', marginTop: 10 }}>{notice}</Text> : null}
      {scopeType === 'nation' ? loadingRegions ? <Text style={{ color: '#607377', marginTop: 10 }}>Loading regions...</Text> : (
        <JurisdictionChoices title="Regions" items={regions} selectedCode={selectedRegion?.code || null} onSelect={selectRegion} />
      ) : null}
      {activeRegion ? (
        <View style={jurisdictionLevelStyle}>
          <ScopedCbeAnalyticsSection
            scopeType="region"
            scopeCode={activeRegion.code}
            scopeName={activeRegion.name}
            nationCode={nationCode}
            showCumulativeDistribution
          />
          {scopeType !== 'county' && scopeType !== 'subCounty' ? (
            loadingCounties ? <Text style={{ color: '#607377' }}>Loading counties...</Text> : (
              <JurisdictionChoices title={`Counties in ${activeRegion.name}`} items={counties} selectedCode={selectedCounty?.code || null} onSelect={selectCounty} />
            )
          ) : null}
        </View>
      ) : null}
      {activeCounty ? (
        <View style={jurisdictionLevelStyle}>
          <ScopedCbeAnalyticsSection
            scopeType="county"
            scopeCode={activeCounty.code}
            scopeName={activeCounty.name}
            nationCode={nationCode}
            showCumulativeDistribution
          />
          {scopeType !== 'subCounty' ? (
            loadingSubCounties ? <Text style={{ color: '#607377' }}>Loading sub-counties...</Text> : (
              <JurisdictionChoices title={`Sub-counties in ${activeCounty.name}`} items={subCounties} selectedCode={selectedSubCounty?.code || null} onSelect={selectSubCounty} />
            )
          ) : null}
        </View>
      ) : null}
      {activeSubCounty ? (
        <View style={jurisdictionLevelStyle}>
          <ScopedCbeAnalyticsSection
            scopeType="subCounty"
            scopeCode={activeSubCounty.code}
            scopeName={activeSubCounty.name}
            nationCode={nationCode}
            showCumulativeDistribution
          />
          {loadingSchools ? <Text style={{ color: '#607377' }}>Loading schools...</Text> : (
            <JurisdictionChoices title={`Schools in ${activeSubCounty.name}`} items={schools} selectedCode={selectedSchool?.code || null} onSelect={setSelectedSchool} />
          )}
        </View>
      ) : null}
      {selectedSchool ? (
        <View style={jurisdictionLevelStyle}>
          <ScopedCbeAnalyticsSection
            scopeType="school"
            scopeCode={selectedSchool.code}
            scopeName={selectedSchool.name}
            nationCode={nationCode}
            showCumulativeDistribution
          />
        </View>
      ) : null}
    </View>
  );
}
