import { Filter, FilterCtx, FilterString } from "@/common/types";

//屏蔽遮罩 标题 用户名为***，封面修改为空字符串 
export const homeComicsFilter: FilterString = {
    id: 'homeComicsFilter',
    name: '首页右侧栏漫画推荐过滤器',
    start: false,
    filterConfList: [

    ],
    sort: 1,
    predicate: `return requestUrl.startsWith('https://manga.bilibili.com/twirp/comic.v1.MainStation/Feed');`,

    filter: `
        const { generalFilterSettings, blacklist, blockReport, errorReport } = filterCtx;
        const data = JSON.parse(responseText);
        data.data.list = data.data.list.filter(item => {
            blockReport({
                filterName: '首页右侧栏漫画推荐过滤器',
                reason: '广告',
                reasonType: 'ad',
                item: JSON.stringify(item)
            });
            if(generalFilterSettings.showBlockMask){
                item.title = '***';
                item.horizontal_cover = '';
                item.recommendation = '';
                return true;
            }
            return false;
        });
        return JSON.stringify(data);
    `
}
