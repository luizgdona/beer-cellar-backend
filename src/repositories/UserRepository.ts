import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export const UserRepository = AppDataSource.getRepository(User).extend({
  
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  },

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  },

  async createUser(email: string, password: string, name: string): Promise<User> {
    const user = this.create({ email, password, name });
    return this.save(user);
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    await this.update(id, data);
    return this.findById(id) as Promise<User>;
  },

  async deleteUser(id: string): Promise<void> {
    await this.delete(id);
  },
});
