'use client';

import {Button} from '@/components/ui/button';
import {Download, Mail, MessageSquare} from 'lucide-react';

type DocumentDownloaderProps = {
  tramiteName: string;
};

export default function DocumentDownloader({
  tramiteName,
}: DocumentDownloaderProps) {
  // In a real app, this would be a signed URL from backend
  const documentUrl = '/placeholder.pdf';

  const shareViaEmail = () => {
    const subject = `Tu documento: ${tramiteName}`;
    const body = `Hola,\n\nAdjunto encontrarás tu ${tramiteName} solicitado a través de Trámite Fácil.\n\nPuedes descargarlo aquí: ${window.location.origin}${documentUrl}\n\nGracias por usar nuestros servicios.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const shareViaWhatsApp = () => {
    const message = `¡Hola! Tu ${tramiteName} de Trámite Fácil está listo. Descárgalo aquí: ${window.location.origin}${documentUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-3 rounded-lg bg-background p-4">
      <h3 className="text-center font-bold text-primary-foreground">
        Tu {tramiteName} está listo
      </h3>
      <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
        <a
          href={documentUrl}
          download={`Certificado_${tramiteName.replace(/\s+/g, '_')}.pdf`}
        >
          <Download className="mr-2 h-5 w-5" />
          Descargar Documento (PDF)
        </a>
      </Button>
      <p className="text-center text-sm text-muted-foreground">O compártelo:</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={shareViaEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Email
        </Button>
        <Button variant="outline" onClick={shareViaWhatsApp}>
          <MessageSquare className="mr-2 h-4 w-4" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
