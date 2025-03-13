const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable = require('formidable');

const server = http.createServer((req, res) => {
    if (req.method.toLowerCase === 'POST') {
        const form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, 'uploads');
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain'});
                res.end(err);
                return;
            }

            const file = files.upload;
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

            if(!allowedTypes.includes(file.mimetype)) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end('Invalid file type');
                return;
            }

            const newFilePath = path.join(form.uploadDir, file.name);
            fs.rename(file.path, newFilePath, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain'});
                    res.end(err);
                    return;
                }

                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('File uploaded successfully');
            })
        })
    }

    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    fs.readFile(filePath, (err, content) => {
        if(err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File not Found</h1>', 'utf8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });

            res.end(content, 'utf8');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));