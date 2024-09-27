import { Filter, FilterCtx, FilterString } from "@/common/types";

//屏蔽遮罩 标题 用户名为***，封面修改为空字符串 
export const homeMoreRecFilter: FilterString = {
    id: 'homeMoreRecFilter',
    name: '首页右侧栏直播推荐过滤器',
    start: false,
    filterConfList: [],
    sort: 1,
    predicate: `return requestUrl.startsWith('https://api.live.bilibili.com/xlive/web-interface/v1/webMain/getMoreRecList?');`,

    filter: `
        const { generalFilterSettings, blacklist, blockReport, errorReport } = filterCtx;
        const data = JSON.parse(responseText);
        const recommend_room_list = [];
        for(const item of data.data.recommend_room_list){
            blockReport({
                filterName: '首页右侧栏直播推荐过滤器',
                reason: '广告',
                reasonType: 'ad',
                item: JSON.stringify(item)
            });
            if(generalFilterSettings.showBlockMask){
                item.title = '***';
                item.uname = '***';
                item.cover = '';
                // recommend_room_list.push(item);
            }
        }
        data.data.recommend_room_list = recommend_room_list;
        return JSON.stringify(data);
    `
}
