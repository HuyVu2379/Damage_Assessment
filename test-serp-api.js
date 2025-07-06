// Test script để kiểm tra SerpAPI integration
// Chạy: node test-serp-api.js

// Mock environment cho test
const SERP_API_KEY = 'd830ed67812fed5d2a72f26fdd84d56334e182e27eb38eb29f3389700484d87a';
const SERP_API_BASE_URL = 'https://serpapi.com/search';

// Simple fetch function để test SerpAPI
async function testFetchSerpProduct(productName) {
  try {
    const cleanedProductName = productName.replace(/[^\w\s]/gi, '').trim();
    
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: cleanedProductName,
      api_key: SERP_API_KEY,
      num: 3,
      hl: 'vi',
      gl: 'vn',
    });

    console.log(`🔍 Searching for: ${productName}`);
    console.log(`📡 URL: ${SERP_API_BASE_URL}?${params}`);

    const response = await fetch(`${SERP_API_BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.shopping_results && data.shopping_results.length > 0) {
      return data.shopping_results.slice(0, 3).map(item => ({
        name: item.title || productName,
        price: item.price || 'Liên hệ',
        image: item.thumbnail || 'https://via.placeholder.com/150',
        link: item.link || '#',
        source: item.source || 'Shop',
        rating: item.rating || null,
        reviews: item.reviews || null,
      }));
    } else {
      console.log(`❌ No shopping_results found in response`);
      console.log('Response keys:', Object.keys(data));
      return [];
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return [];
  }
}

const testProducts = [
  'Keo trám chống thấm',
  'Sơn chống thấm',
  'Vữa sửa chữa bê tông',
  'Băng dính chống thấm'
];

async function testSerpAPI() {
  console.log('🧪 Testing SerpAPI Integration...\n');
  
  for (const productName of testProducts) {
    console.log(`📦 Testing: ${productName}`);
    try {
      const results = await testFetchSerpProduct(productName);
      console.log(`✅ Found ${results.length} products`);
      
      results.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`);
        console.log(`     Price: ${product.price}`);
        console.log(`     Source: ${product.source}`);
        console.log(`     Link: ${product.link.substring(0, 50)}...`);
        if (product.rating) {
          console.log(`     Rating: ${product.rating} (${product.reviews} reviews)`);
        }
        console.log('');
      });
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('---\n');
  }
}

// Run test
testSerpAPI().catch(console.error);
