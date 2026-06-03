import { BeerRepository } from '../repositories/BeerRepository';
import { Beer } from '../entities/Beer';
import { CreateBeerInput, UpdateBeerInput } from '../schemas/beer.schemas';
import { GoogleCalendarService } from './GoogleCalendarService';

const googleCalendarService = new GoogleCalendarService();

export class BeerService {
  async getBeers(userId: string, filters?: { status?: string; search?: string }): Promise<Beer[]> {
    const query = BeerRepository.createQueryBuilder('beer').where('beer.userId = :userId', { userId });

    if (filters?.status === 'consumed') {
      query.andWhere('beer.consumed = true');
    } else if (filters?.status === 'available') {
      query.andWhere('beer.consumed = false');
    }

    if (filters?.search) {
      query.andWhere(
        '(beer.name ILIKE :search OR beer.brewery ILIKE :search OR beer.style ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return query.orderBy('beer.createdAt', 'DESC').getMany();
  }

  async getBeerById(userId: string, beerId: string): Promise<Beer | null> {
    return BeerRepository.findOne({
      where: { id: beerId, userId },
    });
  }

  async createBeer(userId: string, beerData: CreateBeerInput): Promise<Beer> {
    const { purchaseDate, expirationDate, consumptionReminderDate, ...rest } = beerData;

    const beer = await BeerRepository.createBeer({
      ...rest,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      consumptionReminderDate: consumptionReminderDate ? new Date(consumptionReminderDate) : undefined,
      userId,
    });

    // Create calendar reminder if provided
    if (consumptionReminderDate) {
      try {
        await googleCalendarService.createReminder(
          userId,
          beerData.name,
          beerData.brewery,
          new Date(consumptionReminderDate)
        );
      } catch (error) {
        console.error('Failed to create calendar reminder:', error);
      }
    }

    return beer;
  }

  async updateBeer(userId: string, beerId: string, beerData: UpdateBeerInput): Promise<Beer | null> {
    const beer = await this.getBeerById(userId, beerId);
    if (!beer) {
      throw new Error('Beer not found');
    }

    await BeerRepository.update({ id: beerId, userId }, beerData);
    return this.getBeerById(userId, beerId);
  }

  async deleteBeer(userId: string, beerId: string): Promise<void> {
    const beer = await this.getBeerById(userId, beerId);
    if (!beer) {
      throw new Error('Beer not found');
    }

    await BeerRepository.delete({ id: beerId, userId });
  }

  async consumeBeer(userId: string, beerId: string, consumedAt?: string): Promise<Beer | null> {
    const beer = await this.getBeerById(userId, beerId);
    if (!beer) {
      throw new Error('Beer not found');
    }

    await BeerRepository.update(
      { id: beerId, userId },
      {
        consumed: true,
        consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
      }
    );

    return this.getBeerById(userId, beerId);
  }

  async getStatistics(userId: string): Promise<{
    totalBeers: number;
    consumedBeers: number;
    availableBeers: number;
    averageRating: number;
  }> {
    const beers = await this.getBeers(userId);

    const consumedBeers = beers.filter((b) => b.consumed).length;
    const availableBeers = beers.filter((b) => !b.consumed).length;
    const ratedBeers = beers.filter((b) => b.rating !== null && b.rating !== undefined);
    const averageRating =
      ratedBeers.length > 0 ? ratedBeers.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBeers.length : 0;

    return {
      totalBeers: beers.length,
      consumedBeers,
      availableBeers,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }
}
