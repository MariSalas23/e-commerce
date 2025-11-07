import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AuthProvider, { AuthIsNotSignedIn, AuthIsSignedIn, AdminOnly } from "./contexts/AuthContext";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Signin from "./pages/signin/Signin";
import Solicitud from "./pages/solicitud/Solicitud";
import Error from "./pages/error/Error";
import Compra from "./pages/compra/Compra";
import Comentario from "./pages/comentario/Comentario";
import Perfil from "./pages/perfil/Perfil";
import Historial from "./pages/historial/Historial";
import Admin from "./pages/admin/Admin";
import Carrito from "./pages/carrito/Carrito";
import Pago from "./pages/pago/Pago";
import Tienda from "./pages/tienda/Tienda";
import Producto from "./pages/producto/Producto";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />

          {/* Solo si NO está autenticado (con fallback para evitar pantalla blanca) */}
          <Route
            path="/login"
            element={
              <AuthIsNotSignedIn fallback={<Login />}>
                <Login />
              </AuthIsNotSignedIn>
            }
          />
          <Route
            path="/signin"
            element={
              <AuthIsNotSignedIn fallback={<Signin />}>
                <Signin />
              </AuthIsNotSignedIn>
            }
          />

          {/* Protegidas — si no hay sesión, redirige a "/" */}
          <Route
            path="/tienda"
            element={
              <AuthIsSignedIn fallback={<Navigate to="/" replace />}>
                <Tienda />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/producto/:id"
            element={
              <AuthIsSignedIn fallback={<Navigate to="/" replace />}>
                <Producto />
              </AuthIsSignedIn>
            }
          />
          <Route path="/producto" element={<Navigate to="/tienda" replace />} />
          <Route
            path="/perfil"
            element={
              <AuthIsSignedIn fallback={<Navigate to="/" replace />}>
                <Perfil />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/historial"
            element={
              <AuthIsSignedIn fallback={<Navigate to="/" replace />}>
                <Historial />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/carrito"
            element={
              <AuthIsSignedIn fallback={<Navigate to="/" replace />}>
                <Carrito />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/pago"
            element={
              <AuthIsSignedIn fallback={<Navigate to="/" replace />}>
                <Pago />
              </AuthIsSignedIn>
            }
          />
          <Route path="/solicitud" element={<Solicitud />} />
          <Route
            path="/compra"
            element={
              <AuthIsSignedIn fallback={<Navigate to="/" replace />}>
                <Compra />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/comentario"
            element={
              <AuthIsSignedIn fallback={<Navigate to="/" replace />}>
                <Comentario />
              </AuthIsSignedIn>
            }
          />

          {/* SOLO ADMIN */}
          <Route
            path="/admin"
            element={
              <AuthIsSignedIn fallback={<Navigate to="/" replace />}>
                <AdminOnly fallback={<Navigate to="/" replace />}>
                  <Admin />
                </AdminOnly>
              </AuthIsSignedIn>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;