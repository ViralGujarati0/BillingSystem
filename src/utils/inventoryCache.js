let inventoryCache = {};
let productCache = {};

/* ───────── SET CACHE ───────── */

export const setInventoryCache = (items) => {
  inventoryCache = {};

  items.forEach((item) => {
    if (item?.barcode) {
      inventoryCache[String(item.barcode)] = item;
    }
  });
};

export const setProductCache = (items) => {
  productCache = {};

  items.forEach((item) => {
    if (item?.barcode) {
      productCache[String(item.barcode)] = item;
    }
  });
};

/* ───────── GET CACHE ───────── */

export const getInventoryFromCache = (barcode) => {
  return inventoryCache[String(barcode)] || null;
};

export const getProductFromCache = (barcode) => {
  return productCache[String(barcode)] || null;
};

/* ───────── CLEAR CACHE ───────── */

export const clearInventoryCache = () => {
  inventoryCache = {};
};

export const clearProductCache = () => {
  productCache = {};
};