
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { PaymentResult } from "@/types/payment";
import { CheckCircle, XCircle, AlertTriangle, Ban } from "lucide-react";

type PaymentMockProps = {
  open: boolean;
  onClose: () => void;
  onResult: (result: Omit<PaymentResult, 'reference'>) => void;
};

const mockOptions = [
  {
    label: "Pago exitoso",
    status: "APPROVED",
    icon: <CheckCircle className="text-green-500" />,
  },
  {
    label: "Saldo insuficiente",
    status: "DECLINED",
    icon: <AlertTriangle className="text-amber-500" />,
    reason: "Saldo insuficiente",
  },
  {
    label: "Cancelado por usuario",
    status: "CANCELLED",
    icon: <Ban className="text-red-500" />,
    reason: "Pago cancelado por el usuario",
  },
  {
    label: "Error técnico",
    status: "ERROR",
    icon: <XCircle className="text-destructive" />,
    reason: "Error técnico del procesador de pagos",
  },
] as const;

export default function PaymentMockDialog({
  open,
  onClose,
  onResult,
}: PaymentMockProps) {
  const handleSelect = (option: (typeof mockOptions)[number]) => {
    const result: Omit<PaymentResult, 'reference'> = {
      status: option.status,
      transactionId: `mock_${Math.random().toString(36).slice(2, 10)}`,
      ...(option.reason && { reason: option.reason }),
    };
    onResult(result);
  };
  
  const handleCancel = () => {
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mock de Pago</AlertDialogTitle>
          <AlertDialogDescription>
            Este es un simulador de pagos. Selecciona un resultado para
            continuar con el flujo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col space-y-2 py-4">
          {mockOptions.map((option) => (
            <Button
              key={option.status}
              variant="outline"
              className="h-auto min-h-[44px] justify-start text-left"
              onClick={() => handleSelect(option)}
            >
              <div className="mr-3">{option.icon}</div>
              <div className="flex flex-col">
                <span className="font-semibold">{option.label}</span>
                {option.reason && (
                  <span className="text-xs text-muted-foreground">
                    {option.reason}
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cerrar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
