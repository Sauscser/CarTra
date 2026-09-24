import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { createOrgHierarchy, createPrincipalProfile, createUser } from '../../graphql/mutations';
import { listOrgHierarchies, listPrincipalProfiles } from '../../graphql/queries';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import SectionCard from '../../components/shared/SectionCard';

type PrincipalItem = {
  id: string;
  fullName: string;
  schoolCode: string;
  userId: string;
};

type SchoolRecord = {
  id: string;
  code: string;
  name: string;
  assignedOfficerEmail?: string | null;
};

type SubCountyOption = {
  id: string;
  code: string;
  name: string;
  nationCode?: string | null;
  regionCode?: string | null;
  countyCode?: string | null;
  assignedOfficerEmail?: string | null;
};

export default function SubCountySchoolSetupScreen() {
  return <SubCountySchoolSetupContent />;
}

export function SubCountySchoolSetupContent() {
  const client = useMemo(() => generateClient(), []);
  const [subCountyOptions, setSubCountyOptions] = useState<SubCountyOption[]>([]);
  const [selectedSubCountyCode, setSelectedSubCountyCode] = useState('');
  const [nationCode, setNationCode] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [countyCode, setCountyCode] = useState('');
  const [subCountyCode, setSubCountyCode] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerFullName, setOfficerFullName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [tscNumber, setTscNumber] = useState('');
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [principals, setPrincipals] = useState<PrincipalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void loadLinkedSubCounties();
  }, []);

  const loadLinkedSubCounties = async () => {
    try {
      setIsLoading(true);
      setNotice('');

      const session = await fetchAuthSession();
      const currentEmail = (session.tokens?.idToken?.payload as { email?: string } | undefined)?.email?.trim().toLowerCase();

      if (!currentEmail) {
        setSubCountyOptions([]);
        setSelectedSubCountyCode('');
        setNationCode('');
        setRegionCode('');
        setCountyCode('');
        setSubCountyCode('');
        setNotice('No signed-in user email was found.');
        return;
      }

      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: {
            and: [{ entityType: { eq: 'subCounty' } }, { assignedOfficerEmail: { eq: currentEmail } }],
          },
          limit: 50,
        },
      });

      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const items = payload.data?.listOrgHierarchies?.items || [];
      const mappedSubCounties = items
        .filter((item: any) => Boolean(item?.id && item?.code && item?.name))
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          nationCode: item.nationCode,
          regionCode: item.regionCode,
          countyCode: item.countyCode,
          assignedOfficerEmail: item.assignedOfficerEmail,
        }));

      setSubCountyOptions(mappedSubCounties);

      const defaultSubCounty = mappedSubCounties[0];
      if (defaultSubCounty) {
        setSelectedSubCountyCode(defaultSubCounty.code);
        setNationCode(defaultSubCounty.nationCode || '');
        setRegionCode(defaultSubCounty.regionCode || '');
        setCountyCode(defaultSubCounty.countyCode || '');
        setSubCountyCode(defaultSubCounty.code);
      } else {
        setSelectedSubCountyCode('');
        setNationCode('');
        setRegionCode('');
        setCountyCode('');
        setSubCountyCode('');
        setNotice('No sub-counties are linked to your account yet.');
      }

      await Promise.all([loadSchoolsForSubCounty(defaultSubCounty?.code || ''), loadPrincipals()]);
    } catch {
      setSubCountyOptions([]);
      setSelectedSubCountyCode('');
      setNationCode('');
      setRegionCode('');
      setCountyCode('');
      setSubCountyCode('');
      setNotice('Could not load your linked sub-counties.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchoolsForSubCounty = async (selectedSubCounty: string) => {
    if (!selectedSubCounty) {
      setSchools([]);
      return;
    }

    try {
      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: {
            and: [{ entityType: { eq: 'school' } }, { subCountyCode: { eq: selectedSubCounty } }],
          },
          limit: 100,
        },
      });

      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const items = payload.data?.listOrgHierarchies?.items || [];
      const mapped = items
        .filter((item: any): item is SchoolRecord => Boolean(item?.id && item?.code && item?.name))
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          assignedOfficerEmail: item.assignedOfficerEmail,
        }));

      setSchools(mapped);
    } catch {
      setNotice('Could not load schools right now.');
    }
  };

  const loadPrincipals = async () => {
    try {
      const result = await client.graphql({
        query: listPrincipalProfiles,
        variables: { limit: 100 },
      });

      const payload = result as { data?: { listPrincipalProfiles?: { items?: Array<any> } } };
      const items = payload.data?.listPrincipalProfiles?.items || [];
      const mapped = items
        .filter((item: any): item is PrincipalItem => Boolean(item?.id && item?.fullName && item?.schoolCode && item?.userId))
        .map((item: any) => ({
          id: item.id,
          fullName: item.fullName,
          schoolCode: item.schoolCode,
          userId: item.userId,
        }));

      setPrincipals(mapped);
    } catch {
      setNotice('Could not load principal profiles right now.');
    }
  };

  const handleSubCountySelection = async (subCountyCodeValue: string) => {
    const subCounty = subCountyOptions.find((item) => item.code === subCountyCodeValue);
    if (!subCounty) {
      return;
    }

    setSelectedSubCountyCode(subCounty.code);
    setNationCode(subCounty.nationCode || '');
    setRegionCode(subCounty.regionCode || '');
    setCountyCode(subCounty.countyCode || '');
    setSubCountyCode(subCounty.code);
    await loadSchoolsForSubCounty(subCounty.code);
  };

  const handleCreateSchool = async () => {
    if (
      !nationCode.trim() ||
      !regionCode.trim() ||
      !countyCode.trim() ||
      !subCountyCode.trim() ||
      !schoolCode.trim() ||
      !schoolName.trim() ||
      !officerEmail.trim() ||
      !officerFullName.trim()
    ) {
      setNotice('Please choose a linked sub-county and fill the school and principal details.');
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
            role: 'principal',
            status: 'active',
            fullName: officerFullName.trim(),
          },
        },
      });

      const userPayload = userResponse as { data?: { createUser?: { id?: string } } };
      const createdUserId = userPayload.data?.createUser?.id;
      if (!createdUserId) {
        throw new Error('Principal user record was not created.');
      }

      await client.graphql({
        query: createPrincipalProfile,
        variables: {
          input: {
            userId: createdUserId,
            fullName: officerFullName.trim(),
            nationCode: nationCode.trim().toUpperCase(),
            regionCode: regionCode.trim().toUpperCase(),
            countyCode: countyCode.trim().toUpperCase(),
            subCountyCode: subCountyCode.trim().toUpperCase(),
            schoolCode: schoolCode.trim().toUpperCase(),
            schoolName: schoolName.trim(),
            tscNumber: tscNumber.trim() || null,
          },
        },
      });

      await client.graphql({
        query: createOrgHierarchy,
        variables: {
          input: {
            entityType: 'school',
            code: schoolCode.trim().toUpperCase(),
            parentCode: subCountyCode.trim().toUpperCase(),
            name: schoolName.trim(),
            nationCode: nationCode.trim().toUpperCase(),
            regionCode: regionCode.trim().toUpperCase(),
            countyCode: countyCode.trim().toUpperCase(),
            subCountyCode: subCountyCode.trim().toUpperCase(),
            schoolCode: schoolCode.trim().toUpperCase(),
            assignedOfficerEmail: officerEmail.trim().toLowerCase(),
            assignedOfficerRole: 'principal',
            status: 'active',
          },
        },
      });

      setNotice('School record and principal profile created successfully.');
      setSchoolCode('');
      setSchoolName('');
      setOfficerEmail('');
      setOfficerFullName('');
      setOfficerPhone('');
      setTscNumber('');
      await Promise.all([loadSchoolsForSubCounty(subCountyCode), loadPrincipals()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create school record and principal profile.';
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SectionCard
        title="Sub-county Office"
        subtitle="Create school records and assign principal profiles."
      >
        <Text style={styles.sectionLabel}>Linked sub-counties</Text>
        {subCountyOptions.length === 0 ? (
          <Text style={styles.placeholder}>No linked sub-counties found for your account.</Text>
        ) : null}

        {subCountyOptions.map((subCounty) => (
          <TouchableOpacity
            key={subCounty.id}
            style={[styles.subCountyOption, selectedSubCountyCode === subCounty.code && styles.subCountyOptionSelected]}
            onPress={() => void handleSubCountySelection(subCounty.code)}
          >
            <Text style={[styles.subCountyOptionText, selectedSubCountyCode === subCounty.code && styles.subCountyOptionTextSelected]}>
              {subCounty.name}
            </Text>
            <Text style={styles.subCountyOptionMeta}>{subCounty.code} • {subCounty.countyCode || 'County not set'}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.selectedSubCountyBox}>
          <Text style={styles.selectedSubCountyLabel}>Selected sub-county</Text>
          <Text style={styles.selectedSubCountyValue}>{subCountyCode || 'No sub-county selected'}</Text>
          <Text style={styles.selectedSubCountyMeta}>County: {countyCode || 'Not set'}</Text>
          <Text style={styles.selectedSubCountyMeta}>Region: {regionCode || 'Not set'}</Text>
          <Text style={styles.selectedSubCountyMeta}>Nation: {nationCode || 'Not set'}</Text>
        </View>

        <PrimaryTextInput
          value={schoolCode}
          onChangeText={setSchoolCode}
          placeholder="School code (e.g. NAT-001-RG-001-CT-001-SC-001-SCH-001)"
          autoCapitalize="characters"
        />
        <PrimaryTextInput
          value={schoolName}
          onChangeText={setSchoolName}
          placeholder="School name"
        />
        <PrimaryTextInput
          value={officerFullName}
          onChangeText={setOfficerFullName}
          placeholder="Principal full name"
        />
        <PrimaryTextInput
          value={officerEmail}
          onChangeText={setOfficerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Principal email"
        />
        <PrimaryTextInput
          value={officerPhone}
          onChangeText={setOfficerPhone}
          keyboardType="phone-pad"
          placeholder="Principal phone (optional)"
        />
        <PrimaryTextInput
          value={tscNumber}
          onChangeText={setTscNumber}
          placeholder="Principal TSC number (optional)"
          autoCapitalize="characters"
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateSchool} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Create School + Principal'}</Text>
        </TouchableOpacity>

        {notice ? <Text style={styles.message}>{notice}</Text> : null}
      </SectionCard>

      <SectionCard title="Existing Schools">
        {schools.length === 0 ? <Text style={styles.placeholder}>No schools found yet.</Text> : null}
        {schools.map((row) => (
          <View key={row.id} style={styles.row}>
            <Text style={styles.rowCode}>{row.code}</Text>
            <Text style={styles.rowName}>{row.name}</Text>
            <Text style={styles.rowMeta}>{row.assignedOfficerEmail || 'No assigned principal email'}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Existing Principal Profiles">
        {principals.length === 0 ? <Text style={styles.placeholder}>No principal profiles found yet.</Text> : null}
        {principals.map((principal) => (
          <View key={principal.id} style={styles.row}>
            <Text style={styles.rowName}>{principal.fullName}</Text>
            <Text style={styles.rowCode}>{principal.schoolCode}</Text>
            <Text style={styles.rowMeta}>{principal.userId}</Text>
          </View>
        ))}
      </SectionCard>
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
  placeholder: {
    color: '#6b7280',
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  subCountyOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
    marginBottom: 10,
  },
  subCountyOptionSelected: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  subCountyOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  subCountyOptionTextSelected: {
    color: '#1d4ed8',
  },
  subCountyOptionMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  selectedSubCountyBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 12,
    marginBottom: 12,
  },
  selectedSubCountyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedSubCountyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  selectedSubCountyMeta: {
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