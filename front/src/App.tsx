import React from "react";
import Home from "./pages/Home"; // importa tu interfaz principal
import "./App.css"; // estilos globales opcionales

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>E-Commerce</h1>
      </header>

      {/* Renderiza solo la página Home */}
      <main>
        <Home />
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Proyecto E-Commerce — Simulación segura</p>
      </footer>
    </div>
  );
}

export default App;