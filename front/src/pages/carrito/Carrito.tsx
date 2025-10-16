import React from 'react';
import './Carrito.css';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';
import arepas from '../../assets/arepas_plato.png';


const Carrito = () => {
  return (
    <div className="contenedor-carrito">
      <header className="navbar">
        <div className="logo-container">
          <img src={logo_blanco} alt="Logo Arepabuelas" className="logo" />
          <h1 className="nombre">Arepabuelas</h1>
        </div>

        <div className="iconos">
          <img src= {carrito} alt="Carrito" className="icono" />
          <img src={perfil} alt="Perfil" className="icono" />
        </div>
      </header>

      <main className="contenido-carrito">
        <h2>Tu carrito de compras</h2>

        <div className="tabla-carrito">
          <div className="encabezado-tabla">
            <span>Producto</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Total</span>
          </div>

          <div className="item-carrito">
            <div className="producto">
              <img src={arepas} alt="Arepa Boyacense" className="img-producto" />
              <div className="detalle-producto">
                <p className="nombre-producto-carrito">Arepa Boyacense</p>
                <a href="#" className="quitar">Quitar</a>
              </div>
            </div>

            <span className="precio">COP 5,000</span>

            <div className="cantidad">
              <button>-</button>
              <span>1</span>
              <button>+</button>
            </div>

            <span className="total">COP 5,000</span>
          </div>
        </div>

        <div className="botones-carrito">
          <button className="btn-regresar">Regresar</button>
          <button className="btn-comprar">Comprar</button>
        </div>
      </main>
    </div>
  );
};

export default Carrito;
