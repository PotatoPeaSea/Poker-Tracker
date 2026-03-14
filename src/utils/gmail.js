export async function fetchRecentETransfers(accessToken) {
  // Base URL for Gmail API
  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=subject:"Interac e-Transfer" OR subject:"sent you money"&maxResults=10';
  
  try {
    const listRes = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!listRes.ok) throw new Error('Failed to fetch message list');
    const listData = await listRes.json();
    
    if (!listData.messages) return [];

    const parsedTransfers = [];
    
    // Fetch full message for each
    for (const msg of listData.messages) {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const msgData = await msgRes.json();
      
      // Parse payload for essential details
      // A robust parser would decode base64 body, but we'll extract snippets / headers for this MVP demonstration.
      const snippet = msgData.snippet || '';
      const headers = msgData.payload.headers;
      
      const dateHeader = headers.find(h => h.name === 'Date');
      const timestamp = dateHeader ? new Date(dateHeader.value).toISOString() : new Date().toISOString();
      
      // Attempt to extract amount using regex from snippet: e.g., $50.00
      const amountMatch = snippet.match(/\$([0-9,.]+)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;
      
      // Extract sender name from snippet (Simplified for MVP logic)
      // Actual Interac emails often say "John Doe sent you $50.00"
      const nameMatch = snippet.match(/^([^]+?) sent you/i);
      const rawName = nameMatch ? nameMatch[1].trim() : 'Unknown Sender';
      
      if (amount > 0) {
        parsedTransfers.push({
          id: msg.id,
          timestamp,
          rawName,
          amount
        });
      }
    }
    
    return parsedTransfers;
  } catch (err) {
    console.error("Gmail API Error:", err);
    return [];
  }
}
