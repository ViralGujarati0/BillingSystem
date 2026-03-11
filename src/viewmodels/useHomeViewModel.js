import { useState, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import firestore from '@react-native-firebase/firestore';

import { currentOwnerAtom } from '../atoms/owner';

const useHomeViewModel = ({ userDoc } = {}) => {

  const setCurrentOwner = useSetAtom(currentOwnerAtom);
  const owner           = useAtomValue(currentOwnerAtom);

  const [stats,        setStats]        = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // ── Set current owner atom from userDoc (passed from navigator) ────────────
  useEffect(() => {
    if (userDoc?.role === 'OWNER') setCurrentOwner(userDoc);
  }, [userDoc, setCurrentOwner]);

  // ── Realtime today stats listener ──────────────────────────────────────────
  useEffect(() => {
    const shopId = userDoc?.shopId || owner?.shopId;
    if (!shopId) {
      setLoadingStats(false);
      return;
    }

    const todayKey = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '_');

    const unsubscribe = firestore()
      .collection('billing_shops')
      .doc(shopId)
      .collection('stats')
      .doc(`daily_${todayKey}`)
      .onSnapshot((doc) => {
        setStats(doc.exists ? doc.data() : null);
        setLoadingStats(false);
      });

    return unsubscribe;

  }, [userDoc?.shopId, owner?.shopId]);

  // ── Greeting ───────────────────────────────────────────────────────────────
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return {
    stats,
    loadingStats,
    greeting: greeting(),
    hasShop: !!(userDoc?.shopId || owner?.shopId),
  };
};

export default useHomeViewModel;