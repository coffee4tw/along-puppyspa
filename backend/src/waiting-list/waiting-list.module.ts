import { Module } from '@nestjs/common';
import { WaitingListController } from './waiting-list.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [WaitingListController],
})
export class WaitingListModule {} 