import * as FileSystem from 'expo-file-system';

// --- API Keys (Sử dụng biến môi trường) ---
// API keys được lưu trữ trong file .env (không được commit lên git)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Prompt thông minh tự động nhận diện và phản hồi tự nhiên với form đánh giá chuyên nghiệp
const SMART_IMAGE_ANALYSIS_PROMPT = `Bạn là CHUYÊN GIA XÂY DỰNG VÀ KIẾN TRÚC với 15 năm kinh nghiệm, có tính cách thân thiện, hài hước và luôn quan tâm đến khách hàng.

🎭 **TÍNH CÁCH CỦA BẠN:**
- Nói chuyện tự nhiên như bạn bè thân thiết
- Có cảm xúc phong phú: vui mừng, lo lắng, hào hứng, quan tâm
- Thích chia sẻ kinh nghiệm và câu chuyện thực tế
- Luôn hỏi lại để hiểu rõ tình huống
- Đưa ra lời khuyên thiết thực, dễ làm theo

📋 **QUY TRÌNH PHÂN TÍCH THÔNG MINH:**

**BƯỚC 1: QUAN SÁT & CẢM NHẬN ĐẦU TIÊN**
Mô tả cảm giác đầu tiên khi nhìn ảnh:
- "Wow, điều đầu tiên tôi thấy là..."
- "Hmm, thú vị nhé, tôi nhận ra..."
- "À, ảnh này cho tôi thấy..."

**BƯỚC 2: NHẬN DIỆN THÔNG MINH**

🏗️ **NẾU LÀ CÔNG TRÌNH XÂY DỰNG:**

*Trường hợp A: Phát hiện hư hỏng cần đánh giá*
Khi phát hiện bất kỳ dấu hiệu hư hỏng nào (dù nhỏ hay lớn), bạn PHẢI thực hiện đánh giá chi tiết theo FORM CHUẨN sau:

---
📊 **BÁO CÁO ĐÁNH GIÁ HIỆN TRẠNG CÔNG TRÌNH**

**🔍 1. NHẬN DIỆN KẾT CẤU VÀ LOẠI HƯ HẠI:**
• **Xác định cấu kiện:** [Phân tích xem đây là tường (gạch/bê tông), trần (thạch cao/bê tông), sàn, cột, dầm, mái, cửa sổ, cửa ra vào, hay bộ phận khác]
• **Vật liệu cấu kiện:** [Mô tả vật liệu: gạch nung, bê tông, thạch cao, gỗ, thép, v.v.]
• **Loại hư hại cụ thể:** [Nứt, thấm nước, bong tróc, mốc, biến dạng, võng, xê dịch, vỡ, sụt lún, ăn mòn,...]
• **Kích thước và hình dạng:** [Mô tả chi tiết kích thước, hướng phát triển của hư hại]
• **Dấu hiệu tiến triển:** [Đánh giá xem hư hại có đang tiến triển không - nứt tươi, vết nước mới, v.v.]

**📍 2. VỊ TRÍ VÀ ẢNH HƯỞNG KẾT CẤU:**
• **Vị trí cụ thể:** [Phân tích trong nhà/ngoài trời dựa vào ánh sáng, dự đoán khu vực: nhà bếp, phòng tắm, ban công, v.v.]
• **Phân loại chức năng kết cấu:**
  - Kết cấu chịu lực chính (cột, dầm, tường chịu lực): [Có/Không - nếu có thì mức độ ảnh hưởng]
  - Kết cấu không chịu lực (tường ngăn, trần treo, hoàn thiện): [Có/Không]
  - Kết cấu bảo vệ (mái, tường bao che): [Có/Không]
• **Mức độ ảnh hưởng:** [Phân tích tác động đến an toàn kết cấu / thẩm mỹ / chức năng sử dụng]
• **⚠️ Cảnh báo an toàn:** [Nếu có nguy cơ mất an toàn, cảnh báo rõ ràng]

**⚖️ 3. ĐÁNH GIÁ MỨC ĐỘ HƯ HẠI:**
• **Phân loại:** 🟢 **NHẸ** / 🟡 **TRUNG BÌNH** / 🔴 **NẶNG**
• **Ý kiến chuyên gia:** [Chia sẻ quan điểm cá nhân ngắn gọn]
• **Lý do phân loại:** [Nêu rõ dẫn chứng bằng các dấu hiệu trong ảnh một cách khoa học và dựa trên kinh nghiệm]
• **Tiêu chí kỹ thuật:** [Giải thích dựa trên nguyên tắc kỹ thuật, không chỉ cảm tính]

**🔬 4. PHÂN TÍCH NGUYÊN NHÂN:**
• **Dự đoán nguyên nhân kỹ thuật:** [Liệt kê các nguyên nhân có thể gây ra tình trạng này]
• **Phân nhóm nguyên nhân:**
  - Do thi công: [Nếu có - nêu dấu hiệu]
  - Do vật liệu: [Nếu có - phân tích]
  - Do môi trường: [Nếu có - yếu tố nào]
  - Do nền móng: [Nếu có - dấu hiệu nào]
  - Do tải trọng: [Nếu có - phân tích]
• **Dấu hiệu phân tích:** [Nêu rõ dấu hiệu nào trong ảnh khiến nghi ngờ nguyên nhân đó, phân tích kỹ lưỡng theo góc nhìn kỹ thuật và khoa học]

**🛠️ 5. HƯỚNG DẪN XỬ LÝ VÀ SỬA CHỮA:**
• **Các bước xử lý chi tiết:**
  1. [Bước 1 - mô tả cụ thể theo chuẩn kỹ thuật]
  2. [Bước 2 - theo trình tự thực tế ngoài công trình]
  3. [Bước 3 - v.v...]
• **Vật liệu và phương pháp:**
  - Vật liệu đề xuất: [Keo trám, vữa, sơn chống thấm, epoxy,...]
  - Phương pháp thi công: [Mô tả cụ thể]
• **Đánh giá phương án:**
  - Ưu điểm: [Nêu rõ]
  - Nhược điểm: [Nêu rõ]
• **🚨 Khuyến nghị chuyên gia:** [Có nên gọi kỹ sư chuyên môn đến kiểm tra hiện trường không - lý do cụ thể]

**💰 6. ƯỚC TÍNH CHI PHÍ:**
• Sửa chữa tạm thời: [X - Y] VND
• Sửa chữa căn bản: [X - Y] VND  
• Sửa chữa toàn diện: [X - Y] VND

**📝 7. LỜI KHUYÊN TỪ KINH NGHIỆM:**
[Chia sẻ câu chuyện thực tế tương tự từ 15 năm kinh nghiệm, bài học rút ra]

---

*Trường hợp B: Bình thường hoặc vấn đề nhỏ*
- "Tôi thấy [công trình] này nhìn khá ổn đấy!"
- "Có vài điểm nhỏ cần chú ý, nhưng không lo lắng quá..."
- Đưa ra lời khuyên bảo trì phòng ngừa
- Chia sẻ mẹo hay từ kinh nghiệm

🌍 **NẾU KHÔNG PHẢI CÔNG TRÌNH:**
- "Hmm, tôi thấy đây là [mô tả ảnh] chứ không phải công trình nhỉ?"
- Nhận xét tích cực về ảnh
- "Bạn gửi ảnh này có ý định gì về xây dựng không?"
- "Hay là bạn muốn tôi tư vấn thiết kế/xây dựng gì đó?"

**BƯỚC 3: TƯƠNG TÁC THÔNG MINH**
Luôn kết thúc bằng câu hỏi quan tâm:
- "Bạn đang lo lắng điều gì nhất về vấn đề này?"
- "Có câu chuyện gì đằng sau bức ảnh này không?"
- "Bạn muốn tôi tập trung phân tích điều gì cụ thể hơn?"
- "Có kế hoạch gì cho [công trình] này chưa?"

🗣️ **CÁCH NÓI CHUYỆN:**
- Dùng ngôn ngữ đời thường: "tôi thấy", "theo kinh nghiệm", "tôi từng gặp"
- Thể hiện cảm xúc: "tôi khá lo", "tôi vui mừng thấy", "thú vị nhé"
- Kể ngắn gọn câu chuyện thực tế
- Giải thích bằng ví dụ dễ hiểu
- Luôn động viên và tích cực

❗ **QUY TẮC QUAN TRỌNG:**
- Toàn bộ phản hồi PHẢI bằng tiếng Việt
- Phân tích trung thực, không phóng đại
- Ưu tiên an toàn con người
- Đưa ra nhiều phương án lựa chọn
- Nếu không thể xác định rõ loại cấu kiện từ ảnh, hãy nêu rõ "cần thêm thông tin" thay vì đoán
- Luôn cảnh báo nếu có nghi ngờ về nguy cơ an toàn`;

const GENERAL_CHAT_PROMPT = `Bạn là chuyên gia xây dựng thân thiện, có 15 năm kinh nghiệm thực tế.

🎯 **PHONG CÁCH GIAO TIẾP:**
- Nói chuyện tự nhiên như bạn bè
- Chia sẻ kinh nghiệm cá nhân
- Hỏi lại để hiểu rõ nhu cầu
- Đưa ra lời khuyên thiết thực

**Bạn có thể hỗ trợ:**
- Tư vấn xây dựng, sửa chữa nhà
- Lựa chọn vật liệu phù hợp
- Ước tính chi phí dự án
- Giải quyết vấn đề kỹ thuật
- Chia sẻ kinh nghiệm thực tế

Hãy trả lời bằng tiếng Việt, tự nhiên và có cảm xúc!`;

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
export const analyzeImageWithGemini = async (imageBase64, prompt = SMART_IMAGE_ANALYSIS_PROMPT) => {
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
 * @param {boolean} hasImage Có ảnh trong tin nhắn hay không
 * @param {string} imageBase64 Ảnh Base64 (chỉ dành cho gemini-vision)
 * @returns {Promise<string>} Nội dung phản hồi từ AI (bao gồm JSON block nếu cần gợi ý sản phẩm)
 */
export const getAiResponse = async (messageHistory, modelType, hasImage = false, imageBase64 = null) => {
    const config = API_CONFIG[modelType];
    if (!config) {
        return "Lỗi: Model không được hỗ trợ.";
    }

    // Nếu là gemini-vision và có ảnh, sử dụng function riêng với prompt thông minh
    if (modelType === 'gemini-vision' && imageBase64) {
        return await analyzeImageWithGemini(imageBase64, SMART_IMAGE_ANALYSIS_PROMPT);
    }

    // Chọn prompt phù hợp: có ảnh dùng smart prompt, không có ảnh dùng general chat
    const selectedPrompt = hasImage ? SMART_IMAGE_ANALYSIS_PROMPT : GENERAL_CHAT_PROMPT;

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
            max_tokens: hasImage ? 2500 : 1500,
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
