
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, EnvironmentalData, RiskAnalysis, SymptomLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getPersonalizedRisk = async (
  profile: UserProfile,
  env: EnvironmentalData,
  recentLogs: SymptomLog[]
): Promise<RiskAnalysis> => {
  const isGeneral = profile.userType === 'GENERAL';
  
  const prompt = `
    Bạn là chuyên gia hô hấp hàng đầu. Hãy phân tích rủi ro môi trường dựa trên dữ liệu sau:

    HỒ SƠ NGƯỜI DÙNG:
    - Loại: ${profile.userType === 'SENSITIVE' ? 'Người nhạy cảm (Hen/Dị ứng)' : 'Người bình thường'}
    - Tên: ${profile.name}
    - Mức độ: ${profile.severity}
    - Ngưỡng AQI nhạy cảm: ${profile.thresholdAQI}
    - Yếu tố kích phát: ${profile.triggers.join(', ')}

    ĐIỀU KIỆN MÔI TRƯỜNG CHI TIẾT:
    - AQI: ${env.aqi}, Chính: ${env.mainPollutant}
    - Nhiệt độ: ${env.temp}°C, Độ ẩm: ${env.humidity}%
    - Tốc độ gió: ${env.windSpeed} km/h (Gió mạnh gây bụi cuốn)
    - Phấn hoa: ${env.pollenLevel}
    - Chỉ số UV: ${env.uvIndex} (UV cao thường đi kèm Ozone tầng mặt gây rát phổi)
    - NO2/SO2: ${env.no2}/${env.so2} µg/m³

    YÊU CẦU:
    1. Nếu là người NHẠY CẢM: So sánh AQI hiện tại với ngưỡng ${profile.thresholdAQI} và các yếu tố kích phát.
    2. Nếu là người BÌNH THƯỜNG: Tập trung vào "Phòng ngừa" bệnh đường hô hấp (viêm họng, viêm xoang, cúm).
    3. Phân tích sự kết hợp: VD Độ ẩm cao (>80%) dễ gây nấm mốc; Gió mạnh + AQI cao gây bụi thô vào sâu mũi.
    4. Trả về lời khuyên cực kỳ cụ thể, không chung chung.
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
            preventionTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lời khuyên phòng bệnh cho người khỏe mạnh" },
          },
          required: ['riskLevel', 'message', 'recommendations', 'preventionTips'],
        },
      },
    });

    return JSON.parse(response.text || '{}') as RiskAnalysis;
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      riskLevel: env.aqi > (isGeneral ? 150 : profile.thresholdAQI) ? 'HIGH' : 'LOW',
      message: `Môi trường hiện tại có chỉ số AQI là ${env.aqi}.`,
      recommendations: ["Đeo khẩu trang khi ra ngoài"],
      preventionTips: ["Xịt khoáng mũi hàng ngày để làm sạch bụi mịn"]
    };
  }
};
