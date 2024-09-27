// 应用设置
export interface AppSettings {
    // 是否启动
    start: boolean;
    // 是否调试
    debug: boolean;
    // 是否上报
    report: boolean;
    // 上报条数限制
    reportLimit: number;
}

// 全局过滤设置
export interface GeneralFilterSettings {
    // 是否显示屏蔽遮罩，默认显示, true则修改屏蔽信息 false则直接在数据中删除屏蔽项
    showBlockMask: boolean;
    // 是否显示关注的人的视频，默认显示，忽略其他屏蔽
    showFollowed: boolean;
}

// 黑名单
export interface Blacklist {
    // 用户id列表
    uidList: string[];
    // 用户名列表
    unameList: string[];
    // 用户名正则列表
    unameRegexList: string[];
    // 标题正则列表
    titleRegexList: string[];
}

// 屏蔽原因类型
export type ReasonType = 'uid' | 'uname' | 'title' | 'ad' | 'live' | string;

// 屏蔽原因
export interface BlockReport {
    // 屏蔽filter
    filterName: string;
    // 屏蔽原因
    reason: string;
    // 屏蔽原因类型
    reasonType: ReasonType;
    // 屏蔽数据
    item: any;
}

type BlockReportFunc = (blockReport: BlockReport) => void;
type ErrorReportFunc = (error: any) => void;

// 过滤器上下文
export interface FilterCtx {
    generalFilterSettings: GeneralFilterSettings;
    blacklist: Blacklist;
    blockReport: BlockReportFunc;
    errorReport: ErrorReportFunc;
    ext: any;
}

export interface Filter {
    name: string;
    sort: number;
    predicate: (requestUrl: string) => boolean;
    filter: (filterCtx: FilterCtx, responseText: string) => string | undefined;
}

export type FilterConfType = "string" | "number" | "boolean";

export interface FilterConf {
    id: string;
    name: string;
    description: string;
    type: FilterConfType;
    defaultValue: any;
    value?: any;
}

export interface FilterString {
    id: string;
    start: boolean;
    name: string;
    
    sort: number;
    filterConfList: Array<FilterConf>;
    conf?: Record<string, any>;
    predicate: string;
    filter: string;
}

export interface ReportItem {
    id: string;
    type: 'block' | 'error';
    data: any;
    time: number;
}