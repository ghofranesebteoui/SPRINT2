const sequelize = require("../config/database");

// Récupérer tous les départements
exports.getDepartements = async (req, res) => {
  try {
    const { id_etablissement, id_rectorat } = req.query;

    let query = `
      SELECT d.id_departement, d.code_departement, d.nom_departement, 
        d.chef_departement, d.id_etablissement,
        e.nom_etablissement, e.id_rectorat
      FROM departement d
      LEFT JOIN etablissement e ON d.id_etablissement = e.id_etablissement
      WHERE 1=1
    `;
    const replacements = {};

    // Check if archived column exists, if so, filter by it
    try {
      await sequelize.query("SELECT archived FROM departement LIMIT 1", {
        type: sequelize.QueryTypes.SELECT,
      });
      query = query.replace(
        "WHERE 1=1",
        "WHERE (d.archived = FALSE OR d.archived IS NULL)",
      );
    } catch (e) {
      // Column doesn't exist, continue without filter
    }

    if (id_etablissement) {
      query += ` AND d.id_etablissement = :id_etablissement`;
      replacements.id_etablissement = id_etablissement;
    }

    if (id_rectorat) {
      query += ` AND e.id_rectorat = :id_rectorat`;
      replacements.id_rectorat = id_rectorat;
    }

    query += " ORDER BY d.nom_departement";

    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      departements: result,
    });
  } catch (error) {
    console.error("Erreur getDepartements:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des départements",
      error: error.message,
    });
  }
};

// Récupérer toutes les spécialités
exports.getSpecialites = async (req, res) => {
  try {
    const { id_departement, id_etablissement, id_rectorat, niveau } = req.query;

    let query = `
      SELECT s.id_specialite, s.code_specialite, s.nom_specialite, 
        s.description, s.nombre_credits, s.duree_formation,
        n.id_niveau, n.nom_niveau as niveau, n.type_niveau,
        d.id_departement, d.nom_departement, d.code_departement,
        d.id_etablissement,
        e.nom_etablissement, e.id_rectorat
      FROM specialite s
      INNER JOIN niveau n ON s.id_niveau = n.id_niveau
      INNER JOIN departement d ON n.id_departement = d.id_departement
      LEFT JOIN etablissement e ON d.id_etablissement = e.id_etablissement
      WHERE 1=1
    `;
    const replacements = {};

    // Check if archived column exists, if so, filter by it
    try {
      await sequelize.query("SELECT archived FROM specialite LIMIT 1", {
        type: sequelize.QueryTypes.SELECT,
      });
      query = query.replace(
        "WHERE 1=1",
        "WHERE (s.archived = FALSE OR s.archived IS NULL)",
      );
    } catch (e) {
      // Column doesn't exist, continue without filter
    }

    if (id_departement) {
      query += ` AND d.id_departement = :id_departement`;
      replacements.id_departement = id_departement;
    }

    if (id_etablissement) {
      query += ` AND d.id_etablissement = :id_etablissement`;
      replacements.id_etablissement = id_etablissement;
    }

    if (id_rectorat) {
      query += ` AND e.id_rectorat = :id_rectorat`;
      replacements.id_rectorat = id_rectorat;
    }

    if (niveau) {
      query += ` AND n.type_niveau = :niveau`;
      replacements.niveau = niveau;
    }

    query += " ORDER BY s.nom_specialite";

    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      specialites: result,
    });
  } catch (error) {
    console.error("Erreur getSpecialites:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des spécialités",
      error: error.message,
    });
  }
};

// Créer un département
exports.createDepartement = async (req, res) => {
  try {
    const {
      code_departement,
      nom_departement,
      chef_departement,
      id_etablissement,
    } = req.body;

    const result = await sequelize.query(
      `INSERT INTO departement (code_departement, nom_departement, chef_departement, id_etablissement)
       VALUES (:code_departement, :nom_departement, :chef_departement, :id_etablissement)
       RETURNING *`,
      {
        replacements: {
          code_departement,
          nom_departement,
          chef_departement,
          id_etablissement,
        },
        type: sequelize.QueryTypes.INSERT,
      },
    );

    res.json({
      success: true,
      message: "Département créé avec succès",
      departement: result[0][0],
    });
  } catch (error) {
    console.error("Erreur createDepartement:", error);
    res.status(500).json({
      success: false,
      message:
        error.original?.code === "23505"
          ? "Ce code département existe déjà"
          : "Erreur lors de la création du département",
      error: error.message,
    });
  }
};

// Créer une spécialité
exports.createSpecialite = async (req, res) => {
  try {
    const {
      code_specialite,
      nom_specialite,
      description,
      nombre_credits,
      duree_formation,
      id_niveau,
    } = req.body;

    const result = await sequelize.query(
      `INSERT INTO specialite (code_specialite, nom_specialite, description, nombre_credits, duree_formation, id_niveau)
       VALUES (:code_specialite, :nom_specialite, :description, :nombre_credits, :duree_formation, :id_niveau)
       RETURNING *`,
      {
        replacements: {
          code_specialite,
          nom_specialite,
          description,
          nombre_credits,
          duree_formation,
          id_niveau,
        },
        type: sequelize.QueryTypes.INSERT,
      },
    );

    res.json({
      success: true,
      message: "Spécialité créée avec succès",
      specialite: result[0][0],
    });
  } catch (error) {
    console.error("Erreur createSpecialite:", error);
    res.status(500).json({
      success: false,
      message:
        error.original?.code === "23505"
          ? "Ce code spécialité existe déjà"
          : "Erreur lors de la création de la spécialité",
      error: error.message,
    });
  }
};

// Modifier un département
exports.updateDepartement = async (req, res) => {
  try {
    const { id } = req.params;
    const { code_departement, nom_departement, chef_departement } = req.body;

    const result = await sequelize.query(
      `UPDATE departement 
       SET code_departement = :code_departement, nom_departement = :nom_departement, 
           chef_departement = :chef_departement
       WHERE id_departement = :id
       RETURNING *`,
      {
        replacements: {
          code_departement,
          nom_departement,
          chef_departement,
          id,
        },
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: "Département non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Département modifié avec succès",
      departement: result[0][0],
    });
  } catch (error) {
    console.error("Erreur updateDepartement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du département",
      error: error.message,
    });
  }
};

// Modifier une spécialité
exports.updateSpecialite = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code_specialite,
      nom_specialite,
      description,
      nombre_credits,
      duree_formation,
    } = req.body;

    const result = await sequelize.query(
      `UPDATE specialite 
       SET code_specialite = :code_specialite, nom_specialite = :nom_specialite, 
           description = :description, nombre_credits = :nombre_credits, duree_formation = :duree_formation
       WHERE id_specialite = :id
       RETURNING *`,
      {
        replacements: {
          code_specialite,
          nom_specialite,
          description,
          nombre_credits,
          duree_formation,
          id,
        },
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: "Spécialité non trouvée",
      });
    }

    res.json({
      success: true,
      message: "Spécialité modifiée avec succès",
      specialite: result[0][0],
    });
  } catch (error) {
    console.error("Erreur updateSpecialite:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification de la spécialité",
      error: error.message,
    });
  }
};

// Supprimer un département
exports.deleteDepartement = async (req, res) => {
  try {
    const { id } = req.params;

    await sequelize.query(
      "DELETE FROM departement WHERE id_departement = :id",
      {
        replacements: { id },
        type: sequelize.QueryTypes.DELETE,
      },
    );

    res.json({
      success: true,
      message: "Département supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteDepartement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du département",
      error: error.message,
    });
  }
};

// Exporter les départements en CSV
exports.exportDepartements = async (req, res) => {
  try {
    const { id_etablissement, id_rectorat } = req.query;

    let query = `
      SELECT d.code_departement, d.nom_departement, 
        d.chef_departement, e.nom_etablissement
      FROM departement d
      LEFT JOIN etablissement e ON d.id_etablissement = e.id_etablissement
      WHERE d.archived = FALSE
    `;
    const replacements = {};

    if (id_etablissement) {
      query += ` AND d.id_etablissement = :id_etablissement`;
      replacements.id_etablissement = id_etablissement;
    }

    if (id_rectorat) {
      query += ` AND e.id_rectorat = :id_rectorat`;
      replacements.id_rectorat = id_rectorat;
    }

    query += " ORDER BY d.nom_departement";

    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Créer le CSV
    let csv = "Code,Nom,Chef de département,Établissement\n";
    result.forEach((row) => {
      csv += `"${row.code_departement}","${row.nom_departement}","${row.chef_departement || ""}","${row.nom_etablissement}"\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=departements.csv",
    );
    res.send("\uFEFF" + csv); // BOM pour UTF-8
  } catch (error) {
    console.error("Erreur exportDepartements:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'export des départements",
      error: error.message,
    });
  }
};

// Exporter les spécialités en CSV
exports.exportSpecialites = async (req, res) => {
  try {
    const { id_departement, id_etablissement, id_rectorat, niveau } = req.query;

    let query = `
      SELECT s.code_specialite, s.nom_specialite, 
        n.nom_niveau as niveau, n.type_niveau,
        d.nom_departement, 
        e.nom_etablissement
      FROM specialite s
      INNER JOIN niveau n ON s.id_niveau = n.id_niveau
      INNER JOIN departement d ON n.id_departement = d.id_departement
      LEFT JOIN etablissement e ON d.id_etablissement = e.id_etablissement
      WHERE s.archived = FALSE
    `;
    const replacements = {};

    if (id_departement) {
      query += ` AND d.id_departement = :id_departement`;
      replacements.id_departement = id_departement;
    }

    if (id_etablissement) {
      query += ` AND d.id_etablissement = :id_etablissement`;
      replacements.id_etablissement = id_etablissement;
    }

    if (id_rectorat) {
      query += ` AND e.id_rectorat = :id_rectorat`;
      replacements.id_rectorat = id_rectorat;
    }

    if (niveau) {
      query += ` AND n.type_niveau = :niveau`;
      replacements.niveau = niveau;
    }

    query += " ORDER BY s.nom_specialite";

    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Créer le CSV
    let csv = "Code,Nom,Niveau,Type,Département,Établissement\n";
    result.forEach((row) => {
      csv += `"${row.code_specialite}","${row.nom_specialite}","${row.niveau}","${row.type_niveau}","${row.nom_departement}","${row.nom_etablissement}"\n`;
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=specialites.csv",
    );
    res.send("\uFEFF" + csv); // BOM pour UTF-8
  } catch (error) {
    console.error("Erreur exportSpecialites:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'export des spécialités",
      error: error.message,
    });
  }
};

// Supprimer une spécialité
exports.deleteSpecialite = async (req, res) => {
  try {
    const { id } = req.params;

    await sequelize.query("DELETE FROM specialite WHERE id_specialite = :id", {
      replacements: { id },
      type: sequelize.QueryTypes.DELETE,
    });

    res.json({
      success: true,
      message: "Spécialité supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteSpecialite:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la spécialité",
      error: error.message,
    });
  }
};

// Récupérer tous les niveaux
exports.getNiveaux = async (req, res) => {
  try {
    const { id_departement } = req.query;

    let query = `
      SELECT n.id_niveau, n.nom_niveau, n.type_niveau, n.duree_annees, n.description,
        n.id_departement,
        d.nom_departement, d.code_departement
      FROM niveau n
      INNER JOIN departement d ON n.id_departement = d.id_departement
      WHERE 1=1
    `;
    const replacements = {};

    if (id_departement) {
      query += ` AND n.id_departement = :id_departement`;
      replacements.id_departement = id_departement;
    }

    query += " ORDER BY n.nom_niveau";

    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      niveaux: result,
    });
  } catch (error) {
    console.error("Erreur getNiveaux:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des niveaux",
      error: error.message,
    });
  }
};

// Créer un niveau
exports.createNiveau = async (req, res) => {
  try {
    const {
      type_niveau,
      nom_niveau,
      duree_annees,
      description,
      id_departement,
    } = req.body;

    const result = await sequelize.query(
      `INSERT INTO niveau (type_niveau, nom_niveau, duree_annees, description, id_departement)
       VALUES (:type_niveau, :nom_niveau, :duree_annees, :description, :id_departement)
       RETURNING *`,
      {
        replacements: {
          type_niveau,
          nom_niveau,
          duree_annees,
          description,
          id_departement,
        },
        type: sequelize.QueryTypes.INSERT,
      },
    );

    res.json({
      success: true,
      message: "Niveau créé avec succès",
      niveau: result[0][0],
    });
  } catch (error) {
    console.error("Erreur createNiveau:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du niveau",
      error: error.message,
    });
  }
};

// Modifier un niveau
exports.updateNiveau = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_niveau, nom_niveau, duree_annees, description } = req.body;

    const result = await sequelize.query(
      `UPDATE niveau 
       SET type_niveau = :type_niveau, nom_niveau = :nom_niveau, 
           duree_annees = :duree_annees, description = :description
       WHERE id_niveau = :id
       RETURNING *`,
      {
        replacements: {
          type_niveau,
          nom_niveau,
          duree_annees,
          description,
          id,
        },
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: "Niveau non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Niveau modifié avec succès",
      niveau: result[0][0],
    });
  } catch (error) {
    console.error("Erreur updateNiveau:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du niveau",
      error: error.message,
    });
  }
};

// Supprimer un niveau
exports.deleteNiveau = async (req, res) => {
  try {
    const { id } = req.params;

    await sequelize.query("DELETE FROM niveau WHERE id_niveau = :id", {
      replacements: { id },
      type: sequelize.QueryTypes.DELETE,
    });

    res.json({
      success: true,
      message: "Niveau supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur deleteNiveau:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du niveau",
      error: error.message,
    });
  }
};

// Archiver un département
exports.archiveDepartement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.numero_utilisateur;

    await sequelize.query(
      `UPDATE departement 
       SET archived = TRUE, archived_at = NOW(), archived_by = :userId
       WHERE id_departement = :id`,
      {
        replacements: { id, userId },
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    res.json({
      success: true,
      message: "Département archivé avec succès",
    });
  } catch (error) {
    console.error("Erreur archiveDepartement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'archivage du département",
      error: error.message,
    });
  }
};

// Restaurer un département
exports.restoreDepartement = async (req, res) => {
  try {
    const { id } = req.params;

    await sequelize.query(
      `UPDATE departement 
       SET archived = FALSE, archived_at = NULL, archived_by = NULL
       WHERE id_departement = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    res.json({
      success: true,
      message: "Département restauré avec succès",
    });
  } catch (error) {
    console.error("Erreur restoreDepartement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la restauration du département",
      error: error.message,
    });
  }
};

// Récupérer les départements archivés
exports.getArchivedDepartements = async (req, res) => {
  try {
    const query = `
      SELECT d.id_departement, d.code_departement, d.nom_departement, 
        d.chef_departement, d.id_etablissement, d.archived_at,
        e.nom_etablissement, e.id_rectorat
      FROM departement d
      LEFT JOIN etablissement e ON d.id_etablissement = e.id_etablissement
      WHERE d.archived = TRUE
      ORDER BY d.archived_at DESC
    `;

    const result = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      departements: result,
    });
  } catch (error) {
    console.error("Erreur getArchivedDepartements:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des départements archivés",
      error: error.message,
    });
  }
};

// Archiver une spécialité
exports.archiveSpecialite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.numero_utilisateur;

    await sequelize.query(
      `UPDATE specialite 
       SET archived = TRUE, archived_at = NOW(), archived_by = :userId
       WHERE id_specialite = :id`,
      {
        replacements: { id, userId },
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    res.json({
      success: true,
      message: "Spécialité archivée avec succès",
    });
  } catch (error) {
    console.error("Erreur archiveSpecialite:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'archivage de la spécialité",
      error: error.message,
    });
  }
};

// Restaurer une spécialité
exports.restoreSpecialite = async (req, res) => {
  try {
    const { id } = req.params;

    await sequelize.query(
      `UPDATE specialite 
       SET archived = FALSE, archived_at = NULL, archived_by = NULL
       WHERE id_specialite = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    res.json({
      success: true,
      message: "Spécialité restaurée avec succès",
    });
  } catch (error) {
    console.error("Erreur restoreSpecialite:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la restauration de la spécialité",
      error: error.message,
    });
  }
};

// Récupérer les spécialités archivées
exports.getArchivedSpecialites = async (req, res) => {
  try {
    const query = `
      SELECT s.id_specialite, s.code_specialite, s.nom_specialite, 
        s.description, s.nombre_credits, s.duree_formation, s.archived_at,
        n.id_niveau, n.nom_niveau as niveau, n.type_niveau,
        d.id_departement, d.nom_departement, d.code_departement,
        d.id_etablissement,
        e.nom_etablissement, e.id_rectorat
      FROM specialite s
      INNER JOIN niveau n ON s.id_niveau = n.id_niveau
      INNER JOIN departement d ON n.id_departement = d.id_departement
      LEFT JOIN etablissement e ON d.id_etablissement = e.id_etablissement
      WHERE s.archived = TRUE
      ORDER BY s.archived_at DESC
    `;

    const result = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      specialites: result,
    });
  } catch (error) {
    console.error("Erreur getArchivedSpecialites:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des spécialités archivées",
      error: error.message,
    });
  }
};
