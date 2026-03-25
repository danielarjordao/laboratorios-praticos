FROM node:24-alpine

# Define o diretório de trabalho dentro do contentor
WORKDIR /usr/src/app

# Copia os ficheiros de dependências para o contentor
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante código do projeto para o contentor
COPY . .

# Expõe a porta 4200 para o Angular
EXPOSE 4200

# O Angular por defeito só expõe para localhost.
# O --host 0.0.0.0 permite que o contentor exponha a porta para o exterior, permitindo o acesso ao frontend a partir do host.
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
