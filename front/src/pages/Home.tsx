import React from "react";
import "./Home.css"; // estilos propios de la página

export default function Home() {
  return (
    <section className="home">
      <h2>Bienvenido a Secure-Commerce 🛒</h2>
      <p>
        Explora nuestros productos simulados, añade al carrito y realiza un pago
        seguro con tarjetas de prueba.
      </p>

      <div className="products">
        <div className="product-card">
          <img src="/logo.png" alt="Producto" />
          <h3>Producto de ejemplo</h3>
          <p>$45.000 COP</p>
          <button>Ver detalles</button>
        </div>
      </div>
    </section>
  );
}