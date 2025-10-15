import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      <div className="contenedor_blanco">
        <div className="contenedor_imagen">
          <img>Imagen</img>
        </div>
        <div className="contenedor_texto">
          <h1>Arepabuelas</h1>
          <h2>de la esquina</h2>
          <p>Por favor, ingresa tu sesión o regístrate</p>
          <div className="botones">
            <button>Log In</button>
            <button>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}