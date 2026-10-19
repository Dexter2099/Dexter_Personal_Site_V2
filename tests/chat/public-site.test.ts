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

test('OnboardFlow summary and demo link stay synchronized with the model context', () => {
  const cards = structuredClone(projects);
  const card = cards.find(project => project.id === 'onboardflow')!;
  const before = withWebsiteContent(corpus.entries, experienceEntries, cards).find(entry => entry.id === card.id)!;
  assert.ok(before.summary.includes(card.emphasis));
  assert.ok(before.links.some(link => link.url === card.demoUrl));
  card.emphasis = 'Public fixture: reviewed security evidence changed.';
  const after = withWebsiteContent(corpus.entries, experienceEntries, cards).find(entry => entry.id === card.id)!;
  assert.match(after.summary, /reviewed security evidence changed/);
  assert.notEqual(after.summary, before.summary);
});

test('the SafeTrase website card supplies its public website link without Analytics account links', () => {
  const card = projects.find(project => project.id === 'safetrase-website')!;
  const entry = withWebsiteContent(corpus.entries).find(record => record.id === card.id)!;
  assert.ok(entry.summary.includes(card.emphasis));
  assert.ok(entry.links.some(link => link.label === 'Visit website' && link.url === 'https://safetrase.com/'));
  assert.doesNotMatch(JSON.stringify(entry), /analytics\.google\.com|G-[A-Z0-9]{8,}|\b\d{9,}\b/);
});

test('project sources link to their rendered collection and preserve public project identities', () => {
  const records = withWebsiteContent(corpus.entries);
  for (const id of ['safetrase-website', 'kap', 'mallet']) {
    const entry = records.find(record => record.id === id)!;
    assert.ok(entry.links.some(link => link.url.startsWith('https://dexter-developer.dev/professional/#')));
    assert.ok(!entry.links.some(link => link.url.startsWith('https://dexter-developer.dev/projects#')));
    assert.match(entry.summary, /Collection: Professional Projects\./);
  }
  for (const id of ['onboardflow', 'job-tracker', 'gspacechat', 'ml']) {
    const entry = records.find(record => record.id === id)!;
    assert.ok(entry.links.some(link => link.url.startsWith('https://dexter-developer.dev/projects/#')));
    assert.match(entry.summary, /Collection: Personal Projects\./);
  }
  assert.ok(records.some(record => record.title === 'Professional Projects'));
  assert.ok(records.some(record => record.title === 'Personal Projects'));
});

test('page membership is explicit in model context and follows a project moving between collections', () => {
  const cards = structuredClone(projects);
  const before = withWebsiteContent(corpus.entries, experienceEntries, cards);
  const professional = before.find(record => record.id === 'website-professional-projects')!;
  const personal = before.find(record => record.id === 'website-personal-projects')!;
  assert.match(professional.summary, /Exactly 3 cards.*SafeTrase Website; THRIVE Knowledge Assessment Platform; Mallet Mayhem '84\./);
  assert.match(personal.summary, /Exactly 4 cards.*OnboardFlow; Job Tracker API; Gspace Chat; X-Ray Pneumonia Classifier\./);
  const packet = JSON.parse(providerBody('Which projects are on each page?', before, [], 'gpt-5.4').input[0].content);
  assert.equal(packet.approved_records.find((record: any) => record.id === professional.id).summary, professional.summary);
  assert.equal(packet.approved_records.find((record: any) => record.id === personal.id).summary, personal.summary);
  cards.find(project => project.id === 'onboardflow')!.category = 'professional';
  const after = withWebsiteContent(corpus.entries, experienceEntries, cards);
  assert.match(after.find(record => record.id === professional.id)!.summary, /Exactly 4 cards.*OnboardFlow/);
  assert.doesNotMatch(after.find(record => record.id === personal.id)!.summary, /OnboardFlow/);
});
