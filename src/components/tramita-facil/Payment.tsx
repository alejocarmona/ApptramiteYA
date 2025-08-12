"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

type PaymentProps = {
  price: number;
  onPaymentSuccess: () => void;
};

export default function Payment({ price, onPaymentSuccess }: PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API call to payment gateway
    setTimeout(() => {
      onPaymentSuccess();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="bg-background rounded-lg p-4 space-y-4">
      <div className="text-center">
        <p className="text-muted-foreground">Total a pagar</p>
        <p className="text-3xl font-bold text-primary-foreground">{price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
      </div>
      <Button 
        onClick={handlePayment} 
        disabled={isProcessing} 
        className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
      >
        {isProcessing ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-5 w-5" />
        )}
        {isProcessing ? 'Procesando pago...' : 'Pagar con Wompi'}
      </Button>
      <div className="flex items-center justify-center text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
        <span>Pago 100% seguro y encriptado</span>
      </div>
    </div>
  );
}
