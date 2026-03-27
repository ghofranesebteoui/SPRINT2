const { Etablissement } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { logAction } = require("../services/auditService");

// Lister les établissements avec filtres et pagination
exports.getEtablissements = async (req, res) => {
  try {
    const {
      search,
      type,
      id_rectorat,
      page = 1,
      limit = 10,
      archived = false,
    } = req.query;

    const where = {};

    // Filtrer par statut archivé
    if (archived === "true") {
      where.archive = true;
    } else {
      where.archive = false;
    }

    if (type) where.type = type;
    if (id_rectorat) where.id_rectorat = id_rectorat;

    if (search) {
      where[Op.or] = [
        { nom_etablissement: { [Op.iLike]: `%${search}%` } },
        { code_etablissement: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const etablissements = await Etablissement.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["nom_etablissement", "ASC"]],
    });

    res.json({
      success: true,
      etablissements: etablissements.rows,
      total: etablissements.count,
      page: parseInt(page),
      totalPages: Math.ceil(etablissements.count / limit),
    });
  } catch (error) {
    console.error("Erreur getEtablissements:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Obtenir le détail d'un établissement
exports.getEtablissementById = async (req, res) => {
  try {
    const { id } = req.params;

    const [etablissement] = await sequelize.query(
      `
      SELECT 
        e.*,
        r.nom_rectorat as universite_nom,
        v.nom_ville,
        (SELECT COUNT(DISTINCT a.numero_utilisateur) 
         FROM affectation a 
         WHERE a.id_etablissement = e.id_etablissement AND a.statut = 'ACTIVE') as nombre_enseignants,
        (SELECT COUNT(DISTINCT d.id_departement) 
         FROM departement d 
         WHERE d.id_etablissement = e.id_etablissement) as nombre_departements,
        (SELECT COUNT(DISTINCT s.id_specialite) 
         FROM specialite s 
         INNER JOIN niveau n ON s.id_niveau = n.id_niveau 
         INNER JOIN departement d ON n.id_departement = d.id_departement 
         WHERE d.id_etablissement = e.id_etablissement) as nombre_specialites
      FROM etablissement e
      LEFT JOIN rectorat r ON e.id_rectorat = r.id_rectorat
      LEFT JOIN ville v ON e.id_ville = v.id_ville
      WHERE e.id_etablissement = :id
    `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (!etablissement) {
      return res
        .status(404)
        .json({ success: false, message: "Établissement non trouvé" });
    }

    res.json({ success: true, etablissement });
  } catch (error) {
    console.error("Erreur getEtablissementById:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Créer un établissement
exports.createEtablissement = async (req, res) => {
  try {
    const {
      code_etablissement,
      nom_etablissement,
      type,
      id_rectorat,
      id_ville,
      adresse,
      telephone,
      email,
      site_web,
      budget_alloue,
      capacite_maximale,
      date_creation,
    } = req.body;

    // Vérifier si le code existe déjà
    const existing = await Etablissement.findOne({
      where: { code_etablissement },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Un établissement avec ce code existe déjà",
      });
    }

    const etablissement = await Etablissement.create({
      code_etablissement,
      nom_etablissement,
      type,
      id_rectorat,
      id_ville,
      adresse,
      telephone,
      email,
      site_web,
      budget_alloue,
      capacite_maximale,
      date_creation: date_creation || new Date(),
      effectif_total: 0,
      taux_occupation: 0,
    });

    // Log de l'action
    await logAction(
      req.user.id,
      "CREATE_ETABLISSEMENT",
      "Etablissement",
      etablissement.id_etablissement,
      { nom: nom_etablissement, code: code_etablissement },
    );

    res.status(201).json({
      success: true,
      message: "Établissement créé avec succès",
      etablissement,
    });
  } catch (error) {
    console.error("Erreur createEtablissement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Modifier un établissement
exports.updateEtablissement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom_etablissement,
      type,
      id_ville,
      adresse,
      telephone,
      email,
      site_web,
      budget_alloue,
      capacite_maximale,
    } = req.body;

    const etablissement = await Etablissement.findByPk(id);
    if (!etablissement) {
      return res
        .status(404)
        .json({ success: false, message: "Établissement non trouvé" });
    }

    const oldData = { ...etablissement.toJSON() };

    await etablissement.update({
      nom_etablissement,
      type,
      id_ville,
      adresse,
      telephone,
      email,
      site_web,
      budget_alloue,
      capacite_maximale,
    });

    // Log de l'action
    await logAction(
      req.user.id,
      "UPDATE_ETABLISSEMENT",
      "Etablissement",
      etablissement.id_etablissement,
      { old: oldData, new: etablissement.toJSON() },
    );

    res.json({
      success: true,
      message: "Établissement modifié avec succès",
      etablissement,
    });
  } catch (error) {
    console.error("Erreur updateEtablissement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Archiver un établissement (soft delete)
exports.archiveEtablissement = async (req, res) => {
  try {
    const { id } = req.params;

    const etablissement = await Etablissement.findByPk(id);
    if (!etablissement) {
      return res
        .status(404)
        .json({ success: false, message: "Établissement non trouvé" });
    }

    // Archiver l'établissement
    await etablissement.update({ archive: true });

    await logAction(
      req.user.id,
      "ARCHIVE_ETABLISSEMENT",
      "Etablissement",
      etablissement.id_etablissement,
      { nom: etablissement.nom_etablissement },
    );

    res.json({
      success: true,
      message: "Établissement archivé avec succès",
      etablissement,
    });
  } catch (error) {
    console.error("Erreur archiveEtablissement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Restaurer un établissement archivé
exports.restoreEtablissement = async (req, res) => {
  try {
    const { id } = req.params;

    const etablissement = await Etablissement.findByPk(id);
    if (!etablissement) {
      return res
        .status(404)
        .json({ success: false, message: "Établissement non trouvé" });
    }

    // Restaurer l'établissement
    await etablissement.update({ archive: false });

    await logAction(
      req.user.id,
      "RESTORE_ETABLISSEMENT",
      "Etablissement",
      etablissement.id_etablissement,
      { nom: etablissement.nom_etablissement },
    );

    res.json({
      success: true,
      message: "Établissement restauré avec succès",
      etablissement,
    });
  } catch (error) {
    console.error("Erreur restoreEtablissement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Supprimer définitivement un établissement
exports.deleteEtablissementPermanent = async (req, res) => {
  try {
    const { id } = req.params;

    const etablissement = await Etablissement.findByPk(id);
    if (!etablissement) {
      return res
        .status(404)
        .json({ success: false, message: "Établissement non trouvé" });
    }

    const etablissementData = {
      nom: etablissement.nom_etablissement,
      code: etablissement.code_etablissement,
    };

    // Supprimer définitivement
    await etablissement.destroy();

    await logAction(
      req.user.id,
      "DELETE_ETABLISSEMENT_PERMANENT",
      "Etablissement",
      id,
      etablissementData,
    );

    res.json({
      success: true,
      message: "Établissement supprimé définitivement",
    });
  } catch (error) {
    console.error("Erreur deleteEtablissementPermanent:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Exporter la liste des établissements (CSV)
exports.exportEtablissements = async (req, res) => {
  try {
    const { type, id_rectorat, id } = req.query;

    const where = {};

    // Si un ID spécifique est fourni, exporter uniquement cet établissement
    if (id) {
      where.id_etablissement = id;
    } else {
      // Sinon, appliquer les filtres normaux
      if (type) where.type = type;
      if (id_rectorat) where.id_rectorat = id_rectorat;
    }

    const etablissements = await Etablissement.findAll({
      where,
      order: [["nom_etablissement", "ASC"]],
    });

    if (etablissements.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun établissement trouvé",
      });
    }

    // Créer le CSV
    const headers = [
      "Code",
      "Nom",
      "Type",
      "Adresse",
      "Téléphone",
      "Email",
      "Site Web",
      "Effectif Total",
      "Capacité Maximale",
      "Budget Alloué",
      "Taux Occupation",
    ];

    const rows = etablissements.map((e) => [
      e.code_etablissement,
      e.nom_etablissement,
      e.type,
      e.adresse || "",
      e.telephone || "",
      e.email || "",
      e.site_web || "",
      e.effectif_total || 0,
      e.capacite_maximale || 0,
      e.budget_alloue || 0,
      e.taux_occupation || 0,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Log de l'action
    await logAction(
      req.user.id,
      id ? "EXPORT_ETABLISSEMENT" : "EXPORT_ETABLISSEMENTS",
      "Etablissement",
      id || null,
      { count: etablissements.length },
    );

    const filename = id
      ? `etablissement_${etablissements[0].code_etablissement}_${Date.now()}.csv`
      : `etablissements_${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send("\uFEFF" + csv); // BOM pour Excel
  } catch (error) {
    console.error("Erreur exportEtablissements:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Obtenir les statistiques des établissements
exports.getEtablissementsStats = async (req, res) => {
  try {
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN type = 'FACULTE' THEN 1 END) as facultes,
        COUNT(CASE WHEN type = 'ECOLE' THEN 1 END) as ecoles,
        COUNT(CASE WHEN type = 'INSTITUT' THEN 1 END) as instituts,
        COUNT(CASE WHEN type = 'ISET' THEN 1 END) as isets,
        SUM(effectif_total) as effectif_total,
        SUM(capacite_maximale) as capacite_totale,
        AVG(taux_occupation) as taux_occupation_moyen,
        AVG(taux_reussite) as taux_reussite_moyen,
        AVG(taux_echec) as taux_echec_moyen,
        AVG(performance) as performance_moyenne,
        SUM(budget_alloue) as budget_total
      FROM etablissement
    `);

    // Compter le nombre d'universités (rectorats)
    const [rectoratCount] = await sequelize.query(`
      SELECT COUNT(DISTINCT id_rectorat) as total_universites
      FROM rectorat
    `);

    res.json({
      success: true,
      stats: {
        ...stats[0],
        total_universites: parseInt(rectoratCount[0].total_universites) || 0,
      },
    });
  } catch (error) {
    console.error("Erreur getEtablissementsStats:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Obtenir les départements d'un établissement
exports.getDepartementsByEtablissement = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("getDepartementsByEtablissement - ID:", id);

    const departements = await sequelize.query(
      `
      SELECT 
        d.id_departement,
        d.code_departement,
        d.nom_departement,
        d.chef_departement,
        (SELECT COUNT(DISTINCT s.id_specialite) 
         FROM specialite s 
         INNER JOIN niveau n ON s.id_niveau = n.id_niveau 
         WHERE n.id_departement = d.id_departement) as nombre_specialites,
        (SELECT COUNT(DISTINCT a.numero_utilisateur) 
         FROM affectation a 
         WHERE a.id_departement = d.id_departement 
         AND a.id_etablissement = :id 
         AND a.statut = 'ACTIVE') as nombre_enseignants
      FROM departement d
      WHERE d.id_etablissement = :id
      ORDER BY d.nom_departement ASC
      `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    console.log("Departements found:", departements.length);
    if (departements.length > 0) {
      console.log("Sample departement:", departements[0]);
    }
    res.json({ success: true, departements });
  } catch (error) {
    console.error("Erreur getDepartementsByEtablissement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Obtenir les spécialités d'un département
exports.getSpecialitesByDepartement = async (req, res) => {
  try {
    const { departementId } = req.params;

    const specialites = await sequelize.query(
      `
      SELECT 
        s.id_specialite,
        s.code_specialite,
        s.nom_specialite,
        n.nom_niveau as niveau,
        0 as nombre_etudiants,
        100 as capacite_max,
        0 as taux_remplissage
      FROM specialite s
      LEFT JOIN niveau n ON s.id_niveau = n.id_niveau
      ORDER BY s.nom_specialite ASC
      LIMIT 10
      `,
      {
        replacements: { departementId },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    res.json({ success: true, specialites });
  } catch (error) {
    console.error("Erreur getSpecialitesByDepartement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Obtenir toutes les spécialités d'un établissement
exports.getSpecialitesByEtablissement = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    console.log("getSpecialitesByEtablissement - ID:", id, "Page:", page);

    // Compter le total des spécialités via la relation niveau -> departement -> etablissement
    const [countResult] = await sequelize.query(
      `
      SELECT COUNT(DISTINCT s.id_specialite) as total
      FROM specialite s
      INNER JOIN niveau n ON s.id_niveau = n.id_niveau
      INNER JOIN departement d ON n.id_departement = d.id_departement
      WHERE d.id_etablissement = :id
      `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    const total = parseInt(countResult.total) || 0;
    console.log("Total specialites pour etablissement", id, ":", total);

    const specialites = await sequelize.query(
      `
      SELECT 
        s.id_specialite,
        s.code_specialite,
        s.nom_specialite,
        COALESCE(n.nom_niveau, 'Non défini') as niveau,
        d.nom_departement,
        d.code_departement,
        (SELECT COUNT(*) FROM etudiant e WHERE e.id_specialite = s.id_specialite) as nombre_etudiants,
        0 as taux_remplissage
      FROM specialite s
      INNER JOIN niveau n ON s.id_niveau = n.id_niveau
      INNER JOIN departement d ON n.id_departement = d.id_departement
      WHERE d.id_etablissement = :id
      ORDER BY s.nom_specialite ASC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { id, limit: parseInt(limit), offset },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    console.log("Specialites found:", specialites.length);
    if (specialites.length > 0) {
      console.log("Sample specialite:", specialites[0]);
    }

    res.json({
      success: true,
      specialites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Erreur getSpecialitesByEtablissement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Obtenir les enseignants d'un établissement
exports.getEnseignantsByEtablissement = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Compter le total via la table affectation
    const [countResult] = await sequelize.query(
      `
      SELECT COUNT(DISTINCT a.numero_utilisateur) as total
      FROM affectation a
      WHERE a.id_etablissement = :id AND a.statut = 'ACTIVE'
      `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    const total = parseInt(countResult.total) || 0;

    const enseignants = await sequelize.query(
      `
      SELECT 
        u.numero_utilisateur,
        e.numero_enseignant as matricule,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        e.grade,
        e.specialite,
        d.nom_departement,
        d.code_departement
      FROM affectation a
      INNER JOIN utilisateur u ON a.numero_utilisateur = u.numero_utilisateur
      INNER JOIN enseignant e ON a.numero_utilisateur = e.numero_utilisateur
      LEFT JOIN departement d ON a.id_departement = d.id_departement
      WHERE a.id_etablissement = :id AND a.statut = 'ACTIVE'
      ORDER BY u.nom, u.prenom ASC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { id, limit: parseInt(limit), offset },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    res.json({
      success: true,
      enseignants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Erreur getEnseignantsByEtablissement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};
