# 1. Usa una imagen ligera de Node
FROM node:18-alpine

# 2. Crea y establece el directorio de trabajo
WORKDIR /app

# 3. Copia package.json y package-lock.json, e instala dependencias
COPY package*.json ./
RUN npm ci

# 4. Copia el resto del código
COPY . .

# 5. Define variables de entorno para que react-scripts escuche correctamente
ENV PORT=3000
ENV HOST=0.0.0.0

# 6. Expone el puerto 3000
EXPOSE 3000

# 7. Arranca la aplicación en modo desarrollo
CMD ["npm", "start"]