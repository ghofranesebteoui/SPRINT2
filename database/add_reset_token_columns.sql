-- Migration: Ajouter les colonnes pour la réinitialisation de mot de passe
-- Date: 2026-03-21

-- Vérifier si les colonnes existent déjà avant de les ajouter
DO $$ 
BEGIN
    -- Ajouter reset_token si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateur' 
        AND column_name = 'reset_token'
    ) THEN
        ALTER TABLE utilisateur 
        ADD COLUMN reset_token VARCHAR(255);
        RAISE NOTICE 'Colonne reset_token ajoutée';
    ELSE
        RAISE NOTICE 'Colonne reset_token existe déjà';
    END IF;

    -- Ajouter reset_token_expiry si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateur' 
        AND column_name = 'reset_token_expiry'
    ) THEN
        ALTER TABLE utilisateur 
        ADD COLUMN reset_token_expiry TIMESTAMP;
        RAISE NOTICE 'Colonne reset_token_expiry ajoutée';
    ELSE
        RAISE NOTICE 'Colonne reset_token_expiry existe déjà';
    END IF;
END $$;

-- Vérification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'utilisateur' 
AND column_name IN ('reset_token', 'reset_token_expiry')
ORDER BY column_name;
