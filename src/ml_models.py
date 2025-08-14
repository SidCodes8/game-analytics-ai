import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import joblib
from typing import Dict, Tuple, Optional
import logging

class MLAnalytics:
    def __init__(self):
        self.scaler = StandardScaler()
        self.churn_model = None
        self.clustering_model = None
        self.anomaly_model = None
        self.logger = logging.getLogger(__name__)
    
    def prepare_churn_features(self, df: pd.DataFrame, user_col: str, 
                              date_col: str, revenue_col: str) -> pd.DataFrame:
        """Prepare features for churn prediction"""
        # Calculate user-level features
        user_features = df.groupby(user_col).agg({
            date_col: ['min', 'max', 'count'],
            revenue_col: ['sum', 'mean', 'count'],
            'event_category': lambda x: (x == 'gameplay').sum(),
            'session_id': 'nunique' if 'session_id' in df.columns else 'count'
        }).round(2)
        
        user_features.columns = [
            'first_seen', 'last_seen', 'total_events',
            'total_revenue', 'avg_revenue', 'purchase_events',
            'gameplay_events', 'total_sessions'
        ]
        
        # Calculate recency (days since last activity)
        user_features['last_seen'] = pd.to_datetime(user_features['last_seen'])
        user_features['recency_days'] = (
            pd.Timestamp.now() - user_features['last_seen']
        ).dt.days
        
        # Calculate lifetime (days between first and last activity)
        user_features['first_seen'] = pd.to_datetime(user_features['first_seen'])
        user_features['lifetime_days'] = (
            user_features['last_seen'] - user_features['first_seen']
        ).dt.days + 1
        
        # Calculate derived features
        user_features['events_per_day'] = user_features['total_events'] / user_features['lifetime_days']
        user_features['revenue_per_day'] = user_features['total_revenue'] / user_features['lifetime_days']
        user_features['is_paying'] = (user_features['total_revenue'] > 0).astype(int)
        
        # Define churn (no activity in last 7 days)
        user_features['is_churned'] = (user_features['recency_days'] > 7).astype(int)
        
        return user_features.reset_index()
    
    def train_churn_model(self, features_df: pd.DataFrame) -> Dict:
        """Train churn prediction model"""
        # Select features for training
        feature_cols = [
            'total_events', 'total_revenue', 'avg_revenue', 'purchase_events',
            'gameplay_events', 'total_sessions', 'lifetime_days',
            'events_per_day', 'revenue_per_day', 'is_paying'
        ]
        
        X = features_df[feature_cols].fillna(0)
        y = features_df['is_churned']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train XGBoost model
        self.churn_model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        self.churn_model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred = self.churn_model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Feature importance
        feature_importance = dict(zip(feature_cols, self.churn_model.feature_importances_))
        
        self.logger.info(f"Churn model accuracy: {accuracy:.3f}")
        
        return {
            'accuracy': accuracy,
            'feature_importance': feature_importance,
            'classification_report': classification_report(y_test, y_pred, output_dict=True)
        }
    
    def predict_churn(self, features_df: pd.DataFrame) -> pd.DataFrame:
        """Predict churn for users"""
        feature_cols = [
            'total_events', 'total_revenue', 'avg_revenue', 'purchase_events',
            'gameplay_events', 'total_sessions', 'lifetime_days',
            'events_per_day', 'revenue_per_day', 'is_paying'
        ]
        
        X = features_df[feature_cols].fillna(0)
        X_scaled = self.scaler.transform(X)
        
        churn_prob = self.churn_model.predict_proba(X_scaled)[:, 1]
        churn_pred = self.churn_model.predict(X_scaled)
        
        features_df['churn_probability'] = churn_prob
        features_df['churn_prediction'] = churn_pred
        
        return features_df
    
    def user_segmentation_clustering(self, features_df: pd.DataFrame, 
                                   n_clusters: int = 4) -> Dict:
        """Perform user segmentation using clustering"""
        # Select features for clustering
        cluster_features = ['total_revenue', 'total_events', 'lifetime_days', 'events_per_day']
        X = features_df[cluster_features].fillna(0)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # K-means clustering
        self.clustering_model = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = self.clustering_model.fit_predict(X_scaled)
        
        features_df['cluster'] = clusters
        
        # Calculate cluster statistics
        cluster_stats = features_df.groupby('cluster')[cluster_features + ['total_revenue']].agg([
            'count', 'mean', 'median'
        ]).round(2)
        
        # Assign cluster labels based on characteristics
        cluster_labels = {}
        for i in range(n_clusters):
            cluster_data = features_df[features_df['cluster'] == i]
            avg_revenue = cluster_data['total_revenue'].mean()
            avg_activity = cluster_data['total_events'].mean()
            
            if avg_revenue > features_df['total_revenue'].quantile(0.8):
                cluster_labels[i] = 'High Value'
            elif avg_revenue > features_df['total_revenue'].quantile(0.5):
                cluster_labels[i] = 'Medium Value'
            elif avg_activity > features_df['total_events'].quantile(0.7):
                cluster_labels[i] = 'High Engagement'
            else:
                cluster_labels[i] = 'Low Engagement'
        
        features_df['cluster_label'] = features_df['cluster'].map(cluster_labels)
        
        return {
            'clustered_data': features_df,
            'cluster_stats': cluster_stats,
            'cluster_labels': cluster_labels
        }
    
    def anomaly_detection(self, df: pd.DataFrame, features: List[str]) -> pd.DataFrame:
        """Detect anomalies using Isolation Forest"""
        X = df[features].fillna(0)
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Isolation Forest
        self.anomaly_model = IsolationForest(contamination=0.1, random_state=42)
        anomaly_labels = self.anomaly_model.fit_predict(X_scaled)
        
        df['is_anomaly'] = (anomaly_labels == -1).astype(int)
        df['anomaly_score'] = self.anomaly_model.decision_function(X_scaled)
        
        return df
    
    def save_models(self, model_dir: str = "models/"):
        """Save trained models"""
        import os
        os.makedirs(model_dir, exist_ok=True)
        
        if self.churn_model:
            joblib.dump(self.churn_model, f"{model_dir}/churn_model.pkl")
            joblib.dump(self.scaler, f"{model_dir}/scaler.pkl")
        
        if self.clustering_model:
            joblib.dump(self.clustering_model, f"{model_dir}/clustering_model.pkl")
        
        if self.anomaly_model:
            joblib.dump(self.anomaly_model, f"{model_dir}/anomaly_model.pkl")
    
    def load_models(self, model_dir: str = "models/"):
        """Load trained models"""
        try:
            self.churn_model = joblib.load(f"{model_dir}/churn_model.pkl")
            self.scaler = joblib.load(f"{model_dir}/scaler.pkl")
            self.clustering_model = joblib.load(f"{model_dir}/clustering_model.pkl")
            self.anomaly_model = joblib.load(f"{model_dir}/anomaly_model.pkl")
            self.logger.info("Models loaded successfully")
        except Exception as e:
            self.logger.warning(f"Could not load models: {e}")