const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ignores = new Set(['.git', 'node_modules', 'dist', 'build', '.vscode', '.next']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ignores.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else processFile(full);
  }
}

function removeMergeMarkers(text) {
  const lines = text.split(/\r?\n/);
  const output = [];
  let state = 'normal';
  let headBuffer = [];

  for (const line of lines) {
    if (state === 'normal') {
      if (line.startsWith('<<<<<<< ')) {
        state = 'in-head';
        headBuffer = [];
        continue;
      }
      output.push(line);
      continue;
    }

    if (state === 'in-head') {
      if (line === '=======') {
        state = 'in-other';
        continue;
      }
      headBuffer.push(line);
      continue;
    }

    if (state === 'in-other') {
      if (line.startsWith('>>>>>>> ')) {
        output.push(...headBuffer);
        state = 'normal';
        headBuffer = [];
        continue;
      }
      continue;
    }
  }

  if (state !== 'normal') {
    // If the file ended inside a conflict block, leave it unchanged for manual review.
    return text;
  }

  return output.join('\n');
}

function processFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    if (!text.includes('<<<<<<<')) return;

    const cleaned = removeMergeMarkers(text);
    if (cleaned !== text) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      console.log('Fixed:', path.relative(root, filePath));
    }
  } catch (err) {
    console.error('Error processing', filePath, err.message);
  }
}

walk(root);
console.log('Done.');
