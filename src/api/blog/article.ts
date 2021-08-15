import http from '@/utils/http/axios';

/**
 * 获取该作者下所有文章
 */
export function getArticle(userId) {
  return http.request(
    {
      url: `/blog/article/${userId}`,
      method: 'GET',
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * 根据BlogId获取文章
 */
export function getArticleInfo(blogId) {
  return http.request(
    {
      url: `/blog/${blogId}`,
      method: 'GET',
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * 根据BlogId获取文章
 */
export function postArticle(params, authorization) {
  return http.request(
    {
      url: `/blog/edit`,
      method: 'POST',
      params,
      headers: {
        Authorization: authorization,
      },
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * 获取该用户下的博客分类
 */
export function getSortByUserId(userId) {
  return http.request(
    {
      url: `/blog/sort/user/${userId}`,
      method: 'GET',
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * 根据博客分类Id获取分类信息
 */
export function getSortInfoById(sortId) {
  return http.request(
    {
      url: `/blog/sort/${sortId}`,
      method: 'GET',
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * 编辑分类信息
 */
export function editSortInfo(params, authorization) {
  return http.request(
    {
      url: `/blog/sort/edit`,
      method: 'POST',
      params,
      headers: {
        Authorization: authorization,
      },
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * 删除分类
 */
export function deleteSortApi(sortId) {
  return http.request(
    {
      url: `/blog/sort/delete/${sortId}`,
      method: 'DELETE',
      // headers: {
      //   Authorization: authorization,
      // }
    },
    {
      isTransformResponse: false,
    }
  );
}

/**
 * 删除文章
 */
export function deleteArticleApi(blogId) {
  return http.request(
    {
      url: `/blog/delete/${blogId}`,
      method: 'DELETE',
      // headers: {
      //   Authorization: authorization,
      // }
    },
    {
      isTransformResponse: false,
    }
  );
}
