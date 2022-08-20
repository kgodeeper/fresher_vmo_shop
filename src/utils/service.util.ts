import { timeStamp } from 'console';
import { BaseEntity, Repository } from 'typeorm';

export class ServiceUtil<T extends BaseEntity, R extends Repository<T>> {
  repository: R;
  constructor(repository: R) {
    this.repository = repository;
  }

  async findAll(condition: object | null): Promise<T[]> {
    return this.repository.find(condition);
  }

  async findOneByCondition(condition: object | null): Promise<T> {
    return this.repository.findOne(condition);
  }

  async addRecord(record: T): Promise<void> {
    const createdRecord = this.repository.create(record);
    createdRecord.save();
  }
}
