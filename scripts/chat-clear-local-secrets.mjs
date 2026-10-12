import { existsSync, readFileSync, unlinkSync } from 'node:fs';
const path='.dev.vars';
if(!existsSync(path)) console.log('No temporary local secrets file remains.');
else {
  if(!readFileSync(path,'utf8').startsWith('# Managed by Dexter portfolio local launcher\n'))throw new Error('Unrecognized .dev.vars preserved.');
  unlinkSync(path);
  console.log('Removed the managed temporary secrets file. The encrypted API key remains available.');
}
const config='wrangler.jsonc';
if(existsSync(config)) {
  if(!readFileSync(config,'utf8').startsWith('// Managed by Dexter portfolio local launcher\n'))throw new Error('Unrecognized wrangler.jsonc preserved.');
  unlinkSync(config);
  console.log('Removed the managed local Wrangler configuration.');
}
