
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
import {TRAMITES, Tramite} from '@/features/tramites/lib/tramites';
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
import {
  markTransactionAsDelivered,
  cancelTransaction,
  logPaymentEvent,
} from '@/server/db/collections';
import type {
  FlowContext,
} from '@/server/db/schema';
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
import { buttonVariants } from '@/components/ui/button';
import type { PaymentResult } from '@/types/payment';

type Message = {
  sender: 'user' | 'lia';
  content: React.ReactNode;
  id: number;
};

// Simple unique ID generator to prevent key collisions
let messageIdCounter = 0;
const getUniqueMessageId = () => {
  messageIdCounter += 1;
  return Date.now() + messageIdCounter;
};


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

  const handleRating = () => {
    setRated(true);
    // In a real app, you would send this rating to your analytics
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
                  onClick={handleRating}
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

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {toast} = useToast();
  const keyboardPadding = useKeyboardPadding();

  const addMessage = useCallback(
    (sender: 'user' | 'lia', content: React.ReactNode) => {
      setMessages((prev) => [...prev, {sender, content, id: getUniqueMessageId()}]);
    },
    []
  );
  
  const startInitialMessages = useCallback(() => {
    addMessage('lia', <WelcomeHero onStart={() => document.getElementById('tramite-selector')?.scrollIntoView({behavior: 'smooth'})} />);
    addMessage('lia', <div id="tramite-selector"><TramiteSelector onSelect={handleTramiteSelect} /></div>)
  }, [addMessage]);

  const resetFlow = useCallback(() => {
    setFlowState(initialFlow);
    setSelectedTramite(null);
    setFormData({});
    setCurrentField(0);
    setIsLiaTyping(false);
    setUserInput('');
    setMessages([]);
    startInitialMessages();
  }, [startInitialMessages]);

  const handleTramiteSelect = useCallback(
    (tramite: Tramite) => {
      // Keep only the first welcome message, remove the selector
      setMessages((currentMessages) => currentMessages.slice(0, 1));
      
      addMessage('user', `Quiero realizar el trámite: ${tramite.name}`);
      setSelectedTramite(tramite);
      setFlowState({
        step: 2,
        status: 'filling',
        tramiteId: tramite.id,
      });
      setFormData({});
      setCurrentField(0);

      setTimeout(() => {
        addMessage(
          'lia',
          <>
            <p>¡Excelente elección!</p>
            <p>
              Para el <strong>{tramite.name}</strong>, necesitaré algunos datos.
            </p>
          </>
        );
      }, 500);
    },
    [addMessage]
  );
  
  const handleCancelFlow = useCallback(
    async (reason?: string) => {
      if (flowState.transactionId) {
        try {
          await cancelTransaction(flowState.transactionId, reason);
        } catch (error) {
          console.error("Failed to cancel transaction:", error);
          // Non-critical, proceed with UI reset
        }
      }
      resetFlow();
      toast({
        title: "Proceso cancelado",
        description: "Puedes iniciar un nuevo trámite cuando quieras.",
      });
    },
    [flowState.transactionId, resetFlow, toast]
  );
  
  const OverflowMenu = () => (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Más opciones">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={resetFlow}>
            Cambiar trámite
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
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
            Se borrará el progreso de este trámite. Esta acción no se puede deshacer.
             {flowState.status === 'paying' && flowState.transactionId && (
              <p className="mt-2 text-amber-600">
                Tu pago no fue procesado. Si ves un cargo pendiente, se reversará automáticamente.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleCancelFlow(flowState.status === 'paying' ? 'payment_pending' : 'cancelled_by_user')}
            className={cn(buttonVariants({variant: 'destructive'}))}
          >
            Cancelar Proceso
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  useEffect(() => {
    startInitialMessages();
  }, [startInitialMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const askNextQuestion = useCallback(() => {
    if (!selectedTramite) return;

    setIsLiaTyping(true);
    setTimeout(() => {
      if (currentField < selectedTramite.dataRequirements.length) {
        const field = selectedTramite.dataRequirements[currentField];
        addMessage('lia', `Por favor, ingresa tu ${field.label.toLowerCase()}:`);
      } else {
        addMessage(
          'lia',
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            <span>¡Perfecto! Hemos reunido toda la información.</span>
          </div>
        );
        setFlowState((prev) => ({...prev, step: 3, status: 'paying'}));
      }
      setIsLiaTyping(false);
    }, 500);
  }, [selectedTramite, currentField, addMessage]);

  useEffect(() => {
    // This effect should ONLY run when we are in the 'filling' status.
    if (flowState.status !== 'filling' || isLiaTyping || !selectedTramite) {
      return;
    }
  
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
  
    // Ask the first question right after the intro message from LIA.
    if (currentField === 0 && lastMessage.sender === 'lia') {
      const isIntroMessage = (lastMessage.content as React.ReactElement)?.props?.children?.[0]?.props?.children === '¡Excelente elección!';
      if (isIntroMessage) {
        askNextQuestion();
      }
    } 
    // Ask subsequent questions only after the user has replied.
    else if (currentField > 0 && lastMessage.sender === 'user') {
      askNextQuestion();
    }
  
  }, [flowState.status, isLiaTyping, messages, selectedTramite, currentField, askNextQuestion]);


  const handleUserInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !userInput.trim() ||
      isLiaTyping ||
      flowState.status !== 'filling' ||
      !selectedTramite
    )
      return;

    if (currentField >= selectedTramite.dataRequirements.length) {
      toast({
        title: 'Información completa',
        description: 'Ya has proporcionado todos los datos necesarios.',
        variant: 'default',
      });
      return;
    }

    addMessage('user', userInput);

    const currentRequirement = selectedTramite.dataRequirements[currentField];
    setFormData((prev) => ({...prev, [currentRequirement.id]: userInput}));

    setUserInput('');
    setCurrentField((prev) => prev + 1);
  };
  
  const handlePaymentSuccess = async () => {
    addMessage(
      'lia',
      <div className="flex items-center gap-2">
        <Sparkles className="text-green-500" />
        <span>Pago aprobado. ¡Gracias!</span>
      </div>
    );
    setFlowState((prev) => ({...prev, status: 'generating'}));
    setIsLiaTyping(true); // Show generating progress

    // Simulate API call to mark transaction as paid in our DB
    if (flowState.transactionId) {
      await markTransactionAsPaid(flowState.transactionId, `wompi_${Date.now()}`);
    }

    // Simulate document generation delay
    setTimeout(async () => {
      if (flowState.transactionId) {
        await markTransactionAsDelivered(flowState.transactionId);
      }
      setFlowState((prev) => ({...prev, step: 4, status: 'completed'}));
      setIsLiaTyping(false); // Hide progress, show result
      addMessage('lia', <SuccessCelebration onReset={resetFlow} />);
    }, 7000);
  };
  
  const handlePaymentResult = async (result: PaymentResult) => {
    // This is the orchestrator. It ensures operations happen in sequence.
    await logPaymentEvent(result);
    setFlowState((prev) => ({ ...prev, transactionId: result.reference }));
  
    switch (result.status) {
      case 'APPROVED':
        await handlePaymentSuccess();
        break;
      case 'DECLINED':
        addMessage('lia', <div className="flex items-center gap-2"><AlertTriangle className="text-amber-500" /><span>Pago rechazado: {result.reason}</span></div>);
        break;
      case 'CANCELLED':
        addMessage('lia', <div className="flex items-center gap-2"><Ban className="text-red-500" /><span>{result.reason}</span></div>);
        break;
      case 'ERROR':
        addMessage('lia', <div className="flex items-center gap-2"><XCircle className="text-destructive" /><span>Error de pago: {result.reason}</span></div>);
        break;
    }
  };

  const handlePaymentError = (message: string) => {
    toast({
        title: 'Error de Pago',
        description: message,
        variant: 'destructive',
    });
  };

  const currentStep = flowState.step;

  const showChatInterface = flowState.status !== 'selecting';

  return (
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
        {currentStep > 1 ? <OverflowMenu /> : <Button variant="ghost" size="icon" onClick={resetFlow}><RefreshCcw className="w-5 h-5" /></Button>}
      </CardHeader>

      <div className="sticky top-0 z-20 border-b bg-card/80 p-0 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <AdaptiveStepper current={currentStep as 1 | 2 | 3 | 4} />
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
                {messages.map((msg) => (
                    // When status is not 'selecting', we hide the initial welcome and selector
                    <div key={msg.id} className={cn(showChatInterface && messages.indexOf(msg) < 2 && 'hidden')}>
                        {msg.sender === 'lia' ? (
                            <ChatBubble sender="lia" content={msg.content} />
                        ) : (
                            <ChatBubble sender="user" content={msg.content} />
                        )}
                    </div>
                ))}

                {isLiaTyping && flowState.status !== 'generating' && (
                <ChatBubble
                    sender="lia"
                    content={<Loader2 className="animate-spin" />}
                />
                )}
                {flowState.status === 'generating' && (
                    <ChatBubble sender="lia" content={<DocumentGenerationProgress />} />
                )}
                {flowState.status === 'paying' && selectedTramite && (
                <ChatBubble
                    sender="lia"
                    content={
                    <Payment
                        tramiteName={selectedTramite.name}
                        price={selectedTramite.priceCop}
                        formData={formData}
                        onPaymentResult={handlePaymentResult}
                        onPaymentError={handlePaymentError}
                    />
                    }
                />
                )}
                {flowState.status === 'completed' && selectedTramite && (
                <ChatBubble
                    sender="lia"
                    content={
                    <DocumentDownloader
                        tramiteName={selectedTramite.name}
                        onReset={resetFlow}
                    />
                    }
                />
                )}
            </div>
        </ScrollArea>
      </CardContent>

      <div
        className={cn(
          'sticky bottom-0 z-20 border-t bg-card/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-card/60 [padding-bottom:env(safe-area-inset-bottom)]',
          flowState.status !== 'filling' && 'hidden'
        )}
      >
        <div className="flex w-full items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={resetFlow}
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
              onChange={(e) => setUserInput(e.target.value)}
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
    </Card>
  );
}
