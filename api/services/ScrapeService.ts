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
    const brands = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OPPO', 'vivo', 'OnePlus', 'Realme'];
    const models = ['iPhone', 'Galaxy', 'Redmi', 'Mate', 'P', 'Reno', 'Find', 'Nord'];
    const specs = ['128GB', '256GB', '512GB', '1TB', '8GB+128GB', '12GB+256GB', '16GB+512GB'];
    const colors = ['黑色', '白色', '蓝色', '绿色', '紫色', '金色', '银色', '粉色'];
    const jdShops = ['京东自营', '京东官方旗舰店', '京东数码专营店', '京东家电专卖店', '京东手机旗舰店'];
    
    return Array.from({ length: limit }, (_, i) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const spec = specs[Math.floor(Math.random() * specs.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shop = jdShops[Math.floor(Math.random() * jdShops.length)];
      
      // 根据品牌和型号设置价格区间
      let price = 0;
      if (brand === 'Apple') {
        price = Math.floor(Math.random() * 5000) + 5000; // 5000-10000
      } else if (brand === 'Samsung') {
        price = Math.floor(Math.random() * 4000) + 4000; // 4000-8000
      } else {
        price = Math.floor(Math.random() * 3000) + 2000; // 2000-5000
      }
      
      const sales = Math.floor(Math.random() * 8000) + 2000; // 2000-10000
      const rating = (Math.random() * 0.3 + 4.7).toFixed(1); // 4.7-5.0
      
      return {
        id: `jd-${Date.now()}-${i}`,
        name: `${brand} ${model} ${spec} ${color} - ${shop}`,
        price: price,
        sales: sales,
        rating: rating,
        platform: '京东',
        url: `https://item.jd.com/${10000000000 + i}.html`,
        image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(brand + ' ' + model + ' smartphone')}&image_size=square`,
        shopName: shop,
        scrapedAt: new Date().toISOString()
      };
    });
  }

  private async scrapeTaobao(keyword: string, limit: number): Promise<Product[]> {
    // 模拟淘宝数据
    const brands = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OPPO', 'vivo', 'OnePlus', 'Realme'];
    const models = ['iPhone', 'Galaxy', 'Redmi', 'Mate', 'P', 'Reno', 'Find', 'Nord'];
    const specs = ['128GB', '256GB', '512GB', '8GB+128GB', '12GB+256GB'];
    const colors = ['黑色', '白色', '蓝色', '绿色', '紫色'];
    const taobaoShops = ['官方旗舰店', '品牌专卖店', '授权经销商', '海外直供', '特惠店'];
    const taobaoTags = ['正品保障', '假一赔十', '七天无理由', '现货速发', '包邮', '赠运费险', '分期免息'];
    
    return Array.from({ length: limit }, (_, i) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const spec = specs[Math.floor(Math.random() * specs.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shop = taobaoShops[Math.floor(Math.random() * taobaoShops.length)];
      const tag = taobaoTags[Math.floor(Math.random() * taobaoTags.length)];
      
      // 根据品牌和型号设置价格区间
      let price = 0;
      if (brand === 'Apple') {
        price = Math.floor(Math.random() * 4000) + 4500; // 4500-8500
      } else if (brand === 'Samsung') {
        price = Math.floor(Math.random() * 3000) + 3500; // 3500-6500
      } else {
        price = Math.floor(Math.random() * 2500) + 1500; // 1500-4000
      }
      
      const sales = Math.floor(Math.random() * 15000) + 1000; // 1000-16000
      const rating = (Math.random() * 0.4 + 4.6).toFixed(1); // 4.6-5.0
      
      return {
        id: `taobao-${Date.now()}-${i}`,
        name: `${brand} ${model} ${spec} ${color} ${tag} - ${shop}`,
        price: price,
        sales: sales,
        rating: rating,
        platform: '淘宝',
        url: `https://item.taobao.com/item.htm?id=${10000000000 + i}`,
        image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(brand + ' ' + model + ' smartphone')}&image_size=square`,
        shopName: `${brand}${shop}`,
        scrapedAt: new Date().toISOString()
      };
    });
  }

  private async scrapePDD(keyword: string, limit: number): Promise<Product[]> {
    // 模拟拼多多数据
    const brands = ['Xiaomi', 'Redmi', 'Realme', 'OPPO', 'vivo', 'Honor', 'iQOO', 'POCO'];
    const models = ['Redmi Note', 'Realme GT', 'OPPO A', 'vivo Y', 'Honor X', 'iQOO Neo', 'POCO M'];
    const specs = ['64GB', '128GB', '256GB', '4GB+64GB', '6GB+128GB', '8GB+256GB'];
    const colors = ['黑色', '白色', '蓝色', '绿色', '红色', '黄色'];
    const pddShops = ['百亿补贴', '拼团优惠', '工厂直销', '源头好货', '性价比之选'];
    const pddTags = ['拼团价', '秒杀价', '特惠价', '限时折扣', '满减优惠', '新人专享', '百亿补贴'];
    
    return Array.from({ length: limit }, (_, i) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const spec = specs[Math.floor(Math.random() * specs.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shop = pddShops[Math.floor(Math.random() * pddShops.length)];
      const tag = pddTags[Math.floor(Math.random() * pddTags.length)];
      
      // 拼多多价格相对较低
      let price = 0;
      if (brand === 'Xiaomi' || brand === 'Redmi') {
        price = Math.floor(Math.random() * 1500) + 800; // 800-2300
      } else {
        price = Math.floor(Math.random() * 1200) + 600; // 600-1800
      }
      
      const sales = Math.floor(Math.random() * 30000) + 5000; // 5000-35000
      const rating = (Math.random() * 0.5 + 4.5).toFixed(1); // 4.5-5.0
      
      return {
        id: `pdd-${Date.now()}-${i}`,
        name: `${brand} ${model} ${spec} ${color} ${tag} - ${shop}`,
        price: price,
        sales: sales,
        rating: rating,
        platform: '拼多多',
        url: `https://mobile.yangkeduo.com/goods.html?goods_id=${10000000000 + i}`,
        image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(brand + ' ' + model + ' smartphone')}&image_size=square`,
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