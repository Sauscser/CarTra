import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { createNationalOfficerProfile, createOrgHierarchy, createUser } from '../../graphql/mutations';
import { listNationalOfficerProfiles, listOrgHierarchies } from '../../graphql/queries';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import SectionCard from '../../components/shared/SectionCard';
import useScopePath from '../../hooks/useScopePath';

type NationalOfficerItem = {
  id: string;
  fullName: string;
  nationCode: string;
  userId: string;
};

type NationRecord = {
  id: string;
  code: string;
  name: string;
  assignedOfficerEmail?: string | null;
};

export default function NationalOfficerSetupScreen() {
  return <NationalOfficerSetupContent />;
}

export function NationalOfficerSetupContent() {
  const client = useMemo(() => generateClient(), []);
  const [nationCode, setNationCode] = useState('NAT-001');
  const [nationName, setNationName] = useState('Kenya National Office');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerFullName, setOfficerFullName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [officers, setOfficers] = useState<NationalOfficerItem[]>([]);
  const [nationRows, setNationRows] = useState<NationRecord[]>([]);
  const [isLoadingCurrentEntity, setIsLoadingCurrentEntity] = useState(false);

  const scopePath = useScopePath({ nationCode });

  useEffect(() => {
    void Promise.all([loadNationalOfficers(), loadNationRows(), loadCurrentNationalEntity()]);
  }, []);

  const loadCurrentNationalEntity = async () => {
    try {
      setIsLoadingCurrentEntity(true);
      const session = await fetchAuthSession();
      const payload = session.tokens?.idToken?.payload as { email?: string } | undefined;
      const currentEmail = payload?.email?.trim().toLowerCase();

      if (!currentEmail) {
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

      const payloadResult = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const item = payloadResult.data?.listOrgHierarchies?.items?.[0];

      if (item) {
        setNationCode(item.code || '');
        setNationName(item.name || '');
        setOfficerEmail(currentEmail);
        setNotice(`Loaded national office for ${currentEmail}.`);
      }
    } catch {
      setNotice('Could not resolve the matching national office for your account.');
    } finally {
      setIsLoadingCurrentEntity(false);
    }
  };

  const loadNationalOfficers = async () => {
    const result = await client.graphql({
      query: listNationalOfficerProfiles,
      variables: { limit: 100 },
    });

    const payload = result as {
      data?: { listNationalOfficerProfiles?: { items?: Array<any> } };
    };

    const items = payload.data?.listNationalOfficerProfiles?.items || [];
    const mapped = items
      .filter((item: any) => Boolean(item?.id && item?.fullName && item?.nationCode && item?.userId))
      .map((item: any) => ({
        id: item.id,
        fullName: item.fullName,
        nationCode: item.nationCode,
        userId: item.userId,
      }));

    setOfficers(mapped);
  };

  const loadNationRows = async () => {
    const result = await client.graphql({
      query: listOrgHierarchies,
      variables: {
        filter: { entityType: { eq: 'nation' } },
        limit: 100,
      },
    });

    const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
    const items = payload.data?.listOrgHierarchies?.items || [];
    const mapped = items
      .filter((item: any) => Boolean(item?.id && item?.code && item?.name))
      .map((item: any) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        assignedOfficerEmail: item.assignedOfficerEmail,
      }));

    setNationRows(mapped);
  };

  const handleCreateNationalOfficer = async () => {
    if (!scopePath.nationCode || !nationName || !officerEmail || !officerFullName) {
      setNotice('Please fill nation and national officer details.');
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
            role: 'nationalOfficer',
            status: 'active',
            fullName: officerFullName.trim(),
          },
        },
      });

      const userPayload = userResponse as { data?: { createUser?: { id?: string } } };
      const createdUserId = userPayload.data?.createUser?.id;

      if (!createdUserId) {
        throw new Error('National officer user record was not created.');
      }

      await client.graphql({
        query: createNationalOfficerProfile,
        variables: {
          input: {
            userId: createdUserId,
            fullName: officerFullName.trim(),
            nationCode: scopePath.nationCode,
            assignedRegions: [],
          },
        },
      });

      await client.graphql({
        query: createOrgHierarchy,
        variables: {
          input: {
            entityType: 'nation',
            code: scopePath.nationCode,
            name: nationName.trim(),
            nationCode: scopePath.nationCode,
            assignedOfficerEmail: officerEmail.trim().toLowerCase(),
            assignedOfficerRole: 'nationalOfficer',
            status: 'active',
          },
        },
      });

      setNotice('National office and national officer profile created successfully.');
      setOfficerEmail('');
      setOfficerFullName('');
      setOfficerPhone('');
      await Promise.all([loadNationalOfficers(), loadNationRows()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create national officer profile.';
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SectionCard
        title="National Officer Setup"
        subtitle="Create the national office record and assign the national officer profile."
      >
        <PrimaryTextInput
          value={nationCode}
          onChangeText={setNationCode}
          placeholder="Nation code (e.g. NAT-001)"
          autoCapitalize="characters"
        />
        {isLoadingCurrentEntity ? <Text style={styles.loadingText}>Loading your national office...</Text> : null}
        <PrimaryTextInput
          value={nationName}
          onChangeText={setNationName}
          placeholder="Nation office name"
        />
        <PrimaryTextInput
          value={officerFullName}
          onChangeText={setOfficerFullName}
          placeholder="National officer full name"
        />
        <PrimaryTextInput
          value={officerEmail}
          onChangeText={setOfficerEmail}
          placeholder="National officer email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PrimaryTextInput
          value={officerPhone}
          onChangeText={setOfficerPhone}
          placeholder="National officer phone (optional)"
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateNationalOfficer} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Create National Office + Officer'}</Text>
        </TouchableOpacity>

        {notice ? <Text style={styles.message}>{notice}</Text> : null}
      </SectionCard>

      <SectionCard title="Existing National Offices">
        {nationRows.length === 0 ? <Text style={styles.placeholder}>No nation records found yet.</Text> : null}
        {nationRows.map((row) => (
          <View key={row.id} style={styles.row}>
            <Text style={styles.rowCode}>{row.code}</Text>
            <Text style={styles.rowName}>{row.name}</Text>
            <Text style={styles.rowMeta}>{row.assignedOfficerEmail || 'No assigned officer email'}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Existing National Officer Profiles">
        {officers.length === 0 ? <Text style={styles.placeholder}>No national officer profiles found yet.</Text> : null}
        {officers.map((officer) => (
          <View key={officer.id} style={styles.row}>
            <Text style={styles.rowName}>{officer.fullName}</Text>
            <Text style={styles.rowCode}>{officer.nationCode}</Text>
            <Text style={styles.rowMeta}>{officer.userId}</Text>
          </View>
        ))}
      </SectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  container: {
    gap: 16,
    paddingBottom: 20,
  },
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
  loadingText: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 8,
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
