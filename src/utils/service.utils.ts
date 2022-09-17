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

  async getAlls(
    search: string,
    sort: { key: string; value: string }[],
    filter: string,
    force?: { key: string; value: string },
    name?: string,
    join?: { key: string; value: string }[],
    range?: string,
  ): Promise<T[]> {
    let isAnd = '';
    if (search || filter || range) isAnd = ' AND ';
    let whereCondition = '';
    if (force?.key) {
      whereCondition += `"${force.key}" = '${force.value}' ${isAnd}`;
    }
    if (search) {
      whereCondition += search;
      if (filter) whereCondition += ` AND ${filter}`;
      if (range) whereCondition += ` AND ${range}`;
    } else {
      if (filter) {
        if (range) whereCondition += `${filter} AND ${range}`;
      } else if (range) {
        whereCondition += `${range}`;
      }
    }
    const repoWhere = await this.repository.createQueryBuilder(name);
    repoWhere.where(`${whereCondition}`);
    for (let i = 0; i < sort.length; i++) {
      if (i === 0) {
        await repoWhere.orderBy(
          `"${sort[i].key}"`,
          sort[i].value as 'ASC' | 'DESC',
        );
      } else {
        await repoWhere.addOrderBy(
          `"${sort[i].key}"`,
          sort[i].value as 'ASC' | 'DESC',
        );
      }
    }
    if (join) {
      for (let i = 0; i < join.length; i++) {
        repoWhere.leftJoinAndSelect(join[i].key, join[i].value);
      }
    }
    console.log(repoWhere.getQuery());
    return repoWhere.getMany();
  }
}
