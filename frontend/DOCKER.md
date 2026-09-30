# Frontend de AgroCoffee AI en Docker

El contenedor genera la version web estatica del proyecto Expo y la publica con
Nginx. Esta version permite demostrar la contenerizacion del frontend. La
aplicacion Android instalada mediante Expo Go o una APK continua ejecutandose
directamente en el telefono.

## Construccion y ejecucion

Desde la raiz del repositorio:

```bash
docker compose build frontend
docker compose up -d database backend frontend
docker compose ps
```

Abrir <http://localhost:8080> para visualizar el frontend y
<http://localhost:8000/docs> para visualizar la API.

## URL de la API

Docker Compose incorpora `EXPO_PUBLIC_API_URL` durante la compilacion web. Su
valor predeterminado es `http://localhost:8000/api/v1`, porque las solicitudes
se realizan desde el navegador del equipo anfitrion.

Para usar otra API, definir la variable en el archivo `.env` de la raiz y
reconstruir la imagen:

```dotenv
EXPO_PUBLIC_API_URL=https://api.example.com/api/v1
```

```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```
