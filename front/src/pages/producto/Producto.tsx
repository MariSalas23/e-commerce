import React from 'react';
import './Producto.css';
import imgProducto from '../../assets/productoejemplo.png';

const Producto = () => {
  return (
    <div className="contenedor-producto">
        <div className="productos-producto">
            <div className="contenedor-titulo-producto">
                <h1 className="nombre-producto">Nombre</h1>
                <h1 className="precio-producto">Precio COP</h1>
            </div>
            <div className="contenedor-imagen-producto">
                <img src={imgProducto} alt="Producto" />
            </div>
            <p className="descripcion-producto">Descripción del producto</p>
        </div>
        <div className="comentarios-producto"> 
            <h1 className="titulo-comentario-producto">Comentarios</h1>
            <div className="contenedor-blanco-producto">
                <div className="comentario-individual-producto">
                    <h2 className="usuario-comentario-producto">Usuario</h2>
                    <p className="comentario-producto">Comentario acerca del producto</p>
                    <div className="linea-verde"></div>
                </div>
            </div>
            <div className="botones-producto">
                <button className="btn-regresar-signin">Regresar</button>
                <button className="btn-comentar-producto">Comentar</button>
                <button className="btn-carrito-producto">Añadir al carrito</button>
            </div>
        </div>
    </div>
  );
};

export default Producto;