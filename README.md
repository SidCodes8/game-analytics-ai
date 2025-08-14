# Gaming Analytics Chatbot 🎮

A comprehensive Machine Learning-powered analytics platform for gaming companies to monitor player behavior, optimize in-app purchases, and improve retention strategies through AI-generated insights.

## 🚀 Features

### 📊 **Data Processing & Analytics**
- **Smart Upload**: Automatic schema detection for CSV/Excel files
- **Data Cleaning**: Timestamp normalization to IST, data type conversion
- **Event Categorization**: Automatic classification into gameplay, purchase, and system events
- **Key Metrics**: DAU, WAU, MAU, ARPPU, ARPDAU calculations
- **Advanced Analytics**: Cohort analysis, funnel optimization, user segmentation

### 🤖 **Machine Learning Capabilities**
- **Churn Prediction**: XGBoost-powered model to identify at-risk players
- **User Segmentation**: K-means clustering for targeted marketing
- **Anomaly Detection**: Statistical and ML-based anomaly identification
- **Predictive Analytics**: Revenue forecasting and player lifetime value

### 🧠 **AI-Powered Insights**
- **Perplexity Integration**: Natural language insights and recommendations
- **Conversational Analytics**: Chat with your data using plain English
- **Smart Recommendations**: Personalized monetization strategies
- **Business Intelligence**: Actionable insights for different player segments

### 📈 **Interactive Dashboard**
- **Real-time Filtering**: Date range, device type, user segment filters
- **Rich Visualizations**: Interactive Plotly charts and graphs
- **Drill-down Analysis**: Detailed exploration of metrics
- **Responsive Design**: Mobile-friendly interface

### 📄 **Comprehensive Reporting**
- **PDF Reports**: Executive summaries with key findings
- **PowerPoint Exports**: Presentation-ready slides
- **AI-Enhanced Reports**: Include machine-generated insights
- **Automated Generation**: One-click report creation

## 🛠️ Installation

### Prerequisites
- Python 3.9+
- Perplexity API Key ([Get one here](https://www.perplexity.ai/))

### Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd gaming-analytics-chatbot
   pip install -r requirements.txt
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env and add your PERPLEXITY_API_KEY
   ```

3. **Run Application**
   ```bash
   streamlit run src/dashboard.py
   ```

4. **Access Dashboard**
   - Open http://localhost:8501 in your browser
   - Enter your Perplexity API key in the sidebar
   - Upload sample data or your own CSV/Excel file

### 🐳 Docker Deployment

```bash
# Build image
docker build -t gaming-analytics .

# Run container
docker run -p 8501:8501 -e PERPLEXITY_API_KEY=your_api_key gaming-analytics
```

## 📊 Data Format

Your data should include columns such as:
- `user_id` / `player_id` - Unique user identifier
- `event_name` / `action` - Event type (login, purchase, level_start, etc.)
- `timestamp` / `event_time` - When the event occurred
- `revenue` / `amount` - Purchase amount (0 for non-revenue events)
- `device_type` / `platform` - android, ios, web
- `game_mode` / `level_type` - Game mode or level information
- `session_id` - Session identifier
- `country` / `region` - User location
- `age`, `gender` - User demographics (optional)

The system automatically detects and maps column names, so exact naming isn't required.

## 🎯 Use Cases

### For Product Managers
- **Player Retention**: Identify when and why players churn
- **Feature Impact**: Measure how game updates affect engagement
- **Monetization**: Optimize pricing and offer strategies

### For Data Scientists
- **ML Pipeline**: Ready-to-use churn prediction and segmentation models
- **Experimentation**: A/B testing framework for game features
- **Advanced Analytics**: Statistical anomaly detection and forecasting

### For Business Analysts
- **Executive Reporting**: Automated KPI dashboards
- **Trend Analysis**: Historical performance and seasonal patterns
- **Competitive Intelligence**: Benchmark against industry standards

### For Marketing Teams
- **Segmentation**: Target high-value player segments
- **Campaign Optimization**: Data-driven marketing strategies
- **LTV Prediction**: Customer lifetime value modeling

## 🤖 AI Assistant Commands

Ask natural language questions like:
- *"Show me revenue trends for whale players"*
- *"Why did retention drop in the last month?"*
- *"What offers should I create for casual spenders?"*
- *"Which players are most likely to churn?"*
- *"How can I improve DAU for mobile users?"*

## 📈 Analytics Capabilities

### Core Metrics
- **Daily/Weekly/Monthly Active Users**
- **Average Revenue Per Paying User (ARPPU)**
- **Average Revenue Per Daily Active User (ARPDAU)**
- **Player Lifetime Value (LTV)**
- **Retention Rates & Cohort Analysis**

### Segmentation
- **Behavioral Segments**: Based on playing patterns
- **Spending Segments**: Whales, mid-tier, casual, non-paying
- **Lifecycle Stages**: New, active, at-risk, churned
- **Custom Segments**: ML-powered clustering

### Predictive Analytics
- **Churn Prediction**: 7-day churn probability
- **Revenue Forecasting**: Expected future revenue
- **Anomaly Detection**: Unusual patterns in key metrics
- **Trend Analysis**: Growth trajectory predictions

## 🔧 Architecture

```
src/
├── dashboard.py          # Main Streamlit application
├── data_processor.py     # Data cleaning and preprocessing
├── analytics_engine.py   # Core analytics calculations
├── ml_models.py         # Machine learning models
├── perplexity_client.py # AI integration
└── report_generator.py  # PDF/PPTX generation

config/
└── mapping.json         # Schema mapping configuration

sample_data/
└── gaming_events_sample.csv  # Example dataset

models/                  # Trained ML models (auto-generated)
reports/                # Generated reports (auto-generated)
```

## 🚀 Deployment Options

### Local Development
```bash
streamlit run src/dashboard.py
```

### Docker Container
```bash
docker run -p 8501:8501 gaming-analytics
```

### Cloud Deployment
- **AWS**: ECS, EC2, or App Runner
- **Google Cloud**: Cloud Run or Compute Engine  
- **Azure**: Container Instances or App Service
- **Heroku**: Container deployment

## 📝 Configuration

### Schema Mapping (`config/mapping.json`)
Customize column name detection for your data format:

```json
{
  "schema_mappings": {
    "user_id": ["user_id", "player_id", "uid"],
    "event_name": ["event_name", "action", "event_type"],
    "timestamp": ["timestamp", "event_time", "created_at"]
  }
}
```

### Environment Variables
```bash
PERPLEXITY_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///gaming_analytics.db  # Optional
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check README and inline code comments
- **Sample Data**: Use provided `gaming_events_sample.csv` for testing
- **Issues**: Open GitHub issues for bugs or feature requests
- **API Keys**: Get your free Perplexity API key at https://www.perplexity.ai/

---

**Built with ❤️ for the gaming industry** | Powered by AI & Machine Learning