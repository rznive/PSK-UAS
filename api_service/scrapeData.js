require("dotenv").config();
const axios = require('axios');
const cheerio = require('cheerio');
const supabase = require('../middleware/supabaseClient');

const months = {
  Januari: '01',
  Februari: '02',
  Maret: '03',
  April: '04',
  Mei: '05',
  Juni: '06',
  Juli: '07',
  Agustus: '08',
  September: '09',
  Oktober: '10',
  November: '11',
  Desember: '12',
};

const scrapePage = async (pageNumber) => {
  try {
    console.log(`Scraping page ${pageNumber}...`);
    const { data: html } = await axios.get(
      `https://magma.esdm.go.id/v1/gunung-api/laporan/search/q?code=MER&start=2024-01-01&end=2025-01-08&page=${pageNumber}`
    );
    const $ = cheerio.load(html);
    const dataToInsert = [];

    $('.timeline-item').each((_, element) => {
      const namaGunung = $(element).find('.timeline-title a').text().trim();
      if (!namaGunung) return;
    
      const ttlReport = $(element)
        .find('.timeline-author')
        .text()
        .trim()
        .split('-')[1]?.trim() || 'N/A';
      const statusGunung = $(element).find('.badge').text().trim() || 'N/A';
      const periode = $(element)
        .find('.timeline-time')
        .text()
        .trim()
        .split('Periode')[1]?.split('-')[0]?.trim() || 'N/A';
      const descReport = $(element).find('.card p').first().text().trim() || 'N/A';
      const reportBy = $(element).find('.timeline-author span').text().trim() || 'N/A';
      const detailUrl = $(element).find('.card-link').attr('href') || 'N/A';
    
      // Parse date from ttlReport
      const ttlReportParts = ttlReport.split(', ')[1]?.split(' ') || []; // "06 Januari 2025"
      const [day, monthName, year] = ttlReportParts;
    
      if (!months[monthName]) {
        console.error(`Month name "${monthName}" is invalid or not mapped.`);
        return; // Skip this entry
      }
    
      const formattedMonth = `${year}${months[monthName]}${day.padStart(2, '0')}`;
      const timeReport = periode.replace(/:/g, '') || '0000';
    
      const imageUrl = `https://magma.esdm.go.id/storage/var/MER/MER${formattedMonth}${timeReport}.jpg`;
    
      dataToInsert.push({
        nama_gunung: namaGunung,
        ttl_report: ttlReport,
        periode,
        status_gunung: statusGunung,
        desc_report: descReport,
        report_by: reportBy,
        detail_url: detailUrl,
        image_url: imageUrl,
      });
    });
    

    const hasNextPage = $('.page-item a[rel="next"]').length > 0;
    return { dataToInsert, hasNextPage };
  } catch (error) {
    console.error(`Error scraping page ${pageNumber}:`, error.message);
    return { dataToInsert: [], hasNextPage: false };
  }
};

const deleteDataBeforeInsert = async () => {
  try {
    console.log('Deleting all data from the "activity_report" table...');
    const { error } = await supabase.from('activity_report').delete().neq('id', 0); // Kondisi selalu benar
    if (error) throw error;
    console.log('All old data has been deleted from the table.');
  } catch (error) {
    console.error('Error deleting old data from Supabase:', error.message);
  }
};


const insertDataToSupabase = async (data) => {
  try {
    const { data: insertedData, error } = await supabase.from('activity_report').insert(data);
    if (error) throw error;
    console.log(`${data.length} rows inserted into Supabase.`);
  } catch (error) {
    console.error('Error inserting data into Supabase:', error.message);
  }
};

(async () => {
  try {
    console.log('Starting to scrape volcanic activity reports...');

    // Delete previous data before inserting new data
    await deleteDataBeforeInsert();

    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const { dataToInsert, hasNextPage } = await scrapePage(currentPage);

      if (dataToInsert.length) {
        await insertDataToSupabase(dataToInsert);
        console.log(`Page ${currentPage} scraped and data inserted.`);
      } else {
        console.log(`No data found on page ${currentPage}.`);
      }

      hasMorePages = hasNextPage;

      if (hasMorePages) {
        currentPage += 1;
        console.log(`Moving to page ${currentPage}...`);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay 5 seconds
      }
    }

    console.log('Scraping process completed and data inserted into Supabase.');
  } catch (error) {
    console.error('Error scraping the data:', error.message);
  }
})();
