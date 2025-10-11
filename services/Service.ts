import {
  Repository,
  ObjectLiteral,
  DeepPartial,
  FindOptionsWhere,
  In,
} from "typeorm";
import { Service as TypediService, Container } from "typedi";
import { Action } from "routing-controllers";

@TypediService()
export class Service<T extends ObjectLiteral & { id: string; user: any }> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  protected getCurrentUser() {
    const action = Container.get<Action>("auth_user");
    if (!action?.request?.user) {
      throw new Error(
        "Kullanıcı kimliği doğrulanamadı. Lütfen tekrar deneyiniz.",
      );
    }
    return action.request.user;
  }

  async getAll(
    filters: Partial<T> = {},
    page: number = 1,
    perPage: number = 10,
  ): Promise<T[]> {
    const currentUser = this.getCurrentUser();

    return this.repository.find({
      where: {
        ...filters,
        user: { id: currentUser.id },
      } as FindOptionsWhere<T>,
      skip: (page - 1) * perPage,
      take: perPage,
    });
  }

  async getById(id: string): Promise<T | null> {
    const currentUser = this.getCurrentUser();

    return this.repository.findOne({
      where: { id, user: { id: currentUser.id } } as FindOptionsWhere<T>,
    });
  }

  async findByIds(ids: string[]): Promise<T[]> {
    const currentUser = this.getCurrentUser();

    return this.repository.find({
      where: {
        id: In(ids),
        user: { id: currentUser.id },
      } as FindOptionsWhere<T>,
    });
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const currentUser = this.getCurrentUser();

    const entity = this.repository.create({
      ...data,
      user: { id: currentUser.id },
    });

    return this.repository.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    const currentUser = this.getCurrentUser();

    const entity = await this.getById(id);
    if (!entity) return null;

    Object.assign(entity, { ...data, user: { id: currentUser.id } });
    return this.repository.save(entity);
  }

  async delete(id: string): Promise<boolean> {
    const currentUser = this.getCurrentUser();

    const entity = await this.getById(id);
    if (!entity) return false;

    if (this.repository.softRemove) {
      await this.repository.softRemove(entity);
    } else {
      await this.repository.remove(entity);
    }
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const currentUser = this.getCurrentUser();

    const entity = await this.getById(id);
    if (!entity) return false;

    try {
      await this.repository.restore(id);
      return true;
    } catch {
      return false;
    }
  }

  async search(search: Partial<T>): Promise<T[]> {
    const currentUser = this.getCurrentUser();

    return this.repository.find({
      where: { ...search, user: { id: currentUser.id } } as FindOptionsWhere<T>,
    });
  }
}
