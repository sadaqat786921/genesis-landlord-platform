import { TODAY, parseDate, type Plan, type Property } from './data';

/* LSP fee, VAT and the maintenance budget, worked out the same way everywhere
   (plan cards, property pages, quotes, invoices, statements).
   The fee is always stored BEFORE VAT. VAT is added on top only while LSP is VAT registered.
   The maintenance budget is a share of the fee before VAT, so VAT never changes it. */

export interface VatChange { at: string; by: string; status: 'Off' | 'On'; rate: number; number: string; from: string; reason: string }
export interface VatSetting { status: 'Not set' | 'Off' | 'On'; rate: number; number: string; from: string; history: VatChange[] }
export const VAT_START: VatSetting = { status: 'Off', rate: 20, number: '', from: '1 Jan 2026', history: [{ at: '2 Jan 2026, 09:00', by: 'Admin', status: 'Off', rate: 20, number: '', from: '1 Jan 2026', reason: 'LSP is not VAT registered' }] };
export const MAINT_SHARE = 20; // % of the LSP fee before VAT set aside for maintenance and repairs

export const r2 = (n: number) => Math.round(n * 100) / 100;
export const pctText = (n: number) => `${+n.toFixed(2)}%`;
/** VAT applies only when it is switched On and the start date has been reached. */
export const vatActive = (v: VatSetting, on: Date = TODAY) => v.status === 'On' && parseDate(v.from).getTime() <= on.getTime();

export function feeOf(rent: number, plan: Plan, v: VatSetting) {
  const net = r2(rent * plan / 100);
  const on = vatActive(v);
  const vat = on ? r2(net * v.rate / 100) : 0;
  const maintMonth = plan === 10 ? 0 : r2(net * MAINT_SHARE / 100); // Management Only has no repairs included
  return { plan, net, vat, total: r2(net + vat), on, rate: v.rate, incl: on ? +(plan * (1 + v.rate / 100)).toFixed(2) : plan, maintMonth, maintYear: r2(maintMonth * 12), remaining: r2(net - maintMonth) };
}
/** Yearly maintenance budget for a managed home on a fee plan (rounded to whole pounds). */
export const yearlyBudget = (rent: number, plan: Plan) => Math.round(feeOf(rent, plan, VAT_START).maintYear);
export const isLeased = (p?: Property) => p?.arrangement === 'Leased';
export const LSP_NAME = 'Landlord Service Plans';
