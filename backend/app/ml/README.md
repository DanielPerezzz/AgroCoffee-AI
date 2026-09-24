# Modelo de inteligencia artificial

Este módulo implementa un prototipo reproducible de aprendizaje automático para
el monitoreo del secado de café.

## Modelos

- `RandomForestClassifier`: clasifica el proceso como `FAVORABLE`,
  `SECADO_LENTO`, `DESFAVORABLE` o `COMPLETADO`.
- `RandomForestRegressor`: estima el tiempo restante en horas.

Las variables de entrada son temperatura, humedad ambiental, humedad del café,
luminosidad y tiempo transcurrido.

## Alcance de los datos

Los modelos se entrenan con un conjunto sintético reproducible generado a partir
de rangos y reglas del prototipo. Las métricas resultantes validan la
implementación técnica, pero no representan precisión comprobada en condiciones
agrícolas reales. Para un despliegue productivo se deben recopilar mediciones de
campo, revisar las etiquetas con especialistas y volver a entrenar los modelos.

## Entrenamiento manual

Desde la carpeta `backend`:

```bash
python -m app.ml.train
```

Los archivos generados se guardan en `app/ml/artifacts/` y no se versionan. La
imagen Docker los genera automáticamente durante su construcción.
