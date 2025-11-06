import './Perfil.css';
import imgArepas from '../../assets/arepas.png';
import imgPerfil from '../../assets/perfil.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

// ✅ Helper: redimensiona y comprime a DataURL para no exceder límites
async function resizeImageToDataURL(
  file: File,
  maxSize = 512,       // lado mayor
  quality = 0.85       // compresión jpeg
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

  // usamos jpeg para mejor compresión
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  bitmap.close();
  return dataUrl;
}

const Perfil = () => {
  const navigate = useNavigate();
  const { user, signOut, updateAvatar, refresh } = useAuth();

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Cargar avatar desde el user (BD) o dejar null (mostrar default en CSS)
  useEffect(() => {
    if (user?.avatar) setAvatarSrc(user.avatar);
    else setAvatarSrc(null);
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      alert('No se pudo cerrar sesión');
    }
  };

  const openPicker = () => inputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Validación estricta antes de subir
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Solo se permiten imágenes PNG o JPEG.');
      e.target.value = '';
      return;
    }

    if (file.size > 5000 * 1024) {
      alert('La imagen no puede superar los 5000 KB.');
      e.target.value = '';
      return;
    }

    // Evitar extensiones engañosas (.jpg.exe, etc.)
    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith('.jpg') && !nameLower.endsWith('.jpeg') && !nameLower.endsWith('.png')) {
      alert('El archivo debe tener extensión .jpg, .jpeg o .png.');
      e.target.value = '';
      return;
    }

    // ✅ Previsualización local segura
    const temp = URL.createObjectURL(file);
    setAvatarSrc(temp);

    try {
      // Redimensionar/comprimir a DataURL para enviar en JSON
      const dataUrl = await resizeImageToDataURL(file, 512, 0.85);

      // Validar que el DataURL resultante sea seguro antes de enviarlo
      if (!dataUrl.startsWith('data:image/jpeg') && !dataUrl.startsWith('data:image/png')) {
        alert('Formato de imagen inválido o potencialmente inseguro.');
        e.target.value = '';
        return;
      }

      setAvatarSrc(dataUrl);

      // ✅ Envía al backend (protegido también)
      await updateAvatar(dataUrl);
      await refresh();
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el avatar');
    } finally {
      URL.revokeObjectURL(temp);
      e.target.value = '';
    }
  };

  if (!user) return null;

  return (
    <div className="contenedor-perfil">
      <div className="contenedor-blanco-perfil">

        <div className="contenedor-imagen-perfil">
          <img src={imgArepas} alt="Arepas" />
        </div>

        <div className="contenedor-texto-perfil">

          {/* ✅ Avatar circular con background-image */}
          <div
            className="perfil-avatar"
            style={{ backgroundImage: `url(${avatarSrc ?? imgPerfil})` }}
            onClick={openPicker}
            title="Cambiar foto de perfil"
          >
            <div className="avatar-overlay">
              <span className="avatar-plus">+</span>
            </div>
          </div>

          {/* Input oculto */}
          <input
            ref={inputRef}
            id="avatarInput"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />

          <div className="contenedor-titulo-perfil">
            <h1 className="titulo-perfil">{user.name}</h1>
            <h2 className="subtitulo-perfil">{user.email}</h2>
          </div>

          <div className="botones-perfil">
            <button onClick={() => navigate('/historial')} className="btn-historial">Historial</button>
            <div className="botones-fila">
              <button onClick={() => navigate('/tienda')} className="btn-regresar-perfil">Regresar</button>
              <button className="btn-logout" onClick={handleLogout}>Log out</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Perfil;
