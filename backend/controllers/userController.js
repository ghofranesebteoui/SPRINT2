const { sequelize } = require("../models");
const User = require("../models/User");
const Etudiant = require("../models/Etudiant");
const Enseignant = require("../models/Enseignant");
const auditService = require("../services/auditService");

// Récupérer tous les utilisateurs avec filtres
exports.getAllUsers = async (req, res) => {
  try {
    const {
      role,
      statut,
      universite,
      region,
      ville,
      etablissement,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    console.log("Filtres reçus:", {
      role,
      statut,
      search,
      region,
      ville,
      etablissement,
      universite,
    });

    // Construction de la requête SQL avec filtres
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Filtre par rôle
    if (role && role !== "") {
      whereConditions.push(`u.type_utilisateur = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    // Filtre par statut
    if (statut && statut !== "") {
      whereConditions.push(`u.statut = $${paramIndex}`);
      params.push(statut);
      paramIndex++;
    }

    // Filtre par recherche (nom, prénom, email, téléphone)
    if (search && search.trim() !== "") {
      whereConditions.push(
        `(LOWER(u.nom) LIKE LOWER($${paramIndex}) OR LOWER(u.prenom) LIKE LOWER($${paramIndex}) OR LOWER(u.email) LIKE LOWER($${paramIndex}) OR u.telephone LIKE $${paramIndex})`,
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Filtre par région (pour les étudiants)
    if (region && region !== "") {
      whereConditions.push(`v.id_region = $${paramIndex}`);
      params.push(region);
      paramIndex++;
    }

    // Filtre par ville (pour les étudiants)
    if (ville && ville !== "") {
      whereConditions.push(`et.id_ville = $${paramIndex}`);
      params.push(ville);
      paramIndex++;
    }

    // Filtre par établissement
    if (etablissement && etablissement !== "") {
      whereConditions.push(`e.id_etablissement = $${paramIndex}`);
      params.push(etablissement);
      paramIndex++;
    }

    // Filtre par université (rectorat)
    if (universite && universite !== "") {
      whereConditions.push(`rec.id_rectorat = $${paramIndex}`);
      params.push(universite);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")} AND u.statut != 'INACTIF'`
        : "WHERE u.statut != 'INACTIF'";

    // Requête pour compter le total
    const countQuery = `
      SELECT COUNT(DISTINCT u.numero_utilisateur) as total
      FROM utilisateur u
      LEFT JOIN etudiant et ON u.numero_utilisateur = et.numero_utilisateur
      LEFT JOIN enseignant ens ON u.numero_utilisateur = ens.numero_utilisateur
      LEFT JOIN directeur_etablissement de ON u.numero_utilisateur = de.numero_utilisateur
      LEFT JOIN recteur_universite ru ON u.numero_utilisateur = ru.numero_utilisateur
      LEFT JOIN ville v ON et.id_ville = v.id_ville
      LEFT JOIN region r ON v.id_region = r.id_region
      LEFT JOIN etablissement e ON COALESCE(de.id_etablissement, ens.id_etablissement_principal) = e.id_etablissement
      LEFT JOIN ville v_etab ON e.id_ville = v_etab.id_ville
      LEFT JOIN region r_etab ON v_etab.id_region = r_etab.id_region
      LEFT JOIN rectorat rec ON COALESCE(e.id_rectorat, ru.id_rectorat) = rec.id_rectorat
      ${whereClause}
    `;

    const countResult = await sequelize.query(countQuery, {
      bind: params,
      type: sequelize.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0].total);
    const offset = (page - 1) * limit;

    console.log(
      `Total trouvé: ${total}, Page: ${page}, Limit: ${limit}, Offset: ${offset}`,
    );

    // Requête pour récupérer les utilisateurs
    const query = `
      SELECT DISTINCT
        u.numero_utilisateur,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.sexe,
        u.statut,
        u.type_utilisateur,
        u.date_creation,
        u.derniere_connexion,
        et.numero_etudiant as etudiant_matricule,
        et.filiere as etudiant_filiere,
        et.moyenne_generale as etudiant_moyenne,
        ens.numero_enseignant,
        ens.grade as enseignant_grade,
        ens.specialite as enseignant_specialite,
        COALESCE(v.nom_ville, v_etab.nom_ville) as nom_ville,
        COALESCE(r.nom_region, r_etab.nom_region) as nom_region,
        e.nom_etablissement,
        rec.nom_rectorat
      FROM utilisateur u
      LEFT JOIN etudiant et ON u.numero_utilisateur = et.numero_utilisateur
      LEFT JOIN enseignant ens ON u.numero_utilisateur = ens.numero_utilisateur
      LEFT JOIN directeur_etablissement de ON u.numero_utilisateur = de.numero_utilisateur
      LEFT JOIN recteur_universite ru ON u.numero_utilisateur = ru.numero_utilisateur
      LEFT JOIN ville v ON et.id_ville = v.id_ville
      LEFT JOIN region r ON v.id_region = r.id_region
      LEFT JOIN etablissement e ON COALESCE(de.id_etablissement, ens.id_etablissement_principal) = e.id_etablissement
      LEFT JOIN ville v_etab ON e.id_ville = v_etab.id_ville
      LEFT JOIN region r_etab ON v_etab.id_region = r_etab.id_region
      LEFT JOIN rectorat rec ON COALESCE(e.id_rectorat, ru.id_rectorat) = rec.id_rectorat
      ${whereClause}
      ORDER BY u.date_creation DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);

    const users = await sequelize.query(query, {
      bind: params,
      type: sequelize.QueryTypes.SELECT,
    });

    console.log(`Trouvé ${users.length} utilisateurs sur ${total} total`);
    console.log("Premier utilisateur:", users[0]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
};

// Récupérer les options de filtrage
exports.getFilterOptions = async (req, res) => {
  try {
    // Récupérer les régions
    const regions = await sequelize.query(
      "SELECT id_region, nom_region FROM region ORDER BY nom_region",
      { type: sequelize.QueryTypes.SELECT },
    );

    // Récupérer les villes
    const villes = await sequelize.query(
      "SELECT id_ville, nom_ville, id_region FROM ville ORDER BY nom_ville",
      { type: sequelize.QueryTypes.SELECT },
    );

    // Récupérer les universités (rectorats)
    const universites = await sequelize.query(
      "SELECT id_rectorat, nom_rectorat, type FROM rectorat ORDER BY nom_rectorat",
      { type: sequelize.QueryTypes.SELECT },
    );

    // Récupérer les établissements
    const etablissements = await sequelize.query(
      "SELECT id_etablissement, nom_etablissement, id_rectorat FROM etablissement ORDER BY nom_etablissement",
      { type: sequelize.QueryTypes.SELECT },
    );

    // Types de rôles
    const roles = [
      { value: "ADMIN_MESRS", label: "Administrateur MESRS" },
      { value: "RECTEUR", label: "Recteur" },
      { value: "DIRECTEUR", label: "Directeur" },
      { value: "ENSEIGNANT", label: "Enseignant" },
      { value: "ETUDIANT", label: "Étudiant" },
    ];

    // Statuts
    const statuts = [
      { value: "ACTIF", label: "Actif" },
      { value: "INACTIF", label: "Inactif" },
      { value: "SUSPENDU", label: "Suspendu" },
    ];

    res.json({
      regions,
      villes,
      universites,
      etablissements,
      roles,
      statuts,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des options:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des options",
      error: error.message,
    });
  }
};

// Statistiques des utilisateurs
exports.getUserStats = async (req, res) => {
  try {
    const stats = await sequelize.query(
      `
      SELECT 
        type_utilisateur,
        COUNT(*) as count,
        COUNT(CASE WHEN statut = 'ACTIF' THEN 1 END) as actifs,
        COUNT(CASE WHEN statut = 'INACTIF' THEN 1 END) as inactifs,
        COUNT(CASE WHEN statut = 'SUSPENDU' THEN 1 END) as suspendus
      FROM utilisateur
      GROUP BY type_utilisateur
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    const total = await sequelize.query(
      "SELECT COUNT(*) as total FROM utilisateur",
      { type: sequelize.QueryTypes.SELECT },
    );

    res.json({
      total: parseInt(total[0].total),
      byRole: stats,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};

// Créer un compte Admin
exports.createAdmin = async (req, res) => {
  try {
    const { email, nom, prenom, telephone } = req.body;

    // Vérifier si l'email existe déjà
    const existing = await sequelize.query(
      "SELECT numero_utilisateur FROM utilisateur WHERE email = $1",
      {
        bind: [email],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Générer un mot de passe temporaire
    const crypto = require("crypto");
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Insérer le nouvel admin
    const result = await sequelize.query(
      `INSERT INTO utilisateur (email, mot_de_passe, nom, prenom, telephone, type_utilisateur, statut)
       VALUES ($1, $2, $3, $4, $5, 'ADMIN_MESRS', 'ACTIF')
       RETURNING numero_utilisateur, email, nom, prenom, telephone, type_utilisateur, statut`,
      {
        bind: [email, hashedPassword, nom, prenom, telephone],
        type: sequelize.QueryTypes.INSERT,
      },
    );

    res.status(201).json({
      message: "Compte administrateur créé avec succès",
      user: result[0][0],
      tempPassword,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
    res.status(500).json({
      message: "Erreur lors de la création de l'admin",
      error: error.message,
    });
  }
};

// Créer un compte Directeur
exports.createDirecteur = async (req, res) => {
  try {
    const { email, nom, prenom, telephone, id_etablissement } = req.body;

    // Vérifier si l'email existe déjà
    const existing = await sequelize.query(
      "SELECT numero_utilisateur FROM utilisateur WHERE email = $1",
      {
        bind: [email],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Générer un mot de passe temporaire
    const crypto = require("crypto");
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Insérer le nouveau directeur
    const result = await sequelize.query(
      `INSERT INTO utilisateur (email, mot_de_passe, nom, prenom, telephone, type_utilisateur, statut)
       VALUES ($1, $2, $3, $4, $5, 'DIRECTEUR', 'ACTIF')
       RETURNING numero_utilisateur, email, nom, prenom, telephone, type_utilisateur, statut`,
      {
        bind: [email, hashedPassword, nom, prenom, telephone],
        type: sequelize.QueryTypes.INSERT,
      },
    );

    // Créer l'entrée directeur si id_etablissement est fourni
    if (id_etablissement) {
      await sequelize.query(
        `INSERT INTO directeur (numero_utilisateur, id_etablissement)
         VALUES ($1, $2)`,
        {
          bind: [result[0][0].numero_utilisateur, id_etablissement],
          type: sequelize.QueryTypes.INSERT,
        },
      );
    }

    res.status(201).json({
      message: "Compte directeur créé avec succès",
      user: result[0][0],
      tempPassword,
    });
  } catch (error) {
    console.error("Erreur lors de la création du directeur:", error);
    res.status(500).json({
      message: "Erreur lors de la création du directeur",
      error: error.message,
    });
  }
};

// Modifier un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nom, prenom, telephone } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await sequelize.query(
      "SELECT numero_utilisateur, email FROM utilisateur WHERE numero_utilisateur = $1",
      {
        bind: [id],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si le nouvel email est déjà utilisé
    if (email && email !== user[0].email) {
      const existing = await sequelize.query(
        "SELECT numero_utilisateur FROM utilisateur WHERE email = $1",
        {
          bind: [email],
          type: sequelize.QueryTypes.SELECT,
        },
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: "Email déjà utilisé" });
      }
    }

    // Mettre à jour l'utilisateur
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (email) {
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }
    if (nom) {
      updates.push(`nom = $${paramIndex}`);
      params.push(nom);
      paramIndex++;
    }
    if (prenom) {
      updates.push(`prenom = $${paramIndex}`);
      params.push(prenom);
      paramIndex++;
    }
    if (telephone) {
      updates.push(`telephone = $${paramIndex}`);
      params.push(telephone);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Aucune modification fournie" });
    }

    params.push(id);
    const query = `
      UPDATE utilisateur 
      SET ${updates.join(", ")}
      WHERE numero_utilisateur = $${paramIndex}
      RETURNING numero_utilisateur, email, nom, prenom, telephone, type_utilisateur, statut
    `;

    const result = await sequelize.query(query, {
      bind: params,
      type: sequelize.QueryTypes.UPDATE,
    });

    res.json({
      message: "Utilisateur modifié avec succès",
      user: result[0][0],
    });
  } catch (error) {
    console.error("Erreur lors de la modification de l'utilisateur:", error);
    res.status(500).json({
      message: "Erreur lors de la modification de l'utilisateur",
      error: error.message,
    });
  }
};

// Activer/Désactiver un utilisateur
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const acteurId = req.user.numero_utilisateur;

    // Récupérer le statut actuel
    const user = await sequelize.query(
      "SELECT numero_utilisateur, statut, nom, prenom FROM utilisateur WHERE numero_utilisateur = $1",
      {
        bind: [id],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Basculer le statut
    const newStatus = user[0].statut === "ACTIF" ? "SUSPENDU" : "ACTIF";

    await sequelize.query(
      "UPDATE utilisateur SET statut = $1 WHERE numero_utilisateur = $2",
      {
        bind: [newStatus, id],
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    // Enregistrer dans l'audit
    await auditService.logAction(
      id,
      acteurId,
      newStatus === "ACTIF" ? "ACTIVATION" : "SUSPENSION",
      {
        ancien_statut: user[0].statut,
        nouveau_statut: newStatus,
        nom: user[0].nom,
        prenom: user[0].prenom,
      },
    );

    res.json({
      message: `Utilisateur ${newStatus === "ACTIF" ? "activé" : "suspendu"} avec succès`,
      user: {
        ...user[0],
        statut: newStatus,
      },
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    res.status(500).json({
      message: "Erreur lors du changement de statut",
      error: error.message,
    });
  }
};

// Archiver un utilisateur
exports.archiveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const acteurId = req.user.numero_utilisateur;

    // Vérifier si l'utilisateur existe
    const user = await sequelize.query(
      "SELECT numero_utilisateur, nom, prenom, statut FROM utilisateur WHERE numero_utilisateur = $1",
      {
        bind: [id],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mettre le statut à INACTIF pour archiver
    await sequelize.query(
      "UPDATE utilisateur SET statut = 'INACTIF' WHERE numero_utilisateur = $1",
      {
        bind: [id],
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    // Enregistrer dans l'audit
    await auditService.logAction(id, acteurId, "ARCHIVAGE", {
      ancien_statut: user[0].statut,
      nouveau_statut: "INACTIF",
      nom: user[0].nom,
      prenom: user[0].prenom,
    });

    res.json({
      message: `Utilisateur ${user[0].nom} ${user[0].prenom} archivé avec succès`,
      user: {
        ...user[0],
        statut: "INACTIF",
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'archivage:", error);
    res.status(500).json({
      message: "Erreur lors de l'archivage",
      error: error.message,
    });
  }
};

// Récupérer les utilisateurs archivés
exports.getArchivedUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

    let whereConditions = ["u.statut = 'INACTIF'"];
    let params = [];
    let paramIndex = 1;

    // Filtre par rôle
    if (role && role !== "") {
      whereConditions.push(`u.type_utilisateur = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (search && search.trim() !== "") {
      whereConditions.push(
        `(LOWER(u.nom) LIKE LOWER($${paramIndex}) OR LOWER(u.prenom) LIKE LOWER($${paramIndex}) OR LOWER(u.email) LIKE LOWER($${paramIndex}) OR u.telephone LIKE $${paramIndex})`,
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM utilisateur u
      ${whereClause}
    `;

    const countResult = await sequelize.query(countQuery, {
      bind: params,
      type: sequelize.QueryTypes.SELECT,
    });

    const total = parseInt(countResult[0].total);
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        u.numero_utilisateur,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.type_utilisateur,
        u.date_creation
      FROM utilisateur u
      ${whereClause}
      ORDER BY u.date_creation DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);

    const users = await sequelize.query(query, {
      bind: params,
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des utilisateurs archivés:",
      error,
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs archivés",
      error: error.message,
    });
  }
};

// Restaurer un utilisateur archivé
exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    const acteurId = req.user.numero_utilisateur;

    const user = await sequelize.query(
      "SELECT numero_utilisateur, nom, prenom, statut FROM utilisateur WHERE numero_utilisateur = $1",
      {
        bind: [id],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    await sequelize.query(
      "UPDATE utilisateur SET statut = 'ACTIF' WHERE numero_utilisateur = $1",
      {
        bind: [id],
        type: sequelize.QueryTypes.UPDATE,
      },
    );

    // Enregistrer dans l'audit
    await auditService.logAction(id, acteurId, "RESTAURATION", {
      ancien_statut: user[0].statut,
      nouveau_statut: "ACTIF",
      nom: user[0].nom,
      prenom: user[0].prenom,
    });

    res.json({
      message: `Utilisateur ${user[0].nom} ${user[0].prenom} restauré avec succès`,
      user: {
        ...user[0],
        statut: "ACTIF",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la restauration:", error);
    res.status(500).json({
      message: "Erreur lors de la restauration",
      error: error.message,
    });
  }
};
