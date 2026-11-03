import { useState } from 'react';
import { User, Landmark, ShieldCheck, Pencil, Send, KeyRound, LogOut, FileText } from 'lucide-react';
import { useStore } from '../store';
import { nowStamp, LSP_PHONE } from '../data';
import { Btn, Card, Chip, Field, KV, Modal, Note, Text, Area, Avatar } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { myAdmin } from './lib';

export function Account() {
  const s = useStore();
  const [m, setM] = useState<'' | 'details' | 'bank' | 'password' | 'end'>('');
  const [prefs, setPrefs] = useState({ email: true, sms: true, statements: true, certs: true, approvals: true, allowance: true });
  const bankWaiting = s.requests.find(r => r.kind === 'Bank details' && r.status === 'Sent');
  const toggle = (k: keyof typeof prefs, label: string) => { setPrefs(p => ({ ...p, [k]: !p[k] })); s.log(`${prefs[k] ? 'Turned off' : 'Turned on'}: ${label}`, 'Account'); s.toast('Saved'); };
  const Pref = ({ k, label, sub, locked }: { k: keyof typeof prefs; label: string; sub: string; locked?: boolean }) => <label className="item" style={{ cursor: locked ? 'default' : 'pointer' }}><div className="stack grow"><b>{label}</b><span className="caption">{sub}</span></div>{locked ? <Chip tone="neutral" dot={false}>Always on</Chip> : <input type="checkbox" checked={prefs[k]} onChange={() => toggle(k, label)} aria-label={label} />}</label>;
  return <>
    <PageHeader crumbs={crumbsFor('account', s.go)} title="Account & Settings" />
    <div className="grid g2">
      <Card title="Your details" action={<Btn sm kind="ghost" icon={<Pencil size={14} />} onClick={() => setM('details')}>Edit</Btn>}>
        <div className="flex"><Avatar name={s.me.name} size="lg" /><div className="stack"><b style={{ fontSize: 15 }}>{s.me.name}</b><span className="caption">Landlord with LSP since {s.me.start}</span></div></div>
        <KV rows={[['Email', s.me.email], ['Phone', s.me.phone], ['Billing address', s.me.billing], ['Office Admin', myAdmin(s)?.name ?? 'LSP']]} />
      </Card>
      <Card title="Bank account for payouts" action={<Btn sm kind="ghost" icon={<Send size={14} />} disabled={!!bankWaiting} onClick={() => setM('bank')}>{bankWaiting ? 'Change requested' : 'Ask to change'}</Btn>}>
        <div className="flex"><span className="tile t-brand"><Landmark size={18} /></span><div className="stack"><b>{s.me.bank}</b><span className="caption">Rent payouts on the 20th · lease rent from LSP</span></div></div>
        <Note>To keep your money safe, LSP checks every bank change with you by phone before any payout goes to a new account.</Note>
        {bankWaiting && <Note tone="ok">Change requested on {bankWaiting.at}. LSP will call you to check it.</Note>}
      </Card>
      <Card title="Notifications" sub="How LSP tells you about things. Emails come from LSP's Outlook.">
        <div className="divlist">
          <Pref k="approvals" label="Repairs that need my approval" sub="Email and a reminder if I haven't replied" locked />
          <Pref k="allowance" label="Maintenance allowance alerts" sub="At 70%, 90% and 100% used" locked />
          <Pref k="statements" label="Monthly statement" sub="Email when it's ready" />
          <Pref k="certs" label="Certificate reminders" sub="Before a safety certificate ends" />
          <Pref k="sms" label="Text messages" sub={`Urgent things only, to ${s.me.phone}`} />
        </div>
      </Card>
      <Card title="Sign-in and security">
        <KV rows={[['Sign-in email', s.me.email], ['Password', 'Last changed 1 Apr 2026'], ['Security code', `Texted to the phone ending ${s.me.phone.slice(-4)}`]]} />
        <div className="flex wrap"><Btn sm kind="outline" icon={<KeyRound size={14} />} onClick={() => setM('password')}>Change password</Btn><Btn sm kind="ghost" icon={<LogOut size={14} />} onClick={() => { s.log('Signed out of all other devices', 'Account'); s.toast('Signed out of other devices'); }}>Sign out other devices</Btn></div>
        <span className="caption"><ShieldCheck size={12} style={{ verticalAlign: -2 }} /> Five wrong codes lock the account. Call {LSP_PHONE} to unlock it.</span>
      </Card>
      <Card title="Your agreement" sub="Your management agreement and your rights.">
        <div className="lrow"><FileText size={18} color="var(--text-brand)" /><div className="stack grow"><b>Management agreement · {s.me.plan}% plan</b><span className="caption">Signed {s.me.start}</span></div><Btn sm kind="ghost" onClick={() => s.go('documents')}>Documents</Btn></div>
        <div className="flex wrap"><Btn sm kind="ghost" onClick={() => { s.log('Asked for a copy of my data', 'Account'); s.toast('Request sent. LSP will email your data.'); }}>Ask for a copy of my data</Btn><Btn sm kind="ghost" onClick={() => setM('end')}>Ask to end the agreement</Btn></div>
      </Card>
      <Card title="Help"><span className="small">Questions? Message {myAdmin(s)?.name ?? 'LSP'} from Messages, or call LSP on {LSP_PHONE}, Monday to Friday, 9am to 5:30pm.</span><Btn sm kind="outline" icon={<User size={14} />} onClick={() => s.go('messages')}>Open Messages</Btn></Card>
    </div>
    {m === 'details' && <EditDetails onClose={() => setM('')} />}
    {m === 'bank' && <BankChange onClose={() => setM('')} />}
    {m === 'password' && <Modal title="Change password" sub="At least 10 characters, with a number and a capital letter." onClose={() => setM('')} footer={<><Btn kind="outline" onClick={() => setM('')}>Cancel</Btn><Btn onClick={() => { s.log('Changed your password', 'Account'); s.toast('Password changed'); setM(''); }}>Save</Btn></>}>
      <Field label="Current password"><input className="input" type="password" defaultValue="••••••••••" /></Field><Field label="New password"><input className="input" type="password" /></Field><Field label="Type it again"><input className="input" type="password" /></Field></Modal>}
    {m === 'end' && <EndRequest onClose={() => setM('')} />}
  </>;
}

function EditDetails({ onClose }: { onClose: () => void }) {
  const s = useStore(); const [f, setF] = useState({ phone: s.me.phone, billing: s.me.billing, email: s.me.email });
  return <Modal title="Edit your details" sub="Phone and address change straight away. A new email needs checking first, so LSP confirms it." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn onClick={() => {
      s.setMe(l => ({ ...l, phone: f.phone, billing: f.billing }));
      if (f.email !== s.me.email) s.setRequests(rs => [{ id: 'LR' + Date.now(), kind: 'Contact details', title: 'Change my email address', about: `New email: ${f.email}`, at: nowStamp(), status: 'Sent' }, ...rs]);
      s.log(`Updated your details${f.email !== s.me.email ? ' and asked to change your email' : ''}`, 'Account'); s.toast(f.email !== s.me.email ? 'Saved. LSP will confirm the new email.' : 'Saved'); onClose();
    }}>Save</Btn></>}>
    <Field label="Email"><Text value={f.email} onChange={v => setF({ ...f, email: v })} /></Field>
    <Field label="Phone"><Text value={f.phone} onChange={v => setF({ ...f, phone: v })} /></Field>
    <Field label="Billing address"><Text value={f.billing} onChange={v => setF({ ...f, billing: v })} /></Field>
  </Modal>;
}

function BankChange({ onClose }: { onClose: () => void }) {
  const s = useStore(); const [f, setF] = useState({ name: s.me.name, bank: '', sort: '', acc: '' });
  return <Modal title="Ask to change your bank account" sub="Nothing changes until LSP has called you to check it. Payouts keep going to your current account until then." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn icon={<Send size={16} />} disabled={!f.bank || f.sort.length < 6 || f.acc.length < 8} onClick={() => {
      s.setRequests(rs => [{ id: 'LR' + Date.now(), kind: 'Bank details', title: 'Change the bank account for payouts', about: `${f.bank}, account ending ${f.acc.slice(-4)}.`, at: nowStamp(), status: 'Sent' }, ...rs]);
      s.log(`Asked to change your bank account to ${f.bank} ending ${f.acc.slice(-4)}`, 'Account'); s.toast('Sent. LSP will call you to check it.'); onClose();
    }}>Send request</Btn></>}>
    <Field label="Name on the account"><Text value={f.name} onChange={v => setF({ ...f, name: v })} /></Field>
    <div className="grid g3"><Field label="Bank"><Text value={f.bank} onChange={v => setF({ ...f, bank: v })} placeholder="e.g. Lloyds" /></Field><Field label="Sort code"><Text value={f.sort} onChange={v => setF({ ...f, sort: v.replace(/\D/g, '').slice(0, 6) })} placeholder="000000" /></Field><Field label="Account number"><Text value={f.acc} onChange={v => setF({ ...f, acc: v.replace(/\D/g, '').slice(0, 8) })} placeholder="8 digits" /></Field></div>
  </Modal>;
}

function EndRequest({ onClose }: { onClose: () => void }) {
  const s = useStore(); const [why, setWhy] = useState('');
  return <Modal title="Ask to end your agreement" sub="LSP will call you to talk it through. Your notice period is in your agreement." onClose={onClose}
    footer={<><Btn kind="outline" onClick={onClose}>Cancel</Btn><Btn kind="danger" disabled={!why.trim()} onClick={() => {
      s.setRequests(rs => [{ id: 'LR' + Date.now(), kind: 'End the agreement', title: 'End my management agreement', about: why.trim(), at: nowStamp(), status: 'Sent' }, ...rs]);
      s.log('Asked to end the management agreement', 'Account'); s.toast('Sent. LSP will call you.'); onClose();
    }}>Send request</Btn></>}>
    <Field label="Why? (required)"><Area value={why} onChange={setWhy} placeholder="Tell LSP why you'd like to end it" /></Field>
  </Modal>;
}
