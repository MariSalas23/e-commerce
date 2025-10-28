// front/src/pages/admin/Admin.tsx
import './Admin.css';
import imgCesta from '../../assets/cesta.png';
import imgImagen from '../../assets/imagen.png';
import logo_blanco from '../../assets/logo_blanco.jpg';
import carrito from '../../assets/carrito.jpg';
import perfil from '../../assets/perfil.png';
import { useNavigate } from 'react-router-dom';
import React, { useState, useRef } from 'react';
import { api } from '../../api/api';

// 🧩 Helper para redimensionar imagen
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

  // estados para crear producto
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // subir imagen
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

  // crear producto
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
      alert(`✅ Producto "${res.data.name}" creado correctamente`);
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
          <img src={carrito} alt="Carrito" className="icono-carrito" onClick={() => navigate('/carrito')} />
          <img src={perfil} alt="Perfil" className="icono-carrito" onClick={() => navigate('/perfil')} />
        </div>
      </header>

      <img src={imgCesta} alt="Arepas" className="arepas-intro" />

      <div className="contenedor-columnas-admin">
        {/* Control de usuarios */}
        <div className="control-usuarios">
          <h1 className="titulo-control-usuarios">Control de usuarios</h1>
          <h2 className="subtitulo-control-usuarios">Validación de usuarios nuevos</h2>
          <div className="usuario-nuevo">
            <div className="columnas-usuario-nuevo">
              <div className="texto-usuario-nuevo">
                <p className="nombre-usuario-nuevo">No hay solicitudes pendientes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Control de productos */}
        <div className="control-productos">
          <h1 className="titulo-control-productos">Control de productos</h1>
          <h2 className="subtitulo-control-productos">Agregar producto nuevo</h2>

          <div className="producto-nuevo">
            <div className="columnas-producto-nuevo">
              {/* Imagen con preview */}
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
