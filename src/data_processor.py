import pandas as pd
import numpy as np
from datetime import datetime, timezone
import json
import re
from typing import Dict, List, Tuple, Optional
import logging

class GameDataProcessor:
    def __init__(self, mapping_file: str = "config/mapping.json"):
        with open(mapping_file, 'r') as f:
            self.config = json.load(f)
        
        self.schema_mappings = self.config['schema_mappings']
        self.event_categories = self.config['event_categories']
        self.timestamp_formats = self.config['timestamp_formats']
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def detect_schema(self, df: pd.DataFrame) -> Dict[str, str]:
        """Automatically detect and map column names to standard schema"""
        detected_mapping = {}
        columns = [col.lower().strip() for col in df.columns]
        
        for standard_field, possible_names in self.schema_mappings.items():
            for col in columns:
                if any(name.lower() in col for name in possible_names):
                    original_col = df.columns[columns.index(col)]
                    detected_mapping[standard_field] = original_col
                    break
        
        self.logger.info(f"Detected schema mapping: {detected_mapping}")
        return detected_mapping
    
    def normalize_timestamps(self, df: pd.DataFrame, timestamp_col: str) -> pd.DataFrame:
        """Convert timestamps to IST format (DD-MM-YYYY HH:MM:SS)"""
        df = df.copy()
        
        for fmt in self.timestamp_formats:
            try:
                df[timestamp_col] = pd.to_datetime(df[timestamp_col], format=fmt)
                break
            except:
                continue
        
        # If no format worked, try pandas automatic parsing
        if df[timestamp_col].dtype == 'object':
            df[timestamp_col] = pd.to_datetime(df[timestamp_col], errors='coerce')
        
        # Convert to IST (UTC+5:30)
        df[timestamp_col] = df[timestamp_col].dt.tz_localize(None)
        df[timestamp_col] = df[timestamp_col].dt.tz_localize('UTC').dt.tz_convert('Asia/Kolkata')
        
        return df
    
    def categorize_events(self, df: pd.DataFrame, event_col: str) -> pd.DataFrame:
        """Categorize events into gameplay, purchase, system"""
        df = df.copy()
        df['event_category'] = 'other'
        
        for category, keywords in self.event_categories.items():
            mask = df[event_col].str.lower().str.contains('|'.join(keywords), na=False)
            df.loc[mask, 'event_category'] = category
        
        return df
    
    def clean_data_types(self, df: pd.DataFrame, mapping: Dict[str, str]) -> pd.DataFrame:
        """Clean and convert data types"""
        df = df.copy()
        
        # Convert numeric columns
        numeric_cols = ['revenue', 'currency_spent', 'level', 'age']
        for col in numeric_cols:
            if col in mapping and mapping[col] in df.columns:
                df[mapping[col]] = pd.to_numeric(df[mapping[col]], errors='coerce')
        
        # Clean categorical columns
        categorical_cols = ['device_type', 'game_mode', 'country', 'gender']
        for col in categorical_cols:
            if col in mapping and mapping[col] in df.columns:
                df[mapping[col]] = df[mapping[col]].astype(str).str.strip().str.lower()
        
        return df
    
    def process_data(self, file_path: str) -> Tuple[pd.DataFrame, Dict[str, str]]:
        """Main data processing pipeline"""
        self.logger.info(f"Processing file: {file_path}")
        
        # Load data
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format. Use CSV or Excel.")
        
        self.logger.info(f"Loaded {len(df)} rows, {len(df.columns)} columns")
        
        # Detect schema
        mapping = self.detect_schema(df)
        
        # Handle different data types based on detected schema
        if 'signup_date' in mapping:
            df = self.normalize_timestamps(df, mapping['signup_date'])
            df.rename(columns={mapping['signup_date']: 'signup_date'}, inplace=True)
        
        if 'last_login' in mapping:
            df = self.normalize_timestamps(df, mapping['last_login'])
            df.rename(columns={mapping['last_login']: 'last_login'}, inplace=True)
        
        # Process subscription and rank tiers
        if 'subscription_tier' in mapping:
            df = self.process_tiers(df, mapping['subscription_tier'], 'subscription_tiers')
        
        if 'rank_tier' in mapping:
            df = self.process_tiers(df, mapping['rank_tier'], 'rank_tiers')
        
        # Create synthetic events from user data for analytics
        df = self.create_synthetic_events(df, mapping)
        
        # Clean data types
        df = self.clean_data_types(df, mapping)
        
        # Remove duplicates
        df = df.drop_duplicates()
        
        # Handle missing values
        df = df.dropna(subset=[mapping.get('user_id', 'User_ID')])
        
        self.logger.info(f"Processed data: {len(df)} rows after cleaning")
        
        return df, mapping
    
    def process_tiers(self, df: pd.DataFrame, tier_col: str, tier_type: str) -> pd.DataFrame:
        """Convert tier names to numeric values"""
        df = df.copy()
        tier_mapping = self.config.get(tier_type, {})
        
        df[f'{tier_col}_numeric'] = df[tier_col].map(tier_mapping).fillna(0)
        return df
    
    def create_synthetic_events(self, df: pd.DataFrame, mapping: Dict[str, str]) -> pd.DataFrame:
        """Create synthetic event data from user summary data for analytics"""
        events = []
        
        for _, user in df.iterrows():
            user_id = user[mapping.get('user_id', 'User_ID')]
            
            # Create signup event
            if 'signup_date' in mapping and pd.notna(user[mapping['signup_date']]):
                events.append({
                    'user_id': user_id,
                    'event_name': 'signup',
                    'timestamp': user[mapping['signup_date']],
                    'revenue': 0,
                    'event_category': 'system',
                    'device_type': user.get(mapping.get('device_type', 'Device_Type'), 'unknown'),
                    'country': user.get(mapping.get('country', 'Country'), 'unknown'),
                    'game_title': user.get(mapping.get('game_title', 'Game_Title'), 'unknown')
                })
            
            # Create purchase events based on total purchases
            if 'game_purchases' in mapping and pd.notna(user[mapping['game_purchases']]):
                purchase_count = user[mapping['game_purchases']]
                total_revenue = user.get(mapping.get('total_revenue', 'Total_Revenue_USD'), 0)
                
                if purchase_count > 0 and total_revenue > 0:
                    avg_purchase = total_revenue / purchase_count
                    
                    # Distribute purchases over time
                    signup_date = pd.to_datetime(user.get(mapping.get('signup_date', 'signup_date'), '2024-01-01'))
                    last_login = pd.to_datetime(user.get(mapping.get('last_login', 'last_login'), '2024-01-01'))
                    
                    for i in range(int(purchase_count)):
                        # Distribute purchases between signup and last login
                        days_diff = (last_login - signup_date).days
                        if days_diff > 0:
                            random_days = np.random.randint(0, days_diff + 1)
                            purchase_date = signup_date + pd.Timedelta(days=random_days)
                        else:
                            purchase_date = signup_date
                        
                        events.append({
                            'user_id': user_id,
                            'event_name': 'purchase',
                            'timestamp': purchase_date,
                            'revenue': avg_purchase,
                            'event_category': 'purchase',
                            'device_type': user.get(mapping.get('device_type', 'Device_Type'), 'unknown'),
                            'country': user.get(mapping.get('country', 'Country'), 'unknown'),
                            'game_title': user.get(mapping.get('game_title', 'Game_Title'), 'unknown')
                        })
            
            # Create session events based on total sessions
            if 'total_play_sessions' in mapping and pd.notna(user[mapping['total_play_sessions']]):
                session_count = user[mapping['total_play_sessions']]
                
                if session_count > 0:
                    signup_date = pd.to_datetime(user.get(mapping.get('signup_date', 'signup_date'), '2024-01-01'))
                    last_login = pd.to_datetime(user.get(mapping.get('last_login', 'last_login'), '2024-01-01'))
                    
                    for i in range(int(min(session_count, 100))):  # Limit to 100 sessions for performance
                        days_diff = (last_login - signup_date).days
                        if days_diff > 0:
                            random_days = np.random.randint(0, days_diff + 1)
                            session_date = signup_date + pd.Timedelta(days=random_days)
                        else:
                            session_date = signup_date
                        
                        events.append({
                            'user_id': user_id,
                            'event_name': 'session_start',
                            'timestamp': session_date,
                            'revenue': 0,
                            'event_category': 'gameplay',
                            'device_type': user.get(mapping.get('device_type', 'Device_Type'), 'unknown'),
                            'country': user.get(mapping.get('country', 'Country'), 'unknown'),
                            'game_title': user.get(mapping.get('game_title', 'Game_Title'), 'unknown')
                        })
        
        # Convert to DataFrame and combine with original data
        if events:
            events_df = pd.DataFrame(events)
            events_df['timestamp'] = pd.to_datetime(events_df['timestamp'])
            
            # Add user metadata to events
            user_metadata = df[[mapping.get('user_id', 'User_ID')] + 
                             [col for col in [mapping.get('age', 'Age'), 
                                            mapping.get('gender', 'Gender'),
                                            mapping.get('subscription_tier', 'Subscription_Tier'),
                                            mapping.get('rank_tier', 'Rank_Tier')] if col in df.columns]]
            
            events_df = events_df.merge(user_metadata, left_on='user_id', 
                                     right_on=mapping.get('user_id', 'User_ID'), how='left')
            
            return events_df
        
        return df
    
    def add_derived_features(self, df: pd.DataFrame, mapping: Dict[str, str]) -> pd.DataFrame:
        """Add derived features for analysis"""
        df = df.copy()
        
        # Add date components
        if 'timestamp' in mapping:
            timestamp_col = mapping['timestamp']
            df['date'] = df[timestamp_col].dt.date
            df['hour'] = df[timestamp_col].dt.hour
            df['day_of_week'] = df[timestamp_col].dt.day_name()
            df['week'] = df[timestamp_col].dt.isocalendar().week
            df['month'] = df[timestamp_col].dt.month
        
        # Add user activity metrics
        if 'user_id' in mapping:
            user_col = mapping['user_id']
            user_stats = df.groupby(user_col).agg({
                mapping.get('timestamp', 'timestamp'): ['count', 'min', 'max'],
                mapping.get('revenue', 'revenue'): 'sum'
            }).round(2)
            
            user_stats.columns = ['session_count', 'first_seen', 'last_seen', 'total_revenue']
            user_stats['days_active'] = (user_stats['last_seen'] - user_stats['first_seen']).dt.days + 1
            
            # Merge back to main dataframe
            df = df.merge(user_stats, left_on=user_col, right_index=True, how='left')
        
        return df