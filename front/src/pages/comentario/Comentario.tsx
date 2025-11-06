import './Comentario.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../api/api';

const Comentario = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productoId = searchParams.get('producto');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!texto.trim()) {
      alert('Por favor escribe un comentario antes de publicar.');
      return;
    }

    try {
      setEnviando(true);

      await api.post('/auth/comments', {
        productId: Number(productoId),
        content: texto.trim(),
      });

      alert('Comentario publicado con éxito');
      navigate(`/producto/${productoId}`);
    } catch (error: any) {
      console.error('Error al publicar comentario:', error);
      alert(error?.response?.data?.error || 'Error al publicar comentario');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contenedor-comentario-login">
      <div className="contenedor-blanco-comentario">
        <h1 className="titulo-comentario">Comentario</h1>

        <form className="formulario-comentario-login" onSubmit={manejarEnvio}>
          <textarea
            className="campo-texto-comentario"
            placeholder="Escribe tu comentario aquí..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          ></textarea>

          <div className="botones-comentario-login">
            <button
              onClick={() => navigate(`/producto/${productoId}`)}
              type="button"
              className="btn-regresar-comentario"
            >
              Regresar
            </button>

            <button
              type="submit"
              className="btn-publicar-comentario"
              disabled={enviando}
            >
              {enviando ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Comentario;
