/**
 * User Repository Interface
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<any | null>;

  findById(id: string): Promise<any | null>;

  create(user: any): Promise<any>;

  update(id: string, updates: any): Promise<any | null>;

  delete(id: string): Promise<boolean>;

  exists(id: string): Promise<boolean>;

  count(): Promise<number>;
}
