# Partir d'une image Node.js complète pour une meilleure compatibilité
FROM node:22

# Installer les dépendances système requises par Puppeteer/Chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    --fix-missing && \
    rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /usr/src/app

# === ÉTAPE CLÉ N°1 : DÉFINIR LE RÉPERTOIRE DU CACHE ===
# On dit à Puppeteer d'utiliser un sous-dossier local pour le cache.
# Cet ENV sera utilisé à la fois pour l'installation (build) et l'exécution (runtime).
ENV PUPPETEER_CACHE_DIR=/usr/src/app/.cache/puppeteer

# Installer les dépendances npm
COPY package*.json ./
RUN npm install

# === ÉTAPE CLÉ N°2 : INSTALLER LE NAVIGATEUR ===
# En utilisant l'ENV ci-dessus, le navigateur sera installé dans /usr/src/app/.cache/puppeteer
RUN npx puppeteer browsers install chrome

# Copier le reste du code de l'application
COPY index.js ./

# === ÉTAPE CLÉ N°3 : GÉRER LES PERMISSIONS ===
# Créer un utilisateur non-root pour l'exécution de l'application
RUN useradd -m nodeuser
# Donner la propriété de tout le répertoire de l'application à cet utilisateur
RUN chown -R nodeuser:nodeuser /usr/src/app

# Changer l'utilisateur pour l'exécution
USER nodeuser

# Lancer le serveur
CMD ["node", "index.js"]