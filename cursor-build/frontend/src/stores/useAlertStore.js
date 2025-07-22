import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';

// Alert types and configurations
export const ALERT_TYPES = {
	PRICE_ABOVE: 'price_above',
	PRICE_BELOW: 'price_below',
	PERCENT_CHANGE: 'percent_change',
	VOLUME_SPIKE: 'volume_spike',
};

export const ALERT_STATUS = {
	ACTIVE: 'active',
	TRIGGERED: 'triggered',
	DISABLED: 'disabled',
};

// Storage keys
const STORAGE_KEYS = {
	ALERTS: 'cryptoguard_alerts',
	HISTORY: 'cryptoguard_alert_history',
	SETTINGS: 'cryptoguard_alert_settings',
};

// Dedicated alert store with persistent storage
const useAlertStore = create(
	persist(
		subscribeWithSelector((set, get) => ({
			// Alert State
			alerts: [],
			alertHistory: [],
			isAlertModalOpen: false,
			selectedAlert: null,
			modalPrefillData: {},
			alertSettings: {
				soundEnabled: true,
				pushEnabled: true,
				emailEnabled: false,
				maxAlerts: 10,
				checkInterval: 30000, // 30 seconds
			},

			// Alert CRUD Operations
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

			// Alert Triggering
			triggerAlert: (alertId, currentPrice, triggerData = {}) => {
				const alert = get().alerts.find((a) => a.id === alertId);
				if (!alert) return;

				const triggeredAlert = {
					...alert,
					status: ALERT_STATUS.TRIGGERED,
					triggeredAt: new Date().toISOString(),
					triggerCount: alert.triggerCount + 1,
					lastTriggerPrice: currentPrice,
					triggerData,
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

			// Alert Checking Logic
			checkAlerts: (cryptoData) => {
				const { alerts } = get();
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

					let shouldTrigger = false;
					let triggerData = {};

					switch (alert.type) {
						case ALERT_TYPES.PRICE_ABOVE:
							shouldTrigger = currentPrice >= alert.targetValue;
							triggerData = { currentPrice, targetPrice: alert.targetValue };
							break;

						case ALERT_TYPES.PRICE_BELOW:
							shouldTrigger = currentPrice <= alert.targetValue;
							triggerData = { currentPrice, targetPrice: alert.targetValue };
							break;

						case ALERT_TYPES.PERCENT_CHANGE:
							const changeAbs = Math.abs(percentChange24h);
							shouldTrigger = changeAbs >= Math.abs(alert.targetValue);
							triggerData = {
								currentChange: percentChange24h,
								targetChange: alert.targetValue,
								isPositive: percentChange24h > 0,
							};
							break;

						case ALERT_TYPES.VOLUME_SPIKE:
							shouldTrigger = volume && volume >= alert.targetValue;
							triggerData = {
								currentVolume: volume,
								targetVolume: alert.targetValue,
							};
							break;
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
				});

				return triggeredAlerts;
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

					console.log(
						`✅ Loaded ${alerts.length} alerts and ${alertHistory.length} history items from storage`
					);
				} catch (error) {
					console.warn('Failed to initialize from localStorage:', error);
				}
			},

			// Computed Values
			getActiveAlerts: () => {
				return get().alerts.filter(
					(alert) => alert.status === ALERT_STATUS.ACTIVE
				);
			},

			getTriggeredAlerts: () => {
				return get().alerts.filter(
					(alert) => alert.status === ALERT_STATUS.TRIGGERED
				);
			},

			getAlertsBySymbol: (symbol) => {
				return get().alerts.filter((alert) => alert.symbol === symbol);
			},

			getRecentHistory: (limit = 10) => {
				return get().alertHistory.slice(0, limit);
			},

			// Utility Functions
			clearTriggeredAlerts: () => {
				set((state) => {
					const updatedAlerts = state.alerts.filter(
						(alert) => alert.status !== ALERT_STATUS.TRIGGERED
					);

					// Persist to localStorage
					try {
						localStorage.setItem(
							STORAGE_KEYS.ALERTS,
							JSON.stringify(updatedAlerts)
						);
					} catch (error) {
						console.warn(
							'Failed to clear triggered alerts from localStorage:',
							error
						);
					}

					return { alerts: updatedAlerts };
				});
			},

			clearAlertHistory: () => {
				set({ alertHistory: [] });

				// Clear from localStorage
				try {
					localStorage.removeItem(STORAGE_KEYS.HISTORY);
				} catch (error) {
					console.warn(
						'Failed to clear alert history from localStorage:',
						error
					);
				}
			},

			// Export/Import functionality
			exportAlerts: () => {
				const { alerts, alertSettings } = get();
				return {
					alerts,
					alertSettings,
					exportedAt: new Date().toISOString(),
					version: '1.0',
				};
			},

			importAlerts: (data) => {
				if (data.alerts && Array.isArray(data.alerts)) {
					set((state) => {
						const updatedAlerts = [...state.alerts, ...data.alerts];
						const updatedSettings = data.alertSettings || state.alertSettings;

						// Persist to localStorage
						try {
							localStorage.setItem(
								STORAGE_KEYS.ALERTS,
								JSON.stringify(updatedAlerts)
							);
							localStorage.setItem(
								STORAGE_KEYS.SETTINGS,
								JSON.stringify(updatedSettings)
							);
						} catch (error) {
							console.warn('Failed to import alerts to localStorage:', error);
						}

						return {
							alerts: updatedAlerts,
							alertSettings: updatedSettings,
						};
					});
				}
			},

			// Clear all data (for testing/reset)
			resetAllData: () => {
				set({
					alerts: [],
					alertHistory: [],
					alertSettings: {
						soundEnabled: true,
						pushEnabled: true,
						emailEnabled: false,
						maxAlerts: 10,
						checkInterval: 30000,
					},
				});

				// Clear localStorage
				try {
					localStorage.removeItem(STORAGE_KEYS.ALERTS);
					localStorage.removeItem(STORAGE_KEYS.HISTORY);
					localStorage.removeItem(STORAGE_KEYS.SETTINGS);
				} catch (error) {
					console.warn('Failed to clear localStorage:', error);
				}
			},
		})),
		{
			name: 'cryptoguard-alerts', // localStorage key
			partialize: (state) => ({
				alerts: state.alerts,
				alertHistory: state.alertHistory,
				alertSettings: state.alertSettings,
			}),
		}
	)
);

export default useAlertStore;
