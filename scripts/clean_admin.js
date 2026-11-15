const fs = require('fs');

let content = fs.readFileSync('website/src/app/admin/page.tsx', 'utf8');

// Find all occurrences of '{/* ─── TAB: HOT DEALS & OFFERS ─── */}'
const dealMarker = '          {/* ─── TAB: HOT DEALS & OFFERS ─── */}';
const parts = content.split(dealMarker);
console.log('Deal marker count:', parts.length - 1);

if (parts.length > 2) {
  // Keep first copy (in parts[1])
  let cleaned = parts[0] + dealMarker + parts[1];
  for (let i = 2; i < parts.length; i++) {
    const pIdx = parts[i].indexOf("activeTab === 'partners' && (");
    if (pIdx !== -1) {
      cleaned += parts[i].slice(pIdx - 12);
    } else {
      cleaned += parts[i];
    }
  }
  fs.writeFileSync('website/src/app/admin/page.tsx', cleaned, 'utf8');
  console.log('Cleaned duplicate deal blocks! New line count:', cleaned.split('\n').length);
}

