import * as FileSystem from 'expo-file-system';

// --- API Keys (Sử dụng biến môi trường) ---
// API keys được lưu trữ trong file .env (không được commit lên git)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// SerpAPI Configuration
const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_API_BASE_URL = 'https://serpapi.com/search';

// Import optimized logger
const log = __DEV__ ? console.log : () => { };
const error = __DEV__ ? console.error : () => { };

const DAMAGE_ANALYSIS_PROMPT = `Bạn là chuyên gia xây dựng thân thiện với 15 năm kinh nghiệm thực tế.

Nếu là CÔNG TRÌNH XÂY DỰNG:

🔍 PHÂN TÍCH CHUYÊN SÂU:

1. NHẬN DIỆN CẤU KIỆN & HƯ HẠI:
- Loại cấu kiện: tường (gạch/bê tông), trần, sàn, cột, dầm, mái, cửa.
- Vật liệu: gạch nung, bê tông, thạch cao, gỗ, thép, v.v.
- Hư hại: nứt, thấm nước, bong tróc, mốc, biến dạng, võng, xê dịch.
- Mô tả chi tiết: kích thước, hình dạng và dấu hiệu tiến triển.

2. VỊ TRÍ & ẢNH HƯỞNG KẾT CẤU:
- Vị trí: trong/ngoài nhà, khu vực cụ thể (nhà bếp, phòng tắm, ban công...).
- Loại cấu kiện: kết cấu chịu lực chính / không chịu lực / bảo vệ.
- Mức độ ảnh hưởng: an toàn kết cấu / thẩm mỹ / chức năng sử dụng.

3. ĐÁNH GIÁ MỨC ĐỘ:
- Phân loại: NHẸ / TRUNG BÌNH / NẶNG.
- Lý do phân loại: dựa trên dấu hiệu trong ảnh.
- Cảnh báo: đưa ra nếu có nguy cơ mất an toàn.

4. PHÂN TÍCH NGUYÊN NHÂN:
- Dự đoán nguyên nhân kỹ thuật: liệt kê khả năng.
- Nhóm nguyên nhân:
  + Do thi công: nếu có, nêu dấu hiệu cụ thể.
  + Do vật liệu: phân tích kỹ thuật rõ ràng.
  + Do môi trường: yếu tố thời tiết, độ ẩm, nhiệt độ...
  + Do nền móng: nếu nghi ngờ, chỉ rõ dấu hiệu.
  + Do tải trọng: nếu có, phân tích liên quan.
- Dấu hiệu phân tích: liên hệ cụ thể từ ảnh, giải thích theo góc nhìn kỹ thuật.

5. HƯỚNG DẪN XỬ LÝ:
- Trình bày 3 bước xử lý rõ ràng, đúng kỹ thuật.
- Vật liệu đề xuất: keo trám, vữa, sơn chống thấm, epoxy...
- Nêu rõ phương pháp thi công.
- Có khuyến nghị gọi kỹ sư nếu cần thiết.

Nếu KHÔNG PHẢI CÔNG TRÌNH:
- Trò chuyện tự nhiên, mô tả ảnh tích cực, liên kết tới xây dựng nếu có thể.

⚠️ QUY TẮC QUAN TRỌNG:
- Mỗi phần trả lời chỉ 2–3 dòng, súc tích và thực tế.
- Phân tích trung thực, không phóng đại.
- Ưu tiên yếu tố an toàn. Nếu không rõ, hãy nói: “Cần thêm thông tin.”
- Luôn cảnh báo nếu có dấu hiệu nguy hiểm tiềm ẩn.

KẾT THÚC bằng danh sách sản phẩm cần dùng như là:
"Sản phẩm cần: Keo Sikaflex, Sơn chống thấm Nippon, Vải thủy tinh."

KHÔNG viết thừa. Trả lời NGẮN GỌN, SÁT THỰC TẾ.`;


const GENERAL_CHAT_PROMPT = `
Bạn là chuyên gia xây dựng thân thiện, có kinh nghiệm thực tế tại Việt Nam.

🌟 ** PHONG CÁCH GIAO TIẾP **:
- Nói chuyện tự nhiên như bạn bè
  - Chia sẻ kinh nghiệm cá nhân
    - Hỏi lại để hiểu rõ nhu cầu
      - Đưa ra lời khuyên thiết thực

📌 ** HỖ TRỢ **:
- Tư vấn xây dựng, sửa chữa nhà
  - Lựa chọn vật liệu phù hợp
    - Ước tính chi phí dự án
      - Giải quyết vấn đề kỹ thuật
        - Chia sẻ kinh nghiệm thực tế

Trả lời ngắn gọn(3 đoạn), bằng tiếng Việt, tự nhiên và có cảm xúc!`;

const API_CONFIG = {
  'gemini-vision': {
    endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    apiKey: GEMINI_API_KEY,
  }
};

/**
 * Phân tích ảnh với Gemini Pro Vision
 * @param {string} imageBase64 Ảnh đã được encode thành Base64
 * @param {string} prompt Prompt để phân tích ảnh (mặc định là phân tích tổng quát)
 * @returns {Promise<string>} Kết quả phân tích ảnh
 */
export const responseText = async (messageHistory) => {
  const config = API_CONFIG['gemini-vision'];

  try {
    // Tạo contents với prompt hệ thống và nội dung user
    const contents = [
      {
        parts: [{ text: GENERAL_CHAT_PROMPT + "\n\nCâu hỏi: " + messageHistory[0].content }],
        role: 'user'
      }
    ];

    const body = JSON.stringify({
      contents: contents
    });

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Chi tiết lỗi:', errorData);
      throw new Error(`Lỗi API: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiMessage = data.candidates[0]?.content?.parts[0]?.text?.trim();

    if (!aiMessage) {
      throw new Error("Không nhận được nội dung hợp lệ từ AI.");
    }

    console.log('Phản hồi từ AI:', aiMessage);
    return aiMessage;

  } catch (error) {
    console.error('Lỗi khi chat với AI:', error);
    throw error;
  }
}
export const analyzeImageWithGemini = async (imageBase64, prompt = DAMAGE_ANALYSIS_PROMPT, messageHistory = []) => {
  const config = API_CONFIG['gemini-vision'];

  try {
    // Loại bỏ data URL prefix nếu có
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // Chuẩn bị nội dung cho AI
    const parts = [
      { text: prompt }
    ];

    // Thêm context từ lịch sử chat nếu có
    if (messageHistory && messageHistory.length > 0) {
      const contextText = "\n\nNGỮ CẢNH CUỘC TRÒ CHUYỆN:\n" +
        messageHistory.map(msg => `${msg.role === 'user' ? 'Người dùng' : 'AI'}: ${msg.content}`).join('\n') +
        "\n\nVui lòng phân tích ảnh với ngữ cảnh trên và trả lời phù hợp:";
      parts[0].text += contextText;
    }

    // Thêm ảnh
    parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: base64Data
      }
    });

    const body = JSON.stringify({
      contents: [
        {
          parts: parts
        }
      ]
    });
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Chi tiết lỗi Gemini Vision:', errorData);
      throw new Error(`Lỗi API Gemini Vision: ${errorData.error?.message || 'Unknown error'}`);
    }
    const data = await response.json();
    const aiMessage = data.candidates[0]?.content?.parts[0]?.text?.trim();
    if (!aiMessage) {
      throw new Error("Không nhận được nội dung hợp lệ từ Gemini Vision.");
    }

    console.log('Phân tích ảnh thành công:', aiMessage);
    return aiMessage;

  } catch (error) {
    console.error('Lỗi khi phân tích ảnh với Gemini Vision:', error);
    return `Xin lỗi, đã có lỗi xảy ra khi phân tích ảnh: ${error.message}`;
  }
};

/**
 * Lấy phản hồi từ model AI được chọn
 * @param {string} content Nội dung yêu cầu cần gửi tới AI
 * @param {'groq' | 'gemini' | 'gemini-vision'} modelType Loại model để sử dụng
 * @param {boolean} hasImage Có ảnh trong tin nhắn hay không
 * @param {string} imageBase64 Ảnh Base64 (chỉ dành cho gemini-vision)
 * @returns {Promise<string>} Nội dung phản hồi từ AI (bao gồm JSON block nếu cần gợi ý sản phẩm)
 */
export const getAiResponse = async (content, modelType, hasImage = false, imageBase64 = null) => {
  const config = API_CONFIG[modelType];
  if (!config) {
    return "Lỗi: Model không được hỗ trợ.";
  }

  try {
    if (hasImage && imageBase64) {
      // Xử lý ảnh với Gemini Vision
      return await analyzeImageWithGemini(imageBase64, DAMAGE_ANALYSIS_PROMPT, []);
    } else {
      // Xử lý chat text thuần - tạo messageHistory đơn giản từ content
      const messageHistory = [{ role: 'user', content: content }];
      return await responseText(messageHistory);
    }
  } catch (error) {
    console.error('Lỗi trong getAiResponse:', error);
    return `Xin lỗi, đã có lỗi xảy ra: ${error.message}`;
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