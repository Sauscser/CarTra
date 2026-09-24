import React, { useEffect, useMemo, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import AdminDrawerNavigator from './AdminDrawerNavigator';
import { RoleGroup } from '../types/auth';
import useRoleAccess from '../hooks/useRoleAccess';
import { listTertiaryInstitutionProfiles } from '../graphql/queries';

type RootNavigatorProps = {
  username?: string;
  email?: string;
  onSignOut: () => Promise<void>;
  signingOut: boolean;
  groups?: RoleGroup[];
};

export default function RootNavigator({ username, email, onSignOut, signingOut, groups = [] }: RootNavigatorProps) {
  const client = useMemo(() => generateClient(), []);
  const [hasTertiaryInstitutionAccess, setHasTertiaryInstitutionAccess] = useState(false);

  useEffect(() => {
    const determineTertiaryAccess = async () => {
      const normalizedEmail = email?.trim().toLowerCase();

      if (!normalizedEmail) {
        setHasTertiaryInstitutionAccess(false);
        return;
      }

      try {
        const result = await client.graphql({
          query: listTertiaryInstitutionProfiles,
          variables: {
            filter: { userId: { eq: normalizedEmail } },
            limit: 20,
          },
        });

        const payload = result as { data?: { listTertiaryInstitutionProfiles?: { items?: Array<{ id?: string }> } } };
        const hasAccess = (payload.data?.listTertiaryInstitutionProfiles?.items || []).length > 0;
        setHasTertiaryInstitutionAccess(hasAccess);
      } catch {
        setHasTertiaryInstitutionAccess(false);
      }
    };

    void determineTertiaryAccess();
  }, [client, email]);

  const { drawerRoutes, tabRoutes } = useRoleAccess(groups, hasTertiaryInstitutionAccess);

  return (
    <AdminDrawerNavigator
      username={username}
      onSignOut={onSignOut}
      signingOut={signingOut}
      drawerRoutes={drawerRoutes}
      tabRoutes={tabRoutes}
    />
  );
}
