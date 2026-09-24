import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { createIntervention } from '../../graphql/mutations';
import { listInterventions, listUsers } from '../../graphql/queries';
import useSessionUser from '../../hooks/useSessionUser';

type Props = {
  learnerId?: string;
  learnerIds?: string[];
  currentGrade?: string | number | null;
  authorRoleOverride?: string | null;
};

export default function LearnerComments({ learnerId, learnerIds, currentGrade, authorRoleOverride }: Props) {
  const client = useMemo(() => generateClient(), []);
  const { sessionUser } = useSessionUser();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<any>>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const allowedRolesToComment = ['parent', 'teacher', 'principal', 'subCountyOfficer', 'countyOfficer', 'regionalOfficer', 'nationalOfficer'];
  const userRole = (() => {
    if (authorRoleOverride && allowedRolesToComment.includes(authorRoleOverride)) {
      return authorRoleOverride;
    }

    const groups = Array.isArray(sessionUser?.groups) ? sessionUser.groups : [];
    const priority = ['principal', 'teacher', 'parent', 'subCountyOfficer', 'countyOfficer', 'regionalOfficer', 'nationalOfficer'];
    const matched = priority.find((role) => groups.includes(role as any));
    return matched || groups[0] || 'parent';
  })();
  // only allow commenting when a single learner context is present
  const singleLearnerTarget = Boolean(learnerId) || (Array.isArray(learnerIds) && learnerIds.length === 1);
  const canComment = allowedRolesToComment.includes(userRole) && singleLearnerTarget;

  useEffect(() => {
    void loadComments();
  }, [learnerId, JSON.stringify(learnerIds)]);

  const loadComments = async () => {
    try {
      setLoading(true);
      // support fetching comments for a single learner or multiple learners
      const filter = learnerIds && learnerIds.length > 0
        ? { learnerId: { in: learnerIds } }
        : { learnerId: { eq: learnerId } };

      const res = await client.graphql({ query: listInterventions, variables: { filter, limit: 200 } } as any);
      const rows = (res as any).data?.listInterventions?.items || [];
      // resolve author display names (user lookup)
      const userIds = Array.from(new Set(rows.map((r: any) => r.authorUserId).filter(Boolean)));
      let usersMap: Record<string, any> = {};
      if (userIds.length > 0) {
        try {
          const usersRes = await client.graphql({ query: listUsers, variables: { filter: { id: { in: userIds } }, limit: 200 } } as any);
          const users = (usersRes as any).data?.listUsers?.items || [];
          usersMap = (users as any[]).reduce((acc: Record<string, any>, u: any) => {
            if (u && u.id) acc[u.id] = u;
            return acc;
          }, {} as Record<string, any>);
        } catch (e) {
          usersMap = {};
        }
      }

      const enriched = rows.map((r: any) => {
        const authorName = r.authorUserId ? (usersMap[r.authorUserId]?.fullName || usersMap[r.authorUserId]?.email || r.authorUserId) : null;
        const roleLabel = r.authorRole || 'Unknown';
        return {
          ...r,
          authorDisplayName: authorName || r.authorRole || 'Unknown',
          authorRoleLabel: roleLabel,
        };
      });

      // if multiple learners requested, group by learnerId and include learner profile (name/grade)
      const targetLearnerIds = learnerIds && learnerIds.length > 0 ? learnerIds : learnerId ? [learnerId] : [];

      if (targetLearnerIds.length > 1) {
        // fetch learner profiles
        let learnerMap: Record<string, any> = {};
        try {
          const lp = await client.graphql({ query: require('../../graphql/queries').listLearnerProfiles, variables: { filter: { id: { in: targetLearnerIds } }, limit: 200 } } as any);
          const litems = (lp as any).data?.listLearnerProfiles?.items || [];
          learnerMap = (litems as any[]).reduce((acc: Record<string, any>, l: any) => {
            if (l && l.id) acc[l.id] = l;
            return acc;
          }, {} as Record<string, any>);
        } catch (e) {
          learnerMap = {};
        }

        const grouped: Record<string, any[]> = {};
        enriched.forEach((r: any) => {
          if (!grouped[r.learnerId]) grouped[r.learnerId] = [];
          grouped[r.learnerId].push(r);
        });

        const groups = targetLearnerIds.map((id) => ({
          learnerId: id,
          learnerName: learnerMap[id]?.fullName || id,
          gradeLevel: learnerMap[id]?.gradeLevel || null,
          comments: (grouped[id] || []).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
        }));

        // sort groups by grade descending (highest first) then by learnerName
        groups.sort((a: any, b: any) => {
          const ag = Number(String(a.gradeLevel || '').replace(/\D/g, '')) || 0;
          const bg = Number(String(b.gradeLevel || '').replace(/\D/g, '')) || 0;
          if (ag !== bg) return bg - ag;
          return String(a.learnerName).localeCompare(String(b.learnerName));
        });

        setItems(groups);
        return;
      }

      // single learner: show flat comment list (most recent first)
      const sorted = enriched.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setItems(sorted);
    } catch (error) {
      console.warn('loadComments failed', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!note.trim()) {
      Alert.alert('Enter a note', 'Please enter your guidance or comment before submitting.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        learnerId,
        authorUserId: sessionUser?.username || null,
        authorRole: userRole,
        jurisdictionCode: currentGrade != null ? String(currentGrade) : null,
        interventionType: 'comment',
        note: note.trim(),
        status: 'active',
      } as any;

      await client.graphql({ query: createIntervention, variables: { input: payload } } as any);
      setNote('');
      await loadComments();
      Alert.alert('Comment saved', 'Your comment was recorded.');
    } catch (error) {
      console.warn('submitComment failed', error);
      Alert.alert('Save failed', 'Could not save your comment.');
    } finally {
      setSaving(false);
    }
  };

  const isGroupedComments = Array.isArray(items) && items.length > 0 && Array.isArray((items[0] as any)?.comments);
  const formatRole = (role?: string | null) => {
    if (!role) return 'Unknown';
    const labels: Record<string, string> = {
      parent: 'Parent',
      teacher: 'Teacher',
      principal: 'Principal',
      subCountyOfficer: 'Sub County Director',
      countyOfficer: 'County Director',
      regionalOfficer: 'Regional Director',
      nationalOfficer: 'National Officer',
    };
    return labels[role] || role;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guidance & comments</Text>
      {loading ? <ActivityIndicator /> : null}

      {items.length === 0 ? (
        <Text style={styles.empty}>No comments yet.</Text>
      ) : isGroupedComments ? (
        // grouped multi-learner view
        items.map((group: any) => (
          <View key={group.learnerId} style={styles.groupCard}>
            <Text style={styles.groupTitle}>{group.learnerName} • Grade {group.gradeLevel || 'N/A'}</Text>
            {Array.isArray(group.comments) && group.comments.length === 0 ? <Text style={styles.empty}>No comments for this learner.</Text> : (
              (group.comments || []).map((it: any) => {
                const authorName = it.authorDisplayName || 'Unknown author';
                const roleLabel = formatRole(it.authorRole || it.authorRoleLabel);
                return (
                  <View key={it.id} style={styles.commentCard}>
                    <Text style={styles.meta}>{roleLabel} • {authorName}</Text>
                    <Text style={styles.metaTime}>{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</Text>
                    <Text style={styles.noteText}>{it.note}</Text>
                  </View>
                );
              })
            )}
          </View>
        ))
      ) : (
        // single-learner flat list
        (items as any[]).map((it) => {
          const authorName = it.authorDisplayName || 'Unknown author';
          const roleLabel = formatRole(it.authorRole || it.authorRoleLabel);
          return (
            <View key={it.id} style={styles.commentCard}>
              <Text style={styles.meta}>{roleLabel} • {authorName}</Text>
              <Text style={styles.metaTime}>{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</Text>
              <Text style={styles.noteText}>{it.note}</Text>
            </View>
          );
        })
      )}

      {canComment ? (
        <View style={styles.composeBox}>
          <TextInput
            style={styles.input}
            placeholder="Write guidance or comment..."
            value={note}
            onChangeText={setNote}
            multiline
          />
          <TouchableOpacity style={[styles.saveBtn, saving && styles.disabled]} onPress={submitComment} disabled={saving}>
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Add comment'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  title: { fontWeight: '800', marginBottom: 8 },
  empty: { color: '#6b7280' },
  commentCard: { padding: 8, borderWidth: 1, borderColor: '#eef2ff', borderRadius: 8, marginBottom: 8, backgroundColor: '#ffffff' },
  meta: { color: '#374151', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  metaTime: { color: '#6b7280', fontSize: 11, marginBottom: 6 },
  noteText: { color: '#111827' },
  composeBox: { marginTop: 10 },
  input: { minHeight: 60, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, backgroundColor: '#fff' },
  saveBtn: { marginTop: 8, backgroundColor: '#1d4ed8', padding: 10, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
  groupCard: { padding: 10, borderWidth: 1, borderColor: '#e6eef8', borderRadius: 8, marginBottom: 10, backgroundColor: '#fafafa' },
  groupTitle: { fontWeight: '700', marginBottom: 6 },
});
