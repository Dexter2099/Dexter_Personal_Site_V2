import {test} from 'node:test';
import assert from 'node:assert/strict';
import corpus from '../../knowledge/approved/portfolio.json';
import {experienceEntries} from '../../src/data/experience';
import {projects} from '../../src/data/projects';
import {siteCopy} from '../../src/data/site-copy';
import {withWebsiteContent} from '../../server/chat/public-experience';
import {versionForEntries} from '../../server/chat/knowledge';
import {providerBody, reservation} from '../../server/chat/provider';

test('other role, project and profile edits change the actual model context and knowledge version', async () => {
  const roles = structuredClone(experienceEntries), cards = structuredClone(projects), copy = structuredClone(siteCopy);
  roles.find(role => role.id === 'delvify')!.bullets!.push('Public fixture: improved queue observability.');
  cards.find(card => card.id === 'job-tracker')!.description = 'Public fixture: a revised application dashboard.';
  copy.about.goal = 'Public fixture: focus on accessible software.';
  copy.contact.introduction = 'Public fixture: consulting enquiries welcome.';
  const records = withWebsiteContent(corpus.entries, roles, cards, copy);
  const packet = JSON.parse(providerBody('What has Dexter done?', records, [], 'gpt-5.4').input[0].content);
  const descriptions = packet.approved_records.map((entry: any) => entry.summary).join(' ');
  for (const text of ['queue observability', 'revised application dashboard', 'accessible software', 'consulting enquiries']) assert.ok(descriptions.includes(text));
  assert.notEqual(await versionForEntries(records), await versionForEntries(withWebsiteContent(corpus.entries)));
});

test('new experience and project items are automatic; removed public-only items disappear', () => {
  const roles = structuredClone(experienceEntries), cards = structuredClone(projects);
  roles.push({title:'Public role fixture',meta:'Example organisation',date:'2026',bullets:['Reviewed contribution.']});
  cards.push({title:'Public project fixture',description:'Reviewed project.',emphasis:'Testing.',techStack:['TypeScript'],videoSrc:'C:/private/video.mp4',videoLabel:'Demo'});
  const added = withWebsiteContent(corpus.entries, roles, cards);
  assert.ok(added.some(entry => entry.id === 'experience-public-role-fixture'));
  assert.ok(added.some(entry => entry.id === 'project-public-project-fixture'));
  assert.doesNotMatch(JSON.stringify(added), /C:\/private|videoSrc|iconPath|logoAlt/);
  roles.pop(); cards.pop();
  assert.ok(!withWebsiteContent(corpus.entries, roles, cards).some(entry => /public-(role|project)-fixture/.test(entry.id)));
});

test('current public descriptions replace stale duplicate facts and preserve explicitly dated supplements', () => {
  const base = structuredClone(corpus.entries);
  base.find(entry => entry.id === 'delvify')!.summary = 'Obsolete Delvify fixture.';
  const records = withWebsiteContent(base);
  assert.doesNotMatch(records.find(entry => entry.id === 'delvify')!.summary, /Obsolete/);
  assert.match(records.find(entry => entry.id === 'kap')!.summary, /Additional evidence reviewed on/);
  assert.match(records.find(entry => entry.id === 'kap')!.summary, /Quiz recovery/);
  assert.ok(reservation(providerBody('字'.repeat(2000), records, [], 'gpt-5.4')) > 0);
});

test('recognizable credentials and private contact patterns do not enter automatic public summaries', () => {
  const cards = structuredClone(projects);
  cards.push({title:'Privacy fixture',description:'visitor@example.org 0400123456 sk-test-abcdefghijklmnopqrst',emphasis:'Example.',techStack:[],videoSrc:'/demo.mp4',videoLabel:'Demo'});
  const summary = withWebsiteContent(corpus.entries, experienceEntries, cards).find(entry => entry.id === 'project-privacy-fixture')!.summary;
  assert.doesNotMatch(summary, /visitor@example|0400123456|sk-test/);
  assert.match(summary, /credential removed/);
});
