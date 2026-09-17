var CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

var ICAL_RE = /^https:\/\/calendar\.google\.com\/calendar\/ical\/([^/?]+)\/public\/basic\.ics(\?.*)?$/i;
var GENERIC_SUMMARY = /^(busy|바쁨|\(제목 없음\)|\(no title\))$/i;
var STATUS_WORD = /^(일정|작업중|수정|완료|휴무|휴일|마감)$/;

var GOOGLE_EVENT_COLORS = {
  '1': '#a4bdfc', '2': '#7ae7bf', '3': '#dbadff', '4': '#ff887c',
  '5': '#fbd75b', '6': '#ffb878', '7': '#46d6db', '8': '#e1e1e1',
  '9': '#5484ed', '10': '#51b749', '11': '#dc2127'
};

var GOOGLE_CALENDAR_COLORS = {
  '1': '#ac725e', '2': '#d06b64', '3': '#f83a22', '4': '#fa573c',
  '5': '#ff7537', '6': '#ffad46', '7': '#42d692', '8': '#16a765',
  '9': '#7bd148', '10': '#b3dc6c', '11': '#fbe983', '12': '#fad165',
  '13': '#92e1c0', '14': '#9fe1e7', '15': '#9fc6e7', '16': '#4986e7',
  '17': '#9a9cff', '18': '#b99aff', '19': '#c2c2c2', '20': '#cabdbf',
  '21': '#cca6ac', '22': '#f691b2', '23': '#cd74e6', '24': '#a47ae2'
};

function unfoldIcs(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '');
}

function unescapeIcsText(text) {
  return String(text || '')
    .replace(/\\n/g, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function parseIcsDateTime(raw) {
  var s = String(raw || '').trim();
  var m = s.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?(Z)?$/);
  if (!m) return null;

  var y = parseInt(m[1], 10);
  var mo = parseInt(m[2], 10);
  var d = parseInt(m[3], 10);
  if (!m[4]) {
    return { dateKey: y + '-' + mo + '-' + d, hasTime: false, iso: null };
  }

  var hh = parseInt(m[4], 10);
  var mm = parseInt(m[5], 10);
  var ss = parseInt(m[6], 10);
  var iso;
  if (m[7] === 'Z') {
    iso = new Date(Date.UTC(y, mo - 1, d, hh, mm, ss)).toISOString();
    var kst = new Date(Date.UTC(y, mo - 1, d, hh, mm, ss) + 9 * 3600000);
    y = kst.getUTCFullYear();
    mo = kst.getUTCMonth() + 1;
    d = kst.getUTCDate();
  } else {
    iso = new Date(y, mo - 1, d, hh, mm, ss).toISOString();
  }

  return { dateKey: y + '-' + mo + '-' + d, hasTime: true, iso: iso };
}

function shiftDateKey(dateKey, days) {
  var p = dateKey.split('-');
  var dt = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  dt.setDate(dt.getDate() + days);
  return dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate();
}

function readIcsField(block, name) {
  var re = new RegExp('^' + name + '(?:;[^:]*)?:(.+)$', 'm');
  var m = block.match(re);
  return m ? m[1].trim() : '';
}

function readIcsColor(block) {
  var raw = readIcsField(block, 'COLOR') || readIcsField(block, 'X-GOOGLE-CALENDAR-CONTENT-COLOR');
  if (!raw) return '';
  raw = unescapeIcsText(raw);
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return '#' + raw.toLowerCase();
  return '';
}

function statusFromSummary(summary) {
  var s = unescapeIcsText(summary);
  if (!s || GENERIC_SUMMARY.test(s)) return '일정';
  if (STATUS_WORD.test(s)) return s === '휴일' ? '휴무' : s;
  return '일정';
}

function displayTitleFromSummary(summary) {
  var title = unescapeIcsText(summary);
  if (!title || GENERIC_SUMMARY.test(title)) return '';
  return title.slice(0, 48);
}

function buildEventNote(summary, description) {
  var title = displayTitleFromSummary(summary);
  if (title) return title;
  var desc = unescapeIcsText(description);
  if (desc && !GENERIC_SUMMARY.test(desc)) return desc.slice(0, 48);
  return '';
}

function calendarIdFromIcalUrl(url) {
  var m = String(url || '').match(ICAL_RE);
  return m ? decodeURIComponent(m[1]) : '';
}

function icsToEvents(text) {
  var body = unfoldIcs(text);
  var events = [];
  var chunks = body.split('BEGIN:VEVENT');

  for (var i = 1; i < chunks.length; i++) {
    var block = chunks[i].split('END:VEVENT')[0];
    var startRaw = readIcsField(block, 'DTSTART');
    var endRaw = readIcsField(block, 'DTEND');
    var summary = readIcsField(block, 'SUMMARY');
    var description = readIcsField(block, 'DESCRIPTION');
    var uid = readIcsField(block, 'UID');
    var start = parseIcsDateTime(startRaw);
    if (!start) continue;

    var end = parseIcsDateTime(endRaw);
    var datePart = start.dateKey;
    if (end && end.dateKey !== start.dateKey) {
      var inclusiveEnd = shiftDateKey(end.dateKey, end.hasTime ? 0 : -1);
      datePart = inclusiveEnd !== start.dateKey ? (start.dateKey + '~' + inclusiveEnd) : start.dateKey;
    }

    events.push({
      datePart: datePart,
      status: statusFromSummary(summary),
      note: buildEventNote(summary, description),
      uid: uid,
      color: readIcsColor(block),
      startIso: start.iso,
      startKey: start.dateKey
    });
  }

  return events;
}

function eventToLine(event) {
  var line = event.note
    ? (event.datePart + ' ' + event.status + ' ' + event.note)
    : (event.datePart + ' ' + event.status);
  if (event.color) line += ' #' + event.color.replace('#', '');
  return line;
}

function dateKeyToIsoStart(dateKey) {
  var p = dateKey.split('-');
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10)).toISOString();
}

function dateKeyToIsoEnd(dateKey) {
  var p = dateKey.split('-');
  var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

function apiItemStartKey(item) {
  if (!item || !item.start) return '';
  if (item.start.date) {
    var p = item.start.date.split('-');
    return parseInt(p[0], 10) + '-' + parseInt(p[1], 10) + '-' + parseInt(p[2], 10);
  }
  if (item.start.dateTime) {
    var d = new Date(item.start.dateTime);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  return '';
}

async function fetchCalendarDefaultColor(calendarId, apiKey) {
  if (!apiKey || !calendarId) return '';
  try {
    var res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(calendarId) + '?key=' + encodeURIComponent(apiKey)
    );
    if (!res.ok) return '';
    var data = await res.json();
    if (data.backgroundColor) return String(data.backgroundColor).toLowerCase();
    if (data.colorId && GOOGLE_CALENDAR_COLORS[data.colorId]) return GOOGLE_CALENDAR_COLORS[data.colorId];
  } catch (e) {}
  return '';
}

async function fetchGoogleEventMeta(calendarId, events, apiKey) {
  if (!apiKey || !calendarId || !events.length) {
    return { byUid: {}, byDate: {}, defaultColor: '' };
  }

  var minKey = events[0].datePart.split('~')[0];
  var maxKey = events[events.length - 1].datePart.split('~').pop();
  events.forEach(function(ev) {
    var startKey = ev.datePart.split('~')[0];
    var endKey = ev.datePart.split('~').pop();
    if (startKey < minKey) minKey = startKey;
    if (endKey > maxKey) maxKey = endKey;
  });

  var timeMin = dateKeyToIsoStart(minKey);
  var timeMax = dateKeyToIsoEnd(maxKey);
  var byUid = {};
  var byDate = {};
  var defaultColor = await fetchCalendarDefaultColor(calendarId, apiKey);

  try {
    var apiUrl = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(calendarId) + '/events'
      + '?key=' + encodeURIComponent(apiKey)
      + '&singleEvents=true&orderBy=startTime'
      + '&timeMin=' + encodeURIComponent(timeMin)
      + '&timeMax=' + encodeURIComponent(timeMax)
      + '&maxResults=250';
    var res = await fetch(apiUrl);
    if (!res.ok) return { byUid: byUid, byDate: byDate, defaultColor: defaultColor };
    var data = await res.json();
    (data.items || []).forEach(function(item) {
      var title = displayTitleFromSummary(item.summary || '');
      var hex = item.colorId && GOOGLE_EVENT_COLORS[item.colorId]
        ? GOOGLE_EVENT_COLORS[item.colorId]
        : defaultColor;
      var meta = { title: title, color: hex || '' };
      var startKey = apiItemStartKey(item);
      googleUidKeys(item.iCalUID || '').forEach(function(key) { byUid[key] = meta; });
      if (item.id) {
        byUid[item.id] = meta;
        googleUidKeys(item.id).forEach(function(key) { byUid[key] = meta; });
      }
      if (startKey) byDate[startKey] = meta;
    });
  } catch (e) {}

  return { byUid: byUid, byDate: byDate, defaultColor: defaultColor };
}

function googleUidKeys(uid) {
  var keys = [];
  var u = String(uid || '').trim();
  if (!u) return keys;
  keys.push(u);
  var base = u.split('@')[0];
  if (base && base !== u) keys.push(base);
  return keys;
}

async function enrichEventsWithGoogle(events, calendarId) {
  var apiKey = process.env.GOOGLE_CALENDAR_API_KEY || '';
  var envDefault = process.env.CALENDAR_DEFAULT_COLOR || '';
  var meta = await fetchGoogleEventMeta(calendarId, events, apiKey);
  var fallbackColor = meta.defaultColor || envDefault;

  events.forEach(function(ev) {
    var picked = null;
    if (ev.uid) {
      googleUidKeys(ev.uid).some(function(key) {
        if (meta.byUid[key]) {
          picked = meta.byUid[key];
          return true;
        }
        return false;
      });
    }
    if (!picked && ev.startKey && meta.byDate[ev.startKey]) picked = meta.byDate[ev.startKey];

    if (picked) {
      if (picked.title) ev.note = picked.title;
      if (picked.color && !ev.color) ev.color = picked.color;
    }

    if (!ev.color && fallbackColor) ev.color = fallbackColor;
  });

  return events;
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  var url = process.env.CALENDAR_ICAL_URL
    || (event.queryStringParameters && event.queryStringParameters.url)
    || '';
  if (!url || !ICAL_RE.test(url)) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({
        error: 'invalid_calendar_url',
        message: 'Google Calendar iCal 공개 주소(public/basic.ics)가 필요합니다.'
      })
    };
  }

  try {
    var res = await fetch(url, { headers: { Accept: 'text/calendar' } });
    if (!res.ok) {
      return {
        statusCode: 502,
        headers: CORS,
        body: JSON.stringify({ error: 'fetch_failed', status: res.status })
      };
    }
    var text = await res.text();
    var calendarId = calendarIdFromIcalUrl(url);
    var events = icsToEvents(text);
    await enrichEventsWithGoogle(events, calendarId);
    var lines = events.map(eventToLine);
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        lines: lines,
        events: events.map(function(ev) {
          return {
            datePart: ev.datePart,
            status: ev.status,
            title: ev.note || '',
            note: ev.note || '',
            color: ev.color || ''
          };
        }),
        source: 'google-calendar-ical',
        calendarId: calendarId,
        hasApiKey: !!process.env.GOOGLE_CALENDAR_API_KEY,
        titlesHidden: events.length > 0 && events.every(function(ev) { return !ev.note; })
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err && err.message ? err.message : 'server error' })
    };
  }
};
