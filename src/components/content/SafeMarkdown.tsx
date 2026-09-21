import { Fragment, type ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if ((match.index || 0) > cursor) nodes.push(text.slice(cursor, match.index));
    if (match[1]) {
      const href = match[2];
      const safe = href.startsWith('/') || href.startsWith('https://') || href.startsWith('mailto:');
      nodes.push(safe ? <a key={`${match.index}-${href}`} href={href} rel={href.startsWith('https://') ? 'noreferrer' : undefined} className="font-bold text-[#5145D7] underline decoration-violet-200 underline-offset-4">{match[1]}</a> : match[1]);
    } else nodes.push(<strong key={match.index}>{match[3]}</strong>);
    cursor = (match.index || 0) + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export default function SafeMarkdown({ content }: { content: string }) {
  const lines = String(content || '').split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    blocks.push(<ul key={`list-${blocks.length}`} className="my-5 list-disc space-y-2 pl-6">{list.map((item, index) => <li key={index}>{inline(item)}</li>)}</ul>);
    list = [];
  };
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (/^[-*]\s+/.test(trimmed)) { list.push(trimmed.replace(/^[-*]\s+/, '')); return; }
    flushList();
    if (!trimmed) return;
    if (trimmed.startsWith('### ')) blocks.push(<h3 key={index} className="mb-3 mt-8 text-xl font-black">{inline(trimmed.slice(4))}</h3>);
    else if (trimmed.startsWith('## ')) blocks.push(<h2 key={index} className="mb-4 mt-10 text-2xl font-black sm:text-3xl">{inline(trimmed.slice(3))}</h2>);
    else if (trimmed.startsWith('# ')) blocks.push(<h2 key={index} className="mb-4 mt-10 text-3xl font-black">{inline(trimmed.slice(2))}</h2>);
    else if (trimmed.startsWith('> ')) blocks.push(<blockquote key={index} className="my-6 border-l-4 border-violet-400 bg-violet-50 p-5 text-slate-700">{inline(trimmed.slice(2))}</blockquote>);
    else blocks.push(<p key={index} className="my-4 leading-8 text-slate-700">{inline(trimmed)}</p>);
  });
  flushList();
  return <Fragment>{blocks}</Fragment>;
}
