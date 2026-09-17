const { getStore } = require('@netlify/blobs');

var DEFAULT_SLOTS = ['busy', 'available', 'available'];

var CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

function normalizeKey(raw) {
  var key = String(raw || 'default').trim().toLowerCase();
  if (!/^[a-z0-9_-]{1,64}$/.test(key)) return 'default';
  return key;
}

function normalizeSlots(list, fallbackCount) {
  if (!Array.isArray(list)) return DEFAULT_SLOTS.slice();
  var slots = list.map(function(state) {
    return state === 'busy' ? 'busy' : 'available';
  });
  if (!slots.length) return DEFAULT_SLOTS.slice();
  return slots;
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  var store = getStore('slot-status');

  try {
    if (event.httpMethod === 'GET') {
      var getKey = normalizeKey(event.queryStringParameters && event.queryStringParameters.key);
      var blobKey = 'slot-' + getKey;
      var data = await store.get(blobKey, { type: 'json' });
      if (!data) {
        data = { slots: DEFAULT_SLOTS.slice(), initialized: true };
        await store.setJSON(blobKey, data);
      } else if (!Array.isArray(data.slots)) {
        data.slots = data.initialized ? DEFAULT_SLOTS.slice() : DEFAULT_SLOTS.slice();
        if (!data.initialized) data.initialized = true;
        await store.setJSON(blobKey, data);
      }
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ key: getKey, slots: data.slots })
      };
    }

    if (event.httpMethod === 'POST') {
      var body = JSON.parse(event.body || '{}');
      var postKey = normalizeKey(body.key);
      var blobPostKey = 'slot-' + postKey;
      var expectedPin = process.env.SLOT_ADMIN_PIN || '';
      if (!expectedPin) {
        return {
          statusCode: 503,
          headers: CORS,
          body: JSON.stringify({ error: 'SLOT_ADMIN_PIN not configured' })
        };
      }
      if ((body.adminPin || '') !== expectedPin) {
        return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'unauthorized' }) };
      }
      var slots = normalizeSlots(body.slots);
      var payload = { slots: slots, initialized: true, updatedAt: Date.now() };
      await store.setJSON(blobPostKey, payload);
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ ok: true, key: postKey, slots: slots })
      };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'method not allowed' }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err && err.message ? err.message : 'server error' })
    };
  }
};
