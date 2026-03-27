const express = require("express");
const router = express.Router();
const etablissementController = require("../controllers/etablissementController");
const { authenticateToken, isAdmin } = require("../middleware/auth");

// Routes publiques (pour les formulaires d'inscription)
// GET /api/etablissements/universites - Liste des universités
router.get("/universites", async (req, res) => {
  try {
    const sequelize = require("../config/database");

    const [universites] = await sequelize.query(`
      SELECT id_rectorat as id, nom_rectorat as nom_etablissement, code_rectorat as code, type
      FROM rectorat
      WHERE type IN ('UNIVERSITE', 'DGET')
      ORDER BY 
        CASE WHEN type = 'DGET' THEN 0 ELSE 1 END,
        nom_rectorat ASC
    `);

    res.json({
      success: true,
      data: universites,
    });
  } catch (error) {
    console.error("Erreur récupération universités:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

// GET /api/etablissements/public - Liste publique (pour formulaires)
router.get("/public", async (req, res) => {
  try {
    const { type, universite_id } = req.query;
    const sequelize = require("../config/database");

    let query = `
      SELECT 
        e.id_etablissement as id,
        e.nom_etablissement,
        e.code_etablissement as code,
        e.type,
        e.id_ville,
        e.id_rectorat,
        r.nom_rectorat as universite_nom
      FROM etablissement e
      LEFT JOIN rectorat r ON e.id_rectorat = r.id_rectorat
      WHERE 1=1
    `;

    if (universite_id) {
      query += ` AND e.id_rectorat = ${parseInt(universite_id)}`;
    }

    query += ` ORDER BY e.nom_etablissement ASC`;

    const [etablissements] = await sequelize.query(query);

    res.json({
      success: true,
      data: etablissements,
    });
  } catch (error) {
    console.error("Erreur récupération établissements:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

// Routes protégées - Admin uniquement
// IMPORTANT: Les routes spécifiques doivent être définies AVANT le middleware général

// GET /api/etablissements/stats - Statistiques
router.get(
  "/stats",
  authenticateToken,
  isAdmin,
  etablissementController.getEtablissementsStats,
);

// GET /api/etablissements/export - Exporter en CSV
router.get(
  "/export",
  authenticateToken,
  isAdmin,
  etablissementController.exportEtablissements,
);

// Appliquer le middleware pour toutes les routes suivantes
router.use(authenticateToken, isAdmin);

// GET /api/etablissements - Liste avec filtres et pagination
router.get("/", etablissementController.getEtablissements);

// GET /api/etablissements/departements/:departementId/specialites - Spécialités d'un département (AVANT /:id)
router.get(
  "/departements/:departementId/specialites",
  etablissementController.getSpecialitesByDepartement,
);

// GET /api/etablissements/:id - Détail d'un établissement
router.get("/:id", etablissementController.getEtablissementById);

// GET /api/etablissements/:id/departements - Départements d'un établissement
router.get(
  "/:id/departements",
  etablissementController.getDepartementsByEtablissement,
);

// GET /api/etablissements/:id/specialites - Spécialités d'un établissement
router.get(
  "/:id/specialites",
  etablissementController.getSpecialitesByEtablissement,
);

// GET /api/etablissements/:id/enseignants - Enseignants d'un établissement
router.get(
  "/:id/enseignants",
  etablissementController.getEnseignantsByEtablissement,
);

// POST /api/etablissements - Créer un établissement
router.post("/", etablissementController.createEtablissement);

// PUT /api/etablissements/:id - Modifier un établissement
router.put("/:id", etablissementController.updateEtablissement);

// DELETE /api/etablissements/:id - Archiver un établissement
router.delete("/:id", etablissementController.archiveEtablissement);

// POST /api/etablissements/:id/restore - Restaurer un établissement archivé
router.post("/:id/restore", etablissementController.restoreEtablissement);

// DELETE /api/etablissements/:id/permanent - Supprimer définitivement un établissement
router.delete(
  "/:id/permanent",
  etablissementController.deleteEtablissementPermanent,
);

module.exports = router;
