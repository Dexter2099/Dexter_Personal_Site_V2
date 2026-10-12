import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '../ui/button';
import { ButtonUtility } from '../ui/button-utility';
import { TextArea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { sourceLinks, type Config, type Reply, type Source } from '../../scripts/portfolio-chat';

declare global {
  interface Window {
    turnstile?: { render: (node: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void };
  }
}
const suggestions = [
  'Why should we consider Dexter?',
  'What has Dexter been working on recently?',
  'What open-source projects has Dexter contributed to?',
  'How is Dexter’s hobby game development going?'
];
type Message = { id: string; text: string; visitor?: boolean; sources?: Source[] };
const arrow = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v15" /></svg>;
const outward = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>;

function Sources({ sources = [] }: { sources?: Source[] }) {
  const links = sourceLinks(sources);
  const reviewed = [...new Set(sources.map(source => source.reviewed).filter(Boolean))];
  if (!links.length && !reviewed.length) return null;
  return <details className="chat-source-details"><summary>Sources</summary>
    {!!links.length && <div className="chat-sources">{links.map(link => <a key={link.href} href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined}>{link.label}</a>)}</div>}
    {!!reviewed.length && <span className="chat-reviewed">Sources checked {reviewed.join(', ')}</span>}
  </details>;
}

export default function PortfolioChat() {
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const challenge = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const loadingConfig = useRef(false);
  const inFlight = useRef(false);
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<Config>();
  const [configError, setConfigError] = useState(false);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const canSend = !!config?.enabled && !!message.trim() && consent && !busy && (!config.siteKey || !!token);
  const status = busy ? 'Thinking…' : configError || config?.enabled === false ? 'Assistant unavailable · email Dexter below' : !config ? 'Connecting…' : config.mode === 'preview' ? 'Local preview · approved summaries, no OpenAI call' : '';

  useEffect(() => {
    if (!open) return;
    if (!dialog.current?.open) dialog.current?.showModal();
    if (!config && !loadingConfig.current) {
      loadingConfig.current = true;
      setConfigError(false);
      void fetch('/api/chat', { credentials: 'same-origin', signal: AbortSignal.timeout(8000) })
        .then(async response => { if (!response.ok) throw new Error('config'); setConfig(await response.json()); })
        .catch(() => setConfigError(true))
        .finally(() => { loadingConfig.current = false; });
    }
  }, [open]);

  useEffect(() => {
    function viewport() { dialog.current?.style.setProperty('--chat-viewport', `${window.visualViewport?.height ?? window.innerHeight}px`); }
    viewport(); window.visualViewport?.addEventListener('resize', viewport); window.addEventListener('resize', viewport);
    return () => { window.visualViewport?.removeEventListener('resize', viewport); window.removeEventListener('resize', viewport); };
  }, []);
  useEffect(() => { if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [messages, busy]);
  useEffect(() => {
    if (!input.current) return;
    input.current.style.height = 'auto';
    input.current.style.height = `${Math.min(input.current.scrollHeight, 112)}px`;
  }, [message, open]);

  useEffect(() => {
    if (!config?.siteKey) return;
    let disposed = false;
    function render() {
      if (disposed || widget.current || !challenge.current) return;
      widget.current = window.turnstile?.render(challenge.current, {
        sitekey: config!.siteKey, action: 'portfolio-chat', theme: 'dark',
        callback: (value: string) => setToken(value),
        'expired-callback': () => setToken(''), 'error-callback': () => setToken('')
      });
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true;
    script.onload = render;
    script.onerror = () => { if (!disposed) setError('Verification could not load. Please try later or email Dexter.'); };
    if (window.turnstile) render(); else document.head.append(script);
    return () => { disposed = true; if (widget.current) window.turnstile?.remove(widget.current); widget.current = undefined; script.remove(); };
  }, [config?.siteKey]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSend || inFlight.current) return;
    inFlight.current = true;
    const question = message.trim();
    setBusy(true); setError(''); setMessage('');
    setMessages(previous => [...previous, { id: crypto.randomUUID(), text: question, visitor: true }]);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, requestId: crypto.randomUUID(), challengeToken: token, consent: true }),
        signal: AbortSignal.timeout(25000)
      });
      const reply: Reply = await response.json();
      if (!response.ok) setError(reply.error ?? 'Please try later or email Dexter.');
      else setMessages(previous => [...previous, { id: crypto.randomUUID(), text: reply.text ?? 'Please email Dexter for more information.', sources: reply.sources }]);
    } catch { setError('The reply could not finish. Please try later or email Dexter.'); }
    finally {
      inFlight.current = false; setBusy(false); setToken('');
      if (widget.current) window.turnstile?.reset(widget.current);
      if (dialog.current?.open) input.current?.focus();
    }
  }
  function keyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault(); form.current?.requestSubmit();
    }
  }
  function close() { dialog.current?.close(); }

  return <div className="portfolio-chat" id="portfolio-chat">
    <Button ref={launcher} className="chat-launcher" color="secondary" aria-haspopup="dialog" aria-controls="chat-panel" aria-label="Ask about Dexter" onPress={() => setOpen(true)} iconLeading={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2Z" /><path d="M7 9h10M7 13h6" /></svg>}>Ask about Dexter</Button>
    <dialog ref={dialog} className={`chat-panel${messages.length ? ' has-conversation' : ''}`} id="chat-panel" aria-labelledby="chat-title" onClose={() => { setOpen(false); launcher.current?.focus(); }} onClick={event => {
      if (event.target !== dialog.current) return;
      const rect = dialog.current.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    }}>
      <header className="chat-header"><h2 id="chat-title">Ask about Dexter</h2><ButtonUtility className="chat-close" aria-label="Close chat" onPress={close} icon={<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>} /></header>
      <div className="chat-mode" role="status" hidden={!status}>{status}</div>
      <div ref={scroll} className="chat-scroll">
        {!messages.length && <section className="chat-welcome" aria-label="Start a conversation"><p>I’m Dexter’s website assistant. Ask me about his work.</p><div className="chat-suggestions">{suggestions.map(question => <Button key={question} color="secondary" iconTrailing={outward} onPress={() => { setMessage(question); input.current?.focus(); }}>{question}</Button>)}</div></section>}
        <div className="chat-transcript" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">{messages.map(item => <section key={item.id} className={`chat-message chat-message--${item.visitor ? 'visitor' : 'assistant'}`}><span className="sr-only">{item.visitor ? 'You: ' : 'Dexter’s assistant: '}</span><p>{item.text}</p><Sources sources={item.sources} /></section>)}</div>
      </div>
      <p className="chat-error" role="alert" hidden={!error}>{error}</p>
      <div ref={challenge} id="chat-challenge" />
      <form ref={form} className="chat-form" onSubmit={submit}>
        <TextArea label="Your question" name="message" textAreaRef={input} value={message} onChange={setMessage} maxLength={2000} isRequired placeholder="Ask about his experience…" onKeyDown={keyDown} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} action={<Button className="chat-send" type="submit" onPress={() => form.current?.requestSubmit()} aria-label={busy ? 'Waiting for reply' : 'Send question'} isDisabled={!canSend} isLoading={busy} iconLeading={arrow} />} />
        <div className="chat-input-meta" hidden={!focused && message.length < 1600}><span className="chat-keyboard-hint" hidden={!focused}>Enter to send · Shift + Enter for a new line</span><span className="chat-count" hidden={message.length < 1600}>{message.length.toLocaleString()} / 2,000</span></div>
        <details className="chat-privacy"><summary>Before you send · privacy & AI</summary><p>Submitted messages and replies are recorded for 90 days to help Dexter understand how this assistant is used. Messages are redacted where possible and sent to OpenAI; they may be used to improve its models. Please avoid sensitive, confidential, proprietary or children’s information. AI answers can be mistaken.</p></details>
        <Checkbox className="chat-consent" name="consent" isSelected={consent} onChange={setConsent} label="I agree to the recording and model-improvement use described above." />
      </form>
      <footer className="chat-footer"><span>Prefer a conversation?</span><Button color="link-color" href="mailto:dexter.mehta01@gmail.com" iconTrailing={outward}>Email Dexter</Button></footer>
    </dialog>
  </div>;
}
