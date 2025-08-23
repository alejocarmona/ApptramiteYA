'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {CreditCard, Loader2, Lock, ShieldCheck} from 'lucide-react';
import Image from 'next/image';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';

type PaymentProps = {
  price: number;
  tramiteName: string;
  onPaymentSuccess: () => void;
};

export default function Payment({
  price,
  tramiteName,
  onPaymentSuccess,
}: PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API call to payment gateway
    setTimeout(() => {
      onPaymentSuccess();
      setIsProcessing(false);
    }, 2000);
  };

  const serviceFee = 2500;
  const iva = (price + serviceFee) * 0.19;
  const total = price + serviceFee + iva;

  return (
    <div className="space-y-4 rounded-lg bg-background p-4 text-sm">
      <h3 className="text-center text-lg font-bold text-primary-foreground/90">
        Resumen de tu pago
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trámite: {tramiteName}</span>
          <span>
            {price.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tarifa de servicio</span>
          <span>
            {serviceFee.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">IVA (19%)</span>
          <span>
            {iva.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="font-bold">Total a pagar</span>
        <span className="text-2xl font-bold text-primary-foreground">
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
          className="h-12 w-full bg-green-500 text-base text-white hover:bg-green-600"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-5 w-5" />
          )}
          {isProcessing ? 'Procesando pago...' : 'Pagar con Wompi'}
        </Button>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <Badge variant="secondary" className="font-normal text-muted-foreground">
          <Lock className="mr-1.5 h-3 w-3" />
          Pago Seguro
        </Badge>
        <Badge variant="secondary" className="font-normal text-muted-foreground">
          <ShieldCheck className="mr-1.5 h-3 w-3" />
          PCI DSS
        </Badge>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Pago procesado por Wompi
      </p>
    </div>
  );
}
