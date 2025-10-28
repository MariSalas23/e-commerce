import "./Producto.css";
import logo_blanco from "../../assets/logo_blanco.jpg";
import carrito from "../../assets/carrito.jpg";
import perfil from "../../assets/perfil.png";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ProductoType = {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  image_url?: string;
};

export default function Producto() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [producto, setProducto] = useState<ProductoType | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;

    async function fetchProducto() {
      try {
        if (!id) {
          setError("ID no especificado");
          return;
        }

        const res = await fetch(`https://localhost/api/auth/products/${id}`, {
          method: "GET",
          credentials: "include", // usa cookie de sesión si tu AuthContext trabaja con cookie
          // Si usas token en vez de cookie, agrega:
          // headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (res.status === 401) {
          // sin sesión → vuelve a home o login
          navigate("/", { replace: true });
          return;
        }
        if (res.status === 404) {
          setError("Producto no encontrado");
          return;
        }
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || "No se pudo obtener el producto");
        }

        const data = await res.json();
        if (!abort) {
          setProducto({
            id: data.id,
            name: data.name,
            description: data.description,
            price: Number(data.price),
            image_url: data.image_url,
          });
        }
      } catch (e: any) {
        if (!abort) setError(e?.message || "Error desconocido");
      } finally {
        if (!abort) setCargando(false);
      }
    }

    fetchProducto();
    return () => {
      abort = true;
    };
  }, [id, navigate]);

  return (
    <div className="contenedor-producto-header">
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
            onClick={() => navigate("/carrito")}
            style={{ cursor: "pointer" }}
          />
          <img
            src={perfil}
            alt="Perfil"
            className="icono-carrito"
            onClick={() => navigate("/perfil")}
            style={{ cursor: "pointer" }}
          />
        </div>
      </header>

      <div className="contenedor-producto">
        {cargando ? (
          <p>Cargando producto...</p>
        ) : error ? (
          <div className="productos-producto">
            <h1 className="nombre-producto">Producto</h1>
            <p className="descripcion-producto">❌ {error}</p>
            <div className="botones-producto">
              <button onClick={() => navigate("/tienda")} className="btn-regresar-producto">
                Regresar
              </button>
            </div>
          </div>
        ) : producto ? (
          <>
            <div className="productos-producto">
              <div className="contenedor-titulo-producto">
                <h1 className="nombre-producto">{producto.name}</h1>
                <h1 className="precio-producto">
                  {Number(producto.price).toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </h1>
              </div>

              <div className="contenedor-imagen-producto">
                <img
                  src={producto.image_url || "/placeholder.jpg"}
                  alt={producto.name}
                />
              </div>

              <p className="descripcion-producto">
                {producto.description || "Sin descripción"}
              </p>
            </div>

            <div className="comentarios-producto">
              <h1 className="titulo-comentario-producto">Comentarios</h1>
              <div className="contenedor-blanco-producto">
                <div className="comentario-individual-producto">
                  <h2 className="usuario-comentario-producto">Usuario</h2>
                  <p className="comentario-producto">¡Sé el primero en comentar!</p>
                  <div className="linea-verde"></div>
                </div>
              </div>

              <div className="botones-producto">
                <button onClick={() => navigate("/tienda")} className="btn-regresar-producto">
                  Regresar
                </button>
                <button
                  onClick={() => navigate(`/comentario?producto=${producto.id}`)}
                  className="btn-comentar-producto"
                >
                  Comentar
                </button>
                <button
                  className="btn-carrito-producto"
                  onClick={() => {
                    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                    cart.push({ id: producto.id, qty: 1 });
                    localStorage.setItem("cart", JSON.stringify(cart));
                    navigate("/carrito");
                  }}
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
