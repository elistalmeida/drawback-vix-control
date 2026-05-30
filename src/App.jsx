import React, { useState } from 'react';
import Storefront from './components/Storefront';
import Dashboard from './components/Dashboard';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Shared Products State
  const [products, setProducts] = useState([
    { id: 1, name: 'Suporte de Placa Antifurto Moto Aço Inox', price: 149, stock: 45, sales: 84 },
    { id: 2, name: 'Suporte de Placa Antifurto Carro Aço Inox (Par)', price: 169.90, stock: 32, sales: 112 },
    { id: 3, name: 'Carregador EV Portátil Premium 7.2 kW', price: 2490, stock: 12, sales: 18 },
    { id: 4, name: 'Wallbox Inteligente Smart Pro 22 kW', price: 3890, stock: 8, sales: 9 }
  ]);

  // Shared Shipping/Orders State
  const [orders, setOrders] = useState([
    { id: '#1209', customer: 'Maurício Torres', product: 'Carregador EV Portátil Premium 7.2 kW', status: 'shipped', date: 'Hoje, 10:24' },
    { id: '#1210', customer: 'Felipe Almeida', product: 'Suporte de Placa Antifurto Moto Aço Inox', status: 'preparing', date: 'Hoje, 09:12' },
    { id: '#1211', customer: 'Letícia Soares', product: 'Wallbox Inteligente Smart Pro 22 kW', status: 'delivered', date: 'Ontem, 16:45' }
  ]);

  return (
    <div>
      {isAdminMode ? (
        <Dashboard 
          onNavigateToStore={() => setIsAdminMode(false)} 
          products={products}
          setProducts={setProducts}
          orders={orders}
          setOrders={setOrders}
        />
      ) : (
        <Storefront 
          onNavigateToAdmin={() => setIsAdminMode(true)} 
          products={products}
          setProducts={setProducts}
          orders={orders}
          setOrders={setOrders}
        />
      )}
    </div>
  );
}

export default App;
