/**
 * WP12 Site Photo Report – team register (Google Sheet)
 * 1. Open the Google Sheet > Extensions > Apps Script, delete what is there, paste this whole file.
 * 2. Change TEAM_KEY below to your own pass phrase (give it only to the team).
 * 3. Deploy > New deployment > Select type: Web app > Execute as: Me > Who has access: Anyone > Deploy.
 * 4. Copy the Web app URL into the app: Setup > Team register > Web app link, and type the same team key.
 * The sheet gets four tabs: Reports, Photos, RFIs and Log. Re-sending a report replaces its old rows.
 */
const TEAM_KEY = 'CHANGE-ME';
const PREFIX = 'JKR-RFI-WP12-';
const HEAD = {
  Reports: ['Report ID', 'Date', 'Team', 'Reported by', 'Designation', 'Zone', 'Weather AM', 'Weather PM', 'Photos', 'Activities', 'CH from', 'CH to', 'RFIs', 'Logged (app)', 'Received'],
  Photos: ['Report ID', 'Date', 'Team', 'Reported by', 'No', 'Time', 'Activity (EN)', 'Activity (BM)', 'BQ ref', 'Structure', 'Element', 'CH from', 'CH to', 'Side', 'RFI', 'Remarks', 'GPS lat', 'GPS lon', 'GPS CH', 'File'],
  RFIs: ['RFI Reference No.', 'Inspection Date', 'Time of Inspection', 'Description', 'Location', 'PIC', 'Team', 'Photos', 'Stage', 'Result', 'Report ID'],
  Log: ['Received', 'Type', 'From', 'Note']
};
const RESULT = { a: 'Approved', b: 'Not approved - rectify', c: 'Rejected' };

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const who = (data.report && data.report.name) || data.from || '';
    if (data.key !== TEAM_KEY) { sheet_(ss, 'Log').appendRow([new Date(), 'rejected: wrong team key', safe_(who), '']); return out_({ ok: false }); }
    if (data.test) { sheet_(ss, 'Log').appendRow([new Date(), 'test', safe_(who), safe_(data.app || '')]); return out_({ ok: true }); }
    const r = data.report, rid = String(r.rid);
    ['Reports', 'Photos', 'RFIs'].forEach(n => removeRid_(sheet_(ss, n), rid));
    const ps = r.photos || [], ch = chRange_(ps);
    append_(sheet_(ss, 'Reports'), [[rid, r.date, r.team, r.name, r.desig, r.zone, r.wxAM, r.wxPM, ps.length,
      unique_(ps.map(p => p.actEN)).join('; '), ch[0], ch[1], Object.keys(r.rfis || {}).map(c => PREFIX + c).join('; '), r.logged, new Date()]]);
    append_(sheet_(ss, 'Photos'), ps.map(p => [rid, r.date, r.team, r.name, p.no, p.time, p.actEN, p.actBM, p.bq, p.struct, p.el, p.ch, p.ch2, p.side,
      p.rfi ? PREFIX + p.rfi : '', p.rem, p.lat, p.lon, p.gch, p.file]));
    append_(sheet_(ss, 'RFIs'), Object.keys(r.rfis || {}).map(c => {
      const x = r.rfis[c];
      return [PREFIX + c, r.date, x.t1 + (x.t2 && x.t2 !== x.t1 ? ' - ' + x.t2 : ''), x.desc, x.loc, r.name, r.team, x.n, x.stage === '2' ? 'Follow-up' : 'Inspection', RESULT[x.result] || '', rid];
    }));
    sheet_(ss, 'Log').appendRow([new Date(), 'report', safe_(who), rid]);
    return out_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
function doGet() { return out_({ ok: true, app: 'WP12 SDR team register' }); }

function sheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, HEAD[name].length).setValues([HEAD[name]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}
function removeRid_(sh, rid) {
  const col = HEAD[sh.getName()].indexOf('Report ID') + 1, n = sh.getLastRow();
  if (n < 2) return;
  const vals = sh.getRange(2, col, n - 1, 1).getValues();
  for (let i = vals.length - 1; i >= 0; i--) if (String(vals[i][0]) === rid) sh.deleteRow(i + 2);
}
function append_(sh, rows) {
  if (!rows.length) return;
  const clean = rows.map(r => r.map(safe_));
  sh.getRange(sh.getLastRow() + 1, 1, clean.length, clean[0].length).setValues(clean);
}
function safe_(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date || typeof v === 'number') return v;
  const s = String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function unique_(a) { return a.filter((x, i) => x && a.indexOf(x) === i); }
function chRange_(ps) {
  const v = [];
  ps.forEach(p => [p.ch, p.ch2].forEach(c => { const m = String(c || '').match(/^(\d+)\+(\d+)/); if (m) v.push(+m[1] * 1000 + +m[2]); }));
  if (!v.length) return ['', ''];
  const f = x => Math.floor(x / 1000) + '+' + String(x % 1000).padStart(3, '0');
  return [f(Math.min.apply(null, v)), f(Math.max.apply(null, v))];
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
