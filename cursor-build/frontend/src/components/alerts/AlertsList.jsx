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
	const Icon = config.icon;

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
					: 'rgba(255, 255, 255, 0.1)',
			}}>
			<Group justify='space-between' align='flex-start'>
				<Group gap='sm' flex={1}>
					{/* Alert Icon & Type */}
					<Box
						style={{
							padding: '8px',
							borderRadius: '8px',
							backgroundColor: `rgba(var(--mantine-color-${config.color}-rgb), 0.1)`,
						}}>
						<Icon size={20} color={`var(--mantine-color-${config.color}-6)`} />
					</Box>

					<Stack gap={4} flex={1}>
						{/* Title & Symbol */}
						<Group gap='xs'>
							<Text fw={600} size='sm' c='white'>
								{alert.title}
							</Text>
							<Badge size='xs' variant='light' color='bitcoin'>
								{alert.symbol.toUpperCase()}
							</Badge>
						</Group>

						{/* Alert Details */}
						<Group gap='md' align='center'>
							<Text size='xs' c='dimmed'>
								Target: {config.unit}
								{alert.targetValue.toLocaleString()}
							</Text>
							{currentPrice && (
								<Text size='xs' c='dimmed'>
									Current: ${currentPrice.toLocaleString()}
								</Text>
							)}
							{alert.triggeredAt && (
								<Text size='xs' c='yellow'>
									Triggered: {new Date(alert.triggeredAt).toLocaleDateString()}
								</Text>
							)}
						</Group>

						{/* Notes */}
						{alert.notes && (
							<Text size='xs' c='dimmed' lineClamp={1}>
								{alert.notes}
							</Text>
						)}
					</Stack>
				</Group>

				{/* Status & Actions */}
				<Group gap='xs' align='center'>
					{/* Status Badge */}
					<Tooltip label={`Alert is ${alert.status}`}>
						<Badge
							variant='light'
							color={getStatusColor(alert.status)}
							leftSection={<StatusIcon size={12} />}
							size='sm'>
							{alert.status}
						</Badge>
					</Tooltip>

					{/* Actions Menu */}
					<Menu position='bottom-end'>
						<Menu.Target>
							<ActionIcon variant='subtle' color='gray' size='sm'>
								<IconDots size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconEdit size={14} />}
								onClick={() => onEdit(alert)}>
								Edit Alert
							</Menu.Item>
							<Menu.Item
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
			</Group>
		</Card>
	);
};

// History Item Component
const HistoryItem = ({ item }) => {
	const config = ALERT_TYPE_CONFIGS[item.type];
	const Icon = config?.icon || IconBell;

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
						<Text size='sm' fw={500}>
							{item.alertTitle}
						</Text>
						<Text size='xs' c='dimmed'>
							{new Date(item.triggeredAt).toLocaleDateString()}
						</Text>
					</Group>
					<Text size='xs' c='dimmed'>
						{item.symbol.toUpperCase()} reached $
						{item.triggerPrice.toLocaleString()}
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
		clearTriggeredAlerts,
		getRecentHistory,
	} = useAlertStore();

	const { cryptoData, addNotification } = useCryptoStore();

	const activeAlerts = getActiveAlerts();
	const triggeredAlerts = getTriggeredAlerts();
	const recentHistory = getRecentHistory(10);

	const handleEdit = (alert) => {
		editAlert(alert);
	};

	const handleDelete = (alertId) => {
		deleteAlert(alertId);
		addNotification({
			type: 'success',
			title: 'Alert Deleted',
			message: 'Alert has been removed successfully',
		});
	};

	const handleToggle = (alertId) => {
		toggleAlert(alertId);
		addNotification({
			type: 'info',
			title: 'Alert Status Changed',
			message: 'Alert status has been updated',
		});
	};

	const handleClearTriggered = () => {
		clearTriggeredAlerts();
		addNotification({
			type: 'success',
			title: 'Triggered Alerts Cleared',
			message: 'All triggered alerts have been removed',
		});
	};

	const getCurrentPrice = (symbol) => {
		const data = cryptoData[symbol];
		return data?.close || data?.price || 0;
	};

	return (
		<Stack gap='lg'>
			{/* Header */}
			<Group justify='space-between' align='center'>
				<Group gap='sm'>
					<IconBell size={24} color='var(--mantine-color-bitcoin-6)' />
					<Box>
						<Text size='lg' fw={700} c='white'>
							Alert Center
						</Text>
						<Text size='sm' c='dimmed'>
							Manage your cryptocurrency price alerts
						</Text>
					</Box>
				</Group>

				<Button
					leftSection={<IconPlus size={16} />}
					color='bitcoin'
					onClick={() => openAlertModal()}>
					New Alert
				</Button>
			</Group>

			{/* Quick Stats */}
			<Grid>
				<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
					<Card
						withBorder
						style={{
							backgroundColor: 'rgba(76, 175, 80, 0.1)',
							textAlign: 'center',
						}}>
						<Text size='xs' c='dimmed'>
							Active Alerts
						</Text>
						<Text size='xl' fw={700} c='green'>
							{activeAlerts.length}
						</Text>
					</Card>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
					<Card
						withBorder
						style={{
							backgroundColor: 'rgba(255, 193, 7, 0.1)',
							textAlign: 'center',
						}}>
						<Text size='xs' c='dimmed'>
							Triggered Today
						</Text>
						<Text size='xl' fw={700} c='yellow'>
							{triggeredAlerts.length}
						</Text>
					</Card>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
					<Card
						withBorder
						style={{
							backgroundColor: 'rgba(33, 150, 243, 0.1)',
							textAlign: 'center',
						}}>
						<Text size='xs' c='dimmed'>
							Total Alerts
						</Text>
						<Text size='xl' fw={700} c='blue'>
							{alerts.length}
						</Text>
					</Card>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
					<Card
						withBorder
						style={{
							backgroundColor: 'rgba(156, 39, 176, 0.1)',
							textAlign: 'center',
						}}>
						<Text size='xs' c='dimmed'>
							History Items
						</Text>
						<Text size='xl' fw={700} c='violet'>
							{alertHistory.length}
						</Text>
					</Card>
				</Grid.Col>
			</Grid>

			{/* Tabs */}
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
				<Tabs.Panel value='active' pt='md'>
					{activeAlerts.length === 0 ? (
						<Alert icon={<IconBell size={16} />} color='blue' variant='light'>
							<Text size='sm'>
								No active alerts yet. Create your first alert to start
								monitoring cryptocurrency prices!
							</Text>
							<Button
								size='xs'
								variant='light'
								color='blue'
								mt='sm'
								onClick={() => openAlertModal()}>
								Create Alert
							</Button>
						</Alert>
					) : (
						<Stack gap='sm'>
							{activeAlerts.map((alert) => (
								<AlertCard
									key={alert.id}
									alert={alert}
									currentPrice={getCurrentPrice(alert.symbol)}
									onEdit={handleEdit}
									onDelete={handleDelete}
									onToggle={handleToggle}
								/>
							))}
						</Stack>
					)}
				</Tabs.Panel>

				{/* Triggered Alerts Tab */}
				<Tabs.Panel value='triggered' pt='md'>
					{triggeredAlerts.length === 0 ? (
						<Alert icon={<IconCheck size={16} />} color='green' variant='light'>
							<Text size='sm'>
								No triggered alerts at the moment. Active alerts will appear
								here when their conditions are met.
							</Text>
						</Alert>
					) : (
						<Stack gap='md'>
							<Group justify='space-between'>
								<Text size='sm' c='dimmed'>
									{triggeredAlerts.length} alert(s) have been triggered
								</Text>
								<Button
									size='xs'
									variant='light'
									color='red'
									onClick={handleClearTriggered}>
									Clear All
								</Button>
							</Group>
							<Stack gap='sm'>
								{triggeredAlerts.map((alert) => (
									<AlertCard
										key={alert.id}
										alert={alert}
										currentPrice={getCurrentPrice(alert.symbol)}
										onEdit={handleEdit}
										onDelete={handleDelete}
										onToggle={handleToggle}
									/>
								))}
							</Stack>
						</Stack>
					)}
				</Tabs.Panel>

				{/* History Tab */}
				<Tabs.Panel value='history' pt='md'>
					{recentHistory.length === 0 ? (
						<Alert
							icon={<IconHistory size={16} />}
							color='violet'
							variant='light'>
							<Text size='sm'>
								No alert history yet. Triggered alerts will be logged here for
								your reference.
							</Text>
						</Alert>
					) : (
						<Stack gap='sm'>
							{recentHistory.map((item) => (
								<HistoryItem key={item.id} item={item} />
							))}
						</Stack>
					)}
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
};

export default AlertsList;
