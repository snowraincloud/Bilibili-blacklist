import { Filter, FilterCtx, FilterString } from "@/common/types";

//屏蔽遮罩 标题 用户名为***，封面修改为空字符串 
export const homeTimelineFilter: FilterString = {
    id: 'homeTimelineFilter',
    name: '首页右侧栏(番剧、国创)推荐过滤器',
    start: false,
    filterConfList: [],
    sort: 1,
    predicate: `return requestUrl.startsWith('https://api.bilibili.com/pgc/web/timeline/v2?');`,

    filter: `
        const { generalFilterSettings, blacklist, blockReport, errorReport } = filterCtx;
        const data = JSON.parse(responseText);
        const result = [];
        for(const item of data.result.latest){
            blockReport({
                filterName: '首页右侧栏(番剧、国创)推荐过滤器',
                reason: '广告',
                reasonType: 'ad',
                item: JSON.stringify(item)
            });
            if(generalFilterSettings.showBlockMask){
                item.title = '***';
                item.ep_cover = '';
                result.push(item);
            }
        }
        data.result.latest = result;
        data.result.timeline = data.result.timeline.filter(item => {
            item.episodes = item.episodes.filter(episode => {
                blockReport({
                    filterName: '首页右侧栏(番剧、国创)推荐过滤器',
                    reason: '广告',
                    reasonType: 'ad',
                    item: JSON.stringify(episode)
                });
                if(generalFilterSettings.showBlockMask){
                    episode.title = '***';
                    episode.ep_cover = '';
                    return true;
                }
                return false;
            });
            if(item.episodes.length === 0){
                return false;
            }
            return true;
        });
        return JSON.stringify(data);
    `
}
