const http = require('http');

const postData = JSON.stringify({
  email: 'zaydmahdaly@ahlumran.org',
  password: 'Test123!@'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', body);
    if (body) {
      try {
        const parsed = JSON.parse(body);
        console.log('Parsed response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();