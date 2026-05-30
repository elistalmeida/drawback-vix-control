import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Award, 
  Timer, 
  Compass, 
  HelpCircle, 
  ChevronDown, 
  Star, 
  MessageSquare, 
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Settings,
  Grid
} from 'lucide-react';

export default function Storefront({ onNavigateToAdmin, products, setProducts, orders, setOrders }) {
  // Interactive Installation Simulator State
  const [simVehicle, setSimVehicle] = useState('car'); // 'car' or 'moto'
  const [simInstalled, setSimInstalled] = useState(false);

  // E-commerce Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: CEP, 2: Personal Info, 3: Payment, 4: Success
  const [cepInput, setCepInput] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [deliveryDays, setDeliveryDays] = useState(null);
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('pix'); // 'pix' or 'card'
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1'
  });

  const [newOrderId, setNewOrderId] = useState('');

  // Simulator State
  const [selectedBrand, setSelectedBrand] = useState('byd');
  const [selectedModel, setSelectedModel] = useState('bydDolphin');
  const [selectedPower, setSelectedPower] = useState('7.2');
  const [customCapacity, setCustomCapacity] = useState('50.0');
  
  // Comparator State
  const [compareTab, setCompareTab] = useState('drawback');

  // FAQ State
  const [faqOpen, setFaqOpen] = useState({
    0: true,
    1: false,
    2: false,
    3: false
  });

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // E-commerce Helper Functions
  const handleBuyClick = (productKey) => {
    // Find the product in the shared state
    const prodMap = {
      'moto': 1,
      'car': 2,
      'portable': 3,
      'wallbox': 4
    };
    const prodId = prodMap[productKey];
    const product = products.find(p => p.id === prodId) || { id: prodId, name: 'Produto Drawback', price: 149, stock: 10 };
    
    setCheckoutProduct(product);
    setCheckoutStep(1);
    setCepInput('');
    setDeliveryDays(null);
    setIsCheckoutOpen(true);
  };

  const handleCepSubmit = async (e) => {
    e.preventDefault();
    const cleanCep = cepInput.replace(/\D/g, '');
    if (!cleanCep || cleanCep.length !== 8) {
      alert('Por favor, insira um CEP válido de 8 dígitos.');
      return;
    }

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!response.ok) throw new Error('Erro ao buscar CEP');
      
      const data = await response.json();
      
      if (data.erro) {
        alert('CEP não encontrado! Por favor, verifique o número digitado.');
        setCepLoading(false);
        return;
      }

      // 1. Pre-fill address fields dynamically
      setFormData(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: (data.uf || '').toUpperCase()
      }));

      // 2. Calculate average delivery time based on the state of Brazil
      const uf = (data.uf || 'ES').toUpperCase();
      let days = 3;
      if (uf === 'ES') {
        days = 1; // Local fast delivery (Vitória/Vila Velha)
      } else if (['SP', 'RJ', 'MG'].includes(uf)) {
        days = 2; // Southeast capital/metropolitan
      } else if (['PR', 'SC', 'RS', 'DF', 'GO', 'MS', 'MT'].includes(uf)) {
        days = 3; // South & Central
      } else if (['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'MA', 'PI'].includes(uf)) {
        days = 5; // Northeast
      } else {
        days = 7; // North (Norte) and remote regions
      }

      setDeliveryDays(days);
      setCheckoutStep(2); // Proceed to personal data
    } catch (error) {
      console.error('Error fetching CEP:', error);
      // Premium offline fallback so the buyer is never blocked
      const prefix = parseInt(cleanCep.substring(0, 2)) || 0;
      let days = 3;
      if (prefix >= 1 && prefix <= 28) {
        days = 2;
      } else if (prefix >= 80 && prefix <= 99) {
        days = 3;
      } else if (prefix >= 40 && prefix <= 65) {
        days = 5;
      } else {
        days = 7;
      }
      setDeliveryDays(days);
      setCheckoutStep(2);
    } finally {
      setCepLoading(false);
    }
  };

  const handlePersonalDataSubmit = (e) => {
    e.preventDefault();
    // Basic fields validation
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf || !formData.street || !formData.number || !formData.neighborhood || !formData.city || !formData.state) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setCheckoutStep(3); // Advance to payment
  };

  const handleCheckoutFinalize = () => {
    // Create new order object
    const orderNum = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderNum,
      customer: formData.name,
      product: checkoutProduct.name,
      status: 'preparing',
      date: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    // Update shared orders list
    setOrders(prev => [newOrder, ...prev]);

    // Update shared product sales and stock
    setProducts(prev => prev.map(p => {
      if (p.id === checkoutProduct.id) {
        return {
          ...p,
          stock: Math.max(0, p.stock - 1),
          sales: p.sales + 1
        };
      }
      return p;
    }));

    setNewOrderId(orderNum);
    setCheckoutStep(4); // Advance to Success Screen!
  };

  // Simulator Data (Estruturado por marcas e modelos atuantes no Brasil)
  const brands = {
    byd: 'BYD',
    gwm: 'GWM',
    volvo: 'Volvo',
    bmw: 'BMW',
    porsche: 'Porsche',
    tesla: 'Tesla',
    renault: 'Renault',
    jac: 'JAC',
    chevrolet: 'Chevrolet',
    peugeot: 'Peugeot',
    nissan: 'Nissan',
    audi: 'Audi',
    outro: 'Outro (Personalizado)'
  };

  const carsByBrand = {
    byd: {
      bydDolphinMini: { name: 'Dolphin Mini', capacity: 38.0, range: 280, desc: 'Bateria de 38.0 kWh â¢ Autonomia ~280km' },
      bydDolphin: { name: 'Dolphin GS', capacity: 44.9, range: 340, desc: 'Bateria de 44.9 kWh â¢ Autonomia ~340km' },
      bydDolphinPlus: { name: 'Dolphin Plus', capacity: 60.5, range: 427, desc: 'Bateria de 60.5 kWh â¢ Autonomia ~427km' },
      bydSeal: { name: 'Seal EV', capacity: 82.5, range: 460, desc: 'Bateria de 82.5 kWh â¢ Autonomia ~460km' },
      bydYuanPlus: { name: 'Yuan Plus GS', capacity: 60.5, range: 420, desc: 'Bateria de 60.5 kWh â¢ Autonomia ~420km' },
      bydSongPlus: { name: 'Song Plus DM-i (Híbrido)', capacity: 8.3, range: 50, desc: 'Bateria de 8.3 kWh â¢ Modo Elétrico puro ~50km' }
    },
    gwm: {
      gwmOraSkin: { name: 'Ora 03 Skin', capacity: 48.0, range: 310, desc: 'Bateria de 48.0 kWh â¢ Autonomia ~310km' },
      gwmOraGT: { name: 'Ora 03 GT Long Range', capacity: 63.0, range: 400, desc: 'Bateria de 63.0 kWh â¢ Autonomia ~400km' },
      gwmHavalH6: { name: 'Haval H6 PHEV (Híbrido)', capacity: 34.0, range: 110, desc: 'Bateria de 34.0 kWh â¢ Modo Elétrico puro ~110km' }
    },
    volvo: {
      volvoEx30Lpt: { name: 'EX30 Core (LPT)', capacity: 51.0, range: 340, desc: 'Bateria de 51.0 kWh â¢ Autonomia ~340km' },
      volvoEx30Ext: { name: 'EX30 Extended Range', capacity: 69.0, range: 476, desc: 'Bateria de 69.0 kWh â¢ Autonomia ~476km' },
      volvoXc40: { name: 'XC40 Recharge', capacity: 78.0, range: 420, desc: 'Bateria de 78.0 kWh â¢ Autonomia ~420km' },
      volvoC40: { name: 'C40 Recharge', capacity: 78.0, range: 440, desc: 'Bateria de 78.0 kWh â¢ Autonomia ~440km' }
    },
    bmw: {
      bmwI3: { name: 'i3', capacity: 42.2, range: 260, desc: 'Bateria de 42.2 kWh â¢ Autonomia ~260km' },
      bmwIx1: { name: 'iX1', capacity: 64.7, range: 400, desc: 'Bateria de 64.7 kWh â¢ Autonomia ~400km' },
      bmwIx3: { name: 'iX3', capacity: 80.0, range: 460, desc: 'Bateria de 80.0 kWh â¢ Autonomia ~460km' },
      bmwI4: { name: 'i4', capacity: 80.7, range: 490, desc: 'Bateria de 80.7 kWh â¢ Autonomia ~490km' },
      bmwIx40: { name: 'iX xDrive40', capacity: 76.6, range: 370, desc: 'Bateria de 76.6 kWh â¢ Autonomia ~370km' },
      bmwIx50: { name: 'iX xDrive50', capacity: 111.5, range: 630, desc: 'Bateria de 111.5 kWh â¢ Autonomia ~630km' }
    },
    porsche: {
      porscheTaycan: { name: 'Taycan Base', capacity: 79.2, range: 400, desc: 'Bateria de 79.2 kWh â¢ Autonomia ~400km' },
      porscheTaycanPlus: { name: 'Taycan Plus', capacity: 93.4, range: 480, desc: 'Bateria de 93.4 kWh â¢ Autonomia ~480km' }
    },
    tesla: {
      teslaModel3: { name: 'Model 3 Standard', capacity: 60.0, range: 491, desc: 'Bateria de 60.0 kWh â¢ Autonomia ~491km' },
      teslaModelY: { name: 'Model Y Long Range', capacity: 75.0, range: 533, desc: 'Bateria de 75.0 kWh â¢ Autonomia ~533km' }
    },
    renault: {
      renaultKwid: { name: 'Kwid E-Tech', capacity: 26.8, range: 298, desc: 'Bateria de 26.8 kWh â¢ Autonomia ~298km' },
      renaultMegane: { name: 'Megane E-Tech', capacity: 60.0, range: 337, desc: 'Bateria de 60.0 kWh â¢ Autonomia ~337km' }
    },
    jac: {
      jacEjs1: { name: 'E-JS1', capacity: 30.2, range: 300, desc: 'Bateria de 30.2 kWh â¢ Autonomia ~300km' }
    },
    chevrolet: {
      chevroletBolt: { name: 'Bolt EV', capacity: 66.0, range: 416, desc: 'Bateria de 66.0 kWh â¢ Autonomia ~416km' },
      chevroletEquinox: { name: 'Equinox EV', capacity: 85.0, range: 513, desc: 'Bateria de 85.0 kWh â¢ Autonomia ~513km' }
    },
    peugeot: {
      peugeotE208: { name: 'e-208 GT', capacity: 50.0, range: 340, desc: 'Bateria de 50.0 kWh â¢ Autonomia ~340km' }
    },
    nissan: {
      nissanLeaf: { name: 'Leaf', capacity: 40.0, range: 272, desc: 'Bateria de 40.0 kWh â¢ Autonomia ~272km' }
    },
    audi: {
      audiEtron: { name: 'e-tron Base', capacity: 95.0, range: 436, desc: 'Bateria de 95.0 kWh â¢ Autonomia ~436km' },
      audiEtronGt: { name: 'e-tron GT', capacity: 93.4, range: 487, desc: 'Bateria de 93.4 kWh â¢ Autonomia ~487km' }
    },
    outro: {
      outroCustom: { name: 'Veículo Personalizado', capacity: 50.0, range: 350, desc: 'Digite a capacidade da bateria' }
    }
  };

  const handleBrandChange = (brandKey) => {
    setSelectedBrand(brandKey);
    const modelsOfBrand = Object.keys(carsByBrand[brandKey]);
    setSelectedModel(modelsOfBrand[0]);
  };

  const powers = {
    '3.7': { label: 'Carregador Comum (3.7 kW)', rangePerHour: 20, desc: 'Tomada residencial padrão monofásica' },
    '7.2': { label: 'Drawback Portátil / Wallbox Lite (7.2 kW)', rangePerHour: 45, desc: 'Ideal para residências com rede bifásica' },
    '22.0': { label: 'Drawback Super Wallbox Pro (22.0 kW)', rangePerHour: 135, desc: 'Carga ultrarrápida trifásica para empresas e residências' }
  };

  // Calculations
  const carData = selectedBrand === 'outro'
    ? { name: 'Veículo Personalizado', capacity: parseFloat(customCapacity) || 50, range: 350, desc: `Veículo personalizado com bateria de ${customCapacity} kWh` }
    : carsByBrand[selectedBrand][selectedModel];
  const powerVal = parseFloat(selectedPower);
  const timeToCharge = (carData.capacity / powerVal).toFixed(1);
  const rangeAdded = Math.round(powers[selectedPower].rangePerHour * parseFloat(timeToCharge));

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        padding: '16px 0'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src="/logo.jpg" 
                  alt="Drawback Vix Logo" 
                  style={{ 
                    height: '42px', 
                    borderRadius: '50%', 
                    border: '2px solid var(--color-cyan)',
                    boxShadow: '0 2px 10px rgba(36, 75, 122, 0.1)',
                    objectFit: 'cover'
                  }} 
                />
              </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', color: 'var(--color-cyan)' }}>
                DRAWBACK<span style={{ color: 'var(--color-brand-blue)' }}>VIX</span>
              </span>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: -4 }}>
                Acessórios Automotivos Premium
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#suportes" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Suporte Antifurto</a>
            <a href="#carregadores" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Carregadores EV</a>
            <a href="#depoimentos" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Avaliações</a>
            
            <button 
              onClick={onNavigateToAdmin}
              className="btn btn-outline" 
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Settings size={14} />
              Minha Central
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{
        padding: '100px 0 80px',
        background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(36, 75, 122, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
        textAlign: 'center'
      }} className="animate-fade-in">
        <div className="container">
          <div className="badge badge-cyan" style={{ marginBottom: '16px', background: 'rgba(36, 75, 122, 0.06)', color: 'var(--color-cyan)' }}>
            <Award size={12} style={{ marginRight: '6px' }} />
            Eleita a Melhor Marca Premium de Acessórios
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.15,
            maxWidth: '950px',
            margin: '0 auto 20px',
            fontWeight: 800
          }}>
            Suporte de Placa Mercosul <br />
            <span style={{
              background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-brand-blue) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>e Recarga EV de Altíssima Performance</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem',
            maxWidth: '750px',
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            Proteção definitiva em Aço Inox 304 contra furtos, perdas em alagamentos e quebras. <br />
            Conheça também nossas soluções de recarga inteligente para veículos elétricos.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#suportes" className="btn btn-cyan">
              Ver Suporte de Placa <ShieldCheck size={16} />
            </a>
            <a href="#carregadores" className="btn btn-silver">
              Ver Carregadores EV <Zap size={16} />
            </a>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginTop: '70px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: 'var(--color-cyan)', background: 'rgba(36, 75, 122, 0.05)', padding: 10, borderRadius: 12 }}>
                <ShieldCheck size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Aço Inox 304 Premium</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Garantia vitalícia</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: 'var(--color-cyan)', background: 'rgba(36, 75, 122, 0.05)', padding: 10, borderRadius: 12 }}>
                <Zap size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Carga Rápida & Segura</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wallbox inteligentes</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: 'var(--color-cyan)', background: 'rgba(36, 75, 122, 0.05)', padding: 10, borderRadius: 12 }}>
                <Timer size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Envio Expresso no Dia</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logística integrada total</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Anti-Theft License Plate Brackets Section */}
      <section id="suportes" style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
            
            {/* Coluna Visual e Especificações */}
            <div>
              <div className="badge badge-cyan" style={{ marginBottom: '16px', background: 'rgba(36, 75, 122, 0.08)', color: 'var(--color-cyan)', borderColor: 'rgba(36, 75, 122, 0.15)' }}>
                <ShieldCheck size={12} style={{ marginRight: '6px', color: 'var(--color-cyan)' }} />
                Aço Inox 304 Escovado Premium
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2 }}>
                Suportes de Placa Antifurto e Reforços de Inox
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Diga adeus a placas trincadas pela vibração do motor, perdidas em enchentes ou furtadas por criminosos. Nosso sistema de reforço estrutural em Aço Inox 304 Escovado de alta espessura é cortado a laser com gravação em baixo relevo da marca Drawback. Ele apoia perfeitamente as placas Mercosul ou tradicionais, eliminando a fadiga do metal e travando a fixação com parafusos de segurança antifurto.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>Parafusos Allen Antifurto</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Acompanha parafusos de inox Allen com pino de segurança central e porcas autotravantes, impedindo a remoção rápida com chaves comuns.</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>Dobra Inferior de Apoio</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>A chapa traseira para moto cobre 100% da placa e tem dobra inferior que elimina a vibração e evita trincas e quebras.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Suporte Moto Premium</span>
                  <strong style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>R$ 149</strong>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'var(--border-light)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Suporte Carro Inox (Jogo/Par)</span>
                  <strong style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>R$ 169,90</strong>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <img src="/plate_install.jpg" alt="Instalação do Suporte em GWM Haval" style={{ width: '100%', borderRadius: '12px', border: '1.5px solid var(--border-light)', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', objectFit: 'cover' }} />
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>Suporte Inox Drawback instalado sob a placa Mercosul no GWM Haval</span>
              </div>

              <button 
                onClick={() => handleBuyClick(simVehicle === 'car' ? 'car' : 'moto')}
                className="btn btn-cyan pulse-glow" 
                style={{ marginTop: '30px', width: '100%', padding: '16px' }}
              >
                Garantir Proteção Agora (Frete Grátis) <ShieldCheck size={16} />
              </button>
            </div>

            {/* COMPARATOR TOOL */}
            <div className="glass-panel" style={{ padding: '36px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass size={20} style={{ color: 'var(--text-secondary)' }} />
                Por que escolher a Drawback Vix?
              </h3>

              {/* Toggles */}
              <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.03)', padding: '4px', borderRadius: '10px', marginBottom: '24px' }}>
                <button
                  onClick={() => setCompareTab('drawback')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: compareTab === 'drawback' ? '#ffffff' : 'transparent',
                    color: compareTab === 'drawback' ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    boxShadow: compareTab === 'drawback' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Suporte Drawback Vix
                </button>
                <button
                  onClick={() => setCompareTab('comum')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: compareTab === 'comum' ? '#ffffff' : 'transparent',
                    color: compareTab === 'comum' ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    boxShadow: compareTab === 'comum' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  Sistemas Comuns
                </button>
              </div>

              {/* Tabela de Comparação Dinâmica */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {compareTab === 'drawback' ? (
                  <>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--color-green)', background: 'rgba(16,185,129,0.1)', padding: '4px 6px', borderRadius: '50%', marginTop: 2, fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ✓
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Aço Inox 304 Escovado Premium</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          Totalmente imune a ferrugem e maresia. Chapas robustas de alta espessura com gravação a laser original Drawback.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--color-green)', background: 'rgba(16,185,129,0.1)', padding: '4px 6px', borderRadius: '50%', marginTop: 2, fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ✓
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Parafusos Inox com Pino Guia Antifurto</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          Travamento de alta segurança com chave especial Allen codificada inclusa no kit.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--color-green)', background: 'rgba(16,185,129,0.1)', padding: '4px 6px', borderRadius: '50%', marginTop: 2, fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ✓
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Reforço Estrutural Anti-Quebra e Anti-Perda</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          A chapa traseira (moto) ou a régua (carro) absorvem o impacto e impedem que a placa trinque ou seja rasgada pela força da água em alagamentos.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--color-red)', background: 'rgba(239,68,68,0.1)', padding: '4px 6px', borderRadius: '50%', marginTop: 2, fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ✕
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Molduras de Plástico ou Fixação Direta</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          O plástico resseca e quebra facilmente com o vento e vibração do motor, levando a trincas e perda da placa.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--color-red)', background: 'rgba(239,68,68,0.1)', padding: '4px 6px', borderRadius: '50%', marginTop: 2, fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ✕
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Parafusos Comuns de Fenda ou Philips</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          Qualquer pessoa com chave Philips ou de fenda comum de R$ 5 consegue retirar e furtar a sua placa em menos de 10 segundos.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--color-red)', background: 'rgba(239,68,68,0.1)', padding: '4px 6px', borderRadius: '50%', marginTop: 2, fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ✕
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Fixação Frágil sem Apoio Traseiro</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          A pressão da água ao passar em alagamentos rasga a placa nos furos dos parafusos facilmente, gerando perda, multas e custos de reposição.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Plate visual mockup inside comparator */}
              <div style={{
                marginTop: '30px',
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                {compareTab === 'drawback' ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '100%', 
                          height: '240px', 
                          borderRadius: '10px', 
                          overflow: 'hidden', 
                          border: '1.5px solid var(--border-light)',
                          background: '#f8fafc',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            src="/plate.jpg" 
                            alt="Instalação do Reforço de Aço Inox no para-choque" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
                          1. Base de Reforço no Para-choque
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '100%', 
                          height: '240px', 
                          borderRadius: '10px', 
                          overflow: 'hidden', 
                          border: '1.5px solid var(--border-light)',
                          background: '#f8fafc',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            src="/plate_side.jpg" 
                            alt="Visão Lateral mostrando a rigidez e distanciamento correto" 
                            style={{ height: '100%', width: 'auto', objectFit: 'contain' }} 
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
                          2. Perfil Lateral (Rigidez e Proteção)
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: 700, textAlign: 'center', display: 'block', marginTop: '4px' }}>
                      Demonstração da Funcionalidade das Peças Originais Drawback Vix
                    </span>
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '80px',
                    background: '#f8fafc',
                    border: `4px solid #475569`,
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    color: '#0f172a',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                      <span style={{ background: '#ef4444', color: 'white', padding: '1px 3px', borderRadius: 2 }}>COMUM</span>
                      <span style={{ color: '#64748b' }}>PLíSTICO FRíGIL</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', fontFamily: 'monospace', letterSpacing: '4px', margin: '-4px 0', color: '#cbd5e1', textDecoration: 'line-through' }}>
                      DRW8V17
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', fontSize: '0.45rem', color: 'var(--color-red)', fontWeight: 600 }}>
                      â SEM SEGURANíA CONTRA ROUBO
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: Interactive Installation Simulator */}
      <section id="simulador-instalacao" style={{ padding: '80px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '16px', background: 'rgba(36, 75, 122, 0.06)', color: 'var(--color-cyan)' }}>
              Simulador Interativo
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Instalação e Proteção Interativa</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
              Veja na prática a engenharia das nossas peças! Escolha o veículo, clique em "Instalar Suporte" para encaixar a chapa de Inox original da Drawback Vix e assista à eliminação instantânea da vibração da placa.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'center' }}>
            
            {/* Visual Simulator Frame */}
            <div className="glass-panel animate-fade-in" style={{ padding: '30px', position: 'relative', overflow: 'hidden', minHeight: '430px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0a0d14', borderColor: 'rgba(255,255,255,0.06)' }}>
              
              {/* Simulator Tabs */}
              <div style={{ display: 'flex', gap: '10px', zIndex: 10 }}>
                <button
                  onClick={() => { setSimVehicle('car'); setSimInstalled(false); }}
                  className="btn"
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.82rem', 
                    background: simVehicle === 'car' ? 'var(--color-cyan)' : 'transparent',
                    color: '#ffffff',
                    border: '1px solid',
                    borderColor: simVehicle === 'car' ? 'var(--color-cyan)' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  🚗 Testar no Carro
                </button>
                <button
                  onClick={() => { setSimVehicle('moto'); setSimInstalled(false); }}
                  className="btn"
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.82rem', 
                    background: simVehicle === 'moto' ? 'var(--color-cyan)' : 'transparent',
                    color: '#ffffff',
                    border: '1px solid',
                    borderColor: simVehicle === 'moto' ? 'var(--color-cyan)' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  🏍️ Testar na Moto
                </button>
              </div>

              {/* Central Installation Stage Area */}
              <div style={{ 
                flex: 1, 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '30px 0',
                height: '240px'
              }}>
                
                {/* 1. VEHICLE BACKGROUND FRAME (GENERIC FRONT OR REAR FENDER) */}
                {simVehicle === 'car' ? (
                  <div style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: '16px',
                    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                    border: '1.5px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {/* Bumper Grille detail lines */}
                    <div style={{ position: 'absolute', top: '15px', width: '90%', height: '30px', borderBottom: '2px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '3px' }} />
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '3px' }} />
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '3px' }} />
                    </div>
                    {/* Plate holder block */}
                    <div style={{
                      width: '290px',
                      height: '80px',
                      background: '#090d16',
                      border: '1.5px dashed rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '30px'
                    }}>
                      <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', position: 'absolute', top: 6 }}>LOCAL DE FIXAÇÃO DA PLACA</span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '220px',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                  }}>
                    {/* Mudguard fender shape */}
                    <div style={{
                      width: '120px',
                      height: '200px',
                      background: 'linear-gradient(180deg, #1e293b 0%, #0c0f17 100%)',
                      borderRadius: '40px 40px 0 0',
                      border: '1.5px solid rgba(255,255,255,0.1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingBottom: '30px',
                      boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.8)'
                    }}>
                      {/* Rear reflector light */}
                      <div style={{ width: '30px', height: '10px', background: '#ef4444', borderRadius: '3px', position: 'absolute', top: 20, boxShadow: '0 0 10px rgba(239,68,68,0.5)' }} />
                      
                      {/* Metal plate mount arms */}
                      <div style={{
                        width: '160px',
                        height: '100px',
                        border: '2.5px dashed rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        background: '#030712',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        bottom: '-10px'
                      }}>
                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apoio de Placa</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. THE INOX SUPPORT (ANIMATED SLIDE UNDER THE PLATE) */}
                {simVehicle === 'car' ? (
                  <div style={{
                    width: '274px',
                    height: '22px',
                    background: 'linear-gradient(90deg, #cbd5e1 0%, #94a3b8 50%, #cbd5e1 100%)',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '4px',
                    position: 'absolute',
                    zIndex: 25,
                    bottom: simInstalled ? '80px' : '20px', 
                    left: simInstalled ? 'calc(50% - 137px)' : '20px',
                    opacity: simInstalled ? 0.95 : 0.8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 10px',
                    boxShadow: simInstalled ? '0 5px 15px rgba(0,0,0,0.5)' : '0 8px 25px rgba(0,240,255,0.25)',
                    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onClick={() => setSimInstalled(true)}
                  >
                    {/* Mounting slots */}
                    <div style={{ width: '20px', height: '5px', background: '#000', borderRadius: '3px' }} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#1e293b', letterSpacing: '1.5px', fontFamily: 'monospace' }}>DRAWBACK</span>
                    <div style={{ width: '20px', height: '5px', background: '#000', borderRadius: '3px' }} />
                  </div>
                ) : (
                  <div style={{
                    width: '152px',
                    height: '92px',
                    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
                    border: '1.5px solid #f1f5f9',
                    borderRadius: '8px 8px 0 0',
                    borderBottom: '4px solid #475569', 
                    position: 'absolute',
                    zIndex: 25,
                    bottom: simInstalled ? '3px' : '20px', 
                    left: simInstalled ? 'calc(50% - 76px)' : '20px',
                    opacity: simInstalled ? 0.95 : 0.8,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    boxShadow: simInstalled ? '0 6px 15px rgba(0,0,0,0.5)' : '0 8px 25px rgba(0,240,255,0.25)',
                    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onClick={() => setSimInstalled(true)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.52rem', fontWeight: 900, color: '#1e293b', letterSpacing: '1.2px', fontFamily: 'monospace' }}>DRAWBACK</span>
                    </div>
                    {/* Mounting slots */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                      <div style={{ width: '15px', height: '4px', background: '#000', borderRadius: '2px' }} />
                      <div style={{ width: '15px', height: '4px', background: '#000', borderRadius: '2px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: '18px', height: '4px', background: '#000', borderRadius: '2px' }} />
                    </div>
                    <div style={{ height: '3px', width: '100%', background: '#475569', borderRadius: '1px', marginTop: 2 }} />
                  </div>
                )}

                {/* 3. THE LICENSE PLATE (SHAKES UNTIL INOX IS INSTALLED!) */}
                {simVehicle === 'car' ? (
                  <div 
                    style={{
                      width: '290px',
                      height: '80px',
                      background: '#fff',
                      border: '3px solid #0f172a',
                      borderRadius: '6px',
                      position: 'absolute',
                      zIndex: 30,
                      bottom: '50px',
                      left: 'calc(50% - 145px)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                      pointerEvents: 'none',
                      transition: 'transform 0.1s ease',
                      animation: !simInstalled ? 'vibrateCar 0.3s infinite ease-in-out' : 'none'
                    }}
                  >
                    {/* Top blue bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2563eb', padding: '2px 8px', margin: '-4px -8px 0', borderRadius: '3px 3px 0 0', color: '#fff', fontSize: '0.45rem', fontWeight: 800 }}>
                      <span>MERCOSUL</span>
                      <span>BRASIL</span>
                      <div style={{ width: 10, height: 6, background: '#10b981', border: '1px solid #fff' }} />
                    </div>
                    {/* Plate Letters */}
                    <div style={{ fontSize: '2rem', fontWeight: 900, textAlign: 'center', fontFamily: 'monospace', color: '#1e293b', letterSpacing: '4px', margin: '4px 0 -4px' }}>
                      DRW8V26
                    </div>
                    {/* Bottom detail and screws overlay */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.4rem', color: '#64748b' }}>
                      <span>BR</span>
                      {/* Security screws overlay when installed */}
                      <div style={{ display: 'flex', gap: '208px', position: 'absolute', top: '22px', left: '32px' }}>
                        <div style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: simInstalled ? 'radial-gradient(circle, #cbd5e1, #475569)' : '#374151',
                          border: simInstalled ? '1px solid #94a3b8' : '1px dashed rgba(255,255,255,0.4)',
                          boxShadow: simInstalled ? '0 0 5px rgba(255,255,255,0.8)' : 'none',
                          transition: 'background 0.5s ease'
                        }} />
                        <div style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: simInstalled ? 'radial-gradient(circle, #cbd5e1, #475569)' : '#374151',
                          border: simInstalled ? '1px solid #94a3b8' : '1px dashed rgba(255,255,255,0.4)',
                          boxShadow: simInstalled ? '0 0 5px rgba(255,255,255,0.8)' : 'none',
                          transition: 'background 0.5s ease'
                        }} />
                      </div>
                      <span>DRAWBACK VIX</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    style={{
                      width: '160px',
                      height: '96px',
                      background: '#fff',
                      border: '3px solid #0f172a',
                      borderRadius: '6px',
                      position: 'absolute',
                      zIndex: 30,
                      bottom: '0px',
                      left: 'calc(50% - 80px)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                      pointerEvents: 'none',
                      transition: 'transform 0.1s ease',
                      animation: !simInstalled ? 'vibrateMoto 0.15s infinite ease-in-out' : 'none'
                    }}
                  >
                    {/* Top blue bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2563eb', padding: '2px 4px', margin: '-4px -8px 0', borderRadius: '3px 3px 0 0', color: '#fff', fontSize: '0.4rem', fontWeight: 800 }}>
                      <span>MERCOSUL</span>
                      <span>BRASIL</span>
                    </div>
                    {/* Plate Letters */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '2px 0' }}>
                      <strong style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'monospace', color: '#1e293b', letterSpacing: '3px', lineHeight: 1.1 }}>DRW8</strong>
                      <strong style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'monospace', color: '#1e293b', letterSpacing: '3px', lineHeight: 1.1 }}>V26</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.35rem', color: '#64748b' }}>
                      <span>BR</span>
                      {/* Security screws overlay when installed */}
                      <div style={{ display: 'flex', gap: '84px', position: 'absolute', top: '18px', left: '30px' }}>
                        <div style={{ 
                          width: '9px', 
                          height: '9px', 
                          borderRadius: '50%', 
                          background: simInstalled ? 'radial-gradient(circle, #cbd5e1, #475569)' : '#374151',
                          border: simInstalled ? '1px solid #94a3b8' : '1px dashed rgba(255,255,255,0.4)',
                          boxShadow: simInstalled ? '0 0 5px rgba(255,255,255,0.8)' : 'none',
                          transition: 'background 0.5s ease'
                        }} />
                        <div style={{ 
                          width: '9px', 
                          height: '9px', 
                          borderRadius: '50%', 
                          background: simInstalled ? 'radial-gradient(circle, #cbd5e1, #475569)' : '#374151',
                          border: simInstalled ? '1px solid #94a3b8' : '1px dashed rgba(255,255,255,0.4)',
                          boxShadow: simInstalled ? '0 0 5px rgba(255,255,255,0.8)' : 'none',
                          transition: 'background 0.5s ease'
                        }} />
                      </div>
                      <span>MOTO</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Status Message Overlay at the bottom */}
              <div>
                {simInstalled ? (
                  <div style={{
                    background: 'rgba(16,185,129,0.12)',
                    border: '1.5px solid var(--color-green)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.3s ease-out'
                  }}>
                    <ShieldCheck size={20} style={{ color: 'var(--color-green)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>
                      🛡️ Placa 100% Protegida! Suporte Inox Drawback fixado. Vibração eliminada e proteção total contra perda e furto.
                    </span>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(239,68,68,0.12)',
                    border: '1.5px solid var(--color-red)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <HelpCircle size={20} style={{ color: 'var(--color-red)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                      ⚠️ Placa Instável! Sem o suporte Inox de apoio, o metal sofre fadiga, trepida e corre o risco de trincar ou se perder em enchentes.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Control Panel Side */}
            <div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '16px', fontWeight: 700 }}>
                Como Funciona a Proteção?
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Nossas peças em Aço Inox 304 são instaladas **atrás da placa**. Elas criam um escudo estrutural rígido que absorve a torção e fadiga de vento e motor, além de travar a placa com parafusos Allen antifurto especiais.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(36,75,122,0.1)', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Selecione a aba (🚗 Carro ou 🏍️ Moto)</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(36,75,122,0.1)', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>2</div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Clique no botão "Instalar Suporte"</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(36,75,122,0.1)', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>3</div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Veja os parafusos Allen com pino guia se fixando!</span>
                </div>
              </div>

              {simInstalled ? (
                <button
                  onClick={() => setSimInstalled(false)}
                  className="btn btn-silver animate-fade-in"
                  style={{ width: '100%', padding: '16px' }}
                >
                  🔄 Remover Suporte e Ver Vibração
                </button>
              ) : (
                <button
                  onClick={() => setSimInstalled(true)}
                  className="btn btn-cyan pulse-glow"
                  style={{ width: '100%', padding: '16px' }}
                >
                  🔧 Instalar Suporte Drawback Inox
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* EV Charger Section & Simulator */}
      <section id="carregadores" style={{ padding: '80px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Soluções de Energia para seu Elétrico</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Encontre o carregador ideal para o seu veículo, com monitoramento inteligente, displays integrados e proteção robusta IP66 contra chuva.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '70px' }}>
            {/* Portable Charger Card */}
            <div className="glass-panel glass-panel-cyan" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'linear-gradient(225deg, var(--color-cyan) 0%, transparent 70%)',
                width: '100px',
                height: '100px',
                opacity: 0.08
              }} />
              <span className="badge badge-cyan" style={{ marginBottom: '16px' }}>Mais Prático</span>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
                <img src="/portable.jpg" alt="Carregador Portátil Drawback Vix 7.2 kW" style={{ height: '140px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Carregador Portátil Premium 7.2 kW</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Liberdade para carregar em qualquer lugar com conector padrão nacional e controle total de corrente (8A a 32A).
              </p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '20px 0 10px', color: 'var(--color-cyan)', fontFamily: 'var(--font-display)' }}>
                R$ 2.490
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}> ou 12x de R$ 207,50</span>
              </div>
              <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '24px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-cyan)' }} /> Display LCD com temperatura e potência ativa
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-cyan)' }} /> Cabo de 5 metros de alta resistência
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-cyan)' }} /> Proteção contra picos de energia integrada
                </li>
              </ul>
              <button 
                onClick={() => handleBuyClick('portable')}
                className="btn btn-cyan" 
                style={{ width: '100%', padding: '12px' }}
              >
                Comprar agora (Frete Grátis) <ArrowRight size={16} />
              </button>
            </div>

            {/* Wallbox Charger Card */}
            <div className="glass-panel glass-panel-cyan" style={{ padding: '30px', position: 'relative', overflow: 'hidden', border: '2px solid var(--color-cyan)' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'linear-gradient(225deg, var(--color-cyan) 0%, transparent 60%)',
                width: '120px',
                height: '120px',
                opacity: 0.12
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge" style={{ background: 'var(--color-cyan)', color: '#ffffff' }}>Líder de Vendas</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontWeight: 600 }}>COMPATíVEL BYD/VOLVO</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
                <img src="/wallbox_side.jpg" alt="Wallbox Smart Pro Drawback Vix 22 kW" style={{ height: '140px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Wallbox Inteligente Smart Pro 22 kW</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Estação de carregamento fixa residencial e comercial. Controle por aplicativo móvel, agendamento de carga e relatórios.
              </p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '20px 0 10px', color: 'var(--color-cyan)', fontFamily: 'var(--font-display)' }}>
                R$ 3.890
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}> ou 12x de R$ 324,16</span>
              </div>
              <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '24px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-cyan)' }} /> Conexão Wi-Fi, Bluetooth e Aplicativo Próprio
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-cyan)' }} /> Autenticação por Cartão RFID inclusa (2 unidades)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-cyan)' }} /> Grau de Proteção IP66 (Resiste a chuvas pesadas)
                </li>
              </ul>
              <button 
                onClick={() => handleBuyClick('wallbox')}
                className="btn btn-cyan" 
                style={{ width: '100%', padding: '12px' }}
              >
                Comprar agora (Frete Grátis) <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* INTERACTIVE SIMULATOR */}
          <div className="glass-panel" style={{ padding: '40px', border: '1px solid rgba(36, 75, 122, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ color: 'var(--color-cyan)', background: 'rgba(36,75,122,0.06)', padding: '10px', borderRadius: '50%' }}>
                <Timer size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Simulador Inteligente de Recarga</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Veja na prática o tempo necessário para recarregar o seu veículo!</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              {/* Controles do Simulador */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '130px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        1. Marca do Veículo:
                      </label>
                      <select 
                        value={selectedBrand} 
                        onChange={(e) => handleBrandChange(e.target.value)}
                        className="input-field"
                        style={{ background: '#ffffff', color: 'var(--text-primary)' }}
                      >
                        {Object.entries(brands).map(([key, name]) => (
                          <option key={key} value={key}>{name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div style={{ flex: 1.5, minWidth: '160px' }}>
                      {selectedBrand === 'outro' ? (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Bateria do Veículo (kWh):
                          </label>
                          <input 
                            type="number" 
                            value={customCapacity} 
                            onChange={(e) => setCustomCapacity(e.target.value)}
                            className="input-field"
                            placeholder="Ex: 50"
                            min="5"
                            max="200"
                            step="0.1"
                            style={{ background: '#ffffff', color: 'var(--text-primary)' }}
                          />
                        </div>
                      ) : (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            2. Modelo do Veículo:
                          </label>
                          <select 
                            value={selectedModel} 
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="input-field"
                            style={{ background: '#ffffff', color: 'var(--text-primary)' }}
                          >
                            {Object.entries(carsByBrand[selectedBrand]).map(([key, car]) => (
                              <option key={key} value={key}>
                                {brands[selectedBrand]} {car.name} ({car.capacity} kWh)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{carData.desc}</p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    2. Escolha o Carregador:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(powers).map(([pKey, pVal]) => (
                      <label 
                        key={pKey}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '10px',
                          border: `1px solid ${selectedPower === pKey ? 'var(--color-cyan)' : 'var(--border-light)'}`,
                          background: selectedPower === pKey ? 'rgba(36, 75, 122, 0.05)' : 'rgba(0,0,0,0.01)',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <input 
                          type="radio" 
                          name="power" 
                          value={pKey} 
                          checked={selectedPower === pKey} 
                          onChange={() => setSelectedPower(pKey)}
                          style={{ accentColor: 'var(--color-cyan)' }}
                        />
                        <div>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block' }}>{pVal.label}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pVal.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resultados do Simulador */}
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  background: 'rgba(36,75,122,0.02)',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%'
                }} />

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tempo Estimado de Carga</span>
                  <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-display)', margin: '4px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                    {timeToCharge}
                    <span style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginLeft: '4px' }}>horas</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(de 0% a 100% de bateria)</span>
                </div>

                <div style={{ width: '100%', height: '1px', background: 'var(--border-light)', margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Autonomia Estimada</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>~{carData.range} km</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Km/h Adicionados</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--color-cyan)' }}>+{powers[selectedPower].rangePerHour} km/h</strong>
                  </div>
                </div>

                {/* Animated Battery Bar */}
                <div style={{ width: '100%', marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                    <span>Nível de Carga</span>
                    <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>100% Completo</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-heavy)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="pulse-glow" style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--color-cyan), #3b82f6)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Customer Reviews Section */}
      <section id="depoimentos" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>O que dizem os donos de elétricos e motos</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Mais de 5.000 clientes satisfeitos em todo o Brasil. Qualidade certificada pelos compradores.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {/* Review 1 */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: 4, color: 'var(--color-gold)', marginBottom: '12px' }}>
                <Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontStyle: 'italic', marginBottom: '20px' }}>
                "Comprei o portátil de 7.2kW para deixar no porta-malas do meu Dolphin Mini. Me salvou em uma viagem de final de semana para o interior onde só havia tomadas industriais simples. O display mostra a corrente real e carrega super rápido."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,240,255,0.1)', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  MT
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Maurício Torres</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dono de BYD Dolphin Mini</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: 4, color: 'var(--color-gold)', marginBottom: '12px' }}>
                <Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontStyle: 'italic', marginBottom: '20px' }}>
                "Moro em Vitória e o suporte de placa inox pra moto resolveu meu problema de vez. As ruas aqui alagam sempre na chuva e eu já tinha perdido duas placas na enxurrada. Essa chapa de inox é blindada, não sai por nada!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(226,232,240,0.1)', color: 'var(--color-silver)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  FA
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Felipe Almeida</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dono de Honda CB 650R</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: 4, color: 'var(--color-gold)', marginBottom: '12px' }}>
                <Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" /><Star size={16} fill="var(--color-gold)" />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontStyle: 'italic', marginBottom: '20px' }}>
                "Comprei o par de réguas de reforço para o meu Volvo. O acabamento em aço inox escovado é maravilhoso, com um visual extremamente limpo e premium. E a paz de saber que as placas estão 100% protegidas contra perda e furto é impagável."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,240,255,0.1)', color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  LS
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Letícia Soares</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dona de Volvo XC40</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section style={{ padding: '80px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Perguntas Frequentes</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Tudo o que você precisa saber sobre as nossas soluções</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* FAQ 1 */}
            <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => toggleFaq(0)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Como funciona a instalação do Wallbox de 22kW?</h4>
                <ChevronDown size={18} style={{ transform: faqOpen[0] ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)' }} />
              </div>
              {faqOpen[0] && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '12px', lineHeight: 1.6 }}>
                  A instalação deve ser feita por um eletricista qualificado. O equipamento precisa de uma rede elétrica bifásica ou trifásica dedicada com disjuntor adequado. Fornecemos um manual de instalação passo a passo em português e suporte técnico via WhatsApp para auxiliar o seu instalador se necessário.
                </p>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => toggleFaq(1)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>O carregador é compatível com qualquer modelo de carro elétrico no Brasil?</h4>
                <ChevronDown size={18} style={{ transform: faqOpen[1] ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)' }} />
              </div>
              {faqOpen[1] && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '12px', lineHeight: 1.6 }}>
                  Sim! Nossos carregadores utilizam o conector padrão nacional Tipo 2 (Type 2 / IEC 62196), que é o padrão utilizado por 98% dos veículos elétricos e híbridos plug-in em circulação no Brasil, incluindo BYD, Volvo, GWM, Renault, Peugeot, BMW e Porsche.
                </p>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => toggleFaq(2)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>O suporte de placa serve para placas do novo modelo Mercosul e antigas?</h4>
                <ChevronDown size={18} style={{ transform: faqOpen[2] ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)' }} />
              </div>
              {faqOpen[2] && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '12px', lineHeight: 1.6 }}>
                  Sim! Temos variações dimensionais específicas para as novas placas Mercosul de motos e carros, assim como para as placas cinzas tradicionais. Ao realizar a compra pelo WhatsApp, nossa equipe confirma o modelo do seu veículo e a placa correspondente para enviar a peça perfeitamente compatível.
                </p>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => toggleFaq(3)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>O kit antifurto acompanha a chave especial de aperto?</h4>
                <ChevronDown size={18} style={{ transform: faqOpen[3] ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)' }} />
              </div>
              {faqOpen[3] && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '12px', lineHeight: 1.6 }}>
                  Absolutamente! O kit acompanha o suporte de aço inox, os parafusos antifurto com rosca adequada para o seu carro/moto e a **chave-segredo codificada exclusiva** necessária para a instalação e remoção futura. Guarde a chave-segredo em local seguro (como porta-luvas) caso precise retirar a placa para transferência futuramente.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 0 30px', borderTop: '1px solid var(--border-light)', background: '#040508' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', marginBottom: '40px' }}>
            <div style={{ maxWidth: '350px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.4rem', fontFamily: 'var(--font-display)', display: 'block', marginBottom: '8px' }}>
                DRAWBACK<span style={{ color: 'var(--color-cyan)' }}>VIX</span>
              </span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Fabricação nacional de suportes antifurto de placa em Aço Inox 304 e soluções de energia inteligente para recarga de automóveis híbridos e 100% elétricos.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Contato & Suporte</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>Telefone: (27) 99959-5154</li>
                <li>E-mail: sac@lojadrawbackvix.com.br</li>
                <li>Localização: Vitória - ES</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Links Rápidos</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                <li><a href="#carregadores" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Carregadores Elétricos</a></li>
                <li><a href="#suportes" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Suportes de Placa</a></li>
                <li>
                  <button onClick={onNavigateToAdmin} className="btn-link" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                    írea Administrativa (Dona)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '30px 0' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <p>Â© {new Date().getFullYear()} Drawback Vix. Todos os direitos reservados. CNPJ: 28.727.240/0001-99</p>
            <p>Desenvolvido com tecnologia de ponta</p>
          </div>
        </div>
      </footer>

      {/* SECTION: E-commerce Checkout Modal */}
      {isCheckoutOpen && checkoutProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(12, 15, 23, 0.75)',
          backdropFilter: 'blur(16px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out',
          padding: '20px',
          color: 'var(--text-primary)'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '560px',
            background: '#ffffff',
            border: '1.5px solid var(--border-heavy)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 30px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comprar com Frete Grátis</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Finalizar seu Pedido</h3>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ×
              </button>
            </div>

            {/* Content body */}
            <div style={{ padding: '30px', flex: 1 }}>
              
              {/* Product summary preview */}
              <div style={{
                background: 'rgba(0,0,0,0.015)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{checkoutProduct.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-green)', fontWeight: 600, marginTop: 4 }}>✓ Frete Grátis incluso</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-display)' }}>
                    R$ {checkoutProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              {/* Progress Steps Indicator */}
              {checkoutStep < 4 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'var(--border-light)', zIndex: 1 }} />
                  <div style={{ position: 'absolute', top: '15px', left: '10%', width: checkoutStep === 2 ? '40%' : checkoutStep === 3 ? '80%' : '0%', height: '2px', background: 'var(--color-cyan)', zIndex: 2, transition: 'width 0.4s ease' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '30%' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: checkoutStep >= 1 ? 'var(--color-cyan)' : 'var(--bg-secondary)', color: checkoutStep >= 1 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid var(--color-cyan)' }}>1</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 6, color: checkoutStep >= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Entrega</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '30%' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: checkoutStep >= 2 ? 'var(--color-cyan)' : '#fff', color: checkoutStep >= 2 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: checkoutStep >= 2 ? '2px solid var(--color-cyan)' : '2px solid var(--border-heavy)' }}>2</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 6, color: checkoutStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Dados</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '30%' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: checkoutStep >= 3 ? 'var(--color-cyan)' : '#fff', color: checkoutStep >= 3 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: checkoutStep >= 3 ? '2px solid var(--color-cyan)' : '2px solid var(--border-heavy)' }}>3</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 6, color: checkoutStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Pagamento</span>
                  </div>
                </div>
              )}

              {/* STEP 1: CEP / DELIVERY TIME */}
              {checkoutStep === 1 && (
                <form onSubmit={handleCepSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Calcular Prazo de Entrega:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Ex: 29000-000" 
                        value={cepInput} 
                        onChange={(e) => setCepInput(e.target.value.replace(/\D/g, '').substring(0, 8))}
                        className="input-field"
                        style={{ flex: 1, background: '#fff', color: 'var(--text-primary)', border: '1.5px solid var(--border-heavy)' }}
                        required
                      />
                      <button 
                        type="submit" 
                        className="btn btn-cyan" 
                        disabled={cepLoading}
                        style={{ padding: '0 24px', minWidth: '120px' }}
                      >
                        {cepLoading ? 'Calculando...' : 'Calcular'}
                      </button>
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    color: 'var(--color-green)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <ShieldCheck size={18} />
                    <strong>Frete Grátis garantido para todo o território nacional!</strong>
                  </div>
                </form>
              )}

              {/* STEP 2: PERSONAL & SHIPPING DATA */}
              {checkoutStep === 2 && (
                <form onSubmit={handlePersonalDataSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Delivery notification card */}
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(36, 75, 122, 0.05)',
                    border: '1.5px solid rgba(36, 75, 122, 0.12)',
                    color: 'var(--color-cyan)',
                    fontSize: '0.82rem',
                    lineHeight: '1.4',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>🚚 Prazo de Entrega Calculado!</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Tempo de entrega estimado em <strong>{deliveryDays} {deliveryDays === 1 ? 'dia útil' : 'dias úteis'}</strong> para <strong>{formData.city || 'sua localidade'} - {formData.state || ''}</strong>. Endereço preenchido automaticamente via CEP!
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Nome Completo *</label>
                      <input type="text" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>CPF (Nota Fiscal) *</label>
                      <input type="text" placeholder="000.000.000-00" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value.replace(/\D/g, '').substring(0, 11)})} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>E-mail *</label>
                      <input type="email" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Telefone / WhatsApp *</label>
                      <input type="tel" placeholder="(27) 99999-9999" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '8px' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Endereço de Entrega (CEP: {cepInput})</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Logradouro (Rua/Av) *</label>
                        <input type="text" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Número *</label>
                        <input type="text" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Complemento (Opcional)</label>
                        <input type="text" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} value={formData.complement} onChange={(e) => setFormData({...formData, complement: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Bairro *</label>
                        <input type="text" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={formData.neighborhood} onChange={(e) => setFormData({...formData, neighborhood: e.target.value})} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Cidade *</label>
                        <input type="text" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Estado *</label>
                        <input type="text" placeholder="UF" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required maxLength="2" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setCheckoutStep(1)} className="btn btn-outline" style={{ flex: 1, padding: '12px' }}>Voltar</button>
                    <button type="submit" className="btn btn-cyan" style={{ flex: 2, padding: '12px' }}>Continuar para Pagamento</button>
                  </div>
                </form>
              )}

              {/* STEP 3: PAYMENT METHOD */}
              {checkoutStep === 3 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Payment Tabs */}
                  <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.03)', padding: '4px', borderRadius: '10px' }}>
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: paymentMethod === 'pix' ? '#ffffff' : 'transparent',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: paymentMethod === 'pix' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      ⚡ PIX
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: paymentMethod === 'card' ? '#ffffff' : 'transparent',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: paymentMethod === 'card' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      💳 Cartão de Crédito
                    </button>
                  </div>

                  {paymentMethod === 'pix' ? (
                    /* PIX INTERFACE */
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'rgba(0,0,0,0.01)',
                      border: '1px solid var(--border-light)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '140px',
                        height: '140px',
                        background: '#fff',
                        border: '1px solid var(--border-heavy)',
                        borderRadius: '12px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%', height: '100%' }}>
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} style={{ background: (i % 3 === 0 || i % 5 === 0) ? '#0f172a' : '#e2e8f0', borderRadius: 2 }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Escaneie o código acima no app do seu banco</strong>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          A aprovação é imediata e o pedido entra na fila de despacho expresso imediatamente.
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => alert('Código Copia-e-Cola copiado com sucesso!')}
                        className="btn btn-silver" 
                        style={{ fontSize: '0.8rem', padding: '8px 16px', width: '100%' }}
                      >
                        📋 Copiar Chave Pix Copia-e-Cola
                      </button>
                    </div>
                  ) : (
                    /* CARD INTERFACE */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      
                      {/* Premium Card mockup */}
                      <div style={{
                        background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-brand-blue) 100%)',
                        color: '#fff',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 8px 25px rgba(36, 75, 122, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '150px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <strong style={{ fontSize: '0.8rem', opacity: 0.8, letterSpacing: '2px' }}>DRAWBACK VIX</strong>
                          <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>CREDIT CARD</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '3px', fontFamily: 'monospace', margin: '14px 0 6px' }}>
                          {cardData.number ? cardData.number.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div>
                            <span style={{ fontSize: '0.6rem', opacity: 0.7, display: 'block', textTransform: 'uppercase' }}>Titular</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cardData.name ? cardData.name.toUpperCase() : 'NOME DO TITULAR'}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.6rem', opacity: 0.7, display: 'block', textTransform: 'uppercase' }}>Validade</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cardData.expiry ? cardData.expiry : 'MM/AA'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Input fields */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Número do Cartão *</label>
                          <input type="text" placeholder="4000 1234 5678 9010" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={cardData.number} onChange={(e) => setCardData({...cardData, number: e.target.value.replace(/\D/g, '').substring(0, 16)})} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Nome como no Cartão *</label>
                          <input type="text" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={cardData.name} onChange={(e) => setCardData({...cardData, name: e.target.value})} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Validade *</label>
                            <input type="text" placeholder="MM/AA" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={cardData.expiry} onChange={(e) => setCardData({...cardData, expiry: e.target.value.replace(/[^\d/]/g, '').substring(0, 5)})} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>CVV *</label>
                            <input type="text" placeholder="123" className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} required value={cardData.cvv} onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '').substring(0, 4)})} />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Opções de Parcelamento *</label>
                          <select className="input-field" style={{ background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-heavy)', padding: '10px' }} value={cardData.installments} onChange={(e) => setCardData({...cardData, installments: e.target.value})}>
                            <option value="1">1x de R$ {checkoutProduct.price.toFixed(2)} sem juros</option>
                            <option value="2">2x de R$ {(checkoutProduct.price/2).toFixed(2)} sem juros</option>
                            <option value="3">3x de R$ {(checkoutProduct.price/3).toFixed(2)} sem juros</option>
                            <option value="6">6x de R$ {(checkoutProduct.price/6).toFixed(2)} sem juros</option>
                            <option value="12">12x de R$ {(checkoutProduct.price/12).toFixed(2)} sem juros</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setCheckoutStep(2)} className="btn btn-outline" style={{ flex: 1, padding: '12px' }}>Voltar</button>
                    <button type="button" onClick={handleCheckoutFinalize} className="btn btn-cyan pulse-glow" style={{ flex: 2, padding: '12px' }}>
                      Concluir Compra
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS CONGRATS */}
              {checkoutStep === 4 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--color-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    boxShadow: '0 0 20px rgba(16,185,129,0.3)',
                    marginBottom: '10px'
                  }}>
                    ✓
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pedido Confirmado!</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 4 }}>Parabéns pela sua compra!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '8px', lineHeight: 1.6 }}>
                      O seu pedido de **{checkoutProduct.name}** foi recebido com sucesso. O número da sua ordem é **{newOrderId}**.
                    </p>
                  </div>
                  
                  <div style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.015)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.82rem',
                    textAlign: 'left'
                  }}>
                    <strong>Resumo da entrega:</strong>
                    <ul style={{ listStyle: 'none', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text-secondary)' }}>
                      <li>• Destinatário: <strong>{formData.name}</strong></li>
                      <li>• CEP de Envio: <strong>{cepInput}</strong></li>
                      <li>• Endereço: <strong>{formData.street}, {formData.number} - {formData.city}/{formData.state}</strong></li>
                      <li>• Prazo Estimado: <strong>{deliveryDays} dias úteis (Frete Grátis)</strong></li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => { setIsCheckoutOpen(false); setCheckoutStep(1); }}
                    className="btn btn-cyan" 
                    style={{ width: '100%', padding: '14px', marginTop: '10px' }}
                  >
                    Voltar para a Loja
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
