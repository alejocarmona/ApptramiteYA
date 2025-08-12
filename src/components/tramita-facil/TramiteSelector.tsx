"use client";

import { Card } from '@/components/ui/card';
import { TRAMITES, Tramite } from '@/lib/tramites';
import { FileText, ArrowRight } from 'lucide-react';

type TramiteSelectorProps = {
  onSelect: (tramite: Tramite) => void;
};

export default function TramiteSelector({ onSelect }: TramiteSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {TRAMITES.map((tramite) => (
        <Card
          key={tramite.id}
          className="p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:border-primary/50 bg-background"
          onClick={() => onSelect(tramite)}
        >
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 mr-3 shrink-0 text-primary" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold truncate">{tramite.name}</span>
              <p className="text-xs text-muted-foreground mt-1 break-words whitespace-pre-wrap">
                {tramite.description}
              </p>
            </div>
          </div>
          <div className="flex justify-end items-center mt-4">
            <span className="text-xs font-semibold text-primary">Seleccionar</span>
            <ArrowRight className="w-4 h-4 ml-2 text-primary" />
          </div>
        </Card>
      ))}
    </div>
  );
}
