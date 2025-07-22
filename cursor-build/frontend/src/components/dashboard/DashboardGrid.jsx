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
} from '@tabler/icons-react';
import { useState } from 'react';
import CryptoCard from './CryptoCard';
import PriceChart from './PriceChart';
import { useMultipleCrypto } from '../../hooks/useCryptoData';
import useCryptoStore from '../../stores/useCryptoStore';
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

	const {
		data: cryptoData,
		isLoading,
		refreshAll,
		hasError,
	} = useMultipleCrypto(['bitcoin', 'ethereum']);

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
							{hasError ? 'Error' : isLoading ? 'Loading' : 'Connected'}
						</Badge>

						<Tooltip label='Refresh interval'>
							<Select
								size='xs'
								value={(refreshInterval / 1000).toString()}
								onChange={handleIntervalChange}
								data={[
									{ value: '30', label: '30s' },
									{ value: '60', label: '1m' },
									{ value: '120', label: '2m' },
									{ value: '300', label: '5m' },
								]}
								style={{ width: 80 }}
							/>
						</Tooltip>

						<Tooltip
							label={isRealTimeActive ? 'Pause updates' : 'Start real-time'}>
							<ActionIcon
								className='icon-spin'
								color={isRealTimeActive ? 'red' : 'green'}
								variant='light'
								onClick={handleToggleRealTime}>
								{isRealTimeActive ? (
									<IconPlayerPause size={16} />
								) : (
									<IconPlayerPlay size={16} />
								)}
							</ActionIcon>
						</Tooltip>

						<Tooltip label='Refresh all data'>
							<ActionIcon
								className='icon-spin'
								color='blue'
								variant='light'
								onClick={handleRefreshAll}
								loading={isLoading}>
								<IconRefresh size={16} />
							</ActionIcon>
						</Tooltip>

						<Tooltip label='Dashboard settings'>
							<ActionIcon className='icon-spin' color='gray' variant='light'>
								<IconSettings size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>
			</Card>

			{/* Dashboard Tabs */}
			{/* Hero Section */}
			<HeroSection cryptoData={cryptoData} isRealTime={isRealTimeActive} />
			<Tabs value={activeTab} onChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab
						value='overview'
						leftSection={<IconCards size={16} />}>
						Overview
					</Tabs.Tab>
					<Tabs.Tab value='charts' leftSection={<IconChartLine size={16} />}>
						Price Charts
					</Tabs.Tab>
					<Tabs.Tab
						value='analytics'
						leftSection={<IconTrendingUp size={16} />}>
						Analytics
					</Tabs.Tab>
				</Tabs.List>

				{/* Overview Tab */}
				<Tabs.Panel value='overview' pt='md'>
					<Grid>
						{/* Primary Assets Cards */}
						<Grid.Col className='hero-section' span={{ base: 12, md: 6 }}>
							<CryptoCard
								symbol='bitcoin'
								data={cryptoData.bitcoin}
								isLoading={isLoading}
								isRealTime={isRealTimeActive}
								variant='detailed'
								onAddAlert={(symbol, data) => {
									addNotification({
										type: 'info',
										title: 'Alert System',
										message: `Price alert for ${data.name} will be available in next update`,
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

						<Grid.Col className='hero-section' span={{ base: 12, md: 6 }}>
							<CryptoCard
								symbol='ethereum'
								data={cryptoData.ethereum}
								isLoading={isLoading}
								isRealTime={isRealTimeActive}
								variant='detailed'
								onAddAlert={(symbol, data) => {
									addNotification({
										type: 'info',
										title: 'Alert System',
										message: `Price alert for ${data.name} will be available in next update`,
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
												(cryptoData?.bitcoin?.price || 0) +
												(cryptoData?.ethereum?.price || 0)
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
										0
									</Text>
									<Text size='xs' c='dimmed'>
										0 triggered today
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
										{isRealTimeActive ? 'LIVE' : 'CACHED'}
									</Text>
									<Text size='xs' c='dimmed'>
										{isRealTimeActive
											? `${refreshInterval / 1000}s interval`
											: 'Manual refresh'}
									</Text>
								</Card>

								<Card
									withBorder
									style={{
										backgroundColor: 'rgba(156, 39, 176, 0.1)',
										textAlign: 'center',
									}}>
									<Text size='xs' c='dimmed'>
										API Health
									</Text>
									<Text size='lg' fw={700} c='grape'>
										100%
									</Text>
									<Text size='xs' c='dimmed'>
										All systems operational
									</Text>
								</Card>
							</Group>
						</Grid.Col>

						{/* Action Cards */}
						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Card
								withBorder
								style={{
									backgroundColor: 'rgba(255, 193, 7, 0.1)',
									border: '1px solid rgba(255, 193, 7, 0.3)',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
								}}
								onClick={() =>
									addNotification({
										type: 'info',
										title: 'Alert Center',
										message: 'Alert management system coming soon!',
									})
								}>
								<Stack align='center' gap='sm'>
									<IconBell size={32} color='var(--mantine-color-bitcoin-6)' />
									<Text fw={600} c='bitcoin'>
										Set Alert
									</Text>
									<Text size='sm' c='dimmed' ta='center'>
										Create price or sentiment alerts
									</Text>
								</Stack>
							</Card>
						</Grid.Col>

						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Card
								withBorder
								style={{
									backgroundColor: 'rgba(76, 175, 80, 0.1)',
									border: '1px solid rgba(76, 175, 80, 0.3)',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
								}}
								onClick={() =>
									addNotification({
										type: 'info',
										title: 'Portfolio',
										message: 'Portfolio tracking coming in next update!',
									})
								}>
								<Stack align='center' gap='sm'>
									<IconTrendingUp
										size={32}
										color='var(--mantine-color-ethereum-6)'
									/>
									<Text fw={600} c='ethereum'>
										Portfolio
									</Text>
									<Text size='sm' c='dimmed' ta='center'>
										Track your crypto holdings
									</Text>
								</Stack>
							</Card>
						</Grid.Col>

						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Card
								withBorder
								style={{
									backgroundColor: 'rgba(33, 150, 243, 0.1)',
									border: '1px solid rgba(33, 150, 243, 0.3)',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
								}}
								onClick={() => window.open('https://lunarcrush.com', '_blank')}>
								<Stack align='center' gap='sm'>
									<Text size='xl' fw={700}>
										🚀
									</Text>
									<Text fw={600} c='blue'>
										LunarCrush
									</Text>
									<Text size='sm' c='dimmed' ta='center'>
										Powered by social intelligence
									</Text>
								</Stack>
							</Card>
						</Grid.Col>

						<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
							<Card
								withBorder
								style={{
									backgroundColor: 'rgba(156, 39, 176, 0.1)',
									border: '1px solid rgba(156, 39, 176, 0.3)',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
								}}
								onClick={() => setActiveTab('analytics')}>
								<Stack align='center' gap='sm'>
									<Text size='xl' fw={700}>
										📊
									</Text>
									<Text fw={600} c='grape'>
										Analytics
									</Text>
									<Text size='sm' c='dimmed' ta='center'>
										View price charts & trends
									</Text>
								</Stack>
							</Card>
						</Grid.Col>
					</Grid>
				</Tabs.Panel>

				{/* Charts Tab */}
				<Tabs.Panel value='charts' pt='md'>
					<Grid>
						<Grid.Col span={12}>
							<PriceChart
								symbol='bitcoin'
								data={cryptoData.bitcoin}
								isRealTime={isRealTimeActive}
							/>
						</Grid.Col>
						<Grid.Col span={12}>
							<PriceChart
								symbol='ethereum'
								data={cryptoData.ethereum}
								isRealTime={isRealTimeActive}
							/>
						</Grid.Col>
					</Grid>
				</Tabs.Panel>

				{/* Analytics Tab */}
				<Tabs.Panel value='analytics' pt='md'>
					<Card withBorder>
						<Stack align='center' gap='lg' style={{ minHeight: 300 }}>
							<IconTrendingUp size={64} color='var(--mantine-color-blue-6)' />
							<Text size='xl' fw={600} c='white'>
								Advanced Analytics
							</Text>
							<Text c='dimmed' ta='center'>
								Comprehensive market analysis, correlation matrices, and
								portfolio performance metrics coming soon.
							</Text>
							<Button className='enhanced-button' variant='light' color='blue'>
								Get Notified
							</Button>
						</Stack>
					</Card>
				</Tabs.Panel>
			</Tabs>

			{/* Debug Panel (Development Only) */}
			{import.meta.env.DEV && (
				<Card
					withBorder
					style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
					<Group justify='space-between'>
						<Text size='xs' fw={600} c='dimmed'>
							Developer Debug Panel
						</Text>
						<Badge variant='light' size='xs'>
							DEV MODE
						</Badge>
					</Group>
					<Text size='xs' c='dimmed' mt='xs'>
						Real-time: {isRealTimeActive ? '✅' : '❌'} | Interval:{' '}
						{refreshInterval / 1000}s | Notifications: {notifications.length} |
						Loading: {isLoading ? '⏳' : '✅'} | Error: {hasError ? '❌' : '✅'}{' '}
						| Active Tab: {activeTab}
					</Text>
				</Card>
			)}
		</Stack>
	);
};

export default DashboardGrid;
