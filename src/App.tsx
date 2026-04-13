import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line, Radar } from 'react-chartjs-2';
import { Product, ScrapeRequest } from '../shared/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['jd', 'taobao', 'pdd']);
  const [limit, setLimit] = useState(5);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceTrend, setPriceTrend] = useState<number[]>([]);
  const [platformDistribution, setPlatformDistribution] = useState<{ platform: string; count: number }[]>([]);
  const [sortBy, setSortBy] = useState('price');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});

  const handleScrape = async () => {
    if (!keyword) {
      setError('请输入关键词');
      return;
    }

    setLoading(true);
    setError('');
    setShowDetails({});

    try {
      const request: ScrapeRequest = {
        keyword,
        platforms,
        limit
      };

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      console.log('API Response:', response);

      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        // 获取可视化数据
        await fetchResults();
      } else {
        setError(data.error || '采集失败');
      }
    } catch (err) {
      console.error('Scrape error:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      console.log('Fetching results for keyword:', keyword);
      const response = await fetch(`/api/results?keyword=${encodeURIComponent(keyword)}&sortBy=${sortBy}`);
      console.log('Results API Response:', response);
      const data = await response.json();
      console.log('Results API Data:', data);

      if (data.success) {
        setPriceTrend(data.visualization.priceTrend);
        setPlatformDistribution(data.visualization.platformDistribution);
      }
    } catch (err) {
      console.error('获取结果失败:', err);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // 本地排序产品
    const sortedProducts = [...products].sort((a, b) => {
      switch (value) {
        case 'price':
          return a.price - b.price;
        case 'sales':
          return b.sales - a.sales;
        case 'rating':
          return parseFloat(b.rating) - parseFloat(a.rating);
        default:
          return 0;
      }
    });
    setProducts(sortedProducts);
  };

  const handlePlatformFilter = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const toggleDetails = (productId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const filteredProducts = selectedPlatform === 'all' 
    ? products 
    : products.filter(product => product.platform === selectedPlatform);

  const calculateAveragePrice = () => {
    if (products.length === 0) return 0;
    const sum = products.reduce((acc, product) => acc + product.price, 0);
    return sum / products.length;
  };

  const calculateAverageRating = () => {
    if (products.length === 0) return 0;
    const sum = products.reduce((acc, product) => acc + parseFloat(product.rating), 0);
    return sum / products.length;
  };

  const platformLabels = {
    'jd': '京东',
    'taobao': '淘宝',
    'pdd': '拼多多'
  };

  const pieData = {
    labels: platformDistribution.map(item => item.platform),
    datasets: [
      {
        data: platformDistribution.map(item => item.count),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 1
      }
    ]
  };

  const barData = {
    labels: priceTrend.map((_, index) => `商品 ${index + 1}`),
    datasets: [
      {
        label: '价格趋势',
        data: priceTrend,
        backgroundColor: '#3b82f6',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-green-500 text-white p-8 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-4">电商商品价格对比工具</h1>
          <p className="text-xl opacity-90">快速采集主流电商平台商品价格，智能对比分析</p>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* 搜索模块 */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8 transform transition-all hover:shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">商品搜索</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">关键词</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="请输入商品关键词，例如：手机、笔记本电脑"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">电商平台</label>
              <div className="flex flex-wrap gap-4">
                {Object.entries(platformLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platforms.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlatforms([...platforms, key]);
                        } else {
                          setPlatforms(platforms.filter(p => p !== key));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">每平台采集数量</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 1)}
                min="1"
                max="20"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleScrape}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>采集ing...</span>
                </div>
              ) : (
                '开始采集'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">错误</h3>
                  <div className="mt-2 text-sm">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 统计信息 */}
        {products.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 transform transition-all hover:shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">采集商品数</p>
                  <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 transform transition-all hover:shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">平均价格</p>
                  <p className="text-2xl font-bold text-gray-800">¥{calculateAveragePrice().toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 transform transition-all hover:shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">平均评分</p>
                  <p className="text-2xl font-bold text-gray-800">{calculateAverageRating().toFixed(1)}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 结果展示 */}
        {products.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">采集结果</h2>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="price">价格从低到高</option>
                    <option value="sales">销量从高到低</option>
                    <option value="rating">评分从高到低</option>
                  </select>
                </div>
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">平台筛选</label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => handlePlatformFilter(e.target.value)}
                    className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="all">全部平台</option>
                    <option value="京东">京东</option>
                    <option value="淘宝">淘宝</option>
                    <option value="拼多多">拼多多</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.platform === '京东' ? 'bg-red-100 text-red-800' : product.platform === '淘宝' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {product.platform}
                        </span>
                        <span className="text-xs text-gray-500">{product.shopName}</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">¥{product.price}</span>
                    </div>
                    
                    <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        销量: {product.sales}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleDetails(product.id)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        {showDetails[product.id] ? '收起详情' : '查看详情'}
                      </button>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        查看商品
                      </a>
                    </div>
                  </div>
                  
                  {showDetails[product.id] && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="text-xs text-gray-600 space-y-2">
                        <p><span className="font-medium">商品ID:</span> {product.id}</p>
                        <p><span className="font-medium">采集时间:</span> {new Date(product.scrapedAt).toLocaleString()}</p>
                        <p><span className="font-medium">商品链接:</span> <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">点击访问</a></p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 数据可视化 */}
        {priceTrend.length > 0 && platformDistribution.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-gray-800">价格趋势</h2>
              <div className="h-80">
                <Bar 
                  data={barData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: '商品价格分布',
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-gray-800">平台分布</h2>
              <div className="h-80">
                <Pie 
                  data={pieData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: '商品平台分布',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* 示例数据展示 */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">使用示例</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">示例关键词：</h3>
              <div className="flex flex-wrap gap-2">
                {['手机', '笔记本电脑', '蓝牙耳机', '智能手表', '平板电脑', '相机'].map((keyword) => (
                  <span key={keyword} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">功能说明：</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>支持从京东、淘宝、拼多多采集商品数据</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>自动清洗去重，支持按价格、销量、评分排序</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>提供价格趋势图表和平台分布分析</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>显示商品详细信息，包括价格、销量、评分等</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>支持按平台筛选商品</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-8 mt-16">
        <div className="container mx-auto text-center">
          <h3 className="text-xl font-bold mb-4">电商商品价格自动化采集与对比工具</h3>
          <p className="text-gray-400 mb-6">快速、智能的电商价格对比解决方案</p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">关于我们</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">使用指南</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">联系我们</a>
          </div>
          <p className="mt-8 text-gray-500 text-sm">© 2026 价格对比工具. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;