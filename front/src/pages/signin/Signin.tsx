import React, { useState } from 'react';
import './Signin.css';
import imgArepas from '../../assets/arepas.png';
import { api } from '../../api/api'; // ← usamos el mismo cliente que en Login

const Signin: React.FC = () => {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');

    try {
      // Axios ya manda JSON y parsea la respuesta
      const res = await api.post('/auth/register', { name, email, password });

      // Si la API devolviera { error: "..." } con 4xx/5xx,
      // axios lanza excepción y caemos al catch.
      if (res.status >= 400) {
        const err = (res.data as any)?.error;
        throw new Error(typeof err === 'string' ? err : 'Error al registrarse');
      }

      // éxito: redirige a home (ajusta si tu ruta de éxito es otra)
      window.location.href = '/';
    } catch (err: any) {
      // normaliza mensaje (axios o red)
      const msg =
        err?.response?.data?.error ??
        err?.message ??
        'Error al registrarse';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contenedor-signin">
      <div className="contenedor-blanco-signin">

        <div className="contenedor-texto-signin">
          <div className="contenedor-titulo-signin">
            <h1 className="titulo-signin">Sign In</h1>
          </div>

          {/* agregamos id y onSubmit sin cambiar clases/estructura */}
          <form className="formulario-signin" id="form-signin" onSubmit={onSubmit}>
            <div className="grupo-campo-signin">
              <label htmlFor="nombre">Nombre</label>
              <input
                className="input-signin"
                type="text"
                id="nombre"
                name="name"              // ← API espera "name"
                placeholder="Ingresa tu nombre"
                required
                autoComplete="name"
              />
            </div>

            <div className="grupo-campo-signin">
              <label htmlFor="correo">Correo</label>
              <input
                className="input-signin"
                type="email"
                id="correo"
                name="email"             // ← API espera "email"
                placeholder="Ingresa tu correo"
                required
                autoComplete="email"
              />
            </div>

            <div className="grupo-campo-signin">
              <label htmlFor="password">Contraseña</label>
              <input
                className="input-signin"
                type="password"
                id="password"
                name="password"          // ← API espera "password"
                placeholder="Ingresa tu contraseña"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </form>

          <div className="botones-signin">
            <button
              className="btn-regresar-signin"
              type="button"
              onClick={() => window.history.back()}
            >
              Regresar
            </button>
            {/* botón fuera del form, lo vinculamos con el atributo 'form' */}
            <button
              className="btn-signin-signin"
              type="submit"
              form="form-signin"           // ← envía el formulario sin mover elementos
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Registrarse'}
            </button>
          </div>
        </div>

        <div className="contenedor-imagen-signin">
          <img src={imgArepas} alt="Arepas" />
        </div>
      </div>
    </div>
  );
};

export default Signin;
