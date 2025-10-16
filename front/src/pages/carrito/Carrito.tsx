import React from 'react';
import './Carrito.css';

const Carrito = () => {
  return (
    <div className="contenedor-carrito">
      <h2 className="titulo-carrito">Tu carrito de compras</h2>

      <div className="tabla-carrito">
        <div className="encabezado">
          <span>Producto</span>
          <span>Precio</span>
          <span>Cantidad</span>
          <span>Total</span>
        </div>

        <hr className="divider" />

        <div className="producto">
          <div className="producto-info">
            <img
              src="front\src\assets\arepas_plato.png"
              alt="Arepa Boyacense"
              className="producto-img"
            />
            <div className="producto-detalle">
              <p className="producto-nombre">Arepa Boyacense</p>
              <a href="#" className="quitar">Quitar</a>
            </div>
          </div>

          <span className="precio">COP 5,000</span>

          <div className="cantidad">
            <button className="btn-cantidad">+</button>
            <span>1</span>
            <button className="btn-cantidad">-</button>
          </div>

          <span className="total">COP 5,000</span>
        </div>

        <hr className="divider" />

        <div className="botones">
          <button className="btn-regresar">Regresar</button>
          <button className="btn-comprar">Comprar</button>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
