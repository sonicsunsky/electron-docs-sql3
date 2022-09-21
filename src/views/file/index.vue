<template>
  <div class="container">
    <el-button class="btn-back" type="primary" round @click="goBack"
      >返回上一页</el-button
    >

    <div class="search">
      <el-input v-model="keyword" placeholder="请输入姓名查询" clearable>
        <template #prepend>
          <el-button :icon="Search" />
        </template>
        <template #append>
          <el-button type="primary" @click="searchFiles">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="sex" label="性别" width="180" />
      <el-table-column prop="birthday" label="出生年月" />
      <el-table-column prop="candidate_type" label="考生类别" />
      <el-table-column prop="identity_num" label="身份证号" />
      <el-table-column prop="company_name" label="单位名称" />
      <el-table-column prop="company_type" label="单位性质" />
      <el-table-column prop="contract_time" label="签约时间" />
      <!-- <el-table-column label="编辑操作">
        <template #default="scope">
          <el-button @click="handleEditDoc(scope.$index, scope.row)"
            >编辑</el-button
          >
        </template>
      </el-table-column> -->
    </el-table>

    <div class="page">
      <el-pagination
        v-model:currentPage="currentPage"
        v-model:page-size="pageSize"
        background
        layout="prev, pager, next"
        :total="allData.length"
        @current-change="handleCurrentChange"
      />
    </div>

    <div class="date">
      <div class="label">Excel导出日期范围:</div>
      <el-date-picker
        v-model="exportDate"
        type="daterange"
        range-separator="到"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="x"
        @change="onDateChange"
      />
    </div>

    <el-button class="btn-export" type="primary" @click="exportExcel"
      >导出Excel文档</el-button
    >

    <div v-if="isAdmin" class="files">
      <el-upload
        ref="dragFileRef"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xls,.xlsx"
        :on-exceed="onFileExceed"
        :on-change="onFileChange"
        :on-remove="onFileRemove"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖放到此处或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">文件大小不超过50M</div>
        </template>
      </el-upload>

      <el-button class="btn-import" type="primary" @click="parseExcel"
        >导入Excel文档</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled, Search, Plus } from "@element-plus/icons-vue";

import FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { useRouter } from "vue-router";

import db from "@/better-sql3";

const router = useRouter();

const keyword = ref("");
const exportDate = ref("");
const tableData = ref([]);
const dragFileRef = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);
const allData = ref([]);

let fileRaw = null;
let importExcelData = [];

const start = computed(() => (currentPage.value - 1) * pageSize.value);
const end = computed(() => start.value + pageSize.value);

const isAdmin = computed(
  () => JSON.parse(localStorage.getItem("login")).user === "admin"
);

onMounted(() => {});

const handleCurrentChange = (val) => {
  console.log(`current page: ${val}`);
  tableData.value = allData.value.slice(start.value, end.value);
};

const searchFiles = () => {
  currentPage.value = 1;
  const stmt = db.prepare(`SELECT * FROM doc WHERE name like ?`);
  const res = stmt.all(`%${keyword.value.trim()}%`);
  allData.value = [...res];
  tableData.value = allData.value.slice(start.value, end.value);
  console.log("searchFiles: ", tableData.value);
};

const onDateChange = (val) => {
  console.log("onDateChange: ", val);
};

// const handleEditDoc = (index, row) => {
//   console.log(index, row);
// };

const exportExcel = () => {
  if (exportDate.value === "") {
    ElMessage({
      message: "请先选择导出的日期范围",
      type: "warning",
    });
    return;
  }

  if (tableData.value.length === 0) {
    ElMessage({
      message: "暂无数据导出",
      type: "warning",
    });
    return;
  }

  const startDate = exportDate.value[0];
  const endDate = exportDate.value[1];

  const stmt = db.prepare(
    `SELECT id,name,sex,birthday,candidate_type,identity_num,company_name,company_type,contract_time,createdAt FROM doc WHERE createdAt between ? and ?`
  );
  const res = stmt.all([startDate, endDate]);

  console.log("exportExcel: ", res);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(res);
  XLSX.utils.book_append_sheet(wb, ws);

  XLSX.utils.sheet_add_aoa(
    ws,
    [
      [
        "id",
        "name",
        "sex",
        "birthday",
        "candidate_type",
        "identity_num",
        "company_name",
        "company_type",
        "contract_time",
        "createdAt",
      ],
      // [
      //   "姓名",
      //   "性别",
      //   "出生年月",
      //   "考生类别",
      //   "身份证号",
      //   "单位名称",
      //   "单位性质",
      //   "签约时间",
      //   "创建时间",
      // ],
    ],
    {
      origin: "A1",
    }
  );

  /* calculate column width */
  const max_width = res.reduce((w, r) => {
    console.log(w, r);
    return Math.max(w, r.name.length);
  }, 10);
  ws["!cols"] = [{ wch: max_width }];

  const user = JSON.parse(localStorage.getItem("login")).user;
  const wbout = XLSX.writeFile(wb, `Excel导出数据-${user}.xlsx`);

  // try {
  //   FileSaver.saveAs(
  //     new Blob([wbout], { type: "application/octet-stream" }),
  //     "导出数据.xlsx"
  //   );
  // } catch (e) {
  //   if (typeof console !== "undefined") console.log(e, wbout);
  // }
};

const checkImportData = () => {
  const stmt = db.prepare(`SELECT * FROM doc`);
  const res = stmt.all();
  const noRepeatData = importExcelData.filter((item) => {
    const allDocIds = res.map((el) => el.id);
    return !allDocIds.includes(item.id);
  });

  console.log("checkImportData: ", noRepeatData);

  if (noRepeatData.length > 0) {
    insertImportData(noRepeatData);
  } else {
    ElMessage({
      message: "导入重复数据",
      type: "warning",
    });
  }
};

const insertImportData = async (data) => {
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO doc(name,sex,birthday,candidate_type,identity_num,company_name,company_type,contract_time,createdAt) VALUES (?,?,?,?,?,?,?,?,?)`
  );

  //创建循环插入语句
  const insertMany = db.transaction((list) => {
    for (const item of list) {
      console.log(Object.values(item));
      stmt.run(Object.values(item));
    }
  });

  insertMany(data);

  ElMessage({
    message: "导入Excel数据成功",
    type: "success",
  });
  searchFiles();
};

const parseExcel = () => {
  if (!fileRaw) {
    ElMessage({
      message: "请先选择要导入的Excel文档",
      type: "warning",
    });
    return;
  }

  const fileReader = new FileReader();
  fileReader.readAsBinaryString(fileRaw); //readAsArrayBuffer
  fileReader.onload = (ev) => {
    // console.log("onload: ", ev);
    try {
      const data = ev.target.result;
      const workbook = XLSX.read(data, {
        type: "binary",
      });
      const wsname = workbook.SheetNames[0]; //取第一张表
      const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); //生成json表格内容
      importExcelData = ws;
      checkImportData();
    } catch (e) {
      return false;
    }
  };
};

const onFileChange = (file, files) => {
  console.log(file);
  fileRaw = file.raw;
};

const onFileRemove = (file, files) => {
  console.log(file);
};

const onFileExceed = (files, uploadFiles) => {
  console.log(files, uploadFiles);
  ElMessage({
    message: "每次解析处理一个Excel文件",
    type: "warning",
  });
};

const goBack = () => {
  router.go(-1);
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
