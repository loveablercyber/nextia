import { ArrowRight, Award, BedDouble, BookOpen, MapPin, ShoppingBag, Star, UsersRound, Utensils } from 'lucide-react';
import type { PreviewContent, SegmentPreset } from './acquisitionPresets';
import type { PreviewPage } from './PreviewSite';

type Props = {
  segment: string;
  businessName: string;
  content: PreviewContent;
  preset: SegmentPreset;
  primary: string;
  mobile: boolean;
  onPage: (page: PreviewPage) => void;
};

const metricSets: Record<string, Array<[string,string]>> = {
  contabilidade: [['12 anos','de experiência'],['+450','empresas atendidas'],['100%','atendimento digital']],
  advocacia: [['Atuação','consultiva e preventiva'],['Equipe','especializada'],['Contato','confidencial']],
};

function ServiceCards({ content, primary, columns = 3 }: { content: PreviewContent; primary: string; columns?: number }) {
  return <div className={`grid gap-3 ${columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>{content.services.slice(0,columns).map((service,index)=><article key={service.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-xs font-black" style={{color:primary}}>0{index+1}</span><strong className="mt-4 block">{service.title}</strong><p className="mt-2 text-sm leading-6 text-slate-500">{service.description}</p></article>)}</div>;
}

function CorporateSections({ segment, content, primary, mobile }: Props) {
  const legal = segment === 'advocacia';
  const metrics = metricSets[segment] || [];
  return <>
    <section className={`${mobile?'px-5 py-9':'px-10 py-12'} ${legal?'bg-[#17130f] text-white':'bg-white'}`}>
      <div className={`grid gap-7 ${mobile?'grid-cols-1':'grid-cols-[.75fr_1.25fr]'}`}><div><span className="text-xs font-black uppercase tracking-[.2em]" style={{color:primary}}>{legal?'Escritório':'Gestão contábil'}</span><h2 className={`${mobile?'text-2xl':'text-4xl'} mt-3 font-black`}>{content.aboutTitle}</h2></div><div><p className={`leading-7 ${legal?'text-stone-300':'text-slate-600'}`}>{content.aboutText}</p><div className={`mt-7 grid gap-3 ${mobile?'grid-cols-1':'grid-cols-3'}`}>{metrics.map(([value,label])=><div key={value} className={`rounded-2xl p-4 ${legal?'bg-white/5':'bg-slate-50'}`}><strong className="block text-lg" style={{color:primary}}>{value}</strong><span className={`mt-1 block text-xs ${legal?'text-stone-400':'text-slate-500'}`}>{label}</span></div>)}</div></div></div>
    </section>
    <section className={`${mobile?'px-5 py-9':'px-10 py-12'} bg-slate-50`}><div className="flex items-end justify-between gap-4"><div><span className="text-xs font-black uppercase tracking-[.2em]" style={{color:primary}}>{legal?'Áreas de atuação':'Soluções empresariais'}</span><h2 className="mt-2 text-2xl font-black">{content.servicesTitle}</h2></div><BookOpen className="h-8 w-8" style={{color:primary}}/></div><div className="mt-7"><ServiceCards content={content} primary={primary}/></div><div className="mt-7 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5"><Award className="h-8 w-8 shrink-0" style={{color:primary}}/><p className="text-sm leading-6 text-slate-600">Conteúdo técnico, atendimento responsável e informações organizadas para gerar confiança antes do primeiro contato.</p></div></section>
  </>;
}

function RestaurantSections({ content, preset, primary, mobile, onPage }: Props) {
  return <>
    <section className={`${mobile?'px-5 py-9':'px-10 py-12'} bg-[#fffaf3]`}><span className="text-xs font-black uppercase tracking-[.2em]" style={{color:primary}}>Cardápio em destaque</span><div className={`mt-6 grid gap-4 ${mobile?'grid-cols-1':'grid-cols-3'}`}>{content.services.map((service,index)=><article key={service.title} className="overflow-hidden rounded-3xl bg-white shadow-sm"><div className="h-36 bg-cover" style={{backgroundImage:`linear-gradient(180deg,transparent,rgba(0,0,0,.28)),url(${preset.image})`,backgroundPosition:`${20+index*30}% center`}}/><div className="p-5"><div className="flex items-center justify-between"><strong>{service.title}</strong><Utensils className="h-4 w-4" style={{color:primary}}/></div><p className="mt-2 text-xs leading-5 text-slate-500">{service.description}</p><span className="mt-4 block text-sm font-black" style={{color:primary}}>A partir de R$ 32</span></div></article>)}</div></section>
    <section className={`${mobile?'m-5 p-6':'m-10 grid grid-cols-[1fr_auto] items-center p-8'} rounded-3xl text-white`} style={{background:primary}}><div><span className="text-xs font-bold uppercase tracking-[.2em] text-white/70">Sua mesa está esperando</span><h2 className="mt-2 text-2xl font-black">Reserve ou peça sem precisar ligar</h2><p className="mt-2 text-sm text-white/80">Cardápio, reservas e atendimento reunidos em uma experiência rápida.</p></div><button onClick={()=>onPage('agendamento')} className={`${mobile?'mt-5 w-full':'ml-8'} rounded-xl bg-white px-5 py-3 text-sm font-black`} style={{color:primary}}>Reservar mesa</button></section>
  </>;
}

function HotelSections({ preset, primary, mobile, onPage }: Props) {
  return <><section className={`${mobile?'px-5 py-9':'px-10 py-12'} bg-[#f7faf5]`}><div className="flex items-end justify-between"><div><span className="text-xs font-black uppercase tracking-[.2em]" style={{color:primary}}>Acomodações</span><h2 className="mt-2 text-3xl font-black">Encontre o quarto ideal</h2></div><BedDouble className="h-8 w-8" style={{color:primary}}/></div><div className={`mt-7 grid gap-4 ${mobile?'grid-cols-1':'grid-cols-3'}`}>{['Suíte Jardim','Quarto Família','Suíte Panorâmica'].map((name,index)=><article key={name} className="overflow-hidden rounded-3xl bg-white shadow-sm"><div className="h-40 bg-cover" style={{backgroundImage:`url(${preset.image})`,backgroundPosition:`${15+index*35}% center`}}/><div className="p-5"><strong>{name}</strong><p className="mt-2 text-xs text-slate-500">Café da manhã · Wi-Fi · Ar-condicionado</p><button onClick={()=>onPage('agendamento')} className="mt-4 text-sm font-black" style={{color:primary}}>Ver disponibilidade →</button></div></article>)}</div></section><section className={`${mobile?'px-5 pb-9':'px-10 pb-12'}`}><div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-3">{[['Check-in','14:00'],['Avaliação','4,9 / 5'],['Localização','Área turística']].map(([label,value])=><div key={label} className="text-center"><span className="text-xs text-slate-500">{label}</span><strong className="mt-1 block">{value}</strong></div>)}</div></section></>;
}

function ClinicSections({ content, preset, primary, mobile }: Props) {
  return <section className={`${mobile?'px-5 py-9':'px-10 py-12'} bg-cyan-50/50`}><div className={`grid gap-7 ${mobile?'grid-cols-1':'grid-cols-[1fr_.9fr]'}`}><div><span className="text-xs font-black uppercase tracking-[.2em]" style={{color:primary}}>Especialidades e cuidado</span><h2 className="mt-3 text-3xl font-black">{content.servicesTitle}</h2><div className="mt-6"><ServiceCards content={content} primary={primary} columns={2}/></div></div><div className="overflow-hidden rounded-[2rem] bg-white shadow-lg"><div className="h-52 bg-cover" style={{backgroundImage:`url(${preset.image})`}}/><div className="p-6"><span className="flex items-center gap-2 text-xs font-black uppercase tracking-wide" style={{color:primary}}><UsersRound className="h-4 w-4"/>Equipe especializada</span><p className="mt-3 text-sm leading-6 text-slate-600">Conheça profissionais, especialidades, horários disponíveis e prepare seu atendimento pelo site.</p><div className="mt-4 flex gap-2">{['Dra. Ana','Dr. Paulo','Dra. Marina'].map(name=><span key={name} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold">{name}</span>)}</div></div></div></div></section>;
}

function BeautySections({ content, preset, primary, mobile, onPage }: Props) {
  return <><section className={`${mobile?'px-5 py-9':'px-10 py-12'}`}><span className="text-xs font-black uppercase tracking-[.2em]" style={{color:primary}}>Portfólio e especialistas</span><h2 className="mt-2 text-3xl font-black">Resultados que inspiram</h2><div className={`mt-7 grid gap-3 ${mobile?'grid-cols-2':'grid-cols-4'}`}>{[0,1,2,3].map(index=><div key={index} className={`${index===0&&!mobile?'col-span-2 row-span-2 h-[332px]':'h-40'} rounded-2xl bg-cover`} style={{backgroundImage:`url(${preset.image})`,backgroundPosition:`${index*30}% center`}}/>)}</div></section><section className={`${mobile?'px-5 pb-9':'px-10 pb-12'}`}><div className={`grid gap-4 ${mobile?'grid-cols-1':'grid-cols-[1fr_1fr_1fr_auto] items-center'} rounded-3xl bg-slate-950 p-6 text-white`}>{content.services.map(service=><div key={service.title}><strong className="text-sm">{service.title}</strong><span className="mt-1 block text-[11px] text-slate-400">A partir de 45 min</span></div>)}<button onClick={()=>onPage('agendamento')} className="rounded-xl px-5 py-3 text-sm font-black text-white" style={{background:primary}}>Agendar</button></div></section></>;
}

function ServiceSections({ content, primary, mobile }: Props) {
  return <><section className={`${mobile?'px-5 py-9':'px-10 py-12'} bg-slate-50`}><span className="text-xs font-black uppercase tracking-[.2em]" style={{color:primary}}>Como funciona</span><h2 className="mt-2 text-3xl font-black">Do pedido à entrega</h2><div className={`mt-7 grid gap-3 ${mobile?'grid-cols-1':'grid-cols-3'}`}>{content.services.map((service,index)=><article key={service.title} className="relative rounded-2xl border border-slate-200 bg-white p-5"><span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white" style={{background:primary}}>{index+1}</span><strong className="mt-4 block">{service.title}</strong><p className="mt-2 text-xs leading-5 text-slate-500">{service.description}</p>{index<2&&!mobile&&<ArrowRight className="absolute -right-5 top-7 z-10 h-5 w-5 text-slate-300"/>}</article>)}</div></section><section className={`${mobile?'px-5 pb-9':'px-10 pb-12'}`}><div className="rounded-3xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><MapPin className="h-6 w-6" style={{color:primary}}/><div><strong>Atendimento em toda a região</strong><p className="text-xs text-slate-500">Consulte disponibilidade para sua localização.</p></div></div></div></section></>;
}

function StoreSections({ content, preset, primary, mobile }: Props) {
  return <section className={`${mobile?'px-5 py-9':'px-10 py-12'} bg-rose-50/40`}><div className="flex items-end justify-between"><div><span className="text-xs font-black uppercase tracking-[.2em]" style={{color:primary}}>Catálogo</span><h2 className="mt-2 text-3xl font-black">Produtos selecionados</h2></div><ShoppingBag className="h-8 w-8" style={{color:primary}}/></div><div className={`mt-7 grid gap-4 ${mobile?'grid-cols-2':'grid-cols-4'}`}>{[...content.services,content.services[0]].map((service,index)=><article key={`${service.title}-${index}`} className="overflow-hidden rounded-2xl border border-rose-100 bg-white"><div className="h-32 bg-cover" style={{backgroundImage:`url(${preset.image})`,backgroundPosition:`${index*27}% center`}}/><div className="p-4"><strong className="block text-sm">{service.title}</strong><div className="mt-3 flex items-center justify-between"><span className="text-sm font-black" style={{color:primary}}>R$ {79+index*20},90</span><Star className="h-4 w-4 fill-amber-400 text-amber-400"/></div></div></article>)}</div></section>;
}

export default function SegmentHomeSections(props: Props) {
  if (props.segment === 'contabilidade' || props.segment === 'advocacia') return <CorporateSections {...props}/>;
  if (props.segment === 'restaurantes') return <RestaurantSections {...props}/>;
  if (props.segment === 'hoteis') return <HotelSections {...props}/>;
  if (props.segment === 'clinicas') return <ClinicSections {...props}/>;
  if (props.segment === 'saloes-de-beleza') return <BeautySections {...props}/>;
  if (props.segment === 'lojas') return <StoreSections {...props}/>;
  return <ServiceSections {...props}/>;
}
