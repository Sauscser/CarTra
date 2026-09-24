import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SectionCard from '../../components/shared/SectionCard';

export default function LearnerHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionCard
          title="Learner Profile"
          subtitle="Personal profile, school scope, and career target summary."
        >
          <View style={styles.row}>
            <Text style={styles.label}>Full name</Text>
            <Text style={styles.value}>Pending learner record binding</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Assessment number</Text>
            <Text style={styles.value}>Not set</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Current class</Text>
            <Text style={styles.value}>Not set</Text>
          </View>
        </SectionCard>

        <SectionCard title="Academic Scope">
          <View style={styles.row}>
            <Text style={styles.label}>Nation</Text>
            <Text style={styles.value}>-</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Region</Text>
            <Text style={styles.value}>-</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>County</Text>
            <Text style={styles.value}>-</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sub-county</Text>
            <Text style={styles.value}>-</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>School</Text>
            <Text style={styles.value}>-</Text>
          </View>
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
  row: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
});
