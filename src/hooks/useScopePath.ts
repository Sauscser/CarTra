import { useMemo } from 'react';

type ScopeCodes = {
  nationCode?: string;
  regionCode?: string;
  countyCode?: string;
  subCountyCode?: string;
  schoolCode?: string;
};

const normalizeCode = (value?: string) => (value || '').trim().toUpperCase();

export default function useScopePath(codes: ScopeCodes) {
  return useMemo(
    () => ({
      nationCode: normalizeCode(codes.nationCode),
      regionCode: normalizeCode(codes.regionCode),
      countyCode: normalizeCode(codes.countyCode),
      subCountyCode: normalizeCode(codes.subCountyCode),
      schoolCode: normalizeCode(codes.schoolCode),
    }),
    [codes.nationCode, codes.regionCode, codes.countyCode, codes.subCountyCode, codes.schoolCode],
  );
}
