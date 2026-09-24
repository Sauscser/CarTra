/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSubject = /* GraphQL */ `
  query GetSubject($id: ID!) {
    getSubject(id: $id) {
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
export const listSubjects = /* GraphQL */ `
  query ListSubjects(
    $filter: ModelSubjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSubjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getCoreSubject = /* GraphQL */ `
  query GetCoreSubject($id: ID!) {
    getCoreSubject(id: $id) {
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
export const listCoreSubjects = /* GraphQL */ `
  query ListCoreSubjects(
    $filter: ModelCoreSubjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCoreSubjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSupportSubject = /* GraphQL */ `
  query GetSupportSubject($id: ID!) {
    getSupportSubject(id: $id) {
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
export const listSupportSubjects = /* GraphQL */ `
  query ListSupportSubjects(
    $filter: ModelSupportSubjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSupportSubjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getJuniorLearningArea = /* GraphQL */ `
  query GetJuniorLearningArea($id: ID!) {
    getJuniorLearningArea(id: $id) {
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
export const listJuniorLearningAreas = /* GraphQL */ `
  query ListJuniorLearningAreas(
    $filter: ModelJuniorLearningAreaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listJuniorLearningAreas(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        code
        name
        description
        status
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getJuniorSubject = /* GraphQL */ `
  query GetJuniorSubject($id: ID!) {
    getJuniorSubject(id: $id) {
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
export const listJuniorSubjects = /* GraphQL */ `
  query ListJuniorSubjects(
    $filter: ModelJuniorSubjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listJuniorSubjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSNELearningArea = /* GraphQL */ `
  query GetSNELearningArea($id: ID!) {
    getSNELearningArea(id: $id) {
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
export const listSNELearningAreas = /* GraphQL */ `
  query ListSNELearningAreas(
    $filter: ModelSNELearningAreaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSNELearningAreas(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        code
        name
        description
        status
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSNESubject = /* GraphQL */ `
  query GetSNESubject($id: ID!) {
    getSNESubject(id: $id) {
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
export const listSNESubjects = /* GraphQL */ `
  query ListSNESubjects(
    $filter: ModelSNESubjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSNESubjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTrack = /* GraphQL */ `
  query GetTrack($id: ID!) {
    getTrack(id: $id) {
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
export const listTracks = /* GraphQL */ `
  query ListTracks(
    $filter: ModelTrackFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTracks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        code
        name
        description
        status
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPathway = /* GraphQL */ `
  query GetPathway($id: ID!) {
    getPathway(id: $id) {
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
export const listPathways = /* GraphQL */ `
  query ListPathways(
    $filter: ModelPathwayFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPathways(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getCareer = /* GraphQL */ `
  query GetCareer($id: ID!) {
    getCareer(id: $id) {
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
export const listCareers = /* GraphQL */ `
  query ListCareers(
    $filter: ModelCareerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCareers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getCompetency = /* GraphQL */ `
  query GetCompetency($id: ID!) {
    getCompetency(id: $id) {
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
export const listCompetencies = /* GraphQL */ `
  query ListCompetencies(
    $filter: ModelCompetencyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCompetencies(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getCoreCompetency = /* GraphQL */ `
  query GetCoreCompetency($id: ID!) {
    getCoreCompetency(id: $id) {
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
export const listCoreCompetencies = /* GraphQL */ `
  query ListCoreCompetencies(
    $filter: ModelCoreCompetencyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCoreCompetencies(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getCoreValue = /* GraphQL */ `
  query GetCoreValue($id: ID!) {
    getCoreValue(id: $id) {
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
export const listCoreValues = /* GraphQL */ `
  query ListCoreValues(
    $filter: ModelCoreValueFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCoreValues(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAssessmentRubric = /* GraphQL */ `
  query GetAssessmentRubric($id: ID!) {
    getAssessmentRubric(id: $id) {
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
export const listAssessmentRubrics = /* GraphQL */ `
  query ListAssessmentRubrics(
    $filter: ModelAssessmentRubricFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAssessmentRubrics(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAssessmentRubricCriterion = /* GraphQL */ `
  query GetAssessmentRubricCriterion($id: ID!) {
    getAssessmentRubricCriterion(id: $id) {
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
export const listAssessmentRubricCriteria = /* GraphQL */ `
  query ListAssessmentRubricCriteria(
    $filter: ModelAssessmentRubricCriterionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAssessmentRubricCriteria(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAssessmentRubricColumn = /* GraphQL */ `
  query GetAssessmentRubricColumn($id: ID!) {
    getAssessmentRubricColumn(id: $id) {
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
export const listAssessmentRubricColumns = /* GraphQL */ `
  query ListAssessmentRubricColumns(
    $filter: ModelAssessmentRubricColumnFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAssessmentRubricColumns(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAssessmentRubricScore = /* GraphQL */ `
  query GetAssessmentRubricScore($id: ID!) {
    getAssessmentRubricScore(id: $id) {
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
export const listAssessmentRubricScores = /* GraphQL */ `
  query ListAssessmentRubricScores(
    $filter: ModelAssessmentRubricScoreFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAssessmentRubricScores(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getObservationChecklist = /* GraphQL */ `
  query GetObservationChecklist($id: ID!) {
    getObservationChecklist(id: $id) {
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
export const listObservationChecklists = /* GraphQL */ `
  query ListObservationChecklists(
    $filter: ModelObservationChecklistFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listObservationChecklists(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getObservationChecklistItem = /* GraphQL */ `
  query GetObservationChecklistItem($id: ID!) {
    getObservationChecklistItem(id: $id) {
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
export const listObservationChecklistItems = /* GraphQL */ `
  query ListObservationChecklistItems(
    $filter: ModelObservationChecklistItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listObservationChecklistItems(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getObservationChecklistEntry = /* GraphQL */ `
  query GetObservationChecklistEntry($id: ID!) {
    getObservationChecklistEntry(id: $id) {
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
export const listObservationChecklistEntries = /* GraphQL */ `
  query ListObservationChecklistEntries(
    $filter: ModelObservationChecklistEntryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listObservationChecklistEntries(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getRatingScale = /* GraphQL */ `
  query GetRatingScale($id: ID!) {
    getRatingScale(id: $id) {
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
export const listRatingScales = /* GraphQL */ `
  query ListRatingScales(
    $filter: ModelRatingScaleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRatingScales(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getRatingScaleRow = /* GraphQL */ `
  query GetRatingScaleRow($id: ID!) {
    getRatingScaleRow(id: $id) {
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
export const listRatingScaleRows = /* GraphQL */ `
  query ListRatingScaleRows(
    $filter: ModelRatingScaleRowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRatingScaleRows(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getRatingScaleEntry = /* GraphQL */ `
  query GetRatingScaleEntry($id: ID!) {
    getRatingScaleEntry(id: $id) {
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
export const listRatingScaleEntries = /* GraphQL */ `
  query ListRatingScaleEntries(
    $filter: ModelRatingScaleEntryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRatingScaleEntries(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerPortfolio = /* GraphQL */ `
  query GetLearnerPortfolio($id: ID!) {
    getLearnerPortfolio(id: $id) {
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
export const listLearnerPortfolios = /* GraphQL */ `
  query ListLearnerPortfolios(
    $filter: ModelLearnerPortfolioFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerPortfolios(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerPortfolioAsset = /* GraphQL */ `
  query GetLearnerPortfolioAsset($id: ID!) {
    getLearnerPortfolioAsset(id: $id) {
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
export const listLearnerPortfolioAssets = /* GraphQL */ `
  query ListLearnerPortfolioAssets(
    $filter: ModelLearnerPortfolioAssetFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerPortfolioAssets(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getObservationSchedule = /* GraphQL */ `
  query GetObservationSchedule($id: ID!) {
    getObservationSchedule(id: $id) {
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
export const listObservationSchedules = /* GraphQL */ `
  query ListObservationSchedules(
    $filter: ModelObservationScheduleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listObservationSchedules(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerDocumentResource = /* GraphQL */ `
  query GetLearnerDocumentResource($id: ID!) {
    getLearnerDocumentResource(id: $id) {
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
export const listLearnerDocumentResources = /* GraphQL */ `
  query ListLearnerDocumentResources(
    $filter: ModelLearnerDocumentResourceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerDocumentResources(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerAssessmentEvidenceCollection = /* GraphQL */ `
  query GetLearnerAssessmentEvidenceCollection($id: ID!) {
    getLearnerAssessmentEvidenceCollection(id: $id) {
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
export const listLearnerAssessmentEvidenceCollections = /* GraphQL */ `
  query ListLearnerAssessmentEvidenceCollections(
    $filter: ModelLearnerAssessmentEvidenceCollectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerAssessmentEvidenceCollections(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerAssessmentEvidenceItem = /* GraphQL */ `
  query GetLearnerAssessmentEvidenceItem($id: ID!) {
    getLearnerAssessmentEvidenceItem(id: $id) {
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
export const listLearnerAssessmentEvidenceItems = /* GraphQL */ `
  query ListLearnerAssessmentEvidenceItems(
    $filter: ModelLearnerAssessmentEvidenceItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerAssessmentEvidenceItems(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAcademicTarget = /* GraphQL */ `
  query GetAcademicTarget($id: ID!) {
    getAcademicTarget(id: $id) {
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
export const listAcademicTargets = /* GraphQL */ `
  query ListAcademicTargets(
    $filter: ModelAcademicTargetFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAcademicTargets(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getPerformanceIndicator = /* GraphQL */ `
  query GetPerformanceIndicator($id: ID!) {
    getPerformanceIndicator(id: $id) {
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
export const listPerformanceIndicators = /* GraphQL */ `
  query ListPerformanceIndicators(
    $filter: ModelPerformanceIndicatorFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPerformanceIndicators(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerCompetency = /* GraphQL */ `
  query GetLearnerCompetency($id: ID!) {
    getLearnerCompetency(id: $id) {
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
export const listLearnerCompetencies = /* GraphQL */ `
  query ListLearnerCompetencies(
    $filter: ModelLearnerCompetencyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerCompetencies(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSchoolClass = /* GraphQL */ `
  query GetSchoolClass($id: ID!) {
    getSchoolClass(id: $id) {
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
export const listSchoolClasses = /* GraphQL */ `
  query ListSchoolClasses(
    $filter: ModelSchoolClassFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSchoolClasses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerEnrollment = /* GraphQL */ `
  query GetLearnerEnrollment($id: ID!) {
    getLearnerEnrollment(id: $id) {
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
export const listLearnerEnrollments = /* GraphQL */ `
  query ListLearnerEnrollments(
    $filter: ModelLearnerEnrollmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerEnrollments(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAssessmentTask = /* GraphQL */ `
  query GetAssessmentTask($id: ID!) {
    getAssessmentTask(id: $id) {
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
export const listAssessmentTasks = /* GraphQL */ `
  query ListAssessmentTasks(
    $filter: ModelAssessmentTaskFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAssessmentTasks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAssessmentSubmission = /* GraphQL */ `
  query GetAssessmentSubmission($id: ID!) {
    getAssessmentSubmission(id: $id) {
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
export const listAssessmentSubmissions = /* GraphQL */ `
  query ListAssessmentSubmissions(
    $filter: ModelAssessmentSubmissionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAssessmentSubmissions(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearningMaterial = /* GraphQL */ `
  query GetLearningMaterial($id: ID!) {
    getLearningMaterial(id: $id) {
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
export const listLearningMaterials = /* GraphQL */ `
  query ListLearningMaterials(
    $filter: ModelLearningMaterialFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearningMaterials(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAttendanceRecord = /* GraphQL */ `
  query GetAttendanceRecord($id: ID!) {
    getAttendanceRecord(id: $id) {
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
export const listAttendanceRecords = /* GraphQL */ `
  query ListAttendanceRecords(
    $filter: ModelAttendanceRecordFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAttendanceRecords(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getValuesAndAttitudesRecord = /* GraphQL */ `
  query GetValuesAndAttitudesRecord($id: ID!) {
    getValuesAndAttitudesRecord(id: $id) {
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
export const listValuesAndAttitudesRecords = /* GraphQL */ `
  query ListValuesAndAttitudesRecords(
    $filter: ModelValuesAndAttitudesRecordFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listValuesAndAttitudesRecords(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSupportPlan = /* GraphQL */ `
  query GetSupportPlan($id: ID!) {
    getSupportPlan(id: $id) {
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
export const listSupportPlans = /* GraphQL */ `
  query ListSupportPlans(
    $filter: ModelSupportPlanFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSupportPlans(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getEscalationCase = /* GraphQL */ `
  query GetEscalationCase($id: ID!) {
    getEscalationCase(id: $id) {
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
export const listEscalationCases = /* GraphQL */ `
  query ListEscalationCases(
    $filter: ModelEscalationCaseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEscalationCases(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getParentLearnerLink = /* GraphQL */ `
  query GetParentLearnerLink($id: ID!) {
    getParentLearnerLink(id: $id) {
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
export const listParentLearnerLinks = /* GraphQL */ `
  query ListParentLearnerLinks(
    $filter: ModelParentLearnerLinkFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listParentLearnerLinks(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTertiaryCourse = /* GraphQL */ `
  query GetTertiaryCourse($id: ID!) {
    getTertiaryCourse(id: $id) {
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
export const listTertiaryCourses = /* GraphQL */ `
  query ListTertiaryCourses(
    $filter: ModelTertiaryCourseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTertiaryCourses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAcademicCalendar = /* GraphQL */ `
  query GetAcademicCalendar($id: ID!) {
    getAcademicCalendar(id: $id) {
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
export const listAcademicCalendars = /* GraphQL */ `
  query ListAcademicCalendars(
    $filter: ModelAcademicCalendarFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAcademicCalendars(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTermDefinition = /* GraphQL */ `
  query GetTermDefinition($id: ID!) {
    getTermDefinition(id: $id) {
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
export const listTermDefinitions = /* GraphQL */ `
  query ListTermDefinitions(
    $filter: ModelTermDefinitionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTermDefinitions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getOrgHierarchy = /* GraphQL */ `
  query GetOrgHierarchy($id: ID!) {
    getOrgHierarchy(id: $id) {
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
export const listOrgHierarchies = /* GraphQL */ `
  query ListOrgHierarchies(
    $filter: ModelOrgHierarchyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrgHierarchies(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getNationalOfficerProfile = /* GraphQL */ `
  query GetNationalOfficerProfile($id: ID!) {
    getNationalOfficerProfile(id: $id) {
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
export const listNationalOfficerProfiles = /* GraphQL */ `
  query ListNationalOfficerProfiles(
    $filter: ModelNationalOfficerProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNationalOfficerProfiles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        fullName
        nationCode
        assignedRegions
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getRegionalOfficerProfile = /* GraphQL */ `
  query GetRegionalOfficerProfile($id: ID!) {
    getRegionalOfficerProfile(id: $id) {
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
export const listRegionalOfficerProfiles = /* GraphQL */ `
  query ListRegionalOfficerProfiles(
    $filter: ModelRegionalOfficerProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRegionalOfficerProfiles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getCountyOfficerProfile = /* GraphQL */ `
  query GetCountyOfficerProfile($id: ID!) {
    getCountyOfficerProfile(id: $id) {
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
export const listCountyOfficerProfiles = /* GraphQL */ `
  query ListCountyOfficerProfiles(
    $filter: ModelCountyOfficerProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCountyOfficerProfiles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSubCountyOfficerProfile = /* GraphQL */ `
  query GetSubCountyOfficerProfile($id: ID!) {
    getSubCountyOfficerProfile(id: $id) {
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
export const listSubCountyOfficerProfiles = /* GraphQL */ `
  query ListSubCountyOfficerProfiles(
    $filter: ModelSubCountyOfficerProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSubCountyOfficerProfiles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getPrincipalProfile = /* GraphQL */ `
  query GetPrincipalProfile($id: ID!) {
    getPrincipalProfile(id: $id) {
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
export const listPrincipalProfiles = /* GraphQL */ `
  query ListPrincipalProfiles(
    $filter: ModelPrincipalProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPrincipalProfiles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTeacherProfile = /* GraphQL */ `
  query GetTeacherProfile($id: ID!) {
    getTeacherProfile(id: $id) {
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
export const listTeacherProfiles = /* GraphQL */ `
  query ListTeacherProfiles(
    $filter: ModelTeacherProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTeacherProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTeacherHandledSubject = /* GraphQL */ `
  query GetTeacherHandledSubject($id: ID!) {
    getTeacherHandledSubject(id: $id) {
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
export const listTeacherHandledSubjects = /* GraphQL */ `
  query ListTeacherHandledSubjects(
    $filter: ModelTeacherHandledSubjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTeacherHandledSubjects(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTeacherSubjectAssignment = /* GraphQL */ `
  query GetTeacherSubjectAssignment($id: ID!) {
    getTeacherSubjectAssignment(id: $id) {
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
export const listTeacherSubjectAssignments = /* GraphQL */ `
  query ListTeacherSubjectAssignments(
    $filter: ModelTeacherSubjectAssignmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTeacherSubjectAssignments(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getParentProfile = /* GraphQL */ `
  query GetParentProfile($id: ID!) {
    getParentProfile(id: $id) {
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
export const listParentProfiles = /* GraphQL */ `
  query ListParentProfiles(
    $filter: ModelParentProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listParentProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        fullName
        nationalId
        linkedLearnerIds
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getLearnerProfile = /* GraphQL */ `
  query GetLearnerProfile($id: ID!) {
    getLearnerProfile(id: $id) {
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
export const listLearnerProfiles = /* GraphQL */ `
  query ListLearnerProfiles(
    $filter: ModelLearnerProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getTertiaryInstitutionProfile = /* GraphQL */ `
  query GetTertiaryInstitutionProfile($id: ID!) {
    getTertiaryInstitutionProfile(id: $id) {
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
export const listTertiaryInstitutionProfiles = /* GraphQL */ `
  query ListTertiaryInstitutionProfiles(
    $filter: ModelTertiaryInstitutionProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTertiaryInstitutionProfiles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getGrade12ResultSummary = /* GraphQL */ `
  query GetGrade12ResultSummary($id: ID!) {
    getGrade12ResultSummary(id: $id) {
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
export const listGrade12ResultSummaries = /* GraphQL */ `
  query ListGrade12ResultSummaries(
    $filter: ModelGrade12ResultSummaryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGrade12ResultSummaries(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearner = /* GraphQL */ `
  query GetLearner($id: ID!) {
    getLearner(id: $id) {
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
export const listLearners = /* GraphQL */ `
  query ListLearners(
    $filter: ModelLearnerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearners(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAcademicRecord = /* GraphQL */ `
  query GetAcademicRecord($id: ID!) {
    getAcademicRecord(id: $id) {
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
export const listAcademicRecords = /* GraphQL */ `
  query ListAcademicRecords(
    $filter: ModelAcademicRecordFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAcademicRecords(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getIntervention = /* GraphQL */ `
  query GetIntervention($id: ID!) {
    getIntervention(id: $id) {
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
export const listInterventions = /* GraphQL */ `
  query ListInterventions(
    $filter: ModelInterventionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listInterventions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getFeedback = /* GraphQL */ `
  query GetFeedback($id: ID!) {
    getFeedback(id: $id) {
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
export const listFeedbacks = /* GraphQL */ `
  query ListFeedbacks(
    $filter: ModelFeedbackFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFeedbacks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getCatalogConfig = /* GraphQL */ `
  query GetCatalogConfig($id: ID!) {
    getCatalogConfig(id: $id) {
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
export const listCatalogConfigs = /* GraphQL */ `
  query ListCatalogConfigs(
    $filter: ModelCatalogConfigFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCatalogConfigs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getPlacementOutcome = /* GraphQL */ `
  query GetPlacementOutcome($id: ID!) {
    getPlacementOutcome(id: $id) {
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
export const listPlacementOutcomes = /* GraphQL */ `
  query ListPlacementOutcomes(
    $filter: ModelPlacementOutcomeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPlacementOutcomes(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getEvidenceAttachment = /* GraphQL */ `
  query GetEvidenceAttachment($id: ID!) {
    getEvidenceAttachment(id: $id) {
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
export const listEvidenceAttachments = /* GraphQL */ `
  query ListEvidenceAttachments(
    $filter: ModelEvidenceAttachmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEvidenceAttachments(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSubjectPathwayMap = /* GraphQL */ `
  query GetSubjectPathwayMap($id: ID!) {
    getSubjectPathwayMap(id: $id) {
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
export const listSubjectPathwayMaps = /* GraphQL */ `
  query ListSubjectPathwayMaps(
    $filter: ModelSubjectPathwayMapFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSubjectPathwayMaps(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getNationalAggregateRequirement = /* GraphQL */ `
  query GetNationalAggregateRequirement($id: ID!) {
    getNationalAggregateRequirement(id: $id) {
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
export const listNationalAggregateRequirements = /* GraphQL */ `
  query ListNationalAggregateRequirements(
    $filter: ModelNationalAggregateRequirementFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNationalAggregateRequirements(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerAnnualAggregate = /* GraphQL */ `
  query GetLearnerAnnualAggregate($id: ID!) {
    getLearnerAnnualAggregate(id: $id) {
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
export const listLearnerAnnualAggregates = /* GraphQL */ `
  query ListLearnerAnnualAggregates(
    $filter: ModelLearnerAnnualAggregateFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerAnnualAggregates(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAssessmentToolTemplate = /* GraphQL */ `
  query GetAssessmentToolTemplate($id: ID!) {
    getAssessmentToolTemplate(id: $id) {
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
export const listAssessmentToolTemplates = /* GraphQL */ `
  query ListAssessmentToolTemplates(
    $filter: ModelAssessmentToolTemplateFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAssessmentToolTemplates(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAssessmentToolParameter = /* GraphQL */ `
  query GetAssessmentToolParameter($id: ID!) {
    getAssessmentToolParameter(id: $id) {
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
export const listAssessmentToolParameters = /* GraphQL */ `
  query ListAssessmentToolParameters(
    $filter: ModelAssessmentToolParameterFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAssessmentToolParameters(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerAssessment = /* GraphQL */ `
  query GetLearnerAssessment($id: ID!) {
    getLearnerAssessment(id: $id) {
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
export const listLearnerAssessments = /* GraphQL */ `
  query ListLearnerAssessments(
    $filter: ModelLearnerAssessmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerAssessments(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getLearnerAssessmentParameterScore = /* GraphQL */ `
  query GetLearnerAssessmentParameterScore($id: ID!) {
    getLearnerAssessmentParameterScore(id: $id) {
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
export const listLearnerAssessmentParameterScores = /* GraphQL */ `
  query ListLearnerAssessmentParameterScores(
    $filter: ModelLearnerAssessmentParameterScoreFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearnerAssessmentParameterScores(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getAssessmentEvidenceLink = /* GraphQL */ `
  query GetAssessmentEvidenceLink($id: ID!) {
    getAssessmentEvidenceLink(id: $id) {
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
export const listAssessmentEvidenceLinks = /* GraphQL */ `
  query ListAssessmentEvidenceLinks(
    $filter: ModelAssessmentEvidenceLinkFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAssessmentEvidenceLinks(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        learnerAssessmentId
        parameterScoreId
        evidenceAttachmentId
        caption
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
