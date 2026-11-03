import { useState } from 'react';
import { PoundSterling, Landmark, TriangleAlert, Download, Mail, KeyRound, FileText, Receipt } from 'lucide-react';
import { useStore, useLookups, money, rentStatus } from '../store';
import { daysFrom, type LeasePay } from '../data';
import { Btn, Card, Chip, Drawer, Empty, KV, Kpi, Modal, Note, PageTabs, Timeline, FilterBar, applyFlt, useFlt, yearsOf } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { statements, leasedHomes, downloadPdf, DocSheet, PAY_DAY, type Statement } from './lib';

export function leaseState(x: LeasePay) {
  const left = x.amount - x.paid; const d = daysFrom(x.due);
  if (left <= 0) return { label: 'Paid', tone: 'ok' as const };
  if (x.paid > 0) return d < 0 ? { label: `Part-paid · ${money(left)} late`, tone: 'err' as const } : { label: 'Part-paid', tone: 'warn' as const };
  if (d < 0) return { label: `Late · ${-d} days`, tone: 'err' as const };
  return { label: d === 0 ? 'Due today' : 'Due ' + x.due.replace(' 2026', ''), tone: d <= 7 ? 'warn' as const : 'neutral' as const };
}

/** Lease rent LSP pays the owner, month by month. Part payments carry forward. */
export function LeasePayTable({ list: all, hideHome = true }: { list: LeasePay[]; hideHome?: boolean }) {
  const L = useLookups(); const [f, setF] = useFlt();
  const list = applyFlt(all, f, { text: x => `${x.month} ${L.prop(x.property)?.address ?? ''}`, type: x => leaseState(x).label.split(' ·')[0].replace(/ \d.*$/, ''), date: x => x.due });
  return <>{all.length > 2 && <FilterBar f={f} set={setF} placeholder="Search month" types={[...new Set(all.map(x => leaseState(x).label.split(' ·')[0].replace(/ \d.*$/, '')))]} typeLabel="Any status" years={yearsOf(all, x => x.due)} shown={list.length} total={all.length} />}
    <div className="tablewrap"><table className="t"><thead><tr><th>Month</th>{!hideHome && <th>Home</th>}<th>Due</th><th>Amount</th><th>Paid</th><th>Still owed</th><th>Paid on · ref</th><th>Status</th></tr></thead><tbody>
      {[...list].reverse().map(x => <tr key={x.id} className="static"><td><b className="strong">{x.month}</b></td>{!hideHome && <td>{L.prop(x.property)?.address}</td>}<td>{x.due}</td><td>{money(x.amount)}</td><td>{money(x.paid)}</td><td>{x.amount > x.paid ? <b>{money(x.amount - x.paid)}</b> : '—'}</td>
        <td>{x.history.length ? x.history.map(h => <div key={h.ref} className="caption">{h.date} · {money(h.amount)} · {h.ref}</div>) : <span className="muted">—</span>}</td><td><Chip tone={leaseState(x).tone}>{leaseState(x).label}</Chip></td></tr>)}
    </tbody></table>{!list.length && <Empty icon={<KeyRound size={22} />}>No lease payments.</Empty>}</div></>;
}

export function Rent() {
  const s = useStore(); const L = useLookups();
  const all = statements(s); const cur = all[0];
  const [tab, setTab] = useState<'statements' | 'month' | 'lease'>('statements');
  const [f, setF] = useFlt();
  const list = applyFlt(all, f, { text: x => x.month, date: x => '1 ' + x.month });
  const open = s.detail ? all.find(x => x.key === s.detail) : undefined;
  const owed = s.rent.filter(r => r.paid < r.amount);
  const lease = s.leasePays; const leaseOwed = lease.filter(x => daysFrom(x.due) <= 0).reduce((a, x) => a + x.amount - x.paid, 0);
  const year = all.filter(x => x.month.endsWith('2026'));
  return <>
    <PageHeader crumbs={crumbsFor('rent', s.go)} title="Rent & Statements" action={<Btn kind="outline" icon={<Download size={18} />} onClick={() => { s.log('Downloaded the 2026 rent summary', 'Rent'); downloadPdf(s, '2026 rent summary'); }}>Year summary</Btn>} />
    <div className="grid g4">
      <Kpi icon={<PoundSterling size={18} />} tone="ok" label={`Rent in ${cur?.month.split(' ')[0] ?? 'this month'}`} value={money(cur?.received ?? 0)} caption={`of ${money(cur?.due ?? 0)} due`} onClick={() => setTab('month')} active={tab === 'month'} />
      <Kpi icon={<Landmark size={18} />} tone="brand" label={`Paid to you on ${PAY_DAY} ${cur?.month.split(' ')[0] ?? ''}`} value={money(cur?.pay ?? 0)} caption={`into ${s.me.bank}`} onClick={() => cur && s.go('rent', cur.key)} />
      <Kpi icon={<TriangleAlert size={18} />} tone="err" label="Rent owed by tenants" value={money(owed.reduce((a, r) => a + r.amount - r.paid, 0))} caption={owed.length ? 'LSP is chasing it' : 'nothing owed'} onClick={() => setTab('month')} />
      <Kpi icon={<KeyRound size={18} />} tone={leaseOwed ? 'warn' : 'ok'} label="Lease rent owed by LSP" value={money(leaseOwed)} caption={`${leasedHomes(s).length} home leased to LSP`} active={tab === 'lease'} onClick={() => setTab('lease')} />
    </div>
    <PageTabs value={tab} onChange={setTab} items={[{ id: 'statements', label: 'Monthly statements', count: all.length }, { id: 'month', label: 'Rent this month', count: s.rent.length }, { id: 'lease', label: 'Lease payments from LSP', count: lease.length }]} />
    {tab === 'statements' && <Card title="Monthly statements" sub={`Rent LSP received for your managed homes, less the ${s.me.plan}% fee${cur?.vatOn ? ', VAT' : ''} and any repairs you pay for. Paid to you on the ${PAY_DAY}th.`}>
      <FilterBar f={f} set={setF} placeholder="Search month" years={yearsOf(all, x => '1 ' + x.month)} shown={list.length} total={all.length} />
      <div className="tablewrap"><table className="t"><thead><tr><th>Month</th><th>Rent due</th><th>Rent received</th><th>LSP fee</th><th>VAT</th><th>Repairs</th><th>Paid to you</th><th>Status</th><th /></tr></thead><tbody>
        {list.map(x => <tr key={x.key} onClick={() => s.go('rent', x.key)}><td><span className="cell"><span className="tile t-brand" style={{ width: 32, height: 32 }}><FileText size={15} /></span><b className="strong">{x.month}</b></span></td><td>{money(x.due)}</td><td>{money(x.received)}{x.received < x.due && <div className="caption" style={{ color: 'var(--err)' }}>{money(x.due - x.received)} owed</div>}</td><td>−{money(x.fee)}</td><td>{x.vatOn ? '−' + money(x.vat) : <span className="muted">Not charged</span>}</td><td>{x.repairs ? '−' + money(x.repairs) : '—'}</td><td><b>{money(x.pay)}</b></td>
          <td><Chip tone={x.paid ? 'ok' : 'info'}>{x.paid ? `Paid ${x.payDate.replace(' 2026', '')}` : `Due ${x.payDate.replace(' 2026', '')}`}</Chip></td><td style={{ textAlign: 'right' }}><Btn sm kind="ghost">View</Btn></td></tr>)}
      </tbody></table></div>
      <div className="flex between"><span className="caption">2026 so far: received {money(year.reduce((a, x) => a + x.received, 0))} · fees {money(year.reduce((a, x) => a + x.fee + x.vat, 0))} · paid to you {money(year.reduce((a, x) => a + x.pay, 0))}</span></div>
    </Card>}
    {tab === 'month' && <Card title="Rent this month" sub="LSP checks the bank and records what arrived. Part payments carry forward, and LSP sends the tenant reminders.">
      <div className="tablewrap"><table className="t"><thead><tr><th>Tenant</th><th>Home</th><th>Due</th><th>Rent</th><th>Received</th><th>Owed</th><th>Status</th><th>What LSP did</th></tr></thead><tbody>
        {s.rent.map(r => { const t = L.tenant(r.tenant); const st = rentStatus(r); return <tr key={r.id} onClick={() => s.go('tenants', r.tenant)}><td><b className="strong">{t?.name}</b></td><td>{L.prop(t?.property)?.address}</td><td>{r.due}</td><td>{money(r.amount)}</td><td>{money(r.paid)}{r.history.map(h => <div key={h.date} className="caption">{h.date} · {money(h.amount)}</div>)}</td><td>{r.amount > r.paid ? <b style={{ color: 'var(--err)' }}>{money(r.amount - r.paid)}</b> : '—'}</td><td><Chip tone={st.tone}>{st.label}</Chip></td><td>{r.reminders.length ? <span className="caption">{r.reminders.length} reminder{r.reminders.length > 1 ? 's' : ''} · last {r.reminders[r.reminders.length - 1].at}</span> : <span className="muted">—</span>}</td></tr>; })}
      </tbody></table></div>
      {owed.length > 0 && <Note>Rent still owed is carried forward. It is added to the statement for the month it arrives.</Note>}
    </Card>}
    {tab === 'lease' && <Card title="Lease payments from LSP" sub="For homes you lease to LSP. LSP pays the lease rent on its own schedule, whatever the occupiers pay. These are not in your monthly statements.">
      {leasedHomes(s).map(p => <div key={p.id} className="col" style={{ gap: 10 }}><b>{p.address} · {money(p.lease!.rent)} {p.lease!.frequency.toLowerCase()}</b><LeasePayTable list={lease.filter(x => x.property === p.id)} /></div>)}
      {!leasedHomes(s).length && <Empty icon={<KeyRound size={22} />}>You don't lease any homes to LSP.</Empty>}
    </Card>}
    {open && <StatementDrawer st={open} onClose={() => s.go('rent')} />}
  </>;
}

function StatementDrawer({ st, onClose }: { st: Statement; onClose: () => void }) {
  const s = useStore(); const [pdf, setPdf] = useState(false);
  return <Drawer title={`${st.month} statement`} sub={`${s.me.plan}% plan · paid to ${s.me.bank} · ${st.paid ? 'paid' : 'due'} ${st.payDate}`} onClose={onClose} icon={<span className="tile t-brand"><FileText size={18} /></span>}
    footer={<><Btn kind="outline" icon={<Mail size={16} />} onClick={() => { s.log(`Emailed the ${st.month} statement to yourself`, 'Rent'); s.toast(`Sent to ${s.me.email}`); }}>Email to me</Btn><Btn icon={<Download size={16} />} onClick={() => setPdf(true)}>Statement PDF</Btn></>}>
    <Card className="flat" title="Rent in"><div className="divlist">{st.rows.map(r => <div key={r.home.id + r.tenant} className="item"><div className="stack grow"><b>{r.home.address}</b><span className="caption">{r.tenant}</span></div><span className="caption">{money(r.received)} of {money(r.due)}</span><Chip tone={r.received >= r.due ? 'ok' : 'warn'}>{r.received >= r.due ? 'Paid' : `${money(r.due - r.received)} owed`}</Chip></div>)}</div></Card>
    <Card className="flat"><KV rows={[['Rent received', money(st.received)], [`LSP fee (${s.me.plan}%)`, '− ' + money(st.fee)], ...(st.vatOn ? [[`VAT on LSP fee (${s.vat.rate}%)`, '− ' + money(st.vat)] as [string, string]] : []), ['Repairs you pay for', st.repairs ? '− ' + money(st.repairs) : '—'], ['Paid to you', <b style={{ fontSize: 16 }}>{money(st.pay)}</b>], ['Pay date', st.payDate]]} /></Card>
    {st.bills.length > 0 && <Note>Taken off: {st.bills.map(b => `${b.id} (${money(b.amount - (st.paid ? 0 : b.paid))})`).join(', ')}.</Note>}
    {st.received < st.due && <Note tone="warn">{money(st.due - st.received)} rent is still owed. It is paid to you in the month it arrives.</Note>}
    <Card className="flat" title="Repairs covered by your plan this month"><Timeline items={s.jobs.filter(j => j.invoice && s.invoices.find(i => i.id === j.invoice)?.covered && s.invoices.find(i => i.id === j.invoice)!.issued.includes(st.month.split(' ')[0])).map(j => ({ at: s.invoices.find(i => i.id === j.invoice)!.issued, text: `${j.title} · ${money(j.price)} from your allowance · nothing to pay` }))} />
      {!s.jobs.some(j => j.invoice && s.invoices.find(i => i.id === j.invoice)?.covered && s.invoices.find(i => i.id === j.invoice)!.issued.includes(st.month.split(' ')[0])) && <span className="caption"><Receipt size={12} style={{ verticalAlign: -2 }} /> None this month.</span>}</Card>
    {pdf && <Modal wide title={`${st.month} statement`} sub="The statement as a PDF, on LSP's paper." onClose={() => setPdf(false)} footer={<><Btn kind="outline" onClick={() => setPdf(false)}>Close</Btn><Btn icon={<Download size={16} />} onClick={() => { s.log(`Downloaded the ${st.month} statement`, 'Rent'); downloadPdf(s, `${st.month} statement`); }}>Download PDF</Btn></>}>
      <DocSheet kind="LANDLORD STATEMENT" to={{ label: 'Statement for', rows: [s.me.name, ...s.me.billing.split(', ')] }} meta={[['Month', st.month], [st.paid ? 'Paid on' : 'Pay date', st.payDate], ['Paid to', s.me.bank]]}
        lines={[...st.rows.map(r => ({ activity: 'Rent', desc: `${r.home.address} · ${r.tenant}`, qty: 1, rate: r.received })), { activity: 'LSP fee', desc: `${s.me.plan}% of rent received`, qty: 1, rate: -st.fee }, ...(st.vatOn ? [{ activity: 'VAT', desc: `VAT on LSP fee`, qty: 1, rate: -st.vat }] : []), ...(st.repairs ? [{ activity: 'Repairs', desc: st.bills.map(b => b.id).join(', '), qty: 1, rate: -st.repairs }] : [])]}
        foot={[['Paid to you', money(st.pay)]]} />
    </Modal>}
  </Drawer>;
}
