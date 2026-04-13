import { Product, ScrapeRequest } from '../../shared/types';

class ScrapeService {
  async scrape(request: ScrapeRequest): Promise<Product[]> {
    const { keyword, platforms, limit } = request;
    let allProducts: Product[] = [];

    for (const platform of platforms) {
      switch (platform) {
        case 'jd':
          allProducts = [...allProducts, ...await this.scrapeJD(keyword, limit)];
          break;
        case 'taobao':
          allProducts = [...allProducts, ...await this.scrapeTaobao(keyword, limit)];
          break;
        case 'pdd':
          allProducts = [...allProducts, ...await this.scrapePDD(keyword, limit)];
          break;
      }
    }

    return this.processData(allProducts);
  }

  private async scrapeJD(keyword: string, limit: number): Promise<Product[]> {
    // 模拟京东数据
    return Array.from({ length: limit }, (_, i) => ({
      id: `jd-${Date.now()}-${i}`,
      name: `${keyword} 京东版 ${i + 1}`,
      price: Math.floor(Math.random() * 1000) + 100,
      sales: Math.floor(Math.random() * 10000),
      rating: (Math.random() * 1 + 4).toFixed(1),
      platform: '京东',
      url: `https://item.jd.com/${10000000000 + i}.html`,
      image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(keyword + ' product')}&image_size=square`,
      shopName: `京东自营店 ${i + 1}`,
      scrapedAt: new Date().toISOString()
    }));
  }

  private async scrapeTaobao(keyword: string, limit: number): Promise<Product[]> {
    // 模拟淘宝数据
    return Array.from({ length: limit }, (_, i) => ({
      id: `taobao-${Date.now()}-${i}`,
      name: `${keyword} 淘宝版 ${i + 1}`,
      price: Math.floor(Math.random() * 800) + 50,
      sales: Math.floor(Math.random() * 5000),
      rating: (Math.random() * 1 + 4).toFixed(1),
      platform: '淘宝',
      url: `https://item.taobao.com/item.htm?id=${10000000000 + i}`,
      image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(keyword + ' product')}&image_size=square`,
      shopName: `淘宝店铺 ${i + 1}`,
      scrapedAt: new Date().toISOString()
    }));
  }

  private async scrapePDD(keyword: string, limit: number): Promise<Product[]> {
    // 模拟拼多多数据
    return Array.from({ length: limit }, (_, i) => ({
      id: `pdd-${Date.now()}-${i}`,
      name: `${keyword} 拼多多版 ${i + 1}`,
      price: Math.floor(Math.random() * 500) + 20,
      sales: Math.floor(Math.random() * 20000),
      rating: (Math.random() * 1 + 4).toFixed(1),
      platform: '拼多多',
      url: `https://mobile.yangkeduo.com/goods.html?goods_id=${10000000000 + i}`,
      image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(keyword + ' product')}&image_size=square`,
      shopName: `拼多多店铺 ${i + 1}`,
      scrapedAt: new Date().toISOString()
    }));
  }

  private processData(products: Product[]): Product[] {
    // 数据清洗和去重
    const uniqueProducts = this.removeDuplicates(products);
    // 按价格排序
    return uniqueProducts.sort((a, b) => a.price - b.price);
  }

  private removeDuplicates(products: Product[]): Product[] {
    const seen = new Set<string>();
    return products.filter(product => {
      const key = `${product.platform}-${product.name}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

export default new ScrapeService();