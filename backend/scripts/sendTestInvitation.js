const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Charger le template d'invitation
const templatePath = path.join(__dirname, "../templates/invitation-email.html");
let htmlTemplate = fs.readFileSync(templatePath, "utf8");

// Remplacer les variables
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

htmlTemplate = htmlTemplate
  .replace(/{{PRENOM}}/g, "Ghofrane")
  .replace(/{{NOM}}/g, "Sebteoui")
  .replace(/{{EMAIL}}/g, "ghofranesebteoui16@gmail.com")
  .replace(/{{ROLE_EMOJI}}/g, "👨‍🎓")
  .replace(/{{ROLE_TITLE}}/g, "Espace Étudiant")
  .replace(/{{FRONTEND_URL}}/g, frontendUrl)
  .replace(/{{BADGE_BG}}/g, "rgba(6,214,160,0.12)")
  .replace(/{{BADGE_COLOR}}/g, "#065F46")
  .replace(/{{BADGE_BORDER}}/g, "rgba(6,214,160,0.3)")
  .replace(/{{BADGE_LABEL}}/g, "ACCÈS ÉTUDIANT");

// Remplacer les bénéfices
const benefits = `
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;">
  <tr>
    <td class="benefit-text" style="vertical-align:middle; font-size:14px; color:#2d3436; line-height:1.6;">
      <strong style="color:#1a3a6b;">1.</strong> Suivi de votre parcours académique en temps réel
    </td>
  </tr>
</table>
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;">
  <tr>
    <td class="benefit-text" style="vertical-align:middle; font-size:14px; color:#2d3436; line-height:1.6;">
      <strong style="color:#1a3a6b;">2.</strong> Consultation de vos notes et résultats
    </td>
  </tr>
</table>
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;">
  <tr>
    <td class="benefit-text" style="vertical-align:middle; font-size:14px; color:#2d3436; line-height:1.6;">
      <strong style="color:#1a3a6b;">3.</strong> Gestion de vos inscriptions
    </td>
  </tr>
</table>
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;">
  <tr>
    <td class="benefit-text" style="vertical-align:middle; font-size:14px; color:#2d3436; line-height:1.6;">
      <strong style="color:#1a3a6b;">4.</strong> Accès à vos documents administratifs
    </td>
  </tr>
</table>
<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td class="benefit-text" style="vertical-align:middle; font-size:14px; color:#2d3436; line-height:1.6;">
      <strong style="color:#1a3a6b;">5.</strong> Communication directe avec votre établissement
    </td>
  </tr>
</table>
`;

htmlTemplate = htmlTemplate.replace(/{{BENEFITS}}/g, benefits);

// Envoyer l'email
const sendTestEmail = async () => {
  const mailOptions = {
    from: `"SIAPET" <${process.env.SMTP_USER}>`,
    to: "ghofranesebteoui16@gmail.com",
    subject: "Invitation SIAPET - Espace Étudiant",
    html: htmlTemplate,
  };

  try {
    console.log("📧 Envoi de l'email de test...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé avec succès!");
    console.log("📬 Message ID:", info.messageId);
    console.log("📨 Destinataire:", "ghofranesebteoui16@gmail.com");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi:", error.message);
    console.error("Détails:", error);
  }
};

sendTestEmail();
