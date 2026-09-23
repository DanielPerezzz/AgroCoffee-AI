# Simulación IoT de AgroCoffee AI en Wokwi

Este proyecto simula el envío de mediciones desde un ESP32 hacia FastAPI y la
respuesta del modelo de inteligencia artificial.

## Componentes

- ESP32 DevKit v1.
- DHT22 para temperatura y humedad ambiental.
- Potenciómetro para simular la humedad del café.
- Fotoresistencia para luminosidad.
- LED verde para estado favorable.
- LED amarillo para secado lento.
- LED rojo y buzzer para condiciones desfavorables.

## Seguridad

La API key real no se guarda en Git. Copie `config.example.h` como `config.h` y
complete la URL, la clave y los identificadores. Si una clave se expone durante
una demostración pública, rótela desde Swagger al terminar.

## Preparación del backend

1. Inicie los servicios con `docker compose up -d`.
2. Confirme que el proceso indicado en `PROCESS_ID` esté en `EN_PROCESO`.
3. Obtenga la API key al registrar el dispositivo o mediante
   `POST /api/v1/dispositivos/{id}/rotar-clave`.
4. Exponga temporalmente el puerto 8000 mediante una URL HTTPS. Wokwi Web puede
   acceder a internet, pero no a `localhost` ni a la red privada del equipo.
5. Coloque la URL con `/api/v1` en `API_BASE_URL`.

Ejemplo:

```cpp
#define API_BASE_URL "https://ejemplo-temporal.example.com/api/v1"
#define DEVICE_API_KEY "clave-generada-por-agrocoffee"
#define DEVICE_ID 1
#define PROCESS_ID 1
```

## Uso en Wokwi Web

1. Cree un proyecto nuevo de ESP32 en <https://wokwi.com/projects/new/esp32>.
2. Reemplace `sketch.ino`, `diagram.json` y `libraries.txt` con los archivos de
   esta carpeta.
3. Cree `config.h` usando `config.example.h` como base.
4. Inicie la simulación y observe el monitor serial.
5. Modifique los controles del DHT22, el potenciómetro y la fotoresistencia.

Cada diez segundos el ESP32 envía una lectura. La respuesta contiene el estado,
el tiempo restante y la confianza del modelo. Los LEDs representan el resultado:

| Resultado | Salida |
|---|---|
| `FAVORABLE` | LED verde |
| `SECADO_LENTO` | LED amarillo |
| `DESFAVORABLE` | LED rojo y buzzer |
| `COMPLETADO` | LED verde + amarillo y tono corto |

## Nota sobre la conexión

El gateway público gratuito de Wokwi solo admite conexiones salientes hacia
internet y no puede alcanzar servicios locales. Otra alternativa es Wokwi para
VS Code con el gateway privado, pero para una demostración desde el navegador se
debe utilizar una URL pública temporal.
