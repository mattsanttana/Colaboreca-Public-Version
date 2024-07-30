# Usar a imagem node:16.14-alpine como base
FROM node:16.14-alpine

# Instalar python e outras dependências necessárias para compilar o módulo canvas
RUN apk add --update --no-cache python3 make g++ \
    cairo-dev jpeg-dev pango-dev giflib-dev

# Mudar para o diretório de trabalho /app-frontend
WORKDIR /app-frontend

# Copiar os package.json e package-lock.json para o container
COPY package*.json ./

# Instalar as dependências Node
RUN npm install

# Copiar o restante dos arquivos da aplicação para o container
COPY . .

# Sinalize que a aplicação expõe a porta 3000
EXPOSE 3000

# Configurar os comandos para iniciar a aplicação de acordo com as boas práticas
CMD ["npm", "start"]