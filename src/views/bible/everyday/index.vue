<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="诗节标题" prop="verse">
        <el-input v-model="queryParams.verse" placeholder="请输入经文诗节标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="经文日期" style="width: 308px">
        <el-date-picker v-model="daterangeBibleDate" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['bible:everyday:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['bible:everyday:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['bible:everyday:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['bible:everyday:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Upload" @click="handleImport"
          v-hasPermi="['bible:everyday:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" @click="autovisible = true" icon="CirclePlusFilled"
          v-hasPermi="['bible:everyday:autogenerate']">自动生成</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="everydayList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="素材ID" align="center" prop="id" />
      <el-table-column label="诗节标题" align="center" prop="verse" />
      <el-table-column label="经文诗节内容" align="center" prop="verseContent" />
      <el-table-column label="历史今日事件" align="center" prop="historyTodayEvents" />
      <el-table-column label="发布时间" align="center" prop="bibleDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.bibleDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['bible:everyday:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['bible:everyday:remove']">删除</el-button>
          <el-button link type="primary" icon="View" v-hasPermi="['bible:everyday:view']">预览</el-button>
          <el-tooltip class="box-item" effect="dark" content="复制ID" placement="top-start"><el-button link type="primary"
              icon="CopyDocument" @click="copyId(scope.row.id)" v-if="false" /></el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />
    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
              @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 添加或修改每日圣经对话框 -->
    <el-dialog :title="title" v-model="open" width="650px" append-to-body>
      <el-form ref="everydayRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="诗节标题" prop="verse">
          <el-input v-model="form.verse" placeholder="请输入经文诗节标题" />
        </el-form-item>
        <el-form-item label="诗节内容">
          <el-input v-model="form.verseContent" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="发布时间" prop="bibleDate">
          <el-date-picker clearable v-model="form.bibleDate" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择经文日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="历史事件" prop="historyTodayEvents">
          <el-input v-model="form.historyTodayEvents" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 自动生成对话框 -->
    <el-dialog v-model="autovisible" title="自动生成页面" width="500" align-center draggable="true">
      <div class="block">
        <span class="demonstration">请选择日期</span>
        <hr />
        <el-date-picker v-model="selectAutoDate" type="dates" placeholder="选择需要生成的日期" format="YYYY-MM-DD"
          value-format="YYYY-MM-DD" />
      </div>
      <span>最多选择七天，否则无法生成</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="autovisible = false">取消</el-button>
          <el-button type="primary" @click="handleAutoGenerate" v-loading.fullscreen.lock="fullscreenLoading"
            element-loading-text="温馨提示：正在自动生成">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Everyday">
import { listEveryday, getEveryday, delEveryday, addEveryday, updateEveryday, autoGenerateApi } from "@/api/bible/everyday";
import { ElMessage } from 'element-plus';
const { proxy } = getCurrentInstance();

const everydayList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeBibleDate = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    verse: null,
    bibleDate: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询每日圣经列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeBibleDate && '' != daterangeBibleDate) {
    queryParams.value.params["beginBibleDate"] = daterangeBibleDate.value[0];
    queryParams.value.params["endBibleDate"] = daterangeBibleDate.value[1];
  }
  listEveryday(queryParams.value).then(response => {
    everydayList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    verse: null,
    verseContent: null,
    bibleDate: null,
    historyTodayEvents: null
  };
  proxy.resetForm("everydayRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeBibleDate.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加每日圣经";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getEveryday(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改每日圣经";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["everydayRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateEveryday(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addEveryday(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除每日圣经编号为"' + _ids + '"的数据项？').then(function () {
    return delEveryday(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('bible/everyday/export', {
    ...queryParams.value
  }, `everyday_${new Date().getTime()}.xlsx`)
}
/**
 * 批量导入
 */
import { getToken } from "@/utils/auth";
import { ref } from "vue";
/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/bible/everyday/importData"
});

/** 导入按钮操作 */
function handleImport() {
  upload.title = "用户导入";
  upload.open = true;
};
/** 下载模板操作 */
function importTemplate() {
  proxy.download("bible/everyday/importTemplate", {
  }, `Bible_template_${new Date().getTime()}.xlsx`);
};
/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
};

/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};

//选择的日期
const selectAutoDate = ref();
/* 自动生成handleAutoGenerate按钮操作*/
const autovisible = ref(false);

/**全屏加载条 */
const fullscreenLoading = ref(false)
async function handleAutoGenerate() {
  console.log(selectAutoDate.value);
  fullscreenLoading.value = true;
  //查询的日期集合
  let params = {
    bibleDateList: selectAutoDate.value
  }
  try {
    await autoGenerateApi(selectAutoDate.value).then(response => {
      if (response.code === 200) {
        ElMessage({
          message: response.msg,
          type: "success",
        });
      } else {
        ElMessage({
          message: response.msg,
          type: "error",
        });
      }
    })
  } catch (error) {
    ElMessage({
      message: '操作失败，请稍后再试',
      type: "error",
    });
  } finally {
    fullscreenLoading.value = false; // 关闭 loading
    autovisible.value = false;
    // dialogAutoFormVisible.value = false;
    getList();
  }
}
/**复制Id */
// function copyId(id) {
//   console.log(id);
//   const clipboard = new Clipboard('.copy-btn', {
//     text: () => id,
//   });

//   clipboard.on('success', () => {
//     ElMessage.success('ID 复制成功！');
//     clipboard.destroy();
//   });

//   clipboard.on('error', () => {
//     ElMessage.error('ID 复制失败，请手动复制。');
//     clipboard.destroy();
//   });
// };
getList();
</script>
<style scoped>
.demo-date-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}

.demo-date-picker .block {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
}
</style>
