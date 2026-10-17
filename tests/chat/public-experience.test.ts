import { test } from 'node:test';
import assert from 'node:assert/strict';
import corpus from '../../knowledge/approved/portfolio.json';
import { experienceEntries } from '../../src/data/experience';
import { withWebsiteExperience } from '../../server/chat/public-experience';
import { entries, versionForEntries } from '../../server/chat/knowledge';
import { providerBody, reservation } from '../../server/chat/provider';
import { MAX_INPUT_BYTES } from '../../server/chat/config';

test('published SafeTrase details reach the actual model context with experience citations', () => {
  const body = providerBody('What Android testing, cloud deployment and SEO work has Dexter done?', entries, [], 'gpt-5.4');
  const packet = JSON.parse(body.input[0].content);
  const text = packet.approved_records.map((entry: any) => entry.summary).join(' ');
  for (const term of ['DigitalOcean', 'Docker', 'PostGIS', 'Geoapify', 'Firebase App Distribution', 'ADB', 'native map crash', 'Google Search Console', 'Google Analytics 4']) {
    assert.ok(text.includes(term), `Missing public evidence: ${term}`);
  }
  assert.ok(reservation(body) > 0);
  const android = entries.find(entry => entry.id === 'safetrase-android')!;
  assert.equal(android.reviewed, '2026-10-17');
  assert.equal(android.links[0].url, 'https://dexter-developer.dev/experience#safetrase');
});

test('editing public bullets changes model evidence and the conversation knowledge version', async () => {
  const changed = structuredClone(experienceEntries);
  const role = changed.find(entry => entry.id === 'safetrase')!;
  role.groups![0].bullets.push('Public regression fixture: added offline synchronisation testing.');
  const next = withWebsiteExperience(corpus.entries, changed);
  const packet = JSON.parse(providerBody('What did Dexter build?', next, [], 'gpt-5.4').input[0].content);
  assert.match(packet.approved_records.find((entry: any) => entry.id === 'safetrase-app').summary, /added offline synchronisation testing/);
  assert.notEqual(await versionForEntries(next), await versionForEntries(entries));
  assert.deepEqual(next.find(entry => entry.id === 'delvify'), corpus.entries.find(entry => entry.id === 'delvify'));
});

test('expanded evidence leaves room for maximum UTF-8 input and keeps historical warnings', () => {
  const body = providerBody('字'.repeat(2000), entries, [], 'gpt-5.4');
  assert.ok(reservation(body) > 0);
  assert.ok(new TextEncoder().encode(JSON.stringify(body)).byteLength + 2048 <= MAX_INPUT_BYTES);
  const old = {...entries[0], reviewed: '2020-01-01'};
  const packet = JSON.parse(providerBody('What is current?', [old], [], 'gpt-5.4').input[0].content);
  assert.match(packet.knowledge_status, /not live feeds/);
  assert.match(packet.approved_records[0].currentStatus, /Historical/);
});

test('new public groups are included and removed groups cannot retain stale generated evidence', () => {
  const changed = structuredClone(experienceEntries);
  const role = changed.find(entry => entry.id === 'safetrase')!;
  role.groups!.push({title: 'Accessibility', bullets: ['Reviewed keyboard navigation.']});
  assert.match(withWebsiteExperience(corpus.entries, changed).find(entry => entry.id === 'safetrase-accessibility')!.summary, /keyboard navigation/);
  role.groups!.pop();
  assert.ok(!withWebsiteExperience(corpus.entries, changed).some(entry => entry.id === 'safetrase-accessibility'));
  role.reviewed = undefined;
  assert.throws(() => withWebsiteExperience(corpus.entries, changed), /review date/);
});
