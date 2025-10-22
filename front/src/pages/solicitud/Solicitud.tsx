import './Solicitud.css';
import imgBien from '../../assets/bien.png';
import imgFondo from '../../assets/blur.png';

const Solicitud = () => {
  return (
    <div className="contenedor-solicitud" style={{ backgroundImage: `url(${imgFondo})` }}>
        <div className="contenedor-blanco-solicitud">
            <img src={imgBien} alt="Bien" />
            <div className="contenedor-texto-solicitud">
                <h1 className="titulo-solicitud">¡Solicitud exitosa!</h1>
                <p  className="mensaje-solicitud">Vuelve a la página principal para ingresar las credenciales más tarde</p>
            </div>
            <button className="btn-volver-solicitud">Volver a la página principal</button>
        </div>
    </div>
  );
};

export default Solicitud;