import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

type SectionCardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
}>;

export default function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <ScrollView nestedScrollEnabled contentContainerStyle={styles.contentScroll}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 14,
  },
  contentScroll: {
    paddingBottom: 8,
  },
});
