const fs = require('fs');

const lines = fs.readFileSync('website/src/app/admin/page.tsx', 'utf8').split(/\r?\n/);
lines.forEach((l, idx) => {
  if (l.includes('{activeTab ===')) {
    console.log(`Line ${idx + 1}: ${l.trim()}`);
  }
});

