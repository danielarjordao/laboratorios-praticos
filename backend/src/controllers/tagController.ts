import type { Request, Response } from 'express';
import * as tagService from '../services/tagService.js';
import type { CreateTagDTO } from '../services/tagService.js';

// Cria uma nova Tag validando os campos obrigatórios.
export const createTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateTagDTO;

        // Validação de Defesa (Fail-Fast)
        if (!body.name || !body.profile_id) {
            res.status(400).json({
                status: 'error',
                message: 'Missing required fields: name, profile_id.'
            });
            return;
        }

        const newTag = await tagService.createTag(body);

        res.status(201).json({
            status: 'success',
            data: newTag
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error creating tag';
        console.error('[TagController Create Error]:', message);
        res.status(400).json({ status: 'error', message });
    }
};

// Lista as tags de um perfil (via query params).
export const readTags = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id } = req.query;

        if (!profile_id || typeof profile_id !== 'string') {
            res.status(400).json({ status: 'error', message: 'Invalid or missing profile_id.' });
            return;
        }

        const tags = await tagService.readTags(profile_id);
        res.status(200).json({
            status: 'success',
            results: tags.length,
            data: tags
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error fetching tags';
        res.status(400).json({ status: 'error', message });
    }
};

/**
 * Atualiza uma tag existente (PATCH/PUT).
 */
export const updateTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const body = req.body as Partial<CreateTagDTO>;

        if (!id) {
            res.status(400).json({ status: 'error', message: 'Tag ID is required.' });
            return;
        }

        const updated = await tagService.updateTag(id, body);
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error updating tag';
        res.status(400).json({ status: 'error', message });
    }
};

// Remove uma tag (Soft Delete).
export const deleteTag = async (req: Request, res: Response): Promise<void> => {
    try {
        // Força o 'id' a ser tratado como string
        const id = req.params.id as string;

        if (!id || id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid tag ID.' });
            return;
        }

        await tagService.deleteTag(id);
        res.status(200).json({ status: 'success', message: 'Tag removed successfully.' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error deleting tag';
        res.status(400).json({ status: 'error', message });
    }
};
