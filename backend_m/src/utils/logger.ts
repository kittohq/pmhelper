// Simple logger utility for hackathon - zero dependencies, colorful output

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function colorize(color: keyof typeof colors, text: string): string {
  return `${colors[color]}${text}${colors.reset}`;
}

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${colorize('gray', `[${timestamp()}]`)} ${colorize('blue', '📋')} ${message}`, ...args);
  },

  success: (message: string, ...args: any[]) => {
    console.log(`${colorize('gray', `[${timestamp()}]`)} ${colorize('green', '✅')} ${message}`, ...args);
  },

  error: (message: string, error?: any, ...args: any[]) => {
    console.error(`${colorize('gray', `[${timestamp()}]`)} ${colorize('red', '❌')} ${message}`, ...args);
    if (error && process.env.NODE_ENV !== 'production') {
      console.error(colorize('red', error.stack || error));
    }
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`${colorize('gray', `[${timestamp()}]`)} ${colorize('yellow', '⚠️')} ${message}`, ...args);
  },

  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${colorize('gray', `[${timestamp()}]`)} ${colorize('magenta', '🔍')} ${message}`, ...args);
    }
  },

  db: (query: string, params?: any[], result?: { changes?: number; rows?: number }) => {
    const paramStr = params && params.length > 0 ? ` [${params.join(', ')}]` : '';
    const resultStr = result ? 
      (result.changes !== undefined ? ` - ${result.changes} affected` : 
       result.rows !== undefined ? ` - ${result.rows} returned` : '') : '';
    console.log(`${colorize('gray', `[${timestamp()}]`)} ${colorize('cyan', '💾')} [DB] ${query}${paramStr}${resultStr}`);
  },

  request: (method: string, url: string, status: number, duration: number, requestId?: string) => {
    const statusColor = status >= 400 ? 'red' : status >= 300 ? 'yellow' : 'green';
    const emoji = method === 'GET' ? '📤' : method === 'POST' ? '📥' : method === 'PUT' ? '📝' : method === 'DELETE' ? '🗑️' : '📋';
    const idStr = requestId ? ` [${requestId}]` : '';
    console.log(
      `${colorize('gray', `[${timestamp()}]`)} ${colorize(statusColor, emoji)} ${method} ${url} - ${colorize(statusColor, status.toString())} (${duration}ms)${idStr}`
    );
  },

  server: (message: string, ...args: any[]) => {
    console.log(`${colorize('gray', `[${timestamp()}]`)} ${colorize('magenta', '🚀')} ${message}`, ...args);
  }
};
