import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('delete/:tableName')
  async cdeleteTable(@Param('tableName') tableName: string) {
    return await this.appService.deleteTable(tableName);
  }

  @Get('scan/:tableName')
  async scanTable(@Param('tableName') tableName: string) {
    return await this.appService.scanTable(tableName);
  }
}
