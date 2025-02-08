# Etapa 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Copia los archivos de dependencias e instala solo lo necesario
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copia el resto del código fuente
COPY . .

# Construye la aplicación (verifica que este comando genere la carpeta "build")
RUN npm run build && ls -l /app

# Comando de depuración: lista el contenido de /app para confirmar que se creó la carpeta "build"
RUN ls -la /app

# Etapa 2: Producción con Nginx
FROM nginx:alpine

# Copia la carpeta generada en la etapa de build a la ubicación de Nginx
# Nota: si tu build genera los archivos en una carpeta distinta (por ejemplo, "dist"), cambia "/app/build" por "/app/dist"
COPY --from=build /app/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Inicia Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
