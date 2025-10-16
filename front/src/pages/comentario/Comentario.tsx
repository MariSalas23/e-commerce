import React from 'react';
import './Comentario.css';

const Comentario = () => {
    return (
        <div className='contenedor-comentario-login'>
            <div className='contenedor-blanco-comentario'>
                <h1 className="titulo-comentario">Comentario</h1>
                <form className="formulario-comentario-login">
                    <textarea
                        className="campo-texto-comentario"
                        placeholder="Escribe tu comentario aquí..."
                    ></textarea>

                    <div className="botones-comentario-login">
                        <button type="button" className="btn-regresar-comentario">Regresar</button>
                        <button type="submit" className="btn-publicar-comentario">Publicar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Comentario;