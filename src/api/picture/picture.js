import request from '@/utils/request'

// 查询背景图片列表
export function listPicture(query) {
  return request({
    url: '/picture/picture/list',
    method: 'get',
    params: query
  })
}

// 查询背景图片详细
export function getPicture(id) {
  return request({
    url: '/picture/picture/' + id,
    method: 'get'
  })
}

// 新增背景图片
export function addPicture(data) {
  return request({
    url: '/picture/picture',
    method: 'post',
    data: data
  })
}

// 修改背景图片
export function updatePicture(data) {
  return request({
    url: '/picture/picture',
    method: 'put',
    data: data
  })
}

// 删除背景图片
export function delPicture(id) {
  return request({
    url: '/picture/picture/' + id,
    method: 'delete'
  })
}
