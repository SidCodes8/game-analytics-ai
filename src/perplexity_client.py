import requests
import json
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
import logging

load_dotenv()

class PerplexityClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("PERPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.logger = logging.getLogger(__name__)
    
    def generate_insights(self, metrics_data: Dict, context: str = "gaming analytics") -> str:
        """Generate AI insights from metrics data"""
        if not self.api_key:
            return "Perplexity API key not configured. Please set PERPLEXITY_API_KEY in your environment."
        
        # Prepare data summary for the AI
        data_summary = self._prepare_data_summary(metrics_data)
        
        prompt = f"""
        You are a senior gaming analytics expert. Analyze the following {context} data and provide actionable insights:

        {data_summary}

        Please provide:
        1. Key findings and trends
        2. Potential issues or opportunities
        3. Specific recommendations for improving player retention and monetization
        4. Actionable strategies for in-app purchase optimization

        Be specific, data-driven, and focus on practical business implications.
        """
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "llama-3.1-sonar-small-128k-online",
                    "messages": [
                        {"role": "system", "content": "You are an expert gaming analytics consultant specializing in player behavior analysis and monetization optimization."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                self.logger.error(f"API request failed: {response.status_code} - {response.text}")
                return f"API request failed with status {response.status_code}"
                
        except Exception as e:
            self.logger.error(f"Error calling Perplexity API: {e}")
            return f"Error generating insights: {str(e)}"
    
    def answer_query(self, question: str, context_data: Dict) -> str:
        """Answer specific questions about the data"""
        if not self.api_key:
            return "Perplexity API key not configured. Please set PERPLEXITY_API_KEY in your environment."
        
        data_context = self._prepare_data_summary(context_data)
        
        prompt = f"""
        Based on the following gaming analytics data, answer this question: "{question}"

        Data Context:
        {data_context}

        Provide a specific, data-driven answer with actionable insights where relevant.
        """
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "llama-3.1-sonar-small-128k-online",
                    "messages": [
                        {"role": "system", "content": "You are a gaming analytics expert. Answer questions based on the provided data with specific insights and recommendations."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 800,
                    "temperature": 0.5
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                self.logger.error(f"API request failed: {response.status_code}")
                return "I'm sorry, I couldn't process your question at the moment."
                
        except Exception as e:
            self.logger.error(f"Error calling Perplexity API: {e}")
            return f"Error answering question: {str(e)}"
    
    def generate_recommendations(self, segment: str, metrics: Dict) -> str:
        """Generate specific recommendations for user segments"""
        if not self.api_key:
            return "Perplexity API key not configured."
        
        prompt = f"""
        Generate specific monetization recommendations for {segment} players in a mobile game based on these metrics:

        {json.dumps(metrics, indent=2)}

        Focus on:
        1. Optimal pricing strategies
        2. Personalized offer recommendations
        3. Engagement tactics
        4. Retention strategies

        Provide concrete, implementable suggestions.
        """
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "llama-3.1-sonar-small-128k-online",
                    "messages": [
                        {"role": "system", "content": "You are a mobile gaming monetization expert. Provide specific, actionable recommendations for different player segments."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 600,
                    "temperature": 0.6
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                return "Unable to generate recommendations at the moment."
                
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            return "Error generating recommendations."
    
    def _prepare_data_summary(self, data: Dict) -> str:
        """Prepare a concise summary of the data for the AI"""
        summary_parts = []
        
        # Handle different types of metrics data
        if 'dau' in data:
            dau_avg = data['dau']['dau'].mean() if len(data['dau']) > 0 else 0
            summary_parts.append(f"Average Daily Active Users: {dau_avg:.0f}")
        
        if 'total_revenue' in data:
            summary_parts.append(f"Total Revenue: ${data['total_revenue']:,.2f}")
        
        if 'avg_arppu' in data:
            summary_parts.append(f"Average ARPPU: ${data['avg_arppu']:.2f}")
        
        if 'segment_summary' in data:
            segments = data['segment_summary'].index.tolist()
            summary_parts.append(f"User Segments: {', '.join(segments)}")
        
        if 'churn_rate' in data:
            summary_parts.append(f"Churn Rate: {data['churn_rate']:.1%}")
        
        if 'anomalies' in data and data['anomalies']:
            summary_parts.append(f"Detected {len(data['anomalies'])} anomalies")
        
        return "\n".join(summary_parts) if summary_parts else "No specific metrics available"