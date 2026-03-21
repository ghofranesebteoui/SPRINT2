const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const etablissementRoutes = require("./routes/etablissements");
const departementRoutes = require("./routes/departements");
const etudiantRoutes = require("./routes/etudiant");
const profileRoutes = require("./routes/profile");
const demandesAccesRoutes = require("./routes/demandesAcces");
const invitationRoutes = require("./routes/invitations");
const auditRoutes = require("./routes/audit");

const app = express();
const server = http.createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

// Rendre io accessible globalement
global.io = io;

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
  // Rejoindre une room selon le rôle
  socket.on("join-role", (role) => {
    socket.join(role);
  });

  // Quitter une room (cleanup)
  socket.on("leave-role", (role) => {
    socket.leave(role);
  });

  socket.on("disconnect", () => {
    // Client disconnected
  });
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/etablissements", etablissementRoutes);
app.use("/api/departements", departementRoutes);
app.use("/api/etudiant", etudiantRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/demandes-acces", demandesAccesRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/audit", auditRoutes);

// Health check
app.get("/health", (req, res) => {
  const useDatabase = process.env.USE_DATABASE === "true";
  res.json({
    status: "OK",
    message: "SIAPET API is running",
    mode: useDatabase ? "production" : "development",
    database: useDatabase ? "PostgreSQL" : "Mock Data",
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
const USE_DATABASE = process.env.USE_DATABASE === "true";

if (USE_DATABASE) {
  // Mode avec base de données
  const { sequelize } = require("./models");

  sequelize
    .authenticate()
    .then(() => {
      console.log("Connexion à la base de données réussie");
      server.listen(PORT);
    })
    .catch((err) => {
      console.error("❌ Connexion à la base de données échouée:", err.message);
      process.exit(1);
    });
} else {
  // Mode sans base de données (mock)
  server.listen(PORT);
}
