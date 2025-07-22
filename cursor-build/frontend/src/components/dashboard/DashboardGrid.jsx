import {
	Grid,
	Stack,
	Card,
	Group,
	Text,
	Badge,
	ActionIcon,
	Tooltip,
	Button,
	Box,
	Select,
	Switch,
	Tabs,
	NumberFormatter,
	Alert,
	Progress,
} from '@mantine/core';
import DevelopmentBanner from '../ui/DevelopmentBanner';
import {
	IconSettings,
	IconRefresh,
	IconPlayerPlay,
	IconPlayerPause,
	IconLayoutDashboard,
	IconTrendingUp,
	IconBell,
	IconChartLine,
	IconCards,
	IconPlus,
	IconAlertTriangle,
	IconWifi,
	IconInfoCircle,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import CryptoCard from './CryptoCard';
import PriceChart from './PriceChart';
import AlertsList from '../alerts/AlertsList';
import { useMultipleCrypto } from '../../hooks/useCryptoData';
import useCryptoStore from '../../stores/useCryptoStore';
import useAlertStore from '../../stores/useAlertStore';
import HeroSection from './HeroSection';
import ConnectionStatus from '../ui/ConnectionStatus';
import RealTimeIndicator from '../ui/RealTimeIndicator';
import { useConnectionStatus } from '../../hooks/useWebSocket';

const DashboardGrid = () => {
	const [activeTab, setActiveTab] = useState('overview');

	const {
		isRealTimeActive,
		startRealTime,
		stopRealTime,
		refreshInterval,
		setRefreshInterval,
		notifications,
		addNotification,
		connectionStatus,
		lastUpdate,
	} = useCryptoStore();

	const { openAlertModal, checkAlerts, getActiveAlerts, getTriggeredAlerts } =
		useAlertStore();

	const {
		data: cryptoData,
		isLoading,
		refreshAll,
		hasError,
		isRealTime,
		realTimeCount,
		allRealTime,
	} = useMultipleCrypto(['bitcoin', 'ethereum']);

	// WebSocket connection monitoring
	const { isConnected, healthScore } = useConnectionStatus();

	// Check alerts when crypto data updates
	useEffect(() => {
		if (cryptoData && Object.keys(cryptoData).length > 0) {
			const triggeredAlerts = checkAlerts(cryptoData);

			// Show notifications for triggered alerts
			if (triggeredAlerts && triggeredAlerts.length > 0) {
				triggeredAlerts.forEach(({ alert, triggerData, currentPrice }) => {
					addNotification({
						type: 'warning',
						title: isRealTime ? '⚡ Real-time Alert!' : '🚨 Alert Triggered!',
						message: `${
							alert.title
						} - ${alert.symbol.toUpperCase()} is now $${currentPrice.toLocaleString()}`,
					});
				});
			}
		}
	}, [cryptoData, checkAlerts, addNotification, isRealTime]);

	const handleToggleRealTime = () => {
		if (isRealTimeActive) {
			stopRealTime();
		} else {
			startRealTime();
		}
	};

	const handleRefreshAll = async () => {
		try {
			await refreshAll();
			addNotification({
				type: 'success',
				title: 'Data Refreshed',
				message: 'All cryptocurrency data and charts have been updated',
			});
		} catch (error) {
			addNotification({
				type: 'error',
				title: 'Refresh Failed',
				message: 'Unable to refresh data. Please try again.',
			});
		}
	};

	const formatLastUpdate = () => {
		if (!lastUpdate) return 'Never';
		const date = new Date(lastUpdate);
		return date.toLocaleTimeString();
	};

	// Real-time status for display
	const getRealTimeStatus = () => {
		if (isRealTime && isConnected) {
			return {
				active: true,
				text: 'WebSocket Live',
				color: 'green',
				description: `Real-time updates active via WebSocket`,
			};
		} else if (isRealTimeActive && !isConnected) {
			return {
				active: true,
				text: 'Connecting...',
				color: 'orange',
				description: 'Attempting WebSocket connection',
			};
		} else {
			return {
				active: false,
				text: 'Paused',
				color: 'gray',
				description: 'Real-time updates paused',
			};
		}
	};

	const realtimeStatus = getRealTimeStatus();

	return (
		<Stack gap='lg'>
			{/* Development Banner */}
			<DevelopmentBanner />
			{/* Enhanced Hero Section with WebSocket Status */}
			<Card
				padding='xl'
				radius='md'
				style={{
					background: 'rgba(255, 255, 255, 0.08)',
					backdropFilter: 'blur(10px)',
					border: '1px solid rgba(255, 255, 255, 0.1)',
				}}>
				<Group justify='space-between' align='center'>
					<Box>
						<Group gap='md' align='center'>
							<Text size='xl' fw={700} c='white'>
								CryptoGuard Dashboard
							</Text>
							<RealTimeIndicator
								isActive={realtimeStatus.active && isConnected}
								label='LIVE'
							/>
						</Group>
						<Text size='sm' c='dimmed' mt={4}>
							{realtimeStatus.description} • Last update: {formatLastUpdate()}
						</Text>
					</Box>

					<Group gap='md'>
						{/* Connection Status Component */}
						<ConnectionStatus />

						{/* Real-time Toggle */}
						<Button
							variant={isRealTimeActive ? 'light' : 'filled'}
							color={isRealTimeActive ? 'red' : 'green'}
							leftSection={
								isRealTimeActive ? (
									<IconPlayerPause size={18} />
								) : (
									<IconPlayerPlay size={18} />
								)
							}
							onClick={handleToggleRealTime}
							size='md'>
							{isRealTimeActive ? 'PAUSE' : 'GO LIVE'}
						</Button>

						{/* Manual Refresh */}
						<Tooltip label='Force refresh all data'>
							<ActionIcon
								variant='light'
								color='blue'
								size='lg'
								onClick={handleRefreshAll}
								loading={isLoading}>
								<IconRefresh size={18} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>

				{/* WebSocket Status Alert */}
				{isRealTimeActive && !isConnected && (
					<Alert
						icon={<IconInfoCircle size={16} />}
						color='orange'
						variant='light'
						mt='md'>
						<Group justify='space-between'>
							<Text size='sm'>
								WebSocket connection in progress. Data will update automatically
								when connected.
							</Text>
							{healthScore !== undefined && (
								<Progress value={healthScore} size='sm' w={100} />
							)}
						</Group>
					</Alert>
				)}

				{/* Real-time Data Status */}
				{isRealTime && isConnected && realTimeCount > 0 && (
					<Alert
						icon={<IconWifi size={16} />}
						color='green'
						variant='light'
						mt='md'>
						<Group justify='space-between'>
							<Text size='sm'>
								🔴 LIVE: Receiving real-time updates for {realTimeCount}{' '}
								cryptocurrencies via WebSocket
							</Text>
							<Badge color='green' variant='light'>
								{realTimeCount}/{Object.keys(cryptoData).length} Real-time
							</Badge>
						</Group>
					</Alert>
				)}
			</Card>

			{/* Tabs Navigation */}
			<Tabs value={activeTab} onChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab
						value='overview'
						leftSection={<IconLayoutDashboard size={16} />}>
						Overview
					</Tabs.Tab>
					<Tabs.Tab value='charts' leftSection={<IconTrendingUp size={16} />}>
						Charts
					</Tabs.Tab>
					<Tabs.Tab value='alerts' leftSection={<IconBell size={16} />}>
						Alerts ({getActiveAlerts().length})
					</Tabs.Tab>
				</Tabs.List>

				{/* Overview Tab */}
				<Tabs.Panel value='overview' pt='md'>
					<Stack gap='lg'>
						{/* Hero Section */}
            <HeroSection cryptoData={cryptoData} />

						{/* Crypto Cards Grid */}
						<Grid>
							{Object.entries(cryptoData).map(([symbol, data]) => (
								<Grid.Col key={symbol} span={{ base: 12, md: 6 }}>
									<CryptoCard
										symbol={symbol}
										data={data}
										isRealTime={data?.source === 'websocket'}
										showRealTimeIndicator={true}
									/>
								</Grid.Col>
							))}
						</Grid>

						{/* Quick Actions */}
						<Card
							padding='lg'
							radius='md'
							style={{
								background: 'rgba(255, 255, 255, 0.08)',
								backdropFilter: 'blur(10px)',
								border: '1px solid rgba(255, 255, 255, 0.1)',
							}}>
							<Group justify='space-between' align='center'>
								<Box>
									<Text fw={600} c='white'>
										Quick Actions
									</Text>
									<Text size='sm' c='dimmed'>
										Set up alerts and manage your watchlist
									</Text>
								</Box>

								<Group gap='md'>
									<Button
										leftSection={<IconPlus size={16} />}
										variant='light'
										color='orange'
										onClick={openAlertModal}>
										Create Alert
									</Button>

									<Button
										leftSection={<IconSettings size={16} />}
										variant='light'
										color='gray'>
										Settings
									</Button>
								</Group>
							</Group>
						</Card>
					</Stack>
				</Tabs.Panel>

				{/* Charts Tab */}
				<Tabs.Panel value='charts' pt='md'>
					<Grid>
						{Object.entries(cryptoData).map(([symbol, data]) => (
							<Grid.Col key={symbol} span={{ base: 12, lg: 6 }}>
								<PriceChart
									symbol={symbol}
									data={data}
									isRealTime={data?.source === 'websocket'}
								/>
							</Grid.Col>
						))}
					</Grid>
				</Tabs.Panel>

				{/* Alerts Tab */}
				<Tabs.Panel value='alerts' pt='md'>
					<AlertsList />
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
};

export default DashboardGrid;
