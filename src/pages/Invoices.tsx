import { Receipt, CheckCircle2, Clock, BadgePercent, Landmark } from 'lucide-react';
import { useStore, money } from '../store';
import { Btn, Card, Chip, Empty, Kpi, Note, FilterBar, applyFlt, useFlt, yearsOf } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { invoiceView, InvoiceModal, chargeable, COMPANY, needsMe, PAY_DAY } from './lib';

export function Invoices() {
  const s = useStore(); const [f, setF] = useFlt();
  const all = [...s.invoices].sort((a, b) => b.id.localeCompare(a.id));
  const list = applyFlt(all, f, { text: i => `${i.id} ${i.site ?? ''} ${i.items.map(x => x.desc).join(' ')} ${invoiceView(s, i).label}`, type: i => invoiceView(s, i).label.split(' ·')[0], date: i => i.issued });
  const open = s.detail ? s.invoices.find(i => i.id === s.detail) : undefined;
  const covered = all.filter(i => i.covered);
  const toApprove = all.filter(i => { const j = s.jobs.find(x => x.id === i.job); return j && needsMe(j); });
  const toPay = all.filter(i => !i.covered && i.paid < i.amount && chargeable(s, i));
  return <>
    <PageHeader crumbs={crumbsFor('invoices', s.go)} title="Invoices" />
    <div className="grid g4">
      <Kpi icon={<Clock size={18} />} tone="warn" label="Waiting for your approval" value={toApprove.length} caption={money(toApprove.reduce((a, i) => a + i.amount, 0))} onClick={() => s.go('approvals')} />
      <Kpi icon={<Receipt size={18} />} tone="err" label="To pay" value={money(toPay.reduce((a, i) => a + i.amount - i.paid, 0))} caption={toPay.length ? `taken from your ${PAY_DAY} Oct payout` : 'nothing to pay'} />
      <Kpi icon={<BadgePercent size={18} />} tone="ok" label="Covered by your plan" value={covered.length} caption={`${money(covered.reduce((a, i) => a + i.amount, 0))} · nothing to pay`} onClick={() => s.go('plan')} />
      <Kpi icon={<CheckCircle2 size={18} />} tone="info" label="All invoices" value={all.length} caption="kept for your records" />
    </div>
    <Note>Repairs under your job limit are covered by your plan, so their invoices show £0 to pay. Repairs you approved over the limit are taken from your next rent payout, or you can pay by bank transfer to {COMPANY.bank.join(', ')}.</Note>
    <Card title="Your invoices" sub="Click one to see it on LSP's paper and download the PDF.">
      <FilterBar f={f} set={setF} placeholder="Search invoice, home or work" types={[...new Set(all.map(i => invoiceView(s, i).label.split(' ·')[0]))]} typeLabel="Any status" years={yearsOf(all, i => i.issued)} shown={list.length} total={all.length} />
      <div className="tablewrap"><table className="t"><thead><tr><th>Invoice</th><th>For</th><th>Amount</th><th>To pay</th><th>Issued</th><th>Status</th><th /></tr></thead><tbody>
        {list.map(i => { const st = invoiceView(s, i); const j = s.jobs.find(x => x.id === i.job); const pay = i.covered || !chargeable(s, i) ? 0 : i.amount - i.paid; return <tr key={i.id} onClick={() => s.go('invoices', i.id)}>
          <td><span className="cell"><span className="tile t-brand" style={{ width: 32, height: 32 }}><Receipt size={15} /></span><b className="strong">{i.id}</b></span></td>
          <td><span className="stack"><span>{j?.title ?? i.items[0]?.desc}</span><span className="caption">{i.site}</span></span></td>
          <td>{money(i.amount)}</td><td>{pay > 0 ? <b>{money(pay)}</b> : <span className="muted">£0</span>}</td><td>{i.issued}</td>
          <td><Chip tone={st.tone}>{st.label}</Chip></td><td style={{ textAlign: 'right' }}>{j && needsMe(j) ? <Btn sm onClick={() => s.go('approvals', j.id)}>Review</Btn> : <Btn sm kind="ghost">View</Btn>}</td></tr>; })}
      </tbody></table>{!list.length && <Empty icon={<Receipt size={22} />}>No invoices here.</Empty>}</div>
    </Card>
    <Card className="flat"><span className="flex small" style={{ gap: 8 }}><Landmark size={16} />Paid by bank transfer? Open the invoice and press “I've paid by bank transfer”. LSP checks the bank and marks it paid.</span></Card>
    {open && <InvoiceModal id={open.id} onClose={() => s.go('invoices')} />}
  </>;
}
