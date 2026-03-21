-- Fix: Changer le type de colonne pour éviter les problèmes de timezone
-- La colonne doit être TIMESTAMPTZ (timestamp with time zone) au lieu de TIMESTAMP

-- Vérifier le type actuel
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'utilisateur' 
AND column_name = 'reset_token_expiry';

-- Modifier le type de colonne
ALTER TABLE utilisateur 
ALTER COLUMN reset_token_expiry TYPE TIMESTAMPTZ 
USING reset_token_expiry AT TIME ZONE 'UTC';

-- Vérifier après modification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'utilisateur' 
AND column_name = 'reset_token_expiry';

-- Nettoyer les tokens expirés existants
UPDATE utilisateur 
SET reset_token = NULL, reset_token_expiry = NULL 
WHERE reset_token_expiry IS NOT NULL;
