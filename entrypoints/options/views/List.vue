<script lang="ts" setup>
import { NDataTable, NSwitch, NButton, NIcon, NPopconfirm } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { Trash, Refresh, Archive } from '@vicons/ionicons5'
import { ref } from 'vue'
import { ReportItem } from '~/common/types';
import moment from 'moment';
import { onMounted } from 'vue';
import type { CSSProperties } from 'vue'
import { reportStorage } from '@/common/storage';


const railStyle = ({
    focused,
    checked
}: {
    focused: boolean
    checked: boolean
}) => {
    const style: CSSProperties = {}
    if (checked) {
        style.background = '#d03050'
        if (focused) {
            style.boxShadow = '0 0 0 2px #d0305040'
        }
    }
    else {
        style.background = '#2080f0'
        if (focused) {
            style.boxShadow = '0 0 0 2px #2080f040'
        }
    }
    return style
}

const checked = ref(false)

const allData = ref<Array<ReportItem>>([])
const data = ref<Array<ReportItem>>([])
const loadData = async () => {
    const reports = await reportStorage.getValue()
    console.info('reports', reports)
    allData.value = reports.reverse()
    data.value = allData.value.filter(item => checked.value ? item.type === 'error' : item.type === 'block')
}

const blockColumns: DataTableColumns<any> = [
    {
        type: 'expand',
        renderExpand: (rowData) => {
            return `${rowData.data.data.item}`
        }
    },
    {
        title: "纪录时间",
        key: "time",
        sorter: "default",
        width: 200,
        align: "center",
        render: (row: any, _) => {
            return moment(row.time).format('YYYY-MM-DD HH:mm:ss')
        }
    },
    {
        title: '过滤器',
        key: 'filterName',
        align: "center",
        render: (row: any, _) => {
            return row.data.data.filterName
        },
        sorter: (row1, row2) => row1.data.data.filterName.localeCompare(row2.data.data.filterName)

    },
    {
        title: "屏蔽原因",
        key: "reason",
        align: "center",
        render: (row: any, _) => {
            return row.data.data.reason
        },
        sorter: (row1, row2) => row1.data.data.reason.localeCompare(row2.data.data.reason)
    },
    {
        title: "屏蔽值",
        key: "value",
        align: "center",
        render: (row: any, _) => {
            return row.data.data.value
        },
    },
    {
        title: "过滤类型",
        key: "reasonType",
        align: "center",
        render: (row: any, _) => {
            return row.data.data.reasonType
        },
        sorter: (row1, row2) => row1.data.data.reasonType.localeCompare(row2.data.data.reasonType)
    },
]

const columns = ref<DataTableColumns<any>>(blockColumns)

watch(checked, () => {
    data.value = allData.value.filter(item => checked.value ? item.type === 'error' : item.type === 'block')
    if (checked.value) {
        columns.value = [
            {
                title: '纪录类型',
                key: 'type',
                width: 200,
                render: (row: any, _) => {
                    if (row.type === 'block') {
                        return '屏蔽'
                    } else if (row.type === 'error') {
                        return '错误'
                    }
                    return '未知'
                }
            },
            {
                title: "纪录时间",
                key: "time",
                sorter: "default",
                width: 120,
                align: "center",
                render: (row: any, _) => {
                    return moment(row.time).format('YYYY-MM-DD HH:mm:ss')
                }
            },
            {
                title: '错误信息',
                key: 'data',
                sorter: 'default',
                width: 200,
            }
        ]
    } else {
        columns.value = blockColumns
    }
})


onMounted(() => {
    loadData()
})


const refresh = async () => {
    await loadData()
}

const del = async () => {
    reportStorage.setValue([])
    data.value = []
    allData.value = []
}

const exportData = async () => {
    const reports = await reportStorage.getValue()
    console.info('reports', reports)

    const jsonString = JSON.stringify(reports, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bilibili-blacklist-reports.json';
    link.click();
    URL.revokeObjectURL(link.href);
}

</script>
<template>
    <div class="wrapper">
        <div class="head">
            <span></span>
            <div style="display: flex; gap: 20px; align-items: center;">
                <n-switch :rail-style="railStyle" v-model:value="checked">
                    <template #unchecked>
                        屏蔽纪录
                    </template>
                    <template #checked>
                        错误纪录
                    </template>
                </n-switch>
                <n-button circle @click="refresh">
                    <template #icon>
                        <n-icon :component="Refresh" />
                    </template>
                </n-button>
            </div>
            <div style="display: flex; gap: 20px; align-items: center;">
                <n-button circle @click="exportData">
                    <template #icon>
                        <n-icon :component="Archive" />
                    </template>
                </n-button>
                <n-popconfirm @positive-click="del">
                    <template #trigger>
                        <n-button circle>
                            <template #icon>
                                <n-icon :component="Trash" />
                            </template>
                        </n-button>
                    </template>
                    请确认是否删除所有纪录
                </n-popconfirm>
            </div>
        </div>
        <div class="content">
            <n-data-table :columns="columns" :data="data" striped :row-key="row => row.id" />
        </div>
    </div>
</template>
<style scoped>
.head {
    display: flex;
    margin-bottom: 20px;
    gap: 10px;
    justify-content: space-between;
    gap: 200px;
    align-items: center;
}

.content {
    padding: 10px;
}
</style>
