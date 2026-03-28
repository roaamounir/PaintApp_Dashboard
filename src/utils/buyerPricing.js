/**
 * سعر الوحدة للمشتري حسب الدور (متطابق مع الباكند: buyerPricing.js)
 */
export function getUnitPriceForBuyer(role, paint, canBuyWholesale = false) {
  const retail = Number(paint?.price);
  const r = Number.isFinite(retail) ? retail : 0;
  const wp = paint?.wholesalePrice;
  const wholesale =
    wp != null && Number.isFinite(Number(wp)) ? Number(wp) : null;

  if (role === "vendor" || role === "designer" || Boolean(canBuyWholesale)) {
    return wholesale != null ? wholesale : r;
  }
  return r;
}

export function getLineTotal(role, paint, quantity, canBuyWholesale = false) {
  const q = Math.max(1, Math.floor(Number(quantity) || 1));
  return getUnitPriceForBuyer(role, paint, canBuyWholesale) * q;
}

export function paintHasWholesale(paint) {
  return (
    paint?.wholesalePrice != null &&
    Number.isFinite(Number(paint.wholesalePrice))
  );
}
