import request from '@/utils/request'

// 查询白名单列表列表
export function listPet(query) {
  return request({
    url: '/whiteList/pet/list',
    method: 'get',
    params: query
  })
}

// 查询白名单列表详细
export function getPet(id) {
  return request({
    url: '/whiteList/pet/' + id,
    method: 'get'
  })
}

// 新增白名单列表
export function addPet(data) {
  return request({
    url: '/whiteList/pet',
    method: 'post',
    data: data
  })
}

// 修改白名单列表
export function updatePet(data) {
  return request({
    url: '/whiteList/pet',
    method: 'put',
    data: data
  })
}

// 删除白名单列表
export function delPet(id) {
  return request({
    url: '/whiteList/pet/' + id,
    method: 'delete'
  })
}
