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

const DAMAGE_ANALYSIS_PROMPT = `Bạn là chuyên gia xây dựng thân thiện với 15 năm kinh nghiệm thực tế, có tính cách vui vẻ và gần gũi.

🎯 PHONG CÁCH GIAO TIẾP:
- Nói chuyện như một người bạn tốt, gần gũi và ấm áp
- Dùng nhiều emoji để thể hiện cảm xúc 😊 🔧 🏠 ✨ 💪
- Chia sẻ kinh nghiệm cá nhân: "Theo kinh nghiệm của mình..."
- Động viên và an ủi: "Đừng lo lắng quá, vấn đề này có thể xử lý được!"
- Hỏi thăm quan tâm: "Nhà bạn có ai bị ảnh hưởng không?"

⚠️ QUAN TRỌNG VỀ FORMAT:
- SỬ DỤNG MARKDOWN khi cần làm nổi bật thông tin quan trọng
- Dùng **text** để in đậm các tiêu đề và thông tin quan trọng
- Dùng *text* để in nghiêng khi cần nhấn mạnh
- Dùng emoji để làm sinh động: 🔧 🏠 ✨ 💪 😊
- Ví dụ ĐÚNG: "**🔧 Nguyên nhân chính:** Thấm nước do..."
- Ví dụ ĐÚNG: "**Đánh giá:** 😰 NẶNG - *cần xử lý ngay*"

Nếu là CÔNG TRÌNH XÂY DỰNG:

🔍 PHÂN TÍCH CHUYÊN SÂU:

1. NHẬN DIỆN CẤU KIỆN & HƯ HẠI:
- **Bắt đầu:** "Ôi, nhìn tình hình này... 😰"
- **Loại cấu kiện:** *tường (gạch/bê tông), trần, sàn, cột, dầm, mái, cửa*
- **Vật liệu:** gạch nung, bê tông, thạch cao, gỗ, thép, v.v.
- **Hư hại:** nứt, thấm nước, bong tróc, mốc, biến dạng, võng, xê dịch
- **Mô tả chi tiết:** "Vết nứt này trông khá đáng lo 😟"

2. VỊ TRÍ & ẢNH HƯỞNG KẾT CẤU:
- **Vị trí:** *trong/ngoài nhà, khu vực cụ thể (nhà bếp, phòng tắm, ban công...)*
- **Loại cấu kiện:** kết cấu chịu lực chính / không chịu lực / bảo vệ
- **Mức độ ảnh hưởng:** an toàn kết cấu / thẩm mỹ / chức năng sử dụng

3. ĐÁNH GIÁ MỨC ĐỘ:
- **Phân loại:** 😌 NHẸ / 😐 TRUNG BÌNH / 😰 NẶNG
- **Lý do:** *dựa trên dấu hiệu trong ảnh*
- **Cảnh báo:** "Bạn cần chú ý vấn đề này nhé! ⚠️"

4. PHÂN TÍCH NGUYÊN NHÂN:
- **Dự đoán nguyên nhân:** "Theo mình thấy thì..."
- **Nhóm nguyên nhân:**
  + *Do thi công:* "Có thể do thợ làm không cẩn thận 🔨"
  + *Do vật liệu:* "Vật liệu có vẻ không đạt chất lượng 📦"
  + *Do môi trường:* "Thời tiết mưa nhiều ảnh hưởng đấy 🌧️"
  + *Do nền móng:* "Móng nhà có dấu hiệu bất thường 🏗️"
  + *Do tải trọng:* "Có thể do chịu lực quá mức 💪"

5. HƯỚNG DẪN XỬ LÝ:
- **Động viên:** "Đừng lo, mình sẽ hướng dẫn chi tiết nhé! 😊"
- **Trình bày 3 bước xử lý** rõ ràng, đúng kỹ thuật
- **Vật liệu đề xuất:** *keo trám, vữa, sơn chống thấm, epoxy...*
- **Phương pháp thi công:** "Làm từ từ, không vội được đâu 😄"
- **Khuyến nghị:** "Nếu không tự tin thì nên gọi thợ chuyên nghiệp nhé! 👷‍♂️"

Nếu KHÔNG PHẢI CÔNG TRÌNH:
- **Trò chuyện vui vẻ:** "Wow, hình ảnh này đẹp quá! 😍"
- Mô tả tích cực và liên kết tới xây dựng nếu có thể

⚠️ QUY TẮC QUAN TRỌNG:
- Mỗi phần trả lời chỉ 2–3 dòng, súc tích và thực tế.
- Phân tích trung thực, không phóng đại.
- Ưu tiên yếu tố an toàn. Nếu không rõ, hãy nói: “Cần thêm thông tin.”
- Luôn cảnh báo nếu có dấu hiệu nguy hiểm tiềm ẩn.

KẾT THÚC bằng danh sách sản phẩm cần dùng như:
"**Sản phẩm cần:** *Keo Sikaflex, Sơn chống thấm Nippon, Vải thủy tinh.*"

KHÔNG viết thừa. Trả lời NGẮN GỌN, SÁT THỰC TẾ.`;


const GENERAL_CHAT_PROMPT = `
Bạn là chuyên gia xây dựng thân thiện, có kinh nghiệm thực tế tại Việt Nam.

🌟 **PHONG CÁCH GIAO TIẾP**:
- Nói chuyện tự nhiên như bạn bè
- Chia sẻ kinh nghiệm cá nhân
- Hỏi lại để hiểu rõ nhu cầu
- Đưa ra lời khuyên thiết thực

📌 **HỖ TRỢ**:
- Tư vấn xây dựng, sửa chữa nhà
- Lựa chọn vật liệu phù hợp
- Ước tính chi phí dự án
- Giải quyết vấn đề kỹ thuật
- Chia sẻ kinh nghiệm thực tế

⚠️ **FORMAT QUAN TRỌNG**:
- Sử dụng **text** để in đậm tiêu đề và thông tin quan trọng
- Sử dụng *text* để in nghiêng khi cần nhấn mạnh
- Dùng emoji để làm sinh động: 🔧 🏠 ✨ 💪 😊

⚠️ QUY TẮC QUAN TRỌNG:
- Trả lời ngắn gọn (2-3 đoạn), bằng tiếng Việt, tự nhiên và có cảm xúc
- KHÔNG tự động đề xuất sản phẩm trừ khi người dùng yêu cầu cụ thể
- KHÔNG thêm dòng "nếu cần gợi ý sản phẩm" vào cuối câu trả lời
- Chỉ tập trung trả lời câu hỏi được đặt ra`;

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
    // Kiểm tra và xử lý messageHistory
    console.log('📝 [DEBUG] messageHistory:', messageHistory);

    let userMessage = '';
    if (messageHistory && messageHistory.length > 0) {
      // Lấy tin nhắn cuối cùng của user
      const lastMessage = messageHistory[messageHistory.length - 1];
      userMessage = lastMessage.content || lastMessage.text || lastMessage || '';
    }

    console.log('💬 [DEBUG] User message:', userMessage);

    if (!userMessage || userMessage.toString().trim() === '') {
      throw new Error("Không có nội dung tin nhắn để xử lý.");
    }

    // Tạo contents với prompt hệ thống và nội dung user
    const contents = [
      {
        parts: [{ text: GENERAL_CHAT_PROMPT + "\n\nCâu hỏi: " + userMessage.toString() }],
        role: 'user'
      }
    ];

    const body = JSON.stringify({
      contents: contents
    });

    console.log('📤 [DEBUG] Request body:', body);

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
    console.log('🤖 [DEBUG] getAiResponse called with:', {
      content: typeof content === 'string' ? content.substring(0, 100) + '...' : content,
      contentType: typeof content,
      modelType,
      hasImage,
    });

    if (hasImage && imageBase64) {
      // Xử lý ảnh với Gemini Vision
      return await analyzeImageWithGemini(imageBase64, DAMAGE_ANALYSIS_PROMPT, []);
    } else {
      // Xử lý chat text thuần
      let finalContent = content;

      // Nếu content là array (messageHistory), extract nội dung cuối cùng
      if (Array.isArray(content)) {
        console.log('📝 [DEBUG] Content is array, extracting last message');
        const lastMessage = content[content.length - 1];
        finalContent = lastMessage.content || lastMessage.text || lastMessage || '';
      }

      console.log('💬 [DEBUG] Final content:', finalContent);

      // Tạo messageHistory đơn giản
      const messageHistory = [finalContent];
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

/**
 * Tối ưu hóa từ khóa tìm kiếm cho lĩnh vực xây dựng
 * @param {string} productName Tên sản phẩm gốc
 * @returns {string} Từ khóa tìm kiếm được tối ưu
 */
const optimizeConstructionSearchQuery = (productName) => {
  console.log(`🔍 [QUERY] Optimizing: "${productName}"`);

  // Mapping từ khóa với thương hiệu và model cụ thể - tập trung vào vật liệu thực
  const constructionKeywordMap = {
    'keo': 'keo dán vật liệu xây nhà sikaflex sika',
    'trám': 'keo trám khe chống thấm xây nhà sika',
    'sơn': 'sơn chống thấm tường nhà dulux nippon jotun',
    'xi măng': 'xi măng portland xây nhà holcim lafarge',
    'gạch': 'gạch ốp lát ceramic granite xây nhà viglacera',
    'thép': 'thép xây nhà việt đức hòa phát pomina',
    'đá': 'đá granite marble vật liệu xây nhà',
    'cát': 'cát vật liệu xây nhà',
    'sỏi': 'sỏi đá vật liệu xây nhà',
    'đinh': 'đinh thép công cụ xây nhà',
    'vít': 'vít ốc thép công cụ xây nhà',
    'ống': 'ống nước pvc xây nhà tiền phong',
    'dây': 'dây cáp điện xây nhà cadivi',
    'kính': 'kính cường lực xây nhà asahi',
    'nhôm': 'nhôm định hình xây nhà minh long',
    'inox': 'inox 304 tấm ống xây nhà'
  };

  let optimizedQuery = productName.toLowerCase().trim();

  // Loại bỏ các từ khóa nguy hiểm có thể dẫn đến sách/tài liệu
  const dangerousWords = [
    'sách', 'giáo trình', 'tài liệu', 'học', 'đọc', 'viết', 'combo', 'set',
    'khóa học', 'bài giảng', 'hướng dẫn', 'cẩm nang', 'sổ tay', 'ebook',
    'pdf', 'word', 'hợp đồng', 'biểu mẫu', 'phiếu', 'đơn', 'giấy tờ',
    'chứng từ', 'văn bản', 'quy trình', 'tiêu chuẩn', 'quy định'
  ];

  // Loại bỏ từ nguy hiểm trước
  dangerousWords.forEach(word => {
    optimizedQuery = optimizedQuery.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });

  // Tìm từ khóa xây dựng chính và thay thế bằng query cụ thể
  let matched = false;
  Object.keys(constructionKeywordMap).forEach(keyword => {
    if (optimizedQuery.includes(keyword) && !matched) {
      optimizedQuery = constructionKeywordMap[keyword];
      matched = true;
    }
  });

  // Nếu không match được từ khóa nào, thêm context rất cụ thể về vật liệu xây nhà
  if (!matched) {
    optimizedQuery = `${optimizedQuery.trim()} vật liệu xây nhà công cụ xây nhà hardware`.replace(/\s+/g, ' ').trim();
  }

  // Thêm từ khóa loại trừ để tránh sách/tài liệu/hợp đồng/dịch vụ
  optimizedQuery += ' -sách -giáo_trình -tài_liệu -hợp_đồng -phiếu -định_mức -dự_toán -báo_giá -dịch_vụ -khóa_học -đào_tạo -tư_vấn -thiết_kế -ebook -pdf -course -tutorial -service -training -consultation -design -manual -handbook -guide -book -document -contract -quotation -estimate -software -app -application';

  console.log(`🎯 [QUERY] Optimized to: "${optimizedQuery}"`);
  return optimizedQuery;
};

/**
 * Kiểm tra xem sản phẩm có liên quan đến xây dựng không
 * @param {string} title Tiêu đề sản phẩm
 * @param {string} snippet Mô tả sản phẩm
 * @param {string} source Nguồn sản phẩm
 * @returns {boolean} True nếu liên quan đến xây dựng
 */
const isConstructionRelatedProduct = (title = '', snippet = '', source = '') => {
  const text = `${title} ${snippet} ${source}`.toLowerCase();

  console.log(`🔍 [FILTER] Checking: "${title.substring(0, 80)}..."`);

  // Keywords LOẠI BỎ NGAY (mở rộng và chặt chẽ hơn)
  const strictExcludeKeywords = [
    // Thực phẩm và đồ uống
    'kim chi', 'cải thảo', 'thực phẩm', 'ăn uống', 'đồ ăn', 'nước uống', 'thức ăn',
    'rau củ', 'trái cây', 'bánh kẹo', 'gia vị', 'nấu ăn', 'món ăn',

    // May vá và thời trang
    'may vá', 'kim may', 'chỉ may', 'vải may', 'quần áo', 'thời trang',
    'áo', 'quần', 'váy', 'giày dép', 'túi xách',

    // Trang sức
    'kim cương trang sức', 'nhẫn', 'dây chuyền', 'bông tai', 'vòng tay',
    'đồng hồ', 'trang sức', 'vàng bạc',

    // Y tế và làm đẹp
    'thuốc', 'vitamin', 'thực phẩm chức năng', 'mỹ phẩm', 'làm đẹp',
    'kem dưỡng', 'serum', 'toner', 'sữa rửa mặt',

    // Điện tử
    'điện thoại', 'máy tính', 'laptop', 'game', 'đồ chơi', 'console',
    'tv', 'tivi', 'máy ảnh', 'camera', 'tai nghe',

    // Xe cộ
    'xe hơi', 'ô tô', 'xe máy', 'phụ tung xe', 'lốp xe', 'nhớt xe',

    // Sách và tài liệu
    'sách', 'truyện', 'manga', 'tiểu thuyết', 'giáo trình', 'tài liệu',
    'ebook', 'pdf', 'hướng dẫn học', 'cẩm nang học', 'bài giảng',
    'khóa học', 'học online', 'course', 'tutorial',

    // Hợp đồng và giấy tờ  
    'hợp đồng', 'phiếu', 'đơn', 'giấy tờ', 'chứng từ', 'văn bản',
    'quy trình', 'tiêu chuẩn', 'quy định', 'biểu mẫu', 'mẫu đơn',
    'phiếu nhập', 'phiếu xuất', 'hóa đơn', 'chứng từ kế toán',

    // Âm nhạc và giải trí
    'âm nhạc', 'nhạc cụ', 'guitar', 'piano', 'karaoke', 'loa',

    // Thể thao
    'thể thao', 'bóng đá', 'tennis', 'gym', 'tập luyện',

    // Thú cưng
    'chăm sóc thú cưng', 'thức ăn chó', 'thức ăn mèo', 'chuồng',

    // Văn phòng phẩm
    'văn phòng phẩm', 'bút', 'giấy a4', 'máy in', 'stapler',
    'bút bi', 'bút chì', 'thước kẻ', 'tẩy', 'gôm',

    // Nấu ăn
    'nồi chảo', 'bếp ga', 'lò vi sóng', 'tủ lạnh', 'máy xay',

    // Các từ khóa kỹ thuật gây nhầm lẫn
    'kim mù lỗ', 'kim cương bằng thép cứng', 'chồn thực hành',
    'nội dung đa nền tảng', 'phần mềm', 'ứng dụng', 'app', 'software',

    // Thêm các từ khóa mới để loại bỏ sách/tài liệu về "xây dựng" tổ chức
    'combo sách', 'bộ sách', 'giảng viên', 'học viên', 'sinh viên',
    'đại học', 'cao đẳng', 'trung cấp', 'lớp học', 'môn học',
    'kiểm tra', 'thi cử', 'đề thi', 'bài tập', 'homework',

    // Loại bỏ các sách về "xây dựng" tổ chức/chính trị/xã hội
    'xây dựng đảng', 'xây dựng tổ chức', 'xây dựng chính quyền',
    'xây dựng nông thôn', 'xây dựng xã hội', 'xây dựng quê hương',
    'xây dựng đoàn thể', 'xây dựng lòng tin', 'xây dựng mối quan hệ',
    'xây dựng thương hiệu', 'xây dựng kế hoạch', 'xây dựng chiến lược',
    'xây dựng nhân cách', 'xây dựng tính cách', 'xây dựng gia đình',
    'xây dựng nhóm', 'xây dựng đội ngũ', 'xây dựng mô hình kinh doanh',

    // Từ khóa chỉ "định mức", "dự toán" mà không phải vật liệu thực
    'định mức dự toán', 'dự toán công trình', 'báo giá xây dựng',
    'hợp đồng xây dựng', 'quản lý dự án', 'giám sát thi công',
    'quotation', 'estimate', 'budget', 'project management',

    // Dịch vụ xây dựng - không phải vật liệu
    'dịch vụ xây dựng', 'dịch vụ thi công', 'dịch vụ sửa chữa',
    'dịch vụ thiết kế', 'dịch vụ tư vấn', 'dịch vụ giám sát',
    'dịch vụ quản lý', 'dịch vụ bảo trì', 'dịch vụ bảo dưỡng',
    'thi công trọn gói', 'nhận thầu xây dựng', 'đội thợ xây',
    'thợ xây dựng', 'thợ thi công', 'thợ sửa chữa', 'kỹ sư xây dựng',
    'kiến trúc sư', 'nhà thầu', 'công ty xây dựng',
    'construction service', 'construction contractor', 'building service',
    'contractor', 'builder', 'construction company', 'construction worker',

    // Phần mềm và ứng dụng
    'phần mềm xây dựng', 'app xây dựng', 'ứng dụng xây dựng',
    'software', 'application', 'program', 'system', 'platform',
    'autocad', 'revit', 'sketchup', 'archicad', 'tekla',

    // Ebook và tài liệu số
    'ebook xây dựng', 'pdf xây dựng', 'tài liệu số',
    'digital book', 'e-book', 'online document', 'digital manual',

    // Khóa học và đào tạo
    'khóa học xây dựng', 'đào tạo xây dựng', 'học xây dựng',
    'training course', 'construction training', 'building course',
    'online course', 'certification', 'workshop', 'seminar',

    // Tư vấn thiết kế
    'tư vấn thiết kế', 'thiết kế nội thất', 'thiết kế kiến trúc',
    'design consultation', 'interior design', 'architectural design',
    'home design', 'building design', 'blueprint', 'plan',

    // Nhà đất và bất động sản
    'bán nhà', 'mua nhà', 'cho thuê nhà', 'nhà đất',
    'bất động sản', 'căn hộ', 'chung cư', 'biệt thự',
    'real estate', 'property', 'house for sale', 'apartment',
    'land', 'plot', 'villa', 'townhouse', 'condominium'
  ];

  // Kiểm tra loại bỏ trước (strict) - nếu có bất kỳ từ nào thì loại
  const hasStrictExclude = strictExcludeKeywords.some(keyword => text.includes(keyword));
  if (hasStrictExclude) {
    console.log(`❌ [FILTER] EXCLUDED: "${title.substring(0, 50)}..." - Contains exclude keyword`);
    return false;
  }

  // Keywords XÂY DỰNG chính xác - tập trung vào vật liệu và công cụ thực tế
  const primaryConstructionKeywords = [
    // Thay 'xây dựng' chung chung bằng các cụm từ cụ thể
    'vật liệu xây dựng', 'vật liệu xây nhà', 'xây nhà', 'xây dựng nhà', 'xây dựng công trình',
    'công trình xây dựng', 'kiến trúc xây dựng', 'thi công xây dựng', 'sửa chữa nhà',
    'vật liệu thi công', 'vật liệu hoàn thiện', 'vật liệu sửa chữa',

    // Keo và chất dính
    'keo xây dựng', 'keo trám', 'keo dán gạch', 'keo sikaflex', 'keo chống thấm',
    'keo dán ngói', 'keo trám khe', 'keo silicon', 'keo pu foam',
    'keo dán gỗ', 'keo 502', 'keo epoxy', 'keo acrylic',

    // Sơn và hoàn thiện
    'sơn tường', 'sơn nhà', 'sơn chống thấm', 'sơn nippon', 'sơn jotun', 'sơn dulux', 'sơn kova',
    'sơn nước', 'sơn dầu', 'sơn epoxy', 'sơn lót', 'sơn phủ',
    'sơn chống gỉ', 'sơn chống nóng', 'sơn bề mặt',

    // Xi măng và bê tông
    'xi măng', 'cement', 'bê tông', 'concrete', 'vữa xây', 'vữa trát',
    'xi măng portland', 'bột trét tường', 'vữa khô', 'vữa chống thấm',
    'xi măng trắng', 'bê tông tươi', 'mortar',

    // Gạch và ngói
    'gạch xây', 'gạch ốp lát', 'gạch men', 'ngói', 'ceramic', 'granite', 'marble',
    'gạch block', 'gạch đỏ', 'gạch không nung', 'gạch ceramic', 'gạch porcelain',
    'gạch lát nền', 'gạch ốp tường', 'gạch cotto', 'gạch terrazzo',

    // Thép và kim loại
    'thép xây dựng', 'thép việt', 'thép hòa phát', 'sắt thép', 'thép pomina',
    'thép cây', 'thép hình', 'thép ống', 'inox xây dựng', 'nhôm xây dựng',
    'thép tấm', 'thép góc', 'thép hộp', 'thép không gỉ',

    // Cửa và khung
    'cửa nhôm', 'cửa kính', 'cửa sắt', 'cửa gỗ', 'cửa cuốn', 'cửa chống cháy',
    'khung cửa', 'khung nhôm', 'cửa sổ nhôm', 'cửa kéo', 'cửa lưới',

    // Ống và đường ống
    'ống nước', 'ống thoát nước', 'ống nhựa pvc', 'ống inox', 'ống đồng',
    'ống nước lạnh', 'ống nước nóng', 'ống thoát sàn', 'ống luồn dây điện',
    'ống hdpe', 'ống upvc', 'ống ppr', 'ống pe',

    // Chống thấm và cách nhiệt
    'chống thấm', 'cách âm', 'cách nhiệt', 'chống nóng', 'màng chống thấm',
    'vật liệu cách nhiệt', 'tấm cách âm', 'màng pe', 'bitumen',

    // Máy móc và công cụ
    'máy khoan', 'máy cắt', 'dụng cụ xây nhà', 'công cụ xây nhà',
    'máy trộn bê tông', 'máy đầm', 'máy cắt gạch', 'máy mài', 'máy hàn',
    'búa', 'ke', 'thước', 'cưa', 'kìm', 'tuốc nơ vít',

    // Điện nước
    'dây điện', 'cáp điện', 'ổ cắm', 'công tắc điện', 'đèn led',
    'đèn chiếu sáng', 'quạt thông gió', 'van nước', 'vòi nước',
    'bồn cầu', 'lavabo', 'bồn tắm', 'sen vòi',

    // Kính và cửa sổ
    'kính cường lực', 'kính an toàn', 'kính hộp', 'kính phản quang',
    'kính laminé', 'kính tempered', 'kính cửa sổ',

    // Tấm ốp và hoàn thiện
    'tấm lát sàn', 'tấm ốp tường', 'tấm thạch cao', 'tấm xi măng',
    'tấm smartboard', 'tấm fibro', 'tấm duralite', 'tấm cemboard',

    // Vật liệu cơ bản
    'nhôm định hình', 'inox 304', 'inox 201', 'sắt v', 'sắt hộp',
    'cát xây dựng', 'sỏi', 'đá dăm', 'đá hộc', 'đá mi',

    // Thương hiệu uy tín
    'viglacera', 'đồng tâm', 'toto', 'american standard', 'inax', 'caesar',
    'holcim', 'lafarge', 'cadivi', 'minh long', 'asia', 'rang dong',
    'hoa sen', 'tôn hòa phát', 'thép việt úc', 'xingfa'
  ];

  const secondaryConstructionKeywords = [
    // Cấu kiện và bộ phận công trình
    'tường', 'mái', 'sàn', 'trần', 'cột', 'dầm', 'móng', 'nền',
    'lan can', 'cầu thang', 'ban công', 'hiên', 'mương', 'rãnh',

    // Công việc thi công
    'lát', 'ốp', 'trám', 'sơn', 'quét vôi', 'tô trát',
    'sửa chữa', 'cải tạo', 'hoàn thiện', 'trang trí nội thất',
    'xây', 'đổ', 'trát', 'lắp', 'đặt', 'lát đá',

    // Tính chất vật liệu
    'chịu lực', 'chống nứt', 'chống ẩm', 'chống mốc', 'chống nước',
    'chống cháy', 'chống ồn', 'cách điện', 'chống rỉ', 'chống thấm',
    'bền', 'cứng', 'nhẹ', 'dẻo', 'dính', 'khô nhanh',

    // Phụ kiện và linh kiện
    'đinh', 'vít', 'bu lông', 'ốc vít', 'đinh tán', 'chốt',
    'khóa', 'bản lề', 'tay nắm', 'then cài', 'móc treo',
    'nẹp', 'gân', 'thanh', 'que', 'cọc', 'trụ',

    // Hệ thống điện nước
    'dây điện', 'cáp điện', 'ổ cắm', 'công tắc điện', 'đèn',
    'quạt', 'motor', 'máy bơm', 'van', 'vòi', 'ống',
    'bồn', 'bể', 'hộp', 'tủ điện', 'đồng hồ',

    // Kính và trong suốt
    'kính cường lực', 'kính an toàn', 'kính hộp', 'kính phản quang',
    'kính trong', 'kính mờ', 'kính màu', 'thủy tinh',

    // Vật liệu kim loại
    'nhôm định hình', 'inox 304', 'inox 201', 'sắt', 'thép',
    'đồng', 'kẽm', 'chì', 'thiếc', 'hợp kim',

    // Vật liệu tự nhiên
    'cát xây dựng', 'sỏi', 'đá dăm', 'đá hộc', 'đá mi',
    'gỗ xây dựng', 'gỗ thông', 'gỗ cao su', 'tre', 'nứa',
    'sỏi trang trí', 'cát lọc', 'đất đá',

    // Công cụ và thiết bị
    'búa', 'ke', 'thước', 'cưa', 'kìm', 'tuốc nơ vít',
    'máy', 'dụng cụ', 'thiết bị', 'phụ kiện', 'linh kiện',
    'khuôn', 'bàn', 'giá', 'đế', 'chân', 'khung',

    // Màu sắc và hoàn thiện
    'màu', 'bóng', 'nhám', 'mịn', 'thô', 'vân',
    'trắng', 'đen', 'xám', 'nâu', 'vàng', 'xanh'
  ];

  // Đếm số từ khóa xây dựng (tăng cường yêu cầu)
  const primaryMatches = primaryConstructionKeywords.filter(keyword => text.includes(keyword));
  const secondaryMatches = secondaryConstructionKeywords.filter(keyword => text.includes(keyword));

  const totalMatches = primaryMatches.length + secondaryMatches.length;

  // Yêu cầu chặt chẽ hơn: PHẢI có ít nhất 1 primary HOẶC 2 secondary
  const hasEnoughKeywords = primaryMatches.length >= 1 || secondaryMatches.length >= 2;

  // Kiểm tra thêm: nếu chỉ có secondary keywords, phải đảm bảo không có từ khóa không liên quan
  if (primaryMatches.length === 0 && secondaryMatches.length >= 2) {
    // Các từ khóa nghi ngờ - nếu có thì cần có primary keyword
    const suspiciousKeywords = [
      'kim', 'máy', 'dây', 'ống', 'bột', 'nước', 'dầu', 'mỡ', 'xăng',
      'cát', 'đất', 'sỏi', 'đá', 'cây', 'lá', 'hoa', 'cỏ'
    ];

    const hasSuspiciousKeywords = suspiciousKeywords.some(keyword => text.includes(keyword));

    if (hasSuspiciousKeywords) {
      console.log(`⚠️ [FILTER] SUSPICIOUS: "${title.substring(0, 50)}..." - Has suspicious keywords without primary construction context`);
      return false;
    }
  }

  if (hasEnoughKeywords) {
    console.log(`✅ [FILTER] ACCEPTED: "${title.substring(0, 50)}..." - Primary: ${primaryMatches.length}, Secondary: ${secondaryMatches.length}`);
  } else {
    console.log(`⚠️ [FILTER] REJECTED: "${title.substring(0, 50)}..." - Not enough construction keywords (P:${primaryMatches.length}, S:${secondaryMatches.length})`);
  }

  return hasEnoughKeywords;
};

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

    // Làm sạch và tối ưu hóa từ khóa tìm kiếm cho lĩnh vực xây dựng
    const optimizedQuery = optimizeConstructionSearchQuery(productName);

    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: optimizedQuery,
      api_key: SERP_API_KEY,
      num: 10, // Tăng số lượng để lọc tốt hơn
      hl: 'vi', // Tiếng Việt
      gl: 'vn', // Quốc gia Việt Nam
      // Thêm filter để tập trung vào lĩnh vực xây dựng
      tbm: 'shop',
      tbs: 'vw:l,mr:1,cat:632,p_ord:rv', // Categories: Home & Garden > Construction
      // Thêm filter giá để loại bỏ kết quả quá rẻ (có thể là sách/tài liệu)
      safe: 'active', // Lọc an toàn
      // Ưu tiên kết quả từ các trang thương mại điện tử uy tín
      start: 0
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

    // Xử lý và lọc dữ liệu từ SerpAPI
    if (data.shopping_results && data.shopping_results.length > 0) {
      if (__DEV__) {
        console.log(`📦 [DEBUG] Raw results: ${data.shopping_results.length}`);
      }

      // Lọc chỉ giữ sản phẩm xây dựng
      const filteredResults = data.shopping_results.filter(item =>
        isConstructionRelatedProduct(item.title, item.snippet, item.source)
      );

      if (__DEV__) {
        console.log(`🔧 [DEBUG] After filtering: ${filteredResults.length} construction products`);
      }

      // Nếu không có sản phẩm xây dựng nào, trả về fallback
      if (filteredResults.length === 0) {
        console.log(`⚠️ [DEBUG] No construction-related products found for: ${productName}`);
        return createFallbackProduct(productName);
      }

      return filteredResults.slice(0, 3).map(item => {
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
    const optimizedQuery = optimizeConstructionSearchQuery(productName);

    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: optimizedQuery,
      api_key: SERP_API_KEY,
      num: 3,
      hl: 'vi',
      gl: 'vn',
      tbm: 'shop',
      tbs: 'vw:l,mr:1,cat:632,p_ord:rv'
    });

    console.log(`🔍 [DEBUG] Original query: ${productName}`);
    console.log(`🎯 [DEBUG] Optimized query: ${optimizedQuery}`);
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

      // Kiểm tra filtering
      const filteredResults = data.shopping_results.filter(item =>
        isConstructionRelatedProduct(item.title, item.snippet, item.source)
      );
      console.log(`🔧 [DEBUG] After filtering: ${filteredResults.length} construction-related products`);

      const sample = data.shopping_results[0];
      console.log('🛍️ [DEBUG] Sample product fields:', Object.keys(sample));
      console.log('🛍️ [DEBUG] Sample data:', {
        title: sample.title,
        price: sample.price,
        source: sample.source,
        thumbnail: sample.thumbnail ? 'Has thumbnail' : 'No thumbnail',
        isConstructionRelated: isConstructionRelatedProduct(sample.title, sample.snippet, sample.source)
      });

      // Log filtered products
      console.log('� [DEBUG] Construction-related products:');
      filteredResults.slice(0, 3).forEach((item, index) => {
        console.log(`   Product ${index + 1}: ${item.title}`);
        console.log(`   - Price: ${item.price || 'No price'}`);
        console.log(`   - Source: ${item.source || 'No source'}`);
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
  // Tìm dòng "Sản phẩm cần:" với cả markdown và text thường
  const productPatterns = [
    /\*\*Sản phẩm cần:\*\*\s*\*(.+?)\*/i,  // **Sản phẩm cần:** *product list*
    /Sản phẩm cần:\s*\*(.+?)\*/i,          // Sản phẩm cần: *product list*
    /\*\*Sản phẩm cần:\*\*\s*(.+)/i,       // **Sản phẩm cần:** product list
    /Sản phẩm cần:\s*(.+)/i                // Sản phẩm cần: product list
  ];

  for (const pattern of productPatterns) {
    const productMatch = analysisText.match(pattern);
    if (productMatch) {
      // Tách các sản phẩm bằng dấu phẩy
      const products = productMatch[1]
        .split(',')
        .map(product => product.trim())
        .filter(product => product.length > 0);

      log(`[DEBUG] Extracted products: ${products.join(', ')}`);
      return products;
    }
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
