type LogArgs = [message?: unknown, ...optionalParams: unknown[]];

const formatMessage = (level: string, args: LogArgs) => {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}] ${level.toUpperCase()}:`, ...args];
};

export const logger = {
  info: (...args: LogArgs) => console.log(...formatMessage('info', args)),
  warn: (...args: LogArgs) => console.warn(...formatMessage('warn', args)),
  error: (...args: LogArgs) => console.error(...formatMessage('error', args)),
  debug: (...args: LogArgs) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...formatMessage('debug', args));
    }
  },
};
