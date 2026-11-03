import { useEffect, useState } from 'react';
import { Send, MessageSquare, Mail, Inbox, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '../store';
import { ME_NAME, LSP_PHONE, nowStamp, parseDate } from '../data';
import { Btn, Card, Chip, Empty, Field, Area, Select, Note, PageTabs, When, Avatar } from '../ui';
import { PageHeader, crumbsFor } from '../Shell';
import { myAdmin } from './lib';

const TOPICS = ['General', 'A repair', 'Rent or my statement', 'An invoice', 'Safety certificates', 'My plan', 'My tenant'];

export function Messages() {
  const s = useStore(); const admin = myAdmin(s);
  const [tab, setTab] = useState<'messages' | 'requests'>('messages');
  const [topic, setTopic] = useState(TOPICS[0]); const [text, setText] = useState('');
  const all = [...s.me.comms].sort((a, b) => parseDate(b.at).getTime() - parseDate(a.at).getTime());
  const unread = all.filter(c => c.by !== ME_NAME && !s.read.includes(c.id)).map(c => c.id);
  useEffect(() => { if (unread.length) { const t = setTimeout(() => s.markRead(unread), 1500); return () => clearTimeout(t); } }, [unread.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = () => {
    s.setMe(l => ({ ...l, comms: [...l.comms, { id: 'cm' + Date.now(), at: nowStamp(), by: ME_NAME, channel: 'Portal', dir: 'in', subject: topic, text: text.trim() }] }));
    s.log(`Sent a message: ${topic}`, 'Messages'); s.toast(`Sent to ${admin?.name ?? 'LSP'}`); setText('');
  };
  return <>
    <PageHeader crumbs={crumbsFor('messages', s.go)} title="Messages" />
    <PageTabs value={tab} onChange={setTab} items={[{ id: 'messages', label: 'Messages with LSP', count: all.length }, { id: 'requests', label: 'My requests', count: s.requests.length }]} />
    {tab === 'messages' && <div className="dgrid">
      <Card title="Conversation" sub="Emails and portal messages between you and LSP, newest first. Every message keeps its date and time.">
        {all.length ? <div className="divlist">{all.map(c => { const mine = c.by === ME_NAME; const isNew = unread.includes(c.id); return <div key={c.id} className="item" style={{ alignItems: 'flex-start' }}>
          {mine ? <Avatar name={ME_NAME} /> : <img className="avatar" src={admin?.photo ?? 'images/av3.jpg'} alt="" />}
          <div className="stack grow" style={{ gap: 4 }}>
            <div className="flex wrap" style={{ gap: 8 }}><b>{mine ? 'You' : c.by}</b><span className="caption">{c.channel === 'Email' ? <><Mail size={11} style={{ verticalAlign: -1 }} /> Email</> : 'Portal message'}</span>{isNew && <Chip tone="info">New</Chip>}</div>
            {c.subject && <b className="small" style={{ color: 'var(--text-primary)' }}>{c.subject}</b>}
            <span className="small" style={{ lineHeight: 1.55 }}>{c.text}</span>
          </div>
          <When at={c.at} />
        </div>; })}</div> : <Empty icon={<MessageSquare size={22} />}>No messages yet.</Empty>}
      </Card>
      <div className="col">
        <Card title="Send a message" sub={`Goes to ${admin?.name ?? 'LSP'}, your Office Admin. Replies come here and by email.`}>
          <Field label="About"><Select value={topic} onChange={setTopic} options={TOPICS.map(t => ({ value: t, label: t }))} /></Field>
          <Field label="Message"><Area value={text} onChange={setText} placeholder="Type your message" /></Field>
          <Btn icon={<Send size={16} />} disabled={!text.trim()} onClick={send}>Send</Btn>
        </Card>
        <Note>Emergency, like a leak or no heating? Call LSP on {LSP_PHONE}.</Note>
      </div>
    </div>}
    {tab === 'requests' && <Card title="My requests" sub="Things you asked LSP to change, like your plan or bank details. The Supervisor answers, and every answer keeps its date and time.">
      {s.requests.length ? <div className="divlist">{[...s.requests].sort((a, b) => parseDate(b.at).getTime() - parseDate(a.at).getTime()).map(q => <div key={q.id} className="item" style={{ alignItems: 'flex-start' }}>
        <span className={`tile ${q.status === 'Done' ? 't-ok' : q.status === 'Declined' ? 't-neutral' : 't-info'}`} style={{ width: 32, height: 32 }}>{q.status === 'Sent' ? <Clock size={15} /> : q.status === 'Done' ? <CheckCircle2 size={15} /> : <Inbox size={15} />}</span>
        <div className="stack grow" style={{ gap: 4 }}><b>{q.title}</b><span className="caption">{q.kind} · sent {q.at}</span><span className="small">{q.about}</span>{q.reply && <span className="small" style={{ color: 'var(--text-primary)' }}>LSP: {q.reply} <span className="caption">({q.answered})</span></span>}</div>
        <Chip tone={q.status === 'Done' ? 'ok' : q.status === 'Declined' ? 'neutral' : 'info'}>{q.status === 'Sent' ? 'Waiting for LSP' : q.status}</Chip>
      </div>)}</div> : <Empty icon={<Inbox size={22} />}>No requests yet.</Empty>}
      <span className="caption">Make a request from My Plan (change plan) or Account & Settings (bank or contact details).</span>
    </Card>}
  </>;
}
