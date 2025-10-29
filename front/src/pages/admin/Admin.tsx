import './Admin.css';
import imgCesta from '../../assets/cesta.png';
import imgPerfil from '../../assets/perfil.png';
import imgImagen from '../../assets/imagen.png';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../api/api'; // axios con baseURL=/api y withCredentials=true

// --------- Tipos ---------
type PendingUser = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
};

// --------- Helper para redimensionar imagen ---------
async function resizeImageToDataURL(
  file: File,
  maxSize = 512,
  quality = 0.85
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;
  let newW = w, newH = h;
  if (w > h && w > maxSize) {
    newW = maxSize;
    newH = Math.round((h / w) * maxSize);
  } else if (h >= w && h > maxSize) {
    newH = maxSize;
    newW = Math.round((w / h) * maxSize);
  }
  const canvas = document.createElement('canvas');
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, newW, newH);
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  bitmap.close();
  return dataUrl;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();

  // --------- Estado para solicitudes pendientes ---------
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [workingId, setWorkingId] = useState<number | null>(null);

  // --------- Estado para creación de productos ---------
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ====== Usuarios pendientes (tu funcionalidad) ======
  async function loadPending() {
    setLoading(true);
    try {
      const r = await api.get('/admin/pending');
      setPending(Array.isArray(r?.data?.users) ? r.data.users : []);
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'No se pudieron cargar las solicitudes';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: number) {
    if (workingId) return;
    setWorkingId(id);
    try {
      await api.post(`/admin/users/${id}/approve`);
      setPending((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'No se pudo aprobar';
      alert(msg);
    } finally {
      setWorkingId(null);
    }
  }

  async function reject(id: number) {
    if (workingId) return;
    if (!confirm('¿Seguro que deseas rechazar/eliminar esta solicitud?')) return;
    setWorkingId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setPending((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'No se pudo rechazar';
      alert(msg);
    } finally {
      setWorkingId(null);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  // ====== Productos (funcionalidad de tu compañero) ======
  const openPicker = () => inputRef.current?.click();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecciona una imagen válida.');
      return;
    }
    const dataUrl = await resizeImageToDataURL(file, 512, 0.85);
    setImageDataUrl(dataUrl);
  };

  const crearProducto = async () => {
    if (!name || !price || !imageDataUrl) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    try {
      const res = await api.post('/admin/products', {
        name,
        description,
        price,
        imageDataUrl,
      });
      alert(`Producto "${res?.data?.name ?? name}" creado correctamente`);
      setName('');
      setDescription('');
      setPrice('');
      setImageDataUrl(null);
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || 'Error al crear producto');
    }
  };

  return (
    <div className="contenedor-admin">
      <header className="navbar-carrito">
        <div className="logo-container-carrito">
          <img src={logo_blanco} alt="Logo Arepabuelas" className="logo-carrito" />
          <h1 className="nombre-carrito">Arepabuelas</h1>
        </div>
        <div className="iconos-carrito">
          <img
            src={carrito}
            alt="Carrito"
            className="icono-carrito"
            onClick={() => navigate('/carrito')}
            style={{ cursor: 'pointer' }}
          />
          <img
            src={perfil}
            alt="Perfil"
            className="icono-carrito"
            onClick={() => navigate('/perfil')}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </header>

      <img src={imgCesta} alt="Arepas" className="arepas-intro" />

      <div className="contenedor-columnas-admin">
        {/* ===== Control de usuarios (tu sección) ===== */}
        <div className="control-usuarios">
          <h1 className="titulo-control-usuarios">Control de usuarios</h1>
          <h2 className="subtitulo-control-usuarios">Validación de usuarios nuevos</h2>

          {loading && (
            <div className="usuario-nuevo">
              <div className="columnas-usuario-nuevo">
                <div className="texto-usuario-nuevo">
                  <p className="nombre-usuario-nuevo">Cargando solicitudes…</p>
                </div>
              </div>
            </div>
          )}

          {!loading && pending.length === 0 && (
            <div className="usuario-nuevo">
              <div className="columnas-usuario-nuevo">
                <div className="texto-usuario-nuevo">
                  <p className="nombre-usuario-nuevo">No hay solicitudes pendientes</p>
                </div>
              </div>
            </div>
          )}

          {!loading &&
            pending.map((u) => (
              <div className="usuario-nuevo" key={u.id}>
                <div className="columnas-usuario-nuevo">
                  <img src={imgPerfil} alt="Perfil" className="imagen-perfil-admin" />
                  <div className="texto-usuario-nuevo">
                    <p className="nombre-usuario-nuevo">{u.name}</p>
                    <p className="correo-usuario-nuevo">{u.email}</p>
                    <div className="botones-usuario-nuevo">
                      <button
                        className="usuario-rechazar"
                        onClick={() => reject(u.id)}
                        disabled={workingId === u.id}
                      >
                        Rechazar
                      </button>
                      <button
                        className="usuario-aceptar"
                        onClick={() => approve(u.id)}
                        disabled={workingId === u.id}
                      >
                        Aceptar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* ===== Control de productos (sección de tu compañero) ===== */}
        <div className="control-productos">
          <h1 className="titulo-control-productos">Control de productos</h1>
          <h2 className="subtitulo-control-productos">Agregar producto nuevo</h2>

          <div className="producto-nuevo">
            <div className="columnas-producto-nuevo">
              {/* Imagen con preview + overlay */}
              <div className="contenedor-imagen-admin" onClick={openPicker} title="Seleccionar imagen">
                <img
                  src={imageDataUrl ?? imgImagen}
                  alt="Vista previa"
                  className="imagen-producto-admin"
                />
                <div className="overlay-imagen-admin">
                  <span className="plus-admin">+</span>
                </div>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />

              <div className="nombre-descripcion">
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  className="nombre-producto-nuevo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <textarea
                  placeholder="Descripción del producto"
                  className="descripcion-producto-nuevo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  placeholder="Precio (COP)"
                  type="number"
                  className="precio-producto-admin"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button className="btn-crear" onClick={crearProducto}>
            Crear
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;