FROM node:24-alpine

WORKDIR /usr/src/app

# Copia apenas os ficheiros de dependências primeiro
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto do código
COPY . .

# Expõe a porta do servidor
EXPOSE 3000

# Executa o servidor em modo de desenvolvimento com hot-reloading
CMD ["npm", "run", "dev"]
