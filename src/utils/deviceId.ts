export const getDeviceId = (): string => {
  const storageKey = 'device_fingerprint';
  let deviceId = localStorage.getItem(storageKey);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(storageKey, deviceId);
  }

  return deviceId;
};
