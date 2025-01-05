const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const scrapePage = async (pageNumber) => {
  try {
    console.log(`Scraping page ${pageNumber}...`);
    const { data: html } = await axios.get(`https://magma.esdm.go.id/v1/gunung-api/laporan/search/q?code=MER&start=2024-01-01&end=2025-01-05&page=${pageNumber}`);
    const $ = cheerio.load(html);
    let csvContent = '';

    $('.timeline-item').each((index, element) => {
      const namaGunung = $(element).find('.timeline-title a').text().trim();
      if (!namaGunung) return;
      const ttlReport = $(element).find('.timeline-author').text().trim().split('-')[1]?.trim() || 'N/A';
      const statusGunung = $(element).find('.badge').text().trim() || 'N/A';
      const descReport = $(element).find('.card p').first().text().trim() || 'N/A';
      const reportBy = $(element).find('.timeline-author span').text().trim() || 'N/A';
      const detailUrl = $(element).find('.card-link').attr('href') || 'N/A';

      csvContent += `"${namaGunung}","${ttlReport}","${statusGunung}","${descReport}","${reportBy}","${detailUrl}"\n`;
    });

    return csvContent;
  } catch (error) {
    console.error(`Error scraping page ${pageNumber}:`, error.message);
    return '';
  }
};

(async () => {
  try {
    console.log('Starting to scrape volcanic activity reports...');
    const csvHeaders = 'nama_gunung,ttl_report,status_gunung,desc_report,report_by,detail_url\n';
    let currentPage = 1;
    let hasMorePages = true;

    // Write headers to CSV file first
    fs.writeFileSync('activity_report.csv', csvHeaders);

    while (hasMorePages) {
      const csvContent = await scrapePage(currentPage);

      if (csvContent) {
        // Append the content of each page directly to the CSV file after scraping it
        fs.appendFileSync('activity_report.csv', csvContent);
        console.log(`Page ${currentPage} scraped and saved.`);
      } else {
        console.log(`No data found on page ${currentPage}.`);
      }

      const { data: html } = await axios.get(`https://magma.esdm.go.id/v1/gunung-api/laporan/search/q?code=MER&start=2024-01-01&end=2025-01-05&page=${currentPage}`);
      const $ = cheerio.load(html);
      const nextButtonExists = $('.page-item a[rel="next"]').length > 0;

      if (!nextButtonExists) {
        hasMorePages = false;
        console.log('No more pages found. Scraping process finished.');
      } else {
        currentPage += 1;
        console.log(`Moving to page ${currentPage}...`);
        await new Promise(resolve => setTimeout(resolve, 5000));  // Delay 5 seconds
      }
    }

    console.log('CSV file created successfully.');
  } catch (error) {
    console.error('Error scraping the data:', error.message);
  }
})();
