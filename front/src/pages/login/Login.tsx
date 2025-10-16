import React from 'react';
import './Login.css';
import imgUsr from '../../assets/user.png';

const Login = () => {
    return (
        <div className='contenedor-login'>
            <div className='contenedor-blanco'>
                {/* Panel derecho con formulario */}
                    <div className="contenedor-form">
                        <h1 className="titulo">Log In</h1>
                        <form className="formulario-login">
                            <label htmlFor="Correo">Usuario</label>
                            <input
                            type="text"     
                            id="correo"
                            placeholder="Correo"
                            />

                            <label htmlFor="password">Contraseña</label>
                            <input
                            type="password"
                            id="password"
                            placeholder="contraseña"
                            />

                            <div className="botones-login">
                                <button type="button" className="btn-regresar">Regresar</button>
                                <button type="submit" className="btn-login">Ingresar</button>
                            </div>
                        </form>
                    </div>
                {/* Panel derecho con imagen */}
                    <div className="contenedor-imagen">
                        <img src={imgUsr} alt="User" />
                    </div>
            </div>
        </div>
    );
};

export default Login;