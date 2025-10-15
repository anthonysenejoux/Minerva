const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

// Autorise la réception de corps de requête volumineux (le HTML du PDF)
app.use(express.text({ limit: '50mb' }));

// Variable globale pour stocker l'instance du navigateur et la réutiliser
let browserInstance;

/**
 * Initialise et retourne une instance unique du navigateur Puppeteer.
 * Cette optimisation est cruciale pour les performances.
 * @returns {Promise<import('puppeteer').Browser>} L'instance du navigateur.
 */
async function getBrowser() {
    if (!browserInstance) {
        console.log('Initialisation de l\'instance globale du navigateur Puppeteer...');
        browserInstance = await puppeteer.launch({
            headless: true,
            // Pas besoin de 'executablePath' car le Dockerfile configure
            // l'environnement pour que Puppeteer trouve le navigateur.
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        // Gère le cas où le navigateur se fermerait de manière inattendue
        browserInstance.on('disconnected', () => {
            console.log('Le navigateur Puppeteer a été déconnecté. Il sera relancé à la prochaine requête.');
            browserInstance = null;
        });
    }
    return browserInstance;
}

// Point de terminaison (endpoint) pour la génération de PDF
app.post('/', async (req, res) => {
    const htmlContent = req.body;

    // Validation simple de la requête
    if (!htmlContent) {
        return res.status(400).send('Erreur : Le contenu HTML est manquant.');
    }

    let page = null;
    try {
        // Récupère l'instance partagée du navigateur
        const browser = await getBrowser();
        // Crée une nouvelle page (opération très rapide)
        page = await browser.newPage();

        // Charge le HTML dans la page
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Génère le PDF
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        
        // Envoie la réponse avec le bon type de contenu
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        res.status(500).send(`Erreur serveur : ${error.message}`);
    } finally {
        // Ferme uniquement la page, jamais le navigateur !
        if (page) {
            await page.close();
        }
    }
});

// Le serveur écoute sur le port fourni par Cloud Run (ou 8080 par défaut)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Serveur PDF démarré et à l'écoute sur le port ${PORT}`);
});