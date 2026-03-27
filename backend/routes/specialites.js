const express = require("express");
const router = express.Router();
const specialiteController = require("../controllers/specialiteController");
const { authenticateToken } = require("../middleware/auth");

// Routes d'export (doivent être avant les routes génériques)
router.get(
  "/departements/export",
  authenticateToken,
  specialiteController.exportDepartements,
);
router.get(
  "/specialites/export",
  authenticateToken,
  specialiteController.exportSpecialites,
);

// Routes pour les archives
router.get(
  "/departements/archives",
  authenticateToken,
  specialiteController.getArchivedDepartements,
);
router.get(
  "/archives",
  authenticateToken,
  specialiteController.getArchivedSpecialites,
);
router.patch(
  "/departements/:id/archive",
  authenticateToken,
  specialiteController.archiveDepartement,
);
router.patch(
  "/departements/:id/restore",
  authenticateToken,
  specialiteController.restoreDepartement,
);
router.patch(
  "/:id/archive",
  authenticateToken,
  specialiteController.archiveSpecialite,
);
router.patch(
  "/:id/restore",
  authenticateToken,
  specialiteController.restoreSpecialite,
);

// Routes pour les départements (doivent être avant les routes génériques)
router.get(
  "/departements",
  authenticateToken,
  specialiteController.getDepartements,
);
router.post(
  "/departements",
  authenticateToken,
  specialiteController.createDepartement,
);
router.put(
  "/departements/:id",
  authenticateToken,
  specialiteController.updateDepartement,
);
router.delete(
  "/departements/:id",
  authenticateToken,
  specialiteController.deleteDepartement,
);

// Routes pour les niveaux
router.get("/niveaux", authenticateToken, specialiteController.getNiveaux);
router.post("/niveaux", authenticateToken, specialiteController.createNiveau);
router.put(
  "/niveaux/:id",
  authenticateToken,
  specialiteController.updateNiveau,
);
router.delete(
  "/niveaux/:id",
  authenticateToken,
  specialiteController.deleteNiveau,
);

// Routes pour les spécialités (routes génériques en dernier)
router.get("/", authenticateToken, specialiteController.getSpecialites);
router.post("/", authenticateToken, specialiteController.createSpecialite);
router.put("/:id", authenticateToken, specialiteController.updateSpecialite);
router.delete("/:id", authenticateToken, specialiteController.deleteSpecialite);

module.exports = router;
