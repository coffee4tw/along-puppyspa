import { Injectable, Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from './supabase.constants';
import { SupabaseClient } from '@supabase/supabase-js';
import { Owner, Puppy, Service, WaitingListEntry } from '@along-puppyspa/shared';

@Injectable()
export class SupabaseService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async getServices(): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  async createOwner(owner: Omit<Owner, 'id'>): Promise<Owner> {
    const { data, error } = await this.supabase
      .from('owners')
      .insert(owner)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createPuppy(puppy: Omit<Puppy, 'id'>): Promise<Puppy> {
    const { data, error } = await this.supabase
      .from('puppies')
      .insert(puppy)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createService(service: Omit<Service, 'id'>): Promise<Service> {
    const { data, error } = await this.supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateService(id: string, update: Partial<Service>): Promise<Service> {
    const { data, error } = await this.supabase
      .from('services')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteService(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async createWaitingListEntry(entry: Omit<WaitingListEntry, 'id' | 'status' | 'position'>): Promise<WaitingListEntry> {
    // Get the current highest position
    const { data: lastEntry } = await this.supabase
      .from('waiting_list')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = lastEntry ? lastEntry.position + 1 : 1;

    const { data, error } = await this.supabase
      .from('waiting_list')
      .insert({
        ...entry,
        status: 'waiting',
        position
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWaitingList(): Promise<WaitingListEntry[]> {
    const { data, error } = await this.supabase
      .from('waiting_list')
      .select(`
        *,
        owner:owners(*),
        puppy:puppies(*),
        service:services(*)
      `)
      .order('position', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getWaitingListEntry(id: string): Promise<WaitingListEntry> {
    const { data, error } = await this.supabase
      .from('waiting_list')
      .select(`
        *,
        owner:owners(*),
        puppy:puppies(*),
        service:services(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateWaitingListEntry(id: string, update: Partial<WaitingListEntry>): Promise<WaitingListEntry> {
    const { data, error } = await this.supabase
      .from('waiting_list')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWaitingListEntry(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('waiting_list')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 