# Hướng dẫn sử dụng tính năng Speech-to-Text với Deepgram

## Cách sử dụng

### 1. Bắt đầu ghi âm
- Nhấn vào **nút microphone** (biểu tượng mic) ở phía bên phải thanh input
- Nút sẽ chuyển sang màu đỏ với spinner quay để báo hiệu đang ghi âm
- Bạn sẽ thấy log: `🎙️ Starting voice recognition...` và `✅ Voice recording started successfully`

### 2. Dừng ghi âm
- **Nhấn lại vào nút microphone màu đỏ** để dừng ghi âm
- **Quan trọng**: Nút phải có màu đỏ và spinner đang quay khi đang ghi âm
- **Feedback tức thì**: Ngay khi nhấn, bạn sẽ thấy:
  - Thông báo popup "Đang dừng ghi âm..."
  - Nút chuyển sang màu cam (đang xử lý)
  - Icon check nhỏ xuất hiện ở góc phải nút
- **Chống spam**: Nếu nhấn nhiều lần, sẽ hiện "Đã nhấn dừng, vui lòng đợi..."
- Bạn sẽ thấy log: `🎯 Mic button pressed, current states:` và `🛑 Calling onStopRecording...`
- Hệ thống sẽ tự động:
  1. Dừng ghi âm ngay lập tức
  2. Chuyển file âm thanh sang Deepgram API
  3. Nhận kết quả text và điền vào input
  4. Hiển thị "Hoàn thành nhận diện!" khi xong

**Nếu nút không dừng được:**
- Kiểm tra console logs để xem state hiện tại
- Nút có thể bị disabled do logic không đúng
- Thử refresh lại ứng dụng

### 3. Theo dõi quá trình
Bạn có thể theo dõi quá trình qua console logs:

```
🎙️ Starting voice recognition...
✅ Voice recording started successfully
🎯 Mic button pressed, current states: {isRecording: true, isTranscribing: false, isLoading: true, canSend: false}
🛑 Calling onStopRecording...
🛑 Stopping recording and starting transcription...
🛑 stopRecording called, current state: {hasRecording: true, isRecording: true, recordingUri: null}
✅ Recording stopped successfully, URI: file://...
🎤 Transcribing audio with Deepgram...
📁 Reading audio file...
📊 Audio buffer size: XXXX bytes
🌐 Sending request to Deepgram API...
📡 Deepgram response status: 200
✅ Deepgram transcription successful: [text nhận diện được]
🏁 Voice recognition process completed
```

## Trạng thái nút microphone

| Trạng thái | Biểu tượng | Màu nền | Feedback | Hành động |
|-----------|-----------|---------|----------|----------|
| Sẵn sàng | 🎤 | Trong suốt | "Bắt đầu ghi âm..." | Nhấn để bắt đầu ghi |
| Đang ghi | ⏳ (spinner) | Đỏ | - | Nhấn để dừng ghi |
| Đang dừng | ⏳ (spinner) + ✓ | Cam | "Đang dừng ghi âm..." | Chờ xử lý |
| Đang xử lý | ⏳ (spinner) | Cam | - | Chờ transcription |
| Hoàn thành | 🎤 | Trong suốt | "Hoàn thành nhận diện!" | Sẵn sàng ghi lại |

## Feedback Messages

- **"Bắt đầu ghi âm..."** - Khi nhấn để bắt đầu ghi âm
- **"Đang dừng ghi âm..."** - Khi nhấn để dừng ghi âm
- **"Đã nhấn dừng, vui lòng đợi..."** - Khi nhấn spam nút dừng
- **"Hoàn thành nhận diện!"** - Khi transcription hoàn thành thành công

## Khắc phục sự cố

### Không ghi được âm
1. **Kiểm tra quyền microphone:**
   - Android: Settings > Apps > [App name] > Permissions > Microphone
   - iOS: Settings > Privacy & Security > Microphone > [App name]

2. **Restart ứng dụng** sau khi cấp quyền

### Không nhận diện được giọng nói
1. **Kiểm tra môi trường:**
   - Nói ở nơi yên tĩnh, ít tiếng ồn
   - Giữ microphone gần miệng (15-30cm)
   - Nói rõ ràng, không quá nhanh

2. **Kiểm tra kết nối internet:**
   - Cần internet để gọi Deepgram API
   - Thử với WiFi nếu 4G/5G chậm

### Lỗi API
1. **Kiểm tra API Key:**
   - Đảm bảo `DEEPGRAM_API_KEY` trong file `.env` đã đúng
   - Kiểm tra quota còn lại trong Deepgram Console

2. **Lỗi "API key is not configured":**
   - Cập nhật file `.env` với API key thực tế
   - Restart ứng dụng sau khi cập nhật

### Lỗi "No audio URI returned"
- Có thể do ghi âm quá ngắn (< 1 giây)
- Thử ghi âm lâu hơn (3-5 giây)

## Tối ưu hóa

### Để có kết quả tốt nhất:
1. **Ghi âm 3-10 giây** cho câu ngắn
2. **Nói rõ ràng** bằng tiếng Việt
3. **Tránh tiếng ồn** xung quanh
4. **Kiểm tra kết nối** internet ổn định
5. **Đợi quá trình hoàn thành** trước khi ghi âm tiếp

### Performance:
- Deepgram thường xử lý trong 2-5 giây
- File âm thanh được nén và gửi dưới dạng binary
- Kết quả trả về được format tự động với dấu câu

## Debugging

### Bật debug logs:
1. Mở Developer Console trong ứng dụng
2. Theo dõi logs có emoji để dễ nhận biết:
   - 🎙️ Bắt đầu ghi âm
   - 🛑 Dừng ghi âm
   - 🎤 Bắt đầu transcribe
   - ✅ Thành công
   - ❌ Lỗi
   - ⚠️ Cảnh báo

### Kiểm tra file âm thanh:
- Files được lưu tạm trong cache của Expo
- Format: WAV, 16kHz, mono channel
- Size thường 50-200KB cho 5-10 giây ghi âm
