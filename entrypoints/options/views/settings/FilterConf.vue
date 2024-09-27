<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { NCard, NSpace, NButton, NInput, NCollapse, NCollapseItem, useMessage, NInputNumber, NSelect, NPopconfirm, NTabs, NTabPane, NTooltip, NSwitch } from 'naive-ui';
import { filterListStorage } from '@/common/storage';
import type { FilterConf, FilterString } from '@/common/types';
import _ from 'lodash';

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
        // 设置配置项的默认值，有值则跳过
        for (const conf of filter.filterConfList) {
            if (conf.value !== undefined) {
                continue;
            }
            conf.value = conf.defaultValue
        }
    }
    filterList.value = tmp;
});

const updateFilterConf = (filterId: string, confId: string, field: keyof FilterConf, value: any) => {
    const filter = filterList.value.find(f => f.id === filterId);
    if (filter && filter.filterConfList) {
        const conf = filter.filterConfList.find(c => c.id === confId);
        if (conf) {
            conf[field] = value;
        }
    }
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
        message.success('过滤器配置保存成功');
    } catch (error) {
        message.error('过滤器配置保存失败');
    }
};
</script>

<template>
    <NSpace vertical>
        <NCard :bordered="false">
            <NButton type="primary" @click="saveFilters" style="margin-bottom: 16px;">保存</NButton>
            <NCollapse accordion :trigger-areas="['arrow']" arrow-placement="right">
                <NCollapseItem v-for="filter in filterList" :key="filter.id" :title="filter.name"
                    style="max-width: 800px;">
                    <template #header>
                        <NSpace align="center">
                            <n-tooltip placement="top" trigger="hover">
                                <template #trigger>
                                    <NSwitch v-model:value="filter.start"
                                        @update:value="updateFilter(filter.id, 'start', $event)" />
                                </template>
                                <span>是否启用{{ filter.name }}过滤器</span>
                            </n-tooltip>
                            <span>{{ filter.name }}</span>
                        </NSpace>
                    </template>
                    <div>

                    </div>
                    <div style="min-width: 1000px; width: 50%; max-width: 50%; padding: 10px 0;">
                        <div>
                            <div v-for="conf in filter.filterConfList" :key="conf.id"
                                style="display: flex; align-items: center;gap: 10px;margin-bottom: 10px;">
                                <span>{{ conf.description }}: </span>
                                <n-tooltip placement="top" trigger="hover">
                                    <template #trigger>
                                        <div>
                                            <n-input-number v-if="conf.type === 'number'" v-model:value="conf.value"
                                                style="width: 200px;"
                                                @update:value="updateFilterConf(filter.id, conf.id, 'value', $event)" />
                                            <NSwitch v-else-if="conf.type === 'boolean'" v-model:value="conf.value"
                                                style="width: 200px;"
                                                @update:value="updateFilterConf(filter.id, conf.id, 'value', $event)">
                                                <template #checked>
                                                    是
                                                </template>
                                                <template #unchecked>
                                                    否
                                                </template>
                                            </NSwitch>
                                            <NInput v-else v-model:value="conf.value" style="width: 200px;"
                                                @update:value="updateFilterConf(filter.id, conf.id, 'value', $event)" />
                                        </div>
                                    </template>
                                    <span>配置项的值</span>
                                </n-tooltip>
                            </div>
                        </div>
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
