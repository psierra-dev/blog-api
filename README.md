# Blog API

Una API para gestionar blogs, desarrollada con Node.js y Express. Este proyecto incluye el manejo de la base de datos MongoDB y la implementación de pruebas.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías Usadas](#tecnologías-usadas)
- [Instalación](#instalación)
- [Uso](#uso)
- [Pruebas](#pruebas)
- [Estado del Proyecto](#estado-del-proyecto)
## Descripción

Esta API permite la gestión de blogs mediante operaciones CRUD (Crear, Leer, Actualizar, Eliminar). Fue desarrollada con Node.js y Express, utilizando MongoDB como base de datos. Además, se han implementado pruebas para asegurar la funcionalidad del sistema.

## Tecnologías Usadas

- Node.js
- Express
- MongoDB
- Mongoose
- Node:test (para pruebas)
- Supertest (para pruebas de integración)

## Instalación

Sigue estos pasos para instalar y configurar el proyecto:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/psierra-dev/blog-api.git
   cd blog-api
2. Instala las dependencias:
    ```bash
    npm install

3. Configura las variables de entorno:
  Crea un archivo .env en la raíz del proyecto con las siguientes variables:
    ```bash
    MONGODB_URI=mongodb://localhost/blog_api
    TEST_MONGODB_URI=mongodb://localhost/test_blog_api
    SECRET_JWT=your_secret_key
    
## Uso

Para iniciar el servidor, usa el siguiente comando:
```bash
npm start
```

## Pruebas

Para ejecutar las pruebas, utiliza:
```bash
npm test
```

## Estado del Proyecto

El proyecto está en desarrollo y se actualiza activamente.
