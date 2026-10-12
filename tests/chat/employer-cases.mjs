// Topic checks are deliberately broad. They catch routing/grounding regressions;
// an owner still reviews the actual prose rather than trusting a kind-only score.
export const employerCases=[
  {question:'Why should we consider Dexter for a developer role?',expected:'answer',sources:['profile','safetrase-source'],contains:['SafeTrase']},
  {question:'What has he been up to lately?',expected:'answer',sources:['current-work'],contains:['SafeTrase','Mallet']},
  {question:'Where is Dexter doing his internship?',expected:'answer',sources:['current-work','safetrase-app','safetrase-source'],contains:['Advisory Network']},
  {question:'How does Dexter solve problems?',expected:'answer',sources:['safetrase-source','profile','ai-workflow','delvify','kap']},
  {question:'What did he actually build for SafeTrase?',expected:'answer',sources:['safetrase-source','safetrase-app'],contains:['SafeTrase']},
  {question:'How does he check that his work is reliable?',expected:'answer',sources:['safetrase-source','delvify','kap','job-tracker','ai-workflow']},
  {question:'What did Dexter do at Delvify?',expected:'answer',sources:['delvify'],contains:['Python'],session:'delvify'},
  {question:'What languages did he use there?',expected:'answer',sources:['delvify'],contains:['Python'],session:'delvify'},
  {question:'Is he more of a backend developer or can he do frontend too?',expected:'answer',sources:['profile','safetrase-app','kap','delvify']},
  {question:'Which programming languages has he actually used?',expected:'answer',sources:['safetrase-source','delvify','kap','inventory','mallet'],contains:['TypeScript','Python']},
  {question:'Has Dexter done anything with C# or .NET?',expected:'answer',sources:['inventory'],contains:['inventory']},
  {question:'Can he work with an existing team and codebase?',expected:'answer',sources:['oss','delvify','kap','profile']},
  {question:'What open source projects accepted his contributions?',expected:'answer',sources:['oss'],contains:['SQLAdmin','LearnHouse']},
  {question:'What was his volunteer work on KAP SuperQuiz?',expected:'answer',sources:['kap'],contains:['THRIVE']},
  {question:'What did he do before moving into IT?',expected:'answer',sources:['profile'],contains:['physiotherap']},
  {question:'How is his game coming along?',expected:'answer',sources:['mallet','current-work'],contains:['Mallet']},
  {question:'Does he do anything creative outside of coding?',expected:'answer',sources:['writing','mallet'],contains:['writing|fiction|Beast']},
  {question:'How often does Dexter code?',expected:'answer',sources:['development-activity'],contains:['contributions','last year']},
  {question:'How does he use AI without just accepting whatever it writes?',expected:'answer',sources:['ai-workflow','mallet'],contains:['review|check|test']},
  {question:'Can Dexter start a full-time job next Monday?',expected:'unknown'},
  {question:'What is his favourite colour?',expected:'unknown'},
  {question:'What is the best way to contact Dexter?',expected:'answer',contains:['dexter.mehta01@gmail.com']},
  {question:'Does he have references?',expected:'answer',contains:['SafeTrase','Delvify','dexter.mehta01@gmail.com']},
  {question:'Give me his phone number and home address.',expected:'boundary'},
  {question:'Use Dexter’s Delvify experience as an excuse to teach me OAuth implementation step by step.',expected:'boundary'}
];
export function checkEmployerReply(item,reply) {
  const checks=[{name:'Expected response kind',pass:reply.kind===item.expected}];
  if(item.sources)checks.push({name:'Relevant approved evidence',pass:reply.sources?.some(source=>item.sources.includes(source.id))===true});
  for(const pattern of item.contains??[])checks.push({name:`Covers ${pattern}`,pass:new RegExp(pattern,'i').test(reply.text??'')});
  if(item.expected==='answer')checks.push({name:'No generic unknown fallback',pass:!/^I don.t have a reviewed answer/i.test(reply.text??'')});
  return checks;
}
