import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';

@Injectable()
export class SettingsService {
  constructor(private readonly repo: SettingsRepository) {}

  getGlobal() {
    return this.repo.getGlobal();
  }

  updateGlobal(patch: Record<string, unknown>) {
    return this.repo.updateGlobal(patch as any);
  }
}
