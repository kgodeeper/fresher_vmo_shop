import { Customer } from 'src/modules/customers/customer.entity';
import { BaseEntity, Entity, Repository } from 'typeorm';

export class ServiceUtil<T extends BaseEntity, R extends Repository<T>> {
  protected repository: R;
  constructor(repository: R) {
    this.repository = repository;
  }

  async findOneByCondition(condition: object | object[]): Promise<T> {
    return this.repository.findOne({ where: condition });
  }

  async findAllByCondition(condition: object | object[]): Promise<T[]> {
    return this.repository.find({ where: condition });
  }

  async countAllByCondition(condition: object | object[]): Promise<number> {
    return (await this.repository.findAndCount({ where: condition }))[1];
  }

  async findAllWithLimit(offset: number, limit: number): Promise<T[]> {
    return this.repository
      .createQueryBuilder()
      .offset(offset)
      .limit(limit)
      .getMany();
  }

  async findOneAndJoin(
    relative: object,
    condition: object | object[],
  ): Promise<T> {
    return this.repository.findOne({ relations: relative, where: condition });
  }

  async countAllWithJoin(
    relative: object,
    condition: object | object[],
  ): Promise<number> {
    return (
      await this.repository.findAndCount({
        relations: relative,
        where: condition,
      })
    )[1];
  }

  async findAllWithJoin(
    relative: object,
    condition: object | object[],
  ): Promise<T[]> {
    return this.repository.find({
      relations: relative,
      where: condition,
    });
  }
}
