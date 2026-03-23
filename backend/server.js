import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

// Instância do Express
const app = express();
// Se o PORT não estiver definido, a aplicação irá usar a porta 3000 por padrão
const port = process.env.PORT || 3000;

// Middleware para permitir CORS (Cross-Origin Resource Sharing)
// e para processar JSON no corpo das requisições
app.use(cors());
app.use(express.json());

// Variáveis de ambiente para a URL e chave do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Criação do cliente Supabase usando as variáveis de ambiente
export const supabase = createClient(supabaseUrl, supabaseKey);

// Rota de teste para verificar se a API está funcionando corretamente
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running and ready' });
});

// Inicia o servidor e escuta na porta definida
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
