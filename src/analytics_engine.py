import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging

class GameAnalyticsEngine:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def calculate_dau_wau_mau(self, df: pd.DataFrame, user_col: str, date_col: str) -> Dict:
        """Calculate Daily, Weekly, Monthly Active Users"""
        df_copy = df.copy()
        df_copy['date'] = pd.to_datetime(df_copy[date_col]).dt.date
        
        # Daily Active Users
        dau = df_copy.groupby('date')[user_col].nunique().reset_index()
        dau.columns = ['date', 'dau']
        
        # Weekly Active Users
        df_copy['week'] = pd.to_datetime(df_copy[date_col]).dt.to_period('W')
        wau = df_copy.groupby('week')[user_col].nunique().reset_index()
        wau.columns = ['week', 'wau']
        
        # Monthly Active Users
        df_copy['month'] = pd.to_datetime(df_copy[date_col]).dt.to_period('M')
        mau = df_copy.groupby('month')[user_col].nunique().reset_index()
        mau.columns = ['month', 'mau']
        
        return {
            'dau': dau,
            'wau': wau,
            'mau': mau
        }
    
    def calculate_revenue_metrics(self, df: pd.DataFrame, user_col: str, 
                                 revenue_col: str, date_col: str) -> Dict:
        """Calculate revenue metrics including ARPPU and ARPDAU"""
        df_revenue = df[df[revenue_col] > 0].copy()
        df_revenue['date'] = pd.to_datetime(df_revenue[date_col]).dt.date
        
        # Daily revenue
        daily_revenue = df_revenue.groupby('date')[revenue_col].sum().reset_index()
        daily_revenue.columns = ['date', 'revenue']
        
        # Daily paying users
        daily_paying_users = df_revenue.groupby('date')[user_col].nunique().reset_index()
        daily_paying_users.columns = ['date', 'paying_users']
        
        # Daily active users (all users, not just paying)
        daily_active_users = df.groupby(pd.to_datetime(df[date_col]).dt.date)[user_col].nunique().reset_index()
        daily_active_users.columns = ['date', 'active_users']
        
        # Calculate ARPPU and ARPDAU
        metrics = daily_revenue.merge(daily_paying_users, on='date', how='left')
        metrics = metrics.merge(daily_active_users, on='date', how='left')
        
        metrics['arppu'] = (metrics['revenue'] / metrics['paying_users']).round(2)
        metrics['arpdau'] = (metrics['revenue'] / metrics['active_users']).round(2)
        
        return {
            'daily_revenue': metrics,
            'total_revenue': df_revenue[revenue_col].sum(),
            'avg_arppu': metrics['arppu'].mean(),
            'avg_arpdau': metrics['arpdau'].mean()
        }
    
    def cohort_analysis(self, df: pd.DataFrame, user_col: str, date_col: str) -> pd.DataFrame:
        """Perform cohort analysis based on signup date"""
        df_copy = df.copy()
        df_copy['date'] = pd.to_datetime(df_copy[date_col]).dt.date
        
        # Get first date for each user (signup date)
        user_first_date = df_copy.groupby(user_col)['date'].min().reset_index()
        user_first_date.columns = [user_col, 'signup_date']
        
        # Merge back to main dataframe
        df_cohort = df_copy.merge(user_first_date, on=user_col)
        
        # Calculate period number (months since signup)
        df_cohort['period_number'] = (
            pd.to_datetime(df_cohort['date']) - pd.to_datetime(df_cohort['signup_date'])
        ).dt.days // 30
        
        # Create cohort table
        cohort_data = df_cohort.groupby(['signup_date', 'period_number'])[user_col].nunique().reset_index()
        cohort_table = cohort_data.pivot(index='signup_date', columns='period_number', values=user_col)
        
        # Calculate retention rates
        cohort_sizes = cohort_table.iloc[:, 0]
        retention_table = cohort_table.divide(cohort_sizes, axis=0)
        
        return retention_table
    
    def funnel_analysis(self, df: pd.DataFrame, user_col: str, event_col: str, 
                       funnel_steps: List[str]) -> Dict:
        """Analyze conversion funnel"""
        funnel_data = []
        
        for i, step in enumerate(funnel_steps):
            # Users who completed this step
            users_at_step = df[df[event_col].str.contains(step, case=False, na=False)][user_col].nunique()
            
            if i == 0:
                conversion_rate = 100.0
                drop_off_rate = 0.0
            else:
                conversion_rate = (users_at_step / funnel_data[0]['users']) * 100
                drop_off_rate = ((funnel_data[i-1]['users'] - users_at_step) / funnel_data[i-1]['users']) * 100
            
            funnel_data.append({
                'step': step,
                'users': users_at_step,
                'conversion_rate': round(conversion_rate, 2),
                'drop_off_rate': round(drop_off_rate, 2)
            })
        
        return {'funnel_steps': funnel_data}
    
    def segment_users(self, df: pd.DataFrame, user_col: str, revenue_col: str) -> Dict:
        """Segment users based on spending behavior"""
        user_stats = df.groupby(user_col).agg({
            revenue_col: 'sum',
            user_col: 'count'  # frequency
        }).reset_index()
        user_stats.columns = [user_col, 'total_spend', 'frequency']
        
        # Define segments based on spend
        user_stats['segment'] = 'non_paying'
        user_stats.loc[user_stats['total_spend'] > 0, 'segment'] = 'casual'
        user_stats.loc[user_stats['total_spend'] > user_stats['total_spend'].quantile(0.8), 'segment'] = 'mid_tier'
        user_stats.loc[user_stats['total_spend'] > user_stats['total_spend'].quantile(0.95), 'segment'] = 'whale'
        
        # Calculate segment metrics
        segment_summary = user_stats.groupby('segment').agg({
            user_col: 'count',
            'total_spend': ['sum', 'mean'],
            'frequency': 'mean'
        }).round(2)
        
        return {
            'user_segments': user_stats,
            'segment_summary': segment_summary
        }
    
    def detect_anomalies(self, df: pd.DataFrame, metric_col: str, 
                        date_col: str, threshold: float = 2.0) -> List[Dict]:
        """Detect anomalies in metrics using statistical thresholds"""
        df_copy = df.copy()
        df_copy['date'] = pd.to_datetime(df_copy[date_col]).dt.date
        
        daily_metrics = df_copy.groupby('date')[metric_col].sum().reset_index()
        
        # Calculate rolling mean and std
        daily_metrics['rolling_mean'] = daily_metrics[metric_col].rolling(window=7, min_periods=1).mean()
        daily_metrics['rolling_std'] = daily_metrics[metric_col].rolling(window=7, min_periods=1).std()
        
        # Detect anomalies
        daily_metrics['z_score'] = (
            daily_metrics[metric_col] - daily_metrics['rolling_mean']
        ) / daily_metrics['rolling_std']
        
        anomalies = daily_metrics[abs(daily_metrics['z_score']) > threshold]
        
        anomaly_list = []
        for _, row in anomalies.iterrows():
            anomaly_list.append({
                'date': row['date'],
                'metric': metric_col,
                'value': row[metric_col],
                'expected': row['rolling_mean'],
                'z_score': row['z_score'],
                'type': 'spike' if row['z_score'] > 0 else 'drop'
            })
        
        return anomaly_list