<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { NCard, NSpace, NSwitch, NInputNumber, NDivider, NTooltip, NButton, NUpload, useMessage, NPopconfirm, NIcon } from 'naive-ui';
import { appSettingsStorage, blacklistStorage, filterListStorage, generalFilterSettingsStorage } from '@/common/storage';
import type { AppSettings, GeneralFilterSettings } from '@/common/types';
import { LogoGithub, Bug, TimeOutline, HeartOutline } from '@vicons/ionicons5';
import _ from 'lodash';

const message = useMessage();

const appSettings = ref<AppSettings>({
    start: true,
    debug: false,
    report: true,
    reportLimit: 1000,
});

const generalFilterSettings = ref<GeneralFilterSettings>({
    showBlockMask: true,
    showFollowed: true,
});

onMounted(async () => {
    appSettings.value = await appSettingsStorage.getValue();
    generalFilterSettings.value = await generalFilterSettingsStorage.getValue();
});

const updateAppSettings = async () => {
    await appSettingsStorage.setValue(appSettings.value);
};

const updateGeneralFilterSettings = async () => {
    await generalFilterSettingsStorage.setValue(generalFilterSettings.value);
};

const importConfig = (file: any) => {
    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            if (e.target && e.target.result) {
                const data = JSON.parse(e.target.result as string);
                await appSettingsStorage.setValue(data.appSettings);
                await generalFilterSettingsStorage.setValue(data.generalFilterSettings);
                await blacklistStorage.setValue(data.blacklist);
                await filterListStorage.setValue(data.filterList);
                appSettings.value = data.appSettings;
                generalFilterSettings.value = data.generalFilterSettings;
                message.success("配置导入成功");
            } else {
                throw new Error('无法读取文件内容');
            }

        } catch (err) {
            message.error("配置导入失败：" + err);
        }
    };
    reader.readAsText(file.file.file);
    return false; // 阻止自动上传
};

const exportConfig = async () => {
    const data = {
        appSettings: await appSettingsStorage.getValue(),
        generalFilterSettings: await generalFilterSettingsStorage.getValue(),
        blacklist: await blacklistStorage.getValue(),
        filterList: await filterListStorage.getValue(),
    };
    for (const filter of data.filterList) {
        filter.filterConfList = _.values(filter.filterConfList);
    }
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bilibili-blacklist-config.json';
    link.click();
    URL.revokeObjectURL(link.href);
};


const resetToDefault = async () => {
    const defaultAppSettings = appSettingsStorage.defaultValue;
    const defaultGeneralFilterSettings = generalFilterSettingsStorage.defaultValue;

    await appSettingsStorage.setValue(defaultAppSettings);
    await generalFilterSettingsStorage.setValue(defaultGeneralFilterSettings);

    appSettings.value = defaultAppSettings;
    generalFilterSettings.value = defaultGeneralFilterSettings;

    await blacklistStorage.setValue(blacklistStorage.defaultValue);
    await filterListStorage.setValue(filterListStorage.defaultValue);

    message.success("已恢复默认设置");
};


const openGithub = () => {
    window.open('https://github.com/snowraincloud/Bilibili-blacklist', '_blank');
};

const openIssue = () => {
    window.open('https://github.com/snowraincloud/Bilibili-blacklist/issues', '_blank');
};

const openChangelog = () => {
    window.open('https://github.com/snowraincloud/Bilibili-blacklist/release', '_blank');
};

const openDonation = () => {
    window.open('https://github.com/snowraincloud/Bilibili-blacklist/blob/master/doc/donate.md', '_blank');
};

</script>

<template>
    <div>
        <NSpace vertical>
            <NCard title="应用设置" :bordered="false">
                <NSpace vertical>
                    <n-tooltip placement="top-start" trigger="hover">
                        <template #trigger>
                            <div>
                                <span>启用扩展：</span>
                                <NSwitch v-model:value="appSettings.start" @update:value="updateAppSettings" />
                            </div>
                        </template>
                        <span>启用或者禁用扩展后请刷新Bilibili页面</span>
                    </n-tooltip>
                    <n-tooltip placement="top-start" trigger="hover">
                        <template #trigger>
                            <div>
                                <span>调试模式：</span>
                                <NSwitch v-model:value="appSettings.debug" @update:value="updateAppSettings" />
                            </div>
                        </template>
                        <span>输出调试信息</span>
                    </n-tooltip>
                    <n-tooltip placement="top-start" trigger="hover">
                        <template #trigger>
                            <div>
                                <span>保存纪录：</span>
                                <NSwitch v-model:value="appSettings.report" @update:value="updateAppSettings" />
                            </div>
                        </template>
                        <span>保存屏蔽纪录</span>
                    </n-tooltip>
                    <NSpace align="center">
                        <span>纪录保存条数：</span>
                        <NInputNumber v-model:value="appSettings.reportLimit" :min="1" :max="10000"
                            @update:value="updateAppSettings" />
                    </NSpace>
                </NSpace>
            </NCard>

            <NDivider />

            <NCard title="通用过滤器设置" :bordered="false">
                <NSpace vertical>
                    <NSpace align="center">
                        <span>显示屏蔽遮罩：</span>
                        <NSwitch v-model:value="generalFilterSettings.showBlockMask"
                            @update:value="updateGeneralFilterSettings" />
                    </NSpace>
                    <NSpace align="center">
                        <span>显示已关注：</span>
                        <NSwitch v-model:value="generalFilterSettings.showFollowed"
                            @update:value="updateGeneralFilterSettings" />
                    </NSpace>
                </NSpace>
            </NCard>

            <NDivider />

            <NCard title="配置导入导出" :bordered="false">
                <NSpace>
                    <NButton @click="exportConfig">导出配置</NButton>
                    <NUpload accept=".json" @before-upload="importConfig" :max="1">
                        <NButton>导入配置</NButton>
                    </NUpload>
                    <NPopconfirm @positive-click="resetToDefault">
                        <template #trigger>
                            <NButton type="error">恢复默认值</NButton>
                        </template>
                        <span>确定要恢复默认设置吗？此操作不可撤销。</span>
                    </NPopconfirm>
                </NSpace>
            </NCard>

            <NDivider />

            <NCard title="关于" :bordered="false">
                <NSpace vertical>
                    <NSpace>
                        <NButton @click="openGithub">
                            <template #icon>
                                <NIcon :component="LogoGithub" />
                            </template>
                            GitHub
                        </NButton>
                        <NButton @click="openIssue">
                            <template #icon>
                                <NIcon :component="Bug" />
                            </template>
                            反馈问题
                        </NButton>
                    <NButton @click="openChangelog">
                        <template #icon>
                            <NIcon :component="TimeOutline" />
                        </template>
                        更新日志
                    </NButton>
                    <NButton @click="openDonation">
                        <template #icon>
                            <NIcon :component="HeartOutline" />
                        </template>
                        捐赠支持
                    </NButton>
                    </NSpace>
                </NSpace>
            </NCard>
        </NSpace>
    </div>
</template>