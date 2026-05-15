export function isOffline() {
  return typeof navigator !== "undefined" && "onLine" in navigator && navigator.onLine === false;
}

export function offlineActionMessage(action: string) {
  return `You appear to be offline. ${action}`;
}

export function connectionActionMessage(action: string) {
  return isOffline() ? offlineActionMessage(action) : `Could not connect right now. ${action}`;
}

export function accountSaveErrorMessage(localFallback: string) {
  return connectionActionMessage(`Your account was not changed. ${localFallback}`);
}

export function accountLoadErrorMessage(localFallback: string) {
  return connectionActionMessage(localFallback);
}

export function recipientActionErrorMessage(action: string) {
  return connectionActionMessage(action);
}
