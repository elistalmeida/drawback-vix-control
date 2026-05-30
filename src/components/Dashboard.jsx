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
  Printer
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

      {/* Main Grid Content */}
      <main className="container" style={{ marginTop: '40px' }}>
        
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
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sincronização em tempo real ativa</span>
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

      </main>

    </div>
  );
}
