import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Template } from '../../data/templates';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { TemplateIllustration } from './TemplateIllustration';

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover group flex flex-col">
      {/* Cover Image / Illustration */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#eef2ff] to-[#f5f3ff] aspect-[16/10]">
        <TemplateIllustration category={template.categorySlug} />
        {template.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant="gradient">{template.badge}</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <Link
            to={`/templates/${template.slug}`}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white text-[#5B4FE9] font-semibold px-4 py-2 rounded-xl text-sm shadow-lg"
          >
            Ver detalhes
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <Badge variant="primary" size="sm">{template.category}</Badge>
            <h3 className="text-gray-900 font-bold text-lg mt-2 leading-tight">{template.name}</h3>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4 leading-relaxed">{template.shortDescription}</p>

        {/* Features preview */}
        <ul className="space-y-1 mb-4 flex-1">
          {template.features.slice(0, 4).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                </svg>
              </span>
              {f}
            </li>
          ))}
          {template.features.length > 4 && (
            <li className="text-xs text-gray-400 pl-6">+{template.features.length - 4} recursos incluídos</li>
          )}
        </ul>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-xs text-gray-400 ml-1">({template.testimonials.length} avaliações)</span>
        </div>

        {/* Price */}
        <div className="border-t border-gray-50 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs text-gray-400">a partir de</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900">R$ {template.price}</span>
                <span className="text-sm text-gray-400">/mês</span>
              </div>
              <span className="text-xs text-gray-400">Taxa de ativação: R$ {template.activationFee}</span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              ~{template.estimatedDays} dias
            </span>
          </div>
          <div className="flex gap-2">
            <Link to={`/templates/${template.slug}`} className="flex-1">
              <Button variant="outline" size="sm" fullWidth>Ver modelo</Button>
            </Link>
            <Link to={`/cadastro?template=${template.slug}&plano=${template.recommendedPlan.toLowerCase()}`} className="flex-1">
              <Button variant="primary" size="sm" fullWidth>Escolher</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
