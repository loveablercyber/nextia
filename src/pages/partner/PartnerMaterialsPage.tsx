import { useState } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { Download, FileImage, FileVideo, FileText, Smartphone, Layout } from 'lucide-react';

export default function PartnerMaterialsPage() {
  const { state } = usePartner();
  const { materials } = state;
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'stories', label: 'Stories' },
    { id: 'reels', label: 'Reels' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'video', label: 'Vídeos' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'logo', label: 'Logos' },
  ];

  const filteredMaterials = activeCategory === 'todos' 
    ? materials 
    : materials.filter(m => m.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'instagram':
      case 'facebook':
        return <Layout size={14} />;
      case 'stories':
      case 'reels':
      case 'whatsapp':
        return <Smartphone size={14} />;
      case 'video':
        return <FileVideo size={14} />;
      case 'pdf':
      case 'logo':
        return <FileImage size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'instagram': return 'from-purple-500/20 to-pink-500/20 border-pink-500/30 text-pink-400';
      case 'facebook': return 'from-blue-600/20 to-blue-400/20 border-blue-500/30 text-blue-400';
      case 'whatsapp': return 'from-green-500/20 to-emerald-400/20 border-green-500/30 text-green-400';
      case 'youtube':
      case 'video': return 'from-red-500/20 to-red-400/20 border-red-500/30 text-red-400';
      case 'pdf': return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30 text-orange-400';
      default: return 'from-gray-500/20 to-gray-400/20 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Central de Materiais</h2>
        <p className="text-gray-400">Baixe materiais de marketing prontos para usar nas suas campanhas e redes sociais.</p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-[#D4A853] text-black shadow-[0_0_15px_rgba(212,168,83,0.3)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMaterials.map((material) => {
          const colorClass = getCategoryColor(material.category);
          
          return (
            <div 
              key={material.id} 
              className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
            >
              {/* Thumbnail Placeholder */}
              <div className={`aspect-video w-full bg-gradient-to-br ${colorClass.split(' ').slice(0,2).join(' ')} relative flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className={`p-4 rounded-full bg-black/40 backdrop-blur-sm text-white/70 group-hover:scale-110 transition-transform ${colorClass.split(' ')[3]}`}>
                  {getCategoryIcon(material.category)}
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border bg-black/40 ${colorClass.split(' ').slice(2).join(' ')} capitalize`}>
                      {material.category}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">{material.fileType} • {material.fileSize}</span>
                  </div>
                  <h3 className="text-white font-medium line-clamp-2" title={material.title}>{material.title}</h3>
                </div>
                
                <a 
                  href={material.downloadUrl}
                  onClick={(e) => e.preventDefault()} // MOCK
                  className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm border border-white/5 hover:border-white/10 group/btn"
                >
                  <Download size={16} className="text-gray-400 group-hover/btn:text-white transition-colors" />
                  Download
                </a>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredMaterials.length === 0 && (
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <FileImage size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum material encontrado</h3>
          <p className="text-gray-400">Não há materiais disponíveis para a categoria selecionada.</p>
          <button 
            onClick={() => setActiveCategory('todos')}
            className="mt-6 text-[#D4A853] hover:underline"
          >
            Ver todos os materiais
          </button>
        </div>
      )}
    </div>
  );
};
