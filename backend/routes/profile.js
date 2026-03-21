const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateSpecificProfile,
} = require("../controllers/profileController");
const { authenticate } = require("../middleware/auth");

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET /api/profile - Récupérer le profil
router.get("/", getProfile);

// PUT /api/profile - Mettre à jour le profil de base
router.put("/", updateProfile);

// PUT /api/profile/specific - Mettre à jour les infos spécifiques
router.put("/specific", updateSpecificProfile);

module.exports = router;
