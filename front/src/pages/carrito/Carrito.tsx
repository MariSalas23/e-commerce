import React from 'react';
import './Carrito.css';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';
import arepas from '../../assets/arepas_plato.png';

const Carrito = () => {
  return (
    <div className="contenedor-carrito">
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

      <main className="contenido-carrito">
        <h2>Tu carrito de compras</h2>

        <div className="tabla-carrito">
          <div className="encabezado-tabla-carrito">
            <span>Producto</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Total</span>
          </div>

          <div className="item-carrito">
            <div className="producto-carrito">
              <img src={arepas} alt="Arepa Boyacense" className="img-producto" />
              <div className="detalle-producto-carrito">
                <p className="nombre-producto-carrito">Arepa Boyacense</p>
                <a href="#" className="quitar-carrito">Quitar</a>
              </div>
            </div>

            <span className="precio-carrito">COP 5,000</span>

            <div className="cantidad-carrito">
              <button className="btn-menos">-</button>
              <span>1</span>
              <button className="btn-mas">+</button>
            </div>

            <span className="total-carrito">COP 5,000</span>
          </div>
        </div>

        <div className="botones-carrito">
          <button className="btn-regresar-carrito">Regresar</button>
          <button className="btn-comprar-carrito">Comprar</button>
        </div>
      </main>
    </div>
  );
};

export default Carrito;
