import { Router } from 'express';
import { BeerService } from '../services/BeerService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { CreateBeerSchema, UpdateBeerSchema, ConsumeBeerSchema } from '../schemas/beer.schemas';
import { Logger } from '../utils/logger';

const router = Router();
const beerService = new BeerService();

// Get all beers for current user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, search } = req.query;
    const beers = await beerService.getBeers(req.user!.id, {
      status: status as string,
      search: search as string,
    });

    res.json({
      success: true,
      data: { beers, count: beers.length },
    });
  } catch (error) {
    Logger.error('Failed to fetch beers', error);
    res.status(500).json({ success: false, error: 'Failed to fetch beers' });
  }
});

// Get single beer
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const beerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const beer = await beerService.getBeerById(req.user!.id, beerId);
    
    if (!beer) {
      return res.status(404).json({ success: false, error: 'Beer not found' });
    }

    res.json({ success: true, data: { beer } });
  } catch (error) {
    Logger.error('Failed to fetch beer', error);
    res.status(500).json({ success: false, error: 'Failed to fetch beer' });
  }
});

// Create new beer
router.post('/', authenticateToken, validate(CreateBeerSchema), async (req: AuthRequest, res) => {
  try {
    const beer = await beerService.createBeer(req.user!.id, req.body);
    
    Logger.info('Beer created', { beerId: beer.id, userId: req.user!.id });
    
    res.status(201).json({
      success: true,
      data: { beer },
    });
  } catch (error) {
    Logger.error('Failed to create beer', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create beer',
    });
  }
});

// Update beer
router.put('/:id', authenticateToken, validate(UpdateBeerSchema), async (req: AuthRequest, res) => {
  try {
    const beerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const beer = await beerService.updateBeer(req.user!.id, beerId, req.body);
    
    if (!beer) {
      return res.status(404).json({ success: false, error: 'Beer not found' });
    }

    Logger.info('Beer updated', { beerId: req.params.id });
    
    res.json({
      success: true,
      data: { beer },
    });
  } catch (error) {
    Logger.error('Failed to update beer', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update beer',
    });
  }
});

// Delete beer
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const beerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await beerService.deleteBeer(req.user!.id, beerId);
    
    Logger.info('Beer deleted', { beerId: req.params.id });
    
    res.json({
      success: true,
      message: 'Beer deleted successfully',
    });
  } catch (error) {
    Logger.error('Failed to delete beer', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete beer',
    });
  }
});

// Mark beer as consumed
router.patch('/:id/consume', authenticateToken, validate(ConsumeBeerSchema), async (req: AuthRequest, res) => {
  try {
    const beerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const beer = await beerService.consumeBeer(req.user!.id, beerId, req.body.consumedAt);
    
    if (!beer) {
      return res.status(404).json({ success: false, error: 'Beer not found' });
    }

    Logger.info('Beer marked as consumed', { beerId: req.params.id });
    
    res.json({
      success: true,
      data: { beer },
    });
  } catch (error) {
    Logger.error('Failed to consume beer', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to consume beer',
    });
  }
});

// Get beer statistics
router.get('/stats/summary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const stats = await beerService.getStatistics(req.user!.id);
    
    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    Logger.error('Failed to fetch statistics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

export default router;
