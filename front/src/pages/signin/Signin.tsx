import React from 'react';
import './Signin.css';
import imgArepas from '../../assets/arepas.png';

const Signin = () => {
  return (
    <div className="contenedor-signin">
      <div className="contenedor-blanco-signin">

        <div className="contenedor-texto-signin">
          <div className="contenedor-titulo-signin">
            <h1 className="titulo-signin">Sign In</h1>
          </div>
        
          <form className="formulario-signin">
            <div className="grupo-campo-signin">
                <label htmlFor="nombre">Nombre</label>
                <input className="input-signin"
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Ingresa tu nombre"
                required
                />
            </div>

            <div className="grupo-campo-signin">
                <label htmlFor="correo">Correo</label>
                <input className="input-signin"
                type="email"
                id="correo"
                name="correo"
                placeholder="Ingresa tu correo"
                required
                />
            </div>

            <div className="grupo-campo-signin">
                <label htmlFor="password">Contraseña</label>
                <input className="input-signin"
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                required
                />
            </div>
          </form>
         <div className="botones-signin">
                <button className="btn-regresar-signin">Regresar</button>
                <button className="btn-signin-signin">Registrarse</button>
        </div>
        </div>
        <div className="contenedor-imagen-signin">
          <img src={imgArepas} alt="Arepas" />
        </div>
      </div>
    </div>
  );
};

export default Signin;