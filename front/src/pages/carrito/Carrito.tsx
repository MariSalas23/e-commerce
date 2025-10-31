import './Carrito.css';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../api/api'; // usa tu cliente axios configurado

type CartItem = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  subtotal: string;
};

const Carrito = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<string>('0.00');
  const [loading, setLoading] = useState(true);

  // ==========================
  // Obtener carrito al cargar
  // ==========================
  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        const res = await api.get('/auth/carrito');
        setItems(res.data.items);
        setTotal(res.data.total);
      } catch (err) {
        console.error('Error al cargar carrito:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, []);

  // ==========================
  // Actualizar cantidad
  // ==========================
  const updateQuantity = async (productId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await api.patch(`/auth/carrito/${productId}`, { quantity: newQty });
      const res = await api.get('/auth/carrito');
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
    }
  };

  // ==========================
  // Eliminar producto
  // ==========================
  const removeItem = async (productId: number) => {
    try {
      await api.delete(`/auth/carrito/${productId}`);
      const res = await api.get('/auth/carrito');
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    }
  };

  // ==========================
  // Render
  // ==========================
  if (loading) {
    return <div className="contenedor-carrito"><p>Cargando carrito...</p></div>;
  }

  return (
    <div className="contenedor-carrito">
      <header className="navbar-carrito">
        <div className="logo-container-carrito">
          <img src={logo_blanco} alt="Logo Arepabuelas" className="logo-carrito" />
          <h1 className="nombre-carrito">Arepabuelas</h1>
        </div>

        <div className="iconos-carrito">
          <img
            src={carrito}
            alt="Carrito"
            className="icono-carrito"
            onClick={() => navigate('/carrito')}
            style={{ cursor: 'pointer' }}
          />
          <img
            src={perfil}
            alt="Perfil"
            className="icono-carrito"
            onClick={() => navigate('/perfil')}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </header>

      <main className="contenido-carrito">
        <h2>Tu carrito de compras</h2>

        {items.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <div className="tabla-carrito">
            <div className="encabezado-tabla-carrito">
              <span>Producto</span>
              <span>Precio</span>
              <span>Cantidad</span>
              <span>Total</span>
            </div>

            {items.map((item) => (
              <div key={item.id} className="item-carrito">
                <div className="producto-carrito">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="img-producto"
                  />
                  <div className="detalle-producto-carrito">
                    <p className="nombre-producto-carrito">{item.name}</p>
                    <button
                      className="quitar-carrito"
                      onClick={() => removeItem(item.product_id)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>

                <span className="precio-carrito">
                  COP {Number(item.price).toLocaleString('es-CO')}
                </span>

                <div className="cantidad-carrito">
                  <button
                    className="btn-menos"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="btn-mas"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <span className="total-carrito">
                  COP {Number(item.subtotal).toLocaleString('es-CO')}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="barra-final">
          <div className="total-carrito-final">
            Total: COP {Number(total).toLocaleString('es-CO')}
          </div>
            
        <div className="acciones-carrito">
          <button onClick={() => navigate('/tienda')} className="btn-regresar-carrito">
            Regresar
          </button>
          <button onClick={() => navigate('/pago')} className="btn-comprar-carrito">
            Comprar
          </button>
        </div>
        </div>

      </main>
    </div>
  );
};

export default Carrito;
