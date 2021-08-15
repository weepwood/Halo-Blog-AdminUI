<template>
  <div id="halo-category">
    <n-space vertical :size="12">
      <n-data-table
        ref="table"
        :columns="columns"
        :data="state.value"
        :row-key="(row) => row.id"
        :pagination="pagination"
        :max-height="1000"
        :scroll-x="1300"
        virtual-scroll
      />
    </n-space>

    <n-button color="#63E2B7" @click="addSort">添加分类</n-button>

    <n-modal v-model:show="state.showEdit">
      <n-card
        style="width: 600px"
        title="编辑"
        closable
        :bordered="false"
        :mask-closable="false"
        size="huge"
        @close="closeEdit"
      >
        <n-form :model="state.rowData" ref="baseBlogInfo" label-placement="left">
          <n-form-item path="state.value.sortName" label="分类">
            <n-input v-model:value="state.rowData.sortName" @keydown.enter.prevent />
          </n-form-item>
          <n-form-item path="state.value.sortName" label="描述">
            <n-input v-model:value="state.rowData.content" @keydown.enter.prevent />
          </n-form-item>
          <n-form-item path="state.value.sortName" label="排序">
            <n-input v-model:value="state.rowData.sort" placeholder="" @keydown.enter.prevent />
          </n-form-item>
          <div class="article-button">
            <n-button color="#63E2B7" @click="submitSortInfo">提交</n-button>
          </div>
        </n-form>
      </n-card>
    </n-modal>
  </div>
</template>

<script>
  import { h, onMounted, reactive, toRaw } from 'vue';
  import {
    deleteSortApi,
    editSortInfo,
    getSortByUserId,
    getSortInfoById,
  } from '../../../api/blog/article';
  import { useUserStoreWidthOut } from '../../../store/modules/user';
  import { NButton, NTag, useMessage, useDialog } from 'naive-ui';

  const titleColumn = {
    title: '分类名',
    key: 'sortName',
    width: 150,
    fixed: 'left',
    ellipsis: {
      tooltip: true,
    },
  };

  const contentColumn = {
    title: '描述',
    key: 'content',
    width: 200,
    ellipsis: true,
  };

  const statusColumn = {
    title: '状态',
    key: 'status',
    render(row) {
      let type = row.status ? 'info' : '';
      return h(
        NTag,
        {
          style: {
            marginRight: '6px',
          },
          type: type,
        },
        { default: () => (row.status ? '正常' : '禁用') }
      );
    },
  };

  const createdColumn = {
    title: '创建时间',
    key: 'createTime',
  };

  const updateColumn = {
    title: '更新时间',
    key: 'updateTime',
  };

  const clickColumn = {
    title: '点击数',
    key: 'clickCount',
    sorter: (row1, row2) => row1.clickCount - row2.clickCount,
  };

  const sortColumn = {
    title: '排序',
    key: 'sort',
    sorter: (row1, row2) => row1.sort - row2.sort,
  };

  const actionColumn = ({ editSort, deleteSort }) => {
    return {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 150,
      align: 'center',
      render(row) {
        return (
          h('span', { class: 'halo-action' }),
          [
            h(
              NButton,
              {
                type: 'info',
                size: 'small',
                class: 'halo-button',
                onClick: () => {
                  editSort(row);
                },
              },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              {
                type: 'error',
                size: 'small',
                onClick: () => {
                  deleteSort(row);
                },
              },
              { default: () => '删除' }
            ),
          ]
        );
      },
    };
  };

  const createColumns = ({ editSort, deleteSort }) => {
    return [
      titleColumn,
      sortColumn,
      contentColumn,
      clickColumn,
      statusColumn,
      createdColumn,
      updateColumn,
      actionColumn({ editSort, deleteSort }),
    ];
  };

  export default {
    name: 'Category',
    setup() {
      let state = reactive({
        value: [],
        showEdit: false,
        rowData: {},
        showConfirmModal: false,
      });
      const message = useMessage();
      const dialog = useDialog();
      const userStore = useUserStoreWidthOut();

      const { userId } = userStore.getInfo();

      onMounted(() => {
        getSorInfo();
      });

      async function getSorInfo() {
        let res = await getSortByUserId(userId);
        state.value = res.data;
      }

      function closeEdit() {
        state.showEdit = false;
      }

      function addSort() {
        // 重置 rowData
        state.rowData = {};
        state.showEdit = true;
      }

      async function editSort(rowData) {
        state.showEdit = true;
        let obj = await getSortInfoById(rowData.id);
        state.showEdit = true;
        state.rowData = obj.data;
      }

      function deleteSort(rowData) {
        dialog.warning({
          title: '警告',
          content: '确定删除该分类吗？',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            let res = await deleteSortApi(rowData.id);
            if (res.code === 200) {
              await getSorInfo();
              message.success(res.msg);
            } else {
              message.error(res.msg);
            }
          },
          onNegativeClick: () => {
            message.info('已取消');
          },
        });
      }

      async function submitSortInfo() {
        let { token } = userStore.getInfo();
        let obj = toRaw(state.rowData);
        delete obj['createTime'];
        delete obj['updateTime'];
        let res = await editSortInfo(obj, token);
        let resData = res.data;
        if (res.code === 200) {
          for (let i = 0; i < state.value.length; i++) {
            if (state.value[i].id === resData.id) {
              state.value[i] = { ...state.value[i], ...resData };
              break;
            }
          }
          // 重置 rowData
          state.rowData = {};
          message.success(res.msg);
          state.showEdit = false;
        } else if (res.code === 201) {
          await getSorInfo();
          // 重置 rowData
          state.rowData = {};
          message.success(res.msg);
          state.showEdit = false;
        } else {
          message.error(res.msg);
        }
      }

      return {
        state,
        closeEdit,
        submitSortInfo,
        addSort,
        columns: createColumns({ editSort, deleteSort }),
        pagination: { pageSize: 10 },
      };
    },
  };
</script>

<style lang="less">
  .article-button {
    display: flex;
    justify-content: flex-end;
  }

  #halo-category {
    .halo-button {
      margin-right: 10px;
    }
  }
</style>
