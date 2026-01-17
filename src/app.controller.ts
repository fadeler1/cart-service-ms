import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verifica el estado de salud del servicio. Retorna información sobre el estado del servicio.',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio funcionando correctamente',
    schema: {
      example: {
        status: 'ok',
        message: 'Cart Service is running',
        timestamp: '2026-01-17T05:00:00.000Z',
        uptime: 3600,
        version: '1.0.0',
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
