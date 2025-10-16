import React from 'react';
import './Home.css';
import imgLogo from '../../assets/logo.png';

const Home = () => {
  return (
    <div className="contenedor-home">
      <div className="contenedor-blanco-home">
       
        <div className="contenedor-imagen-home">
          <img src={imgLogo} alt="Logo" />
        </div>

        <div className="contenedor-texto-home">
          <div className="contenedor-titulo-home">
            <h1 className="titulo-home">Arepabuelas</h1>
            <h2 className="subtitulo-home">de la esquina</h2>
          </div>
            <p className="mensaje">Por favor, ingresa sesión o regístrate</p>
          <div className="botones-home">
            <button className="btn-login-home">Log In</button>
            <button className="btn-signin-home">Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;