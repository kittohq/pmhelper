const fs = require('fs');
const path = require('path');

// Load specification templates from JSON files
const loadSpecTemplate = (filename) => {
  const filePath = path.join(__dirname, 'specs', filename);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load spec template ${filename}:`, error);
    return null;
  }
};

const specTemplates = {
  implementation: loadSpecTemplate('implementation-spec.json'),
  'system-design': loadSpecTemplate('system-design-spec.json'),
  migration: loadSpecTemplate('migration-spec.json'),
  api: loadSpecTemplate('api-spec.json')
};

// Filter out any null templates that failed to load
Object.keys(specTemplates).forEach(key => {
  if (!specTemplates[key]) {
    delete specTemplates[key];
  }
});

module.exports = {
  specTemplates
};