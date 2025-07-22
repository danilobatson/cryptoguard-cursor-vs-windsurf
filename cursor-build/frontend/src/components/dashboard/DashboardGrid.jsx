import { useState, useEffect, useRef } from 'react';
import { useAlertChecker } from '../../hooks/useAlertChecker';

import {
	Stack,
	Tabs,
	Grid,
	Card,
	Group,
	Text,
	Badge,
	Button,
	ActionIcon,
	Alert,
	Progress,
	Box,
	Tooltip,
} from '@mantine/core';
import {
	IconLayoutDashboard,
	IconTrendingUp,
	IconBell,
	IconSettings,
	IconPlus,
	IconCards,
	IconChartLine,
	IconPlayerPlay,
	IconPlayerPause,
	IconWifi,
	IconAlertTriangle,
	IconInfoCircle,
} from '@tabler/icons-react';

// Import existing components
import CryptoCard from './CryptoCard';
import PriceChart from './PriceChart';
import AlertsList from '../alerts/AlertsList';
import HeroSection from './HeroSection';

// Import data fetching hooks
import { useMultipleCrypto } from '../../hooks/useCryptoData';

// Import stores
import useCryptoStore from '../../stores/useCryptoStore';
import useAlertStore from '../../stores/useAlertStore';

// Import notification components (conditionally)
let NotificationBanner = null;
let NotificationStatusCard = null;

try {
	NotificationBanner = (await import('../ui/NotificationBanner')).default;
	NotificationStatusCard = (await import('../ui/NotificationStatusCard')).default;
} catch (error) {
	console.warn('Notification components not available:', error);
}

const DashboardGrid = () => {
	const [activeTab, setActiveTab] = useState('overview');
	const notificationShown = useRef(false); // Prevent infinite notifications

	// Use the proper data fetching hooks
	const {
		data: apiData,
		isLoading: apiLoading,
		hasError: apiError,
		refreshAll,
		isRealTime: apiRealTime,
		realTimeCount: apiRealTimeCount
	} = useMultipleCrypto(['bitcoin', 'ethereum']);

	// Get store methods for notifications and real-time control
	const {
		addNotification,
		isRealTimeActive,
		startRealTime,
		stopRealTime,
		connectionStatus
	} = useCryptoStore();

	const {
		getActiveAlerts,
		openAlertModal
	} = useAlertStore();

  const activeAlerts = getActiveAlerts();
  const alertChecker = useAlertChecker();

	const isConnected = connectionStatus === 'connected';
	const isRealTime = isConnected && isRealTimeActive;
	const realTimeCount = apiRealTimeCount || 0;

	// Calculate health score
	const healthScore = isConnected ? (realTimeCount > 0 ? 100 : 75) : 50;

	const handleToggleRealTime = () => {
		if (isRealTimeActive) {
			stopRealTime();
		} else {
			startRealTime();
		}
	};

	const handleCreateAlert = (symbol, alertData = {}) => {
		openAlertModal();
		addNotification({
			type: 'info',
			title: 'Create Alert',
			message: `Setting up alert for ${symbol?.toUpperCase() || 'crypto'}`,
		});
	};

	// FIXED: Show notification only once when data first loads
	useEffect(() => {
		if (apiData && Object.keys(apiData).length > 0 && !apiLoading && !notificationShown.current) {
			notificationShown.current = true; // Prevent showing again
			addNotification({
				type: 'success',
				title: '📊 Real Data Loaded',
				message: `Live crypto data fetched successfully`
			});
		}
	}, [apiLoading]); // Only depend on loading state

	return (
		<Stack gap='lg'>
			{/* Notification Banner */}
			{NotificationBanner && (
				<NotificationBanner
					onDismiss={() => {
						addNotification({
							type: 'info',
							title: 'Notification Banner Dismissed',
							message: 'You can re-enable this banner in settings.',
						});
					}}
				/>
			)}

			{/* System Status Header */}
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
							CryptoGuard Dashboard
						</Text>
						<Text size='sm' c='dimmed'>
							Real-time crypto monitoring and alerts
						</Text>
					</Box>

					<Group gap='md'>
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
										: 'rgba(76, 175, 80, 0.1)'
								}}>
								{isRealTimeActive ? (
									<IconPlayerPause size={18} />
								) : (
									<IconPlayerPlay size={18} />
								)}
							</ActionIcon>
						</Tooltip>

						{/* Manual Refresh Button */}
						<Tooltip label="Refresh Data">
							<ActionIcon
								variant='light'
								color='blue'
								size='lg'
								onClick={refreshAll}>
								<IconWifi size={18} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>

				{/* Loading State */}
				{apiLoading && (
					<Alert
						icon={<IconAlertTriangle size={16} />}
						title='Loading Live Data...'
						color='blue'
						variant='light'
						mt='md'>
						<Group justify='space-between'>
							<Text size='sm'>
								Fetching real-time crypto data from LunarCrush API.
							</Text>
							<Progress value={healthScore} size='sm' w={100} />
						</Group>
					</Alert>
				)}

				{/* Error State */}
				{apiError && (
					<Alert
						icon={<IconAlertTriangle size={16} />}
						title='Data Fetch Error'
						color='red'
						variant='light'
						mt='md'>
						<Group justify='space-between'>
							<Text size='sm'>
								Unable to fetch live data. Using cached/fallback data.
							</Text>
							<Button size='xs' onClick={refreshAll}>
								Retry
							</Button>
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
								cryptocurrencies
							</Text>
							<Badge color='green' variant='light'>
								{realTimeCount}/2 Real-time
							</Badge>
						</Group>
					</Alert>
				)}
			</Card>

			{/* Navigation Tabs */}
			<Tabs value={activeTab} onChange={setActiveTab} variant='pills'>
				<Tabs.List grow>
					<Tabs.Tab value='overview' leftSection={<IconCards size={16} />}>
						Overview
					</Tabs.Tab>
					<Tabs.Tab value='charts' leftSection={<IconChartLine size={16} />}>
						Charts
					</Tabs.Tab>
					<Tabs.Tab
						value='alerts'
						leftSection={<IconBell size={16} />}
						rightSection={
							activeAlerts.length > 0 ? (
								<Badge size='sm' color='bitcoin' variant='filled'>
									{activeAlerts.length}
								</Badge>
							) : null
						}>
						Alerts
					</Tabs.Tab>
					{NotificationStatusCard && (
						<Tabs.Tab value='notifications' leftSection={<IconSettings size={16} />}>
							Notifications
						</Tabs.Tab>
					)}
				</Tabs.List>

				{/* Overview Tab */}
				<Tabs.Panel value='overview' pt='xl'>
					<Grid gutter='xl'>
						{/* Bitcoin Card */}
						<Grid.Col className='hero-section' span={{ base: 12, md: 6 }}>
							<CryptoCard
								symbol='bitcoin'
								data={apiData?.bitcoin}
								isLoading={apiLoading}
								isRealTime={isRealTimeActive}
								variant='detailed'
								onAddAlert={(symbol, data) => {
									handleCreateAlert(symbol, {
										title: `${data?.name || 'Bitcoin'} Price Alert`,
										type: 'price_above',
									});
								}}
								onViewChart={(symbol) => {
									setActiveTab('charts');
									addNotification({
										type: 'success',
										title: 'Chart View',
										message: `Switched to ${symbol} price chart`,
									});
								}}
							/>
						</Grid.Col>

						{/* Ethereum Card */}
						<Grid.Col className='hero-section' span={{ base: 12, md: 6 }}>
							<CryptoCard
								symbol='ethereum'
								data={apiData?.ethereum}
								isLoading={apiLoading}
								isRealTime={isRealTimeActive}
								variant='detailed'
								onAddAlert={(symbol, data) => {
									handleCreateAlert(symbol, {
										title: `${data?.name || 'Ethereum'} Price Alert`,
										type: 'price_above',
									});
								}}
								onViewChart={(symbol) => {
									setActiveTab('charts');
									addNotification({
										type: 'success',
										title: 'Chart View',
										message: `Switched to ${symbol} price chart`,
									});
								}}
							/>
						</Grid.Col>

						{/* Action Cards Row */}
						<Grid.Col span={12}>
							<Group grow>
								<Card
									withBorder
									style={{
										backgroundColor: 'rgba(247, 147, 26, 0.1)',
										textAlign: 'center',
										cursor: 'pointer',
									}}
									onClick={() => handleCreateAlert('bitcoin')}>
									<IconBell size={32} color='var(--mantine-color-bitcoin-6)' />
									<Text size='sm' fw={500} mt='xs'>
										Set Alert
									</Text>
									<Text size='xs' c='dimmed'>
										Create price or change alerts
									</Text>
								</Card>

								<Card
									withBorder
									style={{
										backgroundColor: 'rgba(33, 150, 243, 0.1)',
										textAlign: 'center',
										cursor: 'pointer',
									}}
									onClick={() => setActiveTab('alerts')}>
									<IconAlertTriangle
										size={32}
										color='var(--mantine-color-blue-6)'
									/>
									<Text size='sm' fw={500} mt='xs'>
										View Alerts
									</Text>
									<Text size='xs' c='dimmed'>
										Manage your alert center
									</Text>
								</Card>

								<Card
									withBorder
									style={{
										backgroundColor: 'rgba(76, 175, 80, 0.1)',
										textAlign: 'center',
										cursor: 'pointer',
									}}
									onClick={() => {
										addNotification({
											type: 'info',
											title: 'Portfolio Features',
											message: 'Advanced portfolio tracking coming in next update!',
										});
									}}>
									<IconTrendingUp
										size={32}
										color='var(--mantine-color-green-6)'
									/>
									<Text size='sm' fw={500} mt='xs'>
										Portfolio
									</Text>
									<Text size='xs' c='dimmed'>
										Track your holdings
									</Text>
								</Card>

								{NotificationStatusCard && (
									<Card
										withBorder
										style={{
											backgroundColor: 'rgba(156, 39, 176, 0.1)',
											textAlign: 'center',
											cursor: 'pointer',
										}}
										onClick={() => setActiveTab('notifications')}>
										<IconSettings
											size={32}
											color='var(--mantine-color-violet-6)'
										/>
										<Text size='sm' fw={500} mt='xs'>
											Notifications
										</Text>
										<Text size='xs' c='dimmed'>
											Manage notification settings
										</Text>
									</Card>
								)}
							</Group>
						</Grid.Col>
					</Grid>
				</Tabs.Panel>

				{/* Charts Tab */}
				<Tabs.Panel value='charts' pt='xl'>
					<Grid gutter='xl'>
						<Grid.Col span={12}>
							<PriceChart
								symbol='bitcoin'
								data={apiData?.bitcoin}
								isLoading={apiLoading}
							/>
						</Grid.Col>
						<Grid.Col span={12}>
							<PriceChart
								symbol='ethereum'
								data={apiData?.ethereum}
								isLoading={apiLoading}
							/>
						</Grid.Col>
					</Grid>
				</Tabs.Panel>

				{/* Alerts Tab */}
				<Tabs.Panel value='alerts' pt='xl'>
					<AlertsList />
				</Tabs.Panel>

				{/* Notifications Tab */}
				{NotificationStatusCard && (
					<Tabs.Panel value='notifications' pt='xl'>
						<Stack gap='lg'>
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
											Notification Settings
										</Text>
										<Text size='sm' c='dimmed'>
											Manage how you receive alerts and notifications
										</Text>
									</Box>

									<Group gap='md'>
										<Button
											leftSection={<IconBell size={16} />}
											variant='light'
											color='blue'
											onClick={() => {
												if ('Notification' in window && Notification.permission === 'granted') {
													new Notification('🧪 Test Notification', {
														body: 'Your notification system is working perfectly!',
														icon: '/favicon.ico',
														tag: 'manual-test'
													});
												}
											}}>
											Test Notifications
										</Button>

										<Button
											leftSection={<IconSettings size={16} />}
											variant='light'
											color='gray'
											onClick={() => {
												addNotification({
													type: 'info',
													title: 'Advanced Settings',
													message: 'Advanced notification settings coming in next update!',
												});
											}}>
											Advanced Settings
										</Button>
									</Group>
								</Group>
							</Card>

							<Grid>
								<Grid.Col span={{ base: 12, md: 8 }}>
									<NotificationStatusCard />
								</Grid.Col>

								<Grid.Col span={{ base: 12, md: 4 }}>
									<Card withBorder p="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
										<Stack gap="md">
											<Group gap="sm">
												<IconInfoCircle size={20} color="var(--mantine-color-blue-6)" />
												<Text size="sm" fw={600}>
													Notification Tips
												</Text>
											</Group>

											<Stack gap="xs">
												<Text size="xs" c="dimmed">
													• Enable notifications to receive instant alerts
												</Text>
												<Text size="xs" c="dimmed">
													• Notifications work even when tab is closed
												</Text>
												<Text size="xs" c="dimmed">
													• You can customize alert types and frequencies
												</Text>
												<Text size="xs" c="dimmed">
													• System will remember your preferences
												</Text>
											</Stack>

											<Button
												size="xs"
												variant="light"
												fullWidth
												onClick={() => setActiveTab('alerts')}
											>
												Manage Alerts
											</Button>
										</Stack>
									</Card>
								</Grid.Col>
							</Grid>
						</Stack>
					</Tabs.Panel>
				)}
			</Tabs>
		</Stack>
	);
};

export default DashboardGrid;
