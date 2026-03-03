// llm_service.js - LLM 文案生成服务
// 使用豆包 API 根据原始转写文案和用户产品信息生成新的营销文案

const fetch = require('node-fetch');

// LLM 配置
const LLM_CONFIG = {
    baseUrl: process.env.LLM_BASE_URL || 'https://aiclient-2-api-89ny.onrender.com/v1',
    apiKey: process.env.LLM_API_KEY || '123456',
    model: process.env.LLM_MODEL || 'gemini-2.5-flash-lite'
};

/**
 * 调用 LLM 生成新文案
 * @param {string} originalTranscript - 原始视频转写文案
 * @param {string} userProduct - 用户的产品信息/卖点
 * @returns {Promise<string>} 生成的新文案
 */
async function generateNewCopywriting(originalTranscript, userProduct) {
    console.log('[LLM Service] 开始生成新文案...');
    console.log('[LLM Service] 原始文案长度:', originalTranscript?.length || 0);
    console.log('[LLM Service] 用户产品:', userProduct?.substring(0, 50) || '(未提供)');

    if (!originalTranscript || !userProduct) {
        throw new Error('缺少必要参数：原始文案或产品信息');
    }

    // 构建 Prompt
    const systemPrompt = `你是一位专业的短视频营销文案专家，擅长分析爆款视频的文案结构和话术技巧，并为不同产品创作吸引人的营销文案。

你的任务是：
1. 分析提供的原始视频文案，提取其中的：
   - 开场吸引点（hook）
   - 情感共鸣点
   - 痛点描述方式
   - 解决方案呈现方式
   - 行动号召（CTA）
   - 语言风格和节奏

2. 根据用户提供的产品信息，借鉴原文案的优秀结构和话术，创作一个全新的营销文案。

要求：
- 保持原文案的情感张力和节奏感
- 完全替换为用户产品的相关内容
- 文案要自然流畅，不生硬
- 长度控制在 100-300 字
- 适合短视频口播或字幕展示
- 突出产品卖点和用户痛点`;

    const userPrompt = `【原始爆款文案】
${originalTranscript}

【用户产品信息】
${userProduct}

请根据以上信息，为用户产品创作一个新的营销文案。直接输出文案内容，不要添加任何解释或标题。`;

    try {
        const response = await fetch(`${LLM_CONFIG.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: LLM_CONFIG.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                stream: false,
                temperature: 0.8,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[LLM Service] API 错误:', response.status, errorText);
            throw new Error(`LLM API 请求失败: ${response.status} ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('[LLM Service] 响应格式异常:', JSON.stringify(data).substring(0, 200));
            throw new Error('LLM 返回数据格式异常');
        }

        const generatedContent = data.choices[0].message.content;
        console.log('[LLM Service] ✅ 文案生成成功，长度:', generatedContent.length);

        return generatedContent.trim();

    } catch (error) {
        console.error('[LLM Service] ❌ 生成失败:', error.message);
        throw error;
    }
}

/**
 * 流式生成新文案（支持实时返回）
 * @param {string} originalTranscript - 原始视频转写文案
 * @param {string} userProduct - 用户的产品信息/卖点
 * @param {Function} onChunk - 接收每个文本块的回调函数
 * @returns {Promise<string>} 完整的生成文案
 */
async function generateNewCopywritingStream(originalTranscript, userProduct, onChunk) {
    console.log('[LLM Service] 开始流式生成新文案...');

    if (!originalTranscript || !userProduct) {
        throw new Error('缺少必要参数：原始文案或产品信息');
    }

    const systemPrompt = `你是一位专业的短视频营销文案专家，擅长分析爆款视频的文案结构和话术技巧，并为不同产品创作吸引人的营销文案。

你的任务是：
1. 分析提供的原始视频文案，提取其中的：
   - 开场吸引点（hook）
   - 情感共鸣点
   - 痛点描述方式
   - 解决方案呈现方式
   - 行动号召（CTA）
   - 语言风格和节奏

2. 根据用户提供的产品信息，借鉴原文案的优秀结构和话术，创作一个全新的营销文案。

要求：
- 保持原文案的情感张力和节奏感
- 完全替换为用户产品的相关内容
- 文案要自然流畅，不生硬
- 长度控制在 100-300 字
- 适合短视频口播或字幕展示
- 突出产品卖点和用户痛点`;

    const userPrompt = `【原始爆款文案】
${originalTranscript}

【用户产品信息】
${userProduct}

请根据以上信息，为用户产品创作一个新的营销文案。直接输出文案内容，不要添加任何解释或标题。`;

    try {
        const response = await fetch(`${LLM_CONFIG.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: LLM_CONFIG.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                stream: true,
                temperature: 0.8,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`LLM API 请求失败: ${response.status}`);
        }

        let fullContent = '';
        const reader = response.body;

        // 处理流式响应
        for await (const chunk of reader) {
            const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);

                    if (data === '[DONE]') {
                        continue;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content || '';

                        if (content) {
                            fullContent += content;
                            if (onChunk) {
                                onChunk(content);
                            }
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }

        console.log('[LLM Service] ✅ 流式生成完成，总长度:', fullContent.length);
        return fullContent.trim();

    } catch (error) {
        console.error('[LLM Service] ❌ 流式生成失败:', error.message);
        throw error;
    }
}

module.exports = {
    generateNewCopywriting,
    generateNewCopywritingStream
};
