const express = require("express");
const router = express.Router();
const { Etablissement } = require("../models");
const { Op } = require("sequelize");

// GET /api/etablissements/universites - Liste des universités
router.get("/universites", async (req, res) => {
  try {
    // Dans la base de données, les universités sont des rectorats de type UNIVERSITE ou DGET
    const { Sequelize } = require("sequelize");
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

// GET /api/etablissements - Liste tous les établissements (facultés, écoles, instituts)
router.get("/", async (req, res) => {
  try {
    const { type, universite_id } = req.query;

    console.log("=== API ÉTABLISSEMENTS ===");
    console.log("Query params:", { type, universite_id });

    const { Sequelize } = require("sequelize");
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

    // Filtrer par université (rectorat) si spécifié
    if (universite_id) {
      query += ` AND e.id_rectorat = ${parseInt(universite_id)}`;
      console.log("Filtrage par id_rectorat:", universite_id);
    }

    query += ` ORDER BY e.nom_etablissement ASC`;

    const [etablissements] = await sequelize.query(query);

    console.log("Établissements trouvés:", etablissements.length);

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

// GET /api/etablissements/:id - Détails d'un établissement
router.get("/:id", async (req, res) => {
  try {
    const etablissement = await Etablissement.findByPk(req.params.id);

    if (!etablissement) {
      return res.status(404).json({
        success: false,
        message: "Établissement non trouvé",
      });
    }

    res.json({
      success: true,
      data: etablissement,
    });
  } catch (error) {
    console.error("Erreur récupération établissement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

module.exports = router;
