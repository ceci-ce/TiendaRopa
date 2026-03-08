require("dotenv").config();
const mongoose = require("mongoose");
const Ropa = require("./src/models/Ropa");

const ropaInicial = [
  { nombre: "Camiseta Algodón Premium Negra", precio: 25, stockDisponible: 50, talla: "M" },
  { nombre: "Jeans Slim Fit Indigo", precio: 69, stockDisponible: 30, talla: "L" },
  { nombre: "Sudadera Minimal Algodón Beige", precio: 59, stockDisponible: 20, talla: "M" },
  { nombre: "Chaqueta Piel Napa Marrón", precio: 199, stockDisponible: 10, talla: "XL" },
];

async function poblarBaseDeDatos() {
  try {
    console.log("⏳ Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🟢 Conexión establecida.");

    console.log("🧹 Limpiando colección...");
    await Ropa.deleteMany({});

    console.log("🌱 Insertando productos iniciales...");
    await Ropa.insertMany(ropaInicial);

    console.log("✅ ¡Base de datos poblada correctamente!");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("🔴 Error en el seed:", error);
    process.exit(1);
  }
}

poblarBaseDeDatos();