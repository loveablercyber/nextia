import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShoppingBag, Calendar, MessageSquare, Globe, Search,
  CheckCircle2, X, Phone, Award, Send, Star, ArrowLeft,
  ShieldCheck, Check, FileText
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

      {/* Services/Products Grid */}
      <div id="servicos" className="max-w-6xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold" style={{ color: config.colorTheme.primary }}>
            {menuTitleText}
          </h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm">{menuSubtitleText}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.items.map(item => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden transition-all flex flex-col border"
              style={{
                backgroundColor: config.colorTheme.bgPanel,
                borderColor: config.colorTheme.border
              }}
            >
              <div className="h-48 overflow-hidden relative">
                <img src={item.image} alt={item.name[lang]} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-bold bg-[#1F2937]/80 text-gray-300 px-2 py-0.5 rounded border border-white/10">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span>{t.optionalBadge}: Foto Profissional</span>
                </div>
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs font-bold" style={{ color: config.colorTheme.primary }}>
                  R$ {item.price.toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-white font-serif">{item.name[lang]}</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{item.description[lang]}</p>
                </div>
                {/* Action button based on ctas.type */}
                <div className="pt-2">
                  {config.ctas.type === 'cart' ? (
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
    </div>
  );
}
