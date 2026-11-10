'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SECTIONS, emptyState, buildNote, toggleChoice, demoState } = require('../app.js');
const options = require('../template-options.json');
test('treatment details only render beside their selected phrases', () => {
  const state = emptyState();
  const [selected, unselected] = options.TxSpecifics;
  state.TxSpecifics = [selected];
  state.treatmentDetails.TxSpecifics[selected] = '  Synthetic selected detail  ';
  state.treatmentDetails.TxSpecifics[unselected] = 'Synthetic inactive detail';
  const note = buildNote(state);
  assert.ok(note.includes(`${selected} | Synthetic selected detail`));
  assert.ok(!note.includes('Synthetic inactive detail'));
});
test('preview edit guard detects manual changes including deleting generated text', () => {
  const {needsDiscardConfirmation} = require('../app.js'); const s = demoState(options);
  assert.equal(needsDiscardConfirmation(s,buildNote(s)),false);
  assert.equal(needsDiscardConfirmation(s,'Final clinician wording'),true);
  assert.equal(needsDiscardConfirmation(s,''),true);
});
test('blank draft asserts no findings or consent', () => assert.equal(buildNote(emptyState()), ''));
test('all rendered choice fields have extracted options', () => {
  for (const [,fields] of SECTIONS) for (const [key,,kind] of fields) if (kind !== 'text') assert.ok(Array.isArray(options[key]) && options[key].length);
});
test('multi-selection toggles without duplicates and single selections deselect', () => {
  let s = toggleChoice(emptyState(),'Dx','No Decay',true);
  assert.deepEqual(s.Dx,['No Decay']); s = toggleChoice(s,'Dx','No Decay',true); assert.deepEqual(s.Dx,[]);
  s = toggleChoice(s,'ASA','ASA: II',false); assert.equal(s.ASA,'ASA: II');
  assert.equal(toggleChoice(s,'ASA','ASA: II',false).ASA,'');
});
test('foster companion formatting and alone choice remain exclusive', () => {
  let s = toggleChoice(emptyState(),'Accompanied','Parent',true);
  s = toggleChoice(s,'Accompanied','Foster',true); assert.match(buildNote(s),/Foster Parent/);
  s = toggleChoice(s,'Accompanied','none - Patient alone',true); assert.deepEqual(s.Accompanied,['none - Patient alone']);
});
test('free text is preserved as text and no boilerplate consent is invented', () => {
  const s = {...emptyState(), Info_Tx:'Discussed <example> & alternatives.', Dx:['No Decay']};
  const note = buildNote(s); assert.match(note,/Discussed <example> & alternatives\./); assert.doesNotMatch(note,/appeared to understand|exam performed/);
});
test('demo identifies itself as synthetic and selections exist', () => {
  const s = demoState(options); assert.match(buildNote(s),/SYNTHETIC EXAMPLE/);
  for (const [,fields] of SECTIONS) for (const [key,,kind] of fields) if (kind !== 'text' && s[key].length) for (const value of kind === true ? s[key] : [s[key]]) assert.ok(options[key].includes(value));
});
test('served file allowlist rejects hidden and traversal paths', async () => {
  const server = require('../server.cjs'); await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const route of ['/', '/app.js','/styles.css','/template-options.json']) assert.equal((await fetch(origin+route)).status,200);
    for (const route of ['/.env','/README.md','/%2e%2e/package.json']) assert.equal((await fetch(origin+route)).status,404);
    assert.match((await fetch(origin)).headers.get('content-security-policy'),/connect-src 'self'/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
