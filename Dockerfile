# Étape 1: Utiliser une image Node.js officielle
FROM node:18-alpine

# Étape 2: Définir le répertoire de travail
WORKDIR /app

# Étape 3: Copier les fichiers package.json et package-lock.json
COPY package.json package-lock.json ./

# Étape 4: Installer les dépendances de production
RUN npm install --omit=dev

# Étape 5: Copier tous les fichiers du projet
COPY . .

# Étape 6: Construire le projet TypeScript
RUN npm run build

# Étape 7: Exposer le port (modifie selon ton besoin)
EXPOSE 8000

# Étape 8: Démarrer l'application
CMD ["node", "app.js"]
