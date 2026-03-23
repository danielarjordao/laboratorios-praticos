import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente são carregadas automaticamente graças ao "dotenv/config" no início do arquivo.
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

// Exporta a instância do Supabase Client para ser usada em toda a aplicação.
export const supabase = createClient(supabaseUrl, supabaseKey);
