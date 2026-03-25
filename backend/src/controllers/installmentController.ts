import type { Request, Response } from 'express';
import * as installmentService from '../services/installmentService.js';
import * as accountService from '../services/accountService.js';

export const createInstallmentPlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;

        // Cria o plano e as N transações
        const plan = await installmentService.createInstallmentPlan(data);

        // Calcula o valor da primeira parcela (a que entra como COMPLETED)
        const firstInstallmentAmount = Number((data.total_amount / data.installments).toFixed(2));

        // Desconta APENAS a primeira parcela do saldo da conta
        // Assumindo que o parcelamento é sempre uma despesa (DEBIT)
        await accountService.updateAccountBalance(
            data.account_id,
            firstInstallmentAmount,
            'DEBIT'
        );

        res.status(201).json({
            status: 'success',
            message: `Installment plan created with ${data.installments} transactions.`,
            data: plan
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const readInstallmentPlans = async (req: Request, res: Response): Promise<void> => {
    try {
        const profileId = req.query.profile_id as string;
        if (!profileId) throw new Error('profile_id is required');

        const plans = await installmentService.readInstallmentPlans(profileId);
        res.status(200).json({ status: 'success', data: plans });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const updateInstallmentPlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { description } = req.body;

        const updatedPlan = await installmentService.updateInstallmentPlan(id, description);
        res.status(200).json({ status: 'success', data: updatedPlan });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const deleteInstallmentPlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        await installmentService.deleteInstallmentPlan(id);
        res.status(200).json({ status: 'success', message: 'Installment plan cancelled successfully' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};
