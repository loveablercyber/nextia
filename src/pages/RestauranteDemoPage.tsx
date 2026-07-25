import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Calendar, MessageSquare, Search,
  CheckCircle2, X, Phone, Award,
  Send, Star, ArrowLeft, ShieldCheck, Check,
  Layers, ChevronDown, ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';

// 1. Language Dictionary
const translations = {
  pt: {
    title: "Sabor & Arte",
    subtitle: "Experiência gastronômica única no coração da cidade",
    navMenu: "Cardápio",
    navReservations: "Reservas",
    navAbout: "Sobre Nós",
    navContact: "Contato",
    heroBtnMenu: "Ver Cardápio",
    heroBtnReserve: "Fazer Reserva",
    optionalBadge: "Recurso Opcional",
    menuTitle: "Nosso Cardápio Especial",
    menuSubtitle: "Pratos preparados com ingredientes frescos e selecionados por nosso chef executivo.",
    reserveTitle: "Agende sua Mesa",
    reserveSubtitle: "Garanta uma experiência gastronômica memorável sem filas.",
    cartTitle: "Seu Pedido",
    cartSubtotal: "Subtotal",
    cartDelivery: "Entrega (Simulada)",
    cartTotal: "Total do Pedido",
    checkoutBtn: "Finalizar Pedido (Integração PDV)",
    loyaltyTitle: "Clube de Fidelidade",
    loyaltySubtitle: "Acumule pontos em cada visita e troque por recompensas exclusivas.",
    loyaltyPhoneLabel: "Insira seu WhatsApp para consultar pontos:",
    loyaltyCheckBtn: "Consultar Saldo",
    loyaltyPoints: "Seus Pontos",
    whatsappBtn: "Atendimento WhatsApp",
  },
  en: {
    title: "Flavor & Art",
    subtitle: "Unique gastronomic experience in the heart of the city",
    navMenu: "Menu",
    navReservations: "Reservations",
    navAbout: "About Us",
    navContact: "Contact",
    heroBtnMenu: "View Menu",
    heroBtnReserve: "Book Table",
    optionalBadge: "Optional Feature",
    menuTitle: "Our Special Menu",
    menuSubtitle: "Dishes prepared with fresh, hand-picked ingredients by our executive chef.",
    reserveTitle: "Book Your Table",
    reserveSubtitle: "Ensure a memorable dining experience without waiting in line.",
    cartTitle: "Your Order",
    cartSubtotal: "Subtotal",
    cartDelivery: "Delivery (Simulated)",
    cartTotal: "Order Total",
    checkoutBtn: "Place Order (POS Integration)",
    loyaltyTitle: "Loyalty Club",
    loyaltySubtitle: "Earn points with every visit and redeem exclusive rewards.",
    loyaltyPhoneLabel: "Enter your WhatsApp to check points:",
    loyaltyCheckBtn: "Check Balance",
    loyaltyPoints: "Your Points",
    whatsappBtn: "WhatsApp Support",
  },
  es: {
    title: "Sabor & Arte",
    subtitle: "Experiencia gastronómica única en el corazón de la ciudad",
    navMenu: "Menú",
    navReservations: "Reservas",
    navAbout: "Sobre Nosotros",
    navContact: "Contacto",
    heroBtnMenu: "Ver Menú",
    heroBtnReserve: "Reservar Mesa",
    optionalBadge: "Recurso Opcional",
    menuTitle: "Nuestro Menú Especial",
    menuSubtitle: "Platos preparados con ingredientes frescos y seleccionados por nuestro chef ejecutivo.",
    reserveTitle: "Reserve su Mesa",
    reserveSubtitle: "Asegure una experiencia gastronómica memorable sin esperas.",
    cartTitle: "Su Pedido",
    cartSubtotal: "Subtotal",
    cartDelivery: "Entrega (Simulada)",
    cartTotal: "Total del Pedido",
    checkoutBtn: "Finalizar Pedido (Integración POS)",
    loyaltyTitle: "Club de Fidelidad",
    loyaltySubtitle: "Acumule puntos con cada visita y canjee recompensas exclusivas.",
    loyaltyPhoneLabel: "Ingrese su WhatsApp para consultar puntos:",
    loyaltyCheckBtn: "Consultar Saldo",
    loyaltyPoints: "Sus Puntos",
    whatsappBtn: "Soporte WhatsApp",
  }
};

interface MenuItem {
  id: string;
  name: { pt: string; en: string; es: string };
  description: { pt: string; en: string; es: string };
  price: number;
  image: string;
  category: 'principais' | 'bebidas' | 'sobremesas';
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dish-1',
    name: { pt: 'Risoto de Funghi Secchi', en: 'Wild Mushroom Risotto', es: 'Risotto de Funghi Secchi' },
    description: {
      pt: 'Arroz arbóreo cremoso com cogumelos funghi hidratados e parmesão importado.',
      en: 'Creamy arborio rice with wild mushrooms and imported parmesan cheese.',
      es: 'Arroz arbóreo cremoso con champiñones funghi secos y queso parmesano importado.'
    },
    price: 68,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=300&auto=format&fit=crop',
    category: 'principais'
  },
  {
    id: 'dish-2',
    name: { pt: 'Tapa de Cuadril Grillada', en: 'Grilled Ribeye Steak', es: 'Tapa de Cuadril Grillada' },
    description: {
      pt: 'Corte nobre grelhado na brasa, servido com legumes tostados e chimichurri artesanal.',
      en: 'Premium wood-fired cut, served with roasted vegetables and artisan chimichurri.',
      es: 'Corte noble asado a la parrilla, servido con verduras tostadas y chimichurri artesanal.'
    },
    price: 89,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300&auto=format&fit=crop',
    category: 'principais'
  },
  {
    id: 'dish-3',
    name: { pt: 'Salmão Grelhado com Ervas', en: 'Herb Grilled Salmon', es: 'Salmón Grelhado con Hierbas' },
    description: {
      pt: 'Filé de salmão fresco selado, acompanhado de purê de mandioquinha ao perfume de limão siciliano.',
      en: 'Seared fresh salmon fillet, accompanied by cassava puree scented with Sicilian lemon.',
      es: 'Filete de salmón fresco sellado, acompañado de puré de mandioca al aroma de limón siciliano.'
    },
    price: 78,
    image: 'https://images.unsplash.com/photo-1485921325814-a5add4af763e?q=80&w=300&auto=format&fit=crop',
    category: 'principais'
  },
  {
    id: 'dish-4',
    name: { pt: 'Vinho Tinto Reserve Malbec', en: 'Reserve Malbec Red Wine', es: 'Vino Tinto Reserve Malbec' },
    description: {
      pt: 'Garrafa de vinho encorpado com notas de frutas vermelhas e amadurecimento em carvalho.',
      en: 'Full-bodied bottle of red wine with red fruit notes and oak aging.',
      es: 'Botella de vino tinto con cuerpo con notas de frutas rojas y crianza en roble.'
    },
    price: 120,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=300&auto=format&fit=crop',
    category: 'bebidas'
  },
  {
    id: 'dish-5',
    name: { pt: 'Suco Natural de Frutas Vermelhas', en: 'Fresh Berry Juice', es: 'Jugo Natural de Frutos Rojos' },
    description: {
      pt: 'Suco refrescante de morango, amora e framboesa natural sem conservantes.',
      en: 'Refreshing natural juice of fresh strawberry, blackberry, and raspberry.',
      es: 'Jugo refrescante de fresa, mora y frambuesa natural sin conservantes.'
    },
    price: 16,
    image: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=300&auto=format&fit=crop',
    category: 'bebidas'
  },
  {
    id: 'dish-6',
    name: { pt: 'Petit Gâteau Premium', en: 'Premium Petit Gateau', es: 'Petit Gâteau Premium' },
    description: {
      pt: 'Bolinho quente de chocolate belga, recheio cremoso e sorvete artesanal de baunilha.',
      en: 'Warm Belgian chocolate cake, chocolate lava center, and artisan vanilla ice cream.',
      es: 'Bizcocho tibio de chocolate belga, relleno cremoso y helado artesanal de vainilla.'
    },
    price: 28,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=300&auto=format&fit=crop',
    category: 'sobremesas'
  }
];

export default function RestauranteDemoPage() {
  const [lang, setLang] = useState<'pt' | 'en' | 'es'>('pt');
  const t = translations[lang];

  // 2. Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(1);

  // 3. Reservation State
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    date: '', time: '19:00', size: '2', name: '', email: '', phone: ''
  });
  const [reservationSuccess, setReservationSuccess] = useState(false);

  // 4. Cart / Delivery State
  const [cart, setCart] = useState<Array<{ item: MenuItem; qty: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // 5. Loyalty State
  const [loyaltyPhone, setLoyaltyPhone] = useState('');
  const [loyaltyData, setLoyaltyData] = useState<{ points: number; coupon: string | null } | null>(null);

  // Initialize Chat Bot welcome message
  useEffect(() => {
    setChatMessages([
      {
        sender: 'bot',
        text: lang === 'pt'
          ? 'Olá! Seja bem-vindo ao Sabor & Arte. Eu sou sua assistente virtual. Como posso lhe ajudar hoje? Selecione uma das perguntas ou escreva no chat.'
          : lang === 'en'
            ? 'Hello! Welcome to Flavor & Art. I am your virtual assistant. How can I help you today? Select one of the quick questions below.'
            : '¡Hola! Bienvenido a Sabor & Arte. Soy tu asistente virtual. ¿Cómo puedo ayudarte hoy? Selecciona una de las perguntas rápidas.'
      }
    ]);
  }, [lang]);

  const handleBotQuickReply = (question: string, reply: string) => {
    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: question },
      { sender: 'bot', text: reply }
    ]);
  };

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setUnreadCount(0);
  };

  // Add to Cart helper
  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { item, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.item.price * item.qty), 0);
  const cartTotal = cartSubtotal + (cartSubtotal > 0 ? 12 : 0); // R$ 12 delivery fee

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryAddress) return;
    setIsCheckoutSuccess(true);
    setTimeout(() => {
      setCart([]);
      setIsCartOpen(false);
      setIsCheckoutSuccess(false);
      alert(lang === 'pt' ? 'Pedido enviado! Sincronizado automaticamente com o Caixa (PDV) e enviado para o preparo!' : 'Order received! Automatically synced with the POS system and sent to the kitchen!');
    }, 2000);
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReservationSuccess(true);
  };

  const checkLoyaltyPoints = () => {
    if (!loyaltyPhone) return;
    // Mock Loyalty Points calculation
    const numericPhone = loyaltyPhone.replace(/\D/g, '');
    const points = (numericPhone.length % 5) * 50 + 75; // Generate points dynamically
    setLoyaltyData({
      points,
      coupon: points >= 150 ? 'FIDELIDADE10' : null
    });
  };

  return (
    <div className="min-h-screen bg-[#110D0A] text-[#F3EFE9] font-sans relative overflow-x-hidden pb-16">
      {/* Return button overlay */}
      <div className="bg-[#1C1612]/90 border-b border-[#2C241D] py-3 px-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <Link to="/templates/restaurante-premium" className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Modelo
        </Link>
        <span className="text-[10px] text-gray-500 font-bold bg-[#2C241D] px-2 py-0.5 rounded">
          MODO DEMONSTRAÇÃO (TODOS OS RECURSOS INCLUÍDOS)
        </span>
        {/* Language selector toggle - OPTIONAL_FEATURE: Multi-idioma */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mr-2 bg-[#2C241D] px-2 py-1 rounded">
            <Globe className="w-3 h-3 text-[#5B4FE9]" />
            <span>{t.optionalBadge}</span>
          </div>
          {(['pt', 'en', 'es'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${
                lang === l ? 'bg-[#5B4FE9] text-white' : 'text-gray-400 hover:bg-[#2C241D]'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[480px] flex items-center justify-center text-center px-4 bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(17, 13, 10, 0.75), rgba(17, 13, 10, 0.95)), url("https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop")' }}>
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-6xl font-serif text-[#F2A154] font-black tracking-tight">{t.title}</h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">{t.subtitle}</p>
          <div className="flex justify-center gap-4">
            <a href="#cardapio" className="bg-[#E85D04] hover:bg-[#D04E00] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {t.heroBtnMenu}
            </a>
            <button
              onClick={() => setIsReserveModalOpen(true)}
              className="bg-transparent border border-white hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#5B4FE9]" />
              {t.heroBtnReserve}
              <span className="text-[8px] bg-[#5B4FE9] text-white px-1 py-0.5 rounded-full font-bold ml-1">OPCIONAL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div id="cardapio" className="max-w-6xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-[#F2A154]">{t.menuTitle}</h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm">{t.menuSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MENU_ITEMS.map(item => (
            <div key={item.id} className="bg-[#1C1612] border border-[#2C241D] rounded-2xl overflow-hidden hover:border-[#F2A154]/50 transition-all flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img src={item.image} alt={item.name[lang]} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-bold bg-[#2C241D] text-gray-300 px-2 py-0.5 rounded border border-white/10">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span>{t.optionalBadge}: Foto do Prato</span>
                </div>
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs font-bold text-[#F2A154]">
                  R$ {item.price}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-white font-serif">{item.name[lang]}</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{item.description[lang]}</p>
                </div>
                {/* Add to Order Button - OPTIONAL_FEATURE: Painel de Pedidos/Delivery */}
                <div className="pt-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-[#E85D04]/10 hover:bg-[#E85D04] text-[#E85D04] hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all border border-[#E85D04]/20 hover:border-transparent flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Adicionar ao Pedido
                    <span className="text-[7px] bg-[#5B4FE9] text-white px-1.5 py-0.5 rounded font-black">DELIVERY</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loyalty & Reservations Banner */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        {/* Loyalty Program widget - OPTIONAL_FEATURE: Programa de Fidelidade */}
        <div className="bg-[#1C1612] border border-[#2C241D] rounded-2xl p-6 relative">
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-bold bg-[#2C241D] text-gray-400 px-2 py-0.5 rounded">
            <Award className="w-2.5 h-2.5 text-[#5B4FE9]" />
            <span>{t.optionalBadge}: Programa de Fidelidade</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-[#F2A154]" />
            <div>
              <h3 className="font-bold text-lg text-white font-serif">{t.loyaltyTitle}</h3>
              <p className="text-xs text-gray-400">{t.loyaltySubtitle}</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <label className="text-xs text-gray-400 block">{t.loyaltyPhoneLabel}</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={loyaltyPhone}
                onChange={e => setLoyaltyPhone(e.target.value)}
                placeholder="(14) 99640-5496"
                className="bg-[#110D0A] border border-[#2C241D] text-white placeholder-gray-500 rounded-xl px-3 py-2 text-xs flex-1 focus:outline-none focus:border-[#5B4FE9]"
              />
              <button
                onClick={checkLoyaltyPoints}
                className="bg-[#5B4FE9] hover:bg-[#4338CA] text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
              >
                {t.loyaltyCheckBtn}
              </button>
            </div>
            {loyaltyData && (
              <div className="p-3 bg-[#110D0A] rounded-xl border border-dashed border-[#2C241D] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.loyaltyPoints}:</span>
                  <span className="font-bold text-[#F2A154]">{loyaltyData.points} pts</span>
                </div>
                {loyaltyData.coupon && (
                  <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-center font-bold font-mono">
                    CUPOM: {loyaltyData.coupon} (10% OFF)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Promotion banner - OPTIONAL_FEATURE: Disparo de Cupons WhatsApp */}
        <div className="bg-[#1C1612] border border-[#2C241D] rounded-2xl p-6 relative flex flex-col justify-between">
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-bold bg-[#2C241D] text-gray-400 px-2 py-0.5 rounded">
            <MessageSquare className="w-2.5 h-2.5 text-[#5B4FE9]" />
            <span>{t.optionalBadge}: Disparo de Cupons</span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-[#25D366]" />
              <div>
                <h3 className="font-bold text-lg text-white font-serif">Receber Promoções no WhatsApp</h3>
                <p className="text-xs text-gray-400">Entre na nossa lista vip para receber novidades e cupons exclusivos.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <input
              type="tel"
              placeholder="(14) 99640-5496"
              className="bg-[#110D0A] border border-[#2C241D] text-white placeholder-gray-500 rounded-xl px-3 py-2 text-xs flex-1 focus:outline-none focus:border-[#5B4FE9]"
            />
            <button
              onClick={() => alert(lang === 'pt' ? 'Inscrição simulada concluída! Você receberá cupons pelo WhatsApp.' : 'Simulated enrollment complete! You will receive coupons via WhatsApp.')}
              className="bg-[#25D366] hover:bg-[#1EBE57] text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              Cadastrar
            </button>
          </div>
        </div>
      </div>

      {/* SEO Preview - OPTIONAL_FEATURE: SEO Avançado */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-[#1C1612] border border-[#2C241D] rounded-2xl p-5 space-y-3 relative">
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-bold bg-[#2C241D] text-gray-400 px-2 py-0.5 rounded">
            <Search className="w-2.5 h-2.5 text-[#5B4FE9]" />
            <span>{t.optionalBadge}: SEO Avançado</span>
          </div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#E85D04]" />
            Como o site aparece nas buscas do Google (Bauru - SP)
          </h4>
          <div className="p-4 bg-white text-black rounded-xl shadow-inner font-sans space-y-1.5 max-w-xl text-left">
            <div className="text-xs text-[#202124] flex items-center gap-1">
              <span>https://www.saborearte.com.br</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </div>
            <h3 className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight">
              Sabor & Arte | Restaurante Premium em Bauru - Cardápio e Reservas
            </h3>
            <p className="text-xs text-[#4d5156] leading-relaxed">
              O melhor risoto de funghi secchi, massas gourmet e carnes nobres grelhadas na brasa no coração de Bauru. Faça sua reserva online e confira nosso cardápio digital.
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-2 text-xs text-[#1a0dab] font-medium border-t border-gray-100">
              <span className="hover:underline cursor-pointer">🍽️ Nosso Cardápio</span>
              <span className="hover:underline cursor-pointer">📅 Reservar uma Mesa</span>
              <span className="hover:underline cursor-pointer">📍 Onde Estamos</span>
              <span className="hover:underline cursor-pointer">🎁 Clube de Fidelidade</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="border-t border-[#2C241D] pt-12 pb-6 text-center text-xs text-gray-500 space-y-4 max-w-6xl mx-auto px-4 mt-12">
        <div className="flex flex-wrap justify-center gap-6 text-[#F2A154]">
          <span className="cursor-pointer hover:underline">{t.navMenu}</span>
          <span className="cursor-pointer hover:underline">{t.navReservations}</span>
          <span className="cursor-pointer hover:underline">{t.navAbout}</span>
          <span className="cursor-pointer hover:underline">{t.navContact}</span>
        </div>
        <p>© 2026 Sabor & Arte. Todos os direitos reservados. · Av. Gastronômica, 1000 - Centro, Bauru/SP</p>
        <div className="flex justify-center items-center gap-2 text-[10px] text-gray-600 font-bold bg-[#1C1612] px-4 py-2 rounded-xl w-max mx-auto border border-[#2C241D]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5B4FE9]" />
          <span>Nextia Cloud + SSL Ativo · Suporte 24h Prioritário</span>
        </div>
      </footer>

      {/* 6. Advanced Reservation Calendar Modal - OPTIONAL_FEATURE: Calendário de Reservas Avançado */}
      {isReserveModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#1C1612] border border-[#2C241D] rounded-2xl p-6 max-w-md w-full relative space-y-4">
            <button
              onClick={() => { setIsReserveModalOpen(false); setReservationSuccess(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[8px] font-black bg-[#5B4FE9] text-white px-2 py-0.5 rounded tracking-wide uppercase inline-block mb-1">
                {t.optionalBadge}: Calendário de Reservas Avançado
              </span>
              <h3 className="font-bold text-xl text-white font-serif">{t.reserveTitle}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.reserveSubtitle}</p>
            </div>

            {reservationSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-bold text-green-400 text-sm">Reserva Confirmada!</h4>
                <p className="text-xs text-gray-300">
                  Código da Reserva: <strong>#SA-2026-{Math.floor(Math.random() * 8999 + 1000)}</strong>
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Um e-mail e um SMS de confirmação foram enviados para {reservationForm.email || 'você'}.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => { setIsReserveModalOpen(false); setReservationSuccess(false); }}
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReservationSubmit} className="space-y-3 text-xs text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Data *</label>
                    <input
                      type="date"
                      required
                      value={reservationForm.date}
                      onChange={e => setReservationForm({ ...reservationForm, date: e.target.value })}
                      className="w-full bg-[#110D0A] border border-[#2C241D] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#5B4FE9]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Horário *</label>
                    <select
                      value={reservationForm.time}
                      onChange={e => setReservationForm({ ...reservationForm, time: e.target.value })}
                      className="w-full bg-[#110D0A] border border-[#2C241D] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#5B4FE9]"
                    >
                      <option>18:00</option>
                      <option>19:00</option>
                      <option>20:00</option>
                      <option>21:00</option>
                      <option>22:00</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Número de Pessoas *</label>
                  <select
                    value={reservationForm.size}
                    onChange={e => setReservationForm({ ...reservationForm, size: e.target.value })}
                    className="w-full bg-[#110D0A] border border-[#2C241D] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#5B4FE9]"
                  >
                    <option value="1">1 Pessoa</option>
                    <option value="2">2 Pessoas</option>
                    <option value="4">4 Pessoas</option>
                    <option value="6">6 Pessoas</option>
                    <option value="8">8 Pessoas</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-[#2C241D] space-y-2">
                  <div>
                    <label className="text-gray-400 block mb-1">Seu Nome *</label>
                    <input
                      type="text"
                      required
                      placeholder="João Silva"
                      value={reservationForm.name}
                      onChange={e => setReservationForm({ ...reservationForm, name: e.target.value })}
                      className="w-full bg-[#110D0A] border border-[#2C241D] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#5B4FE9]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 block mb-1">WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="(14) 99640-5496"
                        value={reservationForm.phone}
                        onChange={e => setReservationForm({ ...reservationForm, phone: e.target.value })}
                        className="w-full bg-[#110D0A] border border-[#2C241D] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#5B4FE9]"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">E-mail *</label>
                      <input
                        type="email"
                        required
                        placeholder="joao@gmail.com"
                        value={reservationForm.email}
                        onChange={e => setReservationForm({ ...reservationForm, email: e.target.value })}
                        className="w-full bg-[#110D0A] border border-[#2C241D] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#5B4FE9]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#5B4FE9] hover:bg-[#4338CA] text-white py-2.5 rounded-xl font-bold transition-all mt-4 text-xs flex items-center justify-center gap-1"
                >
                  <Calendar className="w-4 h-4" />
                  Confirmar Reserva
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. Cart Drawer Panel - OPTIONAL_FEATURE: Painel de Pedidos/Delivery */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#1C1612] h-full p-6 flex flex-col justify-between border-l border-[#2C241D] shadow-2xl overflow-y-auto text-left text-xs">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-[#2C241D]">
                <div>
                  <h3 className="font-bold text-lg text-white font-serif">{t.cartTitle}</h3>
                  <span className="text-[8px] font-black bg-[#5B4FE9] text-white px-2 py-0.5 rounded tracking-wide uppercase inline-block mt-0.5">
                    {t.optionalBadge}: Painel de Pedidos / Delivery
                  </span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-500 font-medium">
                  Seu carrinho está vazio.
                </div>
              ) : (
                <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto pr-1">
                  {cart.map(({ item, qty }) => (
                    <div key={item.id} className="flex justify-between items-center gap-3 bg-[#110D0A] p-3 rounded-xl border border-[#2C241D]">
                      <div>
                        <div className="font-bold text-white font-serif">{item.name[lang]}</div>
                        <div className="text-gray-400 mt-0.5">Qty: {qty} · R$ {item.price} each</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#F2A154]">R$ {item.price * qty}</span>
                        <button
                          onClick={() => setCart(prev => prev.filter(i => i.item.id !== item.id))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-[#2C241D] pt-4 space-y-4">
                <div className="space-y-1.5 text-gray-400">
                  <div className="flex justify-between">
                    <span>{t.cartSubtotal}:</span>
                    <span className="text-white font-semibold">R$ {cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.cartDelivery}:</span>
                    <span className="text-white font-semibold">R$ 12</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#F2A154] pt-2 border-t border-[#2C241D]/30">
                    <span>{t.cartTotal}:</span>
                    <span>R$ {cartTotal}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Endereço de Entrega *</label>
                    <input
                      type="text"
                      required
                      placeholder="Av. Nações Unidas, 1500 - Ap 402"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full bg-[#110D0A] border border-[#2C241D] text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#5B4FE9]"
                    />
                  </div>

                  <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[10px] font-bold text-center flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.optionalBadge}: Integração PDV + Impressão de Comanda Ativa!
                  </div>

                  <button
                    type="submit"
                    disabled={isCheckoutSuccess}
                    className="w-full bg-[#E85D04] hover:bg-[#D04E00] text-white py-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {isCheckoutSuccess ? 'Sincronizando PDV...' : t.checkoutBtn}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Float Button - OPTIONAL_FEATURE: Painel de Pedidos/Delivery */}
      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-6 bg-[#E85D04] hover:bg-[#D04E00] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 z-40 flex items-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="bg-white text-black font-black text-xs px-2 py-0.5 rounded-full">
            {cartCount}
          </span>
        </button>
      )}

      {/* 8. WhatsApp Chatbot Widget - OPTIONAL_FEATURE: Chatbot de Atendimento */}
      <div className="fixed bottom-6 right-6 z-40">
        {isChatOpen ? (
          <div className="w-72 bg-[#1C1612] border border-[#2C241D] rounded-2xl shadow-2xl flex flex-col justify-between text-left text-xs text-gray-300">
            {/* Header */}
            <div className="bg-[#110D0A] border-b border-[#2C241D] p-3 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <div className="font-bold text-white">Sabor & Arte AI</div>
                  <div className="text-[8px] text-gray-400 uppercase font-black tracking-wider">
                    {t.optionalBadge}: Chatbot
                  </div>
                </div>
              </div>
              <button onClick={handleToggleChat} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-3 h-60 overflow-y-auto space-y-3 bg-[#110D0A]/50">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#E85D04]/20 border border-[#E85D04]/30 text-white ml-auto'
                      : 'bg-[#2C241D] text-gray-200 mr-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="p-2 border-t border-[#2C241D] bg-[#110D0A] space-y-1">
              {[
                {
                  q: lang === 'pt' ? 'Como fazer reservas?' : 'How to make reservations?',
                  a: lang === 'pt' ? 'Você pode clicar no botão "Fazer Reserva" no topo da página ou escolher uma data no nosso calendário!' : 'You can click "Book Table" at the top or use our booking modal!'
                },
                {
                  q: lang === 'pt' ? 'Quais os pratos mais pedidos?' : 'What are the best dishes?',
                  a: lang === 'pt' ? 'Nosso campeão de pedidos é o Risoto de Funghi Secchi e a Tapa de Cuadril Grillada!' : 'Our best-sellers are the Wild Mushroom Risotto and the Grilled Ribeye!'
                },
                {
                  q: lang === 'pt' ? 'Qual o horário de funcionamento?' : 'What are the opening hours?',
                  a: lang === 'pt' ? 'Funcionamos de Terça a Domingo, das 18h às 23h. Sextas e Sábados até 00h.' : 'We open Tue-Sun from 6:00 PM to 11:00 PM (Fri/Sat until 12:00 AM).'
                }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBotQuickReply(p.q, p.a)}
                  className="w-full text-[10px] text-[#F2A154] hover:bg-white/5 p-1.5 rounded text-left border border-white/5 truncate block"
                >
                  {p.q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={handleToggleChat}
            className="bg-[#25D366] hover:bg-[#1EBE57] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 relative z-40"
          >
            <MessageSquare className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
