import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { currentOwnerAtom } from '../atoms/owner';
import { mapSuppliers } from '../models/SupplierModel';
import {
  subscribeSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/firestore';

const useSupplierViewModel = () => {
  const owner = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;

  return useMemo(() => {
    return {
      owner,
      shopId,
      subscribeSuppliers: (callback) => {
        if (!shopId) return () => {};
        return subscribeSuppliers(shopId, (rawList) => callback(mapSuppliers(rawList)));
      },
      createSupplier: (data) => {
        if (!shopId) throw new Error('Missing shop');
        return createSupplier(shopId, data);
      },
      updateSupplier: (supplierId, data) => updateSupplier(shopId, supplierId, data),
deleteSupplier: (supplierId) => deleteSupplier(shopId, supplierId),
      
    };
  }, [owner, shopId]);
};

export default useSupplierViewModel;

