const http = require('http');
const fs = require('fs');
const path = require('path');

const payload = {
  mainHtml: '<h1>Hello World</h1><p>This is a test PDF.</p>',
  headerHtml: '<p style="font-size: 8px;">Header</p>',
  footerHtml: '<p style="font-size: 8px;">Footer - Page <span class="pageNumber"></span> of <span class="totalPages"></span></p>',
  pdfOptions: {
    format: 'A4'
  }
};

const postData = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode !== 200) {
    console.error(`Request Failed.\nStatus Code: ${res.statusCode}`);
    process.exit(1);
  }

  const filePath = path.join(__dirname, 'test_output.pdf');
  const file = fs.createWriteStream(filePath);

  res.on('data', (chunk) => {
    file.write(chunk);
  });

  res.on('end', () => {
    file.end();
    console.log('PDF generated successfully: test_output.pdf');
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  process.exit(1);
});

// Write data to request body
req.write(postData);
req.end();
