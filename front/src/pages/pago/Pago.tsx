import './Pago.css';
import { useNavigate } from 'react-router-dom';

const Pago = () => {
  const navigate = useNavigate();

  return (
    <div className="contenedor-pago">
      <div className="contenedor-informacion-pago">
        <h2>Información</h2>

        <input type="text" placeholder="Dirección" className="input-pago" />

        <div className="cupon-container-pago">
          <input type="text" placeholder="Código del cupón" className="input-cupon-pago" />
          <button className="btn-añadir-pago">Añadir</button>
        </div>

        <hr className="divider-pago" />

        <div className="resumen-pago">
          <div className="fila-pago">
            <span>Domicilio</span>
            <span>COP 5,000</span>
          </div>
          <div className="fila-pago">
            <span>Subtotal</span>
            <span>COP 5,000</span>
          </div>
          <div className="fila-pago">
            <span>Descuento</span>
            <span>COP 0</span>
          </div>
          <div className="fila-total-pago">
            <span>Total</span>
            <span> COP 10,000</span>
          </div>
        </div>

        <hr className="divider-pago" />
      </div>

      <div className="contenedor-metodo-pago">
        <h2>Método de pago</h2>

        <div className="tarjeta-container-pago">
          <div className="tarjeta-header-pago">
            <i className="fa-solid fa-credit-card"></i>
            <span>Tarjeta de crédito</span>
          </div>

          <div className="tarjeta-form-pago">
            <input type="text" placeholder="Card Number" />
            <input type="text" placeholder="Holder Name" />
            <div className="fila-exp-pago">
              <input type="text" placeholder="Expiration (MM/YY)" />
              <input type="text" placeholder="CVV" />
            </div>
          </div>
        </div>

        <div className="botones-pago">
          <button onClick={() => navigate('/carrito')} className="btn-regresar-pago">Regresar</button>
          <button onClick={() => navigate('/compra')} className="btn-pagar-pago">Pagar</button>
        </div>
      </div>
    </div>
  );
};

export default Pago;
