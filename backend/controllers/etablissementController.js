const { Etablissement } = require("../models");
const { Op } = require("sequelize");

// M3-US01: Ajouter un établissement
exports.createEtablissement = async (req, res) => {
  try {
    const {
      code_etablissement,
      nom,
      type,
      ville,
      region,
      adresse,
      telephone,
      email,
      site_web,
      budget_alloue,
    } = req.body;

    const existing = await Etablissement.findOne({
      where: {
        [Op.or]: [{ nom }, { code_etablissement }],
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Un établissement avec ce nom ou code existe déjà",
      });
    }

    const etablissement = await Etablissement.create({
      code_etablissement,
      nom,
      type,
      ville,
      region,
      adresse,
      telephone,
      email,
      site_web,
      budget_alloue,
    });

    res.status(201).json({
      message: "Établissement créé",
      etablissement,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// M3-US02: Consulter les établissements
exports.getEtablissements = async (req, res) => {
  try {
    const { search, type, ville, page = 1, limit = 10 } = req.query;

    const where = { actif: true };
    if (type) where.type = type;
    if (ville) where.ville = ville;
    if (search) {
      where[Op.or] = [
        { nom: { [Op.iLike]: `%${search}%` } },
        { code_etablissement: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const etablissements = await Etablissement.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [["nom", "ASC"]],
    });

    res.json({
      etablissements: etablissements.rows,
      total: etablissements.count,
      page: parseInt(page),
      totalPages: Math.ceil(etablissements.count / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// M3-US03: Modifier un établissement
exports.updateEtablissement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      type,
      ville,
      region,
      adresse,
      telephone,
      email,
      site_web,
      budget_alloue,
    } = req.body;

    const etablissement = await Etablissement.findByPk(id);
    if (!etablissement) {
      return res.status(404).json({ message: "Établissement non trouvé" });
    }

    await etablissement.update({
      nom,
      type,
      ville,
      region,
      adresse,
      telephone,
      email,
      site_web,
      budget_alloue,
    });

    res.json({ message: "Établissement modifié", etablissement });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// M3-US04: Archiver un établissement
exports.archiveEtablissement = async (req, res) => {
  try {
    const { id } = req.params;

    const etablissement = await Etablissement.findByPk(id);
    if (!etablissement) {
      return res.status(404).json({ message: "Établissement non trouvé" });
    }

    etablissement.actif = false;
    await etablissement.save();

    res.json({ message: "Établissement archivé", etablissement });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
