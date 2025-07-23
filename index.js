// index.js (Single File Version with Stealth)
const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

const csvPath = path.join(__dirname, 'hargaLM.csv');
const txtPath = path.join(__dirname, 'hargaLM.txt');

async function scrapeHargaAntam() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.logammulia.com/id', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Dump isi HTML ke file untuk debug
    const html = await page.content();
    fs.writeFileSync('dump_debug.html', html);

    // Ambil elemen span.current jika ada
    const el = await page.$('span.current');
    let hargaText = null;

    if (el) {
      hargaText = await page.evaluate(el => el.textContent, el);
      console.log('Harga Text:', hargaText);
    } else {
      console.log('Elemen span.current tidak ditemukan');
    }

    const harga = hargaText ? parseInt(hargaText.replace(/[^\d]/g, '')) : null;

    const tanggal = new Date().toISOString().split('T')[0];
    const newLine = `${tanggal},${harga}`;

    // Update CSV (prepend line if not duplicate)
    let existing = '';
    if (fs.existsSync(csvPath)) {
      existing = fs.readFileSync(csvPath, 'utf-8');
      if (!existing.includes(tanggal)) {
        fs.writeFileSync(csvPath, `Tanggal,Harga
${newLine}
` + existing.replace(/^Tanggal,Harga
/, ''));
      }
    } else {
      fs.writeFileSync(csvPath, `Tanggal,Harga
${newLine}
`);
    }

    // Generate TXT dari CSV
    const csvLines = fs.readFileSync(csvPath, 'utf-8').split('\n');
    const hargaList = csvLines
      .filter(line => line && !line.startsWith('Tanggal'))
      .map(line => line.split(',')[1]);

    fs.writeFileSync(txtPath, hargaList.join(';'));

    console.log({ tanggal, harga, csv: csvPath, txt: txtPath });
    return { tanggal, harga };
  } catch (error) {
    console.error('Scraping failed:', error);
    return { error: 'Gagal scrape', detail: error.message };
  } finally {
    await browser.close();
  }
}

app.get('/api/antam', async (req, res) => {
  const result = await scrapeHargaAntam();
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
