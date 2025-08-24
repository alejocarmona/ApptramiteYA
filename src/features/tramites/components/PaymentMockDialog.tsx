
'use client';

import {
  Ban,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type MockResult = "success" | "insufficient" | "canceled" | "error";

type PaymentMockDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onResult: (result: MockResult) => void;
};

const mockOptions = [
  {
    label: 'Pago exitoso',
    result: 'success',
    icon: <CheckCircle className="text-green-500" />,
  },
  {
    label: 'Saldo insuficiente',
    result: 'insufficient',
    icon: <AlertTriangle className="text-amber-500" />,
  },
  {
    label: 'Cancelado por usuario',
    result: 'canceled',
    icon: <Ban className="text-red-500" />,
  },
  {
    label: 'Error técnico',
    result: 'error',
    icon: <XCircle className="text-destructive" />,
  },
] as const;


export default function PaymentMockDialog({ isOpen, onOpenChange, onResult }: PaymentMockDialogProps) {
  const handleSelect = (result: MockResult) => {
    onResult(result);
    onOpenChange(false);
  };

  return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          onEscapeKeyDown={() => handleSelect('canceled')}
          onPointerDownOutside={() => handleSelect('canceled')}
        >
          <DialogHeader>
            <DialogTitle>Mock de Pago</DialogTitle>
            <DialogDescription>
              Este es un simulador de pagos. Selecciona un resultado para
              continuar con el flujo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-2 py-4">
            {mockOptions.map(option => (
              <Button
                key={option.result}
                variant="outline"
                className="h-auto min-h-[44px] justify-start text-left"
                onClick={() => handleSelect(option.result)}
              >
                <div className="mr-3">{option.icon}</div>
                <div className="flex flex-col">
                  <span className="font-semibold">{option.label}</span>
                </div>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => handleSelect('canceled')}>
                Cerrar (Cancela)
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}

    