# Imagen base con Node 22 Alpine
FROM node:22-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite (por defecto 5173)
EXPOSE 5173

# Comando por defecto: ejecutar Vite en modo dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
