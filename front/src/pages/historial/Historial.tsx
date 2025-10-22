import './Historial.css';
import imgArps from '../../assets/arepas.png';

const Historial = () => {
    const pedidos = [
        { producto: 'Arepa de queso', cantidad: '3', total: '$9.000', fecha: '2025-10-19' },
        { producto: 'Arepa de choclo', cantidad: '2', total: '$8.000', fecha: '2025-10-18' },
        { producto: 'Arepa rellena', cantidad: '4', total: '$16.000', fecha: '2025-10-17' },
        { producto: 'Arepa boyacense', cantidad: '1', total: '$4.500', fecha: '2025-10-15' },
    ];

    return (
        <div className='contenedor-historial'>
            <div className='contenedor-blanco-historial'>
                {/* Imagen lado izquierdo */}
                <div className='contenedor-imagen-historial'>
                    <img src={imgArps} alt="Arepas" />
                </div>

                {/* Contenido textual lado derecho */}
                <div className='contenedor-texto-historial'>
                    <h1 className='titulo-historial'>Historial</h1>
                    <h2 className='subtitulo-historial'>Mis compras</h2>

                    <div className='contenedor-pedidos'>
                        {pedidos.map((pedido, index) => (
                            <div key={index} className='bloque-compra'>
                                <p><strong>Producto:</strong> {pedido.producto}</p>
                                <p><strong>Cantidad:</strong> {pedido.cantidad}</p>
                                <p><strong>Total pagado:</strong> {pedido.total}</p>
                                <p><strong>Fecha:</strong> {pedido.fecha}</p>
                                {index < pedidos.length - 1 && <hr className='linea-separadora' />}
                            </div>
                        ))}
                    </div>

                    <button className="btn-regresar-historial">Regresar</button>
                </div>
            </div>
        </div>
    );
};

export default Historial;
