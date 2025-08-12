"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, FileText, Loader2, Send, Sparkles, User, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TRAMITES, Tramite } from '@/lib/tramites';
import { useLiaToFillInFields } from '@/ai/flows/use-lia-to-fill-in-fields';
import { useToast } from '@/hooks/use-toast';
import ChatBubble from './ChatBubble';
import TramiteSelector from './TramiteSelector';
import Payment from './Payment';
import DocumentDownloader from './DocumentDownloader';
import ProgressIndicator from './ProgressIndicator';

type Message = {
  sender: 'user' | 'lia';
  content: React.ReactNode;
  id: number;
};

type Step = 'selecting-tramite' | 'collecting-info' | 'payment' | 'processing-document' | 'document-ready' | 'error';
const stepsList: Step[] = ['selecting-tramite', 'collecting-info', 'payment', 'document-ready'];

const initialState = {
  messages: [],
  step: 'selecting-tramite' as Step,
  selectedTramite: null,
  formData: {},
  currentField: 0,
  isLiaTyping: false,
};

export default function TramiteFacil() {
  const [messages, setMessages] = useState<Message[]>(initialState.messages);
  const [step, setStep] = useState<Step>(initialState.step);
  const [selectedTramite, setSelectedTramite] = useState<Tramite | null>(initialState.selectedTramite);
  const [formData, setFormData] = useState<Record<string, string>>(initialState.formData);
  const [currentField, setCurrentField] = useState<number>(initialState.currentField);
  const [isLiaTyping, setIsLiaTyping] = useState<boolean>(initialState.isLiaTyping);
  const [userInput, setUserInput] = useState('');
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const addMessage = useCallback((sender: 'user' | 'lia', content: React.ReactNode) => {
    setMessages(prev => [...prev, { sender, content, id: Date.now() }]);
  }, []);

  const resetState = useCallback(() => {
    setMessages(initialState.messages);
    setStep(initialState.step);
    setSelectedTramite(initialState.selectedTramite);
    setFormData(initialState.formData);
    setCurrentField(initialState.currentField);
    setIsLiaTyping(initialState.isLiaTyping);
    setUserInput('');
    
    // Add initial welcome message after a short delay
    setTimeout(() => {
      addMessage(
        'lia',
        <>
          <p className="mb-2">¡Hola! 👋 Soy LIA, tu asistente virtual para trámites en Colombia.</p>
          <p className="mb-4">Te ayudaré a sacar tus documentos en menos de 3 minutos. ¿Listo?</p>
          <p className="font-medium">Por favor, elige el trámite que quieres realizar:</p>
          <TramiteSelector onSelect={handleTramiteSelect} />
        </>
      );
    }, 100);
  }, [addMessage]);
  
  useEffect(() => {
    resetState();
  }, [resetState]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
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
        addMessage('lia', `¡Perfecto! Hemos reunido toda la información. El costo del trámite es de ${selectedTramite.priceCop.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}.`);
        setStep('payment');
      }
      setIsLiaTyping(false);
    }, 500);
  }, [selectedTramite, currentField, addMessage, step]);

  useEffect(() => {
    if (step === 'collecting-info' && !isLiaTyping && messages[messages.length - 1]?.sender !== 'user') {
        askNextQuestion();
    }
  }, [step, currentField, isLiaTyping, askNextQuestion, messages]);


  const handleTramiteSelect = useCallback((tramite: Tramite) => {
    addMessage('user', `Quiero realizar el trámite: ${tramite.name}`);
    setSelectedTramite(tramite);
    
    setTimeout(() => {
      addMessage('lia', `¡Excelente elección! Para el ${tramite.name}, necesitaré algunos datos.`);
      setStep('collecting-info');
      setCurrentField(0);
    }, 1000);
  }, [addMessage]);

  const handleUserInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isLiaTyping || step !== 'collecting-info' || !selectedTramite) return;
    
    if (currentField >= selectedTramite.dataRequirements.length) return;

    addMessage('user', userInput);
    
    const currentRequirement = selectedTramite.dataRequirements[currentField];
    setFormData(prev => ({...prev, [currentRequirement.id]: userInput}));
    
    setUserInput('');
    setCurrentField(prev => prev + 1);
  };

  const handlePaymentSuccess = () => {
    addMessage('lia', 
      <div className="flex items-center gap-2">
        <Sparkles className="text-accent-foreground" />
        <span>Pago aprobado. ¡Gracias!</span>
      </div>
    );
    setStep('processing-document');
    setIsLiaTyping(true);

    setTimeout(() => {
      setIsLiaTyping(false);
      addMessage('lia', 
        <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" />
            <span>Estamos generando tu documento. Esto puede tardar un momento...</span>
        </div>
      );

      setTimeout(() => {
        setStep('document-ready');
        addMessage('lia', 
          <div className="flex items-center gap-2">
              <FileText />
              <span>¡Tu documento está listo!</span>
          </div>
        );
      }, 3000);
    }, 1500);
  };
  
  const handleStepChange = (newStepIndex: number) => {
    const currentStepIndex = stepsList.indexOf(step);
    if (newStepIndex >= currentStepIndex) return;

    const newStep = stepsList[newStepIndex];
    setStep(newStep);

    if (newStep === 'selecting-tramite') {
      resetState();
    } else if (newStep === 'collecting-info') {
      const lastUserMessageIndex = messages.map(m => m.sender).lastIndexOf('user');
      const messagesToShow = messages.slice(0, lastUserMessageIndex + 1);
      
      const newCurrentField = selectedTramite ? Math.min(Object.keys(formData).length, selectedTramite.dataRequirements.length) : 0;
      setCurrentField(newCurrentField);
      
      setMessages(messagesToShow);
      setTimeout(() => {
        addMessage('lia', 'Retomando desde aquí. ¿Qué deseas hacer?');
      }, 200);
    }
  };

  const goBack = () => {
    const currentStepIndex = stepsList.indexOf(step);
    if (currentStepIndex > 0) {
      handleStepChange(currentStepIndex - 1);
    }
  };

  const currentStepIndex = stepsList.indexOf(step);

  return (
    <Card className="w-full max-w-2xl h-[90vh] max-h-[800px] flex flex-col shadow-2xl rounded-2xl border-2 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between border-b-2 border-primary/20">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
                <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
                <CardTitle className="text-2xl font-headline text-primary-foreground/90">Trámite Fácil</CardTitle>
                <p className="text-sm text-muted-foreground">Asistente LIA</p>
            </div>
        </div>
        <Button variant="ghost" size="icon" onClick={resetState}>
          <RefreshCcw className="w-5 h-5" />
          <span className="sr-only">Reiniciar conversación</span>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="p-4 border-b">
          <ProgressIndicator 
            steps={stepsList.map(s => s.replace('-', ' '))} 
            currentStep={currentStepIndex}
            onStepClick={handleStepChange}
          />
          {selectedTramite && <p className="text-center text-sm text-muted-foreground mt-2">Trámite: <strong>{selectedTramite.name}</strong></p>}
        </div>
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} sender={msg.sender} content={msg.content} />
            ))}
            {isLiaTyping && <ChatBubble sender="lia" content={<Loader2 className="animate-spin" />} />}
             {step === 'payment' && selectedTramite && (
              <ChatBubble sender="lia" content={<Payment price={selectedTramite.priceCop} onPaymentSuccess={handlePaymentSuccess} />} />
            )}
            {step === 'document-ready' && selectedTramite && (
              <ChatBubble sender="lia" content={<DocumentDownloader tramiteName={selectedTramite.name} />} />
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t-2 border-primary/20">
        <div className="flex w-full items-center space-x-2">
            {step !== 'selecting-tramite' && (
              <Button variant="outline" size="icon" onClick={goBack} disabled={isLiaTyping}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Atrás</span>
              </Button>
            )}
            <form onSubmit={handleUserInput} className="flex-1 flex items-center space-x-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={step === 'collecting-info' ? 'Escribe tu respuesta aquí...' : 'La conversación ha finalizado.'}
                disabled={step !== 'collecting-info' || isLiaTyping}
                className="flex-1 text-base"
              />
              <Button type="submit" size="icon" disabled={step !== 'collecting-info' || isLiaTyping || !userInput.trim()}>
                <Send className="h-5 w-5" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
        </div>
      </CardFooter>
      <div className="text-center text-xs text-muted-foreground p-2 bg-secondary rounded-b-2xl">
        TrámiteYA no es una entidad gubernamental; automatizamos el acceso a servicios públicos y te guiamos paso a paso.
      </div>
    </Card>
  );
}
