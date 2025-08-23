
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
import { cn } from '@/lib/utils';
import { useKeyboardPadding } from '@/hooks/use-keyboard-padding';

type Message = {
  sender: 'user' | 'lia';
  content: React.ReactNode;
  id: number;
};

type Step =
  | 'selecting-tramite'
  | 'collecting-info'
  | 'payment'
  | 'processing-document'
  | 'document-ready'
  | 'error';

const initialState = {
  messages: [],
  step: 'selecting-tramite' as Step,
  selectedTramite: null,
  formData: {},
  currentField: 0,
  isLiaTyping: false,
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

function WelcomeHero() {
  const scrollToTramites = () => {
    document.getElementById('tramite-selector')?.scrollIntoView({behavior: 'smooth'});
  };
  return (
    <div className="rounded-lg bg-card p-4 py-4 sm:py-6 text-center">
      <Avatar className="mx-auto mb-4 h-12 w-12 sm:h-16 sm:w-16 border-4 border-primary/20 bg-primary/10">
        <AvatarFallback className="bg-transparent">
          <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
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
        <Button onClick={scrollToTramites} size="lg" className="w-full sm:w-auto min-h-[44px]">
          Empezar ahora <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SuccessCelebration() {
  return (
    <div className="relative overflow-hidden rounded-lg p-4 text-center">
      {Array.from({length: 15}).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
          }}
        />
      ))}
      <div className="flex flex-col items-center gap-2">
        <FileCheck2 className="h-12 w-12 text-green-500" />
        <span className="text-xl font-semibold">
          ¡Tu documento está listo para descargar!
        </span>
        <p className="text-sm text-muted-foreground">
          ¿Te fue útil? ¡Ayúdanos a mejorar!
        </p>
        <div className="mt-2 flex gap-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <button key={i} className="transition-transform hover:scale-125">
              <Star className="h-6 w-6" fill="currentColor" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TramiteFacil() {
  const [messages, setMessages] = useState<Message[]>(initialState.messages);
  const [step, setStep] = useState<Step>(initialState.step);
  const [selectedTramite, setSelectedTramite] = useState<Tramite | null>(
    initialState.selectedTramite
  );
  const [formData, setFormData] = useState<Record<string, string>>(
    initialState.formData
  );
  const [currentField, setCurrentField] = useState<number>(
    initialState.currentField
  );
  const [isLiaTyping, setIsLiaTyping] = useState<boolean>(
    initialState.isLiaTyping
  );
  const [userInput, setUserInput] = useState('');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {toast} = useToast();
  const keyboardPadding = useKeyboardPadding();

  const addMessage = useCallback(
    (sender: 'user' | 'lia', content: React.ReactNode) => {
      setMessages((prev) => [...prev, {sender, content, id: Date.now()}]);
    },
    []
  );

  const handleTramiteSelect = useCallback(
    (tramite: Tramite) => {
      addMessage('user', `Quiero realizar el trámite: ${tramite.name}`);
      setSelectedTramite(tramite);

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
        setStep('collecting-info');
      }, 500);
    },
    [addMessage]
  );

  const resetState = useCallback(() => {
    setMessages(initialState.messages);
    setStep(initialState.step);
    setSelectedTramite(initialState.selectedTramite);
    setFormData(initialState.formData);
    setCurrentField(initialState.currentField);
    setIsLiaTyping(initialState.isLiaTyping);
    setUserInput('');

    setTimeout(() => {
      addMessage('lia', <WelcomeHero />);
      addMessage(
        'lia',
        <div id="tramite-selector">
          <TramiteSelector onSelect={handleTramiteSelect} />
        </div>
      );
    }, 100);
  }, [addMessage, handleTramiteSelect]);

  useEffect(() => {
    resetState();
  }, [resetState]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const askNextQuestion = useCallback(() => {
    if (!selectedTramite || step !== 'collecting-info') return;

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
        setStep('payment');
      }
      setIsLiaTyping(false);
    }, 500);
  }, [selectedTramite, currentField, addMessage, step]);

  useEffect(() => {
    if (step === 'collecting-info' && !isLiaTyping && selectedTramite) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;

      const isLastMessageFromLia = lastMessage.sender === 'lia';
      
      // Ask first question right after tramite selection and LIA's confirmation.
      if (currentField === 0 && isLastMessageFromLia && messages.length < 3) {
          askNextQuestion();
      }
      // Ask next question only after user has replied.
      else if (currentField > 0 && !isLastMessageFromLia) {
          askNextQuestion();
      }
    }
  }, [step, isLiaTyping, askNextQuestion, messages, selectedTramite, currentField]);

  const handleUserInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !userInput.trim() ||
      isLiaTyping ||
      step !== 'collecting-info' ||
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

  const handlePaymentSuccess = () => {
    addMessage(
      'lia',
      <div className="flex items-center gap-2">
        <Sparkles className="text-green-500" />
        <span>Pago aprobado. ¡Gracias!</span>
      </div>
    );
    setStep('processing-document');
    setIsLiaTyping(true);

    setTimeout(() => {
      addMessage('lia', <DocumentGenerationProgress />);
      // Simulate document generation
      setTimeout(() => {
        setStep('document-ready');
        setIsLiaTyping(false);
        addMessage('lia', <SuccessCelebration />);
      }, 7000); // Total generation time
    }, 500);
  };

  const getStepIndex = (step: Step): 1 | 2 | 3 | 4 => {
    const mapping: Record<Step, 1 | 2 | 3 | 4> = {
      'selecting-tramite': 1,
      'collecting-info': 2,
      'payment': 3,
      'processing-document': 3, 
      'document-ready': 4,
      'error': 1, // default to first step on error
    };
    return mapping[step];
  };

  return (
    <Card 
      className="flex h-[90vh] max-h-[800px] w-full max-w-2xl flex-col rounded-2xl border-border bg-card shadow-2xl"
      style={{ paddingBottom: keyboardPadding }}
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
      </CardHeader>

      <div className="sticky top-0 z-20 border-b bg-card/80 p-0 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <AdaptiveStepper current={getStepIndex(step)} />
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
              <ChatBubble
                key={msg.id}
                sender={msg.sender}
                content={msg.content}
              />
            ))}
            {isLiaTyping && step !== 'processing-document' && (
              <ChatBubble
                sender="lia"
                content={<Loader2 className="animate-spin" />}
              />
            )}
            {step === 'payment' && selectedTramite && (
              <ChatBubble
                sender="lia"
                content={
                  <Payment
                    tramiteName={selectedTramite.name}
                    price={selectedTramite.priceCop}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                }
              />
            )}
            {step === 'document-ready' && selectedTramite && (
              <ChatBubble
                sender="lia"
                content={
                  <DocumentDownloader tramiteName={selectedTramite.name} />
                }
              />
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <div className={cn(
          "sticky bottom-0 z-20 border-t bg-card/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-card/60 [padding-bottom:env(safe-area-inset-bottom)]",
          step !== 'collecting-info' && 'hidden'
      )}>
        <div className="flex w-full items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setStep('selecting-tramite')}
              disabled={isLiaTyping}
              aria-label="Atrás"
              className='min-h-[44px] min-w-[44px]'
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
              className="flex-1 text-base h-11"
              aria-label="Entrada de usuario"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLiaTyping || !userInput.trim()}
              aria-label="Enviar mensaje"
              className='min-h-[44px] min-w-[44px]'
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
