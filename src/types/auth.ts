export type RoleGroup =
  | 'appOwner'
  | 'nationalOfficer'
  | 'regionalOfficer'
  | 'countyOfficer'
  | 'subCountyOfficer'
  | 'principal'
  | 'teacher'
  | 'parent'
  | 'tertiaryOfficer';

export type SessionUser = {
  username?: string;
  email?: string;
  groups: RoleGroup[];
};

export const ROLE_PRIORITY: RoleGroup[] = [
  'appOwner',
  'nationalOfficer',
  'regionalOfficer',
  'countyOfficer',
  'subCountyOfficer',
  'principal',
  'teacher',
  'tertiaryOfficer',
];
