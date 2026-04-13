import { Request, Response } from 'express';
import ScrapeService from '../services/ScrapeService';
import StorageService from '../services/StorageService';
import { ScrapeRequest, ScrapeResponse } from '../../shared/types';

class ScrapeController {
  async scrape(req: Request, res: Response): Promise<void> {
    try {
      const request: ScrapeRequest = req.body;
      
      if (!request.keyword) {
        res.status(400).json({ success: false, error: 'Keyword is required' });
        return;
      }

      // 调用爬虫服务
      const products = await ScrapeService.scrape(request);
      
      // 保存数据到数据库
      await StorageService.saveProducts(products);
      
      const response: ScrapeResponse = {
        success: true,
        data: products
      };
      
      res.json(response);
    } catch (error) {
      console.error('Scrape error:', error);
      const response: ScrapeResponse = {
        success: false,
        error: 'Failed to scrape data'
      };
      res.status(500).json(response);
    }
  }
}

export default new ScrapeController();