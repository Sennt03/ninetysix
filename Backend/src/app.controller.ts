import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { getDatabaseType } from './config/database-type';

@ApiTags('health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Estado del servicio' })
  health() {
    return {
      status: 'ok',
      database: getDatabaseType(),
      sockets: process.env.ENABLE_SOCKETS === 'true',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
