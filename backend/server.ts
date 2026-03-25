import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import transactionRoutes from './src/routes/transactionRoutes.js';
import accountRoutes from './src/routes/accountRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import tagRoutes from './src/routes/tagRoutes.js';
import installmentRoutes from './src/routes/installmentRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import budgetRoutes from './src/routes/budgetRoutes.js';
import goalRoutes from './src/routes/goalRoutes.js';
import recurringRoutes from './src/routes/recurringRoutes.js';
import userSettingsRoutes from './src/routes/userSettingsRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';

// Instância do Express
const app = express();
// Define a porta a partir das variáveis de ambiente ou usa 3000 como default
const port = process.env.PORT || 3000;

// Define os middlewares globais
// CORS para permitir requisições de diferentes origens (ex: frontend Angular)
app.use(cors());
// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Registo das Rotas
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/installments', installmentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/recurring', recurringRoutes);
app.use('/api/v1/user-settings', userSettingsRoutes);
app.use('/api/v1/profiles', profileRoutes);

// Rota de saúde para verificar se a API está operacional
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'success', message: 'API is running in TypeScript!' });
});

app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running in TypeScript! Welcome to the Financial Management API.'
  });
});

// Inicia o servidor na porta definida
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
