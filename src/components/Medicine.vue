<template>
  <div>
    <el-card class="card" body-style="justify-content: center;">
      <h2 class="tital">数据管理</h2>

      <div class="searchConditionDiv">
        <p style="margin-top: auto;margin-bottom: auto;">查询：</p>
        <el-input class="conditionInput" v-model="conditionValue" placeholder="" size="small" clearable></el-input>
        <el-button type="primary" style="height: 40px;margin-right: 5px;margin-top: auto;margin-bottom: auto;"
          @click="searchByCondition">搜索</el-button>
        <el-button type="danger" style="height: 40px;margin-top: auto;margin-bottom: auto;"
          @click="clearSearchCondition">清空</el-button>
        <el-button type="primary" style="height: 40px;margin-left: auto;margin-top: auto;margin-bottom: auto;"
          @click="showUploadDisasterDataDialog">上传数据</el-button>
      </div>

      <el-table v-loading="loading" class="table" :data="info" row-key="dataId" :row-class-name="tableRowClassName">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="location" label="参考位置" width="250" />
        <el-table-column prop="date" label="时间" width="150" />
        <el-table-column prop="dataSource" label="数据源" width="100" />
        <el-table-column prop="fileType" label="数据载体" width="100" />
        <el-table-column prop="diasterType" label="灾害分类" width="100" />
        <el-table-column prop="diasterCode" label="灾害子类" width="100" />
        <el-table-column prop="description" label="描述" width="250" />
        <el-table-column prop="url" label="数据" width="325">
          <template v-slot="scoped">
            <div>
              <div v-if="scoped.row.fileType == '文字'">
                文字数据
              </div>
              <div v-else-if="scoped.row.fileType == '图像'">
                <img :src="scoped.row.url" alt="Image Preview" />
              </div>
              <div v-else-if="scoped.row.fileType == '音频'">
                <audio controls>
                  <source :src="scoped.row.url" type="audio/wav" />
                </audio>
              </div>
              <div v-else-if="scoped.row.fileType == '视频'">
                <video controls>
                  <source :src="scoped.row.url" type="video/mp4" />
                  您的浏览器不支持视频播放。
                </video>
              </div>
              <div v-else-if="scoped.row.fileType == '其他'">
                其他数据
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="describe" label="操作" width="125">
          <template v-slot="scoped">
            <el-button :value="false" size="small" type="danger"
              @click="deleteDiasterData(scoped.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="paging" :page-size="pageSize" :current-page="currentPage" :page-sizes="[5, 10, 15, 20]"
        layout="sizes,prev,pager,next,jumper,->,total" @current-change="handlePageChange"
        @size-change="handlePageSizeChange" :total="total">
      </el-pagination>

    </el-card>

    <br />
    <br />

    <el-card class="card" v-show="drugManageVisible">
      <h2 class="tital">提醒管理</h2>

      <div class="searchConditionDiv">
        <p style="margin-top: auto;margin-bottom: auto;">根据药物名称查询：</p>
        <el-input class="conditionInput" v-model="conditionValue" placeholder="" size="small" clearable></el-input>
        <el-button class="drugAlertBtn" type="primary" style="height: 40px;margin-right: 5px;"
          @click="searchByConditionAlert">搜索</el-button>
        <el-button class="drugAlertBtn" type="danger" style="height: 40px;"
          @click="clearSearchConditionAlert">清空</el-button>
        <el-button class="drugAlertBtn" type="primary" style="height: 40px;margin-left:auto;"
          @click="addDrugAlertsDialog">添加用药提醒</el-button>
      </div>

      <el-table class="table" :data="drugAlerts">
        <el-table-column type="expand">
          <template v-slot="props">
            <div>
              <p style="margin-left: 20px;">提醒id: {{ props.row.alertId }}</p>
              <p style="margin-left: 20px;">药物id: {{ props.row.drugId }}</p>
              <p style="margin-left: 20px;">频率: {{ props.row.frequency }}</p>
              <p style="margin-left: 20px;">剂量: {{ props.row.dosage }} {{ props.row.unit }}</p>
              <el-button style="margin-left: 20px;" type="danger" @click="deleteDrugAlert(props.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="时间" prop="alertTime" />
        <el-table-column label="药物名" prop="drugName" />
        <el-table-column label="是否启用" prop="isActive">
          <template v-slot="scoped">
            <el-switch v-model="scoped.row.isActive" active-text="是" inactive-text="否" :active-value="1"
              :inactive-value="0" @change="updateIsAvtive(scoped.row)" />
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="paging" :page-size="pageSizeAlert" :current-page="currentPageAlert"
        :page-sizes="[5, 10, 15, 20]" layout="sizes,prev,pager,next,jumper,->,total"
        @current-change="handleCurrentChangeAlert" @size-change="handleSizeChangeAlert" :total="totalAlert">
      </el-pagination>
    </el-card>

    <el-dialog title="添加用药提醒" v-model="addDrugsDialogVisible" width="50%">
      <el-form ref="form" :model="addDrugAlert" label-width="150px" style="margin-left: auto;margin-right: auto;">
        <el-form-item class="dialogInput" label="药物名" prop="drugName">
          <el-input v-model="addDrugAlert.drugName" placeholder="请输入药物名"></el-input>
        </el-form-item>
        <el-form-item class="dialogInput" label="用药频次" prop="frequency">
          <el-select class="selectCon" v-model="addDrugAlert.frequency" placeholder="用药频次" size="small">
            <el-option value="每天" label="每天" />
            <el-option value="每两天" label="每两天" />
            <el-option value="每三天" label="每三天" />
            <el-option value="每四天" label="每四天" />
            <el-option value="每五天" label="每五天" />
            <el-option value="每六天" label="每六天" />
            <el-option value="每周" label="每周" />
          </el-select>
        </el-form-item>
        <el-form-item class="dialogInput" label="单位" prop="unit">
          <el-select class="selectCon" v-model="addDrugAlert.unit" placeholder="单位" size="small">
            <el-option value="毫克" label="毫克" />
            <el-option value="毫升" label="毫升" />
            <el-option value="微克" label="微克" />
            <el-option value="克" label="克" />
            <el-option value="片" label="片" />
            <el-option value="支" label="支" />
            <el-option value="粒" label="粒" />
            <el-option value="包" label="包" />
            <el-option value="瓶" label="瓶" />
          </el-select>
        </el-form-item>
        <el-form-item class="dialogInput" label="剂量" prop="dosage">
          <el-input v-model="addDrugAlert.dosage" placeholder="请输入剂量(小数)"></el-input>
        </el-form-item>
        <el-form-item class="dialogInput" label="是否启用" prop="isActive">
          <el-switch v-model="addDrugAlert.isActive" active-text="是" inactive-text="否" active-value="1"
            inactive-value="0" />
        </el-form-item>
        <el-form-item class="dialogInput" label="提醒时间" prop="alertTime">
          <el-time-picker v-model="addDrugAlert.alertTime" value-format="HH:mm:ss" placeholder="提醒时间" />
        </el-form-item>
        <el-form-item align="center">
          <el-button type="primary" size="small" @click="saveDrugAlert">添加</el-button>
          <el-button type="info" size="small" @click="closeAddDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>


    <el-dialog title="上传灾情数据" v-model="uploadDisasterDataDialogVisable" width="50%">
      <el-form ref="form" :model="addDisasterData" label-width="150px" style="margin-left: auto;margin-right: auto;">
        <el-form-item class="dialogInput" label="上传数据" prop="data">
          <input type="file" @change="handleFileChange" />
        </el-form-item>
        <!-- <el-form-item class="dialogInput" label="省" prop="time">
          <el-input v-model="addDisasterData.province" placeholder="请输入省"></el-input>
        </el-form-item>
        <el-form-item class="dialogInput" label="市" prop="time">
          <el-input v-model="addDisasterData.city" placeholder="请输入市"></el-input>
        </el-form-item>
        <el-form-item class="dialogInput" label="县" prop="time">
          <el-input v-model="addDisasterData.county" placeholder="请输入县"></el-input>
        </el-form-item> -->
        <el-form-item class="dialogInput" label="省市区" prop="time">
          <el-cascader v-model="selectedRegion" :options="pcaTextArr" :props="props" />
        </el-form-item>
        <el-form-item class="dialogInput" label="镇" prop="time">
          <el-input v-model="addDisasterData.town" placeholder="请输入镇"></el-input>
        </el-form-item>
        <el-form-item class="dialogInput" label="村" prop="time">
          <el-input v-model="addDisasterData.village" placeholder="请输入村"></el-input>
        </el-form-item>
        <el-form-item class="dialogInput" label="数据源" prop="time">
          <el-cascader v-model="selectedSource" :options="sourceOptions" :props="props" />
        </el-form-item>
        <el-form-item class="dialogInput" label="日期" prop="time">
          <el-date-picker v-model="addDisasterData.date" type="datetime" placeholder="请选择时间"
            @change="handleDateChange" />
          <!-- format="yyyy-MM-dd HH:mm:ss" -->
          <!-- :value-format="'yyyyMMddHHmmss'" -->
          <!-- value-format="yyyyMMddHHmmss" -->
          <!-- <el-time-picker v-model="addDisasterData.date" value-format="yyyyMMddHHmmss" placeholder="提醒时间" /> -->
        </el-form-item>
        <el-form-item class="dialogInput" label="载体形式" prop="time">
          <el-select v-model="addDisasterData.fileType" placeholder="Select" style="width: 240px">
            <el-option v-for="item in fileType" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="dialogInput" label="灾情编码" prop="time">
          <el-cascader v-model="selectedDisasterType" :options="disasterOptions" :props="props" />
        </el-form-item>
        <el-form-item class="dialogInput" label="描述" prop="time">
          <el-input v-model="addDisasterData.description" :rows="5" maxlength="1000" placeholder="请输入描述" show-word-limit
            type="textarea" />
          <!-- <el-input v-model="addDisasterData.description" placeholder="请输入描述"></el-input> -->
        </el-form-item>

        <!-- <el-form-item class="dialogInput" label="药物名" prop="drugName">
          <el-input v-model="addDrugAlert.drugName" placeholder="请输入药物名"></el-input>
        </el-form-item> -->

        <el-form-item align="center">
          <el-button type="primary" size="small" @click="uploadDisasterDataButton">添加</el-button>
          <el-button type="info" size="small" @click="closeuploadDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage ,ElMessageBox} from 'element-plus';
import instance from '../axios';
import { onMounted, ref, computed } from 'vue';

import { pcaTextArr } from 'element-china-area-data';
import pcas from '@/assets/pcas-code.json';  // 使用 import


// 北京市
// 市辖区
// 东城区
// 景山街道
// 吉祥社区居委会
interface drug {
  drugId: string,
  drugName: string,
  frequency: string,
  unit: string,
  dosage: string,
  isActive: string,
  alertId: string,
  alertTime: string,
  eatTime: string,
  isEat: boolean
}
let drugs = ref<drug[]>();
let drugAlerts = ref([]);
const pageSize = ref(5);
const currentPage = ref(1);
const total = ref(0);
const pageSizeAlert = ref(5);
const currentPageAlert = ref(1);
const totalAlert = ref(0);
const dialogVisible = ref(false);
const conditionValue = ref('');
const addDrugsDialogVisible = ref(false);
const modifyDrug = ref({
  drugName: ref(''),
  frequency: ref(''),
  unit: ref(''),
  dosage: ref(''),
  isActive: ref(''),
  alertTime: ref('')
});
const addDrugAlert = ref({
  drugName: ref(''),
  frequency: ref('每天'),
  unit: ref('毫克'),
  dosage: ref(''),
  isActive: ref(''),
  alertTime: ref('')
});
const drugManageVisible = ref(false)
const loading=ref(true)

function checkIsForget(alertTime: String) {
  console.log(alertTime)
  const eatDate = alertTime.split(':');
  const date = new Date();
  const delHour = date.getHours() - parseInt(eatDate[0])
  const delMinute = date.getMinutes() - parseInt(eatDate[1])
  const delSecond = date.getSeconds() - parseInt(eatDate[2])
  if (delHour > 0)
    return true
  else if (delHour == 0)
    if (delMinute > 0)
      return true
    else if (delMinute == 0)
      if (delSecond > 0)
        return true
  return false
}

const tableRowClassName = ({
  row,
  rowIndex,
}: {
  row: drug
  rowIndex: number
}) => {
  if ((row.isEat === false) && checkIsForget(row.alertTime)) {
    return 'warning-row'
  } else if (row.isEat === true) {
    return 'success-row'
  }
  return ''
}

function showDrugManage() {
  console.log(drugManageVisible.value)
  drugManageVisible.value = !drugManageVisible.value
}

function checkIsEat(eatTime: String) {
  console.log(eatTime)
  const eatDate = eatTime.split('-');
  const date = new Date();
  if (date.getFullYear() - parseInt(eatDate[0]) > 0)
    return false
  if (date.getMonth() + 1 - parseInt(eatDate[1]) > 0)
    return false
  if (date.getDay() + 1 - parseInt(eatDate[2]) > 0)
    return false
  return true
}

async function eatDrugConfirm(row: any) {
  let conf = confirm("是否已经服药？");
  console.log("click")
  console.log(conf)
  if (conf) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDay() + 1;
    row.eatTime = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
    console.log("row.eatTime" + row.eatTime)
    await instance.post("/drugAlert/updateDrugAlertEatTimeById", {
      alertId: row.alertId,
      eatTime: row.eatTime
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } else {
    row.isEat = false;
  }
}

async function searchTotalDrug() {
  await instance.post("/drug/getPageDrugInfoTotalByDrugName", {
    uid: localStorage.getItem("uid"),
    drugName: conditionValue.value
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    console.log(response);
    total.value = response.data.data;
    console.log(total.value);
  });
}

async function searchByPage() {
  console.log("uid:" + localStorage.getItem("uid"))
  searchTotalDrug();
  instance.post("/drug/getPageDrugsInfoByDrugName", {
    uid: localStorage.getItem("uid"),
    curPage: currentPage.value,
    size: pageSize.value,
    drugName: conditionValue.value
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    console.log(response)
    drugs.value = response.data.data;
    if (drugs.value != undefined) {
      for (let i = 0; i < drugs.value.length; ++i) {
        let isEat = checkIsEat(drugs.value[i].eatTime)
        drugs.value[i]["isEat"] = isEat;
      }
    }
  });
}

async function searchTotalDrugAlert() {
  await instance.post("/drug/getPageDrugAlertInfoTotalByDrugName", {
    uid: localStorage.getItem("uid"),
    drugName: conditionValue.value
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    console.log(response);
    totalAlert.value = response.data.data;
    console.log(totalAlert.value);
  });
}

async function searchAlertByPage() {
  console.log("uid:" + localStorage.getItem("uid"))
  searchTotalDrug();
  instance.post("/drug/getPageDrugsAlertInfoByDrugName", {
    uid: localStorage.getItem("uid"),
    curPage: currentPageAlert.value,
    size: pageSizeAlert.value,
    drugName: conditionValue.value
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    console.log(response)
    drugAlerts.value = response.data.data;
  });
}

onMounted(() => {
  // searchTotalDrug();
  // searchByPage();
  // searchTotalDrugAlert();
  // searchAlertByPage();

  fetchData()
});

function searchByCondition() {
  if (!conditionValue.value)
    ElMessage.error('请输入搜索值');
  else {
    searchTotalDrug();
    searchByPage();
  }
}

function clearSearchCondition() {
  conditionValue.value = '';
  searchTotalDrug();
  searchByPage();
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize;
  currentPage.value = 1;
  searchByPage();
}

function handleCurrentChange(newPage: number) {
  currentPage.value = newPage;
  searchByPage();
}

function addDrugAlertsDialog() {
  addDrugsDialogVisible.value = true
}

function closeAddDialog() {
  addDrugsDialogVisible.value = false
}

async function updateIsAvtive(row: { drugId: any; uid: any; isActive: any; }) {
  console.log(row.isActive)
  await instance.post("/drug/updateDrugIsActiveById", {
    drugId: row.drugId,
    uid: localStorage.getItem('uid'),
    isActive: row.isActive
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(() => {
    currentPage.value = 1;
    searchTotalDrug();
    searchByPage();
  }).catch((error) => {
    ElMessage.error(error);
  });
}

async function deleteDrugAlert(row: { alertId: any; drugId: any; }) {
  await instance.post("/drug/deleteDrugAndDrugAlertById", {
    alertId: row.alertId,
    uid: localStorage.getItem("uid"),
    drugId: row.drugId
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(() => {
    ElMessage.success('添加成功');
    currentPage.value = 1;
    currentPageAlert.value = 1;
    searchTotalDrug();
    searchByPage();
    searchTotalDrugAlert();
    searchAlertByPage();
  }).catch((error) => {
    ElMessage.error(error);
  });
}

function handleSizeChangeAlert(newSize: number) {
  pageSizeAlert.value = newSize;
  currentPageAlert.value = 1;
  searchAlertByPage();
}

function handleCurrentChangeAlert(newPage: number) {
  currentPageAlert.value = newPage;
  searchAlertByPage();
}

function searchByConditionAlert() {
  if (!conditionValue.value)
    ElMessage.error('请输入搜索值');
  else {
    searchTotalDrugAlert();
    searchAlertByPage();
  }
}

function clearSearchConditionAlert() {
  conditionValue.value = '';
  searchTotalDrugAlert();
  searchAlertByPage();
}

async function saveDrugAlert() {
  if (addDrugAlert.value.drugName == '') {
    ElMessage.error("药物名不能为空")
  }
  if (addDrugAlert.value.dosage == '') {
    ElMessage.error("剂量不能为空")
  }
  if (addDrugAlert.value.alertTime == '') {
    ElMessage.error("提醒时间不能为空")
  }
  await instance.post("/drug/insertDrugAndAlert", {
    uid: localStorage.getItem("uid"),
    drugName: addDrugAlert.value.drugName,
    frequency: addDrugAlert.value.frequency,
    unit: addDrugAlert.value.unit,
    dosage: addDrugAlert.value.dosage,
    isActive: addDrugAlert.value.isActive,
    alertTime: addDrugAlert.value.alertTime
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(() => {
    ElMessage.success('更新成功');
    if (addDrugAlert.value.isActive == '1') {
      searchTotalDrug()
      searchByPage()
    }
    searchTotalDrugAlert();
    searchAlertByPage();
    addDrugAlert.value = { drugName: '', frequency: '每天', unit: '毫克', dosage: '', isActive: '', alertTime: '' }
    dialogVisible.value = false;
  }).catch((error) => {
    ElMessage.error(error);
  });
  addDrugsDialogVisible.value = false;
}



interface disasterData {
  dataId: string,
  location: string,
  time: string,
  source: string,
  medium: string,
  classify: string,
  tag: string,
  describe: string,
}
let disasterData = ref<disasterData[]>();
const uploadDisasterDataDialogVisable = ref(false)
const addDisasterData = ref({
  province: ref(''),
  city: ref(''),
  county: ref(''),
  town: ref(''),
  village: ref(''),
  date: ref(''),
  source1: ref(''),
  source2: ref(''),
  fileType: ref(''),
  disasterType1: ref(''),
  disasterType2: ref(''),
  disasterType3: ref(''),
  description: ref('')
});
const selectedRegion = ref<any[]>([]);
const selectedSource = ref<any[]>([]);
const selectedDisasterType = ref<any[]>([]);

const props = {
  expandTrigger: 'hover' as const,
}

const sourceOptions = [
  {
    value: '业务报送数据',
    label: '业务报送数据',
    children: [
      {
        value: '前方地震应急指挥部',
        label: '前方地震应急指挥部',
      }, {
        value: '后方地震应急指挥部',
        label: '后方地震应急指挥部',
      }, {
        value: '应急指挥技术系统',
        label: '应急指挥技术系统',
      }, {
        value: '社会服务工程应急救援系统',
        label: '社会服务工程应急救援系统',
      }, {
        value: '危险区预评估工作组',
        label: '危险区预评估工作组',
      }, {
        value: '地震应急指挥技术协调组',
        label: '地震应急指挥技术协调组',
      }, {
        value: '震后政府信息支持工作项目组',
        label: '震后政府信息支持工作项目组',
      }, {
        value: '灾情快速上报接收处理系统',
        label: '灾情快速上报接收处理系统',
      }, {
        value: '地方地震局应急信息服务相关技术系统',
        label: '地方地震局应急信息服务相关技术系统',
      }, {
        value: '其他',
        label: '其他',
      }
    ]
  },
  {
    value: '泛在感知数据',
    label: '泛在感知数据',
    children: [
      {
        value: '互联网感知',
        label: '互联网感知',
      }, {
        value: '通信网感知',
        label: '通信网感知',
      }, {
        value: '舆情网感知',
        label: '舆情网感知',
      }, {
        value: '电力系统感知',
        label: '电力系统感知',
      }, {
        value: '交通系统感知',
        label: '交通系统感知',
      }, {
        value: '其他',
        label: '其他',
      }
    ]
  }, {
    value: '其他数据',
    label: '其他数据',
  }
]

const fileType = [
  {
    value: '文字',
    label: '文字',
  },
  {
    value: '图像',
    label: '图像',
  },
  {
    value: '音频',
    label: '音频',
  },
  {
    value: '视频',
    label: '视频',
  },
  {
    value: '其他',
    label: '其他',
  }
]

const disasterOptions = [
  {
    value: '震情',
    label: '震情',
    children: [
      {
        value: '震情信息',
        label: '震情信息',
        children: [
          {
            value: '地理位置',
            label: '地理位置',
          }, {
            value: '时间',
            label: '时间',
          }, {
            value: '震级',
            label: '震级',
          }, {
            value: '震源深度',
            label: '震源深度',
          }, {
            value: '烈度',
            label: '烈度',
          }
        ]
      }
    ]
  },
  {
    value: '人员伤亡及失踪',
    label: '人员伤亡及失踪',
    children: [
      {
        value: '死亡',
        label: '死亡',
        children: [
          {
            value: '受灾人数',
            label: '受灾人数',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '受伤',
        label: '受伤',
        children: [
          {
            value: '受灾人数',
            label: '受灾人数',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '失踪',
        label: '失踪',
        children: [
          {
            value: '受灾人数',
            label: '受灾人数',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }
    ]
  },
  {
    value: '房屋破坏',
    label: '房屋破坏',
    children: [
      {
        value: '土木',
        label: '土木',
        children: [
          {
            value: '一般损坏面积',
            label: '一般损坏面积',
          }, {
            value: '严重损坏面积',
            label: '严重损坏面积',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '砖木',
        label: '砖木',
        children: [
          {
            value: '一般损坏面积',
            label: '一般损坏面积',
          }, {
            value: '严重损坏面积',
            label: '严重损坏面积',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '砖混',
        label: '砖混',
        children: [
          {
            value: '一般损坏面积',
            label: '一般损坏面积',
          }, {
            value: '严重损坏面积',
            label: '严重损坏面积',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '框架',
        label: '框架',
        children: [
          {
            value: '一般损坏面积',
            label: '一般损坏面积',
          }, {
            value: '严重损坏面积',
            label: '严重损坏面积',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '其他',
        label: '其他',
        children: [
          {
            value: '一般损坏面积',
            label: '一般损坏面积',
          }, {
            value: '严重损坏面积',
            label: '严重损坏面积',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }
    ]
  },
  {
    value: '生命线工程灾情',
    label: '生命线工程灾情',
    children: [
      {
        value: '交通',
        label: '交通',
        children: [
          {
            value: '受灾设施数',
            label: '受灾设施数',
          }, {
            value: '受灾范围',
            label: '受灾范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '供水',
        label: '供水',
        children: [
          {
            value: '受灾设施数',
            label: '受灾设施数',
          }, {
            value: '受灾范围',
            label: '受灾范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '输油',
        label: '输油',
        children: [
          {
            value: '受灾设施数',
            label: '受灾设施数',
          }, {
            value: '受灾范围',
            label: '受灾范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '燃气',
        label: '燃气',
        children: [
          {
            value: '受灾设施数',
            label: '受灾设施数',
          }, {
            value: '受灾范围',
            label: '受灾范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '电力',
        label: '电力',
        children: [
          {
            value: '受灾设施数',
            label: '受灾设施数',
          }, {
            value: '受灾范围',
            label: '受灾范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '通信',
        label: '通信',
        children: [
          {
            value: '受灾设施数',
            label: '受灾设施数',
          }, {
            value: '受灾范围',
            label: '受灾范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '水利',
        label: '水利',
        children: [
          {
            value: '受灾设施数',
            label: '受灾设施数',
          }, {
            value: '受灾范围',
            label: '受灾范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }
    ]
  },
  {
    value: '次生灾害',
    label: '次生灾害',
    children: [
      {
        value: '崩塌',
        label: '崩塌',
        children: [
          {
            value: '灾害损失',
            label: '灾害损失',
          }, {
            value: '灾害范围',
            label: '灾害范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '滑坡',
        label: '滑坡',
        children: [
          {
            value: '灾害损失',
            label: '灾害损失',
          }, {
            value: '灾害范围',
            label: '灾害范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '泥石流',
        label: '泥石流',
        children: [
          {
            value: '灾害损失',
            label: '灾害损失',
          }, {
            value: '灾害范围',
            label: '灾害范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '岩溶塌陷',
        label: '岩溶塌陷',
        children: [
          {
            value: '灾害损失',
            label: '灾害损失',
          }, {
            value: '灾害范围',
            label: '灾害范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '地裂缝',
        label: '地裂缝',
        children: [
          {
            value: '灾害损失',
            label: '灾害损失',
          }, {
            value: '灾害范围',
            label: '灾害范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '地面沉降',
        label: '地面沉降',
        children: [
          {
            value: '灾害损失',
            label: '灾害损失',
          }, {
            value: '灾害范围',
            label: '灾害范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }, {
        value: '其他（沙土液化、火灾、毒气泄露、爆炸、环境污染、瘟疫、海啸等）',
        label: '其他（沙土液化、火灾、毒气泄露、爆炸、环境污染、瘟疫、海啸等）',
        children: [
          {
            value: '灾害损失',
            label: '灾害损失',
          }, {
            value: '灾害范围',
            label: '灾害范围',
          }, {
            value: '受灾程度',
            label: '受灾程度',
          }
        ]
      }
    ]
  }
]

import dayjs from 'dayjs'; // 引入 dayjs 来格式化日期
import moment from 'moment';

const selectedDate = ref<Date | null>(null); // 存储原始的 Date 对象
function handleDateChange(date: Date) {
  // 使用 dayjs 格式化日期
  if (date) {
    addDisasterData.value.date = dayjs(date).format('YYYYMMDDHHmmss');
  }
}

function showUploadDisasterDataDialog() {
  uploadDisasterDataDialogVisable.value = true;
}

async function uploadDisasterData() {
  if (addDrugAlert.value.drugName == '') {
    ElMessage.error("药物名不能为空")
  }
  if (addDrugAlert.value.dosage == '') {
    ElMessage.error("剂量不能为空")
  }
  if (addDrugAlert.value.alertTime == '') {
    ElMessage.error("提醒时间不能为空")
  }
  await instance.post("/drug/insertDrugAndAlert", {
    uid: localStorage.getItem("uid"),
    drugName: addDrugAlert.value.drugName,
    frequency: addDrugAlert.value.frequency,
    unit: addDrugAlert.value.unit,
    dosage: addDrugAlert.value.dosage,
    isActive: addDrugAlert.value.isActive,
    alertTime: addDrugAlert.value.alertTime
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(() => {
    ElMessage.success('更新成功');
    if (addDrugAlert.value.isActive == '1') {
      searchTotalDrug()
      searchByPage()
    }
    searchTotalDrugAlert();
    searchAlertByPage();
    addDrugAlert.value = { drugName: '', frequency: '每天', unit: '毫克', dosage: '', isActive: '', alertTime: '' }
    dialogVisible.value = false;
  }).catch((error) => {
    ElMessage.error(error);
  });
  addDrugsDialogVisible.value = false;
}

let file: File | null = null;
function handleFileChange(event: Event): void {
  const inputElement = event.target as HTMLInputElement; // Type assertion to HTMLInputElement
  if (inputElement.files) {
    file = inputElement.files[0] || null; // Safely handle file selection
  }
}

// AddRecord function to handle the file upload
async function AddRecord(): Promise<void> {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await instance.post('/file/uploadAvatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'token': localStorage.getItem('token') || '', // Type safety for localStorage value
        },
      });

      if (response.data && response.data.data && response.data.data.avatarUrl) {
        const avatarUrl: string = response.data.data.avatarUrl;
      }
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Close the dialog after the process
  uploadDisasterDataDialogVisable.value = false; // Assuming dialogVisble is defined elsewhere
}

async function uploadDisasterDataButton() {
  addDisasterData.value.source1 = selectedSource.value[0]
  addDisasterData.value.source2 = selectedSource.value[1]
  addDisasterData.value.disasterType1 = selectedDisasterType.value[0]
  addDisasterData.value.disasterType2 = selectedDisasterType.value[1]
  addDisasterData.value.disasterType3 = selectedDisasterType.value[2]
  addDisasterData.value.province = selectedRegion.value[0]
  addDisasterData.value.city = selectedRegion.value[1]
  addDisasterData.value.county = selectedRegion.value[2]
  console.log(selectedSource.value)
  console.log(selectedDisasterType.value)
  console.log(addDisasterData.value.province)
  console.log(addDisasterData.value.city)
  console.log(addDisasterData.value.county)
  console.log(addDisasterData.value.town)
  console.log(addDisasterData.value.village)
  console.log(addDisasterData.value.date)
  console.log(addDisasterData.value.source1)
  console.log(addDisasterData.value.source2)
  console.log(addDisasterData.value.fileType)
  console.log(addDisasterData.value.disasterType1)
  console.log(addDisasterData.value.disasterType2)
  console.log(addDisasterData.value.disasterType3)
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('province', addDisasterData.value.province);
    formData.append('city', addDisasterData.value.city);
    formData.append('county', addDisasterData.value.county);
    formData.append('town', addDisasterData.value.town);
    formData.append('village', addDisasterData.value.village);
    formData.append('date', addDisasterData.value.date);
    formData.append('source1', addDisasterData.value.source1);
    formData.append('source2', addDisasterData.value.source2);
    formData.append('fileType', addDisasterData.value.fileType);
    formData.append('disasterType1', addDisasterData.value.disasterType1);
    formData.append('disasterType2', addDisasterData.value.disasterType2);
    formData.append('disasterType3', addDisasterData.value.disasterType3);
    formData.append('description', addDisasterData.value.description);
    await instance.post('/earthquake/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'token': localStorage.getItem('token') || '', // Type safety for localStorage value
      },
    }).catch((error) => {
      ElMessage.error(error);
    })
    info.value.length=0
    fetchData()
  }
  else {
    ElMessage.error('文件不能为空！')
    return;
  }
  // await instance.post("/fuckyou/upload",{
  //   province:addDisasterData.value.province,
  //   city:addDisasterData.value.city,
  //   county:addDisasterData.value.county,
  //   town: addDisasterData.value.town,
  //   village: addDisasterData.value.village,
  //   date: addDisasterData.value.date,
  //   source1: addDisasterData.value.source1,
  //   source2: addDisasterData.value.source2,
  //   fileType: addDisasterData.value.fileType,
  //   disasterType1: addDisasterData.value.disasterType1,
  //   disasterType2: addDisasterData.value.disasterType2,
  //   disasterType3: addDisasterData.value.disasterType3,
  // },{
  //     headers: {
  //     'Content-Type': 'application/json',
  //     'token':localStorage.getItem('token')
  //     },
  // }).catch((error)=>{
  // ElMessage.error(error);
  // })
  uploadDisasterDataDialogVisable.value = false
}

function closeuploadDialog() {
  uploadDisasterDataDialogVisable.value = false
}

// async function AddRecord() {
//   if(file){
//     const formdate=new FormData();
//     formdate.append('file',file)
//     const response=await instance.post("/file/uploadAvatar",formdate,{
//       headers:{
//         'Content-Type':'multipart/form-data',
//         'token':localStorage.getItem("token")
//       },
//     }).catch((error)=>{
//       ElMessage.error(error)
//     })
//     localStorage.setItem('selfAvatarUrl',response.data.data.avatarUrl)
//     personalInfo.value.avatarUrl=response.data.data.avatarUrl
//     EventBus.$emit('changeAvatar',)
//     ipcRenderer.send('saveSelfAvatar',{id:localStorage.getItem("userId"),url:response.data.data.avatarUrl})
//   }
//   await instance.post("/account/update",{
//     userNickName:modifyAccount.value.nickName,
//     sex:modifyAccount.value.sex,
//     personalSignature:modifyAccount.value.personalSignature
//   },{
//       headers: {
//       'Content-Type': 'application/json',
//       'token':localStorage.getItem('token')
//       },
//   }).catch((error)=>{
//   ElMessage.error(error);
//   })
//   dialogVisble.value = false
// }

interface disasterDataResponce {
  dataSource: string,
  date: string,
  description: string,
  diasterCode: string,
  diasterType: string,
  fileType: string,
  id: string,
  location: string,
  url: string
}
const info = ref<disasterDataResponce[]>([]);
// const info=ref([])
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return info.value.slice(start, end)
})
async function fetchData() {
  try {
    loading.value=true;
    const response = await instance.post('/earthquake/getById', {

    }, {
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem('token')
      },
    })
    console.log(response)
    info.value = response.data.data.reverse()
    console.log(info.value)
    for (let i = 0; i < info.value.length; i++) {
      info.value[i].date = formatDate(info.value[i].date);
    }
    loading.value=false
  } catch (error) {
    console.error('获取文章失败', error)
  }
}

// 切换页面
function handlePageSizeChange(pagesize: number) {
  pageSize.value = pagesize
}

// 切换页面
function handlePageChange(page: number) {
  currentPage.value = page
}

function formatDate(str: any) {
  return moment(str, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss');
}

async function deleteDiasterData(id: any) {
  try {
    ElMessageBox.confirm(
      '您确定要删除吗？', // 提示内容
      'delete', // 弹窗标题
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info', // 设置弹窗的类型，可以是 info/warning/error
        customClass: 'my-custom-message-box' // 添加自定义类
      }
    ).then(async () => {
      const response = await instance.post('/earthquake/delete', {
        id: id
      }, {
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token')
        },
      })
      for (let i = 0; i < info.value.length; i++) {
        if(info.value[i].id==id){
          info.value.splice(i, 1);
        } 
      }
      currentPage.value = 1
    })


  } catch (error) {
    console.error('删除失败', error)
  }
}
</script>

<style>
.tital {
  text-align: center;
}

.card {
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
  width: 90%;
  min-height: 80%;
}

.table {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.tableButton {
  width: 30%;
  height: 30%;
}

.paging {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.searchConditionDiv {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
}

.selectCon {
  width: 10%;
}

.conditionInput {
  width: 20%;
  margin-left: 10px;
  margin-top: auto;
  margin-bottom: auto;
}

.el-input.el-input--small.conditionInput {
  width: 20%;
  height: 40px;
  margin-left: 10px;
  margin-right: 10px;
}

.dialogInput {
  width: 70%;
}

.eatDrugConfirmDialog {
  display: flex;
  margin-left: auto;
  margin-right: auto;
}

.drugAlertBtn {
  margin-top: auto;
  margin-bottom: auto;
}

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.my-custom-message-box .el-message-box__btns {
  display: flex;
}

.my-custom-message-box .el-button {
  /* background-color: #009688 !important; */
  width: 40%;
}

.my-custom-message-box .el-button--primary {
  /* background-color: #009688 !important; */
  margin-left: auto;
  width: 40%;
}
</style>