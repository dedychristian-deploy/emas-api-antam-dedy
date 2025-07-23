# Emas API Antam (Dedy)
Scraper harga emas Antam langsung dari situs logammulia.com menggunakan Puppeteer Stealth.  
Hasil akan ditulis ke CSV dan di-convert ke TXT (harga dipisah titik koma).

### Endpoint
GET `/api/antam` → `{ "tanggal": "...", "harga": ... }`

### Output File
- `hargaLM.csv` → log harga harian
- `hargaLM.txt` → format harga 1 baris, delimiter `;`
