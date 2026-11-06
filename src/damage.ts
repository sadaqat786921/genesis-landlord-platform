import type { Line, Tone } from './data';

/* Tenant damage: when a tenant damages the home, LSP sends the tenant a quote for the repair.
   Flow: Damage found → Quote sent → Tenant agreed (or disputed) → Paid, or taken from the deposit at move-out.
   The same file is used in every Genesis portal. */

export type DamageStatus = 'Draft' | 'Quote sent' | 'Agreed' | 'Disputed' | 'Paid' | 'From deposit' | 'Cancelled';
export type DamageSource = 'Inspection' | 'Repair visit' | 'Reported by staff' | 'Move-out';
export interface DamageEvent { at: string; by: string; text: string }
export interface Damage {
  id: string; tenant: string; property: string; room?: string;
  title: string; note: string; found: string; source: DamageSource; inspection?: string;
  /** Photo names, shown with the demo photos. */
  photos: string[];
  lines: Line[]; quoteNo: string; validUntil?: string; sent?: string; status: DamageStatus;
  agreed?: string; disputed?: string; paidAt?: string; payHow?: 'Bank transfer' | 'Card' | 'Deposit';
  /** The repair job LSP books for the damage (paid by the tenant, never from the landlord's budget). */
  job?: string;
  events: DamageEvent[];
}

export const DAMAGE_STEPS = ['Damage found', 'Quote sent', 'Tenant agreed', 'Paid'];
export const damageStep = (d: Damage) => ({ Draft: 1, 'Quote sent': 2, Disputed: 2, Agreed: 3, Paid: 4, 'From deposit': 4, Cancelled: 1 } as Record<DamageStatus, number>)[d.status];
export const damageTotal = (d: Damage) => Math.round(d.lines.reduce((a, l) => a + l.qty * l.rate, 0) * 100) / 100;
export const DAMAGE_OPEN: DamageStatus[] = ['Draft', 'Quote sent', 'Agreed', 'Disputed'];
export const damageTone = (st: DamageStatus): Tone => ({ Draft: 'neutral', 'Quote sent': 'info', Agreed: 'brand', Disputed: 'warn', Paid: 'ok', 'From deposit': 'ok', Cancelled: 'neutral' } as Record<DamageStatus, Tone>)[st];
/** Status words. Staff and tenants see the same steps. */
export const damageLabel = (st: DamageStatus, tenantView = false): string => tenantView
  ? ({ Draft: 'Being prepared', 'Quote sent': 'Needs your answer', Agreed: 'Agreed · to pay', Disputed: 'You disagreed · LSP checking', Paid: 'Paid', 'From deposit': 'Taken from your deposit', Cancelled: 'Cancelled · nothing to pay' } as Record<DamageStatus, string>)[st]
  : ({ Draft: 'Draft quote', 'Quote sent': 'Waiting for tenant', Agreed: 'Tenant agreed · to pay', Disputed: 'Tenant disagrees', Paid: 'Paid', 'From deposit': 'From deposit', Cancelled: 'Cancelled' } as Record<DamageStatus, string>)[st];
