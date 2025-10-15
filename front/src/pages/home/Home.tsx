import React from 'react';
import './Home.css';
import imgLogo from '../../assets/logo.png';

const Home = () => {
  return (
    <div className="contenedor-home">
      <div className="contenedor-blanco">
       
        <div className="contenedor-imagen">
          <img src={imgLogo} alt="Logo" />
        </div>

        <div className="contenedor-texto">
          <h1 className="titulo">Arepabuelas</h1>
          <h2 className="subtitulo">de la esquina</h2>
          <p className="mensaje">Por favor, ingresa tu sesión o regístrate</p>

          <div className="botones">
            <button className="btn-login">Log In</button>
            <button className="btn.signin">Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;