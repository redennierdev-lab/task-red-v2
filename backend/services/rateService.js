const https = require('https');

let cachedRates = {
    bcv: 0,
    usdt: 0,
    lastUpdate: null
};

const fetchRate = (url) => {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP Status ${res.statusCode} for ${url}`));
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    if (!data) throw new Error("Empty response");
                    const parsed = JSON.parse(data);
                    // DolarApi returns { "promedio": ... } or { "price": ... }
                    // Based on curl, it's 'promedio' for paralelos and 'price' or similar for official
                    resolve(parsed);
                } catch (e) {
                    reject(new Error(`Parse error: ${e.message} | Data: ${data.substring(0, 50)}`));
                }
            });
        }).on('error', (err) => reject(err));
    });
};

const updateRates = async () => {
    console.log('🔄 Actualizando tasas de cambio (BCV / USDT)...');
    try {
        // En DolarApi: 'oficial' es el BCV, 'paralelo' es el promedio del mercado
        const bcvData = await fetchRate('https://ve.dolarapi.com/v1/dolares/oficial');
        const paraleloData = await fetchRate('https://ve.dolarapi.com/v1/dolares/paralelo');

        cachedRates = {
            bcv: bcvData.promedio || bcvData.price || 0,
            usdt: paraleloData.promedio || paraleloData.price || 0,
            lastUpdate: new Date().toISOString()
        };
        
        if (cachedRates.bcv > 0 && cachedRates.usdt > 0) {
            console.log(`✅ Tasas actualizadas: BCV ${cachedRates.bcv} | USDT ${cachedRates.usdt}`);
        } else {
            console.warn('⚠️ Tasas recibidas como cero o inválidas.');
        }
    } catch (error) {
        console.error('❌ Error actualizando tasas:', error.message);
    }
};

const getRates = () => cachedRates;

module.exports = {
    updateRates,
    getRates
};
