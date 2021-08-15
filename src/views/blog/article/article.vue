<template>
  <div>
    <n-space>
      <n-button @click="addArticle"> 添加文章</n-button>
      <n-button :loading="state.loadingData" @click="refreshData"> 刷新数据</n-button>
    </n-space>

    <n-space vertical :size="12">
      <!-- <p> 你选中了 {{ state.checkedRowKeys.length }} 行。 </p>-->
      <n-data-table
        ref="table"
        :columns="columns"
        :data="state.value"
        :row-key="(row) => row.id"
        :pagination="pagination"
        @update:checked-row-keys="handleCheck"
        :max-height="1000"
        :scroll-x="1300"
        virtual-scroll
      />
    </n-space>

    <n-modal v-model:show="state.showEdit">
      <n-card
        style="width: 750px"
        title="编辑"
        closable
        :bordered="false"
        :mask-closable="false"
        size="huge"
        @close="closeEdit"
      >
        <n-form :model="state.rowData" ref="baseBlogInfo" label-placement="left">
          <div class="halo-edit">
            <div class="halo-edit-left">
              <div>
                <n-form-item label="标题">
                  <n-input v-model:value="state.rowData.blogTitle" @keydown.enter.prevent />
                </n-form-item>
                <div class="tag-edit">
                  <n-form-item label="标签">
                    <n-select
                      v-model:value="value"
                      multiple
                      :options="options"
                      max-tag-count="responsive"
                      clearable
                    />
                  </n-form-item>
                </div>

                <n-form-item label="分类">
                  <n-select
                    :options="state.sortMap"
                    v-model:value="state.rowData.sortName"
                    clearable
                    @keydown.enter.prevent
                  />
                </n-form-item>
              </div>
              <div class="article-switch">
                <div class="article-switch-top">
                  <n-form-item label="是否发布" class="article-switch-item">
                    <n-switch v-model:value="state.rowData.isPublish" />
                  </n-form-item>
                  <n-form-item label="是否原创">
                    <n-switch v-model:value="state.rowData.isOriginal" />
                  </n-form-item>
                </div>
                <div class="article-switch-bottom">
                  <n-form-item label="开启评论" class="article-switch-item">
                    <n-switch v-model:value="state.rowData.isOpenComment" />
                  </n-form-item>
                </div>
              </div>
            </div>
            <div class="halo-edit-right">
              <div
                class="halo-edit-right-img"
                :style="{ backgroundImage: 'url(' + state.rowData.blogCover + ')' }"
              >
                <!--                <img :src=""/>-->
              </div>

              <div>
                <n-form-item label="">
                  <n-input v-model:value="state.rowData.blogCover" @keydown.enter.prevent />
                </n-form-item>
              </div>
            </div>
          </div>

          <n-form-item label="描述">
            <n-input v-model:value="state.rowData.description" />
          </n-form-item>

          <n-form-item label="内容">
            <n-input placeholder="Textarea" v-model:value="state.rowData.content" type="textarea" />
          </n-form-item>

          <div class="article-button">
            <div>
              <n-button type="warning" @click="reset">重置</n-button>
              <n-button class="article-button-item" type="error" @click="deleteArticle"
                >删除
              </n-button>
            </div>
            <div>
              <n-button color="#63E2B7" @click="submitBaseInfo">提交</n-button>
              <n-button class="article-button-item" type="info">编辑文章内容</n-button>
            </div>
          </div>
        </n-form>
      </n-card>
    </n-modal>
  </div>
</template>

<script>
  import { h, onMounted, reactive, ref, toRaw } from 'vue';
  import { getArticle, getArticleInfo, postArticle, deleteArticleApi } from '@/api/blog/article';
  import { NButton, NTag, useDialog, useMessage } from 'naive-ui';
  import { useUserStoreWidthOut } from '@/store/modules/user';
  import { getSortByUserId } from '../../../api/blog/article';

  const titleColumn = {
    title: '标题',
    key: 'blogTitle',
    width: 150,
    fixed: 'left',
    ellipsis: {
      tooltip: true,
    },
  };

  const descriptionColumn = {
    title: '描述',
    key: 'description',
    width: 200,
    ellipsis: true,
  };

  const createdColumn = {
    title: '创建时间',
    key: 'created',
  };

  const updateColumn = {
    title: '更新时间',
    key: 'updateTime',
  };

  const likeColumn = {
    title: '点赞数',
    key: 'blogLike',
    sorter: (row1, row2) => row1.blogLike - row2.blogLike,
  };

  const collectColumn = {
    title: '收藏数',
    key: 'collectCount',
    sorter: (row1, row2) => row1.collectCount - row2.collectCount,
  };

  const TagColumn = {
    title: '标签',
    key: 'tagUid',
    render(row) {
      let tags = row.tagUid.split(',');
      tags = tags.map((tagKey) => {
        return h(
          NTag,
          {
            style: {
              marginRight: '6px',
            },
            type: 'success',
          },
          {
            default: () => tagKey,
          }
        );
      });
      return tags;
    },
  };

  const SortColumn = {
    title: '分类',
    key: 'sortName',
  };

  const isPublishColumn = {
    title: '是否发布',
    key: 'isPublish',
    render(row) {
      let type = row.isPublish ? 'info' : 'warning';
      return h(
        NTag,
        {
          style: {
            marginRight: '6px',
          },
          type: type,
        },
        { default: () => (row.isPublish ? '发布' : '草稿') }
      );
    },
  };

  const isOriginalColumn = {
    title: '是否原创',
    key: 'isOriginal',
    render(row) {
      let type = row.isOriginal ? 'info' : 'warning';
      return h(
        NTag,
        {
          style: {
            marginRight: '6px',
          },
          type: type,
        },
        { default: () => (row.isOriginal ? '原创' : '转载') }
      );
    },
  };

  const createColumns = ({ editArticle }) => {
    return [
      {
        type: 'selection',
      },
      titleColumn,
      likeColumn,
      collectColumn,
      SortColumn,
      TagColumn,
      isPublishColumn,
      isOriginalColumn,
      createdColumn,
      updateColumn,
      descriptionColumn,
      {
        title: '操作',
        key: 'actions',
        fixed: 'right',
        width: 80,
        align: 'center',
        render(row) {
          return h(
            NButton,
            {
              size: 'small',
              onClick: () => {
                editArticle(row);
              },
            },
            { default: () => '编辑' }
          );
        },
      },
    ];
  };

  export default {
    name: 'ArticleHalo',
    setup() {
      const message = useMessage();
      const dialog = useDialog();
      const userStore = useUserStoreWidthOut();

      const state = reactive({
        // 用于展示表格数据
        value: [],
        // 表格中一行的数据，用于编辑
        rowData: {},
        checkedRowKeys: [],
        res: {},
        // 控制编辑弹窗的展开与关闭
        showEdit: false,
        // 控制数据刷新的loading动画
        loadingData: false,
      });

      // 文章分类的映射关系
      let sortMap = [];
      // 从 localStorage 中获取用户 Id 和 token
      const { userId, token } = userStore.getInfo();

      onMounted(async () => {
        await getAllArticleByUserId(userId);
      });

      // 获取该作者的所有文章信息
      async function getAllArticleByUserId(userId) {
        // 获取该作者的所有文章基本信息
        let articleRes = await getArticle(userId);
        // 获取该作者的所有文章分类
        let sortRes = await getSortByUserId(userId);

        // 处理分类数据
        state.sortMap = sortRes.data.map((o) => {
          return {
            value: o.id,
            label: o.sortName,
          };
        });

        // 处理数据
        state.value = articleRes.data.map((o) => {
          return {
            ...o,
            isPublish: !!o.isPublish,
            isOpenComment: !!o.isOpenComment,
            isOriginal: !!o.isOriginal,
            sortName: getSortNameById(parseInt(o.blogSortUid)),
          };
        });
      }

      // 刷新指定列数据
      async function resetData(blogId) {
        // 从后端获取数据
        let res = await getArticleInfo(blogId);
        // 调整部分 key 和 value
        let obj = res.data;
        obj = {
          ...obj,
          isPublish: !!obj.isPublish,
          isOpenComment: !!obj.isOpenComment,
          isOriginal: !!obj.isOriginal,
          sortName: getSortNameById(parseInt(obj.blogSortUid)),
        };
        return obj;
      }

      // 通过分类id查找对应分类名称
      function getSortNameById(sortId) {
        for (let i = 0; i < state.sortMap.length; i++) {
          if (state.sortMap[i].value === sortId) {
            return state.sortMap[i].label;
          }
        }
        return 'NULL';
      }

      function handleCheck(rowKeys) {
        console.log('handleCheck');
        state.checkedRowKeys = rowKeys;
      }

      // 关闭编辑窗口
      function closeEdit() {
        state.showEdit = false;
      }

      // 刷新页面数据
      async function refreshData() {
        state.loadingData = true;
        await getAllArticleByUserId(userId);
        message.success('刷新成功');
        state.loadingData = false;
      }

      // 编辑器重置数据事件
      async function reset() {
        state.rowData = await resetData(state.rowData.id);
      }

      async function deleteArticle() {
        dialog.warning({
          title: '警告',
          content: '确定删除该文章吗？',
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: async () => {
            let res = await deleteArticleApi(state.rowData.id);
            if (res.code === 200) {
              await getAllArticleByUserId(userId);
              message.success(res.msg);
              state.rowData = {};
              state.showEdit = false;
            } else {
              message.error(res.msg);
            }
          },
          onNegativeClick: () => {
            message.info('已取消');
          },
        });
      }

      // 添加文章
      function addArticle() {
        // 重置 rowData
        state.rowData = {};
        state.showEdit = true;
      }

      // 提交编辑数据
      async function submitBaseInfo() {
        let obj = toRaw(state.rowData);

        obj = {
          blogTitle: obj.blogTitle,
          id: obj.id,
          blogSortUid: obj.sortName,
          tagUid: obj.tagUid,
          status: obj.status,
          content: obj.content,
          description: obj.description,
          isPublish: obj.isPublish ? 1 : 0,
          isOpenComment: !!obj.isOpenComment ? 1 : 0,
          isOriginal: !!obj.isOriginal ? 1 : 0,
        };

        // post 发送数据
        let postArticleRes = await postArticle(obj, token);

        if (postArticleRes.code === 200) {
          let resetRes = await resetData(state.rowData.id);
          for (let i = 0; i < state.value.length; i++) {
            // 遍历寻找到state中对应的value项
            if (state.value[i].id === resetRes.id) {
              // 更新 value 值
              state.value[i] = { ...state.value[i], ...resetRes };
              break;
            }
          }
          // 重置 rowData
          state.rowData = {};
          message.success(postArticleRes.msg);
          state.showEdit = false;
        } else {
          message.error(postArticleRes.msg);
        }
      }

      // 编辑按钮事件
      async function editArticle(rowData) {
        let obj = await resetData(rowData.id);
        state.showEdit = true;
        state.rowData = obj;
        console.log(obj);
      }

      return {
        addArticle,
        state,
        deleteArticle,
        handleCheck,
        refreshData,
        closeEdit,
        reset,
        submitBaseInfo,
        columns: createColumns({ editArticle }),
        pagination: { pageSize: 10 },
        value: ref(['song3']),
        options: [
          {
            label: "Everybody's Got Something to Hide Except Me and My Monkey",
            value: 'song0',
            disabled: true,
          },
          {
            label: 'Drive',
            value: 'song1',
          },
          {
            label: 'Norwegian',
            value: 'song2',
          },
          {
            label: 'You',
            value: 'song3',
            disabled: true,
          },
          {
            label: 'Nowhere',
            value: 'song4',
          },
          {
            label: 'Think',
            value: 'song5',
          },
          {
            label: 'The',
            value: 'song6',
          },
          {
            label: 'Michelle',
            value: 'song7',
            disabled: true,
          },
          {
            label: 'What',
            value: 'song8',
          },
          {
            label: 'Girl',
            value: 'song9',
          },
          {
            label: "I'm looking through you",
            value: 'song10',
          },
          {
            label: 'In My Life',
            value: 'song11',
          },
          {
            label: 'Wait',
            value: 'song12',
          },
        ],
      };
    },
  };
</script>

<style lang="less">
  .halo-edit {
    //max-height: 250px;
    display: flex;

    .n-select {
      width: 310px;
    }

    .tag-edit {
    }

    .halo-edit-left {
      min-width: 350px;
      max-width: 350px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .article-switch {
        display: flex;
        flex-direction: column;

        .article-switch-top {
          display: flex;

          & > div {
            margin-right: 40px;
          }
        }

        .article-switch-bottom {
          display: flex;
        }

        .article-switch-item {
          margin-right: 20px;
        }
      }
    }

    .halo-edit-right {
      display: flex;
      width: 100%;
      flex-direction: column;

      justify-content: space-between;
      padding-left: 15px;

      .halo-edit-right-img {
        border-radius: 4px;
        height: 200px;
        box-shadow: 3px 3px 6px 2px rgba(0, 0, 0, 0.15);
        background-size: cover;
        background-repeat: no-repeat;
      }

      img {
        height: auto;
        width: auto;
      }
    }
  }

  .article-button {
    display: flex;
    justify-content: space-between;

    .article-button-item {
      margin-left: 20px;
    }
  }
</style>
