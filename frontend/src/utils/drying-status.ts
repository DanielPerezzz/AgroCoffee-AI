import type { ComponentProps } from "react";
import Ionicons from "@react-native-vector-icons/ionicons";

import type { DryingStatus } from "@/types/api";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type DryingAppearance = {
  label: string;
  description: string;
  color: string;
  softColor: string;
  textColor: string;
  icon: IoniconName;
};

const appearances: Record<DryingStatus, DryingAppearance> = {
  FAVORABLE: {
    label: "Favorable",
    description: "El proceso se encuentra bajo condiciones adecuadas.",
    color: "#2F7D32",
    softColor: "#EAF4E7",
    textColor: "#FFFFFF",
    icon: "checkmark-circle",
  },
  SECADO_LENTO: {
    label: "Secado lento",
    description: "Las condiciones actuales pueden ralentizar el secado.",
    color: "#E99A00",
    softColor: "#FFF3D2",
    textColor: "#FFFFFF",
    icon: "time",
  },
  DESFAVORABLE: {
    label: "Desfavorable",
    description: "Se detectaron condiciones que requieren atención.",
    color: "#D13A32",
    softColor: "#FDE7E5",
    textColor: "#FFFFFF",
    icon: "alert-circle",
  },
  COMPLETADO: {
    label: "Completado",
    description: "La humedad objetivo del café fue alcanzada.",
    color: "#2878C7",
    softColor: "#EAF4FF",
    textColor: "#FFFFFF",
    icon: "flag",
  },
};

export function getDryingAppearance(
  status: DryingStatus | null | undefined
): DryingAppearance {
  return status ? appearances[status] : appearances.FAVORABLE;
}
