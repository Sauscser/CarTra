export type HierarchyEntityType = 'nation' | 'region' | 'county' | 'subCounty' | 'school' | 'tertiary';

export type RegionItem = {
  id: string;
  code: string;
  name: string;
  assignedOfficerEmail?: string | null;
};

export type CreateRegionalOfficerInput = {
  nationCode: string;
  regionCode: string;
  regionName: string;
  officerEmail: string;
  officerFullName: string;
  officerPhone?: string;
};
