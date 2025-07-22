import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';

// Enhanced alert types with advanced trading features
export const ALERT_TYPES = {
	// Basic price alerts (existing)
	PRICE_ABOVE: 'price_above',
	PRICE_BELOW: 'price_below',
	PERCENT_CHANGE: 'percent_change',
	VOLUME_SPIKE: 'volume_spike',
	
	// Advanced momentum alerts (NEW)
	MOVING_AVERAGE: 'moving_average', // Price crosses MA
	PRICE_MOMENTUM: 'price_momentum', // Price acceleration
	VOLATILITY_SPIKE: 'volatility_spike', // High volatility period
	SUPPORT_RESISTANCE: 'support_resistance', // Near key levels
	
	// Multi-condition alerts (NEW)
	BULLISH_BREAKOUT: 'bullish_breakout', // Price + volume + momentum
	BEARISH_BREAKDOWN: 'bearish_breakdown', // Opposite conditions
	TREND_REVERSAL: 'trend_reversal', // Trend change detection
	
	// LunarCrush social alerts (NEW) 
	SENTIMENT_DIVERGENCE: 'sentiment_divergence', // Price vs sentiment
	SOCIAL_MOMENTUM: 'social_momentum', // Social activity surge
	INFLUENCER_MENTION: 'influencer_mention', // Key figure mentions
};

export const ALERT_STATUS = {
	ACTIVE: 'active',
	TRIGGERED: 'triggered',
	DISABLED: 'disabled',
};

// Enhanced alert configurations
export const ALERT_CONFIGS = {
	[ALERT_TYPES.PRICE_ABOVE]: {
		label: 'Price Above',
		description: 'Alert when price rises above target',
		category: 'Price',
		difficulty: 'Basic',
		fields: ['targetValue'],
		validation: (value) => value > 0,
		calculation: (current, target) => current >= target
	},
	[ALERT_TYPES.PRICE_BELOW]: {
		label: 'Price Below', 
		description: 'Alert when price drops below target',
		category: 'Price',
		difficulty: 'Basic',
		fields: ['targetValue'],
		validation: (value) => value > 0,
		calculation: (current, target) => current <= target
	},
	[ALERT_TYPES.PERCENT_CHANGE]: {
		label: 'Percent Change',
		description: 'Alert on 24h percentage change',
		category: 'Price',
		difficulty: 'Basic',
		fields: ['targetValue'],
		validation: (value) => Math.abs(value) <= 100,
		calculation: (changePercent, target) => Math.abs(changePercent) >= Math.abs(target)
	},
	[ALERT_TYPES.VOLUME_SPIKE]: {
		label: 'Volume Spike',
		description: 'Alert on high trading volume',
		category: 'Volume',
		difficulty: 'Basic',
		fields: ['targetValue'],
		validation: (value) => value > 0,
		calculation: (currentVolume, target) => currentVolume >= target
	},
	
	// Advanced alerts
	[ALERT_TYPES.MOVING_AVERAGE]: {
		label: 'Moving Average Cross',
		description: 'Alert when price crosses above/below moving average',
		category: 'Technical',
		difficulty: 'Advanced',
		fields: ['period', 'direction'], // period = 20, direction = 'above'/'below'
		validation: (period) => period >= 5 && period <= 200,
		calculation: (priceHistory, period, direction) => {
			if (priceHistory.length < period) return false;
			const ma = calculateMovingAverage(priceHistory, period);
			const currentPrice = priceHistory[priceHistory.length - 1];
			const prevPrice = priceHistory[priceHistory.length - 2];
			
			if (direction === 'above') {
				return prevPrice <= ma && currentPrice > ma; // Bullish cross
			} else {
				return prevPrice >= ma && currentPrice < ma; // Bearish cross
			}
		}
	},
	[ALERT_TYPES.PRICE_MOMENTUM]: {
		label: 'Price Momentum',
		description: 'Alert on price acceleration/deceleration',
		category: 'Technical',
		difficulty: 'Advanced',
		fields: ['momentumThreshold', 'timeframe'], // threshold = 5%, timeframe = 15min
		validation: (threshold) => threshold > 0 && threshold <= 50,
		calculation: (priceHistory, threshold, timeframe) => {
			return calculateMomentum(priceHistory, timeframe) >= threshold;
		}
	},
	[ALERT_TYPES.VOLATILITY_SPIKE]: {
		label: 'Volatility Spike',
		description: 'Alert during high volatility periods',
		category: 'Technical',
		difficulty: 'Advanced',
		fields: ['volatilityMultiplier'], // 2x average volatility
		validation: (multiplier) => multiplier >= 1 && multiplier <= 10,
		calculation: (priceHistory, multiplier) => {
			const currentVolatility = calculateVolatility(priceHistory, 20);
			const averageVolatility = calculateAverageVolatility(priceHistory, 100);
			return currentVolatility >= (averageVolatility * multiplier);
		}
	},
	[ALERT_TYPES.SUPPORT_RESISTANCE]: {
		label: 'Support/Resistance',
		description: 'Alert when price approaches key levels',
		category: 'Technical',
		difficulty: 'Expert',
		fields: ['level', 'proximity'], // level = $50000, proximity = 2%
		validation: (level, proximity) => level > 0 && proximity > 0 && proximity <= 10,
		calculation: (currentPrice, level, proximity) => {
			const distance = Math.abs(currentPrice - level) / level * 100;
			return distance <= proximity;
		}
	},
	
	// Multi-condition alerts
	[ALERT_TYPES.BULLISH_BREAKOUT]: {
		label: 'Bullish Breakout',
		description: 'Price + volume + momentum alignment (bullish)',
		category: 'Composite',
		difficulty: 'Expert',
		fields: ['priceThreshold', 'volumeMultiplier', 'momentumMin'],
		validation: (price, volume, momentum) => price > 0 && volume >= 1 && momentum > 0,
		calculation: (data, priceThreshold, volumeMultiplier, momentumMin) => {
			const priceBreakout = data.price >= priceThreshold;
			const volumeSpike = data.volume >= (data.avgVolume * volumeMultiplier);
			const positiveMomentum = data.momentum >= momentumMin;
			return priceBreakout && volumeSpike && positiveMomentum;
		}
	},
	[ALERT_TYPES.BEARISH_BREAKDOWN]: {
		label: 'Bearish Breakdown',
		description: 'Price + volume + momentum alignment (bearish)',
		category: 'Composite', 
		difficulty: 'Expert',
		fields: ['priceThreshold', 'volumeMultiplier', 'momentumMax'],
		validation: (price, volume, momentum) => price > 0 && volume >= 1 && momentum < 0,
		calculation: (data, priceThreshold, volumeMultiplier, momentumMax) => {
			const priceBreakdown = data.price <= priceThreshold;
			const volumeSpike = data.volume >= (data.avgVolume * volumeMultiplier);
			const negativeMomentum = data.momentum <= momentumMax;
			return priceBreakdown && volumeSpike && negativeMomentum;
		}
	},
	
	// LunarCrush social alerts
	[ALERT_TYPES.SENTIMENT_DIVERGENCE]: {
		label: 'Sentiment Divergence',
		description: 'Price and sentiment moving in opposite directions',
		category: 'Social',
		difficulty: 'Advanced',
		fields: ['divergenceThreshold'], // 20% difference
		validation: (threshold) => threshold > 0 && threshold <= 100,
		calculation: (priceChange, sentimentChange, threshold) => {
			const divergence = Math.abs(priceChange - sentimentChange);
			return divergence >= threshold && (priceChange * sentimentChange < 0);
		}
	},
	[ALERT_TYPES.SOCIAL_MOMENTUM]: {
		label: 'Social Momentum',
		description: 'Surge in social media activity and engagement',
		category: 'Social',
		difficulty: 'Advanced',
		fields: ['mentionsMultiplier', 'engagementMultiplier'],
		validation: (mentions, engagement) => mentions >= 1 && engagement >= 1,
		calculation: (data, mentionsMultiplier, engagementMultiplier) => {
			const mentionsSpike = data.mentions >= (data.avgMentions * mentionsMultiplier);
			const engagementSpike = data.engagements >= (data.avgEngagements * engagementMultiplier);
			return mentionsSpike && engagementSpike;
		}
	}
};

// Mathematical calculation helpers
const calculateMovingAverage = (prices, period) => {
	const recentPrices = prices.slice(-period);
	return recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
};

const calculateMomentum = (prices, timeframe) => {
	if (prices.length < 2) return 0;
	const current = prices[prices.length - 1];
	const previous = prices[prices.length - 2];
	return ((current - previous) / previous) * 100;
};

const calculateVolatility = (prices, period) => {
	if (prices.length < period) return 0;
	const recentPrices = prices.slice(-period);
	const mean = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
	const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / recentPrices.length;
	return Math.sqrt(variance);
};

const calculateAverageVolatility = (prices, period) => {
	// Calculate rolling volatility over longer period
	const volatilities = [];
	for (let i = 20; i < Math.min(prices.length, period); i++) {
		volatilities.push(calculateVolatility(prices.slice(i-20, i), 20));
	}
	return volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
};

// Storage keys
const STORAGE_KEYS = {
	ALERTS: 'cryptoguard_alerts',
	HISTORY: 'cryptoguard_alert_history',
	SETTINGS: 'cryptoguard_alert_settings',
};

// Enhanced alert store with advanced features
const useAlertStore = create(
	persist(
		subscribeWithSelector((set, get) => ({
			// Alert State
			alerts: [],
			alertHistory: [],
			isAlertModalOpen: false,
			selectedAlert: null,
			modalPrefillData: {},
			priceHistory: {}, // Store price history for calculations
			alertSettings: {
				soundEnabled: true,
				pushEnabled: true,
				emailEnabled: false,
				maxAlerts: 20, // Increased for advanced alerts
				checkInterval: 30000, // 30 seconds
				enableAdvancedAlerts: true, // Feature flag
			},

			// Enhanced alert CRUD operations
			createAlert: (alertData) => {
				const newAlert = {
					id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					...alertData,
					targetValue: parseFloat(alertData.targetValue),
					status: ALERT_STATUS.ACTIVE,
					createdAt: new Date().toISOString(),
					lastChecked: null,
					triggeredAt: null,
					triggerCount: 0,
					metadata: {
						complexity: ALERT_CONFIGS[alertData.type]?.difficulty || 'Basic',
						category: ALERT_CONFIGS[alertData.type]?.category || 'Price'
					}
				};

				set((state) => {
					const updatedAlerts = [...state.alerts, newAlert];

					// Persist to localStorage immediately
					try {
						localStorage.setItem(
							STORAGE_KEYS.ALERTS,
							JSON.stringify(updatedAlerts)
						);
					} catch (error) {
						console.warn('Failed to save alerts to localStorage:', error);
					}

					return { alerts: updatedAlerts };
				});

				return newAlert;
			},

			updateAlert: (alertId, updates) => {
				set((state) => {
					const updatedAlerts = state.alerts.map((alert) =>
						alert.id === alertId
							? { ...alert, ...updates, updatedAt: new Date().toISOString() }
							: alert
					);

					// Persist to localStorage
					try {
						localStorage.setItem(
							STORAGE_KEYS.ALERTS,
							JSON.stringify(updatedAlerts)
						);
					} catch (error) {
						console.warn('Failed to update alerts in localStorage:', error);
					}

					return { alerts: updatedAlerts };
				});
			},

			deleteAlert: (alertId) => {
				set((state) => {
					const updatedAlerts = state.alerts.filter(
						(alert) => alert.id !== alertId
					);

					// Persist to localStorage
					try {
						localStorage.setItem(
							STORAGE_KEYS.ALERTS,
							JSON.stringify(updatedAlerts)
						);
					} catch (error) {
						console.warn('Failed to delete alert from localStorage:', error);
					}

					return { alerts: updatedAlerts };
				});
			},

			toggleAlert: (alertId) => {
				set((state) => {
					const updatedAlerts = state.alerts.map((alert) =>
						alert.id === alertId
							? {
									...alert,
									status:
										alert.status === ALERT_STATUS.ACTIVE
											? ALERT_STATUS.DISABLED
											: ALERT_STATUS.ACTIVE,
									updatedAt: new Date().toISOString(),
							  }
							: alert
					);

					// Persist to localStorage
					try {
						localStorage.setItem(
							STORAGE_KEYS.ALERTS,
							JSON.stringify(updatedAlerts)
						);
					} catch (error) {
						console.warn('Failed to toggle alert in localStorage:', error);
					}

					return { alerts: updatedAlerts };
				});
			},

			// Enhanced alert triggering with advanced calculations
			triggerAlert: (alertId, currentPrice, triggerData = {}) => {
				const alert = get().alerts.find((a) => a.id === alertId);
				if (!alert) return;

				const triggeredAlert = {
					...alert,
					status: ALERT_STATUS.TRIGGERED,
					triggeredAt: new Date().toISOString(),
					triggerCount: alert.triggerCount + 1,
					lastTriggerPrice: currentPrice,
					triggerData: {
						...triggerData,
						complexity: alert.metadata?.complexity,
						calculation: alert.type
					},
				};

				const historyItem = {
					id: `history_${Date.now()}`,
					alertId,
					alertTitle: alert.title,
					symbol: alert.symbol,
					triggerPrice: currentPrice,
					triggeredAt: new Date().toISOString(),
					type: alert.type,
					targetValue: alert.targetValue,
					complexity: alert.metadata?.complexity,
					...triggerData,
				};

				// Update alert status and add to history
				set((state) => {
					const updatedAlerts = state.alerts.map((a) =>
						a.id === alertId ? triggeredAlert : a
					);
					const updatedHistory = [
						historyItem,
						...state.alertHistory.slice(0, 99),
					];

					// Persist both to localStorage
					try {
						localStorage.setItem(
							STORAGE_KEYS.ALERTS,
							JSON.stringify(updatedAlerts)
						);
						localStorage.setItem(
							STORAGE_KEYS.HISTORY,
							JSON.stringify(updatedHistory)
						);
					} catch (error) {
						console.warn(
							'Failed to save triggered alert to localStorage:',
							error
						);
					}

					return {
						alerts: updatedAlerts,
						alertHistory: updatedHistory,
					};
				});

				return triggeredAlert;
			},

			// Enhanced alert checking with advanced calculations
			checkAlerts: (cryptoData) => {
				const { alerts, priceHistory } = get();
				const activeAlerts = alerts.filter(
					(alert) => alert.status === ALERT_STATUS.ACTIVE
				);
				const triggeredAlerts = [];

				activeAlerts.forEach((alert) => {
					const symbolData = cryptoData[alert.symbol];
					if (!symbolData) return;

					const currentPrice = symbolData.close || symbolData.price || 0;
					const percentChange24h = symbolData.percent_change_24h || 0;
					const volume = symbolData.volume_24h || 0;
					const symbolPriceHistory = priceHistory[alert.symbol] || [];

					let shouldTrigger = false;
					let triggerData = {};

					// Get alert configuration
					const config = ALERT_CONFIGS[alert.type];
					if (!config) return;

					try {
						// Use configuration calculation function
						switch (alert.type) {
							case ALERT_TYPES.PRICE_ABOVE:
								shouldTrigger = config.calculation(currentPrice, alert.targetValue);
								triggerData = { currentPrice, targetPrice: alert.targetValue };
								break;

							case ALERT_TYPES.PRICE_BELOW:
								shouldTrigger = config.calculation(currentPrice, alert.targetValue);
								triggerData = { currentPrice, targetPrice: alert.targetValue };
								break;

							case ALERT_TYPES.PERCENT_CHANGE:
								shouldTrigger = config.calculation(percentChange24h, alert.targetValue);
								triggerData = {
									currentChange: percentChange24h,
									targetChange: alert.targetValue,
									isPositive: percentChange24h > 0,
								};
								break;

							case ALERT_TYPES.VOLUME_SPIKE:
								shouldTrigger = config.calculation(volume, alert.targetValue);
								triggerData = {
									currentVolume: volume,
									targetVolume: alert.targetValue,
								};
								break;

							case ALERT_TYPES.MOVING_AVERAGE:
								if (symbolPriceHistory.length >= alert.period) {
									shouldTrigger = config.calculation(
										symbolPriceHistory, 
										alert.period, 
										alert.direction
									);
									const ma = calculateMovingAverage(symbolPriceHistory, alert.period);
									triggerData = {
										currentPrice,
										movingAverage: ma,
										period: alert.period,
										direction: alert.direction
									};
								}
								break;

							case ALERT_TYPES.PRICE_MOMENTUM:
								shouldTrigger = config.calculation(
									symbolPriceHistory, 
									alert.momentumThreshold, 
									alert.timeframe
								);
								triggerData = {
									momentum: calculateMomentum(symbolPriceHistory, alert.timeframe),
									threshold: alert.momentumThreshold
								};
								break;

							case ALERT_TYPES.VOLATILITY_SPIKE:
								shouldTrigger = config.calculation(symbolPriceHistory, alert.volatilityMultiplier);
								triggerData = {
									currentVolatility: calculateVolatility(symbolPriceHistory, 20),
									averageVolatility: calculateAverageVolatility(symbolPriceHistory, 100),
									multiplier: alert.volatilityMultiplier
								};
								break;

							case ALERT_TYPES.SUPPORT_RESISTANCE:
								shouldTrigger = config.calculation(currentPrice, alert.level, alert.proximity);
								triggerData = {
									currentPrice,
									level: alert.level,
									distance: Math.abs(currentPrice - alert.level) / alert.level * 100
								};
								break;

							// Add more advanced alert types as needed
						}

						if (shouldTrigger) {
							const triggeredAlert = get().triggerAlert(
								alert.id,
								currentPrice,
								triggerData
							);
							triggeredAlerts.push({
								alert: triggeredAlert,
								triggerData,
								currentPrice,
							});
						}
					} catch (error) {
						console.warn(`Alert calculation error for ${alert.type}:`, error);
					}
				});

				return triggeredAlerts;
			},

			// Price history management for advanced calculations
			updatePriceHistory: (symbol, price) => {
				set((state) => {
					const currentHistory = state.priceHistory[symbol] || [];
					const updatedHistory = [...currentHistory, price].slice(-200); // Keep last 200 prices

					return {
						priceHistory: {
							...state.priceHistory,
							[symbol]: updatedHistory
						}
					};
				});
			},

			// Modal Management
			openAlertModal: (symbol = null, prefillData = {}) => {
				set({
					isAlertModalOpen: true,
					selectedAlert: null,
					modalPrefillData: { symbol, ...prefillData },
				});
			},

			closeAlertModal: () => {
				set({
					isAlertModalOpen: false,
					selectedAlert: null,
					modalPrefillData: {},
				});
			},

			editAlert: (alert) => {
				set({
					isAlertModalOpen: true,
					selectedAlert: alert,
					modalPrefillData: alert,
				});
			},

			// Settings Management
			updateAlertSettings: (settings) => {
				set((state) => {
					const updatedSettings = { ...state.alertSettings, ...settings };

					// Persist settings to localStorage
					try {
						localStorage.setItem(
							STORAGE_KEYS.SETTINGS,
							JSON.stringify(updatedSettings)
						);
					} catch (error) {
						console.warn('Failed to save settings to localStorage:', error);
					}

					return { alertSettings: updatedSettings };
				});
			},

			// Data Initialization from localStorage
			initializeFromStorage: () => {
				try {
					// Load alerts
					const savedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
					const alerts = savedAlerts ? JSON.parse(savedAlerts) : [];

					// Load history
					const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
					const alertHistory = savedHistory ? JSON.parse(savedHistory) : [];

					// Load settings
					const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
					const alertSettings = savedSettings
						? { ...get().alertSettings, ...JSON.parse(savedSettings) }
						: get().alertSettings;

					set({ alerts, alertHistory, alertSettings });
				} catch (error) {
					console.warn('Failed to load data from localStorage:', error);
				}
			},

			// Analytics and reporting
			getAlertStats: () => {
				const { alerts, alertHistory } = get();
				
				return {
					totalAlerts: alerts.length,
					activeAlerts: alerts.filter(a => a.status === ALERT_STATUS.ACTIVE).length,
					triggeredToday: alertHistory.filter(h => {
						const today = new Date().toDateString();
						return new Date(h.triggeredAt).toDateString() === today;
					}).length,
					alertsByType: alerts.reduce((acc, alert) => {
						acc[alert.type] = (acc[alert.type] || 0) + 1;
						return acc;
					}, {}),
					complexityDistribution: alerts.reduce((acc, alert) => {
						const complexity = alert.metadata?.complexity || 'Basic';
						acc[complexity] = (acc[complexity] || 0) + 1;
						return acc;
					}, {})
				};
			}
		})),
		{
			name: 'crypto-alert-store',
		}
	)
);

export default useAlertStore;
