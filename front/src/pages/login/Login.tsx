import React, { useState } from 'react';
import './Login.css';
import imgUsr from '../../assets/user.png';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');

    try {
      const res = await api.post('/auth/login', { email, password });

      // si la API devuelve error con JSON { error: "..." }
      if (res.status >= 400) {
        const err = (res.data as any)?.error;
        throw new Error(typeof err === 'string' ? err : 'Error al iniciar sesión');
      }

      // ✅ Consultamos quién soy y decidimos destino
      const me = await api.get('/auth/me'); // la cookie HttpOnly ya está
      const u = me?.data?.user || {};
      const emailLower = String(u.email || '').toLowerCase();
      const nameLower = String(u.name || '').toLowerCase();

      // Correos/nombre válidos de admin
      const adminEmails = [
        'administrador@adminarepabuela.com',
        'administrador@adminarepabuela.co',
      ];
      const isAdmin = adminEmails.includes(emailLower) || nameLower === 'administrador';

      // Sincroniza el contexto (user, isSignedIn, etc.)
      await refresh();

      // 🚀 Redirige según el rol
      navigate(isAdmin ? '/admin' : '/tienda');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.message ??
        'Error al iniciar sesión';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='contenedor-login'>
      <div className='contenedor-blanco-login'>
        {/* Panel derecho con formulario */}
        <div className="contenedor-form-login">
          <h1 className="titulo-login">Log In</h1>
          <form className="formulario-login" onSubmit={onSubmit}>
            <label htmlFor="correo">Correo</label>
            <input
              type="email"
              id="correo"
              name="email"
              placeholder="Correo@ejemplo.com"
              required
              inputMode="email"
              autoComplete="email"
            />

            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Contraseña"
              required
              autoComplete="current-password"
            />

            <div className="botones-login">
              <button
                type="button"
                className="btn-regresar-login"
                onClick={() => window.history.back()}
              >
                Regresar
              </button>
              <button
                type="submit"
                className="btn-login-login"
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
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