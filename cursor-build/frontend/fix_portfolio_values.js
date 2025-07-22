// Replace the hardcoded $0.00 Portfolio Value in Quick Stats Row
// Find this section in DashboardGrid.jsx around line 180-190:

// BEFORE (hardcoded):
<Card withBorder style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', textAlign: 'center' }}>
  <Text size="xs" c="dimmed">Portfolio Value</Text>
  <Text size="lg" fw={700} c="green">$0.00</Text>
  <Text size="xs" c="dimmed">+0.00% (24h)</Text>
</Card>

// AFTER (dynamic calculation):
<Card withBorder style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', textAlign: 'center' }}>
  <Text size="xs" c="dimmed">Portfolio Value</Text>
  <Text size="lg" fw={700} c="green">
    {((cryptoData?.bitcoin?.close || 0) + (cryptoData?.ethereum?.close || 0)).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}
  </Text>
  <Text size="xs" c="dimmed">
    {(((cryptoData?.bitcoin?.percent_change_24h || 0) + (cryptoData?.ethereum?.percent_change_24h || 0)) / 2).toFixed(2)}% (24h)
  </Text>
</Card>
