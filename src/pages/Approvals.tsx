import { useState } from 'react';
import { CheckCircle2, XCircle, MessageSquare, Wrench, KeyRound, Clock, ArrowRight, Download, BadgePercent } from 'lucide-react';
import { useStore, useLookups, money } from '../store';
import { ME_NAME, nowStamp, daysFrom } from '../data';
import { ActionCard, Bar, Btn, Card, Chip, DetailHead, Empty, KV, Kpi, Modal, Note, Reason, Tabs, Timeline, Field, Area, When } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { needsMe, whyMe, allowanceOf, allowTone, limitOf, DocSheet, ddmm, downloadPdf, adminName, AskModal, jobView, homeType, coverOf, r2 } from './lib';
import type { Job, Line } from '../data';

const quoteLines = (j: Job): Line[] => j.lines?.length ? j.lines : [{ activity: 'Repair', desc: j.title, qty: 1, rate: j.price }];
const num = (n: number) => n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
import { isLeased } from '../pricing';

export function Approvals() {
  const s = useStore();
  if (s.detail && s.jobs.some(j => j.id === s.detail)) return <ApprovalPage id={s.detail} />;
  return <ApprovalList />;
}

/** A decision the landlord made in the portal (approved or declined). */
const decidedByMe = (j: { events: { at: string; by: string; text: string }[] }) => j.events.find(e => e.by === ME_NAME && /approved|declined/i.test(e.text));

function ApprovalList() {
  const s = useStore(); const L = useLookups();
  const [tab, setTab] = useState<'waiting' | 'decided'>('waiting');
  const waiting = s.jobs.filter(needsMe);
  const decided = s.jobs.filter(j => decidedByMe(j));
  return <>
    <PageHeader crumbs={crumbsFor('approvals', s.go)} title="Needs my approval" />
    <div className="grid g3">
      <Kpi icon={<Clock size={18} />} tone="warn" label="Waiting for you" value={waiting.length} caption={`you pay ${money(waiting.reduce((a, j) => a + coverOf(s, j).pays, 0))} if you approve all`} active={tab === 'waiting'} onClick={() => setTab('waiting')} />
      <Kpi icon={<CheckCircle2 size={18} />} tone="ok" label="Decided by you" value={decided.length} caption="kept with the date and time" active={tab === 'decided'} onClick={() => setTab('decided')} />
      <Kpi icon={<BadgePercent size={18} />} tone="info" label="Your job limit" value={money(limitOf(s))} caption={`${s.me.plan}% plan · repairs over this need your OK`} onClick={() => s.go('plan')} />
    </div>
    <Note>Repairs under your {money(limitOf(s))} job limit are covered by your plan and LSP books them. Over the limit, LSP's Supervisor decides: cover it under your plan, or send you a quote first. Each quote shows what your plan covers and exactly what you pay. No reply is not a yes: LSP won't book the work until you approve it here.</Note>
    <Tabs value={tab} onChange={setTab} items={[{ id: 'waiting', label: 'Waiting for you', count: waiting.length }, { id: 'decided', label: 'Decided', count: decided.length }]} />
    {tab === 'waiting' && <Card title="Waiting for your decision" sub="Open one to see the quote, what your plan covers, what you pay and the photos. Then approve, decline or ask a question.">
      {waiting.length ? <div className="col" style={{ gap: 12 }}>{waiting.map(j => { const p = L.prop(j.property)!; const days = -daysFrom(j.landlordAsk!.split(',')[0]); return (
        <div key={j.id} className="apcard" role="button" tabIndex={0} onClick={() => s.go('approvals', j.id)}>
          <span className="tile t-warn" style={{ width: 44, height: 44 }}>{j.ownerRepair ? <KeyRound size={20} /> : <Wrench size={20} />}</span>
          <div className="stack grow" style={{ gap: 6 }}>
            <div className="flex wrap" style={{ gap: 8 }}><b style={{ fontSize: 14 }}>{j.title}</b><span className="caption">{p.address}</span>{j.ownerRepair ? <Chip tone="brand" dot={false}>Owner repair · leased to LSP</Chip> : <Chip tone="warn" dot={false}>Over your job limit</Chip>}</div>
            <span className="caption">{whyMe(s, j)} · quote {j.quoteNo} · sent {j.landlordAsk}{days > 0 ? ` · waiting ${days} day${days > 1 ? 's' : ''}` : ''}</span>
          </div>
          <span className="stack" style={{ alignItems: 'flex-end', gap: 2 }}><span className="caption">You pay</span><b style={{ fontSize: 20 }}>{money(coverOf(s, j).pays)}</b><span className="caption">{coverOf(s, j).covered ? `of ${money(j.price)} · plan covers ${money(coverOf(s, j).covered)}` : `all of ${money(j.price)}`}</span></span>
          <div className="flex" onClick={e => e.stopPropagation()}><Btn sm onClick={() => s.go('approvals', j.id)}>Review</Btn></div>
        </div>); })}</div> : <Empty icon={<CheckCircle2 size={22} />}>Nothing waiting. LSP will tell you by email and here when a repair needs your OK.</Empty>}
    </Card>}
    {tab === 'decided' && <Card title="Decided by you" sub="Every decision is kept with the date and time.">
      {decided.length ? <div className="tablewrap"><table className="t"><thead><tr><th>Repair</th><th>Home</th><th>You pay</th><th>Your decision</th><th>When</th><th>Now</th></tr></thead><tbody>
        {decided.map(j => { const e = decidedByMe(j)!; return <tr key={j.id} onClick={() => s.go('approvals', j.id)}><td><b className="strong">{j.title}</b></td><td>{L.prop(j.property)?.address}</td><td><span className="stack"><b>{money(coverOf(s, j).pays)}</b><span className="caption">of {money(j.price)}{coverOf(s, j).covered ? ` · plan ${money(coverOf(s, j).covered)}` : ''}</span></span></td><td><Chip tone={/declined/i.test(e.text) ? 'neutral' : 'ok'}>{/declined/i.test(e.text) ? 'Declined' : 'Approved'}</Chip></td><td><When at={e.at} /></td><td><Chip tone={jobView(j).tone}>{jobView(j).label}</Chip></td></tr>; })}
      </tbody></table></div> : <Empty icon={<CheckCircle2 size={22} />}>You haven't decided anything here yet.</Empty>}
    </Card>}
  </>;
}

function ApprovalPage({ id }: { id: string }) {
  const s = useStore(); const L = useLookups(); const j = s.jobs.find(x => x.id === id)!;
  const p = L.prop(j.property)!; const c = L.contractor(j.contractor); const cv = coverOf(s, j); const lines = quoteLines(j);
  const [m, setM] = useState<'' | 'yes' | 'no' | 'ask'>('');
  const waiting = needsMe(j); const mine = decidedByMe(j);
  const al = allowanceOf(s); const leased = isLeased(p);
  const decide = (yes: boolean, note: string) => {
    const at = nowStamp();
    const text = yes ? `Approved quote ${j.quoteNo} in the landlord portal: ${money(j.price)}, the plan covers ${money(cv.covered)}, you pay ${money(cv.pays)}${note ? `. ${note}` : ''}` : `Declined quote ${j.quoteNo} (${money(j.price)}) in the landlord portal: ${note}`;
    s.setJobs(js => js.map(x => x.id === id ? { ...x, status: yes ? 'Assigned' : 'Declined', landlordOk: yes, declined: yes ? undefined : `Landlord said no: ${note}`, events: [...x.events, { at, by: ME_NAME, text }, ...(yes ? [{ at, by: 'System', text: `${c?.name ?? 'The contractor'} has the job. LSP will confirm the date.` }] : [])] } : x));
    s.setMe(l => ({ ...l, comms: [...l.comms, { id: 'cm' + Date.now(), at, by: ME_NAME, channel: 'Portal', dir: 'in', subject: `${yes ? 'Approved' : 'Declined'}: ${j.title}`, text: yes ? `I approve quote ${j.quoteNo} for ${j.title.toLowerCase()} at ${p.address}. I pay ${money(cv.pays)}${cv.covered ? ` and my plan covers ${money(cv.covered)}` : ''}.${note ? ' ' + note : ''}` : `I don't approve ${j.title.toLowerCase()} at ${p.address}. ${note}` }] }));
    s.log(`${yes ? 'Approved' : 'Declined'} ${j.title} at ${p.address} (${money(j.price)})`, 'Approvals');
    s.toast(yes ? `Approved. LSP books ${c?.name ?? 'the contractor'} now.` : 'Declined. Nothing is charged.'); setM('');
  };
  return <>
    <PageHeader crumbs={crumbsFor('approvals', s.go, j.title)} back={() => s.go('approvals')} title={j.title}
      action={waiting && <div className="flex"><Btn kind="ghost" icon={<MessageSquare size={16} />} onClick={() => setM('ask')}>Ask a question</Btn><Btn kind="outline" icon={<XCircle size={16} />} onClick={() => setM('no')}>Decline</Btn><Btn icon={<CheckCircle2 size={16} />} onClick={() => setM('yes')}>Approve · you pay {money(cv.pays)}</Btn></div>} />
    <DetailHead media={<span className="tile t-warn" style={{ width: 64, height: 64, borderRadius: 18 }}>{j.ownerRepair ? <KeyRound size={28} /> : <Wrench size={28} />}</span>} title={`${j.title} · ${money(j.price)}`}
      chips={<><Chip tone={jobView(j).tone}>{jobView(j).label}</Chip>{j.ownerRepair ? <Chip tone="brand" dot={false}>Owner repair · leased to LSP</Chip> : <Chip tone="warn" dot={false}>Over your job limit</Chip>}</>}
      meta={[['Home', p.address], ['Why you', whyMe(s, j)], ['Quote', `${j.quoteNo ?? '—'} · sent ${j.landlordAsk ?? '—'}`], ['Office Admin', adminName(s, j.admin)]]} />
    <div className="dgrid">
      <div className="col">
        <Card title={waiting ? 'What you pay if you approve' : 'Who pays'} sub={j.ownerRepair ? 'Owner repair under the lease. As the owner you pay all of it.' : cv.covered ? `Your ${s.me.plan}% plan covers ${money(cv.covered)} from your maintenance allowance. You pay the rest.` : 'Your plan does not cover this repair. You pay all of it.'}>
          <div className="covsplit"><div><span className="caption">Repair total</span><b>{money(j.price)}</b></div><div className="ok"><span className="caption">Your plan covers</span><b>{money(cv.covered)}</b></div><div className="you"><span className="caption">You pay</span><b>{money(cv.pays)}</b></div></div>
          <span className="caption">Nothing is charged until the work is done and LSP has checked it. Then it is taken from your next rent payout, or you pay by bank transfer.</span>
        </Card>
        <Card title="What's wrong" sub={`${homeType(p)} · ${j.area ?? j.category}`}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{j.note}</p>
          {j.photos?.length ? <div className="photos">{j.photos.map((x, i) => <div key={x} className="ph" style={{ backgroundImage: `url(images/home${(i % 3) + 1}.jpg)` }}><span>{x}</span></div>)}</div> : null}
          <KV rows={[['Reported by', j.by], ['Reported', j.reported], ['Type of work', j.category], ['Contractor', c ? `${c.name} · ${c.trade}` : 'LSP chooses one'], ['Checked by', `LSP, then approved by the Supervisor`]]} />
        </Card>
        <Card title={`Quote ${j.quoteNo ?? ''}`} sub="What you're asked to approve. The invoice comes after the work is done and checked." action={<Btn sm kind="ghost" icon={<Download size={14} />} onClick={() => downloadPdf(s, `Quote ${j.quoteNo}`)}>Download PDF</Btn>}>
          <DocSheet kind="QUOTE" to={{ label: 'Quote for', rows: [s.me.name, ...s.me.billing.split(', ')] }} site={`${p.address}, ${p.area}`} lines={lines}
            meta={[['Quote', j.quoteNo ?? '—'], ['Date', j.quoted ? ddmm(j.quoted.split(',')[0]) : '—'], ['Valid until', j.validUntil ? ddmm(j.validUntil) : '—'], ['Repair', j.id]]}
            foot={[['Quote total', '£' + num(j.price)], ['Covered by your plan', cv.covered ? '−£' + num(cv.covered) : '£0.00'], ['You pay', '£' + num(cv.pays)]]}
            stamp={waiting ? { text: 'FOR APPROVAL', tone: 'warn' } : j.status === 'Declined' ? { text: 'DECLINED', tone: 'info' } : { text: 'APPROVED', tone: 'ok' }}><p className="doc-note">{j.ownerRepair ? 'Owner repair under the lease. Work starts once you approve this quote.' : 'This repair is over your job limit, so we need your approval before any work starts. Your plan covers part of it and you pay the rest.'} Nothing is charged until the work is done and checked.</p></DocSheet>
        </Card>
        <Card title="History" sub="Every step, with the date and time."><Timeline items={[...j.events].reverse().map(e => ({ at: e.at, text: e.text, by: e.by }))} /></Card>
      </div>
      <div className="col">
        {waiting ? <ActionCard tone="warn" title="Your decision" text={`${money(j.price)} for ${j.title.toLowerCase()} at ${p.address}. ${j.ownerRepair ? 'Under the lease this is the owner\'s work, so you pay all of it.' : `This is over your ${money(limitOf(s))} job limit. Your plan covers ${money(cv.covered)}, so you pay ${money(cv.pays)}.`} Work starts only after you approve.`}>
          <Btn block icon={<CheckCircle2 size={16} />} onClick={() => setM('yes')}>Approve · you pay {money(cv.pays)}</Btn>
          <Btn block kind="outline" icon={<XCircle size={16} />} onClick={() => setM('no')}>Decline</Btn>
          <Btn block kind="ghost" icon={<MessageSquare size={16} />} onClick={() => setM('ask')}>Ask LSP a question</Btn></ActionCard>
          : <ActionCard tone={j.status === 'Declined' ? 'neutral' : 'ok'} title={j.status === 'Declined' ? 'You declined' : 'You approved'} text={mine ? `${mine.text}. ${mine.at}.` : j.status === 'Declined' ? j.declined : 'Approved.'}><Btn block kind="outline" icon={<ArrowRight size={16} />} onClick={() => s.go('repairs', id)}>Follow the repair</Btn></ActionCard>}
        <Card title="How you pay">
          <KV rows={[['Repair total', money(j.price)], ['Your plan covers', money(cv.covered)], ['You pay', money(cv.pays)], ['When', 'Only after the work is done and LSP has checked the photos'], ['How', 'Taken from your next rent payout, or by bank transfer'], ['If you decline', 'Nothing is charged. LSP tells the tenant.']]} />
        </Card>
        {!leased && !j.ownerRepair && <Card title="Your maintenance allowance" sub={cv.covered ? `Your plan covers ${money(cv.covered)} of this repair. It is taken from your allowance once, when the work is done.` : 'Your plan does not cover this repair, so it does not use the allowance.'}>
          <div className="flex between"><b>{money(al.left)} left</b><span className="caption">of {money(al.total)} · renews {al.renews}</span></div>
          <Bar value={Math.min(100, al.pctAll)} tone={allowTone(al.pctAll)} />
          <span className="caption">Used {money(al.used)} · approved, in progress {money(al.committed)}</span>
          <button className="btn ghost sm" onClick={() => s.go('plan')}>See my plan and allowance</button>
        </Card>}
        {leased && <Card title="Lease responsibilities" sub={`LSP leases this home from you.`}><KV rows={[['You (owner)', p.lease!.ownerDoes], ['LSP', p.lease!.lspDoes]]} /></Card>}
      </div>
    </div>
    {m === 'yes' && <ApproveModal amount={cv.pays} covered={cv.covered} total={j.price} title={j.title} onClose={() => setM('')} onDone={n => decide(true, n)} />}
    {m === 'no' && <Reason danger title="Decline this repair" sub="LSP is told straight away. Nothing is charged. They may come back to you with another option." cta="Decline" label="Why?" options={['Too expensive, please get another quote', 'I will arrange it myself', 'Not needed now, please wait', 'I would like to talk about it first']} onClose={() => setM('')} onDone={r => decide(false, r)} />}
    {m === 'ask' && <AskModal title="Ask LSP about this repair" about={`Question about ${j.title} (quote ${j.quoteNo})`} onClose={() => setM('')} onSent={t => s.setJobs(js => js.map(x => x.id === id ? { ...x, events: [...x.events, { at: nowStamp(), by: ME_NAME, text: `Asked a question: ${t}` }] } : x))} />}
  </>;
}

function ApproveModal({ amount, covered, total, title, onClose, onDone }: { amount: number; covered: number; total: number; title: string; onClose: () => void; onDone: (note: string) => void }) {
  const [ok, setOk] = useState(false); const [n, setN] = useState('');
  return <Modal title={`Approve and pay ${money(amount)}?`} sub={`For ${title.toLowerCase()}. Your decision is saved with the date and time.`} onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={<CheckCircle2 size={16} />} disabled={!ok} onClick={() => onDone(n.trim())}>Approve</Btn></>}>
    <label className="check" style={{ cursor: 'pointer' }}><input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} /> I approve this work. The total is {money(total)}{covered ? `, my plan covers ${money(covered)}` : ''} and I pay {money(amount)}. If the price or the work changes, LSP must ask me again.</label>
    <Field label="Note for LSP (optional)"><Area value={n} onChange={setN} placeholder="e.g. Please let me know the date" /></Field>
  </Modal>;
}
