const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '50mb' }));

let browserInstance;

async function getBrowser() {
    if (!browserInstance) {
        console.log('Initialisation de l\'instance globale du navigateur Puppeteer...');
        browserInstance = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        browserInstance.on('disconnected', () => {
            console.log('Navigateur Puppeteer déconnecté. Relance à la prochaine requête.');
            browserInstance = null;
        });
    }
    return browserInstance;
}

app.post('/', async (req, res) => {
    const payload = req.body;

    if (!payload || !payload.mainHtml || !payload.headerHtml || !payload.footerHtml) {
        return res.status(400).send('Erreur : Payload JSON invalide. Les champs mainHtml, headerHtml, et footerHtml sont requis.');
    }

    let page = null;
    try {
        const browser = await getBrowser();
        page = await browser.newPage();

        await page.setContent(payload.mainHtml, { waitUntil: 'networkidle0' });
        
        // On récupère les options PDF envoyées depuis Apps Script
        const pdfOptions = payload.pdfOptions || {};

        const pdfBuffer = await page.pdf({
            ...pdfOptions, // On applique toutes les options reçues (format, landscape, margin)
            
            // On s'assure que les templates sont bien utilisés
            displayHeaderFooter: true,
            headerTemplate: payload.headerHtml,
            footerTemplate: payload.footerHtml,
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        res.status(500).send(`Erreur serveur : ${error.message}`);
    } finally {
        if (page) {
            await page.close();
        }
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Serveur PDF démarré et à l'écoute sur le port ${PORT}`);
});
