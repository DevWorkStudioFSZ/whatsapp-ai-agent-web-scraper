const XLSX = require('xlsx');
const fs = require('fs');

const path = 'C:/Users/bk337/OneDrive/Documents/mehran/branch details.xlsx';

try {
    const workbook = XLSX.readFile(path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Read data
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    
    const branches = {};
    
    data.forEach(row => {
        // Find keys dynamically as they have \r\n characters
        let brCodeKey = Object.keys(row).find(k => k.toLowerCase().includes('code'));
        let brNameKey = Object.keys(row).find(k => k.toLowerCase().includes('name'));
        let regionKey = Object.keys(row).find(k => k.toLowerCase().includes('region'));
        
        let code = brCodeKey ? String(row[brCodeKey]).trim() : '';
        let name = brNameKey ? String(row[brNameKey]).trim() : '';
        let region = regionKey ? String(row[regionKey]).trim() : '';
        
        if (code && code !== '' && code !== 'undefined') {
            branches[code] = {
                branchName: name,
                region: region
            };
        }
    });

    if (!fs.existsSync('./src/lib')) {
        fs.mkdirSync('./src/lib', { recursive: true });
    }

    fs.writeFileSync('./src/lib/branches.json', JSON.stringify(branches, null, 2), 'utf-8');
    console.log(`Successfully imported ${Object.keys(branches).length} branches to src/lib/branches.json`);
} catch (e) {
    console.error("Error importing branches:", e);
}
