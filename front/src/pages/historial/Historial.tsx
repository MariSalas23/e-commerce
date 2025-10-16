import React from 'react';
import './Historial.css';
import imgArps from '../../assets/arepas.png';

const Historial = () => {
    return (
        <div className='contenedor-historial'>
            <div className='contenedor-blanco-historial'>
                {/* Imagen lado izquierdo */}
                <div className='contenedor-imagen-historial'>
                    <img src={imgArps} alt="Arepas" />
                </div>

                {/* Contenido textual lado derecho */}
                <div className='contenedor-texto-historial'>
                    <h1 className='titulo-historial'>Historial</h1>
                    <h2 className='subtitulo-historial'>Mis compras</h2>

                    <div className='bloque-compra'>
                        <p><strong>Producto:</strong> Lorem</p>
                        <p><strong>Cantidad:</strong> Lorem</p>
                        <p><strong>Total pagado:</strong> Lorem</p>
                        <p><strong>Fecha:</strong> Lorem</p>
                    </div>

                    <hr className='linea-separadora' />
                </div>
            </div>
        </div>
    );
};

export default Historial;