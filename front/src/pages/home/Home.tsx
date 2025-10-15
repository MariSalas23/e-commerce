import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="contenedor-home">
      <div className="contenedor-blanco">
        {/* Panel izquierdo con imagen */}
        <div className="contenedor-imagen">
          <img
            src="/assets/arepas.png"  // Coloca aquí la ruta de tu imagen
            alt="Canasta de arepas"
            className="imagen"
          />
        </div>

        {/* Panel derecho con texto y botones */}
        <div className="contenedor-texto">
          <h1 className="titulo">Arepabuelas</h1>
          <h2 className="subtitulo">de la esquina</h2>
          <p className="mensaje">Por favor, ingresa tu sesión o regístrate</p>

          <div className="botones">
            <button className="btn btn-primario">Log In</button>
            <button className="btn btn-secundario">Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;