export function isKonamiKeyMatch(currentKey: unknown, expectedKey: unknown) {
  if (
    typeof currentKey !== 'string' ||
    typeof expectedKey !== 'string' ||
    currentKey.length === 0 ||
    expectedKey.length === 0
  ) {
    return false;
  }

  return currentKey === expectedKey || currentKey.toLowerCase() === expectedKey.toLowerCase();
}
