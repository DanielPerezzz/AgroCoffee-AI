from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
import re
import unicodedata


@dataclass(frozen=True)
class ChatSnapshot:
    process_id: int
    process_status: str
    measurement_id: int | None = None
    measurement_date: datetime | None = None
    temperature: Decimal | None = None
    ambient_humidity: Decimal | None = None
    coffee_humidity: Decimal | None = None
    light: Decimal | None = None
    elapsed_hours: Decimal | None = None
    drying_status: str | None = None
    remaining_hours: Decimal | None = None
    confidence: Decimal | None = None
    recommendation: str | None = None
    model_version: str | None = None
    pending_alerts: int = 0
    latest_alert: str | None = None
    coffee_humidity_change: Decimal | None = None


@dataclass(frozen=True)
class ChatAnswer:
    text: str
    intent: str
    suggestions: list[str]


DEFAULT_SUGGESTIONS = [
    "¿Cómo está mi secado?",
    "¿Por qué tiene ese estado?",
    "¿Cuánto tiempo falta?",
    "¿Qué debo hacer?",
]


def _normalize(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value.lower())
    without_accents = "".join(
        character
        for character in normalized
        if not unicodedata.combining(character)
    )
    return re.sub(r"[^a-z0-9]+", " ", without_accents).strip()


def _contains(message: str, *phrases: str) -> bool:
    return any(phrase in message for phrase in phrases)


def detect_intent(message: str) -> str:
    text = _normalize(message)

    if _contains(text, "hola", "buenos dias", "buenas tardes", "buenas noches"):
        return "SALUDO"
    if _contains(text, "por que", "razon", "causa", "explica"):
        return "EXPLICACION"
    if _contains(text, "cuanto falta", "tiempo falta", "tiempo restante", "cuando termina"):
        return "TIEMPO_RESTANTE"
    if _contains(text, "recomienda", "recomendacion", "que debo", "que hago", "mejorar"):
        return "RECOMENDACION"
    if _contains(text, "alerta", "riesgo", "problema", "advertencia"):
        return "ALERTAS"
    if _contains(text, "tendencia", "evolucion", "cambio", "subio", "bajo"):
        return "TENDENCIA"
    if _contains(text, "humedad"):
        return "HUMEDAD"
    if _contains(text, "temperatura", "calor", "frio"):
        return "TEMPERATURA"
    if _contains(text, "luz", "luminosidad", "iluminacion"):
        return "LUMINOSIDAD"
    if _contains(text, "modelo", "random forest", "confianza", "inteligencia artificial"):
        return "MODELO"
    if _contains(text, "variables", "parametros", "datos", "mediciones"):
        return "VARIABLES"
    if _contains(text, "estado", "como esta", "secado"):
        return "ESTADO"
    if _contains(text, "ayuda", "puedes hacer", "que puedo preguntar"):
        return "AYUDA"
    return "CONSULTA_GENERAL"


def _number(value: Decimal | None, unit: str = "") -> str:
    if value is None:
        return "sin datos"
    formatted = f"{value:.2f}".rstrip("0").rstrip(".")
    return f"{formatted}{unit}"


def _status_label(status: str | None) -> str:
    if not status:
        return "SIN PREDICCIÓN"
    return status.replace("_", " ")


def _reason(snapshot: ChatSnapshot) -> str:
    status = snapshot.drying_status
    values = (
        f"humedad del café {_number(snapshot.coffee_humidity, '%')}, "
        f"humedad ambiental {_number(snapshot.ambient_humidity, '%')}, "
        f"temperatura {_number(snapshot.temperature, ' °C')} y "
        f"luminosidad {_number(snapshot.light, '%')}"
    )

    if status == "COMPLETADO":
        return f"La humedad objetivo ya fue alcanzada. La última lectura registra {values}."
    if status == "FAVORABLE":
        return f"Las variables se encuentran en un rango compatible con un avance adecuado: {values}."
    if status == "SECADO_LENTO":
        return f"La combinación actual puede ralentizar la pérdida de humedad: {values}."
    if status == "DESFAVORABLE":
        return f"El modelo detectó una combinación de riesgo para el proceso: {values}."
    return "Todavía no existe una predicción porque el proceso no ha recibido mediciones suficientes."


def answer_chat(message: str, snapshot: ChatSnapshot) -> ChatAnswer:
    intent = detect_intent(message)

    if snapshot.measurement_id is None:
        return ChatAnswer(
            text=(
                f"El proceso #{snapshot.process_id} existe, pero aún no tiene mediciones IoT. "
                "Inicia la simulación del ESP32 para que pueda analizar temperatura, "
                "humedad y luminosidad."
            ),
            intent=intent,
            suggestions=["¿Qué variables analiza la IA?", "¿Cómo funciona el modelo?"],
        )

    status = _status_label(snapshot.drying_status)
    confidence = _number(snapshot.confidence, "%")

    if intent == "SALUDO":
        text = (
            f"¡Hola! Estoy analizando el proceso #{snapshot.process_id}. "
            f"Su estado actual es {status}, con {confidence} de confianza. "
            "Puedes preguntarme por las variables, el tiempo restante o las recomendaciones."
        )
    elif intent == "ESTADO":
        text = (
            f"El proceso #{snapshot.process_id} está {status}. "
            f"La estimación usa la medición #{snapshot.measurement_id} y tiene "
            f"{confidence} de confianza. {_reason(snapshot)}"
        )
    elif intent == "EXPLICACION":
        text = (
            f"El estado {status} se explica por la combinación de la última lectura. "
            f"{_reason(snapshot)} La confianza del modelo es {confidence}."
        )
    elif intent == "TIEMPO_RESTANTE":
        text = (
            f"El modelo estima {_number(snapshot.remaining_hours, ' horas')} restantes. "
            "Es una estimación dinámica: cambiará cuando el ESP32 envíe nuevas mediciones."
        )
    elif intent == "RECOMENDACION":
        text = snapshot.recommendation or "Mantén el monitoreo y espera una nueva medición IoT."
        if snapshot.pending_alerts:
            text += f" Además, tienes {snapshot.pending_alerts} alerta(s) pendiente(s) por revisar."
    elif intent == "ALERTAS":
        if snapshot.pending_alerts:
            text = (
                f"Hay {snapshot.pending_alerts} alerta(s) pendiente(s). "
                f"La más reciente indica: {snapshot.latest_alert or 'revisa el panel de alertas.'}"
            )
        else:
            text = "No hay alertas pendientes para este proceso en este momento."
    elif intent == "TENDENCIA":
        change = snapshot.coffee_humidity_change
        if change is None:
            text = "Necesito al menos dos mediciones para calcular la tendencia de humedad del café."
        elif change < 0:
            text = f"La humedad del café disminuyó {_number(abs(change), ' puntos porcentuales')} en las lecturas recientes."
        elif change > 0:
            text = f"La humedad del café aumentó {_number(change, ' puntos porcentuales')} en las lecturas recientes; conviene revisar las condiciones."
        else:
            text = "La humedad del café se mantuvo estable en las lecturas recientes."
    elif intent == "HUMEDAD":
        text = (
            f"La humedad del café es {_number(snapshot.coffee_humidity, '%')} y la "
            f"humedad ambiental es {_number(snapshot.ambient_humidity, '%')}. "
            f"{_reason(snapshot)}"
        )
    elif intent == "TEMPERATURA":
        text = f"La última temperatura registrada es {_number(snapshot.temperature, ' °C')}. {_reason(snapshot)}"
    elif intent == "LUMINOSIDAD":
        text = f"La luminosidad actual es {_number(snapshot.light, '%')}. {_reason(snapshot)}"
    elif intent == "MODELO":
        text = (
            f"La predicción fue generada por {snapshot.model_version or 'el modelo Random Forest'} "
            f"con {confidence} de confianza. Analiza temperatura, humedades, luminosidad "
            "y tiempo transcurrido; no sustituye la verificación del productor."
        )
    elif intent == "VARIABLES":
        text = (
            f"La medición #{snapshot.measurement_id} contiene: temperatura "
            f"{_number(snapshot.temperature, ' °C')}, humedad ambiental "
            f"{_number(snapshot.ambient_humidity, '%')}, humedad del café "
            f"{_number(snapshot.coffee_humidity, '%')}, luminosidad "
            f"{_number(snapshot.light, '%')} y {_number(snapshot.elapsed_hours, ' horas')} transcurridas."
        )
    elif intent == "AYUDA":
        text = (
            "Puedo explicarte el estado del secado, las variables IoT, la tendencia de humedad, "
            "el tiempo restante, las alertas, la confianza del modelo y qué acción recomienda la IA."
        )
    else:
        text = (
            f"Con la última medición, el proceso está {status} y quedan aproximadamente "
            f"{_number(snapshot.remaining_hours, ' horas')}. "
            "Prueba preguntarme por el motivo del estado o por una variable específica."
        )

    return ChatAnswer(text=text, intent=intent, suggestions=DEFAULT_SUGGESTIONS)
