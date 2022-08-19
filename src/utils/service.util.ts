import { BaseEntity, Repository } from 'typeorm';

export class ServiceUtil<T extends BaseEntity, R extends Repository<T>> {
  repository: R;
  constructor(repository: R) {
    this.repository = repository;
  }

  findAll(): Promise<T[]> {
    return this.repository.find();
  }
}
