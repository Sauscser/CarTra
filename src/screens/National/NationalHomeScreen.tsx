import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import {
  createCompetency,
  createOrgHierarchy,
  createPathway,
  createRegionalOfficerProfile,
  createSubject,
  createTrack,
  createUser,
} from '../../graphql/mutations';
import {
  listCompetencies,
  listCoreSubjects,
  listJuniorLearningAreas,
  listJuniorSubjects,
  listOrgHierarchies,
  listPathways,
  listSubjects,
  listSupportSubjects,
  listTracks,
} from '../../graphql/queries';
import { RegionItem } from '../../types/hierarchy';
import useScopePath from '../../hooks/useScopePath';
import SectionCard from '../../components/shared/SectionCard';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import OrgEntityList from '../../components/lists/OrgEntityList';

export default function NationalHomeScreen() {
  return <NationalRegionsContent />;
}

export function NationalCatalogContent() {
  const client = useMemo(() => generateClient(), []);
  const [activeSection, setActiveSection] = useState<'seniorSecondary' | 'juniorSecondary' | 'sneVocational' | 'competency' | 'coreValue' | null>('seniorSecondary');
  const [seniorSubSection, setSeniorSubSection] = useState<'pathway' | 'track' | 'coreSubjects' | 'supportSubjects' | 'electives' | 'electiveTrack' | 'electiveSubject' | 'seniorViewSubjects' | null>('pathway');
  const [juniorSubSection, setJuniorSubSection] = useState<'addLearningArea' | 'addSubject' | 'juniorViewSubjects' | null>('addLearningArea');
  const [sneSubSection, setSNESubSection] = useState<'addLearningArea' | 'sneViewLearningAreas' | null>('addLearningArea');
  const [electiveGroup, setElectiveGroup] = useState<'STEM' | 'Social sciences' | 'Business Studies' | 'Sports Science and Creative Arts' | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [coreSubjectCode, setCoreSubjectCode] = useState('');
  const [coreSubjectName, setCoreSubjectName] = useState('');
  const [coreSubjectDescription, setCoreSubjectDescription] = useState('');
  const [supportSubjectCode, setSupportSubjectCode] = useState('');
  const [supportSubjectName, setSupportSubjectName] = useState('');
  const [supportSubjectDescription, setSupportSubjectDescription] = useState('');
  const [juniorLearningAreaCode, setJuniorLearningAreaCode] = useState('');
  const [juniorLearningAreaName, setJuniorLearningAreaName] = useState('');
  const [juniorLearningAreaDescription, setJuniorLearningAreaDescription] = useState('');
  const [juniorSubjectCode, setJuniorSubjectCode] = useState('');
  const [juniorSubjectName, setJuniorSubjectName] = useState('');
  const [juniorSubjectLearningAreaCode, setJuniorSubjectLearningAreaCode] = useState('');
  const [juniorSubjectDescription, setJuniorSubjectDescription] = useState('');
  const [sneLearningAreaCode, setSnelLearningAreaCode] = useState('');
  const [sneLearningAreaName, setSnelLearningAreaName] = useState('');
  const [sneLearningAreaDescription, setSnelLearningAreaDescription] = useState('');
  const [sneSubjectCode, setSnelSubjectCode] = useState('');
  const [sneSubjectName, setSnelSubjectName] = useState('');
  const [sneSubjectLearningAreaCode, setSnelSubjectLearningAreaCode] = useState('');
  const [sneSubjectDescription, setSnelSubjectDescription] = useState('');
  const [trackCode, setTrackCode] = useState('');
  const [trackName, setTrackName] = useState('');
  const [trackDescription, setTrackDescription] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [pathwayCode, setPathwayCode] = useState('');
  const [pathwayName, setPathwayName] = useState('');
  const [selectedPathwayId, setSelectedPathwayId] = useState('');
  const [pathwayDescription, setPathwayDescription] = useState('');
  const [competencyCode, setCompetencyCode] = useState('');
  const [competencyName, setCompetencyName] = useState('');
  const [competencyDomain, setCompetencyDomain] = useState('');
  const [competencyDescription, setCompetencyDescription] = useState('');
  const [coreValueCode, setCoreValueCode] = useState('');
  const [coreValueName, setCoreValueName] = useState('');
  const [coreValueDescription, setCoreValueDescription] = useState('');
  const [subjects, setSubjects] = useState<Array<{ id: string; code: string; name: string; category?: string | null }>>([]);
  const [coreSubjects, setCoreSubjects] = useState<Array<{ id: string; code: string; name: string; category?: string | null }>>([]);
  const [supportSubjects, setSupportSubjects] = useState<Array<{ id: string; code: string; name: string; category?: string | null }>>([]);
  const [juniorLearningAreas, setJuniorLearningAreas] = useState<Array<{ id: string; code: string; name: string; description?: string | null }>>([]);
  const [juniorSubjects, setJuniorSubjects] = useState<Array<{ id: string; code: string; name: string; learningAreaCode?: string | null; description?: string | null }>>([]);
  const [tracks, setTracks] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [pathways, setPathways] = useState<Array<{ id: string; code: string; name: string; trackId?: string | null }>>([]);
  const [competencies, setCompetencies] = useState<Array<{ id: string; code: string; name: string; domain?: string | null }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void loadCatalog();
  }, []);

  useEffect(() => {
    if (!selectedPathwayId && pathways.length > 0) {
      setSelectedPathwayId(pathways[0].code);
    }
  }, [pathways, selectedPathwayId]);

  useEffect(() => {
    if (!selectedTrackId && tracks.length > 0) {
      setSelectedTrackId(tracks[0].code);
    }
  }, [tracks, selectedTrackId]);

  const loadCatalog = async () => {
    try {
      const [subjectResult, coreSubjectResult, supportSubjectResult, juniorAreaResult, juniorSubjectResult, trackResult, pathwayResult, competencyResult] = await Promise.all([
        client.graphql({ query: listSubjects, variables: { limit: 100 } }),
        client.graphql({ query: listCoreSubjects, variables: { limit: 100 } }),
        client.graphql({ query: listSupportSubjects, variables: { limit: 100 } }),
        client.graphql({ query: listJuniorLearningAreas, variables: { limit: 100 } }),
        client.graphql({ query: listJuniorSubjects, variables: { limit: 100 } }),
        client.graphql({ query: listTracks, variables: { limit: 100 } }),
        client.graphql({ query: listPathways, variables: { limit: 100 } }),
        client.graphql({ query: listCompetencies, variables: { limit: 100 } }),
      ]);

      const subjectPayload = subjectResult as { data?: { listSubjects?: { items?: Array<any> } } };
      const coreSubjectPayload = coreSubjectResult as { data?: { listCoreSubjects?: { items?: Array<any> } } };
      const supportSubjectPayload = supportSubjectResult as { data?: { listSupportSubjects?: { items?: Array<any> } } };
      const juniorAreaPayload = juniorAreaResult as { data?: { listJuniorLearningAreas?: { items?: Array<any> } } };
      const juniorSubjectPayload = juniorSubjectResult as { data?: { listJuniorSubjects?: { items?: Array<any> } } };
      const trackPayload = trackResult as { data?: { listTracks?: { items?: Array<any> } } };
      const pathwayPayload = pathwayResult as { data?: { listPathways?: { items?: Array<any> } } };
      const competencyPayload = competencyResult as { data?: { listCompetencies?: { items?: Array<any> } } };

      const mappedSubjects = (subjectPayload.data?.listSubjects?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name, category: item.category }));
      const mappedCoreSubjects = (coreSubjectPayload.data?.listCoreSubjects?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name, category: item.category || 'Core' }));
      const mappedSupportSubjects = (supportSubjectPayload.data?.listSupportSubjects?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name, category: item.category || 'Support' }));
      const mappedJuniorAreas = (juniorAreaPayload.data?.listJuniorLearningAreas?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name, description: item.description }));
      const mappedJuniorSubjects = (juniorSubjectPayload.data?.listJuniorSubjects?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name, learningAreaCode: item.learningAreaCode, description: item.description }));

      setSubjects(mappedSubjects);
      setCoreSubjects(mappedCoreSubjects);
      setSupportSubjects(mappedSupportSubjects);
      setJuniorLearningAreas(mappedJuniorAreas);
      setJuniorSubjects(mappedJuniorSubjects);
      setTracks((trackPayload.data?.listTracks?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name })));
      setPathways((pathwayPayload.data?.listPathways?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name, trackId: item.trackId })));
      setCompetencies((competencyPayload.data?.listCompetencies?.items || []).filter((item: any) => item?.id && item?.code && item?.name).map((item: any) => ({ id: item.id, code: item.code, name: item.name, domain: item.domain })));
    } catch {
      setNotice('Could not load the master catalog right now.');
    }
  };

  const handleCreateSubject = async () => {
    if (!subjectCode.trim() || !subjectName.trim() || !selectedPathwayId.trim() || !selectedTrackId.trim()) {
      setNotice('Please select a pathway and a track before creating the subject.');
      return;
    }

    const subjectGroup = `${selectedPathwayId.trim()} / ${selectedTrackId.trim()}`;

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: createSubject,
        variables: {
          input: {
            code: subjectCode.trim().toUpperCase(),
            name: subjectName.trim(),
            category: subjectGroup,
            description: subjectDescription.trim() || null,
            status: 'active',
          },
        },
      });
      setSubjectCode('');
      setSubjectName('');
      setSubjectDescription('');
      await loadCatalog();
      setNotice('Subject created successfully under the selected pathway and track.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create subject.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const seniorSubjects = [
    ...subjects.map((item) => ({ ...item, type: 'Elective' as const })),
    ...coreSubjects.map((item) => ({ ...item, type: 'Core' as const })),
    ...supportSubjects.map((item) => ({ ...item, type: 'Support' as const })),
  ];

  const handleCreateCoreSubject = async () => {
    if (!coreSubjectCode.trim() || !coreSubjectName.trim()) {
      setNotice('Please fill the core subject code and name.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: `mutation CreateCoreSubject($input: CreateCoreSubjectInput!) { createCoreSubject(input: $input) { id code name category description status } }`,
        variables: {
          input: {
            code: coreSubjectCode.trim().toUpperCase(),
            name: coreSubjectName.trim(),
            category: 'core',
            description: coreSubjectDescription.trim() || null,
            status: 'active',
          },
        },
      });
      setCoreSubjectCode('');
      setCoreSubjectName('');
      setCoreSubjectDescription('');
      await loadCatalog();
      setNotice('Core subject created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create core subject.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSupportSubject = async () => {
    if (!supportSubjectCode.trim() || !supportSubjectName.trim()) {
      setNotice('Please fill the support subject code and name.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: `mutation CreateSupportSubject($input: CreateSupportSubjectInput!) { createSupportSubject(input: $input) { id code name category description status } }`,
        variables: {
          input: {
            code: supportSubjectCode.trim().toUpperCase(),
            name: supportSubjectName.trim(),
            category: 'support',
            description: supportSubjectDescription.trim() || null,
            status: 'active',
          },
        },
      });
      setSupportSubjectCode('');
      setSupportSubjectName('');
      setSupportSubjectDescription('');
      await loadCatalog();
      setNotice('Support subject created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create support subject.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateJuniorLearningArea = async () => {
    if (!juniorLearningAreaCode.trim() || !juniorLearningAreaName.trim()) {
      setNotice('Please fill the junior learning area code and name.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: `mutation CreateJuniorLearningArea($input: CreateJuniorLearningAreaInput!) { createJuniorLearningArea(input: $input) { id code name description status } }`,
        variables: {
          input: {
            code: juniorLearningAreaCode.trim().toUpperCase(),
            name: juniorLearningAreaName.trim(),
            description: juniorLearningAreaDescription.trim() || null,
            status: 'active',
          },
        },
      });
      setJuniorLearningAreaCode('');
      setJuniorLearningAreaName('');
      setJuniorLearningAreaDescription('');
      await loadCatalog();
      setNotice('Junior learning area created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create junior learning area.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateJuniorSubject = async () => {
    if (!juniorSubjectCode.trim() || !juniorSubjectName.trim() || !juniorSubjectLearningAreaCode.trim()) {
      setNotice('Please fill the junior subject code, name, and learning area code.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: `mutation CreateJuniorSubject($input: CreateJuniorSubjectInput!) { createJuniorSubject(input: $input) { id code name learningAreaCode description status } }`,
        variables: {
          input: {
            code: juniorSubjectCode.trim().toUpperCase(),
            name: juniorSubjectName.trim(),
            learningAreaCode: juniorSubjectLearningAreaCode.trim().toUpperCase(),
            description: juniorSubjectDescription.trim() || null,
            status: 'active',
          },
        },
      });
      setJuniorSubjectCode('');
      setJuniorSubjectName('');
      setJuniorSubjectLearningAreaCode('');
      setJuniorSubjectDescription('');
      await loadCatalog();
      setNotice('Junior subject created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create junior subject.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSNELearningArea = async () => {
    if (!sneLearningAreaCode.trim() || !sneLearningAreaName.trim()) {
      setNotice('Please fill the SNE learning area code and name.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: `mutation CreateSNELearningArea($input: CreateSNELearningAreaInput!) { createSNELearningArea(input: $input) { id code name description status } }`,
        variables: {
          input: {
            code: sneLearningAreaCode.trim().toUpperCase(),
            name: sneLearningAreaName.trim(),
            description: sneLearningAreaDescription.trim() || null,
            status: 'active',
          },
        },
      });
      setSnelLearningAreaCode('');
      setSnelLearningAreaName('');
      setSnelLearningAreaDescription('');
      await loadCatalog();
      setNotice('SNE learning area created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create SNE learning area.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSNESubject = async () => {
    if (!sneSubjectCode.trim() || !sneSubjectName.trim() || !sneSubjectLearningAreaCode.trim()) {
      setNotice('Please fill the SNE subject code, name, and learning area code.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: `mutation CreateSNESubject($input: CreateSNESubjectInput!) { createSNESubject(input: $input) { id code name learningAreaCode description status } }`,
        variables: {
          input: {
            code: sneSubjectCode.trim().toUpperCase(),
            name: sneSubjectName.trim(),
            learningAreaCode: sneSubjectLearningAreaCode.trim().toUpperCase(),
            description: sneSubjectDescription.trim() || null,
            status: 'active',
          },
        },
      });
      setSnelSubjectCode('');
      setSnelSubjectName('');
      setSnelSubjectLearningAreaCode('');
      setSnelSubjectDescription('');
      await loadCatalog();
      setNotice('SNE subject created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create SNE subject.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTrack = async () => {
    if (!trackCode.trim() || !trackName.trim() || !selectedTrackId.trim()) {
      setNotice('Please choose a pathway first, then create the track under it.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: createTrack,
        variables: {
          input: {
            code: trackCode.trim().toUpperCase(),
            name: trackName.trim(),
            description: trackDescription.trim() || null,
            status: 'active',
          },
        },
      });
      const createdTrack = (await client.graphql({
        query: listTracks,
        variables: { limit: 200 },
      })) as { data?: { listTracks?: { items?: Array<{ id: string; code: string; name: string }> } } };
      const trackItem = (createdTrack.data?.listTracks?.items || []).find((item) => item.code === trackCode.trim().toUpperCase() && item.name === trackName.trim());

      if (trackItem) {
        await client.graphql({
          query: createPathway,
          variables: {
            input: {
              code: selectedTrackId,
              name: trackName.trim(),
              trackId: trackItem.id,
              description: trackDescription.trim() || `Pathway for ${trackName.trim()}`,
              status: 'active',
            },
          },
        });
      }

      setTrackCode('');
      setTrackName('');
      setSelectedTrackId('');
      setTrackDescription('');
      await loadCatalog();
      setNotice('Track created successfully under the selected pathway.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create track.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePathway = async () => {
    if (!pathwayCode.trim() || !pathwayName.trim()) {
      setNotice('Please fill the pathway code and pathway name.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: createPathway,
        variables: {
          input: {
            code: pathwayCode.trim().toUpperCase(),
            name: pathwayName.trim(),
            trackId: selectedPathwayId || null,
            description: pathwayDescription.trim() || null,
            status: 'active',
          },
        },
      });
      setPathwayCode('');
      setPathwayName('');
      setSelectedPathwayId('');
      setPathwayDescription('');
      await loadCatalog();
      setNotice('Pathway created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create pathway.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCompetency = async () => {
    if (!competencyCode.trim() || !competencyName.trim()) {
      setNotice('Please fill the competency code and competency name.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: createCompetency,
        variables: {
          input: {
            code: competencyCode.trim().toUpperCase(),
            name: competencyName.trim(),
            description: competencyDescription.trim() || null,
            domain: competencyDomain.trim() || 'competency',
            status: 'active',
          },
        },
      });
      setCompetencyCode('');
      setCompetencyName('');
      setCompetencyDomain('');
      setCompetencyDescription('');
      await loadCatalog();
      setNotice('Competency created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create competency.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCoreValue = async () => {
    if (!coreValueCode.trim() || !coreValueName.trim()) {
      setNotice('Please fill the core value code and core value name.');
      return;
    }

    try {
      setIsSaving(true);
      setNotice('');
      await client.graphql({
        query: createCompetency,
        variables: {
          input: {
            code: coreValueCode.trim().toUpperCase(),
            name: coreValueName.trim(),
            description: coreValueDescription.trim() || null,
            domain: 'core-value',
            status: 'active',
          },
        },
      });
      setCoreValueCode('');
      setCoreValueName('');
      setCoreValueDescription('');
      await loadCatalog();
      setNotice('Core value created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create core value.';
      setNotice(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.catalogScroll, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <SectionCard title="Master Catalog" subtitle="Organize the national curriculum catalogue by phase and track it by academic structure.">
        <View style={styles.buttonStack}>
          {[
            { key: 'seniorSecondary', label: 'Senior secondary' },
            { key: 'juniorSecondary', label: 'Junior secondary' },
            { key: 'sneVocational', label: 'Vocational SNE' },
            { key: 'competency', label: 'Core competencies' },
            { key: 'coreValue', label: 'Core values' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.catalogButton, activeSection === item.key ? styles.catalogButtonActive : null]}
              onPress={() => {
                setActiveSection(item.key as any);
                if (item.key === 'seniorSecondary') {
                  setSeniorSubSection('coreSubjects');
                }
                if (item.key === 'juniorSecondary') {
                  setJuniorSubSection('addLearningArea');
                }
                if (item.key === 'sneVocational') {
                  setSNESubSection('addLearningArea');
                }
              }}
            >
              <Text style={[styles.catalogButtonText, activeSection === item.key ? styles.catalogButtonTextActive : null]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeSection === 'seniorSecondary' ? (
          <View style={styles.catalogGroup}>
            <Text style={styles.catalogTitle}>Senior secondary</Text>
            <View style={styles.buttonStack}>
              {[
                { key: 'pathway', label: 'Pathway' },
                { key: 'track', label: 'Track' },
                { key: 'coreSubjects', label: 'Core Subjects' },
                { key: 'supportSubjects', label: 'Support subjects' },
                { key: 'electives', label: 'Electives' },
                { key: 'seniorViewSubjects', label: 'View subjects' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.catalogButton, seniorSubSection === item.key ? styles.catalogButtonActive : null]}
                  onPress={() => setSeniorSubSection(item.key as any)}
                >
                  <Text style={[styles.catalogButtonText, seniorSubSection === item.key ? styles.catalogButtonTextActive : null]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {seniorSubSection === 'pathway' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Add pathway</Text>
                <PrimaryTextInput value={pathwayCode} onChangeText={setPathwayCode} placeholder="Pathway code" autoCapitalize="characters" />
                <PrimaryTextInput value={pathwayName} onChangeText={setPathwayName} placeholder="Pathway name" />
                <PrimaryTextInput value={pathwayDescription} onChangeText={setPathwayDescription} placeholder="Description (optional)" />
                <TouchableOpacity style={styles.button} onPress={() => void handleCreatePathway()} disabled={isSaving}>
                  <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Create Pathway'}</Text>
                </TouchableOpacity>
                {pathways.length > 0 ? (
                  <View style={styles.listBox}>
                    {pathways.map((item) => (
                      <TouchableOpacity key={item.id} style={styles.listItemButton} onPress={() => setSelectedPathwayId(item.code)}>
                        <Text style={styles.listItem}>{item.code} • {item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noteText}>No pathways created yet.</Text>
                )}
              </View>
            ) : null}

            {seniorSubSection === 'track' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Add track under a pathway</Text>
                <Text style={styles.noteText}>Choose a pathway, then add the track below.</Text>
                {pathways.length > 0 ? (
                  <View style={styles.listBox}>
                    {pathways.map((item) => (
                      <TouchableOpacity key={item.id} style={styles.listItemButton} onPress={() => setSelectedPathwayId(item.code)}>
                        <Text style={styles.listItem}>{item.code} • {item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noteText}>Create a pathway first.</Text>
                )}
                <Text style={styles.selectionText}>Selected pathway code: {selectedPathwayId || 'None'}</Text>
                <PrimaryTextInput value={trackCode} onChangeText={setTrackCode} placeholder="Track code" autoCapitalize="characters" />
                <PrimaryTextInput value={trackName} onChangeText={setTrackName} placeholder="Track name" />
                <PrimaryTextInput value={trackDescription} onChangeText={setTrackDescription} placeholder="Track description (optional)" />
                <TouchableOpacity style={styles.button} onPress={() => void handleCreateTrack()} disabled={isSaving}>
                  <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Create Track'}</Text>
                </TouchableOpacity>
                {tracks.length > 0 ? (
                  <View style={styles.listBox}>
                    {tracks.map((item) => (
                      <Text key={item.id} style={styles.listItem}>{item.code} • {item.name}</Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {seniorSubSection === 'coreSubjects' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Core subjects</Text>
                <PrimaryTextInput value={coreSubjectCode} onChangeText={setCoreSubjectCode} placeholder="Core subject code" autoCapitalize="characters" />
                <PrimaryTextInput value={coreSubjectName} onChangeText={setCoreSubjectName} placeholder="Core subject name" />
                <PrimaryTextInput value={coreSubjectDescription} onChangeText={setCoreSubjectDescription} placeholder="Description (optional)" />
                <TouchableOpacity style={styles.button} onPress={() => void handleCreateCoreSubject()} disabled={isSaving}>
                  <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Add Core Subject'}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {seniorSubSection === 'supportSubjects' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Support subjects</Text>
                <PrimaryTextInput value={supportSubjectCode} onChangeText={setSupportSubjectCode} placeholder="Support subject code" autoCapitalize="characters" />
                <PrimaryTextInput value={supportSubjectName} onChangeText={setSupportSubjectName} placeholder="Support subject name" />
                <PrimaryTextInput value={supportSubjectDescription} onChangeText={setSupportSubjectDescription} placeholder="Description (optional)" />
                <TouchableOpacity style={styles.buttonSecondary} onPress={() => void handleCreateSupportSubject()} disabled={isSaving}>
                  <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Add Support Subject'}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {seniorSubSection === 'electives' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Electives</Text>
                <View style={styles.buttonStack}>
                  {['STEM', 'Social sciences', 'Business Studies', 'Sports Science and Creative Arts'].map((group) => (
                    <TouchableOpacity
                      key={group}
                      style={[styles.catalogButton, electiveGroup === group ? styles.catalogButtonActive : null]}
                      onPress={() => {
                        setElectiveGroup(group as any);
                        setSeniorSubSection('electiveTrack');
                      }}
                    >
                      <Text style={[styles.catalogButtonText, electiveGroup === group ? styles.catalogButtonTextActive : null]}>{group}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {seniorSubSection === 'electiveTrack' || seniorSubSection === 'electiveSubject' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>{electiveGroup || 'Elective group'}</Text>
                <View style={styles.buttonStack}>
                  <TouchableOpacity
                    style={[styles.catalogButton, seniorSubSection === 'electiveTrack' ? styles.catalogButtonActive : null]}
                    onPress={() => setSeniorSubSection('electiveTrack')}
                  >
                    <Text style={[styles.catalogButtonText, seniorSubSection === 'electiveTrack' ? styles.catalogButtonTextActive : null]}>Add Track</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.catalogButton, seniorSubSection === 'electiveSubject' ? styles.catalogButtonActive : null]}
                    onPress={() => setSeniorSubSection('electiveSubject')}
                  >
                    <Text style={[styles.catalogButtonText, seniorSubSection === 'electiveSubject' ? styles.catalogButtonTextActive : null]}>Add subjects</Text>
                  </TouchableOpacity>
                </View>

                {seniorSubSection === 'electiveTrack' ? (
                  <View style={styles.catalogGroup}>
                    <Text style={styles.noteText}>Select a pathway, then add a track under it.</Text>
                    {pathways.length > 0 ? (
                      <View style={styles.listBox}>
                        {pathways.map((item) => (
                          <TouchableOpacity key={item.id} style={styles.listItemButton} onPress={() => setSelectedPathwayId(item.code)}>
                            <Text style={styles.listItem}>{item.code} • {item.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                    <Text style={styles.selectionText}>Selected pathway code: {selectedPathwayId || 'None'}</Text>
                    <PrimaryTextInput value={trackCode} onChangeText={setTrackCode} placeholder="Track code" autoCapitalize="characters" />
                    <PrimaryTextInput value={trackName} onChangeText={setTrackName} placeholder="Track name" />
                    <PrimaryTextInput value={trackDescription} onChangeText={setTrackDescription} placeholder="Track description (optional)" />
                    <TouchableOpacity style={styles.button} onPress={() => void handleCreateTrack()} disabled={isSaving}>
                      <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Create Track'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {seniorSubSection === 'electiveSubject' ? (
                  <View style={styles.catalogGroup}>
                    <Text style={styles.noteText}>Choose a track, then add a subject under it.</Text>
                    {tracks.length > 0 ? (
                      <View style={styles.listBox}>
                        {tracks.map((item) => (
                          <TouchableOpacity key={item.id} style={styles.listItemButton} onPress={() => setSelectedTrackId(item.code)}>
                            <Text style={styles.listItem}>{item.code} • {item.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                    <Text style={styles.selectionText}>Selected pathway code: {selectedPathwayId || 'None'}</Text>
                    <Text style={styles.selectionText}>Selected track code: {selectedTrackId || 'None'}</Text>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoBoxLabel}>Subject group</Text>
                      <Text style={styles.infoBoxValue}>{selectedPathwayId && selectedTrackId ? `${selectedPathwayId} / ${selectedTrackId}` : 'Select a pathway and a track first'}</Text>
                    </View>
                    <PrimaryTextInput value={subjectCode} onChangeText={setSubjectCode} placeholder="Subject code" autoCapitalize="characters" />
                    <PrimaryTextInput value={subjectName} onChangeText={setSubjectName} placeholder="Subject name" />
                    <PrimaryTextInput value={subjectDescription} onChangeText={setSubjectDescription} placeholder="Description (optional)" />
                    <TouchableOpacity style={styles.button} onPress={() => void handleCreateSubject()} disabled={isSaving}>
                      <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Create Subject'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : null}

            {seniorSubSection === 'seniorViewSubjects' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Available senior secondary subjects</Text>
                {seniorSubjects.length > 0 ? (
                  <View style={styles.listBox}>
                    {seniorSubjects.map((item) => (
                      <View key={`${item.type}-${item.id}`} style={styles.listItemRow}>
                        <Text style={styles.listItem}>{item.code} • {item.name}</Text>
                        <Text style={styles.smallMeta}>{item.type} • {item.category ? `Group: ${item.category}` : 'Group: general'}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noteText}>No subjects created yet.</Text>
                )}
              </View>
            ) : null}
          </View>
        ) : null}

        {activeSection === 'juniorSecondary' ? (
          <View style={styles.catalogGroup}>
            <Text style={styles.catalogTitle}>Junior secondary</Text>
            <View style={styles.buttonStack}>
              {[
                { key: 'addLearningArea', label: 'Add Learning Area' },
                { key: 'addSubject', label: 'Add subject' },
                { key: 'juniorViewSubjects', label: 'View subjects' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.catalogButton, juniorSubSection === item.key ? styles.catalogButtonActive : null]}
                  onPress={() => setJuniorSubSection(item.key as any)}
                >
                  <Text style={[styles.catalogButtonText, juniorSubSection === item.key ? styles.catalogButtonTextActive : null]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {juniorSubSection === 'addLearningArea' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Add junior learning area</Text>
                <PrimaryTextInput value={juniorLearningAreaCode} onChangeText={setJuniorLearningAreaCode} placeholder="Junior learning area code" autoCapitalize="characters" />
                <PrimaryTextInput value={juniorLearningAreaName} onChangeText={setJuniorLearningAreaName} placeholder="Junior learning area name" />
                <PrimaryTextInput value={juniorLearningAreaDescription} onChangeText={setJuniorLearningAreaDescription} placeholder="Description (optional)" />
                <TouchableOpacity style={styles.button} onPress={() => void handleCreateJuniorLearningArea()} disabled={isSaving}>
                  <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Add Learning Area'}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {juniorSubSection === 'addSubject' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Add junior subject</Text>
                <Text style={styles.noteText}>Select a learning area, then create the subject under it.</Text>
                {juniorLearningAreas.length > 0 ? (
                  <View style={styles.listBox}>
                    {juniorLearningAreas.map((item) => (
                      <TouchableOpacity key={item.id} style={styles.listItemButton} onPress={() => setJuniorSubjectLearningAreaCode(item.code)}>
                        <Text style={styles.listItem}>{item.code} • {item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
                <Text style={styles.selectionText}>Selected learning area code: {juniorSubjectLearningAreaCode || 'None'}</Text>
                <PrimaryTextInput value={juniorSubjectLearningAreaCode} onChangeText={setJuniorSubjectLearningAreaCode} placeholder="Learning area code" autoCapitalize="characters" />
                <PrimaryTextInput value={juniorSubjectCode} onChangeText={setJuniorSubjectCode} placeholder="Junior subject code" autoCapitalize="characters" />
                <PrimaryTextInput value={juniorSubjectName} onChangeText={setJuniorSubjectName} placeholder="Junior subject name" />
                <PrimaryTextInput value={juniorSubjectDescription} onChangeText={setJuniorSubjectDescription} placeholder="Description (optional)" />
                <TouchableOpacity style={styles.button} onPress={() => void handleCreateJuniorSubject()} disabled={isSaving}>
                  <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Add Junior Subject'}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {juniorSubSection === 'juniorViewSubjects' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Available junior secondary subjects</Text>
                {juniorSubjects.length > 0 ? (
                  <View style={styles.listBox}>
                    {juniorSubjects.map((item) => (
                      <View key={item.id} style={styles.listItemRow}>
                        <Text style={styles.listItem}>{item.code} • {item.name}</Text>
                        <Text style={styles.smallMeta}>{item.learningAreaCode ? `Learning area: ${item.learningAreaCode}` : 'Learning area: unassigned'}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noteText}>No junior subjects created yet.</Text>
                )}
              </View>
            ) : null}
          </View>
        ) : null}

        {activeSection === 'sneVocational' ? (
          <View style={styles.catalogGroup}>
            <Text style={styles.catalogTitle}>Vocational SNE</Text>
            <View style={styles.buttonStack}>
              {[
                { key: 'addLearningArea', label: 'Add Learning Area' },
                { key: 'sneViewLearningAreas', label: 'View Learning Areas' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.catalogButton, sneSubSection === item.key ? styles.catalogButtonActive : null]}
                  onPress={() => setSNESubSection(item.key as any)}
                >
                  <Text style={[styles.catalogButtonText, sneSubSection === item.key ? styles.catalogButtonTextActive : null]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {sneSubSection === 'addLearningArea' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Add SNE learning area</Text>
                <PrimaryTextInput value={sneLearningAreaCode} onChangeText={setSnelLearningAreaCode} placeholder="SNE learning area code" autoCapitalize="characters" />
                <PrimaryTextInput value={sneLearningAreaName} onChangeText={setSnelLearningAreaName} placeholder="SNE learning area name" />
                <PrimaryTextInput value={sneLearningAreaDescription} onChangeText={setSnelLearningAreaDescription} placeholder="Description (optional)" />
                <TouchableOpacity style={styles.button} onPress={() => void handleCreateSNELearningArea()} disabled={isSaving}>
                  <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Add Learning Area'}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {sneSubSection === 'sneViewLearningAreas' ? (
              <View style={styles.catalogGroup}>
                <Text style={styles.catalogTitle}>Available SNE learning areas</Text>
                {subjects.length > 0 ? (
                  <View style={styles.listBox}>
                    {subjects.map((item) => (
                      <Text key={item.id} style={styles.listItem}>{item.code} • {item.name}</Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noteText}>No SNE learning areas created yet.</Text>
                )}
              </View>
            ) : null}
          </View>
        ) : null}

        {activeSection === 'competency' ? (
          <View style={styles.catalogGroup}>
            <Text style={styles.catalogTitle}>Core competencies</Text>
            <PrimaryTextInput value={competencyCode} onChangeText={setCompetencyCode} placeholder="Competency code" autoCapitalize="characters" />
            <PrimaryTextInput value={competencyName} onChangeText={setCompetencyName} placeholder="Competency name" />
            <PrimaryTextInput value={competencyDomain} onChangeText={setCompetencyDomain} placeholder="Domain (optional)" />
            <PrimaryTextInput value={competencyDescription} onChangeText={setCompetencyDescription} placeholder="Description (optional)" />
            <TouchableOpacity style={styles.button} onPress={() => void handleCreateCompetency()} disabled={isSaving}>
              <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Create Competency'}</Text>
            </TouchableOpacity>
            {competencies.length > 0 ? (
              <View style={styles.listBox}>
                {competencies.map((item) => (
                  <Text key={item.id} style={styles.listItem}>{item.code} • {item.name}</Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {activeSection === 'coreValue' ? (
          <View style={styles.catalogGroup}>
            <Text style={styles.catalogTitle}>Core values</Text>
            <PrimaryTextInput value={coreValueCode} onChangeText={setCoreValueCode} placeholder="Core value code" autoCapitalize="characters" />
            <PrimaryTextInput value={coreValueName} onChangeText={setCoreValueName} placeholder="Core value name" />
            <PrimaryTextInput value={coreValueDescription} onChangeText={setCoreValueDescription} placeholder="Description (optional)" />
            <TouchableOpacity style={styles.buttonSecondary} onPress={() => void handleCreateCoreValue()} disabled={isSaving}>
              <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Create Core Value'}</Text>
            </TouchableOpacity>
            {competencies.filter((item) => item.domain === 'core-value').length > 0 ? (
              <View style={styles.listBox}>
                {competencies.filter((item) => item.domain === 'core-value').map((item) => (
                  <Text key={item.id} style={styles.listItem}>{item.code} • {item.name}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.noteText}>No core values created yet.</Text>
            )}
          </View>
        ) : null}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </SectionCard>
    </ScrollView>
  );
}

export function NationalRegionsContent() {
  const client = useMemo(() => generateClient(), []);
  const [nationCode, setNationCode] = useState('NAT-001');
  const [regionCode, setRegionCode] = useState('');
  const [regionName, setRegionName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerFullName, setOfficerFullName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const scopePath = useScopePath({ nationCode, regionCode });

  useEffect(() => {
    void loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const result = await client.graphql({
        query: listOrgHierarchies,
        variables: {
          filter: { entityType: { eq: 'region' } },
          limit: 100,
        },
      });
      const payload = result as { data?: { listOrgHierarchies?: { items?: Array<any> } } };
      const items = payload.data?.listOrgHierarchies?.items || [];
      const mapped = items
        .filter((item: any): item is RegionItem => Boolean(item?.id && item?.code && item?.name))
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          assignedOfficerEmail: item.assignedOfficerEmail,
        }));
      setRegions(mapped);
    } catch {
      setNotice('Could not load regions right now.');
    }
  };

  const handleCreateRegion = async () => {
    if (!nationCode || !regionCode || !regionName || !officerEmail || !officerFullName) {
      setNotice('Please fill nation, region, and assigned officer details.');
      return;
    }

    try {
      setIsLoading(true);
      setNotice('');

      const userResponse = await client.graphql({
        query: createUser,
        variables: {
          input: {
            email: officerEmail.trim().toLowerCase(),
            phoneNumber: officerPhone.trim() || null,
            role: 'regionalOfficer',
            status: 'active',
            fullName: officerFullName.trim(),
          },
        },
      });

      const userPayload = userResponse as { data?: { createUser?: { id?: string } } };
      const createdUserId = userPayload.data?.createUser?.id;
      if (!createdUserId) {
        throw new Error('Regional officer user record was not created.');
      }

      await client.graphql({
        query: createRegionalOfficerProfile,
        variables: {
          input: {
            userId: createdUserId,
            fullName: officerFullName.trim(),
            nationCode: scopePath.nationCode,
            regionCode: scopePath.regionCode,
            assignedCounties: [],
          },
        },
      });

      await client.graphql({
        query: createOrgHierarchy,
        variables: {
          input: {
            entityType: 'region',
            code: scopePath.regionCode,
            name: regionName.trim(),
            nationCode: scopePath.nationCode,
            regionCode: scopePath.regionCode,
            assignedOfficerEmail: officerEmail.trim().toLowerCase(),
            assignedOfficerRole: 'regionalOfficer',
            status: 'active',
          },
        },
      });

      setNotice('Region and regional officer created successfully.');
      setRegionCode('');
      setRegionName('');
      setOfficerEmail('');
      setOfficerFullName('');
      setOfficerPhone('');
      await loadRegions();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create region and officer.';
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SectionCard
        title="National Office"
        subtitle="Create region records and assign regional officer identity."
      >
        <PrimaryTextInput
          value={nationCode}
          onChangeText={setNationCode}
          placeholder="Nation code (e.g. NAT-001)"
        />
        <PrimaryTextInput
          value={regionCode}
          onChangeText={setRegionCode}
          placeholder="Region code (e.g. NAT-001-RG-001)"
          autoCapitalize="characters"
        />
        <PrimaryTextInput
          value={regionName}
          onChangeText={setRegionName}
          placeholder="Region name"
        />
        <PrimaryTextInput
          value={officerFullName}
          onChangeText={setOfficerFullName}
          placeholder="Regional officer full name"
        />
        <PrimaryTextInput
          value={officerEmail}
          onChangeText={setOfficerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Regional officer email"
        />
        <PrimaryTextInput
          value={officerPhone}
          onChangeText={setOfficerPhone}
          keyboardType="phone-pad"
          placeholder="Regional officer phone (optional)"
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateRegion} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Create Region + Regional Officer'}</Text>
        </TouchableOpacity>

        {notice ? <Text style={styles.message}>{notice}</Text> : null}
      </SectionCard>

      <SectionCard title="Existing Regions">
        <OrgEntityList rows={regions} emptyMessage="No regions found yet." />
      </SectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  container: {
    gap: 16,
    paddingBottom: 20,
  },
  catalogScroll: {
    paddingBottom: 24,
  },
  buttonStack: {
    gap: 10,
    marginBottom: 16,
  },
  catalogButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  catalogButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#60a5fa',
  },
  catalogButtonText: {
    color: '#1f2937',
    fontWeight: '700',
    fontSize: 15,
  },
  catalogButtonTextActive: {
    color: '#1d4ed8',
  },
  catalogGroup: {
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    padding: 14,
  },
  catalogTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 10,
  },
  selectionText: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  listBox: {
    marginTop: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 10,
    gap: 4,
  },
  listItemButton: {
    paddingVertical: 4,
  },
  listItemRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  listItem: {
    fontSize: 12,
    color: '#1e3a8a',
  },
  smallMeta: {
    marginTop: 4,
    fontSize: 11,
    color: '#475569',
  },
  infoBox: {
    marginTop: 10,
    marginBottom: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 10,
  },
  infoBoxLabel: {
    fontSize: 11,
    color: '#1d4ed8',
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoBoxValue: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonSecondary: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    marginTop: 12,
    color: '#374151',
    fontSize: 14,
  },
  notice: {
    marginTop: 12,
    color: '#0f172a',
    fontSize: 14,
  },
});
