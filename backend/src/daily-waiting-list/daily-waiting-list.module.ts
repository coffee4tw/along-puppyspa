import { Module } from '@nestjs/common';
import { DailyWaitingListController } from './daily-waiting-list.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [DailyWaitingListController],
})
export class DailyWaitingListModule {} 