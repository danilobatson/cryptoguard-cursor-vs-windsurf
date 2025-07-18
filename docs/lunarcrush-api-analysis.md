# LunarCrush API Analysis for CryptoGuard

## 🎯 Key Endpoints We'll Use

### 1. Topic Data (Real-time crypto info)
**Endpoint**: `/topic/{symbol}`
**Example**: `/topic/bitcoin`

**Key Response Data**:
- `price`: Current price (e.g., "$120,389.10")
- `sentiment`: 0-100% sentiment score
- `social_dominance`: Social media dominance %
- `engagements`: Total social engagement count
- `mentions`: Number of social mentions
- `volume_24h`: 24-hour trading volume
- `market_cap`: Current market capitalization
- `percent_change_24h`: 24-hour price change %

### 2. Time Series Data (For trends)
**Endpoint**: `/topic/{symbol}/time-series/{interval}/{metrics}`
**Example**: `/topic/bitcoin/time-series/1h/close,sentiment`

**Use Case**: Track price and sentiment changes over time for alert triggers

### 3. Real-time Posts (Social signals)
**Endpoint**: `/topic/{symbol}/posts/{interval}`
**Example**: `/topic/bitcoin/posts/1h`

**Use Case**: Monitor social activity spikes that often precede price movements

## 🔔 Alert System Data Requirements

### Price Alerts
```javascript
{
  symbol: "bitcoin",
  current_price: 120389.10,
  target_price: 125000,
  alert_type: "above", // above, below, percent_change
  triggered: false
}
```

### Sentiment Alerts
```javascript
{
  symbol: "bitcoin",
  current_sentiment: 82,
  target_sentiment: 90,
  alert_type: "bullish_spike",
  triggered: false
}
```

### Social Activity Alerts
```javascript
{
  symbol: "bitcoin",
  current_mentions: 219768,
  baseline_mentions: 150000,
  spike_threshold: 1.5, // 50% increase
  triggered: false
}
```

## 🌊 Real-Time Implementation Strategy

1. **WebSocket Connection**: Use Cloudflare Durable Objects for WebSocket management
2. **Polling Strategy**: Fetch data every 30 seconds for price, 5 minutes for sentiment
3. **Alert Logic**: Client-side JavaScript + server-side validation
4. **State Management**: Zustand for frontend state, Durable Objects for persistence

## 📊 Sample Real Data (Bitcoin - July 17, 2025)

```javascript
const liveData = {
  bitcoin: {
    price: "$120,389.10",
    price_change_24h: "+1.65%",
    sentiment: 82,
    social_dominance: "20.70%",
    volume_24h: "$71,484,927,848",
    mentions: 219768,
    engagements: 141789582,
    market_cap: "$2,395,001,813,211"
  }
};
```

## 🏗️ Technical Architecture Overview

### Frontend Components
- **AlertDashboard**: Main dashboard showing active alerts
- **CryptoCard**: Individual crypto asset cards with real-time data
- **AlertForm**: Create/edit price and sentiment alerts
- **NotificationCenter**: Display triggered alerts
- **SettingsPanel**: User preferences and API configuration

### Backend Services
- **DataFetcher**: Polls LunarCrush API for updates
- **AlertEngine**: Processes alerts and triggers notifications
- **WebSocketManager**: Handles real-time client connections
- **CacheManager**: Optimizes API calls and stores recent data

### Data Flow
```
LunarCrush API → Cloudflare Worker → Cache → WebSocket → React Frontend
     ↓              ↓                 ↓           ↓
  Real Data    → Alert Engine   → Storage  → User Alerts
```

## 🔧 Implementation Priorities

### Phase 1: Basic Price Alerts
- Bitcoin and Ethereum price monitoring
- Simple above/below threshold alerts
- Basic WebSocket real-time updates

### Phase 2: Sentiment Analysis
- Social sentiment tracking
- Sentiment spike alerts
- Historical sentiment trends

### Phase 3: Advanced Features
- Multi-asset portfolio alerts
- Social activity spike detection
- Custom alert conditions
- Mobile notifications

This data structure will form the foundation of our real-time alert system.
