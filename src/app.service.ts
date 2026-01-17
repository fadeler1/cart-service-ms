import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
  version: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    const uptime = process.uptime();
    return {
      status: 'ok',
      message: 'Cart Service is running',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version: '1.0.0',
    };
  }
}
