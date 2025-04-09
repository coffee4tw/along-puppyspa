import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ServicesController],
  providers: [SupabaseService],
})
export class ServicesModule {} 