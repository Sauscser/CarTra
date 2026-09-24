import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SectionCard from '../../components/shared/SectionCard';

type RoleDashboardScreenProps = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export default function RoleDashboardScreen({ title, subtitle }: RoleDashboardScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <SectionCard title={title} subtitle={subtitle}>
        {/* Render children if provided (e.g., ParentProfileScreen), otherwise show placeholder */}
        {/** @ts-ignore children may be undefined */}
        {(arguments[0] as any).children ? (arguments[0] as any).children : <Text style={styles.placeholder}>Dashboard features for this role are the next build step.</Text>}
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
  placeholder: {
    fontSize: 14,
    color: '#6b7280',
  },
});
