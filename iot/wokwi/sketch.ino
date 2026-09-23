#include <ArduinoJson.h>
#include <DHTesp.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>

#include "config.h"

constexpr char WIFI_SSID[] = "Wokwi-GUEST";
constexpr char WIFI_PASSWORD[] = "";

constexpr int DHT_PIN = 15;
constexpr int COFFEE_HUMIDITY_PIN = 34;
constexpr int LIGHT_PIN = 35;
constexpr int GREEN_LED_PIN = 25;
constexpr int YELLOW_LED_PIN = 26;
constexpr int RED_LED_PIN = 27;
constexpr int BUZZER_PIN = 14;

DHTesp dhtSensor;
unsigned long simulationStartedAt = 0;
unsigned long lastSendAt = 0;

void setOutputs(bool green, bool yellow, bool red) {
  digitalWrite(GREEN_LED_PIN, green ? HIGH : LOW);
  digitalWrite(YELLOW_LED_PIN, yellow ? HIGH : LOW);
  digitalWrite(RED_LED_PIN, red ? HIGH : LOW);
}

void showConnectionError() {
  setOutputs(false, false, true);
  tone(BUZZER_PIN, 700, 250);
}

void showPrediction(const String &state) {
  noTone(BUZZER_PIN);

  if (state == "FAVORABLE") {
    setOutputs(true, false, false);
  } else if (state == "SECADO_LENTO") {
    setOutputs(false, true, false);
  } else if (state == "DESFAVORABLE") {
    setOutputs(false, false, true);
    tone(BUZZER_PIN, 1200, 800);
  } else if (state == "COMPLETADO") {
    setOutputs(true, true, false);
    tone(BUZZER_PIN, 1800, 200);
  } else {
    showConnectionError();
  }
}

void connectWiFi() {
  Serial.print("Conectando a Wokwi-GUEST");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);

  unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");

    if (millis() - startedAt > 15000) {
      Serial.println("\nNo fue posible conectar. Reintentando...");
      WiFi.disconnect();
      delay(1000);
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);
      startedAt = millis();
    }
  }

  Serial.println(" conectado");
  Serial.print("IP simulada: ");
  Serial.println(WiFi.localIP());
}

float readCoffeeHumidity() {
  int rawValue = analogRead(COFFEE_HUMIDITY_PIN);
  return 10.0f + (rawValue / 4095.0f) * 40.0f;
}

float readLightPercentage() {
  int rawValue = analogRead(LIGHT_PIN);
  float percentage = 100.0f - (rawValue / 4095.0f) * 100.0f;
  return constrain(percentage, 0.0f, 100.0f);
}

float simulatedElapsedHours() {
  unsigned long elapsedMilliseconds = millis() - simulationStartedAt;
  return INITIAL_ELAPSED_HOURS
      + static_cast<float>(elapsedMilliseconds) / SIMULATED_HOUR_MS;
}

int postJson(const String &url, const String &payload, String &response) {
  HTTPClient http;
  int statusCode = -1;

  if (url.startsWith("https://")) {
    WiFiClientSecure client;
    client.setInsecure();  // Únicamente para el túnel temporal de demostración.
    if (!http.begin(client, url)) {
      return -1;
    }
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Key", DEVICE_API_KEY);
    http.setTimeout(12000);
    statusCode = http.POST(payload);
    response = http.getString();
    http.end();
    return statusCode;
  }

  WiFiClient client;
  if (!http.begin(client, url)) {
    return -1;
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_API_KEY);
  http.setTimeout(12000);
  statusCode = http.POST(payload);
  response = http.getString();
  http.end();
  return statusCode;
}

void sendMeasurement() {
  TempAndHumidity dhtData = dhtSensor.getTempAndHumidity();
  if (isnan(dhtData.temperature) || isnan(dhtData.humidity)) {
    Serial.println("Error leyendo el DHT22");
    showConnectionError();
    return;
  }

  float coffeeHumidity = readCoffeeHumidity();
  float light = readLightPercentage();
  float elapsedHours = simulatedElapsedHours();

  JsonDocument requestDocument;
  requestDocument["id_proceso"] = PROCESS_ID;
  requestDocument["id_dispositivo"] = DEVICE_ID;
  requestDocument["temperatura"] = round(dhtData.temperature * 100.0f) / 100.0f;
  requestDocument["humedad_ambiental"] = round(dhtData.humidity * 100.0f) / 100.0f;
  requestDocument["humedad_cafe"] = round(coffeeHumidity * 100.0f) / 100.0f;
  requestDocument["luminosidad"] = round(light * 100.0f) / 100.0f;
  requestDocument["tiempo_transcurrido_horas"] = round(elapsedHours * 100.0f) / 100.0f;

  String payload;
  serializeJson(requestDocument, payload);

  Serial.println("\nEnviando medición:");
  serializeJsonPretty(requestDocument, Serial);
  Serial.println();

  String response;
  String endpoint = String(API_BASE_URL) + "/iot/mediciones";
  int statusCode = postJson(endpoint, payload, response);

  Serial.printf("HTTP %d\n", statusCode);
  Serial.println(response);

  if (statusCode != 201) {
    showConnectionError();
    return;
  }

  JsonDocument responseDocument;
  DeserializationError error = deserializeJson(responseDocument, response);
  if (error) {
    Serial.printf("Respuesta JSON inválida: %s\n", error.c_str());
    showConnectionError();
    return;
  }

  String state = responseDocument["prediccion"]["estado_secado"] | "SIN_DATOS";
  float remainingHours =
      responseDocument["prediccion"]["tiempo_restante_horas"] | 0.0f;
  float confidence =
      responseDocument["prediccion"]["nivel_confianza"] | 0.0f;

  Serial.printf(
      "IA: %s | Restante: %.2f h | Confianza: %.2f%%\n",
      state.c_str(),
      remainingHours,
      confidence
  );
  showPrediction(state);
}

void setup() {
  Serial.begin(115200);

  pinMode(COFFEE_HUMIDITY_PIN, INPUT);
  pinMode(LIGHT_PIN, INPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  setOutputs(false, false, false);
  dhtSensor.setup(DHT_PIN, DHTesp::DHT22);
  connectWiFi();

  simulationStartedAt = millis();
  lastSendAt = millis() - SEND_INTERVAL_MS;
  Serial.println("AgroCoffee IoT listo");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (millis() - lastSendAt >= SEND_INTERVAL_MS) {
    lastSendAt = millis();
    sendMeasurement();
  }

  delay(100);
}
