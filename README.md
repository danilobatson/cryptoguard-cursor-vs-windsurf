# 🥊 CryptoGuard - AI IDE Battle Project

A sophisticated real-time cryptocurrency alert system built twice to determine the ultimate AI IDE winner in the epic battle: **Cursor vs Windsurf**.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev/)
[![Mantine](https://img.shields.io/badge/Mantine-7-blue?logo=mantine)](https://mantine.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)
[![LunarCrush](https://img.shields.io/badge/LunarCrush-API-purple)](https://lunarcrush.com/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://cryptoguard-frontend.pages.dev/)

## 🎯 Portfolio Highlights

**Perfect for demonstrating modern full-stack development and AI IDE evaluation skills:**

- 🥊 **AI IDE Comparison**: Comprehensive Cursor vs Windsurf battle documentation
- 🚀 **Real-time Alerts**: 11 different cryptocurrency alert types with browser notifications
- 📊 **Live Social Data**: LunarCrush API integration for sentiment and social metrics
- ⚡ **Serverless Architecture**: Cloudflare Workers + Durable Objects
- 🎨 **Modern UI**: React + Mantine with glassmorphism dark theme
- 🔄 **State Management**: Zustand + React Query for optimal performance

---

## 🚀 Live Demo

### **Production Deployments**
- **🏆 Cursor Build**: [Live Demo](https://cryptoguard-frontend.pages.dev/) *(Current Winner)*
- **🥊 Windsurf Build**: Coming Soon - Battle in Progress
- **📊 Backend API**: [API Explorer](https://cryptoguard-api.cryptoguard-api.workers.dev/docs)

### **🎬 Battle Documentation**
- **📝 Development Article**: Coming Soon on dev.to
- **📊 Performance Metrics**: [Battle Results](./BATTLE_RESULTS.md)
- **🔍 Code Comparison**: [Side-by-side Analysis](./docs/code-comparison.md)

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern component-based architecture
- **Vite** - Lightning-fast build tool and dev server
- **Mantine** - Professional component library with dark theme
- **Zustand** - Lightweight state management
- **React Query** - Data fetching with caching and real-time updates
- **Recharts** - Interactive cryptocurrency price charts

### **Backend & Infrastructure**
- **Cloudflare Workers** - Edge computing for ultra-fast API responses
- **Durable Objects** - WebSocket management and persistent connections
- **LunarCrush API** - Real-time crypto social data and sentiment analysis
- **Cloudflare Pages** - Global CDN deployment with auto-deployment

### **AI IDEs Tested**
- **Cursor IDE** - VS Code-based AI-first development environment
- **Windsurf IDE** - Next-generation AI IDE from Codeium team

---

## 🎯 Key Features

### **🚨 Advanced Alert System**
- **11 Alert Types**: Price, volume, sentiment, technical analysis, and more
- **Browser Notifications**: Native OS integration with rich notifications
- **Persistent Storage**: Alerts survive browser restarts and page refreshes
- **Real-time Monitoring**: Continuous price comparison with instant triggers

### **📊 Real-Time Dashboard**
- **Live Price Updates**: 30-second polling with pause/resume controls
- **Social Sentiment**: Real-time sentiment analysis from LunarCrush
- **Galaxy Score**: LunarCrush's proprietary crypto influence metric
- **Data Freshness**: Visual indicators showing data age (FRESH/RECENT/STALE)

### **⚡ Professional Architecture**
- **Error Boundaries**: Comprehensive error handling with user-friendly messages
- **Loading States**: Professional skeleton components during data fetch
- **Performance Optimized**: Efficient polling with intelligent caching
- **Mobile Responsive**: Works perfectly on desktop and mobile devices

### **🥊 IDE Battle Features**
- **Identical Codebases**: Same features built with different AI IDEs
- **Development Metrics**: Speed, AI assistance quality, bug detection
- **Code Quality Comparison**: Architecture, maintainability, best practices
- **Developer Experience**: Setup time, learning curve, productivity gains

---

## 🏗️ Architecture

```bash
┌─ Frontend (React + Vite) ────┐    ┌─ Real-time Data ─┐
│                              │    │                  │
│  CryptoGuard Dashboard       │◄──►│  LunarCrush API  │
│  ├─ Alert Management        │    │  Social Data     │
│  ├─ Real-time Price Cards   │    │                  │
│  ├─ Notification System     │    └──────────────────┘
│  └─ State Management        │               ▲
│                              │               │
└──────────────┬───────────────┘               │
               │                               │
               ▼                               │
┌─ Cloudflare Workers API ─────┐               │
│                              │               │
│  /crypto/{symbol}            │───────────────┘
│  ├─ Authentication          │
│  ├─ Caching & Rate Limiting │◄──┐
│  └─ Error Handling          │    │
│                              │    │
└──────────────────────────────┘    │
                                    │
┌─ State Management Layer ─────┐    │
│                              │────┘
│  Zustand + React Query       │
│  ├─ Crypto Data Store       │
│  ├─ Alert Management        │
│  ├─ Real-time Updates       │
│  └─ Browser Notifications   │
│                              │
└──────────────────────────────┘
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- Git
- LunarCrush API access (enterprise/developer account recommended)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/danilobatson/cryptoguard-cursor-vs-windsurf.git
cd cryptoguard-cursor-vs-windsurf

# Choose your build (Cursor version is production-ready)
cd cursor-build/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### **Environment Variables**

```env
# .env.local
VITE_API_BASE_URL=https://cryptoguard-api.cryptoguard-api.workers.dev
VITE_ENVIRONMENT=development
VITE_APP_NAME=CryptoGuard
```

### **Development**

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000

# Run comprehensive test suite
# Open browser console and run:
cryptoTest.full()
```

### **Production Build**

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Cloudflare Pages (auto-deploys from GitHub)
git push origin main
```

---

## 📁 Project Structure

```bash
cryptoguard-cursor-vs-windsurf/
├── 🥊 README.md                    # This epic battle documentation
├── 📊 BATTLE_RESULTS.md            # Cursor vs Windsurf comparison
├── 📋 docs/                        # Technical documentation
│
├── 🏗️ cursor-build/                # Built with Cursor IDE
│   ├── 📱 frontend/
│   │   ├── 🏠 src/
│   │   │   ├── 📦 components/
│   │   │   │   ├── 🚨 alerts/      # Alert system components
│   │   │   │   ├── 📊 dashboard/   # Real-time dashboard
│   │   │   │   └── 🎨 ui/          # Reusable UI components
│   │   │   ├── 🏪 stores/          # Zustand state management
│   │   │   ├── 🔧 hooks/           # Custom React hooks
│   │   │   └── 📚 lib/             # Utilities and configurations
│   │   └── 🧪 public/
│   │       └── 📋 load-tests.js    # Comprehensive test suite
│   └── ⚡ workers/                 # Cloudflare Workers backend
│       ├── 🌐 api/                 # API routes and middleware
│       └── 🔄 durable-objects/     # WebSocket management
│
├── 🌪️ windsurf-build/              # Built with Windsurf IDE (Coming Soon)
│   └── 📝 [Identical structure]
│
└── 📈 assets/                      # Battle screenshots and metrics
    ├── 📸 cursor-screenshots/
    └── 📸 windsurf-screenshots/
```

---

## 🎨 Features Showcase

### **Real-Time Alert System**

```javascript
// Create sophisticated price alerts
const alertStore = useAlertStore();

alertStore.createAlert({
  type: 'price_above',
  symbol: 'bitcoin',
  threshold: 120000,
  notification: true,
  conditions: {
    volume_24h: '> 50000000000',
    sentiment: '> 0.6'
  }
});

// Real-time alert monitoring
const { alerts, checkAlerts } = useAlertChecker();
```

### **LunarCrush Integration**

```javascript
// Fetch real-time crypto social data
const { data, isLoading } = useCryptoData('bitcoin', {
  refetchInterval: 30000,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
});

// Access rich social metrics
const {
  price,
  sentiment,
  galaxy_score,
  social_dominance,
  alt_rank
} = data;
```

### **State Management**

```javascript
// Zustand store with persistence
const useCryptoStore = create(
  persist(
    (set, get) => ({
      cryptoData: {},
      alerts: [],
      updateCryptoData: (symbol, data) =>
        set(state => ({
          cryptoData: { ...state.cryptoData, [symbol]: data }
        })),
      // Real-time alert checking logic
    }),
    { name: 'cryptoguard-storage' }
  )
);
```

---

## 🚀 Deployment

### **Cloudflare Pages (Current)**

The project auto-deploys to Cloudflare Pages on every GitHub commit:

```bash
# Automatic deployment on push
git push origin main
# ✅ Triggers build and deployment to Cloudflare Pages

# Manual deployment via Wrangler
npm run build
wrangler pages publish dist --project-name=cryptoguard-frontend
```

### **Alternative Platforms**

- **Vercel**: Perfect for React/Vite projects with edge functions
- **Netlify**: Excellent for static sites with form handling
- **Railway**: Full-stack deployment with databases

---

## 🥊 IDE Battle Results

### **Development Speed Comparison**

| Metric                   | Cursor IDE         | Windsurf IDE | Winner            |
| ------------------------ | ------------------ | ------------ | ----------------- |
| **Setup Time**           | 45 minutes         | TBD          | TBD               |
| **Component Generation** | Excellent          | TBD          | TBD               |
| **API Integration**      | Very Good          | TBD          | TBD               |
| **Error Detection**      | Excellent          | TBD          | TBD               |
| **Code Quality**         | A+                 | TBD          | TBD               |
| **Final Deployment**     | ✅ Production Ready | TBD          | 🏆 Cursor (so far) |

### **Key Findings (Cursor)**
- ✅ **AI Suggestions**: Context-aware code completion across multiple files
- ✅ **Error Prevention**: Caught potential bugs before runtime
- ✅ **Refactoring**: Intelligent component extraction and optimization
- ✅ **Documentation**: Generated comprehensive comments and docs

### **Coming Soon: Windsurf Analysis**
The complete comparison article will be published once both builds are complete, featuring:
- Side-by-side development videos
- Code quality analysis
- Developer experience ratings
- Final recommendation for different use cases

---

## 💼 Portfolio Value

### **Technical Achievements**
- ✅ **Real-time Architecture**: WebSocket-ready serverless system
- ✅ **Modern React Patterns**: Hooks, context, performance optimization
- ✅ **State Management**: Complex Zustand + React Query implementation
- ✅ **API Integration**: Production-ready LunarCrush enterprise integration
- ✅ **Error Handling**: Comprehensive error boundaries and user feedback
- ✅ **Testing**: Complete test suite with diagnostics and monitoring

### **Business Value**
- ✅ **Cryptocurrency Market**: High-demand industry with growth potential
- ✅ **Real-time Systems**: Scalable architecture for live data processing
- ✅ **Alert Systems**: Complex business logic with notification management
- ✅ **Social Sentiment**: Advanced social media data analysis
- ✅ **Performance Optimization**: Sub-200ms API responses globally

### **Interview Preparation**
- ✅ **System Design**: Discuss serverless architecture decisions
- ✅ **Scalability**: Explain edge computing and global deployment
- ✅ **Modern Stack**: Demonstrate latest React and JavaScript features
- ✅ **Problem Solving**: Real-time data challenges and solutions

---

## 🤝 Contributing

This is an open-source IDE comparison project! Contributions welcome:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Special Interest**: Help us test more AI IDEs! We're considering adding:
- **GitHub Copilot Workspace**
- **Replit Agent**
- **CodeWhisperer**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LunarCrush** - Real-time cryptocurrency social data
- **Cursor Team** - Revolutionary AI-first IDE experience
- **Windsurf Team** - Next-generation AI development environment
- **Cloudflare** - Global edge computing platform
- **Mantine** - Beautiful React component library

---

## 📞 Contact

**Danilo Batson** - Software Engineer @ LunarCrush
📧 [djbatson19@gmail.com](mailto:djbatson19@gmail.com)
🔗 [LinkedIn](https://linkedin.com/in/danilo-batson)
🌐 [Portfolio](https://danilobatson.github.io/)

---

<div align="center">

**⭐ Star this repo to follow the epic AI IDE battle!**

[![GitHub stars](https://img.shields.io/github/stars/danilobatson/cryptoguard-cursor-vs-windsurf?style=social)](https://github.com/danilobatson/cryptoguard-cursor-vs-windsurf/stargazers)

**🥊 Who do you think will win? Drop your predictions in the issues!**

</div>
