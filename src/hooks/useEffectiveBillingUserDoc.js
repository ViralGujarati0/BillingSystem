import { useAtomValue } from 'jotai';
import { currentOwnerAtom } from '../atoms/owner';
import { currentStaffAtom } from '../atoms/staff';

/**
 * Billing screens receive userDoc via route params, but those params are often
 * missing after stack resets (e.g. replace('OwnerTabs') without { userDoc }).
 * Profile / shop flows use currentOwnerAtom — use the same fallback here.
 */
export default function useEffectiveBillingUserDoc(route) {
  const routeUserDoc = route?.params?.userDoc;
  const owner = useAtomValue(currentOwnerAtom);
  const staff = useAtomValue(currentStaffAtom);

  if (routeUserDoc?.shopId) return routeUserDoc;
  if (owner?.shopId) return { ...owner, role: owner.role ?? 'OWNER' };
  if (staff?.shopId) return { ...staff, role: staff.role ?? 'STAFF' };
  return routeUserDoc ?? null;
}
