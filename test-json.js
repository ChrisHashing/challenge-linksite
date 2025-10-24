const fs = require('fs');

console.log('Testing JSON configurations...\n');

const files = [
  'content/data.json',
  'content/example-creator.json', 
  'content/example-minimal.json'
];

files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`✓ ${file}:`);
    console.log(`  Theme: ${data.theme}`);
    console.log(`  Name: ${data.profile?.name || 'N/A'}`);
    console.log(`  Links: ${data.links?.length || 0}`);
    console.log(`  Social platforms: ${Object.keys(data.social || {}).length}`);
    console.log('');
  } catch(e) {
    console.log(`✗ ${file}: ${e.message}\n`);
  }
});

// Check if theme files exist
console.log('Checking theme files...\n');
const themes = ['technicallyweb3', 'creator', 'minimal'];
themes.forEach(theme => {
  const themeFile = `styles/${theme}.css`;
  if (fs.existsSync(themeFile)) {
    console.log(`✓ ${themeFile} exists`);
  } else {
    console.log(`✗ ${themeFile} missing`);
  }
});
