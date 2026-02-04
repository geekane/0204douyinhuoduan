const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ============================================================================
//   配置区域 (深度对齐 test_audio_api.js)
// ============================================================================

const CONFIG = {
    // 优先从环境变量读取，否则使用 test_audio_api.js 中的硬编码值
    cookie: process.env.DOUYIN_COOKIE || 'bd_ticket_guard_client_web_domain=2; SEARCH_RESULT_LIST_TYPE=%22single%22; hevc_supported=true; enter_pc_once=1; UIFID=5bdad390e71fd6e6e69e3cafe6018169c2447c8bc0b8484cc0f203a274f99fdb36c5480fead496b35dc17bc9f0974de39835670892ea68c3c751d2cc217e4805a165d0fa0bedbf3bb38c03f6811587f7d6c205a025b5aea06dfd21eae1ad512ee782d9f48a3e4c3b70ef4c7cf802335dc2533f1ad3b63a21384377f8ffd0025c27ea3a54a8b2cdadac40ea844a027039ade8cfe386ec4c2b6686d2611d785601; is_dash_user=1; passport_csrf_token=3e5c3e83185efbd3687cfe5fe47449d9; passport_csrf_token_default=3e5c3e83185efbd3687cfe5fe47449d9; download_guide=%223%2F20260202%2F0%22; volume_info=%7B%22isUserMute%22%3Afalse%2C%22isMute%22%3Atrue%2C%22volume%22%3A0.966%7D; strategyABtestKey=%221770177416.974%22; ttwid=1%7CM7zyc7mOE7RfoRBPFCfTMp9IHp6YoyVjlz1QtlECV7k%7C1770186930%7C3ee70f3a5b98f970eafd4d4e6a6e441b5d8e39585beeb4e72876bab0ad7ace35; sdk_source_info=7e276470716a68645a606960273f276364697660272927676c715a6d6069756077273f276364697660272927666d776a68605a607d71606b766c6a6b5a7666776c7571273f275e58272927666a6b766a69605a696c6061273f27636469766027292762696a6764695a7364776c6467696076273f275e582729277672715a646971273f2763646976602729277f6b5a666475273f2763646976602729276d6a6e5a6b6a716c273f2763646976602729276c6b6f5a7f6367273f27636469766027292771273f2731313234363c333d3435323234272927676c715a75776a716a666a69273f2763646976602778; bit_env=aSCxZD4lmZqwUD0KdmKY4VQRceC7pDQOI0jC3b2PJmgopfg6pvEM81NVBoPWQfSmsl8zHgtm_a-nupVFoah_vwf8uatKNyrM_T6tqaIg1sKBLFgmIyYgBmKqvND4YJ1Clfn7VM4HxPs27X0bZ9Jn_oSuAaxWgXVO_KBZRC1GAkt7tZa_OEC4CsVYzljyXkfnX2h8rmJHZfKMAqEmSBXL9MMFce9KZ9Yf5lmtiqZT_Rs3CIrdwTL4e6amNP4_XvYkkQjaDWCkpf7rVLwLh65HCeenNDULRhaOItGr04z79FhosIZEDNFdH8aAGBAGgxpq6uIPL8TO4sbOYzY3frF9Kj--tNlxmJjkAz9vrCxRnhlsvofM2QzSu8yrbvPrMsIrYWCLM_cW0YcEUCAmIEoj1JX1EuK-DMrpAMQ-ybESLv6futEaBFZvLBfrw5qSz9UWL8POD-WKi8ti_2btE_7sp7bwcnnUlPBL3QjXRxTZS-7DEl7cxHLlTAsrezd-H9KP; gulu_source_res=eyJwX2luIjoiNjU5NTEzOWNiNWY3ZDAzY2U1YmNkZjNlM2M2MDQwZjk0N2JiNGVkYWUzZjc5N2FhNzAzZjczZDcwZjlmODQyMSJ9; passport_auth_mix_state=b0odg05dnxc66jtt3i63you4m5bnmya4; passport_assist_user=Cjx2RP-BtGxZHDIz_VtilcKtAw7BiMZ2xeQeMHET2DtNhpcP4V3u91kD1VSUPNanM5R1x6ko4C7bD3JumNQaSgo8AAAAAAAAAAAAAFAI1dlOK8UNYZ2_1PRJx_2-Z1WAgiCZMNxWK1vkHKROBUjyJgcu7ZISN7DiCBG23wzYEPfaiA4Yia_WVCABIgEDTuZ38A%3D%3D; n_mh=qheQFbah7hHshwNE2PNtjdisyGC4FcUrNDEFrG1EbjY; sid_guard=8f571c61ec0fd2433e7b935d22fc1558%7C1770186979%7C5184000%7CSun%2C+05-Apr-2026+06%3A36%3A19+GMT; uid_tt=cd1cf49682737e5f17715a6f4f52c307; uid_tt_ss=cd1cf49682737e5f17715a6f4f52c307; sid_tt=8f571c61ec0fd2433e7b935d22fc1558; sessionid=8f571c61ec0fd2433e7b935d22fc1558; sessionid_ss=8f571c61ec0fd2433e7b935d22fc1558; session_tlb_tag=sttt%7C9%7Cj1ccYewP0kM-e5NdIvwVWP________-uBVs7xw1sc7pm1REMDSb5Mt4TSd5Zsx5kjcDBovE-9nI%3D; is_staff_user=false; sid_ucp_v1=1.0.0-KGViOWMyNmU5NDBiYzFkNjdlZmI3MWIwNTE0YTRmMGYzMDEyMzIxNDgKHwibstH8mgIQ49GLzAYY7zEgDDDMjrDQBTgHQPQHSAQaAmhsIiA4ZjU3MWM2MWVjMGZkMjQzM2U3YjkzNWQyMmZjMTU1OA; ssid_ucp_v1=1.0.0-KGViOWMyNmU5NDBiYzFkNjdlZmI3MWIwNTE0YTRmMGYzMDEyMzIxNDgKHwibstH8mgIQ49GLzAYY7zEgDDDMjrDQBTgHQPQHSAQaAmhsIiA4ZjU3MWM2MWVjMGZkMjQzM2U3YjkzNWQyMmZjMTU1OA; _bd_ticket_crypt_cookie=5d1bb8e20ad3810a6ef336c574d9cf57; __security_mc_1_s_sdk_sign_data_key_web_protect=4d9f9915-4446-b6b8; __security_mc_1_s_sdk_cert_key=50c2af78-466a-8dd7; __security_mc_1_s_sdk_crypt_sdk=6c7f853b-4089-83ea; __security_server_data_status=1; login_time=1770186980001; stream_recommend_feed_params=%22%7B%5C%22cookie_enabled%5C%22%3Atrue%2C%5C%22screen_width%5C%22%3A1920%2C%5C%22screen_height%5C%22%3A1080%2C%5C%22browser_online%5C%22%3Atrue%2C%5C%22cpu_core_num%5C%22%3A12%2C%5C%22device_memory%5C%22%3A8%2C%5C%22downlink%5C%22%3A10%2C%5C%22effective_type%5C%22%3A%5C%224g%5C%22%2C%5C%22round_trip_time%5C%22%3A0%7D%22; SelfTabRedDotControl=%5B%7B%22id%22%3A%227113860477604694023%22%2C%22u%22%3A100%2C%22c%22%3A0%7D%5D; home_can_add_dy_2_desktop=%221%22; FOLLOW_LIVE_POINT_INFO=%22MS4wLjABAAAA91OhU6CY-3l9vrXp4zfWCJk9elYyGeXyduNh44_fhV8%2F1770220800000%2F0%2F1770186981636%2F0%22; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtcmVlLXB1YmxpYy1rZXkiOiJCTzVQbklpVGdVWUxiekx4QjVWM25zQlpqVldFMjc5K0NJU2IzbTRXUVRhdC9sSVdQcm5RV1dWVnlnL1NRYTk1cHNEaUUzWGRxZTFUTnBXcndYT0ZlVWc9IiwiYmQtdGlja2V0LWd1YXJkLXdlYi12ZXJzaW9uIjoyfQ%3D%3D; publish_badge_show_info=%220%2C0%2C0%2C1770186986305%22; biz_trace_id=05bdbe77; bd_ticket_guard_client_data_v2=eyJyZWVfcHVibGljX2tleSI6IkJPNVBuSWlUZ1VZTGJ6THhCNVYzbnNCWmpWV0UyNzkrQ0lTYjNtNFdRVGF0L2xJV1ByblFXV1ZSeWcvU1FhOTVwc0RpRTNYZHFlMVROcFdyd1hPRmVVZz0iLCJ0c19zaWduIjoidHMuMi4yNjU3YzA1NjgwMzBlYTc1N2Q2NDU2N2Y1MDY3YTBkNGM3NTkyNWRkNmY4MGI4OGZkZDg4MDI5NmRhMTAwNWM4YzRmYmU4N2QyMzE5Y2YwNTMxODYyNGNlZGExNDkxMWNhNDA2ZGVkYmViZWRkYjJlMzBmY2U4ZDRmYTAyNTc1ZCIsInJlcV9jb250ZW50Ijoic2VjX3RzIiwicmVxX3NpZ24iOiJhbnRvR0NtdFp2MGQwczAwYmFtMUpwbFh0NG93UmpHdm9rblFiNEowNTZzPSIsInNlY190cyI6IiNsMk5UQXd3QW9CdVBCOWUrMm13NWpXZTNsdEFmUE1XN3R4U0VQZ0hCd1MrTVlIMVlrcGw3b2x1WVF1Z3gifQ%3D%3D; odin_tt=edb4f5c7a0193ab086c5ff8987a8bcde8a778216a81d3b6c79200472c4b2226f13b522e8d09af94ecfe7a81d76e5947669c8087a6ef4d8a13298f9f3b2a5662c; IsDouyinActive=true',

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
        "&a_bogus=d6sVDFUJOqRnPVFSuKB0efelQgdlrBSy51TQbEKPHNObPwUbKbPNOnSpaxLa4LXl3RpwwFA7EEP%2FYnnbY4UTZHckumpvuPJW70VnIXsogqqsG0iQDq80SzmFFwBn05sqaQ54ilk6%2FUeo6ndAwNQu%2FB-rt%2FueQ5uBB1OSkZTbE9B61MLAE3n1PQtDThaGU6I6",

    headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'referer': 'https://www.douyin.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    }
};

// ============================================================================
//   核心提取逻辑 (严格复制 test_audio_api.js)
// ============================================================================

function extractAudioFromAweme(aweme) {
    const title = aweme.desc || `video_${aweme.aweme_id}`;
    const video = aweme.video || {};
    let audioUrl = null;

    // 1. 尝试从 bit_rate (DASH 分离流) 中寻找独立的音频流
    if (video.bit_rate && video.bit_rate.length > 0) {
        for (const item of video.bit_rate) {
            const urls = item.play_addr?.url_list || [];
            const target = urls.find(u => u.includes('media-audio-und-mp4'));
            if (target) {
                audioUrl = target;
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
        audioUrl = aweme.music?.play_url?.url_list?.[0];
    }

    return { audioUrl, title, awemeId: aweme.aweme_id, author: aweme.author };
}

// ============================================================================
//   路由处理
// ============================================================================

app.get('/api/extract', async (req, res) => {
    let url = req.query.url;
    const videoId = req.query.videoId; // 新增：可选的视频ID参数，用于过滤特定视频
    
    if (!url) return res.status(400).json({ success: false, error: '缺少 url 参数' });

    console.log(`[Backend] Processing URL: ${url}`);
    if (videoId) console.log(`[Backend] Filtering for videoId: ${videoId}`);

    try {
        let targetUrl = url;

        // 1. 短链解析 (使用 fetch，与 test_audio_api.js 一致)
        if (url.includes('v.douyin.com')) {
            console.log('[Backend] Resolving short link...');
            const response = await fetch(url, { redirect: 'follow' });
            targetUrl = response.url;
            console.log(`[Backend] Resolved short link: ${targetUrl}`);
        }

        const fetchHeaders = {
            ...CONFIG.headers,
            'cookie': CONFIG.cookie
        };

        // 2. 统一使用用户主页模式（移除不稳定的单视频详情API）
        if (targetUrl.includes('/user/') || targetUrl.includes('sec_user_id')) {
            // === 用户主页列表模式 ===
            const secUid = targetUrl.match(/\/user\/([a-zA-Z0-9_-]+)/)?.[1] ||
                new URL(targetUrl).searchParams.get('sec_user_id');

            if (!secUid) throw new Error("Could not find secUid");

            const count = req.query.count || 35; // 增加默认数量以提高找到目标视频的概率
            const apiUrl = `https://www.douyin.com/aweme/v1/web/aweme/post/?device_platform=webapp&aid=6383&channel=channel_pc_web&pc_client_type=1&sec_user_id=${secUid}&max_cursor=0&count=${count}${CONFIG.commonParams}`;

            console.log('[Backend] Fetching user videos...');
            const response = await fetch(apiUrl, { headers: fetchHeaders });
            const text = await response.text();
            const data = JSON.parse(text);
            const list = data.aweme_list || [];

            if (list.length === 0) {
                console.warn('[Backend] API returned empty list. Response:', text.substring(0, 500));
                throw new Error("API returned unexpected empty list");
            }

            const results = list.map(item => {
                const { audioUrl, title } = extractAudioFromAweme(item);
                return {
                    awemeId: item.aweme_id,
                    videoTitle: title,
                    videoUrl: audioUrl,
                    pageUrl: `https://www.douyin.com/video/${item.aweme_id}`
                };
            });

            // 如果指定了videoId，只返回匹配的视频
            if (videoId) {
                const targetVideo = results.find(v => v.awemeId === videoId);
                if (targetVideo) {
                    console.log(`[Backend] Found target video: ${videoId}`);
                    res.json({
                        success: true,
                        type: 'single',
                        ...targetVideo,
                        authorName: list[0]?.author?.nickname,
                        authorSecUid: secUid
                    });
                } else {
                    console.warn(`[Backend] Video ${videoId} not found in user's recent ${results.length} videos`);
                    res.status(404).json({
                        success: false,
                        error: `视频 ${videoId} 未在用户最近的 ${results.length} 个视频中找到，可能需要增加count参数`
                    });
                }
            } else {
                // 返回完整列表
                res.json({
                    success: true,
                    type: 'user',
                    authorName: list[0]?.author?.nickname,
                    secUid: secUid,
                    count: results.length,
                    videos: results
                });
            }

        } else {
            throw new Error("Unsupported URL type. Please use user homepage URL.");
        }

    } catch (e) {
        console.error(`[Backend] Error: ${e.message}`);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`[Backend] Server strictly mirroring test_audio_api.js logic on port ${PORT}`);
});
