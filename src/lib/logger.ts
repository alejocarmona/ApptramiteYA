
'use client';

import {useCallback} from 'react';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

const getTimestamp = () => new Date().toISOString();

const LOG_STYLES = {
  INFO: {
    badge: 'background: #3b82f6; color: white; border-radius: 4px; padding: 2px 6px;',
    message: 'color: #3b82f6;',
  },
  WARN: {
    badge: 'background: #f59e0b; color: white; border-radius: 4px; padding: 2px 6px;',
    message: 'color: #f59e0b;',
  },
  ERROR: {
    badge: 'background: #ef4444; color: white; border-radius: 4px; padding: 2px 6px;',
    message: 'color: #ef4444;',
  },
  SUCCESS: {
    badge: 'background: #22c55e; color: white; border-radius: 4px; padding: 2px 6px;',
    message: 'color: #22c55e;',
  },
};

export function useAppLogger(context: string) {
  const log = useCallback(
    (level: LogLevel, message: string, data?: object) => {
      if (process.env.NODE_ENV === 'development') {
        const timestamp = getTimestamp();
        const styles = LOG_STYLES[level];

        console.groupCollapsed(
          `%c${timestamp}%c %c[${context}]%c ${message}`,
          'color: gray; font-weight: lighter;',
          '',
          styles.badge,
          styles.message,
        );

        if (data) {
          console.log(data);
        }

        console.groupEnd();
      }
    },
    [context]
  );

  return {log};
}
