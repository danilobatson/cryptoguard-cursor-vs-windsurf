import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import useCryptoStore from '../stores/useCryptoStore';

// Real crypto data fetcher using our authenticated backend
const fetchRealCryptoData = async (symbol) => {
	const backendUrl =
		import.meta.env.VITE_API_BASE ||
		'https://cryptoguard-api.cryptoguard-api.workers.dev';
;
	console.log(
		`🌙 Fetching REAL ${symbol} from backend: ${backendUrl}/crypto/${symbol}`
	);

	try {
		const url = `${backendUrl}/crypto/${symbol}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Backend API error: ${response.status} - ${errorText}`);
		}

		const result = await response.json();
		console.log(`✅ Backend response for ${symbol}:`, result);

		// Extract the data from the backend response
		const data = result?.data;

		if (!data || !data.price) {
			throw new Error(`No valid price data returned for ${symbol}`);
		}

		// Map backend data to our frontend format
		const realData = {
			symbol: data.symbol || symbol.toUpperCase(),
			name: data.name || symbol,
			price: parseFloat(data.price),
			close: parseFloat(data.price), // Use same price for compatibility
			volume_24h: parseFloat(data.volume_24h || 0),
			percent_change_24h: parseFloat(data.percent_change_24h || 0),
			market_cap: parseFloat(data.market_cap || 0),
			galaxy_score: parseFloat(data.galaxy_score || 0),
			alt_rank: parseInt(data.alt_rank || 0),
			source: 'backend-lunarcrush',
			lastUpdated: data.last_updated || new Date().toISOString(),
			isReal: true,
		};

		console.log(`💰 REAL ${symbol} price: $${realData.price.toLocaleString()}`);

		// Update store immediately
		console.log(`�� MANUALLY updating store for ${symbol}...`);
		const store = useCryptoStore.getState();
		store.setCryptoData(symbol.toLowerCase(), realData);
		console.log(`✅ Store updated for ${symbol}`);

		return realData;
	} catch (error) {
		console.error(`❌ Backend API error for ${symbol}:`, error);
		throw error;
	}
};

// Hook for multiple cryptos - REAL ONLY via backend
export const useMultipleCrypto = (symbols = ['bitcoin', 'ethereum']) => {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const cryptoData = useCryptoStore((state) => state.cryptoData);
	const addNotification = useCryptoStore((state) => state.addNotification);

	// 🔧 CRITICAL FIX: Get polling state from store
	const isRealTimeActive = useCryptoStore((state) => state.isRealTimeActive);
	const refreshInterval = useCryptoStore((state) => state.refreshInterval);

	// Individual queries for each symbol
	const queries = symbols.map((symbol) =>
		useQuery({
			queryKey: ['crypto-backend-real', symbol],
			queryFn: () => fetchRealCryptoData(symbol),
			enabled: true,
			// 🎯 FIX: Make refetchInterval conditional based on store state
			refetchInterval: isRealTimeActive ? refreshInterval : false,
			refetchIntervalInBackground: isRealTimeActive,
			staleTime: 15000,
			retry: 3,
			retryDelay: 1000,
			onError: (error) => {
				console.error(`❌ Query error for ${symbol}:`, error);
				setHasError(true);
				addNotification({
					type: 'error',
					title: 'Backend Connection Error',
					message: `Failed to fetch ${symbol}: ${error.message}`,
				});
			},
		})
	);

	// Update loading state
	useEffect(() => {
		const allLoaded = queries.every((q) => !q.isLoading);
		const anyError = queries.some((q) => q.isError);
		setIsLoading(!allLoaded);
		setHasError(anyError);
	}, [queries]);

	// Log polling state changes
	useEffect(() => {
		console.log(`🔄 Polling state changed:`, {
			isRealTimeActive,
			refreshInterval,
			willPoll: isRealTimeActive ? `every ${refreshInterval/1000}s` : 'PAUSED'
		});
	}, [isRealTimeActive, refreshInterval]);

	// Log current store state
	useEffect(() => {
		// Removed: Store state log
			dataCount: Object.keys(cryptoData).length,
			symbols: Object.keys(cryptoData),
			prices: Object.fromEntries(
				Object.entries(cryptoData).map(([k, v]) => [k.toUpperCase(), v.price])
			),
		});
	}, [cryptoData]);

	const refreshAll = async () => {
		console.log('🔄 Manual refresh: Fetching all crypto data from backend...');
		const results = await Promise.allSettled(queries.map((q) => q.refetch()));
		console.log('📊 Manual refresh results:', results);
	};

	return {
		data: cryptoData,
		isLoading,
		hasError,
		refreshAll,
		isRealTime: false,
		realTimeCount: 0,
		allRealTime: false,
		queries,
	};
};

// Single crypto hook
export const useCryptoData = (symbol) => {
	const addNotification = useCryptoStore((state) => state.addNotification);

	// 🔧 CRITICAL FIX: Get polling state from store
	const isRealTimeActive = useCryptoStore((state) => state.isRealTimeActive);
	const refreshInterval = useCryptoStore((state) => state.refreshInterval);

	return useQuery({
		queryKey: ['crypto-backend-real', symbol],
		queryFn: () => fetchRealCryptoData(symbol),
		enabled: !!symbol,
		// 🎯 FIX: Make refetchInterval conditional based on store state
		refetchInterval: isRealTimeActive ? refreshInterval : false,
		refetchIntervalInBackground: isRealTimeActive,
		onError: (error) =>
			addNotification({
				type: 'error',
				title: 'Data Error',
				message: `${symbol}: ${error.message}`,
			}),
	});
};

export default useCryptoData;
