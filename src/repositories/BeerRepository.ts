import { AppDataSource } from '../config/database';
import { Beer } from '../entities/Beer';

export const BeerRepository = AppDataSource.getRepository(Beer).extend({
  async findByUserId(userId: string): Promise<Beer[]> {
    return this.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  },

  async createBeer(beerData: Partial<Beer>): Promise<Beer> {
    const beer = this.create(beerData);
    return this.save(beer);
  },

  async findByIdAndUserId(id: string, userId: string): Promise<Beer | null> {
    return this.findOne({
      where: { id, userId },
    });
  },

  async updateBeer(id: string, userId: string, beerData: Partial<Beer>): Promise<Beer | null> {
    await this.update({ id, userId }, beerData);
    return this.findByIdAndUserId(id, userId);
  },

  async deleteBeer(id: string, userId: string): Promise<void> {
    await this.delete({ id, userId });
  },
});
