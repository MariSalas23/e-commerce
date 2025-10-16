import React from 'react';
import './Login.css';
import imgUsr from '../../assets/user.png';

const Login = () => {
    return (
        <div className='contenedor-login'>
            <div className='contenedor-blanco-login'>
                {/* Panel derecho con formulario */}
                    <div className="contenedor-form-login">
                        <h1 className="titulo-login">Log In</h1>
                        <form className="formulario-login">
                            <label htmlFor="Correo">Correo</label>
                            <input
                            type="text"     
                            id="correo"
                            placeholder="Correo@ejemplo.com"
                            />

                            <label htmlFor="password">Contraseña</label>
                            <input
                            type="password"
                            id="password"
                            placeholder="Contraseña"
                            />

                            <div className="botones-login">
                                <button type="button" className="btn-regresar-login">Regresar</button>
                                <button type="submit" className="btn-login-login">Ingresar</button>
                            </div>
                        </form>
                    </div>
                {/* Panel derecho con imagen */}
                    <div className="contenedor-imagen-login">
                        <img src={imgUsr} alt="User" />
                    </div>
            </div>
        </div>
    );
};

export default Login;