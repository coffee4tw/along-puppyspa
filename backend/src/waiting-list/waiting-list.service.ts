import { Injectable } from '@nestjs/common';
import { WaitingListEntry, Owner, Puppy, Service } from '@along-puppyspa/shared';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WaitingListService {
  constructor(private supabaseService: SupabaseService) {}

  async createWaitingListEntry(data: {
    owner: Omit<Owner, 'id'>;
    puppy: Omit<Puppy, 'id' | 'ownerId'>;
    serviceId: string;
    notes?: string;
  }): Promise<WaitingListEntry> {
    // Create the owner
    const owner = await this.supabaseService.createOwner(data.owner);

    // Create the puppy with the owner's ID
    const puppy = await this.supabaseService.createPuppy({
      ...data.puppy,
      owner_id: owner.id,
    });

    // Create the waiting list entry
    return this.supabaseService.createWaitingListEntry({
      owner_id: owner.id,
      puppy_id: puppy.id,
      service_id: data.serviceId,
      notes: data.notes,
      arrival_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // ... existing code ...
} 