<template>
  <div v-loading="loading" style="width: 100vw; height: 89vh" ref="chartsDOM"></div>


  <el-drawer v-model="drawer" title="灾情详情" :direction="direction" :before-close="handleClose">
    <el-scrollbar>
      <div class="drawer-div-item">
        <div class="drawer-div-tag">描述:</div>
        <el-text style="width: 80%;height: 100%;">
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
        <div style="width: 75%;" v-if="info[infoIndex][7] == '文字'">
          {{ info[infoIndex][8] }}
        </div>
        <div style="width: 75%;" v-else-if="info[infoIndex][7] == '图像'">
          <img :src="info[infoIndex][8]" alt="Image Preview" />
        </div>
        <div style="width: 75%;" v-else-if="info[infoIndex][7] == '音频'">
          <audio controls>
            <source :src="info[infoIndex][8]" type="audio/wav" />
          </audio>
        </div>
        <div style="width: 75%;" v-else-if="info[infoIndex][7] == '视频'">
          <video controls>
            <source :src="info[infoIndex][8]" type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
        </div>
        <div style="width: 75%;" v-else-if="info[infoIndex][7] == '其他'">
          {{ info[infoIndex][8] }}
        </div>
      </div>

      <div style="display: flex;">
        <button
          style="width: 50%;height: 50%;margin-left: auto;margin-right: auto;margin-bottom: auto;margin-top: auto;"
          @click="downloadFile(info[infoIndex][8])">
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
import { onMounted, onUnmounted, ref } from 'vue';
import * as echarts from 'echarts';
import 'echarts/extension/bmap/bmap';
import getMap from '../map';
import instance from '@/axios';
import axios from 'axios';
import moment from 'moment';

// 示例数据
const info = [
];
const infoIndex = ref(0)
const drawer = ref(false)
const loading = ref(true)

// 将二维数组转换为 ECharts 所需格式
const formatData = (data) => {
  return data.map(([lng, lat, location, time, source, disaster], index) => ({
    name: location,
    value: [lng, lat, `${disaster} <br> 时间: ${time} <br> 来源: ${source}`],
    index
  }));
};

function formatDate(str) {
  return moment(str, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss');
}

/*
<br> 数据：<br> 
      <div v-if="type=='文字'"> </div> 
      <div v-else-if="type=='图像'">
        <img :src="imageUrl" alt="Image Preview" />
      </div> 
      <div v-else-if="type=='音频'">
        <audio v-if="item.fileType == '1'" controls>
          <source :src="item.messageContent" type="audio/wav" />
        </audio>
      </div> 
      <div v-else-if="type=='视频'">
        <video controls>
          <source src="your-video-file.mp4" type="video/mp4" />
          您的浏览器不支持视频播放。
        </video>
      </div> 
      <div v-else-if="type=='其他'"></div>
      <button @click="downloadFile('example.pdf')">点击下载文件</button>
 */

// async function downloadFile(filename) {
//   try {
//     console.log(filename)
//     // 发起下载请求
//     const response = await instance.post("/earthquake/download", {
//       url: filename
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//       }
//     });

//     // 检查文件是否成功返回
//     if (response.ok) {
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = filename;  // 设置下载文件的名字
//       a.click();
//       window.URL.revokeObjectURL(url);  // 释放 URL 对象
//     } else {
//       alert('文件下载失败');
//     }
//   } catch (error) {
//     console.error('下载失败:', error);
//     alert('下载过程中出错');
//   }
// }

async function downloadFile(fileName) {
  try {
    const response = await instance.post("/earthquake/download", {
      url: fileName
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'blob'  // 重要：指定响应类型为 blob
    });

    console.log(response)

    // 获取返回的文件数据（Blob）
    const blob = response.data;

    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // 使用 split 方法分割 URL，然后获取最后一部分
    const parts = fileName.split('/');
    const filename = parts[parts.length - 1];  // 取得最后一段

    // 设置下载文件的文件名（可以从响应中获取，也可以手动设置）
    // const filename = response.headers['content-disposition']
    //   ? response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '')
    //   : 'downloaded-file';
    link.download = filename;



    // 触发点击事件，开始下载
    link.click();

    // 释放 URL 对象
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载文件失败:', error);
    alert('下载失败');
  }
}

// 获取经纬度的函数
const getLatAndLngByAddr = async (address, i) => {
  try {
    console.log(address)

    let queryStr = `http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"${address}"}&tk=9ed28ad7c9214c6229102c5036a1e83f`;
    //let queryStr = `http://api.tianditu.gov.cn/geocoder?ds=%7B'keyWord':'${address.value.replace(" ", "").replace("#", "").replace("中国", "")}'%7D&tk=9ed28ad7c9214c6229102c5036a1e83f`;
    console.log(queryStr)
    // 发起GET请求
    const response = await axios.get(queryStr);
    const queryInfo = response.data;

    console.log(response)
    if (queryInfo && queryInfo.msg !== "无结果") {
      const locationObj = queryInfo.location;
      info[i].push(locationObj.lon)
      info[i].push(locationObj.lat)
      const lat = locationObj.lat;
      const lng = locationObj.lon;
    }
  } catch (e) {
    console.log(e)
  }
};

const chartsDOM = ref(null);
let myChart = null;

onMounted(async () => {
  const response = await instance.get('/earthquake/getAll', {
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = response.data.data
  console.log(response)
  for (let i = 0; i < data.length; i++) {
    info.push([])
    const element = data[i];
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

  myChart = echarts.init(chartsDOM.value);
  myChart.showLoading();

  try {
    const res = await getMap();
    myChart.hideLoading();

    echarts.registerMap('MAP', res.data);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return `${params.name}: ${params.value[2]}`;
        },
      },
      geo: {
        map: 'MAP',
        roam: true, // 开启地图缩放和平移
        label: {
          show: false,
        },
        itemStyle: {
          areaColor: '#a1d3ff', // 地图区域颜色
          borderColor: '#111', // 边框颜色
        },
        emphasis: {
          itemStyle: {
            areaColor: '#75aaff',
          },
        },
      },
      series: [
        {
          name: '标记点',
          type: 'scatter',
          coordinateSystem: 'geo', // 使用地理坐标系
          data: formatData(info),
          symbolSize: 5, // 点的大小
          itemStyle: {
            color: '#ff3333', // 点的颜色
          },
          label: {
            show: true,
            formatter: '{b}', // 显示点的名称
            position: 'right',
          },
        },
      ],
    };

    myChart.setOption(option);

    // 为地图的点击事件添加监听器
    myChart.on('click', function (params) {
      // if (params.componentType === 'series') {
      //   // 判断点击的是不是标记点
      //   const { name, value,index } = params.data;
      //   const disasterInfo = value[2]; // 获取灾情信息
      //   alert(`点击了 ${name} 标记点，灾情信息：${disasterInfo},下标：${index}`);
      //   // 可以在此处做更多的处理，例如显示更多的灾情信息
      // }
      infoIndex.value = params.data.index
      drawer.value = true
    });

    loading.value = false
  } catch (error) {
    console.error('地图加载失败', error);
    myChart.hideLoading();
  }
});

onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
  }
});
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

<!-- <template>
  <div style="width: 1400px; height: 1000px" ref="chartsDOM"></div>
</template>

<script setup lang="js">
import { onMounted, onUnmounted, ref } from 'vue';
import * as echarts from 'echarts';
import 'echarts/extension/bmap/bmap';
import getMap from '../map';

/* 
传入的信息（二维数组）：
[[经度, 维度, 地理位置, 时间, 来源, 灾情信息], [同上]]
*/

// 示例数据
const info = [
  [108.366543, 22.817002, '南宁', '2024-12-20 12:00', '政府', '洪水灾害'],
  [109.415953, 24.325502, '柳州', '2024-12-21 08:30', '媒体', '地震灾害'],
  [110.296442, 25.273566, '桂林', '2024-12-22 14:15', '公众', '滑坡灾害'],
];

// 将二维数组转换为 ECharts 所需格式
const formatData = (data) => {
  return data.map(([lng, lat, location, time, source, disaster, type]) => ({
    name: location,
    value: [lng, lat,
      `${disaster} <br> 
    时间: ${time} <br> 
    来源: ${source} <br> 
    数据：<br> 
    <div v-if="type=='文字'">
      
    </div> 
    <div v-else-if="type=='图像'">
      <img :src="imageUrl" alt="Image Preview" />
    </div> 
    <div v-else-if="type=='音频'">
      <audio
        v-if="item.fileType == '1'"
        style="margin: 5px; margin-right: 0; padding: 5px"
        controls
      >
        <source :src="item.messageContent" type="audio/wav" />
      </audio>
    </div> 
    <div v-else-if="type=='视频'">
      <video controls>
        <source src="your-video-file.mp4" type="video/mp4" />
        您的浏览器不支持视频播放。
      </video>
    </div> 
    <div v-else-if="type=='其他'">
    </div>
    <button @click="downloadFile('example.pdf')">点击下载文件</button>`],
  }));
};

async function downloadFile(filename) {
  try {
    // 发起下载请求
    const response = await fetch(`/download/${filename}`, {
      method: 'GET',
    });

    // 检查文件是否成功返回
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;  // 设置下载文件的名字
      a.click();
      window.URL.revokeObjectURL(url);  // 释放 URL 对象
    } else {
      alert('文件下载失败');
    }
  } catch (error) {
    console.error('下载失败:', error);
    alert('下载过程中出错');
  }
}


const chartsDOM = ref(null);
let myChart = null;

onMounted(async () => {
  myChart = echarts.init(chartsDOM.value);
  myChart.showLoading();

  try {
    const res = await getMap();
    myChart.hideLoading();

    echarts.registerMap('MAP', res.data);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          return `${params.name}: ${params.value[2]}`;
        },
      },
      geo: {
        map: 'MAP',
        roam: true, // 开启地图缩放和平移
        label: {
          show: false,
        },
        itemStyle: {
          areaColor: '#a1d3ff', // 地图区域颜色
          borderColor: '#111', // 边框颜色
        },
        emphasis: {
          itemStyle: {
            areaColor: '#75aaff',
          },
        },
      },
      series: [
        {
          name: '标记点',
          type: 'scatter',
          coordinateSystem: 'geo', // 使用地理坐标系
          data: formatData(info),
          symbolSize: 5, // 点的大小
          itemStyle: {
            color: '#ff3333', // 点的颜色
          },
          label: {
            show: true,
            formatter: '{b}', // 显示点的名称
            position: 'right',
          },
        },
      ],
    };

    myChart.setOption(option);
  } catch (error) {
    console.error('地图加载失败', error);
    myChart.hideLoading();
  }
});

onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
  }
});
</script> -->

<!-- <template>
    <div id="map-chart" ref="mapChart" style="width: 100vw; height: 100vh;"></div>
  </template>
  
  <script lang="ts" setup>
  import { onMounted, ref, onBeforeUnmount } from 'vue'
  import * as echarts from 'echarts'
  
  // 引入 GeoJSON 数据，假设该文件位于 `src/assets` 目录
  import chinaMap from '@/assets/中华人民共和国.json' // 请确保路径正确
  
  const mapChart = ref<HTMLDivElement | null>(null) // 引用 div 元素
  let chartInstance: echarts.ECharts | null = null
  
  // 初始化 ECharts 图表
  const initChart = () => {
    if (mapChart.value) {
      chartInstance = echarts.init(mapChart.value)
    }
  }
  
  // 使用直接嵌入的 GeoJSON 数据
  const loadMapData = () => {
    // 注册地图
    echarts.registerMap('customMap', chinaMap as any)
  
    // 配置 ECharts 图表
    const option = {
      title: {
        text: 'ECharts 地图展示',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      visualMap: {
        min: 100,
        max: 100,
        left: 'left',
        top: 'bottom',
        text: ['High', 'Low'],
        calculable: true,
        inRange: {
          color: ['#e0ffff', '#006edd']
        }
      },
      series: [
        {
          type: 'map',
          map: 'customMap', // 使用注册的地图名称
          roam: true, // 是否允许缩放
          label: {
            show: true,
            formatter: '{b}' // 区域名称显示
          },
          data: [
            { name: '地区1', value: 40 },
            { name: '地区2', value: 80 },
            { name: '地区3', value: 60 }
          ]
        }
      ]
    }
  
    // 设置图表配置项
    chartInstance?.setOption(option)
  }
  
  // 生命周期钩子 - mounted
  onMounted(() => {
    initChart()
    loadMapData()
      // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  })
  
  // 生命周期钩子 - beforeUnmount
  onBeforeUnmount(() => {
    chartInstance?.dispose() // 销毁图表实例，防止内存泄漏
  })

  const handleResize = () => {
  chartInstance?.resize()
}

// 清理事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
  </script>
  
  <style scoped>
  #map-chart {
    width: 100%;
    height: 100%;
  }
  </style> -->



<!-- <template>
    <div ref="chartContainer" :style="{ width, height }"></div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  
  // 引入地图数据
  import areaMapJson from '@/assets/中华人民共和国.json';  // 使用 import

  // 定义 props 类型
  const props = defineProps<{
    width: string;
    height: string;
  }>();
  
  // 创建图表实例
  const chartContainer = ref<HTMLDivElement | null>(null);
  const chart = ref<echarts.ECharts | null>(null);
  
  // 初始化图表
  const initChart = () => {
    // 注册地图
    echarts.registerMap('china', areaMapJson);
  
    // 初始化图表
    if (chartContainer.value) {
      chart.value = echarts.init(chartContainer.value);
      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}'  // 鼠标悬浮时显示区域名称
        },
        geo: {
          map: 'china',  // 引用已注册的地图
          roam: true,     // 启用缩放和拖拽
          zoom: 1,        // 缩放级别
          itemStyle: {
            normal: {
              areaColor: '#eeeeee', // 区域颜色
              borderColor: '#111',  // 区域边界颜色
            },
            emphasis: {
              areaColor: '#c6e2ff', // 鼠标悬浮时区域颜色
            }
          }
        },
        series: [
          {
            name: '中国',
            type: 'map',
            geoIndex: 0,
            data: []  // 你可以在这里添加数据来显示不同的值
          }
        ]
      };
  
      // 设置图表选项
      chart.value.setOption(option);
    }
  };
  
  // 组件挂载后初始化图表
  onMounted(() => {
    initChart();
  });
  </script>
  
  <style scoped>
  /* 添加样式以确保容器尺寸合适 */
  div {
    width: 100%;
    height: 100%;
  }
  </style> -->








<!-- <script lang="ts" setup>
  import { ref, onMounted, defineProps } from 'vue';
  import * as echarts from 'echarts';
  
    // 假设 area.json 通过 webpack 或其他构建工具引入
    import areaMapJson from '@/assets/中华人民共和国.json';  // 使用 import

  // 定义 props 类型
  const props = defineProps<{
    mapJson: object;
    width: string;
    height: string;
  }>();
  
  // 定义 dataList 的类型
  interface DataItem {
    name: string;
    treeID: string;
    parent?: string | null;
    treeName: string;
    ename?: string;
  }
  
  const chart = ref<echarts.ECharts | null>(null);
  const chartContainer = ref<HTMLDivElement | null>(null);
  
  const dataList: DataItem[] = [
    {
      name: '中国',
      treeID: '1',
      parent: null,
      treeName: '中国_1'
    },
    {
      name: '北部',
      treeID: '1-1',
      parent: '1',
      treeName: '北部_1-1',
      ename: 'north'
    }
  ];
  
  // 初始化地图图表
  const initEchart = () => {

  
    // 通过 topojson 转换为 geojson
    // const ChinaResult = topojson.feature(
    //   areaMapJson.payload,
    //   areaMapJson.payload.objects.collection
    // );
  
    // 下钻处理，遍历子区域
    dataList.forEach((item, index) => {
      if (index > 0 && areaMapJson.children[item.treeID]) {
        const result = topojson.feature(
          areaMapJson.children[item.treeID].payload,
          areaMapJson.children[item.treeID].payload.objects.collection
        );
        ChinaResult.features = [...ChinaResult.features, ...result.features];
      }
    });
  
    echarts.registerMap('china', ChinaResult);
  
    if (chartContainer.value) {
      chart.value = echarts.init(chartContainer.value);
      const option: echarts.EChartsOption = {
        tooltip: {
          padding: 0,
          textStyle: {
            fontSize: 14,
            color: '#7DD1FF'
          }
        },
        visualMap: {
          min: 0,
          max: 1000,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          inRange: {
            color: ['lightskyblue', 'yellow', 'orangered']
          },
          show: true
        },
        geo: {
          map: 'china',
          roam: true,
          zoom: 1,
          label: {
            normal: {
              show: true,
              fontSize: '16',
              color: 'rgba(0,0,0,0.7)'
            }
          },
          itemStyle: {
            normal: {
              borderColor: 'rgba(0, 0, 0, 0.2)'
            },
            emphasis: {
              areaColor: 'skyblue',
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 20,
              borderWidth: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        },
        series: [
          {
            name: '大区',
            type: 'map',
            geoIndex: 0,
            data: dataList
          }
        ]
      };
      chart.value.setOption(option);
  
      // 点击大区事件，进行下钻
      chart.value.on('click', (params) => {
        if (!params.data.ename) {
          alert('暂无' + params.name + '地图数据');
          return;
        }
        // 这里可以处理下钻逻辑，传递参数
        // params.data.ename 和 params.data.name 可以用来处理
      });
    }
  };
  
  // 使用 onMounted 来初始化图表
  onMounted(() => {
    initEchart();
  });
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style> -->


<!-- <template>
    <div> -->
<!-- 地图容器 -->
<!-- <div id="map" style="height: 500px;"></div> -->

<!-- 悬停省份显示的信息 -->
<!-- <div v-if="hoveredProvince" class="province-info">
        <p>省份：{{ hoveredProvince.name }}</p>
        <p>人口：{{ hoveredProvince.population }}</p>
        <p>面积：{{ hoveredProvince.area }} km²</p>
      </div>
    </div>
  </template> -->

<!-- <script setup>
  import { ref, onMounted } from 'vue';
  import * as echarts from 'echarts';
  
  // 悬停省份的响应式数据
  const hoveredProvince = ref(null);
  
  // 模拟省份数据，实际应用中可以通过 API 或后端获取
  const provinceData = [
    { name: '北京', population: '21.7M', area: 16410.54 },
    { name: '上海', population: '24.2M', area: 6340.5 },
    { name: '广东', population: '113M', area: 179800 },
    // 更多省份数据...
  ];
  
  // 初始化地图
  onMounted(() => {
    const chart = echarts.init(document.getElementById('map'));
  
    // 异步加载中国地图的 geoJson 数据
    fetch('中华人民共和国.json')
      .then(response => response.json())
      .then(geoJson => {
        echarts.registerMap('china', geoJson);
  
        // 配置 ECharts 图表选项
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: (params) => {
              return `${params.name}<br/>人口: ${params.value.population}`;
            },
          },
          geo: {
            type: 'map',
            map: 'china',
            roam: true, // 启用地图缩放和拖动
          },
          series: [
            {
              type: 'map',
              mapType: 'china',
              label: {
                show: true,
                formatter: '{b}',
              },
              data: provinceData, // 将省份数据传给地图
            },
          ],
        };
  
        // 设置图表的选项
        chart.setOption(option);
  
        // 监听鼠标悬停事件
        chart.on('mouseover', (params) => {
          if (params.componentType === 'geo') {
            // 查找鼠标悬停的省份数据
            const province = provinceData.find(item => item.name === params.name);
            hoveredProvince.value = province || null;
          }
        });
      });
  });
  </script>
  
  <style scoped>
  .province-info {
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    margin-top: 20px;
  }
  </style>
   -->