import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  Truck, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  User, 
  Sparkles,
  Link,
  DollarSign,
  ArrowLeft,
  Printer,
  Tag,
  Trash2,
  Settings,
  FileSpreadsheet,
  X,
  Check,
  Edit
} from 'lucide-react';

export default function Dashboard({ onNavigateToStore, products, setProducts, orders, setOrders }) {
  // Connection toggles
  const [mlActive, setMlActive] = useState(true);
  const [websiteActive, setWebsiteActive] = useState(true);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Tab State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'labels'

  // Label Generator State
  const [excelInput, setExcelInput] = useState('');
  const [chassisList, setChassisList] = useState([
    { id: 1, full: 'LMGAF1S80V1023267', last8: 'V1023267', year: '2026', selected: true },
    { id: 2, full: 'LMGAF1S86V1023273', last8: 'V1023273', year: '2026', selected: true }
  ]);
  const [editingChassisId, setEditingChassisId] = useState(null);
  const [editChassisFull, setEditChassisFull] = useState('');
  const [editChassisYear, setEditChassisYear] = useState('');

  const [brandName, setBrandName] = useState('GAC MOTOR');
  const [selectedFont, setSelectedFont] = useState('Wallpoet'); // 'Wallpoet', 'Allerta', 'monospace'
  const [printType, setPrintType] = useState('both'); // 'both', 'chapelonas', 'autodestrutivas'

  // Millimeter Calibration States
  const [chapelonaWidth, setChapelonaWidth] = useState(110);      // 110mm = 11cm
  const [chapelonaHeight, setChapelonaHeight] = useState(43);      // 43mm = 4.3cm
  const [autodestrutivaWidth, setAutodestrutivaWidth] = useState(80); // 80mm
  const [autodestrutivaHeight, setAutodestrutivaHeight] = useState(25); // 25mm
  const [labelMargin, setLabelMargin] = useState(4);                // spacing in mm
  const [pageMarginTop, setPageMarginTop] = useState(5);            // page top margin in mm

  // Excel TSV Parser
  const handleImportExcel = () => {
    if (!excelInput.trim()) {
      showToast('Por favor, cole alguma linha do Excel antes de processar.');
      return;
    }

    const lines = excelInput.split('\n');
    const parsed = [];

    lines.forEach((line, index) => {
      const cols = line.split(/\t/);
      if (cols.length === 0 || !cols[0].trim()) return;

      const rawChassis = cols[0].trim().toUpperCase();

      // Skip table headers
      if (rawChassis.includes('CHASSI') || rawChassis.includes('CHASSIS') || rawChassis.includes('VIN')) {
        return;
      }

      // Extract Year
      let rawYear = '';
      if (cols[1]) {
        rawYear = cols[1].trim();
      }

      // Clean up and validate chassis (keep alphanumeric)
      const full = rawChassis.replace(/[^A-Z0-9]/g, '');
      const last8 = full.length >= 8 ? full.slice(-8) : full;

      if (full) {
        parsed.push({
          id: Date.now() + index,
          full: full,
          last8: last8,
          year: rawYear || new Date().getFullYear().toString(),
          selected: true
        });
      }
    });

    if (parsed.length > 0) {
      setChassisList(prev => [...prev, ...parsed]);
      setExcelInput('');
      showToast(`${parsed.length} chassis carregados com sucesso!`);
    } else {
      showToast('Nenhum dado válido de chassi pôde ser extraído da área de transferência.');
    }
  };

  // Edit and Delete handlers for chassis database
  const startEditChassis = (item) => {
    setEditingChassisId(item.id);
    setEditChassisFull(item.full);
    setEditChassisYear(item.year);
  };

  const saveChassis = (id) => {
    if (!editChassisFull.trim()) {
      showToast('O chassi não pode ser vazio!');
      return;
    }
    
    setChassisList(prev => prev.map(item => {
      if (item.id === id) {
        const full = editChassisFull.trim().toUpperCase();
        const last8 = full.length >= 8 ? full.slice(-8) : full;
        return {
          ...item,
          full,
          last8,
          year: editChassisYear.trim()
        };
      }
      return item;
    }));
    
    setEditingChassisId(null);
    showToast('Chassi atualizado com sucesso!');
  };

  const deleteChassis = (id) => {
    setChassisList(prev => prev.filter(item => item.id !== id));
    showToast('Chassi removido.');
  };

  const clearAllChassis = () => {
    setChassisList([]);
    showToast('Todos os chassis foram removidos.');
  };

  const loadExampleData = () => {
    setExcelInput("LMGAF1S80V1023267\t2026\nLMGAF1S86V1023273\t2026");
    showToast('Exemplo carregado! Clique em "Processar e Importar" para carregar os dados.');
  };

  const toggleSelectAll = (selectVal) => {
    setChassisList(prev => prev.map(item => ({ ...item, selected: selectVal })));
  };

  const toggleSelectChassis = (id) => {
    setChassisList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    }));
  };

  const triggerPrint = () => {
    const selectedCount = chassisList.filter(c => c.selected).length;
    if (selectedCount === 0) {
      showToast('Aviso: Selecione ao menos um chassi na tabela para imprimir.');
      return;
    }
    showToast('Abrindo janela de impressão... O sistema ocultou o dashboard automaticamente.');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Olá! Sou a sua Assistente IA da Drawback Vix. Como não precisa saber mexer em nada técnico, você pode me pedir coisas em português normal! Clique em um dos botões abaixo ou digite seu comando.' }
  ]);

  // Handler for fast product updates
  const startEdit = (prod) => {
    setEditingId(prod.id);
    setEditPrice(prod.price.toString());
    setEditStock(prod.stock.toString());
  };

  const saveProduct = (id) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, price: parseFloat(editPrice), stock: parseInt(editStock) };
      }
      return p;
    }));
    setEditingId(null);
    showToast('Preço e Estoque atualizados com sucesso no Mercado Livre e Loja Integrada simultaneamente!');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Shipping state change
  const shipOrder = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'shipped' };
      }
      return o;
    }));
    showToast(`Etiqueta do pedido ${orderId} gerada e status atualizado para "A caminho"!`);
  };

  // AI Assistant commands simulator
  const handleAiCommand = (text) => {
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let aiText = '';
      const cleanText = text.toLowerCase();

      if (cleanText.includes('faturamos') || cleanText.includes('quanto vendemos') || cleanText.includes('venda')) {
        aiText = 'Hoje tivemos um ótimo dia de trabalho! Realizamos 3 vendas que totalizaram R$ 6.529,00 em faturamento, gerando um lucro estimado de R$ 1.940,00. Nossos servidores estão rodando perfeitamente e os estoques sincronizados.';
      } 
      else if (cleanText.includes('mudar preço') || cleanText.includes('ajustar preço') || cleanText.includes('placa de moto')) {
        // Simular a alteração de preço do produto 1 (Placa de Moto) para R$ 159
        const targetPrice = cleanText.includes('159') ? 159 : 149;
        setProducts(prev => prev.map(p => {
          if (p.id === 1) {
            return { ...p, price: targetPrice };
          }
          return p;
        }));
        aiText = `Entendido! Já alterei o preço do "Suporte de Placa Antifurto Moto" para R$ ${targetPrice},00. Enviei a atualização imediatamente para o Mercado Livre e também para o seu site próprio Loja Integrada. Ambos já estão atualizados.`;
      } 
      else if (cleanText.includes('estoque') && (cleanText.includes('moto') || cleanText.includes('suporte'))) {
        setProducts(prev => prev.map(p => {
          if (p.id === 1) {
            return { ...p, stock: 50 };
          }
          return p;
        }));
        aiText = 'Claro! Atualizei o estoque do "Suporte de Placa Antifurto Moto" para 50 unidades. A sincronização automática foi concluída com sucesso em ambos os canais de venda.';
      }
      else if (cleanText.includes('pedido') || cleanText.includes('envio') || cleanText.includes('etiqueta')) {
        aiText = 'Temos atualmente 1 pedido aguardando envio: Pedido #1210 de Felipe Almeida (Suporte Placa Moto). Você pode clicar no botão "Gerar Etiqueta" no painel ao lado para despachá-lo rapidamente!';
      }
      else {
        aiText = 'Recebi o seu comando! Realizei a varredura nos canais do Mercado Livre e da Loja Integrada. Tudo está funcionando corretamente e sem erros. Se precisar alterar algum estoque ou preço de produto, digite algo como: "Ajustar estoque de placa para 50" ou "Mudar preço da placa de moto para 159".';
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 800);
  };

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--bg-secondary)',
          border: '2px solid var(--color-green)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 100,
          maxWidth: '400px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle style={{ color: 'var(--color-green)', flexShrink: 0 }} size={24} />
          <div>
            <h5 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Ação Concluída</h5>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <header style={{
        background: 'rgba(15, 17, 26, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={onNavigateToStore} 
              className="btn btn-outline" 
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
            >
              <ArrowLeft size={14} />
              Voltar ao Site
            </button>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-light)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src="/logo.jpg" 
                alt="Drawback Vix Logo" 
                style={{ 
                  height: '38px', 
                  borderRadius: '50%', 
                  border: '1.5px solid var(--color-cyan)',
                  boxShadow: '0 0 8px rgba(213,63,99,0.3)',
                  objectFit: 'cover'
                }} 
              />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Painel da Proprietária</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: -2 }}>Central de Controle Drawback Vix</h2>
              </div>
            </div>
          </div>

          {/* Sync Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '10px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: mlActive ? 'var(--color-green)' : 'var(--color-red)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mercado Livre</span>
              <label className="switch-control">
                <input type="checkbox" checked={mlActive} onChange={(e) => setMlActive(e.target.checked)} />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '10px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: websiteActive ? 'var(--color-green)' : 'var(--color-red)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Site Oficial</span>
              <label className="switch-control">
                <input type="checkbox" checked={websiteActive} onChange={(e) => setWebsiteActive(e.target.checked)} />
                <span className="switch-slider" />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic Print Styles Overrides for Millimeter Calibration */}
      <style>
        {`
          @media screen {
            .print-only-container {
              display: none !important;
            }
          }
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            header, footer, nav, aside, .btn, .no-print, .dashboard-sidebar, .dashboard-header, .toast-container {
              display: none !important;
            }
            #root, main, .dashboard-container, .glass-panel {
              padding: 0 !important;
              margin: 0 !important;
              background: transparent !important;
              box-shadow: none !important;
              border: none !important;
              backdrop-filter: none !important;
            }
            .print-only-container {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              z-index: 999999 !important;
              background: #ffffff !important;
            }
            .print-kit-wrapper {
              page-break-after: always !important;
              break-after: page !important;
              margin-bottom: 0 !important;
              padding-top: ${pageMarginTop}mm !important;
              display: block !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .print-chapelona-label {
              width: ${chapelonaWidth}mm !important;
              height: ${chapelonaHeight}mm !important;
              margin: ${labelMargin}mm !important;
              border: 2.5px dashed #3b82f6 !important;
              border-radius: 4px !important;
              background: #ffffff !important;
              display: inline-flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              box-sizing: border-box !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .print-autodestrutiva-label {
              width: ${autodestrutivaWidth}mm !important;
              height: ${autodestrutivaHeight}mm !important;
              margin: ${labelMargin}mm !important;
              border: 2px solid #244b7a !important;
              border-radius: 8px !important;
              background: #ffffff !important;
              display: inline-flex !important;
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `}
      </style>

      {/* Main Grid Content */}
      <main className="container" style={{ marginTop: '40px' }}>
        
        {/* Navigation Tabs */}
        <div className="no-print" style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '30px', 
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '16px' 
        }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="btn"
            style={{ 
              background: activeTab === 'dashboard' ? 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-brand-blue) 100%)' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-primary)',
              border: activeTab === 'dashboard' ? 'none' : '1px solid var(--border-heavy)',
              boxShadow: activeTab === 'dashboard' ? '0 4px 20px rgba(36, 75, 122, 0.2)' : 'none',
              padding: '10px 20px', 
              borderRadius: '12px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp size={16} />
            Painel Geral
          </button>
          <button 
            onClick={() => setActiveTab('labels')}
            className="btn"
            style={{ 
              background: activeTab === 'labels' ? 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-brand-blue) 100%)' : 'transparent',
              color: activeTab === 'labels' ? '#ffffff' : 'var(--text-primary)',
              border: activeTab === 'labels' ? 'none' : '1px solid var(--border-heavy)',
              boxShadow: activeTab === 'labels' ? '0 4px 20px rgba(36, 75, 122, 0.2)' : 'none',
              padding: '10px 20px', 
              borderRadius: '12px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Tag size={16} />
            Gerador de Etiquetas
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            {/* ROW 1: Simple Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px', marginBottom: '30px' }} className="animate-fade-in">
              
              {/* Card 1 */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Faturamento Mensal
                  </span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px', fontFamily: 'var(--font-display)' }}>R$ 48.920</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-green)', fontWeight: 600 }}>+14% em relação ao mês anterior</span>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)', padding: '12px', borderRadius: '12px' }}>
                  <TrendingUp size={24} />
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Vendas Hoje
                  </span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px', fontFamily: 'var(--font-display)' }}>3 Pedidos</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-cyan)', fontWeight: 600 }}>Lucro Líquido: R$ 1.940,00</span>
                </div>
                <div style={{ background: 'rgba(0,240,255,0.1)', color: 'var(--color-cyan)', padding: '12px', borderRadius: '12px' }}>
                  <ShoppingBag size={24} />
                </div>
              </div>

              {/* Card 3 */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Estoque Sincronizado
                  </span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px', fontFamily: 'var(--font-display)' }}>97 Unidades</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sincronização em tempo real activa</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '12px', borderRadius: '12px' }}>
                  <Layers size={24} />
                </div>
              </div>

              {/* Card 4 */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Envios Pendentes
                  </span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px', fontFamily: 'var(--font-display)', color: 'var(--color-gold)' }}>1 Pendente</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 600 }}>Despachar hoje até 15h</span>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--color-gold)', padding: '12px', borderRadius: '12px' }}>
                  <Truck size={24} />
                </div>
              </div>

            </div>

            {/* ROW 2: Stock Sync & Shipments Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px', alignItems: 'start' }}>
              
              {/* Sincronizador de Produtos */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Controle Rápido de Preço e Estoque</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Altere aqui e o sistema atualiza o Mercado Livre e a Loja Integrada automaticamente de uma vez!</p>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RefreshCw size={14} /> Atualizar Canais
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {products.map(prod => (
                    <div 
                      key={prod.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border-light)',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Produto</span>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block', marginTop: 4 }}>{prod.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: 4 }}>Total de Vendas: {prod.sales} unid.</span>
                      </div>

                      {editingId === prod.id ? (
                        /* Edit Fields mode */
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ maxWidth: '100px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Preço (R$)</span>
                            <input 
                              type="number" 
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="input-field"
                              style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                            />
                          </div>
                          <div style={{ maxWidth: '80px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Estoque</span>
                            <input 
                              type="number" 
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="input-field"
                              style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>
                            <button onClick={() => saveProduct(prod.id)} className="btn btn-cyan" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                              Salvar
                            </button>
                            <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display mode */
                        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Preço de Venda</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-display)', display: 'block', marginTop: 2 }}>
                              R$ {prod.price}
                            </strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Estoque Disponível</span>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block', marginTop: 2 }}>
                              {prod.stock} un.
                            </strong>
                          </div>
                          <button 
                            onClick={() => startEdit(prod)} 
                            className="btn btn-outline" 
                            style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: 'rgba(255,255,255,0.1)' }}
                          >
                            Ajustar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rastreamento de Pedidos */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>Pedidos & Envios</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Logística rápida de despache</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {orders.map(order => (
                    <div 
                      key={order.id} 
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{order.id} • {order.customer}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{order.date}</span>
                        </div>
                        <div>
                          {order.status === 'delivered' && <span className="badge badge-green">Entregue</span>}
                          {order.status === 'shipped' && <span className="badge badge-cyan">A Caminho</span>}
                          {order.status === 'preparing' && <span className="badge badge-gold">Preparar</span>}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Produto: <strong style={{ color: 'var(--text-primary)' }}>{order.product}</strong>
                      </div>

                      {/* Tiny Timeline visual representer */}
                      <div className="timeline">
                        <div className={`timeline-step completed`}>
                          <div className="timeline-icon">✓</div>
                          <div className="timeline-label">Aprovado</div>
                        </div>
                        <div className={`timeline-step ${order.status !== 'preparing' ? 'completed' : 'active'}`}>
                          <div className="timeline-icon">{order.status !== 'preparing' ? '✓' : '⚙'}</div>
                          <div className="timeline-label">Embalando</div>
                        </div>
                        <div className={`timeline-step ${order.status === 'delivered' ? 'completed' : order.status === 'shipped' ? 'active' : ''}`}>
                          <div className="timeline-icon">🚚</div>
                          <div className="timeline-label">Enviado</div>
                        </div>
                        <div className={`timeline-step ${order.status === 'delivered' ? 'completed' : ''}`}>
                          <div className="timeline-icon">🏠</div>
                          <div className="timeline-label">Entregue</div>
                        </div>
                      </div>

                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => shipOrder(order.id)}
                          className="btn btn-cyan" 
                          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
                        >
                          <Printer size={14} /> Imprimir Etiqueta de Envio
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ROW 3: Simple Conversational AI Manager */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              
              <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ background: 'rgba(213, 63, 99, 0.1)', color: 'var(--color-cyan)', padding: 8, borderRadius: '50%' }}>
                    <Sparkles size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gerente IA da Drawback Vix</h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Você não precisa saber mexer em menus complexos. Apenas dê ordens em português normal ou clique nas sugestões abaixo!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'end' }}>
                  
                  {/* Chat Interface */}
                  <div className="chat-window">
                    <div className="chat-header">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Assistente Virtual Drawback</span>
                    </div>

                    <div className="chat-messages">
                      {chatMessages.map((msg, index) => (
                        <div 
                          key={index}
                          className={`chat-bubble ${msg.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}`}
                        >
                          {msg.text}
                        </div>
                      ))}
                    </div>

                    <div className="chat-input-area">
                      <input 
                        type="text" 
                        placeholder="Digite sua ordem aqui (ex: quanto faturamos hoje?)..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiCommand(chatInput)}
                        className="input-field"
                        style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem' }}
                      />
                      <button 
                        onClick={() => handleAiCommand(chatInput)}
                        className="btn btn-cyan" 
                        style={{ padding: '10px 14px' }}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Suggestions Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Atalhos de voz / Sugestões</span>
                    
                    <button 
                      onClick={() => handleAiCommand('Quanto faturamos hoje?')}
                      className="btn btn-outline" 
                      style={{ justifyContent: 'flex-start', padding: '12px', fontSize: '0.8rem', textAlign: 'left' }}
                    >
                      📊 Quanto faturamos hoje?
                    </button>
                    
                    <button 
                      onClick={() => handleAiCommand('Mudar preço da placa de moto para 159')}
                      className="btn btn-outline" 
                      style={{ justifyContent: 'flex-start', padding: '12px', fontSize: '0.8rem', textAlign: 'left' }}
                    >
                      🏷️ Mudar placa de moto para R$ 159
                    </button>

                    <button 
                      onClick={() => handleAiCommand('Qual o estoque do suporte de moto?')}
                      className="btn btn-outline" 
                      style={{ justifyContent: 'flex-start', padding: '12px', fontSize: '0.8rem', textAlign: 'left' }}
                    >
                      📦 Qual o estoque da placa de moto?
                    </button>

                    <button 
                      onClick={() => handleAiCommand('Ver pedidos para envio')}
                      className="btn btn-outline" 
                      style={{ justifyContent: 'flex-start', padding: '12px', fontSize: '0.8rem', textAlign: 'left' }}
                    >
                      🚚 Ver pedidos pendentes de envio
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </>
        ) : (
          /* GERADOR DE ETIQUETAS DE CHASSI */
          <div className="animate-fade-in no-print" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Title / Description */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>🏷️ Gerador Avançado de Etiquetas de Chassi</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Gere e imprima kits de etiquetas Chapelonas (Kit com 6) e Autodestrutivas (Kit com 3) com precisão milimétrica.
                </p>
              </div>
              <div className="badge badge-cyan" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '8px' }}>
                Lote Ativo: {chassisList.filter(c => c.selected).length} Chassis Selecionados
              </div>
            </div>

            {/* Layout Workspace Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Column: Input Forms & Calibration sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. Importar Planilha Card */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <FileSpreadsheet style={{ color: 'var(--color-cyan)' }} size={20} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>1. Importar Dados do Excel</h4>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Copie as colunas contendo o Chassi e o Ano de Fabricação no Excel e cole na caixa abaixo:
                  </p>
                  
                  <textarea
                    rows={4}
                    value={excelInput}
                    onChange={(e) => setExcelInput(e.target.value)}
                    placeholder="Cole os dados aqui...&#10;Ex:&#10;LMGAF1S80V1023267   2026&#10;LMGAF1S86V1023273   2026"
                    className="input-field"
                    style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.82rem', 
                      resize: 'vertical',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      marginBottom: '12px',
                      whiteSpace: 'pre',
                      lineHeight: '1.4'
                    }}
                  />
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={handleImportExcel}
                      className="btn btn-cyan" 
                      style={{ padding: '8px 16px', fontSize: '0.82rem', flex: 1 }}
                    >
                      Processar e Importar
                    </button>
                    <button 
                      onClick={loadExampleData}
                      className="btn btn-outline" 
                      style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                    >
                      Carregar Exemplo
                    </button>
                  </div>
                </div>

                {/* 2. Configurações Globais Card */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Settings style={{ color: 'var(--color-cyan)' }} size={20} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. Configuração do Lote</h4>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    {/* Montadora Input */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Nome da Montadora
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value.toUpperCase())}
                        className="input-field"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* Fonte Selector */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Fonte Stencil (Chapelonas)
                      </label>
                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="input-field"
                        style={{ padding: '8px 12px', fontSize: '0.85rem', backgroundColor: 'var(--bg-primary)' }}
                      >
                        <option value="Wallpoet">KIA MOTOR Stencil (Wallpoet)</option>
                        <option value="Allerta">Fita Segmentada (Allerta Stencil)</option>
                        <option value="monospace">Monoespaçada Industrial</option>
                      </select>
                    </div>

                    {/* Tipo Impressão Selector */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Tipo de Impressão
                      </label>
                      <select
                        value={printType}
                        onChange={(e) => setPrintType(e.target.value)}
                        className="input-field"
                        style={{ padding: '8px 12px', fontSize: '0.85rem', backgroundColor: 'var(--bg-primary)' }}
                      >
                        <option value="both">Imprimir Ambos (Chapelona + Autodestrutiva)</option>
                        <option value="chapelonas">Apenas Chapelonas (Kit com 6)</option>
                        <option value="autodestrutivas">Apenas Autodestrutivas (Kit com 3)</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* 3. Ajustes de Calibração Card */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Settings style={{ color: 'var(--color-cyan)' }} size={20} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>3. Ajuste Milimétrico (Calibração)</h4>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Configure o tamanho exato dos rolos da sua impressora térmica Brother/Zebra/Argox.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Chapelona size calibration sliders */}
                    <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-cyan)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Etiquetas Chapelonas
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Largura Chapelona</span>
                        <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>{chapelonaWidth} mm</span>
                      </div>
                      <input 
                        type="range" min="80" max="150" step="1"
                        value={chapelonaWidth} onChange={(e) => setChapelonaWidth(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-cyan)', marginBottom: '10px' }}
                      />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Altura Chapelona</span>
                        <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>{chapelonaHeight} mm</span>
                      </div>
                      <input 
                        type="range" min="30" max="80" step="1"
                        value={chapelonaHeight} onChange={(e) => setChapelonaHeight(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-cyan)' }}
                      />
                    </div>

                    {/* Autodestrutiva size calibration sliders */}
                    <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-cyan)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Etiquetas Auto-destrutivas
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Largura Autodestrutiva</span>
                        <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>{autodestrutivaWidth} mm</span>
                      </div>
                      <input 
                        type="range" min="50" max="120" step="1"
                        value={autodestrutivaWidth} onChange={(e) => setAutodestrutivaWidth(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-cyan)', marginBottom: '10px' }}
                      />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Altura Autodestrutiva</span>
                        <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>{autodestrutivaHeight} mm</span>
                      </div>
                      <input 
                        type="range" min="15" max="50" step="1"
                        value={autodestrutivaHeight} onChange={(e) => setAutodestrutivaHeight(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-cyan)' }}
                      />
                    </div>

                    {/* Margin sliders */}
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-cyan)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Espaçamento e Layout Geral
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Espaçamento de Bordas (Margem)</span>
                        <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>{labelMargin} mm</span>
                      </div>
                      <input 
                        type="range" min="0" max="15" step="1"
                        value={labelMargin} onChange={(e) => setLabelMargin(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-cyan)', marginBottom: '10px' }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Margem no Topo da Página</span>
                        <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>{pageMarginTop} mm</span>
                      </div>
                      <input 
                        type="range" min="0" max="20" step="1"
                        value={pageMarginTop} onChange={(e) => setPageMarginTop(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-cyan)' }}
                      />
                    </div>

                  </div>
                </div>

                {/* Print Action Trigger */}
                <button
                  onClick={triggerPrint}
                  className="btn pulse-glow"
                  style={{ 
                    padding: '16px', 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    boxShadow: '0 8px 30px rgba(16,185,129,0.3)',
                    border: 'none',
                    borderRadius: '16px'
                  }}
                >
                  <Printer size={22} />
                  Imprimir Lote ({chassisList.filter(c => c.selected).length} chassis)
                </button>

              </div>

              {/* Right Column: Active database and real-time visual thermal backing simulator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Chassis Manager Table */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Banco de Dados Temporário</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filtre e edite as informações dos chassis que serão impressos.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => toggleSelectAll(true)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        Marcar Todos
                      </button>
                      <button onClick={() => toggleSelectAll(false)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        Limpar Seleções
                      </button>
                      <button onClick={clearAllChassis} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-red)', borderColor: 'rgba(239,68,68,0.2)' }}>
                        Limpar Tudo
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-heavy)', color: 'var(--text-muted)', fontWeight: 600 }}>
                          <th style={{ padding: '12px 8px', width: '40px' }}>Ativo</th>
                          <th style={{ padding: '12px 12px' }}>Chassi Completo (17 caracteres)</th>
                          <th style={{ padding: '12px 12px', width: '90px' }}>Ano</th>
                          <th style={{ padding: '12px 12px', width: '115px' }}>Dígitos Finais (8)</th>
                          <th style={{ padding: '12px 8px', width: '100px', textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chassisList.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s', backgroundColor: item.selected ? 'rgba(36, 75, 122, 0.01)' : 'transparent' }}>
                            {/* Checkbox */}
                            <td style={{ padding: '12px 8px' }}>
                              <input 
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => toggleSelectChassis(item.id)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-cyan)' }}
                              />
                            </td>

                            {editingChassisId === item.id ? (
                              <>
                                {/* Edit Chassis */}
                                <td style={{ padding: '8px 12px' }}>
                                  <input
                                    type="text"
                                    value={editChassisFull}
                                    onChange={(e) => setEditChassisFull(e.target.value.toUpperCase())}
                                    className="input-field"
                                    style={{ padding: '6px 10px', fontSize: '0.8rem', textTransform: 'uppercase', fontFamily: 'monospace' }}
                                    maxLength={17}
                                  />
                                </td>
                                {/* Edit Year */}
                                <td style={{ padding: '8px 12px' }}>
                                  <input
                                    type="text"
                                    value={editChassisYear}
                                    onChange={(e) => setEditChassisYear(e.target.value)}
                                    className="input-field"
                                    style={{ padding: '6px 10px', fontSize: '0.8rem', fontWeight: 'bold' }}
                                    maxLength={4}
                                  />
                                </td>
                                {/* Extracted static */}
                                <td style={{ padding: '12px 12px' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    {editChassisFull.slice(-8) || '-'}
                                  </span>
                                </td>
                                {/* Edit actions */}
                                <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                    <button 
                                      onClick={() => saveChassis(item.id)}
                                      className="btn btn-cyan" 
                                      style={{ padding: '6px 8px', borderRadius: '6px' }}
                                      title="Salvar"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button 
                                      onClick={() => setEditingChassisId(null)}
                                      className="btn btn-outline" 
                                      style={{ padding: '6px 8px', borderRadius: '6px' }}
                                      title="Cancelar"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                {/* Normal row full chassis */}
                                <td style={{ padding: '12px 12px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                  <span style={{ fontWeight: 600 }}>{item.full}</span>
                                  {item.full.length !== 17 && (
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-gold)', marginTop: '2px', fontWeight: 'bold' }}>
                                      ⚠️ Diferente de 17 caracteres ({item.full.length})
                                    </span>
                                  )}
                                </td>
                                {/* Normal row Year */}
                                <td style={{ padding: '12px 12px', fontWeight: 700 }}>
                                  {item.year}
                                </td>
                                {/* Normal row 8 digits */}
                                <td style={{ padding: '12px 12px' }}>
                                  <span style={{ 
                                    fontFamily: 'monospace', 
                                    background: 'rgba(36, 75, 122, 0.08)', 
                                    color: 'var(--color-cyan)', 
                                    padding: '3px 8px', 
                                    borderRadius: '4px', 
                                    fontSize: '0.78rem',
                                    fontWeight: 700 
                                  }}>
                                    *{item.last8}*
                                  </span>
                                </td>
                                {/* Normal actions */}
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                    <button 
                                      onClick={() => startEditChassis(item)}
                                      className="btn btn-outline" 
                                      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}
                                      title="Editar"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button 
                                      onClick={() => deleteChassis(item.id)}
                                      className="btn btn-outline" 
                                      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}
                                      title="Excluir"
                                    >
                                      <Trash2 size={14} style={{ color: 'var(--color-red)' }} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                        {chassisList.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                              Nenhum chassi importado até o momento. Insira ou cole os dados do Excel no painel ao lado!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Visual Thermal Roll Backing Simulator */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Simulador do Rolo de Impressão</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Visualização real de como as etiquetas térmicas serão impressas em lote.</p>
                  </div>

                  <div style={{
                    background: '#cbd5e1',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '3px dashed #94a3b8',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    maxHeight: '650px',
                    overflowY: 'auto'
                  }}>
                    
                    {chassisList.filter(c => c.selected).map((item, idx) => (
                      <div 
                        key={item.id}
                        style={{
                          background: '#ffffff',
                          padding: '16px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          width: '100%',
                          maxWidth: '550px',
                          border: '1px solid #cbd5e1',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Header for item */}
                        <div style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          color: '#64748b', 
                          borderBottom: '1px solid #e2e8f0', 
                          paddingBottom: '6px', 
                          marginBottom: '12px',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>ETIQUETAS DO CHASSI #{idx + 1}</span>
                          <span style={{ color: 'var(--color-cyan)' }}>{item.full}</span>
                        </div>

                        {/* Chapelona Section (6 identical labels) */}
                        {(printType === 'both' || printType === 'chapelonas') && (
                          <div style={{ marginBottom: printType === 'both' ? '20px' : '0' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-cyan)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Etiquetas Chapelonas (Kit com 6)
                            </div>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                              gap: '8px',
                              background: '#f8fafc',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              justifyItems: 'center'
                            }}>
                              {[...Array(6)].map((_, i) => (
                                <div 
                                  key={i} 
                                  style={{
                                    width: '100%',
                                    maxWidth: '135px',
                                    height: '52px',
                                    border: '2px dashed #3b82f6',
                                    borderRadius: '4px',
                                    background: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    padding: '4px',
                                    overflow: 'hidden'
                                  }}
                                  title={`Etiqueta Chapelona ${i + 1}`}
                                >
                                  <span style={{
                                    fontFamily: selectedFont === 'Wallpoet' ? "'Wallpoet', sans-serif" : selectedFont === 'Allerta' ? "'Allerta Stencil', sans-serif" : "monospace",
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    letterSpacing: '1px',
                                    textAlign: 'center'
                                  }}>
                                    *{item.last8}*
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Autodestrutivas Section (3 different labels) */}
                        {(printType === 'both' || printType === 'autodestrutivas') && (
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-cyan)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Etiquetas Auto-destrutivas (Kit com 3)
                            </div>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '10px',
                              justifyContent: 'center',
                              background: '#f8fafc',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}>
                              
                              {/* Label 1: Top (8 Digits + Year) */}
                              <div style={{
                                width: '135px',
                                height: '42px',
                                border: '2px solid #244b7a',
                                borderRadius: '6px',
                                background: '#ffffff',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxSizing: 'border-box',
                                overflow: 'hidden'
                              }}>
                                {/* Brand Vertical */}
                                <div style={{
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg)',
                                  textTransform: 'uppercase',
                                  fontSize: '5px',
                                  fontWeight: '900',
                                  color: '#244b7a',
                                  borderRight: '1px solid rgba(36, 75, 122, 0.3)',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 2px',
                                  backgroundColor: 'rgba(36, 75, 122, 0.05)',
                                  flexShrink: 0
                                }}>
                                  GAC
                                </div>
                                
                                {/* Info Center */}
                                <div style={{
                                  flex: 1,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  lineHeight: '1.1',
                                  gap: '1px'
                                }}>
                                  <span style={{
                                    fontFamily: selectedFont === 'Wallpoet' ? "'Wallpoet', sans-serif" : selectedFont === 'Allerta' ? "'Allerta Stencil', sans-serif" : "monospace",
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    color: '#000000'
                                  }}>
                                    {item.last8}
                                  </span>
                                  <span style={{
                                    fontFamily: "'Ubuntu Mono', monospace",
                                    fontSize: '7px',
                                    fontWeight: 'bold',
                                    color: '#475569'
                                  }}>
                                    *{item.year}*
                                  </span>
                                </div>

                                {/* Logo Right */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 3px',
                                  borderLeft: '1px solid rgba(36, 75, 122, 0.3)',
                                  height: '100%',
                                  flexShrink: 0
                                }}>
                                  <svg viewBox="0 0 100 60" width="20" height="12">
                                    <ellipse cx="50" cy="30" rx="36" ry="24" fill="none" stroke="#244b7a" strokeWidth="6" />
                                    <path d="M 34 30 Q 34 18 50 18 C 62 18 64 26 64 26 L 52 28 Q 50 24 45 24 Q 40 24 40 32 Q 40 40 46 40 C 52 40 54 34 54 34 L 46 34" fill="none" stroke="#244b7a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>

                              {/* Label 2: Middle (8 Digits only) */}
                              <div style={{
                                width: '135px',
                                height: '42px',
                                border: '2px solid #244b7a',
                                borderRadius: '6px',
                                background: '#ffffff',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxSizing: 'border-box',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg)',
                                  textTransform: 'uppercase',
                                  fontSize: '5px',
                                  fontWeight: '900',
                                  color: '#244b7a',
                                  borderRight: '1px solid rgba(36, 75, 122, 0.3)',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 2px',
                                  backgroundColor: 'rgba(36, 75, 122, 0.05)',
                                  flexShrink: 0
                                }}>
                                  GAC
                                </div>
                                
                                <div style={{
                                  flex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '2px'
                                }}>
                                  <span style={{
                                    fontFamily: selectedFont === 'Wallpoet' ? "'Wallpoet', sans-serif" : selectedFont === 'Allerta' ? "'Allerta Stencil', sans-serif" : "monospace",
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#000000'
                                  }}>
                                    {item.last8}
                                  </span>
                                </div>

                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 3px',
                                  borderLeft: '1px solid rgba(36, 75, 122, 0.3)',
                                  height: '100%',
                                  flexShrink: 0
                                }}>
                                  <svg viewBox="0 0 100 60" width="20" height="12">
                                    <ellipse cx="50" cy="30" rx="36" ry="24" fill="none" stroke="#244b7a" strokeWidth="6" />
                                    <path d="M 34 30 Q 34 18 50 18 C 62 18 64 26 64 26 L 52 28 Q 50 24 45 24 Q 40 24 40 32 Q 40 40 46 40 C 52 40 54 34 54 34 L 46 34" fill="none" stroke="#244b7a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>

                              {/* Label 3: Bottom (Full 17 digits) */}
                              <div style={{
                                width: '135px',
                                height: '42px',
                                border: '2px solid #244b7a',
                                borderRadius: '6px',
                                background: '#ffffff',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxSizing: 'border-box',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg)',
                                  textTransform: 'uppercase',
                                  fontSize: '5px',
                                  fontWeight: '900',
                                  color: '#244b7a',
                                  borderRight: '1px solid rgba(36, 75, 122, 0.3)',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 2px',
                                  backgroundColor: 'rgba(36, 75, 122, 0.05)',
                                  flexShrink: 0
                                }}>
                                  GAC
                                </div>
                                
                                <div style={{
                                  flex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '2px',
                                  overflow: 'hidden'
                                }}>
                                  <span style={{
                                    fontFamily: "'Ubuntu Mono', monospace",
                                    fontSize: '6px',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    letterSpacing: '0.1px',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {item.full}
                                  </span>
                                </div>

                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0 3px',
                                  borderLeft: '1px solid rgba(36, 75, 122, 0.3)',
                                  height: '100%',
                                  flexShrink: 0
                                }}>
                                  <svg viewBox="0 0 100 60" width="20" height="12">
                                    <ellipse cx="50" cy="30" rx="36" ry="24" fill="none" stroke="#244b7a" strokeWidth="6" />
                                    <path d="M 34 30 Q 34 18 50 18 C 62 18 64 26 64 26 L 52 28 Q 50 24 45 24 Q 40 24 40 32 Q 40 40 46 40 C 52 40 54 34 54 34 L 46 34" fill="none" stroke="#244b7a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                    {chassisList.filter(c => c.selected).length === 0 && (
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                        Nenhum chassi selecionado para simulação.
                      </span>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* 100% Raw Physical Printer Render Container (Hidden on screen, shown under @media print) */}
      <div className="print-only-container">
        {chassisList.filter(c => c.selected).map((item, idx) => (
          <div key={item.id} className="print-kit-wrapper">
            
            {/* 1. Chapelona labels (6 Units) */}
            {(printType === 'both' || printType === 'chapelonas') && (
              <div style={{ display: 'block', width: '100%', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="print-chapelona-label">
                    <span style={{
                      fontFamily: selectedFont === 'Wallpoet' ? "'Wallpoet', sans-serif" : selectedFont === 'Allerta' ? "'Allerta Stencil', sans-serif" : "monospace",
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#000000',
                      letterSpacing: '3px',
                      textAlign: 'center',
                      lineHeight: 1
                    }}>
                      *{item.last8}*
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Autodestrutiva labels (3 Units) */}
            {(printType === 'both' || printType === 'autodestrutivas') && (
              <div style={{ display: 'block', width: '100%', pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: printType === 'both' ? '6mm' : '0' }}>
                
                {/* Label 1 (Topo): Last 8 + Year */}
                <div className="print-autodestrutiva-label">
                  {/* Brand vertical */}
                  <div style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    textTransform: 'uppercase',
                    fontSize: '9px',
                    fontWeight: '900',
                    color: '#244b7a',
                    letterSpacing: '1px',
                    borderRight: '1px solid rgba(36, 75, 122, 0.4)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    flexShrink: 0,
                    backgroundColor: 'rgba(36, 75, 122, 0.03)'
                  }}>
                    {brandName}
                  </div>
                  
                  {/* Chassis Texts */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    textAlign: 'center',
                    gap: '2px'
                  }}>
                    <span style={{
                      fontFamily: selectedFont === 'Wallpoet' ? "'Wallpoet', sans-serif" : selectedFont === 'Allerta' ? "'Allerta Stencil', sans-serif" : "monospace",
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#000000',
                      lineHeight: 1
                    }}>
                      {item.last8}
                    </span>
                    <span style={{
                      fontFamily: "'Ubuntu Mono', monospace",
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#000000',
                      letterSpacing: '1px',
                      lineHeight: 1
                    }}>
                      *{item.year}*
                    </span>
                  </div>

                  {/* Right Logo */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    borderLeft: '1px solid rgba(36, 75, 122, 0.4)',
                    height: '100%',
                    flexShrink: 0
                  }}>
                    <svg viewBox="0 0 100 60" width="38" height="23" style={{ display: 'block' }}>
                      <ellipse cx="50" cy="30" rx="36" ry="24" fill="none" stroke="#244b7a" strokeWidth="5" />
                      <path d="M 34 30 Q 34 18 50 18 C 62 18 64 26 64 26 L 52 28 Q 50 24 45 24 Q 40 24 40 32 Q 40 40 46 40 C 52 40 54 34 54 34 L 46 34" fill="none" stroke="#244b7a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Label 2 (Meio): Last 8 */}
                <div className="print-autodestrutiva-label">
                  <div style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    textTransform: 'uppercase',
                    fontSize: '9px',
                    fontWeight: '900',
                    color: '#244b7a',
                    letterSpacing: '1px',
                    borderRight: '1px solid rgba(36, 75, 122, 0.4)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    flexShrink: 0,
                    backgroundColor: 'rgba(36, 75, 122, 0.03)'
                  }}>
                    {brandName}
                  </div>
                  
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      fontFamily: selectedFont === 'Wallpoet' ? "'Wallpoet', sans-serif" : selectedFont === 'Allerta' ? "'Allerta Stencil', sans-serif" : "monospace",
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#000000',
                      lineHeight: 1
                    }}>
                      {item.last8}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    borderLeft: '1px solid rgba(36, 75, 122, 0.4)',
                    height: '100%',
                    flexShrink: 0
                  }}>
                    <svg viewBox="0 0 100 60" width="38" height="23" style={{ display: 'block' }}>
                      <ellipse cx="50" cy="30" rx="36" ry="24" fill="none" stroke="#244b7a" strokeWidth="5" />
                      <path d="M 34 30 Q 34 18 50 18 C 62 18 64 26 64 26 L 52 28 Q 50 24 45 24 Q 40 24 40 32 Q 40 40 46 40 C 52 40 54 34 54 34 L 46 34" fill="none" stroke="#244b7a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Label 3 (Base): Full 17 */}
                <div className="print-autodestrutiva-label">
                  <div style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    textTransform: 'uppercase',
                    fontSize: '9px',
                    fontWeight: '900',
                    color: '#244b7a',
                    letterSpacing: '1px',
                    borderRight: '1px solid rgba(36, 75, 122, 0.4)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    flexShrink: 0,
                    backgroundColor: 'rgba(36, 75, 122, 0.03)'
                  }}>
                    {brandName}
                  </div>
                  
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    textAlign: 'center',
                    overflow: 'hidden'
                  }}>
                    <span style={{
                      fontFamily: "'Ubuntu Mono', monospace",
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#000000',
                      letterSpacing: '0.2px',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.full}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    borderLeft: '1px solid rgba(36, 75, 122, 0.4)',
                    height: '100%',
                    flexShrink: 0
                  }}>
                    <svg viewBox="0 0 100 60" width="38" height="23" style={{ display: 'block' }}>
                      <ellipse cx="50" cy="30" rx="36" ry="24" fill="none" stroke="#244b7a" strokeWidth="5" />
                      <path d="M 34 30 Q 34 18 50 18 C 62 18 64 26 64 26 L 52 28 Q 50 24 45 24 Q 40 24 40 32 Q 40 40 46 40 C 52 40 54 34 54 34 L 46 34" fill="none" stroke="#244b7a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
