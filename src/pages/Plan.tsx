import { useState } from 'react';
import { BadgePercent, Wrench, CalendarClock, Send, CheckCircle2, Bell, KeyRound } from 'lucide-react';
import { useStore, money } from '../store';
import { PLAN, nowStamp, type Plan } from '../data';
import { Btn, Card, Chip, Empty, Field, KV, Kpi, Modal, Note, Select, Area, Text, When } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { allowanceOf, allowTone, barTone, managedHomes, leasedHomes, limitOf } from './lib';
import { feeOf, pctText, vatActive } from '../pricing';

/** What each plan covers (from the client's plan descriptions). */
export const PLAN_COVER: Record<Plan, string> = {
  10: 'Management only. Repairs are not included: every repair is quoted and paid by you.',
  12: 'Eligible labour is covered up to the job limit. Materials are charged to you.',
  16: 'Eligible labour and materials are covered up to the job limit.',
  20: 'Labour, materials and the extra categories agreed with LSP are covered up to the job limit.',
};

export function MyPlan() {
  const s = useStore(); const al = allowanceOf(s); const [ask, setAsk] = useState(false);
  const plan = s.me.plan; const homes = managedHomes(s); const vatOn = vatActive(s.vat);
  const monthly = homes.reduce((a, p) => a + feeOf(p.rent, plan, s.vat).total, 0);
  const waitingChange = s.requests.find(r => r.kind === 'Plan change' && r.status === 'Sent');
  return <>
    <PageHeader crumbs={crumbsFor('plan', s.go)} title="My Plan & Allowance" action={<Btn kind="outline" icon={<Send size={18} />} disabled={!!waitingChange} onClick={() => setAsk(true)}>{waitingChange ? 'Plan change requested' : 'Ask to change plan'}</Btn>} />
    <div className="grid g4">
      <Kpi icon={<BadgePercent size={18} />} tone="brand" label="Your plan" value={`${plan}%`} caption={vatOn ? `${pctText(feeOf(1000, plan, s.vat).incl)} incl. VAT` : 'of the rent · no VAT charged'} />
      <Kpi icon={<Wrench size={18} />} tone="info" label="Job limit" value={money(limitOf(s))} caption="repairs over this need your OK" />
      <Kpi icon={<CheckCircle2 size={18} />} tone={allowTone(al.pctAll)} label="Allowance left" value={money(al.leftAfter)} caption={`of ${money(al.total)} · after approved work`} />
      <Kpi icon={<CalendarClock size={18} />} tone="neutral" label="Renews" value={al.renews} caption={`started ${s.me.start}`} />
    </div>
    <div className="dgrid">
      <div className="col">
        <Card title="Maintenance allowance" sub={`The yearly amount of covered repairs in your agreement. Each repair is taken off once, when the work is done. It starts again on ${al.renews}.`}>
          <div className="flex between"><span className="metric">{money(al.left)}</span><span className="small">left of {money(al.total)} this year, after approved work</span></div>
          <div className="bbar"><i className={`u ${barTone(al.pctAll)}`} style={{ width: Math.min(100, al.pct) + '%' }} />{al.committed > 0 && <i className={`j ${barTone(al.pctAll)}`} style={{ width: Math.min(100 - Math.min(100, al.pct), al.total ? al.committed / al.total * 100 : 0) + '%' }} />}{[70, 90].map(m => <span key={m} className="mk" style={{ left: m + '%' }}><em>{m}%</em></span>)}</div>
          <div className="flex wrap" style={{ gap: 14 }}><span className="legend"><i className="lg-u" />Used {money(al.used)}</span><span className="legend"><i className="lg-j" />Approved, in progress {money(al.committed)}</span><span className="legend"><i className="lg-f" />Left {money(al.leftAfter)}</span></div>
          {al.waiting > 0 && <span className="caption">{money(al.waiting)} more is being checked by LSP.</span>}
          <Note><Bell size={14} style={{ verticalAlign: -2 }} /> You get an email at 70%, 90% and 100%. When it runs out, LSP asks you before any more work and you pay for it. Nothing is ever taken without telling you.</Note>
        </Card>
        <Card title="Where the allowance went" sub="Covered repairs this year.">
          {al.posts.length ? <div className="tablewrap"><table className="t"><thead><tr><th>Repair</th><th>Home</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead><tbody>
            {al.posts.map(x => <tr key={x.j.id} onClick={() => s.go('repairs', x.j.id)}><td><b className="strong">{x.j.title}</b></td><td>{s.properties.find(p => p.id === x.j.property)?.address}</td><td><When at={x.at} /></td><td style={{ textAlign: 'right' }}><b>{money(x.amount)}</b></td></tr>)}
          </tbody></table></div> : <Empty icon={<Wrench size={22} />}>Nothing used yet this year.</Empty>}
        </Card>
        <Card title="What you pay LSP each month" sub={`Your ${plan}% fee for each managed home${vatOn ? ', with VAT added' : ''}. It is taken from the rent before it's paid to you.`}>
          <div className="tablewrap"><table className="t"><thead><tr><th>Home</th><th>Rent</th><th>Fee {plan}%</th><th>VAT</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead><tbody>
            {homes.map(p => { const f = feeOf(p.rent, plan, s.vat); return <tr key={p.id} className="static"><td><b className="strong">{p.address}</b></td><td>{money(p.rent)}</td><td>{money(f.net)}</td><td>{f.on ? money(f.vat) : <span className="muted">Not charged</span>}</td><td style={{ textAlign: 'right' }}><b>{money(f.total)}</b></td></tr>; })}
            {leasedHomes(s).map(p => <tr key={p.id} className="static"><td><b className="strong">{p.address}</b><div className="caption">Leased to LSP</div></td><td colSpan={3}><span className="muted">No management fee · LSP pays you {money(p.lease!.rent)} a month</span></td><td style={{ textAlign: 'right' }}>£0</td></tr>)}
          </tbody></table></div>
          <div className="flex between"><span className="label">Total each month</span><b style={{ fontSize: 18 }}>{money(monthly)}</b></div>
        </Card>
      </div>
      <div className="col">
        <Card title={`Your ${plan}% plan`} sub="Your management agreement with LSP" action={<Chip tone="ok">Active</Chip>}>
          <KV rows={[['Started', s.me.start], ['Renews', al.renews], ['Fee', vatOn ? `${plan}% + VAT ${s.vat.rate}%` : `${plan}% of the rent`], ['Job limit', `${money(limitOf(s))} per repair`], ['Allowance', `${money(al.total)} a year`], ['Homes on this plan', String(homes.length)]]} />
          <Note>{PLAN_COVER[plan]}</Note>
          {waitingChange && <Note tone="ok">You asked to change plan on {waitingChange.at}. The Supervisor will reply in Messages.</Note>}
        </Card>
        <Card title="All plans" sub="Change plan from your next renewal or an agreed date.">
          <div className="divlist">{([10, 12, 16, 20] as Plan[]).map(x => <div key={x} className="item" style={{ alignItems: 'flex-start' }}><span className={`tile ${x === plan ? 't-brand' : 't-neutral'}`} style={{ width: 32, height: 32 }}><BadgePercent size={15} /></span><div className="stack grow"><b>{x}% plan{x === 10 ? ' · Management Only' : ''}</b><span className="caption">{x === 10 ? 'No repairs included' : `Job limit ${money(PLAN[x].limit)}`} · {PLAN_COVER[x]}</span></div>{x === plan && <Chip tone="brand">Yours</Chip>}</div>)}</div>
        </Card>
        {leasedHomes(s).length > 0 && <Card className="flat"><span className="flex small" style={{ gap: 8 }}><KeyRound size={16} />Homes leased to LSP have no plan or fee. LSP pays you the lease rent instead.</span></Card>}
      </div>
    </div>
    {ask && <PlanChange onClose={() => setAsk(false)} />}
  </>;
}

function PlanChange({ onClose }: { onClose: () => void }) {
  const s = useStore(); const al = allowanceOf(s);
  const [to, setTo] = useState(String(s.me.plan === 20 ? 16 : 20)); const [from, setFrom] = useState(al.renews); const [why, setWhy] = useState('');
  return <Modal title="Ask to change your plan" sub="LSP's Supervisor decides. The new plan starts from a future date, so this year's terms don't change." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={<Send size={16} />} disabled={+to === s.me.plan} onClick={() => {
      const at = nowStamp();
      s.setRequests(rs => [{ id: 'LR' + Date.now(), kind: 'Plan change', title: `Change plan from ${s.me.plan}% to ${to}%`, about: `From ${from}.${why ? ' ' + why : ''}`, at, status: 'Sent' }, ...rs]);
      s.log(`Asked to change plan from ${s.me.plan}% to ${to}% from ${from}`, 'Plan'); s.toast('Sent to LSP. You will get a reply in Messages.'); onClose();
    }}>Send request</Btn></>}>
    <div className="grid g2"><Field label="New plan"><Select value={to} onChange={setTo} options={([10, 12, 16, 20] as Plan[]).map(x => ({ value: String(x), label: `${x}%${x === 10 ? ' · Management Only' : ''}${x === s.me.plan ? ' (your plan now)' : ''}`, disabled: x === s.me.plan }))} /></Field>
      <Field label="From"><Text value={from} onChange={setFrom} /></Field></div>
    <Note>{PLAN_COVER[+to as Plan]}</Note>
    <Field label="Anything LSP should know (optional)"><Area value={why} onChange={setWhy} placeholder="e.g. I'd like more repairs covered" /></Field>
  </Modal>;
}
