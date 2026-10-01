/** Simple unique ID generator (no external dep needed) */
export function nanoid(size = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const arr = new Uint8Array(size);
  crypto.getRandomValues(arr);
  arr.forEach((b) => (result += chars[b % chars.length]));
  return result;
}
