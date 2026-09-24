from enum import Enum


class RolUsuario(str, Enum):
    ADMINISTRADOR = "ADMINISTRADOR"
    PRODUCTOR = "PRODUCTOR"
    TECNICO = "TECNICO"


class EstadoGeneral(str, Enum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"


class EstadoProceso(str, Enum):
    EN_PROCESO = "EN_PROCESO"
    PAUSADO = "PAUSADO"
    FINALIZADO = "FINALIZADO"
    CANCELADO = "CANCELADO"


class NivelAlerta(str, Enum):
    INFORMACION = "INFORMACION"
    ADVERTENCIA = "ADVERTENCIA"
    CRITICA = "CRITICA"


class EstadoSecado(str, Enum):
    FAVORABLE = "FAVORABLE"
    SECADO_LENTO = "SECADO_LENTO"
    DESFAVORABLE = "DESFAVORABLE"
    COMPLETADO = "COMPLETADO"