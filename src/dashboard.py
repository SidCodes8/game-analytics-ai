import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np
from datetime import datetime, timedelta
import os
import json

# Page config
st.set_page_config(
    page_title="Gaming Analytics Chatbot",
    page_icon="🎮",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main {
        padding-top: 2rem;
    }
    .stMetric {
        background-color: #1f2937;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #374151;
    }
    .stMetric label {
        color: #9ca3af !important;
    }
    .stMetric div[data-testid="metric-container"] div {
        color: #ffffff !important;
    }
    .chat-container {
        background-color: #1f2937;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        border: 1px solid #374151;
    }
    .insight-box {
        background-color: #065f46;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        border-left: 4px solid #10b981;
    }
    .sidebar .sidebar-content {
        background-color: #111827;
    }
    h1, h2, h3 {
        color: #f9fafb;
    }
    .stSelectbox label {
        color: #d1d5db !important;
    }
</style>
""", unsafe_allow_html=True)

# Import our modules
from data_processor import GameDataProcessor
from analytics_engine import GameAnalyticsEngine
from ml_models import MLAnalytics
from perplexity_client import PerplexityClient
from report_generator import ReportGenerator

# Initialize components
@st.cache_resource
def initialize_components():
    processor = GameDataProcessor()
    analytics = GameAnalyticsEngine()
    ml_analytics = MLAnalytics()
    perplexity = PerplexityClient()
    report_gen = ReportGenerator()
    return processor, analytics, ml_analytics, perplexity, report_gen

processor, analytics, ml_analytics, perplexity, report_gen = initialize_components()

# Session state initialization
if 'data_loaded' not in st.session_state:
    st.session_state.data_loaded = False
if 'processed_data' not in st.session_state:
    st.session_state.processed_data = None
if 'analytics_results' not in st.session_state:
    st.session_state.analytics_results = {}
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

# Sidebar
st.sidebar.title("🎮 Gaming Analytics")
st.sidebar.markdown("---")

# API Key Input
api_key = st.sidebar.text_input("Perplexity API Key", type="password", 
                                placeholder="Enter your API key...")
if api_key:
    os.environ["PERPLEXITY_API_KEY"] = api_key
    perplexity = PerplexityClient(api_key)

# File Upload
st.sidebar.subheader("📊 Data Upload")
uploaded_file = st.sidebar.file_uploader(
    "Upload game analytics data",
    type=['csv', 'xlsx'],
    help="Upload CSV or Excel file containing game event logs"
)

if uploaded_file is not None:
    with st.sidebar.container():
        if st.button("🔄 Process Data", type="primary"):
            with st.spinner("Processing data..."):
                # Save uploaded file temporarily
                temp_path = f"temp_{uploaded_file.name}"
                with open(temp_path, "wb") as f:
                    f.write(uploaded_file.getbuffer())
                
                try:
                    # Process the data
                    df, mapping = processor.process_data(temp_path)
                    df_enhanced = processor.add_derived_features(df, mapping)
                    
                    st.session_state.processed_data = df_enhanced
                    st.session_state.column_mapping = mapping
                    st.session_state.data_loaded = True
                    
                    # Clean up temp file
                    os.remove(temp_path)
                    
                    st.sidebar.success(f"✅ Processed {len(df_enhanced)} records")
                    
                except Exception as e:
                    st.sidebar.error(f"❌ Error processing data: {str(e)}")
                    if os.path.exists(temp_path):
                        os.remove(temp_path)

# Main content
col1, col2 = st.columns([2, 1])

with col1:
    st.title("🎮 Gaming Analytics Dashboard")
    st.markdown("**AI-Powered Player Behavior Analysis & Monetization Optimization**")

with col2:
    if st.session_state.data_loaded:
        st.success("✅ Data loaded successfully")
    else:
        st.info("👈 Upload data to get started")

# Main dashboard
if st.session_state.data_loaded:
    df = st.session_state.processed_data
    mapping = st.session_state.column_mapping
    
    # Filters
    st.markdown("### 🔍 Filters")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        date_range = st.date_input(
            "Date Range",
            value=(df[mapping['timestamp']].dt.date.min(), 
                   df[mapping['timestamp']].dt.date.max()),
            min_value=df[mapping['timestamp']].dt.date.min(),
            max_value=df[mapping['timestamp']].dt.date.max()
        )
    
    with col2:
        device_types = ['All'] + list(df[mapping.get('device_type', 'device_type')].dropna().unique())
        selected_device = st.selectbox("Device Type", device_types)
    
    with col3:
        segments = ['All'] + ['whale', 'mid_tier', 'casual', 'non_paying']
        selected_segment = st.selectbox("User Segment", segments)
    
    with col4:
        if st.button("🔄 Refresh Analytics", type="secondary"):
            st.rerun()
    
    # Filter data
    filtered_df = df.copy()
    
    if len(date_range) == 2:
        start_date, end_date = date_range
        filtered_df = filtered_df[
            (filtered_df[mapping['timestamp']].dt.date >= start_date) &
            (filtered_df[mapping['timestamp']].dt.date <= end_date)
        ]
    
    if selected_device != 'All' and mapping.get('device_type'):
        filtered_df = filtered_df[filtered_df[mapping['device_type']] == selected_device.lower()]
    
    # Run analytics
    with st.spinner("Computing analytics..."):
        # Basic metrics
        user_col = mapping.get('user_id', 'User_ID')
        revenue_col = mapping.get('revenue', 'revenue')
        date_col = mapping.get('timestamp', 'timestamp')
        
        # Handle case where we have user summary data instead of events
        if 'total_revenue' in mapping and 'Total_Revenue_USD' in df.columns:
            revenue_col = mapping['total_revenue']
        if 'signup_date' in mapping:
            date_col = 'signup_date'
        
        # DAU/WAU/MAU
        activity_metrics = analytics.calculate_dau_wau_mau(filtered_df, user_col, date_col)
        
        # Revenue metrics
        revenue_metrics = analytics.calculate_revenue_metrics(filtered_df, user_col, revenue_col, date_col)
        
        # User segmentation
        segmentation = analytics.segment_users(filtered_df, user_col, revenue_col)
        
        # ML Analytics
        churn_features = ml_analytics.prepare_churn_features(
            filtered_df, user_col, date_col, revenue_col
        )
        
        if len(churn_features) > 10:  # Ensure enough data for ML
            churn_results = ml_analytics.train_churn_model(churn_features)
            clustering_results = ml_analytics.user_segmentation_clustering(churn_features)
            
            # Store results
            st.session_state.analytics_results = {
                'activity_metrics': activity_metrics,
                'revenue_metrics': revenue_metrics,
                'segmentation': segmentation,
                'churn_results': churn_results,
                'clustering_results': clustering_results,
                'total_revenue': revenue_metrics['total_revenue'],
                'avg_arppu': revenue_metrics['avg_arppu'],
                'avg_arpdau': revenue_metrics['avg_arpdau']
            }
    
    # Key Metrics Cards
    st.markdown("### 📈 Key Performance Metrics")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_users = filtered_df[user_col].nunique()
        st.metric("Total Users", f"{total_users:,}")
    
    with col2:
        total_revenue = filtered_df[revenue_col].sum()
        st.metric("Total Revenue", f"${total_revenue:,.2f}")
    
    with col3:
        avg_dau = activity_metrics['dau']['dau'].mean() if len(activity_metrics['dau']) > 0 else 0
        st.metric("Avg DAU", f"{avg_dau:.0f}")
    
    with col4:
        arppu = revenue_metrics.get('avg_arppu', 0)
        st.metric("ARPPU", f"${arppu:.2f}")
    
    # Charts
    st.markdown("### 📊 Analytics Visualizations")
    
    # Create tabs for different views
    tab1, tab2, tab3, tab4 = st.tabs(["📈 Trends", "👥 Segments", "🔮 ML Insights", "💬 AI Chat"])
    
    with tab1:
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Daily Active Users")
            if len(activity_metrics['dau']) > 0:
                fig = px.line(activity_metrics['dau'], x='date', y='dau',
                             title="Daily Active Users Over Time")
                fig.update_layout(template="plotly_dark")
                st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Daily Revenue")
            if len(revenue_metrics['daily_revenue']) > 0:
                fig = px.bar(revenue_metrics['daily_revenue'], x='date', y='revenue',
                            title="Daily Revenue")
                fig.update_layout(template="plotly_dark")
                st.plotly_chart(fig, use_container_width=True)
        
        # Event category distribution
        st.subheader("Event Category Distribution")
        event_dist = filtered_df['event_category'].value_counts()
        fig = px.pie(values=event_dist.values, names=event_dist.index,
                    title="Distribution of Event Types")
        fig.update_layout(template="plotly_dark")
        st.plotly_chart(fig, use_container_width=True)
    
    with tab2:
        st.subheader("User Segmentation Analysis")
        
        if 'segmentation' in st.session_state.analytics_results:
            seg_data = st.session_state.analytics_results['segmentation']
            
            # Segment distribution
            col1, col2 = st.columns(2)
            
            with col1:
                segment_counts = seg_data['user_segments']['segment'].value_counts()
                fig = px.pie(values=segment_counts.values, names=segment_counts.index,
                            title="User Segment Distribution")
                fig.update_layout(template="plotly_dark")
                st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                # Segment revenue
                segment_revenue = seg_data['user_segments'].groupby('segment')['total_spend'].sum()
                fig = px.bar(x=segment_revenue.index, y=segment_revenue.values,
                            title="Revenue by Segment")
                fig.update_layout(template="plotly_dark")
                st.plotly_chart(fig, use_container_width=True)
            
            # Segment details table
            st.subheader("Segment Details")
            if hasattr(seg_data['segment_summary'], 'index'):
                segment_display = pd.DataFrame({
                    'Segment': seg_data['segment_summary'].index,
                    'Users': seg_data['segment_summary'].iloc[:, 0] if len(seg_data['segment_summary'].columns) > 0 else 0,
                    'Total Revenue': seg_data['segment_summary'].iloc[:, 1] if len(seg_data['segment_summary'].columns) > 1 else 0,
                    'Avg Revenue': seg_data['segment_summary'].iloc[:, 2] if len(seg_data['segment_summary'].columns) > 2 else 0
                })
                st.dataframe(segment_display, use_container_width=True)
    
    with tab3:
        st.subheader("🤖 Machine Learning Insights")
        
        if 'churn_results' in st.session_state.analytics_results:
            churn_data = st.session_state.analytics_results['churn_results']
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("Churn Model Accuracy", f"{churn_data['accuracy']:.1%}")
                
                # Feature importance
                st.subheader("Top Churn Predictors")
                importance_df = pd.DataFrame([
                    {'Feature': k, 'Importance': v} 
                    for k, v in churn_data['feature_importance'].items()
                ]).sort_values('Importance', ascending=False).head(5)
                
                fig = px.bar(importance_df, x='Importance', y='Feature',
                            orientation='h', title="Feature Importance")
                fig.update_layout(template="plotly_dark")
                st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                if 'clustering_results' in st.session_state.analytics_results:
                    clustering_data = st.session_state.analytics_results['clustering_results']
                    
                    # Cluster visualization
                    cluster_df = clustering_data['clustered_data']
                    fig = px.scatter(cluster_df, x='total_revenue', y='total_events',
                                   color='cluster_label', title="User Clusters")
                    fig.update_layout(template="plotly_dark")
                    st.plotly_chart(fig, use_container_width=True)
    
    with tab4:
        st.subheader("💬 AI Analytics Assistant")
        
        # Chat interface
        if api_key:
            # Display chat history
            for chat in st.session_state.chat_history:
                with st.container():
                    st.markdown(f"**You:** {chat['question']}")
                    st.markdown(f"**AI:** {chat['answer']}")
                    st.markdown("---")
            
            # Chat input
            question = st.text_input("Ask about your data:", 
                                   placeholder="e.g., 'Show me revenue trends for whales' or 'Why did retention drop?'")
            
            if question and st.button("🚀 Ask AI"):
                with st.spinner("AI is analyzing your data..."):
                    # Prepare context data
                    context_data = st.session_state.analytics_results
                    
                    # Get AI response
                    answer = perplexity.answer_query(question, context_data)
                    
                    # Store in chat history
                    st.session_state.chat_history.append({
                        'question': question,
                        'answer': answer
                    })
                    
                    st.rerun()
            
            # Quick questions
            st.markdown("**Quick Questions:**")
            col1, col2 = st.columns(2)
            
            with col1:
                if st.button("💰 Revenue optimization tips"):
                    context_data = st.session_state.analytics_results
                    answer = perplexity.generate_recommendations("revenue optimization", context_data)
                    st.session_state.chat_history.append({
                        'question': "Revenue optimization tips",
                        'answer': answer
                    })
                    st.rerun()
            
            with col2:
                if st.button("🎯 Retention strategies"):
                    context_data = st.session_state.analytics_results
                    answer = perplexity.generate_recommendations("retention strategies", context_data)
                    st.session_state.chat_history.append({
                        'question': "Retention strategies",
                        'answer': answer
                    })
                    st.rerun()
        else:
            st.warning("⚠️ Please enter your Perplexity API key in the sidebar to use the AI assistant.")
    
    # AI Insights Section
    if api_key and st.session_state.analytics_results:
        st.markdown("### 🧠 AI-Generated Insights")
        
        if st.button("🔮 Generate AI Insights", type="primary"):
            with st.spinner("AI is analyzing your data..."):
                insights = perplexity.generate_insights(st.session_state.analytics_results)
                
                with st.container():
                    st.markdown('<div class="insight-box">', unsafe_allow_html=True)
                    st.markdown("**AI Insights & Recommendations:**")
                    st.markdown(insights)
                    st.markdown('</div>', unsafe_allow_html=True)
    
    # Report Generation
    st.markdown("### 📄 Report Generation")
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("📑 Generate PDF Report"):
            with st.spinner("Generating PDF report..."):
                insights_text = "AI insights not available" if not api_key else perplexity.generate_insights(st.session_state.analytics_results)
                pdf_path = report_gen.generate_pdf_report(st.session_state.analytics_results, insights_text)
                
                with open(pdf_path, "rb") as file:
                    st.download_button(
                        label="📥 Download PDF",
                        data=file.read(),
                        file_name="gaming_analytics_report.pdf",
                        mime="application/pdf"
                    )
    
    with col2:
        if st.button("📊 Generate PowerPoint"):
            with st.spinner("Generating PowerPoint..."):
                insights_text = "AI insights not available" if not api_key else perplexity.generate_insights(st.session_state.analytics_results)
                pptx_path = report_gen.generate_pptx_report(st.session_state.analytics_results, insights_text)
                
                with open(pptx_path, "rb") as file:
                    st.download_button(
                        label="📥 Download PPTX",
                        data=file.read(),
                        file_name="gaming_analytics_presentation.pptx",
                        mime="application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    )

else:
    # Welcome screen
    st.markdown("""
    ## Welcome to Gaming Analytics Chatbot! 🎮
    
    This comprehensive platform helps gaming companies:
    
    ### 🔍 **Data Processing**
    - Upload Excel/CSV files with automatic schema detection
    - Clean and normalize timestamps, revenue, and user data
    - Categorize events into gameplay, purchase, and system types
    
    ### 📊 **Advanced Analytics**
    - Track DAU, WAU, MAU, ARPPU, and ARPDAU
    - Perform cohort analysis and funnel optimization
    - Segment users by spending behavior
    - Detect anomalies in key metrics
    
    ### 🤖 **Machine Learning**
    - Predict player churn with XGBoost models
    - Cluster users for targeted marketing
    - Detect unusual patterns in player behavior
    
    ### 🧠 **AI-Powered Insights**
    - Natural language insights via Perplexity API
    - Conversational analytics queries
    - Personalized monetization recommendations
    
    ### 📈 **Interactive Dashboard**
    - Real-time filtering and visualization
    - Drill-down capabilities for detailed analysis
    - Export-ready reports (PDF & PowerPoint)
    
    ### 🚀 **Get Started**
    1. Enter your Perplexity API key in the sidebar
    2. Upload your game analytics data (CSV or Excel)
    3. Click "Process Data" to begin analysis
    4. Explore insights and chat with the AI assistant!
    
    ---
    
    **Sample Data Format:**
    Your data should include columns like: `user_id`, `event_name`, `timestamp`, `revenue`, `device_type`, etc.
    The system will automatically detect and map your column names.
    """)

# Footer
st.markdown("---")
st.markdown("**Gaming Analytics Chatbot** | Powered by AI & Machine Learning | Built with ❤️")