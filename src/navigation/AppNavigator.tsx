import React from 'react';
import RootNavigator from './RootNavigator';
import { RoleGroup } from '../types/auth';

type AppNavigatorProps = {
  username?: string;
  email?: string;
  onSignOut: () => Promise<void>;
  signingOut: boolean;
  groups?: RoleGroup[];
};
export default function AppNavigator({ username, email, onSignOut, signingOut, groups = [] }: AppNavigatorProps) {
  return (
    <RootNavigator
      username={username}
      email={email}
      onSignOut={onSignOut}
      signingOut={signingOut}
      groups={groups}
    />
  );
}
