import { GoogleGenAI, Type } from "@google/genai";
import { CampaignFormData, Campaign, PlatformId, ForecastResult } from "../types";

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
 * Optimizes budget and bidding allocation for a single campaign
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
 * Automatically allocates a total budget across multiple campaigns
 */
export const allocateBudgetsAI = async (
  totalBudget: number, 
  campaigns: Campaign[], 
  optimizationGoal: string
): Promise<{ allocations: { campaignId: string, suggestedBudget: number, reason: string }[] }> => {
  try {
    const campaignsData = campaigns.map(c => ({
      id: c.id,
      name: c.name,
      platform: c.platform,
      currentBudget: c.budget,
      ctr: c.ctr,
      spent: c.spent,
      clicks: c.clicks,
      objective: c.objective
    }));

    const prompt = `
      Bạn là chuyên gia tối ưu hóa ngân sách quảng cáo. 
      Tổng ngân sách khả dụng: ${totalBudget} VNĐ.
      Mục tiêu tối ưu hóa: ${optimizationGoal}.
      Dưới đây là danh sách các chiến dịch và hiệu suất hiện tại:
      ${JSON.stringify(campaignsData)}

      Hãy phân bổ lại tổng ngân sách ${totalBudget} VNĐ giữa các chiến dịch này sao cho đạt hiệu quả cao nhất theo mục tiêu đề ra.
      Tổng các suggestedBudget PHẢI bằng đúng ${totalBudget}.
      Trả về kết quả dạng JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            allocations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  campaignId: { type: Type.STRING },
                  suggestedBudget: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ["campaignId", "suggestedBudget", "reason"]
              }
            }
          },
          required: ["allocations"]
        }
      }
    });

    return JSON.parse(response.text || '{"allocations": []}');
  } catch (error) {
    console.error("Budget Allocation AI Error:", error);
    // Basic fallback: Equal distribution
    const perCampaign = Math.floor(totalBudget / campaigns.length);
    return {
      allocations: campaigns.map(c => ({
        campaignId: c.id,
        suggestedBudget: perCampaign,
        reason: "Phân bổ đều do lỗi hệ thống AI (Fallback mode)."
      }))
    };
  }
};

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

/**
 * Generates a Cross-Channel Performance Forecast (Planning Tool)
 * Simulates data from Google Keyword Planner, FB Audience Insights, Zalo Ads, etc.
 */
export const generatePerformanceForecast = async (
  budget: number,
  platforms: PlatformId[],
  keywords: string,
  objective: string
): Promise<ForecastResult> => {
  try {
    const prompt = `
      Bạn là một AI Planning Tool mạnh mẽ, có khả năng giả lập và tổng hợp dữ liệu từ Google Keyword Planner, Facebook Audience Insights, TikTok Ads Manager và Zalo Ads API.
      
      NHIỆM VỤ: Dự báo hiệu suất chiến dịch quảng cáo trong 30 ngày tới.
      
      THÔNG TIN ĐẦU VÀO:
      - Tổng ngân sách: ${budget} VNĐ
      - Các kênh đã chọn: ${platforms.join(', ')}
      - Từ khóa/Lĩnh vực: "${keywords}"
      - Mục tiêu: ${objective}
      
      YÊU CẦU ĐẦU RA (JSON):
      1. dailyData: Một mảng gồm 7 điểm dữ liệu (đại diện cho xu hướng tuần) với các trường: date (string), clicks (number), impressions (number), conversions (number), cost (number). Dữ liệu nên cho thấy xu hướng tăng trưởng.
      2. channelBreakdown: Mảng phân tích từng kênh (platform, estimatedReach, estimatedCpc, estimatedConversionRate, suggestedBudget).
         LƯU Ý ĐẶC BIỆT: 
         - Với Zalo: tập trung vào chỉ số Form hoặc Message, CPC thường cao hơn một chút nhưng conversion rate tốt.
         - Với Google: tập trung Search/Shopping.
         - Với Facebook/TikTok: tập trung hiển thị/reach.
         - suggestedBudget của các kênh cộng lại phải bằng budget tổng.
      3. summary: totalReach, totalConversions, avgCpa, roiPrediction (số thập phân, ví dụ 3.5).
      4. aiAnalysis: Một đoạn văn ngắn (Tiếng Việt) phân tích chiến lược, ví dụ: "Với ngân sách này, bạn nên dồn 40% cho Zalo để lấy leads chất lượng, kết hợp Google Search để bắt nhu cầu...".
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             dailyData: { 
                 type: Type.ARRAY, 
                 items: { type: Type.OBJECT, properties: { date: {type: Type.STRING}, clicks: {type: Type.NUMBER}, impressions: {type: Type.NUMBER}, conversions: {type: Type.NUMBER}, cost: {type: Type.NUMBER} } }
             },
             channelBreakdown: {
                 type: Type.ARRAY,
                 items: { type: Type.OBJECT, properties: { platform: {type: Type.STRING}, estimatedReach: {type: Type.NUMBER}, estimatedCpc: {type: Type.NUMBER}, estimatedConversionRate: {type: Type.NUMBER}, suggestedBudget: {type: Type.NUMBER} } }
             },
             summary: {
                 type: Type.OBJECT,
                 properties: { totalReach: {type: Type.NUMBER}, totalConversions: {type: Type.NUMBER}, avgCpa: {type: Type.NUMBER}, roiPrediction: {type: Type.NUMBER} }
             },
             aiAnalysis: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Forecast Error:", error);
    // Fallback Mock Data
    return {
        dailyData: Array.from({length: 7}, (_, i) => ({ date: `Day ${i+1}`, clicks: 100 + i*10, impressions: 5000 + i*500, conversions: 5 + i, cost: budget/30 })),
        channelBreakdown: platforms.map(p => ({ platform: p, estimatedReach: 50000, estimatedCpc: 3000, estimatedConversionRate: 0.02, suggestedBudget: budget / platforms.length })),
        summary: { totalReach: 150000, totalConversions: 200, avgCpa: 55000, roiPrediction: 2.8 },
        aiAnalysis: "Không thể kết nối AI Server. Dữ liệu giả lập cơ bản."
    }
  }
}
