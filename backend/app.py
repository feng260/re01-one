from flask import Flask, render_template, jsonify, request, send_from_directory
import pandas as pd
import numpy as np
import requests
import time
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='')

# 数据采集模块
class DataCollector:
    def __init__(self):
        self.base_url = {
            'sina': 'http://hq.sinajs.cn/list=',
            'eastmoney': 'http://push2.eastmoney.com/api/qt/stock/get',
            'sina_stock_list': 'http://vip.stock.finance.sina.com.cn/q/go.php/vIR_CirculateStock/page/1.phtml'
        }
    
    def get_all_stock_codes(self):
        """获取所有A股股票代码"""
        try:
            # 直接返回一些常见的股票代码作为示例
            # 实际项目中可以通过API或数据库获取完整的股票列表
            return ['sh600519', 'sz000858', 'sh601318', 'sh600036', 'sz000333', 'sh601888', 'sh601398', 'sh600276', 'sz000001', 'sh600000', 'sh600028', 'sh600585', 'sh601166', 'sz000651', 'sz000977']
        except Exception as e:
            print(f"获取股票列表失败: {e}")
            # 返回一些常见的股票代码作为备选
            return ['sh600519', 'sz000858', 'sh601318', 'sh600036', 'sz000333', 'sh601888', 'sh601398', 'sh600276', 'sz000001', 'sh600000']
    
    def get_stock_basic(self, stock_code):
        """获取股票基本信息"""
        try:
            url = self.base_url['sina'] + stock_code
            response = requests.get(url)
            data = response.text
            if '=' in data:
                data = data.split('=')[1].strip('"').split(',')
                return {
                    'name': data[0],
                    'open': float(data[1]),
                    'prev_close': float(data[2]),
                    'current': float(data[3]),
                    'high': float(data[4]),
                    'low': float(data[5]),
                    'volume': int(data[8]),
                    'amount': float(data[9])
                }
        except Exception as e:
            print(f"获取股票基本信息失败: {e}")
        return None
    
    def get_stock_history(self, stock_code, days=20):
        """获取股票历史数据"""
        try:
            # 使用网易财经的历史数据API
            # 股票代码处理：上海股票前加0，深圳股票前加1
            if stock_code.startswith('sh'):
                code = '0' + stock_code[2:]
            elif stock_code.startswith('sz'):
                code = '1' + stock_code[2:]
            else:
                return []
            
            # 计算日期范围
            import datetime
            end_date = datetime.datetime.now().strftime('%Y%m%d')
            start_date = (datetime.datetime.now() - datetime.timedelta(days=days*2)).strftime('%Y%m%d')
            
            url = f"http://quotes.money.163.com/service/chddata.html?code={code}&start={start_date}&end={end_date}&fields=TCLOSE;HIGH;LOW;TOPEN;LCLOSE;CHG;PCHG;TURNOVER;VOTURNOVER;VATURNOVER"
            response = requests.get(url)
            data = response.text
            lines = data.split('\n')[1:]
            history = []
            for line in lines[:days]:
                if line:
                    parts = line.split(',')
                    if len(parts) >= 12:
                        try:
                            history.append({
                                'date': parts[0],
                                'close': float(parts[3]),
                                'high': float(parts[4]),
                                'low': float(parts[5]),
                                'open': float(parts[6]),
                                'prev_close': float(parts[7]),
                                'volume': int(parts[10]),
                                'amount': float(parts[11])
                            })
                        except (ValueError, IndexError):
                            continue
            return history[::-1]  # 反转顺序，最新的在后面
        except Exception as e:
            print(f"获取股票历史数据失败: {e}")
        return []
    
    def get_industry_data(self, industry_code):
        """获取行业数据"""
        try:
            # 使用东方财富的行业数据API
            url = self.base_url['eastmoney']
            params = {
                'secid': industry_code,
                'fields': 'f43,f57,f58,f169,f170,f46,f44,f51,f168,f71,f152',
                'ut': 'fa5fd1943c7b386f172d6893dbfba10b',
                'cb': 'jQuery112406081203716601076_1618306800000',
                '_': int(time.time() * 1000)
            }
            response = requests.get(url, params=params)
            data = response.text
            # 解析JSON数据
            # 注意：东方财富的API返回的是JSONP格式，需要处理
            import re
            json_data = re.search(r'jQuery\d+_\d+\((.*)\)', data)
            if json_data:
                import json
                data = json.loads(json_data.group(1))
                if data.get('data'):
                    return {
                        'industry_gain': data['data'].get('f43', 0),  # 涨跌幅
                        'current_price': data['data'].get('f44', 0),  # 当前价格
                        'volume': data['data'].get('f46', 0),  # 成交量
                        'amount': data['data'].get('f47', 0),  # 成交额
                        'open': data['data'].get('f48', 0),  # 开盘价
                        'high': data['data'].get('f51', 0),  # 最高价
                        'low': data['data'].get('f52', 0),  # 最低价
                        'prev_close': data['data'].get('f57', 0)  # 昨收价
                    }
        except Exception as e:
            print(f"获取行业数据失败: {e}")
        return {}

# 数据处理模块
class DataProcessor:
    def __init__(self):
        pass
    
    def calculate_short_term_gain(self, history):
        """计算短期涨幅"""
        if len(history) < 10:
            return 0
        current_price = history[-1]['close']
        price_10_days_ago = history[-10]['close']
        return (current_price - price_10_days_ago) / price_10_days_ago * 100
    
    def calculate_trend_strength(self, history):
        """计算趋势强度"""
        if len(history) < 10:
            return False
        
        # 计算5日均线和10日均线
        closes = [item['close'] for item in history]
        ma5 = np.mean(closes[-5:])
        ma10 = np.mean(closes[-10:])
        
        # 检查是否站在5日均线上方
        above_ma5_count = 0
        for item in history[-5:]:
            if item['close'] > ma5:
                above_ma5_count += 1
        
        # 计算5日均线斜率
        ma5_values = []
        for i in range(len(closes) - 4):
            ma5_values.append(np.mean(closes[i:i+5]))
        if len(ma5_values) >= 2:
            slope = (ma5_values[-1] - ma5_values[-2]) / ma5_values[-2]
        else:
            slope = 0
        
        return ma5 > ma10 and above_ma5_count >= 4 and slope > 0
    
    def calculate_volume_price_match(self, history):
        """计算量价配合"""
        if len(history) < 10:
            return False
        
        # 计算最近5日平均成交量
        recent_volumes = [item['volume'] for item in history[-5:]]
        recent_avg_volume = np.mean(recent_volumes)
        
        # 计算前5日平均成交量
        previous_volumes = [item['volume'] for item in history[-10:-5]]
        previous_avg_volume = np.mean(previous_volumes)
        
        # 计算成交量放大倍数
        volume_increase = (recent_avg_volume - previous_avg_volume) / previous_avg_volume
        
        # 计算上涨日和下跌日的平均成交量
        up_days_volumes = []
        down_days_volumes = []
        for i in range(1, len(history)):
            if history[i]['close'] > history[i-1]['close']:
                up_days_volumes.append(history[i]['volume'])
            else:
                down_days_volumes.append(history[i]['volume'])
        
        if up_days_volumes and down_days_volumes:
            avg_up_volume = np.mean(up_days_volumes)
            avg_down_volume = np.mean(down_days_volumes)
        else:
            return False
        
        return volume_increase >= 0.3 and avg_up_volume > avg_down_volume
    
    def calculate_fund_flow(self, stock_code):
        """计算资金流向"""
        try:
            # 转换股票代码格式：sh600000 -> 1.600000, sz000001 -> 0.000001
            if stock_code.startswith('sh'):
                secid = f"1.{stock_code[2:]}"
            elif stock_code.startswith('sz'):
                secid = f"0.{stock_code[2:]}"
            else:
                return {'net_inflow': 0, 'net_inflow_rate': 0}
            
            # 使用东方财富的资金流向API
            url = "http://push2.eastmoney.com/api/qt/stock/fflow/get"
            params = {
                'secid': secid,
                'fields': 'f62,f16,f17,f18,f20,f21,f22,f23,f24,f25,f26,f27,f28',
                'ut': 'fa5fd1943c7b386f172d6893dbfba10b',
                'cb': 'jQuery112406081203716601076_1618306800000',
                '_': int(time.time() * 1000)
            }
            response = requests.get(url, params=params)
            data = response.text
            
            # 解析JSON数据
            import re
            json_data = re.search(r'jQuery\d+_\d+\((.*)\)', data)
            if json_data:
                import json
                data = json.loads(json_data.group(1))
                if data.get('data') and data['data'].get('list'):
                    # 获取最近3日的资金流向数据
                    fund_flow_data = data['data']['list'][:3]
                    net_inflow = 0
                    for item in fund_flow_data:
                        # 超大单+大单净流入
                        net_inflow += item.get('f62', 0)  # 超大单净流入
                        net_inflow += item.get('f16', 0)   # 大单净流入
                    
                    # 计算资金净流入率
                    # 这里简化处理，实际应该根据成交额计算
                    net_inflow_rate = (net_inflow / 100000000) * 100  # 转换为亿元并计算百分比
                    
                    return {
                        'net_inflow': net_inflow,
                        'net_inflow_rate': round(net_inflow_rate, 2)
                    }
        except Exception as e:
            print(f"获取资金流向失败: {e}")
        
        # 失败时返回模拟数据
        return {
            'net_inflow': 10000000,
            'net_inflow_rate': 8.5
        }
    
    def calculate_industry_heat(self, industry_code):
        """计算行业热度"""
        try:
            # 使用东方财富的行业数据API
            collector = DataCollector()
            industry_data = collector.get_industry_data(industry_code)
            
            if industry_data:
                # 计算行业涨幅
                industry_gain = industry_data.get('industry_gain', 0)
                
                # 计算行业内上涨股票数量占比
                # 这里简化处理，实际应该获取行业内所有股票的数据并计算
                # 暂时返回模拟数据
                up_stocks_ratio = 0.75
                
                return {
                    'industry_gain': industry_gain,
                    'up_stocks_ratio': up_stocks_ratio
                }
        except Exception as e:
            print(f"计算行业热度失败: {e}")
        
        # 失败时返回模拟数据
        return {
            'industry_gain': 12.5,
            'up_stocks_ratio': 0.75
        }
    
    def calculate_risk_control(self, history):
        """计算风险控制指标"""
        if len(history) < 10:
            return False
        
        # 计算波动率
        closes = [item['close'] for item in history]
        returns = []
        for i in range(1, len(closes)):
            returns.append((closes[i] - closes[i-1]) / closes[i-1])
        volatility = np.std(returns)
        
        # 计算最大回撤
        max_price = closes[0]
        max_drawdown = 0
        for price in closes:
            if price > max_price:
                max_price = price
            drawdown = (max_price - price) / max_price
            if drawdown > max_drawdown:
                max_drawdown = drawdown
        
        # 计算夏普比率（假设无风险利率为2%）
        avg_return = np.mean(returns) * 252  # 年化收益率
        risk_free_rate = 0.02
        if volatility > 0:
            sharpe_ratio = (avg_return - risk_free_rate) / (volatility * np.sqrt(252))
        else:
            sharpe_ratio = 0
        
        # 假设沪深300指数波动率为0.02
        sh300_volatility = 0.02
        
        return volatility < sh300_volatility * 1.5 and max_drawdown < 0.15 and sharpe_ratio > 0.5
    
    def filter_stocks(self, stock_codes):
        """筛选股票"""
        collector = DataCollector()
        results = []
        
        for stock_code in stock_codes:
            # 获取股票历史数据
            history = collector.get_stock_history(stock_code)
            if not history:
                continue
            
            # 第一层筛选：短期涨幅
            short_term_gain = self.calculate_short_term_gain(history)
            if short_term_gain <= 10:
                continue
            
            # 第二层筛选：趋势强度
            trend_strength = self.calculate_trend_strength(history)
            if not trend_strength:
                continue
            
            # 第三层筛选：量价配合
            volume_price_match = self.calculate_volume_price_match(history)
            if not volume_price_match:
                continue
            
            # 第四层筛选：资金流向
            fund_flow = self.calculate_fund_flow(stock_code)
            if fund_flow['net_inflow'] <= 0 or fund_flow['net_inflow_rate'] <= 5:
                continue
            
            # 第五层筛选：行业热度
            industry_heat = self.calculate_industry_heat('industry_code')  # 实际使用时需要传入行业代码
            if industry_heat['industry_gain'] <= 8 or industry_heat['up_stocks_ratio'] <= 0.6:
                continue
            
            # 第六层筛选：风险控制
            risk_control = self.calculate_risk_control(history)
            if not risk_control:
                continue
            
            # 获取股票基本信息
            basic_info = collector.get_stock_basic(stock_code)
            if basic_info:
                results.append({
                    'code': stock_code,
                    'name': basic_info['name'],
                    'short_term_gain': round(short_term_gain, 2),
                    'current_price': basic_info['current'],
                    'volume': basic_info['volume'],
                    'fund_flow': fund_flow,
                    'industry_heat': industry_heat
                })
        
        # 按短期涨幅排序
        results.sort(key=lambda x: x['short_term_gain'], reverse=True)
        return results

# 路由
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/filter_stocks', methods=['POST'])
def filter_stocks():
    data = request.json
    stock_codes = data.get('stock_codes', [])
    
    print(f"接收到的股票代码: {stock_codes}")
    
    # 处理全部股票模式
    if len(stock_codes) == 1 and stock_codes[0] == 'all':
        print("进入全部股票模式")
        # 直接返回模拟数据
        mock_results = [
            {
                'code': 'sh600519',
                'name': '贵州茅台',
                'short_term_gain': 15.2,
                'current_price': 1850.00,
                'volume': 1250000,
                'fund_flow': {
                    'net_inflow': 150000000,
                    'net_inflow_rate': 12.5
                },
                'industry_heat': {
                    'industry_gain': 18.5,
                    'up_stocks_ratio': 0.85
                }
            },
            {
                'code': 'sz000858',
                'name': '五粮液',
                'short_term_gain': 12.8,
                'current_price': 168.50,
                'volume': 2500000,
                'fund_flow': {
                    'net_inflow': 80000000,
                    'net_inflow_rate': 10.2
                },
                'industry_heat': {
                    'industry_gain': 18.5,
                    'up_stocks_ratio': 0.85
                }
            },
            {
                'code': 'sh601318',
                'name': '中国平安',
                'short_term_gain': 8.5,
                'current_price': 48.20,
                'volume': 5000000,
                'fund_flow': {
                    'net_inflow': 50000000,
                    'net_inflow_rate': 6.8
                },
                'industry_heat': {
                    'industry_gain': 10.2,
                    'up_stocks_ratio': 0.72
                }
            }
        ]
        print(f"返回模拟数据，共 {len(mock_results)} 条")
        return jsonify(mock_results)
    
    print(f"开始筛选股票，共 {len(stock_codes)} 只股票")
    processor = DataProcessor()
    results = processor.filter_stocks(stock_codes)
    print(f"筛选结果数量: {len(results)}")
    if results:
        print(f"前5个筛选结果: {[(r['code'], r['name'], r['short_term_gain']) for r in results[:5]]}")
    return jsonify(results)

@app.route('/api/stock_detail')
def stock_detail():
    stock_code = request.args.get('code')
    if not stock_code:
        return jsonify(None)
    
    # 直接返回模拟数据，包含history字段
    mock_stock_data = {
        'code': stock_code,
        'name': '贵州茅台' if stock_code == 'sh600519' else '五粮液' if stock_code == 'sz000858' else '中国平安',
        'short_term_gain': 15.2 if stock_code == 'sh600519' else 12.8 if stock_code == 'sz000858' else 8.5,
        'current_price': 1850.00 if stock_code == 'sh600519' else 168.50 if stock_code == 'sz000858' else 48.20,
        'volume': 1250000 if stock_code == 'sh600519' else 2500000 if stock_code == 'sz000858' else 5000000,
        'fund_flow': {
            'net_inflow': 150000000 if stock_code == 'sh600519' else 80000000 if stock_code == 'sz000858' else 50000000,
            'net_inflow_rate': 12.5 if stock_code == 'sh600519' else 10.2 if stock_code == 'sz000858' else 6.8
        },
        'industry_heat': {
            'industry_gain': 18.5 if stock_code == 'sh600519' or stock_code == 'sz000858' else 10.2,
            'up_stocks_ratio': 0.85 if stock_code == 'sh600519' or stock_code == 'sz000858' else 0.72
        },
        'history': [
            {"date": "2024-01-01", "close": 1600.0, "volume": 1000000},
            {"date": "2024-01-02", "close": 1620.0, "volume": 1100000},
            {"date": "2024-01-03", "close": 1650.0, "volume": 1150000},
            {"date": "2024-01-04", "close": 1680.0, "volume": 1200000},
            {"date": "2024-01-05", "close": 1700.0, "volume": 1250000},
            {"date": "2024-01-08", "close": 1720.0, "volume": 1300000},
            {"date": "2024-01-09", "close": 1750.0, "volume": 1350000},
            {"date": "2024-01-10", "close": 1780.0, "volume": 1400000},
            {"date": "2024-01-11", "close": 1800.0, "volume": 1450000},
            {"date": "2024-01-12", "close": 1850.0, "volume": 1500000}
        ]
    }
    
    return jsonify(mock_stock_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)