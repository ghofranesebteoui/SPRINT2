const express = require("express");
const router = express.Router();

// Switch between mock and real controller
const USE_DATABASE = process.env.USE_DATABASE === "true";
const userController = USE_DATABASE
  ? require("../controllers/userController")
  : require("../controllers/userController.mock");

const { authenticate, isAdmin } = require("../middleware/auth");

// Routes pour la gestion des utilisateurs
router.get("/", authenticate, isAdmin, userController.getAllUsers);

router.post("/", authenticate, isAdmin, userController.createUser);

router.get(
  "/filter-options",
  authenticate,
  isAdmin,
  userController.getFilterOptions,
);

router.get("/stats", authenticate, isAdmin, userController.getUserStats);

router.post("/admin", authenticate, isAdmin, userController.createAdmin);

router.post(
  "/directeur",
  authenticate,
  isAdmin,
  userController.createDirecteur,
);

router.put("/:id", authenticate, isAdmin, userController.updateUser);

router.patch(
  "/:id/toggle-status",
  authenticate,
  isAdmin,
  userController.toggleUserStatus,
);

router.patch("/:id/archive", authenticate, isAdmin, userController.archiveUser);

router.get("/archived", authenticate, isAdmin, userController.getArchivedUsers);

router.patch("/:id/restore", authenticate, isAdmin, userController.restoreUser);

module.exports = router;
