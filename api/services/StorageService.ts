import sqlite3 from 'sqlite3';
import { Product } from '../../shared/types';

class StorageService {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('./products.db');
    this.initDatabase();
  }

  private initDatabase() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        sales INTEGER,
        rating REAL,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        image TEXT,
        shopName TEXT,
        scrapedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    this.db.run('CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_products_scrapedAt ON products(scrapedAt);');
  }

  async saveProducts(products: Product[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO products 
        (id, name, price, sales, rating, platform, url, image, shopName, scrapedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      products.forEach(product => {
        stmt.run(
          product.id,
          product.name,
          product.price,
          product.sales,
          product.rating,
          product.platform,
          product.url,
          product.image,
          product.shopName,
          product.scrapedAt
        );
      });

      stmt.finalize((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getProducts(keyword: string, sortBy: string = 'price'): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM products WHERE name LIKE ?';
      
      switch (sortBy) {
        case 'price':
          query += ' ORDER BY price ASC';
          break;
        case 'sales':
          query += ' ORDER BY sales DESC';
          break;
        case 'rating':
          query += ' ORDER BY rating DESC';
          break;
      }

      this.db.all(query, [`%${keyword}%`], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Product[]);
      });
    });
  }

  async getPlatformDistribution(): Promise<{ platform: string; count: number }[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT platform, COUNT(*) as count FROM products GROUP BY platform';
      
      this.db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as { platform: string; count: number }[]);
      });
    });
  }

  async getPriceTrend(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT price FROM products ORDER BY price ASC LIMIT 10';
      
      this.db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map((row: any) => row.price));
      });
    });
  }

  async clearProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM products', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default new StorageService();