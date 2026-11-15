const fs = require('fs');

let content = fs.readFileSync('website/src/app/admin/page.tsx', 'utf8');

const partnerMarker = '          {/* ─── PARTNERS & PAYOUTS TAB ─── */}';
const parts = content.split(partnerMarker);
console.log('Partner marker count:', parts.length - 1);

// We want to keep only the LAST occurrence (which sits right before activity_logs)!
if (parts.length > 2) {
  let cleaned = '';
  for (let i = 0; i < parts.length - 1; i++) {
    // For every part except the last one, remove the content of the partners block if present
    const part = parts[i];
    cleaned += part;
  }
  // Now append the last partnerMarker + the last part
  cleaned += partnerMarker + parts[parts.length - 1];
  
  // Note: let's verify what was inside parts[1..n-1] before partnerMarker
  fs.writeFileSync('website/src/app/admin/page.tsx', cleaned, 'utf8');
  console.log('Updated line count:', cleaned.split('\n').length);
}

