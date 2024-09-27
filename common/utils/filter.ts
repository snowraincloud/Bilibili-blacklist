import { Filter, FilterCtx, FilterString } from "../types";

export const newFilterPredicate = (filterWrapper: FilterString): (requestUrl: string) => boolean => {
    try {
        const predicate = new Function('requestUrl', filterWrapper.predicate);
        return (requestUrl: string) => {
            try {
                return predicate(requestUrl);
            } catch (error) {
                console.error("过滤器predicate执行失败", error);
                return false;
            }
        };
    } catch (error) {
        console.error("初始化过滤器predicate失败", error);
        return (_: string) => {
            return false;
        };
    }
};

export const newFilter = (filterWrapper: FilterString): ((FilterCtx: FilterCtx, responseText: string) => string) => {
    try {
        const filter = new Function('FilterCtx', 'responseText', filterWrapper.filter);
        return (FilterCtx: FilterCtx, originalResponse: string) => {
            try {
                return filter(FilterCtx, originalResponse);
            } catch (error) {
                console.error("过滤器filter执行失败", error);
                return originalResponse;
            }
        };
    } catch (error) {
        console.error("初始化过滤器filter失败", error);
        return (_: FilterCtx, originalResponse: string) => {
            return originalResponse;
        };
    }
};

export const newFilterWrapper = (filter: FilterString): Filter => {
    return {
        ...filter,
        predicate: newFilterPredicate(filter),
        filter: newFilter(filter),
    };
};