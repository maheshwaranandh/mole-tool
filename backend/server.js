const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const archiver = require('archiver');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/mols_src', express.static(path.join(__dirname, '../../mols_src')));

app.post('/api/update-file', (req, res) => {
    const data = req.body;
    const filePath = path.join(__dirname, '../../mols_src/usermols.inp');

    const content = `
/home/ubuntu/mols_src/results/
${data.moleculeName}
${data.sequence}
${data.numberOfCycles}
2
4
1
1
1
2.0 1
`;

    fs.writeFile(filePath, content.trim(), (err) => {

        if (err) {
            console.error('Error writing to file', err);
            return res.status(500).send('Error writing to file');
        }

        const resultsPath = path.join('/home/ubuntu/mols_src/results');

        // Function to delete all files in the results directory
        fs.readdir(resultsPath, (err, files) => {
            if (err) {
                console.error('Error reading results directory', err);
                return res.status(500).send('Error reading results directory');
            }

            files.forEach(file => {
                const filePath = path.join(resultsPath, file);
                fs.unlink(filePath, err => {
                    if (err) {
                        console.error('Error deleting file', err);
                        return res.status(500).send('Error deleting file');
                    }
                });
            });
        });

        const execPath = path.join(__dirname, '../../mols_src/./lmols');
        const execOptions = {
            cwd: path.join(__dirname, '../../mols_src')
        };

        exec(execPath,execOptions, (err, stdout, stderr) => {
            if (err) {
                console.error('Error executing lmols', err);
                return res.status(500).send('Error executing lmols');
            }
            
            console.log(`lmols stdout: ${stdout}`);
            console.error(`lmols stderr: ${stderr}`);

            const resultsPath = path.join('/home/ubuntu/mols_src/results');
            const outputZip = path.join(__dirname, '../../mols_src/results.zip');
            const output = fs.createWriteStream(outputZip);
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });

            output.on('close', () => {
                console.log(`Zip file created: ${archive.pointer()} total bytes`);
            });

            archive.on('error', (err) => {
                console.error('Error creating zip file', err);
                return res.status(500).send('Error creating zip file');
            });

            archive.pipe(output);
            archive.directory(resultsPath, false);
            archive.finalize();
        });
    });
});

app.get('/download/results.zip', (req, res) => {
    const filePath = path.join(__dirname, '../../mols_src/results.zip');
    res.download(filePath, 'results.zip', (err) => {
        if (err) {
            console.error('Error sending zip file', err);
            res.status(500).send('Error sending zip file');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
