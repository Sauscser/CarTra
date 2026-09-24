import { useMemo } from 'react';
import { DrawerRouteName, TabRouteName } from '../types/navigation';
import { RoleGroup } from '../types/auth';

const ALL_DRAWER: DrawerRouteName[] = [
  'National Office',
  'Regional Office',
  'County Office',
  'Sub-county Office',
  'Tertiary Office',
];

const ALL_TABS: TabRouteName[] = ['Parent', 'Teacher', 'School'];

type RoleAccess = {
  drawerRoutes: DrawerRouteName[];
  tabRoutes: TabRouteName[];
};

export default function useRoleAccess(groups: RoleGroup[] = [], hasTertiaryInstitutionAccess = false) {
  return useMemo<RoleAccess>(() => {
    if (!groups.length) {
      return {
        drawerRoutes: ALL_DRAWER,
        tabRoutes: ALL_TABS,
      };
    }

    if (groups.includes('appOwner') || groups.includes('nationalOfficer')) {
      return { drawerRoutes: ALL_DRAWER, tabRoutes: ALL_TABS };
    }

    if (groups.includes('regionalOfficer')) {
      return {
        drawerRoutes: ['Regional Office', 'County Office', 'Sub-county Office'] as DrawerRouteName[],
        tabRoutes: ALL_TABS,
      };
    }

    if (groups.includes('countyOfficer')) {
      return {
        drawerRoutes: ['County Office', 'Sub-county Office'] as DrawerRouteName[],
        tabRoutes: ALL_TABS,
      };
    }

    if (groups.includes('subCountyOfficer')) {
      return {
        drawerRoutes: ['Sub-county Office'] as DrawerRouteName[],
        tabRoutes: ALL_TABS,
      };
    }

    if (groups.includes('tertiaryOfficer') || hasTertiaryInstitutionAccess) {
      return {
        drawerRoutes: ['Tertiary Office'] as DrawerRouteName[],
        tabRoutes: ALL_TABS,
      };
    }

    return {
      drawerRoutes: [],
      tabRoutes: ALL_TABS,
    };
  }, [groups, hasTertiaryInstitutionAccess]);
}
