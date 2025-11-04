import './Admin.css';
import imgCesta from '../../assets/cesta.png';
import imgPerfil from '../../assets/perfil.png';
import imgImagen from '../../assets/imagen.png';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../api/api';

// --------- Tipos ---------
type PendingUser = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
};

type Producto = {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  image_url?: string;
};

// --------- Helper para redimensionar imagen ---------
async function resizeImageToDataURL(
  file: File,
  maxSize = 512,
  quality = 0.85
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;
  let newW = w,
    newH = h;
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

  // --------- Usuarios pendientes ---------
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [workingId, setWorkingId] = useState<number | null>(null);

  // --------- Creación de productos ---------
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // --------- Edición / eliminación de productos ---------
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editando, setEditando] = useState<Producto>({
    id: 0,
    name: '',
    description: '',
    price: '',
    image_url: '',
  });
  const editImageRef = useRef<HTMLInputElement | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // =====================
  // Cargar usuarios
  // =====================
  async function loadPending() {
    setLoading(true);
    try {
      const r = await api.get('/admin/pending');
      setPending(Array.isArray(r?.data?.users) ? r.data.users : []);
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Error al cargar solicitudes');
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
      alert(e?.response?.data?.error || 'Error al aprobar');
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
      alert(e?.response?.data?.error || 'Error al rechazar');
    } finally {
      setWorkingId(null);
    }
  }

  // =====================
  // Cargar productos
  // =====================
  async function loadProductos() {
    try {
      const r = await api.get('/admin/products');
      setProductos(r.data);
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Error al cargar productos');
    }
  }

  // =====================
  // Crear producto nuevo
  // =====================
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
      loadProductos();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Error al crear producto');
    }
  };

  // =====================
  // Editar producto
  // =====================
  const handleEditSelect = (id: number) => {
    setSelectedId(id);
    const p = productos.find((prod) => prod.id === id);
    if (p) {
      setEditando({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: String(p.price),
        image_url: p.image_url || '',
      });
      setEditImagePreview(p.image_url || null);
    }
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImageToDataURL(file, 512, 0.85);
    setEditImagePreview(dataUrl);
  };

  const guardarCambios = async () => {
    if (!selectedId) return;
    try {
      const res = await api.patch(`/admin/products/${selectedId}`, {
        ...editando,
        imageDataUrl: editImagePreview,
      });
      alert(`Producto "${res.data.name}" actualizado`);
      setSelectedId(null);
      loadProductos();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Error al actualizar producto');
    }
  };

  const eliminarProducto = async () => {
    if (!selectedId) return;
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await api.delete(`/admin/products/${selectedId}`);
      alert('Producto eliminado correctamente');
      setSelectedId(null);
      loadProductos();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Error al eliminar producto');
    }
  };

  useEffect(() => {
    loadPending();
    loadProductos();
  }, []);

  // =====================
  // RENDER
  // =====================
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
        {/* =======================
            CONTROL DE USUARIOS
        ======================= */}
        <div className="control-usuarios">
          <h1 className="titulo-control-usuarios">Control de usuarios</h1>
          <h2 className="subtitulo-control-usuarios">Validación de usuarios nuevos</h2>

          {loading ? (
            <p className="nombre-usuario-nuevo">Cargando solicitudes…</p>
          ) : pending.length === 0 ? (
            <p className="nombre-usuario-nuevo">No hay solicitudes pendientes</p>
          ) : (
            pending.map((u) => (
              <div className="usuario-nuevo" key={u.id}>
                <div className="columnas-usuario-nuevo">
                  <img src={imgPerfil} alt="Perfil" className="imagen-perfil-admin" />
                  <div className="texto-usuario-nuevo">
                    <p className="nombre-usuario-nuevo">{u.name}</p>
                    <p className="correo-usuario-nuevo">{u.email}</p>
                    <div className="botones-usuario-nuevo">
                      <button className="usuario-rechazar" onClick={() => reject(u.id)} disabled={workingId === u.id}>Rechazar</button>
                      <button className="usuario-aceptar" onClick={() => approve(u.id)} disabled={workingId === u.id}>Aceptar</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* =======================
            CONTROL DE PRODUCTOS
        ======================= */}
        <div className="control-productos">
          <h1 className="titulo-control-productos">Control de productos</h1>

          {/* Crear nuevo */}
          <h2 className="subtitulo-control-productos">Agregar producto nuevo</h2>
          <div className="producto-nuevo">
            <div className="columnas-producto-nuevo">
              <div className="contenedor-imagen-admin" onClick={openPicker}>
                <img src={imageDataUrl ?? imgImagen} alt="Vista previa" className="imagen-producto-admin" />
                <div className="overlay-imagen-admin"><span className="plus-admin">+</span></div>
              </div>
              <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              <div className="nombre-descripcion">
                <input type="text" placeholder="Nombre del producto" className="nombre-producto-nuevo" value={name} onChange={(e) => setName(e.target.value)} />
                <textarea placeholder="Descripción del producto" className="descripcion-producto-nuevo" value={description} onChange={(e) => setDescription(e.target.value)} />
                <input type="number" placeholder="Precio (COP)" className="precio-producto-admin" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>
          </div>
          <button className="btn-crear" onClick={crearProducto}>Crear</button>

          {/* Editar existente */}
          <h2 className="subtitulo-control-productos">Editar o eliminar producto</h2>

          {productos.length === 0 ? (
            <p className="nombre-usuario-nuevo">No hay productos registrados</p>
          ) : (
            <>
              <select
                className="select-producto-admin"
                value={selectedId || ''}
                onChange={(e) => handleEditSelect(Number(e.target.value))}
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {selectedId && (
                <div className="producto-nuevo">
                  <div className="columnas-producto-nuevo">
                    <div className="contenedor-imagen-admin" onClick={() => editImageRef.current?.click()}>
                      <img src={editImagePreview ?? imgImagen} alt="Vista previa" className="imagen-producto-admin" />
                      <div className="overlay-imagen-admin"><span className="plus-admin">+</span></div>
                    </div>
                    <input ref={editImageRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleEditImageChange} />

                    <div className="nombre-descripcion">
                      <input type="text" className="nombre-producto-nuevo" value={editando.name} onChange={(e) => setEditando({ ...editando, name: e.target.value })} />
                      <textarea className="descripcion-producto-nuevo" value={editando.description} onChange={(e) => setEditando({ ...editando, description: e.target.value })} />
                      <input type="number" className="precio-producto-admin" value={editando.price} onChange={(e) => setEditando({ ...editando, price: e.target.value })} />
                      <div className="botones-usuario-nuevo">
                        <button className="usuario-aceptar" onClick={guardarCambios}>Guardar</button>
                        <button className="usuario-rechazar" onClick={eliminarProducto}>Eliminar</button>
                        <button className="usuario-rechazar" onClick={() => setSelectedId(null)}>Cancelar</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;