const express = require("express");
const router = express.Router();
const ropaController = require("../controllers/ropaController");

router.get("/", ropaController.listar);
router.post("/", ropaController.agregar);
router.delete("/:id", ropaController.eliminar);

module.exports = router;