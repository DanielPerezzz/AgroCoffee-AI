# AgroCoffee AI en Kubernetes

Esta carpeta despliega PostgreSQL, la API FastAPI y la compilacion web de Expo
dentro de Minikube. La aplicacion Android se ejecuta directamente en el
telefono, mientras que la version web permite evidenciar la contenerizacion y
orquestacion del frontend.

## Componentes

- Namespace aislado `agrocoffee`.
- ConfigMap para configuración no sensible.
- Secret generado localmente para credenciales y JWT.
- PostgreSQL con volumen persistente.
- Backend con migraciones Alembic automáticas, probes y recursos.
- Frontend web Expo servido por Nginx, con probes y recursos.
- Services internos para PostgreSQL, FastAPI y Nginx.
- Ingress HTTP con frontend en `/` y API en `/api/v1`.
- HPA de una a tres réplicas según utilización de CPU.

## 1. Requisitos

```bash
docker --version
kubectl version --client
minikube version
```

## 2. Crear el clúster

```bash
minikube start --driver=docker --cpus=2 --memory=4096
minikube addons enable ingress
minikube addons enable metrics-server
```

## 3. Construir las imágenes dentro de Minikube

Ejecutar desde la raíz de `AgroCoffeAI`:

```bash
minikube image build -t agrocoffee-backend:local ./backend
minikube image build \
  --build-opt=build-arg=EXPO_PUBLIC_API_URL=http://agrocoffee.local/api/v1 \
  -t agrocoffee-frontend:local ./frontend
```

## 4. Crear Namespace y Secret

```bash
kubectl apply -f k8s/00-namespace.yaml
K8S_DB_PASSWORD=$(openssl rand -hex 16)
K8S_SECRET_KEY=$(openssl rand -hex 32)
kubectl create secret generic agrocoffee-secrets \
  --namespace agrocoffee \
  --from-literal=POSTGRES_DB=agrocoffee \
  --from-literal=POSTGRES_USER=agrocoffee_user \
  --from-literal=POSTGRES_PASSWORD="$K8S_DB_PASSWORD" \
  --from-literal=SECRET_KEY="$K8S_SECRET_KEY" \
  --from-literal=DATABASE_URL="postgresql+psycopg://agrocoffee_user:${K8S_DB_PASSWORD}@postgres:5432/agrocoffee"
unset K8S_DB_PASSWORD K8S_SECRET_KEY
```

`secret.example.yaml` documenta la estructura, pero nunca debe contener
credenciales reales. `secret.yaml` está excluido de Git.

## 5. Desplegar

```bash
kubectl apply -f k8s/10-configmap.yaml
kubectl apply -f k8s/20-postgres-pvc.yaml
kubectl apply -f k8s/21-postgres-deployment.yaml
kubectl apply -f k8s/22-postgres-service.yaml
kubectl apply -f k8s/30-backend-deployment.yaml
kubectl apply -f k8s/31-backend-service.yaml
kubectl apply -f k8s/32-backend-hpa.yaml
kubectl apply -f k8s/33-frontend-deployment.yaml
kubectl apply -f k8s/34-frontend-service.yaml
kubectl apply -f k8s/40-ingress.yaml
```

## 6. Verificar

```bash
kubectl get all -n agrocoffee
kubectl get pvc,configmap,secret,ingress,hpa -n agrocoffee
kubectl rollout status deployment/postgres -n agrocoffee
kubectl rollout status deployment/agrocoffee-backend -n agrocoffee
kubectl rollout status deployment/agrocoffee-frontend -n agrocoffee
kubectl logs deployment/agrocoffee-backend -n agrocoffee
```

El HPA necesita Metrics Server. Puede tardar uno o dos minutos en mostrar
métricas:

```bash
kubectl top pods -n agrocoffee
kubectl get hpa -n agrocoffee
```

## 7. Prueba rápida mediante port-forward

En una terminal separada:

```bash
kubectl port-forward service/agrocoffee-backend 8001:80 -n agrocoffee
```

En otra terminal:

```bash
curl http://localhost:8001/api/v1/health
```

Swagger estará en `http://localhost:8001/docs`.

Para comprobar por separado el contenedor del frontend:

```bash
kubectl port-forward service/agrocoffee-frontend 8081:80 -n agrocoffee
```

La interfaz estará en `http://localhost:8081`. Para iniciar sesión y consultar
datos desde esta prueba separada, también debe estar disponible el Ingress
descrito a continuación, porque el frontend fue compilado para consumir
`http://agrocoffee.local/api/v1`.

## 8. Probar el sistema completo mediante Ingress

En Windows con el driver Docker, ejecutar en PowerShell como administrador y
mantener la terminal abierta:

```powershell
minikube tunnel
```

Agregar temporalmente esta línea a
`C:\Windows\System32\drivers\etc\hosts`:

```text
127.0.0.1 agrocoffee.local
```

Después abrir:

- Frontend: `http://agrocoffee.local`
- Swagger: `http://agrocoffee.local/docs`
- Health: `http://agrocoffee.local/api/v1/health`

Para comprobar el enrutamiento desde la terminal:

```bash
kubectl get ingress -n agrocoffee
curl http://agrocoffee.local/api/v1/health
```

## 9. Pausar o eliminar

Pausar el clúster conservando sus recursos:

```bash
minikube stop
```

Eliminar completamente el clúster y su almacenamiento:

```bash
minikube delete
```

La eliminación es destructiva para los datos almacenados únicamente dentro de
Minikube.
