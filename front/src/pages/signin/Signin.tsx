import React from 'react';
import './Signin.css';
import imgArepas from '../../assets/arepas.png';

const Signin = () => {
  return (
    <div className="contenedor-signin">
      <div className="contenedor-blanco">

        <div className="contenedor-texto">
          <div className="contenedor-titulo">
            <h1 className="titulo">Sign In</h1>
          </div>
        
          <form className="formulario">
            <div className="grupo-campo">
                <label htmlFor="nombre">Nombre</label>
                <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Ingresa tu nombre"
                required
                />
            </div>

            <div className="grupo-campo">
                <label htmlFor="correo">Correo</label>
                <input
                type="email"
                id="correo"
                name="correo"
                placeholder="Ingresa tu correo"
                required
                />
            </div>

            <div className="grupo-campo">
                <label htmlFor="password">Contraseña</label>
                <input
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                required
                />
            </div>
          </form>
         <div className="botones">
                <button className="btn-regresar">Regresar</button>
                <button className="btn-signin">Registrarse</button>
        </div>
        </div>
        <div className="contenedor-imagen">
          <img src={imgArepas} alt="Arepas" />
        </div>
      </div>
    </div>
  );
};

export default Signin;