# Proyecto Sistema de Gestión Integral de Usuarios para el Laboratorio LINSI

Objetivo General: Desarrollar la interfaz de usuario de un sistema de gestión integral de usuarios (becarios, profesores y personal) para el Laboratorio de Innovaciones en Sistemas de Información (LINSI)

## Instalación

### Opción 1: Instalación local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/usuario/nombre-del-repo.git
   cd nombre-del-repo
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el proyecto en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en:
   ```
   http://localhost:5173
   ```

### Opción 2: Con Docker

1. Asegúrate de tener Docker instalado en tu máquina.
2. Construye la imagen a partir del Dockerfile:
   ```bash
   docker build -t sis-usuarios-dev .
   ```
3. Ejecuta el contenedor mapeando el puerto 3000:
   ```bash
   docker run --rm -d -p 3000:3000 --name sis-usuarios-dev sis-usuarios-dev
   ```
4. Abre tu navegador en:
   ```
   http://localhost:3000
   ```
5. Para detener el contenedor:
   ```bash
   docker stop sis-usuarios-dev
   ```

> **Nota:** Como no se usan volúmenes, cada vez que hagas cambios en el código deberás reconstruir la imagen con `docker build` para reflejar las actualizaciones en el contenedor.

