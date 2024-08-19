import request from '@/utils/request'

// 查询每日圣经列表
export function listEveryday(query) {
  return request({
    url: '/bible/everyday/list',
    method: 'get',
    params: query
  })
}

// 查询每日圣经详细
export function getEveryday(id) {
  return request({
    url: '/bible/everyday/' + id,
    method: 'get'
  })
}

// 新增每日圣经
export function addEveryday(data) {
  return request({
    url: '/bible/everyday',
    method: 'post',
    data: data
  })
}

// 修改每日圣经
export function updateEveryday(data) {
  return request({
    url: '/bible/everyday',
    method: 'put',
    data: data
  })
}

// 删除每日圣经
export function delEveryday(id) {
  return request({
    url: '/bible/everyday/' + id,
    method: 'delete'
  })
}

// 自动生成每日圣经
export function autoGenerateApi(params) {
  return request({
    url: '/auto/Generate/everydayBible',
    method: 'post',
    data: params,
    timeout: 600000
  })
}
