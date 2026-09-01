import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/seo/Seo';

export default function CasesPage() {
  return <main className="min-h-[80vh] bg-[#F7F8FC] pb-20 pt-32"><Seo title="Cases | Nextia" description="Cases documentados de projetos e soluções desenvolvidos pela Nextia." path="/cases" noindex /><div className="mx-auto max-w-4xl px-5 text-center"><ShieldCheck className="mx-auto h-14 w-14 text-[#5B4FE9]" /><h1 className="mt-6 text-4xl font-black">Cases em documentação</h1><p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">Esta área será publicada quando houver contexto, evidências, autorização e resultados verificáveis. Não usamos métricas ou histórias fictícias.</p><Link to="/portfolio" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-[#5B4FE9] px-6 font-black text-white">Ver portfólio</Link></div></main>;
}
