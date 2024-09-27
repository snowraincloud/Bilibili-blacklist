

const blacklist_space = {
    settings: {
        debug: false,
        report: false,
        start: false,
        generalFilterSettings: {
            showBlockMask: true,
            showFollowed: true,
        },
        blacklist: [],
        filterWrapperList: [],
    },
    debug: (...args) => {
        if (blacklist_space.settings.debug) {
            console.log(...args)
        }
    },
    error: (...args) => {
        console.error(...args)
    },
    report: (data) => {
        if (blacklist_space.settings.report) {
            // 发送消息到background
            window.postMessage({
                type: 'bilibili-blacklist:report-to-content',
                data
            }, '*');
        }
    },
    newFilterPredicate: (filterWrapper) => {
        try {
            const predicate = new Function('requestUrl', filterWrapper.predicate);
            return (requestUrl) => {
                try {
                    return predicate(requestUrl);
                } catch (error) {
                    blacklist_space.error("过滤器predicate执行失败", error)
                    return false;
                }
            };
        } catch (error) {
            blacklist_space.error("初始化过滤器predicate失败", error)
            return (_) => {
                return false;
            }
        }

    },
    newFilter: (filterWrapper) => {
        try {
            const filter = new Function('filterCtx', 'responseText', filterWrapper.filter);
            return (filterCtx, originalResponse) => {
                try {
                    return filter(filterCtx, originalResponse);
                } catch (error) {
                    blacklist_space.error("过滤器filter执行失败", error)
                    return originalResponse;
                }
            };
        } catch (error) {
            blacklist_space.error("初始化过滤器filter失败", error)
            return (_, originalResponse) => {
                return originalResponse;
            };
        }
    },
    newFilterWrapper: (filter) => {
        return {
            ...filter,
            predicate: blacklist_space.newFilterPredicate(filter),
            filter: blacklist_space.newFilter(filter),
        }
    },
    originalFetch: window.fetch.bind(window),
    myFetch: function (...args) {
        const getOriginalResponse = async (stream) => {
            let text = '';
            const decoder = new TextDecoder('utf-8');
            const reader = stream.getReader();
            const processData = (result) => {
                if (result.done) {
                    return text;
                }
                const value = result.value; // Uint8Array
                text += decoder.decode(value, { stream: true });
                // 读取下一个文件片段，重复处理步骤
                return reader.read().then(processData);
            };
            return await reader.read().then(processData);
        }
        // 获取请求url
        const [requestUrl] = args;
        blacklist_space.debug("fetch", requestUrl)

        // 获取过滤器
        let filterWrapper = undefined;
        if (blacklist_space.settings.filterWrapperList && blacklist_space.settings.filterWrapperList.length > 0) {
            for (const filterWrapperItem of blacklist_space.settings.filterWrapperList) {
                if (filterWrapperItem.predicate(requestUrl)) {
                    filterWrapper = filterWrapperItem;
                    break;
                }
            }
        }
        blacklist_space.debug("filter: ", filterWrapper)
        return blacklist_space.originalFetch(...args).then(async (response) => {
            if (filterWrapper === undefined) {
                // 不修改
                return response;
            }
            // 获取原始response
            const originalResponse = await getOriginalResponse(response.body);
            blacklist_space.debug("originalResponse: ", originalResponse)
            const reportList = []
            // 修改response
            const filterCtx = {
                generalFilterSettings: blacklist_space.settings.generalFilterSettings,
                blacklist: blacklist_space.settings.blacklist,
                blockReport: (obj) => {
                    blacklist_space.debug("blockReport: ", obj)
                    reportList.push({
                        type: 'block',
                        data: {
                            data: obj,
                        }
                    })
                },
                errorReport: (obj) => {
                    blacklist_space.error("errorReport: ", obj)
                    reportList.push({
                        type: 'error',
                        data: {
                            data: obj,
                            url: requestUrl,
                            response: originalResponse,
                        }
                    })
                },
                ext: {
                    ...blacklist_space.settings.ext,
                    ...filterWrapper.conf
                },
            }
            const overrideText = filterWrapper.filter(filterCtx, originalResponse);
            blacklist_space.report(reportList)
            blacklist_space.debug("overrideText: ", overrideText)
            // 创建新的response
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode(overrideText));
                    controller.close();
                }
            });
            const newResponse = new Response(stream, {
                headers: response.headers,
                status: response.status,
                statusText: response.statusText,
            });
            const responseProxy = new Proxy(newResponse, {
                get: function (target, name) {
                    switch (name) {
                        case 'body':
                        case 'bodyUsed':
                        case 'ok':
                        case 'redirected':
                        case 'type':
                        case 'url':
                            return response[name];
                    }
                    return target[name];
                }
            });
            for (let key in responseProxy) {
                if (typeof responseProxy[key] === 'function') {
                    responseProxy[key] = responseProxy[key].bind(newResponse);
                }
            }
            return responseProxy;

        })
    }
}

window.addEventListener("message", function (event) {

    const data = event.data;
    if (data.type === 'bilibili-blacklist' && data.to === 'intercept') {
        console.info("收到消息", data)
        blacklist_space.settings[data.key] = data.value;
        if (data.key === 'filterWrapperList') {
            blacklist_space.settings.filterWrapperList = data.value.map(filterWrapper => {
                const filter = blacklist_space.newFilterWrapper(filterWrapper);
                blacklist_space.debug("初始化filter", filter)
                return filter;
            })
        }
        blacklist_space.debug("blacklist_space.settings", blacklist_space.settings)
    }
    if (blacklist_space.settings.start) {
        window.fetch = blacklist_space.myFetch;
    } else {
        window.fetch = blacklist_space.originalFetch;
    }
}, false);
