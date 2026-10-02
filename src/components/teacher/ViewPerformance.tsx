import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCourseRequirementGroups, parseCourseClusterRequirements } from '../../utils/cluster';

type ViewPerformanceProps = {
  learner?: any;
  profile?: any;
  targetCareer?: string | null;
  onViewCluster: () => void | Promise<void>;
  onViewSubjects: () => void | Promise<void>;
  onViewGuidance: () => void | Promise<void>;
};

export default function ViewPerformance({ learner, profile, targetCareer: resolvedTargetCareer, onViewCluster, onViewSubjects, onViewGuidance }: ViewPerformanceProps) {
  const [opening, setOpening] = React.useState<string | null>(null);
  const supportProfile = (() => {
    const value = profile?.supportProfile;
    if (!value) return profile || {};
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return profile || {};
    }
  })();
  const requirements = parseCourseClusterRequirements(
    profile?.clusterRequirements || supportProfile?.clusterRequirements || profile?.courseClusterRequirements,
  );
  const requirementGroups = getCourseRequirementGroups(requirements);
  const learnerSubjects = [
    ...(Array.isArray(profile?.selectedSubjects) ? profile.selectedSubjects : []),
    ...(Array.isArray(supportProfile?.selectedSubjects) ? supportProfile.selectedSubjects : []),
  ];
  const subjectNameById = new Map<string, string>();
  learnerSubjects.forEach((subject: any) => {
    const id = String(subject?.id || subject?.code || '').trim();
    const name = String(subject?.name || subject?.code || '').trim();
    if (id && name) subjectNameById.set(id, name);
  });
  const targetCareer = String(
    resolvedTargetCareer || profile?.targetCareer || supportProfile?.targetCareer || supportProfile?.targetCareerName || '',
  ).trim();
  const assessmentNumber = learner?.assessmentNumber || profile?.assessmentNumber;

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
      {learner || targetCareer || requirementGroups.length > 0 ? (
        <View style={styles.learnerSummary}>
          {assessmentNumber ? <Text style={styles.summaryText}>Assessment number: {assessmentNumber}</Text> : null}
          {targetCareer ? <Text style={styles.summaryText}>Target career: {targetCareer}</Text> : null}
          {requirementGroups.length > 0 ? (
            <View style={styles.clusterSubjects}>
              <Text style={styles.summaryLabel}>Cluster subjects for this course</Text>
              {requirementGroups.map((group, index) => (
                <Text key={`course-subject-group-${index}`} style={styles.summaryText}>
                  {`Group ${index + 1}: ${group.map((item) => {
                    const name = item.subjectName || subjectNameById.get(item.subjectId) || item.subjectId;
                    const minimum = Number.isInteger(item.minimumPoints) ? ` (min ${item.minimumPoints} points)` : '';
                    return `${name}${minimum}`;
                  }).join(' OR ')}`}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      <Text style={styles.title}>View performance</Text>
      <View style={styles.actions}>
        {renderButton('cluster', 'View cluster points', onViewCluster)}
        {renderButton('subjects', 'View subjects', onViewSubjects)}
        {renderButton('guidance', 'View guidance', onViewGuidance)}
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
  learnerSummary: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
  },
  clusterSubjects: {
    marginTop: 4,
    gap: 3,
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