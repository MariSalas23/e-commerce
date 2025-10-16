import React from 'react';
import './Error.css';
import imgMal from '../../assets/mal.png';
import imgFondo from '../../assets/blur.png';

const Error = () => {
  return (
    <div className="contenedor-error" style={{ backgroundImage: `url(${imgFondo})` }}>
        <div className="contenedor-blanco-error">
            <img src={imgMal} alt="Mal" />
            <div className="contenedor-texto-error">
                <h1 className="error-texto">404</h1>
                <p>¡Error! Página no encontrada</p>
            </div>
            <button className="btn-volver-error">Página principal</button>
        </div>
    </div>
  );
};

export default Error;