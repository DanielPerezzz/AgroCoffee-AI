#pragma once

// URL pública temporal del backend, sin barra final.
// Wokwi Web no puede acceder directamente a localhost.
#define API_BASE_URL "https://TU-DOMINIO-TEMPORAL.example.com/api/v1"

// Clave obtenida al registrar o rotar la clave del dispositivo.
#define DEVICE_API_KEY "REEMPLAZAR_CON_API_KEY"

// Identificadores existentes en PostgreSQL.
#define DEVICE_ID 1
#define PROCESS_ID 1

// La simulación suma una hora por cada 10 segundos transcurridos.
#define INITIAL_ELAPSED_HOURS 36.0
#define SIMULATED_HOUR_MS 10000UL
#define SEND_INTERVAL_MS 10000UL
