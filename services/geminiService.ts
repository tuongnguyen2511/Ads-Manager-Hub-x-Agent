import { GoogleGenAI, Type } from "@google/genai";
import { CampaignFormData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const MODEL_FLASH = 'gemini-3-flash-preview';

/**
 * Generates ad copy and targeting suggestions based on a product description.
 */
export const generateCampaignDraft = async (productDescription: string, platform: string): Promise<Partial<CampaignFormData>> => {
  try {
    const prompt = `
      Bạn là một chuyên gia Digital Marketing hàng đầu. 
      Hãy tạo nội dung quảng cáo và gợi ý target cho sản phẩm: "${productDescription}" 
      trên nền tảng ${platform}.
      Trả về kết quả dưới dạng JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adHeadline: { type: Type.STRING, description: "Tiêu đề quảng cáo hấp dẫn, ngắn gọn" },
            adContent: { type: Type.STRING, description: "Nội dung thân bài quảng cáo thu hút" },
            targetInterests: { type: Type.STRING, description: "Danh sách các sở thích (interests) phù hợp, cách nhau bởi dấu phẩy" },
            targetAge: { type: Type.STRING, description: "Độ tuổi mục tiêu (ví dụ: 18-35)" },
          },
          required: ["adHeadline", "adContent", "targetInterests", "targetAge"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Không nhận được phản hồi từ AI");
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      adHeadline: "Không thể tạo tiêu đề lúc này",
      adContent: "Vui lòng nhập thủ công mô tả sản phẩm của bạn.",
      targetInterests: "Shoppings, Technology",
      targetAge: "18-65+"
    };
  }
};

export const chatWithAgent = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_FLASH,
      history: history,
      config: {
        systemInstruction: "Bạn là trợ lý ảo TN Agent. Bạn giúp người dùng quản lý quảng cáo trên Facebook, Google, TikTok, Zalo. Hãy trả lời ngắn gọn, chuyên nghiệp, tập trung vào hiệu quả quảng cáo. Ngôn ngữ: Tiếng Việt.",
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Xin lỗi, tôi đang gặp sự cố kết nối.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.";
  }
};

/**
 * Optimizes budget and bidding allocation
 */
export const optimizeBudgetAI = async (currentBudget: number, currentBidding: string | undefined, platform: string, objective: string): Promise<{suggestedBudget: number, suggestedBidding: string, reason: string}> => {
  try {
    const prompt = `Phân tích ngân sách hiện tại: ${currentBudget} VNĐ và chiến lược giá thầu: "${currentBidding || 'Tự động'}" cho nền tảng ${platform} với mục tiêu ${objective}. Hãy đề xuất mức ngân sách và chiến lược giá thầu tối ưu hơn. Trả về JSON.`;
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedBudget: { type: Type.NUMBER },
            suggestedBidding: { type: Type.STRING, description: "Chiến lược giá thầu gợi ý (ví dụ: Highest Volume, Cost Cap, etc.)" },
            reason: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { 
      suggestedBudget: currentBudget * 1.2, 
      suggestedBidding: "Lowest Cost (Auto)", 
      reason: "Dựa trên xu hướng thị trường, tăng ngân sách và sử dụng chiến lược giá thầu tự động sẽ giúp tối ưu chi phí. (Mock AI)" 
    };
  }
}

/**
 * Refines targeting options
 */
export const optimizeTargetingAI = async (currentTargeting: string): Promise<{suggestedTargeting: string, reason: string}> => {
   try {
    const prompt = `Tối ưu hóa targeting sau để mở rộng tệp khách hàng tiềm năng nhưng vẫn chính xác: "${currentTargeting}". Trả về JSON.`;
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTargeting: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { suggestedTargeting: currentTargeting + ", Shoppers, Tech Enthusiasts", reason: "Mở rộng tệp (Mock AI)" };
  }
}

/**
 * Rewrites ad creative
 */
export const optimizeCreativeAI = async (headline: string, content: string): Promise<{headline: string, content: string, reason: string}> => {
  try {
    const prompt = `Viết lại quảng cáo sau hấp dẫn hơn, tăng CTR: Headline: "${headline}", Content: "${content}". Trả về JSON.`;
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            content: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { headline: headline + " (New)", content: content + " [Optimized]", reason: "Sáng tạo hơn (Mock AI)" };
  }
}

/**
 * Suggests Campaign Structure based on Objective (Max Conversion or Max GMV)
 */
export const suggestCampaignStructure = async (objective: 'conversion' | 'gmv'): Promise<string> => {
    try {
        const prompt = `
            Đóng vai chuyên gia Performance Marketing. Hãy gợi ý chi tiết cấu trúc chiến dịch quảng cáo tối ưu cho mục tiêu: 
            ${objective === 'conversion' ? 'Tối ưu hóa chuyển đổi (Maximize Conversion)' : 'Tối đa hóa doanh thu (Max GMV)'}.
            
            Hãy trình bày dưới dạng danh sách dễ đọc (Bullet points), bao gồm:
            1. Cấu trúc Campaign (Chiến dịch)
            2. Chia Ad Sets/Ad Groups (Nhóm quảng cáo) theo phễu hoặc audience
            3. Định dạng Ads (Quảng cáo) nên dùng.
            4. Chiến lược giá thầu (Bidding Strategy).
            
            Giữ câu trả lời ngắn gọn, súc tích.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: prompt,
        });

        return response.text || "Không thể tạo gợi ý cấu trúc lúc này.";
    } catch (error) {
        console.error("AI Structure Suggestion Error:", error);
        return "Hệ thống AI đang bận, vui lòng thử lại sau.";
    }
}