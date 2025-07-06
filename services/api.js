// --- API Keys (Sử dụng biến môi trường) ---
// API keys được lưu trữ trong file .env (không được commit lên git)
import { GROQ_API_KEY, GEMINI_API_KEY } from '@env';
import * as FileSystem from 'expo-file-system';

// SerpAPI Configuration
const SERP_API_KEY = 'd830ed67812fed5d2a72f26fdd84d56334e182e27eb38eb29f3389700484d87a';
const SERP_API_BASE_URL = 'https://serpapi.com/search';

// Import optimized logger
const log = __DEV__ ? console.log : () => {};
const error = __DEV__ ? console.error : () => {};

const DAMAGE_ANALYSIS_PROMPT = `
Bạn là kỹ sư xây dựng với 15 năm kinh nghiệm. Phân tích ảnh này theo 3 mục:

⚠️ QUY TẮC TRẢ LỜI:
- Trả lời cực ngắn gọn, mỗi phần dưới 3 dòng
- Không vòng vo, đi thẳng vào vấn đề
- Tập trung vào chẩn đoán và giải pháp

----------------------------
1. NHẬN DIỆN VẤN ĐỀ:
• Loại hư hại + vị trí + mức độ (2 dòng)

2. NGUYÊN NHÂN:
• Nguyên nhân chính + dấu hiệu (2 dòng)

3. CÁCH XỬ LÝ:
• 3 bước xử lý ngắn gọn
• Lưu ý quan trọng (nếu có)

KẾT THÚC bằng danh sách sản phẩm cần dùng:
"Sản phẩm cần: Keo Sikaflex, Sơn chống thấm Nippon, Vải thủy tinh"

KHÔNG viết thừa. Trả lời NGẮN GỌN, SÁT THỰC TẾ.`;


const GENERAL_CHAT_PROMPT = `
Bạn là chuyên gia xây dựng thân thiện, 15 năm kinh nghiệm thực tế tại Việt Nam.

🌟 QUY TẮC TRẢ LỜI:
- Ngắn gọn, dễ hiểu, không dùng thuật ngữ chuyên sâu
- Trả lời trong 3 đoạn ngắn (tối đa 50–80 từ mỗi đoạn)
- Ưu tiên chia sẻ giải pháp thực tế hơn là lý thuyết
- Có thể hỏi lại nếu thiếu thông tin

📌 BẠN CÓ THỂ:
- Tư vấn sửa chữa, cải tạo nhà ở, vật liệu
- Hướng dẫn xử lý hư hại cơ bản
- Gợi ý vật tư phù hợp tại Việt Nam (nếu có)

Ví dụ câu trả lời:
1. Nêu tình trạng/giải pháp ngắn gọn
2. Gợi ý cách xử lý hoặc vật liệu
3. Lưu ý an toàn, thời gian, hoặc mẹo nhỏ

KHÔNG nói vòng vo. KHÔNG cần giới thiệu lại bản thân. Luôn đi thẳng vào nội dung.
`;

const API_CONFIG = {
    groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: GROQ_API_KEY,
        model: 'llama3-70b-8192',
    },
    gemini: {
        endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        apiKey: GEMINI_API_KEY,
    }
};

/**
 * Lấy phản hồi từ model AI được chọn
 * @param {Array} messageHistory Lịch sử cuộc trò chuyện (chỉ chứa role 'user' và 'assistant')
 * @param {'groq' | 'gemini'} modelType Loại model để sử dụng
 * @param {boolean} isDamageAnalysis Có phải là phân tích hư hỏng (có ảnh) hay không
 * @returns {Promise<string>} Nội dung phản hồi từ AI (bao gồm JSON block nếu là phân tích hư hỏng)
 */
export const getAiResponse = async (messageHistory, modelType, isDamageAnalysis = false) => {
    const config = API_CONFIG[modelType];
    if (!config) {
        return "Lỗi: Model không được hỗ trợ.";
    }

    // Chọn prompt phù hợp dựa trên loại tin nhắn
    const selectedPrompt = isDamageAnalysis ? DAMAGE_ANALYSIS_PROMPT : GENERAL_CHAT_PROMPT;

    let headers = { 'Content-Type': 'application/json' };
    let body;

    if (modelType === 'groq') {
        headers['Authorization'] = `Bearer ${config.apiKey}`;

        const messagesWithSystemPrompt = [
            { role: 'system', content: selectedPrompt },
            ...messageHistory
        ];

        body = JSON.stringify({
            model: config.model,
            messages: messagesWithSystemPrompt,
            max_tokens: isDamageAnalysis ? 2500 : 1500,
        });
    } else if (modelType === 'gemini') {
        const contents = messageHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }],
        }));

        const systemInstruction = {
            parts: [{ text: selectedPrompt }]
        };

        body = JSON.stringify({
            contents,
            systemInstruction
        });
    }

    try {
        const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Lỗi API: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        let aiMessage;
        if (modelType === 'groq') {
            aiMessage = data.choices[0]?.message?.content?.trim();
        } else if (modelType === 'gemini') {
            aiMessage = data.candidates[0]?.content?.parts[0]?.text?.trim();
        }

        if (!aiMessage) {
            throw new Error("Không nhận được nội dung hợp lệ từ AI.");
        }

        return aiMessage;

    } catch (error) {
        error(`Lỗi khi gọi API ${modelType}:`, error);
        return `Xin lỗi, đã có lỗi xảy ra khi kết nối đến ${modelType}.`;
    }
};

/**
 * Legacy function - không còn sử dụng trong Phương án 2
 * Giữ lại để backward compatibility
 */
export const parseProductSuggestions = async (aiResponse) => {
    // Không còn parse JSON, chỉ trả về text
    return {
        analysis: aiResponse,
        products: []
    };
};

/**
 * Validate và format dữ liệu sản phẩm (giữ nguyên dữ liệu SerpAPI)
 * @param {Array} products Danh sách sản phẩm
 * @returns {Array} Danh sách sản phẩm đã được validate và format
 */
export const validateProductData = (products) => {
    if (!Array.isArray(products)) {
        return [];
    }

    const validatedProducts = products.map(product => ({
        name: product.name || 'Không có tên',
        brand: product.brand || 'Không rõ thương hiệu',
        description: product.description || 'Không có mô tả',
        estimatedPrice: product.estimatedPrice || 'Liên hệ để biết giá',
        purchaseLink: product.purchaseLink || '#',
        imageUrl: product.imageUrl || 'https://via.placeholder.com/150x150?text=No+Image',
        category: product.category || 'Khác',
        // Giữ nguyên dữ liệu SerpAPI
        rating: product.rating,
        reviews: product.reviews,
        source: product.source
    }));

    return validatedProducts;
};

/**
 * Kiểm tra xem URL có phải là link shop hợp lệ không
 * @param {string} url URL cần kiểm tra
 * @returns {boolean} True nếu là link shop hợp lệ
 */
const isValidShopUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    const validShopDomains = [
      'shopee.vn',
      'lazada.vn', 
      'tiki.vn',
      'sendo.vn',
      'fahasa.com',
      'bach-hoa-xanh.com',
      'dienmayxanh.com',
      'thegioididong.com',
      'cellphones.com.vn',
      'fptshop.com.vn',
      'meta.vn',
      'nguyenkim.com'
    ];
    
    return validShopDomains.some(domain => 
      parsedUrl.hostname.includes(domain) || 
      parsedUrl.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
};

/**
 * Validate URL sản phẩm
 * @param {string} url URL cần validate
 * @returns {string|null} URL hợp lệ hoặc null
 */
const validateUrl = (url) => {
    if (!url || typeof url !== 'string') return null;

    const validDomains = ['shopee.vn', 'lazada.vn', 'tiki.vn', 'sendo.vn'];
    try {
        const parsedUrl = new URL(url);
        return validDomains.some(domain => parsedUrl.hostname.includes(domain)) ? url : null;
    } catch {
        return null;
    }
};

/**
 * Validate URL hình ảnh
 * @param {string} imageUrl URL hình ảnh cần validate
 * @returns {string|null} URL hình ảnh hợp lệ hoặc null
 */
const validateImageUrl = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string') return null;

    const validImageDomains = [
        'cf.shopee.vn',
        'salt.tikicdn.com',
        'laz-img-cdn.alicdn.com',
        'media3.scdn.vn'
    ];

    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    try {
        const parsedUrl = new URL(imageUrl);
        const hasValidDomain = validImageDomains.some(domain => parsedUrl.hostname.includes(domain));
        const hasValidExtension = validExtensions.some(ext =>
            parsedUrl.pathname.toLowerCase().includes(ext)
        );

        return hasValidDomain && hasValidExtension ? imageUrl : null;
    } catch {
        return null;
    }
};

/**
 * Convert ảnh sang Base64
 * @param {string} uri URI của ảnh
 * @returns {Promise<string>} Base64 string
 */
export const convertImageToBase64 = async (uri) => {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
    } catch (error) {
        throw new Error(`Không thể convert ảnh sang Base64: ${error.message}`);
    }
};

/**
 * Phân tích ảnh với Gemini Vision
 * @param {string} imageBase64 Ảnh Base64
 * @param {string} prompt Prompt phân tích
 * @returns {Promise<string>} Kết quả phân tích
 */
export const analyzeImageWithGemini = async (imageBase64, prompt = DAMAGE_ANALYSIS_PROMPT) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
        // Loại bỏ prefix nếu có
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        
        const body = JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Data
                        }
                    }
                ]
            }]
        });

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Lỗi API Gemini Vision: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const aiMessage = data.candidates[0]?.content?.parts[0]?.text?.trim();

        if (!aiMessage) {
            throw new Error("Không nhận được nội dung hợp lệ từ Gemini Vision.");
        }

        return aiMessage;
    } catch (error) {
        return `Xin lỗi, đã có lỗi xảy ra khi phân tích ảnh: ${error.message}`;
    }
};

/**
 * Tìm kiếm sản phẩm thật trên SerpAPI
 * @param {string} query Chuỗi tìm kiếm
 * @returns {Promise<Array>} Danh sách sản phẩm tìm thấy
 */
export const searchRealProducts = async (query) => {
    const endpoint = `${SERP_API_BASE_URL}?api_key=${SERP_API_KEY}&q=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(endpoint);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Lỗi API SerpAPI: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.products || [];
    } catch (error) {
        error(`Lỗi khi gọi API SerpAPI:`, error);
        return [];
    }
};

// Cache cho SerpAPI để tránh gọi API nhiều lần
const serpCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 giờ

// Helper function để tạo sản phẩm fallback
const createFallbackProduct = (productName) => {
  return [{
    name: productName,
    price: 'Liên hệ',
    image: 'https://via.placeholder.com/150',
    link: `https://www.google.com/search?q=${encodeURIComponent(productName)}`,
    source: 'Tìm kiếm Google',
    rating: null,
    reviews: null,
    // Map thêm các field mà UI component mong đợi
    imageUrl: 'https://via.placeholder.com/150',
    purchaseLink: `https://www.google.com/search?q=${encodeURIComponent(productName)}`,
    brand: 'Tìm kiếm',
    description: 'Tìm kiếm sản phẩm trên Google',
    estimatedPrice: 'Liên hệ',
    category: 'Sản phẩm'
  }];
};

// Function để lấy thông tin sản phẩm thật từ SerpAPI
export const fetchSerpProductInfo = async (productName) => {
  try {
    // Debug trong dev mode
    if (__DEV__) {
      await debugSerpResponse(productName);
    }
    
    // Làm sạch tên sản phẩm
    const cleanedProductName = productName.replace(/[^\w\s]/gi, '').trim();
    
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: cleanedProductName,
      api_key: SERP_API_KEY,
      num: 5, // Lấy 5 sản phẩm đầu tiên
      hl: 'vi', // Tiếng Việt
      gl: 'vn', // Quốc gia Việt Nam
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout 8 giây

    const response = await fetch(`${SERP_API_BASE_URL}?${params}`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`SerpAPI HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Xử lý dữ liệu từ SerpAPI
    if (data.shopping_results && data.shopping_results.length > 0) {
      return data.shopping_results.slice(0, 3).map(item => {
        // CHÍNH SÁCH ƯU TIÊN LINK MỚI - sử dụng validateAndCleanProductLink:
        // 1. product_link (link trực tiếp đến trang sản phẩm, bao gồm Google Shopping)
        // 2. merchant.link (link shop)
        // 3. extracted_price.link (link từ giá)
        // 4. link (link tổng quát)
        let finalLink = null;
        let linkSource = 'none';
        
        // Ưu tiên cao nhất: product_link (bao gồm Google Shopping links)
        if (item.product_link) {
          finalLink = validateAndCleanProductLink(item.product_link, item.title || productName);
          linkSource = 'product_link';
        }
        // Thứ hai: merchant link
        else if (item.merchant && item.merchant.link) {
          finalLink = validateAndCleanProductLink(item.merchant.link, item.title || productName);
          linkSource = 'merchant.link';
        }
        // Thứ ba: extracted price link
        else if (item.extracted_price && item.extracted_price.link) {
          finalLink = validateAndCleanProductLink(item.extracted_price.link, item.title || productName);
          linkSource = 'extracted_price.link';
        }
        // Cuối cùng: link tổng quát
        else if (item.link) {
          finalLink = validateAndCleanProductLink(item.link, item.title || productName);
          linkSource = 'link';
        }
        
        // Nếu không có link nào, dùng fallback
        if (!finalLink) {
          finalLink = `https://www.google.com/search?q=${encodeURIComponent(item.title || productName)}`;
          linkSource = 'google_fallback';
        }
        
        // Debug logging
        if (__DEV__) {
          console.log(`🔗 [LINK-DEBUG] Product: ${item.title}`);
          console.log(`🔗 [LINK-DEBUG] Available links:`, {
            link: item.link,
            product_link: item.product_link,
            merchant_link: item.merchant?.link,
            extracted_link: item.extracted_price?.link
          });
          console.log(`🔗 [LINK-DEBUG] Selected: ${finalLink} (source: ${linkSource})`);
          
          // Hiển thị loại link được chọn
          if (finalLink && finalLink.includes('google.com/shopping')) {
            console.log(`🛒 [LINK-DEBUG] Google Shopping link detected - will open product page`);
          } else if (finalLink && finalLink.includes('google.com/search')) {
            console.log(`🔍 [LINK-DEBUG] Google Search fallback`);
          } else {
            console.log(`🏪 [LINK-DEBUG] Direct shop link detected`);
          }
        }
        
        return {
          name: item.title || productName,
          price: item.price || 'Liên hệ',
          image: item.thumbnail || 'https://via.placeholder.com/150',
          link: finalLink,
          source: item.source || 'Shop',
          rating: item.rating || null,
          reviews: item.reviews || null,
          // Map thêm các field mà UI component mong đợi
          imageUrl: item.thumbnail || 'https://via.placeholder.com/150',
          purchaseLink: finalLink,
          brand: item.source || 'Shop',
          description: item.snippet || item.title || 'Sản phẩm chất lượng',
          estimatedPrice: item.price || 'Liên hệ',
          category: 'Sản phẩm'
        };
      });
    }

    // Fallback nếu không tìm thấy sản phẩm
    log(`No shopping results found for: ${productName}`);
    return createFallbackProduct(productName);

  } catch (error) {
    if (error.name === 'AbortError') {
      log('SerpAPI request timeout');
    } else {
      log('SerpAPI Error:', error.message);
    }
    
    // Fallback error - trả về sản phẩm mặc định
    return createFallbackProduct(productName);
  }
};

// Function để lấy thông tin sản phẩm với cache
export const fetchSerpProductInfoWithCache = async (productName) => {
  const cacheKey = productName.toLowerCase().trim();
  const now = Date.now();
  
  // Kiểm tra cache
  if (serpCache.has(cacheKey)) {
    const cached = serpCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_EXPIRY) {
      log(`Using cached result for: ${productName}`);
      return cached.data;
    } else {
      serpCache.delete(cacheKey); // Xóa cache cũ
    }
  }
  
  // Gọi API và cache kết quả
  try {
    const result = await fetchSerpProductInfo(productName);
    serpCache.set(cacheKey, {
      data: result,
      timestamp: now
    });
    return result;
  } catch (error) {
    // Fallback về sản phẩm mặc định
    return createFallbackProduct(productName);
  }
};

// Debug function để log dữ liệu SerpAPI (chỉ trong dev mode)
export const debugSerpResponse = async (productName) => {
  if (!__DEV__) return;
  
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

    console.log(`🔍 [DEBUG] Searching SerpAPI for: ${productName}`);
    console.log(`📡 [DEBUG] URL: ${SERP_API_BASE_URL}?${params}`);

    const response = await fetch(`${SERP_API_BASE_URL}?${params}`);

    if (!response.ok) {
      console.log(`❌ [DEBUG] HTTP Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    
    console.log('📦 [DEBUG] Response keys:', Object.keys(data));
    
    if (data.shopping_results && data.shopping_results.length > 0) {
      console.log(`✅ [DEBUG] Found ${data.shopping_results.length} shopping results`);
      
      const sample = data.shopping_results[0];
      console.log('🛍️ [DEBUG] Sample product fields:', Object.keys(sample));
      console.log('🛍️ [DEBUG] Sample data:', {
        title: sample.title,
        price: sample.price,
        source: sample.source,
        thumbnail: sample.thumbnail ? 'Has thumbnail' : 'No thumbnail',
        link: sample.link ? sample.link : 'No link',
        product_link: sample.product_link ? sample.product_link : 'No product_link',
        merchant: sample.merchant ? {
          name: sample.merchant.name,
          link: sample.merchant.link
        } : 'No merchant',
        extracted_price: sample.extracted_price ? {
          value: sample.extracted_price.value,
          link: sample.extracted_price.link
        } : 'No extracted_price',
        rating: sample.rating,
        reviews: sample.reviews,
        snippet: sample.snippet
      });
      
      // Log tất cả links có sẵn
      console.log('🔗 [DEBUG] All available links:');
      data.shopping_results.slice(0, 3).forEach((item, index) => {
        console.log(`   Product ${index + 1}: ${item.title}`);
        console.log(`   - link: ${item.link || 'None'}`);
        console.log(`   - product_link: ${item.product_link || 'None'}`);
        console.log(`   - merchant.link: ${item.merchant?.link || 'None'}`);
        console.log(`   - extracted_price.link: ${item.extracted_price?.link || 'None'}`);
        console.log('   ---');
      });
      
    } else {
      console.log('❌ [DEBUG] No shopping_results found');
      console.log('🔍 [DEBUG] Available keys:', Object.keys(data));
    }

  } catch (error) {
    console.log(`❌ [DEBUG] SerpAPI Error: ${error.message}`);
  }
};

/**
 * Extract tên sản phẩm từ text phân tích
 * @param {string} analysisText Text phân tích từ AI
 * @returns {Array} Danh sách tên sản phẩm
 */
export const extractProductNames = (analysisText) => {
  // Tìm dòng "Sản phẩm cần:"
  const productMatch = analysisText.match(/Sản phẩm cần:\s*(.+)/i);
  
  if (productMatch) {
    // Tách các sản phẩm bằng dấu phẩy
    const products = productMatch[1]
      .split(',')
      .map(product => product.trim())
      .filter(product => product.length > 0);
    
    log(`[DEBUG] Extracted products: ${products.join(', ')}`);
    return products;
  }
  
  log('[DEBUG] No products found in analysis');
  return [];
};

/**
 * Tìm kiếm nhiều sản phẩm cùng lúc với SerpAPI
 * @param {Array} productNames Danh sách tên sản phẩm
 * @returns {Promise<Array>} Danh sách sản phẩm từ SerpAPI
 */
export const searchMultipleProducts = async (productNames) => {
  if (!productNames || productNames.length === 0) {
    return [];
  }

  try {
    log(`[DEBUG] Searching for ${productNames.length} products with SerpAPI`);
    
    // Tìm từng sản phẩm song song
    const productPromises = productNames.map(name => 
      fetchSerpProductInfoWithCache(name.substring(0, 50)) // Limit length
    );
    
    const allResults = await Promise.all(productPromises);
    
    // Flatten và limit kết quả
    const flatProducts = allResults
      .flat()
      .filter(product => product && product.name) // Remove empty results
      .slice(0, 6); // Tối đa 6 sản phẩm
    
    log(`[DEBUG] Found ${flatProducts.length} total products`);
    return flatProducts;
    
  } catch (error) {
    log(`[DEBUG] Error searching multiple products: ${error.message}`);
    return [];
  }
};

/**
 * Validate và clean link sản phẩm - phiên bản nới lỏng cho phép mọi link
 * @param {string} link Link cần validate
 * @param {string} productName Tên sản phẩm (dùng cho fallback)
 * @returns {string} Link đã được clean hoặc fallback
 */
const validateAndCleanProductLink = (link, productName) => {
  if (!link || link === '#') {
    return `https://www.google.com/search?q=${encodeURIComponent(productName)}`;
  }

  try {
    const url = new URL(link);

    // Nếu là link redirect của Google
    if (url.hostname.includes('google.com') && url.searchParams.has('url')) {
      const realLink = url.searchParams.get('url');
      if (__DEV__) {
        console.log(`🔄 [LINK] Google redirect detected, extracting: ${realLink}`);
      }
      return validateAndCleanProductLink(realLink, productName);
    }

    // ⚠️ CHO PHÉP MỌI LINK – không kiểm tra domain
    if (__DEV__) {
      console.log(`✅ [LINK] Allowing link: ${url.hostname}`);
    }
    return link;

  } catch (error) {
    // URL không hợp lệ, fallback về search
    if (__DEV__) {
      console.log(`❌ [LINK] Invalid URL: ${error.message}`);
    }
    return `https://www.google.com/search?q=${encodeURIComponent(productName)}`;
  }
};

/**
 * Detect xem người dùng có hỏi về sản phẩm/vật liệu xây dựng không
 * @param {string} userMessage Tin nhắn của người dùng
 * @returns {boolean} True nếu là câu hỏi về sản phẩm
 */
export const isProductRelatedQuery = (userMessage) => {
  if (!userMessage || typeof userMessage !== 'string') {
    return false;
  }
  
  const message = userMessage.toLowerCase();
  
  // Keywords cho sản phẩm xây dựng
  const productKeywords = [
    'sản phẩm', 'vật liệu', 'mua', 'bán', 'giá', 'shop', 'cửa hàng',
    'keo', 'sơn', 'xi măng', 'gạch', 'ngói', 'thép', 'inox',
    'ống', 'dây điện', 'công tắc', 'ổ cắm', 'bóng đèn',
    'khóa', 'tay nắm', 'cửa', 'cửa sổ', 'kính',
    'gợi ý', 'đề xuất', 'tư vấn mua', 'chọn', 'loại nào',
    'thương hiệu', 'hãng', 'chất lượng', 'tốt nhất',
    'chống thấm', 'trám', 'lắp đặt', 'sửa chữa',
    'sikaflex', 'nippon', 'jotun', 'dulux', 'kova',
    'hoà phát', 'thép việt', 'viglacera', 'đồng tâm'
  ];
  
  // Intent patterns (mẫu câu hỏi)
  const intentPatterns = [
    /gợi ý.*(?:keo|sơn|vật liệu)/,
    /(?:mua|chọn|tìm).*(?:ở đâu|loại nào|hãng nào)/,
    /(?:sản phẩm|vật liệu).*(?:tốt|chất lượng|phù hợp)/,
    /(?:giá|chi phí).*(?:keo|sơn|vật liệu)/,
    /(?:thương hiệu|hãng).*(?:nào|tốt|uy tín)/,
    /(?:có nên|nên dùng).*(?:keo|sơn|vật liệu)/
  ];
  
  // Kiểm tra keywords
  const hasProductKeyword = productKeywords.some(keyword => 
    message.includes(keyword)
  );
  
  // Kiểm tra intent patterns
  const hasProductIntent = intentPatterns.some(pattern => 
    pattern.test(message)
  );
  
  return hasProductKeyword || hasProductIntent;
};

/**
 * Extract từ khóa sản phẩm từ câu hỏi của người dùng
 * @param {string} userMessage Tin nhắn của người dùng
 * @returns {Array} Danh sách từ khóa sản phẩm
 */
export const extractProductKeywordsFromQuery = (userMessage) => {
  if (!userMessage || typeof userMessage !== 'string') {
    return [];
  }
  
  const message = userMessage.toLowerCase();
  
  // Common product categories với từ khóa tìm kiếm tốt hơn
  const productMappings = {
    'keo': ['keo sikaflex', 'keo trám', 'keo dán gạch'],
    'sơn': ['sơn chống thấm', 'sơn nippon', 'sơn jotun'],
    'chống thấm': ['sơn chống thấm', 'màng chống thấm', 'keo chống thấm'],
    'gạch': ['gạch ốp lát', 'gạch ceramic', 'gạch granite'],
    'xi măng': ['xi măng portland', 'xi măng xây dựng'],
    'cửa': ['cửa nhôm kính', 'cửa gỗ', 'cửa sắt'],
    'thép': ['thép xây dựng', 'thép việt đức', 'thép hoà phát'],
    'ống': ['ống nhựa', 'ống inox', 'ống đồng'],
    'điện': ['dây điện', 'công tắc điện', 'ổ cắm điện']
  };
  
  const extractedProducts = [];
  
  // Tìm các category matches
  Object.keys(productMappings).forEach(category => {
    if (message.includes(category)) {
      extractedProducts.push(...productMappings[category]);
    }
  });
  
  // Nếu không tìm thấy category cụ thể, extract từ general keywords
  if (extractedProducts.length === 0) {
    const generalProducts = [
      'vật liệu xây dựng',
      'sản phẩm sửa chữa nhà',
      'thiết bị xây dựng'
    ];
    extractedProducts.push(...generalProducts);
  }
  
  // Remove duplicates và limit
  return [...new Set(extractedProducts)].slice(0, 3);
};