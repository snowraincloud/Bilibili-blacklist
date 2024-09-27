import { Filter, FilterCtx, FilterString } from "@/common/types";

//屏蔽遮罩 标题 用户名为***，封面修改为空字符串 
export const homeMovieFilter: FilterString = {
    id: 'homeMovieFilter',
    name: '首页右侧栏电影、电视剧推荐过滤器',
    start: false,
    filterConfList: [],
    sort: 1,
    predicate: `return requestUrl.startsWith('https://api.bilibili.com/x/web-interface/dynamic/region?');`,

    filter: `
        const { generalFilterSettings, blacklist, blockReport, errorReport } = filterCtx;
        const data = JSON.parse(responseText);
        data.data.archives = data.data.archives.filter(item => {
            blockReport({
                filterName: '首页右侧栏电影、电视剧推荐过滤器',
                reason: '广告',
                reasonType: 'ad',
                item: JSON.stringify(item)
            });
            if(generalFilterSettings.showBlockMask){
                item.title = '***';
                item.pic = '';
                item.owner.name = '***';
                return true;
            }
            return false;
        });
        return JSON.stringify(data);
    `
}
