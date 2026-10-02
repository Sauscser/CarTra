import { getTertiaryCourse } from '../graphql/queries';

const careerNameRequests = new Map<string, Promise<string | null>>();

export function parseLearnerSupportProfile(value: unknown): Record<string, any> | null {
  let parsed = value;

  for (let attempt = 0; attempt < 3 && typeof parsed === 'string'; attempt += 1) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }

  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, any> : null;
}

export async function resolveLearnerCareerTarget(client: any, learnerRecord: any): Promise<string | null> {
  const supportProfile = parseLearnerSupportProfile(learnerRecord?.supportProfile);
  const profileTarget = supportProfile?.targetCareer ?? supportProfile?.targetCareerName ?? supportProfile?.courseName;
  const directTarget = profileTarget ?? learnerRecord?.targetCareer ?? learnerRecord?.targetCareerName;
  const directName = typeof directTarget === 'string'
    ? directTarget.trim()
    : String(directTarget?.courseName || directTarget?.name || '').trim();

  if (directName) return directName;

  const careerId = String(supportProfile?.targetCareerId || supportProfile?.selectedCareerId || learnerRecord?.selectedCareerId || '').trim();
  if (!careerId) return null;

  let request = careerNameRequests.get(careerId);
  if (!request) {
    request = (async () => {
      try {
        const result = await client.graphql({ query: getTertiaryCourse, variables: { id: careerId } });
        const course = (result as any)?.data?.getTertiaryCourse;
        return typeof course?.courseName === 'string' && course.courseName.trim() ? course.courseName.trim() : null;
      } catch {
        return null;
      }
    })();
    careerNameRequests.set(careerId, request);
  }

  return request;
}
