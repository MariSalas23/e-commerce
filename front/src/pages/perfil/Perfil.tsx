import './Perfil.css';
import imgArepas from '../../assets/arepas.png';
import imgPerfil from '../../assets/perfil.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Perfil = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth(); 

  const handleLogout = async () => {
    try {
      await signOut(); 
      navigate('/'); 
    } catch (err) {
      console.error('Error cerrando sesión:', err);
      alert('No se pudo cerrar sesión');
    }
  };

  return (
    <div className="contenedor-perfil">
      <div className="contenedor-blanco-perfil">

        <div className="contenedor-imagen-perfil">
          <img src={imgArepas} alt="Arepas" />
        </div>

        <div className="contenedor-texto-perfil">
          <img src={imgPerfil} alt="Perfil" />
          <div className="contenedor-titulo-perfil">
            <h1 className="titulo-perfil">Nombre Apellido</h1>
            <h2 className="subtitulo-perfil">Correo@gmail.com</h2>
          </div>
        
         <div className="botones-perfil">
              <button className="btn-historial">Historial</button>
              <div className="botones-fila">
                <button className="btn-regresar-perfil">Regresar</button>
                <button
                  className="btn-logout"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;