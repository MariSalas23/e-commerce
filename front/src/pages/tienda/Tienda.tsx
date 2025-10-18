import React from 'react';
import './Tienda.css';
import imgCesta from '../../assets/cesta.png';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';

const Tienda = () => {
  return (
    <div className="contenedor-tienda">
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
        <img src= {imgCesta} alt="Arepas" className="arepas-intro" />
      <div className="contenedor-columnas-admin">
        <div className="control-usuarios">
          <h1>Control de usuarios</h1>
          <h2>Validación de usuarios nuevos</h2>
          <div className="usuario-nuevo">
            <button className="usuario-rechazar">Rechazar</button>
            <button className="usuario-aceptar">Aceptar</button>
          </div>
        </div>
        <div className="control-productos">
          <h1>Control de usuarios</h1>
          <h2>Validación de usuarios nuevos</h2>
          <div className="producto-nuevo">

          </div>
          <button className="">Crear</button>
        </div>
      </div>
    </div>
  );
};

export default Tienda;