// --- API Keys (Sử dụng biến môi trường) ---
// API keys được lưu trữ trong file .env (không được commit lên git)
import { GROQ_API_KEY, GEMINI_API_KEY } from '@env';
import * as FileSystem from 'expo-file-system';

// Import optimized logger
const log = __DEV__ ? console.log : () => {};
const error = __DEV__ ? console.error : () => {};

const DAMAGE_ANALYSIS_PROMPT = `
Bạn là kỹ sư xây dựng với 15 năm kinh nghiệm. Phân tích ảnh này theo 4 mục cụ thể bên dưới.

⚠️ QUY TẮC TRẢ LỜI:
- Trả lời cực ngắn gọn, mỗi phần dưới 4 dòng
- Không vòng vo, không định nghĩa thuật ngữ
- Tập trung vào chẩn đoán, giải pháp, sản phẩm
- Gợi ý thực tế và dễ áp dụng tại Việt Nam

----------------------------
1. NHẬN DIỆN VẤN ĐỀ:
• Loại hư hại: (1 dòng)
• Vị trí: (1 dòng)
• Kích thước và mức độ: (1 dòng)

2. NGUYÊN NHÂN:
• Nguyên nhân chính: (1 dòng)
• Dấu hiệu nhận biết: (1 dòng)

3. CÁCH XỬ LÝ:
• Bước 1: (1 dòng)
• Bước 2: (1 dòng)
• Bước 3: (1 dòng)
• Lưu ý: (nếu có)

4. GỢI Ý SẢN PHẨM:
• Gợi ý 2–3 sản phẩm cụ thể tại VN (tên + link + mô tả)

🎯 KẾT THÚC bằng block JSON chứa sản phẩm như sau:
\`\`\`json
{
  "products": [
    {
      "name": "Tên sản phẩm",
      "brand": "Thương hiệu", 
      "description": "Mô tả",
      "estimatedPrice": "Giá ~ VND",
      "purchaseLink": "Link Tiki/Lazada/Shopee",
      "imageUrl": "URL ảnh",
      "category": "Danh mục"
    }
  ]
}
\`\`\`

KHÔNG viết thừa, KHÔNG viết ngoài format. Trả lời NGẮN GỌN, SÁT THỰC TẾ.`;


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
 * Trích xuất thông tin sản phẩm từ phản hồi AI
 * @param {string} aiResponse Phản hồi từ AI
 * @returns {Object} Đối tượng chứa nội dung phân tích và danh sách sản phẩm
 */
export const parseProductSuggestions = (aiResponse) => {
    // Loại bỏ tất cả console.log để giảm lag terminal
    
    try {
        // Tìm JSON block trong phản hồi
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);

        if (jsonMatch && jsonMatch[1]) {
            const productData = JSON.parse(jsonMatch[1]);

            // Tách nội dung phân tích (loại bỏ JSON block)
            const analysisContent = aiResponse.replace(/```json\s*[\s\S]*?\s*```/, '').trim();

            const result = {
                analysis: analysisContent,
                products: productData.products || []
            };

            return result;
        }
    } catch (error) {
        // Chỉ log lỗi nghiêm trọng
        if (__DEV__) {
            error('Parse sản phẩm lỗi:', error.message);
        }
    }

    // Nếu không có JSON hoặc lỗi, trả về phản hồi nguyên bản
    return {
        analysis: aiResponse,
        products: []
    };
};

/**
 * Validate và format dữ liệu sản phẩm
 * @param {Array} products Danh sách sản phẩm
 * @returns {Array} Danh sách sản phẩm đã được validate và format
 */
export const validateProductData = (products) => {
    // Loại bỏ console.log để giảm lag terminal
    
    if (!Array.isArray(products)) {
        return [];
    }

    const validatedProducts = products.map(product => ({
        name: product.name || 'Không có tên',
        brand: product.brand || 'Không rõ thương hiệu',
        description: product.description || 'Không có mô tả',
        estimatedPrice: product.estimatedPrice || 'Liên hệ để biết giá',
        purchaseLink: validateUrl(product.purchaseLink) || '#',
        imageUrl: validateImageUrl(product.imageUrl) || 'https://via.placeholder.com/150x150?text=No+Image',
        category: product.category || 'Khác'
    }));

    return validatedProducts;
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