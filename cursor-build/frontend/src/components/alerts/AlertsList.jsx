import { useState } from 'react';
import {
	Stack,
	Card,
	Group,
	Text,
	Badge,
	ActionIcon,
	Menu,
	Button,
	Box,
	Grid,
	Tooltip,
	Alert,
	Tabs,
	NumberFormatter,
	Divider,
} from '@mantine/core';
import {
	IconBell,
	IconBellOff,
	IconEdit,
	IconTrash,
	IconDots,
	IconTrendingUp,
	IconTrendingDown,
	IconPercentage,
	IconVolume,
	IconClock,
	IconCheck,
	IconX,
	IconSettings,
	IconHistory,
	IconPlus,
} from '@tabler/icons-react';
import useAlertStore, {
	ALERT_TYPES,
	ALERT_STATUS,
} from '../../stores/useAlertStore';
import useCryptoStore from '../../stores/useCryptoStore';

// Alert type configurations for display
const ALERT_TYPE_CONFIGS = {
	[ALERT_TYPES.PRICE_ABOVE]: {
		icon: IconTrendingUp,
		color: 'green',
		unit: '$',
	},
	[ALERT_TYPES.PRICE_BELOW]: {
		icon: IconTrendingDown,
		color: 'red',
		unit: '$',
	},
	[ALERT_TYPES.PERCENT_CHANGE]: {
		icon: IconPercentage,
		color: 'blue',
		unit: '%',
	},
	[ALERT_TYPES.VOLUME_SPIKE]: {
		icon: IconVolume,
		color: 'yellow',
		unit: '$',
	},
};

// Individual Alert Card Component
const AlertCard = ({ alert, onEdit, onDelete, onToggle, currentPrice }) => {
	const config = ALERT_TYPE_CONFIGS[alert.type];
	const Icon = config?.icon || IconBell;

	const getStatusColor = (status) => {
		switch (status) {
			case ALERT_STATUS.ACTIVE:
				return 'green';
			case ALERT_STATUS.TRIGGERED:
				return 'orange';
			case ALERT_STATUS.DISABLED:
				return 'gray';
			default:
				return 'gray';
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case ALERT_STATUS.ACTIVE:
				return IconBell;
			case ALERT_STATUS.TRIGGERED:
				return IconCheck;
			case ALERT_STATUS.DISABLED:
				return IconBellOff;
			default:
				return IconBellOff;
		}
	};

	const StatusIcon = getStatusIcon(alert.status);
	const isTriggered = alert.status === ALERT_STATUS.TRIGGERED;
	const isActive = alert.status === ALERT_STATUS.ACTIVE;

	// FIXED: Safe number formatting with null checks
	const formatPrice = (value) => {
		if (value === null || value === undefined || isNaN(value)) {
			return 'N/A';
		}
		return Number(value).toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	const formatNumber = (value) => {
		if (value === null || value === undefined || isNaN(value)) {
			return 'N/A';
		}
		return Number(value).toLocaleString();
	};

	const getTargetValueDisplay = () => {
		const targetValue = alert.targetValue || alert.targetPrice;
		if (!targetValue && targetValue !== 0) {
			return 'N/A';
		}

		switch (alert.type) {
			case ALERT_TYPES.PRICE_ABOVE:
			case ALERT_TYPES.PRICE_BELOW:
				return formatPrice(targetValue);
			case ALERT_TYPES.PERCENT_CHANGE:
				return `${formatNumber(targetValue)}%`;
			case ALERT_TYPES.VOLUME_SPIKE:
				return `${formatNumber(targetValue)}x`;
			default:
				return formatNumber(targetValue);
		}
	};

	return (
		<Card
			withBorder
			p='md'
			style={{
				backgroundColor: isTriggered
					? 'rgba(255, 193, 7, 0.1)'
					: 'rgba(255, 255, 255, 0.05)',
				borderColor: isTriggered
					? 'var(--mantine-color-yellow-6)'
					: 'var(--mantine-color-gray-7)',
			}}>
			<Group justify='space-between' align='flex-start'>
				<Group gap='md' flex={1}>
					<Box
						style={{
							padding: '8px',
							borderRadius: '8px',
							backgroundColor: `rgba(${
								config?.color === 'green'
									? '76, 175, 80'
									: config?.color === 'red'
									? '244, 67, 54'
									: config?.color === 'blue'
									? '33, 150, 243'
									: '255, 193, 7'
							}, 0.1)`,
						}}>
						<Icon
							size={20}
							color={`var(--mantine-color-${config?.color || 'yellow'}-6)`}
						/>
					</Box>

					<Stack gap={4} flex={1}>
						<Group justify='space-between' align='center'>
							<Text size='sm' fw={600} c='white'>
								{alert.title ||
									`${
										config?.label || 'Alert'
									} - ${alert.symbol?.toUpperCase()}`}
							</Text>
							<Group gap='xs'>
								<Badge
									size='sm'
									color={getStatusColor(alert.status)}
									variant='light'>
									{alert.status}
								</Badge>
								<StatusIcon size={14} />
							</Group>
						</Group>

						<Group gap='lg'>
							<div>
								<Text size='xs' c='dimmed'>
									Target
								</Text>
								<Text size='sm' fw={500} c='white'>
									{getTargetValueDisplay()}
								</Text>
							</div>

							{currentPrice && (
								<div>
									<Text size='xs' c='dimmed'>
										Current
									</Text>
									<Text size='sm' fw={500} c='white'>
										{formatPrice(currentPrice)}
									</Text>
								</div>
							)}

							<div>
								<Text size='xs' c='dimmed'>
									Created
								</Text>
								<Text size='sm' c='white'>
									{alert.createdAt
										? new Date(alert.createdAt).toLocaleDateString()
										: 'Unknown'}
								</Text>
							</div>
						</Group>

						{isTriggered && alert.triggeredAt && (
							<Group gap='xs'>
								<IconCheck size={12} color='var(--mantine-color-orange-6)' />
								<Text size='xs' c='orange'>
									Triggered: {new Date(alert.triggeredAt).toLocaleString()}
								</Text>
							</Group>
						)}
					</Stack>
				</Group>

				{/* Action Menu */}
				<Menu shadow='md' width={200}>
					<Menu.Target>
						<ActionIcon variant='subtle' color='gray'>
							<IconDots size={16} />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown>
						<Menu.Item
							color='black'
							leftSection={<IconEdit size={14} />}
							onClick={() => onEdit(alert)}>
							Edit Alert
						</Menu.Item>
						<Menu.Item
							color='black'
							leftSection={
								isActive ? <IconBellOff size={14} /> : <IconBell size={14} />
							}
							onClick={() => onToggle(alert.id)}>
							{isActive ? 'Disable' : 'Enable'} Alert
						</Menu.Item>
						<Menu.Divider />
						<Menu.Item
							color='red'
							leftSection={<IconTrash size={14} />}
							onClick={() => onDelete(alert.id)}>
							Delete Alert
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</Card>
	);
};

// History Item Component
const HistoryItem = ({ item }) => {
	const config = ALERT_TYPE_CONFIGS[item.type];
	const Icon = config?.icon || IconBell;

	// FIXED: Safe price formatting
	const formatPrice = (value) => {
		if (value === null || value === undefined || isNaN(value)) {
			return 'N/A';
		}
		return Number(value).toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	return (
		<Card
			withBorder
			p='sm'
			style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
			<Group gap='sm'>
				<Box
					style={{
						padding: '6px',
						borderRadius: '6px',
						backgroundColor: 'rgba(76, 175, 80, 0.1)',
					}}>
					<Icon size={16} color='var(--mantine-color-green-6)' />
				</Box>

				<Stack gap={2} flex={1}>
					<Group justify='space-between'>
						<Text size='sm' fw={500} c='white'>
							{item.alertTitle}
						</Text>
						<Text size='xs' c='dimmed'>
							{item.triggeredAt
								? new Date(item.triggeredAt).toLocaleDateString()
								: 'Unknown'}
						</Text>
					</Group>
					<Text size='xs' c='dimmed'>
						{item.symbol?.toUpperCase()} reached {formatPrice(item.triggerPrice)}
					</Text>
				</Stack>
			</Group>
		</Card>
	);
};

// Main AlertsList Component
const AlertsList = () => {
	const [activeTab, setActiveTab] = useState('active');

	const {
		alerts,
		alertHistory,
		deleteAlert,
		toggleAlert,
		editAlert,
		openAlertModal,
		getActiveAlerts,
		getTriggeredAlerts,
		clearHistory,
		getRecentHistory,
	} = useAlertStore();

	const { cryptoData, addNotification } = useCryptoStore();

	const activeAlerts = getActiveAlerts();
	const triggeredAlerts = getTriggeredAlerts();
	const recentHistory = getRecentHistory(10);

	const handleEditAlert = (alert) => {
		editAlert(alert);
		addNotification({
			type: 'info',
			title: 'Edit Alert',
			message: `Editing alert: ${alert.title}`,
		});
	};

	const handleDeleteAlert = (alertId) => {
		deleteAlert(alertId);
		addNotification({
			type: 'success',
			title: 'Alert Deleted',
			message: 'Alert has been successfully removed',
		});
	};

	const handleToggleAlert = (alertId) => {
		const alert = alerts.find((a) => a.id === alertId);
		const newStatus = alert?.status === ALERT_STATUS.ACTIVE ? 'disabled' : 'active';

		toggleAlert(alertId);
		addNotification({
			type: 'info',
			title: `Alert ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
			message: `Alert has been ${newStatus === 'active' ? 'activated' : 'paused'}`,
		});
	};

	const getCurrentPrice = (symbol) => {
		const data = cryptoData[symbol];
		return data?.price || data?.close || null;
	};

	return (
		<Stack gap='lg'>
			{/* Header Stats */}
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
						<Text fw={600} c='white' size='lg'>
							Alert Center
						</Text>
						<Text size='sm' c='dimmed'>
							Manage your cryptocurrency price alerts
						</Text>
					</Box>

					<Group gap='xl'>
						<div style={{ textAlign: 'center' }}>
							<Text size='xl' fw={700} c='orange'>
								{activeAlerts.length}
							</Text>
							<Text size='xs' c='dimmed'>
								Active Alerts
							</Text>
						</div>

						<div style={{ textAlign: 'center' }}>
							<Text size='xl' fw={700} c='yellow'>
								{triggeredAlerts.length}
							</Text>
							<Text size='xs' c='dimmed'>
								Triggered Today
							</Text>
						</div>

						<div style={{ textAlign: 'center' }}>
							<Text size='xl' fw={700} c='blue'>
								{alerts.length}
							</Text>
							<Text size='xs' c='dimmed'>
								Total Alerts
							</Text>
						</div>

						<div style={{ textAlign: 'center' }}>
							<Text size='xl' fw={700} c='green'>
								{recentHistory.length}
							</Text>
							<Text size='xs' c='dimmed'>
								History Items
							</Text>
						</div>
					</Group>
				</Group>
			</Card>

			{/* Tabs for different views */}
			<Tabs value={activeTab} onChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab value='active' leftSection={<IconBell size={16} />}>
						Active ({activeAlerts.length})
					</Tabs.Tab>
					<Tabs.Tab value='triggered' leftSection={<IconCheck size={16} />}>
						Triggered ({triggeredAlerts.length})
					</Tabs.Tab>
					<Tabs.Tab value='history' leftSection={<IconHistory size={16} />}>
						History ({recentHistory.length})
					</Tabs.Tab>
				</Tabs.List>

				{/* Active Alerts Tab */}
				<Tabs.Panel value='active' pt='lg'>
					{activeAlerts.length === 0 ? (
						<Card
							withBorder
							p='xl'
							style={{
								backgroundColor: 'rgba(255, 255, 255, 0.05)',
								textAlign: 'center',
							}}>
							<IconBell size={48} color='var(--mantine-color-gray-6)' />
							<Text size='lg' fw={600} mt='md' c='white'>
								No Active Alerts
							</Text>
							<Text size='sm' c='dimmed' mb='lg'>
								Create your first alert to get notified of price changes
							</Text>
							<Button
								leftSection={<IconPlus size={16} />}
								onClick={openAlertModal}>
								Create Your First Alert
							</Button>
						</Card>
					) : (
						<Stack gap='md'>
							{activeAlerts.map((alert) => (
								<AlertCard
									key={alert.id}
									alert={alert}
									currentPrice={getCurrentPrice(alert.symbol)}
									onEdit={handleEditAlert}
									onDelete={handleDeleteAlert}
									onToggle={handleToggleAlert}
								/>
							))}
						</Stack>
					)}
				</Tabs.Panel>

				{/* Triggered Alerts Tab */}
				<Tabs.Panel value='triggered' pt='lg'>
					{triggeredAlerts.length === 0 ? (
						<Card
							withBorder
							p='xl'
							style={{
								backgroundColor: 'rgba(255, 255, 255, 0.05)',
								textAlign: 'center',
							}}>
							<IconCheck size={48} color='var(--mantine-color-gray-6)' />
							<Text size='lg' fw={600} mt='md' c='white'>
								No Triggered Alerts
							</Text>
							<Text size='sm' c='dimmed'>
								Alerts that have been triggered will appear here
							</Text>
						</Card>
					) : (
						<Stack gap='md'>
							{triggeredAlerts.map((alert) => (
								<AlertCard
									key={alert.id}
									alert={alert}
									currentPrice={getCurrentPrice(alert.symbol)}
									onEdit={handleEditAlert}
									onDelete={handleDeleteAlert}
									onToggle={handleToggleAlert}
								/>
							))}
						</Stack>
					)}
				</Tabs.Panel>

				{/* History Tab */}
				<Tabs.Panel value='history' pt='lg'>
					{recentHistory.length === 0 ? (
						<Card
							withBorder
							p='xl'
							style={{
								backgroundColor: 'rgba(255, 255, 255, 0.05)',
								textAlign: 'center',
							}}>
							<IconHistory size={48} color='var(--mantine-color-gray-6)' />
							<Text size='lg' fw={600} mt='md' c='white'>
								No Alert History
							</Text>
							<Text size='sm' c='dimmed'>
								Previous alert activations will be shown here
							</Text>
						</Card>
					) : (
						<>
							<Group justify='space-between' mb='md'>
								<Text size='lg' fw={600} c='white'>
									Recent Alert History
								</Text>
								<Button
									size='sm'
									variant='subtle'
									color='red'
									onClick={() => {
										clearHistory();
										addNotification({
											type: 'info',
											title: 'History Cleared',
											message: 'Alert history has been cleared',
										});
									}}>
									Clear History
								</Button>
							</Group>

							<Stack gap='sm'>
								{recentHistory.map((item) => (
									<HistoryItem key={item.id} item={item} />
								))}
							</Stack>
						</>
					)}
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
};

export default AlertsList;
