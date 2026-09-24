import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { withJsonHeaders } from "@/services/api";
import { useAuth } from "@/context/auth-context";
import type {
  CoffeeBatch,
  CreateBatchPayload,
  CreateProcessPayload,
  Device,
  DryingAlert,
  DryingProcess,
  Measurement,
  Prediction,
} from "@/types/api";

type ProcessDataContextValue = {
  activeProcess: DryingProcess | null;
  batches: CoffeeBatch[];
  devices: Device[];
  measurements: Measurement[];
  predictions: Prediction[];
  alerts: DryingAlert[];
  latestMeasurement: Measurement | null;
  latestPrediction: Prediction | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshedAt: Date | null;
  refreshData: (showLoader?: boolean) => Promise<void>;
  createBatch: (payload: CreateBatchPayload) => Promise<CoffeeBatch>;
  createProcess: (payload: CreateProcessPayload) => Promise<DryingProcess>;
  markAlertAttended: (alertId: number) => Promise<void>;
};

const ProcessDataContext = createContext<ProcessDataContextValue | null>(null);

export function ProcessDataProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, request } = useAuth();
  const [activeProcess, setActiveProcess] = useState<DryingProcess | null>(null);
  const [batches, setBatches] = useState<CoffeeBatch[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<DryingAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const clearData = useCallback(() => {
    setActiveProcess(null);
    setBatches([]);
    setDevices([]);
    setMeasurements([]);
    setPredictions([]);
    setAlerts([]);
    setError(null);
    setRefreshedAt(null);
  }, []);

  const refreshData = useCallback(
    async (showLoader = false) => {
      if (!isAuthenticated) {
        clearData();
        setIsLoading(false);
        return;
      }

      if (showLoader) {
        setIsRefreshing(true);
      }

      try {
        const [processList, batchList, deviceList] = await Promise.all([
          request<DryingProcess[]>("/procesos?limit=100"),
          request<CoffeeBatch[]>("/lotes?limit=100"),
          request<Device[]>("/dispositivos?limit=100"),
        ]);

        const process = [...processList]
          .sort((a, b) => b.id_proceso - a.id_proceso)
          .find((item) =>
            ["EN_PROCESO", "PAUSADO"].includes(item.estado)
          ) ?? null;

        setActiveProcess(process);
        setBatches(batchList);
        setDevices(deviceList);

        if (!process) {
          setMeasurements([]);
          setPredictions([]);
          setAlerts([]);
        } else {
          const processQuery = `process_id=${process.id_proceso}&limit=100`;
          const [measurementList, predictionList, alertList] =
            await Promise.all([
              request<Measurement[]>(`/mediciones?${processQuery}`),
              request<Prediction[]>(`/predicciones?${processQuery}`),
              request<DryingAlert[]>(`/alertas?${processQuery}`),
            ]);

          setMeasurements(measurementList);
          setPredictions(predictionList);
          setAlerts(alertList);
        }

        setError(null);
        setRefreshedAt(new Date());
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible consultar el backend."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [clearData, isAuthenticated, request]
  );

  useEffect(() => {
    void refreshData();

    if (!isAuthenticated) {
      return undefined;
    }

    const interval = setInterval(() => {
      void refreshData();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshData]);

  const createBatch = useCallback(
    async (payload: CreateBatchPayload) => {
      const batch = await request<CoffeeBatch>(
        "/lotes",
        withJsonHeaders({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );

      await refreshData();
      return batch;
    },
    [refreshData, request]
  );

  const createProcess = useCallback(
    async (payload: CreateProcessPayload) => {
      const process = await request<DryingProcess>(
        "/procesos",
        withJsonHeaders({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );

      await refreshData();
      return process;
    },
    [refreshData, request]
  );

  const markAlertAttended = useCallback(
    async (alertId: number) => {
      await request<DryingAlert>(
        `/alertas/${alertId}`,
        withJsonHeaders({
          method: "PATCH",
          body: JSON.stringify({ atendida: true }),
        })
      );

      await refreshData();
    },
    [refreshData, request]
  );

  const value = useMemo<ProcessDataContextValue>(
    () => ({
      activeProcess,
      batches,
      devices,
      measurements,
      predictions,
      alerts,
      latestMeasurement: measurements[0] ?? null,
      latestPrediction: predictions[0] ?? null,
      isLoading,
      isRefreshing,
      error,
      refreshedAt,
      refreshData,
      createBatch,
      createProcess,
      markAlertAttended,
    }),
    [
      activeProcess,
      alerts,
      batches,
      createBatch,
      createProcess,
      devices,
      error,
      isLoading,
      isRefreshing,
      markAlertAttended,
      measurements,
      predictions,
      refreshData,
      refreshedAt,
    ]
  );

  return (
    <ProcessDataContext.Provider value={value}>
      {children}
    </ProcessDataContext.Provider>
  );
}

export function useProcessData(): ProcessDataContextValue {
  const context = useContext(ProcessDataContext);

  if (!context) {
    throw new Error(
      "useProcessData debe utilizarse dentro de ProcessDataProvider."
    );
  }

  return context;
}
