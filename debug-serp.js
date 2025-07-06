// Test script để debug SerpAPI response structure
const SERP_API_KEY = 'd830ed67812fed5d2a72f26fdd84d56334e182e27eb38eb29f3389700484d87a';
const SERP_API_BASE_URL = 'https://serpapi.com/search';

async function debugSerpAPI() {
  console.log('🔍 Debug SerpAPI Response Structure...\n');
  
  const testProduct = 'Keo trám chống thấm';
  
  try {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: testProduct,
      api_key: SERP_API_KEY,
      num: 3,
      hl: 'vi',
      gl: 'vn',
    });

    console.log(`📡 URL: ${SERP_API_BASE_URL}?${params}\n`);

    const response = await fetch(`${SERP_API_BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📦 Full Response Keys:', Object.keys(data));
    console.log('\n🛍️ Shopping Results:');
    
    if (data.shopping_results && data.shopping_results.length > 0) {
      console.log(`Found ${data.shopping_results.length} products\n`);
      
      data.shopping_results.slice(0, 2).forEach((item, index) => {
        console.log(`--- Product ${index + 1} ---`);
        console.log('Available fields:', Object.keys(item));
        console.log('title:', item.title);
        console.log('price:', item.price); 
        console.log('source:', item.source);
        console.log('link:', item.link?.substring(0, 80) + '...');
        console.log('thumbnail:', item.thumbnail?.substring(0, 80) + '...');
        console.log('rating:', item.rating);
        console.log('reviews:', item.reviews);
        console.log('snippet:', item.snippet);
        console.log('\n');
      });
    } else {
      console.log('❌ No shopping_results found');
      console.log('Available response keys:', Object.keys(data));
      
      // Check for other possible keys
      ['products', 'results', 'organic_results'].forEach(key => {
        if (data[key]) {
          console.log(`\n🔍 Found ${key}:`, data[key].length, 'items');
          if (data[key][0]) {
            console.log('Sample item keys:', Object.keys(data[key][0]));
          }
        }
      });
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Run debug
debugSerpAPI().catch(console.error);
