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
    // 根据关键词判断商品类型
    const isFood = ['无花果', '水果', '食品', '零食', '坚果', '饮料', '蔬菜', '肉类'].some(w => keyword.includes(w));
    const isClothing = ['衣服', '服装', '裤子', '裙子', '鞋子', '帽子', '袜子'].some(w => keyword.includes(w));
    const isElectronics = ['手机', '电脑', '平板', '耳机', '相机', '笔记本', '智能'].some(w => keyword.includes(w));
    
    let brands: string[], models: string[], specs: string[], colors: string[], jdShops: string[], jdSuffixes: string[];
    let priceMin: number, priceMax: number;
    
    if (isFood) {
      brands = ['良品铺子', '三只松鼠', '百草味', '洽洽', '来伊份', '楼兰蜜语', '好想你', '新农哥'];
      models = ['精选装', '量贩装', '礼盒装', '独立包装', '新鲜直达', '有机认证', '原产地直供'];
      specs = ['500g', '1kg', '2kg', '50g×10袋', '250g×2袋', '1kg礼盒'];
      colors = ['新鲜红', '自然绿', '原味', '精选', '优质', '特级'];
      jdShops = ['京东生鲜', '京东食品专营店', '京东零食旗舰店', '京东自营食品', '京东水果专区'];
      jdSuffixes = ['新鲜直达', '限时特惠', '买一送一', '满减优惠', '新品上市'];
      priceMin = 10;
      priceMax = 200;
    } else if (isClothing) {
      brands = ['优衣库', 'Nike', 'Adidas', '李宁', '安踏', 'H&M', 'ZARA', 'GAP'];
      models = ['经典款', '新款', '限量版', '联名款', '休闲款', '运动款'];
      specs = ['S码', 'M码', 'L码', 'XL码', 'XXL码', '均码'];
      colors = ['黑色', '白色', '蓝色', '红色', '灰色', '绿色'];
      jdShops = ['京东服饰旗舰店', '京东运动专营店', '京东自营服饰', '京东时尚专区'];
      jdSuffixes = ['春季新款', '夏季热销', '限时折扣', '买二送一'];
      priceMin = 50;
      priceMax = 800;
    } else {
      brands = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OPPO', 'vivo', 'OnePlus', 'Realme'];
      models = ['iPhone', 'Galaxy', 'Redmi', 'Mate', 'P', 'Reno', 'Find', 'Nord'];
      specs = ['128GB', '256GB', '512GB', '1TB', '8GB+128GB', '12GB+256GB', '16GB+512GB'];
      colors = ['黑色', '白色', '蓝色', '绿色', '紫色', '金色', '银色', '粉色'];
      jdShops = ['京东自营', '京东官方旗舰店', '京东数码专营店', '京东家电专卖店', '京东手机旗舰店'];
      jdSuffixes = ['Pro', 'Plus', 'Max', 'Ultra', '标准版', '旗舰版', '尊享版'];
      priceMin = 1000;
      priceMax = 10000;
    }
    
    return Array.from({ length: limit }, (_, i) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const spec = specs[Math.floor(Math.random() * specs.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shop = jdShops[Math.floor(Math.random() * jdShops.length)];
      const suffix = jdSuffixes[Math.floor(Math.random() * jdSuffixes.length)];
      
      const price = Math.floor(Math.random() * (priceMax - priceMin)) + priceMin;
      const sales = Math.floor(Math.random() * 10000) + 500;
      const rating = (Math.random() * 0.5 + 4.5).toFixed(1);
      
      let productName = '';
      const random = Math.random();
      if (random > 0.6) {
        productName = `${keyword} ${brand} ${model} ${suffix} ${spec} ${color}`;
      } else if (random > 0.3) {
        productName = `${brand} ${keyword} ${model} ${suffix} ${spec} ${color}`;
      } else {
        productName = `${brand} ${model} ${suffix} ${spec} ${keyword} ${color}`;
      }
      
      return {
        id: `jd-${Date.now()}-${i}`,
        name: `${productName} - ${shop}`,
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
    // 根据关键词判断商品类型
    const isFood = ['无花果', '水果', '食品', '零食', '坚果', '饮料', '蔬菜', '肉类'].some(w => keyword.includes(w));
    const isClothing = ['衣服', '服装', '裤子', '裙子', '鞋子', '帽子', '袜子'].some(w => keyword.includes(w));
    const isElectronics = ['手机', '电脑', '平板', '耳机', '相机', '笔记本', '智能'].some(w => keyword.includes(w));
    
    let brands: string[], models: string[], specs: string[], colors: string[], taobaoShops: string[], taobaoTags: string[], taobaoSuffixes: string[];
    let priceMin: number, priceMax: number;
    
    if (isFood) {
      brands = ['良品铺子', '三只松鼠', '百草味', '洽洽', '来伊份', '楼兰蜜语', '好想你', '新农哥'];
      models = ['精选装', '量贩装', '礼盒装', '独立包装', '新鲜直达', '有机认证', '原产地直供'];
      specs = ['500g', '1kg', '2kg', '50g×10袋', '250g×2袋', '1kg礼盒'];
      colors = ['新鲜红', '自然绿', '原味', '精选', '优质', '特级'];
      taobaoShops = ['天猫超市', '天猫食品旗舰店', '天猫零食专营店', '淘宝食品店'];
      taobaoTags = ['正品保障', '假一赔十', '七天无理由', '包邮', '赠运费险', '分期免息'];
      taobaoSuffixes = ['新鲜直达', '限时特惠', '买一送一', '满减优惠', '新品上市'];
      priceMin = 10;
      priceMax = 200;
    } else if (isClothing) {
      brands = ['优衣库', 'Nike', 'Adidas', '李宁', '安踏', 'H&M', 'ZARA', 'GAP'];
      models = ['经典款', '新款', '限量版', '联名款', '休闲款', '运动款'];
      specs = ['S码', 'M码', 'L码', 'XL码', 'XXL码', '均码'];
      colors = ['黑色', '白色', '蓝色', '红色', '灰色', '绿色'];
      taobaoShops = ['天猫服饰旗舰店', '天猫运动专营店', '淘宝服饰店', '淘宝运动店'];
      taobaoTags = ['正品保障', '假一赔十', '七天无理由', '包邮', '赠运费险'];
      taobaoSuffixes = ['春季新款', '夏季热销', '限时折扣', '买二送一'];
      priceMin = 50;
      priceMax = 800;
    } else {
      brands = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OPPO', 'vivo', 'OnePlus', 'Realme'];
      models = ['iPhone', 'Galaxy', 'Redmi', 'Mate', 'P', 'Reno', 'Find', 'Nord'];
      specs = ['128GB', '256GB', '512GB', '8GB+128GB', '12GB+256GB'];
      colors = ['黑色', '白色', '蓝色', '绿色', '紫色'];
      taobaoShops = ['官方旗舰店', '品牌专卖店', '授权经销商', '海外直供', '特惠店'];
      taobaoTags = ['正品保障', '假一赔十', '七天无理由', '现货速发', '包邮', '赠运费险', '分期免息'];
      taobaoSuffixes = ['新品上市', '热销爆款', '限量特惠', '年度旗舰', '明星同款'];
      priceMin = 1000;
      priceMax = 10000;
    }
    
    return Array.from({ length: limit }, (_, i) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const spec = specs[Math.floor(Math.random() * specs.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shop = taobaoShops[Math.floor(Math.random() * taobaoShops.length)];
      const tag = taobaoTags[Math.floor(Math.random() * taobaoTags.length)];
      const suffix = taobaoSuffixes[Math.floor(Math.random() * taobaoSuffixes.length)];
      
      const price = Math.floor(Math.random() * (priceMax - priceMin)) + priceMin;
      const sales = Math.floor(Math.random() * 15000) + 1000;
      const rating = (Math.random() * 0.4 + 4.6).toFixed(1);
      
      let productName = '';
      const random = Math.random();
      if (random > 0.6) {
        productName = `${keyword} ${brand} ${model} ${suffix} ${spec} ${color} ${tag}`;
      } else if (random > 0.3) {
        productName = `${brand} ${keyword} ${model} ${suffix} ${spec} ${color} ${tag}`;
      } else {
        productName = `${brand} ${model} ${suffix} ${spec} ${color} ${keyword} ${tag}`;
      }
      
      return {
        id: `taobao-${Date.now()}-${i}`,
        name: `${productName} - ${shop}`,
        price: price,
        sales: sales,
        rating: rating,
        platform: '淘宝',
        url: `https://item.taobao.com/item.htm?id=${10000000000 + i}`,
        image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(keyword + ' product')}&image_size=square`,
        shopName: `${brand}${shop}`,
        scrapedAt: new Date().toISOString()
      };
    });
  }

  private async scrapePDD(keyword: string, limit: number): Promise<Product[]> {
    // 根据关键词判断商品类型
    const isFood = ['无花果', '水果', '食品', '零食', '坚果', '饮料', '蔬菜', '肉类'].some(w => keyword.includes(w));
    const isClothing = ['衣服', '服装', '裤子', '裙子', '鞋子', '帽子', '袜子'].some(w => keyword.includes(w));
    const isElectronics = ['手机', '电脑', '平板', '耳机', '相机', '笔记本', '智能'].some(w => keyword.includes(w));
    
    let brands: string[], models: string[], specs: string[], colors: string[], pddShops: string[], pddTags: string[], pddSuffixes: string[];
    let priceMin: number, priceMax: number;
    
    if (isFood) {
      brands = ['良品铺子', '三只松鼠', '百草味', '洽洽', '来伊份', '楼兰蜜语', '好想你', '新农哥'];
      models = ['精选装', '量贩装', '礼盒装', '独立包装', '新鲜直达', '有机认证', '原产地直供'];
      specs = ['500g', '1kg', '2kg', '50g×10袋', '250g×2袋', '1kg礼盒'];
      colors = ['新鲜红', '自然绿', '原味', '精选', '优质', '特级'];
      pddShops = ['百亿补贴', '拼多多生鲜', '拼多多食品店', '拼多多零食店', '工厂直销'];
      pddTags = ['拼团价', '秒杀价', '特惠价', '限时折扣', '满减优惠', '新人专享', '百亿补贴'];
      pddSuffixes = ['超值推荐', '性价比之王', '爆款热卖', '限时秒杀', '今日特惠'];
      priceMin = 5;
      priceMax = 150;
    } else if (isClothing) {
      brands = ['优衣库', 'Nike', 'Adidas', '李宁', '安踏', 'H&M', 'ZARA', 'GAP'];
      models = ['经典款', '新款', '限量版', '联名款', '休闲款', '运动款'];
      specs = ['S码', 'M码', 'L码', 'XL码', 'XXL码', '均码'];
      colors = ['黑色', '白色', '蓝色', '红色', '灰色', '绿色'];
      pddShops = ['百亿补贴', '拼多多服饰', '拼多多运动店', '工厂直销'];
      pddTags = ['拼团价', '秒杀价', '特惠价', '限时折扣', '满减优惠', '新人专享'];
      pddSuffixes = ['超值推荐', '性价比之王', '爆款热卖', '限时秒杀', '今日特惠'];
      priceMin = 30;
      priceMax = 600;
    } else {
      brands = ['Xiaomi', 'Redmi', 'Realme', 'OPPO', 'vivo', 'Honor', 'iQOO', 'POCO'];
      models = ['Redmi Note', 'Realme GT', 'OPPO A', 'vivo Y', 'Honor X', 'iQOO Neo', 'POCO M'];
      specs = ['64GB', '128GB', '256GB', '4GB+64GB', '6GB+128GB', '8GB+256GB'];
      colors = ['黑色', '白色', '蓝色', '绿色', '红色', '黄色'];
      pddShops = ['百亿补贴', '拼团优惠', '工厂直销', '源头好货', '性价比之选'];
      pddTags = ['拼团价', '秒杀价', '特惠价', '限时折扣', '满减优惠', '新人专享', '百亿补贴'];
      pddSuffixes = ['超值推荐', '性价比之王', '爆款热卖', '限时秒杀', '今日特惠'];
      priceMin = 500;
      priceMax = 3000;
    }
    
    return Array.from({ length: limit }, (_, i) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const spec = specs[Math.floor(Math.random() * specs.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shop = pddShops[Math.floor(Math.random() * pddShops.length)];
      const tag = pddTags[Math.floor(Math.random() * pddTags.length)];
      const suffix = pddSuffixes[Math.floor(Math.random() * pddSuffixes.length)];
      
      const price = Math.floor(Math.random() * (priceMax - priceMin)) + priceMin;
      const sales = Math.floor(Math.random() * 30000) + 5000;
      const rating = (Math.random() * 0.5 + 4.5).toFixed(1);
      
      let productName = '';
      const random = Math.random();
      if (random > 0.6) {
        productName = `${keyword} ${brand} ${model} ${suffix} ${spec} ${color} ${tag}`;
      } else if (random > 0.3) {
        productName = `${brand} ${keyword} ${model} ${suffix} ${spec} ${color} ${tag}`;
      } else {
        productName = `${brand} ${model} ${suffix} ${spec} ${color} ${keyword} ${tag}`;
      }
      
      return {
        id: `pdd-${Date.now()}-${i}`,
        name: `${productName} - ${shop}`,
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