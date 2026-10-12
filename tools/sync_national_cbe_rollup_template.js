const fs = require('node:fs');
const path = require('node:path');
const terser = require('terser');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'amplify/backend/function/nationalcberollup/src/index.js');
const templatePath = path.join(root, 'amplify/backend/custom/nationalcberollupstream/nationalcberollupstream-cloudformation-template.json');

async function main() {
  const source = fs.readFileSync(sourcePath, 'utf8').replace(/\nexports\.__test = \{[\s\S]*?\};?\s*$/, '');
  const result = await terser.minify(source, {
    compress: { passes: 5, unsafe: true, booleans_as_integers: true, drop_console: true },
    mangle: { toplevel: true },
    format: { comments: false, ascii_only: true, quote_style: 1 },
  });

  if (result.error) throw result.error;
  if (result.code.length > 4096) {
    throw new Error(`Minified handler is ${result.code.length} characters; CloudFormation ZipFile limit is 4096.`);
  }

  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  template.Resources.NationalCbeRollupProcessor.Properties.Code.ZipFile = result.code;
  fs.writeFileSync(templatePath, `${JSON.stringify(template, null, 2)}\n`);
  console.log(`Updated inline rollup handler (${result.code.length}/4096 characters).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});