import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Owner, Puppy, Service, WaitingListEntry } from '@along-puppyspa/shared';

interface CreateWaitingListEntryDto {
  owner: Omit<Owner, 'id'>;
  puppy: Omit<Puppy, 'id' | 'ownerId'>;
  serviceId: string;
  notes?: string;
  dailyListId?: string;
}

@Controller('waiting-list')
export class WaitingListController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  async createEntry(@Body() dto: CreateWaitingListEntryDto) {
    // First create the owner
    const owner = await this.supabaseService.createOwner(dto.owner);
    
    // Then create the puppy with the owner's ID
    const puppy = await this.supabaseService.createPuppy({
      ...dto.puppy,
      owner_id: owner.id
    });

    // Finally create the waiting list entry
    const entry = await this.supabaseService.createWaitingListEntry({
      owner_id: owner.id,
      puppy_id: puppy.id,
      service_id: dto.serviceId,
      notes: dto.notes,
      daily_list_id: dto.dailyListId,
      arrival_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return entry;
  }

  @Get()
  async getWaitingList() {
    return this.supabaseService.getWaitingList();
  }

  @Get(':id')
  async getEntry(@Param('id') id: string) {
    return this.supabaseService.getWaitingListEntry(id);
  }

  @Put(':id')
  async updateEntry(
    @Param('id') id: string,
    @Body() update: Partial<WaitingListEntry>
  ) {
    return this.supabaseService.updateWaitingListEntry(id, update);
  }

  @Delete(':id')
  async deleteEntry(@Param('id') id: string) {
    return this.supabaseService.deleteWaitingListEntry(id);
  }
} 