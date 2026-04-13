import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Product, ScrapeRequest } from '../shared/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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

  const handleScrape = async () => {
    if (!keyword) {
      setError('请输入关键词');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const request: ScrapeRequest = {
        keyword,
        platforms,
        limit
      };

      const response = await fetch('http://localhost:3001/api/scrape', {
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
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      console.log('Fetching results for keyword:', keyword);
      const response = await fetch(`http://localhost:3001/api/results?keyword=${encodeURIComponent(keyword)}&sortBy=price`);
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-green-500 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">电商商品价格对比工具</h1>
          <p className="mt-2 text-lg">快速采集主流电商平台商品价格，智能对比分析</p>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* 搜索模块 */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">商品搜索</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">关键词</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入商品关键词，例如：手机、笔记本电脑"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">电商平台</label>
              <div className="flex flex-wrap gap-4">
                {Object.entries(platformLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center">
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
                      className="mr-2"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">每平台采集数量</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleScrape}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400"
            >
              {loading ? '采集ing...' : '开始采集'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* 结果展示 */}
        {products.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">采集结果</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品名称
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      价格
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      销量
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      评分
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平台
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      店铺
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      链接
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.rating}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.shopName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <a href={product.url} target="_blank" rel="noopener noreferrer">
                          查看
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 数据可视化 */}
        {priceTrend.length > 0 && platformDistribution.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">价格趋势</h2>
              <div className="h-80">
                <Bar data={barData} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">平台分布</h2>
              <div className="h-80">
                <Pie data={pieData} />
              </div>
            </div>
          </section>
        )}

        {/* 示例数据展示 */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">使用示例</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">示例关键词：</h3>
              <p className="text-gray-600">手机、笔记本电脑、蓝牙耳机、智能手表</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">功能说明：</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>支持从京东、淘宝、拼多多采集商品数据</li>
                <li>自动清洗去重，按价格从低到高排序</li>
                <li>提供价格趋势图表和平台分布分析</li>
                <li>显示商品详细信息，包括价格、销量、评分等</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-6 mt-12">
        <div className="container mx-auto text-center">
          <p>电商商品价格自动化采集与对比工具</p>
          <p className="mt-2 text-gray-400 text-sm">© 2026 价格对比工具</p>
        </div>
      </footer>
    </div>
  );
};

export default App;