export interface Product {
  id: string;
  name: string;
  price: number;
  sales: number;
  rating: number;
  platform: string;
  url: string;
  image: string;
  shopName: string;
  scrapedAt: string;
}

export interface ScrapeRequest {
  keyword: string;
  platforms: string[];
  limit: number;
}

export interface ScrapeResponse {
  success: boolean;
  data?: Product[];
  error?: string;
}

export interface ResultsResponse {
  success: boolean;
  data: Product[];
  visualization: {
    priceTrend: number[];
    platformDistribution: { platform: string; count: number }[];
  };
}