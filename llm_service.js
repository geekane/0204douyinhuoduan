// llm_service.js - LLM 文案生成服务
// 使用豆包 API 根据原始转写文案和用户产品信息生成新的营销文案

// Node.js 18+ 内置了 fetch，无需引入 node-fetch

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
    const systemPrompt = `你是一位专业的文案改写专家，擅长严格模仿原文案的结构和表达方式，只替换产品相关的内容。

你的任务是：
1. 严格保持原文案的：
   - 句式结构（每句话的长度、语气、标点）
   - 表达方式（疑问句、感叹句、陈述句的位置）
   - 开场方式（如何吸引注意力）
   - 痛点描述的位置和方式
   - 解决方案的呈现顺序
   - 结尾的行动号召（CTA）
   - 语气词、连接词的使用

2. 只替换以下内容：
   - 产品名称
   - 产品功能和特点
   - 使用场景
   - 目标用户的痛点（对应到新产品）
   - 价格信息

重要原则：
- 必须逐句对应原文案，不能增加或减少句子
- 保持原文案的字数和节奏，误差不超过 20%
- 不要改变原文案的情感基调和表达风格
- 如果原文案用了比喻、排比等修辞手法，新文案也要用相同的手法
- 直接输出改写后的文案，不要添加任何解释`;

    const userPrompt = `【原始文案】
${originalTranscript}

【新产品信息】
${userProduct}

请严格按照原始文案的结构和表达方式，只替换产品相关的内容，生成新文案。保持相同的句式、语气和节奏。`;

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

    const systemPrompt = `你是一位专业的文案改写专家，擅长严格模仿原文案的结构和表达方式，只替换产品相关的内容。

你的任务是：
1. 严格保持原文案的：
   - 句式结构（每句话的长度、语气、标点）
   - 表达方式（疑问句、感叹句、陈述句的位置）
   - 开场方式（如何吸引注意力）
   - 痛点描述的位置和方式
   - 解决方案的呈现顺序
   - 结尾的行动号召（CTA）
   - 语气词、连接词的使用

2. 只替换以下内容：
   - 产品名称
   - 产品功能和特点
   - 使用场景
   - 目标用户的痛点（对应到新产品）
   - 价格信息

重要原则：
- 必须逐句对应原文案，不能增加或减少句子
- 保持原文案的字数和节奏，误差不超过 20%
- 不要改变原文案的情感基调和表达风格
- 如果原文案用了比喻、排比等修辞手法，新文案也要用相同的手法
- 直接输出改写后的文案，不要添加任何解释`;

    const userPrompt = `【原始文案】
${originalTranscript}

【新产品信息】
${userProduct}

请严格按照原始文案的结构和表达方式，只替换产品相关的内容，生成新文案。保持相同的句式、语气和节奏。`;

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
