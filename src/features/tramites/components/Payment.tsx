
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
  FlaskConical,
  AlertTriangle,
} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {useToast} from '@/hooks/use-toast';
import PaymentMock from '@/components/payments/PaymentMock';
import { usePaymentMock, fallbackToMockOnHealthFail } from '@/lib/flags';
import type { PaymentResult, PaymentInput } from '@/types/payment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { httpsCallable, Functions } from 'firebase/functions';
import { getFirebaseFunctions } from '@/lib/firebase';


type HealthState = {
  mode: 'real' | 'mock';
  ok: boolean;
  error: string | null;
  checked: boolean;
};

type PaymentProps = {
  price: number;
  tramiteName: string;
  formData: Record<string, string>;
  onPaymentResult: (result: PaymentResult) => void;
  onPaymentError: (message: string) => void;
};

let functions: Functions;
try {
  functions = getFirebaseFunctions();
} catch (error) {
  console.error("Could not initialize Firebase Functions:", error);
}

const startWompiPayment = async (input: PaymentInput): Promise<PaymentResult> => {
    if (!functions) {
        throw new Error('El servicio de pagos no está disponible en este momento.');
    }

    if (input.healthCheck) {
        const wompiHealth = httpsCallable(functions, 'wompiHealth');
        await wompiHealth();
        return { status: 'APPROVED', reference: 'health-check', transactionId: 'health-check' }; // Dummy result
    }

    const createWompiTransaction = httpsCallable(functions, 'createWompiTransaction');
    
    try {
        const result: any = await createWompiTransaction({
            tramiteName: input.tramiteName,
            amountInCents: input.amountInCents,
            currency: 'COP',
            reference: input.reference,
            formData: input.formData,
            paymentMethod: {
                type: 'CARD', // This is a placeholder
                installments: 1,
            },
        });

        if (result.data.ok && result.data.transactionId) {
            // In a real scenario with a redirect, this part would be different.
            // Here, we simulate an immediate approval after creation for flow continuation.
            return {
                status: 'APPROVED',
                reference: result.data.transactionId,
                transactionId: result.data.wompiTransaction.id,
            };
        } else {
            throw new Error(result.data.error || 'Respuesta inesperada del servidor.');
        }
    } catch (error: any) {
        console.error('Wompi payment failed:', error);

        let description = 'Ocurrió un error desconocido al procesar el pago.';
        if (error.code && error.message) {
            const details = error.details as any;
            const requestId = details?.requestId;

            switch (error.code) {
                case 'invalid-argument':
                    description = 'Por favor, revisa los datos del pago e intenta de nuevo.';
                    break;
                case 'failed-precondition':
                    if (error.message === 'missing_wompi_private' || error.message === 'missing_config') {
                        description = 'El servicio de pago no está disponible temporalmente. Intenta más tarde.';
                    } else if (error.message === 'wompi_error') {
                        description = `No pudimos crear la transacción (código ${details?.status}). Intenta de nuevo.`;
                    }
                    break;
                case 'internal':
                    description = `Ocurrió un error inesperado. Si persiste, contacta a soporte. (ID: ${requestId || 'N/A'})`;
                    break;
            }
        }
        throw new Error(description);
    }
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
  const [health, setHealth] = useState<HealthState>({ mode: 'real', ok: false, error: null, checked: false });

  const {toast} = useToast();
  const isMockEnabledByFlag = usePaymentMock();

  useEffect(() => {
    // Reset health check state when component mounts or flow restarts
    setHealth({ mode: 'real', ok: false, error: null, checked: false });

    if (isMockEnabledByFlag) {
      setHealth({ mode: 'mock', ok: true, error: null, checked: true });
      return;
    }

    const checkHealth = async () => {
      try {
          await startWompiPayment({ healthCheck: true } as PaymentInput);
          setHealth({ mode: 'real', ok: true, error: null, checked: true });
      } catch (error: any) {
          console.error('Payment service health check failed:', error);
          if (fallbackToMockOnHealthFail()) {
            setHealth({ mode: 'mock', ok: true, error: null, checked: true });
            toast({
                title: 'Modo de prueba activado',
                description: `El servicio de pago real no está disponible. Se usará el modo simulado.`,
                variant: 'default',
            });
          } else {
            setHealth({ mode: 'real', ok: false, error: `El sistema de pagos no está configurado correctamente. Por favor, intenta más tarde.`, checked: true });
          }
      }
    };
    checkHealth();
  }, [isMockEnabledByFlag, toast, tramiteName]); // Depend on tramiteName to re-run on new flow

  const handlePayment = async () => {
    setIsProcessing(true);

    if (health.mode === 'mock') {
      setShowMockModal(true);
      setIsProcessing(false);
      return;
    }
    
    const serviceFee = 2500;
    const iva = (price + serviceFee) * 0.19;
    const totalInCents = Math.round((price + serviceFee + iva) * 100);

    const paymentInput: PaymentInput = {
      tramiteName: tramiteName,
      amountInCents: totalInCents,
      currency: 'COP',
      formData: formData,
      reference: `order_${Date.now()}`,
    };

    try {
      const result = await startWompiPayment(paymentInput);
      onPaymentResult(result);
    } catch (error: any) {
       onPaymentError(error.message || 'Ocurrió un error desconocido.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleMockResult = (result: PaymentResult) => {
    setShowMockModal(false);
    onPaymentResult(result);
  };
  
  const canPay = (health.ok || health.mode === 'mock') && !isProcessing;
  const serviceFee = 2500;
  const iva = (price + serviceFee) * 0.19;
  const total = price + serviceFee + iva;

  return (
    <div className="w-full space-y-4 rounded-lg bg-background p-4 text-sm">
      {health.mode === 'mock' && (
        <Badge
          variant="outline"
          className="w-full justify-center border-amber-500/50 bg-amber-50 text-amber-700"
        >
          <FlaskConical className="mr-2 h-4 w-4" />
          Modo de pruebas: el pago se simula.
        </Badge>
      )}
       {health.error && health.mode === 'real' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Servicio no disponible</AlertTitle>
          <AlertDescription>{health.error}</AlertDescription>
        </Alert>
      )}
      <h3 className="text-center text-lg font-bold text-foreground">
        Resumen de tu pago
      </h3>
      <div className="text-center">
        <Badge variant="secondary">
          Modo de pago: {health.mode === 'mock' ? 'Simulado' : 'Real (Wompi)'}
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
          disabled={!canPay}
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
          {health.mode === 'mock' ? "Pago Simulado" : "Wompi by Bancolombia – PCI DSS"}
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
        onClose={() => setShowMockModal(false)}
        onResult={handleMockResult}
      />
    </div>
  );
}
