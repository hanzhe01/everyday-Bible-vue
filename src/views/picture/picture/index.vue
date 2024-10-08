<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" v-if="false">
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['picture:picture:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['picture:picture:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['picture:picture:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['picture:picture:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="pictureList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="上传时间" align="center" prop="uploadTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.uploadTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片名字" align="center" prop="imgName" />
      <el-table-column label="背景图片" align="center" prop="picture" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.picture" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="是否启用" align="center" prop="isBg">
        <template #default="{ row }">
          <el-tag effect="dark" v-if="row.isBg === '启用'">{{ row.isBg }}</el-tag>
          <el-tag effect="dark" v-if="row.isBg === '禁用'" type="danger">{{ row.isBg }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['picture:picture:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['picture:picture:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改背景图片对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="pictureRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="图片名字" prop="imgName">
          <el-input v-model="form.imgName" placeholder="请输入图片名字" />
        </el-form-item>
        <el-form-item label="背景图片" prop="picture">
          <image-upload v-model="form.picture" />
        </el-form-item>
        <el-form-item label="是否启用" prop="isBg">
          <el-switch v-model="form.isBg" active-text="启用" inactive-text="禁用" active-value="启用" inactive-value="禁用" />
          <!-- <el-input v-model="form.isBg" placeholder="请输入是否启用" /> -->
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Picture">
import { listPicture, getPicture, delPicture, addPicture, updatePicture } from "@/api/picture/picture";

const { proxy } = getCurrentInstance();

const pictureList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询背景图片列表 */
function getList() {
  loading.value = true;
  listPicture(queryParams.value).then(response => {
    pictureList.value = response.rows;
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
    uploadTime: null,
    imgName: null,
    picture: null,
    isBg: null
  };
  proxy.resetForm("pictureRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
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
  title.value = "添加背景图片";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPicture(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改背景图片";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["pictureRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePicture(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPicture(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除背景图片编号为"' + _ids + '"的数据项？').then(function () {
    return delPicture(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('picture/picture/export', {
    ...queryParams.value
  }, `picture_${new Date().getTime()}.xlsx`)
}

getList();
</script>
