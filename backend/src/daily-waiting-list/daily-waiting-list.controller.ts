import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { DailyWaitingList, WaitingListEntry } from '@along-puppyspa/shared';

@Controller('daily-waiting-list')
export class DailyWaitingListController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getDailyWaitingLists() {
    return await this.supabaseService.getDailyWaitingLists();
  }

  @Get(':date')
  async getDailyWaitingList(@Param('date') date: string) {
    return await this.supabaseService.getDailyWaitingList(date);
  }

  @Post()
  async createDailyWaitingList(@Body() dto: { date: string }) {
    // Check if a waiting list already exists for this date
    const existingList = await this.supabaseService.getDailyWaitingList(dto.date);
    if (existingList) {
      return existingList;
    }

    // Create a new daily waiting list
    return await this.supabaseService.createDailyWaitingList({
      date: dto.date,
      entries: [],
    });
  }
} 