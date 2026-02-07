const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, '../database.rules.json');
const outputPath = path.join(__dirname, '../params.json');

try {
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    const rules = JSON.parse(rulesContent);

    const params = {
        action: 'updateDatabaseRules',
        data: {
            rules: rules
        }
    };

    fs.writeFileSync(outputPath, JSON.stringify(params, null, 2));
    console.log('Successfully created params.json');
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
