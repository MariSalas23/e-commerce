import React from 'react';
import './Login.css';

const Login = () => {
    return (
        <div className='contenedor-login'>
            <div className='contenedor-blanco-login'>
                {/* Panel derecho con imagen */}
                    <div className="contenedor-imagen-login">
                        <img
                            src="/assets/user.png"
                            alt="User"
                            className="imagen_user"
                        />
                    </div>

                {/* Panel derecho con formulario */}
                    <div className="contenedor-texto-login">
                        <h1 className="titulo">Log In</h1>
                        <form className="formulario-login">
                            <label htmlFor="usuario">Usuario</label>
                            <input
                            type="text"     
                            id="usuario"
                            placeholder="Usuario"
                            />

                            <label htmlFor="password">Contraseña</label>
                            <input
                            type="password"
                            id="password"
                            placeholder="********"
                            />

                            <button type="submit" className="btn-login"> Ingresar </button>
                        </form>
                    </div>
            </div>
        </div>
    );
};

export default Login;