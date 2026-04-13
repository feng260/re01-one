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
    const jdShops = ['京东自营', '京东官方旗舰店', '京东数码专营店', '京东家电专卖店', '京东手机旗舰店'];
    const jdSuffixes = ['Pro', 'Plus', 'Max', '标准版', '青春版', '旗舰版'];
    
    return Array.from({ length: limit }, (_, i) => {
      const price = Math.floor(Math.random() * 2000) + 500;
      const sales = Math.floor(Math.random() * 5000) + 1000;
      const rating = (Math.random() * 0.5 + 4.5).toFixed(1);
      const shop = jdShops[Math.floor(Math.random() * jdShops.length)];
      const suffix = jdSuffixes[Math.floor(Math.random() * jdSuffixes.length)];
      
      return {
        id: `jd-${Date.now()}-${i}`,
        name: `${keyword} ${suffix} ${i + 1} - ${shop}`,
        price: price,
        sales: sales,
        rating: rating,
        platform: '京东',
        url: `https://item.jd.com/${10000000000 + i}.html`,
        image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(keyword + ' product')}&image_size=square`,
        shopName: shop,
        scrapedAt: new Date().toISOString()
      };
    });
  }

  private async scrapeTaobao(keyword: string, limit: number): Promise<Product[]> {
    // 模拟淘宝数据
    const taobaoShops = ['官方旗舰店', '品牌专卖店', '授权经销商', '海外直供', '特惠店'];
    const taobaoSuffixes = ['正品保障', '假一赔十', '七天无理由', '现货速发', '包邮'];
    
    return Array.from({ length: limit }, (_, i) => {
      const price = Math.floor(Math.random() * 1500) + 300;
      const sales = Math.floor(Math.random() * 10000) + 500;
      const rating = (Math.random() * 0.5 + 4.5).toFixed(1);
      const shop = taobaoShops[Math.floor(Math.random() * taobaoShops.length)];
      const suffix = taobaoSuffixes[Math.floor(Math.random() * taobaoSuffixes.length)];
      
      return {
        id: `taobao-${Date.now()}-${i}`,
        name: `${keyword} ${i + 1} - ${shop} ${suffix}`,
        price: price,
        sales: sales,
        rating: rating,
        platform: '淘宝',
        url: `https://item.taobao.com/item.htm?id=${10000000000 + i}`,
        image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(keyword + ' product')}&image_size=square`,
        shopName: `淘宝${shop}`,
        scrapedAt: new Date().toISOString()
      };
    });
  }

  private async scrapePDD(keyword: string, limit: number): Promise<Product[]> {
    // 模拟拼多多数据
    const pddShops = ['百亿补贴', '拼团优惠', '工厂直销', '源头好货', '性价比之选'];
    const pddSuffixes = ['拼团价', '秒杀价', '特惠价', '限时折扣', '满减优惠'];
    
    return Array.from({ length: limit }, (_, i) => {
      const price = Math.floor(Math.random() * 1000) + 100;
      const sales = Math.floor(Math.random() * 20000) + 2000;
      const rating = (Math.random() * 0.5 + 4.5).toFixed(1);
      const shop = pddShops[Math.floor(Math.random() * pddShops.length)];
      const suffix = pddSuffixes[Math.floor(Math.random() * pddSuffixes.length)];
      
      return {
        id: `pdd-${Date.now()}-${i}`,
        name: `${keyword} ${i + 1} - ${shop} ${suffix}`,
        price: price,
        sales: sales,
        rating: rating,
        platform: '拼多多',
        url: `https://mobile.yangkeduo.com/goods.html?goods_id=${10000000000 + i}`,
        image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(keyword + ' product')}&image_size=square`,
        shopName: `拼多多${shop}`,
        scrapedAt: new Date().toISOString()
      };
    });
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