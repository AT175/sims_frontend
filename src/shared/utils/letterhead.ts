/**
 * School Letterhead Utility
 *
 * Fetches and caches school branding (logo, name, address, motto, etc.)
 * and generates HTML letterhead for printable documents (receipts,
 * transcripts, reports, etc.).
 *
 * Usage:
 *   1. Call `preloadLetterhead(tenantKey)` on dashboard mount (fire-and-forget).
 *   2. Call `getLetterheadHTML()` inside generatePDF() to inject the letterhead.
 *   3. Call `getDocumentFooterHTML()` for the footer.
 */

import { apiClient, SchoolBranding } from '@shared/api/apiClient';

// ── Cache ──
let cachedBranding: SchoolBranding | null = null;
let cachedTenantKey: string | null = null;
let fetchPromise: Promise<SchoolBranding | null> | null = null;

/**
 * Pre-fetch school branding and cache it so generatePDF can use it
 * synchronously. Safe to call multiple times — returns the cached
 * promise if a fetch is already in flight.
 */
export async function preloadLetterhead(tenantKey: string): Promise<SchoolBranding | null> {
  if (cachedBranding && cachedTenantKey === tenantKey) {
    return cachedBranding;
  }
  if (fetchPromise && cachedTenantKey === tenantKey) {
    return fetchPromise;
  }

  cachedTenantKey = tenantKey;
  fetchPromise = apiClient.getPublicBranding(tenantKey)
    .then((b) => {
      cachedBranding = b;
      return b;
    })
    .catch(() => {
      // Branding fetch failed — letterhead will use fallback values
      return null;
    });

  return fetchPromise;
}

/**
 * Clear the cache (e.g. on logout or tenant switch).
 */
export function clearLetterheadCache(): void {
  cachedBranding = null;
  cachedTenantKey = null;
  fetchPromise = null;
}

/**
 * Get the cached branding (or null if not yet loaded).
 */
export function getCachedBranding(): SchoolBranding | null {
  return cachedBranding;
}

/**
 * Escape HTML special characters to prevent injection in document content.
 */
function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
}

/**
 * Build the address line from available branding fields.
 */
function buildAddressLine(b: SchoolBranding): string {
  const parts: string[] = [];
  if (b.address) parts.push(b.address);
  if (b.district) parts.push(b.district);
  if (b.region) parts.push(b.region);
  return parts.join(', ');
}

/**
 * Build the contact line from available branding fields.
 */
function buildContactLine(b: SchoolBranding): string {
  const parts: string[] = [];
  if (b.phone) parts.push(`Tel: ${b.phone}`);
  if (b.email) parts.push(`Email: ${b.email}`);
  return parts.join(' | ');
}

/**
 * Resolve the logo URL — relative paths are prefixed with the API base
 * so they work in the print window (which has no Vite proxy).
 */
function resolveLogoUrl(logoUrl: string | null): string | null {
  if (!logoUrl) return null;
  // Absolute URL (https://...) — use as-is
  if (/^https?:\/\//.test(logoUrl) || /^data:/.test(logoUrl)) return logoUrl;
  // Relative path (/schools/...) — prefix with the frontend origin
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}${logoUrl}`;
  }
  return logoUrl;
}

/**
 * Generate the letterhead HTML block for a printable document.
 * Returns an HTML string that should be inserted right after <body>.
 *
 * If branding hasn't been loaded yet, falls back to the school name
 * from the auth store (or a generic placeholder).
 */
export function getLetterheadHTML(): string {
  const b = cachedBranding;

  // Fallback values
  const schoolName = b?.schoolName || 'School';
  const logoUrl = resolveLogoUrl(b?.logoUrl ?? null);
  const motto = b?.motto || '';
  const addressLine = b ? buildAddressLine(b) : '';
  const contactLine = b ? buildContactLine(b) : '';
  const primaryColor = b?.primaryColor || '#0F4C75';

  const logoHTML = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" style="height:70px;max-width:70px;object-fit:contain" alt="logo" />`
    : '';

  const addressHTML = [addressLine, contactLine].filter(Boolean).map((line) =>
    `<div style="font-size:11px;color:#555">${escapeHtml(line)}</div>`
  ).join('');

  const mottoHTML = motto
    ? `<div style="font-size:11px;font-style:italic;color:${escapeHtml(primaryColor)};margin-top:4px">${escapeHtml(motto)}</div>`
    : '';

  return `
    <div style="display:flex;align-items:center;gap:16px;border-bottom:3px solid ${escapeHtml(primaryColor)};padding-bottom:12px;margin-bottom:24px">
      ${logoHTML}
      <div style="flex:1;text-align:center">
        <div style="font-size:22px;font-weight:bold;color:${escapeHtml(primaryColor)};letter-spacing:0.5px">${escapeHtml(schoolName)}</div>
        ${addressHTML}
        ${mottoHTML}
      </div>
      <div style="width:70px">&nbsp;</div>
    </div>
  `;
}

/**
 * Generate the footer HTML block for a printable document.
 * Includes school name and generation timestamp.
 */
export function getDocumentFooterHTML(schoolName?: string): string {
  const name = schoolName || cachedBranding?.schoolName || 'School';
  const dateStr = new Date().toLocaleString();
  return `
    <div style="margin-top:40px;padding-top:12px;border-top:1px solid #ddd;font-size:10px;color:#aaa;text-align:center">
      ${escapeHtml(name)} — Generated by SIMS on ${dateStr}
    </div>
  `;
}

/**
 * CSS styles for the letterhead, to be included in the <style> block.
 */
export const LETTERHEAD_CSS = `
  .letterhead { display:flex; align-items:center; gap:16px; border-bottom:3px solid #0F4C75; padding-bottom:12px; margin-bottom:24px; }
  .letterhead-logo { height:70px; max-width:70px; object-fit:contain; }
  .letterhead-info { flex:1; text-align:center; }
  .letterhead-school { font-size:22px; font-weight:bold; letter-spacing:0.5px; }
  .letterhead-addr { font-size:11px; color:#555; }
  .letterhead-motto { font-size:11px; font-style:italic; margin-top:4px; }
  .letterhead-spacer { width:70px; }
`;
