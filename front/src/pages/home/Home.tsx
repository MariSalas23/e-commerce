import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="contenedor_blanco">
        {/* Panel izquierdo con imagen */}
        <div className="contenedor_imagen">
          <img
            src="/assets/arepas.png"  // Coloca aquí la ruta de tu imagen
            alt="Canasta de arepas"
            className="imagen"
          />
        </div>

        {/* Panel derecho con texto y botones */}
        <div className="contenedor_texto">
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