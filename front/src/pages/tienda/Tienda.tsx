import './Tienda.css';
import imgCesta from '../../assets/cesta.png';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Producto {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  image_url?: string;
}

const Tienda = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('https://localhost/api/auth/products', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Error al obtener los productos');
        const data = await response.json();
        const productosFormateados = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          image_url: p.image_url,
        }));
        setProductos(productosFormateados);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setCargando(false);
      }
    };
    fetchProductos();
  }, []);

  return (
    <div className="contenedor-tienda">
      {/* Navbar */}
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

      {/* Imagen superior */}
      <img src={imgCesta} alt="Arepas" className="arepas-intro" />

      <div className="contenedor-columnas-tienda">
        {/* Columna cupones */}
        <div className="contenedor-cupones">
          <h1 className="titulo-cupones">Cupones</h1>
          <h2 className="subtitulo-cupones">Cupones disponibles</h2>

          <div className="contenedor-cupon">
            <p className="titulo-cupon">Cupón para usuarios nuevos</p>
            <p className="subtitulo-cupon">
              En tu primera compra, recibe el 10% de descuento en Arepabuelas de la esquina.
            </p>
            <p className="codigo-cupon">
              <span className="titulo-codigo">Código:</span> ArepabuelaNew
            </p>
          </div>
        </div>

        {/* Columna productos */}
        <div className="productos-tienda">
          <h1 className="titulo-productos-tienda">Productos</h1>
          <h2 className="subtitulo-productos-tienda">Productos disponibles para compra</h2>

            <div className="carrusel-productos">
              {cargando ? (
                <p style={{ color: 'white', padding: '0 1rem' }}>Cargando productos...</p>
              ) : productos.length > 0 ? (
                productos.map((producto) => (
                  <div key={producto.id} className="producto-tienda">
                    <img
                      src={producto.image_url || '/placeholder.jpg'}
                      alt={producto.name}
                    />
                    <div className="texto-producto-tienda">
                      <p className="titulo-producto-tienda">{producto.name}</p>
                      <p className="precio-tienda">
                        {Number(producto.price).toLocaleString('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/producto/${producto.id}`)}
                      className="btn-informacion"
                    >
                      Más información
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ color: 'white', padding: '0 1rem' }}>No hay productos disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Tienda;
