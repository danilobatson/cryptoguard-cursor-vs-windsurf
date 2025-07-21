/**
 * Alert Management API Routes
 * Handles alert configuration, history, and management
 */

export async function handleAlertsRequest(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/alerts', '');
  const method = request.method;

  try {
    // GET /api/alerts - List all alerts
    if (method === 'GET' && path === '') {
      const alerts = await getAlertsFromStorage(env);
      return new Response(JSON.stringify({
        success: true,
        data: alerts,
        count: alerts.length,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // POST /api/alerts - Create new alert
    if (method === 'POST' && path === '') {
      const alertData = await request.json();
      const alert = await createAlert(alertData, env);
      return new Response(JSON.stringify({
        success: true,
        data: alert,
        message: 'Alert created successfully'
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET /api/alerts/:id - Get specific alert
    const alertIdMatch = path.match(/^\/([^\/]+)$/);
    if (method === 'GET' && alertIdMatch) {
      const alertId = alertIdMatch[1];
      const alert = await getAlert(alertId, env);
      
      if (!alert) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Alert not found',
          code: 'ALERT_NOT_FOUND'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        data: alert
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // PUT /api/alerts/:id - Update alert
    if (method === 'PUT' && alertIdMatch) {
      const alertId = alertIdMatch[1];
      const updateData = await request.json();
      const alert = await updateAlert(alertId, updateData, env);
      
      return new Response(JSON.stringify({
        success: true,
        data: alert,
        message: 'Alert updated successfully'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // DELETE /api/alerts/:id - Delete alert
    if (method === 'DELETE' && alertIdMatch) {
      const alertId = alertIdMatch[1];
      await deleteAlert(alertId, env);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Alert deleted successfully'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // GET /api/alerts/history/:id - Alert history
    const historyMatch = path.match(/^\/history\/([^\/]+)$/);
    if (method === 'GET' && historyMatch) {
      const alertId = historyMatch[1];
      const history = await getAlertHistory(alertId, env);
      
      return new Response(JSON.stringify({
        success: true,
        data: history,
        count: history.length
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Method not allowed
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Alerts API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Helper functions
async function getAlertsFromStorage(env) {
  try {
    const alertsData = await env.CRYPTO_CACHE.get('user_alerts');
    return alertsData ? JSON.parse(alertsData) : [];
  } catch (error) {
    console.error('Error getting alerts from storage:', error);
    return [];
  }
}

async function createAlert(alertData, env) {
  // Validate alert data
  const alert = {
    id: generateAlertId(),
    symbol: alertData.symbol?.toUpperCase(),
    type: alertData.type, // 'price_above', 'price_below', 'sentiment_change'
    threshold: alertData.threshold,
    enabled: true,
    created_at: new Date().toISOString(),
    last_triggered: null,
    trigger_count: 0
  };

  // Validation
  if (!alert.symbol || !alert.type || !alert.threshold) {
    throw new Error('Missing required fields');
  }

  // Save to storage
  const alerts = await getAlertsFromStorage(env);
  alerts.push(alert);
  await env.CRYPTO_CACHE.put('user_alerts', JSON.stringify(alerts), { expirationTtl: 86400 * 30 }); // 30 days

  return alert;
}

async function getAlert(alertId, env) {
  const alerts = await getAlertsFromStorage(env);
  return alerts.find(alert => alert.id === alertId);
}

async function updateAlert(alertId, updateData, env) {
  const alerts = await getAlertsFromStorage(env);
  const alertIndex = alerts.findIndex(alert => alert.id === alertId);
  
  if (alertIndex === -1) {
    throw new Error('Alert not found');
  }

  alerts[alertIndex] = { ...alerts[alertIndex], ...updateData, updated_at: new Date().toISOString() };
  await env.CRYPTO_CACHE.put('user_alerts', JSON.stringify(alerts), { expirationTtl: 86400 * 30 });
  
  return alerts[alertIndex];
}

async function deleteAlert(alertId, env) {
  const alerts = await getAlertsFromStorage(env);
  const filteredAlerts = alerts.filter(alert => alert.id !== alertId);
  await env.CRYPTO_CACHE.put('user_alerts', JSON.stringify(filteredAlerts), { expirationTtl: 86400 * 30 });
}

async function getAlertHistory(alertId, env) {
  try {
    const historyData = await env.CRYPTO_CACHE.get(`alert_history_${alertId}`);
    return historyData ? JSON.parse(historyData) : [];
  } catch (error) {
    console.error('Error getting alert history:', error);
    return [];
  }
}

function generateAlertId() {
  return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
