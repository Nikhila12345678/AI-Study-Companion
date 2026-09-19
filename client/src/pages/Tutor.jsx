import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useDispatch } from 'react-redux';
import { pushToast } from '../store/uiSlice';
import { Send, Sparkles, FileText, AlertCircle, Plus, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Tutor() {
  const { projectId } = useParams();
  const [conversations, setConversations] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const dispatch = useDispatch();

  const loadConversations = async () => {
    const res = await api.get(`/projects/${projectId}/conversations`);
    setConversations(res.data.conversations);
    if (!activeId && res.data.conversations.length) setActiveId(res.data.conversations[0]._id);
  };

  useEffect(() => { loadConversations(); }, [projectId]);

  useEffect(() => {
    if (!activeId) return;
    api.get(`/conversations/${activeId}/messages`).then((res) => setMessages(res.data.messages));
  }, [activeId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startConversation = async () => {
    const res = await api.post(`/projects/${projectId}/conversations`);
    setActiveId(res.data.conversation._id);
    setMessages([]);
    loadConversations();
  };

  const send = async (content) => {
    if (!content.trim()) return;
    let conversationId = activeId;
    if (!conversationId) {
      const res = await api.post(`/projects/${projectId}/conversations`);
      conversationId = res.data.conversation._id;
      setActiveId(conversationId);
    }
    setMessages((prev) => [...prev, { _id: 'temp-' + Date.now(), role: 'user', content }]);
    setInput('');
    setSending(true);
    try {
      const res = await api.post(`/conversations/${conversationId}/messages`, { content });
      setMessages((prev) => [...prev.filter((m) => !String(m._id).startsWith('temp-')), res.data.userMessage, res.data.assistantMessage]);
      loadConversations();
    } catch (err) {
      dispatch(pushToast({ type: 'error', message: err.message }));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-13rem)] rounded-2xl border border-brand-100 bg-white overflow-hidden shadow-soft">
      <aside className="w-60 border-r border-brand-100 flex flex-col">
        <button onClick={startConversation} className="m-3 btn btn-sm bg-brand-50 hover:bg-brand-100 text-brand-700 border-none gap-1.5">
          <Plus size={14} /> New chat
        </button>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations?.map((c) => (
            <button key={c._id} onClick={() => setActiveId(c._id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate flex items-center gap-2 ${activeId === c._id ? 'bg-brand-500 text-white' : 'text-ink/70 hover:bg-brand-50'}`}>
              <MessageSquare size={13} className="shrink-0" /> {c.title}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-ink/50">
              <div className="w-12 h-12 rounded-full bg-tutor-light text-tutor-dark flex items-center justify-center mb-3">
                <Sparkles size={22} />
              </div>
              <p className="max-w-xs text-sm">Ask about anything in your uploaded materials — I'll cite exactly where the answer comes from.</p>
            </div>
          )}
          {messages.map((m) => <MessageBubble key={m._id} message={m} onFollowUp={send} />)}
          {sending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-4 border-t border-brand-100 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the Tutor a question…" className="input input-bordered flex-1" disabled={sending} />
          <button className="btn bg-brand-500 hover:bg-brand-600 text-white border-none" disabled={sending}><Send size={16} /></button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message, onFollowUp }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser ? 'bg-brand-500 text-white' : message.grounded === false ? 'bg-mastery-mid/10 border border-mastery-mid/30' : 'bg-brand-50'}`}>
        {!isUser && message.grounded === false && (
          <div className="flex items-center gap-1.5 text-mastery-dark text-xs font-medium mb-1.5">
            <AlertCircle size={13} /> Insufficient evidence
          </div>
        )}
        <div className="text-sm leading-7 text-ink prose prose-sm max-w-none">
         <ReactMarkdown remarkPlugins={[remarkGfm]}>
           {message.content}
          </ReactMarkdown>
        </div>

        {message.citations?.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {message.citations.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-white/70 rounded-lg px-2.5 py-1.5">
                <FileText size={13} className="text-brand-500 mt-0.5 shrink-0" />
                <span className="text-ink/70"><span className="font-medium">{c.materialName}</span> · p.{c.page}</span>
              </div>
            ))}
          </div>
        )}

        {message.suggestedFollowUps?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.suggestedFollowUps.map((f, i) => (
              <button key={i} onClick={() => onFollowUp(f)} className="text-xs px-2.5 py-1 rounded-full border border-brand-300 text-brand-600 hover:bg-brand-100">
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-brand-50 rounded-2xl px-4 py-3 flex gap-1">
        {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
    </div>
  );
}
