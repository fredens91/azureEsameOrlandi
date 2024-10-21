import { Request, Response } from 'express';
import { analyzeAndTranslateImages } from '../azure/azure.service';

export const analyzeImageController = async (req: Request, res: Response) => {
    const { languages, imageFiles } = req.body;

    if (!languages || !Array.isArray(languages) || languages.length === 0) {
        return res.status(400).json({ error: 'È necessario fornire un elenco di lingue, che deve essere un array non vuoto.' });
    }

    if (!imageFiles || !Array.isArray(imageFiles) || imageFiles.length === 0) {
        return res.status(400).json({ error: 'È necessario fornire un elenco di file immagine, che deve essere un array non vuoto.' });
    }

    try {
        await analyzeAndTranslateImages(languages, imageFiles);
        res.json({ message: 'L\'analisi e la traduzione delle immagini sono state completate con successo.' });
    } catch (error) {
        res.status(500).json({ error: (error as any).message || 'Si è verificato un errore imprevisto durante l\'analisi delle immagini.' });
    }
};
