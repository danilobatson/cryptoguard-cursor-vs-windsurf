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
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import CryptoCard from './CryptoCard';
import PriceChart from './PriceChart';
import AlertsList from '../alerts/AlertsList';
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
		setRefreshInterval,
		notifications,
		addNotification,
	} = useCryptoStore();

	const { openAlertModal, checkAlerts, getActiveAlerts, getTriggeredAlerts } =
		useAlertStore();

	const {
		data: cryptoData,
		isLoading,
		refreshAll,
		hasError,
	} = useMultipleCrypto(['bitcoin', 'ethereum']);

	// Check alerts when crypto data updates
	useEffect(() => {
		if (cryptoData && Object.keys(cryptoData).length > 0) {
			const triggeredAlerts = checkAlerts(cryptoData);

			// Show notifications for triggered alerts
			if (triggeredAlerts && triggeredAlerts.length > 0) {
				triggeredAlerts.forEach(({ alert, triggerData, currentPrice }) => {
					addNotification({
						type: 'warning',
						title: '🚨 Alert Triggered!',
						message: `${
							alert.title
						} - ${alert.symbol.toUpperCase()} is now $${currentPrice.toLocaleString()}`,
					});
				});
			}
		}
	}, [cryptoData, checkAlerts, addNotification]);

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

	const handleIntervalChange = (value) => {
		const newInterval = parseInt(value) * 1000;
		setRefreshInterval(newInterval);
		addNotification({
			type: 'info',
			title: 'Update Interval Changed',
			message: `Dashboard will now refresh every ${value} seconds`,
		});
	};

	const handleCreateAlert = (symbol, prefillData = {}) => {
		const currentPrice = cryptoData[symbol]?.close || cryptoData[symbol]?.price;
		openAlertModal(symbol, {
			...prefillData,
			targetValue: currentPrice ? Math.round(currentPrice * 1.05) : undefined,
		});
	};

	const activeAlerts = getActiveAlerts();
	const triggeredAlerts = getTriggeredAlerts();

	return (
		<Stack gap='xl'>
			{/* 🚀 HERO SECTION */}

			{/* Dashboard Header */}
			<Card withBorder style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
				<Group justify='space-between' align='center'>
					<Group gap='md'>
						<IconLayoutDashboard
							size={24}
							color='var(--mantine-color-bitcoin-6)'
						/>
						<Box>
							<Text size='lg' fw={700} c='white'>
								Market Overview
							</Text>
							<Text size='sm' c='dimmed'>
								Live cryptocurrency market data with interactive price charts
							</Text>
						</Box>
					</Group>

					{/* Dashboard Controls */}
					<Group gap='sm'>
						<Badge
							color={hasError ? 'red' : isLoading ? 'yellow' : 'green'}
							variant='light'
							leftSection={hasError ? '⚠️' : isLoading ? '⏳' : '✅'}>
							{hasError ? 'Error' : isLoading ? 'Loading' : 'Live'}
						</Badge>

						<Select
							value={(refreshInterval / 1000).toString()}
							onChange={handleIntervalChange}
							data={[
								{ value: '30', label: '30s' },
								{ value: '60', label: '1m' },
								{ value: '120', label: '2m' },
								{ value: '300', label: '5m' },
							]}
							size='xs'
							w={80}
						/>

						<Tooltip label='Manual refresh'>
							<ActionIcon
								variant='light'
								color='blue'
								size='lg'
								onClick={handleRefreshAll}
								loading={isLoading}>
								<IconRefresh size={18} />
							</ActionIcon>
						</Tooltip>

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
								onClick={handleToggleRealTime}>
								{isRealTimeActive ? (
									<IconPlayerPause size={18} />
								) : (
									<IconPlayerPlay size={18} />
								)}
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>
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
				</Tabs.List>

				{/* Overview Tab - Main Dashboard */}
				<Tabs.Panel value='overview' pt='xl'>
					<Grid gutter='xl'>
						{/* Bitcoin Card */}
						<Grid.Col className='hero-section' span={{ base: 12, md: 6 }}>
							<CryptoCard
								symbol='bitcoin'
								data={cryptoData.bitcoin}
								isLoading={isLoading}
								isRealTime={isRealTimeActive}
								variant='detailed'
								onAddAlert={(symbol, data) => {
									handleCreateAlert(symbol, {
										title: `${data.name} Price Alert`,
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
								data={cryptoData.ethereum}
								isLoading={isLoading}
								isRealTime={isRealTimeActive}
								variant='detailed'
								onAddAlert={(symbol, data) => {
									handleCreateAlert(symbol, {
										title: `${data.name} Price Alert`,
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

						{/* Quick Stats Row */}
						<Grid.Col span={12}>
							<Group grow>
								<Card
									withBorder
									style={{
										backgroundColor: 'rgba(76, 175, 80, 0.1)',
										textAlign: 'center',
									}}>
									<Text size='xs' c='dimmed'>
										Portfolio Value
									</Text>
									<Text size='lg' fw={700} c='green'>
										<NumberFormatter
											value={
												(cryptoData?.bitcoin?.close || 0) +
												(cryptoData?.ethereum?.close || 0)
											}
											prefix='$'
											thousandSeparator
											decimalScale={2}
										/>
									</Text>
									<Text size='xs' c='dimmed'>
										{(
											((cryptoData?.bitcoin?.percent_change_24h || 0) +
												(cryptoData?.ethereum?.percent_change_24h || 0)) /
											2
										).toFixed(2)}
										%
									</Text>
								</Card>

								<Card
									withBorder
									style={{
										backgroundColor: 'rgba(33, 150, 243, 0.1)',
										textAlign: 'center',
									}}>
									<Text size='xs' c='dimmed'>
										Active Alerts
									</Text>
									<Text size='lg' fw={700} c='blue'>
										{activeAlerts.length}
									</Text>
									<Text size='xs' c='dimmed'>
										{triggeredAlerts.length} triggered today
									</Text>
								</Card>

								<Card
									withBorder
									style={{
										backgroundColor: 'rgba(255, 193, 7, 0.1)',
										textAlign: 'center',
									}}>
									<Text size='xs' c='dimmed'>
										Data Status
									</Text>
									<Text size='lg' fw={700} c='bitcoin'>
										{isRealTimeActive ? 'LIVE' : 'PAUSED'}
									</Text>
									<Text size='xs' c='dimmed'>
										Last update: {new Date().toLocaleTimeString()}
									</Text>
								</Card>
							</Group>
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
											message:
												'Advanced portfolio tracking coming in next update!',
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
								data={cryptoData.bitcoin}
								isLoading={isLoading}
							/>
						</Grid.Col>
						<Grid.Col span={12}>
							<PriceChart
								symbol='ethereum'
								data={cryptoData.ethereum}
								isLoading={isLoading}
							/>
						</Grid.Col>
					</Grid>
				</Tabs.Panel>

				{/* Alerts Tab */}
				<Tabs.Panel value='alerts' pt='xl'>
					<AlertsList />
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
};

export default DashboardGrid;
