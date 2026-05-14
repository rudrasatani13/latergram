export function maskRecipientEmail(email: string) {
  const normalized = email.trim();
  const atIndex = normalized.indexOf("@");

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return "";
  }

  const local = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);
  const visibleFirst = local.charAt(0);
  const starCount = Math.max(3, Math.min(9, local.length - 1));

  return `${visibleFirst}${"*".repeat(starCount)}@${domain}`;
}

export function isValidLookingEmail(email: string) {
  const normalized = email.trim();

  if (!normalized || normalized.length > 254 || /\s/.test(normalized)) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}
