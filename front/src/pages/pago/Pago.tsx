import React from 'react';
import './Pago.css';

const Pago = () => {
  return (
    <div className="contenedor-pago">
      {/* Sección izquierda: Información */}
      <div className="contenedor-informacion">
        <h2>Información</h2>

        <input type="text" placeholder="Dirección" className="input" />

        <div className="cupon-container">
          <input type="text" placeholder="Código del cupón" className="input-cupon" />
          <button className="btn-añadir">Añadir</button>
        </div>

        <hr className="divider" />

        <div className="resumen">
          <div className="fila">
            <span>Domicilio</span>
            <span>COP 5,000</span>
          </div>
          <div className="fila">
            <span>Subtotal</span>
            <span>COP 5,000</span>
          </div>
          <div className="fila">
            <span>Descuento</span>
            <span>COP 0</span>
          </div>
          <div className="fila total">
            <span>Total</span>
            <span>COP 10,000</span>
          </div>
        </div>

        <hr className="divider" />
      </div>

      {/* Sección derecha: Método de pago */}
      <div className="contenedor-metodo">
        <h2>Método de pago</h2>

        <div className="tarjeta-container">
          <div className="tarjeta-header">
            <i className="fa-solid fa-credit-card"></i>
            <span>Tarjeta de crédito</span>
          </div>

          <div className="tarjeta-form">
            <input type="text" placeholder="Card Number" />
            <input type="text" placeholder="Holder Name" />
            <div className="fila-exp">
              <input type="text" placeholder="Expiration (MM/YY)" />
              <input type="text" placeholder="CVV" />
            </div>
          </div>
        </div>

        <div className="botones">
          <button className="btn-regresar">Regresar</button>
          <button className="btn-pagar">Pagar</button>
        </div>
      </div>
    </div>
  );
};

export default Pago;
