import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShoppingBag, Calendar, MessageSquare, Search,
  CheckCircle2, X, Phone, Award, Send, Star, ArrowLeft,
  ShieldCheck, Check, FileText, Globe, Home, MapPin, Building,
  Eye, Calculator, Video, Scissors
} from 'lucide-react';
import Button from '../components/ui/Button';

// Language Translations for Demo Shell
const translations = {
  pt: {
    optionalBadge: "Recurso Opcional",
    reserveTitle: "Fazer Reserva",
    reserveSubtitle: "Reserve uma mesa ou agende uma visita/serviço.",
    cartTitle: "Seu Pedido",
    cartSubtotal: "Subtotal",
    cartDelivery: "Entrega (Simulada)",
    cartTotal: "Total do Pedido",
    checkoutBtn: "Finalizar Pedido",
    loyaltyTitle: "Clube de Fidelidade",
    loyaltySubtitle: "Acumule pontos em cada visita.",
    loyaltyPhoneLabel: "WhatsApp cadastrado:",
    loyaltyCheckBtn: "Consultar",
    loyaltyPoints: "Saldo de Pontos",
    navMenu: "Cardápio",
    navReservations: "Reservas",
    navAbout: "Sobre Nós",
    navContact: "Contato",
  },
  en: {
    optionalBadge: "Optional Feature",
    reserveTitle: "Make a Booking",
    reserveSubtitle: "Book a table or schedule an appointment/service.",
    cartTitle: "Your Order",
    cartSubtotal: "Subtotal",
    cartDelivery: "Delivery (Simulated)",
    cartTotal: "Total Order",
    checkoutBtn: "Checkout",
    loyaltyTitle: "Loyalty Club",
    loyaltySubtitle: "Earn points with every visit.",
    loyaltyPhoneLabel: "WhatsApp number:",
    loyaltyCheckBtn: "Check",
    loyaltyPoints: "Points Balance",
    navMenu: "Menu",
    navReservations: "Reservations",
    navAbout: "About Us",
    navContact: "Contact",
  },
  es: {
    optionalBadge: "Recurso Opcional",
    reserveTitle: "Hacer Reserva",
    reserveSubtitle: "Reserve una mesa o programe una visita/servicio.",
    cartTitle: "Su Pedido",
    cartSubtotal: "Subtotal",
    cartDelivery: "Envío (Simulado)",
    cartTotal: "Total del Pedido",
    checkoutBtn: "Finalizar Pedido",
    loyaltyTitle: "Club de Fidelidad",
    loyaltySubtitle: "Acumule puntos con cada visita.",
    loyaltyPhoneLabel: "WhatsApp registrado:",
    loyaltyCheckBtn: "Consultar",
    loyaltyPoints: "Saldo de Puntos",
    navMenu: "Menú",
    navReservations: "Reservas",
    navAbout: "Sobre Nosotros",
    navContact: "Contacto",
  }
};

// 1. Interfaces
interface DemoItem {
  id: string;
  name: { pt: string; en: string; es: string };
  description: { pt: string; en: string; es: string };
  price: number;
  image: string;
}

interface DemoConfig {
  name: string;
  category: string;
  colorTheme: {
    bg: string;
    bgPanel: string;
    border: string;
    text: string;
    primary: string;
    primaryHover: string;
  };
  ctas: {
    primaryText: { pt: string; en: string; es: string };
    secondaryText: { pt: string; en: string; es: string };
    type: 'booking' | 'cart' | 'budget';
  };
  title: { pt: string; en: string; es: string };
  subtitle: { pt: string; en: string; es: string };
  menuTitle: { pt: string; en: string; es: string };
  menuSubtitle: { pt: string; en: string; es: string };
  items: DemoItem[];
  chatbot: {
    welcome: { pt: string; en: string; es: string };
    prompts: Array<{
      q: { pt: string; en: string; es: string };
      a: { pt: string; en: string; es: string };
    }>;
  };
  seo: {
    title: string;
    description: string;
    sitelinks: string[];
  };
}

// 2. Multi-niche configurations
const DEMO_CONFIGS: Record<string, DemoConfig> = {
  'restaurante-premium': {
    name: "Restaurante Premium",
    category: "Restaurante",
    colorTheme: {
      bg: "#110D0A",
      bgPanel: "#1C1612",
      border: "#2C241D",
      text: "#F3EFE9",
      primary: "#E85D04",
      primaryHover: "#D04E00"
    },
    ctas: {
      primaryText: { pt: "Ver Cardápio", en: "View Menu", es: "Ver Menú" },
      secondaryText: { pt: "Fazer Reserva", en: "Book Table", es: "Reservar Mesa" },
      type: "cart"
    },
    title: {
      pt: "Sabor & Arte",
      en: "Flavor & Art",
      es: "Sabor & Arte"
    },
    subtitle: {
      pt: "Experiência gastronômica única no coração da cidade",
      en: "Unique gastronomic experience in the heart of the city",
      es: "Experiencia gastronómica única en el corazón de la ciudad"
    },
    menuTitle: {
      pt: "Cardápio Especial",
      en: "Our Special Menu",
      es: "Menú Especial"
    },
    menuSubtitle: {
      pt: "Pratos preparados com ingredientes frescos e selecionados por nosso chef executivo.",
      en: "Dishes prepared with fresh, hand-picked ingredients by our executive chef.",
      es: "Platos preparados con ingredientes frescos y seleccionados por nuestro chef ejecutivo."
    },
    items: [
      {
        id: 'dish-1',
        name: { pt: 'Risoto de Funghi Secchi', en: 'Wild Mushroom Risotto', es: 'Risotto de Funghi Secchi' },
        description: {
          pt: 'Arroz arbóreo cremoso com cogumelos funghi hidratados e parmesão importado.',
          en: 'Creamy arborio rice with wild mushrooms and imported parmesan cheese.',
          es: 'Arroz arbóreo cremoso con champiñones funghi secos y queso parmesano importado.'
        },
        price: 68,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=300&auto=format&fit=crop'
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
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300&auto=format&fit=crop'
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
        image: 'https://images.unsplash.com/photo-1485921325814-a5add4af763e?q=80&w=300&auto=format&fit=crop'
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
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'dish-5',
        name: { pt: 'Suco de Frutas Vermelhas', en: 'Fresh Berry Juice', es: 'Jugo de Frutos Rojos' },
        description: {
          pt: 'Suco refrescante de morango, amora e framboesa natural sem conservantes.',
          en: 'Refreshing natural juice of fresh strawberry, blackberry, and raspberry.',
          es: 'Jugo refrescante de fresa, mora y frambuesa natural sin conservantes.'
        },
        price: 16,
        image: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=300&auto=format&fit=crop'
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
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=300&auto=format&fit=crop'
      }
    ],
    chatbot: {
      welcome: {
        pt: "Olá! Seja bem-vindo ao Sabor & Arte. Eu sou sua assistente virtual. Como posso lhe ajudar hoje? Escolha abaixo.",
        en: "Hello! Welcome to Flavor & Art. I am your virtual assistant. How can I help you today? Choose below.",
        es: "¡Hola! Bienvenido a Sabor & Arte. Soy tu asistente virtual. ¿Cómo puedo ayudarte hoy? Elige abajo."
      },
      prompts: [
        {
          q: { pt: "Como fazer reservas?", en: "How to book a table?", es: "¿Cómo hacer reservas?" },
          a: {
            pt: "Você pode clicar no botão 'Fazer Reserva' no topo da página ou escolher uma data no nosso calendário de reservas!",
            en: "You can click the 'Book Table' button at the top of the page or choose a date in our booking calendar!",
            es: "¡Puedes hacer clic en el botón 'Reservar Mesa' arriba o elegir una fecha en nuestro calendario de reservas!"
          }
        },
        {
          q: { pt: "Quais os pratos mais pedidos?", en: "What are the most popular dishes?", es: "¿Cuáles son los platos más pedidos?" },
          a: {
            pt: "Nossos campeões de vendas são o Risoto de Funghi Secchi e a Tapa de Cuadril grelhada na brasa!",
            en: "Our best sellers are the Wild Mushroom Risotto and the Grilled Ribeye Steak!",
            es: "¡Nuestros campeones de ventas son el Risotto de Funghi Secchi y la Tapa de Cuadril grillada!"
          }
        },
        {
          q: { pt: "Qual o horário?", en: "What are the hours?", es: "¿Cuál es el horario?" },
          a: {
            pt: "Funcionamos de Terça a Domingo, das 18h às 23h. Sextas e sábados fechamos às 00h.",
            en: "We are open from Tuesday to Sunday, 6:00 PM to 11:00 PM (Fri/Sat until 12:00 AM).",
            es: "Abrimos de Martes a Domingo, de 18:00 a 23:00. Viernes y sábados cerramos a las 00:00."
          }
        }
      ]
    },
    seo: {
      title: "Sabor & Arte | Restaurante Premium em Bauru - Cardápio e Reservas",
      description: "O melhor risoto de funghi secchi, massas gourmet e carnes nobres grelhadas na brasa no coração de Bauru. Faça sua reserva online e confira nosso cardápio digital.",
      sitelinks: ["🍽️ Nosso Cardápio", "📅 Reservar uma Mesa", "📍 Onde Estamos", "🎁 Clube de Fidelidade"]
    }
  },
  'salao-elegance': {
    name: "Salão Elegance",
    category: "Salão & Barbearia",
    colorTheme: {
      bg: "#0F051D",
      bgPanel: "#190C2C",
      border: "#311A4D",
      text: "#F9F6FC",
      primary: "#D946EF",
      primaryHover: "#C026D3"
    },
    ctas: {
      primaryText: { pt: "Ver Serviços", en: "View Services", es: "Ver Servicios" },
      secondaryText: { pt: "Agendar Horário", en: "Book Appointment", es: "Agendar Turno" },
      type: "booking"
    },
    title: {
      pt: "Salão Elegance",
      en: "Elegance Salon",
      es: "Salón Elegance"
    },
    subtitle: {
      pt: "Beleza que transforma e eleva sua autoestima",
      en: "Beauty that transforms and elevates your self-esteem",
      es: "Belleza que transforma y eleva tu autoestima"
    },
    menuTitle: {
      pt: "Nossos Serviços Premium",
      en: "Our Premium Services",
      es: "Nuestros Servicios Premium"
    },
    menuSubtitle: {
      pt: "Tratamentos completos de cabelo, unhas e estética com profissionais especialistas.",
      en: "Complete hair, nail, and aesthetic treatments with specialist professionals.",
      es: "Tratamientos completos de cabello, uñas y estética con profesionales expertos."
    },
    items: [
      {
        id: 'salon-1',
        name: { pt: 'Corte Stylist Feminino', en: 'Stylist Women\'s Haircut', es: 'Corte Stylist Femenino' },
        description: {
          pt: 'Corte moderno personalizado incluindo lavagem com shampoo importado e finalização com escova.',
          en: 'Customized modern haircut including washing with imported shampoo and blow-dry.',
          es: 'Corte moderno personalizado que incluye lavado con champú importado y peinado final.'
        },
        price: 90,
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'salon-2',
        name: { pt: 'Coloração Orgânica L\'Oréal', en: 'L\'Oréal Organic Coloring', es: 'Coloración Orgánica L\'Oréal' },
        description: {
          pt: 'Aplicação de tintura livre de amônia, excelente cobertura e brilho tridimensional.',
          en: 'Ammonia-free coloring application, excellent coverage, and three-dimensional shine.',
          es: 'Aplicación de tinte libre de amoníaco, excelente cobertura y brillo tridimensional.'
        },
        price: 180,
        image: 'https://images.unsplash.com/photo-1605497746444-ac9dbd324ce8?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'salon-3',
        name: { pt: 'Escova Modeladora', en: 'Blow-Dry & Style', es: 'Peinado Modelador' },
        description: {
          pt: 'Lavagem com massagem capilar e escovação modelando ondas suaves ou efeito liso duradouro.',
          en: 'Washing with hair massage and styling soft waves or long-lasting smooth effect.',
          es: 'Lavado con masaje capilar y cepillado modelando ondas suaves o efecto liso duradero.'
        },
        price: 60,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'salon-4',
        name: { pt: 'Reconstrução Senscience', en: 'Senscience Hair Recovery', es: 'Reconstrucción Senscience' },
        description: {
          pt: 'Tratamento de queratina e aminoácidos para recuperar cabelos porosos e danificados.',
          en: 'Keratin and amino acid treatment to recover porous and damaged hair.',
          es: 'Tratamiento de queratina y aminoácidos para recuperar cabellos porosos y dañados.'
        },
        price: 150,
        image: 'https://images.unsplash.com/photo-1527799863830-53b87965458f?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'salon-5',
        name: { pt: 'Manicure & Pedicure Gel', en: 'Gel Manicure & Pedicure', es: 'Manicura & Pedicura Gel' },
        description: {
          pt: 'Cuticulagem detalhada e esmaltação premium em gel com secagem em cabine LED.',
          en: 'Detailed cuticle care and premium gel polishing with LED cabin drying.',
          es: 'Cuidado detallado de cutículas y esmaltado de gel premium con secado LED.'
        },
        price: 85,
        image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'salon-6',
        name: { pt: 'Barba Terapia com Toalha Quente', en: 'Hot Towel Beard Therapy', es: 'Barba Terapia Toalla Caliente' },
        description: {
          pt: 'Desenho da barba na navalha, massagem com balm e relaxamento com toalha quente.',
          en: 'Razor beard shaping, balm massage, and relaxation with a hot towel.',
          es: 'Diseño de barba a navaja, masaje con bálsamo y relajación con toalla caliente.'
        },
        price: 50,
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=300&auto=format&fit=crop'
      }
    ],
    chatbot: {
      welcome: {
        pt: "Olá! Seja bem-vindo ao Salão Elegance. Como posso te ajudar a ficar ainda mais radiante hoje?",
        en: "Hello! Welcome to Elegance Salon. How can I help you look even more radiant today?",
        es: "¡Hola! Bienvenido al Salón Elegance. ¿Cómo puedo ayudarte a lucir aún más radiante hoy?"
      },
      prompts: [
        {
          q: { pt: "Como agendar um horário?", en: "How to book an appointment?", es: "¿Cómo agendar un turno?" },
          a: {
            pt: "Basta clicar em 'Agendar Horário' no cabeçalho, escolher a data, o profissional e seu serviço favorito!",
            en: "Simply click 'Book Appointment' in the header, choose a date, a stylist, and your favorite service!",
            es: "¡Solo haz clic en 'Agendar Turno' arriba, elige la fecha, el estilista y tu servicio favorito!"
          }
        },
        {
          q: { pt: "Quais os serviços?", en: "What services are available?", es: "¿Qué servicios ofrecen?" },
          a: {
            pt: "Oferecemos corte de cabelo, coloração importada, tratamentos de reconstrução Senscience e unhas de gel.",
            en: "We offer haircuts, premium coloring, Senscience reconstruction treatments, and gel nails.",
            es: "Ofrecemos corte de cabello, coloración importada, tratamientos de reconstrucción Senscience y uñas de gel."
          }
        }
      ]
    },
    seo: {
      title: "Salão Elegance | Agendamento de Cabelo e Unhas Online",
      description: "Tratamento capilar profissional, manicures qualificadas e corte feminino moderno no Salão Elegance. Agende seu horário com facilidade pelo nosso site.",
      sitelinks: ["✂️ Nossos Serviços", "📅 Agendar Horário", "💅 Galeria", "🎁 Fidelidade"]
    }
  },
  'servicos-profissionais': {
    name: "Serviços Profissionais",
    category: "Prestador de Serviços",
    colorTheme: {
      bg: "#0B0F19",
      bgPanel: "#111827",
      border: "#1F2937",
      text: "#F3F4F6",
      primary: "#3B82F6",
      primaryHover: "#2563EB"
    },
    ctas: {
      primaryText: { pt: "Ver Soluções", en: "View Solutions", es: "Ver Soluciones" },
      secondaryText: { pt: "Solicitar Orçamento", en: "Get Quote", es: "Solicitar Presupuesto" },
      type: "budget"
    },
    title: {
      pt: "RA Consultoria",
      en: "RA Consulting",
      es: "RA Consultoría"
    },
    subtitle: {
      pt: "Resultados consistentes e estruturação financeira para o seu negócio",
      en: "Consistent results and financial structuring for your business",
      es: "Resultados consistentes y estructuración financiera para tu negocio"
    },
    menuTitle: {
      pt: "Nossas Soluções Corporativas",
      en: "Our Corporate Solutions",
      es: "Nuestras Soluciones Corporativas"
    },
    menuSubtitle: {
      pt: "Projetos de consultoria estratégica estruturados de acordo com o porte da sua empresa.",
      en: "Strategic consulting projects structured according to the size of your company.",
      es: "Proyectos de consultoría estratégica estructurados según el tamaño de tu empresa."
    },
    items: [
      {
        id: 'service-1',
        name: { pt: 'Consultoria Estratégica', en: 'Strategic Consulting', es: 'Consultoría Estratégica' },
        description: {
          pt: 'Diagnóstico de eficiência operacional, mapeamento de processos e formulação de OKRs de crescimento.',
          en: 'Operational efficiency diagnosis, process mapping, and growth OKRs formulation.',
          es: 'Diagnóstico de eficiencia operativa, mapeo de procesos y formulación de OKR de crecimiento.'
        },
        price: 1500,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'service-2',
        name: { pt: 'Planejamento Financeiro', en: 'Financial Planning', es: 'Planificación Financiera' },
        description: {
          pt: 'Estruturação de fluxo de caixa, precificação de produtos e redução de gargalos de desperdício.',
          en: 'Cash flow structuring, product pricing, and waste reduction mapping.',
          es: 'Estructuración de flujo de caja, fijación de precios de productos y reducción de pérdidas.'
        },
        price: 1200,
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'service-3',
        name: { pt: 'Auditoria de Processos', en: 'Process Audit', es: 'Auditoría de Procesos' },
        description: {
          pt: 'Revisão interna de fluxos de trabalho e conformidade com normas regulatórias de controle.',
          en: 'Internal review of workflows and compliance with regulatory control standards.',
          es: 'Revisión interna de flujos de trabajo y cumplimiento de normas regulatorias.'
        },
        price: 2000,
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=300&auto=format&fit=crop'
      }
    ],
    chatbot: {
      welcome: {
        pt: "Olá! Seja bem-vindo à RA Consultoria. Em qual área de negócios podemos acelerar os resultados da sua empresa hoje?",
        en: "Hello! Welcome to RA Consulting. In which business area can we accelerate your results today?",
        es: "¡Hola! Bienvenido a RA Consultoría. ¿En qué área de negocio podemos acelerar los resultados de tu empresa hoy?"
      },
      prompts: [
        {
          q: { pt: "Como solicitar um orçamento?", en: "How to request a quote?", es: "¿Cómo solicitar un presupuesto?" },
          a: {
            pt: "Basta clicar em 'Solicitar Orçamento' no menu superior e preencher o briefing com os dados da sua empresa. Retornamos em até 24h úteis!",
            en: "Just click 'Get Quote' in the top menu and fill out the details about your company. We return in 24 business hours!",
            es: "Simplemente haz clic en 'Solicitar Presupuesto' arriba y completa los datos de tu empresa. ¡Respondemos en 24 horas hábiles!"
          }
        }
      ]
    },
    seo: {
      title: "RA Consultoria | Projetos Estratégicos e Orçamentos Online",
      description: "Planejamento financeiro, estruturação operacional e consultorias com foco em resultados reais para pequenas e médias empresas.",
      sitelinks: ["🏢 Nossos Serviços", "📈 Orçamentos", "💡 Sobre nós", "📞 Fale Conosco"]
    }
  },
  'loja-catalogo': {
    name: "Loja & Catálogo",
    category: "Loja e Catálogo",
    colorTheme: {
      bg: "#0A0A0C",
      bgPanel: "#12121A",
      border: "#1F1F2E",
      text: "#F1F1F5",
      primary: "#6366F1",
      primaryHover: "#4F46E5"
    },
    ctas: {
      primaryText: { pt: "Ver Produtos", en: "Shop Now", es: "Ver Productos" },
      secondaryText: { pt: "Ver Carrinho", en: "Open Cart", es: "Ver Carrito" },
      type: "cart"
    },
    title: {
      pt: "Minimalist Store",
      en: "Minimalist Store",
      es: "Minimalist Store"
    },
    subtitle: {
      pt: "Design atemporal, tecidos nobres e acabamento premium para o seu dia a dia",
      en: "Timeless design, noble fabrics, and premium finish for your everyday life",
      es: "Diseño atemporal, tejidos nobles y acabado premium para tu día a día"
    },
    menuTitle: {
      pt: "Nossa Coleção Premium",
      en: "Our Premium Collection",
      es: "Nuestra Colección Premium"
    },
    menuSubtitle: {
      pt: "Itens limitados de alta durabilidade produzidos de forma ética e sustentável.",
      en: "Limited items of high durability produced ethically and sustainably.",
      es: "Artículos limitados de alta durabilidad producidos de manera ética y sostenible."
    },
    items: [
      {
        id: 'store-1',
        name: { pt: 'Camiseta Algodão Egípcio', en: 'Egyptian Cotton Tee', es: 'Camiseta de Algodón Egipcio' },
        description: {
          pt: 'Feita de algodão 100% egípcio com toque sedoso e alta durabilidade que não desbota.',
          en: 'Made of 100% Egyptian cotton with silky touch and high fade-resistant durability.',
          es: 'Hecha de 100% algodón egipcio con tacto sedoso y alta durabilidad que no se destiñe.'
        },
        price: 98,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'store-2',
        name: { pt: 'Calça Chino Slim', en: 'Slim Fit Chino Pants', es: 'Pantalón Chino Slim' },
        description: {
          pt: 'Tecido sarja com elastano para caimento impecável e extremo conforto no escritório.',
          en: 'Twill fabric with elastane for perfect fit and extreme comfort at the office.',
          es: 'Tejido de sarga con elastano para una caída impecable y comodidad en la oficina.'
        },
        price: 189,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'store-3',
        name: { pt: 'Jaqueta Bomber Couro', en: 'Leather Bomber Jacket', es: 'Chaqueta Bomber de Cuero' },
        description: {
          pt: 'Couro nobre legítimo super macio com forro acetinado e zíperes YKK.',
          en: 'Super soft genuine premium leather with satin lining and YKK zippers.',
          es: 'Cuero genuino premium súper suave con forro de satén y cremalleras YKK.'
        },
        price: 499,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=300&auto=format&fit=crop'
      }
    ],
    chatbot: {
      welcome: {
        pt: "Olá! Seja bem-vindo à nossa loja. Procurando alguma numeração ou tem alguma dúvida sobre envios?",
        en: "Hello! Welcome to our store. Looking for a specific size or have questions about shipping?",
        es: "¡Hola! Bienvenido a nuestra tienda. ¿Buscas alguna talla o tienes dudas sobre el envío?"
      },
      prompts: [
        {
          q: { pt: "Qual o prazo de entrega?", en: "What is delivery time?", es: "¿Cuál es el plazo de entrega?" },
          a: {
            pt: "Enviamos para todo o Brasil. O prazo médio de entrega por transportadora é de 3 a 7 dias úteis.",
            en: "We ship worldwide. The average delivery time is 3 to 7 business days.",
            es: "Enviamos a todo el país. El plazo medio de entrega es de 3 a 7 días hábiles."
          }
        }
      ]
    },
    seo: {
      title: "Minimalist Store | Roupas Básicas Premium e Acessórios",
      description: "Compre camisetas de algodão egípcio, calças chinos e jaquetas de couro legítimo com entrega expressa.",
      sitelinks: ["🛒 Nossos Produtos", "📦 Envio & Entrega", "🎁 Cupons WhatsApp", "👤 Minha Conta"]
    }
  },
  'clinica-estetica': {
    name: "Clínica & Estética",
    category: "Clínica e Estética",
    colorTheme: {
      bg: "#071210",
      bgPanel: "#0E1F1B",
      border: "#1C3B34",
      text: "#F0FDFA",
      primary: "#14B8A6",
      primaryHover: "#0D9488"
    },
    ctas: {
      primaryText: { pt: "Ver Tratamentos", en: "View Treatments", es: "Ver Tratamientos" },
      secondaryText: { pt: "Agendar Avaliação", en: "Book Evaluation", es: "Agendar Evaluación" },
      type: "booking"
    },
    title: {
      pt: "Clínica Lumina",
      en: "Lumina Clinic",
      es: "Clínica Lumina"
    },
    subtitle: {
      pt: "Procedimentos estéticos avançados focados em rejuvenescimento natural",
      en: "Advanced aesthetic procedures focused on natural rejuvenation",
      es: "Procedimientos estéticos avanzados enfocados en el rejuvenecimiento natural"
    },
    menuTitle: {
      pt: "Nossos Tratamentos Clínicos",
      en: "Our Clinical Treatments",
      es: "Nuestros Tratamientos Clínicos"
    },
    menuSubtitle: {
      pt: "Protocolos seguros com acompanhamento biomédico para potencializar sua pele.",
      en: "Safe protocols with biomedical monitoring to boost your skin beauty.",
      es: "Protocolos seguros con seguimiento biomédico para potenciar tu piel."
    },
    items: [
      {
        id: 'clinic-1',
        name: { pt: 'Limpeza de Pele Profunda', en: 'Deep Skin Cleansing', es: 'Limpieza de Piel Profunda' },
        description: {
          pt: 'Extração detalhada de cravos e impurezas, alta frequência bactericida e máscara de LED calmante.',
          en: 'Detailed extraction of blackheads, bactericidal high frequency, and soothing LED mask.',
          es: 'Extracción detallada de impurezas, alta frecuencia bactericida y máscara LED calmante.'
        },
        price: 140,
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'clinic-2',
        name: { pt: 'Aplicação de Botox (Área)', en: 'Botox Application', es: 'Aplicación de Botox' },
        description: {
          pt: 'Suavização de rugas dinâmicas na testa ou ao redor dos olhos com toxina botulínica.',
          en: 'Smoothing of dynamic wrinkles on the forehead or crow\'s feet using botulinum toxin.',
          es: 'Suavizado de arrugas dinámicas en la frente o alrededor de los ojos con toxina botulínica.'
        },
        price: 800,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'clinic-3',
        name: { pt: 'Peeling Químico Renovador', en: 'Chemical Peeling', es: 'Peeling Químico Renovador' },
        description: {
          pt: 'Aplicação de ácidos suaves para clareamento de manchas, melhora de poros e cicatrizes.',
          en: 'Application of mild acids for whitening dark spots, improving pores, and scars.',
          es: 'Aplicación de ácidos suaves para aclarar manchas, mejorar poros y cicatrices.'
        },
        price: 250,
        image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=300&auto=format&fit=crop'
      }
    ],
    chatbot: {
      welcome: {
        pt: "Olá! Seja bem-vindo à Clínica Lumina. Gostaria de agendar uma consulta estética com nossos especialistas?",
        en: "Hello! Welcome to Lumina Clinic. Would you like to schedule an evaluation with our specialists?",
        es: "¡Hola! Bienvenido a la Clínica Lumina. ¿Deseas agendar una consulta con nuestros especialistas?"
      },
      prompts: [
        {
          q: { pt: "Os procedimentos doem?", en: "Do procedures hurt?", es: "¿Los tratamientos duelen?" },
          a: {
            pt: "Nossos procedimentos são muito toleráveis. Utilizamos anestésicos tópicos para garantir total conforto nas aplicações.",
            en: "Our procedures are very tolerable. We use topical anesthetics to ensure full comfort during injections.",
            es: "Nuestros tratamientos son muy tolerables. Utilizamos anestésicos tópicos para garantizar total comodidad."
          }
        }
      ]
    },
    seo: {
      title: "Clínica Lumina | Harmonização Facial e Limpeza de Pele",
      description: "Protocolos estéticos, preenchimento labial, botox e microagulhamento sob supervisão biomédica.",
      sitelinks: ["✨ Tratamentos", "📅 Agendar Avaliação", "👩⚕️ Equipe Médica", "📞 Contato"]
    }
  },
  'contabilidade': {
    name: "Escritório Contábil",
    category: "Contabilidade",
    colorTheme: {
      bg: "#090D16",
      bgPanel: "#0F172A",
      border: "#1E293B",
      text: "#F8FAFC",
      primary: "#0EA5E9",
      primaryHover: "#0284C7"
    },
    ctas: {
      primaryText: { pt: "Ver Serviços", en: "View Services", es: "Ver Servicios" },
      secondaryText: { pt: "Falar com Assessor", en: "Talk to Advisor", es: "Falar con Asesor" },
      type: "budget"
    },
    title: {
      pt: "Soluções Contábeis",
      en: "Accounting Solutions",
      es: "Soluciones Contables"
    },
    subtitle: {
      pt: "Segurança tributária e tranquilidade contábil para o seu negócio crescer",
      en: "Tax security and accounting peace of mind for your business growth",
      es: "Seguridad tributaria y tranquilidad contable para el crecimiento de tu negocio"
    },
    menuTitle: {
      pt: "Serviços Especializados",
      en: "Specialized Services",
      es: "Servicios Especializados"
    },
    menuSubtitle: {
      pt: "Cuidamos das burocracias fiscais, trabalhistas e societárias da sua empresa.",
      en: "We handle your business tax, labor, and corporate bureaucracies.",
      es: "Nos encargamos de la burocracia fiscal, laboral y corporativa de tu empresa."
    },
    items: [
      {
        id: 'acc-1',
        name: { pt: 'Assessoria Fiscal & Tributária', en: 'Tax Advisory', es: 'Asesoría Fiscal' },
        description: {
          pt: 'Apuração mensal de impostos, otimização de enquadramento fiscal e entrega de obrigações acessórias.',
          en: 'Monthly tax calculation, tax framework optimization, and accessory filings submission.',
          es: 'Cálculo mensual de impuestos, optimización del marco fiscal y envío de declaraciones.'
        },
        price: 450,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'acc-2',
        name: { pt: 'Terceirização Financeira (BPO)', en: 'Financial BPO', es: 'BPO Financiero' },
        description: {
          pt: 'Gestão completa do seu contas a pagar, receber, faturamento e relatórios de fluxo de caixa.',
          en: 'Complete accounts payable/receivable management, invoicing, and cash flow reports.',
          es: 'Gestión completa de cuentas a pagar, facturación e informes de flujo de caja.'
        },
        price: 800,
        image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'acc-3',
        name: { pt: 'Abertura & Legalização de CNPJ', en: 'Company Incorporation', es: 'Apertura de Empresa' },
        description: {
          pt: 'Abertura rápida de empresas em Juntas Comerciais, Receita Federal e Prefeitura do Município.',
          en: 'Fast company registration at Commercial Registries, IRS, and Municipal Hall.',
          es: 'Registro rápido de empresas en el Registro Mercantil, Hacienda y Ayuntamiento.'
        },
        price: 300,
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300&auto=format&fit=crop'
      }
    ],
    chatbot: {
      welcome: {
        pt: "Olá! Seja bem-vindo ao nosso suporte contábil. Quer saber qual o melhor regime tributário para o seu negócio?",
        en: "Hello! Welcome to our accounting support. Want to know the best tax regime for your business?",
        es: "¡Hola! Bienvenido a nuestro soporte contable. ¿Quieres saber cuál es el mejor régimen fiscal para tu empresa?"
      },
      prompts: [
        {
          q: { pt: "Como abrir uma empresa?", en: "How to open a company?", es: "¿Cómo abrir una empresa?" },
          a: {
            pt: "Cuidamos de tudo! Elaboramos o contrato social, registramos na junta comercial e ativamos seu CNPJ em poucos dias.",
            en: "We handle everything! We draft corporate bylaws, register with commercial boards, and activate your tax ID.",
            es: "¡Nos encargamos de todo! Elaboramos los estatutos, registramos en el registro mercantil y activamos tu CNPJ."
          }
        }
      ]
    },
    seo: {
      title: "Soluções Contábeis | Abertura de CNPJ e Assessoria Tributária",
      description: "Terceirização financeira BPO, folha de pagamento e contabilidade consultiva para pequenas empresas.",
      sitelinks: ["🏢 Serviços", "📞 Falar com Assessor", "⚖️ Abertura de CNPJ", "📈 Blog Contábil"]
    }
  },
  'imobiliaria': {
    name: "Imobiliária",
    category: "Imobiliária",
    colorTheme: {
      bg: "#0C0B08",
      bgPanel: "#15120C",
      border: "#2C2417",
      text: "#FBF9F4",
      primary: "#F59E0B",
      primaryHover: "#D97706"
    },
    ctas: {
      primaryText: { pt: "Ver Imóveis", en: "View Properties", es: "Ver Inmuebles" },
      secondaryText: { pt: "Agendar Visita", en: "Book Visit", es: "Agendar Visita" },
      type: "budget"
    },
    title: {
      pt: "Lumina Imóveis",
      en: "Lumina Real Estate",
      es: "Lumina Inmuebles"
    },
    subtitle: {
      pt: "Encontre a residência dos seus sonhos nas melhores localizações da cidade",
      en: "Find the residence of your dreams in the best locations in town",
      es: "Encuentra la residencia de tus sueños en las mejores ubicaciones de la ciudad"
    },
    menuTitle: {
      pt: "Imóveis em Destaque",
      en: "Featured Properties",
      es: "Inmuebles Destacados"
    },
    menuSubtitle: {
      pt: "Opções selecionadas de casas em condomínio e apartamentos de alto padrão.",
      en: "Selected options of gated community houses and high-end apartments.",
      es: "Opciones seleccionadas de casas en condominios cerrados y apartamentos premium."
    },
    items: [
      {
        id: 'prop-1',
        name: { pt: 'Apartamento Duplex Jardins', en: 'Jardins Duplex Apartment', es: 'Apartamento Duplex Jardins' },
        description: {
          pt: '3 suítes, 4 vagas de garagem, varanda gourmet integrada e acabamento assinado por arquiteto.',
          en: '3 suites, 4 parking spots, integrated gourmet balcony, and architect-designed finish.',
          es: '3 suites, 4 plazas de garaje, terraza gourmet integrada y diseño exclusivo de arquitecto.'
        },
        price: 12000,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'prop-2',
        name: { pt: 'Casa Alto Padrão Alphaville', en: 'Alphaville Mansion', es: 'Mansión Alphaville' },
        description: {
          pt: '4 suítes master, piscina com borda infinita, automação residencial e geração solar.',
          en: '4 master suites, infinity pool, home automation, and solar energy generation.',
          es: '4 suites principales, piscina de borde infinito, domótica y paneles solares.'
        },
        price: 18000,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'prop-3',
        name: { pt: 'Cobertura Vista Mar', en: 'Sea View Penthouse', es: 'Ático Vista al Mar' },
        description: {
          pt: 'Cobertura linear com piscina privativa, deck panorâmico vista total da praia de Copacabana.',
          en: 'Linear penthouse with private pool, panoramic deck, and complete view of Copacabana beach.',
          es: 'Ático lineal con piscina privada, terraza panorámica y vista completa de Copacabana.'
        },
        price: 25000,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=300&auto=format&fit=crop'
      }
    ],
    chatbot: {
      welcome: {
        pt: "Olá! Seja bem-vindo à Lumina Imóveis. Está procurando imóvel para comprar ou alugar?",
        en: "Hello! Welcome to Lumina Real Estate. Are you looking to buy or rent?",
        es: "¡Hola! Bienvenido a Lumina Inmuebles. ¿Buscas comprar o alquilar?"
      },
      prompts: [
        {
          q: { pt: "Aceita financiamento?", en: "Do you accept financing?", es: "¿Aceptan financiación?" },
          a: {
            pt: "Sim! Trabalhamos em parceria com os principais bancos para aprovar seu crédito imobiliário rapidamente.",
            en: "Yes! We work in partnership with major banks to approve your mortgage credit quickly.",
            es: "¡Sí! Trabajamos con los principales bancos para aprobar tu crédito hipotecario rápidamente."
          }
        }
      ]
    },
    seo: {
      title: "Lumina Imóveis | Venda e Locação de Imóveis de Luxo",
      description: "Casas em condomínio fechado, lofts e coberturas duplex para aluguel e venda com corretores certificados.",
      sitelinks: ["🏢 Imóveis à Venda", "📅 Agendar Visita", "🔍 Buscar por Mapa", "📞 Corretores"]
    }
  },
  'oficina-mecanica': {
    name: "Oficina Mecânica",
    category: "Oficina Mecânica",
    colorTheme: {
      bg: "#0F0F10",
      bgPanel: "#17171A",
      border: "#27272A",
      text: "#F4F4F5",
      primary: "#EF4444",
      primaryHover: "#DC2626"
    },
    ctas: {
      primaryText: { pt: "Ver Serviços", en: "View Services", es: "Ver Servicios" },
      secondaryText: { pt: "Agendar Revisão", en: "Book Repair", es: "Agendar Turno" },
      type: "budget"
    },
    title: {
      pt: "Auto Center Premium",
      en: "Premium Auto Center",
      es: "Auto Center Premium"
    },
    subtitle: {
      pt: "Diagnósticos computadorizados de precisão e mecânica preventiva de confiança",
      en: "Precision computerized diagnostics and reliable preventive mechanics",
      es: "Diagnósticos informáticos de precisión y mecánica preventiva de confianza"
    },
    menuTitle: {
      pt: "Serviços Mecânicos",
      en: "Mechanical Services",
      es: "Servicios Mecánicos"
    },
    menuSubtitle: {
      pt: "Manutenção rápida realizada por técnicos certificados utilizando peças genuínas.",
      en: "Fast maintenance carried out by certified technicians using genuine parts.",
      es: "Mantenimiento rápido realizado por técnicos certificados utilizando piezas de repuesto originales."
    },
    items: [
      {
        id: 'auto-1',
        name: { pt: 'Alinhamento 3D & Balanceamento', en: '3D Alignment & Balancing', es: 'Alineación 3D & Balanceo' },
        description: {
          pt: 'Alinhamento com sensores computadorizados e balanceamento de rodas para evitar desgaste irregular de pneus.',
          en: 'Alignment with computerized sensors and wheel balancing to prevent uneven tire wear.',
          es: 'Alineación con sensores computarizados y balanceo para evitar el desgaste irregular de neumáticos.'
        },
        price: 120,
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'auto-2',
        name: { pt: 'Revisão Geral do Sistema de Freios', en: 'Brake System Inspection', es: 'Revisión del Sistema de Frenos' },
        description: {
          pt: 'Substituição de pastilhas de freio, retífica de discos e troca completa do fluído hidráulico.',
          en: 'Brake pad replacement, disc resurfacing, and complete hydraulic fluid change.',
          es: 'Reemplazo de pastillas de freno, rectificado de discos y cambio de líquido hidráulico.'
        },
        price: 250,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 'auto-3',
        name: { pt: 'Troca de Óleo Sintético 5W30', en: 'Synthetic Oil Change', es: 'Cambio de Aceite Sintético' },
        description: {
          pt: 'Substituição de filtro de óleo e reabastecimento de lubrificante sintético homologado pelas montadoras.',
          en: 'Oil filter replacement and refill of synthetic lubricant approved by automakers.',
          es: 'Reemplazo del filtro y recarga de lubricante sintético aprobado por los fabricantes.'
        },
        price: 190,
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=300&auto=format&fit=crop'
      }
    ],
    chatbot: {
      welcome: {
        pt: "Olá! Seja bem-vindo ao Auto Center Premium. Qual o problema ou ruído o seu veículo está apresentando?",
        en: "Hello! Welcome to Premium Auto Center. What noise or issue is your vehicle experiencing?",
        es: "¡Hola! Bienvenido al Auto Center Premium. ¿Qué ruido o problema está presentando tu vehículo?"
      },
      prompts: [
        {
          q: { pt: "Quanto tempo demora o serviço?", en: "How long does repair take?", es: "¿Cuánto tarda el trabajo?" },
          a: {
            pt: "Serviços rápidos como troca de óleo e alinhamento ficam prontos em até 1 hora. Para diagnósticos, liberamos o veículo no mesmo dia.",
            en: "Quick services like oil changes and alignments are ready within 1 hour. Diagnostics are ready on the same day.",
            es: "Trabajos rápidos como cambio de aceite y alineación están listos en 1 hora. Los diagnósticos el mismo día."
          }
        }
      ]
    },
    seo: {
      title: "Auto Center Premium | Troca de Óleo e Alinhamento 3D",
      description: "Revisão preventiva, freios, suspensão e diagnósticos eletrônicos de marcas importadas.",
      sitelinks: ["🔧 Serviços Automotivos", "📅 Agendar Revisão", "📍 Onde Estamos", "📞 WhatsApp Oficina"]
    }
  },
  'imobiliaria-premium': {
    name: "Imobiliária Premium",
    category: "Imobiliária",
    colorTheme: {
      bg: "#0B0F19",
      bgPanel: "#111827",
      border: "#1F2937",
      text: "#F9FAFB",
      primary: "#D97706",
      primaryHover: "#B45309"
    },
    ctas: {
      primaryText: { pt: "Buscar Imóveis", en: "Search Properties", es: "Buscar Propiedades" },
      secondaryText: { pt: "Agendar Visita", en: "Schedule Visit", es: "Agendar Visita" },
      type: "booking"
    },
    title: {
      pt: "Encontre o Imóvel dos Seus Sonhos",
      en: "Find Your Dream Property",
      es: "Encuentre la Propiedad de sus Sueños"
    },
    subtitle: {
      pt: "Casas de luxo, coberturas, terrenos e imóveis comerciais selecionados com exclusividade para você.",
      en: "Luxury homes, penthouses, land, and commercial properties exclusively curated for you.",
      es: "Casas de lujo, áticos, terrenos e inmuebles comerciales seleccionados con exclusividad."
    },
    menuTitle: {
      pt: "Imóveis de Alto Padrão em Destaque",
      en: "Featured High-End Properties",
      es: "Propiedades Destacadas de Alto Nivel"
    },
    menuSubtitle: {
      pt: "Confira nossa seleção exclusiva com tour virtual 360°, localização privilegiada e arquitetura autoral.",
      en: "Check out our exclusive selection featuring 360° virtual tours, prime locations, and signature architecture.",
      es: "Consulte nuestra selección exclusiva con recorrido virtual 360°, ubicación privilegiada y arquitectura de autor."
    },
    items: [
      {
        id: "prop-1",
        name: {
          pt: "Mansão Suspensa Jardins — 450m²",
          en: "Jardins Suspended Mansion — 450m²",
          es: "Mansión Suspendida Jardins — 450m²"
        },
        description: {
          pt: "4 Suítes · 6 Vagas · Automação Lutron · Vista Panorâmica · Varanda Gourmet integrada com piscina aquecida privativa.",
          en: "4 Suites · 6 Parking slots · Lutron Automation · Panoramic view · Gourmet balcony with private heated pool.",
          es: "4 Suites · 6 Plazas de garaje · Automatización · Vista panorámica · Balcón gourmet con piscina privada."
        },
        price: 8500000,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "prop-2",
        name: {
          pt: "Villa Contemporânea Alphaville — 680m²",
          en: "Alphaville Contemporary Villa — 680m²",
          es: "Villa Contemporánea Alphaville — 680m²"
        },
        description: {
          pt: "5 Suítes · Heliponto homologado · Quadra de Tênis · Cinema privativo · Energia fotovoltaica e paisagismo assinado.",
          en: "5 Suites · Certified Helipad · Tennis Court · Private Cinema · Solar energy and designer landscaping.",
          es: "5 Suites · Helipuerto certificado · Pista de tenis · Cine privado · Energía solar y diseño paisajístico."
        },
        price: 12900000,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "prop-3",
        name: {
          pt: "Penthouse Triplex Barra da Tijuca — 380m²",
          en: "Barra da Tijuca Triplex Penthouse — 380m²",
          es: "Penthouse Triplex Barra da Tijuca — 380m²"
        },
        description: {
          pt: "Frente Mar · 4 Suítes · Jacuzzi privativa na cobertura · Sauna a vapor · Segurança armada 24h e concierge.",
          en: "Oceanfront · 4 Suites · Private rooftop Jacuzzi · Steam sauna · 24/7 armed security and concierge.",
          es: "Frente al mar · 4 Suites · Jacuzzi privado en azotea · Sauna de vapor · Seguridad 24h y conserjería."
        },
        price: 6750000,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "prop-4",
        name: {
          pt: "Residencial Frente Mar Balneário Camboriú — 290m²",
          en: "Balneário Camboriú Beachfront Residence — 290m²",
          es: "Residencia Frente al Mar Balneário Camboriú — 290m²"
        },
        description: {
          pt: "Mobiliado e Decorado por Arquiteto · 4 Suítes · 4 Vagas · Marina privativa para iates · Vista definitiva para a orla.",
          en: "Fully Furnished & Architect Decorated · 4 Suites · 4 Parking slots · Private Yacht Marina · Unobstructed ocean view.",
          es: "Totalmente amueblado · 4 Suites · 4 Plazas · Marina privada para yates · Vista despejada al mar."
        },
        price: 9800000,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "prop-5",
        name: {
          pt: "Casa de Campo Alto Padrão Quinta da Baroneza — 950m²",
          en: "Quinta da Baroneza Luxury Country Estate — 950m²",
          es: "Finca de Lujo Quinta da Baroneza — 950m²"
        },
        description: {
          pt: "6 Suítes · Horta orgânica · Baia para cavalos · Adega climatizada para 1.000 garrafas · Fogo de chão e piscina de borda infinita.",
          en: "6 Suites · Organic garden · Horse stable · Temperature-controlled 1,000-bottle wine cellar · Infinity pool.",
          es: "6 Suites · Huerto orgánico · Establo de caballos · Bodega climatizada de 1.000 botellas · Piscina infinita."
        },
        price: 18500000,
        image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: "prop-6",
        name: {
          pt: "Corporate Tower Faria Lima (Laje Corporativa) — 520m²",
          en: "Corporate Tower Faria Lima (Commercial Floor) — 520m²",
          es: "Corporate Tower Faria Lima (Piso Comercial) — 520m²"
        },
        description: {
          pt: "Certificação LEED Gold · 16 Vagas · Piso elevado · Gerador 100% · Auditório e heliporto no edifício corporativo.",
          en: "LEED Gold Certified · 16 Parking slots · Raised floor · 100% full power generator · Auditorium & helipad.",
          es: "Certificación LEED Gold · 16 Plazas · Suelo elevado · Generador 100% · Auditorio y helipuerto."
        },
        price: 15400000,
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop"
      }
    ],
    chatbot: {
      welcome: {
        pt: "Olá! Seja bem-vindo à Imobiliária Premium. Sou seu consultor imobiliário virtual. Procura imóveis para comprar, alugar ou deseja anunciar o seu?",
        en: "Hello! Welcome to Premium Real Estate. I am your virtual real estate advisor. Looking to buy, rent, or list your property?",
        es: "¡Hola! Bienvenido a Inmobiliaria Premium. Soy su asesor virtual. ¿Busca comprar, alquilar o listar su propiedad?"
      },
      prompts: [
        {
          q: { pt: "Como agendar uma visita presencial?", en: "How to schedule an in-person visit?", es: "¿Cómo agendar una visita presencial?" },
          a: {
            pt: "Você pode clicar no botão 'Agendar Visita' em qualquer imóvel ou nos enviar uma mensagem direta no WhatsApp. Nossos corretores atendem com horário exclusivo.",
            en: "Click 'Schedule Visit' on any property or message us on WhatsApp. Our realtors offer exclusive appointments with private transport if requested.",
            es: "Haga clic en 'Agendar Visita' en cualquier inmueble o envíenos un WhatsApp. Nuestros asesores atienden con horario exclusivo."
          }
        },
        {
          q: { pt: "Como simular meu financiamento bancário?", en: "How to calculate my bank financing?", es: "¿Cómo calcular mi financiamiento bancario?" },
          a: {
            pt: "Temos um Simulador de Financiamento integrado no site com taxas atualizadas de Caixa, Itaú, Bradesco e Santander. Nossos correspondentes bancários cuidam de todo o processo de aprovação sem custo.",
            en: "We have an integrated Mortgage Calculator with real-time rates from major banks. Our banking brokers handle your approval process free of charge.",
            es: "Contamos con un Calculador de Hipotecas integrado con tasas actualizadas. Nuestros agentes bancarios gestionan su aprobación sin costo."
          }
        },
        {
          q: { pt: "Quero anunciar meu imóvel com vocês", en: "I want to list my property with you", es: "Quiero vender/alquilar mi propiedad" },
          a: {
            pt: "Excelente! Clique na opção 'Anuncie Seu Imóvel'. Faremos a avaliação gratuita de mercado com tecnologia de dados e fotos/vídeo em alta resolução sem custo de produção.",
            en: "Great! Click 'List Your Property'. We provide free market appraisal backed by data, plus high-res photos and videos at no production cost.",
            es: "¡Excelente! Haga clic en 'Anuncie su Inmueble'. Hacemos la tasación gratuita de mercado con tecnología de datos y fotos/video profesional."
          }
        }
      ]
    },
    seo: {
      title: "Imobiliária Premium | Imóveis de Alto Padrão e Casas de Luxo",
      description: "Casas de luxo, coberturas, terrenos e imóveis comerciais. Tour virtual 360°, agendamento de visitas e atendimento personalizado com corretores CRECI.",
      sitelinks: ["🏡 Imóveis de Luxo", "🧮 Simulador de Financiamento", "📝 Anuncie Seu Imóvel", "👨‍💼 Corretores CRECI", "📞 WhatsApp Atendimento"]
    }
  }
};

export default function TemplateDemoPage() {
  const { slug } = useParams();
  
  // Resolve active config or fallback to restaurante-premium if slug doesn't exist
  const activeSlug = slug && DEMO_CONFIGS[slug] ? slug : 'restaurante-premium';
  const config = DEMO_CONFIGS[activeSlug];

  const [lang, setLang] = useState<'pt' | 'en' | 'es'>('pt');
  const t = translations[lang];

  // Dynamic values based on resolved config
  const titleText = config.title[lang];
  const subtitleText = config.subtitle[lang];
  const menuTitleText = config.menuTitle[lang];
  const menuSubtitleText = config.menuSubtitle[lang];
  const ctaPrimary = config.ctas.primaryText[lang];
  const ctaSecondary = config.ctas.secondaryText[lang];

  // 3. Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(1);

  // 4. Reservation/Booking State
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    date: '', time: '19:00', size: '2', name: '', email: '', phone: '', note: ''
  });
  const [reservationSuccess, setReservationSuccess] = useState(false);

  // 5. Cart / Delivery State
  const [cart, setCart] = useState<Array<{ item: DemoItem; qty: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // 6. Loyalty State
  const [loyaltyPhone, setLoyaltyPhone] = useState('');
  const [loyaltyData, setLoyaltyData] = useState<{ points: number; coupon: string | null } | null>(null);

  // 7. Real Estate Interactive State
  const [propCategoryFilter, setPropCategoryFilter] = useState('todos');

  // 8. Restaurant Interactive State
  const [restCategoryFilter, setRestCategoryFilter] = useState('todos');

  const restArticles = [
    {
      title: "Harmonização de Vinhos com Carnes Nobres e Grelhados",
      category: "Sommelier & Vinhos",
      date: "22 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=400&auto=format&fit=crop"
    },
    {
      title: "Os Segredos do Molho Demi-Glace da Gastronomia Francesa",
      category: "Segredos do Chef",
      date: "18 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop"
    },
    {
      title: "A Arte das Massas Artesanais e Ingredientes Orgânicos",
      category: "Culinária de Autor",
      date: "12 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=400&auto=format&fit=crop"
    }
  ];

  // 9. Salão & Barbearia Interactive State
  const [salaoCategoryFilter, setSalaoCategoryFilter] = useState('todos');

  const salaoArticles = [
    {
      title: "Tendências de Cortes Masculinos e Barba Ritualística para 2026",
      category: "Visagismo Masculino",
      date: "24 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop"
    },
    {
      title: "Cronograma Capilar Kérastase: Como Recuperar Brilho e Nutrição",
      category: "Tratamentos & Saúde",
      date: "20 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&auto=format&fit=crop"
    },
    {
      title: "A Técnica do Visagismo: Harmonizando Corte com o Formato do Rosto",
      category: "Consultoria de Imagem",
      date: "15 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1605497746444-ac9dbd324ce8?q=80&w=400&auto=format&fit=crop"
    }
  ];

  // 10. Prestador de Serviços Interactive State
  const [servCategoryFilter, setServCategoryFilter] = useState('todos');

  const servArticles = [
    {
      title: "Manutenção Preventiva vs Corretiva: Como Reduzir Custos Operacionais",
      category: "Gestão de Facilities",
      date: "25 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400&auto=format&fit=crop"
    },
    {
      title: "Adequação à Norma NR-10 em Instalações Elétricas Industriais",
      category: "Segurança & Normas",
      date: "21 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop"
    },
    {
      title: "Eficiência Energética no Sistema de Climatização VRF para Prédios",
      category: "Climatização & Energia",
      date: "16 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=400&auto=format&fit=crop"
    }
  ];

  // Selected Property Detail Modal
  const [selectedPropertyModal, setSelectedPropertyModal] = useState<DemoItem | null>(null);
  const [activePropTab, setActivePropTab] = useState<'fotos' | 'tour' | 'mapa' | 'financiamento'>('fotos');

  // Visit Scheduling Modal
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitPropTitle, setVisitPropTitle] = useState('');
  const [visitForm, setVisitForm] = useState({ name: '', phone: '', email: '', date: '', time: '15:00', note: '' });
  const [visitSuccess, setVisitSuccess] = useState(false);

  // Property Submission Modal ("Anuncie Seu Imóvel")
  const [isListPropModalOpen, setIsListPropModalOpen] = useState(false);
  const [listPropForm, setListPropForm] = useState({ name: '', phone: '', email: '', address: '', type: 'Casa de Luxo', estValue: '', notes: '' });
  const [listPropSuccess, setListPropSuccess] = useState(false);

  // Financing Calculator State
  const [calcPrice, setCalcPrice] = useState(2500000);
  const [calcDown, setCalcDown] = useState(500000);
  const [calcMonths, setCalcMonths] = useState(360);
  const [calcRate, setCalcRate] = useState(9.5);

  const loanAmount = Math.max(0, calcPrice - calcDown);
  const monthlyRate = (calcRate / 100) / 12;
  const estimatedMonthlyPayment = monthlyRate > 0 && calcMonths > 0
    ? Math.round((loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, calcMonths))) / (Math.pow(1 + monthlyRate, calcMonths) - 1))
    : 0;

  const realtors = [
    {
      name: "Dra. Helena Martins",
      creci: "CRECI 48.912-F",
      role: "Especialista em Casas de Luxo & Alphaville",
      phone: "5514996405496",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Roberto Albuquerque",
      creci: "CRECI 39.401-F",
      role: "Especialista em Coberturas nos Jardins",
      phone: "5514996405496",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Camila Siqueira",
      creci: "CRECI 52.109-F",
      role: "Especialista em Imóveis de Praia & Balneário",
      phone: "5514996405496",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop"
    }
  ];

  const realEstateArticles = [
    {
      title: "Tendências do Mercado Imobiliário de Luxo para 2026",
      category: "Mercado & Tendências",
      date: "20 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop"
    },
    {
      title: "Como Funciona o Financiamento de Imóveis Acima de R$ 1 Milhão",
      category: "Financiamento",
      date: "15 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop"
    },
    {
      title: "Checklist Completo de Documentação para Compra Segura",
      category: "Documentação & Jurídico",
      date: "10 de Julho, 2026",
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400&auto=format&fit=crop"
    }
  ];

  // Initialize Chat Bot welcome message
  useEffect(() => {
    setChatMessages([
      {
        sender: 'bot',
        text: config.chatbot.welcome[lang]
      }
    ]);
  }, [lang, activeSlug]);

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
  const handleAddToCart = (item: DemoItem) => {
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
  const cartTotal = cartSubtotal + (cartSubtotal > 0 ? 12 : 0); // R$ 12 delivery/freight fee

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryAddress) return;
    setIsCheckoutSuccess(true);
    setTimeout(() => {
      setCart([]);
      setIsCartOpen(false);
      setIsCheckoutSuccess(false);
      alert(lang === 'pt' ? 'Pedido enviado! Sincronizado automaticamente com o Caixa (PDV) e enviado para o preparo!' : 'Order received! Automatically synced with the POS system.');
    }, 2000);
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReservationSuccess(true);
  };

  const checkLoyaltyPoints = () => {
    if (!loyaltyPhone) return;
    const numericPhone = loyaltyPhone.replace(/\D/g, '');
    const points = (numericPhone.length % 5) * 50 + 75;
    setLoyaltyData({
      points,
      coupon: points >= 150 ? 'FIDELIDADE10' : null
    });
  };

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden pb-16"
      style={{ backgroundColor: config.colorTheme.bg, color: config.colorTheme.text }}
    >
      {/* Return button overlay */}
      <div
        className="py-3 px-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ backgroundColor: `${config.colorTheme.bgPanel}F0`, borderColor: config.colorTheme.border }}
      >
        <Link to={`/templates/${activeSlug}`} className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Modelo
        </Link>
        <span className="text-[10px] text-gray-500 font-bold bg-[#1F2937]/30 px-2 py-0.5 rounded border border-gray-700/20">
          DEMO: {config.name.toUpperCase()} (RECURSOS OPCIONAIS ATIVOS)
        </span>
        {/* Language selector toggle - OPTIONAL_FEATURE: Multi-idioma */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mr-2 bg-[#1F2937]/30 px-2 py-1 rounded">
            <Globe className="w-3 h-3 text-[#5B4FE9]" />
            <span>{t.optionalBadge}</span>
          </div>
          {(['pt', 'en', 'es'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${
                lang === l ? 'bg-[#5B4FE9] text-white' : 'text-gray-400 hover:bg-[#1F2937]/30'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      {activeSlug === 'servicos-profissionais' ? (
        <div
          className="relative min-h-[550px] flex items-center justify-center text-center px-4 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(10, 17, 40, 0.85), rgba(10, 17, 40, 0.95)), url("https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1600&auto=format&fit=crop")`
          }}
        >
          <div className="max-w-4xl space-y-6 py-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#06B6D4] text-xs font-bold uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-[#06B6D4]" />
              ENGENHARIA, TECNOLOGIA & SOLUÇÕES DE ALTA PERFORMANCE
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white leading-tight">
              Prime Engenharia & Serviços Técnicos
            </h1>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              Manutenção industrial, engenharia elétrica, climatização VRF, laudos técnicos com ART e gestão de facilities com garantia SLA de até 2 horas.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={() => setIsReserveModalOpen(true)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-xl flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Solicitar Orçamento Online
              </button>
              <a
                href="#servicos-tecnicos"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <Award className="w-4 h-4 text-[#06B6D4]" />
                Ver Soluções & SLA
              </a>
              <a
                href="https://wa.me/5514996405496?text=Ola!%20Gostaria%20de%20solicitar%20um%20orcamento%20para%20minha%20empresa."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1EBE57] text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                Atendimento Comercial WhatsApp
              </a>
            </div>
          </div>
        </div>
      ) : activeSlug === 'salao-elegance' ? (
        <div
          className="relative min-h-[550px] flex items-center justify-center text-center px-4 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 5, 29, 0.85), rgba(15, 5, 29, 0.95)), url("https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600&auto=format&fit=crop")`
          }}
        >
          <div className="max-w-4xl space-y-6 py-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D946EF]/10 border border-[#D946EF]/30 text-[#D946EF] text-xs font-bold uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-[#D946EF]" />
              ESTILO, ELEGÂNCIA & VISAGISMO PESSOAL
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white leading-tight">
              Salão & Barbearia Elegance
            </h1>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              Cortes de autor, barba ritualística, coloração e tratamentos capilares com produtos Kérastase e L'Oréal em um ambiente exclusivo com bar V.I.P.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={() => setIsReserveModalOpen(true)}
                className="bg-[#D946EF] hover:bg-[#C026D3] text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-xl flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Agendar Horário Online
              </button>
              <a
                href="#servicos-salao"
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <Scissors className="w-4 h-4 text-[#D946EF]" />
                Ver Serviços & Tabela
              </a>
              <a
                href="https://wa.me/5514996405496?text=Ola!%20Gostaria%20de%20agendar%20um%20horario%20no%20Salao%20Elegance."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1EBE57] text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                WhatsApp Direct
              </a>
            </div>
          </div>
        </div>
      ) : activeSlug === 'restaurante-premium' ? (
        <div
          className="relative min-h-[550px] flex items-center justify-center text-center px-4 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(17, 13, 10, 0.85), rgba(17, 13, 10, 0.95)), url("https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop")`
          }}
        >
          <div className="max-w-4xl space-y-6 py-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E85D04]/10 border border-[#E85D04]/30 text-[#E85D04] text-xs font-bold uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-[#E85D04]" />
              ALTA GASTRONOMIA & CULINÁRIA DE AUTOR
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white leading-tight">
              Sabor & Arte — Gastronomia de Autor
            </h1>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              Experiência gastronômica inesquecível no coração da cidade. Pratos autorais, ingredientes orgânicos selecionados e carta de vinhos exclusiva.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <a
                href="#cardapio"
                className="bg-[#E85D04] hover:bg-[#D04E00] text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-xl flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Ver Cardápio Digital
              </a>
              <button
                onClick={() => setIsReserveModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <Calendar className="w-4 h-4 text-[#E85D04]" />
                Reservar Mesa V.I.P
              </button>
              <a
                href="https://wa.me/5514996405496?text=Ola!%20Gostaria%20de%20informacoes%20sobre%20reservas%20e%20cardapio."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1EBE57] text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                Atendimento WhatsApp
              </a>
            </div>
          </div>
        </div>
      ) : activeSlug === 'imobiliaria-premium' ? (
        <div className="relative">
          {/* Fullscreen Luxury Hero */}
          <div
            className="relative min-h-[580px] flex items-center justify-center text-center px-4 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(11, 15, 25, 0.75), rgba(11, 15, 25, 0.95)), url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop")`
            }}
          >
            <div className="max-w-4xl space-y-6 py-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] text-xs font-bold uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 fill-[#D97706]" />
                IMÓVEIS DE ALTO PADRÃO & EXCLUSIVIDADE
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white leading-tight">
                Encontre o imóvel ideal <br className="hidden sm:inline" /> para sua família.
              </h1>
              <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                Casas de luxo, coberturas nos melhores bairros, terrenos e imóveis comerciais selecionados com rigor.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <a
                  href="#imoveis"
                  className="bg-[#D97706] hover:bg-[#B45309] text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-xl flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Ver Imóveis
                </a>
                <button
                  onClick={() => setIsListPropModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  <Home className="w-4 h-4 text-[#D97706]" />
                  Anuncie seu Imóvel
                </button>
                <a
                  href="https://wa.me/5514996405496"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#1EBE57] text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
                >
                  <Phone className="w-4 h-4" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Hero for other templates */
        <div
          className="relative h-[480px] flex items-center justify-center text-center px-4 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(10, 10, 12, 0.8), rgba(10, 10, 12, 0.95)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop")`
          }}
        >
          <div className="max-w-3xl space-y-6">
            <h1
              className="text-4xl sm:text-6xl font-serif font-black tracking-tight"
              style={{ color: config.colorTheme.primary }}
            >
              {titleText}
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              {subtitleText}
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="#servicos"
                className="text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                style={{ backgroundColor: config.colorTheme.primary }}
              >
                <ShoppingBag className="w-4 h-4" />
                {ctaPrimary}
              </a>
              <button
                onClick={() => setIsReserveModalOpen(true)}
                className="bg-transparent border border-white hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#5B4FE9]" />
                {ctaSecondary}
                <span className="text-[8px] bg-[#5B4FE9] text-white px-1 py-0.5 rounded-full font-bold ml-1">OPCIONAL</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Seção 2: Sobre a Empresa (Prime Engenharia & Serviços Técnicos) */}
      {activeSlug === 'servicos-profissionais' && (
        <div className="max-w-6xl mx-auto px-4 py-16 border-b border-[#1F2937]">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest block">AUTORIDADE & ENGENHARIA</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                Soluções Técnicas Integradas para Empresas e Indústrias
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Desde 2012, a Prime Engenharia & Serviços Técnicos presta consultoria, manutenção preventiva/corretiva e gestão de facilities para indústrias, edifícios corporativos e condomínios empresariais. Operamos sob os mais rigorosos padrões de segurança e certificação ISO 9001.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="bg-[#111827] p-4 rounded-2xl border border-[#1F2937]">
                  <span className="text-[#3B82F6] font-bold block text-sm mb-1">Corpo Técnico Credenciado</span>
                  <p className="text-gray-400">Engenheiros e técnicos registrados no CREA com certificações NBR e NR-10/NR-35.</p>
                </div>
                <div className="bg-[#111827] p-4 rounded-2xl border border-[#1F2937]">
                  <span className="text-[#06B6D4] font-bold block text-sm mb-1">Garantia de SLA 2h</span>
                  <p className="text-gray-400">Atendimento emergencial de alta prioridade com tempo de resposta contratual garantido.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-[#1F2937] shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop"
                  alt="Engenharia & Soluções Técnicas"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
                  <span className="text-xs text-[#06B6D4] font-bold uppercase tracking-wider">Diretoria Técnica</span>
                  <h3 className="text-xl font-serif font-bold text-white">Eng. Eduardo Vasconcelos</h3>
                  <p className="text-xs text-gray-300">Engenheiro Eletricista · CREA 50694829-SP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção 3: Serviços Interativos (Prime Engenharia & Serviços Técnicos) */}
      {activeSlug === 'servicos-profissionais' && (
        <div id="servicos-tecnicos" className="max-w-6xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest block">CATÁLOGO DE SOLUÇÕES TÉCNICAS</span>
              <h2 className="text-3xl font-serif font-bold text-white">Serviços Especiais & Manutenção</h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400 bg-[#111827] border border-[#1F2937] px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
              Laudos com ART Emita Online
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar text-xs">
            {[
              { id: 'todos', label: 'Todas as Soluções' },
              { id: 'eletrica', label: 'Engenharia Elétrica & NR-10' },
              { id: 'climatizacao', label: 'Climatização & PMOC' },
              { id: 'seguranca', label: 'CFTV & Controle de Acesso' },
              { id: 'laudos', label: 'Laudos ART & Perícias' },
              { id: 'facilities', label: 'Gestão de Facilities' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setServCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  servCategoryFilter === cat.id
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-lg'
                    : 'bg-[#111827] text-gray-300 border-[#1F2937] hover:border-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seção 2: Sobre a Empresa (Salão & Barbearia Elegance) */}
      {activeSlug === 'salao-elegance' && (
        <div className="max-w-6xl mx-auto px-4 py-16 border-b border-[#311A4D]">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <span className="text-xs font-bold text-[#D946EF] uppercase tracking-widest block">SOBRE O SALÃO & BARBEARIA</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                Tradição em Visagismo, Estilo e Cuidado Pessoal de Excelência
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Desde 2016, o Salão & Barbearia Elegance unifica a arte da barbearia tradicional com as últimas tendências internacionais em visagismo, corte e tratamentos capilares femininos e masculinos. Nossa equipe é composta por profissionais certificados e especializados.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="bg-[#190C2C] p-4 rounded-2xl border border-[#311A4D]">
                  <span className="text-[#D946EF] font-bold block text-sm mb-1">Visagismo Personalizado</span>
                  <p className="text-gray-400">Análise do formato do rosto e estilo para criar um visual harmonioso e único.</p>
                </div>
                <div className="bg-[#190C2C] p-4 rounded-2xl border border-[#311A4D]">
                  <span className="text-[#D946EF] font-bold block text-sm mb-1">Marcas Importadas</span>
                  <p className="text-gray-400">Utilizamos exclusivamente cosméticos de alta performance Kérastase, L'Oréal e Keune.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-[#311A4D] shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop"
                  alt="Equipe de Visagistas"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
                  <span className="text-xs text-[#D946EF] font-bold uppercase tracking-wider">Master Visagista</span>
                  <h3 className="text-xl font-serif font-bold text-white">Gabriel & Juliana Mello</h3>
                  <p className="text-xs text-gray-300">Especialistas em Visagismo e Coloração Internacional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção 3: Serviços Interativos (Salão & Barbearia Elegance) */}
      {activeSlug === 'salao-elegance' && (
        <div id="servicos-salao" className="max-w-6xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#D946EF] uppercase tracking-widest block">TABELA DE SERVIÇOS PREMIUM</span>
              <h2 className="text-3xl font-serif font-bold text-white">Serviços & Agendamento Online</h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400 bg-[#190C2C] border border-[#311A4D] px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-[#D946EF]" />
              Agendamento 24/7 Ativo
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar text-xs">
            {[
              { id: 'todos', label: 'Todos os Serviços' },
              { id: 'cortes', label: 'Cortes & Visagismo' },
              { id: 'barba', label: 'Barba & Toalha Quente' },
              { id: 'coloracao', label: 'Coloração & Mechas' },
              { id: 'tratamentos', label: 'Tratamentos Kérastase' },
              { id: 'estetica', label: 'Estética & Manicure' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSalaoCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  salaoCategoryFilter === cat.id
                    ? 'bg-[#D946EF] text-white border-[#D946EF] shadow-lg'
                    : 'bg-[#190C2C] text-gray-300 border-[#311A4D] hover:border-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seção 2: Sobre a Empresa (Restaurante Premium) */}
      {activeSlug === 'restaurante-premium' && (
        <div className="max-w-6xl mx-auto px-4 py-16 border-b border-[#2C241D]">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <span className="text-xs font-bold text-[#E85D04] uppercase tracking-widest block">NOSSA HISTÓRIA & CULINÁRIA</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                Paixão por Sabores Autênticos e Momentos Inesquecíveis
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Fundado em 2014, o Restaurante Sabor & Arte nasceu da união entre a alta gastronomia contemporânea e os ingredientes mais nobres da produção local. Sob o comando do Chef Executivo Rodrigo Mello, nossa cozinha celebra a culinária de autor com técnicas internacionais e rigor artesanal.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="bg-[#1C1612] p-4 rounded-2xl border border-[#2C241D]">
                  <span className="text-[#E85D04] font-bold block text-sm mb-1">Missão</span>
                  <p className="text-gray-400">Proporcionar jornadas sensoriais únicas através de pratos preparados com alma e precisão.</p>
                </div>
                <div className="bg-[#1C1612] p-4 rounded-2xl border border-[#2C241D]">
                  <span className="text-[#E85D04] font-bold block text-sm mb-1">Visão</span>
                  <p className="text-gray-400">Ser referência nacional em gastronomia de autor, atendimento atencioso e adega exclusiva.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-[#2C241D] shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop"
                  alt="Chef Executivo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
                  <span className="text-xs text-[#E85D04] font-bold uppercase tracking-wider">Chef Executivo</span>
                  <h3 className="text-xl font-serif font-bold text-white">Rodrigo Mello</h3>
                  <p className="text-xs text-gray-300">Premiação Culinária 2025 · Formado pela Le Cordon Bleu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção 3: Cardápio Digital (Restaurante Premium) */}
      {activeSlug === 'restaurante-premium' && (
        <div id="cardapio" className="max-w-6xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#E85D04] uppercase tracking-widest block">CARDÁPIO DIGITAL INTERATIVO</span>
              <h2 className="text-3xl font-serif font-bold text-white">Nossa Seleção Gastronômica</h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400 bg-[#1C1612] border border-[#2C241D] px-3 py-1.5 rounded-full">
              <ShoppingBag className="w-3.5 h-3.5 text-[#E85D04]" />
              Delivery & Reservas Ativos
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar text-xs">
            {[
              { id: 'todos', label: 'Todos os Pratos' },
              { id: 'entradas', label: 'Entradas & Saladas' },
              { id: 'principais', label: 'Carnes & Massas' },
              { id: 'peixes', label: 'Peixes & Frutos do Mar' },
              { id: 'sobremesas', label: 'Sobremesas Artesanais' },
              { id: 'vinhos', label: 'Carta de Vinhos & Coquetéis' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setRestCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  restCategoryFilter === cat.id
                    ? 'bg-[#E85D04] text-white border-[#E85D04] shadow-lg'
                    : 'bg-[#1C1612] text-gray-300 border-[#2C241D] hover:border-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Real Estate Categories Bar */}
      {activeSlug === 'imobiliaria-premium' && (
        <div id="imoveis" className="max-w-6xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block">CATÁLOGO EXCLUSIVO</span>
              <h2 className="text-3xl font-serif font-bold text-white">Imóveis de Alto Padrão em Destaque</h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400 bg-[#111827] border border-gray-800 px-3 py-1.5 rounded-full">
              <Building className="w-3.5 h-3.5 text-[#D97706]" />
              Exclusividade & Atendimento V.I.P
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar text-xs">
            {[
              { id: 'todos', label: 'Todos os Imóveis' },
              { id: 'venda', label: 'Comprar' },
              { id: 'aluguel', label: 'Alugar' },
              { id: 'lancamento', label: 'Lançamentos' },
              { id: 'alto-padrao', label: 'Alto Padrão' },
              { id: 'comercial', label: 'Comercial' },
              { id: 'terrenos', label: 'Terrenos' },
              { id: 'casas', label: 'Casas' },
              { id: 'apartamentos', label: 'Apartamentos' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setPropCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  propCategoryFilter === cat.id
                    ? 'bg-[#D97706] text-white border-[#D97706] shadow-lg'
                    : 'bg-[#111827] text-gray-300 border-gray-800 hover:border-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Services/Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {activeSlug !== 'imobiliaria-premium' && (
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold" style={{ color: config.colorTheme.primary }}>
              {menuTitleText}
            </h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm">{menuSubtitleText}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.items.map(item => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden transition-all flex flex-col border group hover:border-[#D97706]/50"
              style={{
                backgroundColor: config.colorTheme.bgPanel,
                borderColor: config.colorTheme.border
              }}
            >
              <div className="h-56 overflow-hidden relative">
                <img src={item.image} alt={item.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-bold bg-[#111827]/90 text-white px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{activeSlug === 'imobiliaria-premium' ? 'ALTO PADRÃO' : `${t.optionalBadge}: Foto Profissional`}</span>
                </div>
                <div className="absolute top-3 right-3 bg-[#D97706] text-white px-3 py-1 rounded-xl text-xs font-black shadow-lg">
                  R$ {item.price.toLocaleString('pt-BR')}
                </div>
                {activeSlug === 'imobiliaria-premium' && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-gray-300 text-[10px] px-2 py-0.5 rounded font-mono">
                    <Video className="w-3 h-3 text-amber-400" />
                    TOUR 360° DISPONÍVEL
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-white font-serif">{item.name[lang]}</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{item.description[lang]}</p>
                </div>

                {activeSlug === 'imobiliaria-premium' && (
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-gray-300 py-2 border-y border-gray-800 text-center font-medium">
                    <div className="bg-[#0B0F19] p-1.5 rounded-lg border border-gray-800">
                      <span className="block text-gray-500 text-[9px]">ÁREA</span>
                      <strong className="text-white">450m²</strong>
                    </div>
                    <div className="bg-[#0B0F19] p-1.5 rounded-lg border border-gray-800">
                      <span className="block text-gray-500 text-[9px]">SUÍTES</span>
                      <strong className="text-white">4</strong>
                    </div>
                    <div className="bg-[#0B0F19] p-1.5 rounded-lg border border-gray-800">
                      <span className="block text-gray-500 text-[9px]">BANHOS</span>
                      <strong className="text-white">6</strong>
                    </div>
                    <div className="bg-[#0B0F19] p-1.5 rounded-lg border border-gray-800">
                      <span className="block text-gray-500 text-[9px]">VAGAS</span>
                      <strong className="text-white">6</strong>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-1 flex gap-2">
                  {activeSlug === 'imobiliaria-premium' ? (
                    <>
                      <button
                        onClick={() => setSelectedPropertyModal(item)}
                        className="flex-1 bg-[#D97706] hover:bg-[#B45309] text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => {
                          setVisitPropTitle(item.name.pt);
                          setIsVisitModalOpen(true);
                        }}
                        className="bg-[#1F2937] hover:bg-gray-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-gray-700"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                        Visita
                      </button>
                    </>
                  ) : config.ctas.type === 'cart' ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: `${config.colorTheme.primary}10`,
                        color: config.colorTheme.primary,
                        borderColor: `${config.colorTheme.primary}30`
                      }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Adicionar ao Pedido
                      <span className="text-[7px] bg-[#5B4FE9] text-white px-1.5 py-0.5 rounded font-black">DELIVERY</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsReserveModalOpen(true)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: `${config.colorTheme.primary}10`,
                        color: config.colorTheme.primary,
                        borderColor: `${config.colorTheme.primary}30`
                      }}
                    >
                      {config.ctas.type === 'booking' ? <Calendar className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                      {ctaSecondary}
                      <span className="text-[7px] bg-[#5B4FE9] text-white px-1.5 py-0.5 rounded font-black">AGENDA</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção 4: Diferenciais Corporativos (Prime Engenharia & Serviços Técnicos) */}
      {activeSlug === 'servicos-profissionais' && (
        <div className="max-w-6xl mx-auto px-4 py-16 border-t border-[#1F2937]">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest block">EXCELÊNCIA & SEGURANÇA</span>
            <h2 className="text-3xl font-serif font-bold text-white">Nossos Diferenciais Corporativos</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm">Vantagens estratégicas que garantem continuidade operacional e conformidade legal.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { icon: '📜', title: 'Equipe Credenciada CREA', desc: 'Engenheiros e técnicos habilitados com emissão imediata de ART por projeto.' },
              { icon: '⚡', title: 'SLA de Emergência 2h', desc: 'Plantão técnico 24/7 com tempo de atendimento garantido em contrato de manutenção.' },
              { icon: '🔒', title: 'Garantia Por Escrito', desc: 'Cobertura contratual completa de peças, mão de obra e suporte pós-execução.' },
              { icon: '📄', title: 'Laudos Com QrCode', desc: 'Documentação digital criptografada válida perante seguradoras e órgãos reguladores.' }
            ].map((diff, i) => (
              <div key={i} className="bg-[#111827] p-6 rounded-2xl border border-[#1F2937] hover:border-[#3B82F6]/50 transition-all space-y-3">
                <div className="text-3xl">{diff.icon}</div>
                <h3 className="font-bold text-white text-base font-serif">{diff.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{diff.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 5: Galeria de Projetos & Obras (Prime Engenharia & Serviços) */}
      {activeSlug === 'servicos-profissionais' && (
        <div className="max-w-6xl mx-auto px-4 py-12 border-t border-[#1F2937]">
          <div className="flex items-center justify-between mb-8 text-left">
            <div>
              <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest block">PORTFÓLIO TÉCNICO</span>
              <h2 className="text-3xl font-serif font-bold text-white">Projetos & Instalações Realizadas</h2>
            </div>
            <span className="text-xs text-gray-400 font-mono hidden sm:inline">OBRAS INDUSTRIAIS E CORPORATIVAS</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop"
            ].map((img, i) => (
              <div key={i} className="h-48 rounded-2xl overflow-hidden border border-[#1F2937] group relative cursor-pointer">
                <img src={img} alt="Galeria de Obras" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#06B6D4]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 7: Estatísticas Corporativas (Prime Engenharia) */}
      {activeSlug === 'servicos-profissionais' && (
        <div className="max-w-6xl mx-auto px-4 py-12 border-t border-[#1F2937]">
          <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#3B82F6] font-mono">+1.200</div>
              <span className="text-xs text-gray-400 font-medium">Projetos & Obras Concluídas</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">99.4%</div>
              <span className="text-xs text-gray-400 font-medium">Conformidade com SLA</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#06B6D4] font-mono">85</div>
              <span className="text-xs text-gray-400 font-medium">Técnicos & Engenheiros</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">14 Anos</div>
              <span className="text-xs text-gray-400 font-medium">História em Engenharia</span>
            </div>
          </div>
        </div>
      )}

      {/* Seção 8: FAQ Corporativo (Prime Engenharia) */}
      {activeSlug === 'servicos-profissionais' && (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-left border-t border-[#1F2937]">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest block">ESCLARECIMENTOS</span>
            <h2 className="text-3xl font-serif font-bold text-white">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { q: "Como solicitar uma proposta técnica e orçamento?", a: "Preencha o formulário online ou envie o escopo do projeto via WhatsApp. Nossa engenharia enviará a proposta comercial detalhada em até 24 horas." },
              { q: "A empresa emite Anotação de Responsabilidade Técnica (ART)?", a: "Sim! Todos os nossos projetos elétricos, laudos e manutenções prediais incluem a emissão de ART registrada no CREA-SP." },
              { q: "Como funciona o contrato de manutenção preventiva (PMOC)?", a: "Oferecemos planos de PMOC personalizados para empresas e condomínios, garantindo auditorias mensais e atendimento emergencial prioritário." },
              { q: "Quais são as condições e prazos de faturamento corporativo?", a: "Trabalhamos com faturamento faturado para PJ (15/30/45 dias), boleto bancário e nota fiscal eletrônica direta." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#111827] p-5 rounded-2xl border border-[#1F2937] space-y-2">
                <h3 className="font-bold text-white text-sm font-serif flex items-center gap-2">
                  <span className="text-[#06B6D4]">●</span> {faq.q}
                </h3>
                <p className="text-gray-400 leading-relaxed pl-4">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 9: Blog Técnico (Prime Engenharia) */}
      {activeSlug === 'servicos-profissionais' && (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 border-t border-[#1F2937] text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest block">ENGENHARIA & INTELIGÊNCIA</span>
              <h2 className="text-3xl font-serif font-bold text-white">Blog Técnico & Normas</h2>
            </div>
            <button className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#06B6D4] font-bold hover:underline">
              Ver Todos os Artigos →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {servArticles.map((art, i) => (
              <div key={i} className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden group hover:border-[#3B82F6]/40 transition-all flex flex-col">
                <div className="h-44 overflow-hidden relative">
                  <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-black/80 text-[#06B6D4] border border-[#06B6D4]/30 text-[9px] font-bold px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono">{art.date}</span>
                    <h3 className="font-bold text-white text-sm font-serif mt-1 leading-snug group-hover:text-[#3B82F6] transition-colors">{art.title}</h3>
                  </div>
                  <span className="text-[11px] text-[#06B6D4] font-bold flex items-center gap-1 pt-2 border-t border-[#1F2937]">
                    Ler Artigo Completo →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 10: Sede Corporativa (Prime Engenharia) */}
      {activeSlug === 'servicos-profissionais' && (
        <div className="max-w-6xl mx-auto px-4 py-12 border-t border-[#1F2937] text-left">
          <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest block">SEDE CORPORATIVA</span>
              <h3 className="text-2xl font-serif font-bold text-white">Nossas Instalações</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Central de operações técnicas e atendimento a clientes corporativos em localização estratégica.
              </p>

              <div className="space-y-3 text-xs text-gray-300 pt-2">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#06B6D4]" />
                  <span>Av. Brigadeiro Faria Lima, 3477 - Cj. 142 — São Paulo, SP</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#06B6D4]" />
                  <span>(11) 4003-8920 · comercial@primeservicos.com.br</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#06B6D4]" />
                  <span>Seg a Sex: 08h - 18h | Plantão Emergencial 24h</span>
                </div>
              </div>
            </div>

            <div className="h-64 bg-[#0A1128] border border-[#1F2937] rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
              <MapPin className="w-10 h-10 text-[#06B6D4]" />
              <h4 className="font-bold text-white text-sm">Google Maps Integrado</h4>
              <p className="text-xs text-gray-400">Clique para visualizar rota para nossa Sede Corporativa</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2563EB] text-white px-4 py-2 rounded-xl text-xs font-bold mt-2"
              >
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Seção 4: Diferenciais da Beleza (Salão & Barbearia Elegance) */}
      {activeSlug === 'salao-elegance' && (
        <div className="max-w-6xl mx-auto px-4 py-16 border-t border-[#311A4D]">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold text-[#D946EF] uppercase tracking-widest block">EXCLUSIVIDADE & BEM-ESTAR</span>
            <h2 className="text-3xl font-serif font-bold text-white">Diferenciais do Salão Elegance</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm">Por que nossos clientes nos escolhem para cuidar da sua imagem e autoestima.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { icon: '✂️', title: 'Visagistas Certificados', desc: 'Profissionais com especialização internacional e análise técnica individual.' },
              { icon: '🍹', title: 'Bar & Drinks V.I.P', desc: 'Espaço relaxante com café expresso, drinks autorais e cervejas artesanais gratuitas.' },
              { icon: '📲', title: 'Agendamento 24/7', desc: 'Marcação online simplificada com lembrete automático no seu WhatsApp.' },
              { icon: '🧪', title: 'Produtos Importados', desc: 'Kérastase, L\'Oréal e Keune aplicados com protocolos originais das marcas.' }
            ].map((diff, i) => (
              <div key={i} className="bg-[#190C2C] p-6 rounded-2xl border border-[#311A4D] hover:border-[#D946EF]/50 transition-all space-y-3">
                <div className="text-3xl">{diff.icon}</div>
                <h3 className="font-bold text-white text-base font-serif">{diff.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{diff.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 5: Galeria de Transformações (Salão & Barbearia Elegance) */}
      {activeSlug === 'salao-elegance' && (
        <div className="max-w-6xl mx-auto px-4 py-12 border-t border-[#311A4D]">
          <div className="flex items-center justify-between mb-8 text-left">
            <div>
              <span className="text-xs font-bold text-[#D946EF] uppercase tracking-widest block">PORTFÓLIO DE RESULTADOS</span>
              <h2 className="text-3xl font-serif font-bold text-white">Galeria de Transformações</h2>
            </div>
            <span className="text-xs text-gray-400 font-mono hidden sm:inline">RESULTADOS REAIS DA NOSSA EQUIPE</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1605497746444-ac9dbd324ce8?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=600&auto=format&fit=crop"
            ].map((img, i) => (
              <div key={i} className="h-48 rounded-2xl overflow-hidden border border-[#311A4D] group relative cursor-pointer">
                <img src={img} alt="Galeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#D946EF]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 7: Estatísticas do Salão (Salão & Barbearia Elegance) */}
      {activeSlug === 'salao-elegance' && (
        <div className="max-w-6xl mx-auto px-4 py-12 border-t border-[#311A4D]">
          <div className="bg-[#190C2C] border border-[#311A4D] rounded-3xl p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#D946EF] font-mono">+4.800</div>
              <span className="text-xs text-gray-400 font-medium">Atendimentos / Mês</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">4.9 / 5.0</div>
              <span className="text-xs text-gray-400 font-medium">Avaliação Média no Google</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#D946EF] font-mono">18</div>
              <span className="text-xs text-gray-400 font-medium">Profissionais Especialistas</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">10 Anos</div>
              <span className="text-xs text-gray-400 font-medium">Excelência & Estilo</span>
            </div>
          </div>
        </div>
      )}

      {/* Seção 8: FAQ (Salão & Barbearia Elegance) */}
      {activeSlug === 'salao-elegance' && (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-left border-t border-[#311A4D]">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#D946EF] uppercase tracking-widest block">DÚVIDAS FREQUENTES</span>
            <h2 className="text-3xl font-serif font-bold text-white">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { q: "Como funciona o agendamento online?", a: "Você escolhe o serviço desejado, o profissional de sua preferência, a data e horário. A confirmação chega direto no seu WhatsApp." },
              { q: "Qual é a tolerância em caso de atraso?", a: "Mantemos uma tolerância de até 15 minutos para garantir o atendimento com a máxima qualidade e sem atrasar os próximos clientes." },
              { q: "Quais marcas de cosméticos são utilizadas?", a: "Utilizamos exclusivamente linhas profissionais Kérastase, L'Oréal Professionnel e Keune." },
              { q: "Posso ser atendido sem agendamento prévio?", a: "Sim, porém o atendimento sem reserva fica sujeito à disponibilidade da equipe no momento da chegada." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#190C2C] p-5 rounded-2xl border border-[#311A4D] space-y-2">
                <h3 className="font-bold text-white text-sm font-serif flex items-center gap-2">
                  <span className="text-[#D946EF]">●</span> {faq.q}
                </h3>
                <p className="text-gray-400 leading-relaxed pl-4">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 9: Blog de Tendências (Salão & Barbearia Elegance) */}
      {activeSlug === 'salao-elegance' && (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 border-t border-[#311A4D] text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#D946EF] uppercase tracking-widest block">DICAS DE BELEZA & VISAGISMO</span>
              <h2 className="text-3xl font-serif font-bold text-white">Blog de Tendências & Estilo</h2>
            </div>
            <button className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#D946EF] font-bold hover:underline">
              Ver Todos os Artigos →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {salaoArticles.map((art, i) => (
              <div key={i} className="bg-[#190C2C] border border-[#311A4D] rounded-2xl overflow-hidden group hover:border-[#D946EF]/40 transition-all flex flex-col">
                <div className="h-44 overflow-hidden relative">
                  <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-black/80 text-[#D946EF] border border-[#D946EF]/30 text-[9px] font-bold px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono">{art.date}</span>
                    <h3 className="font-bold text-white text-sm font-serif mt-1 leading-snug group-hover:text-[#D946EF] transition-colors">{art.title}</h3>
                  </div>
                  <span className="text-[11px] text-[#D946EF] font-bold flex items-center gap-1 pt-2 border-t border-[#311A4D]">
                    Ler Artigo Completo →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 10: Localização (Salão & Barbearia Elegance) */}
      {activeSlug === 'salao-elegance' && (
        <div className="max-w-6xl mx-auto px-4 py-12 border-t border-[#311A4D] text-left">
          <div className="bg-[#190C2C] border border-[#311A4D] rounded-3xl p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#D946EF] uppercase tracking-widest block">LOCALIZAÇÃO PREMIUM</span>
              <h3 className="text-2xl font-serif font-bold text-white">Nosso Espaço</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Localizado em região nobre com facilidade de acesso, estacionamento com valete e bar exclusivo.
              </p>

              <div className="space-y-3 text-xs text-gray-300 pt-2">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#D946EF]" />
                  <span>Rua Oscar Freire, 890 — São Paulo, SP</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#D946EF]" />
                  <span>(14) 99640-5496 · contato@salaoelegance.com.br</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#D946EF]" />
                  <span>Seg a Sáb: 09h - 20h | Dom: 10h - 16h</span>
                </div>
              </div>
            </div>

            <div className="h-64 bg-[#0F051D] border border-[#311A4D] rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
              <MapPin className="w-10 h-10 text-[#D946EF]" />
              <h4 className="font-bold text-white text-sm">Google Maps Integrado</h4>
              <p className="text-xs text-gray-400">Clique para abrir rotas no Waze ou Google Maps</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#D946EF] text-white px-4 py-2 rounded-xl text-xs font-bold mt-2"
              >
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Seção 4: Diferenciais Gastronômicos (Restaurante Premium) */}
      {activeSlug === 'restaurante-premium' && (
        <div className="max-w-6xl mx-auto px-4 py-16 border-t border-[#2C241D]">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold text-[#E85D04] uppercase tracking-widest block">EXCELÊNCIA & QUALIDADE</span>
            <h2 className="text-3xl font-serif font-bold text-white">Nossos Diferenciais Gastronômicos</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm">Vantagens exclusivas que tornam cada visita ao Sabor & Arte inesquecível.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { icon: '🥬', title: 'Ingredientes Orgânicos', desc: 'Insumos 100% selecionados diariamente de produtores locais credenciados.' },
              { icon: '🍷', title: 'Adega Climatizada', desc: 'Mais de 300 rótulos nacionais e internacionais com curadoria de sommelier.' },
              { icon: '🎶', title: 'Acústica & Conforto', desc: 'Ambiente climatizado com acústica planejada e iluminação cênica suave.' },
              { icon: '🚗', title: 'Serviço de Valet', desc: 'Estacionamento privativo com manobristas na porta para sua total comodidade.' }
            ].map((diff, i) => (
              <div key={i} className="bg-[#1C1612] p-6 rounded-2xl border border-[#2C241D] hover:border-[#E85D04]/50 transition-all space-y-3">
                <div className="text-3xl">{diff.icon}</div>
                <h3 className="font-bold text-white text-base font-serif">{diff.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{diff.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 5: Galeria de Fotos (Restaurante Premium) */}
      {activeSlug === 'restaurante-premium' && (
        <div className="max-w-6xl mx-auto px-4 py-12 border-t border-[#2C241D]">
          <div className="flex items-center justify-between mb-8 text-left">
            <div>
              <span className="text-xs font-bold text-[#E85D04] uppercase tracking-widest block">EXPERIÊNCIA VISUAL</span>
              <h2 className="text-3xl font-serif font-bold text-white">Galeria Gastronômica</h2>
            </div>
            <span className="text-xs text-gray-400 font-mono hidden sm:inline">FOTOS EM ALTA RESOLUÇÃO</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"
            ].map((img, i) => (
              <div key={i} className="h-48 rounded-2xl overflow-hidden border border-[#2C241D] group relative cursor-pointer">
                <img src={img} alt="Galeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#E85D04]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 7: Estatísticas & Números da Casa (Restaurante Premium) */}
      {activeSlug === 'restaurante-premium' && (
        <div className="max-w-6xl mx-auto px-4 py-12 border-t border-[#2C241D]">
          <div className="bg-[#1C1612] border border-[#2C241D] rounded-3xl p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#E85D04] font-mono">+3.500</div>
              <span className="text-xs text-gray-400 font-medium">Clientes Atendidos / Mês</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">4.9 / 5.0</div>
              <span className="text-xs text-gray-400 font-medium">Avaliação Média no Google</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#E85D04] font-mono">+15</div>
              <span className="text-xs text-gray-400 font-medium">Prêmios Gastronômicos</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">12 Anos</div>
              <span className="text-xs text-gray-400 font-medium">Tradição & Culinária</span>
            </div>
          </div>
        </div>
      )}

      {/* Seção 8: FAQ - Perguntas Frequentes (Restaurante Premium) */}
      {activeSlug === 'restaurante-premium' && (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-left border-t border-[#2C241D]">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#E85D04] uppercase tracking-widest block">TIRE SUAS DÚVIDAS</span>
            <h2 className="text-3xl font-serif font-bold text-white">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { q: "Qual é o horário de funcionamento do restaurante?", a: "Funcionamos de Terça a Sábado das 19h às 23h30 para Jantar, e aos Sábados e Domingos das 12h às 16h para Almoço." },
              { q: "É obrigatório fazer reserva com antecedência?", a: "Recomendamos fortemente a reserva prévia nos fins de semana e datas comemorativas para garantir sua mesa no salão principal ou varanda." },
              { q: "O restaurante possui taxa de rolha de vinho?", a: "Sim! Permitimos a entrada de vinhos especiais com taxa de rolha de R$ 60 por garrafa." },
              { q: "Existe serviço de valet parking no local?", a: "Sim, contamos com manobristas na porta e estacionamento privativo coberto durante todo o período de atendimento." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#1C1612] p-5 rounded-2xl border border-[#2C241D] space-y-2">
                <h3 className="font-bold text-white text-sm font-serif flex items-center gap-2">
                  <span className="text-[#E85D04]">●</span> {faq.q}
                </h3>
                <p className="text-gray-400 leading-relaxed pl-4">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 9: Blog Gastronômico (Restaurante Premium) */}
      {activeSlug === 'restaurante-premium' && (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 border-t border-[#2C241D] text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#E85D04] uppercase tracking-widest block">CONTEÚDO EXCLUSIVO</span>
              <h2 className="text-3xl font-serif font-bold text-white">Blog Gastronômico & Sommelier</h2>
            </div>
            <button className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#E85D04] font-bold hover:underline">
              Ver Todos os Artigos →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {restArticles.map((art, i) => (
              <div key={i} className="bg-[#1C1612] border border-[#2C241D] rounded-2xl overflow-hidden group hover:border-[#E85D04]/40 transition-all flex flex-col">
                <div className="h-44 overflow-hidden relative">
                  <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-black/80 text-[#E85D04] border border-[#E85D04]/30 text-[9px] font-bold px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono">{art.date}</span>
                    <h3 className="font-bold text-white text-sm font-serif mt-1 leading-snug group-hover:text-[#E85D04] transition-colors">{art.title}</h3>
                  </div>
                  <span className="text-[11px] text-[#E85D04] font-bold flex items-center gap-1 pt-2 border-t border-[#2C241D]">
                    Ler Artigo Completo →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 10: Localização & Contato (Restaurante Premium) */}
      {activeSlug === 'restaurante-premium' && (
        <div className="max-w-6xl mx-auto px-4 py-12 border-t border-[#2C241D] text-left">
          <div className="bg-[#1C1612] border border-[#2C241D] rounded-3xl p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#E85D04] uppercase tracking-widest block">ONDE ESTAMOS</span>
              <h3 className="text-2xl font-serif font-bold text-white">Venha nos Visitar</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Localizado no coração da gastronomia da cidade, com ambiente intimista, climatizado e manobrista exclusivo.
              </p>

              <div className="space-y-3 text-xs text-gray-300 pt-2">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#E85D04]" />
                  <span>Av. Jardins da Gastronomia, 1420 — São Paulo, SP</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#E85D04]" />
                  <span>(14) 99640-5496 · reservas@saborarte.com.br</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#E85D04]" />
                  <span>Terç a Sáb: 19h - 23h30 | Sáb e Dom: 12h - 16h</span>
                </div>
              </div>
            </div>

            <div className="h-64 bg-[#110D0A] border border-[#2C241D] rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
              <MapPin className="w-10 h-10 text-[#E85D04]" />
              <h4 className="font-bold text-white text-sm">Google Maps Integrado</h4>
              <p className="text-xs text-gray-400">Clique para abrir rotas no Waze ou Google Maps</p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E85D04] text-white px-4 py-2 rounded-xl text-xs font-bold mt-2"
              >
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Real Estate Financing Simulator Widget */}
      {activeSlug === 'imobiliaria-premium' && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-bold bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] px-3 py-1 rounded-full uppercase">
              <Calculator className="w-3 h-3" />
              Recurso Opcional: Simulador Avançado
            </div>

            <div className="max-w-2xl mb-8">
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block mb-1">CÁLCULO EM TEMPO REAL</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">Simulador de Financiamento Imobiliário</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Simule as parcelas do seu imóvel de alto padrão com taxas de juros atualizadas dos principais bancos (Caixa, Itaú, Bradesco, Santander).
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Inputs */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-gray-300 font-semibold mb-1">
                    <span>Valor do Imóvel</span>
                    <span className="text-[#D97706] font-bold">R$ {calcPrice.toLocaleString('pt-BR')}</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="20000000"
                    step="250000"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(Number(e.target.value))}
                    className="w-full accent-[#D97706] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-gray-300 font-semibold mb-1">
                    <span>Entrada Estimada</span>
                    <span className="text-[#D97706] font-bold">R$ {calcDown.toLocaleString('pt-BR')} ({Math.round((calcDown / calcPrice) * 100)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max={calcPrice * 0.8}
                    step="50000"
                    value={calcDown}
                    onChange={(e) => setCalcDown(Number(e.target.value))}
                    className="w-full accent-[#D97706] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 font-semibold block mb-1">Prazo (Meses)</label>
                    <select
                      value={calcMonths}
                      onChange={(e) => setCalcMonths(Number(e.target.value))}
                      className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="120">120 meses (10 anos)</option>
                      <option value="240">240 meses (20 anos)</option>
                      <option value="360">360 meses (30 anos)</option>
                      <option value="420">420 meses (35 anos)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 font-semibold block mb-1">Taxa de Juros (a.a.)</label>
                    <select
                      value={calcRate}
                      onChange={(e) => setCalcRate(Number(e.target.value))}
                      className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="8.5">8,5% a.a. (Caixa/SBPE)</option>
                      <option value="9.5">9,5% a.a. (Itaú Personalité)</option>
                      <option value="10.5">10,5% a.a. (Bradesco Prime)</option>
                      <option value="11.5">11,5% a.a. (Santander Select)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Output Display Card */}
              <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-6 space-y-4 text-center text-xs">
                <div>
                  <span className="text-gray-400 font-medium uppercase tracking-wider block">Valor a Financiar</span>
                  <div className="text-xl font-bold text-white font-mono mt-0.5">
                    R$ {loanAmount.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="p-4 bg-[#D97706]/10 border border-[#D97706]/30 rounded-xl space-y-1">
                  <span className="text-gray-300 font-semibold block">1ª Parcela Estimada (Sistema SAC)</span>
                  <div className="text-3xl font-black text-[#D97706] font-mono">
                    R$ {estimatedMonthlyPayment.toLocaleString('pt-BR')} <span className="text-xs font-normal text-gray-400">/mês</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  *Valores aproximados para simulação. Nossos correspondentes bancários realizam a aprovação de crédito sem custo adicional.
                </p>

                <a
                  href="https://wa.me/5514996405496?text=Ola!%20Gostaria%20de%20solicitar%20uma%20pre-aprovacao%20de%20credito%20imobiliario."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#D97706] hover:bg-[#B45309] text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Solicitar Pré-Aprovação Grátis
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Estate Realtors & Brokers Section */}
      {activeSlug === 'imobiliaria-premium' && (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 border-t border-gray-800/40">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest">EQUIPE REGISTRADA</span>
            <h2 className="text-3xl font-serif font-bold text-white">Corretores Especialistas CRECI</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm">Atendimento personalizado com corretores credenciados para negociações de alto valor.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {realtors.map((r, i) => (
              <div key={i} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 text-center space-y-4 flex flex-col items-center hover:border-[#D97706]/40 transition-all">
                <img src={r.avatar} alt={r.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#D97706]" />
                <div>
                  <h3 className="font-bold text-white text-base font-serif">{r.name}</h3>
                  <span className="text-[10px] bg-[#D97706]/10 text-[#D97706] font-bold px-2 py-0.5 rounded border border-[#D97706]/20 inline-block mt-1 font-mono">
                    {r.creci}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">{r.role}</p>
                </div>
                <a
                  href={`https://wa.me/${r.phone}?text=Ola%20${encodeURIComponent(r.name)},%20gostaria%20de%20atendimento%20imobiliario.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md mt-auto"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Atendimento Direct WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loyalty & Promotions panel */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        {/* Loyalty Program widget - OPTIONAL_FEATURE: Programa de Fidelidade */}
        <div
          className="rounded-2xl p-6 relative border"
          style={{ backgroundColor: config.colorTheme.bgPanel, borderColor: config.colorTheme.border }}
        >
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-bold bg-[#1F2937]/30 text-gray-400 px-2 py-0.5 rounded">
            <Award className="w-2.5 h-2.5 text-[#5B4FE9]" />
            <span>{t.optionalBadge}: Programa de Fidelidade</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6" style={{ color: config.colorTheme.primary }} />
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
                className="border text-white placeholder-gray-500 rounded-xl px-3 py-2 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-[#5B4FE9]"
                style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
              />
              <button
                onClick={checkLoyaltyPoints}
                className="text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ backgroundColor: config.colorTheme.primary }}
              >
                {t.loyaltyCheckBtn}
              </button>
            </div>
            {loyaltyData && (
              <div
                className="p-3 rounded-xl border border-dashed text-xs space-y-2"
                style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
              >
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.loyaltyPoints}:</span>
                  <span className="font-bold" style={{ color: config.colorTheme.primary }}>{loyaltyData.points} pts</span>
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
        <div
          className="rounded-2xl p-6 relative flex flex-col justify-between border"
          style={{ backgroundColor: config.colorTheme.bgPanel, borderColor: config.colorTheme.border }}
        >
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-bold bg-[#1F2937]/30 text-gray-400 px-2 py-0.5 rounded">
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
              className="border text-white placeholder-gray-500 rounded-xl px-3 py-2 text-xs flex-1 focus:outline-none"
              style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
            />
            <button
              onClick={() => alert('Inscrição simulada concluída! Você receberá novidades.')}
              className="bg-[#25D366] hover:bg-[#1EBE57] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              Cadastrar
            </button>
          </div>
        </div>
      </div>

      {/* Real Estate Blog & Market Articles */}
      {activeSlug === 'imobiliaria-premium' && (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 border-t border-gray-800/40 text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block">CONTEÚDO EXCLUSIVO</span>
              <h2 className="text-3xl font-serif font-bold text-white">Blog & Inteligência Imobiliária</h2>
            </div>
            <button className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#D97706] font-bold hover:underline">
              Ver Todos os Artigos →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {realEstateArticles.map((art, i) => (
              <div key={i} className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden group hover:border-[#D97706]/40 transition-all flex flex-col">
                <div className="h-44 overflow-hidden relative">
                  <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-[#0B0F19]/90 text-[#D97706] border border-[#D97706]/30 text-[9px] font-bold px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono">{art.date}</span>
                    <h3 className="font-bold text-white text-sm font-serif mt-1 leading-snug group-hover:text-[#D97706] transition-colors">{art.title}</h3>
                  </div>
                  <span className="text-[11px] text-[#D97706] font-bold flex items-center gap-1 pt-2 border-t border-gray-800/80">
                    Ler Artigo Completo →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Preview - OPTIONAL_FEATURE: SEO Avançado */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div
          className="rounded-2xl p-5 space-y-3 relative border"
          style={{ backgroundColor: config.colorTheme.bgPanel, borderColor: config.colorTheme.border }}
        >
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-bold bg-[#1F2937]/30 text-gray-400 px-2 py-0.5 rounded">
            <Search className="w-2.5 h-2.5 text-[#5B4FE9]" />
            <span>{t.optionalBadge}: SEO Avançado</span>
          </div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" style={{ color: config.colorTheme.primary }} />
            Como o site aparece nas buscas do Google (SEO Otimizado)
          </h4>
          <div className="p-4 bg-white text-black rounded-xl shadow-inner font-sans space-y-1.5 max-w-xl text-left">
            <div className="text-xs text-[#202124] flex items-center gap-1">
              <span>https://www.google.com/search?q={activeSlug}</span>
            </div>
            <h3 className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight">
              {config.seo.title}
            </h3>
            <p className="text-xs text-[#4d5156] leading-relaxed">
              {config.seo.description}
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-2 text-xs text-[#1a0dab] font-medium border-t border-gray-100">
              {config.seo.sitelinks.map((link, idx) => (
                <span key={idx} className="hover:underline cursor-pointer">{link}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="pt-12 pb-6 text-center text-xs text-gray-500 space-y-4 max-w-6xl mx-auto px-4 mt-12 border-t border-gray-800/10">
        <div className="flex flex-wrap justify-center gap-6" style={{ color: config.colorTheme.primary }}>
          <span className="cursor-pointer hover:underline">{t.navMenu}</span>
          <span className="cursor-pointer hover:underline">{t.navReservations}</span>
          <span className="cursor-pointer hover:underline">{t.navAbout}</span>
          <span className="cursor-pointer hover:underline">{t.navContact}</span>
        </div>
        <p>© 2026 {titleText}. Todos os direitos reservados.</p>
        <div
          className="flex justify-center items-center gap-2 text-[10px] text-gray-400 font-bold px-4 py-2 rounded-xl w-max mx-auto border"
          style={{ backgroundColor: config.colorTheme.bgPanel, borderColor: config.colorTheme.border }}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#5B4FE9]" />
          <span>Nextia Cloud + SSL Ativo · Suporte 24h Prioritário</span>
        </div>
      </footer>

      {/* Booking Calendar Modal / Inquiry Form (Generic CTA modal) */}
      {isReserveModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div
            className="rounded-2xl p-6 max-w-md w-full relative space-y-4 border text-left"
            style={{ backgroundColor: config.colorTheme.bgPanel, borderColor: config.colorTheme.border }}
          >
            <button
              onClick={() => { setIsReserveModalOpen(false); setReservationSuccess(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[8px] font-black bg-[#5B4FE9] text-white px-2 py-0.5 rounded tracking-wide uppercase inline-block mb-1">
                {t.optionalBadge}: {config.ctas.type === 'budget' ? 'Formulário de Orçamento' : 'Agendamento / Calendário'}
              </span>
              <h3 className="font-bold text-xl text-white font-serif">
                {config.ctas.type === 'budget' ? 'Solicitar Detalhes do Projeto' : t.reserveTitle}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {config.ctas.type === 'budget' ? 'Preencha seus dados para receber um orçamento detalhado.' : t.reserveSubtitle}
              </p>
            </div>

            {reservationSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-bold text-green-400 text-sm">
                  {config.ctas.type === 'budget' ? 'Orçamento solicitado!' : 'Reserva confirmada!'}
                </h4>
                <p className="text-xs text-gray-300">
                  Código do Ticket: <strong>#TKT-{Math.floor(Math.random() * 8999 + 1000)}</strong>
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Um e-mail de confirmação com os próximos passos foi enviado para {reservationForm.email || 'você'}.
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
              <form onSubmit={handleReservationSubmit} className="space-y-3 text-xs">
                {config.ctas.type !== 'budget' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 block mb-1">Data *</label>
                      <input
                        type="date"
                        required
                        value={reservationForm.date}
                        onChange={e => setReservationForm({ ...reservationForm, date: e.target.value })}
                        className="w-full border rounded-xl px-3 py-2 focus:outline-none"
                        style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Horário *</label>
                      <select
                        value={reservationForm.time}
                        onChange={e => setReservationForm({ ...reservationForm, time: e.target.value })}
                        className="w-full border rounded-xl px-3 py-2 focus:outline-none text-[#111]"
                        style={{ borderColor: config.colorTheme.border }}
                      >
                        <option>09:00</option>
                        <option>10:00</option>
                        <option>14:00</option>
                        <option>15:00</option>
                        <option>19:00</option>
                        <option>20:00</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-gray-400 block mb-1">Serviço Desejado *</label>
                    <select
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none text-[#111]"
                      style={{ borderColor: config.colorTheme.border }}
                    >
                      {config.items.map(i => (
                        <option key={i.id}>{i.name[lang]}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-gray-400 block mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="João Silva"
                    value={reservationForm.name}
                    onChange={e => setReservationForm({ ...reservationForm, name: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 focus:outline-none"
                    style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
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
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none"
                      style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
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
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none"
                      style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
                    />
                  </div>
                </div>

                {config.ctas.type === 'budget' && (
                  <div>
                    <label className="text-gray-400 block mb-1">Descrição / Detalhes</label>
                    <textarea
                      placeholder="Mais informações sobre sua necessidade..."
                      value={reservationForm.note}
                      onChange={e => setReservationForm({ ...reservationForm, note: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none h-16"
                      style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full text-white py-2.5 rounded-xl font-bold transition-all mt-4 text-xs flex items-center justify-center gap-1"
                  style={{ backgroundColor: config.colorTheme.primary }}
                >
                  {config.ctas.type === 'budget' ? <FileText className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  {config.ctas.type === 'budget' ? 'Enviar Solicitação' : 'Confirmar Agendamento'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer Panel (For templates utilizing Shopping Cart / Delivery) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div
            className="w-full max-w-md h-full p-6 flex flex-col justify-between border-l shadow-2xl overflow-y-auto text-left text-xs"
            style={{ backgroundColor: config.colorTheme.bgPanel, borderColor: config.colorTheme.border }}
          >
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-800/10" style={{ borderColor: config.colorTheme.border }}>
                <div>
                  <h3 className="font-bold text-lg text-white font-serif">{t.cartTitle}</h3>
                  <span className="text-[8px] font-black bg-[#5B4FE9] text-white px-2 py-0.5 rounded tracking-wide uppercase inline-block mt-0.5">
                    {t.optionalBadge}: Carrinho de Compras / Delivery
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
                    <div
                      key={item.id}
                      className="flex justify-between items-center gap-3 p-3 rounded-xl border"
                      style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
                    >
                      <div>
                        <div className="font-bold text-white font-serif">{item.name[lang]}</div>
                        <div className="text-gray-400 mt-0.5">Qty: {qty} · R$ {item.price} each</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold" style={{ color: config.colorTheme.primary }}>R$ {(item.price * qty).toLocaleString('pt-BR')}</span>
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
              <div className="border-t pt-4 space-y-4" style={{ borderColor: config.colorTheme.border }}>
                <div className="space-y-1.5 text-gray-400">
                  <div className="flex justify-between">
                    <span>{t.cartSubtotal}:</span>
                    <span className="text-white font-semibold">R$ {cartSubtotal.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.cartDelivery}:</span>
                    <span className="text-white font-semibold">R$ 12</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t" style={{ color: config.colorTheme.primary, borderColor: config.colorTheme.border }}>
                    <span>{t.cartTotal}:</span>
                    <span>R$ {cartTotal.toLocaleString('pt-BR')}</span>
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
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none"
                      style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
                    />
                  </div>

                  <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[10px] font-bold text-center flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.optionalBadge}: Integração PDV + Caixa Sincronizado!
                  </div>

                  <button
                    type="submit"
                    disabled={isCheckoutSuccess}
                    className="w-full text-white py-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1"
                    style={{ backgroundColor: config.colorTheme.primary }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {isCheckoutSuccess ? 'Processando Caixa...' : t.checkoutBtn}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Float Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-6 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-105 z-40 flex items-center gap-2"
          style={{ backgroundColor: config.colorTheme.primary }}
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
          <div
            className="w-72 border rounded-2xl shadow-2xl flex flex-col justify-between text-left text-xs text-gray-300"
            style={{ backgroundColor: config.colorTheme.bgPanel, borderColor: config.colorTheme.border }}
          >
            {/* Header */}
            <div
              className="border-b p-3 flex justify-between items-center rounded-t-2xl"
              style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <div className="font-bold text-white">{config.name} AI</div>
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
            <div className="p-3 h-60 overflow-y-auto space-y-3" style={{ backgroundColor: `${config.colorTheme.bg}80` }}>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-500/20 border border-blue-500/30 text-white ml-auto'
                      : 'bg-gray-800/80 text-gray-200 mr-auto'
                  }`}
                  style={
                    msg.sender === 'user'
                      ? { backgroundColor: `${config.colorTheme.primary}20`, borderColor: `${config.colorTheme.primary}30` }
                      : undefined
                  }
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div
              className="p-2 border-t space-y-1"
              style={{ backgroundColor: config.colorTheme.bg, borderColor: config.colorTheme.border }}
            >
              {config.chatbot.prompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBotQuickReply(p.q[lang], p.a[lang])}
                  className="w-full text-[10px] hover:bg-white/5 p-1.5 rounded text-left border border-white/5 truncate block"
                  style={{ color: config.colorTheme.primary }}
                >
                  {p.q[lang]}
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
      {/* Real Estate Property Details Modal */}
      {selectedPropertyModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-3xl w-full relative overflow-hidden text-left my-8 shadow-2xl space-y-6 p-6 sm:p-8">
            <button
              onClick={() => setSelectedPropertyModal(null)}
              className="absolute top-4 right-4 bg-black/50 text-gray-400 hover:text-white p-2 rounded-full border border-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Badges */}
            <div className="space-y-1 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#D97706] text-white font-black px-2.5 py-0.5 rounded-full uppercase">EXCLUSIVIDADE</span>
                <span className="text-[10px] bg-gray-800 text-gray-300 font-mono px-2 py-0.5 rounded">REF: RE-{Math.floor(Math.random() * 899 + 100)}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">{selectedPropertyModal.name.pt}</h2>
              <p className="text-xs text-gray-400">Jardins, São Paulo — SP · Código CRECI Protegido</p>
            </div>

            {/* Price Tag */}
            <div className="bg-[#0B0F19] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gray-500 font-semibold uppercase block">Valor de Venda</span>
                <div className="text-2xl sm:text-3xl font-black text-[#D97706] font-mono">
                  R$ {selectedPropertyModal.price.toLocaleString('pt-BR')}
                </div>
              </div>
              <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-xl font-bold">
                Documentação Ok (Escriturado)
              </span>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-800 text-xs font-bold gap-6">
              {[
                { id: 'fotos', label: 'Galeria HD' },
                { id: 'tour', label: 'Tour Virtual 360°' },
                { id: 'mapa', label: 'Localização & Mapa' },
                { id: 'financiamento', label: 'Financiamento' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePropTab(tab.id as any)}
                  className={`pb-3 border-b-2 transition-colors ${
                    activePropTab === tab.id
                      ? 'border-[#D97706] text-[#D97706]'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activePropTab === 'fotos' && (
              <div className="space-y-4">
                <div className="h-72 rounded-2xl overflow-hidden relative">
                  <img src={selectedPropertyModal.image} alt={selectedPropertyModal.name.pt} className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-3 py-1 rounded-lg backdrop-blur-md">
                    Foto 1 de 12 (Alta Resolução)
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {selectedPropertyModal.description.pt}
                </p>
              </div>
            )}

            {activePropTab === 'tour' && (
              <div className="h-72 bg-[#0B0F19] border border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Video className="w-12 h-12 text-[#D97706] animate-pulse" />
                <h4 className="font-bold text-white text-base">Tour Virtual 360° Matterport Integrado</h4>
                <p className="text-xs text-gray-400 max-w-md">
                  Navegue interativamente por cada ambiente da propriedade com tecnologia de realidade virtual e scanner 3D.
                </p>
                <button
                  onClick={() => alert('Abrindo visualização em fullscreen do Tour 360°...')}
                  className="bg-[#D97706] text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Iniciar Tour Imersivo 3D
                </button>
              </div>
            )}

            {activePropTab === 'mapa' && (
              <div className="h-72 bg-[#0B0F19] border border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
                <MapPin className="w-10 h-10 text-[#D97706]" />
                <h4 className="font-bold text-white text-sm">Localização Aproximada (Região Nobre)</h4>
                <p className="text-xs text-gray-400 max-w-sm">
                  Por privacidade e segurança dos proprietários, o endereço exato é fornecido após confirmação de agendamento de visita.
                </p>
              </div>
            )}

            {activePropTab === 'financiamento' && (
              <div className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Preço deste imóvel:</span>
                  <strong className="text-white">R$ {selectedPropertyModal.price.toLocaleString('pt-BR')}</strong>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Entrada mínima (20%):</span>
                  <strong className="text-[#D97706]">R$ {(selectedPropertyModal.price * 0.2).toLocaleString('pt-BR')}</strong>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Parcela estimada (SAC 360 meses):</span>
                  <strong className="text-[#D97706] text-sm">R$ {Math.round((selectedPropertyModal.price * 0.8 * 0.0085)).toLocaleString('pt-BR')}/mês</strong>
                </div>
              </div>
            )}

            {/* Checklist of amenities */}
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Recursos & Comodidades</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-300">
                {['Piscina Aquecida', 'Área Gourmet', 'Academia Privativa', 'Portaria 24h Armada', 'Elevador Privativo', 'Pet Friendly'].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-[#0B0F19] p-2 rounded-xl border border-gray-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`https://wa.me/5514996405496?text=Ola!%20Tenho%20interesse%20no%20imovel%20${encodeURIComponent(selectedPropertyModal.name.pt)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#1EBE57] text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                Falar no WhatsApp
              </a>
              <button
                onClick={() => {
                  setVisitPropTitle(selectedPropertyModal.name.pt);
                  setIsVisitModalOpen(true);
                  setSelectedPropertyModal(null);
                }}
                className="flex-1 bg-[#D97706] hover:bg-[#B45309] text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                Agendar Visita Presencial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Estate Visit Scheduling Modal */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative text-left space-y-4 shadow-2xl">
            <button
              onClick={() => { setIsVisitModalOpen(false); setVisitSuccess(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[9px] font-black bg-[#D97706] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                AGENDAMENTO EXCLUSIVO V.I.P
              </span>
              <h3 className="font-bold text-xl text-white font-serif">Agendar Visita ao Imóvel</h3>
              <p className="text-xs text-gray-400">
                {visitPropTitle ? `Imóvel: ${visitPropTitle}` : 'Escolha o melhor dia e horário para a visita guiada.'}
              </p>
            </div>

            {visitSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-bold text-green-400 text-sm">Visita Solicitada com Sucesso!</h4>
                <p className="text-xs text-gray-300">
                  Código da Visita: <strong>#VIS-{Math.floor(Math.random() * 8999 + 1000)}</strong>
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Nosso corretor especializado entrará em contato via WhatsApp para confirmar o horário.
                </p>
                <button
                  onClick={() => { setIsVisitModalOpen(false); setVisitSuccess(false); }}
                  className="w-full bg-[#D97706] text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setVisitSuccess(true);
                }}
                className="space-y-3 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Data da Visita *</label>
                    <input
                      type="date"
                      required
                      value={visitForm.date}
                      onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Horário *</label>
                    <select
                      value={visitForm.time}
                      onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                    >
                      <option>09:00</option>
                      <option>10:30</option>
                      <option>14:00</option>
                      <option>15:30</option>
                      <option>17:00</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="João Silva"
                    value={visitForm.name}
                    onChange={(e) => setVisitForm({ ...visitForm, name: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(14) 99640-5496"
                      value={visitForm.phone}
                      onChange={(e) => setVisitForm({ ...visitForm, phone: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="joao@email.com"
                      value={visitForm.email}
                      onChange={(e) => setVisitForm({ ...visitForm, email: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D97706] hover:bg-[#B45309] text-white py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg mt-2"
                >
                  <Calendar className="w-4 h-4" />
                  Confirmar Solicitação de Visita
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Property Listing Submission Modal ("Anuncie Seu Imóvel") */}
      {isListPropModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative text-left space-y-4 shadow-2xl">
            <button
              onClick={() => { setIsListPropModalOpen(false); setListPropSuccess(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[9px] font-black bg-[#D97706] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                CAPTAÇÃO DE IMÓVEIS
              </span>
              <h3 className="font-bold text-xl text-white font-serif">Anuncie Seu Imóvel Conosco</h3>
              <p className="text-xs text-gray-400">
                Avaliação gratuita de mercado com tecnologia de IA e produção fotográfica profissional.
              </p>
            </div>

            {listPropSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-bold text-green-400 text-sm">Cadastro de Imóvel Recebido!</h4>
                <p className="text-xs text-gray-300">
                  Protocolo de Captação: <strong>#CAP-{Math.floor(Math.random() * 8999 + 1000)}</strong>
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Um dos nossos gestores imobiliários entrará em contato para agendar a avaliação presencial.
                </p>
                <button
                  onClick={() => { setIsListPropModalOpen(false); setListPropSuccess(false); }}
                  className="w-full bg-[#D97706] text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setListPropSuccess(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="text-gray-400 block mb-1">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Proprietário Silva"
                    value={listPropForm.name}
                    onChange={(e) => setListPropForm({ ...listPropForm, name: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(14) 99640-5496"
                      value={listPropForm.phone}
                      onChange={(e) => setListPropForm({ ...listPropForm, phone: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Tipo de Imóvel</label>
                    <select
                      value={listPropForm.type}
                      onChange={(e) => setListPropForm({ ...listPropForm, type: e.target.value })}
                      className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                    >
                      <option>Casa de Luxo</option>
                      <option>Apartamento</option>
                      <option>Cobertura</option>
                      <option>Terreno</option>
                      <option>Comercial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Endereço do Imóvel *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rua Haddock Lobo, Jardins, São Paulo"
                    value={listPropForm.address}
                    onChange={(e) => setListPropForm({ ...listPropForm, address: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Valor Estimado de Venda / Aluguel</label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 5.000.000"
                    value={listPropForm.estValue}
                    onChange={(e) => setListPropForm({ ...listPropForm, estValue: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-gray-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D97706] hover:bg-[#B45309] text-white py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg mt-2"
                >
                  <Home className="w-4 h-4" />
                  Enviar Imóvel para Avaliação
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
