# 1. Image Node officielle LTS
FROM node:lts

# 2. Répertoire de travail dans le conteneur
WORKDIR /app

# 3. Copier package.json en premier (optimisation cache Docker)
COPY package*.json ./

# 4. Installer les dépendances
RUN npm install

# 5. Copier le reste du code
COPY . .

# 6. Lancer le serveur
CMD ["npx", "nodemon", "--ext", "ts-node", "src/index.ts"]