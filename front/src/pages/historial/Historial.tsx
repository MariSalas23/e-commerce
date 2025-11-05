import './Historial.css';
import imgArps from '../../assets/arepas.png';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
  id: number;
  order_id: number;
  amount: string;
  card_last_four: string;
  card_holder: string;
  status: string;
  created_at: string;
  shipping_address: string;
  order_items?: Array<{
    id: number;
    product_id: number;
    quantity: number;
    name: string;
    price: string;
    subtotal: string;
  }>;
}

const Historial = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/auth/transactions');
        if (response.data.ok) {
          // Parse order_items if it's a string
          const parsedTransactions = response.data.transactions.map((t: any) => ({
            ...t,
            order_items: typeof t.order_items === 'string' ? JSON.parse(t.order_items) : t.order_items,
          }));
          setTransactions(parsedTransactions);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Error al cargar el historial de transacciones');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    });
  };

  return (
    <div className='contenedor-historial'>
      <div className='contenedor-blanco-historial'>
        {/* Imagen lado izquierdo */}
        <div className='contenedor-imagen-historial'>
          <img src={imgArps} alt="Arepas" />
        </div>

        {/* Contenido textual lado derecho */}
        <div className='contenedor-texto-historial'>
          <h1 className='titulo-historial'>Historial</h1>
          <h2 className='subtitulo-historial'>Mis compras</h2>

          {loading && <p className='loading-text'>Cargando transacciones...</p>}

          {error && <p className='error-text'>{error}</p>}

          {!loading && transactions.length === 0 && (
            <p className='empty-text'>No hay transacciones registradas aún.</p>
          )}

          {!loading && transactions.length > 0 && (
            <div className='contenedor-pedidos'>
              {transactions.map((transaction, index) => (
                <div key={transaction.id} className='bloque-compra'>
                  <div className='transaccion-header'>
                    <span className='transaccion-id'>Orden #{transaction.order_id}</span>
                    <span className={`status-badge status-${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </div>

                  <p>
                    <strong>Monto:</strong> {formatCurrency(transaction.amount)}
                  </p>
                  <p>
                    <strong>Tarjeta:</strong> **** {transaction.card_last_four}
                  </p>
                  <p>
                    <strong>Titular:</strong> {transaction.card_holder}
                  </p>
                  <p>
                    <strong>Dirección de envío:</strong> {transaction.shipping_address}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {formatDate(transaction.created_at)}
                  </p>

                  {transaction.order_items && transaction.order_items.length > 0 && (
                    <div className='items-transaccion'>
                      <strong>Productos:</strong>
                      <ul>
                        {transaction.order_items.map((item) => (
                          <li key={item.id}>
                            {item.name} x {item.quantity} - {formatCurrency(item.subtotal)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {index < transactions.length - 1 && <hr className='linea-separadora' />}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => navigate('/perfil')} className='btn-regresar-historial'>
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Historial;
