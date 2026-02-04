const fs = require('fs');
const https = require('https');

const apiKey = 'b678fc2e812c548cb158c8f6510de6cfdd32c643910ed89b7e4e267c1870ebb5';
const data = JSON.stringify({
    message: "Create a modern, dark-themed hero section for a language learning app called lanXpert.",
    searchQuery: "hero section landing page"
});

const options = {
    hostname: 'magic.21st.dev',
    path: '/api/fetch-ui',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        fs.writeFileSync('hero-response.json', body);
        console.log('Done');
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
