export type UserRole = "ADMINISTRADOR" | "PRODUCTOR" | "TECNICO";

export type GeneralStatus = "ACTIVO" | "INACTIVO";

export type ProcessStatus =
  | "EN_PROCESO"
  | "PAUSADO"
  | "FINALIZADO"
  | "CANCELADO";

export type DryingStatus =
  | "FAVORABLE"
  | "SECADO_LENTO"
  | "DESFAVORABLE"
  | "COMPLETADO";

export type AlertLevel = "INFORMACION" | "ADVERTENCIA" | "CRITICA";

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

export type ApiUser = {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: UserRole;
  fecha_registro: string;
  estado: GeneralStatus;
};

export type CoffeeBatch = {
  id_lote: number;
  id_usuario: number;
  codigo_lote: string;
  cantidad_kg: string;
  humedad_inicial: string;
  fecha_creacion: string;
};

export type DryingProcess = {
  id_proceso: number;
  id_lote: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: ProcessStatus;
  observaciones: string | null;
};

export type Device = {
  id_dispositivo: number;
  id_usuario: number | null;
  nombre: string;
  codigo: string;
  tipo: string;
  ubicacion: string | null;
  fecha_registro: string;
  estado: GeneralStatus;
};

export type Measurement = {
  id_medicion: number;
  id_proceso: number;
  id_dispositivo: number;
  temperatura: string;
  humedad_ambiental: string;
  humedad_cafe: string;
  luminosidad: string;
  tiempo_transcurrido_horas: string;
  fecha_hora: string;
};

export type Prediction = {
  id_prediccion: number;
  id_medicion: number;
  estado_secado: DryingStatus;
  tiempo_restante_horas: string | null;
  nivel_confianza: string | null;
  recomendacion: string | null;
  modelo_version: string | null;
  fecha: string;
};

export type DryingAlert = {
  id_alerta: number;
  id_proceso: number;
  id_medicion: number | null;
  tipo_alerta: string;
  nivel: AlertLevel;
  mensaje: string;
  fecha_hora: string;
  atendida: boolean;
  fecha_atencion: string | null;
};

export type CreateBatchPayload = {
  codigo_lote: string;
  cantidad_kg: number;
  humedad_inicial: number;
};

export type CreateProcessPayload = {
  id_lote: number;
  observaciones?: string;
};
