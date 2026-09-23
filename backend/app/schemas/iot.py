from app.schemas.alerta import AlertaResponse
from app.schemas.common import AgroCoffeeSchema
from app.schemas.medicion import MedicionResponse
from app.schemas.prediccion import PrediccionResponse


class IoTMeasurementResponse(AgroCoffeeSchema):
    medicion: MedicionResponse
    prediccion: PrediccionResponse
    alerta: AlertaResponse | None = None
