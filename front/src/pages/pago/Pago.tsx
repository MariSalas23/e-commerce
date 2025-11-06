import './Pago.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../api/api';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: string;
  subtotal: string;
}

interface SavedCard {
  id: number;
  card_last_four: string;
  card_holder: string;
  expiration_month: number;
  expiration_year: number;
  is_default: boolean;
}

const SHIPPING_COST = 5000;

const Pago = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [saveCard, setSaveCard] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiration: '',
    cvv: '',
    shippingAddress: '',
    couponCode: '',
  });

  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal || '0'), 0);
  const discountAmount = subtotal * couponDiscount;
  const total = Math.max(0, subtotal + SHIPPING_COST - discountAmount);

  // Cargar carrito y tarjetas guardadas cuando el componente se monta
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching cart and cards data...');
        
        const [cartRes, cardsRes] = await Promise.all([
          api.get('/auth/carrito'),
          api.get('/auth/saved-cards'),
        ]);

        console.log('Cart response:', cartRes.data);
        console.log('Cards response:', cardsRes.data);

        // Ensure items are properly formatted with subtotal as string
        const items = (cartRes.data.items || []).map((item: any) => ({
          ...item,
          subtotal: String(item.subtotal),
        }));

        console.log('Formatted items:', items);
        console.log('Total items:', items.length);

        setCartItems(items);
        setSavedCards(cardsRes.data.cards || []);

        // Seleccionar tarjeta predeterminada
        const defaultCard = cardsRes.data.cards?.find((c: SavedCard) => c.is_default);
        if (defaultCard) {
          console.log('Setting default card:', defaultCard.id);
          setSelectedCardId(defaultCard.id);
          setUseSavedCard(true);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      }
    };

    fetchData();
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Formatear expiración
  const formatExpiration = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  // Validar cupón
  const handleValidateCoupon = async () => {
    if (!formData.couponCode.trim()) {
      setCouponMessage('Por favor ingresa un código de cupón');
      return;
    }

    setCouponValidating(true);
    setCouponMessage('');
    setCouponDiscount(0);

    try {
      const response = await api.post('/auth/validate-coupon', {
        couponCode: formData.couponCode.trim(),
      });

      if (response.data.valid) {
        setCouponDiscount(response.data.discount);
        setCouponMessage(`${response.data.message}`);
      } else {
        setCouponMessage(`${response.data.message}`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al validar cupón';
      setCouponMessage(`${errorMessage}`);
    } finally {
      setCouponValidating(false);
    }
  };

  // Procesar pago
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (cartItems.length === 0) {
        setError('El carrito está vacío');
        setLoading(false);
        return;
      }

      if (!formData.shippingAddress.trim()) {
        setError('Por favor ingresa una dirección de envío');
        setLoading(false);
        return;
      }

      // Si usa tarjeta guardada, validar que está seleccionada
      if (useSavedCard && !selectedCardId) {
        setError('Por favor selecciona una tarjeta guardada');
        setLoading(false);
        return;
      }

      // Si usa tarjeta nueva, validar campos requeridos
      if (!useSavedCard) {
        if (!formData.cardNumber.trim()) {
          setError('Por favor ingresa el número de tarjeta');
          setLoading(false);
          return;
        }
        if (!formData.cardHolder.trim()) {
          setError('Por favor ingresa el nombre del titular');
          setLoading(false);
          return;
        }
        if (!formData.expiration.trim()) {
          setError('Por favor ingresa la fecha de expiración');
          setLoading(false);
          return;
        }
        if (!formData.cvv.trim()) {
          setError('Por favor ingresa el CVV');
          setLoading(false);
          return;
        }
      }

      const paymentData: any = {
        amount: Number(subtotal + SHIPPING_COST), // Send original amount, backend will apply discount
        shippingAddress: formData.shippingAddress.trim(),
      };

      // Add coupon code if validated
      if (couponDiscount > 0 && formData.couponCode.trim()) {
        paymentData.couponCode = formData.couponCode.trim();
      }

      if (useSavedCard) {
        // Usar tarjeta guardada
        paymentData.savedCardId = Number(selectedCardId);
        console.log('Using saved card:', paymentData);
      } else {
        // Usar tarjeta nueva
        paymentData.cardNumber = formData.cardNumber.replace(/\s+/g, '');
        paymentData.cardHolder = formData.cardHolder.trim();
        paymentData.expiration = formData.expiration.trim();
        paymentData.cvv = formData.cvv.trim();
        paymentData.saveCard = saveCard;
        console.log('Using new card:', paymentData);
      }

      console.log('Final payment data:', paymentData);

      const response = await api.post('/auth/payment', paymentData);

      if (response.data.ok) {
        // Pago exitoso - limpiar estado
        setFormData({
          cardNumber: '',
          cardHolder: '',
          expiration: '',
          cvv: '',
          shippingAddress: '',
          couponCode: '',
        });
        setCouponDiscount(0);
        setCouponMessage('');
        navigate('/compra');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al procesar el pago';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="contenedor-pago">
        <div className="error-message">
          <p>El carrito está vacío. Por favor agrega productos antes de continuar.</p>
          <button onClick={() => navigate('/tienda')} className="btn-volver-pago">
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-pago">
      <div className="contenedor-informacion-pago">
        <h2>Información de envío</h2>

        <textarea
          name="shippingAddress"
          placeholder="Dirección de envío"
          className="input-pago"
          value={formData.shippingAddress}
          onChange={handleInputChange}
          rows={3}
        />

        <hr className="divider-pago" />

        <div className="resumen-pago">
          <div className="fila-pago">
            <span>Subtotal</span>
            <span>COP {subtotal.toLocaleString()}</span>
          </div>
          <div className="fila-pago">
            <span>Envío</span>
            <span>COP {SHIPPING_COST.toLocaleString()}</span>
          </div>
          <div className="fila-total-pago">
            <span>Total</span>
            <span>COP {total.toLocaleString()}</span>
          </div>
        </div>

        <hr className="divider-pago" />

        <h3>Cupón de descuento</h3>
        <div className="contenedor-cupon-pago">
          <div className="input-cupon-group">
            <input
              type="text"
              name="couponCode"
              placeholder="Ingresa tu código de cupón"
              className="input-pago"
              value={formData.couponCode}
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={handleValidateCoupon}
              disabled={couponValidating}
              className="btn-validar-cupon"
            >
              {couponValidating ? 'Validando...' : 'Validar'}
            </button>
          </div>
          {couponMessage && (
            <p className={`cupon-message ${couponDiscount > 0 ? 'success' : 'error'}`}>
              {couponMessage}
            </p>
          )}
          {couponDiscount > 0 && (
            <div className="fila-pago descuento">
              <span>Descuento ({(couponDiscount * 100).toFixed(0)}%)</span>
              <span>-COP {discountAmount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <hr className="divider-pago" />

        <h3>Resumen de productos</h3>
        <div className="items-resumen">
          {cartItems.map((item) => (
            <div key={item.id} className="item-resumen">
              <span>{item.name} x {item.quantity}</span>
              <span>COP {parseFloat(item.subtotal).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="contenedor-metodo-pago">
        <h2>Método de pago</h2>

        {error && <div className="error-pago">{error}</div>}

        {/* Tarjetas guardadas */}
        {savedCards.length > 0 && (
          <div className="tarjetas-guardadas-pago">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useSavedCard}
                onChange={(e) => setUseSavedCard(e.target.checked)}
              />
              Usar tarjeta guardada
            </label>

            {useSavedCard && (
              <select
                value={selectedCardId || ''}
                onChange={(e) => setSelectedCardId(Number(e.target.value))}
                className="select-tarjeta-pago"
              >
                <option value="">Selecciona una tarjeta</option>
                {savedCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.card_holder} - **** {card.card_last_four}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {!useSavedCard && (
          <>
            <div className="tarjeta-container-pago">
              <div className="tarjeta-header-pago">
                <i className="fa-solid fa-credit-card"></i>
                <span>Tarjeta de crédito</span>
              </div>

              <div className="tarjeta-form-pago">
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Número de tarjeta"
                  className="input-pago"
                  value={formatCardNumber(formData.cardNumber)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cardNumber: e.target.value.replace(/\s+/g, ''),
                    }))
                  }
                  maxLength={19}
                />
                <input
                  type="text"
                  name="cardHolder"
                  placeholder="Nombre del titular"
                  className="input-pago"
                  value={formData.cardHolder}
                  onChange={handleInputChange}
                />
                <div className="fila-exp-pago">
                  <input
                    type="text"
                    name="expiration"
                    placeholder="MM/YY"
                    className="input-pago"
                    value={formatExpiration(formData.expiration)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expiration: e.target.value,
                      }))
                    }
                    maxLength={5}
                  />
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    className="input-pago"
                    value={formData.cvv}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cvv: e.target.value.replace(/[^0-9]/g, ''),
                      }))
                    }
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
              />
              Guardar esta tarjeta para futuras compras
            </label>
          </>
        )}

        <div className="botones-pago">
          <button
            onClick={() => navigate('/carrito')}
            className="btn-regresar-pago"
            disabled={loading}
          >
            Regresar
          </button>
          <button
            onClick={handlePayment}
            className="btn-pagar-pago"
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Pagar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pago;
