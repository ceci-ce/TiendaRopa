const mongoose = require("mongoose");

const ropaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    talla: {
        type: String,
        default: "M",
    },
    stockDisponible: {
        type: Number,
        default: 10,
    },
});

module.exports = mongoose.model("Ropa", ropaSchema);