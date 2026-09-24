import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import useSessionUser from '../../hooks/useSessionUser';
import { createParentProfile, updateParentProfile } from '../../graphql/mutations';
import { listParentProfiles } from '../../graphql/queries';

type Props = {
  onProfileChanged?: (payload: { profileId: string | null; nationalId: string | null }) => void;
};

export default function ParentCreateForm({ onProfileChanged }: Props) {
  const client = useMemo(() => generateClient(), []);
  const { sessionUser } = useSessionUser();
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');

  useEffect(() => {
    void loadParentProfile();
  }, [client, sessionUser]);

  const loadParentProfile = async () => {
    try {
      setLoading(true);
      if (!sessionUser) return;

      const userId = sessionUser.username;
      const list = await client.graphql({ query: listParentProfiles, variables: { filter: { userId: { eq: userId } }, limit: 10 } } as any);
      const items = (list as any).data?.listParentProfiles?.items || [];
      if (items.length > 0) {
        const row = items[0];
        setProfileId(row.id);
        setFullName(row.fullName || '');
        setNationalId(row.nationalId || '');
        onProfileChanged?.({ profileId: row.id, nationalId: row.nationalId || null });
        return;
      }

      setProfileId(null);
    } catch (error) {
      console.warn('loadParentProfile failed', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!sessionUser) return;
    try {
      setLoading(true);
      if (profileId) {
        await client.graphql({ query: updateParentProfile, variables: { input: { id: profileId, fullName: fullName.trim(), nationalId: nationalId.trim() } } } as any);
        Alert.alert('Saved', 'Parent profile updated.');
        onProfileChanged?.({ profileId, nationalId: nationalId.trim() || null });
      } else {
        const userId = sessionUser.username;
        const res = await client.graphql({ query: createParentProfile, variables: { input: { userId, fullName: fullName.trim(), nationalId: nationalId.trim(), linkedLearnerIds: [] } } } as any);
        const created = (res as any).data?.createParentProfile;
        setProfileId(created?.id || null);
        Alert.alert('Created', 'Parent profile created.');
        if (created?.id) {
          onProfileChanged?.({ profileId: created.id, nationalId: nationalId.trim() || null });
        }
      }
    } catch (error) {
      Alert.alert('Save failed', (error as Error).message || 'Could not save parent profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {loading ? <ActivityIndicator /> : null}

      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Parent full name" />

      <Text style={styles.label}>National ID</Text>
      <TextInput style={styles.input} value={nationalId} onChangeText={setNationalId} placeholder="National ID" />

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveText}>{profileId ? 'Update profile' : 'Create profile'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '700', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginTop: 6 },
  saveButton: { marginTop: 12, backgroundColor: '#1d4ed8', padding: 12, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
