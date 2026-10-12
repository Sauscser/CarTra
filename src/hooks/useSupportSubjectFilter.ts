import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listSupportSubjects } from '../graphql/queries';
import type { SubjectLike } from '../utils/supportSubjects';
export { filterSupportSubjects, filterSupportSubjectsFromProfile } from '../utils/supportSubjects';

type SupportSubjectFilterState = {
  ids: ReadonlySet<string>;
  loading: boolean;
  error: string | null;
};

let supportSubjectIdsRequest: Promise<ReadonlySet<string>> | null = null;
let cachedSupportSubjectIds: ReadonlySet<string> | null = null;
let cachedAt = 0;

export function loadSupportSubjectIds(): Promise<ReadonlySet<string>> {
  if (cachedSupportSubjectIds && Date.now() - cachedAt < 5 * 60 * 1000) {
    return Promise.resolve(cachedSupportSubjectIds);
  }
  if (!supportSubjectIdsRequest) {
    supportSubjectIdsRequest = (async () => {
      const client = generateClient();
      const ids = new Set<string>();
      let nextToken: string | null = null;

      do {
        const result = await client.graphql({
          query: listSupportSubjects,
          variables: { limit: 500, nextToken },
        } as any) as {
          data?: { listSupportSubjects?: { items?: SubjectLike[]; nextToken?: string | null } };
          errors?: Array<{ message?: string }>;
        };
        if (result.errors?.length) {
          throw new Error(result.errors.map((item) => item.message || 'Unknown GraphQL error').join('; '));
        }

        const connection = result.data?.listSupportSubjects;
        if (!connection) throw new Error('The support-subject catalog response was empty.');
        (connection.items || []).forEach((subject) => {
          [subject.id, subject.code].forEach((value) => {
            const id = String(value || '').trim();
            if (id) ids.add(id);
          });
        });
        nextToken = connection.nextToken || null;
      } while (nextToken);

      return ids;
    })()
      .then((ids) => {
        cachedSupportSubjectIds = ids;
        cachedAt = Date.now();
        supportSubjectIdsRequest = null;
        return ids;
      })
      .catch((error) => {
        supportSubjectIdsRequest = null;
        throw error;
      });
  }

  return supportSubjectIdsRequest;
}

export default function useSupportSubjectFilter(): SupportSubjectFilterState {
  const [state, setState] = useState<SupportSubjectFilterState>({
    ids: new Set<string>(),
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    void loadSupportSubjectIds().then((ids) => {
      if (active) setState({ ids, loading: false, error: null });
    }).catch((error: unknown) => {
      if (active) {
        const message = error instanceof Error ? error.message : 'Could not load the support-subject catalog.';
        console.warn('useSupportSubjectFilter failed', error);
        setState({ ids: new Set<string>(), loading: false, error: message });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
