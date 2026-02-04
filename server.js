const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 记录日志
const logger = {
    info: (msg, data = '') => console.log(`[INFO] ${new Date().toLocaleString()} - ${msg}`, data),
    error: (msg, err = '') => console.error(`[ERROR] ${new Date().toLocaleString()} - ${msg}`, err)
};

// 从环境变量或 .env 获取稳定配置
const USER_CONFIG = {
    cookie: process.env.DOUYIN_COOKIE || '',
    commonParams: "&locate_query=false&show_live_replay_strategy=1" +
        "&need_time_list=1&time_list_query=0&whale_cut_token=&cut_version=1&publish_video_strategy_type=2" +
        "&from_user_page=1&update_version_code=170400&pc_libra_divert=Windows&support_h265=1" +
        "&support_dash=1&cpu_core_num=12&version_code=290100&version_name=29.1.0&cookie_enabled=true" +
        "&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome" +
        "&browser_version=144.0.0.0&browser_online=true&engine_name=Blink&engine_version=144.0.0.0" +
        "&os_name=Windows&os_version=10&device_memory=8&platform=PC&downlink=10&effective_type=4g" +
        "&round_trip_time=0" +
        "&webid=7579160282200065574" +
        "&msToken=UX8Y3f5etd_Fi_XCUZWpZx9iTyr5x6GS4T5lZgqPe6iYAVhYIwj0fM9AFEB1Qf6htAlNqHs5e90s_GFPqF4S-tOnojtKIy81U_2e858e1WHDCf1wqypwOK10iNC-lXO2o8KP0_UcmdFWZLGAPRfKxFAOUWjIoyyOyP38jRdaCOmM" +
        "&a_bogus=d6sVDFUJOqRnPVFSuKB0efelQgdlrBSy51TQbEKPHNObPwUbKbPNOnSpaxLa4LXl3RpwwFA7EEP%2FYnnbY4UTZHckumpvuPJW70VnIXsogqqsG0iQDq80SzmFFwBn05sqaQ54ilk6%2FUeo6ndAwNQu%2FB-rt%2FueQ5uBB1OSkZTbE9B61MLAE3n1PQtDThaGU6I6" +
        "&verifyFp=verify_mjjna0jd_SbOxVRZN_eghh_4hqQ_BTYk_I8uqj5m2kocI" +
        "&fp=verify_mjjna0jd_SbOxVRZN_eghh_4hqQ_BTYk_I8uqj5m2kocI",

    headers: {
        'accept': 'application/json, text/plain, */*',
        'referer': 'https://www.douyin.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
    }
};

/**
 * 提取音频连接的逻辑 (对齐 test_audio_api.js)
 */
function extractAudioFromAweme(aweme) {
    if (!aweme || !aweme.video) return null;

    const video = aweme.video;
    let audioUrl = null;

    // 1. 尝试从 bit_rate (DASH 分离流) 中寻找独立的音频流
    if (video.bit_rate && video.bit_rate.length > 0) {
        for (const item of video.bit_rate) {
            const urls = item.play_addr?.url_list || [];
            const target = urls.find(u => u.includes('media-audio-und-mp4'));
            if (target) {
                audioUrl = target.startsWith('//') ? 'https:' + target : target;
                break;
            }
        }
    }

    // 2. 如果没找到，通过正则从 DASH Manifest 字符串中提取音频地址
    if (!audioUrl && video.dash_manifest) {
        const match = video.dash_manifest.match(/https?:\/\/[^<>\s"']+media-audio-und-mp4[^<>\s"']+/);
        if (match) audioUrl = match[0];
    }

    // 3. 回退方案：提取 music 字段
    if (!audioUrl) {
        const musicUrl = aweme.music?.play_url?.url_list?.[0];
        if (musicUrl) audioUrl = musicUrl.startsWith('//') ? 'https:' + musicUrl : musicUrl;
    }

    // 4. 最终回退：play_addr
    if (!audioUrl) {
        const playUrl = video.play_addr?.url_list?.[0];
        if (playUrl) audioUrl = playUrl.startsWith('//') ? 'https:' + playUrl : playUrl;
    }

    return audioUrl;
}

/**
 * 核心处理接口
 */
app.get('/api/extract', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ success: false, error: '缺少 url 参数' });

    logger.info(`收到请求: ${url}`);

    try {
        let targetUrl = url;
        // 1. 分离短链接
        if (url.includes('v.douyin.com')) {
            const redirectResp = await axios.get(url, {
                maxRedirects: 5,
                validateStatus: status => status >= 200 && status < 400,
                headers: USER_CONFIG.headers
            });
            targetUrl = redirectResp.request.res.responseUrl || targetUrl;
            logger.info(`📍 短链解析结果: ${targetUrl}`);
        }

        // 识别是视频还是主页
        if (targetUrl.includes('/video/')) {
            // --- 单条视频详情模式 ---
            const awemeId = targetUrl.match(/\/video\/(\d+)/)?.[1];
            if (!awemeId) throw new Error("无法识别视频 ID");

            const apiUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?device_platform=webapp&aid=6383&channel=channel_pc_web&pc_client_type=1&aweme_id=${awemeId}${USER_CONFIG.commonParams}`;

            const response = await axios.get(apiUrl, {
                headers: { ...USER_CONFIG.headers, 'cookie': USER_CONFIG.cookie }
            });

            const aweme = response.data.aweme_detail;
            if (!aweme) {
                logger.error("API 详情未回显", response.data);
                throw new Error("抖音 API 未返回详情，请检查后端 Cookie 是否过期");
            }

            const audioUrl = extractAudioFromAweme(aweme);
            res.json({
                success: true,
                type: 'video',
                videoUrl: audioUrl,
                videoTitle: aweme.desc,
                authorName: aweme.author?.nickname,
                authorSecUid: aweme.author?.sec_uid,
                awemeId: awemeId
            });

        } else if (targetUrl.includes('/user/')) {
            // --- 用户主页列表模式 ---
            const secUid = targetUrl.match(/\/user\/([a-zA-Z0-9_-]+)/)?.[1];
            if (!secUid) throw new Error("无法识别用户 SecUID");

            // 默认获取最新 10 条 (可以根据业务需求调整)
            const count = req.query.count || 20;
            const apiUrl = `https://www.douyin.com/aweme/v1/web/aweme/post/?device_platform=webapp&aid=6383&channel=channel_pc_web&sec_user_id=${secUid}&max_cursor=0&count=${count}${USER_CONFIG.commonParams}`;

            const response = await axios.get(apiUrl, {
                headers: { ...USER_CONFIG.headers, 'cookie': USER_CONFIG.cookie }
            });

            const list = response.data.aweme_list || [];
            const results = list.map(item => ({
                awemeId: item.aweme_id,
                videoTitle: item.desc,
                createTime: item.create_time,
                pageUrl: `https://www.douyin.com/video/${item.aweme_id}`,
                videoUrl: extractAudioFromAweme(item)
            }));

            res.json({
                success: true,
                type: 'user',
                authorName: list[0]?.author?.nickname || '未知用户',
                secUid: secUid,
                count: results.length,
                videos: results
            });

        } else {
            throw new Error("不支持的链接类型，请提供视频链接或用户主页链接");
        }

    } catch (e) {
        logger.error(`处理失败: ${url}`, e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    logger.info(`🚀 深度增强版后端已启动: http://localhost:${PORT}`);
    logger.info(`💡 提示: 视频详情和用户列表均已对齐 test_audio_api.js 逻辑`);
});
