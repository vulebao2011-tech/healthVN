
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, EnvironmentalData, RiskAnalysis, SymptomLog, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPersonalizedRisk = async (
  profile: UserProfile,
  env: EnvironmentalData,
  recentLogs: SymptomLog[]
): Promise<RiskAnalysis> => {
  const prompt = `
    Bạn là bác sĩ chuyên khoa hô hấp tại Việt Nam.
    Hãy phân tích rủi ro cho bệnh nhân:
    - Tên: ${profile.name}
    - Mức độ bệnh: ${profile.severity}
    - Ngưỡng AQI nhạy cảm: ${profile.thresholdAQI}
    - Dị ứng: ${profile.allergies.join(', ') || 'Không'}
    - Cần tránh: ${profile.thingsToAvoid.join(', ') || 'Không'}
    - Vị trí hiện tại: ${env.location}
    - AQI đo được: ${env.aqi}

    YÊU CẦU:
    1. KHÔNG trả lời chung chung. 
    2. Nếu AQI (${env.aqi}) > Ngưỡng nhạy cảm (${profile.thresholdAQI}), hãy cảnh báo rủi ro cao.
    3. Trả về đúng định dạng JSON với danh sách recommendations là các hành động cụ thể (VD: "Đeo khẩu trang N95 ngay khi ra đường tại ${env.location}", "Uống thêm nước ấm để loãng đờm").
    4. Recommendations phải ngắn gọn, dạng checklist (dưới 15 từ mỗi câu).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'] },
            message: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            preventionTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['riskLevel', 'message', 'recommendations', 'preventionTips'],
        },
      },
    });

    return JSON.parse(response.text || '{}') as RiskAnalysis;
  } catch (error) {
    return {
      riskLevel: env.aqi > profile.thresholdAQI ? 'HIGH' : 'LOW',
      message: `AQI tại ${env.location} là ${env.aqi}. Hãy chú ý sức khỏe hô hấp.`,
      recommendations: ["Đeo khẩu trang khi ra ngoài", "Mang theo thuốc xịt cắt cơn"],
      preventionTips: ["Hạn chế vận động mạnh"]
    };
  }
};

export const getHealthConsultation = async (
  profile: UserProfile,
  logs: SymptomLog[],
  history: ChatMessage[]
) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Bạn là Dr. Health VN. 
      Tư vấn chuyên sâu dựa trên hồ sơ bệnh hô hấp (${profile.severity}) và AQI thực tế. 
      Tuyệt đối không đưa ra lời khuyên sáo rỗng. 
      Trả lời bằng tiếng Việt, giọng điệu ân cần nhưng chuyên nghiệp.`,
    }
  });

  const response = await chat.sendMessage({ message: history[history.length - 1].text });
  return response.text;
};
