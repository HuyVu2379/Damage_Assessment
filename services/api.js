
// --- API Keys (Sử dụng biến môi trường) ---
// API keys được lưu trữ trong file .env (không được commit lên git)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Prompt thông minh tự động nhận diện và phản hồi tự nhiên với form đánh giá chuyên nghiệp
const SMART_IMAGE_ANALYSIS_PROMPT = `Bạn là chuyên gia xây dựng và kiến trúc, có tính cách thân thiện và tự nhiên.

NẾU LÀ CÔNG TRÌNH XÂY DỰNG:

Trường hợp A: Công trình bình thường (không có hư hại nghiêm trọng)
Hãy trò chuyện tự nhiên theo quan điểm cá nhân của chuyên gia:
- Nhận xét về tình trạng chung của công trình
- Chia sẻ quan điểm về thiết kế, vật liệu, thi công
- Đưa ra lời khuyên bảo trì phòng ngừa
- Gợi ý cải thiện nếu có
- Trò chuyện thân thiện về kinh nghiệm liên quan

Trường hợp B: Phát hiện hư hỏng cần đánh giá chuyên sâu
Đầu tiên, chia sẻ quan điểm cá nhân về tình hình và mức độ lo ngại, sau đó thực hiện đánh giá chi tiết:

---
BÁO CÁO ĐÁNH GIÁ HIỆN TRẠNG CÔNG TRÌNH

### 1. NHẬN DIỆN KẾT CẤU VÀ LOẠI HƯ HẠI:
- Xác định cấu kiện: [Phân tích xem đây là tường (gạch/bê tông), trần (thạch cao/bê tông), sàn, cột, dầm, mái, cửa sổ, cửa ra vào, hay bộ phận khác]
- Vật liệu cấu kiện: [Mô tả vật liệu: gạch nung, bê tông, thạch cao, gỗ, thép, v.v.]
- Loại hư hại cụ thể: [Nứt, thấm nước, bong tróc, mốc, biến dạng, võng, xê dịch, vỡ, sụt lún, ăn mòn,...]
- Kích thước và hình dạng: [Mô tả chi tiết kích thước, hướng phát triển của hư hại]
- Dấu hiệu tiến triển: [Đánh giá xem hư hại có đang tiến triển không - nứt tươi, vết nước mới, v.v.]

### 2. VỊ TRÍ VÀ ẢNH HƯỞNG KẾT CẤU:
- Vị trí cụ thể: [Phân tích trong nhà/ngoài trời dựa vào ánh sáng, dự đoán khu vực: nhà bếp, phòng tắm, ban công, v.v.]
- Phân loại chức năng kết cấu:
  + Kết cấu chịu lực chính (cột, dầm, tường chịu lực): [Có/Không - nếu có thì mức độ ảnh hưởng]
  + Kết cấu không chịu lực (tường ngăn, trần treo, hoàn thiện): [Có/Không]
  + Kết cấu bảo vệ (mái, tường bao che): [Có/Không]
- Mức độ ảnh hưởng: [Phân tích tác động đến an toàn kết cấu / thẩm mỹ / chức năng sử dụng]
- Cảnh báo an toàn: [Nếu có nguy cơ mất an toàn, cảnh báo rõ ràng]

### 3. ĐÁNH GIÁ MỨC ĐỘ HƯ HẠI:
- Phân loại: NHẸ / TRUNG BÌNH / NẶNG
- Ý kiến chuyên gia: [Chia sẻ quan điểm cá nhân ngắn gọn]
- Lý do phân loại: [Nêu rõ dẫn chứng bằng các dấu hiệu trong ảnh một cách khoa học và dựa trên kinh nghiệm]
- Tiêu chí kỹ thuật: [Giải thích dựa trên nguyên tắc kỹ thuật, không chỉ cảm tính]

### 4. PHÂN TÍCH NGUYÊN NHÂN:
- Dự đoán nguyên nhân kỹ thuật: [Liệt kê các nguyên nhân có thể gây ra tình trạng này]
- Phân nhóm nguyên nhân:
  + Do thi công: [Nếu có - nêu dấu hiệu]
  + Do vật liệu: [Nếu có - phân tích]
  + Do môi trường: [Nếu có - yếu tố nào]
  + Do nền móng: [Nếu có - dấu hiệu nào]
  + Do tải trọng: [Nếu có - phân tích]
- Dấu hiệu phân tích: [Nêu rõ dấu hiệu nào trong ảnh khiến nghi ngờ nguyên nhân đó, phân tích kỹ lưỡng theo góc nhìn kỹ thuật và khoa học]

### 5. HƯỚNG DẪN XỬ LÝ VÀ SỬA CHỮA:
- Các bước xử lý chi tiết:
  1. [Bước 1 - mô tả cụ thể theo chuẩn kỹ thuật]
  2. [Bước 2 - theo trình tự thực tế ngoài công trình]
  3. [Bước 3 - v.v...]
- Vật liệu và phương pháp:
  + Vật liệu đề xuất: [Keo trám, vữa, sơn chống thấm, epoxy,...]
  + Phương pháp thi công: [Mô tả cụ thể]
- Đánh giá phương án:
  + Ưu điểm: [Nêu rõ]
  + Nhược điểm: [Nêu rõ]
- Khuyến nghị chuyên gia: [Có nên gọi kỹ sư chuyên môn đến kiểm tra hiện trường không - lý do cụ thể]

---

NẾU KHÔNG PHẢI CÔNG TRÌNH:
Hãy trò chuyện tự nhiên và thân thiện:
- Mô tả những gì thấy trong ảnh một cách tích cực
- Tìm cách kết nối với lĩnh vực xây dựng nếu có thể
- Hỏi về dự định hoặc nhu cầu xây dựng của họ
- Chia sẻ kinh nghiệm liên quan nếu phù hợp
- Tạo không khí trò chuyện thoải mái

LUÔN KẾT THÚC:
Bằng câu hỏi quan tâm để hiểu rõ hơn nhu cầu của khách hàng.

QUY TẮC QUAN TRỌNG:
- Toàn bộ phản hồi phải bằng tiếng Việt
- Phân tích trung thực, không phóng đại
- Ưu tiên an toàn con người
- Đưa ra nhiều phương án lựa chọn
- Nếu không thể xác định rõ loại cấu kiện từ ảnh, hãy nêu rõ "cần thêm thông tin" thay vì đoán
- Luôn cảnh báo nếu có nghi ngờ về nguy cơ an toàn`;

const GENERAL_CHAT_PROMPT = `Bạn là chuyên gia xây dựng thân thiện, có kinh nghiệm thực tế.

PHONG CÁCH GIAO TIẾP:
- Nói chuyện tự nhiên như bạn bè
- Chia sẻ kinh nghiệm cá nhân
- Hỏi lại để hiểu rõ nhu cầu
- Đưa ra lời khuyên thiết thực

Bạn có thể hỗ trợ:
- Tư vấn xây dựng, sửa chữa nhà
- Lựa chọn vật liệu phù hợp
- Ước tính chi phí dự án
- Giải quyết vấn đề kỹ thuật
- Chia sẻ kinh nghiệm thực tế

Hãy trả lời bằng tiếng Việt, tự nhiên và có cảm xúc!`;

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
export const analyzeImageWithGemini = async (imageBase64, prompt = SMART_IMAGE_ANALYSIS_PROMPT, messageHistory = []) => {
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
            return await analyzeImageWithGemini(imageBase64, SMART_IMAGE_ANALYSIS_PROMPT, []);
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