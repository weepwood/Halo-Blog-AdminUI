import { RouteRecordRaw } from 'vue-router';
import { Layout } from '@/router/constant';
import { renderIcon } from '@/utils/index';
import { OptionsSharp } from '@vicons/ionicons5';

/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时,自定进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 *
 * */

const routes: Array<RouteRecordRaw> = [
  {
    path: '/blog',
    name: 'Blog',
    redirect: '/blog/admin',
    component: Layout,
    meta: {
      title: '博客管理',
      icon: renderIcon(OptionsSharp),
      sort: 1,
    },
    children: [
      {
        path: 'article',
        name: 'blog-article',
        meta: {
          title: '文章管理',
        },
        component: () => import('@/views/blog/article/article.vue'),
      },
      {
        path: 'category',
        name: 'blog-category',
        meta: {
          title: '分类管理',
        },
        component: () => import('@/views/blog/category/category.vue'),
      },
      {
        path: 'tag',
        name: 'blog-tag',
        meta: {
          title: '标签管理',
        },
        component: () => import('@/views/blog/tag/tag.vue'),
      },
    ],
  },
];

export default routes;
