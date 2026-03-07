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

function generarFactura (clienteData, items) {
    if (!validarStock(items)) {
        throw new Error ("Falta de stock en uno o más productos.");
    }

    const subtotal = calcularSubtotal(items);
    const stockBajo = items.some((item) => item.stockDisponible < 5);

    let descuento = 
    subtotal > CONFIG.descuentoUmbral
    ? subtotal * CONFIG.descuentoPorcentaje
    : 0;
    const suhtotalConDescuento = subtotal - descuento;

    const impuestos = subtotalConDescuento * CONFIG.iva;
    const gastosEnvios = calcularEnvio(subtotalConDescuento);

    const total = subtotalConDescuento + impuestos + gastosEnvios;

    const fechaEntrega = dayjs().add(3, "day").format("YYYY-MM-DD");
    const nombresProductos = items
    .map((p) => `${p.cantidad}x ${p.nombre}`)
    .join("\n - ");

    return `=========================================
🌱 TIENDA DE ROPA - FACTURA 🌱
=========================================
👤 Cliente: ${clienteData.nombre.toUpperCase()}
📧 Contacto: ${clienteData.email}

📦 Productos:
  - ${nombresProductos}
⚠️ Atención: ${stockBajo ? "¡Stock bajo, compra rápida!" : "Stock suficiente"}

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

