// entrypoints/example-ui.content.ts
import { appSettingsStorage, blacklistStorage, filterListStorage, generalFilterSettingsStorage, reportStorage } from "@/common/storage";
import { v4 as uuidv4 } from 'uuid';
import { AppSettings, Blacklist } from "@/common/types";

function injectedScript(path: string) {
  if (window.self === window.top) {
    const scriptNode = document.createElement('script');
    scriptNode.src = chrome.runtime.getURL(path);
    document.documentElement.appendChild(scriptNode);
    return scriptNode;
  }
}

export default defineContentScript({
  matches: ['https://www.bilibili.com/', 'https://www.bilibili.com/video/*'],
  runAt: 'document_start',

  main() {
    let appSettings: AppSettings = {
      start: false,
      debug: true,
      report: false,
      reportLimit: 1000,
    };

    function updateAppSettings(settings: AppSettings) {
      appSettings = settings;
      ['debug', 'report', 'start'].forEach(key =>
        postMessage({ type: 'bilibili-blacklist', to: 'intercept', key, value: appSettings[key as keyof AppSettings] })
      );
    }

    appSettingsStorage.getValue().then(updateAppSettings);
    appSettingsStorage.watch(updateAppSettings);

    filterListStorage.watch(filterList => {
      const filterWrapperList = filterList.filter(filter => filter.start).map(filter => {
        filter.conf = {} as Record<string, any>;
        if (filter.filterConfList) {
          Object.values(filter.filterConfList).forEach(conf => {
            if (filter.conf && conf.name) {
              filter.conf[conf.name] = conf.value != undefined ? conf.value : conf.defaultValue;
            }
          })
        }
        return filter;
      })
      postMessage({ type: 'bilibili-blacklist', to: 'intercept', key: 'filterWrapperList', value: filterWrapperList })
    })

    window.addEventListener('message', async function (event) {
      if (event.data.type === 'bilibili-blacklist:report-to-content') {
        console.info("报告已收到:", event.data);
        const reports = await reportStorage.getValue();
        for (const report of event.data.data) {
          reports.push({
            ...report,
            id: uuidv4(),
            time: Date.now(),
          });
        }
        if (reports.length > appSettings.reportLimit) {
          reports.splice(0, reports.length - appSettings.reportLimit);
        }
        await reportStorage.setValue(reports);
        console.info("报告已保存");
      }
    });

    const blackListTransform = (blackList: Blacklist) => {
      return {
        uidList: blackList.uidList.map((uid: string) => parseInt(uid)),
        unameList: blackList.unameList,
        unameRegexList: blackList.unameRegexList.map((regex: string) => new RegExp(regex)),
        titleRegexList: blackList.titleRegexList.map((regex: string) => new RegExp(regex)),
      }
    }

    blacklistStorage.watch(blackList => {
      postMessage({ type: 'bilibili-blacklist', to: 'intercept', key: 'blacklist', value: blackListTransform(blackList) })
    })

    const scriptNode = injectedScript('/intercept/index.js');
    scriptNode?.addEventListener('load', async () => {
      const generalFilterSettings = await generalFilterSettingsStorage.getValue();

      const blacklist = blackListTransform(await blacklistStorage.getValue());

      ['debug', 'report', 'generalFilterSettings', 'blacklist'].forEach(key =>
        postMessage({ type: 'bilibili-blacklist', to: 'intercept', key, value: key === 'generalFilterSettings' ? generalFilterSettings : key === 'blacklist' ? blacklist : appSettings[key as keyof AppSettings] })
      );

      const filterList = await filterListStorage.getValue()
      const filterWrapperList = filterList.filter(filter => filter.start).map(filter => {
        filter.conf = {} as Record<string, any>;
        if (filter.filterConfList) {
          Object.values(filter.filterConfList).forEach(conf => {
            if (filter.conf && conf.name) {
              filter.conf[conf.name] = conf.value != undefined ? conf.value : conf.defaultValue;
            }
          })
        }
        return filter;
      })

      postMessage({
        type: 'bilibili-blacklist', to: 'intercept', key: 'filterWrapperList', value:
          filterWrapperList
      });
      postMessage({ type: 'bilibili-blacklist', to: 'intercept', key: 'start', value: appSettings.start })
    })
  },
});