import React, { useState } from 'react';
import './Signin.css';
import imgArepas from '../../assets/arepas.png';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const Signin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // === Helper para validar complejidad ===
  function validarPassword(pass: string): string | null {
    if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(pass)) return 'Debe contener al menos una letra mayúscula.';
    if (!/[a-z]/.test(pass)) return 'Debe contener al menos una letra minúscula.';
    if (!/[0-9]/.test(pass)) return 'Debe contener al menos un número.';
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(pass))
      return 'Debe contener al menos un carácter especial.';
    return null; // ✅ válida
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');

    // === Validación de complejidad ===
    const error = validarPassword(password);
    if (error) {
      alert(error);
      setLoading(false);
      return;
    }

    try {
      // Registro normal
      await api.post('/auth/register', { name, email, password });

      // Redirige directo a la pantalla de "esperando aprobación"
      navigate('/solicitud');
    } catch (err: any) {
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
            <h1 className="titulo-signin">Sign Up</h1>
          </div>

          <form className="formulario-signin" id="form-signin" onSubmit={onSubmit}>
            <div className="grupo-campo-signin">
              <label htmlFor="nombre">Nombre</label>
              <input
                className="input-signin"
                type="text"
                id="nombre"
                name="name"
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
                name="email"
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
                name="password"
                placeholder="Ingresa tu contraseña"
                required
                autoComplete="new-password"
              />
              <small style={{ fontSize: '0.85rem', color: '#555' }}>
                Debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
              </small>
            </div>
          </form>

          <div className="botones-signin">
            <button
              className="btn-regresar-signin"
              type="button"
              onClick={() => navigate('/')}
            >
              Regresar
            </button>
            <button
              className="btn-signin-signin"
              type="submit"
              form="form-signin"
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
