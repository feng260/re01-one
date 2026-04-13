#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import ScrapeService from '../api/services/ScrapeService';
import StorageService from '../api/services/StorageService';

program
  .version('1.0.0')
  .description('电商商品价格采集与对比工具')
  .option('-k, --keyword <keyword>', '商品关键词')
  .option('-p, --platforms <platforms>', '电商平台，多个平台用逗号分隔', 'jd,taobao,pdd')
  .option('-l, --limit <limit>', '每平台采集数量', '5')
  .option('-o, --output <output>', '输出文件路径', 'results.json');

program.parse(process.argv);

const options = program.opts();

if (!options.keyword) {
  console.error('请输入商品关键词');
  program.help();
  process.exit(1);
}

async function run() {
  console.log('开始采集商品数据...');
  
  try {
    const request = {
      keyword: options.keyword,
      platforms: options.platforms.split(','),
      limit: parseInt(options.limit)
    };

    const products = await ScrapeService.scrape(request);
    
    // 保存数据到数据库
    await StorageService.saveProducts(products);
    
    // 保存到文件
    const outputPath = path.resolve(options.output);
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    
    console.log(`采集完成，共获取 ${products.length} 个商品`);
    console.log(`结果已保存到: ${outputPath}`);
    
    // 显示前5个商品
    console.log('\n前5个商品:');
    products.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ¥${product.price} (${product.platform})`);
    });
    
  } catch (error) {
    console.error('采集失败:', error.message);
  }
}

run();