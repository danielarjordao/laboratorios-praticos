import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import transactionRoutes from './src/routes/transactionRoutes.js';
import accountRoutes from './src/routes/accountRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';

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

// Rota de saúde para verificar se a API está operacional
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'success', message: 'API is running in TypeScript!' });
});

// Inicia o servidor na porta definida
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
