/**
 * Exemple d'utilisation des classes CSS globales
 * Ce fichier montre comment utiliser les classes utilitaires
 * pour respecter les principes KISS et DRY
 */

import { Box, Typography } from '@mui/material';

export function ExampleUsage() {
  return (
    <div className="container">
      {/* Utilisation des classes utilitaires pour le layout */}
      <Box className="flex flex-col gap-md p-lg">
        <Typography variant="h4" className="text-center font-bold mb-lg">
          Exemple d'utilisation des classes CSS
        </Typography>

        {/* Card avec classes utilitaires */}
        <div className="card card-hover">
          <Typography className="text-lg font-semibold mb-sm">
            Titre de la carte
          </Typography>
          <Typography className="text-base text-gray-600">
            Contenu de la carte avec classes utilitaires
          </Typography>
        </div>

        {/* Boutons avec classes */}
        <div className="flex gap-md">
          <button className="btn btn-primary">
            Bouton Primaire
          </button>
          <button className="btn btn-secondary">
            Bouton Secondaire
          </button>
        </div>

        {/* Grid avec classes */}
        <div className="grid grid-cols-3 gap-md mt-lg">
          <div className="card">Item 1</div>
          <div className="card">Item 2</div>
          <div className="card">Item 3</div>
        </div>
      </Box>
    </div>
  );
}

/**
 * Avantages des classes utilitaires :
 * 
 * 1. KISS (Keep It Simple, Stupid)
 *    - Classes simples et claires
 *    - Pas de logique complexe
 *    - Facile à comprendre
 * 
 * 2. DRY (Don't Repeat Yourself)
 *    - Réutilisation des styles
 *    - Pas de duplication
 *    - Maintenance facilitée
 * 
 * 3. Performance
 *    - CSS global chargé une fois
 *    - Pas de styles inline répétés
 *    - Cache navigateur efficace
 * 
 * 4. Maintenabilité
 *    - Modification centralisée
 *    - Cohérence visuelle
 *    - Évolutivité
 */
