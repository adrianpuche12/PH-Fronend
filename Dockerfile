# Etapa 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Copia los archivos de dependencias e instala solo lo necesario
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copia el resto del código fuente
COPY . .

# Construye la aplicación
RUN npm run build

# Etapa 2: Producción con Nginx
FROM nginx:alpine

# Copia los archivos de la aplicación compilada
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configuración de Nginx (corrige la ruta a tu archivo local)
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

# Inicia Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]