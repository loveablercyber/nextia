import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Badge from '../components/ui/Badge';
import TemplateCard from '../components/templates/TemplateCard';
import { templates, templateCategories } from '../data/templates';

export default function TemplatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('categoria') || 'todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Sites Prontos — Nextia';
  }, []);

  const filtered = templates.filter(t => {
    const matchesCategory = activeCategory === 'todos' || t.categorySlug === activeCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
      || t.category.toLowerCase().includes(searchQuery.toLowerCase())
      || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategory = (slug: string) => {
    setActiveCategory(slug);
    if (slug !== 'todos') {
      setSearchParams({ categoria: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-[#0f0c29] to-[#1E1B4B] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="primary" size="md" className="mb-4">Catálogo completo</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Todos os modelos
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Escolha o modelo ideal para o seu segmento e tenha seu site profissional no ar em poucos dias.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Busque por segmento ou tipo de negócio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {templateCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.slug
                  ? 'bg-[#5B4FE9] text-white shadow-md shadow-[#5B4FE9]/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#5B4FE9] hover:text-[#5B4FE9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            <span className="font-semibold text-gray-900">{filtered.length}</span> modelo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <SlidersHorizontal className="w-4 h-4" />
            Ordenar
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum modelo encontrado</h3>
            <p className="text-gray-500 mb-6">Tente uma busca diferente ou veja todos os modelos.</p>
            <button
              onClick={() => { setSearchQuery(''); handleCategory('todos'); }}
              className="text-[#5B4FE9] font-semibold hover:underline"
            >
              Ver todos os modelos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
