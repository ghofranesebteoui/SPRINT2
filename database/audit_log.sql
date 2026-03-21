-- Table pour l'historique et la traçabilité des actions
CREATE TABLE IF NOT EXISTS audit_log (
    id_audit SERIAL PRIMARY KEY,
    numero_utilisateur_cible VARCHAR(50) NOT NULL,
    numero_utilisateur_acteur VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (numero_utilisateur_cible) REFERENCES utilisateur(numero_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (numero_utilisateur_acteur) REFERENCES utilisateur(numero_utilisateur) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX idx_audit_cible ON audit_log(numero_utilisateur_cible);
CREATE INDEX idx_audit_acteur ON audit_log(numero_utilisateur_acteur);
CREATE INDEX idx_audit_date ON audit_log(date_action);
CREATE INDEX idx_audit_action ON audit_log(action);

-- Commentaires
COMMENT ON TABLE audit_log IS 'Historique de toutes les actions effectuées sur les utilisateurs';
COMMENT ON COLUMN audit_log.numero_utilisateur_cible IS 'Utilisateur sur lequel l''action a été effectuée';
COMMENT ON COLUMN audit_log.numero_utilisateur_acteur IS 'Utilisateur qui a effectué l''action';
COMMENT ON COLUMN audit_log.action IS 'Type d''action: CREATION, MODIFICATION, ARCHIVAGE, RESTAURATION, SUSPENSION, ACTIVATION, SUPPRESSION';
COMMENT ON COLUMN audit_log.details IS 'Détails de l''action en JSON';
