import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { createOrgHierarchy, createSubCountyOfficerProfile, createTertiaryInstitutionProfile, createUser } from '../../graphql/mutations';
import { listOrgHierarchies, listSubCountyOfficerProfiles } from '../../graphql/queries';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import SectionCard from '../../components/shared/SectionCard';

type SubCountyOfficerItem = {
  id: string;
  fullName: string;
  subCountyCode: string;
  userId: string;
};

type SubCountyRecord = {
  id: string;
  code: string;
  name: string;
  assignedOfficerEmail?: string | null;
};

type CountyOption = {
  id: string;
  code: string;
  name: string;
  nationCode?: string | null;
  regionCode?: string | null;
  assignedOfficerEmail?: string | null;
};

export default function CountySubCountySetupScreen() {
  return <CountySubCountySetupContent />;
}

export function CountySubCountySetupContent() {
  const client = useMemo(() => generateClient(), []);
  const [countyOptions, setCountyOptions] = useState<CountyOption[]>([]);
  const [selectedCountyCode, setSelectedCountyCode] = useState('');
  const [nationCode, setNationCode] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [countyCode, setCountyCode] = useState('');
  const [subCountyCode, setSubCountyCode] = useState('');
  const [subCountyName, setSubCountyName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerFullName, setOfficerFullName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [tertiaryInstitutionName, setTertiaryInstitutionName] = useState('');
  const [tertiaryInstitutionAdminEmail, setTertiaryInstitutionAdminEmail] = useState('');
  const [savingTertiaryInstitution, setSavingTertiaryInstitution] = useState(false);
  const [tertiaryNotice, setTertiaryNotice] = useState('');
  const [subCounties, setSubCounties] = useState<SubCountyRecord[]>([]);
  const [officers, setOfficers] = useState<SubCountyOfficerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void loadLinkedCounties();
  }, []);

  const loadLinkedCounties = async () => {
    try {
      setIsLoading(true);
      setNotice('');

      const session = await fetchAuthSession();
      const currentEmail = (session.tokens?.idToken?.payload as { email?: string } | undefined)?.email?.trim().toLowerCase();

      if (!currentEmail) {
        setCountyOptions([]);
        setSelectedCountyCode('');
        setNationCode('');
        setRegionCode('');
        setCountyCode('');
        setNotice('No signed-in user email was found.');
        return;
      }

      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: {
            and: [{ entityType: { eq: 'county' } }, { assignedOfficerEmail: { eq: currentEmail } }],
          },
          limit: 50,
        },
      });

      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const items = payload.data?.listOrgHierarchies?.items || [];
      const mappedCounties = items
        .filter((item: any) => Boolean(item?.id && item?.code && item?.name))
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          nationCode: item.nationCode,
          regionCode: item.regionCode,
          assignedOfficerEmail: item.assignedOfficerEmail,
        }));

      setCountyOptions(mappedCounties);

      const defaultCounty = mappedCounties[0];
      if (defaultCounty) {
        setSelectedCountyCode(defaultCounty.code);
        setNationCode(defaultCounty.nationCode || '');
        setRegionCode(defaultCounty.regionCode || '');
        setCountyCode(defaultCounty.code);
      } else {
        setSelectedCountyCode('');
        setNationCode('');
        setRegionCode('');
        setCountyCode('');
        setNotice('No county is linked to your account yet.');
      }

      await Promise.all([loadSubCountiesForCounty(defaultCounty?.code || ''), loadSubCountyOfficers()]);
    } catch {
      setCountyOptions([]);
      setSelectedCountyCode('');
      setNationCode('');
      setRegionCode('');
      setCountyCode('');
      setNotice('Could not load your linked counties.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubCountiesForCounty = async (selectedCounty: string) => {
    if (!selectedCounty) {
      setSubCounties([]);
      return;
    }

    try {
      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: {
            and: [{ entityType: { eq: 'subCounty' } }, { countyCode: { eq: selectedCounty } }],
          },
          limit: 100,
        },
      });

      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const items = payload.data?.listOrgHierarchies?.items || [];
      const mapped = items
        .filter((item: any): item is SubCountyRecord => Boolean(item?.id && item?.code && item?.name))
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          assignedOfficerEmail: item.assignedOfficerEmail,
        }));

      setSubCounties(mapped);
    } catch {
      setNotice('Could not load sub-counties right now.');
    }
  };

  const loadSubCountyOfficers = async () => {
    try {
      const result = await client.graphql({
        query: listSubCountyOfficerProfiles,
        variables: { limit: 100 },
      });

      const payload = result as { data?: { listSubCountyOfficerProfiles?: { items?: Array<any> } } };
      const items = payload.data?.listSubCountyOfficerProfiles?.items || [];
      const mapped = items
        .filter((item: any): item is SubCountyOfficerItem => Boolean(item?.id && item?.fullName && item?.subCountyCode && item?.userId))
        .map((item: any) => ({
          id: item.id,
          fullName: item.fullName,
          subCountyCode: item.subCountyCode,
          userId: item.userId,
        }));

      setOfficers(mapped);
    } catch {
      setNotice('Could not load sub-county officer profiles right now.');
    }
  };

  const handleCountySelection = async (countyCodeValue: string) => {
    const county = countyOptions.find((item) => item.code === countyCodeValue);
    if (!county) {
      return;
    }

    setSelectedCountyCode(county.code);
    setNationCode(county.nationCode || '');
    setRegionCode(county.regionCode || '');
    setCountyCode(county.code);
    await loadSubCountiesForCounty(county.code);
  };

  const handleCreateTertiaryInstitution = async () => {
    if (!nationCode.trim() || !regionCode.trim() || !countyCode.trim() || !tertiaryInstitutionName.trim() || !tertiaryInstitutionAdminEmail.trim()) {
      const validationMessage = 'Please choose a linked county, provide the institution name, and enter the institution admin email.';
      setTertiaryNotice(validationMessage);
      Alert.alert('Missing details', validationMessage);
      return;
    }

    try {
      setSavingTertiaryInstitution(true);
      setTertiaryNotice('');

      const institutionAdminEmail = tertiaryInstitutionAdminEmail.trim().toLowerCase();

      await client.graphql({
        query: createTertiaryInstitutionProfile,
        variables: {
          input: {
            userId: institutionAdminEmail,
            institutionName: tertiaryInstitutionName.trim(),
            nationCode: nationCode.trim().toUpperCase(),
            regionCode: regionCode.trim().toUpperCase(),
            countyCode: countyCode.trim().toUpperCase(),
          },
        },
      });

      const successMessage = 'Tertiary institution registered successfully. The admin can now add the courses it offers from the Tertiary Office screen.';
      setTertiaryNotice(successMessage);
      Alert.alert('Success', successMessage);
      setTertiaryInstitutionName('');
      setTertiaryInstitutionAdminEmail('');
    } catch (error: any) {
      console.error('Tertiary institution creation failed:', error);
      const message = error?.errors?.[0]?.message || error?.message || 'Could not register the tertiary institution.';
      setTertiaryNotice(message);
      Alert.alert('Registration failed', message);
    } finally {
      setSavingTertiaryInstitution(false);
    }
  };

  const handleCreateSubCounty = async () => {
    if (!nationCode.trim() || !regionCode.trim() || !countyCode.trim() || !subCountyCode.trim() || !subCountyName.trim() || !officerEmail.trim() || !officerFullName.trim()) {
      setNotice('Please choose a linked county and fill the sub-county and officer details.');
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
            role: 'subCountyOfficer',
            status: 'active',
            fullName: officerFullName.trim(),
          },
        },
      });

      const userPayload = userResponse as { data?: { createUser?: { id?: string } } };
      const createdUserId = userPayload.data?.createUser?.id;
      if (!createdUserId) {
        throw new Error('Sub-county officer user record was not created.');
      }

      await client.graphql({
        query: createSubCountyOfficerProfile,
        variables: {
          input: {
            userId: createdUserId,
            fullName: officerFullName.trim(),
            nationCode: nationCode.trim().toUpperCase(),
            regionCode: regionCode.trim().toUpperCase(),
            countyCode: countyCode.trim().toUpperCase(),
            subCountyCode: subCountyCode.trim().toUpperCase(),
            assignedSchools: [],
          },
        },
      });

      await client.graphql({
        query: createOrgHierarchy,
        variables: {
          input: {
            entityType: 'subCounty',
            code: subCountyCode.trim().toUpperCase(),
            parentCode: countyCode.trim().toUpperCase(),
            name: subCountyName.trim(),
            nationCode: nationCode.trim().toUpperCase(),
            regionCode: regionCode.trim().toUpperCase(),
            countyCode: countyCode.trim().toUpperCase(),
            subCountyCode: subCountyCode.trim().toUpperCase(),
            assignedOfficerEmail: officerEmail.trim().toLowerCase(),
            assignedOfficerRole: 'subCountyOfficer',
            status: 'active',
          },
        },
      });

      setNotice('Sub-county record and sub-county officer profile created successfully.');
      setSubCountyCode('');
      setSubCountyName('');
      setOfficerEmail('');
      setOfficerFullName('');
      setOfficerPhone('');
      await Promise.all([loadSubCountiesForCounty(countyCode), loadSubCountyOfficers()]);
    } catch (error: any) {
      console.error('Sub-county create failed:', error);
      const message = error?.errors?.[0]?.message || error?.message || 'Could not create sub-county record and officer profile.';
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SectionCard
        title="County Office"
        subtitle="Create sub-county records and assign sub-county officer profiles."
      >
        <Text style={styles.sectionLabel}>Linked counties</Text>
        {countyOptions.length === 0 ? (
          <Text style={styles.placeholder}>No linked counties found for your account.</Text>
        ) : null}

        {countyOptions.map((county) => (
          <TouchableOpacity
            key={county.id}
            style={[styles.countyOption, selectedCountyCode === county.code && styles.countyOptionSelected]}
            onPress={() => void handleCountySelection(county.code)}
          >
            <Text style={[styles.countyOptionText, selectedCountyCode === county.code && styles.countyOptionTextSelected]}>
              {county.name}
            </Text>
            <Text style={styles.countyOptionMeta}>{county.code} • {county.regionCode || 'Region not set'}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.selectedCountyBox}>
          <Text style={styles.selectedCountyLabel}>Selected county</Text>
          <Text style={styles.selectedCountyValue}>{countyCode || 'No county selected'}</Text>
          <Text style={styles.selectedCountyMeta}>Region: {regionCode || 'Not set'}</Text>
          <Text style={styles.selectedCountyMeta}>Nation: {nationCode || 'Not set'}</Text>
        </View>

        <PrimaryTextInput
          value={subCountyCode}
          onChangeText={setSubCountyCode}
          placeholder="Sub-county code (e.g. NAT-001-RG-001-CT-001-SC-001)"
          autoCapitalize="characters"
        />
        <PrimaryTextInput
          value={subCountyName}
          onChangeText={setSubCountyName}
          placeholder="Sub-county name"
        />
        <PrimaryTextInput
          value={officerFullName}
          onChangeText={setOfficerFullName}
          placeholder="Sub-county officer full name"
        />
        <PrimaryTextInput
          value={officerEmail}
          onChangeText={setOfficerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Sub-county officer email"
        />
        <PrimaryTextInput
          value={officerPhone}
          onChangeText={setOfficerPhone}
          keyboardType="phone-pad"
          placeholder="Sub-county officer phone (optional)"
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateSubCounty} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Create Sub-county + Sub-county Officer'}</Text>
        </TouchableOpacity>

        {notice ? <Text style={styles.message}>{notice}</Text> : null}
      </SectionCard>

      <SectionCard title="Register tertiary institution" subtitle="The county director can register the institution here so the admin can add the courses it offers later.">
        <PrimaryTextInput
          value={tertiaryInstitutionName}
          onChangeText={setTertiaryInstitutionName}
          placeholder="Tertiary institution name"
        />
        <PrimaryTextInput
          value={tertiaryInstitutionAdminEmail}
          onChangeText={setTertiaryInstitutionAdminEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Institution admin email"
        />

        <View style={styles.selectedCountyBox}>
          <Text style={styles.selectedCountyLabel}>Registration context</Text>
          <Text style={styles.selectedCountyValue}>{countyCode || 'No county selected'}</Text>
          <Text style={styles.selectedCountyMeta}>Region: {regionCode || 'Not set'}</Text>
          <Text style={styles.selectedCountyMeta}>Nation: {nationCode || 'Not set'}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCreateTertiaryInstitution} disabled={savingTertiaryInstitution}>
          <Text style={styles.buttonText}>{savingTertiaryInstitution ? 'Saving...' : 'Create tertiary institution'}</Text>
        </TouchableOpacity>

        {tertiaryNotice ? <Text style={styles.message}>{tertiaryNotice}</Text> : null}
      </SectionCard>

      <SectionCard title="Existing Sub-counties">
        {subCounties.length === 0 ? <Text style={styles.placeholder}>No sub-counties found yet.</Text> : null}
        {subCounties.map((row) => (
          <View key={row.id} style={styles.row}>
            <Text style={styles.rowCode}>{row.code}</Text>
            <Text style={styles.rowName}>{row.name}</Text>
            <Text style={styles.rowMeta}>{row.assignedOfficerEmail || 'No assigned officer email'}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Existing Sub-county Officer Profiles">
        {officers.length === 0 ? <Text style={styles.placeholder}>No sub-county officer profiles found yet.</Text> : null}
        {officers.map((officer) => (
          <View key={officer.id} style={styles.row}>
            <Text style={styles.rowName}>{officer.fullName}</Text>
            <Text style={styles.rowCode}>{officer.subCountyCode}</Text>
            <Text style={styles.rowMeta}>{officer.userId}</Text>
          </View>
        ))}
      </SectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  countyOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    marginBottom: 10,
  },
  countyOptionSelected: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  countyOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  countyOptionTextSelected: {
    color: '#1d4ed8',
  },
  countyOptionMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  selectedCountyBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 12,
    marginBottom: 12,
  },
  selectedCountyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedCountyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  selectedCountyMeta: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
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