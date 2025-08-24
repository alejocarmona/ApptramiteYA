
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
} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {httpsCallable} from 'firebase/functions';
import {useToast} from '@/hooks/use-toast';
import { getFirebaseFunctions } from '@/lib/firebase';


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
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);

    const serviceFee = 2500;
    const iva = (price + serviceFee) * 0.19;
    const totalInCents = Math.round((price + serviceFee + iva) * 100);

    try {
      const functions = getFirebaseFunctions();
      const createWompiTransaction = httpsCallable(functions, 'createWompiTransaction');
      
      const result: any = await createWompiTransaction({
          tramiteName: tramiteName,
          amountInCents: totalInCents,
          formData: formData,
      });

      if (result.data.ok && result.data.transactionId) {
        onPaymentInitiation(result.data.transactionId);
        // This simulates the user completing the checkout on Wompi's side.
        // In a real implementation, you would use Wompi's JS widget and webhooks.
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);

      } else {
        throw new Error(result.data.error || 'Respuesta inesperada del servidor.');
      }

    } catch (error: any) {
      console.error('Payment failed:', error);
      const errorMessage = error.details?.message || error.message || 'Ocurrió un error desconocido.';
      onPaymentError(`No pudimos iniciar el proceso de pago. Detalle: ${errorMessage}`);
      toast({
        title: 'Error de Pago',
        description: `No pudimos iniciar el proceso de pago. Detalle: ${errorMessage}`,
        variant: 'destructive',
      })
    } finally {
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
          {isProcessing ? 'Procesando pago...' : 'Pagar con Wompi'}
        </Button>
      </div>

      <div className="text-center">
        <Badge
          variant="secondary"
          className="border-transparent bg-green-100/80 font-normal text-green-900"
        >
          <ShieldCheck className="mr-1.5 h-4 w-4 text-green-600" />
          Wompi by Bancolombia – PCI DSS
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
    </div>
  );
}
