<template>
    <NSpace vertical>
        <NCard :bordered="false">
            
            <div style="display: flex; justify-content: space-between;gap: 20px;">
                <NButton type="primary" @click="saveBlacklist" style="margin-bottom: 16px;">保存</NButton>
                <NButton @click="exportBlacklist">导出黑名单</NButton>
                <NUpload accept=".json" @before-upload="importBlacklist" :max="1">
                    <NButton>导入黑名单</NButton>
                </NUpload>
            </div>
            
            <NDivider />
            <h2>用户ID</h2>
            <n-dynamic-tags v-model:value="blacklist.uidList" style="margin-bottom: 16px;" placeholder="添加用户ID" />
            <NDivider />

            <h2>用户名</h2>
            <n-dynamic-tags v-model:value="blacklist.unameList" style="margin-bottom: 16px;" placeholder="添加用户名" />
            <NDivider />

            <h2>用户名正则</h2>
            <n-dynamic-tags v-model:value="blacklist.unameRegexList" style="margin-bottom: 16px;"
                placeholder="添加用户名正则" />
            <NDivider />

            <h2>标题正则</h2>
            <n-dynamic-tags v-model:value="blacklist.titleRegexList" style="margin-bottom: 16px;"
                placeholder="添加标题正则" />
        </NCard>
    </NSpace>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { NCard, NSpace, NDivider, NDynamicTags, NButton, useMessage, NUpload } from 'naive-ui';
import { blacklistStorage } from '@/common/storage';
import { Blacklist } from '@/common/types';
import _ from 'lodash';
const message = useMessage();
const blacklist = ref<Blacklist>({
    uidList: [],
    unameList: [],
    unameRegexList: [],
    titleRegexList: [],
});

onMounted(async () => {
    const tmp = await blacklistStorage.getValue();
    console.log(tmp)
    blacklist.value = tmp;
});

const saveBlacklist = async () => {
    try {
        const tmp = {
            uidList: _.uniq(_.values(blacklist.value.uidList)),
            unameList: _.uniq(_.values(blacklist.value.unameList)),
            unameRegexList: _.uniq(_.values(blacklist.value.unameRegexList)),
            titleRegexList: _.uniq(_.values(blacklist.value.titleRegexList)),
        };
        await blacklistStorage.setValue(tmp);
        message.success('黑名单保存成功');
    } catch (error) {
        message.error('黑名单保存失败');
    }

};

onBeforeUnmount(() => {
    saveBlacklist();
});

const importBlacklist = (file: any) => {
  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      if (e.target && e.target.result) {
        const data = JSON.parse(e.target.result as string);
        blacklist.value = data;
        saveBlacklist();
      } else {
        throw new Error('无法读取文件内容');
      }
    } catch (err) {
      message.error("黑名单导入失败：" + err);
    }
  };
  reader.readAsText(file.file.file);
  return false; // 阻止自动上传
};

const exportBlacklist = async () => {
  const data = await blacklistStorage.getValue();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'blacklist-config.json';
  link.click();
  URL.revokeObjectURL(link.href);
};
</script>

<style scoped>
.n-collapse-item {
    margin-bottom: 16px;
}
</style>
