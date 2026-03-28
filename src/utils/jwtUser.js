/** قراءة حمولة JWT من التخزين (بدون التحقق من التوقيع — للواجهة فقط) */
export function getJwtPayload() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

export function getJwtRole() {
  return getJwtPayload()?.role ?? null;
}

export function getJwtPermissions() {
  const fromToken = getJwtPayload()?.permissions;
  if (fromToken && typeof fromToken === "object") return fromToken;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.permissions && typeof user.permissions === "object"
      ? user.permissions
      : {};
  } catch {
    return {};
  }
}

export function hasUserPermission(permissionId) {
  const role = getJwtRole();
  if (role === "admin" || role === "vendor") return true;
  const map = getJwtPermissions();
  return Boolean(map?.[permissionId]);
}
