import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Service } from '@along-puppyspa/shared';

@Controller('services')
export class ServicesController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getServices() {
    return this.supabaseService.getServices();
  }

  @Post()
  async createService(@Body() service: Omit<Service, 'id'>) {
    return this.supabaseService.createService(service);
  }

  @Put(':id')
  async updateService(
    @Param('id') id: string,
    @Body() update: Partial<Service>
  ) {
    return this.supabaseService.updateService(id, update);
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return this.supabaseService.deleteService(id);
  }
} 