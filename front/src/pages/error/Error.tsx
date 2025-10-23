import './Error.css';
import imgMal from '../../assets/mal.png';
import imgFondo from '../../assets/blur.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Error = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth(); 

  const handleRedirect = () => {
    if (isSignedIn) navigate('/tienda'); 
    else navigate('/'); 
  };

  return (
    <div className="contenedor-error" style={{ backgroundImage: `url(${imgFondo})` }}>
      <div className="contenedor-blanco-error">
        <img src={imgMal} alt="Mal" />
        <div className="contenedor-texto-error">
          <h1 className="error-texto">404</h1>
          <p className="mensaje-error">¡Error! Página no encontrada</p>
        </div>
        <button
          className="btn-volver-error"
          onClick={handleRedirect} 
        >
          Página principal
        </button>
      </div>
    </div>
  );
};

export default Error;