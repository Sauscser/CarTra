import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { getUrl } from 'aws-amplify/storage';
import { Ionicons } from '@expo/vector-icons';
import { listLearnerDocumentResources } from '../../graphql/queries';

type EvidenceKind = 'document' | 'video';

type Props = {
  learnerId: string;
  subjectId?: string;
  subjectName: string;
};

export default function SubjectEvidenceActions({ learnerId, subjectId, subjectName }: Props) {
  const client = useMemo(() => generateClient(), []);
  const [kind, setKind] = useState<EvidenceKind | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const showResources = async (nextKind: EvidenceKind) => {
    setKind(nextKind);
    setLoading(true);
    setLoadFailed(false);
    try {
      const result = await client.graphql({
        query: listLearnerDocumentResources,
        variables: {
          filter: {
            and: [
              { learnerId: { eq: learnerId } },
              { relatedSubjectId: { eq: subjectId } },
            ],
          },
          limit: 500,
        },
      } as any);
      const items = ((result as any).data?.listLearnerDocumentResources?.items || [])
        .filter((resource: any) => resource?.id && resource?.learnerId === learnerId)
        .filter((resource: any) => String(resource?.relatedSubjectId || '') === String(subjectId || ''))
        .filter((resource: any) => !resource.resourceCategory || resource.resourceCategory === 'e_portfolio')
        .filter((resource: any) => resource.fileKey || resource.externalUrl)
        .sort((first: any, second: any) => new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime());
      setResources(items);
    } catch (error) {
      console.warn('[SUBJECT_EVIDENCE_LOAD_FAILED]', { learnerId, subjectId, error });
      setResources([]);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const openResource = async (resource: any) => {
    try {
      setOpeningId(resource.id);
      if (resource.externalUrl) {
        await Linking.openURL(String(resource.externalUrl));
        return;
      }
      if (!resource.fileKey) return;
      const rawKey = String(resource.fileKey).trim();
      const signedUrl = await getUrl({
        path: rawKey,
        options: { validateObjectExistence: true, expiresIn: 900 },
      });
      await Linking.openURL(signedUrl.url.toString());
    } catch (error) {
      console.warn('[SUBJECT_EVIDENCE_OPEN_FAILED]', { resourceId: resource.id, error });
    } finally {
      setOpeningId(null);
    }
  };

  const filteredResources = resources.filter((resource) => kind === 'video'
    ? Boolean(resource.externalUrl) || resource.resourceType === 'video'
    : !resource.externalUrl && resource.resourceType !== 'video');

  return (
    <>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => void showResources('document')} disabled={!subjectId} accessibilityRole="button">
          <Ionicons name="document-text-outline" size={18} color="#1d4ed8" />
          <Text style={styles.documentText}>Documents</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => void showResources('video')} disabled={!subjectId} accessibilityRole="button">
          <Ionicons name="videocam-outline" size={18} color="#b91c1c" />
          <Text style={styles.videoText}>Videos</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={kind !== null} animationType="fade" onRequestClose={() => setKind(null)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.title}>{kind === 'video' ? 'Subject videos' : 'Subject documents'}</Text>
            <Text style={styles.subjectName}>{subjectName}</Text>
            <ScrollView style={styles.list}>
              {loading ? <ActivityIndicator style={styles.loading} size="small" color="#1d4ed8" /> : null}
              {!loading && loadFailed ? <Text style={styles.message}>Could not load resources for this subject.</Text> : null}
              {!loading && !loadFailed && filteredResources.length === 0 ? <Text style={styles.message}>No {kind === 'video' ? 'videos' : 'documents'} are linked to this subject yet.</Text> : null}
              {!loading ? filteredResources.map((resource) => (
                <View key={resource.id} style={styles.resourceRow}>
                  <View style={styles.resourceText}>
                    <Text style={styles.resourceTitle}>{resource.title || resource.fileName || 'Untitled resource'}</Text>
                    {resource.fileName ? <Text style={styles.meta}>{resource.fileName}</Text> : null}
                    {resource.description ? <Text style={styles.description}>{resource.description}</Text> : null}
                  </View>
                  <TouchableOpacity style={styles.openButton} onPress={() => void openResource(resource)} disabled={openingId === resource.id} accessibilityRole="button">
                    {openingId === resource.id ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.openText}>Open</Text>}
                  </TouchableOpacity>
                </View>
              )) : null}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setKind(null)} accessibilityRole="button">
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionButton: { flex: 1, minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, backgroundColor: '#f8fafc', paddingHorizontal: 8 },
  documentText: { color: '#1d4ed8', fontSize: 12, fontWeight: '700' },
  videoText: { color: '#b91c1c', fontSize: 12, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.62)', justifyContent: 'center', padding: 16 },
  modal: { maxHeight: '82%', borderRadius: 12, backgroundColor: '#fff', padding: 14 },
  title: { color: '#111827', fontSize: 16, fontWeight: '800' },
  subjectName: { color: '#475569', fontSize: 13, marginTop: 3, marginBottom: 8 },
  list: { flexGrow: 0 },
  loading: { padding: 14 },
  message: { color: '#64748b', fontSize: 13, paddingVertical: 12 },
  resourceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  resourceText: { flex: 1, minWidth: 0 },
  resourceTitle: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  meta: { color: '#64748b', fontSize: 11, marginTop: 2 },
  description: { color: '#475569', fontSize: 12, marginTop: 4 },
  openButton: { minWidth: 58, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#1d4ed8', paddingHorizontal: 10 },
  openText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  closeButton: { alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 8 },
  closeText: { color: '#1d4ed8', fontSize: 13, fontWeight: '700' },
});
