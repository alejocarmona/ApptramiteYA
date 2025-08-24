
'use client';

import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  ChevronDown,
  Star,
  RefreshCcw,
  MoreVertical,
  XCircle,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Tramite} from '@/features/tramites/lib/tramites';
import {useToast} from '@/hooks/use-toast';
import ChatBubble from '../ChatBubble';
import TramiteSelector from '../TramiteSelector';
import Payment from '../Payment';
import DocumentDownloader from '../DocumentDownloader';
import AdaptiveStepper from './AdaptiveStepper';
import {Progress} from '@/components/ui/progress';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {cn} from '@/lib/utils';
import {useKeyboardPadding} from '@/hooks/use-keyboard-padding';
import {cancelTransaction, logPaymentEvent} from '@/server/db/collections';
import type {FlowContext} from '@/server/db/schema';
import {initialFlow} from '@/server/db/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {buttonVariants} from '@/components/ui/button';
import {useAppLogger} from '@/lib/logger';
import {v4 as uuidv4} from 'uuid';
import type {PaymentResult} from '@/types/payment';
import PaymentMockDialog from '@/components/payments/PaymentMock';
import {usePaymentMock} from '@/lib/flags';

type Message = {
  sender: 'user' | 'lia';
  content: React.ReactNode;
  id: string;
};

const getUniqueMessageId = () => uuidv4();

function DocumentGenerationProgress() {
  const [progress, setProgress] = useState(10);
  const [progressText, setProgressText] = useState('Preparando...');
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(45);
      setProgressText('Consultando sistemas...');
    }, 1500);

    const timer2 = setTimeout(() => {
      setProgress(80);
      setProgressText('Generando PDF...');
    }, 3000);

    const slowTimer = setTimeout(() => {
      setShowSlowMessage(true);
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(slowTimer);
    };
  }, []);

  return (
    <div className="space-y-3 p-2">
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="animate-spin text-primary" />
        <span className="font-semibold text-foreground">
          Estamos generando tu documento...
        </span>
      </div>
      <div className="space-y-2">
        <Progress value={progress} className="h-2 w-full" />
        <p className="text-center text-xs text-muted-foreground">
          {progressText} ({progress}%)
        </p>
      </div>
      {showSlowMessage && (
        <p className="rounded-md bg-amber-50 p-2 text-center text-xs text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          Esto suele tardar menos de 30s. Puedes dejar esta pantalla abierta.
        </p>
      )}
    </div>
  );
}

function WelcomeHero({onStart}: {onStart: () => void}) {
  return (
    <div className="rounded-lg bg-card p-4 py-4 text-center sm:py-6">
      <Avatar className="mx-auto mb-4 h-12 w-12 border-4 border-primary/20 bg-primary/10 sm:h-16 sm:w-16">
        <AvatarFallback className="bg-transparent">
          <Bot className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold text-foreground">
        Obtén tus documentos oficiales en minutos
      </h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        Soy LIA, tu asistente virtual. Te guiaré paso a paso para que completes
        tus trámites sin complicaciones.
      </p>
      <div className="mt-4 inline-block rounded-md bg-muted/40 p-3 text-left text-sm leading-tight">
        <p>1. Elige tu trámite.</p>
        <p>2. Ingresa tus datos.</p>
        <p>3. Paga de forma segura.</p>
        <p>4. Descarga tu documento.</p>
      </div>
      <div className="mt-6">
        <Button
          onClick={onStart}
          size="lg"
          className="min-h-[44px] w-full sm:w-auto"
        >
          Empezar ahora <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SuccessCelebration({onReset}: {onReset: () => void}) {
  const [rated, setRated] = useState(false);
  const {log} = useAppLogger('SuccessCelebration');

  const handleRating = (rating: number) => {
    log('INFO', `User rated the experience with ${rating} stars.`);
    setRated(true);
  };

  return (
    <div className="relative overflow-hidden rounded-lg p-4 text-center">
      {!rated &&
        Array.from({length: 15}).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
            }}
          />
        ))}
      <div className="flex flex-col items-center gap-2">
        <FileCheck2 className="h-12 w-12 text-green-500" />
        <span className="text-xl font-semibold">
          ¡Tu documento está listo para descargar!
        </span>

        {rated ? (
          <div className="mt-2 flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              ¡Gracias por tus comentarios!
            </p>
            <button
              onClick={onReset}
              className="text-sm font-semibold text-primary hover:underline"
            >
              👉 Generar otro documento
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              ¿Te fue útil? ¡Ayúdanos a mejorar!
            </p>
            <div className="mt-2 flex gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  className="transition-transform hover:scale-125"
                  onClick={() => handleRating(i + 1)}
                  aria-label={`Calificar con ${i + 1} estrellas`}
                >
                  <Star className="h-6 w-6" fill="currentColor" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TramiteFacil() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [flowState, setFlowState] = useState<FlowContext>(initialFlow);
  const [selectedTramite, setSelectedTramite] = useState<Tramite | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentField, setCurrentField] = useState<number>(0);
  const [isLiaTyping, setIsLiaTyping] = useState<boolean>(false);
  const [userInput, setUserInput] = useState('');
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [currentMockReference, setCurrentMockReference] = useState<string | null>(null);

  const {log} = useAppLogger('TramiteFacil');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {toast} = useToast();
  const keyboardPadding = useKeyboardPadding();
  const isMock = usePaymentMock();

  const addMessage = useCallback((sender: 'user' | 'lia', content: React.ReactNode) => {
    const newMessage = {sender, content, id: getUniqueMessageId()};
    log('INFO', `Adding message from ${sender}`, {id: newMessage.id});
    setMessages(prev => [...prev, newMessage]);
  }, [log]);
  
  const handleTramiteSelect = useCallback((tramite: Tramite) => {
    log('INFO', `Tramite selected: ${tramite.id}`);
    setMessages(currentMessages => currentMessages.slice(0, 1));
    addMessage('user', `Quiero realizar el trámite: ${tramite.name}`);
    setSelectedTramite(tramite);
    setCurrentField(0);
    setFormData({});
    setFlowState({
      step: 2,
      status: 'filling',
      tramiteId: tramite.id,
    });
  }, [addMessage, log]);

  const startInitialFlow = useCallback(() => {
    log('INFO', 'Starting initial flow.');
    addMessage(
      'lia',
      <WelcomeHero
        onStart={() =>
          document.getElementById('tramite-selector')?.scrollIntoView({behavior: 'smooth'})
        }
      />
    );
    addMessage(
      'lia',
      <div id="tramite-selector">
        <TramiteSelector onSelect={handleTramiteSelect} />
      </div>
    );
  },[addMessage, log, handleTramiteSelect]);
  
  const resetFlow = useCallback(() => {
    log('INFO', 'Resetting flow.');
    setFlowState(initialFlow);
    setSelectedTramite(null);
    setFormData({});
    setCurrentField(0);
    setIsLiaTyping(false);
    setUserInput('');
    setMessages([]);
  }, []);
  
  useEffect(() => {
    if (messages.length === 0) {
      startInitialFlow();
    }
  }, [messages.length, startInitialFlow]);

  const handlePaymentResult = useCallback(async (result: PaymentResult) => {
    setIsProcessingPayment(false);
    log('INFO', 'Received payment result in main component.', {result});
    await logPaymentEvent(result);
    setFlowState((prev) => ({...prev, transactionId: result.reference}));

    if (result.status === 'APPROVED') {
      log('SUCCESS', 'Payment approved, handling success.', {result});
      addMessage(
        'lia',
        <div className="flex items-center gap-2">
          <Sparkles className="text-green-500" />
          <span>Pago aprobado. ¡Gracias!</span>
        </div>
      );
      setFlowState(prev => ({...prev, step: 4, status: 'generating'}));
    } else {
      log('ERROR', 'Payment failed or was declined.', {result});
      const content = {
        DECLINED: <div className="flex items-center gap-2"><AlertTriangle className="text-amber-500" /><span>Pago rechazado: {result.reason}</span></div>,
        CANCELLED: <div className="flex items-center gap-2"><Ban className="text-red-500" /><span>{result.reason}</span></div>,
        ERROR: <div className="flex items-center gap-2"><XCircle className="text-destructive" /><span>Error de pago: {result.reason}</span></div>
      };
      addMessage('lia', content[result.status] || content['ERROR']);
    }
  }, [addMessage, log]);
  
  const handleMockResult = useCallback((result: Omit<PaymentResult, 'reference'>) => {
    if (currentMockReference) {
      log('INFO', 'Received result from mock dialog.', { result, reference: currentMockReference });
      handlePaymentResult({ ...result, reference: currentMockReference });
    } else {
      log('ERROR', 'Received result from mock but no reference was set.');
    }
    setIsMockModalOpen(false);
    setCurrentMockReference(null);
  }, [currentMockReference, handlePaymentResult, log]);

  const handleMockClose = useCallback(() => {
    log('INFO', 'Mock modal closed by user.');
    setIsMockModalOpen(false);
    if (currentMockReference) {
       handlePaymentResult({
          status: 'CANCELLED',
          reference: currentMockReference,
          transactionId: `mock_${Math.random().toString(36).slice(2, 10)}`,
          reason: 'Pago cancelado por el usuario'
       });
    }
    setCurrentMockReference(null);
  }, [currentMockReference, handlePaymentResult, log]);

  const handlePay = useCallback(() => {
    if (!selectedTramite) return;
    
    log('INFO', `Payment initiated for ${selectedTramite.id}. Is mock: ${isMock}`);
    setIsProcessingPayment(true);
    
    if (isMock) {
      const reference = `MOCK-${uuidv4()}`;
      log('INFO', 'Initiating MOCK payment', { reference });
      setCurrentMockReference(reference);
      setIsMockModalOpen(true);
    } else {
      // Real payment logic would go here.
      log('WARN', 'Real payment provider not implemented.');
      setIsProcessingPayment(false);
       toast({
        title: 'Servicio no disponible',
        description: 'La pasarela de pagos real no está implementada aún.',
        variant: 'destructive',
      });
    }
  }, [isMock, selectedTramite, log, toast]);

  const handleCancelFlow = useCallback(async (reason?: string) => {
    log('WARN', `Flow cancellation requested. Reason: ${reason}`, {
      transactionId: flowState.transactionId,
    });
    if (flowState.transactionId) {
      try {
        await cancelTransaction(flowState.transactionId, reason);
        log('SUCCESS', 'Transaction cancelled in backend.');
      } catch (error) {
        log('ERROR', 'Failed to cancel transaction in backend.', {error});
      }
    }
    resetFlow();
    toast({
      title: 'Proceso cancelado',
      description: 'Puedes iniciar un nuevo trámite cuando quieras.',
    });
  }, [flowState.transactionId, resetFlow, toast, log]);

  const handleUserInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isLiaTyping || !selectedTramite) return;
    if (currentField >= selectedTramite.dataRequirements.length) return;

    log('INFO', `User provided data for field ${currentField}.`);
    addMessage('user', userInput);
    const currentRequirement = selectedTramite.dataRequirements[currentField];
    setFormData(prev => ({...prev, [currentRequirement.id]: userInput}));
    setUserInput('');
    setCurrentField(prev => prev + 1);
  };
  
  // Main flow orchestrator effect
  useEffect(() => {
    const flowId = `${flowState.status}-${flowState.step}`;
    log('INFO', `Flow updated: ${flowId}`, {currentField, isLiaTyping});

    const lastMessage = messages[messages.length - 1];
    const isLiaTurn = !lastMessage || lastMessage.sender === 'user';

    // Step 2: Filling form data
    if (flowState.status === 'filling' && selectedTramite && isLiaTurn && !isLiaTyping) {
      const allFieldsFilled = currentField >= selectedTramite.dataRequirements.length;

      if (allFieldsFilled) {
        log('INFO', 'All fields filled, moving to payment.');
        setFlowState(prev => ({ ...prev, step: 3, status: 'paying' }));
        return;
      }

      setIsLiaTyping(true);
      setTimeout(() => {
        if (currentField === 0) {
          addMessage('lia', <>
              <p>¡Excelente elección!</p>
              <p>Para el <strong>{selectedTramite.name}</strong>, necesitaré algunos datos.</p>
              <p className="mt-2">{selectedTramite.dataRequirements[currentField].label}:</p>
            </>);
        } else {
          addMessage('lia', `Por favor, ingresa tu ${selectedTramite.dataRequirements[currentField].label.toLowerCase()}:`);
        }
        setIsLiaTyping(false);
      }, 500);
    }
    
    const lastMessageIsPayment = lastMessage?.content && typeof lastMessage.content === 'object' && React.isValidElement(lastMessage.content) && lastMessage.content.type === Payment;
    if (flowState.status === 'paying' && selectedTramite && !lastMessageIsPayment) {
       addMessage('lia', <div className="flex items-center gap-2"> <CheckCircle2 className="text-green-500" /> <span>¡Perfecto! Hemos reunido toda la información.</span> </div>);
       addMessage('lia', 
         <Payment 
            tramiteName={selectedTramite.name} 
            price={selectedTramite.priceCop} 
            onPay={handlePay} 
            isProcessing={isProcessingPayment} 
          />
       );
    }

    const lastMessageIsProgress = lastMessage?.content && typeof lastMessage.content === 'object' && React.isValidElement(lastMessage.content) && lastMessage.content.type === DocumentGenerationProgress;
    if (flowState.status === 'generating' && !lastMessageIsProgress) {
      addMessage('lia', <DocumentGenerationProgress />);
      setTimeout(async () => {
        log('SUCCESS', 'Document generation simulation finished.');
        setFlowState(prev => ({...prev, status: 'completed'}));
      }, 7000);
    }
    
    const lastMessageIsDownloader = lastMessage?.content && typeof lastMessage.content === 'object' && React.isValidElement(lastMessage.content) && lastMessage.content.type === DocumentDownloader;
    if (flowState.status === 'completed' && selectedTramite && !lastMessageIsDownloader) {
        addMessage('lia', <SuccessCelebration onReset={resetFlow} />);
        addMessage('lia', <DocumentDownloader tramiteName={selectedTramite.name} onReset={resetFlow} />);
    }

  }, [
    flowState.status, 
    flowState.step, 
    messages, 
    selectedTramite, 
    currentField, 
    isLiaTyping, 
    addMessage, 
    resetFlow, 
    log, 
    handlePay,
    isProcessingPayment,
  ]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);


  const OverflowMenu = () => (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Más opciones">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => {
            log('INFO', 'User selected "Change tramite" from menu.');
            resetFlow();
          }}>
            Cambiar trámite
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={e => e.preventDefault()}
            >
              Cancelar proceso
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <DropdownMenuItem>Ayuda</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar proceso?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrará el progreso de este trámite. Esta acción no se puede
            deshacer.
            {flowState.status === 'paying' && flowState.transactionId && (
              <p className="mt-2 text-amber-600">
                Tu pago no fue procesado. Si ves un cargo pendiente, se
                reversará automáticamente.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              handleCancelFlow(
                flowState.status === 'paying'
                  ? 'payment_pending'
                  : 'cancelled_by_user'
              )
            }
            className={cn(buttonVariants({variant: 'destructive'}))}
          >
            Cancelar Proceso
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  
  const getVisibleMessages = () => {
    if (flowState.step === 1) {
        return messages.slice(0, 2);
    }
    return messages.slice(1);
  };

  return (
    <>
      <PaymentMockDialog
        open={isMockModalOpen}
        onClose={handleMockClose}
        onResult={handleMockResult}
      />
      <Card
        className="flex h-[90vh] max-h-[800px] w-full max-w-2xl flex-col rounded-2xl border-border bg-card shadow-2xl"
        style={{paddingBottom: keyboardPadding}}
      >
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl text-foreground">
                Trámite Fácil
              </CardTitle>
              <p className="text-sm text-muted-foreground">Asistente LIA</p>
            </div>
          </div>
          {flowState.step > 1 ? (
            <OverflowMenu />
          ) : (
            <Button variant="ghost" size="icon" onClick={resetFlow}>
              <RefreshCcw className="h-5 w-5" />
            </Button>
          )}
        </CardHeader>

        <div className="sticky top-0 z-20 border-b bg-card/80 p-0 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <AdaptiveStepper current={flowState.step as 1 | 2 | 3 | 4} />
          {selectedTramite && (
            <p className="border-t border-border/50 py-1 text-center text-xs text-muted-foreground">
              Trámite: <strong>{selectedTramite.name}</strong>
            </p>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <ScrollArea
            className="flex-1 [padding-top:env(safe-area-inset-top)]"
            ref={scrollAreaRef}
            aria-live="polite"
          >
            <div className="space-y-6 p-6">
              {getVisibleMessages().map(msg => (
                <div key={msg.id}>
                  {msg.sender === 'lia' ? (
                    <ChatBubble sender="lia" content={msg.content} />
                  ) : (
                    <ChatBubble sender="user" content={msg.content} />
                  )}
                </div>
              ))}

              {isLiaTyping && (
                <ChatBubble
                  sender="lia"
                  content={<Loader2 className="animate-spin" />}
                />
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {flowState.status === 'filling' && (
          <div
            className="sticky bottom-0 z-20 border-t bg-card/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-card/60 [padding-bottom:env(safe-area-inset-bottom)]"
          >
            <div className="flex w-full items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  log('INFO', 'User clicked back button during form filling.');
                  resetFlow();
                }}
                disabled={isLiaTyping}
                aria-label="Atrás"
                className="min-h-[44px] min-w-[44px]"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <form
                onSubmit={handleUserInput}
                className="flex flex-1 items-center space-x-2"
              >
                <Input
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder={'Escribe tu respuesta aquí...'}
                  disabled={isLiaTyping}
                  className="h-11 flex-1 text-base"
                  aria-label="Entrada de usuario"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLiaTyping || !userInput.trim()}
                  aria-label="Enviar mensaje"
                  className="min-h-[44px] min-w-[44px]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

    