import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RegionItem } from '../../types/hierarchy';

type OrgEntityListProps = {
  rows: RegionItem[];
  emptyMessage: string;
};

export default function OrgEntityList({ rows, emptyMessage }: OrgEntityListProps) {
  if (!rows.length) {
    return <Text style={styles.placeholder}>{emptyMessage}</Text>;
  }

  return (
    <>
      {rows.map((row) => (
        <View key={row.id} style={styles.row}>
          <Text style={styles.code}>{row.code}</Text>
          <Text style={styles.name}>{row.name}</Text>
          <Text style={styles.owner}>{row.assignedOfficerEmail || 'No assigned officer email'}</Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
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
  code: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  owner: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 4,
  },
});
