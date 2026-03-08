const Ropa = require("../models/Ropa");

const ropaController = {
    listar: async (req, res) => {
        try {
            const prendas = await Ropa.find();
            res.json(prendas);
        }catch (error){
            res.status(500).json({ mensaje: "Error al listar prendas" });
        }
    },

    agregar: async (req, res) => {
        try {
            const {nombre, precio, talla, stockDisponible} = req.body;
            const nuevaPrenda = new Ropa({
                nombre,
                precio,
                talla,
                stockDisponible,
            });
            await nuevaPrenda.save();
            res.json({ mensaje: "Prenda agregada", prenda: nuevaPrenda });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al agregar prenda" });
        }
    },

    eliminar: async (req, res) => {
        try {
            const {id} = req.params;
            await Ropa.findByIdAndDelete(id);
            res.json({mensaje: "Prenda eliminada"})
        } catch (error) {
      res.status(500).json({ mensaje: "Error al eliminar prenda" });
        }
    }
};

module.exports = ropaController;

