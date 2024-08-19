import request from '@/utils/request'

// 查询每日圣经展示列表
export function listBibleview(query) {
  return request({
    url: '/everyday/bibleview/list',
    method: 'get',
    params: query
  })
}

// 查询每日圣经展示详细
export function getBibleview(id) {
  return request({
    url: '/everyday/bibleview/' + id,
    method: 'get'
  })
}

// 新增每日圣经展示
export function addBibleview(data) {
  return request({
    url: '/everyday/bibleview',
    method: 'post',
    data: data
  })
}

// 修改每日圣经展示
export function updateBibleview(data) {
  return request({
    url: '/everyday/bibleview',
    method: 'put',
    data: data
  })
}

// 删除每日圣经展示
export function delBibleview(id) {
  return request({
    url: '/everyday/bibleview/' + id,
    method: 'delete'
  })
}
