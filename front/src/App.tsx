import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Signin from "./pages/signin/Signin";
import Solicitud from "./pages/solicitud/Solicitud";
import Error from "./pages/error/Error";
import Compra from "./pages/compra/Compra";
import Comentario from "./pages/comentario/Comentario";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/solicitud" element={<Solicitud />} />
        <Route path="/compra" element={<Compra />} />
        <Route path="/comentario" element={<Comentario />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  );
}

export default App;