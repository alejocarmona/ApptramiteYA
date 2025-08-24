
'use client';

import {useState, useEffect} from 'react';
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
import {httpsCallable, Functions} from 'firebase/functions';
import {useToast} from '@/hooks/use-toast';
import {getFirebaseFunctions} from '@/lib/firebase';
import {FirebaseError} from 'firebase/app';

type PaymentProps = {
  price: number;
  tramiteName: string;
  formData: Record<string, string>;
  onPaymentInitiation: (transactionId: string) => void;
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
};

// Initialize functions instance once
let functions: Functions;
try {
  functions = getFirebaseFunctions();
} catch (error) {
  console.error("Could not initialize Firebase Functions:", error);
}

export default function Payment({
  price,
  tramiteName,
  formData,
  onPaymentInitiation,
  onPaymentSuccess,
  onPaymentError,
}: PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHealthChecked, setIsHealthChecked] = useState(false);
  const {toast} = useToast();

  // Perform a health check on component mount
  useEffect(() => {
    const checkHealth = async () => {
      if (!functions) {
        toast({
          title: 'Error de Configuración',
          description: 'El servicio de pagos no está disponible en este momento.',
          variant: 'destructive',
        });
        return;
      }
      
      try {
        const wompiHealth = httpsCallable(functions, 'wompiHealth');
        await wompiHealth();
        setIsHealthChecked(true);
      } catch (error: any) {
        console.error('Payment service health check failed:', error);
        toast({
          title: 'Servicio no disponible',
          description: `El sistema de pagos no está configurado correctamente. Por favor, intenta más tarde.`,
          variant: 'destructive',
        });
      }
    };

    if (!isHealthChecked) {
      checkHealth();
    }
  }, [isHealthChecked, toast]);

  const handlePayment = async () => {
    setIsProcessing(true);

    if (!isHealthChecked) {
      onPaymentError('El servicio de pagos no está disponible. Intenta de nuevo más tarde.');
      setIsProcessing(false);
      return;
    }
    
    const serviceFee = 2500;
    const iva = (price + serviceFee) * 0.19;
    const totalInCents = Math.round((price + serviceFee + iva) * 100);
    const reference = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      const createWompiTransaction = httpsCallable(functions, 'createWompiTransaction');

      const result: any = await createWompiTransaction({
        tramiteName: tramiteName,
        amountInCents: totalInCents,
        currency: 'COP',
        reference: reference,
        formData: formData,
        paymentMethod: {
          // This is an example, in a real app this would come from a form
          type: 'CARD',
          installments: 1,
        },
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

      let title = 'Error de Pago';
      let description = 'Ocurrió un error desconocido al procesar el pago.';
      
      if (error.code && error.message) {
         const details = error.details as any;
         const requestId = details?.requestId;

        switch (error.code) {
          case 'invalid-argument':
            title = 'Datos Inválidos';
            description = 'Por favor, revisa los datos del pago e intenta de nuevo.';
            break;
          case 'failed-precondition':
            if (error.message === 'missing_wompi_private' || error.message === 'missing_config') {
              title = 'Servicio en Mantenimiento';
              description = 'El servicio de pago no está disponible temporalmente. Intenta más tarde.';
            } else if (error.message === 'wompi_error') {
               title = 'Error del Proveedor de Pagos';
               description = `No pudimos crear la transacción (código ${details?.status}). Intenta de nuevo.`;
            }
            break;
          case 'internal':
            title = 'Error Interno';
            description = `Ocurrió un error inesperado. Si persiste, contacta a soporte. (ID: ${requestId || 'N/A'})`;
            break;
        }
      }

      onPaymentError(description);
      toast({ title, description, variant: 'destructive' });
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
          disabled={isProcessing || !isHealthChecked}
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
