const { getStore } = require('@netlify/blobs');

var DEFAULT_LINES = [
  '2026-07-10~2026-07-11 작업중',
  '2026-07-15~2026-07-18 수정',
  '2026-07-20 완료',
  '2026-07-25~2026-07-30 작업중'
];

var CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  var store = getStore('work-schedule');

  try {
    if (event.httpMethod === 'GET') {
      var data = await store.get('data', { type: 'json' });
      if (!data) {
        data = { lines: DEFAULT_LINES.slice(), initialized: true };
        await store.setJSON('data', data);
      } else if (!Array.isArray(data.lines)) {
        data.lines = data.initialized ? [] : DEFAULT_LINES.slice();
        if (!data.initialized) data.initialized = true;
        await store.setJSON('data', data);
      }
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ lines: data.lines }) };
    }

    if (event.httpMethod === 'POST') {
      var body = JSON.parse(event.body || '{}');
      var expectedPin = process.env.WORK_SCHEDULE_ADMIN_PIN || '';
      if (!expectedPin) {
        return {
          statusCode: 503,
          headers: CORS,
          body: JSON.stringify({ error: 'WORK_SCHEDULE_ADMIN_PIN not configured' })
        };
      }
      if ((body.adminPin || '') !== expectedPin) {
        return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'unauthorized' }) };
      }
      var lines = Array.isArray(body.lines) ? body.lines.filter(function(l) { return typeof l === 'string'; }) : [];
      var payload = { lines: lines, initialized: true };
      await store.setJSON('data', payload);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, lines: lines }) };
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
