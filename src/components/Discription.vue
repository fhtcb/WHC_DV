<template>
  <div class="description-container" v-if="selectedSite">
    <div class="site-header">
      <h2 class="site-name">{{ selectedSite.name_en }}</h2>
      <div class="site-meta">
        <el-tag :type="selectedSite.danger === 1 ? 'danger' : 'success'" effect="dark">
          {{ selectedSite.danger === 1 ? '濒危' : '安全' }}
        </el-tag>
        <el-tag type="warning" effect="dark">{{ selectedSite.category_short }}</el-tag>
        <el-tag type="info" effect="dark">{{ selectedSite.region_en }}</el-tag>
      </div>
    </div>

    <div class="site-details">
      <div class="detail-section">
        <h3>基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">编号：</span>
            <span class="value">{{ selectedSite.id_no }}</span>
          </div>
          <div class="info-item">
            <span class="label">面积：</span>
            <span class="value">{{ formatArea(selectedSite.area_hectares) }} 公顷</span>
          </div>
          <div class="info-item">
            <span class="label">入选时间：</span>
            <span class="value">{{ selectedSite.date_inscribed }}</span>
          </div>
          <div class="info-item">
            <span class="label">所属国家：</span>
            <span class="value clickable" @click="filterByCountry">
              {{ selectedSite.states_name_en }}
              <el-tag 
                v-if="props.filter.states_name_en" 
                size="small" 
                type="info" 
                class="ml-2" 
                closable 
                @close="clearCountryFilter"
              >
                已筛选
              </el-tag>
            </span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>遗产类别</h3>
        <div class="categories-grid">
          <div v-for="(value, key) in getActiveCategories(selectedSite)" :key="key"
               class="category-item active">
            {{ key }}
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>简介</h3>
        <div class="description-text" v-html="formatText(selectedSite.short_description_en)"></div>
      </div>

      <div class="detail-section" v-if="selectedSite.justification_en">
        <h3>入选理由</h3>
        <div class="description-text" v-html="formatText(selectedSite.justification_en)"></div>
      </div>
    </div>
  </div>
  <div v-else class="empty-state">
    <el-empty description="请在地图上选择一个遗产地" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:filter']);

// 计算选中的遗产
const selectedSite = computed(() => {
  if (!props.filter?.id_no || !props.data?.length) {
    return null;
  }
  return props.data.find(site => site.id_no === props.filter.id_no) || null;
});

// 格式化面积
const formatArea = (area) => {
  if (!area) return '未知';
  return new Intl.NumberFormat('zh-CN').format(Math.round(area));
};

// 在 script setup 部分替换 getCategoryDetails 函数
const categoryLabels = {
  'C1': '人类创造力的杰作',
  'C2': '人类价值观的交流',
  'C3': '文明/文化的见证',
  'C4': '建筑/技术的典范',
  'C5': '人类与环境互动',
  'C6': '重要传统的关联',
  'N7': '自然现象/美景',
  'N8': '地球演化历史',
  'N9': '生态系统进程',
  'N10': '生物多样性保护'
};

const getActiveCategories = (site) => {
  if (!site) return {};
  
  const activeCategories = {};
  Object.entries({
    'C1': site.C1,
    'C2': site.C2,
    'C3': site.C3,
    'C4': site.C4,
    'C5': site.C5,
    'C6': site.C6,
    'N7': site.N7,
    'N8': site.N8,
    'N9': site.N9,
    'N10': site.N10
  }).forEach(([key, value]) => {
    if (value === 1) {
      activeCategories[categoryLabels[key]] = 1;
    }
  });
  
  return activeCategories;
};

// 监听数据变化
watch(() => props.filter?.id_no, (newId) => {
  console.log('ID changed:', newId);
}, { immediate: true });

watch(() => props.data, (newData) => {
  console.log('Data changed:', newData?.length);
}, { immediate: true, deep: true });

// 在 script setup 中添加清理文本的函数
const formatText = (text) => {
  if (!text) return '';
  
  return text
    // 保留段落标签，移除其他HTML标签
    .replace(/<p>(.*?)<\/p>/g, '$1\n')  // 将<p>标签内容提取出来并加上换行
    .replace(/<\/?[^>]+(>|$)/g, '')     // 移除其他HTML标签
    .replace(/&nbsp;/g, ' ')            // 替换HTML空格
    .replace(/&amp;/g, '&')             // 替换&
    .replace(/&lt;/g, '<')              // 替换<
    .replace(/&gt;/g, '>')              // 替换>
    .replace(/&quot;/g, '"')            // 替换"
    .replace(/&#39;/g, "'")             // 替换'
    .split('\n')                        // 按换行符分割
    .filter(para => para.trim())        // 移除空段落
    .map(para => `<p>${para.trim()}</p>`) // 为每个段落添加p标签
    .join('');                          // 合并所有段落
};

// 添加按国家筛选的功能
const filterByCountry = () => {
  if (!selectedSite.value) return;
  
  // 获取当前选中的国家
  const country = selectedSite.value.states_name_en;
  
  // 创建新的筛选条件，保留当前选中的遗产地，清空其他筛选
  const newFilter = {
    id_no: props.filter.id_no, // 保留当前选中的遗产地
    region: [],
    category: '',
    detail_category: Array(10).fill(0),
    timeRange: [],
    time: '',
    states_name_en: country
  };
  
  // 发出更新事件
  emit('update:filter', newFilter);
};

// 清除国家筛选
const clearCountryFilter = (event) => {
  if (event) {
    event.stopPropagation(); // 阻止事件冒泡
  }
  // 创建新的筛选条件，保留当前选中的遗产地，清空其他筛选
  const newFilter = {
    id_no: props.filter.id_no, // 保留当前选中的遗产地
    region: [],
    category: '',
    detail_category: Array(10).fill(0),
    timeRange: [],
    time: '',
    states_name_en: ''
  };
  emit('update:filter', newFilter);
};

</script>

<style scoped>
.description-container {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  color: #e0e0e0;
  background: rgba(15, 20, 40, 0.7);
}

.site-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.site-name {
  margin: 0 0 16px 0;
  color: #fff;
  font-size: 24px;
}

.site-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.site-meta .el-tag {
  padding: 4px 8px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #909399;
  margin-right: 8px;
  font-size: 14px;
}

.info-item .value {
  color: #e0e0e0;
  font-size: 14px;
}

.categories-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.category-item {
  padding: 6px 12px;
  border-radius: 4px;
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  font-size: 13px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  white-space: nowrap;
}

.description-text {
  line-height: 1.6;
  color: #e0e0e0;
  font-size: 14px;
  text-align: justify;
}

.description-text p {
  margin: 0 0 12px 0;
}

.description-text p:last-child {
  margin-bottom: 0;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.clickable {
  color: #409EFF;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.clickable:hover {
  color: #66b1ff;
}

.ml-2 {
  margin-left: 8px;
}

/* 确保标签的关闭按钮可以正常点击 */
:deep(.el-tag__close) {
  color: #fff;
  background-color: transparent;
}

:deep(.el-tag__close:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>