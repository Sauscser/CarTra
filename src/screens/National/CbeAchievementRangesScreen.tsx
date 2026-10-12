import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import SectionCard from '../../components/shared/SectionCard';
import { deleteCoreSubject, deleteJuniorSubject, deleteSNESubject, deleteSubject, deleteSupportSubject, updateCoreSubject, updateJuniorSubject, updateOrgHierarchy, updateSNESubject, updateSubject, updateSupportSubject, updateTertiaryCourse } from '../../graphql/mutations';
import { listCoreSubjects, listJuniorSubjects, listOrgHierarchies, listSNESubjects, listSubjects, listSupportSubjects, listTertiaryCourses, listTertiaryInstitutionProfiles } from '../../graphql/queries';
import { CbeAchievementRange, DEFAULT_CBE_ACHIEVEMENT_RANGES, hasValidCbeAchievementRanges, parseCbeAchievementRanges } from '../../utils/cluster';

type NationRow = { id: string; code: string; metadata: Record<string, any> };
type CatalogKind = 'Elective' | 'Core' | 'Support' | 'Junior' | 'SNE';
type CatalogField = 'code' | 'name' | 'category' | 'learningAreaCode' | 'description' | 'status' | 'cbeAchievementRanges';
type CatalogSubject = { id: string; code: string; name: string; category?: string | null; learningAreaCode?: string | null; description?: string | null; status?: string | null; cbeAchievementRanges?: unknown; kind: CatalogKind };

export default function CbeAchievementRangesScreen() {
  const client = useMemo(() => generateClient(), []);
  const [nation, setNation] = useState<NationRow | null>(null);
  const [ranges, setRanges] = useState<CbeAchievementRange[]>(DEFAULT_CBE_ACHIEVEMENT_RANGES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [rangesConfigured, setRangesConfigured] = useState(false);
  const [activeSection, setActiveSection] = useState<'ranges' | 'subjects'>('ranges');
  const [catalogSubjects, setCatalogSubjects] = useState<CatalogSubject[]>([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<CatalogSubject | null>(null);
  const [selectedField, setSelectedField] = useState<CatalogField>('name');
  const [fieldDraft, setFieldDraft] = useState('');
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [savingSubject, setSavingSubject] = useState(false);

  const searchableSubjects = catalogSubjects.filter((subject) => {
    const query = subjectSearch.trim().toLowerCase();
    if (!query) return true;
    return `${subject.name} ${subject.code || ''} ${subject.category || ''} ${subject.learningAreaCode || ''} ${subject.kind}`
      .toLowerCase().includes(query);
  }).slice(0, 30);

  useEffect(() => {
    void loadRanges();
  }, [client]);

  useEffect(() => {
    if ((activeSection === 'subjects' || activeSection === 'ranges') && catalogSubjects.length === 0) void loadSubjects();
  }, [activeSection, catalogSubjects.length]);

  useEffect(() => {
    if (activeSection === 'ranges' && !selectedSubject && searchableSubjects.length > 0) {
      const firstSubject = searchableSubjects[0];
      setSelectedSubject(firstSubject);
      setSelectedField('cbeAchievementRanges');
      setRanges(parseCbeAchievementRanges(firstSubject.cbeAchievementRanges));
    }
  }, [activeSection, searchableSubjects, selectedSubject]);

  useEffect(() => {
    if (activeSection !== 'ranges' || !selectedSubject || selectedField === 'cbeAchievementRanges') return;
    setSelectedField('cbeAchievementRanges');
    setRanges(parseCbeAchievementRanges(selectedSubject.cbeAchievementRanges));
  }, [activeSection, selectedField, selectedSubject]);

  useEffect(() => {
    if (activeSection !== 'subjects' || selectedSubject || searchableSubjects.length === 0) return;
    const firstSubject = searchableSubjects[0];
    setSelectedSubject(firstSubject);
    setSelectedField('name');
    setFieldDraft(String(firstSubject.name ?? ''));
  }, [activeSection, searchableSubjects, selectedSubject]);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const [electiveResult, coreResult, supportResult, juniorResult, sneResult] = await Promise.all([
        client.graphql({ query: listSubjects, variables: { limit: 1000 } }),
        client.graphql({ query: listCoreSubjects, variables: { limit: 1000 } }),
        client.graphql({ query: listSupportSubjects, variables: { limit: 1000 } }),
        client.graphql({ query: listJuniorSubjects, variables: { limit: 1000 } }),
        client.graphql({ query: listSNESubjects, variables: { limit: 1000 } }),
      ]);
      const mapItems = (items: any[], kind: CatalogKind) => items
        .filter((item) => item?.id && item?.name)
        .map((item) => ({ ...item, kind } as CatalogSubject));
      setCatalogSubjects([
        ...mapItems((electiveResult as any).data?.listSubjects?.items || [], 'Elective'),
        ...mapItems((coreResult as any).data?.listCoreSubjects?.items || [], 'Core'),
        ...mapItems((supportResult as any).data?.listSupportSubjects?.items || [], 'Support'),
        ...mapItems((juniorResult as any).data?.listJuniorSubjects?.items || [], 'Junior'),
        ...mapItems((sneResult as any).data?.listSNESubjects?.items || [], 'SNE'),
      ].sort((left, right) => left.name.localeCompare(right.name)));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load the National subject catalog.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fieldsForSubject = (subject: CatalogSubject): CatalogField[] => subject.kind === 'Junior' || subject.kind === 'SNE'
    ? ['code', 'name', 'learningAreaCode', 'description', 'status', 'cbeAchievementRanges']
    : ['code', 'name', 'category', 'description', 'status', 'cbeAchievementRanges'];

  const selectSubjectField = (subject: CatalogSubject, field: CatalogField) => {
    setNotice('');
    setSelectedSubject(subject);
    setSelectedField(field);
    if (field === 'cbeAchievementRanges') {
      setRanges(parseCbeAchievementRanges(subject.cbeAchievementRanges));
      setFieldDraft('');
      return;
    }
    setFieldDraft(String(subject[field] ?? ''));
  };

  const saveSubjectField = async () => {
    if (!selectedSubject) return;
    const mutations = {
      Elective: updateSubject,
      Core: updateCoreSubject,
      Support: updateSupportSubject,
      Junior: updateJuniorSubject,
      SNE: updateSNESubject,
    };

    if (selectedField === 'cbeAchievementRanges') {
      try {
        setSavingSubject(true);
        setNotice('');
        const nextRanges = ranges.filter((range) => Number.isInteger(range.minimumMark) && Number.isInteger(range.maximumMark));
        const valid = nextRanges.length === 8 && nextRanges.every((range, index) =>
          range.level === DEFAULT_CBE_ACHIEVEMENT_RANGES[index].level
          && Number.isInteger(range.minimumMark)
          && Number.isInteger(range.maximumMark)
          && range.minimumMark >= 0
          && range.maximumMark <= 100
          && range.minimumMark <= range.maximumMark
          && (index === 0 ? range.minimumMark === 0 : range.minimumMark === nextRanges[index - 1].maximumMark + 1),
        ) && nextRanges[7].maximumMark === 100;
        if (!valid) {
          setNotice('Subject CBE ranges must cover 0–100 with no gaps or overlap.');
          return;
        }
        const payload = JSON.stringify(nextRanges);
        await client.graphql({
          query: mutations[selectedSubject.kind],
          variables: { input: { id: selectedSubject.id, cbeAchievementRanges: payload } },
        });
        const updatedSubject = { ...selectedSubject, cbeAchievementRanges: payload };
        setCatalogSubjects((current) => current.map((item) => item.id === updatedSubject.id && item.kind === updatedSubject.kind ? updatedSubject : item));
        setSelectedSubject(updatedSubject);
        const successMessage = `${selectedSubject.kind} subject CBE ranges updated.`;
        setNotice(successMessage);
        Alert.alert('Subject ranges saved', successMessage);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Could not update the subject CBE ranges.');
      } finally {
        setSavingSubject(false);
      }
      return;
    }

    const value = fieldDraft.trim();
    if ((selectedField === 'code' || selectedField === 'name') && !value) {
      setNotice(`${selectedField === 'code' ? 'Subject code' : 'Subject name'} cannot be blank.`);
      return;
    }
    const inputValue = selectedField === 'code' ? value.toUpperCase() : value;
    try {
      setSavingSubject(true);
      setNotice('');
      await client.graphql({
        query: mutations[selectedSubject.kind],
        variables: { input: { id: selectedSubject.id, [selectedField]: inputValue || null } },
      });
      const updatedSubject = { ...selectedSubject, [selectedField]: inputValue || null };
      setCatalogSubjects((current) => current.map((item) => item.id === updatedSubject.id && item.kind === updatedSubject.kind ? updatedSubject : item));
      setSelectedSubject(updatedSubject);
      setFieldDraft(String(updatedSubject[selectedField] ?? ''));
      setNotice(`${selectedSubject.kind} subject ${selectedField} updated.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `Could not update the subject ${selectedField}.`);
    } finally {
      setSavingSubject(false);
    }
  };

  const deleteSelectedSubject = async () => {
    if (!selectedSubject) return;
    const deleteMutations = {
      Elective: deleteSubject,
      Core: deleteCoreSubject,
      Support: deleteSupportSubject,
      Junior: deleteJuniorSubject,
      SNE: deleteSNESubject,
    };

    Alert.alert(
      'Delete subject record',
      `This will permanently remove ${selectedSubject.name} from the national catalog. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete subject',
          style: 'destructive',
          onPress: async () => {
            try {
              setSavingSubject(true);
              setNotice('');
              await client.graphql({
                query: deleteMutations[selectedSubject.kind],
                variables: { input: { id: selectedSubject.id } },
              });
              setCatalogSubjects((current) => current.filter((item) => !(item.id === selectedSubject.id && item.kind === selectedSubject.kind)));
              setSelectedSubject(null);
              setFieldDraft('');
              setNotice(`${selectedSubject.name} was removed from the subject catalog.`);
            } catch (error) {
              setNotice(error instanceof Error ? error.message : 'Could not delete this subject record.');
            } finally {
              setSavingSubject(false);
            }
          },
        },
      ],
    );
  };

  const loadRanges = async () => {
    try {
      setLoading(true);
      const session = await fetchAuthSession();
      const email = (session.tokens?.idToken?.payload as { email?: string } | undefined)?.email?.trim().toLowerCase();
      if (!email) throw new Error('No signed-in national officer email was found.');
      const response = await client.graphql({
        query: listOrgHierarchies,
        variables: { filter: { entityType: { eq: 'nation' } }, limit: 100 },
      });
      const items = ((response as any).data?.listOrgHierarchies?.items || []) as Array<any>;
      const item = items.find((candidate) => {
        const assignedOfficerEmail = String(candidate?.assignedOfficerEmail || '').trim().toLowerCase();
        return assignedOfficerEmail === email;
      }) || (items.length === 1 ? items[0] : undefined);
      if (!item?.id) throw new Error('No national office is assigned to this account.');
      const metadata = typeof item.metadata === 'string'
        ? (() => { try { return JSON.parse(item.metadata); } catch { return {}; } })()
        : item.metadata || {};
      setNation({ id: item.id, code: item.code, metadata });
      setRangesConfigured(hasValidCbeAchievementRanges(metadata.cbeAchievementRanges));
      setRanges(parseCbeAchievementRanges(metadata.cbeAchievementRanges));
      setNotice(hasValidCbeAchievementRanges(metadata.cbeAchievementRanges)
        ? `Loaded saved CBE score bands for ${item.name || item.code}.`
        : `No nation-wide CBE score bands are saved for ${item.name || item.code}. These are optional for tertiary course setup; every subject added to a course must have its own valid CBE ranges saved in the subject catalog.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load CBE score bands.');
    } finally {
      setLoading(false);
    }
  };

  const updateRange = (index: number, field: 'minimumMark' | 'maximumMark', value: string) => {
    setNotice('');
    setRanges((current) => current.map((range, rangeIndex) => rangeIndex === index
      ? { ...range, [field]: value === '' ? NaN : Number(value) }
      : range));
  };

  const validateRanges = (values: CbeAchievementRange[]) => values.length === 8 && values.every((range, index) =>
    range.level === DEFAULT_CBE_ACHIEVEMENT_RANGES[index].level
      && Number.isInteger(range.minimumMark)
      && Number.isInteger(range.maximumMark)
      && range.minimumMark >= 0
      && range.maximumMark <= 100
      && range.minimumMark <= range.maximumMark
      && (index === 0 ? range.minimumMark === 0 : range.minimumMark === values[index - 1].maximumMark + 1),
  ) && values[7].maximumMark === 100;

  const saveRanges = async () => {
    if (!nation) return;
    if (!validateRanges(ranges)) {
      setNotice('Ranges must be whole numbers, start at 0, end at 100, and continue without gaps or overlaps.');
      return;
    }
    try {
      setSaving(true);
      setNotice('');
      const metadata = { ...nation.metadata, cbeAchievementRanges: ranges };
      const [institutionResponse, courseResponse] = await Promise.all([
        client.graphql({ query: listTertiaryInstitutionProfiles, variables: { limit: 1000 } }),
        client.graphql({ query: listTertiaryCourses, variables: { limit: 1000 } }),
      ]);
      const nationInstitutionIds = new Set(
        ((institutionResponse as any).data?.listTertiaryInstitutionProfiles?.items || [])
          .filter((item: any) => String(item?.nationCode || '') === nation.code && item?.id)
          .map((item: any) => String(item.id)),
      );
      const nationCourses = ((courseResponse as any).data?.listTertiaryCourses?.items || [])
        .filter((course: any) => course?.id && nationInstitutionIds.has(String(course.institutionId)) && course.clusterRequirements);
      for (const course of nationCourses) {
        const courseRequirements = typeof course.clusterRequirements === 'string'
          ? JSON.parse(course.clusterRequirements)
          : course.clusterRequirements;
        if (!Array.isArray(courseRequirements?.subjectSequence)) continue;
        await client.graphql({
          query: updateTertiaryCourse,
          variables: { input: { id: course.id, clusterRequirements: JSON.stringify({ ...courseRequirements, achievementRanges: ranges }) } },
        });
      }
      await client.graphql({
        query: updateOrgHierarchy,
        variables: { input: { id: nation.id, metadata: JSON.stringify(metadata) } },
      });
      setNation({ ...nation, metadata });
      setRangesConfigured(true);
      setNotice(`CBE achievement ranges updated for ${nationCourses.length} tertiary courses in this nation.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save CBE score bands.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="National CBE and subject settings" subtitle="Maintain national mark bands and subject catalog records.">
      <View style={styles.sectionTabs}>
        {([
          { key: 'ranges' as const, label: 'Achievement ranges' },
          { key: 'subjects' as const, label: 'Subject catalog' },
        ]).map((item) => (
          <TouchableOpacity key={item.key} style={[styles.sectionTab, activeSection === item.key && styles.sectionTabActive]} onPress={() => setActiveSection(item.key)}>
            <Text style={[styles.sectionTabText, activeSection === item.key && styles.sectionTabTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeSection === 'subjects' ? <>
        <Text style={styles.note}>Search by subject name, code, category, or learning area. Select a record and save one field at a time; other subject fields are left unchanged.</Text>
        <PrimaryTextInput value={subjectSearch} onChangeText={setSubjectSearch} placeholder="Search subject name or code" autoCapitalize="none" />
        {loadingSubjects ? <View style={styles.loading}><ActivityIndicator size="small" /><Text style={styles.note}>Loading subjects...</Text></View> : null}
        {!loadingSubjects && searchableSubjects.length === 0 ? <Text style={styles.note}>{subjectSearch.trim() ? 'No subjects match this search.' : 'No subjects are available in the national catalog.'}</Text> : null}
        <View style={styles.subjectList}>
          {searchableSubjects.map((subject) => (
            <TouchableOpacity key={`${subject.kind}-${subject.id}`} style={[styles.subjectRow, selectedSubject?.id === subject.id && selectedSubject.kind === subject.kind && styles.subjectRowSelected]} onPress={() => selectSubjectField(subject, fieldsForSubject(subject)[0])}>
              <View style={styles.subjectRowText}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.note}>{subject.code || 'No code'} · {subject.kind}{subject.category ? ` · ${subject.category}` : ''}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {selectedSubject ? <View style={styles.subjectEditor}>
          <Text style={styles.currentSubjectBadge}>Currently revising: {selectedSubject.name}</Text>
          <Text style={styles.editorTitle}>{selectedSubject.name}</Text>
          <Text style={styles.note}>{selectedSubject.kind} subject · {selectedSubject.code || 'No code'}</Text>
          <View style={styles.fieldChoices}>
            {fieldsForSubject(selectedSubject).map((field) => (
              <TouchableOpacity key={field} style={[styles.fieldChoice, selectedField === field && styles.fieldChoiceActive]} onPress={() => selectSubjectField(selectedSubject, field)}>
                <Text style={[styles.fieldChoiceText, selectedField === field && styles.fieldChoiceTextActive]}>{field === 'learningAreaCode' ? 'Learning area' : field === 'cbeAchievementRanges' ? 'CBE ranges' : field}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedField === 'cbeAchievementRanges' ? (
            <>
              {ranges.map((range, index) => (
                <View key={range.level} style={styles.rangeRow}>
                  <Text style={styles.level}>{range.level}</Text>
                  <PrimaryTextInput value={Number.isFinite(range.minimumMark) ? String(range.minimumMark) : ''} onChangeText={(value) => updateRange(index, 'minimumMark', value)} placeholder="From" keyboardType="numeric" />
                  <Text style={styles.separator}>to</Text>
                  <PrimaryTextInput value={Number.isFinite(range.maximumMark) ? String(range.maximumMark) : ''} onChangeText={(value) => updateRange(index, 'maximumMark', value)} placeholder="Through" keyboardType="numeric" />
                </View>
              ))}
            </>
          ) : (
            <PrimaryTextInput value={fieldDraft} onChangeText={setFieldDraft} placeholder={`New ${selectedField === 'learningAreaCode' ? 'learning area code' : selectedField}`} autoCapitalize={selectedField === 'code' || selectedField === 'learningAreaCode' ? 'characters' : 'sentences'} />
          )}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.button} onPress={() => void saveSubjectField()} disabled={savingSubject}>
              <Text style={styles.buttonText}>{savingSubject ? 'Saving...' : `Save ${selectedField === 'learningAreaCode' ? 'learning area' : selectedField === 'cbeAchievementRanges' ? 'CBE ranges' : selectedField}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => void deleteSelectedSubject()} disabled={savingSubject}>
              <Text style={styles.deleteButtonText}>{savingSubject ? 'Working...' : 'Delete subject'}</Text>
            </TouchableOpacity>
          </View>
        </View> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </> : <>
      {loading ? <View style={styles.loading}><ActivityIndicator size="small" /><Text style={styles.note}>Loading national ranges...</Text></View> : null}
      {!loading && !nation ? <Text style={styles.notice}>{notice}</Text> : null}
      {!loading && nation ? <>
        <Text style={rangesConfigured ? styles.note : styles.missingNotice}>{rangesConfigured ? `National office: ${nation.code}. Ranges must cover marks 0 through 100 with no gaps or overlap.` : `National office: ${nation.code}. These displayed values are examples only and are not saved yet. Nation-wide ranges are optional for course setup; each subject added to a course must have its own valid CBE ranges saved in the subject catalog.`}</Text>

        <Text style={styles.note}>Search a subject below, then revise its eight CBE level bands.</Text>
        <PrimaryTextInput
          value={subjectSearch}
          onChangeText={setSubjectSearch}
          placeholder="Type a subject name or code"
          autoCapitalize="none"
        />

        <View style={styles.subjectList}>
          {searchableSubjects.length > 0 ? searchableSubjects.map((subject) => (
            <TouchableOpacity
              key={`${subject.kind}-${subject.id}`}
              style={[styles.subjectRow, selectedSubject?.id === subject.id && selectedSubject.kind === subject.kind && styles.subjectRowSelected]}
              onPress={() => {
                setNotice('');
                setSelectedSubject(subject);
                setSelectedField('cbeAchievementRanges');
                setRanges(parseCbeAchievementRanges(subject.cbeAchievementRanges));
              }}
            >
              <View style={styles.subjectRowText}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.note}>{subject.code || 'No code'} · {subject.kind}{subject.category ? ` · ${subject.category}` : ''}</Text>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={styles.note}>{subjectSearch.trim() ? 'No subject matches this search.' : 'No subjects are available in the catalog yet.'}</Text>
          )}
        </View>

        {selectedSubject ? (
          <View style={styles.subjectEditor}>
            <Text style={styles.currentSubjectBadge}>Currently revising: {selectedSubject.name}</Text>
            <Text style={styles.note}>{selectedSubject.kind} subject · {selectedSubject.code || 'No code'}</Text>
            {ranges.map((range, index) => (
              <View key={range.level} style={styles.rangeRow}>
                <Text style={styles.level}>{range.level}</Text>
                <PrimaryTextInput value={Number.isFinite(range.minimumMark) ? String(range.minimumMark) : ''} onChangeText={(value) => updateRange(index, 'minimumMark', value)} placeholder="From" keyboardType="numeric" />
                <Text style={styles.separator}>to</Text>
                <PrimaryTextInput value={Number.isFinite(range.maximumMark) ? String(range.maximumMark) : ''} onChangeText={(value) => updateRange(index, 'maximumMark', value)} placeholder="Through" keyboardType="numeric" />
              </View>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => void saveSubjectField()} disabled={savingSubject}>
              <Text style={styles.buttonText}>{savingSubject ? 'Saving...' : `Save ${selectedSubject.name} ranges`}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </> : null}
      </>}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#cbd5e1', marginBottom: 12 },
  sectionTab: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  sectionTabActive: { borderBottomColor: '#0f766e' },
  sectionTabText: { color: '#475569', fontWeight: '600', textTransform: 'capitalize' },
  sectionTabTextActive: { color: '#0f766e', fontWeight: '700' },
  subjectList: { maxHeight: 380, borderTopWidth: 1, borderColor: '#e2e8f0', marginTop: 8 },
  subjectRow: { paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  subjectRowSelected: { backgroundColor: '#ecfdf5' },
  subjectRowText: { gap: 3 },
  subjectName: { color: '#0f172a', fontWeight: '700' },
  subjectEditor: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#cbd5e1' },
  currentSubjectBadge: { backgroundColor: '#ecfeff', color: '#0f766e', borderWidth: 1, borderColor: '#99f6e4', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, fontSize: 12, fontWeight: '700', marginBottom: 8, overflow: 'hidden' },
  editorTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  fieldChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 10 },
  fieldChoice: { borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 4 },
  fieldChoiceActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  fieldChoiceText: { color: '#334155', fontSize: 12, textTransform: 'capitalize' },
  fieldChoiceTextActive: { color: '#fff', fontWeight: '700' },
  note: { color: '#475569', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  missingNotice: { color: '#9a3412', backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fdba74', padding: 10, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderColor: '#e2e8f0', paddingVertical: 6 },
  level: { width: 48, color: '#0f172a', fontWeight: '700' },
  separator: { color: '#475569', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  button: { flex: 1, backgroundColor: '#1d4ed8', paddingVertical: 13, alignItems: 'center', borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '700' },
  deleteButton: { flex: 1, backgroundColor: '#b91c1c', paddingVertical: 13, alignItems: 'center', borderRadius: 6 },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
  notice: { color: '#334155', fontSize: 13, marginTop: 10 },
});
