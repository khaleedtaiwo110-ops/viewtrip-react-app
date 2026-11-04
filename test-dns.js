import dns from 'dns';

dns.resolve4('test.api.amadeus.com', (err, addresses) => {
  if (err) {
    console.error('❌ Node DNS Resolution Failed:', err);
  } else {
    console.log('✅ Node resolved Amadeus IP successfully:', addresses);
  }
});
