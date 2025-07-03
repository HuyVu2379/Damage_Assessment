// --- API Keys (Sử dụng biến môi trường) ---
// API keys được lưu trữ trong file .env (không được commit lên git)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const DAMAGE_ANALYSIS_PROMPT = `Tôi sẽ cung cấp hình ảnh một vị trí hư hại trong công trình xây dựng (nhà dân dụng hoặc công trình nhỏ).

Hãy phân tích kỹ hình ảnh này và trả lời thật chi tiết, kỹ thuật, theo đúng 5 nội dung sau:


1. Loại hư hại:
 • Đây là loại hư hại gì (nứt, thấm, bong tróc, mốc, võng trần, vỡ gạch, xê dịch kết cấu,…)?
 • Mô tả hình dạng, kích thước, hướng phát triển của vết nứt/hư hại đó.
 • Có dấu hiệu gì cho thấy hư hại này đang tiếp tục phát triển hay không?

2. Vị trí và loại cấu kiện bị ảnh hưởng:
 • Đây là tường trong, tường ngoài, trần, sàn, móng,…?
 • Có khả năng là tường chịu lực hay không?
 • Có nguy cơ ảnh hưởng kết cấu hay chỉ ảnh hưởng thẩm mỹ?


3. Mức độ hư hại:
 • Phân loại mức độ: Nhẹ / Trung bình / Nặng.
 • Nêu rõ lý do tại sao phân loại như vậy.
 • Nếu có nguy cơ mất an toàn công trình, hãy nêu rõ cảnh báo.


4. Nguyên nhân tiềm ẩn:
 • Dự đoán các nguyên nhân kỹ thuật có thể gây ra tình trạng này.
 • Nếu có thể, phân nhóm nguyên nhân: do thi công – do vật liệu – do môi trường – do nền móng – do tải trọng.
 • Nêu rõ dấu hiệu nào trong ảnh khiến bạn nghi ngờ nguyên nhân đó.


5. Hướng dẫn xử lý và sửa chữa:
 • Mô tả từng bước xử lý chi tiết, theo trình tự thực tế ngoài công trình.
 • Gợi ý vật liệu và phương pháp phù hợp: keo trám, vữa, sơn chống thấm, epoxy,…
 • Nếu có nhiều phương án, hãy liệt kê ưu – nhược điểm ngắn gọn.
 • Đưa ra khuyến nghị có nên gọi kỹ sư chuyên môn đến kiểm tra hiện trường không.

6. Đề xuất sản phẩm cụ thể:
 • Liệt kê tối thiểu 3-5 sản phẩm phù hợp với từng bước sửa chữa.
 • Mỗi sản phẩm phải bao gồm:
   - Tên sản phẩm đầy đủ và thương hiệu
   - Mô tả ngắn gọn về công dụng
   - Giá ước tính (VND)
   - Link mua hàng thực tế trên Shopee, Lazada, Tiki
   - URL hình ảnh sản phẩm thực tế

**QUAN TRỌNG về link và hình ảnh:**
- Chỉ sử dụng link và hình ảnh thực tế từ các sàn TMĐT Việt Nam
- Ví dụ link Shopee: https://shopee.vn/Qu%E1%BA%A7n-%E1%BB%90ng-R%E1%BB%99ng-N%E1%BB%AF-K%E1%BA%BB-S%E1%BB%8Dc-Nhi%E1%BB%81u-M%C3%A0u-Ulzzang-Qu%E1%BA%A7n-D%C3%A0i-%E1%BB%90ng-Su%C3%B4ng-L%C6%B0ng-Cao-C%E1%BA%A1p-Chun-D%C3%A2y-R%C3%BAt-Ch%E1%BA%A5t-Li%E1%BB%87u-Tho%C3%A1ng-M%C3%A1t-D%E1%BB%85-Mix-%C4%90%E1%BB%93-i.29154879.24393661368?sp_atk=07e68f46-291b-4685-b777-912ec8e41c45&xptdk=07e68f46-291b-4685-b777-912ec8e41c45
- Ví dụ link Lazada: https://www.lazada.vn/products/non-bao-hiem-son-nham-nua-dau-thoi-trang-thong-gio-free-size-nam-nu-i2593752397-s12628802430.html?pvid=c329df0f-943a-40a3-9ee6-cea204b3ac1e&search=jfy&scm=1007.17519.386432.0&priceCompare=skuId%3A12628802430%3Bsource%3Atpp-recommend-plugin-32104%3Bsn%3Ac329df0f-943a-40a3-9ee6-cea204b3ac1e%3BoriginPrice%3A39000%3BdisplayPrice%3A39000%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1751517033380&spm=a2o4n.homepage.just4u.d_2593752397
- Ví dụ link Tiki: https://tiki.vn/du-khao-ruc-ro-sac-mau-trang-phuc-phu-nu-cac-dan-toc-viet-nam-p277314374.html?spid=277314376
- URL hình ảnh phải là link trực tiếp đến file ảnh (.jpg, .png, .webp, png)
- Ví dụ: https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m8a2chhr2yis15.webp hoặc https://salt.tikicdn.com/cache/750x750/ts/product/79/09/af/cca9b13f9317c35ecb79f764d1016206.jpg.webp

Trình bày dưới dạng các tiêu đề rõ ràng, dễ hiểu, như một báo cáo đánh giá hiện trạng kỹ thuật.
Tránh dùng thuật ngữ quá phức tạp trừ khi cần thiết.

**Lưu ý đặc biệt về format đề xuất sản phẩm:**
BẮT BUỘC kết thúc phản hồi bằng JSON block chứa thông tin sản phẩm thực tế như mẫu sau:
\`\`\`json
{
  "products": [
    {
      "name": "Keo trám tường Sikaflex-11FC",
      "brand": "Sika",
      "description": "Keo trám chống thấm đàn hồi cao, phù hợp cho các vết nứt nhỏ",
      "estimatedPrice": "85,000 - 120,000 VND",
      "purchaseLink": "https://shopee.vn/keo-tram-tuong-sikaflex-11fc-i.123456789.987654321",
      "imageUrl": "https://cf.shopee.vn/file/vn-11134207-7r98o-lp2abc123xyz.jpg",
      "category": "Keo trám"
    }
  ]
}
\`\`\`

📝 Ghi chú:

Bạn có thể thêm phần mở đầu như sau nếu cần cụ thể hóa thêm bối cảnh:

 • Đây là công trình nhà ở dân dụng, tuổi đời 10 năm, nền đất yếu.
 • Vết nứt nằm gần nhà tắm hoặc cửa sổ, có dấu hiệu bị ẩm kéo dài.
 • Tôi nghi ngờ có lún nền hoặc thấm nước từ phòng tắm.`;




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