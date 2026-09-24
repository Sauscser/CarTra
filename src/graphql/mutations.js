/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSubject = /* GraphQL */ `
  mutation CreateSubject(
    $input: CreateSubjectInput!
    $condition: ModelSubjectConditionInput
  ) {
    createSubject(input: $input, condition: $condition) {
      id
      code
      name
      category
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSubject = /* GraphQL */ `
  mutation UpdateSubject(
    $input: UpdateSubjectInput!
    $condition: ModelSubjectConditionInput
  ) {
    updateSubject(input: $input, condition: $condition) {
      id
      code
      name
      category
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSubject = /* GraphQL */ `
  mutation DeleteSubject(
    $input: DeleteSubjectInput!
    $condition: ModelSubjectConditionInput
  ) {
    deleteSubject(input: $input, condition: $condition) {
      id
      code
      name
      category
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCoreSubject = /* GraphQL */ `
  mutation CreateCoreSubject(
    $input: CreateCoreSubjectInput!
    $condition: ModelCoreSubjectConditionInput
  ) {
    createCoreSubject(input: $input, condition: $condition) {
      id
      code
      name
      category
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCoreSubject = /* GraphQL */ `
  mutation UpdateCoreSubject(
    $input: UpdateCoreSubjectInput!
    $condition: ModelCoreSubjectConditionInput
  ) {
    updateCoreSubject(input: $input, condition: $condition) {
      id
      code
      name
      category
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCoreSubject = /* GraphQL */ `
  mutation DeleteCoreSubject(
    $input: DeleteCoreSubjectInput!
    $condition: ModelCoreSubjectConditionInput
  ) {
    deleteCoreSubject(input: $input, condition: $condition) {
      id
      code
      name
      category
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSupportSubject = /* GraphQL */ `
  mutation CreateSupportSubject(
    $input: CreateSupportSubjectInput!
    $condition: ModelSupportSubjectConditionInput
  ) {
    createSupportSubject(input: $input, condition: $condition) {
      id
      code
      name
      category
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSupportSubject = /* GraphQL */ `
  mutation UpdateSupportSubject(
    $input: UpdateSupportSubjectInput!
    $condition: ModelSupportSubjectConditionInput
  ) {
    updateSupportSubject(input: $input, condition: $condition) {
      id
      code
      name
      category
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSupportSubject = /* GraphQL */ `
  mutation DeleteSupportSubject(
    $input: DeleteSupportSubjectInput!
    $condition: ModelSupportSubjectConditionInput
  ) {
    deleteSupportSubject(input: $input, condition: $condition) {
      id
      code
      name
      category
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createJuniorLearningArea = /* GraphQL */ `
  mutation CreateJuniorLearningArea(
    $input: CreateJuniorLearningAreaInput!
    $condition: ModelJuniorLearningAreaConditionInput
  ) {
    createJuniorLearningArea(input: $input, condition: $condition) {
      id
      code
      name
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateJuniorLearningArea = /* GraphQL */ `
  mutation UpdateJuniorLearningArea(
    $input: UpdateJuniorLearningAreaInput!
    $condition: ModelJuniorLearningAreaConditionInput
  ) {
    updateJuniorLearningArea(input: $input, condition: $condition) {
      id
      code
      name
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteJuniorLearningArea = /* GraphQL */ `
  mutation DeleteJuniorLearningArea(
    $input: DeleteJuniorLearningAreaInput!
    $condition: ModelJuniorLearningAreaConditionInput
  ) {
    deleteJuniorLearningArea(input: $input, condition: $condition) {
      id
      code
      name
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createJuniorSubject = /* GraphQL */ `
  mutation CreateJuniorSubject(
    $input: CreateJuniorSubjectInput!
    $condition: ModelJuniorSubjectConditionInput
  ) {
    createJuniorSubject(input: $input, condition: $condition) {
      id
      code
      name
      learningAreaCode
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateJuniorSubject = /* GraphQL */ `
  mutation UpdateJuniorSubject(
    $input: UpdateJuniorSubjectInput!
    $condition: ModelJuniorSubjectConditionInput
  ) {
    updateJuniorSubject(input: $input, condition: $condition) {
      id
      code
      name
      learningAreaCode
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteJuniorSubject = /* GraphQL */ `
  mutation DeleteJuniorSubject(
    $input: DeleteJuniorSubjectInput!
    $condition: ModelJuniorSubjectConditionInput
  ) {
    deleteJuniorSubject(input: $input, condition: $condition) {
      id
      code
      name
      learningAreaCode
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSNELearningArea = /* GraphQL */ `
  mutation CreateSNELearningArea(
    $input: CreateSNELearningAreaInput!
    $condition: ModelSNELearningAreaConditionInput
  ) {
    createSNELearningArea(input: $input, condition: $condition) {
      id
      code
      name
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSNELearningArea = /* GraphQL */ `
  mutation UpdateSNELearningArea(
    $input: UpdateSNELearningAreaInput!
    $condition: ModelSNELearningAreaConditionInput
  ) {
    updateSNELearningArea(input: $input, condition: $condition) {
      id
      code
      name
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSNELearningArea = /* GraphQL */ `
  mutation DeleteSNELearningArea(
    $input: DeleteSNELearningAreaInput!
    $condition: ModelSNELearningAreaConditionInput
  ) {
    deleteSNELearningArea(input: $input, condition: $condition) {
      id
      code
      name
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSNESubject = /* GraphQL */ `
  mutation CreateSNESubject(
    $input: CreateSNESubjectInput!
    $condition: ModelSNESubjectConditionInput
  ) {
    createSNESubject(input: $input, condition: $condition) {
      id
      code
      name
      learningAreaCode
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSNESubject = /* GraphQL */ `
  mutation UpdateSNESubject(
    $input: UpdateSNESubjectInput!
    $condition: ModelSNESubjectConditionInput
  ) {
    updateSNESubject(input: $input, condition: $condition) {
      id
      code
      name
      learningAreaCode
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSNESubject = /* GraphQL */ `
  mutation DeleteSNESubject(
    $input: DeleteSNESubjectInput!
    $condition: ModelSNESubjectConditionInput
  ) {
    deleteSNESubject(input: $input, condition: $condition) {
      id
      code
      name
      learningAreaCode
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTrack = /* GraphQL */ `
  mutation CreateTrack(
    $input: CreateTrackInput!
    $condition: ModelTrackConditionInput
  ) {
    createTrack(input: $input, condition: $condition) {
      id
      code
      name
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTrack = /* GraphQL */ `
  mutation UpdateTrack(
    $input: UpdateTrackInput!
    $condition: ModelTrackConditionInput
  ) {
    updateTrack(input: $input, condition: $condition) {
      id
      code
      name
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTrack = /* GraphQL */ `
  mutation DeleteTrack(
    $input: DeleteTrackInput!
    $condition: ModelTrackConditionInput
  ) {
    deleteTrack(input: $input, condition: $condition) {
      id
      code
      name
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPathway = /* GraphQL */ `
  mutation CreatePathway(
    $input: CreatePathwayInput!
    $condition: ModelPathwayConditionInput
  ) {
    createPathway(input: $input, condition: $condition) {
      id
      code
      name
      trackId
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePathway = /* GraphQL */ `
  mutation UpdatePathway(
    $input: UpdatePathwayInput!
    $condition: ModelPathwayConditionInput
  ) {
    updatePathway(input: $input, condition: $condition) {
      id
      code
      name
      trackId
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePathway = /* GraphQL */ `
  mutation DeletePathway(
    $input: DeletePathwayInput!
    $condition: ModelPathwayConditionInput
  ) {
    deletePathway(input: $input, condition: $condition) {
      id
      code
      name
      trackId
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCareer = /* GraphQL */ `
  mutation CreateCareer(
    $input: CreateCareerInput!
    $condition: ModelCareerConditionInput
  ) {
    createCareer(input: $input, condition: $condition) {
      id
      code
      name
      description
      pathwayId
      clusterRequirements
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCareer = /* GraphQL */ `
  mutation UpdateCareer(
    $input: UpdateCareerInput!
    $condition: ModelCareerConditionInput
  ) {
    updateCareer(input: $input, condition: $condition) {
      id
      code
      name
      description
      pathwayId
      clusterRequirements
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCareer = /* GraphQL */ `
  mutation DeleteCareer(
    $input: DeleteCareerInput!
    $condition: ModelCareerConditionInput
  ) {
    deleteCareer(input: $input, condition: $condition) {
      id
      code
      name
      description
      pathwayId
      clusterRequirements
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCompetency = /* GraphQL */ `
  mutation CreateCompetency(
    $input: CreateCompetencyInput!
    $condition: ModelCompetencyConditionInput
  ) {
    createCompetency(input: $input, condition: $condition) {
      id
      code
      name
      description
      domain
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCompetency = /* GraphQL */ `
  mutation UpdateCompetency(
    $input: UpdateCompetencyInput!
    $condition: ModelCompetencyConditionInput
  ) {
    updateCompetency(input: $input, condition: $condition) {
      id
      code
      name
      description
      domain
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCompetency = /* GraphQL */ `
  mutation DeleteCompetency(
    $input: DeleteCompetencyInput!
    $condition: ModelCompetencyConditionInput
  ) {
    deleteCompetency(input: $input, condition: $condition) {
      id
      code
      name
      description
      domain
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCoreCompetency = /* GraphQL */ `
  mutation CreateCoreCompetency(
    $input: CreateCoreCompetencyInput!
    $condition: ModelCoreCompetencyConditionInput
  ) {
    createCoreCompetency(input: $input, condition: $condition) {
      id
      code
      name
      description
      domain
      gradeBand
      rubricTemplateId
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCoreCompetency = /* GraphQL */ `
  mutation UpdateCoreCompetency(
    $input: UpdateCoreCompetencyInput!
    $condition: ModelCoreCompetencyConditionInput
  ) {
    updateCoreCompetency(input: $input, condition: $condition) {
      id
      code
      name
      description
      domain
      gradeBand
      rubricTemplateId
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCoreCompetency = /* GraphQL */ `
  mutation DeleteCoreCompetency(
    $input: DeleteCoreCompetencyInput!
    $condition: ModelCoreCompetencyConditionInput
  ) {
    deleteCoreCompetency(input: $input, condition: $condition) {
      id
      code
      name
      description
      domain
      gradeBand
      rubricTemplateId
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCoreValue = /* GraphQL */ `
  mutation CreateCoreValue(
    $input: CreateCoreValueInput!
    $condition: ModelCoreValueConditionInput
  ) {
    createCoreValue(input: $input, condition: $condition) {
      id
      code
      name
      description
      domain
      gradeBand
      rubricTemplateId
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCoreValue = /* GraphQL */ `
  mutation UpdateCoreValue(
    $input: UpdateCoreValueInput!
    $condition: ModelCoreValueConditionInput
  ) {
    updateCoreValue(input: $input, condition: $condition) {
      id
      code
      name
      description
      domain
      gradeBand
      rubricTemplateId
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCoreValue = /* GraphQL */ `
  mutation DeleteCoreValue(
    $input: DeleteCoreValueInput!
    $condition: ModelCoreValueConditionInput
  ) {
    deleteCoreValue(input: $input, condition: $condition) {
      id
      code
      name
      description
      domain
      gradeBand
      rubricTemplateId
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAssessmentRubric = /* GraphQL */ `
  mutation CreateAssessmentRubric(
    $input: CreateAssessmentRubricInput!
    $condition: ModelAssessmentRubricConditionInput
  ) {
    createAssessmentRubric(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      coreValueId
      rubricType
      title
      description
      academicYear
      termOrCycle
      status
      rubricConfigJson
      s3Bucket
      fileKey
      fileName
      fileType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAssessmentRubric = /* GraphQL */ `
  mutation UpdateAssessmentRubric(
    $input: UpdateAssessmentRubricInput!
    $condition: ModelAssessmentRubricConditionInput
  ) {
    updateAssessmentRubric(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      coreValueId
      rubricType
      title
      description
      academicYear
      termOrCycle
      status
      rubricConfigJson
      s3Bucket
      fileKey
      fileName
      fileType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAssessmentRubric = /* GraphQL */ `
  mutation DeleteAssessmentRubric(
    $input: DeleteAssessmentRubricInput!
    $condition: ModelAssessmentRubricConditionInput
  ) {
    deleteAssessmentRubric(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      coreValueId
      rubricType
      title
      description
      academicYear
      termOrCycle
      status
      rubricConfigJson
      s3Bucket
      fileKey
      fileName
      fileType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAssessmentRubricCriterion = /* GraphQL */ `
  mutation CreateAssessmentRubricCriterion(
    $input: CreateAssessmentRubricCriterionInput!
    $condition: ModelAssessmentRubricCriterionConditionInput
  ) {
    createAssessmentRubricCriterion(input: $input, condition: $condition) {
      id
      rubricId
      parentCriterionId
      code
      title
      description
      criterionType
      weight
      displayOrder
      maxScore
      isRequired
      scoringMode
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAssessmentRubricCriterion = /* GraphQL */ `
  mutation UpdateAssessmentRubricCriterion(
    $input: UpdateAssessmentRubricCriterionInput!
    $condition: ModelAssessmentRubricCriterionConditionInput
  ) {
    updateAssessmentRubricCriterion(input: $input, condition: $condition) {
      id
      rubricId
      parentCriterionId
      code
      title
      description
      criterionType
      weight
      displayOrder
      maxScore
      isRequired
      scoringMode
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAssessmentRubricCriterion = /* GraphQL */ `
  mutation DeleteAssessmentRubricCriterion(
    $input: DeleteAssessmentRubricCriterionInput!
    $condition: ModelAssessmentRubricCriterionConditionInput
  ) {
    deleteAssessmentRubricCriterion(input: $input, condition: $condition) {
      id
      rubricId
      parentCriterionId
      code
      title
      description
      criterionType
      weight
      displayOrder
      maxScore
      isRequired
      scoringMode
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAssessmentRubricColumn = /* GraphQL */ `
  mutation CreateAssessmentRubricColumn(
    $input: CreateAssessmentRubricColumnInput!
    $condition: ModelAssessmentRubricColumnConditionInput
  ) {
    createAssessmentRubricColumn(input: $input, condition: $condition) {
      id
      rubricId
      code
      title
      description
      columnType
      minScore
      maxScore
      weight
      displayOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAssessmentRubricColumn = /* GraphQL */ `
  mutation UpdateAssessmentRubricColumn(
    $input: UpdateAssessmentRubricColumnInput!
    $condition: ModelAssessmentRubricColumnConditionInput
  ) {
    updateAssessmentRubricColumn(input: $input, condition: $condition) {
      id
      rubricId
      code
      title
      description
      columnType
      minScore
      maxScore
      weight
      displayOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAssessmentRubricColumn = /* GraphQL */ `
  mutation DeleteAssessmentRubricColumn(
    $input: DeleteAssessmentRubricColumnInput!
    $condition: ModelAssessmentRubricColumnConditionInput
  ) {
    deleteAssessmentRubricColumn(input: $input, condition: $condition) {
      id
      rubricId
      code
      title
      description
      columnType
      minScore
      maxScore
      weight
      displayOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAssessmentRubricScore = /* GraphQL */ `
  mutation CreateAssessmentRubricScore(
    $input: CreateAssessmentRubricScoreInput!
    $condition: ModelAssessmentRubricScoreConditionInput
  ) {
    createAssessmentRubricScore(input: $input, condition: $condition) {
      id
      rubricId
      learnerId
      criterionId
      columnId
      score
      achievementLevel
      teacherComment
      evidenceAttachmentId
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAssessmentRubricScore = /* GraphQL */ `
  mutation UpdateAssessmentRubricScore(
    $input: UpdateAssessmentRubricScoreInput!
    $condition: ModelAssessmentRubricScoreConditionInput
  ) {
    updateAssessmentRubricScore(input: $input, condition: $condition) {
      id
      rubricId
      learnerId
      criterionId
      columnId
      score
      achievementLevel
      teacherComment
      evidenceAttachmentId
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAssessmentRubricScore = /* GraphQL */ `
  mutation DeleteAssessmentRubricScore(
    $input: DeleteAssessmentRubricScoreInput!
    $condition: ModelAssessmentRubricScoreConditionInput
  ) {
    deleteAssessmentRubricScore(input: $input, condition: $condition) {
      id
      rubricId
      learnerId
      criterionId
      columnId
      score
      achievementLevel
      teacherComment
      evidenceAttachmentId
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createObservationChecklist = /* GraphQL */ `
  mutation CreateObservationChecklist(
    $input: CreateObservationChecklistInput!
    $condition: ModelObservationChecklistConditionInput
  ) {
    createObservationChecklist(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      coreValueId
      checklistType
      title
      description
      academicYear
      termOrCycle
      status
      scoringScale
      totalScore
      rubricTemplateId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateObservationChecklist = /* GraphQL */ `
  mutation UpdateObservationChecklist(
    $input: UpdateObservationChecklistInput!
    $condition: ModelObservationChecklistConditionInput
  ) {
    updateObservationChecklist(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      coreValueId
      checklistType
      title
      description
      academicYear
      termOrCycle
      status
      scoringScale
      totalScore
      rubricTemplateId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteObservationChecklist = /* GraphQL */ `
  mutation DeleteObservationChecklist(
    $input: DeleteObservationChecklistInput!
    $condition: ModelObservationChecklistConditionInput
  ) {
    deleteObservationChecklist(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      coreValueId
      checklistType
      title
      description
      academicYear
      termOrCycle
      status
      scoringScale
      totalScore
      rubricTemplateId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createObservationChecklistItem = /* GraphQL */ `
  mutation CreateObservationChecklistItem(
    $input: CreateObservationChecklistItemInput!
    $condition: ModelObservationChecklistItemConditionInput
  ) {
    createObservationChecklistItem(input: $input, condition: $condition) {
      id
      checklistId
      parentItemId
      code
      title
      description
      itemType
      domain
      maxScore
      weight
      displayOrder
      isRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateObservationChecklistItem = /* GraphQL */ `
  mutation UpdateObservationChecklistItem(
    $input: UpdateObservationChecklistItemInput!
    $condition: ModelObservationChecklistItemConditionInput
  ) {
    updateObservationChecklistItem(input: $input, condition: $condition) {
      id
      checklistId
      parentItemId
      code
      title
      description
      itemType
      domain
      maxScore
      weight
      displayOrder
      isRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteObservationChecklistItem = /* GraphQL */ `
  mutation DeleteObservationChecklistItem(
    $input: DeleteObservationChecklistItemInput!
    $condition: ModelObservationChecklistItemConditionInput
  ) {
    deleteObservationChecklistItem(input: $input, condition: $condition) {
      id
      checklistId
      parentItemId
      code
      title
      description
      itemType
      domain
      maxScore
      weight
      displayOrder
      isRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createObservationChecklistEntry = /* GraphQL */ `
  mutation CreateObservationChecklistEntry(
    $input: CreateObservationChecklistEntryInput!
    $condition: ModelObservationChecklistEntryConditionInput
  ) {
    createObservationChecklistEntry(input: $input, condition: $condition) {
      id
      checklistId
      learnerId
      itemId
      score
      level
      teacherComment
      evidenceAttachmentId
      observedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateObservationChecklistEntry = /* GraphQL */ `
  mutation UpdateObservationChecklistEntry(
    $input: UpdateObservationChecklistEntryInput!
    $condition: ModelObservationChecklistEntryConditionInput
  ) {
    updateObservationChecklistEntry(input: $input, condition: $condition) {
      id
      checklistId
      learnerId
      itemId
      score
      level
      teacherComment
      evidenceAttachmentId
      observedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteObservationChecklistEntry = /* GraphQL */ `
  mutation DeleteObservationChecklistEntry(
    $input: DeleteObservationChecklistEntryInput!
    $condition: ModelObservationChecklistEntryConditionInput
  ) {
    deleteObservationChecklistEntry(input: $input, condition: $condition) {
      id
      checklistId
      learnerId
      itemId
      score
      level
      teacherComment
      evidenceAttachmentId
      observedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createRatingScale = /* GraphQL */ `
  mutation CreateRatingScale(
    $input: CreateRatingScaleInput!
    $condition: ModelRatingScaleConditionInput
  ) {
    createRatingScale(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      coreValueId
      scaleType
      title
      description
      academicYear
      termOrCycle
      status
      levelLabelsJson
      totalScore
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateRatingScale = /* GraphQL */ `
  mutation UpdateRatingScale(
    $input: UpdateRatingScaleInput!
    $condition: ModelRatingScaleConditionInput
  ) {
    updateRatingScale(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      coreValueId
      scaleType
      title
      description
      academicYear
      termOrCycle
      status
      levelLabelsJson
      totalScore
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteRatingScale = /* GraphQL */ `
  mutation DeleteRatingScale(
    $input: DeleteRatingScaleInput!
    $condition: ModelRatingScaleConditionInput
  ) {
    deleteRatingScale(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      coreValueId
      scaleType
      title
      description
      academicYear
      termOrCycle
      status
      levelLabelsJson
      totalScore
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createRatingScaleRow = /* GraphQL */ `
  mutation CreateRatingScaleRow(
    $input: CreateRatingScaleRowInput!
    $condition: ModelRatingScaleRowConditionInput
  ) {
    createRatingScaleRow(input: $input, condition: $condition) {
      id
      scaleId
      parentRowId
      code
      title
      description
      rowType
      maxScore
      weight
      displayOrder
      descriptorJson
      isRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateRatingScaleRow = /* GraphQL */ `
  mutation UpdateRatingScaleRow(
    $input: UpdateRatingScaleRowInput!
    $condition: ModelRatingScaleRowConditionInput
  ) {
    updateRatingScaleRow(input: $input, condition: $condition) {
      id
      scaleId
      parentRowId
      code
      title
      description
      rowType
      maxScore
      weight
      displayOrder
      descriptorJson
      isRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteRatingScaleRow = /* GraphQL */ `
  mutation DeleteRatingScaleRow(
    $input: DeleteRatingScaleRowInput!
    $condition: ModelRatingScaleRowConditionInput
  ) {
    deleteRatingScaleRow(input: $input, condition: $condition) {
      id
      scaleId
      parentRowId
      code
      title
      description
      rowType
      maxScore
      weight
      displayOrder
      descriptorJson
      isRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createRatingScaleEntry = /* GraphQL */ `
  mutation CreateRatingScaleEntry(
    $input: CreateRatingScaleEntryInput!
    $condition: ModelRatingScaleEntryConditionInput
  ) {
    createRatingScaleEntry(input: $input, condition: $condition) {
      id
      scaleId
      learnerId
      rowId
      score
      level
      teacherComment
      evidenceAttachmentId
      assessedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateRatingScaleEntry = /* GraphQL */ `
  mutation UpdateRatingScaleEntry(
    $input: UpdateRatingScaleEntryInput!
    $condition: ModelRatingScaleEntryConditionInput
  ) {
    updateRatingScaleEntry(input: $input, condition: $condition) {
      id
      scaleId
      learnerId
      rowId
      score
      level
      teacherComment
      evidenceAttachmentId
      assessedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteRatingScaleEntry = /* GraphQL */ `
  mutation DeleteRatingScaleEntry(
    $input: DeleteRatingScaleEntryInput!
    $condition: ModelRatingScaleEntryConditionInput
  ) {
    deleteRatingScaleEntry(input: $input, condition: $condition) {
      id
      scaleId
      learnerId
      rowId
      score
      level
      teacherComment
      evidenceAttachmentId
      assessedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerPortfolio = /* GraphQL */ `
  mutation CreateLearnerPortfolio(
    $input: CreateLearnerPortfolioInput!
    $condition: ModelLearnerPortfolioConditionInput
  ) {
    createLearnerPortfolio(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      academicYear
      title
      description
      generatedByUserId
      portfolioType
      summaryJson
      coverImageKey
      generatedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerPortfolio = /* GraphQL */ `
  mutation UpdateLearnerPortfolio(
    $input: UpdateLearnerPortfolioInput!
    $condition: ModelLearnerPortfolioConditionInput
  ) {
    updateLearnerPortfolio(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      academicYear
      title
      description
      generatedByUserId
      portfolioType
      summaryJson
      coverImageKey
      generatedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerPortfolio = /* GraphQL */ `
  mutation DeleteLearnerPortfolio(
    $input: DeleteLearnerPortfolioInput!
    $condition: ModelLearnerPortfolioConditionInput
  ) {
    deleteLearnerPortfolio(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      academicYear
      title
      description
      generatedByUserId
      portfolioType
      summaryJson
      coverImageKey
      generatedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerPortfolioAsset = /* GraphQL */ `
  mutation CreateLearnerPortfolioAsset(
    $input: CreateLearnerPortfolioAssetInput!
    $condition: ModelLearnerPortfolioAssetConditionInput
  ) {
    createLearnerPortfolioAsset(input: $input, condition: $condition) {
      id
      portfolioId
      learnerId
      resourceId
      assetType
      title
      description
      s3Bucket
      fileKey
      fileName
      fileType
      displayOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerPortfolioAsset = /* GraphQL */ `
  mutation UpdateLearnerPortfolioAsset(
    $input: UpdateLearnerPortfolioAssetInput!
    $condition: ModelLearnerPortfolioAssetConditionInput
  ) {
    updateLearnerPortfolioAsset(input: $input, condition: $condition) {
      id
      portfolioId
      learnerId
      resourceId
      assetType
      title
      description
      s3Bucket
      fileKey
      fileName
      fileType
      displayOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerPortfolioAsset = /* GraphQL */ `
  mutation DeleteLearnerPortfolioAsset(
    $input: DeleteLearnerPortfolioAssetInput!
    $condition: ModelLearnerPortfolioAssetConditionInput
  ) {
    deleteLearnerPortfolioAsset(input: $input, condition: $condition) {
      id
      portfolioId
      learnerId
      resourceId
      assetType
      title
      description
      s3Bucket
      fileKey
      fileName
      fileType
      displayOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createObservationSchedule = /* GraphQL */ `
  mutation CreateObservationSchedule(
    $input: CreateObservationScheduleInput!
    $condition: ModelObservationScheduleConditionInput
  ) {
    createObservationSchedule(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      teacherId
      observerUserId
      observationType
      title
      description
      academicYear
      termOrCycle
      scheduledDate
      observedDate
      status
      notes
      rubricTemplateId
      s3Bucket
      fileKey
      fileName
      fileType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateObservationSchedule = /* GraphQL */ `
  mutation UpdateObservationSchedule(
    $input: UpdateObservationScheduleInput!
    $condition: ModelObservationScheduleConditionInput
  ) {
    updateObservationSchedule(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      teacherId
      observerUserId
      observationType
      title
      description
      academicYear
      termOrCycle
      scheduledDate
      observedDate
      status
      notes
      rubricTemplateId
      s3Bucket
      fileKey
      fileName
      fileType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteObservationSchedule = /* GraphQL */ `
  mutation DeleteObservationSchedule(
    $input: DeleteObservationScheduleInput!
    $condition: ModelObservationScheduleConditionInput
  ) {
    deleteObservationSchedule(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      teacherId
      observerUserId
      observationType
      title
      description
      academicYear
      termOrCycle
      scheduledDate
      observedDate
      status
      notes
      rubricTemplateId
      s3Bucket
      fileKey
      fileName
      fileType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerDocumentResource = /* GraphQL */ `
  mutation CreateLearnerDocumentResource(
    $input: CreateLearnerDocumentResourceInput!
    $condition: ModelLearnerDocumentResourceConditionInput
  ) {
    createLearnerDocumentResource(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      uploadedByUserId
      uploadedByRole
      resourceType
      resourceCategory
      title
      description
      s3Bucket
      fileKey
      fileName
      fileType
      fileSizeBytes
      checksum
      relatedCompetencyId
      relatedCoreValueId
      relatedAssessmentId
      relatedObservationId
      isPublished
      status
      metadata
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerDocumentResource = /* GraphQL */ `
  mutation UpdateLearnerDocumentResource(
    $input: UpdateLearnerDocumentResourceInput!
    $condition: ModelLearnerDocumentResourceConditionInput
  ) {
    updateLearnerDocumentResource(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      uploadedByUserId
      uploadedByRole
      resourceType
      resourceCategory
      title
      description
      s3Bucket
      fileKey
      fileName
      fileType
      fileSizeBytes
      checksum
      relatedCompetencyId
      relatedCoreValueId
      relatedAssessmentId
      relatedObservationId
      isPublished
      status
      metadata
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerDocumentResource = /* GraphQL */ `
  mutation DeleteLearnerDocumentResource(
    $input: DeleteLearnerDocumentResourceInput!
    $condition: ModelLearnerDocumentResourceConditionInput
  ) {
    deleteLearnerDocumentResource(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      uploadedByUserId
      uploadedByRole
      resourceType
      resourceCategory
      title
      description
      s3Bucket
      fileKey
      fileName
      fileType
      fileSizeBytes
      checksum
      relatedCompetencyId
      relatedCoreValueId
      relatedAssessmentId
      relatedObservationId
      isPublished
      status
      metadata
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerAssessmentEvidenceCollection = /* GraphQL */ `
  mutation CreateLearnerAssessmentEvidenceCollection(
    $input: CreateLearnerAssessmentEvidenceCollectionInput!
    $condition: ModelLearnerAssessmentEvidenceCollectionConditionInput
  ) {
    createLearnerAssessmentEvidenceCollection(
      input: $input
      condition: $condition
    ) {
      id
      learnerId
      schoolCode
      classCode
      academicYear
      termOrCycle
      assessmentToolType
      assessmentToolId
      collectionTitle
      description
      createdByUserId
      status
      metadata
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerAssessmentEvidenceCollection = /* GraphQL */ `
  mutation UpdateLearnerAssessmentEvidenceCollection(
    $input: UpdateLearnerAssessmentEvidenceCollectionInput!
    $condition: ModelLearnerAssessmentEvidenceCollectionConditionInput
  ) {
    updateLearnerAssessmentEvidenceCollection(
      input: $input
      condition: $condition
    ) {
      id
      learnerId
      schoolCode
      classCode
      academicYear
      termOrCycle
      assessmentToolType
      assessmentToolId
      collectionTitle
      description
      createdByUserId
      status
      metadata
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerAssessmentEvidenceCollection = /* GraphQL */ `
  mutation DeleteLearnerAssessmentEvidenceCollection(
    $input: DeleteLearnerAssessmentEvidenceCollectionInput!
    $condition: ModelLearnerAssessmentEvidenceCollectionConditionInput
  ) {
    deleteLearnerAssessmentEvidenceCollection(
      input: $input
      condition: $condition
    ) {
      id
      learnerId
      schoolCode
      classCode
      academicYear
      termOrCycle
      assessmentToolType
      assessmentToolId
      collectionTitle
      description
      createdByUserId
      status
      metadata
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerAssessmentEvidenceItem = /* GraphQL */ `
  mutation CreateLearnerAssessmentEvidenceItem(
    $input: CreateLearnerAssessmentEvidenceItemInput!
    $condition: ModelLearnerAssessmentEvidenceItemConditionInput
  ) {
    createLearnerAssessmentEvidenceItem(input: $input, condition: $condition) {
      id
      collectionId
      learnerId
      assessmentToolType
      assessmentToolId
      documentNumber
      title
      description
      documentType
      category
      source
      pageCount
      s3Bucket
      fileKey
      fileName
      fileType
      fileSizeBytes
      checksum
      isPrimary
      sortOrder
      captureDate
      uploadedByUserId
      uploadedByRole
      metadata
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerAssessmentEvidenceItem = /* GraphQL */ `
  mutation UpdateLearnerAssessmentEvidenceItem(
    $input: UpdateLearnerAssessmentEvidenceItemInput!
    $condition: ModelLearnerAssessmentEvidenceItemConditionInput
  ) {
    updateLearnerAssessmentEvidenceItem(input: $input, condition: $condition) {
      id
      collectionId
      learnerId
      assessmentToolType
      assessmentToolId
      documentNumber
      title
      description
      documentType
      category
      source
      pageCount
      s3Bucket
      fileKey
      fileName
      fileType
      fileSizeBytes
      checksum
      isPrimary
      sortOrder
      captureDate
      uploadedByUserId
      uploadedByRole
      metadata
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerAssessmentEvidenceItem = /* GraphQL */ `
  mutation DeleteLearnerAssessmentEvidenceItem(
    $input: DeleteLearnerAssessmentEvidenceItemInput!
    $condition: ModelLearnerAssessmentEvidenceItemConditionInput
  ) {
    deleteLearnerAssessmentEvidenceItem(input: $input, condition: $condition) {
      id
      collectionId
      learnerId
      assessmentToolType
      assessmentToolId
      documentNumber
      title
      description
      documentType
      category
      source
      pageCount
      s3Bucket
      fileKey
      fileName
      fileType
      fileSizeBytes
      checksum
      isPrimary
      sortOrder
      captureDate
      uploadedByUserId
      uploadedByRole
      metadata
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAcademicTarget = /* GraphQL */ `
  mutation CreateAcademicTarget(
    $input: CreateAcademicTargetInput!
    $condition: ModelAcademicTargetConditionInput
  ) {
    createAcademicTarget(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      targetValues
      subjectTargets
      careerId
      pathwayId
      strategyNotes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAcademicTarget = /* GraphQL */ `
  mutation UpdateAcademicTarget(
    $input: UpdateAcademicTargetInput!
    $condition: ModelAcademicTargetConditionInput
  ) {
    updateAcademicTarget(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      targetValues
      subjectTargets
      careerId
      pathwayId
      strategyNotes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAcademicTarget = /* GraphQL */ `
  mutation DeleteAcademicTarget(
    $input: DeleteAcademicTargetInput!
    $condition: ModelAcademicTargetConditionInput
  ) {
    deleteAcademicTarget(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      targetValues
      subjectTargets
      careerId
      pathwayId
      strategyNotes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPerformanceIndicator = /* GraphQL */ `
  mutation CreatePerformanceIndicator(
    $input: CreatePerformanceIndicatorInput!
    $condition: ModelPerformanceIndicatorConditionInput
  ) {
    createPerformanceIndicator(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      termOrCycle
      subjectId
      subjectCode
      targetScore
      achievedScore
      competencyId
      competencyName
      competencyScore
      valuesAndAttitudesScore
      engagementScore
      notes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePerformanceIndicator = /* GraphQL */ `
  mutation UpdatePerformanceIndicator(
    $input: UpdatePerformanceIndicatorInput!
    $condition: ModelPerformanceIndicatorConditionInput
  ) {
    updatePerformanceIndicator(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      termOrCycle
      subjectId
      subjectCode
      targetScore
      achievedScore
      competencyId
      competencyName
      competencyScore
      valuesAndAttitudesScore
      engagementScore
      notes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePerformanceIndicator = /* GraphQL */ `
  mutation DeletePerformanceIndicator(
    $input: DeletePerformanceIndicatorInput!
    $condition: ModelPerformanceIndicatorConditionInput
  ) {
    deletePerformanceIndicator(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      termOrCycle
      subjectId
      subjectCode
      targetScore
      achievedScore
      competencyId
      competencyName
      competencyScore
      valuesAndAttitudesScore
      engagementScore
      notes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerCompetency = /* GraphQL */ `
  mutation CreateLearnerCompetency(
    $input: CreateLearnerCompetencyInput!
    $condition: ModelLearnerCompetencyConditionInput
  ) {
    createLearnerCompetency(input: $input, condition: $condition) {
      id
      learnerId
      competencyId
      competencyName
      score
      level
      evidenceReference
      notes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerCompetency = /* GraphQL */ `
  mutation UpdateLearnerCompetency(
    $input: UpdateLearnerCompetencyInput!
    $condition: ModelLearnerCompetencyConditionInput
  ) {
    updateLearnerCompetency(input: $input, condition: $condition) {
      id
      learnerId
      competencyId
      competencyName
      score
      level
      evidenceReference
      notes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerCompetency = /* GraphQL */ `
  mutation DeleteLearnerCompetency(
    $input: DeleteLearnerCompetencyInput!
    $condition: ModelLearnerCompetencyConditionInput
  ) {
    deleteLearnerCompetency(input: $input, condition: $condition) {
      id
      learnerId
      competencyId
      competencyName
      score
      level
      evidenceReference
      notes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSchoolClass = /* GraphQL */ `
  mutation CreateSchoolClass(
    $input: CreateSchoolClassInput!
    $condition: ModelSchoolClassConditionInput
  ) {
    createSchoolClass(input: $input, condition: $condition) {
      id
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      principalId
      classCode
      className
      gradeLevel
      stream
      academicYear
      teacherIds
      subjectIds
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSchoolClass = /* GraphQL */ `
  mutation UpdateSchoolClass(
    $input: UpdateSchoolClassInput!
    $condition: ModelSchoolClassConditionInput
  ) {
    updateSchoolClass(input: $input, condition: $condition) {
      id
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      principalId
      classCode
      className
      gradeLevel
      stream
      academicYear
      teacherIds
      subjectIds
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSchoolClass = /* GraphQL */ `
  mutation DeleteSchoolClass(
    $input: DeleteSchoolClassInput!
    $condition: ModelSchoolClassConditionInput
  ) {
    deleteSchoolClass(input: $input, condition: $condition) {
      id
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      principalId
      classCode
      className
      gradeLevel
      stream
      academicYear
      teacherIds
      subjectIds
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerEnrollment = /* GraphQL */ `
  mutation CreateLearnerEnrollment(
    $input: CreateLearnerEnrollmentInput!
    $condition: ModelLearnerEnrollmentConditionInput
  ) {
    createLearnerEnrollment(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      academicYear
      termOrCycle
      enrollmentStatus
      promotedToNextClass
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerEnrollment = /* GraphQL */ `
  mutation UpdateLearnerEnrollment(
    $input: UpdateLearnerEnrollmentInput!
    $condition: ModelLearnerEnrollmentConditionInput
  ) {
    updateLearnerEnrollment(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      academicYear
      termOrCycle
      enrollmentStatus
      promotedToNextClass
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerEnrollment = /* GraphQL */ `
  mutation DeleteLearnerEnrollment(
    $input: DeleteLearnerEnrollmentInput!
    $condition: ModelLearnerEnrollmentConditionInput
  ) {
    deleteLearnerEnrollment(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      academicYear
      termOrCycle
      enrollmentStatus
      promotedToNextClass
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAssessmentTask = /* GraphQL */ `
  mutation CreateAssessmentTask(
    $input: CreateAssessmentTaskInput!
    $condition: ModelAssessmentTaskConditionInput
  ) {
    createAssessmentTask(input: $input, condition: $condition) {
      id
      schoolCode
      classCode
      subjectId
      teacherId
      title
      assessmentType
      academicYear
      termOrCycle
      dueDate
      maxScore
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAssessmentTask = /* GraphQL */ `
  mutation UpdateAssessmentTask(
    $input: UpdateAssessmentTaskInput!
    $condition: ModelAssessmentTaskConditionInput
  ) {
    updateAssessmentTask(input: $input, condition: $condition) {
      id
      schoolCode
      classCode
      subjectId
      teacherId
      title
      assessmentType
      academicYear
      termOrCycle
      dueDate
      maxScore
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAssessmentTask = /* GraphQL */ `
  mutation DeleteAssessmentTask(
    $input: DeleteAssessmentTaskInput!
    $condition: ModelAssessmentTaskConditionInput
  ) {
    deleteAssessmentTask(input: $input, condition: $condition) {
      id
      schoolCode
      classCode
      subjectId
      teacherId
      title
      assessmentType
      academicYear
      termOrCycle
      dueDate
      maxScore
      description
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAssessmentSubmission = /* GraphQL */ `
  mutation CreateAssessmentSubmission(
    $input: CreateAssessmentSubmissionInput!
    $condition: ModelAssessmentSubmissionConditionInput
  ) {
    createAssessmentSubmission(input: $input, condition: $condition) {
      id
      learnerId
      assessmentTaskId
      subjectId
      teacherId
      score
      grade
      remarks
      submissionStatus
      submittedAt
      reviewedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAssessmentSubmission = /* GraphQL */ `
  mutation UpdateAssessmentSubmission(
    $input: UpdateAssessmentSubmissionInput!
    $condition: ModelAssessmentSubmissionConditionInput
  ) {
    updateAssessmentSubmission(input: $input, condition: $condition) {
      id
      learnerId
      assessmentTaskId
      subjectId
      teacherId
      score
      grade
      remarks
      submissionStatus
      submittedAt
      reviewedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAssessmentSubmission = /* GraphQL */ `
  mutation DeleteAssessmentSubmission(
    $input: DeleteAssessmentSubmissionInput!
    $condition: ModelAssessmentSubmissionConditionInput
  ) {
    deleteAssessmentSubmission(input: $input, condition: $condition) {
      id
      learnerId
      assessmentTaskId
      subjectId
      teacherId
      score
      grade
      remarks
      submissionStatus
      submittedAt
      reviewedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearningMaterial = /* GraphQL */ `
  mutation CreateLearningMaterial(
    $input: CreateLearningMaterialInput!
    $condition: ModelLearningMaterialConditionInput
  ) {
    createLearningMaterial(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      subjectId
      uploadedByUserId
      uploadedByRole
      materialType
      title
      description
      fileKey
      fileName
      fileType
      isPublished
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearningMaterial = /* GraphQL */ `
  mutation UpdateLearningMaterial(
    $input: UpdateLearningMaterialInput!
    $condition: ModelLearningMaterialConditionInput
  ) {
    updateLearningMaterial(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      subjectId
      uploadedByUserId
      uploadedByRole
      materialType
      title
      description
      fileKey
      fileName
      fileType
      isPublished
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearningMaterial = /* GraphQL */ `
  mutation DeleteLearningMaterial(
    $input: DeleteLearningMaterialInput!
    $condition: ModelLearningMaterialConditionInput
  ) {
    deleteLearningMaterial(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      subjectId
      uploadedByUserId
      uploadedByRole
      materialType
      title
      description
      fileKey
      fileName
      fileType
      isPublished
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAttendanceRecord = /* GraphQL */ `
  mutation CreateAttendanceRecord(
    $input: CreateAttendanceRecordInput!
    $condition: ModelAttendanceRecordConditionInput
  ) {
    createAttendanceRecord(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      academicYear
      termOrCycle
      presentDays
      absentDays
      punctualityScore
      engagementScore
      notes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAttendanceRecord = /* GraphQL */ `
  mutation UpdateAttendanceRecord(
    $input: UpdateAttendanceRecordInput!
    $condition: ModelAttendanceRecordConditionInput
  ) {
    updateAttendanceRecord(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      academicYear
      termOrCycle
      presentDays
      absentDays
      punctualityScore
      engagementScore
      notes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAttendanceRecord = /* GraphQL */ `
  mutation DeleteAttendanceRecord(
    $input: DeleteAttendanceRecordInput!
    $condition: ModelAttendanceRecordConditionInput
  ) {
    deleteAttendanceRecord(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      classCode
      academicYear
      termOrCycle
      presentDays
      absentDays
      punctualityScore
      engagementScore
      notes
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createValuesAndAttitudesRecord = /* GraphQL */ `
  mutation CreateValuesAndAttitudesRecord(
    $input: CreateValuesAndAttitudesRecordInput!
    $condition: ModelValuesAndAttitudesRecordConditionInput
  ) {
    createValuesAndAttitudesRecord(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      termOrCycle
      competencyArea
      score
      level
      notes
      observedByUserId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateValuesAndAttitudesRecord = /* GraphQL */ `
  mutation UpdateValuesAndAttitudesRecord(
    $input: UpdateValuesAndAttitudesRecordInput!
    $condition: ModelValuesAndAttitudesRecordConditionInput
  ) {
    updateValuesAndAttitudesRecord(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      termOrCycle
      competencyArea
      score
      level
      notes
      observedByUserId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteValuesAndAttitudesRecord = /* GraphQL */ `
  mutation DeleteValuesAndAttitudesRecord(
    $input: DeleteValuesAndAttitudesRecordInput!
    $condition: ModelValuesAndAttitudesRecordConditionInput
  ) {
    deleteValuesAndAttitudesRecord(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      termOrCycle
      competencyArea
      score
      level
      notes
      observedByUserId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSupportPlan = /* GraphQL */ `
  mutation CreateSupportPlan(
    $input: CreateSupportPlanInput!
    $condition: ModelSupportPlanConditionInput
  ) {
    createSupportPlan(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      assignedToUserId
      authorUserId
      supportType
      goals
      actionItems
      status
      dueDate
      resolvedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSupportPlan = /* GraphQL */ `
  mutation UpdateSupportPlan(
    $input: UpdateSupportPlanInput!
    $condition: ModelSupportPlanConditionInput
  ) {
    updateSupportPlan(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      assignedToUserId
      authorUserId
      supportType
      goals
      actionItems
      status
      dueDate
      resolvedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSupportPlan = /* GraphQL */ `
  mutation DeleteSupportPlan(
    $input: DeleteSupportPlanInput!
    $condition: ModelSupportPlanConditionInput
  ) {
    deleteSupportPlan(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      assignedToUserId
      authorUserId
      supportType
      goals
      actionItems
      status
      dueDate
      resolvedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createEscalationCase = /* GraphQL */ `
  mutation CreateEscalationCase(
    $input: CreateEscalationCaseInput!
    $condition: ModelEscalationCaseConditionInput
  ) {
    createEscalationCase(input: $input, condition: $condition) {
      id
      learnerId
      triggerType
      currentDeviationPercent
      escalationLevel
      reviewScope
      assignedToUserId
      assignedRole
      status
      resolutionNote
      openedAt
      resolvedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateEscalationCase = /* GraphQL */ `
  mutation UpdateEscalationCase(
    $input: UpdateEscalationCaseInput!
    $condition: ModelEscalationCaseConditionInput
  ) {
    updateEscalationCase(input: $input, condition: $condition) {
      id
      learnerId
      triggerType
      currentDeviationPercent
      escalationLevel
      reviewScope
      assignedToUserId
      assignedRole
      status
      resolutionNote
      openedAt
      resolvedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteEscalationCase = /* GraphQL */ `
  mutation DeleteEscalationCase(
    $input: DeleteEscalationCaseInput!
    $condition: ModelEscalationCaseConditionInput
  ) {
    deleteEscalationCase(input: $input, condition: $condition) {
      id
      learnerId
      triggerType
      currentDeviationPercent
      escalationLevel
      reviewScope
      assignedToUserId
      assignedRole
      status
      resolutionNote
      openedAt
      resolvedAt
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createParentLearnerLink = /* GraphQL */ `
  mutation CreateParentLearnerLink(
    $input: CreateParentLearnerLinkInput!
    $condition: ModelParentLearnerLinkConditionInput
  ) {
    createParentLearnerLink(input: $input, condition: $condition) {
      id
      parentUserId
      learnerId
      nationalId
      relationshipType
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateParentLearnerLink = /* GraphQL */ `
  mutation UpdateParentLearnerLink(
    $input: UpdateParentLearnerLinkInput!
    $condition: ModelParentLearnerLinkConditionInput
  ) {
    updateParentLearnerLink(input: $input, condition: $condition) {
      id
      parentUserId
      learnerId
      nationalId
      relationshipType
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteParentLearnerLink = /* GraphQL */ `
  mutation DeleteParentLearnerLink(
    $input: DeleteParentLearnerLinkInput!
    $condition: ModelParentLearnerLinkConditionInput
  ) {
    deleteParentLearnerLink(input: $input, condition: $condition) {
      id
      parentUserId
      learnerId
      nationalId
      relationshipType
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTertiaryCourse = /* GraphQL */ `
  mutation CreateTertiaryCourse(
    $input: CreateTertiaryCourseInput!
    $condition: ModelTertiaryCourseConditionInput
  ) {
    createTertiaryCourse(input: $input, condition: $condition) {
      id
      institutionId
      courseCode
      courseName
      pathwayId
      minimumClusterScore
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTertiaryCourse = /* GraphQL */ `
  mutation UpdateTertiaryCourse(
    $input: UpdateTertiaryCourseInput!
    $condition: ModelTertiaryCourseConditionInput
  ) {
    updateTertiaryCourse(input: $input, condition: $condition) {
      id
      institutionId
      courseCode
      courseName
      pathwayId
      minimumClusterScore
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTertiaryCourse = /* GraphQL */ `
  mutation DeleteTertiaryCourse(
    $input: DeleteTertiaryCourseInput!
    $condition: ModelTertiaryCourseConditionInput
  ) {
    deleteTertiaryCourse(input: $input, condition: $condition) {
      id
      institutionId
      courseCode
      courseName
      pathwayId
      minimumClusterScore
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAcademicCalendar = /* GraphQL */ `
  mutation CreateAcademicCalendar(
    $input: CreateAcademicCalendarInput!
    $condition: ModelAcademicCalendarConditionInput
  ) {
    createAcademicCalendar(input: $input, condition: $condition) {
      id
      schoolCode
      academicYear
      startDate
      endDate
      calendarType
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAcademicCalendar = /* GraphQL */ `
  mutation UpdateAcademicCalendar(
    $input: UpdateAcademicCalendarInput!
    $condition: ModelAcademicCalendarConditionInput
  ) {
    updateAcademicCalendar(input: $input, condition: $condition) {
      id
      schoolCode
      academicYear
      startDate
      endDate
      calendarType
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAcademicCalendar = /* GraphQL */ `
  mutation DeleteAcademicCalendar(
    $input: DeleteAcademicCalendarInput!
    $condition: ModelAcademicCalendarConditionInput
  ) {
    deleteAcademicCalendar(input: $input, condition: $condition) {
      id
      schoolCode
      academicYear
      startDate
      endDate
      calendarType
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTermDefinition = /* GraphQL */ `
  mutation CreateTermDefinition(
    $input: CreateTermDefinitionInput!
    $condition: ModelTermDefinitionConditionInput
  ) {
    createTermDefinition(input: $input, condition: $condition) {
      id
      schoolCode
      academicYear
      termName
      termCode
      startDate
      endDate
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTermDefinition = /* GraphQL */ `
  mutation UpdateTermDefinition(
    $input: UpdateTermDefinitionInput!
    $condition: ModelTermDefinitionConditionInput
  ) {
    updateTermDefinition(input: $input, condition: $condition) {
      id
      schoolCode
      academicYear
      termName
      termCode
      startDate
      endDate
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTermDefinition = /* GraphQL */ `
  mutation DeleteTermDefinition(
    $input: DeleteTermDefinitionInput!
    $condition: ModelTermDefinitionConditionInput
  ) {
    deleteTermDefinition(input: $input, condition: $condition) {
      id
      schoolCode
      academicYear
      termName
      termCode
      startDate
      endDate
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      email
      phoneNumber
      role
      status
      fullName
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      email
      phoneNumber
      role
      status
      fullName
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
      id
      email
      phoneNumber
      role
      status
      fullName
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createOrgHierarchy = /* GraphQL */ `
  mutation CreateOrgHierarchy(
    $input: CreateOrgHierarchyInput!
    $condition: ModelOrgHierarchyConditionInput
  ) {
    createOrgHierarchy(input: $input, condition: $condition) {
      id
      entityType
      code
      parentCode
      name
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      assignedOfficerEmail
      assignedOfficerRole
      status
      metadata
      createdBy
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateOrgHierarchy = /* GraphQL */ `
  mutation UpdateOrgHierarchy(
    $input: UpdateOrgHierarchyInput!
    $condition: ModelOrgHierarchyConditionInput
  ) {
    updateOrgHierarchy(input: $input, condition: $condition) {
      id
      entityType
      code
      parentCode
      name
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      assignedOfficerEmail
      assignedOfficerRole
      status
      metadata
      createdBy
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteOrgHierarchy = /* GraphQL */ `
  mutation DeleteOrgHierarchy(
    $input: DeleteOrgHierarchyInput!
    $condition: ModelOrgHierarchyConditionInput
  ) {
    deleteOrgHierarchy(input: $input, condition: $condition) {
      id
      entityType
      code
      parentCode
      name
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      assignedOfficerEmail
      assignedOfficerRole
      status
      metadata
      createdBy
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createNationalOfficerProfile = /* GraphQL */ `
  mutation CreateNationalOfficerProfile(
    $input: CreateNationalOfficerProfileInput!
    $condition: ModelNationalOfficerProfileConditionInput
  ) {
    createNationalOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      assignedRegions
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateNationalOfficerProfile = /* GraphQL */ `
  mutation UpdateNationalOfficerProfile(
    $input: UpdateNationalOfficerProfileInput!
    $condition: ModelNationalOfficerProfileConditionInput
  ) {
    updateNationalOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      assignedRegions
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteNationalOfficerProfile = /* GraphQL */ `
  mutation DeleteNationalOfficerProfile(
    $input: DeleteNationalOfficerProfileInput!
    $condition: ModelNationalOfficerProfileConditionInput
  ) {
    deleteNationalOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      assignedRegions
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createRegionalOfficerProfile = /* GraphQL */ `
  mutation CreateRegionalOfficerProfile(
    $input: CreateRegionalOfficerProfileInput!
    $condition: ModelRegionalOfficerProfileConditionInput
  ) {
    createRegionalOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      assignedCounties
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateRegionalOfficerProfile = /* GraphQL */ `
  mutation UpdateRegionalOfficerProfile(
    $input: UpdateRegionalOfficerProfileInput!
    $condition: ModelRegionalOfficerProfileConditionInput
  ) {
    updateRegionalOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      assignedCounties
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteRegionalOfficerProfile = /* GraphQL */ `
  mutation DeleteRegionalOfficerProfile(
    $input: DeleteRegionalOfficerProfileInput!
    $condition: ModelRegionalOfficerProfileConditionInput
  ) {
    deleteRegionalOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      assignedCounties
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCountyOfficerProfile = /* GraphQL */ `
  mutation CreateCountyOfficerProfile(
    $input: CreateCountyOfficerProfileInput!
    $condition: ModelCountyOfficerProfileConditionInput
  ) {
    createCountyOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      assignedSubCounties
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCountyOfficerProfile = /* GraphQL */ `
  mutation UpdateCountyOfficerProfile(
    $input: UpdateCountyOfficerProfileInput!
    $condition: ModelCountyOfficerProfileConditionInput
  ) {
    updateCountyOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      assignedSubCounties
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCountyOfficerProfile = /* GraphQL */ `
  mutation DeleteCountyOfficerProfile(
    $input: DeleteCountyOfficerProfileInput!
    $condition: ModelCountyOfficerProfileConditionInput
  ) {
    deleteCountyOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      assignedSubCounties
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSubCountyOfficerProfile = /* GraphQL */ `
  mutation CreateSubCountyOfficerProfile(
    $input: CreateSubCountyOfficerProfileInput!
    $condition: ModelSubCountyOfficerProfileConditionInput
  ) {
    createSubCountyOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      subCountyCode
      assignedSchools
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSubCountyOfficerProfile = /* GraphQL */ `
  mutation UpdateSubCountyOfficerProfile(
    $input: UpdateSubCountyOfficerProfileInput!
    $condition: ModelSubCountyOfficerProfileConditionInput
  ) {
    updateSubCountyOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      subCountyCode
      assignedSchools
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSubCountyOfficerProfile = /* GraphQL */ `
  mutation DeleteSubCountyOfficerProfile(
    $input: DeleteSubCountyOfficerProfileInput!
    $condition: ModelSubCountyOfficerProfileConditionInput
  ) {
    deleteSubCountyOfficerProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      subCountyCode
      assignedSchools
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPrincipalProfile = /* GraphQL */ `
  mutation CreatePrincipalProfile(
    $input: CreatePrincipalProfileInput!
    $condition: ModelPrincipalProfileConditionInput
  ) {
    createPrincipalProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      schoolName
      tscNumber
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePrincipalProfile = /* GraphQL */ `
  mutation UpdatePrincipalProfile(
    $input: UpdatePrincipalProfileInput!
    $condition: ModelPrincipalProfileConditionInput
  ) {
    updatePrincipalProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      schoolName
      tscNumber
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePrincipalProfile = /* GraphQL */ `
  mutation DeletePrincipalProfile(
    $input: DeletePrincipalProfileInput!
    $condition: ModelPrincipalProfileConditionInput
  ) {
    deletePrincipalProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      schoolName
      tscNumber
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTeacherProfile = /* GraphQL */ `
  mutation CreateTeacherProfile(
    $input: CreateTeacherProfileInput!
    $condition: ModelTeacherProfileConditionInput
  ) {
    createTeacherProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      tscNumber
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTeacherProfile = /* GraphQL */ `
  mutation UpdateTeacherProfile(
    $input: UpdateTeacherProfileInput!
    $condition: ModelTeacherProfileConditionInput
  ) {
    updateTeacherProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      tscNumber
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTeacherProfile = /* GraphQL */ `
  mutation DeleteTeacherProfile(
    $input: DeleteTeacherProfileInput!
    $condition: ModelTeacherProfileConditionInput
  ) {
    deleteTeacherProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      tscNumber
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTeacherHandledSubject = /* GraphQL */ `
  mutation CreateTeacherHandledSubject(
    $input: CreateTeacherHandledSubjectInput!
    $condition: ModelTeacherHandledSubjectConditionInput
  ) {
    createTeacherHandledSubject(input: $input, condition: $condition) {
      id
      teacherId
      schoolCode
      subjectId
      subjectCode
      subjectName
      academicYear
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTeacherHandledSubject = /* GraphQL */ `
  mutation UpdateTeacherHandledSubject(
    $input: UpdateTeacherHandledSubjectInput!
    $condition: ModelTeacherHandledSubjectConditionInput
  ) {
    updateTeacherHandledSubject(input: $input, condition: $condition) {
      id
      teacherId
      schoolCode
      subjectId
      subjectCode
      subjectName
      academicYear
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTeacherHandledSubject = /* GraphQL */ `
  mutation DeleteTeacherHandledSubject(
    $input: DeleteTeacherHandledSubjectInput!
    $condition: ModelTeacherHandledSubjectConditionInput
  ) {
    deleteTeacherHandledSubject(input: $input, condition: $condition) {
      id
      teacherId
      schoolCode
      subjectId
      subjectCode
      subjectName
      academicYear
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTeacherSubjectAssignment = /* GraphQL */ `
  mutation CreateTeacherSubjectAssignment(
    $input: CreateTeacherSubjectAssignmentInput!
    $condition: ModelTeacherSubjectAssignmentConditionInput
  ) {
    createTeacherSubjectAssignment(input: $input, condition: $condition) {
      id
      teacherId
      schoolCode
      subjectId
      subjectCode
      subjectName
      classCode
      className
      academicYear
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTeacherSubjectAssignment = /* GraphQL */ `
  mutation UpdateTeacherSubjectAssignment(
    $input: UpdateTeacherSubjectAssignmentInput!
    $condition: ModelTeacherSubjectAssignmentConditionInput
  ) {
    updateTeacherSubjectAssignment(input: $input, condition: $condition) {
      id
      teacherId
      schoolCode
      subjectId
      subjectCode
      subjectName
      classCode
      className
      academicYear
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTeacherSubjectAssignment = /* GraphQL */ `
  mutation DeleteTeacherSubjectAssignment(
    $input: DeleteTeacherSubjectAssignmentInput!
    $condition: ModelTeacherSubjectAssignmentConditionInput
  ) {
    deleteTeacherSubjectAssignment(input: $input, condition: $condition) {
      id
      teacherId
      schoolCode
      subjectId
      subjectCode
      subjectName
      classCode
      className
      academicYear
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createParentProfile = /* GraphQL */ `
  mutation CreateParentProfile(
    $input: CreateParentProfileInput!
    $condition: ModelParentProfileConditionInput
  ) {
    createParentProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationalId
      linkedLearnerIds
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateParentProfile = /* GraphQL */ `
  mutation UpdateParentProfile(
    $input: UpdateParentProfileInput!
    $condition: ModelParentProfileConditionInput
  ) {
    updateParentProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationalId
      linkedLearnerIds
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteParentProfile = /* GraphQL */ `
  mutation DeleteParentProfile(
    $input: DeleteParentProfileInput!
    $condition: ModelParentProfileConditionInput
  ) {
    deleteParentProfile(input: $input, condition: $condition) {
      id
      userId
      fullName
      nationalId
      linkedLearnerIds
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerProfile = /* GraphQL */ `
  mutation CreateLearnerProfile(
    $input: CreateLearnerProfileInput!
    $condition: ModelLearnerProfileConditionInput
  ) {
    createLearnerProfile(input: $input, condition: $condition) {
      id
      userId
      learnerId
      fullName
      assessmentNumber
      gender
      gradeLevel
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      classCode
      parentNationalId
      selectedCareerId
      selectedPathwayId
      supportProfile
      status
      createdByTeacherId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerProfile = /* GraphQL */ `
  mutation UpdateLearnerProfile(
    $input: UpdateLearnerProfileInput!
    $condition: ModelLearnerProfileConditionInput
  ) {
    updateLearnerProfile(input: $input, condition: $condition) {
      id
      userId
      learnerId
      fullName
      assessmentNumber
      gender
      gradeLevel
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      classCode
      parentNationalId
      selectedCareerId
      selectedPathwayId
      supportProfile
      status
      createdByTeacherId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerProfile = /* GraphQL */ `
  mutation DeleteLearnerProfile(
    $input: DeleteLearnerProfileInput!
    $condition: ModelLearnerProfileConditionInput
  ) {
    deleteLearnerProfile(input: $input, condition: $condition) {
      id
      userId
      learnerId
      fullName
      assessmentNumber
      gender
      gradeLevel
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      classCode
      parentNationalId
      selectedCareerId
      selectedPathwayId
      supportProfile
      status
      createdByTeacherId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTertiaryInstitutionProfile = /* GraphQL */ `
  mutation CreateTertiaryInstitutionProfile(
    $input: CreateTertiaryInstitutionProfileInput!
    $condition: ModelTertiaryInstitutionProfileConditionInput
  ) {
    createTertiaryInstitutionProfile(input: $input, condition: $condition) {
      id
      userId
      institutionName
      nationCode
      regionCode
      countyCode
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateTertiaryInstitutionProfile = /* GraphQL */ `
  mutation UpdateTertiaryInstitutionProfile(
    $input: UpdateTertiaryInstitutionProfileInput!
    $condition: ModelTertiaryInstitutionProfileConditionInput
  ) {
    updateTertiaryInstitutionProfile(input: $input, condition: $condition) {
      id
      userId
      institutionName
      nationCode
      regionCode
      countyCode
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteTertiaryInstitutionProfile = /* GraphQL */ `
  mutation DeleteTertiaryInstitutionProfile(
    $input: DeleteTertiaryInstitutionProfileInput!
    $condition: ModelTertiaryInstitutionProfileConditionInput
  ) {
    deleteTertiaryInstitutionProfile(input: $input, condition: $condition) {
      id
      userId
      institutionName
      nationCode
      regionCode
      countyCode
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createGrade12ResultSummary = /* GraphQL */ `
  mutation CreateGrade12ResultSummary(
    $input: CreateGrade12ResultSummaryInput!
    $condition: ModelGrade12ResultSummaryConditionInput
  ) {
    createGrade12ResultSummary(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      countyCode
      regionCode
      nationCode
      academicYear
      gradeLevel
      targetCareerId
      targetCareerName
      pathwayId
      pathwayName
      finalAggregatePoints
      requiredAggregatePoints
      aggregateGap
      resultStatus
      wasTargetCareerReached
      placementStatus
      institutionId
      institutionName
      courseId
      courseName
      recordedByUserId
      recordedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateGrade12ResultSummary = /* GraphQL */ `
  mutation UpdateGrade12ResultSummary(
    $input: UpdateGrade12ResultSummaryInput!
    $condition: ModelGrade12ResultSummaryConditionInput
  ) {
    updateGrade12ResultSummary(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      countyCode
      regionCode
      nationCode
      academicYear
      gradeLevel
      targetCareerId
      targetCareerName
      pathwayId
      pathwayName
      finalAggregatePoints
      requiredAggregatePoints
      aggregateGap
      resultStatus
      wasTargetCareerReached
      placementStatus
      institutionId
      institutionName
      courseId
      courseName
      recordedByUserId
      recordedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteGrade12ResultSummary = /* GraphQL */ `
  mutation DeleteGrade12ResultSummary(
    $input: DeleteGrade12ResultSummaryInput!
    $condition: ModelGrade12ResultSummaryConditionInput
  ) {
    deleteGrade12ResultSummary(input: $input, condition: $condition) {
      id
      learnerId
      schoolCode
      countyCode
      regionCode
      nationCode
      academicYear
      gradeLevel
      targetCareerId
      targetCareerName
      pathwayId
      pathwayName
      finalAggregatePoints
      requiredAggregatePoints
      aggregateGap
      resultStatus
      wasTargetCareerReached
      placementStatus
      institutionId
      institutionName
      courseId
      courseName
      recordedByUserId
      recordedAt
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearner = /* GraphQL */ `
  mutation CreateLearner(
    $input: CreateLearnerInput!
    $condition: ModelLearnerConditionInput
  ) {
    createLearner(input: $input, condition: $condition) {
      id
      learnerId
      assessmentNumber
      fullName
      gender
      gradeLevel
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      classCode
      parentNationalId
      selectedCareerId
      selectedPathwayId
      supportProfile
      status
      createdByTeacherId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearner = /* GraphQL */ `
  mutation UpdateLearner(
    $input: UpdateLearnerInput!
    $condition: ModelLearnerConditionInput
  ) {
    updateLearner(input: $input, condition: $condition) {
      id
      learnerId
      assessmentNumber
      fullName
      gender
      gradeLevel
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      classCode
      parentNationalId
      selectedCareerId
      selectedPathwayId
      supportProfile
      status
      createdByTeacherId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearner = /* GraphQL */ `
  mutation DeleteLearner(
    $input: DeleteLearnerInput!
    $condition: ModelLearnerConditionInput
  ) {
    deleteLearner(input: $input, condition: $condition) {
      id
      learnerId
      assessmentNumber
      fullName
      gender
      gradeLevel
      nationCode
      regionCode
      countyCode
      subCountyCode
      schoolCode
      classCode
      parentNationalId
      selectedCareerId
      selectedPathwayId
      supportProfile
      status
      createdByTeacherId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAcademicRecord = /* GraphQL */ `
  mutation CreateAcademicRecord(
    $input: CreateAcademicRecordInput!
    $condition: ModelAcademicRecordConditionInput
  ) {
    createAcademicRecord(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      termOrCycle
      targetValues
      achievedValues
      subjectBreakdown
      competencyBreakdown
      deviationPercent
      escalationLevel
      escalationStatus
      calculatedAt
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const updateAcademicRecord = /* GraphQL */ `
  mutation UpdateAcademicRecord(
    $input: UpdateAcademicRecordInput!
    $condition: ModelAcademicRecordConditionInput
  ) {
    updateAcademicRecord(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      termOrCycle
      targetValues
      achievedValues
      subjectBreakdown
      competencyBreakdown
      deviationPercent
      escalationLevel
      escalationStatus
      calculatedAt
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const deleteAcademicRecord = /* GraphQL */ `
  mutation DeleteAcademicRecord(
    $input: DeleteAcademicRecordInput!
    $condition: ModelAcademicRecordConditionInput
  ) {
    deleteAcademicRecord(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      termOrCycle
      targetValues
      achievedValues
      subjectBreakdown
      competencyBreakdown
      deviationPercent
      escalationLevel
      escalationStatus
      calculatedAt
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const createIntervention = /* GraphQL */ `
  mutation CreateIntervention(
    $input: CreateInterventionInput!
    $condition: ModelInterventionConditionInput
  ) {
    createIntervention(input: $input, condition: $condition) {
      id
      learnerId
      authorUserId
      authorRole
      jurisdictionCode
      interventionType
      note
      dueDate
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateIntervention = /* GraphQL */ `
  mutation UpdateIntervention(
    $input: UpdateInterventionInput!
    $condition: ModelInterventionConditionInput
  ) {
    updateIntervention(input: $input, condition: $condition) {
      id
      learnerId
      authorUserId
      authorRole
      jurisdictionCode
      interventionType
      note
      dueDate
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteIntervention = /* GraphQL */ `
  mutation DeleteIntervention(
    $input: DeleteInterventionInput!
    $condition: ModelInterventionConditionInput
  ) {
    deleteIntervention(input: $input, condition: $condition) {
      id
      learnerId
      authorUserId
      authorRole
      jurisdictionCode
      interventionType
      note
      dueDate
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createFeedback = /* GraphQL */ `
  mutation CreateFeedback(
    $input: CreateFeedbackInput!
    $condition: ModelFeedbackConditionInput
  ) {
    createFeedback(input: $input, condition: $condition) {
      id
      targetType
      targetId
      audienceType
      audienceId
      authorUserId
      authorRole
      message
      category
      priority
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateFeedback = /* GraphQL */ `
  mutation UpdateFeedback(
    $input: UpdateFeedbackInput!
    $condition: ModelFeedbackConditionInput
  ) {
    updateFeedback(input: $input, condition: $condition) {
      id
      targetType
      targetId
      audienceType
      audienceId
      authorUserId
      authorRole
      message
      category
      priority
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteFeedback = /* GraphQL */ `
  mutation DeleteFeedback(
    $input: DeleteFeedbackInput!
    $condition: ModelFeedbackConditionInput
  ) {
    deleteFeedback(input: $input, condition: $condition) {
      id
      targetType
      targetId
      audienceType
      audienceId
      authorUserId
      authorRole
      message
      category
      priority
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCatalogConfig = /* GraphQL */ `
  mutation CreateCatalogConfig(
    $input: CreateCatalogConfigInput!
    $condition: ModelCatalogConfigConditionInput
  ) {
    createCatalogConfig(input: $input, condition: $condition) {
      id
      configId
      configType
      code
      name
      parentCode
      rules
      effectiveFrom
      effectiveTo
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateCatalogConfig = /* GraphQL */ `
  mutation UpdateCatalogConfig(
    $input: UpdateCatalogConfigInput!
    $condition: ModelCatalogConfigConditionInput
  ) {
    updateCatalogConfig(input: $input, condition: $condition) {
      id
      configId
      configType
      code
      name
      parentCode
      rules
      effectiveFrom
      effectiveTo
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteCatalogConfig = /* GraphQL */ `
  mutation DeleteCatalogConfig(
    $input: DeleteCatalogConfigInput!
    $condition: ModelCatalogConfigConditionInput
  ) {
    deleteCatalogConfig(input: $input, condition: $condition) {
      id
      configId
      configType
      code
      name
      parentCode
      rules
      effectiveFrom
      effectiveTo
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPlacementOutcome = /* GraphQL */ `
  mutation CreatePlacementOutcome(
    $input: CreatePlacementOutcomeInput!
    $condition: ModelPlacementOutcomeConditionInput
  ) {
    createPlacementOutcome(input: $input, condition: $condition) {
      id
      learnerId
      intendedCareerId
      selectedPathwayId
      institutionId
      courseId
      actualPlacementOutcome
      placementStatus
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePlacementOutcome = /* GraphQL */ `
  mutation UpdatePlacementOutcome(
    $input: UpdatePlacementOutcomeInput!
    $condition: ModelPlacementOutcomeConditionInput
  ) {
    updatePlacementOutcome(input: $input, condition: $condition) {
      id
      learnerId
      intendedCareerId
      selectedPathwayId
      institutionId
      courseId
      actualPlacementOutcome
      placementStatus
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePlacementOutcome = /* GraphQL */ `
  mutation DeletePlacementOutcome(
    $input: DeletePlacementOutcomeInput!
    $condition: ModelPlacementOutcomeConditionInput
  ) {
    deletePlacementOutcome(input: $input, condition: $condition) {
      id
      learnerId
      intendedCareerId
      selectedPathwayId
      institutionId
      courseId
      actualPlacementOutcome
      placementStatus
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createEvidenceAttachment = /* GraphQL */ `
  mutation CreateEvidenceAttachment(
    $input: CreateEvidenceAttachmentInput!
    $condition: ModelEvidenceAttachmentConditionInput
  ) {
    createEvidenceAttachment(input: $input, condition: $condition) {
      id
      learnerId
      uploadedByUserId
      schoolCode
      classCode
      subjectId
      evidenceType
      s3Bucket
      fileName
      fileKey
      fileType
      fileSizeBytes
      checksum
      relatedCompetency
      capturedAt
      status
      metadata
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateEvidenceAttachment = /* GraphQL */ `
  mutation UpdateEvidenceAttachment(
    $input: UpdateEvidenceAttachmentInput!
    $condition: ModelEvidenceAttachmentConditionInput
  ) {
    updateEvidenceAttachment(input: $input, condition: $condition) {
      id
      learnerId
      uploadedByUserId
      schoolCode
      classCode
      subjectId
      evidenceType
      s3Bucket
      fileName
      fileKey
      fileType
      fileSizeBytes
      checksum
      relatedCompetency
      capturedAt
      status
      metadata
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteEvidenceAttachment = /* GraphQL */ `
  mutation DeleteEvidenceAttachment(
    $input: DeleteEvidenceAttachmentInput!
    $condition: ModelEvidenceAttachmentConditionInput
  ) {
    deleteEvidenceAttachment(input: $input, condition: $condition) {
      id
      learnerId
      uploadedByUserId
      schoolCode
      classCode
      subjectId
      evidenceType
      s3Bucket
      fileName
      fileKey
      fileType
      fileSizeBytes
      checksum
      relatedCompetency
      capturedAt
      status
      metadata
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSubjectPathwayMap = /* GraphQL */ `
  mutation CreateSubjectPathwayMap(
    $input: CreateSubjectPathwayMapInput!
    $condition: ModelSubjectPathwayMapConditionInput
  ) {
    createSubjectPathwayMap(input: $input, condition: $condition) {
      id
      pathwayId
      pathwayCode
      pathwayName
      subjectId
      subjectCode
      subjectName
      isCore
      displayOrder
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSubjectPathwayMap = /* GraphQL */ `
  mutation UpdateSubjectPathwayMap(
    $input: UpdateSubjectPathwayMapInput!
    $condition: ModelSubjectPathwayMapConditionInput
  ) {
    updateSubjectPathwayMap(input: $input, condition: $condition) {
      id
      pathwayId
      pathwayCode
      pathwayName
      subjectId
      subjectCode
      subjectName
      isCore
      displayOrder
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSubjectPathwayMap = /* GraphQL */ `
  mutation DeleteSubjectPathwayMap(
    $input: DeleteSubjectPathwayMapInput!
    $condition: ModelSubjectPathwayMapConditionInput
  ) {
    deleteSubjectPathwayMap(input: $input, condition: $condition) {
      id
      pathwayId
      pathwayCode
      pathwayName
      subjectId
      subjectCode
      subjectName
      isCore
      displayOrder
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createNationalAggregateRequirement = /* GraphQL */ `
  mutation CreateNationalAggregateRequirement(
    $input: CreateNationalAggregateRequirementInput!
    $condition: ModelNationalAggregateRequirementConditionInput
  ) {
    createNationalAggregateRequirement(input: $input, condition: $condition) {
      id
      academicYear
      pathwayId
      pathwayCode
      pathwayName
      courseId
      courseCode
      courseName
      requiredAggregatePoints
      notes
      status
      createdByUserId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateNationalAggregateRequirement = /* GraphQL */ `
  mutation UpdateNationalAggregateRequirement(
    $input: UpdateNationalAggregateRequirementInput!
    $condition: ModelNationalAggregateRequirementConditionInput
  ) {
    updateNationalAggregateRequirement(input: $input, condition: $condition) {
      id
      academicYear
      pathwayId
      pathwayCode
      pathwayName
      courseId
      courseCode
      courseName
      requiredAggregatePoints
      notes
      status
      createdByUserId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteNationalAggregateRequirement = /* GraphQL */ `
  mutation DeleteNationalAggregateRequirement(
    $input: DeleteNationalAggregateRequirementInput!
    $condition: ModelNationalAggregateRequirementConditionInput
  ) {
    deleteNationalAggregateRequirement(input: $input, condition: $condition) {
      id
      academicYear
      pathwayId
      pathwayCode
      pathwayName
      courseId
      courseCode
      courseName
      requiredAggregatePoints
      notes
      status
      createdByUserId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerAnnualAggregate = /* GraphQL */ `
  mutation CreateLearnerAnnualAggregate(
    $input: CreateLearnerAnnualAggregateInput!
    $condition: ModelLearnerAnnualAggregateConditionInput
  ) {
    createLearnerAnnualAggregate(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      pathwayId
      courseId
      achievedAggregatePoints
      personalTargetAggregatePoints
      requiredAggregatePoints
      aggregateGap
      computedFrom
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerAnnualAggregate = /* GraphQL */ `
  mutation UpdateLearnerAnnualAggregate(
    $input: UpdateLearnerAnnualAggregateInput!
    $condition: ModelLearnerAnnualAggregateConditionInput
  ) {
    updateLearnerAnnualAggregate(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      pathwayId
      courseId
      achievedAggregatePoints
      personalTargetAggregatePoints
      requiredAggregatePoints
      aggregateGap
      computedFrom
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerAnnualAggregate = /* GraphQL */ `
  mutation DeleteLearnerAnnualAggregate(
    $input: DeleteLearnerAnnualAggregateInput!
    $condition: ModelLearnerAnnualAggregateConditionInput
  ) {
    deleteLearnerAnnualAggregate(input: $input, condition: $condition) {
      id
      learnerId
      academicYear
      pathwayId
      courseId
      achievedAggregatePoints
      personalTargetAggregatePoints
      requiredAggregatePoints
      aggregateGap
      computedFrom
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAssessmentToolTemplate = /* GraphQL */ `
  mutation CreateAssessmentToolTemplate(
    $input: CreateAssessmentToolTemplateInput!
    $condition: ModelAssessmentToolTemplateConditionInput
  ) {
    createAssessmentToolTemplate(input: $input, condition: $condition) {
      id
      toolCode
      toolName
      toolType
      category
      description
      requiresEvidenceDefault
      scoringMode
      maxScore
      levelScaleJson
      rubricJson
      academicYear
      version
      status
      createdByUserId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAssessmentToolTemplate = /* GraphQL */ `
  mutation UpdateAssessmentToolTemplate(
    $input: UpdateAssessmentToolTemplateInput!
    $condition: ModelAssessmentToolTemplateConditionInput
  ) {
    updateAssessmentToolTemplate(input: $input, condition: $condition) {
      id
      toolCode
      toolName
      toolType
      category
      description
      requiresEvidenceDefault
      scoringMode
      maxScore
      levelScaleJson
      rubricJson
      academicYear
      version
      status
      createdByUserId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAssessmentToolTemplate = /* GraphQL */ `
  mutation DeleteAssessmentToolTemplate(
    $input: DeleteAssessmentToolTemplateInput!
    $condition: ModelAssessmentToolTemplateConditionInput
  ) {
    deleteAssessmentToolTemplate(input: $input, condition: $condition) {
      id
      toolCode
      toolName
      toolType
      category
      description
      requiresEvidenceDefault
      scoringMode
      maxScore
      levelScaleJson
      rubricJson
      academicYear
      version
      status
      createdByUserId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAssessmentToolParameter = /* GraphQL */ `
  mutation CreateAssessmentToolParameter(
    $input: CreateAssessmentToolParameterInput!
    $condition: ModelAssessmentToolParameterConditionInput
  ) {
    createAssessmentToolParameter(input: $input, condition: $condition) {
      id
      toolTemplateId
      parameterCode
      parameterName
      domain
      weight
      maxScore
      levelDescriptorsJson
      requiresEvidence
      displayOrder
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAssessmentToolParameter = /* GraphQL */ `
  mutation UpdateAssessmentToolParameter(
    $input: UpdateAssessmentToolParameterInput!
    $condition: ModelAssessmentToolParameterConditionInput
  ) {
    updateAssessmentToolParameter(input: $input, condition: $condition) {
      id
      toolTemplateId
      parameterCode
      parameterName
      domain
      weight
      maxScore
      levelDescriptorsJson
      requiresEvidence
      displayOrder
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAssessmentToolParameter = /* GraphQL */ `
  mutation DeleteAssessmentToolParameter(
    $input: DeleteAssessmentToolParameterInput!
    $condition: ModelAssessmentToolParameterConditionInput
  ) {
    deleteAssessmentToolParameter(input: $input, condition: $condition) {
      id
      toolTemplateId
      parameterCode
      parameterName
      domain
      weight
      maxScore
      levelDescriptorsJson
      requiresEvidence
      displayOrder
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerAssessment = /* GraphQL */ `
  mutation CreateLearnerAssessment(
    $input: CreateLearnerAssessmentInput!
    $condition: ModelLearnerAssessmentConditionInput
  ) {
    createLearnerAssessment(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      toolTemplateId
      academicYear
      termOrCycle
      assessmentDate
      taskCode
      taskTitle
      taskDescription
      assessorType
      assessedByLearnerId
      groupId
      observationContext
      selfReflectionText
      overallScore
      overallLevel
      teacherComment
      moderationStatus
      moderationComment
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerAssessment = /* GraphQL */ `
  mutation UpdateLearnerAssessment(
    $input: UpdateLearnerAssessmentInput!
    $condition: ModelLearnerAssessmentConditionInput
  ) {
    updateLearnerAssessment(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      toolTemplateId
      academicYear
      termOrCycle
      assessmentDate
      taskCode
      taskTitle
      taskDescription
      assessorType
      assessedByLearnerId
      groupId
      observationContext
      selfReflectionText
      overallScore
      overallLevel
      teacherComment
      moderationStatus
      moderationComment
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerAssessment = /* GraphQL */ `
  mutation DeleteLearnerAssessment(
    $input: DeleteLearnerAssessmentInput!
    $condition: ModelLearnerAssessmentConditionInput
  ) {
    deleteLearnerAssessment(input: $input, condition: $condition) {
      id
      learnerId
      teacherId
      schoolCode
      classCode
      subjectId
      competencyId
      toolTemplateId
      academicYear
      termOrCycle
      assessmentDate
      taskCode
      taskTitle
      taskDescription
      assessorType
      assessedByLearnerId
      groupId
      observationContext
      selfReflectionText
      overallScore
      overallLevel
      teacherComment
      moderationStatus
      moderationComment
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createLearnerAssessmentParameterScore = /* GraphQL */ `
  mutation CreateLearnerAssessmentParameterScore(
    $input: CreateLearnerAssessmentParameterScoreInput!
    $condition: ModelLearnerAssessmentParameterScoreConditionInput
  ) {
    createLearnerAssessmentParameterScore(
      input: $input
      condition: $condition
    ) {
      id
      learnerAssessmentId
      parameterId
      parameterCode
      parameterName
      score
      level
      comment
      evidenceRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLearnerAssessmentParameterScore = /* GraphQL */ `
  mutation UpdateLearnerAssessmentParameterScore(
    $input: UpdateLearnerAssessmentParameterScoreInput!
    $condition: ModelLearnerAssessmentParameterScoreConditionInput
  ) {
    updateLearnerAssessmentParameterScore(
      input: $input
      condition: $condition
    ) {
      id
      learnerAssessmentId
      parameterId
      parameterCode
      parameterName
      score
      level
      comment
      evidenceRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLearnerAssessmentParameterScore = /* GraphQL */ `
  mutation DeleteLearnerAssessmentParameterScore(
    $input: DeleteLearnerAssessmentParameterScoreInput!
    $condition: ModelLearnerAssessmentParameterScoreConditionInput
  ) {
    deleteLearnerAssessmentParameterScore(
      input: $input
      condition: $condition
    ) {
      id
      learnerAssessmentId
      parameterId
      parameterCode
      parameterName
      score
      level
      comment
      evidenceRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createAssessmentEvidenceLink = /* GraphQL */ `
  mutation CreateAssessmentEvidenceLink(
    $input: CreateAssessmentEvidenceLinkInput!
    $condition: ModelAssessmentEvidenceLinkConditionInput
  ) {
    createAssessmentEvidenceLink(input: $input, condition: $condition) {
      id
      learnerAssessmentId
      parameterScoreId
      evidenceAttachmentId
      caption
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateAssessmentEvidenceLink = /* GraphQL */ `
  mutation UpdateAssessmentEvidenceLink(
    $input: UpdateAssessmentEvidenceLinkInput!
    $condition: ModelAssessmentEvidenceLinkConditionInput
  ) {
    updateAssessmentEvidenceLink(input: $input, condition: $condition) {
      id
      learnerAssessmentId
      parameterScoreId
      evidenceAttachmentId
      caption
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteAssessmentEvidenceLink = /* GraphQL */ `
  mutation DeleteAssessmentEvidenceLink(
    $input: DeleteAssessmentEvidenceLinkInput!
    $condition: ModelAssessmentEvidenceLinkConditionInput
  ) {
    deleteAssessmentEvidenceLink(input: $input, condition: $condition) {
      id
      learnerAssessmentId
      parameterScoreId
      evidenceAttachmentId
      caption
      createdAt
      updatedAt
      __typename
    }
  }
`;
