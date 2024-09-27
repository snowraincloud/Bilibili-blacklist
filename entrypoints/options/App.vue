<script lang="ts" setup>
import { NTabs, NTabPane, NMessageProvider, NDialogProvider, zhCN, dateZhCN } from 'naive-ui';
import type { NDateLocale, NLocale } from 'naive-ui'
import { ref } from 'vue';
import List from './views/List.vue';
import Setting from './views/Settings.vue';
const locale = ref<NLocale>(zhCN);
const dateLocale = ref<NDateLocale>(dateZhCN);
</script>

<template>
  <n-config-provider :locale="locale" :date-locale="dateLocale">
    <n-message-provider>
      <n-dialog-provider>
        <div class="wrapper">
          <n-tabs type="line" animated placement="left">
            <n-tab-pane name="list" tab="屏蔽纪录">
              <List />
            </n-tab-pane>
            <n-tab-pane name="setting" tab="高级设置">
              <Setting />
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>


</template>

<style scoped>
.wrapper {
  /* margin-top: 15px; */
  padding: 10px;
}
</style>
