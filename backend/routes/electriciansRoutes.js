const express = require("express");
const router = express.Router();
const { getElectricians, getElectricianById } = require("../controllers/electricianController");

// GET /api/electricians
router.get("/", getElectricians);
router.get("/:electricianId", getElectricianById);

module.exports = router;
