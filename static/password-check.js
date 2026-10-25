/* Browser-side Pwned Passwords range lookup. No plaintext is sent to Flask. */
(function (root) {
  const URL = 'https://api.pwnedpasswords.com/range/';
  const ROW = /^([0-9A-F]{35}):(\d+)$/i;

  async function sha1Hex(password, cryptoApi = root.crypto) {
    const digest = await cryptoApi.subtle.digest('SHA-1', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  async function checkBreach(password, options = {}) {
    const fetchImpl = options.fetchImpl || root.fetch.bind(root);
    const cryptoApi = options.cryptoApi || root.crypto;
    const digest = await sha1Hex(password, cryptoApi);
    const prefix = digest.slice(0, 5);
    const suffix = digest.slice(5);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetchImpl(URL + prefix, {
        headers: {'Add-Padding': 'true'},
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) return {status: 'unavailable', count: null};
      const body = await response.text();
      const lines = body.trim().split(/\r?\n/);
      if (!body.trim()) return {status: 'unavailable', count: null};
      let count = 0;
      for (const line of lines) {
        const match = ROW.exec(line.trim());
        if (!match) return {status: 'unavailable', count: null};
        if (match[1].toUpperCase() === suffix) count = Number(match[2]);
      }
      if (!Number.isSafeInteger(count)) return {status: 'unavailable', count: null};
      return {status: count > 0 ? 'found' : 'not_found', count};
    } catch (_) {
      return {status: 'unavailable', count: null};
    } finally {
      clearTimeout(timeout);
    }
  }

  const api = {sha1Hex, checkBreach};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PasswordCheck = api;
})(globalThis);
