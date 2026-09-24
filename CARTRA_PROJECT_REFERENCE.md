# CarTra Project Reference

## Purpose
CarTra is a learner-centered mobile application and backend platform that helps learners identify a suitable future career early, set yearly academic targets aligned to that career, track progress over time, detect deviation from the intended path, trigger mentorship and escalation when performance drifts, and report aggregate outcomes to education leadership.

CarTra is intended to support competency-based education and curriculum implementation by combining learner target-setting, performance tracking, mentorship, placement tracking, and education system feedback in one system.

## Product Goals
1. Help learners identify a suitable career beginning in lower secondary.
2. Support annual target setting from Grade 7 onward.
3. Track learner performance against targets over time.
4. Compute deviation between target and achieved performance.
5. Escalate learner support to the correct administrative level using defined thresholds.
6. Allow education stakeholders to mentor learners through comments and interventions.
7. Support dynamic academic structures such as subjects, pathways, tracks, and careers.
8. Provide general and specific dashboards with pie charts, graphs, and trend analysis.
9. Compare intended career or pathway against actual tertiary placement and outcomes.

## Core User Roles
1. Learner
2. Parent or guardian
3. Teacher
4. Principal
5. Sub-county officer
6. County officer
7. Regional officer
8. National officer
9. Tertiary institution officer

## Role Responsibilities

### Learner
1. Set an intended career with guidance.
2. Set yearly performance targets.
3. Review progress, deviation, comments, and interventions.
4. View pathway recommendations and performance trends.

### Parent or Guardian
1. Create own account.
2. Link to learner using national ID already captured against learner record.
3. View learner targets, progress, deviation, comments, and support actions.
4. Participate in guidance and academic clinic processes.

### Teacher
1. Create learner records.
2. Capture learner assessment number as unique learner identity.
3. Capture parent national ID during learner registration.
4. Enter learner targets, yearly performance, and support comments.
5. View class-level and learner-level dashboards.
6. Manage assigned subjects and classes.
7. Capture the learner's actual performance data as the primary source of assessment input.
8. Record subject results, competency progress, intervention notes, and evidence against the assigned learner or class.
9. Submit performance records for review, mentorship, and escalation by school leadership or higher officers.

### Principal
1. Register teachers withinn the school.
2. Capture teacher TSC numbers, assigned classes, and subjects.
3. View school-wide learner performance and escalations.
4. Confirm learner placement information at the end of school cycle.
5. Ensure academic clinics and annual target-setting are completed.

### Sub-county Officer
1. Create schools under their sub-county.
2. Link each school using a school code and principal TSC number.
3. View sub-county performance dashboards.
4. Review learners above the relevant deviation threshold.

### County Officer
1. Create sub-counties under their county.
2. Link each sub-county using codes.
3. View county-level dashboards and escalations.
4. Review learners above the relevant deviation threshold.

### Regional Officer
1. Create counties under their region.
2. Link each county using codes.
3. View regional dashboards and escalations.
4. Review learners above the relevant deviation threshold.

### National Officer
1. Create regions under national jurisdiction.
2. Link each region using unique codes.
3. View national dashboards and escalations.
4. Define calendar rules, policy rules, and high-level reporting views.
5. Review learners above the highest deviation threshold.

### Tertiary Institution Officer
1. Create institution account.
2. Publish approved courses and minimum cluster requirements.
3. Update admitted learner placement outcomes.

## Teacher-Led Performance Capture and Stakeholder Guidance Model
CarTra will treat the teacher as the primary source of learner performance capture, while allowing all higher-level stakeholders to provide professional guidance, review, and intervention input.

### Core Rule
1. Teachers are responsible for entering learner performance data at the classroom and subject level.
2. The teacher remains the primary recorder of academic achievement, competency progress, and supporting evidence.
3. Principals, sub-county officers, county officers, regional officers, and national officers may review the data and provide professional guidance, but they do not replace the teacher's recorded academic input unless a formal correction or review process is initiated.
4. All guidance and review actions must be traceable to the user who made them, the learner or cohort affected, and the review level.

### Guidance and Feedback Model
CarTra should allow stakeholders to give feedback in several ways:

1. Learner-specific feedback
   - teacher comments on learner performance
   - principal recommendations for learner support
   - officer guidance for learners under review
   - parent guidance and support suggestions

2. Cohort or class-level feedback
   - teacher feedback to a whole class or subject group
   - principal feedback to teachers or a particular school cohort
   - sub-county or county officers giving school-level performance guidance
   - regional or national officer feedback on county, sub-county, or school performance trends

3. Hierarchy-to-hierarchy feedback
   - National to Regional feedback on regional performance or policy alignment
   - Regional to County feedback on county performance and intervention priority
   - County to Sub-county feedback on sub-county performance or review actions
   - Sub-county to School or Teacher feedback on school performance and support needs
   - Principal to Teacher feedback on classroom-level learner performance and action plans

4. Formal review and escalation notes
   - reviewer note type
   - audience scope
   - due date
   - severity or support level
   - required action
   - resolution status

### Recommended Feedback Record Structure
Each stakeholder feedback record should capture:
- feedbackId
- targetType (learner, class, school, subCounty, county, region, nation)
- targetId
- audienceType (teacher, school, subCounty, county, region, nation)
- audienceId
- authorUserId
- authorRole
- message
- category (guidance, review, escalation, mentorship, support, policy)
- priority
- status
- createdAt
- updatedAt

### Assessment Rubric Design Principle
CarTra should not force teachers to use a pre-defined rubric parameter list. The rubric model must be flexible enough for teacher-authored criteria and for nested scoring structures.

The recommended design is a rubric matrix with the following logical units:
- rubric sheet: one assessment rubric for a learner or class
- criterion row: a main scoring element or skill
- sub-criterion: nested row underneath a criterion when the teacher needs more detail
- column: scoring band or level such as Emerging, Developing, Proficient, Exemplary
- score entry: the actual learner score at a row/column intersection

This allows the teacher to build a rubric for values, competencies, practical work, projects, and classroom observation without needing a new national schema entry for each small criterion.

### Observation Checklist Design Principle
The observation checklist is the most common teacher assessment tool used in schools for day-to-day classroom tracking. It should be treated as a structured teacher observation model rather than a fixed national parameter list.

Recommended logical units:
- checklist record: one observation assessment for a learner, class, or subject
- checklist item: one observable indicator such as participation, collaboration, communication, responsibility, or respect
- nested item: a child indicator when a teacher wants sub-detail under a bigger behaviour or competency
- score entry: the score or level awarded during observation
- evidence attachment: a teacher file, image, or S3-backed artifact attached to the observation note

This tool is suitable for live classroom observation, behaviour monitoring, values tracking, and competency notes. It should remain flexible enough for teacher-created items while still aligning to a common scoring scale.

### Rating Scale Design Principle
A rating scale is a lighter version of the checklist and rubric model, intended for repeated teacher judgement across a small list of performance levels.

Recommended structure:
- scale title and subject or competency area
- descriptor rows or statements
- performance levels such as 1 to 4, or Emerging to Exemplary
- learner score per row or category
- optional comments and attached evidence

The rating scale should not be a separate fixed national schema for every possible classroom item. It should be built from reusable and teacher-authored rows or statements.

Recommended schema units:
- rating scale record: one scale created for a learner, class, subject, or competency area
- rating row: a descriptor or statement being judged
- score entry: the actual learner score or level against a row
- evidence linkage: optional attachment to the teacher judgment

### Portfolio Generation Principle
Learner portfolios should be generated from uploaded S3-backed evidence files, not from a manually entered spreadsheet of items only. The system will collect uploaded images, documents, and evidence artifacts, then assemble a learner portfolio file from those files for review, sharing, or download.

The portfolio file should be generated from:
- uploaded learner images
- teacher or learner project files
- evidence attachments and observation artifacts
- competency or values records that reference S3 documents

This means the portfolio model should retain the evidence references and assemble a viewable or exportable portfolio bundle from the uploaded asset list.

Recommended portfolio structure:
- learner portfolio record: one portfolio for a learner and academic year
- portfolio asset: each uploaded image, document, or artifact included in the portfolio
- cover image: selected display image for the portfolio
- summary JSON: metadata such as approved assets, evidence notes, and generated date

### Flexible Scanned-Document Linking Principle
Assessment tools must support a variable number of scanned documents per learner. One learner may have 3 files, another 12, and another 21, and the system must handle this without a fixed hard limit.

The design must therefore avoid storing a predetermined array of document fields directly on the learner or the assessment tool. Instead, each file is stored as an independent record under a learner-linked evidence collection.

Recommended structure:
- evidence collection: one parent record for a learner and a specific assessment context
- evidence item: one scanned document or uploaded image record inside that collection
- collection fields: learner, assessment tool type, assessment tool ID, academic year, and metadata
- item fields: file metadata, S3 path, sort order, document number, title, and status

This gives us unlimited growth while remaining easy to query and present.

A typical pattern is:
- one learner has many evidence items
- one assessment tool may have many items attached to it
- one evidence collection may group all files for one tool, term, or learner assessment session
- the UI can display them as a gallery, timeline, or downloadable file list

### Flexible Scanned-Document Storage Model
A good schema for the app is:
- LearnerAssessmentEvidenceCollection: groups all files for a learner under one assessment context
- LearnerAssessmentEvidenceItem: stores each scanned file as a separate record
- AssessmentEvidenceLink: connects evidence items to the exact assessment tool and record
- EvidenceDocumentMeta: stores tags, review notes, competency links, and verification state

This means the system can scale automatically without changing the schema when a learner needs more documents. We only add more rows, not more fixed fields.

### Recommended Evidence Metadata Set
Each uploaded assessment document should include fields for:
- learnerId
- schoolCode and classCode
- uploadedByUserId and uploadedByRole
- documentType, category, title, description
- s3Bucket, fileKey, fileName, mimeType, fileType
- fileSizeBytes, pageCount, checksum
- assessmentToolType, assessmentToolId, assessmentItemId
- subjectId, competencyId, coreValueId
- tags, reviewStatus, verification flag, and annotation JSON
- createdAt and updatedAt

This provides enough information to display the evidence in a gallery, link it to a teacher judgment, and later generate a portfolio from the validated set.

### Document-Review and Presentation Flow
The uploaded evidence should not be treated as a passive file upload. It should participate in the assessment cycle.

Teacher flow:
1. Upload scanned document or image
2. Assign document title and category
3. Link to a learner and assessment tool
4. Tag relevant subject, competency, or value area
5. Mark document as verified or pending review
6. Attach to the learner’s assessment record or portfolio
7. View it in the learner evidence timeline

Stakeholder presentation:
- Learners see their uploaded evidence and portfolio files in a gallery and learning timeline
- Parents see the uploaded work and teacher review summary
- Teachers see the evidence attached to each rubric or checklist item
- Principals review portfolio snapshots and learner evidence sets
- Officers can inspect selected evidence as part of intervention or comparison review

## Assessment Tool Creation UI
Each assessment tool should be created by the teacher from a common assessment hub in the teacher workflow. All tools share the same creation pattern so teachers can move quickly from one tool to another without learning a new process each time.

### Shared Assessment Hub
The teacher opens an Assessment Tools screen showing cards for:
1. Rubric
2. Observation Checklist
3. Rating Scale
4. Portfolio

Each card includes:
- name of tool
- purpose
- last used date
- number of learners assessed
- status
- create new action

### 1. Rubric Creation UI
Teacher flow:
1. Select Create Rubric
2. Enter rubric title, subject, class, learner or cohort, academic year, and term
3. Choose rubric type: competency, values, practical work, project, or general assessment
4. Add criterion rows using an inline add-row control
5. For each criterion, optionally add sub-criteria
6. Add scoring columns such as Emerging, Developing, Proficient, Exemplary
7. Set max score or weight for each row or column
8. Save as draft or publish
9. Assign to one learner, a class, or a selected cohort

UI layout:
- top summary bar with rubric metadata
- left-side panel of criteria rows
- center matrix grid for row and column intersections
- right-side editor for row details, weight, and comments
- bottom action buttons for save, duplicate, publish, and share

### 2. Observation Checklist Creation UI
Teacher flow:
1. Select Create Observation Checklist
2. Choose learner, class, subject, or competency domain
3. Give the checklist a title and observation date
4. Add checklist items in a vertical list
5. Each item has: title, description, score scale, required evidence toggle, and optional sub-item nesting
6. Teacher can reorder items by drag-and-drop or up/down controls
7. Save or publish to the learner record

UI layout:
- header with learner name and class
- list of observable indicators
- each indicator row shows label, score value, notes field, and evidence button
- bottom action bar with Save Draft, Save and Share, and Add Evidence

### 3. Rating Scale Creation UI
Teacher flow:
1. Select Create Rating Scale
2. Choose scale type: values, participation, practical skills, performance behaviour, or general competency
3. Enter scale title and optional description
4. Add descriptor rows with labels like Excellent, Good, Fair, Needs Support
5. Set score values and optional weight
6. Select target learner or class
7. Save and assign

UI layout:
- compact two-column form: scale metadata on the left, descriptor rows on the right
- each descriptor row includes a label, score, and description
- a preview panel shows how the scale will look during marking

### 4. Portfolio Creation UI
Teacher flow:
1. Open Portfolio screen for a learner
2. Select existing uploaded evidence from S3-backed records
3. Choose cover image and the files to include
4. Add summary notes, competency links, or learning reflections
5. Generate portfolio file or export-ready PDF
6. Share or publish to parent, principal, or officer views

UI layout:
- gallery of evidence cards
- selected asset panel with quick preview
- summary notes and learning reflection section
- generate portfolio button
- export/share action bar

## Stakeholder Presentation UI
The same assessment records should be shown to each stakeholder through role-aware views. The system should not expose a raw database dump; it should present data in a learner-friendly and decision-focused way.

### For Learners
Display:
- a progress card for each competency or value area
- a timeline of observations, rubrics, and evidence
- a portfolio gallery of uploaded proof of work
- next-step recommendations based on teacher comments
- simple language summary with strengths and support areas

UI flow:
1. Learner dashboard shows My Growth summary
2. Tap a competency to view performance by term
3. See evidence files and comments linked to each item
4. Open portfolio page to review all uploaded work

### For Parents and Guardians
Display:
- simple summary of strengths and support areas
- values and behaviour progress
- intervention notes and next steps
- evidence gallery showing work completed by the learner
- portfolio snapshot for term or academic year

UI flow:
1. Parent dashboard shows child status cards
2. View current academic and values progress
3. Open a detailed learner progress panel
4. Review note, evidence, and support actions from teacher or school

### For Teachers
Display:
- learner list grouped by class and subject
- competency heatmap and risk indicators
- observation checklist entries by learner
- rubric scores by criterion and term
- portfolio links by learner and subject

UI flow:
1. Teacher opens class dashboard
2. Select learner card
3. View assessment history and evidence timeline
4. Add a new observation, score, or portfolio item
5. Use quick actions: mark, comment, attach evidence, share

### For Principals and School Leadership
Display:
- cohort performance summary by class and subject
- support needs and unresolved interventions
- observation and values trends by class
- learner portfolio snapshot for selected learners
- summary of teacher-submitted learner progress

UI flow:
1. Principal opens school dashboard
2. Filter by class, learning area, or term
3. Review cohort trend and risk distribution
4. Drill into learner detail for intervention or guidance

### For Sub-county, County, Regional, and National Officers
Display:
- jurisdiction-level trend charts
- aggregate risk and support distribution
- school comparison tables
- portfolio and evidence summary for selected learners or schools at review time
- escalation and intervention status by district or county

UI flow:
1. Officer dashboard opens at jurisdiction level
2. Drill down from region to county to sub-county to school
3. Review cohort risk bands and intervention counts
4. View selected learner or school evidence snapshots when needed

## Assessment Tool Reporting Standard
All assessment tools should follow one reporting pattern:
1. summary card at the top
2. detailed learner scores below
3. evidence gallery or attachments
4. teacher comments and support actions
5. trend over time by term or academic year

This ensures every stakeholder gets the same core information in a different level of detail depending on role and responsibility.

### Additional Stakeholder Actions We Should Allow
To make the workflow useful, CarTra should allow the following actions by role:

1. Teachers
   - record performance and competency assessments
   - comment on learner support needs
   - request intervention or guidance from the principal
   - upload evidence or project work
   - flag learners for mentorship or review

2. Principals
   - review teacher-submitted learner performance
   - give guidance to teachers on instructional support
   - validate or approve school-level interventions
   - escalate school-level trends to the sub-county officer
   - confirm learner placement or support actions near cycle close

3. Sub-county officers
   - review school-level performance and risk trends
   - give guidance to principals or teachers under the sub-county
   - escalate school or learner concerns upward to the county officer
   - monitor interventions and unresolved issues

4. County officers
   - review sub-county and school performance trends
   - give feedback to sub-counties and school leaders
   - coordinate county-level mentorship or policy actions
   - escalate high risk trends to the regional officer

5. Regional officers
   - review county and lower-level performance patterns
   - give feedback to county, sub-county, and school actors under the region
   - approve or coordinate regional interventions
   - transfer county officers by updating county assignment email

6. National officers
   - review all regions and national indicators
   - provide guidance to regional officers and national-level schools or agencies
   - coordinate national interventions and policy decisions
   - reassign regions by updating the assigned regional officer email

### Governance Principle
Each stakeholder should be able to give feedback only within their assigned scope. They may not view or edit unrelated entities outside their jurisdiction. Their comments should be visible to the relevant lower or same-level stakeholders, but access remains role-and-scope aware.

## Cognito Group Authorization Model (Implemented)
CarTra uses Cognito group-based GraphQL authorization so create or update operations are not open to any authenticated user.

### Delegation Flow
1. appOwner group designates National officers and can fully manage top-level reference and hierarchy records.
2. nationalOfficer group can create and manage national, regional, county, sub-county, school, principal, teacher, and learner-linked operational records across the full cascade, while also owning the national reference catalog.
3. regionalOfficer group can create and manage county, sub-county, school, principal, teacher, learner, and related school-level operational records within its region.
4. countyOfficer group can create and manage sub-county, school, principal, teacher, learner, and related school-level operational records within its county.
5. subCountyOfficer group can create schools and school leadership records, including principal and teacher profiles, plus school-linked learner and operational records under its sub-county.
6. principal group can co-manage school operational records, teacher assignments, and learner-linked school data.
7. teacher group is the primary creator and updater for learner-linked academic and performance records.

### Enforced by Schema
1. Hierarchy and officer profile tables are protected with group-specific create or update permissions.
2. Higher-level officers can mutate lower-level records inside their administrative cascade and can read those records for oversight.
3. National officers own the master catalog tables for subjects, tracks, pathways, competencies, careers, assessment templates, and related policy metadata.
4. Teacher-owned tables (targets, performance indicators, submissions, records, learner-linked evidence) are created by teachers and read upward by principals, sub-county, county, regional, and national officers.
5. Parent and learner access is handled through authenticated private access (not dedicated Cognito groups), with mostly read-focused rights for academic records and limited create rights where appropriate (for example feedback participation).

### Cascade Ownership Rule
The key business rule is that each administrative role owns the entire lower cascade beneath it, not only its own profile record:
- National officer owns the full national-to-learner cascade.
- Regional officer owns county-to-learner records within the assigned region.
- County officer owns sub-county-to-learner records within the assigned county.
- Sub-county officer owns school-to-learner records within the assigned sub-county.
- Principal owns school staff and school learner records running under that school.
- Teacher owns learner academic and performance records for assigned learners.

### Important Enforcement Note
GraphQL group rules enforce who can call create or update, but they do not by themselves guarantee that a regional officer only writes county rows for their assigned region code. That scope-level validation should be enforced in resolver or Lambda guard logic using signed-in user claims and jurisdiction fields.

## Master Catalog vs Learner Instance Records
CarTra separates master catalog definitions from learner-specific data capture.

### Master Catalog Data (owned by National)
National officers create and maintain the authoritative definitions used across the system.

#### Senior Secondary Academic Structure
- Pathway
- Track
- Subject
- CoreSubject
- SupportSubject
- Competency
- CoreCompetency
- CoreValue
- Career
- Assessment rubric matrix definitions
- national catalog configuration

This structure applies to the senior secondary model, where a pathway is linked to a track and a subject belongs to a defined academic group.

#### Junior Secondary Academic Structure
- JuniorLearningArea
- JuniorSubject
- teacher-created rubric matrices for skills and values

Junior secondary does not use the senior secondary pathway/track model. Instead, learners are organized under general learning areas, and each learning area is further divided into junior subjects.

#### SNE / Vocational Academic Structure
- SnelLearningArea
- SnelSubject
- teacher-created rubric matrices for practical and performance-based assessment

SNE and vocational learners use learning-area based curriculum organization, with subjects grouped under those learning areas.

These are reference tables; they are created by the national authority, but they are readable by all roles.

### Learner Instance Data (owned by Teacher / School / Higher Oversight)
Teachers create learner-specific records that attach each learner to the appropriate master catalog values:
- selected pathway or career
- selected junior learning area or SNE learning area
- subject targets and scores
- competency results
- values and attitudes records
- performance indicators
- support plans
- evidence submissions
- enrollment and class assignment

This is how a teacher can attach each learner to the correct academic structure without recreating the national master catalog tables. The teacher creates the learner instance record that references the master catalog IDs and the appropriate learning-area or subject context.

## Role-by-Role Cascade Model
### National Officer
National officers can create and mutate all records under the national hierarchy and national reference catalog, including:
- national office tables
- region records
- regional officer profiles
- county records
- county officer profiles
- sub-county records
- sub-county officer profiles
- school records
- principal profiles
- teacher profiles
- learner profiles and learner records
- all learner-linked assessment, performance, intervention, and feedback records

### Regional Officer
Regional officers can create and mutate all records for the region cascade, including:
- county records
- county officer profiles
- sub-county records
- sub-county officer profiles
- school records
- principal profiles
- teacher profiles
- learner profiles and learner records under schools in that region
- associated academic and support records

### County Officer
County officers can create and mutate all records for the county cascade, including:
- sub-county records
- sub-county officer profiles
- school records
- principal profiles
- teacher profiles
- learner profiles and learner records under schools in that county
- associated school-level support and assessment data

### Sub-county Officer
Sub-county officers can create and mutate all records for the sub-county cascade, including:
- school records
- principal profiles
- teacher profiles
- school class records
- learner enrollment records
- learner performance and support records under schools in the sub-county

### Principal
Principals can create and mutate all records for their school, including:
- teacher profiles
- class records
- school calendar and term records
- teacher assignments
- learner enrollment and school operational records
- learner performance review and support actions

### Teacher
Teachers can create and mutate records for learners under their responsibility, including:
- learner profiles
- learner targets
- performance indicators
- competencies
- values and attitudes records
- attendance
- evidence submissions
- support plans
- assessments and follow-up notes

### Parent
Parents can create and mutate their own profile and learner linkage records, and can view learner-linked academic and support data relevant to their child.

## Hierarchy and Linking Model
CarTra will use manual code-based linking between levels of the education structure.

### Administrative Linking
1. National officer creates regions with a unique RegionCode.
2. Regional officer creates counties linked to a RegionCode.
3. County officer creates sub-counties linked to a CountyCode.
4. Sub-county officer creates schools linked to a SubCountyCode.
5. School record includes the TSC number of the principal.

### School and Learner Linking
1. Principal creates teacher records.
2. Teacher record includes TSC number, assigned classes, and assigned subjects.
3. Teacher creates learner record using AssessmentNumber as the learner unique identifier.
4. Teacher captures ParentNationalID on the learner record.
5. Parent creates own account and enters national ID to link to the learner.

### Identity Capture Rule
Identity and linking values are entered manually by officers and teachers. The system validates format, uniqueness, and scope, but entry itself remains manual.

## Hierarchy Ownership and Transfer Model
CarTra will operate as a jurisdiction-based leadership model in which each officer is associated with a specific administrative unit and can only manage the hierarchy below that unit.

### National Officer Model
1. The National officer creates their own account.
2. The National officer creates regional officers for regions under their national jurisdiction.
3. When creating each region, the National officer records:
   - region code
   - region name
   - assigned regional officer email
   - assigned regional officer password
   - assigned regional officer full name
   - assigned regional officer phone number
4. The system uses the signed-in officer email to load the region or hierarchy attached to that person.
5. The National officer can view:
   - all regions under the nation
   - all counties under the nation
   - all sub-counties under the nation
   - all schools under the nation
   - all teachers under the nation
   - all learners under the nation
   - all learner performance and deviation status within the national view
   - only learners whose performance falls within the officer's allowed national review scope
6. The National officer can transfer a regional officer to another region under the nation by updating the email assigned to that region.
7. Regional officers can change their own password after account creation.

### Regional Officer Model
1. A Regional officer is assigned to a region under the nation.
2. The Regional officer can view:
   - all counties under the region
   - all sub-counties under the region
   - all schools under the region
   - all teachers under the region
   - all learners under the region
   - learner performance whether within threshold or above threshold
   - only the learners whose deviation falls within the regional review scope
3. The Regional officer can transfer county officers to counties under their region by updating the email attached to a given county.
4. The Regional officer creates counties under the region.
5. The Regional officer should be able to see all national-level properties relevant to the region while remaining scoped to the region and below.

### County Officer Model
1. A County officer is assigned to a county under a region.
2. The County officer can view:
   - sub-counties under the county
   - schools under the county
   - teachers under the county
   - learners under the county
   - performance status and deviation status within the county view
   - only those learners whose deviation falls within the county threshold scope
3. The County officer creates sub-counties under the county.
4. The County officer can transfer sub-county officers to sub-counties under the county by updating the email attached to a given sub-county.

### Sub-county Officer Model
1. A Sub-county officer is assigned to a sub-county under a county.
2. The Sub-county officer can view:
   - schools under the sub-county
   - teachers under the sub-county
   - learners under the sub-county
   - learner performance and deviation metrics in the sub-county view
   - only learners whose deviation falls under the sub-county review scope
3. The Sub-county officer creates schools under the sub-county.
4. The Sub-county officer can transfer principals or school-level leadership through the linked school record and assigned email.

### Principal Model
1. The Principal is linked to a school.
2. The Principal can view and manage:
   - teachers in the school
   - learners in the school
   - learner performance and deviation by school
   - learners whose deviation triggers support or escalation under the school scope
3. The Principal is empowered to transfer learners to the appropriate school or reassigned school record when necessary.
4. The Principal manages school-level support and intervention workflows.

### Teacher Model
1. Teachers are assigned to a school and class.
2. Teachers create and maintain learner records for the assigned school.
3. Teachers can view performance and support status for learners in their assigned class or school scope.

## Hierarchical Code and Identity Capture Rule
Each major entity must persist the full chain of administrative ownership to enable filtering, reports, and access control.

1. Every region record must include NationCode, RegionCode, RegionName, and assigned regional officer identity.
2. Every county record must include NationCode, RegionCode, CountyCode, CountyName, and assigned county officer identity.
3. Every sub-county record must include NationCode, RegionCode, CountyCode, SubCountyCode, SubCountyName, and assigned sub-county officer identity.
4. Every school record must include NationCode, RegionCode, CountyCode, SubCountyCode, SchoolCode, SchoolName, and assigned principal identity.
5. Every teacher record must include NationCode, RegionCode, CountyCode, SubCountyCode, SchoolCode, TeacherId, and assigned school/class scope.
6. Every learner record must include NationCode, RegionCode, CountyCode, SubCountyCode, SchoolCode, and the full school path so that all downstream dashboards can be filtered accurately.

This means the learners table should capture the unique code of the school, sub-county, county, region, and nation. The same principle applies to teacher records and all hierarchical records up to the nation.

## Suggested Code Structure
These are suggested examples only and may be refined later.

1. NationCode: NAT-001
2. RegionCode: NAT-001-RG-001
3. CountyCode: NAT-001-RG-001-CT-004
4. SubCountyCode: NAT-001-RG-001-CT-004-SC-009
5. SchoolCode: NAT-001-RG-001-CT-004-SC-009-SCH-012

## Functional Capabilities

### Learner Planning
1. Career awareness and discovery support.
2. Career selection and annual target setting.
3. Pathway, track, and subject planning.
4. Strategy notes for how the learner intends to achieve targets.

### Performance Tracking
1. Annual performance entry.
2. Subject-level performance entry.
3. Aggregate performance tracking.
4. Competency and pathway readiness views.
5. Historical trend tracking by learner and cohort.

### Deviation and Escalation
1. Automatic deviation calculation.
2. Threshold-based escalation routing.
3. Intervention and mentorship logging.
4. Escalation tracking by level and resolution status.

### Dashboards and Analytics
1. Pie charts for risk distribution.
2. Bar and line graphs for performance trends.
3. Learner-specific and population-wide dashboards.
4. Drill-down from national to learner level.
5. Placement success and mismatch reporting.

## Performance Indicators Presentation
CarTra should present learner performance indicators in a way that supports both individual learner guidance and system-wide decision making.

1. RegionCode: RG-001
2. CountyCode: RG-001-CT-004
3. SubCountyCode: RG-001-CT-004-SC-009
4. SchoolCode: RG-001-CT-004-SC-009-SCH-012

## Functional Capabilities

### Learner Planning
1. Career awareness and discovery support.
2. Career selection and annual target setting.
3. Pathway, track, and subject planning.
4. Strategy notes for how the learner intends to achieve targets.

### Performance Tracking
1. Annual performance entry.
2. Subject-level performance entry.
3. Aggregate performance tracking.
4. Competency and pathway readiness views.
5. Historical trend tracking by learner and cohort.

### Deviation and Escalation
1. Automatic deviation calculation.
2. Threshold-based escalation routing.
3. Intervention and mentorship logging.
4. Escalation tracking by level and resolution status.

### Dashboards and Analytics
1. Pie charts for risk distribution.
2. Bar and line graphs for performance trends.
3. Learner-specific and population-wide dashboards.
4. Drill-down from national to learner level.
5. Placement success and mismatch reporting.

## Performance Indicators Presentation
CarTra should present learner performance indicators in a way that supports both individual learner guidance and system-wide decision making.

### Core Indicator Categories
1. Career target alignment status
2. Subject performance status
3. Aggregate performance trend
4. Competency growth status
5. Deviation risk band
6. Intervention and mentorship status
7. Pathway readiness status
8. Placement outcome alignment

### General Performance Views by Role
These views summarize a whole jurisdiction, school, class, or cohort.

1. Pie or donut chart showing learners who are on-track, slightly off-track, moderately off-track, and critically off-track
2. Bar chart showing subject performance averages by class, school, sub-county, county, region, or national level
3. Trend line showing year-over-year improvement or decline for a cohort
4. Stacked bar chart showing pathway distribution and career preference distribution
5. Escalation summary chart showing how many learners are currently under teacher, principal, sub-county, county, regional, or national review
6. Placement outcome chart showing intended career versus actual school completion outcome versus tertiary placement outcome

### Specific Learner Views
These views focus on one learner at a time.

1. Target versus achieved line chart across academic years
2. Subject-by-subject bar chart comparing yearly target score and achieved score
3. Competency progress chart where applicable for competency-based tracking
4. Deviation indicator card showing current deviation percentage and current escalation level
5. Intervention timeline showing comments, actions, due dates, and follow-up outcomes
6. Career readiness panel showing selected career, required cluster or performance expectations, and current readiness gap

### Risk Band Presentation
The system should visually group learners by deviation bands so every stakeholder can quickly identify who needs action.

1. On-track: deviation at or below accepted tolerance
2. Mild risk: deviation present but below formal escalation level
3. Sub-county review risk: above 20 percent
4. County review risk: above 40 percent
5. Regional review risk: above 60 percent
6. National review risk: above 80 percent

### Drill-Down Behavior
1. National dashboard drills down to region
2. Region dashboard drills down to county
3. County dashboard drills down to sub-county
4. Sub-county dashboard drills down to school
5. School dashboard drills down to class, teacher, and learner
6. Parent and learner dashboards do not expose unrelated learner aggregates

### KPI Examples
1. Percentage of learners on target by jurisdiction
2. Percentage of learners above each escalation threshold
3. Average deviation by subject, class, school, county, or region
4. Number of unresolved interventions past due date
5. Percentage of learners whose chosen pathway matches current performance potential
6. Percentage of learners successfully placed in intended or related tertiary pathways

### Dynamic Academic Configuration
1. Create and update subjects dynamically.
2. Create and update pathways dynamically.
3. Create and update tracks dynamically.
4. Create and update careers dynamically.
5. Create and update tertiary courses and cluster point requirements dynamically.
6. Configure grading bands and score formulas dynamically.

## Competency-Based Education Considerations
CarTra should not behave like a marks-only reporting system. It should support competency-oriented growth and progression.

### Important CBE-aligned Additions
1. Competency mastery tracking in addition to raw marks.
2. Evidence-based assessment support where needed.
3. Learner strengths, interests, and support needs profile.
4. Intervention plans with owner and due date.
5. Transition readiness indicators for future pathways.
6. Parent engagement and mentorship visibility.
7. Reporting on both performance and competency development.

### Kenyan CBC and Value-Based Education Additions
CarTra should incorporate the Kenyan competency-based education context by tracking learner growth beyond examination scores. The system should support a broader view of learning that aligns with national curriculum priorities and the emphasis on values, skills, and readiness.

1. Competency mastery by strand, such as communication, critical thinking, problem solving, creativity, collaboration, inquiry, practical application, and digital literacy.
2. Values and attitudes tracking, such as integrity, responsibility, respect, empathy, teamwork, patriotism, discipline, and citizenship.
3. Skills progression over time, including communication, leadership, self-management, resilience, adaptability, and social engagement.
4. Evidence-based learning records, including portfolios, project work, demonstrations, presentations, classroom participation, reflective journals, and practical assessments.
5. Learning engagement indicators, such as attendance, punctuality, assignment completion, participation in class activities, and task follow-through.
6. Support and intervention needs, including learning challenges, mentoring status, support actions, due dates, and follow-up outcomes.
7. Career and pathway readiness, including strengths, interests, subject fit, aptitude profile, and alignment between learner profile and prospective future pathway.
8. Transition readiness indicators for movement into the next academic stage, such as readiness for senior school, TVET, tertiary study, or career pathway progression.

### Stakeholder-Specific Presentation of CBE Indicators
The system should present competency and development indicators in formats suitable for each user type.

#### For Learners
1. Progress cards showing each competency area as currently developing, on track, or requiring support.
2. Growth visuals highlighting improvement over time instead of only a final score.
3. Achievement evidence timeline showing projects, tasks, and practical work completed.
4. Short next-step recommendations based on support needs and readiness gaps.
5. Encouraging, non-judgmental summaries focused on growth, strengths, and actionable guidance.

#### For Parents and Guardians
1. Summary of strengths and support areas in plain language.
2. Values and behaviours progress, not only academic performance.
3. Intervention and mentorship status, including what support is in place and what next action is required.
4. Simple risk and readiness summaries showing whether the learner is progressing toward their target pathway.
5. A parent-friendly view of academic and personal development progress, with clear action points.

#### For Teachers
1. Competency heatmaps by class and learner.
2. Learner support lists showing who needs intervention, mentoring, or additional support.
3. Subject and competency trend summaries across terms or academic years.
4. Evidence summaries from practical work, projects, and classroom participation.
5. Action-oriented dashboards for follow-up and learner monitoring.

#### For Principals and School Leadership
1. School-level competency and values overview.
2. Distribution of learners by support band, risk band, and readiness status.
3. Trends in intervention demand and unresolved support actions.
4. Cohort readiness for progression into next stage or pathway.
5. School-level comparison with targets, intervention follow-up, and transition readiness.

#### For Sub-county, County, Regional, and National Officers
1. Jurisdiction-level trends in competency progress, readiness, and intervention burden.
2. Aggregated risk and support distribution across schools and cohorts.
3. Equity and gap analysis for vulnerable learners, schools, or regions.
4. Pathway and career readiness trends across large populations.
5. Strategic dashboards focused on intervention demand, progress, and transition outcomes rather than only raw marks.

### Recommended Indicator Grouping
CarTra should present learner performance as a combined model consisting of:
1. Academic performance indicators
2. Competency mastery indicators
3. Values and attitude indicators
4. Engagement and participation indicators
5. Intervention and support indicators
6. Pathway and transition readiness indicators

This combined model better reflects the Kenyan CBC and value-based education direction, and it gives each stakeholder a more meaningful picture of learner development.

## AWS Architecture Required for Data Entry and Reporting
CarTra requires a layered AWS architecture that supports both operational data capture and stakeholder-facing reporting.

### Core AWS Services
1. Amazon Cognito for authentication and role-based access control.
2. AWS AppSync for GraphQL API access to mobile and admin clients.
3. Amazon DynamoDB for learner, academic, hierarchy, intervention, and configuration records.
4. AWS Lambda for validation, deviation calculation, escalation logic, and aggregation.
5. Amazon S3 for evidence files, exports, attachments, and report snapshots.
6. EventBridge or Step Functions for scheduled recalculation and follow-up workflows.
7. Amazon S3 plus Athena for large-scale analytics and reporting.
8. CloudWatch Logs for audit, monitoring, and backend execution visibility.

### AWS Role Mapping
- Cognito handles sign-in and user groups by role.
- AppSync exposes queries and mutations for schools, learners, targets, interventions, and dashboards.
- DynamoDB stores operational and configuration data in normalized structure.
- Lambda processes academic calculations and escalation events.
- S3 stores learner evidence, exported dashboards, and shared outputs.
- EventBridge/Step Functions automate repeated tasks such as deviation reviews and overdue intervention reminders.
- Athena powers high-level trend analysis across schools, counties, and regions.

## Data Entry UI Requirements
The product must provide role-based data entry screens for operational workflows.

### 1. Administrative Setup UI
Required for officers and principals.
1. Create and edit region, county, sub-county, and school records.
2. Link codes and parent-child relationships.
3. Capture principal details and school metadata.
4. Maintain organization hierarchy integrity.

### 2. User Registration and Profile UI
Required for all roles.
1. Create parent, learner, teacher, principal, and officer profiles.
2. Validate national ID, TSC number, assessment number, and phone number formats.
3. Link parent to learner record using national ID.
4. Assign role and linked organization.

### 3. Learner Profile and Career Planning UI
Required for learner and teacher workflows.
1. Set intended career and selected pathway.
2. Select subjects, track, and academic year.
3. Capture learner strengths, interest profile, and support needs.
4. Record target-setting strategy notes.
5. Save annual target values and projected academic goals.

### 4. Performance Entry UI
Required for teachers and principals.
1. Enter subject-level target scores.
2. Enter achieved marks by subject and term or year.
3. Capture competency-based scores.
4. Capture values and behaviour indicators.
5. Attach evidence or notes where applicable.

### 5. Competency and Evidence UI
Required for classroom and support workflows.
1. Rate learner on competency domains such as communication, problem solving, creativity, and collaboration.
2. Attach project work, evidence files, or assessment artifacts.
3. Record observation notes and teacher comments.
4. Associate evidence to specific competencies or learning outcomes.

### 6. Intervention and Mentorship UI
Required for teachers, principals, officers, and parents.
1. Create intervention notes.
2. Assign responsible person and due date.
3. Track intervention status and resolution.
4. View timeline of comments and actions.
5. Follow up on learner support requirements.

### 7. Placement and Outcome UI
Required for principal and tertiary institution officers.
1. Record intended career or pathway.
2. Record actual school completion outcome.
3. Record tertiary placement outcome.
4. Compare intended pathway to achieved institution or course placement.
5. Capture cluster requirement fulfillment when relevant.

## Dashboard and Reporting UI Requirements
The system needs separate dashboards for each stakeholder, each tailored to the role and the decision-making need.

### Learner Dashboard
1. KPI summary cards for current target status, deviation, risk level, and readiness.
2. Target versus achieved line chart across years and terms.
3. Subject-by-subject bar chart comparing target and actual performance.
4. Competency progress cards or radar chart for skill mastery.
5. Support and intervention timeline with mentor comments and updates.
6. Career readiness panel with selected path and current gap.

### Parent Dashboard
1. Simple summary of learner progress and risk band.
2. Strengths and support areas in non-technical language.
3. Intervention follow-up and mentor notes.
4. Target and performance overview at a high level.
5. Clear next steps and support recommendations.

### Teacher Dashboard
1. Class risk distribution and on-track/off-track counts.
2. Subject averages and learner performance comparison.
3. Competency heatmap and learner support queue.
4. Learners requiring review, mentorship, or escalation.
5. Intervention status and due-date tracking.

### Principal Dashboard
1. School-wide learner distribution by risk band.
2. Subject and cohort performance comparison charts.
3. Escalation summary by teacher, learner, or intervention queue.
4. Trends across academic terms or years.
5. Summary of unresolved intervention and support workload.

### Officer Dashboard
1. Sub-county, county, regional, or national drill-down summary.
2. Cohort risk distribution and escalation counts.
3. Pathway and placement outcome charts.
4. Subject and performance trend graphs across schools.
5. Comparison tables for schools or jurisdictions needing attention.

### National Dashboard
1. High-level distribution of learners by on-track and risk status.
2. Regional and county comparisons.
3. Trend analysis over multiple years.
4. Placement success and mismatch reporting.
5. Policy-ready summaries for reporting and strategic review.

## Visual Presentation Patterns for CarTra
The data should be presented using a combination of charts and actionable cards rather than raw spreadsheets.

### Recommended Visual Types
1. KPI summary cards for headline status values.
2. Donut charts for overall distribution by risk band or category.
3. Bar charts for subject, cohort, and competency comparisons.
4. Line charts for target-versus-achieved trends over time.
5. Stacked bar charts for combined academic and competency views.
6. Radar charts for learner strengths and competency profiles.
7. Heatmaps for large learner or class-level comparisons.
8. Timelines for interventions and mentoring history.
9. Progress meters for readiness, competency, and performance status.
10. Comparison tables for drill-down into learner or school detail.

### Recommended UI Pattern
The most effective UI structure is:
1. Summary cards at the top
2. Distribution chart in the middle
3. Detail charts below for trends and comparison
4. Action queue or intervention list for follow-up
5. Drill-down screens for learner, class, school, and jurisdiction-level detail

This ensures users can quickly understand the status and then move into action without losing context.

## Deviation Formula
Base deviation formula:

Deviation percent = ((Set Target - Achieved Target) / Set Target) * 100

This formula will likely need safeguards for zero or invalid targets.

## Escalation Thresholds
1. Above 20 percent deviation: sub-county review
2. Above 40 percent deviation: county review
3. Above 60 percent deviation: regional review
4. Above 80 percent deviation: national review

### Recommended Refinements
1. Consecutive breach rule so a learner is not over-escalated due to one abnormal result.
2. Severe breach rule for immediate escalation on extreme decline.
3. SLA-based follow-up where each role must respond within a defined number of days.

## Implemented Amplify and Lambda Setup
The project is using AWS Amplify for backend provisioning and a first Lambda function for learner deviation logic.

### Current Amplify Resource Decisions
1. Authentication was set up with Amazon Cognito User Pool.
2. The API was created using AWS AppSync with GraphQL.
3. The API authorization was configured to use Cognito User Pool rather than a long-lived API key as the primary access model.
4. A Lambda function named `cartralearnerdeviation` was created.
5. The Lambda runtime selected is NodeJS.
6. The function was initially generated from the Hello World template and then replaced with the CarTra learner deviation logic.
7. The function is intended to calculate deviation, assign risk band, and return escalation level for a learner based on target and achieved values.

### Current Lambda Function Behavior
The first Lambda function computes the following:
- target and achieved values are read from the input payload
- deviation percentage is calculated as ((target - achieved) / target) * 100
- risk band is assigned based on threshold values
- escalation level is assigned as follows:
  - above 20 percent: sub-county review
  - above 40 percent: county review
  - above 60 percent: regional review
  - above 80 percent: national review
- invalid or zero target values are handled safely

### Exact Lambda Function Set for CarTra
The production workflow needs a small but complete family of Lambda functions. The current function should remain as the 1st function, and the rest should be added in this sequence.

1. `cartralearnerdeviation`
   - purpose: calculate deviation between target and achieved score
   - input: learnerId, target, achieved, academicYear, termOrCycle
   - output: deviationPercent, riskBand, escalationLevel
   - writes to: AcademicRecord and EscalationCase

2. `cartraassessmentprocessor`
   - purpose: process a learner assessment submission or practical assessment result
   - input: assessmentTaskId, learnerId, subjectId, teacherId, score, grade, remarks
   - output: updated AcademicRecord, learner competency summary, and risk update
   - triggers: on create or update of AssessmentSubmission

3. `cartraescalationmanager`
   - purpose: evaluate escalation state and route the case to the right review level
   - input: learnerId, currentDeviationPercent, jurisdictionCode, previousEscalationLevel
   - output: assigned escalation level, review scope, and assigned officer role
   - writes to: EscalationCase and optionally SupportPlan

4. `cartrasupportreminder`
   - purpose: identify overdue or unresolved support actions
   - input: dueDate, supportPlanId, learnerId
   - output: reminder state, overdue status, and assigned follow-up flag
   - triggers: scheduled daily or hourly processing

5. `cartraschoolsummary`
   - purpose: aggregate learner, subject, and intervention summaries for a school or cohort
   - input: schoolCode, academicYear, termOrCycle
   - output: summary metrics for teacher and principal dashboards
   - reads: Learner, AcademicRecord, AssessmentSubmission, Intervention, AttendanceRecord

6. `cartrajurisdictionsummary`
   - purpose: aggregate school, sub-county, county, regional, and national performance snapshots
   - input: jurisdictionCode, jurisdictionType
   - output: KPI cards and chart-ready aggregate data
   - used by officer dashboard reporting

7. `cartrafilemetadatahandler`
   - purpose: validate uploaded evidence and learning material metadata after S3 upload
   - input: fileKey, fileName, fileType, learnerId, uploadedByUserId, materialType, relatedAssessmentId
   - output: record in EvidenceAttachment or LearningMaterial
   - writes to: S3 metadata + GraphQL model record

### Lambda Trigger Model
- AppSync mutation triggers for AssessmentSubmission and SupportPlan updates
- S3 event triggers for file uploads and evidence attachments
- EventBridge or scheduled Lambda triggers for overdue support and jurisdiction summaries

### Implementation Status
This is the first phase of the production backend: the learner deviation function is already in place, and the additional functions above are the exact operational set needed for teacher capture, support tracking, escalation, and report generation.

### Current Backend Completion Status
- Authentication is configured with Amazon Cognito User Pools and AppSync default authorization remains Cognito-backed.
- The GraphQL schema was tightened to support role-aware access for learner, teacher, principal, officer, and parent workflows while preserving the project's authenticated access model.
- The Lambda workflow set includes deviation, assessment processing, escalation management, support reminders, and file metadata handling.
- The remaining packaging issue on this machine was Python version mismatch during Amplify packaging for the assessment processor Lambda; the project runtime was aligned to the installed Python 3.13 interpreter to close that gap.

## S3 Storage Design for CarTra
CarTra should not store large learner files directly in DynamoDB. Instead, store files in S3 and keep only metadata in GraphQL.

### Required S3 Buckets or Prefixes
Use a single S3 bucket or a small set of prefixes, for cost control and simplicity.

1. `evidence/`
   - learner assessment evidence
   - project work
   - practical work
   - portfolio files
   - teacher notes attached to performance records

2. `materials/`
   - learning materials
   - class resources
   - assignment briefs
   - teacher-shared documents

3. `exports/`
   - report PDFs
   - dashboard snapshots
   - school or jurisdiction summaries

4. `profile/`
   - user profile images if later needed
   - document verification files

### S3 File Metadata Saved in DynamoDB
For each file upload, store:
- fileKey
- fileName
- fileType
- learnerId
- schoolCode
- uploadedByUserId
- uploadedByRole
- materialType
- relatedAssessmentId
- relatedCompetencyId
- createdAt
- updatedAt

### Upload Flow
1. Client requests signed S3 upload URL from AppSync or Lambda
2. Client uploads file directly to S3
3. Lambda or app writes metadata record to EvidenceAttachment or LearningMaterial
4. Related AssessmentSubmission or SupportPlan is updated if required
5. Download is done with a signed URL only when the user has access

### Access Rules
- Teachers upload learner evidence and class materials
- Principals view school evidence and summary files
- Officers view reports and higher-level aggregated exports
- Parents only see learner-linked materials and support documents
- Learners see their own evidence and support content only

### Cost Controls
- Use one small, low-cost S3 bucket for the MVP
- Keep uploads limited to evidence and reports only
- Use signed URLs rather than exposing public buckets
- Store only metadata in DynamoDB, not full file payloads
- Use lifecycle rules later for old exports or large archives

## Lean AWS Resource Plan
The goal is to retain strong functionality while keeping AWS cost low.

### Retained Services
1. Amazon Cognito for authentication and role-based access
2. AWS AppSync for GraphQL API access
3. Amazon DynamoDB for hierarchical and transactional application data
4. Amazon S3 for files, exports, and selected evidence storage
5. AWS Step Functions or EventBridge-triggered Lambda workflows for escalation and scheduled processing
6. AWS Lambda for business logic, validation, scoring, and aggregations
7. Amazon S3 plus Athena for analytical querying and reporting data

### Deferred or Minimized Services
1. SNS and SES are intentionally excluded for now to reduce cost and complexity.
2. Audit tooling should start with CloudWatch Logs only.
3. CloudTrail and broader governance tooling can be added later if required by policy.

### Cost Control Principles
1. Start with only the minimum services needed.
2. Use DynamoDB on-demand initially unless traffic becomes predictable.
3. Schedule deviation processing in batches instead of overusing real-time compute.
4. Keep Lambda functions small and focused.
5. Avoid extra managed analytics tools until usage justifies them.
6. Use S3-based exports and Athena before introducing richer BI tooling.

## AWS Resource to Feature Mapping

### 1. Amazon Cognito
Used for:
1. Sign-in for learners, parents, teachers, principals, officers, and tertiary users
2. Role-based access control using groups or custom claims
3. Session and identity management for the mobile app and admin interfaces

### 2. AWS AppSync
Used for:
1. Unified GraphQL API for mobile and admin clients
2. Role-aware querying of learners, schools, dashboards, and configuration data
3. Controlled drill-down from general dashboards to learner-specific views

### 3. Amazon DynamoDB
Used for:
1. Administrative hierarchy records
2. User profile and role records
3. Learner registration and parent linkage
4. Academic targets, performance, and deviation records
5. Dynamic subjects, pathways, tracks, careers, grading bands, and cluster rules
6. Intervention, mentorship, and escalation state

### 4. Amazon S3
Used for:
1. Exported reports and dashboard snapshots
2. Optional learner evidence files and attachments
3. Analytics data export for Athena queries
4. Static configuration imports where needed

### 5. EventBridge or Step Functions
Used for:
1. Scheduled deviation recalculation jobs
2. Escalation workflow progression
3. Follow-up reminders for overdue interventions
4. Periodic reporting and aggregation triggers

### 6. AWS Lambda
Used for:
1. Validation of hierarchy codes, identity fields, and linkage rules
2. Deviation calculation logic
3. Escalation level assignment
4. Dashboard aggregation helpers for summary data
5. Placement comparison logic between target and actual outcomes

### 7. Amazon S3 plus Athena
Used for:
1. Historical analytics queries across large exported datasets
2. Policy reporting and education management reporting
3. Trend analysis across years, cohorts, schools, counties, and regions
4. Placement success and mismatch analysis

### Minimal Logging and Audit Position
1. CloudWatch Logs should capture backend execution logs from Lambda and workflow processing.
2. Full audit expansion can be introduced later if national policy or compliance needs become stricter.
## User Profile Storage Model
CarTra should maintain a shared identity record for each authenticated user while also storing separate profile data for every user type.

### Design Rule
1. Each user must have one core identity record in the Users table.
2. Each user type should also have its own profile table containing detailed role-specific data.
3. The role-specific profile tables should be linked by the same userId or personId.
4. This avoids overloading the generic Users table with fields that only apply to one role.

### Core Users table
Stores the common identity and access fields.

Suggested fields:
- userId
- authProvider
- email
- phoneNumber
- passwordHash or Cognito reference
- role
- status
- createdAt
- updatedAt

### Role-Specific Profile Tables
1. NationalOfficerProfile
2. RegionalOfficerProfile
3. CountyOfficerProfile
4. SubCountyOfficerProfile
5. PrincipalProfile
6. TeacherProfile
7. ParentProfile
8. LearnerProfile
9. TertiaryInstitutionProfile

Each profile table should contain only the fields relevant to that role while still preserving a direct linkage to the user record and the hierarchy path.

### Example profile design
- NationalOfficerProfile: userId, fullName, nationalCode, assignedRegions, createdAt
- RegionalOfficerProfile: userId, fullName, nationCode, regionCode, assignedCounties, createdAt
- TeacherProfile: userId, fullName, schoolCode, subCountyCode, countyCode, regionCode, nationCode, assignedClasses, tscNumber, status
- LearnerProfile: userId, learnerId, fullName, assessmentNumber, schoolCode, subCountyCode, countyCode, regionCode, nationCode, parentNationalId, selectedCareerId, gradeLevel, status

### Why this is important
This keeps the system scalable and easier to manage because:
- authentication remains centralized
- role-specific details are separated cleanly
- access control and profile updates are simpler
- different user types can evolve independently without bloating the main user table
- it matches the hierarchy-based model where each user is tied to a location and role scope
## Proposed DynamoDB Domain Model
The system should remain flexible and configuration-driven.

### 1. OrgHierarchy
Stores region, county, sub-county, school, and relationship hierarchy.

Suggested fields:
- id
- entityType
- code
- parentCode
- name
- status
- metadata
- createdBy
- createdAt
- updatedAt

### 2. Users
Stores all authenticated or registered users.

Suggested fields:
- userId
- role
- fullName
- phoneNumber
- nationalId
- tscNumber
- linkedOrgCode
- linkedLearnerIds
- status
- createdAt
- updatedAt

### 3. Learners
Stores learner identity, enrollment, parent linkage, and profile data.

Suggested fields:
- learnerId
- assessmentNumber
- fullName
- gender
- gradeLevel
- schoolCode
- classCode
- parentNationalId
- selectedCareerId
- selectedPathwayId
- supportProfile
- status
- createdByTeacherId
- createdAt
- updatedAt

### 4. AcademicRecords
Stores targets, performance, deviation, and escalation state.

Suggested fields:
- recordId
- learnerId
- academicYear
- termOrCycle
- targetValues
- achievedValues
- subjectBreakdown
- competencyBreakdown
- deviationPercent
- escalationLevel
- escalationStatus
- calculatedAt
- updatedAt

### 5. CatalogConfig
Stores dynamic academic structures.

Suggested fields:
- configId
- configType
- code
- name
- parentCode
- rules
- effectiveFrom
- effectiveTo
- status

Examples of configType:
- subject
- track
- pathway
- career
- tertiaryCourse
- gradingBand
- clusterRule
- competency

### 6. Interventions
Stores comments, mentorship actions, review notes, and follow-up tasks.

Suggested fields:
- interventionId
- learnerId
- authorUserId
- authorRole
- jurisdictionCode
- interventionType
- note
- dueDate
- status
- createdAt
- updatedAt

## Access Control Model
CarTra should strictly limit access based on role and jurisdiction.

1. Learner: own record only
2. Parent: only linked learner records
3. Teacher: assigned classes and learners
4. Principal: own school only
5. Sub-county officer: only schools under assigned sub-county
6. County officer: only sub-counties and schools under assigned county
7. Regional officer: only counties under assigned region
8. National officer: all data with policy and reporting privileges
9. Tertiary officer: own institution data and admitted learner outcomes where permitted

## Dashboard Requirements
Each role should have both general and specific performance views.

### General Views
1. Risk distribution by jurisdiction in pie or donut charts
2. Pathway selection distribution
3. Performance band distribution
4. Escalation counts by level
5. Placement success rates by region, county, school, or cohort

### Specific Views
1. Learner trend line: target versus achieved over time
2. Subject comparison graphs
3. Competency growth view
4. Intervention history timeline
5. Career target versus current readiness score

## Data Quality and Validation Rules
Manual entry is acceptable, but strict validation is required.

1. Code pattern validation for administrative hierarchy codes
2. Uniqueness validation for all hierarchy codes
3. Uniqueness validation for TSC numbers in teacher and principal roles
4. Uniqueness validation for learner assessment numbers
5. Format and length validation for parent national IDs
6. Scope validation to prevent users from creating records outside their jurisdiction
7. Audit logging for all critical create and update actions
8. Restricted editing of identity fields after first save

## Suggested MVP Scope
The first deliverable should be lean and production-minded.

### MVP Phase 1
1. Authentication and roles
2. Administrative hierarchy setup
3. Teacher registration under a school
4. Learner registration and parent linkage
5. Career target setting
6. Performance entry
7. Deviation calculation
8. Basic dashboards
9. Basic intervention comments

### Phase 2
1. Advanced graphs and filters
2. Dynamic subject and pathway management UI
3. Escalation workflow automation
4. Tertiary course and placement module
5. Audit and review tooling

### Phase 3
1. Competency evidence tracking
2. Predictive risk features
3. Rich analytics and export workflows
4. Additional governance and compliance features

## Frontend Capability Reuse Strategy
Where possible, useful frontend patterns from prior work may be reused conceptually, but CarTra should remain a separate project with its own architecture, branding, domain language, and backend model.

Potential reusable areas:
1. Authentication flow patterns
2. Form handling patterns
3. Navigation structure ideas
4. Chart rendering components
5. Input validation helpers
6. List and detail screen structures

## Frontend Architecture Declutter Plan (Implemented Baseline)
The mobile codebase now follows a minimal entry pattern and feature-first structure so growth does not crowd the app entry file.

### App Entrypoint Rule
1. App.tsx remains a minimal shell.
2. App.tsx configures Amplify once.
3. App.tsx owns only auth lifecycle concerns: sign in, sign up, sign-up confirmation, forgot password, reset confirmation, and persisted session gate.
4. App.tsx mounts one root navigator once a user session is valid.

### Navigation Layer
1. One root navigator file coordinates role-aware access.
2. Dedicated drawer navigator serves national, regional, county, sub-county, and tertiary views.
3. Dedicated bottom-tab navigator serves learner, parent, teacher, and school views.
4. Navigation visibility is controlled by Cognito-group-derived role logic.

### Feature and Shared Layering
1. Screen implementations live in feature folders under src/screens by role.
2. Reusable UI primitives are centralized in src/components for cards, forms, and lists.
3. Reusable auth, role, and scope logic is centralized in src/hooks.
4. Shared TypeScript contracts live in src/types.

### Current Baseline Components
1. Shared card, form input, and organization list components are in place for reuse.
2. Session hook is in place to load current user and Cognito group claims.
3. Role-access hook is in place to map groups into allowed drawer and tab routes.
4. Scope hook is in place to normalize hierarchy codes for backend writes.

## Ordered UI Delivery Sequence
The agreed implementation sequence for production data-entry and backend wiring is:

1. National module
2. Regional module
3. County module
4. Sub-county module
5. School module
6. Tertiary module
7. Teacher module
8. Learner module
9. Parent module

Each module must preserve the same hierarchy chain fields and authorization guardrails already established in schema and Cognito-group rules.

## CarTra Visual Theme
CarTra uses a blue-forward visual identity. The theme should stay consistent across navigation, buttons, cards, highlights, and active states.

### Core Blue Palette
1. Primary blue: `#1d4ed8`
2. Dark blue: `#1e40af`
3. Light blue surface: `#eff6ff`
4. Active drawer/tab accent: `#1d4ed8`
5. Soft emphasis and hover background: `#dbeafe`
6. Subtle neutral blue tint when needed: `#bfdbfe`

### Theme Usage Rules
1. Use `#1d4ed8` for primary actions, active navigation states, and the main CarTra identity color.
2. Use `#1e40af` for stronger emphasis, pressed states, or darker text accents on blue surfaces.
3. Use `#eff6ff` for calm card backgrounds, selected panels, and soft section highlighting.
4. Use `#dbeafe` for secondary emphasis, chip backgrounds, or focus surfaces.
5. Keep the blue family consistent rather than introducing competing primary colors.
6. Preserve neutral grays for body text, borders, and inactive states so the blue remains the dominant brand cue.

### Design Intent
1. The interface should feel clean, trustworthy, and administrative rather than playful.
2. Blue should signal action and structure, not overwhelm content.
3. Charts, buttons, tabs, drawer accents, and top-level cards should align to the same blue family.

## Open Questions To Resolve Later
1. Exact CBC or CBE competency taxonomy to support in the first release
2. Whether annual performance alone is enough or whether term-by-term entry is needed
3. Whether parent accounts may link to multiple learners
4. Whether teachers may handle multiple classes across schools
5. Whether national and regional officers can directly edit lower-level records or only supervise
6. How tertiary institutions verify admitted learner identity against school records
7. How placement mismatch reasons should be captured and categorized
8. Whether learner evidence files are needed in the MVP
9. Whether the app must work offline for schools with weak connectivity

## Immediate Next Design Outputs
The next technical documents to create should be:
1. GraphQL schema draft
2. DynamoDB key design and indexes
3. End-to-end user flow definitions by role
4. Validation rules specification
5. Mobile app information architecture
6. Initial backlog and milestone plan

## Working Rule For This Project
CarTra is a separate standalone project and must not be created or developed inside the MiFedha project folder.
