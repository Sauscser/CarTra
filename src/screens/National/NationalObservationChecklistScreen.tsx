import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateClient } from 'aws-amplify/api';
import {
  createAssessmentToolParameter,
  createAssessmentToolTemplate,
} from '../../graphql/mutations';
import {
  listAssessmentToolParameters,
  listAssessmentToolTemplates,
} from '../../graphql/queries';
import PrimaryTextInput from '../../components/forms/PrimaryTextInput';
import SectionCard from '../../components/shared/SectionCard';

type AssessmentToolTemplateRow = {
  id: string;
  toolCode: string;
  toolName: string;
  version?: string | null;
  status?: string | null;
};

type AssessmentToolParameterRow = {
  id: string;
  parameterCode: string;
  parameterName: string;
  domain?: string | null;
  maxScore?: number | null;
  weight?: number | null;
  requiresEvidence?: boolean | null;
};

type SeedParameter = {
  code: string;
  name: string;
  domain: string;
};

const DEFAULT_OBSERVATION_PARAMETERS: SeedParameter[] = [
  { code: 'OBS-P01', name: 'Participation and Engagement', domain: 'competency' },
  { code: 'OBS-P02', name: 'Communication Clarity', domain: 'competency' },
  { code: 'OBS-P03', name: 'Collaboration and Teamwork', domain: 'competency' },
  { code: 'OBS-P04', name: 'Responsibility and Task Completion', domain: 'value' },
  { code: 'OBS-P05', name: 'Respect and Integrity', domain: 'value' },
];

export default function NationalObservationChecklistScreen() {
  return <NationalObservationChecklistContent />;
}

export function NationalObservationChecklistContent() {
  const client = useMemo(() => generateClient(), []);
  const [toolCode, setToolCode] = useState('OBS-CHECKLIST-001');
  const [toolName, setToolName] = useState('Observation Checklist');
  const [version, setVersion] = useState('1.0.0');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [maxScore, setMaxScore] = useState('20');
  const [templates, setTemplates] = useState<AssessmentToolTemplateRow[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [parameters, setParameters] = useState<AssessmentToolParameterRow[]>([]);
  const [parameterCode, setParameterCode] = useState('');
  const [parameterName, setParameterName] = useState('');
  const [parameterDomain, setParameterDomain] = useState('competency');
  const [parameterWeight, setParameterWeight] = useState('1');
  const [parameterMaxScore, setParameterMaxScore] = useState('4');
  const [parameterRequiresEvidence, setParameterRequiresEvidence] = useState('false');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isSavingParameter, setIsSavingParameter] = useState(false);
  const [isSeedingDefaults, setIsSeedingDefaults] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void loadTemplates();
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) {
      setParameters([]);
      return;
    }
    void loadParameters(selectedTemplateId);
  }, [selectedTemplateId]);

  const loadTemplates = async () => {
    try {
      const response = await client.graphql({
        query: listAssessmentToolTemplates,
        variables: {
          filter: { toolType: { eq: 'observation_checklist' } },
          limit: 100,
        },
      });

      const payload = response as { data?: { listAssessmentToolTemplates?: { items?: Array<any> } } };
      const items = payload.data?.listAssessmentToolTemplates?.items || [];
      const mapped = items
        .filter((item: any): item is AssessmentToolTemplateRow => Boolean(item?.id && item?.toolCode && item?.toolName))
        .map((item: any) => ({
          id: item.id,
          toolCode: item.toolCode,
          toolName: item.toolName,
          version: item.version,
          status: item.status,
        }));

      setTemplates(mapped);
      if (!selectedTemplateId && mapped.length > 0) {
        setSelectedTemplateId(mapped[0].id);
      }
    } catch {
      setNotice('Could not load observation checklist templates right now.');
    }
  };

  const loadParameters = async (templateId: string) => {
    try {
      const response = await client.graphql({
        query: listAssessmentToolParameters,
        variables: {
          filter: { toolTemplateId: { eq: templateId } },
          limit: 200,
        },
      });

      const payload = response as { data?: { listAssessmentToolParameters?: { items?: Array<any> } } };
      const items = payload.data?.listAssessmentToolParameters?.items || [];
      const mapped = items
        .filter((item: any): item is AssessmentToolParameterRow => Boolean(item?.id && item?.parameterCode && item?.parameterName))
        .map((item: any) => ({
          id: item.id,
          parameterCode: item.parameterCode,
          parameterName: item.parameterName,
          domain: item.domain,
          maxScore: item.maxScore,
          weight: item.weight,
          requiresEvidence: item.requiresEvidence,
        }));

      setParameters(mapped);
    } catch {
      setNotice('Could not load checklist parameters right now.');
    }
  };

  const handleCreateTemplate = async () => {
    if (!toolCode.trim() || !toolName.trim() || !version.trim() || !academicYear.trim()) {
      setNotice('Please provide template code, name, version, and academic year.');
      return;
    }

    const parsedMaxScore = Number(maxScore);
    if (Number.isNaN(parsedMaxScore) || parsedMaxScore <= 0) {
      setNotice('Template max score must be a positive number.');
      return;
    }

    try {
      setIsSavingTemplate(true);
      setNotice('');

      const response = await client.graphql({
        query: createAssessmentToolTemplate,
        variables: {
          input: {
            toolCode: toolCode.trim().toUpperCase(),
            toolName: toolName.trim(),
            toolType: 'observation_checklist',
            category: 'competency_values',
            description: 'Teacher observation checklist for competency and values capture.',
            requiresEvidenceDefault: false,
            scoringMode: 'mixed',
            maxScore: parsedMaxScore,
            levelScaleJson: JSON.stringify({
              '1': 'beginning',
              '2': 'developing',
              '3': 'proficient',
              '4': 'exemplary',
            }),
            rubricJson: JSON.stringify({
              note: 'Observation checklist baseline rubric. National officer can edit and version this.',
            }),
            academicYear: academicYear.trim(),
            version: version.trim(),
            status: 'ACTIVE',
          },
        },
      });

      const payload = response as { data?: { createAssessmentToolTemplate?: { id?: string } } };
      const createdTemplateId = payload.data?.createAssessmentToolTemplate?.id;

      await loadTemplates();
      if (createdTemplateId) {
        setSelectedTemplateId(createdTemplateId);
      }

      setNotice('Observation checklist template created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create template.';
      setNotice(message);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleAddParameter = async () => {
    if (!selectedTemplateId) {
      setNotice('Select a template before adding parameters.');
      return;
    }

    if (!parameterCode.trim() || !parameterName.trim()) {
      setNotice('Provide parameter code and name.');
      return;
    }

    const parsedWeight = Number(parameterWeight);
    const parsedMaxScore = Number(parameterMaxScore);
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0 || Number.isNaN(parsedMaxScore) || parsedMaxScore <= 0) {
      setNotice('Parameter weight and max score must be positive numbers.');
      return;
    }

    try {
      setIsSavingParameter(true);
      setNotice('');

      await client.graphql({
        query: createAssessmentToolParameter,
        variables: {
          input: {
            toolTemplateId: selectedTemplateId,
            parameterCode: parameterCode.trim().toUpperCase(),
            parameterName: parameterName.trim(),
            domain: parameterDomain.trim().toLowerCase(),
            weight: parsedWeight,
            maxScore: parsedMaxScore,
            levelDescriptorsJson: JSON.stringify({
              '1': 'beginning',
              '2': 'developing',
              '3': 'proficient',
              '4': 'exemplary',
            }),
            requiresEvidence: parameterRequiresEvidence.trim().toLowerCase() === 'true',
            displayOrder: parameters.length + 1,
            status: 'ACTIVE',
          },
        },
      });

      setParameterCode('');
      setParameterName('');
      setParameterDomain('competency');
      setParameterWeight('1');
      setParameterMaxScore('4');
      setParameterRequiresEvidence('false');

      await loadParameters(selectedTemplateId);
      setNotice('Checklist parameter added successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not add parameter.';
      setNotice(message);
    } finally {
      setIsSavingParameter(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!selectedTemplateId) {
      setNotice('Select a template before seeding default parameters.');
      return;
    }

    if (parameters.length > 0) {
      setNotice('This template already has parameters. Seed defaults only on an empty template.');
      return;
    }

    try {
      setIsSeedingDefaults(true);
      setNotice('');

      for (let index = 0; index < DEFAULT_OBSERVATION_PARAMETERS.length; index += 1) {
        const row = DEFAULT_OBSERVATION_PARAMETERS[index];
        await client.graphql({
          query: createAssessmentToolParameter,
          variables: {
            input: {
              toolTemplateId: selectedTemplateId,
              parameterCode: row.code,
              parameterName: row.name,
              domain: row.domain,
              weight: 1,
              maxScore: 4,
              levelDescriptorsJson: JSON.stringify({
                '1': 'beginning',
                '2': 'developing',
                '3': 'proficient',
                '4': 'exemplary',
              }),
              requiresEvidence: false,
              displayOrder: index + 1,
              status: 'ACTIVE',
            },
          },
        });
      }

      await loadParameters(selectedTemplateId);
      setNotice('Default Observation Checklist parameters seeded successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not seed default parameters.';
      setNotice(message);
    } finally {
      setIsSeedingDefaults(false);
    }
  };

  return (
    <>
      <SectionCard
        title="Tool 1: Observation Checklist"
        subtitle="National officer setup for checklist templates and parameter definitions."
      >
        <PrimaryTextInput
          value={toolCode}
          onChangeText={setToolCode}
          placeholder="Template code (e.g. OBS-CHECKLIST-001)"
          autoCapitalize="characters"
        />
        <PrimaryTextInput
          value={toolName}
          onChangeText={setToolName}
          placeholder="Template name"
        />
        <PrimaryTextInput
          value={version}
          onChangeText={setVersion}
          placeholder="Version (e.g. 1.0.0)"
        />
        <PrimaryTextInput
          value={academicYear}
          onChangeText={setAcademicYear}
          placeholder="Academic year"
          keyboardType="numeric"
        />
        <PrimaryTextInput
          value={maxScore}
          onChangeText={setMaxScore}
          placeholder="Template max score"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateTemplate} disabled={isSavingTemplate}>
          <Text style={styles.buttonText}>{isSavingTemplate ? 'Saving...' : 'Create Observation Template'}</Text>
        </TouchableOpacity>

        {notice ? <Text style={styles.message}>{notice}</Text> : null}
      </SectionCard>

      <SectionCard
        title="Observation Templates"
        subtitle="Choose a template below to define checklist parameters."
      >
        {templates.length === 0 ? <Text style={styles.placeholder}>No observation templates found yet.</Text> : null}
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.row,
              selectedTemplateId === template.id && styles.rowActive,
            ]}
            onPress={() => setSelectedTemplateId(template.id)}
          >
            <Text style={styles.rowCode}>{template.toolCode}</Text>
            <Text style={styles.rowName}>{template.toolName}</Text>
            <Text style={styles.rowMeta}>Version: {template.version || 'n/a'} | Status: {template.status || 'n/a'}</Text>
          </TouchableOpacity>
        ))}
      </SectionCard>

      <SectionCard
        title="Checklist Parameters"
        subtitle="Add custom criteria or seed defaults for the selected observation template."
      >
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleSeedDefaults}
          disabled={isSeedingDefaults || !selectedTemplateId}
        >
          <Text style={styles.secondaryButtonText}>{isSeedingDefaults ? 'Seeding...' : 'Seed Default Parameters'}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <PrimaryTextInput
          value={parameterCode}
          onChangeText={setParameterCode}
          placeholder="Parameter code (e.g. OBS-P06)"
          autoCapitalize="characters"
        />
        <PrimaryTextInput
          value={parameterName}
          onChangeText={setParameterName}
          placeholder="Parameter name"
        />
        <PrimaryTextInput
          value={parameterDomain}
          onChangeText={setParameterDomain}
          placeholder="Domain (e.g. competency or value)"
        />
        <PrimaryTextInput
          value={parameterWeight}
          onChangeText={setParameterWeight}
          placeholder="Weight"
          keyboardType="numeric"
        />
        <PrimaryTextInput
          value={parameterMaxScore}
          onChangeText={setParameterMaxScore}
          placeholder="Parameter max score"
          keyboardType="numeric"
        />
        <PrimaryTextInput
          value={parameterRequiresEvidence}
          onChangeText={setParameterRequiresEvidence}
          placeholder="Requires evidence (true/false)"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAddParameter}
          disabled={isSavingParameter || !selectedTemplateId}
        >
          <Text style={styles.buttonText}>{isSavingParameter ? 'Saving...' : 'Add Parameter'}</Text>
        </TouchableOpacity>

        {parameters.length === 0 ? <Text style={styles.placeholder}>No parameters for selected template yet.</Text> : null}
        {parameters.map((row) => (
          <View key={row.id} style={styles.row}>
            <Text style={styles.rowCode}>{row.parameterCode}</Text>
            <Text style={styles.rowName}>{row.parameterName}</Text>
            <Text style={styles.rowMeta}>
              Domain: {row.domain || 'n/a'} | Max: {row.maxScore ?? 'n/a'} | Weight: {row.weight ?? 'n/a'} | Evidence:{' '}
              {row.requiresEvidence ? 'Yes' : 'No'}
            </Text>
          </View>
        ))}
      </SectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1d4ed8',
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
  secondaryButton: {
    backgroundColor: '#e5edff',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  secondaryButtonText: {
    color: '#1e3a8a',
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    marginTop: 12,
    color: '#374151',
    fontSize: 14,
  },
  placeholder: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 10,
  },
  row: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: '#f9fafb',
  },
  rowActive: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  rowCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  rowMeta: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 16,
    marginBottom: 12,
  },
});