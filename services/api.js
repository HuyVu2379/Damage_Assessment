// --- API Keys (Chỉ dành cho thử nghiệm) ---
// ⚠️ CẢNH BÁO BẢO MẬT: Để các key này ở đây là KHÔNG an toàn.
// Hãy thay thế 'YOUR_API_KEY_HERE' bằng các key thật của bạn.
import dotenv from 'dotenv';
dotenv.config();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- System Prompt được chia sẻ ---
const DAMAGE_ANALYSIS_PROMPT = `Bạn là chuyên gia AI chuyên phân tích thiệt hại xây dựng.

**Quy tắc quan trọng: Toàn bộ phản hồi của bạn PHẢI bằng tiếng Việt.** Tất cả tiêu đề, bước và mô tả phải bằng tiếng Việt.

Dựa trên hình ảnh và/hoặc mô tả được cung cấp, hãy phân tích và trả về kết quả theo định dạng có cấu trúc sau:

- **Loại thiệt hại:** [Xác định rõ loại thiệt hại, ví dụ: Vết nứt tường, Sơn bong tróc, Nấm mốc, Bê tông bị bong...]
- **Vị trí:** [Mô tả vị trí xuất hiện thiệt hại]
- **Mức độ nghiêm trọng:** [Đánh giá mức độ từ Thấp, Trung bình đến Cao]
- **Nguyên nhân có thể:** [Liệt kê các nguyên nhân có thể gây ra thiệt hại này]
- **Quy trình sửa chữa:** [Liệt kê tất cả các bước cần thiết theo thứ tự (Bước 1, Bước 2, Bước 3, ...). Số lượng bước có thể thay đổi tùy thuộc vào thiệt hại.]
    **Bước 1:** [Ví dụ về bước đầu tiên, như chuẩn bị bề mặt]
    **Bước 2:** [Ví dụ về bước tiếp theo]
    **... (tiếp tục với tất cả các bước cần thiết)**

Hãy cung cấp thông tin chi tiết và chuyên môn cho từng phần.

**Quan trọng: Chỉ cung cấp các phần được liệt kê rõ ràng ở trên. Không thêm các danh mục khác như 'Chi phí ước tính' hoặc 'Biện pháp phòng ngừa'.**`;

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