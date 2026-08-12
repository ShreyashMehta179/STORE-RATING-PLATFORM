/**
 * Safely parses and sanitizes the VITE_API_URL environment variable.
 * Handles cases where VITE_API_URL was accidentally set with key prefix (e.g., "VITE_API_URL = https://...")
 * or extra whitespace / quotes / trailing slashes.
 */
export function getSanitizedApiUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || typeof raw !== 'string') {
    return '';
  }

  let cleaned = raw.trim();

  // Defensive fix: If value accidentally includes key prefix, e.g., "VITE_API_URL = https://..."
  if (cleaned.includes('=')) {
    const parts = cleaned.split('=');
    cleaned = parts[parts.length - 1].trim();
  }

  // Remove surrounding quotes if present
  cleaned = cleaned.replace(/^['"]|['"]$/g, '').trim();

  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');

  // Defensive validation: Log clear error if malformed
  if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    console.error(
      `❌ VITE_API_URL configuration error: Expected a valid URL starting with http:// or https://, but received malformed value: "${raw}".`
    );
    return '';
  }

  return cleaned;
}
