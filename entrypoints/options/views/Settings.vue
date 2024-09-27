<script lang="ts" setup>
import { NTabs, NTabPane } from 'naive-ui';
import AppSettings from './settings/AppSettings.vue'
import FilterList from './settings/FilterList.vue'
import FilterConf from './settings/FilterConf.vue'
import Blacklist from './settings/Blacklist.vue'
</script>
<template>
    <div class="wrapper">
        <n-tabs type="line" animated>
            <n-tab-pane name="setting" tab="插件设置">
                <div class="content-wrapper">
                    <AppSettings />
                </div>
            </n-tab-pane>
            <n-tab-pane name="blacklist" tab="黑名单">
                <Blacklist />
            </n-tab-pane>
            <n-tab-pane name="filterConf" tab="过滤器配置">
                <FilterConf />
            </n-tab-pane>
            <n-tab-pane name="filter" tab="过滤器列表">
                <FilterList />
            </n-tab-pane>
        </n-tabs>
    </div>
</template>
<style scoped>
.content-wrapper {
    padding: 20px;
}

.content {
    display: flex;
}

.item-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 10px;
    margin-bottom: 20px;
    box-shadow: 0 0 2px #ccc;
}

.item {
    display: flex;
    align-items: center;
    width: 150px;
    gap: 10px;

}
</style>
