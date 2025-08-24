'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {
  CreditCard,
  Loader2,
  Lock,
  MessageCircle,
  Shield,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import PaymentMock from '@/components/payments/PaymentMock';
import {usePaymentMock} from '@/lib/flags';
import type {PaymentResult} from '@/types/payment';

type PaymentProps = {
  price: number;
  tramiteName: string;
  formData: Record<string, string>;
  onPaymentResult: (result: PaymentResult) => void;
  onPaymentError: (message: string) => void;
};

export default function Payment({
  price,
  tramiteName,
  formData,
  onPaymentResult,
  onPaymentError,
}: PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);

  const isMockEnabled = usePaymentMock();

  const handlePayment = async () => {
    setIsProcessing(true);

    if (isMockEnabled) {
      setShowMockModal(true);
      // Processing will be set to false inside handleMockResult
    } else {
      // Real payment logic would go here. For now, we show an error.
      onPaymentError(
        'El servicio de pago real no está implementado en este momento.'
      );
      setIsProcessing(false);
    }
  };

  const handleMockResult = (result: PaymentResult) => {
    setShowMockModal(false);
    setIsProcessing(false); // Stop processing after mock result is received
    onPaymentResult(result);
  };

  const serviceFee = 2500;
  const iva = (price + serviceFee) * 0.19;
  const total = price + serviceFee + iva;

  return (
    <div className="w-full space-y-4 rounded-lg bg-background p-4 text-sm">
      {isMockEnabled && (
        <Badge
          variant="outline"
          className="w-full justify-center border-amber-500/50 bg-amber-50 text-amber-700"
        >
          <FlaskConical className="mr-2 h-4 w-4" />
          Modo de pruebas: el pago se simula.
        </Badge>
      )}

      <h3 className="text-center text-lg font-bold text-foreground">
        Resumen de tu pago
      </h3>
      <div className="text-center">
        <Badge variant="secondary">
          Modo de pago: {isMockEnabled ? 'Simulado' : 'Real (Wompi)'}
        </Badge>
      </div>
      <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trámite: {tramiteName}</span>
          <span className="font-medium">
            {price.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tarifa de servicio</span>
          <span className="font-medium">
            {serviceFee.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">IVA (19%)</span>
          <span className="font-medium">
            {iva.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between px-1">
        <span className="font-bold">Total a pagar</span>
        <span className="text-2xl font-bold text-primary">
          {total.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
          })}
        </span>
      </div>

      <div className="pt-2">
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="h-12 w-full bg-green-500 text-base text-white transition-all hover:bg-green-600 hover:scale-105"
          size="lg"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-5 w-5" />
          )}
          {isProcessing ? 'Procesando...' : 'Pagar'}
        </Button>
      </div>

      <div className="text-center">
        <Badge
          variant="secondary"
          className="border-transparent bg-green-100/80 font-normal text-green-900"
        >
          <ShieldCheck className="mr-1.5 h-4 w-4 text-green-600" />
          {isMockEnabled ? 'Pago Simulado' : 'Wompi by Bancolombia – PCI DSS'}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-1">
          <Lock size={16} />
          <span>Pago seguro</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Shield size={16} />
          <span>Datos cifrados</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <MessageCircle size={16} />
          <span>Soporte 24/7</span>
        </div>
      </div>
      <PaymentMock
        open={showMockModal}
        onClose={() => {
          setShowMockModal(false);
          setIsProcessing(false);
        }}
        onResult={handleMockResult}
      />
    </div>
  );
}
