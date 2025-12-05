const { getDatabase } = require('./database');
const { logger } = require('./logger');

(async () => {
  try {
    console.log('🔍 Checking for books with series data but wrong collection type...\n');
    
    const db = await getDatabase();
    
    // Find problem books
    const problemBooks = await db.getAllAsync(`
      SELECT id, title, seriesName, seriesOrder, volumeNumber, totalVolumes, collectionType 
      FROM books 
      WHERE (seriesName IS NOT NULL AND seriesName != '')
        AND (collectionType IS NULL OR collectionType = 'standalone')
    `);
    
    if (problemBooks.length === 0) {
      console.log('✅ No problems found! All books have correct collection types.');
      process.exit(0);
    }
    
    console.log(`⚠️  Found ${problemBooks.length} problem book(s):\n`);
    problemBooks.forEach(book => {
      console.log(`📖 "${book.title}"`);
      console.log(`   Series: ${book.seriesName}`);
      console.log(`   Order: ${book.seriesOrder || book.volumeNumber || 'N/A'}`);
      console.log(`   Current Type: ${book.collectionType || 'NULL'} ❌`);
      
      // Determine what it SHOULD be
      const shouldBe = (book.volumeNumber && parseInt(book.volumeNumber) > 0) 
        ? 'volume' 
        : 'series';
      console.log(`   Should Be: ${shouldBe} ✅`);
      console.log('');
    });
    
    console.log('🔧 Fixing collection types...\n');
    
    // Fix volumes (have volumeNumber)
    const volumeResult = await db.runAsync(`
      UPDATE books 
      SET collectionType = 'volume'
      WHERE (seriesName IS NOT NULL AND seriesName != '')
        AND volumeNumber IS NOT NULL
        AND volumeNumber > 0
        AND (collectionType IS NULL OR collectionType = 'standalone')
    `);
    
    // Fix series (have seriesName but no volumeNumber)
    const seriesResult = await db.runAsync(`
      UPDATE books 
      SET collectionType = 'series'
      WHERE (seriesName IS NOT NULL AND seriesName != '')
        AND (volumeNumber IS NULL OR volumeNumber = 0)
        AND (collectionType IS NULL OR collectionType = 'standalone')
    `);
    
    console.log(`✅ Fixed ${volumeResult.changes || 0} volume books`);
    console.log(`✅ Fixed ${seriesResult.changes || 0} series books`);
    console.log(`\n🎉 Total fixed: ${(volumeResult.changes || 0) + (seriesResult.changes || 0)} books`);
    console.log('\n📱 Please RESTART your app to see the changes!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
