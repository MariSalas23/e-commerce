import React from 'react';
import './Tienda.css';
import imgCesta from '../../assets/cesta.png';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';
import imgProducto from '../../assets/productoejemplo.png';

const Tienda = () => {
  return (
    <div className="contenedor-tienda">
      <header className="navbar-carrito">
        <div className="logo-container-carrito">
                  <img src={logo_blanco} alt="Logo Arepabuelas" className="logo-carrito" />
                  <h1 className="nombre-carrito">Arepabuelas</h1>
              </div>
              <div className="iconos-carrito">
                  <img src= {carrito} alt="Carrito" className="icono-carrito" />
                  <img src={perfil} alt="Perfil" className="icono-carrito " />
              </div>
        </header>
        <img src= {imgCesta} alt="Arepas" className="arepas-intro" />
      <div className="contenedor-columnas-tienda">
        <div className="contenedor-cupones">
          <h1 className="titulo-cupones">Cupones</h1>
          <h2 className="subtitulo-cupones">Cupones disponibles</h2>
          <div className="contenedor-cupon">
            <p className="titulo-cupon">Cupón para usuarios nuevos</p>
            <p className="subtitulo-cupon">En tu primera compra, recibe el 10% de descuento en Arepabuelas de la esquina.</p>
            <p className="codigo-cupon"><span className="titulo-codigo">Código:</span> ArepabuelaNew</p>
          </div>
        </div>
        <div className="productos-tienda">
            <h1 className="titulo-productos-tienda">Productos</h1>
            <h2 className="subtitulo-productos-tienda">Productos disponibles para compra</h2>
          <div className="espacio-productos-tienda">
              <div className="producto-tienda">
                <img src={imgProducto} alt="Producto" className="imagen-producto-tienda" />
                <div className="texto-producto-tienda">
                  <p className="titulo-producto-tienda">Arepa Boyacense</p>
                  <p className="precio-tienda">5,000 COP</p>
                </div>
                <button className="btn-informacion">Más información</button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tienda;