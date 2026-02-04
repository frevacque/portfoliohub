import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from .yahoo_finance import YahooFinanceService
import logging

logger = logging.getLogger(__name__)

class PerformanceService:
    """Service for calculating portfolio and position performance"""
    
    def __init__(self):
        self.yf_service = YahooFinanceService()
    
    def calculate_portfolio_performance(
        self, 
        positions: List[Dict], 
        period: str = 'all'
    ) -> Dict:
        """
        Calculate portfolio performance over time
        period: 'all', 'ytd', '1m', '3m', '6m', '1y'
        """
        try:
            if not positions:
                return {'data': [], 'total_return': 0, 'total_return_percent': 0}
            
            # Determine date range
            end_date = datetime.now()
            if period == 'ytd':
                start_date = datetime(end_date.year, 1, 1)
            elif period == '1m':
                start_date = end_date - timedelta(days=30)
            elif period == '3m':
                start_date = end_date - timedelta(days=90)
            elif period == '6m':
                start_date = end_date - timedelta(days=180)
            elif period == '1y':
                start_date = end_date - timedelta(days=365)
            else:  # 'all'
                # Use earliest purchase date
                purchase_dates = [p.get('purchase_date', datetime.now()) for p in positions]
                start_date = min(purchase_dates) if purchase_dates else end_date - timedelta(days=365)
            
            # Get historical data for all positions
            portfolio_values = {}
            
            for position in positions:
                hist_data = self.yf_service.get_historical_data(
                    position['symbol'], 
                    period='2y'  # Get enough data
                )
                
                if hist_data is None or hist_data.empty:
                    continue
                
                # Filter by date range
                hist_data = hist_data[hist_data.index >= start_date]
                
                # Calculate position value over time
                quantity = position['quantity']
                for date, row in hist_data.iterrows():
                    date_str = date.strftime('%Y-%m-%d')
                    position_value = row['Close'] * quantity
                    
                    if date_str not in portfolio_values:
                        portfolio_values[date_str] = 0
                    portfolio_values[date_str] += position_value
            
            if not portfolio_values:
                return {'data': [], 'total_return': 0, 'total_return_percent': 0}
            
            # Sort by date
            sorted_dates = sorted(portfolio_values.keys())
            
            # Calculate returns
            performance_data = []
            initial_value = portfolio_values[sorted_dates[0]]
            
            for i, date in enumerate(sorted_dates):
                value = portfolio_values[date]
                change_percent = ((value - initial_value) / initial_value * 100) if initial_value > 0 else 0
                
                performance_data.append({
                    'date': date,
                    'value': round(value, 2),
                    'change_percent': round(change_percent, 2)
                })
            
            # Calculate total return
            final_value = portfolio_values[sorted_dates[-1]]
            total_return = final_value - initial_value
            total_return_percent = ((final_value - initial_value) / initial_value * 100) if initial_value > 0 else 0
            
            return {
                'data': performance_data,
                'total_return': round(total_return, 2),
                'total_return_percent': round(total_return_percent, 2)
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio performance: {str(e)}")
            return {'data': [], 'total_return': 0, 'total_return_percent': 0}
    
    def calculate_position_performance(
        self, 
        symbol: str, 
        quantity: float,
        purchase_price: float,
        purchase_date: datetime,
        period: str = 'all'
    ) -> Dict:
        """Calculate performance for a single position"""
        try:
            # Determine date range
            end_date = datetime.now()
            if period == 'ytd':
                start_date = datetime(end_date.year, 1, 1)
            elif period == '1m':
                start_date = end_date - timedelta(days=30)
            elif period == '3m':
                start_date = end_date - timedelta(days=90)
            elif period == '6m':
                start_date = end_date - timedelta(days=180)
            elif period == '1y':
                start_date = end_date - timedelta(days=365)
            else:  # 'all'
                start_date = purchase_date
            
            # Use purchase date if it's more recent
            start_date = max(start_date, purchase_date)
            
            # Get historical data
            hist_data = self.yf_service.get_historical_data(symbol, period='2y')
            
            if hist_data is None or hist_data.empty:
                return {'data': [], 'total_return': 0, 'total_return_percent': 0}
            
            # Filter by date range - make dates timezone naive for comparison
            hist_data.index = hist_data.index.tz_localize(None)
            hist_data = hist_data[hist_data.index >= start_date]
            
            # Calculate performance
            performance_data = []
            initial_value = purchase_price * quantity
            
            for date, row in hist_data.iterrows():
                current_price = row['Close']
                current_value = current_price * quantity
                change_percent = ((current_value - initial_value) / initial_value * 100) if initial_value > 0 else 0
                
                performance_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'value': round(current_value, 2),
                    'change_percent': round(change_percent, 2)
                })
            
            if performance_data:
                final_value = performance_data[-1]['value']
                total_return = final_value - initial_value
                total_return_percent = ((final_value - initial_value) / initial_value * 100) if initial_value > 0 else 0
            else:
                total_return = 0
                total_return_percent = 0
            
            return {
                'data': performance_data,
                'total_return': round(total_return, 2),
                'total_return_percent': round(total_return_percent, 2)
            }
            
        except Exception as e:
            logger.error(f"Error calculating position performance for {symbol}: {str(e)}")
            return {'data': [], 'total_return': 0, 'total_return_percent': 0}
    
    def compare_with_index(
        self,
        portfolio_performance: List[Dict],
        index_symbol: str = '^GSPC'
    ) -> Dict:
        """Compare portfolio performance with market index"""
        try:
            if not portfolio_performance:
                return {'data': []}
            
            # Get index data
            start_date = datetime.strptime(portfolio_performance[0]['date'], '%Y-%m-%d')
            end_date = datetime.strptime(portfolio_performance[-1]['date'], '%Y-%m-%d')
            
            hist_data = self.yf_service.get_historical_data(index_symbol, period='2y')
            
            if hist_data is None or hist_data.empty:
                return {'data': []}
            
            # Filter by date range
            hist_data = hist_data[(hist_data.index >= start_date) & (hist_data.index <= end_date)]
            
            # Normalize to percentage change
            initial_price = hist_data['Close'].iloc[0]
            
            comparison_data = []
            for date, row in hist_data.iterrows():
                date_str = date.strftime('%Y-%m-%d')
                price = row['Close']
                change_percent = ((price - initial_price) / initial_price * 100) if initial_price > 0 else 0
                
                # Find corresponding portfolio data
                portfolio_point = next((p for p in portfolio_performance if p['date'] == date_str), None)
                
                if portfolio_point:
                    comparison_data.append({
                        'date': date_str,
                        'portfolio_percent': portfolio_point['change_percent'],
                        'index_percent': round(change_percent, 2)
                    })
            
            return {'data': comparison_data}
            
        except Exception as e:
            logger.error(f"Error comparing with index: {str(e)}")
            return {'data': []}
