import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { currentOwnerAtom } from '../atoms/owner';
import { mapSuppliers } from '../models/SupplierModel';

import {
  subscribeSuppliers as subscribeSuppliersService,
  createSupplier as createSupplierService,
  updateSupplier as updateSupplierService,
  deleteSupplier as deleteSupplierService,
} from '../services/supplierService';

const useSupplierViewModel = () => {
  const owner = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;

  return useMemo(() => {
    const ensureShop = () => {
      if (!shopId) throw new Error('Missing shop');
    };

    return {
      owner,
      shopId,

      subscribeSuppliers: (callback) => {
        if (!shopId) return () => {};

        return subscribeSuppliersService(shopId, (rawList) => {
          callback(mapSuppliers(rawList));
        });
      },

      createSupplier: (data) => {
        ensureShop();
        return createSupplierService(shopId, data);
      },

      updateSupplier: (supplierId, data) => {
        ensureShop();
        return updateSupplierService(shopId, supplierId, data);
      },

      deleteSupplier: (supplierId) => {
        ensureShop();
        return deleteSupplierService(shopId, supplierId);
      },
    };
  }, [shopId]);
};

export default useSupplierViewModel;