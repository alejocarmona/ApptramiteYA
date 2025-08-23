'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {CreditCard, Loader2, Lock, MessageCircle, ShieldCheck, Shield} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';

type PaymentProps = {
  price: number;
  tramiteName: string;
  formData: Record<string, string>;
  onPaymentInitiation: (transactionId: string) => void;
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
};

export default function Payment({
  price,
  tramiteName,
  formData,
  onPaymentInitiation,
  onPaymentSuccess,
  onPaymentError,
}: PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // The URL for the Firebase Function.
    // In a real app, this would come from an environment variable.
    const functionUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/createWompiTransaction`;

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          tramiteId: tramiteName, // Assuming name is unique for now
          tramiteName: tramiteName,
          amount: price,
          formData,
        }),
      });
      
      const resultText = await response.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch (e) {
        throw new Error(`Respuesta inválida del servidor: ${resultText}`);
      }


      if (!response.ok) {
        throw new Error(result.detail || result.error || 'Ocurrió un error al procesar el pago.');
      }
      
      onPaymentInitiation(result.transactionId);

      // Simulate Wompi checkout and callback
      setTimeout(() => {
        onPaymentSuccess();
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      console.error("Payment failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onPaymentError(`No pudimos iniciar el proceso de pago. Detalle: ${errorMessage}`);
      setIsProcessing(false);
    }
  };

  const serviceFee = 2500;
  const iva = (price + serviceFee) * 0.19;
  const total = price + serviceFee + iva;

  return (
    <div className="w-full space-y-4 rounded-lg bg-background p-4 text-sm">
      <h3 className="text-center text-lg font-bold text-foreground">
        Resumen de tu pago
      </h3>
      <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trámite: {tramiteName}</span>
          <span className='font-medium'>
            {price.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tarifa de servicio</span>
          <span className='font-medium'>
            {serviceFee.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">IVA (19%)</span>
          <span className='font-medium'>
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
          {isProcessing ? 'Procesando pago...' : 'Pagar con Wompi'}
        </Button>
      </div>

      <div className="text-center">
         <Badge variant="secondary" className="font-normal text-muted-foreground border-transparent bg-green-100/80 text-green-900">
          <ShieldCheck className="mr-1.5 h-4 w-4 text-green-600" />
          Wompi by Bancolombia – PCI DSS
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center pt-2 text-xs text-muted-foreground">
          <div className='flex flex-col items-center gap-1'>
            <Lock size={16}/>
            <span>Pago seguro</span>
          </div>
          <div className='flex flex-col items-center gap-1'>
            <Shield size={16}/>
            <span>Datos cifrados</span>
          </div>
          <div className='flex flex-col items-center gap-1'>
            <MessageCircle size={16}/>
            <span>Soporte 24/7</span>
          </div>
      </div>

    </div>
  );
}
