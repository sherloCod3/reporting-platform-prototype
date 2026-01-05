FROM node:20

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Modo desenvolvimento (hot reload)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]