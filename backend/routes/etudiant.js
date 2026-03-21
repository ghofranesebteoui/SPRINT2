const express = require("express");
const router = express.Router();
const { sequelize } = require("../models");
const { authenticateToken } = require("../middleware/auth");

// GET /api/etudiant/profile - Récupérer le profil de l'étudiant connecté
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const numeroUtilisateur = req.user.numero_utilisateur;

    const [results] = await sequelize.query(
      `
      SELECT 
        u.numero_utilisateur,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.sexe,
        e.numero_etudiant as matricule,
        e.cin,
        e.date_naissance,
        e.filiere,
        e.moyenne_generale,
        v.nom_ville as ville
      FROM utilisateur u
      LEFT JOIN etudiant e ON u.numero_utilisateur = e.numero_utilisateur
      LEFT JOIN ville v ON e.id_ville = v.id_ville
      WHERE u.numero_utilisateur = :numeroUtilisateur
      `,
      {
        replacements: { numeroUtilisateur },
      },
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profil étudiant non trouvé",
      });
    }

    res.json({
      success: true,
      data: results[0],
    });
  } catch (error) {
    console.error("Erreur récupération profil étudiant:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

module.exports = router;
