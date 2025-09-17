const express = require("express");
const router = express.Router();
const { getElectricians } = require("../controllers/electricianController");

// GET /api/electricians
router.get("/", getElectricians);

module.exports = router;
