import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import PrimaryTextInput from '../forms/PrimaryTextInput';
import SectionCard from './SectionCard';
import { createLearnerEnrollment, updateLearnerEnrollment, updateLearnerProfile, updateOrgHierarchy } from '../../graphql/mutations';
import { listLearnerEnrollments, listOrgHierarchies, listUsers } from '../../graphql/queries';

type Scope = 'subCounty' | 'county' | 'region' | 'nation';
type TransferKind = 'learner' | 'teacher' | 'principal' | 'subCountyOfficer' | 'countyOfficer' | 'regionalOfficer';
type ScopeCodes = { nationCode: string; regionCode?: string; countyCode?: string; subCountyCode?: string };
type Destination = { id: string; code: string; name: string; nationCode?: string; regionCode?: string; countyCode?: string; subCountyCode?: string; assignedOfficerEmail?: string | null };
type TransferRecord = { id: string; userId: string; fullName: string; email: string; [key: string]: any };

type Props = { scope: Scope; scopeCodes: ScopeCodes };

const TRANSFER_OPTIONS: Record<Scope, TransferKind[]> = {
  subCounty: ['learner', 'teacher'],
  county: ['principal', 'subCountyOfficer'],
  region: ['countyOfficer'],
  nation: ['regionalOfficer'],
};

const PROFILE_CONFIG: Record<TransferKind, { label: string; entityType: string; listField: string; updateField: string; profileFields: string[]; scopeFields: string[] }> = {
  learner: { label: 'Learner', entityType: 'school', listField: 'listLearnerProfiles', updateField: 'updateLearnerProfile', profileFields: ['id', 'userId', 'fullName', 'learnerId', 'gradeLevel', 'classCode', 'nationCode', 'regionCode', 'countyCode', 'subCountyCode', 'schoolCode'], scopeFields: ['schoolCode', 'subCountyCode', 'countyCode', 'regionCode', 'nationCode'] },
  teacher: { label: 'Teacher', entityType: 'school', listField: 'listTeacherProfiles', updateField: 'updateTeacherProfile', profileFields: ['id', 'userId', 'fullName', 'nationCode', 'regionCode', 'countyCode', 'subCountyCode', 'schoolCode'], scopeFields: ['schoolCode', 'subCountyCode', 'countyCode', 'regionCode', 'nationCode'] },
  principal: { label: 'Principal', entityType: 'school', listField: 'listPrincipalProfiles', updateField: 'updatePrincipalProfile', profileFields: ['id', 'userId', 'fullName', 'nationCode', 'regionCode', 'countyCode', 'subCountyCode', 'schoolCode', 'schoolName'], scopeFields: ['schoolCode', 'schoolName', 'subCountyCode', 'countyCode', 'regionCode', 'nationCode'] },
  subCountyOfficer: { label: 'Sub-county officer', entityType: 'subCounty', listField: 'listSubCountyOfficerProfiles', updateField: 'updateSubCountyOfficerProfile', profileFields: ['id', 'userId', 'fullName', 'nationCode', 'regionCode', 'countyCode', 'subCountyCode'], scopeFields: ['subCountyCode', 'countyCode', 'regionCode', 'nationCode'] },
  countyOfficer: { label: 'County director', entityType: 'county', listField: 'listCountyOfficerProfiles', updateField: 'updateCountyOfficerProfile', profileFields: ['id', 'userId', 'fullName', 'nationCode', 'regionCode', 'countyCode'], scopeFields: ['countyCode', 'regionCode', 'nationCode'] },
  regionalOfficer: { label: 'Regional officer', entityType: 'region', listField: 'listRegionalOfficerProfiles', updateField: 'updateRegionalOfficerProfile', profileFields: ['id', 'userId', 'fullName', 'nationCode', 'regionCode'], scopeFields: ['regionCode', 'nationCode'] },
};

function buildListQuery(kind: TransferKind) {
  const config = PROFILE_CONFIG[kind];
  return `query ListTransferProfiles($limit: Int) { ${config.listField}(limit: $limit) { items { ${config.profileFields.join(' ')} } } }`;
}

function buildUpdateMutation(kind: TransferKind) {
  const config = PROFILE_CONFIG[kind];
  const inputType = `Update${kind === 'subCountyOfficer' ? 'SubCountyOfficer' : kind === 'countyOfficer' ? 'CountyOfficer' : kind === 'regionalOfficer' ? 'RegionalOfficer' : kind === 'learner' ? 'Learner' : kind === 'teacher' ? 'Teacher' : 'Principal'}ProfileInput`;
  return `mutation UpdateTransferProfile($input: ${inputType}!) { ${config.updateField}(input: $input) { id } }`;
}

function getDestinationFilter(scope: Scope, codes: ScopeCodes) {
  if (scope === 'subCounty') return { entityType: { eq: 'school' }, subCountyCode: { eq: codes.subCountyCode } };
  if (scope === 'county') return { entityType: { eq: 'subCounty' }, countyCode: { eq: codes.countyCode } };
  if (scope === 'region') return { entityType: { eq: 'county' }, regionCode: { eq: codes.regionCode } };
  return { entityType: { eq: 'region' }, nationCode: { eq: codes.nationCode } };
}

export default function JurisdictionTransferManager({ scope, scopeCodes }: Props) {
  const client = useMemo(() => generateClient(), []);
  const [kind, setKind] = useState<TransferKind>(TRANSFER_OPTIONS[scope][0]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<TransferRecord | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setSelectedRecord(null);
    setSelectedDestination(null);
    setSearch('');
    void loadDestinations();
  }, [scope, scopeCodes.nationCode, scopeCodes.regionCode, scopeCodes.countyCode, scopeCodes.subCountyCode]);

  useEffect(() => {
    setSelectedRecord(null);
    setSelectedDestination(null);
    setSearch('');
    void loadRecords();
  }, [kind, scopeCodes.nationCode, scopeCodes.regionCode, scopeCodes.countyCode, scopeCodes.subCountyCode]);

  const loadDestinations = async () => {
    try {
      const result = await client.graphql({ query: listOrgHierarchies, variables: { filter: getDestinationFilter(scope, scopeCodes), limit: 500 } });
      const items = (result as any).data?.listOrgHierarchies?.items || [];
      setDestinations(items.filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ ...item, code: String(item.code) })));
    } catch (error) {
      setDestinations([]);
      setNotice(error instanceof Error ? error.message : 'Could not load transfer destinations.');
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const [profileResult, usersResult] = await Promise.all([
        client.graphql({ query: buildListQuery(kind), variables: { limit: 1000 } } as any),
        client.graphql({ query: listUsers, variables: { limit: 1000 } }),
      ]);
      const profileItems = (profileResult as any).data?.[PROFILE_CONFIG[kind].listField]?.items || [];
      const users = (usersResult as any).data?.listUsers?.items || [];
      const usersById = new Map<string, any>(users.filter((item: any) => item?.id).map((item: any) => [String(item.id), item]));
      const sourceField = kind === 'learner' || kind === 'teacher' || (kind === 'principal' && scope === 'subCounty')
        ? 'subCountyCode'
        : kind === 'principal' || kind === 'subCountyOfficer' ? 'countyCode'
          : kind === 'countyOfficer' ? 'regionCode' : 'nationCode';
      const expectedSourceCode = sourceField === 'subCountyCode' ? scopeCodes.subCountyCode : sourceField === 'countyCode' ? scopeCodes.countyCode : sourceField === 'regionCode' ? scopeCodes.regionCode : scopeCodes.nationCode;
      const filtered = profileItems.filter((item: any) => String(item?.[sourceField] || '') === String(expectedSourceCode || ''));
      setRecords(filtered.map((item: any) => ({ ...item, email: String(usersById.get(String(item.userId))?.email || '') } as TransferRecord)));
      setNotice('');
    } catch (error) {
      setRecords([]);
      setNotice(error instanceof Error ? error.message : `Could not load ${PROFILE_CONFIG[kind].label.toLowerCase()} records.`);
    } finally {
      setLoading(false);
    }
  };

  const visibleRecords = records.filter((record) => `${record.fullName} ${record.email} ${record.learnerId || ''}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 50);

  const moveHierarchyAssignment = async (email: string, destination: Destination) => {
    if (!email || !['principal', 'subCountyOfficer', 'countyOfficer', 'regionalOfficer'].includes(kind)) return;
    if (destination.assignedOfficerEmail && String(destination.assignedOfficerEmail).toLowerCase() !== email.toLowerCase()) {
      throw new Error(`${destination.name} already has an assigned officer (${destination.assignedOfficerEmail}).`);
    }
    const entityType = PROFILE_CONFIG[kind].entityType;
    const currentSourceCode = kind === 'principal' ? selectedRecord?.schoolCode
      : kind === 'subCountyOfficer' ? selectedRecord?.subCountyCode
        : kind === 'countyOfficer' ? selectedRecord?.countyCode
          : selectedRecord?.regionCode;
    const result = await client.graphql({
      query: listOrgHierarchies,
      variables: { filter: { and: [{ entityType: { eq: entityType } }, { code: { eq: currentSourceCode } }] }, limit: 2 },
    });
    const source = (result as any).data?.listOrgHierarchies?.items?.[0];
    if (source?.id && String(source.assignedOfficerEmail || '').toLowerCase() === email.toLowerCase()) {
      await client.graphql({ query: updateOrgHierarchy, variables: { input: { id: source.id, assignedOfficerEmail: null } } });
    }
    await client.graphql({ query: updateOrgHierarchy, variables: { input: { id: destination.id, assignedOfficerEmail: email, assignedOfficerRole: kind } } });
  };

  const transferLearner = async (record: TransferRecord, destination: Destination) => {
    const scope = {
      schoolCode: destination.code,
      subCountyCode: destination.subCountyCode || scopeCodes.subCountyCode || '',
      countyCode: destination.countyCode || scopeCodes.countyCode || '',
      regionCode: destination.regionCode || scopeCodes.regionCode || '',
      nationCode: destination.nationCode || scopeCodes.nationCode,
    };
    const enrollmentResult = await client.graphql({ query: listLearnerEnrollments, variables: { filter: { learnerId: { eq: record.id } }, limit: 500 } });
    const enrollments = (enrollmentResult as any).data?.listLearnerEnrollments?.items || [];
    const active = enrollments.filter((item: any) => item?.enrollmentStatus === 'active');
    for (const enrollment of active) {
      await client.graphql({ query: updateLearnerEnrollment, variables: { input: { id: enrollment.id, enrollmentStatus: 'transferred', promotedToNextClass: false } } });
    }
    await client.graphql({ query: updateLearnerProfile, variables: { input: { id: record.id, ...scope, classCode: null } } });
    await client.graphql({
      query: createLearnerEnrollment,
      variables: { input: { learnerId: record.id, schoolCode: destination.code, classCode: null, academicYear: String(new Date().getFullYear()), termOrCycle: 'Transfer', enrollmentStatus: 'active', promotedToNextClass: false } },
    });
  };

  const transfer = async () => {
    if (!selectedRecord || !selectedDestination) {
      setNotice('Select a person and destination first.');
      return;
    }
    if (['principal', 'subCountyOfficer', 'countyOfficer', 'regionalOfficer'].includes(kind) && !selectedRecord.email) {
      setNotice('This profile has no matching user email. The transfer cannot update the assigned officer link.');
      return;
    }
    const currentCode = kind === 'learner' || kind === 'teacher' || kind === 'principal' ? selectedRecord.schoolCode
      : kind === 'subCountyOfficer' ? selectedRecord.subCountyCode : kind === 'countyOfficer' ? selectedRecord.countyCode : selectedRecord.regionCode;
    if (String(currentCode || '') === selectedDestination.code) {
      setNotice('This person is already assigned to that destination.');
      return;
    }
    if (['principal', 'subCountyOfficer', 'countyOfficer', 'regionalOfficer'].includes(kind)
      && selectedDestination.assignedOfficerEmail
      && String(selectedDestination.assignedOfficerEmail).toLowerCase() !== String(selectedRecord.email).toLowerCase()) {
      setNotice(`${selectedDestination.name} already has an assigned officer (${selectedDestination.assignedOfficerEmail}).`);
      return;
    }
    Alert.alert('Confirm transfer', `Transfer ${selectedRecord.fullName} to ${selectedDestination.name}? The existing profile identity and personal details will be retained.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Transfer', onPress: () => void performTransfer(selectedRecord, selectedDestination) },
    ]);
  };

  const performTransfer = async (record: TransferRecord, destination: Destination) => {
    setTransferring(true);
    setNotice('');
    try {
      const config = PROFILE_CONFIG[kind];
      if (kind === 'learner') {
        await transferLearner(record, destination);
      } else {
        const profileInput: Record<string, any> = { id: record.id };
        if (kind === 'teacher' || kind === 'principal') {
          profileInput.schoolCode = destination.code;
          profileInput.subCountyCode = destination.subCountyCode || scopeCodes.subCountyCode || '';
          profileInput.countyCode = destination.countyCode || scopeCodes.countyCode || '';
          profileInput.regionCode = destination.regionCode || scopeCodes.regionCode || '';
          profileInput.nationCode = destination.nationCode || scopeCodes.nationCode;
          if (kind === 'principal') profileInput.schoolName = destination.name;
        } else {
          profileInput[config.scopeFields[0]] = destination.code;
          profileInput.nationCode = destination.nationCode || scopeCodes.nationCode;
          if (kind === 'countyOfficer') profileInput.regionCode = destination.regionCode || scopeCodes.regionCode;
          if (kind === 'subCountyOfficer') {
            profileInput.countyCode = destination.countyCode || scopeCodes.countyCode;
            profileInput.regionCode = destination.regionCode || scopeCodes.regionCode;
          }
        }
        await client.graphql({ query: buildUpdateMutation(kind), variables: { input: profileInput } } as any);
        await moveHierarchyAssignment(record.email, destination);
      }
      setNotice(`${PROFILE_CONFIG[kind].label} ${record.fullName} transferred to ${destination.name}.`);
      setSelectedRecord(null);
      setSelectedDestination(null);
      await Promise.all([loadRecords(), loadDestinations()]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `Could not transfer ${PROFILE_CONFIG[kind].label.toLowerCase()}.`);
    } finally {
      setTransferring(false);
    }
  };

  return (
    <SectionCard title="Transfers and receiving" subtitle="Move an existing learner or staff profile within your jurisdiction without creating a new identity." defaultExpanded={false}>
      <View style={styles.kindRow}>
        {TRANSFER_OPTIONS[scope].map((option) => (
          <TouchableOpacity key={option} style={[styles.kindButton, kind === option && styles.kindButtonSelected]} onPress={() => setKind(option)}>
            <Text style={[styles.kindText, kind === option && styles.kindTextSelected]}>{PROFILE_CONFIG[option].label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <PrimaryTextInput value={search} onChangeText={setSearch} placeholder={`Search ${PROFILE_CONFIG[kind].label.toLowerCase()} by name, email, or ID`} autoCapitalize="none" />
      {loading ? <View style={styles.loading}><ActivityIndicator size="small" /><Text style={styles.note}>Loading records...</Text></View> : null}
      {!loading && visibleRecords.length === 0 ? <Text style={styles.note}>{search ? 'No matching records found.' : `No ${PROFILE_CONFIG[kind].label.toLowerCase()} profiles found in this jurisdiction.`}</Text> : null}
      <View style={styles.recordList}>
        {visibleRecords.map((record) => (
          <TouchableOpacity key={record.id} style={[styles.recordRow, selectedRecord?.id === record.id && styles.recordSelected]} onPress={() => { setSelectedRecord(record); setSelectedDestination(null); }}>
            <Text style={styles.recordName}>{record.fullName}</Text>
            <Text style={styles.note}>{record.email || record.learnerId || record.userId}</Text>
            <Text style={styles.note}>{record.schoolCode || record.subCountyCode || record.countyCode || record.regionCode || ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedRecord ? <View style={styles.destinationBlock}>
        <Text style={styles.destinationTitle}>Receive {selectedRecord.fullName} at</Text>
        {!destinations.length ? <Text style={styles.note}>No eligible destinations are registered in this jurisdiction.</Text> : destinations.map((destination) => (
          <TouchableOpacity key={destination.id} style={[styles.destinationRow, selectedDestination?.id === destination.id && styles.destinationSelected]} onPress={() => setSelectedDestination(destination)}>
            <Text style={styles.recordName}>{destination.name}</Text>
            <Text style={styles.note}>{destination.code}</Text>
            {destination.assignedOfficerEmail ? <Text style={styles.note}>Assigned: {destination.assignedOfficerEmail}</Text> : null}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.transferButton, transferring && styles.transferButtonDisabled]} onPress={() => void transfer()} disabled={transferring || !selectedDestination}>
          <Text style={styles.transferButtonText}>{transferring ? 'Transferring...' : 'Confirm transfer'}</Text>
        </TouchableOpacity>
      </View> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  kindButton: { borderWidth: 1, borderColor: '#94a3b8', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 5 },
  kindButtonSelected: { borderColor: '#0f766e', backgroundColor: '#ecfdf5' },
  kindText: { color: '#334155', fontWeight: '600' },
  kindTextSelected: { color: '#0f766e', fontWeight: '700' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  note: { color: '#64748b', fontSize: 12, marginTop: 3 },
  recordList: { maxHeight: 260, borderTopWidth: 1, borderColor: '#e2e8f0' },
  recordRow: { padding: 10, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  recordSelected: { backgroundColor: '#ecfdf5' },
  recordName: { color: '#0f172a', fontSize: 14, fontWeight: '700' },
  destinationBlock: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#cbd5e1' },
  destinationTitle: { color: '#0f172a', fontWeight: '700', marginBottom: 8 },
  destinationRow: { padding: 10, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 6, borderRadius: 5 },
  destinationSelected: { backgroundColor: '#ecfdf5', borderColor: '#0f766e' },
  transferButton: { backgroundColor: '#0f766e', padding: 12, alignItems: 'center', marginTop: 8, borderRadius: 5 },
  transferButtonDisabled: { opacity: 0.5 },
  transferButtonText: { color: '#fff', fontWeight: '700' },
  notice: { color: '#334155', fontSize: 13, marginTop: 10 },
});
