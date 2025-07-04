// --- API Keys (Sử dụng biến môi trường) ---
// API keys được lưu trữ trong file .env (không được commit lên git)
const GROQ_API_KEY = ""
const GEMINI_API_KEY = ""

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


Trình bày dưới dạng các tiêu đề rõ ràng, dễ hiểu, như một báo cáo đánh giá hiện trạng kỹ thuật.
Tránh dùng thuật ngữ quá phức tạp trừ khi cần thiết.


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
 * @returns {Promise<string>} Nội dung phản hồi từ AI
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
            max_tokens: 1500,
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