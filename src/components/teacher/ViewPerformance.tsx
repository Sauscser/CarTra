import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ViewPerformanceProps = {
  onViewCluster: () => void | Promise<void>;
  onViewSubjects: () => void | Promise<void>;
  onViewEPortfolio: () => void | Promise<void>;
  onViewGuidance: () => void | Promise<void>;
};

export default function ViewPerformance({ onViewCluster, onViewSubjects, onViewEPortfolio, onViewGuidance }: ViewPerformanceProps) {
  const [opening, setOpening] = React.useState<string | null>(null);

  const open = async (action: string, callback: () => void | Promise<void>) => {
    if (opening) return;
    setOpening(action);
    // Let React paint the pending state before graph preparation starts.
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    await callback();
  };

  const renderButton = (action: string, label: string, callback: () => void | Promise<void>) => {
    const isOpening = opening === action;
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => void open(action, callback)}
        disabled={Boolean(opening)}
        accessibilityState={{ disabled: Boolean(opening), busy: isOpening }}
      >
        {isOpening ? <ActivityIndicator size="small" color="#1d4ed8" /> : <Text style={styles.buttonText}>{label}</Text>}
        {isOpening ? <Text style={styles.buttonText}>Opening... please wait</Text> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>View performance</Text>
      <View style={styles.actions}>
        {renderButton('cluster', 'View cluster points', onViewCluster)}
        {renderButton('subjects', 'View subjects', onViewSubjects)}
        {renderButton('guidance', 'View guidance', onViewGuidance)}
        {renderButton('eportfolio', 'View e-portfolio files', onViewEPortfolio)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  actions: {
    gap: 10,
  },
  button: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d4ed8',
  },
});