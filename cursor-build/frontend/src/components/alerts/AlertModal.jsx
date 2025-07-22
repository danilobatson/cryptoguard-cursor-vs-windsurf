import { useState, useEffect } from 'react'
import {
  Modal,
  Stack,
  TextInput,
  Select,
  NumberInput,
  Button,
  Group,
  Text,
  Card,
  Badge,
  Alert,
  Switch,
  Textarea,
  Box,
  Divider
} from '@mantine/core'
import {
  IconBell,
  IconTrendingUp,
  IconTrendingDown,
  IconPercentage,
  IconVolume,
  IconInfoCircle,
  IconX,
  IconCheck
} from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import useAlertStore, { ALERT_TYPES } from '../../stores/useAlertStore'
import useCryptoStore from '../../stores/useCryptoStore'

// Alert type configurations
const ALERT_TYPE_CONFIGS = {
  [ALERT_TYPES.PRICE_ABOVE]: {
    icon: IconTrendingUp,
    label: 'Price Above',
    description: 'Alert when price rises above target',
    color: 'green',
    unit: '$',
    placeholder: 'Enter target price'
  },
  [ALERT_TYPES.PRICE_BELOW]: {
    icon: IconTrendingDown,
    label: 'Price Below',
    description: 'Alert when price drops below target',
    color: 'red',
    unit: '$',
    placeholder: 'Enter target price'
  },
  [ALERT_TYPES.PERCENT_CHANGE]: {
    icon: IconPercentage,
    label: 'Percent Change',
    description: 'Alert on 24h percentage change',
    color: 'blue',
    unit: '%',
    placeholder: 'Enter percentage threshold'
  },
  [ALERT_TYPES.VOLUME_SPIKE]: {
    icon: IconVolume,
    label: 'Volume Spike',
    description: 'Alert on high trading volume',
    color: 'yellow',
    unit: '$',
    placeholder: 'Enter volume threshold'
  }
}

const AlertModal = () => {
  const {
    isAlertModalOpen,
    closeAlertModal,
    createAlert,
    updateAlert,
    selectedAlert,
    modalPrefillData = {}
  } = useAlertStore()

  const { cryptoData, addNotification } = useCryptoStore()
  const [selectedType, setSelectedType] = useState(ALERT_TYPES.PRICE_ABOVE)

  // Form management
  const form = useForm({
    initialValues: {
      title: '',
      symbol: 'bitcoin',
      type: ALERT_TYPES.PRICE_ABOVE,
      targetValue: '',
      notes: '',
      enabled: true
    },
    validate: {
      title: (value) => (value.length < 2 ? 'Title must be at least 2 characters' : null),
      targetValue: (value) => {
        if (!value || value <= 0) return 'Target value must be greater than 0'
        return null
      }
    }
  })

  // Initialize form when modal opens or editing
  useEffect(() => {
    if (isAlertModalOpen) {
      if (selectedAlert) {
        // Editing existing alert
        form.setValues({
          title: selectedAlert.title,
          symbol: selectedAlert.symbol,
          type: selectedAlert.type,
          targetValue: selectedAlert.targetValue,
          notes: selectedAlert.notes || '',
          enabled: selectedAlert.status === 'active'
        })
        setSelectedType(selectedAlert.type)
      } else {
        // Creating new alert with prefill data
        form.setValues({
          title: '',
          symbol: modalPrefillData.symbol || 'bitcoin',
          type: modalPrefillData.type || ALERT_TYPES.PRICE_ABOVE,
          targetValue: modalPrefillData.targetValue || '',
          notes: '',
          enabled: true
        })
        setSelectedType(modalPrefillData.type || ALERT_TYPES.PRICE_ABOVE)
      }
    }
  }, [isAlertModalOpen, selectedAlert, modalPrefillData])

  // Handle type selection
  const handleTypeSelect = (type) => {
    setSelectedType(type)
    form.setFieldValue('type', type)
  }

  // Get current price for context
  const getCurrentPrice = (symbol) => {
    const data = cryptoData[symbol]
    return data?.close || data?.price || 0
  }

  // Handle form submission
  const handleSubmit = (values) => {
    try {
      const alertData = {
        ...values,
        targetValue: parseFloat(values.targetValue),
        symbol: values.symbol.toLowerCase()
      }

      if (selectedAlert) {
        // Update existing alert
        updateAlert(selectedAlert.id, alertData)
        addNotification({
          type: 'success',
          title: 'Alert Updated',
          message: `${values.title} has been updated successfully`
        })
      } else {
        // Create new alert
        const newAlert = createAlert(alertData)
        addNotification({
          type: 'success',
          title: 'Alert Created',
          message: `${values.title} is now active and monitoring ${values.symbol.toUpperCase()}`
        })
      }

      closeAlertModal()
      form.reset()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Alert Error',
        message: 'Failed to save alert. Please try again.'
      })
    }
  }

  const selectedConfig = ALERT_TYPE_CONFIGS[selectedType]
  const SelectedIcon = selectedConfig.icon
  const currentPrice = getCurrentPrice(form.values.symbol)

  return (
    <Modal
      opened={isAlertModalOpen}
      onClose={closeAlertModal}
      title={
        <Group gap="sm">
          <IconBell size={20} color="var(--mantine-color-bitcoin-6)" />
          <Text fw={600}>
            {selectedAlert ? 'Edit Alert' : 'Create New Alert'}
          </Text>
        </Group>
      }
      size="lg"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Current Price Context */}
          {currentPrice > 0 && (
            <Alert 
              icon={<IconInfoCircle size={16} />} 
              color="blue" 
              variant="light"
            >
              <Text size="sm">
                Current {form.values.symbol.toUpperCase()} price: 
                <Text component="span" fw={600} ml={4}>
                  ${currentPrice.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Text>
              </Text>
            </Alert>
          )}

          {/* Alert Title - Enhanced for testing */}
          <TextInput
            label="Alert Title"
            placeholder="E.g., Bitcoin hits $120K"
            data-testid="alert-title-input"
            id="alert-title"
            {...form.getInputProps('title')}
            required
          />

          {/* Symbol Selection */}
          <Select
            label="Cryptocurrency"
            data={[
              { value: 'bitcoin', label: 'Bitcoin (BTC)' },
              { value: 'ethereum', label: 'Ethereum (ETH)' }
            ]}
            data-testid="alert-symbol-select"
            {...form.getInputProps('symbol')}
            required
          />

          {/* Alert Type Selection */}
          <Box>
            <Text size="sm" fw={500} mb="xs">Alert Type</Text>
            <Group gap="xs">
              {Object.entries(ALERT_TYPE_CONFIGS).map(([type, config]) => {
                const Icon = config.icon
                const isSelected = selectedType === type
                
                return (
                  <Card
                    key={type}
                    p="sm"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected 
                        ? 'rgba(247, 147, 26, 0.1)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      borderColor: isSelected 
                        ? 'var(--mantine-color-bitcoin-6)' 
                        : 'rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={() => handleTypeSelect(type)}
                    data-testid={`alert-type-${type}`}
                  >
                    <Group gap="xs" justify="center">
                      <Icon 
                        size={16} 
                        color={isSelected ? 'var(--mantine-color-bitcoin-6)' : '#C1C2C5'} 
                      />
                      <Text 
                        size="xs" 
                        fw={isSelected ? 600 : 400}
                        c={isSelected ? 'bitcoin' : 'dimmed'}
                      >
                        {config.label}
                      </Text>
                    </Group>
                  </Card>
                )
              })}
            </Group>
            <Text size="xs" c="dimmed" mt={4}>
              {selectedConfig.description}
            </Text>
          </Box>

          {/* Target Value - Enhanced for testing */}
          <NumberInput
            label={`Target ${selectedConfig.label}`}
            placeholder={selectedConfig.placeholder}
            leftSection={selectedConfig.unit}
            min={0}
            step={selectedType === ALERT_TYPES.PERCENT_CHANGE ? 0.1 : 1}
            decimalScale={selectedType === ALERT_TYPES.PERCENT_CHANGE ? 2 : 2}
            data-testid="alert-target-input"
            id="alert-target-value"
            {...form.getInputProps('targetValue')}
            required
          />

          {/* Notes */}
          <Textarea
            label="Notes (Optional)"
            placeholder="Additional context for this alert..."
            minRows={2}
            maxRows={4}
            data-testid="alert-notes-input"
            {...form.getInputProps('notes')}
          />

          <Divider />

          {/* Alert Settings */}
          <Group justify="space-between">
            <Box>
              <Text size="sm" fw={500}>Enable Alert</Text>
              <Text size="xs" c="dimmed">
                Alert will be active immediately after creation
              </Text>
            </Box>
            <Switch
              size="md"
              color="bitcoin"
              data-testid="alert-enabled-switch"
              {...form.getInputProps('enabled', { type: 'checkbox' })}
            />
          </Group>

          {/* Action Buttons */}
          <Group justify="flex-end" gap="sm" mt="md">
            <Button 
              variant="light" 
              color="gray"
              leftSection={<IconX size={16} />}
              onClick={closeAlertModal}
              data-testid="alert-cancel-button"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              color="bitcoin"
              leftSection={<IconCheck size={16} />}
              data-testid="alert-submit-button"
            >
              {selectedAlert ? 'Update Alert' : 'Create Alert'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default AlertModal
