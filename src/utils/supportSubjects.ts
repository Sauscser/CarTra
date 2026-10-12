export type SubjectLike = {
  id?: unknown;
  code?: unknown;
  category?: unknown;
  subjectCategory?: unknown;
};

function hasSupportCategory(subject: SubjectLike) {
  return [subject.category, subject.subjectCategory]
    .some((value) => /\bsupport\b/i.test(String(value || '')));
}

export function isSupportSubject(subject: SubjectLike, supportSubjectIds: ReadonlySet<string> = new Set<string>()) {
  const subjectIds = [subject.id, subject.code].map((value) => String(value || '').trim()).filter(Boolean);
  return hasSupportCategory(subject) || subjectIds.some((id) => supportSubjectIds.has(id));
}

export function filterSupportSubjects<T extends SubjectLike>(subjects: T[], supportSubjectIds: ReadonlySet<string>): T[] {
  return subjects.filter((subject) => !isSupportSubject(subject, supportSubjectIds));
}

export function filterSupportSubjectsFromProfile(profile: any, supportSubjectIds: ReadonlySet<string>) {
  if (!profile || typeof profile !== 'object') return profile;
  let supportProfile = profile.supportProfile;
  if (typeof supportProfile === 'string') {
    try {
      supportProfile = JSON.parse(supportProfile);
    } catch {
      supportProfile = null;
    }
  }

  const filterArrays = (record: any) => {
    if (!record || typeof record !== 'object') return record;
    return {
      ...record,
      ...(Array.isArray(record.selectedSubjects) ? { selectedSubjects: filterSupportSubjects(record.selectedSubjects, supportSubjectIds) } : {}),
      ...(Array.isArray(record.historicalSelectedSubjects) ? { historicalSelectedSubjects: filterSupportSubjects(record.historicalSelectedSubjects, supportSubjectIds) } : {}),
    };
  };

  return {
    ...filterArrays(profile),
    ...(supportProfile && typeof supportProfile === 'object' ? { supportProfile: filterArrays(supportProfile) } : {}),
  };
}
