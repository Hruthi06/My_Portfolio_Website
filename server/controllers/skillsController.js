const fs = require('fs');
const path = require('path');

exports.getAllSkills = (req, res) => {
    const dataPath = path.join(__dirname, '../data/skills.json');
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading data');
        res.json(JSON.parse(data));
    });
};
