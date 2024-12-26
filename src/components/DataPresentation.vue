<template>
  <button style="position: fixed;top: 15%;left: 5%;width: 10%;z-index: 9999;" @click="exportToExcel">
    导出为Excel
  </button>
  <div v-loading="loading" style="width: 100vw; height: 89vh;position: relative;  z-index: 1;" ref="chartsDOM"></div>

  <el-drawer v-model="drawer" title="灾情详情" :direction="direction" :before-close="handleClose">
    <el-scrollbar>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">描述:</div>
        <el-text style="width: 80%; height: 100%">
          {{ info[infoIndex][9] }}
        </el-text>
      </div>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">地点:</div>
        <div style="font-size: small">{{ info[infoIndex][2] }}</div>
      </div>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">灾害:</div>
        <div style="font-size: small">{{ info[infoIndex][5] }}</div>
      </div>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">经度:</div>
        <div style="font-size: small">{{ info[infoIndex][0] }}</div>
      </div>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">纬度:</div>
        <div style="font-size: small">{{ info[infoIndex][1] }}</div>
      </div>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">时间:</div>
        <div style="font-size: small">{{ info[infoIndex][3] }}</div>
      </div>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">来源:</div>
        <div style="font-size: small">{{ info[infoIndex][4] }}</div>
      </div>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">数据类型:</div>
        <div style="font-size: small">{{ info[infoIndex][7] }}</div>
      </div>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">数据:</div>
        <div style="width: 75%" v-if="info[infoIndex][7] == '文字'">
          {{ info[infoIndex][8] }}
        </div>
        <div style="width: 75%" v-else-if="info[infoIndex][7] == '图像'">
          <img :src="info[infoIndex][8]" alt="Image Preview" />
        </div>
        <div style="width: 75%" v-else-if="info[infoIndex][7] == '音频'">
          <audio controls>
            <source :src="info[infoIndex][8]" type="audio/wav" />
          </audio>
        </div>
        <div style="width: 75%" v-else-if="info[infoIndex][7] == '视频'">
          <video controls style="width: 100%">
            <source :src="info[infoIndex][8]" type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
        </div>
        <div style="width: 75%" v-else-if="info[infoIndex][7] == '其他'">
          {{ info[infoIndex][8] }}
        </div>
      </div>

      <div style="display: flex">
        <button
          style="
            width: 50%;
            height: 50%;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: auto;
            margin-top: auto;
          "
          @click="downloadFile(info[infoIndex][8])"
        >
          点击下载文件
        </button>
      </div>

      <!-- <div class="drawer-div-item">
        <div class="drawer-div-tag">群公告:</div>
        <div style="width: 80%; max-height: 20%">
          <el-text>{{ groupInfo.groupNotice }}</el-text>
        </div>
      </div>
      <div style="width: 100%; display: flex; justify-content: center" v-if="isGroupOwner()">
        <el-button type="primary" @click="showDialog">修改群信息</el-button>
      </div> -->
    </el-scrollbar>
  </el-drawer>


</template>

<script setup lang="js">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import 'echarts/extension/bmap/bmap'
import getMap from '../map'
import instance from '@/axios'
import axios from 'axios'
import moment from 'moment'

import * as XLSX from 'xlsx'

// 导出Excel函数
const exportToExcel = () => {
  info.unshift([
    '经度',
    '纬度',
    '地点',
    '时间',
    '来源',
    '灾害',
    '灾害子类',
    '数据类型',
    '数据',
    '描述'
  ])
  // 1. 创建工作表：直接用二维数组
  const ws = XLSX.utils.aoa_to_sheet(info)

  // 2. 创建工作簿
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  // 3. 导出 Excel 文件
  XLSX.writeFile(wb, 'diaster_data.xlsx')
  info.value.shift()
}
// 示例数据
const info = []
const infoIndex = ref(0)
const drawer = ref(false)
const loading = ref(true)

// 将二维数组转换为 ECharts 所需格式
const formatData = (data) => {
  return data.map(([lng, lat, location, time, source, disaster], index) => ({
    name: location,
    value: [lng, lat, `${disaster} <br> 时间: ${time} <br> 来源: ${source}`],
    index
  }))
}

function formatDate(str) {
  return moment(str, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss')
}


async function downloadFile(fileName) {
  try {
    const response = await instance.post(
      '/earthquake/download',
      {
        url: fileName
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob' // 重要：指定响应类型为 blob
      }
    )

    console.log(response)

    // 获取返回的文件数据（Blob）
    const blob = response.data

    // 创建下载链接
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)

    // 使用 split 方法分割 URL，然后获取最后一部分
    const parts = fileName.split('/')
    const filename = parts[parts.length - 1] // 取得最后一段

    link.download = filename

    // 触发点击事件，开始下载
    link.click()

    // 释放 URL 对象
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('下载文件失败:', error)
    alert('下载失败')
  }
}

// 获取经纬度的函数
const getLatAndLngByAddr = async (address, i) => {
  try {
    console.log(address)

    let queryStr = `http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"${address}"}&tk=dbcd65a86a9970f63eab7ef0966a9f9d`
    //let queryStr = `http://api.tianditu.gov.cn/geocoder?ds=%7B'keyWord':'${address.value.replace(" ", "").replace("#", "").replace("中国", "")}'%7D&tk=9ed28ad7c9214c6229102c5036a1e83f`;
    console.log(queryStr)
    // 发起GET请求
    const response = await axios.get(queryStr)
    const queryInfo = response.data

    console.log(response)
    if (queryInfo && queryInfo.msg !== '无结果') {
      const locationObj = queryInfo.location
      info[i].push(locationObj.lon)
      info[i].push(locationObj.lat)
      const lat = locationObj.lat
      const lng = locationObj.lon
    }
  } catch (e) {
    console.log(e)
  }
}

const chartsDOM = ref(null)
let myChart = null

onMounted(async () => {
  const response = await instance.get(
    '/earthquake/getAll',
    {},
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  const data = response.data.data
  console.log(response)
  for (let i = 0; i < data.length; i++) {
    info.push([])
    const element = data[i]
    await getLatAndLngByAddr(element.location, i)
    info[i].push(element.location)
    info[i].push(formatDate(element.date))
    info[i].push(element.dataSource)
    info[i].push(element.diasterType)
    info[i].push(element.diasterCode)
    info[i].push(element.fileType)
    info[i].push(element.url)
    info[i].push(element.description)
  }

  console.log(info)

  myChart = echarts.init(chartsDOM.value)
  myChart.showLoading()

  try {
    const res = await getMap()
    myChart.hideLoading()

    echarts.registerMap('MAP', res.data)

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return `${params.name}: ${params.value[2]}`
        }
      },
      geo: {
        map: 'MAP',
        roam: true, // 开启地图缩放和平移
        label: {
          show: false
        },
        itemStyle: {
          areaColor: '#a1d3ff', // 地图区域颜色
          borderColor: '#111' // 边框颜色
        },
        emphasis: {
          itemStyle: {
            areaColor: '#75aaff'
          }
        }
      },
      series: [
        {
          name: '标记点',
          type: 'scatter',
          coordinateSystem: 'geo', // 使用地理坐标系
          data: formatData(info),
          symbolSize: 5, // 点的大小
          itemStyle: {
            color: '#ff3333' // 点的颜色
          },
          label: {
            show: true,
            formatter: '{b}', // 显示点的名称
            position: 'right'
          }
        }
      ]
    }

    myChart.setOption(option)

    // 为地图的点击事件添加监听器
    myChart.on('click', function (params) {
      infoIndex.value = params.data.index
      drawer.value = true
    })

    loading.value = false
  } catch (error) {
    console.error('地图加载失败', error)
    myChart.hideLoading()
  }
})

onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
  }
})
</script>

<style scoped>
.drawer-div-item {
  display: flex;
  margin-top: 5%;
  margin-bottom: 5%;
  max-width: 80%;
}

.el-drawer__wrapper {
  width: 100% !important;
  /* 强制应用宽度 */
}

.el-drawer.rtl.open {
  width: 100% !important;
  /* 强制应用宽度 */
}

.drawer-div-tag {
  font-size: small;
  width: 20%;
}
</style>

