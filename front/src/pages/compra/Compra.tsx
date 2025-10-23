import './Compra.css';
import imgBien from '../../assets/bien.png';
import imgFondo from '../../assets/blur.png';
import { useNavigate } from 'react-router-dom';

const Compra = () => {
  const navigate = useNavigate();

  return (
    <div className="contenedor-compra" style={{ backgroundImage: `url(${imgFondo})` }}>
        <div className="contenedor-blanco-compra">
            <img src={imgBien} alt="Bien" />
            <div className="contenedor-texto-compra">
                <h1 className="titulo-compra">¡Compra exitosa!</h1>
                <p  className="mensaje-compra">Muchas gracias por tu compra. Te esperamos de vuelta en Arepabuela.</p>
            </div>
            <button onClick={() => navigate('/tienda')} className="btn-volver-compra">Volver a la página principal</button>
        </div>
    </div>
  );
};

export default Compra;