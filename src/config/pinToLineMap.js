import fs from 'fs';
import path from 'path';

let mapping;

try {
    const configPath = path.resolve('src/config/pinToLineMap.json');
    const file = fs.readFileSync(configPath, 'utf8');
    mapping = JSON.parse(file);
} catch (err) {
    console.error('Failed to load pinToLineMap.json:', err);
    mapping = {};
}

export default mapping;
