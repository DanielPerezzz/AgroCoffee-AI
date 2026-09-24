from decimal import Decimal

from app.ml.predictor import get_model_version, predict_drying_state
from app.models.alerta import Alerta
from app.models.medicion import Medicion
from app.models.prediccion import Prediccion


def build_prediction_records(
    medicion: Medicion,
) -> tuple[Prediccion, Alerta | None]:
    result = predict_drying_state(
        temperature=float(medicion.temperatura),
        ambient_humidity=float(medicion.humedad_ambiental),
        coffee_humidity=float(medicion.humedad_cafe),
        light=float(medicion.luminosidad),
        elapsed_hours=float(medicion.tiempo_transcurrido_horas),
    )

    prediccion = Prediccion(
        id_medicion=medicion.id_medicion,
        estado_secado=result.state,
        tiempo_restante_horas=Decimal(str(result.remaining_hours)),
        nivel_confianza=Decimal(str(result.confidence_percent)),
        recomendacion=result.recommendation,
        modelo_version=get_model_version(),
    )

    alerta = None
    if result.alert_level is not None and result.alert_type is not None:
        alerta = Alerta(
            id_proceso=medicion.id_proceso,
            id_medicion=medicion.id_medicion,
            tipo_alerta=result.alert_type,
            nivel=result.alert_level,
            mensaje=result.recommendation,
        )

    return prediccion, alerta
