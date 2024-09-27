<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { NCard, NSpace, NButton, NInput, NIcon, NCollapse, NCollapseItem, useMessage, NInputNumber, NSelect, NPopconfirm, NTabs, NTabPane, NTooltip, NSwitch } from 'naive-ui';
import { filterListStorage } from '@/common/storage';
import type { FilterConf, FilterString } from '@/common/types';
import { ReorderThree } from '@vicons/ionicons5';
import { v4 as uuidv4 } from 'uuid';
import MonacoEditor from 'monaco-editor-vue3';
import _ from 'lodash';
import draggable from "vuedraggable";


const message = useMessage();
const filterList = ref<FilterString[]>([]);

onMounted(async () => {
  const tmp = _.values(await filterListStorage.getValue());
  for (const filter of tmp) {
    if (!filter.filterConfList) {
      filter.filterConfList = [];
    } else {
      filter.filterConfList = _.values(filter.filterConfList)
    }
  }
  console.log(JSON.stringify(tmp, null, 2)); // 添加这行来查看输出

  filterList.value = tmp;
});

const addFilter = () => {
  const newFilter: FilterString = {
    id: uuidv4(),
    name: '新过滤器',
    sort: 100,
    predicate: `
// 入参: requestUrl 当前请求的url
// 返回true表示作用于当前请求, 返回false表示不作用于当前请求
// 示例: 作用于 首页推荐
// return requestUrl.startsWith('https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?');
return false;
    `,
    filter: `
// 详情参考 https://github.com/snowraincloud/Bilibili-blacklist
// 入参: filterCtx 过滤器上下文包括
// generalFilterSettings 通用过滤器设置
// blacklist 黑名单
// blockReport 屏蔽报告函数
// errorReport 错误报告函数
// ext 扩展字段（包含当前过滤器的配置项）
// 入参: responseText 当前请求的响应内容(string)
// 返回处理后的响应内容(string)
// 示例: 将响应内容中的所有"b站"替换为"哔哩哔哩"
// return responseText.replace(/b站/g, '哔哩哔哩');
return responseText;
    `,
    filterConfList: [],
    start: false
  };
  filterList.value.push(newFilter);
};

const addFilterConf = (filterId: string) => {
  const filter = filterList.value.find(f => f.id === filterId);
  if (filter) {
    const newConf: FilterConf = {
      id: uuidv4(),
      name: 'id',
      description: '名称',
      type: 'string',
      defaultValue: '',
    };
    if (!filter.filterConfList) {
      filter.filterConfList = [];
    }
    filter.filterConfList.push(newConf);
  }
};

const deleteFilterConf = (filterId: string, confId: string) => {
  const filter = filterList.value.find(f => f.id === filterId);
  if (filter && filter.filterConfList) {
    const index = filter.filterConfList.findIndex(c => c.id === confId);
    if (index !== -1) {
      filter.filterConfList.splice(index, 1);
    }
  }
};


const deleteFilter = (id: string) => {
  const index = filterList.value.findIndex(f => f.id === id);
  if (index !== -1) {
    filterList.value.splice(index, 1);
  }
};
const updateFilterConf = (filterId: string, confId: string, field: keyof FilterConf, value: any) => {
  // const filter = filterList.value.find(f => f.id === filterId);
  // if (filter && filter.filterConfList) {
  //   const conf = filter.filterConfList.find(c => c.id === confId);
  //   if (conf) {
  //     conf[field] = value;
  //   }
  // }
};
const updateFilter = (id: string, field: keyof FilterString, value: any) => {
  const filter = filterList.value.find(f => f.id === id);
  if (filter) {
    filter[field] = value as never;
  }
};

onBeforeUnmount(() => {
  saveFilters();
})

const saveFilters = async () => {
  try {
    const saveFilters = _.values(filterList.value)
    for (const filter of saveFilters) {
      filter.filterConfList = _.values(filter.filterConfList)
    }
    await filterListStorage.setValue(saveFilters);
    message.success('过滤器保存成功');
  } catch (error) {
    message.error('过滤器保存失败');
  }
};
</script>

<template>
  <NSpace vertical>
    <NCard :bordered="false">
      <NButton type="primary" @click="addFilter" style="margin-bottom: 16px;">添加新过滤器</NButton>
      <NButton type="primary" @click="saveFilters" style="margin-bottom: 16px; margin-left: 16px;">保存</NButton>
      <NCollapse accordion :trigger-areas="['arrow']">
        <NCollapseItem v-for="filter in filterList" :key="filter.id" :title="filter.name">
          <template #header>
            <NSpace align="center">
              <n-tooltip placement="top" trigger="hover">
                <template #trigger>
                  <NInput v-model:value="filter.name" placeholder="过滤器名称" style="width: 300px;"
                    @update:value="updateFilter(filter.id, 'name', $event)" />
                </template>
                <span>过滤器的名称(用于纪录显示)</span>
              </n-tooltip>
              <n-tooltip placement="top" trigger="hover">
                <template #trigger>
                  <NInputNumber v-model:value="filter.sort" placeholder="权重" style="width: 200px;"
                    @update:value="updateFilter(filter.id, 'sort', $event)" />
                </template>
                <span>值越小，优先级越高(多个过滤器同时作用于一个请求时，优先级最高的生效)</span>
              </n-tooltip>
              <n-popconfirm @positive-click="deleteFilter(filter.id)">
                <template #trigger>
                  <NButton type="error" size="small">删除</NButton>
                </template>
                <span>请确认是否删除此过滤器</span>
              </n-popconfirm>
            </NSpace>
          </template>
          <div style="min-width: 1000px; width: 50%; max-width: 50%; padding: 10px 0;">
            <div>
              <n-tooltip placement="top" trigger="hover">
                <template #trigger>
                  <NButton type="primary" @click="addFilterConf(filter.id)" style="margin-bottom: 16px;">添加新配置项
                  </NButton>
                </template>
                <span>配置项是过滤器中可用的变量</span>
              </n-tooltip>
              <draggable tag="div" :list="filter.filterConfList" class="list-group" handle=".handle" item-key="id">
                <template #item="{ element: conf}">
                  <div class="list-group-item"
                    style="display: flex; align-items: center;gap: 10px;margin-bottom: 10px;">
            
                      <n-icon class="handle" :component="ReorderThree" size="30" />
          
                    <n-tooltip placement="top" trigger="hover">
                      <template #trigger>
                        <NInput v-model:value="conf.name" placeholder="配置项变量名" style="width: 300px;"
                          @update:value="updateFilterConf(filter.id, conf.id, 'name', $event)" />
                      </template>
                      <span>配置项变量名, 请勿重复</span>
                    </n-tooltip>
                    <n-tooltip placement="top" trigger="hover">
                      <template #trigger>
                        <NInput v-model:value="conf.description" placeholder="配置项描述" style="width: 300px;"
                          @update:value="updateFilterConf(filter.id, conf.id, 'description', $event)" />
                      </template>
                      <span>配置项描述</span>
                    </n-tooltip>
                    <n-tooltip placement="top" trigger="hover">
                      <template #trigger>
                        <NSelect v-model:value="conf.type" style="width: 150px;" :options="[
                          { label: '字符串', value: 'string' },
                          { label: '数字', value: 'number' },
                          { label: '布尔值', value: 'boolean' }
                        ]" placeholder="类型" @update:value="updateFilterConf(filter.id, conf.id, 'type', $event)" />
                      </template>
                      <span>配置项的数据类型</span>
                    </n-tooltip>
                    <n-tooltip placement="top" trigger="hover">
                      <template #trigger>
                        <div>
                          <n-input-number v-if="conf.type === 'number'" v-model:value="conf.defaultValue"
                            placeholder="默认值" style="width: 200px;"
                            @update:value="updateFilterConf(filter.id, conf.id, 'defaultValue', $event)" />
                          <NSwitch v-else-if="conf.type === 'boolean'" v-model:value="conf.defaultValue"
                            placeholder="默认值" style="width: 200px;"
                            @update:value="updateFilterConf(filter.id, conf.id, 'defaultValue', $event)">
                            <template #checked>
                              是
                            </template>
                            <template #unchecked>
                              否
                            </template>
                          </NSwitch>
                          <NInput v-else v-model:value="conf.defaultValue" placeholder="默认值" style="width: 200px;"
                            @update:value="updateFilterConf(filter.id, conf.id, 'defaultValue', $event)" />
                        </div>
                      </template>
                      <span>配置项的默认值</span>
                    </n-tooltip>
                    <n-popconfirm @positive-click="deleteFilterConf(filter.id, conf.id)">
                      <template #trigger>
                        <NButton type="error" size="small">删除</NButton>
                      </template>
                      <span>请确认是否删除此配置项</span>
                    </n-popconfirm>
                  </div>
                </template>
              </draggable>

            </div>
            <NTabs type="line" animated>
              <NTabPane name="predicate" tab="作用范围">
                <div style="width: 100%; padding: 10px 0; height: 500px;">
                  <MonacoEditor v-model:value="filter.predicate" language="javascript" theme="vs-dark"
                    :options="{ minimap: { enabled: false } }" @change="updateFilter(filter.id, 'predicate', $event)" />
                </div>
              </NTabPane>
              <NTabPane name="filter" tab="请求返回值过滤">
                <div style="width: 100%; padding: 10px; height: 500px;">
                  <MonacoEditor v-model:value="filter.filter" language="javascript" theme="vs-dark"
                    :options="{ minimap: { enabled: false } }" @change="updateFilter(filter.id, 'filter', $event)" />
                </div>
              </NTabPane>
            </NTabs>
          </div>

        </NCollapseItem>
      </NCollapse>
    </NCard>
  </NSpace>
</template>

<style scoped>
.n-collapse-item {
  margin-bottom: 16px;
}
</style>
