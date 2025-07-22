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
	IconWifiOff,
} from '@tabler/icons-react';
import { useState } from 'react';
import CryptoCard from './CryptoCard';
import PriceChart from './PriceChart';
import AlertsList from '../alerts/AlertsList';
import NotificationBanner from '../ui/NotificationBanner';
import NotificationStatusCard from '../ui/NotificationStatusCard';
import { useMultipleCrypto } from '../../hooks/useCryptoData';
import useCryptoStore from '../../stores/useCryptoStore';
import useAlertStore from '../../stores/useAlertStore';
import HeroSection from './HeroSection';

const DashboardGrid = () => {
	const [activeTab, setActiveTab] = useState('overview');

	const {
		isRealTimeActive,
		startRealTime,
		stopRealTime,
		refreshInterval,
		notifications,
		addNotification,
		connectionStatus,
	} = useCryptoStore();

	const { openAlertModal, getActiveAlerts } = useAlertStore();

	const {
		data: cryptoData,
		isLoading,
		refreshAll,
		hasError,
	} = useMultipleCrypto(['bitcoin', 'ethereum']);

  console.log('cryptoData', cryptoData)
	// WebSocket connection status
	const isConnected = connectionStatus === 'connected';
	const isRealTime = isRealTimeActive && isConnected;
	const realTimeCount = Object.values(cryptoData).filter(
		(data) => data?.source === 'websocket'
	).length;
	const healthScore = isConnected ? 100 : 0;

	// REMOVED: Duplicate alert checking - useAlertChecker handles this now

	const handleToggleRealTime = () => {
		if (isRealTimeActive) {
			stopRealTime();
			addNotification({
				type: 'info',
				title: 'Real-time Updates Paused',
				message: 'Dashboard will show cached data only',
			});
		} else {
			startRealTime();
			addNotification({
				type: 'success',
				title: 'Real-time Updates Active',
				message: `Dashboard will refresh every ${
					refreshInterval / 1000
				} seconds`,
			});
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

	const handleCreateAlert = (symbol, prefillData = {}) => {
		const symbolData = cryptoData[symbol.toLowerCase()];
		openAlertModal({
			symbol: symbol.toLowerCase(),
			...prefillData,
			currentPrice: symbolData?.price || symbolData?.close,
		});
	};

	return (
		<Stack gap='lg'>
			{/* Notification Permission Banner */}
			<NotificationBanner />

			{/* Connection Status Card */}
			<Card
				padding='lg'
				radius='md'
				style={{
					background: 'rgba(255, 255, 255, 0.08)',
					backdropFilter: 'blur(10px)',
					border: '1px solid rgba(255, 255, 255, 0.1)',
				}}>
				<Group justify='space-between' align='center'>
					<Group gap='md'>
						<Box>
							<Group gap='xs'>
								<Text fw={600} c='white'>
									Real-time Data Status
								</Text>
								<Badge
									size='sm'
									color={isConnected ? 'green' : 'red'}
									variant='light'>
									{isConnected ? 'CONNECTED' : 'DISCONNECTED'}
								</Badge>
							</Group>
							<Text size='sm' c='dimmed'>
								{isRealTime
									? `Live data active • ${realTimeCount} sources`
									: 'Using cached API data'}
							</Text>
						</Box>
					</Group>

					<Group gap='md'>
						{/* Real-time Toggle */}
						<Tooltip
							label={
								isRealTimeActive
									? 'Pause real-time updates'
									: 'Start real-time updates'
							}>
							<ActionIcon
								variant='light'
								color={isRealTimeActive ? 'orange' : 'green'}
								size='lg'
								onClick={handleToggleRealTime}
								style={{
									backgroundColor: isRealTimeActive
										? 'rgba(255, 193, 7, 0.1)'
										: 'rgba(76, 175, 80, 0.1)',
								}}>
								{isRealTimeActive ? (
									<IconPlayerPause size={18} />
								) : (
									<IconPlayerPlay size={18} />
								)}
							</ActionIcon>
						</Tooltip>

						{/* Refresh Button */}
						<Tooltip label='Refresh all data'>
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

				{/* Connection Issues Alert */}
				{!isConnected && (
					<Alert
						icon={<IconWifiOff size={16} />}
						color='orange'
						variant='light'
						mt='md'>
						<Group justify='space-between'>
							<Text size='sm'>
								WebSocket connection lost. Data will update automatically when
								connected.
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
					<Tabs.Tab value='notifications' leftSection={<IconBell size={16} />}>
						Notifications
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
										onClick={() => openAlertModal()}>
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

				{/* Notifications Tab */}
				<Tabs.Panel value='notifications' pt='md'>
					<Stack gap='md'>
						<Text size='lg' fw={600}>
							Notification Settings
						</Text>

						<NotificationStatusCard />

						<Card withBorder p='md'>
							<Stack gap='md'>
								<Text size='sm' fw={500}>
									📱 How Notifications Work
								</Text>
								<Text size='sm' c='dimmed'>
									When your crypto price alerts are triggered, you'll receive:
								</Text>
								<Box style={{ paddingLeft: '16px' }}>
									<Text size='sm'>• Desktop browser notifications</Text>
									<Text size='sm'>• In-app notification alerts</Text>
									<Text size='sm'>• Visual indicators in the alert center</Text>
								</Box>

								<Group justify='space-between' mt='md'>
									<Text size='sm'>Test your notification system:</Text>
									<Button
										size='xs'
										variant='light'
										onClick={() => {
											if (Notification.permission === 'granted') {
												new Notification('🧪 Test Notification', {
													body: 'Your notifications are working perfectly!',
													icon: '/favicon.ico'
												});
											} else {
												addNotification({
													type: 'info',
													title: 'Enable Notifications',
													message: 'Please enable browser notifications first'
												});
											}
										}}
									>
										Send Test Notification
									</Button>
								</Group>
							</Stack>
						</Card>
					</Stack>
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
};

export default DashboardGrid;
