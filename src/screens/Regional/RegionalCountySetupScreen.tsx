import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { createCountyOfficerProfile, createOrgHierarchy, createUser } from '../../graphql/mutations';
import { listCountyOfficerProfiles, listOrgHierarchies } from '../../graphql/queries';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import SectionCard from '../../components/shared/SectionCard';

type CountyOfficerItem = {
  id: string;
  fullName: string;
  countyCode: string;
  userId: string;
};

type CountyRecord = {
  id: string;
  code: string;
  name: string;
  assignedOfficerEmail?: string | null;
};

type RegionOption = {
  id: string;
  code: string;
  name: string;
  nationCode?: string | null;
  assignedOfficerEmail?: string | null;
};

export default function RegionalCountySetupScreen() {
  return <RegionalCountySetupContent />;
}

export function RegionalCountySetupContent() {
  const client = useMemo(() => generateClient(), []);
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);
  const [selectedRegionCode, setSelectedRegionCode] = useState('');
  const [nationCode, setNationCode] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [countyCode, setCountyCode] = useState('');
  const [countyName, setCountyName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerFullName, setOfficerFullName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [counties, setCounties] = useState<CountyRecord[]>([]);
  const [officers, setOfficers] = useState<CountyOfficerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void loadLinkedRegions();
  }, []);

  const loadLinkedRegions = async () => {
    try {
      setIsLoading(true);
      setNotice('');

      const session = await fetchAuthSession();
      const currentEmail = (session.tokens?.idToken?.payload as { email?: string } | undefined)?.email?.trim().toLowerCase();

      if (!currentEmail) {
        setRegionOptions([]);
        setSelectedRegionCode('');
        setNationCode('');
        setRegionCode('');
        setNotice('No signed-in user email was found.');
        return;
      }

      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: {
            and: [{ entityType: { eq: 'region' } }, { assignedOfficerEmail: { eq: currentEmail } }],
          },
          limit: 50,
        },
      });

      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const items = payload.data?.listOrgHierarchies?.items || [];
      const mappedRegions = items
        .filter((item: any) => Boolean(item?.id && item?.code && item?.name))
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          nationCode: item.nationCode,
          assignedOfficerEmail: item.assignedOfficerEmail,
        }));

      setRegionOptions(mappedRegions);

      const defaultRegion = mappedRegions[0];
      if (defaultRegion) {
        setSelectedRegionCode(defaultRegion.code);
        setNationCode(defaultRegion.nationCode || '');
        setRegionCode(defaultRegion.code);
      } else {
        setSelectedRegionCode('');
        setNationCode('');
        setRegionCode('');
        setNotice('No regions are linked to your account yet.');
      }

      await Promise.all([loadCountiesForRegion(defaultRegion?.code || ''), loadCountyOfficers()]);
    } catch {
      setRegionOptions([]);
      setSelectedRegionCode('');
      setNationCode('');
      setRegionCode('');
      setNotice('Could not load your linked regions.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCountiesForRegion = async (selectedRegion: string) => {
    if (!selectedRegion) {
      setCounties([]);
      return;
    }

    try {
      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: {
            and: [{ entityType: { eq: 'county' } }, { regionCode: { eq: selectedRegion } }],
          },
          limit: 100,
        },
      });

      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const items = payload.data?.listOrgHierarchies?.items || [];
      const mapped = items
        .filter((item: any): item is CountyRecord => Boolean(item?.id && item?.code && item?.name))
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          assignedOfficerEmail: item.assignedOfficerEmail,
        }));

      setCounties(mapped);
    } catch {
      setNotice('Could not load counties right now.');
    }
  };

  const loadCounties = async () => {
    try {
      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: { entityType: { eq: 'county' } },
          limit: 100,
        },
      });

      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const items = payload.data?.listOrgHierarchies?.items || [];
      const mapped = items
        .filter((item: any): item is CountyRecord => Boolean(item?.id && item?.code && item?.name))
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          assignedOfficerEmail: item.assignedOfficerEmail,
        }));

      setCounties(mapped);
    } catch {
      setNotice('Could not load counties right now.');
    }
  };

  const loadCountyOfficers = async () => {
    try {
      const result = await client.graphql({
        query: listCountyOfficerProfiles,
        variables: { limit: 100 },
      });

      const payload = result as { data?: { listCountyOfficerProfiles?: { items?: Array<any> } } };
      const items = payload.data?.listCountyOfficerProfiles?.items || [];
      const mapped = items
        .filter((item: any): item is CountyOfficerItem => Boolean(item?.id && item?.fullName && item?.countyCode && item?.userId))
        .map((item: any) => ({
          id: item.id,
          fullName: item.fullName,
          countyCode: item.countyCode,
          userId: item.userId,
        }));

      setOfficers(mapped);
    } catch {
      setNotice('Could not load county officer profiles right now.');
    }
  };

  const handleRegionSelection = async (regionCodeValue: string) => {
    const region = regionOptions.find((item) => item.code === regionCodeValue);
    if (!region) {
      return;
    }

    setSelectedRegionCode(region.code);
    setNationCode(region.nationCode || '');
    setRegionCode(region.code);
    await loadCountiesForRegion(region.code);
  };

  const handleCreateCounty = async () => {
    if (!nationCode.trim() || !regionCode.trim() || !countyCode.trim() || !countyName.trim() || !officerEmail.trim() || !officerFullName.trim()) {
      setNotice('Please choose a linked region and fill the county and county officer details.');
      return;
    }

    try {
      setIsLoading(true);
      setNotice('');

      const userResponse = await client.graphql({
        query: createUser,
        variables: {
          input: {
            email: officerEmail.trim().toLowerCase(),
            phoneNumber: officerPhone.trim() || null,
            role: 'countyOfficer',
            status: 'active',
            fullName: officerFullName.trim(),
          },
        },
      });

      const userPayload = userResponse as { data?: { createUser?: { id?: string } } };
      const createdUserId = userPayload.data?.createUser?.id;
      if (!createdUserId) {
        throw new Error('County officer user record was not created.');
      }

      await client.graphql({
        query: createCountyOfficerProfile,
        variables: {
          input: {
            userId: createdUserId,
            fullName: officerFullName.trim(),
            nationCode: nationCode.trim().toUpperCase(),
            regionCode: regionCode.trim().toUpperCase(),
            countyCode: countyCode.trim().toUpperCase(),
            assignedSubCounties: [],
          },
        },
      });

      await client.graphql({
        query: createOrgHierarchy,
        variables: {
          input: {
            entityType: 'county',
            code: countyCode.trim().toUpperCase(),
            parentCode: regionCode.trim().toUpperCase(),
            name: countyName.trim(),
            nationCode: nationCode.trim().toUpperCase(),
            regionCode: regionCode.trim().toUpperCase(),
            countyCode: countyCode.trim().toUpperCase(),
            assignedOfficerEmail: officerEmail.trim().toLowerCase(),
            assignedOfficerRole: 'countyOfficer',
            status: 'active',
          },
        },
      });

      setNotice('County record and county officer profile created successfully.');
      setCountyCode('');
      setCountyName('');
      setOfficerEmail('');
      setOfficerFullName('');
      setOfficerPhone('');
      await Promise.all([loadCountiesForRegion(regionCode), loadCountyOfficers()]);
    } catch (error: any) {
      console.error('County create failed:', error);
      const message =
        error?.errors?.[0]?.message ||
        error?.message ||
        'Could not create county record and officer profile.';
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionCard
          title="County Setup"
          subtitle="Create county records and assign county officer profiles."
        >
          <Text style={styles.sectionLabel}>Linked regions</Text>
          {regionOptions.length === 0 ? (
            <Text style={styles.placeholder}>No linked regions found for your account.</Text>
          ) : null}

          {regionOptions.map((region) => (
            <TouchableOpacity
              key={region.id}
              style={[styles.regionOption, selectedRegionCode === region.code && styles.regionOptionSelected]}
              onPress={() => void handleRegionSelection(region.code)}
            >
              <Text style={[styles.regionOptionText, selectedRegionCode === region.code && styles.regionOptionTextSelected]}>
                {region.name}
              </Text>
              <Text style={styles.regionOptionMeta}>{region.code} • {region.nationCode || 'Nation not set'}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.selectedRegionBox}>
            <Text style={styles.selectedRegionLabel}>Selected region</Text>
            <Text style={styles.selectedRegionValue}>{regionCode || 'No region selected'}</Text>
            <Text style={styles.selectedRegionMeta}>Nation: {nationCode || 'Not set'}</Text>
          </View>

          <PrimaryTextInput
            value={countyCode}
            onChangeText={setCountyCode}
            placeholder="County code (e.g. NAT-001-RG-001-CT-001)"
            autoCapitalize="characters"
          />
          <PrimaryTextInput
            value={countyName}
            onChangeText={setCountyName}
            placeholder="County name"
          />
          <PrimaryTextInput
            value={officerFullName}
            onChangeText={setOfficerFullName}
            placeholder="County officer full name"
          />
          <PrimaryTextInput
            value={officerEmail}
            onChangeText={setOfficerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="County officer email"
          />
          <PrimaryTextInput
            value={officerPhone}
            onChangeText={setOfficerPhone}
            keyboardType="phone-pad"
            placeholder="County officer phone (optional)"
          />

          <TouchableOpacity style={styles.button} onPress={handleCreateCounty} disabled={isLoading}>
            <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Create County + County Officer'}</Text>
          </TouchableOpacity>

          {notice ? <Text style={styles.message}>{notice}</Text> : null}
        </SectionCard>

        <SectionCard title="Existing Counties" subtitle="Counties currently visible under this regional office.">
          {counties.length === 0 ? <Text style={styles.placeholder}>No counties found yet.</Text> : null}
          {counties.map((row) => (
            <View key={row.id} style={styles.row}>
              <Text style={styles.rowCode}>{row.code}</Text>
              <Text style={styles.rowName}>{row.name}</Text>
              <Text style={styles.rowMeta}>{row.assignedOfficerEmail || 'No assigned officer email'}</Text>
            </View>
          ))}
        </SectionCard>

        <SectionCard title="Existing County Officer Profiles" subtitle="County officers assigned in this regional scope.">
          {officers.length === 0 ? <Text style={styles.placeholder}>No county officer profiles found yet.</Text> : null}
          {officers.map((officer) => (
            <View key={officer.id} style={styles.row}>
              <Text style={styles.rowName}>{officer.fullName}</Text>
              <Text style={styles.rowCode}>{officer.countyCode}</Text>
              <Text style={styles.rowMeta}>{officer.userId}</Text>
            </View>
          ))}
        </SectionCard>
      </ScrollView>
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
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
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
  placeholder: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  regionOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    marginBottom: 10,
  },
  regionOptionSelected: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  regionOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  regionOptionTextSelected: {
    color: '#1d4ed8',
  },
  regionOptionMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  selectedRegionBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 12,
    marginBottom: 12,
  },
  selectedRegionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedRegionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  selectedRegionMeta: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
  },
  row: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: '#f9fafb',
  },
  rowCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  rowMeta: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 4,
  },
});