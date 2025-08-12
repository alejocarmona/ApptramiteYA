"use client";

import { Button } from '@/components/ui/button';
import { TRAMITES, Tramite } from '@/lib/tramites';
import { FileText } from 'lucide-react';

type TramiteSelectorProps = {
  onSelect: (tramite: Tramite) => void;
};

export default function TramiteSelector({ onSelect }: TramiteSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {TRAMITES.map((tramite) => (
        <Button
          key={tramite.id}
          variant="outline"
          className="h-auto justify-start text-left p-3 bg-background hover:bg-primary/10 hover:border-primary/50"
          onClick={() => onSelect(tramite)}
        >
          <FileText className="w-5 h-5 mr-3 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold">{tramite.name}</span>
            <span className="text-xs text-muted-foreground">{tramite.description}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}
