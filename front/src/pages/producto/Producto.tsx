import "./Producto.css";
import logo_blanco from "../../assets/logo_blanco.jpg";
import carrito from "../../assets/carrito.jpg";
import perfil from "../../assets/perfil.png";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api"; // axios con baseURL="/api" y withCredentials=true

type ProductoType = {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
};

type ComentarioType = {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
};

export default function Producto() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [producto, setProducto] = useState<ProductoType | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioType[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // =====================================================
  // Cargar producto y comentarios
  // =====================================================
  useEffect(() => {
    let abort = false;

    async function fetchProductoYComentarios() {
      try {
        if (!id) {
          setError("ID no especificado");
          return;
        }

        // === Obtener producto ===
        const productoRes = await api.get(`/auth/products/${id}`);
        if (abort) return;

        const data = productoRes.data;
        setProducto({
          id: Number(data.id),
          name: data.name,
          description: data.description ?? "",
          price: Number(data.price),
          image_url: data.image_url || "",
        });

        // === Obtener comentarios ===
        const comentariosRes = await api.get(`/auth/comments/${id}`);
        if (!abort) setComentarios(comentariosRes.data);
      } catch (e: any) {
        if (abort) return;

        if (e?.response?.status === 401) {
          navigate("/", { replace: true });
          return;
        }

        if (e?.response?.status === 404) {
          setError("Producto no encontrado");
          return;
        }

        setError(
          e?.response?.data?.error ||
            e?.message ||
            "Error al cargar producto o comentarios"
        );
      } finally {
        if (!abort) setCargando(false);
      }
    }

    fetchProductoYComentarios();
    return () => {
      abort = true;
    };
  }, [id, navigate]);

  // =====================================================
  // Añadir al carrito
  // =====================================================
  const addToCart = async () => {
    if (!producto) return;
    try {
      setAdding(true);
      await api.post("/auth/carrito", {
        productId: producto.id,
        quantity: 1,
        mode: "inc",
      });
      navigate("/carrito");
    } catch (e: any) {
      if (e?.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }
      alert(e?.response?.data?.error || "No se pudo agregar al carrito");
    } finally {
      setAdding(false);
    }
  };

  // =====================================================
  // Renderizado
  // =====================================================
  return (
    <div className="contenedor-producto-header">
      <header className="navbar-carrito">
        <div className="logo-container-carrito">
          <img
            src={logo_blanco}
            alt="Logo Arepabuelas"
            className="logo-carrito"
          />
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
              <button
                onClick={() => navigate("/tienda")}
                className="btn-regresar-producto"
              >
                Regresar
              </button>
            </div>
          </div>
        ) : producto ? (
          <>
            {/* ================== PRODUCTO ================== */}
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

            {/* ================== COMENTARIOS ================== */}
            <div className="comentarios-producto">
              <h1 className="titulo-comentario-producto">Comentarios</h1>
              <div className="contenedor-blanco-producto">
                {comentarios.length > 0 ? (
                  comentarios.map((c) => (
                    <div
                      key={c.id}
                      className="comentario-individual-producto"
                    >
                      <h2 className="usuario-comentario-producto">
                        {c.user_name}
                      </h2>
                      <p className="comentario-producto">{c.content}</p>
                      <div className="linea-verde"></div>
                    </div>
                  ))
                ) : (
                  <div className="comentario-individual-producto">
                    <h2 className="usuario-comentario-producto">Usuario</h2>
                    <p className="comentario-producto">
                      ¡Sé el primero en comentar!
                    </p>
                    <div className="linea-verde"></div>
                  </div>
                )}
              </div>

              <div className="botones-producto">
                <button
                  onClick={() => navigate("/tienda")}
                  className="btn-regresar-producto"
                >
                  Regresar
                </button>
                <button
                  onClick={() =>
                    navigate(`/comentario?producto=${producto.id}`)
                  }
                  className="btn-comentar-producto"
                >
                  Comentar
                </button>
                <button
                  className="btn-carrito-producto"
                  onClick={addToCart}
                  disabled={adding}
                  title={adding ? "Agregando..." : "Añadir al carrito"}
                >
                  {adding ? "Agregando..." : "Añadir al carrito"}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
