import { Filter, FilterCtx, FilterString } from "@/common/types";

//屏蔽遮罩 标题 用户名为***，封面修改为空字符串 
export const homeFeedFilter: FilterString = {
    id: 'homeFeedFilter',
    name: '首页推荐过滤器',
    start: true,
    sort: 1,
    filterConfList: [
        {
            id: "blockAd",
            defaultValue: true,
            name: "blockAd",
            description: "屏蔽广告",
            type: "boolean",
            value: true
        },
        {
            id: "blockLive",
            defaultValue: true,
            name: "blockLive",
            description: "屏蔽直播",
            type: "boolean",
            value: true
        },
        {
            id: "showFollowed",
            name: "showFollowed",
            description: "显示关注的人的视频",
            type: "boolean",
            defaultValue: true
        },
        {
            id: "showAdBlockMask",
            name: "showAdBlockMask",
            description: "显示广告遮罩",
            type: "boolean",
            defaultValue: true
        },
        {
            id: "showLiveBlockMask",
            name: "showLiveBlockMask",
            description: "显示直播遮罩",
            type: "boolean",
            defaultValue: true
        },
        {
            id: "showGeneralBlockMask",
            name: "showGeneralBlockMask",
            description: "显示黑名单遮罩",
            type: "boolean",
            defaultValue: true
        },
        {
            id: "uidGreaterThan",
            name: "uidGreaterThan",
            description: "uid大于屏蔽",
            type: "number",
            defaultValue: 3000000000000000
        },
        {
            id: "durationLessThan",
            name: "durationLessThan",
            description: "时长小于屏蔽",
            type: "number",
            defaultValue: 100
        },
        {
            id: "viewLessThan",
            name: "viewLessThan",
            description: "播放量小于屏蔽",
            type: "number",
            defaultValue: 1000
        },
        {
            id: "likeLessThan",
            name: "likeLessThan",
            description: "点赞数小于屏蔽",
            type: "number",
            defaultValue: 100
        },
        {
            id: "danmakuLessThan",
            name: "danmakuLessThan",
            description: "弹幕数小于屏蔽",
            type: "number",
            defaultValue: 5
        },
        {
            id: "viewLikeRatioLessThan",
            name: "viewLikeRatioLessThan",
            description: "播放量与点赞数的比率小于屏蔽",
            type: "number",
            defaultValue: 0.05
        },
        {
            id: "viewDanmakuRatioLessThan",
            name: "viewDanmakuRatioLessThan",
            description: "播放量与弹幕数的比率小于屏蔽",
            type: "number",
            defaultValue: 0
        },
        {
            id: "likeDanmakuRatioLessThan",
            name: "likeDanmakuRatioLessThan",
            description: "点赞数与弹幕数的比率小于屏蔽",
            type: "number",
            defaultValue: 0.05
        },
    ],
    predicate: `return requestUrl.startsWith('https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?');`,
    filter: `
        const { generalFilterSettings, blacklist, blockReport, errorReport, ext } = filterCtx;
        console.log(filterCtx)
        const data = JSON.parse(responseText);
        const items = data.data.item;
        const filteredItems = [];
        const adBlockMask = function(item) {
            if (ext.showAdBlockMask) {
                if(item.bussiness_info){
                    item.bussiness_info.title = '广告';
                    item.bussiness_info.pic = '';
                    item.bussiness_info.name = '***';
                }
                filteredItems.push(item);
            }
        }
        const liveBlockMask = function(item) {
            if (ext.showLiveBlockMask) {
                item.room_info.title = '直播';
                item.room_info.pic = '';
                item.room_info.name = '***';
                filteredItems.push(item);
            }
        }
        const generalBlockMask = function(item) {
            if (ext.showGeneralBlockMask) {
                item.title = '***';
                item.pic = '';
                if (item.owner) {
                    item.owner.name = '***';
                }
                filteredItems.push(item);
            }
        }
        const itemFilter = function(item) {
            if (generalFilterSettings.showFollowed && item.is_followed == 1) {
                // 显示关注的人的视频
                filteredItems.push(item);
                return
            }
            if (ext.blockAd && item.goto == 'ad') {
                // 屏蔽广告
          
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '广告',
                    reasonType: 'ad',
                    item: JSON.stringify(item)
                });
                adBlockMask(item);
                return
            }
            if (ext.blockLive && item.goto == 'live') {
                // 屏蔽直播
                
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '直播',
                    reasonType: 'live',
                    item: JSON.stringify(item)
                });
                liveBlockMask(item);
                return
            }
            const uid = item.owner && item.owner.mid;
            if (uid && blacklist.uidList && blacklist.uidList.includes(uid)) {
                // 屏蔽黑名单用户
                
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '黑名单用户',
                    reasonType: 'uid',
                    value: uid,
                    item: JSON.stringify(item)
                });
                generalBlockMask(item);
                return
            }
            const uname = item.owner && item.owner.name;
            if (uname && blacklist.unameList && blacklist.unameList.includes(uname)) {
                // 屏蔽黑名单用户
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '黑名单用户',
                    reasonType: 'uname',
                    value: uname,
                    item: JSON.stringify(item)
                });
                generalBlockMask(item);
                return
            }
            if (uname && blacklist.unameRegexList && blacklist.unameRegexList.some(function(regex) { return regex.test(uname); })) {
                // 屏蔽黑名单用户
                
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '黑名单用户',
                    reasonType: 'uname',
                    value: uname,
                    item: JSON.stringify(item)
                });
                generalBlockMask(item);
                return
            }
            if (blacklist.titleRegexList && blacklist.titleRegexList.some(function(regex) { return regex.test(item.title); })) {
                // 屏蔽黑名单标题
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '黑名单标题',
                    reasonType: 'title',
                    value: item.title,
                    item: JSON.stringify(item)
                });
                generalBlockMask(item);
                return
            }
            if(uid >= ext.uidGreaterThan){
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: 'uid大于屏蔽'+ext.uidGreaterThan,
                    reasonType: 'uidGreaterThan',
                    value: uid,
                    item: JSON.stringify(item)
                });
                generalBlockMask(item);
                return
            }
            console.log(item.duration, ext.durationLessThan)
            if(item.duration <= ext.durationLessThan){
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '视频时长小于'+ext.durationLessThan,
                    reasonType: 'durationLessThan',
                    value: item.duration,
                    item: JSON.stringify(item)
                });
                generalBlockMask(item);
                return
            }
            if(item.stat && item.stat.view <= ext.viewLessThan){
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '播放量小于'+ext.viewLessThan,
                    reasonType: 'viewLessThan',
                    value: item.stat.view,
                    item: JSON.stringify(item)
                });
                generalBlockMask(item);
                return
            }
            if(item.stat && item.stat.like <= ext.likeLessThan){
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '点赞数小于'+ext.likeLessThan,
                    reasonType: 'likeLessThan',
                    value: item.stat.like,
                    item: JSON.stringify(item)
                });
                generalBlockMask(item);
                return
            }
            if(item.stat && item.stat.danmaku <= ext.danmakuLessThan){
                blockReport({
                    filterName: '首页推荐过滤器',
                    reason: '弹幕数小于屏蔽'+ext.danmakuLessThan,
                    reasonType: 'danmakuLessThan',
                    value: item.stat.danmaku,
                    item: JSON.stringify(item)
                });
                generalBlockMask(item);
                return
            }
            if(item.stat){
                const viewLikeRatio = item.stat.view / item.stat.like;
                if(viewLikeRatio <= ext.viewLikeRatioLessThan){
                    blockReport({
                        filterName: '首页推荐过滤器',
                        reason: '播放量与点赞数的比率小于'+ext.viewLikeRatioLessThan,
                        reasonType: 'viewLikeRatioLessThan',
                        value: viewLikeRatio,
                        item: JSON.stringify(item)
                    });
                    generalBlockMask(item);
                    return
                }
            }
            if(item.stat){
                const viewDanmakuRatio = item.stat.view / item.stat.danmaku;
                if(viewDanmakuRatio <= ext.viewDanmakuRatioLessThan){
                    blockReport({
                        filterName: '首页推荐过滤器',
                        reason: '播放量与弹幕数的比率小于'+ext.viewDanmakuRatioLessThan,
                        reasonType: 'viewDanmakuRatioLessThan',
                        value: viewDanmakuRatio,
                        item: JSON.stringify(item)
                    });
                    generalBlockMask(item);
                    return
                }
            }
            if(item.stat){
                const likeDanmakuRatio = item.stat.like / item.stat.danmaku;
                if(likeDanmakuRatio <= ext.likeDanmakuRatioLessThan){
                    blockReport({
                        filterName: '首页推荐过滤器',
                        reason: '点赞数与弹幕数的比率小于'+ext.likeDanmakuRatioLessThan,
                        reasonType: 'likeDanmakuRatioLessThan',
                        value: likeDanmakuRatio,
                        item: JSON.stringify(item)
                    }); 
                    generalBlockMask(item);
                    return
                }
            }
            // 添加到结果列表
            filteredItems.push(item);
        }
        for (const item of items) {
            try {
                itemFilter(item);
            } catch (e) {
                errorReport(e);
            }
        }
        data.data.item = filteredItems;
        return JSON.stringify(data);
    `
}
