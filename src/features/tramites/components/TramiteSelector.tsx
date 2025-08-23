'use client';

import {Card} from '@/components/ui/card';
import {TRAMITES, Tramite} from '@/features/tramites/lib/tramites';
import {FileText, ArrowRight, CheckCircle2} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TramiteSelectorProps = {
  onSelect: (tramite: Tramite) => void;
};

export default function TramiteSelector({onSelect}: TramiteSelectorProps) {
  return (
    <div 
      className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 600px' }}
    >
      {TRAMITES.map((tramite) => (
        <Card
          key={tramite.id}
          className="group flex cursor-pointer flex-col justify-between p-4 ring-1 ring-transparent transition-all hover:shadow-lg hover:ring-primary/50"
          onClick={() => onSelect(tramite)}
        >
          <div>
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-foreground">{tramite.name}</span>
                 <p className="mt-1 text-xs text-muted-foreground">
                  {tramite.description}
                </p>
              </div>
            </div>
             <Badge variant="outline" className="mt-3 text-xs font-normal border-dashed">
                <CheckCircle2 className="mr-1.5 h-3 w-3 text-green-500" />
                {tramite.benefit}
            </Badge>
          </div>
          <div className="mt-4 flex min-h-[44px] items-center justify-end">
            <span className="text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Seleccionar
            </span>
            <div 
              aria-label={`Seleccionar ${tramite.name}`} 
              className="ml-2 flex items-center justify-center min-w-[44px]"
            >
              <ArrowRight 
                className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" 
                style={{ willChange: 'transform' }}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
