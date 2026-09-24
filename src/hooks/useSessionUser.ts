import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';
import { RoleGroup, SessionUser } from '../types/auth';

const parseGroups = (value: unknown): RoleGroup[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((group): group is RoleGroup => typeof group === 'string') as RoleGroup[];
};

export default function useSessionUser() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  const refreshSession = async () => {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      const idTokenPayload = session.tokens?.idToken?.payload as { [key: string]: unknown } | undefined;
      const groups = parseGroups(idTokenPayload?.['cognito:groups']);
      const email =
        (typeof idTokenPayload?.email === 'string' && idTokenPayload.email.trim()) ||
        (Array.isArray(idTokenPayload?.emails) && typeof idTokenPayload.emails[0] === 'string' && idTokenPayload.emails[0].trim()) ||
        (typeof user.username === 'string' && user.username.trim()) ||
        '';

      setSessionUser({ username: user.username, email: email.toLowerCase(), groups });
    } catch {
      setSessionUser(null);
    } finally {
      setCheckingSession(false);
    }
  };

  const signOutUser = async () => {
    await signOut();
    setSessionUser(null);
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  return {
    checkingSession,
    sessionUser,
    refreshSession,
    signOutUser,
  };
}
