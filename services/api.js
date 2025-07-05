import * as FileSystem from 'expo-file-system';

// --- API Keys (Sử dụng biến môi trường) ---
// API keys được lưu trữ trong file .env (không được commit lên git)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Prompt cho phân tích ảnh tổng quát
const IMAGE_ANALYSIS_PROMPT = `Ảnh này có gì? Trả lời bằng cách liệt kê tên từng vật thể nhìn thấy kèm vị trí (trái, phải, giữa,...). Đừng phỏng đoán nếu không chắc chắn.`;

const DAMAGE_ANALYSIS_PROMPT = `BẠN LÀ CHUYÊN GIA KIỂM ĐỊNH CÔNG TRÌNH XÂY DỰNG.

NHIỆM VỤ: Phân tích tình trạng các cấu kiện xây dựng trong ảnh.

BƯỚC 1: NHẬN DIỆN CẤU KIỆN
Xác định các cấu kiện xây dựng có trong ảnh:
- Tường (gạch, bê tông, thạch cao)
- Trần nhà (bê tông, thạch cao, tấm lợp)
- Sàn (gạch men, bê tông, gỗ)
- Cột, dầm (bê tông cốt thép, thép)
- Mái, khung kết cấu

BƯỚC 2: ĐÁNH GIÁ TÌNH TRẠNG
Cho mỗi cấu kiện, phân loại:

✅ **BÌNH THƯỜNG**: Không có dấu hiệu hư hỏng
- Bề mặt phẳng, không nứt
- Màu sắc đồng đều
- Không có vết ẩm mốc

⚠️ **HƯ HỎNG NHẸ**: 
- Nứt nhỏ (< 2mm)
- Bong tróc sơn nhẹ
- Ẩm mốc cục bộ
- Phai màu

🚨 **HƯ HỎNG NẶNG**:
- Nứt lớn (> 2mm)
- Bong tróc vữa/bê tông
- Thấm nước rõ rệt
- Cong vênh, sụt lún

BƯỚC 3: TRẢ LỜI
Format: 
**[Tên cấu kiện]**: [Tình trạng] - [Mô tả chi tiết]

VÍ DỤ:
**Tường gạch**: ✅ BÌNH THƯỜNG - Tường có màu trắng đồng đều, bề mặt phẳng, không có vết nứt hay ẩm mốc.
**Trần bê tông**: ⚠️ HƯ HỎNG NHẸ - Có một số vết nứt nhỏ dài khoảng 30cm, cần theo dõi.

QUAN TRỌNG: Hãy phân tích thật kỹ và trung thực về tình trạng thực tế của từng cấu kiện.`;


const GENERAL_CHAT_PROMPT = `Bạn là trợ lý AI thông minh và hữu ích chuyên về xây dựng và bảo trì công trình.

**Quy tắc quan trọng: Toàn bộ phản hồi của bạn PHẢI bằng tiếng Việt.**

Bạn có thể hỗ trợ người dùng với:
- Câu hỏi chung về xây dựng và kiến trúc
- Tư vấn bảo trì và bảo dưỡng công trình
- Gợi ý về vật liệu xây dựng
- Kỹ thuật thi công xây dựng
- Hướng dẫn an toàn lao động
- Quy chuẩn và tiêu chuẩn xây dựng
- Lập kế hoạch dự án xây dựng
- Giải thích thuật ngữ kỹ thuật

Hãy cung cấp câu trả lời hữu ích, chính xác và chi tiết bằng tiếng Việt. Nếu câu hỏi không liên quan đến xây dựng, hãy lịch sự chuyển hướng cuộc trò chuyện trở lại chủ đề xây dựng.`;

const API_CONFIG = {
    groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: GROQ_API_KEY,
        model: 'llama3-70b-8192',
    },
    gemini: {
        endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        apiKey: GEMINI_API_KEY,
    },
    'gemini-vision': {
        endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        apiKey: GEMINI_API_KEY,
    }
};

/**
 * Phân tích ảnh với Gemini Pro Vision
 * @param {string} imageBase64 Ảnh đã được encode thành Base64
 * @param {string} prompt Prompt để phân tích ảnh (mặc định là phân tích tổng quát)
 * @returns {Promise<string>} Kết quả phân tích ảnh
 */
export const analyzeImageWithGemini = async (imageBase64, prompt = IMAGE_ANALYSIS_PROMPT) => {
    const config = API_CONFIG['gemini-vision'];
    
    try {
        // Loại bỏ data URL prefix nếu có
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        
        const body = JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Data
                            }
                        }
                    ]
                }
            ]
        });

        console.log('Đang gửi ảnh đến Gemini Pro Vision...');
        
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
        console.log('Response từ Gemini Vision:', data);
        
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
 * Chuyển đổi ảnh sang Base64
 * @param {string} uri URI của ảnh
 * @returns {Promise<string>} Ảnh đã được encode thành Base64
 */
export const convertImageToBase64 = async (uri) => {
    try {
        console.log('Đang chuyển đổi ảnh sang Base64:', uri);
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        console.log('Chuyển đổi Base64 thành công');
        return base64;
    } catch (error) {
        console.error('Lỗi khi chuyển đổi ảnh sang Base64:', error);
        throw error;
    }
};

/**
 * Lấy phản hồi từ model AI được chọn
 * @param {Array} messageHistory Lịch sử cuộc trò chuyện (chỉ chứa role 'user' và 'assistant')
 * @param {'groq' | 'gemini' | 'gemini-vision'} modelType Loại model để sử dụng
 * @param {boolean} isDamageAnalysis Có phải là phân tích hư hỏng (có ảnh) hay không
 * @param {string} imageBase64 Ảnh Base64 (chỉ dành cho gemini-vision)
 * @returns {Promise<string>} Nội dung phản hồi từ AI (bao gồm JSON block nếu là phân tích hư hỏng)
 */
export const getAiResponse = async (messageHistory, modelType, isDamageAnalysis = false, imageBase64 = null) => {
    const config = API_CONFIG[modelType];
    if (!config) {
        return "Lỗi: Model không được hỗ trợ.";
    }

    // Nếu là gemini-vision và có ảnh, sử dụng function riêng
    if (modelType === 'gemini-vision' && imageBase64) {
        const prompt = isDamageAnalysis ? DAMAGE_ANALYSIS_PROMPT : IMAGE_ANALYSIS_PROMPT;
        return await analyzeImageWithGemini(imageBase64, prompt);
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
        console.error(`Lỗi khi gọi API ${modelType}:`, error);
        return `Xin lỗi, đã có lỗi xảy ra khi kết nối đến ${modelType}.`;
    }
};

/**
 * Trích xuất thông tin sản phẩm từ phản hồi AI
 * @param {string} aiResponse Phản hồi từ AI
 * @returns {Object} Đối tượng chứa nội dung phân tích và danh sách sản phẩm
 */
export const parseProductSuggestions = (aiResponse) => {
    console.log('Đang parse sản phẩm từ phản hồi AI...');

    try {
        // Tìm JSON block trong phản hồi
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);

        if (jsonMatch && jsonMatch[1]) {
            console.log('Tìm thấy JSON block:', jsonMatch[1]);

            const productData = JSON.parse(jsonMatch[1]);
            console.log('Dữ liệu sản phẩm đã parse:', productData);

            // Tách nội dung phân tích (loại bỏ JSON block)
            const analysisContent = aiResponse.replace(/```json\s*[\s\S]*?\s*```/, '').trim();

            const result = {
                analysis: analysisContent,
                products: productData.products || []
            };

            console.log('Kết quả parse:', result);
            return result;
        } else {
            console.log('Không tìm thấy JSON block trong phản hồi');
        }
    } catch (error) {
        console.error('Lỗi khi phân tích dữ liệu sản phẩm:', error);
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
    console.log('Đang validate dữ liệu sản phẩm:', products);

    if (!Array.isArray(products)) {
        console.log('Dữ liệu sản phẩm không phải là array');
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

    console.log('Sản phẩm đã validate:', validatedProducts);
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