import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SectionCard from '../../components/shared/SectionCard';

type AccountScreenProps = {
  username?: string;
  onSignOut: () => Promise<void>;
  loading: boolean;
};

export default function AccountScreen({ username, onSignOut, loading }: AccountScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <SectionCard title="Account">
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.username}>{username || 'Unknown user'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => void onSignOut()} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing out...' : 'Sign out'}</Text>
        </TouchableOpacity>
      </SectionCard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  username: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
