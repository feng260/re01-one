import { Request, Response } from 'express';
import StorageService from '../services/StorageService';
import { ResultsResponse } from '../../shared/types';

class ResultsController {
  async getResults(req: Request, res: Response): Promise<void> {
    try {
      const { keyword, sortBy = 'price' } = req.query;
      
      if (!keyword) {
        res.status(400).json({ success: false, error: 'Keyword is required' });
        return;
      }

      // 获取商品数据
      const products = await StorageService.getProducts(keyword as string, sortBy as string);
      
      // 获取可视化数据
      const priceTrend = await StorageService.getPriceTrend();
      const platformDistribution = await StorageService.getPlatformDistribution();
      
      const response: ResultsResponse = {
        success: true,
        data: products,
        visualization: {
          priceTrend,
          platformDistribution
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Get results error:', error);
      res.status(500).json({ success: false, error: 'Failed to get results' });
    }
  }
}

export default new ResultsController();