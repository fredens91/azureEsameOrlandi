import axios from 'axios';
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';
import { visionModel } from './azure.model';

const computerVisionKey = '7073a72433844cc6b2bc11e1634511f1';
const computerVisionEndpoint = 'https://serviziocognitivobobtv.cognitiveservices.azure.com/';

const translatorKey = '53f9cb70915b44659c1698eb516fd80f';
const translatorEndpoint = 'https://api.cognitive.microsofttranslator.com';
const translatorRegion = 'switzerlandnorth';

const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': computerVisionKey } }),
    computerVisionEndpoint
);

const translateText = async (text: string, targetLanguages: string[]) => {
    try {
        const response = await axios.post(
            `${translatorEndpoint}/translate`,
            [{ Text: text }],
            {
                params: {
                    'api-version': '3.0',
                    to: targetLanguages.join(',')
                },
                headers: {
                    'Ocp-Apim-Subscription-Key': translatorKey,
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Region': translatorRegion
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(`Errore nella traduzione del testo: ${(error as any).message}`);
    }
};

export const analyzeAndTranslateImages = async (languages: string[], imageFiles: string[]) => {
    for (const fileName of imageFiles) {
        const imageUrl = `https://testbobphp2.altervista.org/verifica_azure/${fileName}`;

        try {
            const analysis = await computerVisionClient.analyzeImage(imageUrl, {
                visualFeatures: ['Description', 'Tags']
            });

            const descriptionText = analysis.description?.captions?.[0]?.text || 'Nessuna descrizione disponibile';
            const tags = (analysis.tags || []).map(tag => tag.name);

            const translatedDescriptions = await translateText(descriptionText, languages);
            if (!translatedDescriptions || translatedDescriptions.length === 0) {
                throw new Error('Errore nella traduzione della descrizione.');
            }

            const translatedTags = await Promise.all(tags.map(async tag => {
                try {
                    const translations = await translateText(tag!, languages);
                    return translations;
                } catch {
                    console.warn(`Non è stato possibile tradurre il tag "${tag}"`);
                    return [];
                }
            }));

            for (const lang of languages) {
                const descriptionTranslation = translatedDescriptions[0]?.translations.find((t: any) => t.to === lang)?.text || '';
                const tagTranslations = translatedTags.map(t => t[0]?.translations.find((tr: any) => tr.to === lang)?.text || '');

                if (!descriptionTranslation) {
                    console.warn(`Manca la traduzione per la descrizione nella lingua "${lang}"`);
                }

                const imageAnalysisRecord = new visionModel({
                    fileName,
                    language: lang,
                    description: descriptionTranslation,
                    tags: tagTranslations
                });

                await imageAnalysisRecord.save();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '';
            if (errorMessage.includes('400')) {
                console.error(`Richiesta non valida per il servizio di traduzione. Lingua non supportata o inesistente. Errore 400`);
                throw new Error('Richiesta non valida per il servizio di traduzione. Lingua non supportata o inesistente. Errore 400');
            } else {
                console.error(`Si è verificato un problema durante l'analisi dell'immagine ${fileName}:`, error);
                const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
                if (errorMessage.includes('Image URL is not accessible')) {
                    console.error(`L'URL dell'immagine non è accessibile. Errore 404`);
                    throw new Error(`L'URL dell'immagine non è accessibile. Errore 404`);
                } else {
                    console.error(`Si è verificato un errore imprevisto durante l'analisi dell'immagine ${fileName}`);
                    throw new Error(`Si è verificato un errore imprevisto durante l'analisi dell'immagine ${fileName}`);
                }
            }
        }
    }
};
