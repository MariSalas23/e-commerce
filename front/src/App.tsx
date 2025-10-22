import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthProvider, { AuthIsNotSignedIn, AuthIsSignedIn } from "./contexts/AuthContext";

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

          {/* Protegidas */}
          <Route
            path="/tienda"
            element={
              <AuthIsSignedIn>
                <Tienda />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/producto"
            element={
              <AuthIsSignedIn>
                <Producto />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/perfil"
            element={
              <AuthIsSignedIn>
                <Perfil />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/historial"
            element={
              <AuthIsSignedIn>
                <Historial />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/carrito"
            element={
              <AuthIsSignedIn>
                <Carrito />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/pago"
            element={
              <AuthIsSignedIn>
                <Pago />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/solicitud"
            element={
              <AuthIsSignedIn>
                <Solicitud />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/compra"
            element={
              <AuthIsSignedIn>
                <Compra />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/comentario"
            element={
              <AuthIsSignedIn>
                <Comentario />
              </AuthIsSignedIn>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthIsSignedIn>
                <Admin />
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
