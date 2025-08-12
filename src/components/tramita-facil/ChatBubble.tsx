"use client";

import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type ChatBubbleProps = {
  sender: 'user' | 'lia';
  content: React.ReactNode;
};

export default function ChatBubble({ sender, content }: ChatBubbleProps) {
  const isLia = sender === 'lia';

  return (
    <div className={cn('flex items-start gap-3', isLia ? 'justify-start' : 'justify-end')}>
      {isLia && (
        <Avatar className="w-10 h-10 border-2 border-primary/50">
          <AvatarFallback className="bg-primary/20 text-primary-foreground">
            <Bot />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-sm md:max-w-md rounded-2xl p-4 text-sm md:text-base',
          isLia
            ? 'bg-secondary text-secondary-foreground rounded-tl-none shadow-md'
            : 'bg-primary text-primary-foreground rounded-br-none shadow-md'
        )}
      >
        {content}
      </div>
      {!isLia && (
        <Avatar className="w-10 h-10 border-2 border-muted">
           <AvatarFallback className="bg-muted text-muted-foreground">
            <User />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
