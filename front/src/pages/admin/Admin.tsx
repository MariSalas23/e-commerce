import './Admin.css';
import imgCesta from '../../assets/cesta.png';
import imgPerfil from '../../assets/perfil.png';
import imgImagen from '../../assets/imagen.png';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate(); 

  return (
    <div className="contenedor-admin">
      <header className="navbar-carrito">
        <div className="logo-container-carrito">
          <img src={logo_blanco} alt="Logo Arepabuelas" className="logo-carrito" />
          <h1 className="nombre-carrito">Arepabuelas</h1>
        </div>
        <div className="iconos-carrito">
          <img
            src={carrito}
            alt="Carrito"
            className="icono-carrito"
            onClick={() => navigate('/carrito')} 
            style={{ cursor: 'pointer' }}
            />
          <img
            src={perfil}
            alt="Perfil"
            className="icono-carrito"
            onClick={() => navigate('/perfil')} 
            style={{ cursor: 'pointer' }}
          />
        </div>
      </header>

      <img src={imgCesta} alt="Arepas" className="arepas-intro" />

      <div className="contenedor-columnas-admin">
        <div className="control-usuarios">
          <h1 className="titulo-control-usuarios">Control de usuarios</h1>
          <h2 className="subtitulo-control-usuarios">Validación de usuarios nuevos</h2>
          <div className="usuario-nuevo">
            <div className="columnas-usuario-nuevo">
              <img src={imgPerfil} alt="Perfil" className="imagen-perfil-admin" />
              <div className="texto-usuario-nuevo">
                <p className="nombre-usuario-nuevo">Nombre</p>
                <p className="correo-usuario-nuevo">Correo</p>
                <div className="botones-usuario-nuevo">
                  <button className="usuario-rechazar">Rechazar</button>
                  <button className="usuario-aceptar">Aceptar</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="control-productos">
          <h1 className="titulo-control-productos">Control de productos</h1>
          <h2 className="subtitulo-control-productos">Validación de usuarios nuevos</h2>

          <div className="producto-nuevo">
            <div className="columnas-producto-nuevo">
              <img src={imgImagen} alt="Agregar imagen" className="imagen-producto-admin" />
              <div className="nombre-descripcion">
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  className="nombre-producto-nuevo"
                />
                <textarea
                  placeholder="Descripción del producto"
                  className="descripcion-producto-nuevo"
                />
                <input
                  placeholder="Precio (COP)"
                  className="precio-producto-admin"
                />
              </div>
            </div>
          </div>

          <button className="btn-crear">Crear</button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
