import { Customer } from 'src/modules/customers/customer.entity';
import { BaseEntity, Entity, QueryResult, Repository } from 'typeorm';
import {
  getAllConditionOptions,
  getAllForceOptions,
  getAllForces,
  getAllJoinOptions,
} from './interface.util';
import {
  bindFilterQuery,
  bindForceQuery,
  bindRangeQuery,
  bindSearchQuery,
  bindSortQuery,
} from './string.util';

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
    search?: string,
    sort?: string,
    filter?: string,
    force?: getAllForceOptions,
    join?: getAllJoinOptions,
    range?: string,
    specifyRange?: string,
  ): Promise<T[]> {
    const forceStr = bindForceQuery(force);
    const searchStr = bindSearchQuery(search);
    const filterStr = bindFilterQuery(filter, force);
    const rangeStr = bindRangeQuery(range);
    const sortStr = bindSortQuery(sort);
    const conditions = [forceStr, searchStr, filterStr, rangeStr, specifyRange];
    const available = conditions.reduce((result, item) => {
      if (item) result.push(item);
      return result;
    }, []);
    const whereString = `${
      available.length > 0 ? available.join(' AND ') : 'true'
    } ${sortStr ? `ORDER BY ${sortStr}` : ''}`;
    const repoWhere = await this.repository
      .createQueryBuilder(join?.rootName)
      .where(whereString);
    if (join) {
      for (let i = 0; i < join.joinColumns.length; i++) {
        repoWhere.leftJoinAndSelect(
          join.joinColumns[i].column,
          join.joinColumns[i].optional,
        );
      }
    }
    return repoWhere.getMany();
  }
}
