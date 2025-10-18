import React from 'react';
import './Producto.css';
import imgProducto from '../../assets/productoejemplo.png';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';

const Producto = () => {
  return (

    <div className="contenedor-producto-header">
        <header className="navbar-carrito">
            <div className="logo-container-carrito">
                <img src={logo_blanco} alt="Logo Arepabuelas" className="logo-carrito" />
                <h1 className="nombre-carrito">Arepabuelas</h1>
            </div>
            <div className="iconos-carrito">
                <img src= {carrito} alt="Carrito" className="icono-carrito" />
                <img src={perfil} alt="Perfil" className="icono-carrito " />
            </div>
        </header>
      <div className="contenedor-producto">
        <div className="productos-producto">
            <div className="contenedor-titulo-producto">
                <h1 className="nombre-producto">Arepa Boyacense</h1>
                <h1 className="precio-producto">5,000 COP</h1>
            </div>
            <div className="contenedor-imagen-producto">
                <img src={imgProducto} alt="Producto" />
            </div>
            <p className="descripcion-producto">Disfruta el sabor auténtico de Boyacá con nuestras arepas
                                                boyacenses, elaboradas artesanalmente con maíz amarillo molido,
                                                cuajada fresca y un toque de mantequilla campesina. 
                                                Su textura suave por dentro y ligeramente dorada por fuera las convierte
                                                en el acompañamiento perfecto para el desayuno o la merienda.</p>
        </div>
        <div className="comentarios-producto"> 
            <h1 className="titulo-comentario-producto">Comentarios</h1>
            <div className="contenedor-blanco-producto">
                <div className="comentario-individual-producto">
                    <h2 className="usuario-comentario-producto">Usuario</h2>
                    <p className="comentario-producto">Comentario acerca del producto</p>
                </div>
            </div>
            <div className="botones-producto">
                <button className="btn-regresar-signin">Regresar</button>
                <button className="btn-comentar-producto">Comentar</button>
                <button className="btn-carrito-producto">Añadir al carrito</button>
            </div>
        </div>
        </div>
    </div>
  );
};

export default Producto;