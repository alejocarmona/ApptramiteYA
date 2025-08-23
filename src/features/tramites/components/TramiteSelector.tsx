'use client';

import {Card} from '@/components/ui/card';
import {TRAMITES, Tramite} from '@/features/tramites/lib/tramites';
import {FileText, ArrowRight} from 'lucide-react';

type TramiteSelectorProps = {
  onSelect: (tramite: Tramite) => void;
};

export default function TramiteSelector({onSelect}: TramiteSelectorProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {TRAMITES.map((tramite) => (
        <Card
          key={tramite.id}
          className="flex cursor-pointer flex-col justify-between bg-background p-4 transition-all hover:border-primary/50 hover:shadow-md"
          onClick={() => onSelect(tramite)}
        >
          <div className="flex items-start gap-4">
            <FileText className="h-6 w-6 shrink-0 text-primary" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold">{tramite.name}</span>
              <p className="mt-1 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                {tramite.description}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end">
            <span className="text-xs font-semibold text-primary">
              Seleccionar
            </span>
            <ArrowRight className="ml-2 h-4 w-4 text-primary" />
          </div>
        </Card>
      ))}
    </div>
  );
}
