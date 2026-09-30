import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/context/auth-context";
import { withJsonHeaders } from "@/services/api";
import type { Subscription, SubscriptionPlan } from "@/types/api";

type SubscriptionContextValue = {
  plans: SubscriptionPlan[];
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  hasServiceAccess: boolean;
  refreshSubscription: () => Promise<void>;
  requestPlan: (planId: number) => Promise<Subscription>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, request, user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setPlans([]);
      setSubscription(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      const [availablePlans, currentSubscription] = await Promise.all([
        request<SubscriptionPlan[]>("/planes"),
        request<Subscription | null>("/suscripciones/actual"),
      ]);
      setPlans(availablePlans);
      setSubscription(currentSubscription);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible consultar la suscripción."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, request]);

  useEffect(() => {
    void refreshSubscription();
  }, [refreshSubscription]);

  const requestPlan = useCallback(
    async (planId: number) => {
      const created = await request<Subscription>(
        "/suscripciones",
        withJsonHeaders({
          method: "POST",
          body: JSON.stringify({ id_plan: planId }),
        })
      );
      setSubscription(created);
      return created;
    },
    [request]
  );

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      plans,
      subscription,
      isLoading,
      error,
      hasServiceAccess:
        user?.rol === "ADMINISTRADOR" ||
        (subscription?.estado === "ACTIVA" &&
          (!subscription.fecha_fin ||
            new Date(subscription.fecha_fin).getTime() >= Date.now())),
      refreshSubscription,
      requestPlan,
    }),
    [error, isLoading, plans, refreshSubscription, requestPlan, subscription, user?.rol]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription debe utilizarse dentro de SubscriptionProvider.");
  }
  return context;
}
