require("dotenv").config();
const express =require("express");
const dayjs = require("dayjs");
const mongoose = require("mongoose");
const ropaRoutes = require("./routes/ropaRoutes");

const app = express();
const PORT = 3000;

// Middleware para JSON y archivos estáticos

app.use(express.json());
app.use(express.static("public"));

// Conexión a MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Conectado a MongoDB"))
    .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Configuracion fija y funciones de negocio    
const CONFIG = {
  iva: 0.21,
  descuentoUmbral: 100,
  descuentoPorcentaje: 0.05,
  costeEnvio: 5.99,
  envioGratisUmbral: 50,
};

function validarStock(items) {
    return items.every((item) => item.stockDiponible > item.cantidad);
};

function calcularSubtotal(items) {
    return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
};

function calcularEnvio(subtotal) {
    return subtotal >= CONFIG.envioGratisUmbral ? 0 : CONFIG.costeEnvio;
};

function generarFactura(clienteData, items) {
  // Validamos que haya stock suficiente
  if (!validarStock(items)) {
    throw new Error(
      "Falta de stock en uno o más productos. Revisa el inventario."
    );
  }

  const subtotal = calcularSubtotal(items);

  // 🚨 Nuevo: detectamos si hay stock bajo
  const stockBajo = items.some((item) => item.stockDisponible < 5);

  // 🚨 Nuevo: detectamos si hay prendas premium (precio > 100€)
  const prendasPremium = items.filter((item) => item.precio > 100);

  const descuento =
    subtotal > CONFIG.descuentoUmbral
      ? subtotal * CONFIG.descuentoPorcentaje
      : 0;
  const subtotalConDescuento = subtotal - descuento;

  const impuestos = subtotalConDescuento * CONFIG.iva;
  const gastosEnvio = calcularEnvio(subtotalConDescuento);
  const total = subtotalConDescuento + impuestos + gastosEnvio;

  const fechaEntrega = dayjs().add(3, "day").format("DD/MM/YYYY");

  // Creamos la lista de productos con talla incluida
  const nombresProductos = items
    .map(
      (p) => `${p.cantidad}x ${p.nombre} (Talla: ${p.talla || "M"}) - ${p.precio}€ c/u`
    )
    .join("\n  - ");

  return `=========================================
🌱 TIENDA DE ROPA - FACTURA 🌱
=========================================
👤 Cliente: ${clienteData.nombre.toUpperCase()}
📧 Contacto: ${clienteData.email}

📦 Productos:
  - ${nombresProductos}

⚠️ Avisos:
  - ${stockBajo ? "¡Stock bajo en alguna prenda! Compra rápida." : "Stock suficiente"}
  - ${
    prendasPremium.length > 0
      ? "Prenda(s) premium detectada(s): " +
        prendasPremium.map((p) => p.nombre).join(", ")
      : "No hay prendas premium"
  }

--- Desglose ---
Subtotal: ${subtotal.toFixed(2)}€
Descuento: -${descuento.toFixed(2)}€
Base Imponible: ${subtotalConDescuento.toFixed(2)}€
IVA (21%): +${impuestos.toFixed(2)}€
Envío: ${gastosEnvio === 0 ? "GRATIS" : `+${gastosEnvio.toFixed(2)}€`}
-----------------------------------------
💶 TOTAL A PAGAR: ${total.toFixed(2)}€
=========================================
🚚 Entrega estimada: ${fechaEntrega}
=========================================`;
}

// ==========================================
// Rutas de la API
// ==========================================
app.use("/api/ropa", ropaRoutes);

app.post("/factura", (req, res) => {
    try {
        const cliente = req.body.cliente;
        const carrito = req.body.carrito;

        if(!cliente || !carrito || !Array.isArray(carrito)) {
            return res.status(400).json({ error: "Datos de cliente o carrito inválidos" });
        }

        const reciboTexto = generarFactura(cliente, carrito);

        res.status(200).json({
            mensaje: "Factura generada exitosamente",
            ticket: reciboTexto
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
        }
});

// ==========================================
// Iniciar servidor
// ==========================================

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});

module.exports = app;