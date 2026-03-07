const mongoose = require("mongoose");

const ropaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Ropa", ropaSchema);