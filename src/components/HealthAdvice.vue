<template>
  <div style="display: flex;width: auto;height: auto;">
    <!-- 文章列表部分 -->
    <div style="width: 70%;height: auto; padding-left: 50px;">
      <div class="article-list-container">
        <el-row :gutter="20" class="article-list">
          <el-col v-for="article in paginatedArticles" :key="article.id" :span="24">
            <el-card shadow="hover" class="article-item">
              <div class="article-content-wrapper" @click="viewArticle(article)">
                <div style="display: flex;width: 100%;height: auto;">
                  <img :src="article.image" alt="Article Image" class="article-image" />
                </div>

                <div class="article-content">
                  <h3>{{ article.title }}</h3>
                  <p>{{ article.description }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-pagination
          v-model="currentPage"
          :page-size="pageSize"
          :total="articles.length"
          layout="prev, pager, next"
          @current-change="handlePageChange"
          background
          hide-on-single-page
          class="pagination"
        />

        <el-dialog v-model="dialogVisible" width="80%" title="一言详情" append-to-body>
          <div v-if="selectedArticle">
            <h2 style="text-align: center">{{ selectedArticle.title }}</h2>

            <div style="display: flex;width: 100%;height: auto;">
              <img :src="selectedArticle.image" alt="Article Image" class="dialog-article-image" />
            </div>
            <p class="indented-text">{{ selectedArticle.content }}</p>
          </div>
        </el-dialog>
      </div>
    </div>

    <!-- AI问答部分（右侧侧边栏） -->
    <div v-show="isSidebarVisible" class="chat-container">
      <h2 style="text-align: center;">灾情AI助手</h2>
      <div class="messages">
        <div v-for="(message, index) in messages" :key="index" class="message">
          <div class="message-content" :class="message.from === 'user' ? 'user' : 'ai'">
            <p>{{ message.text }}</p>
          </div>
        </div>
      </div>

      <div class="input-container">
        <input v-model="userMessage" @keyup.enter="sendMessage" placeholder="请输入消息..." />
        <button style="margin: 0;" @click="sendMessage">发送</button>
      </div>
    </div>

    <!-- 侧边栏切换按钮 -->
    <div class="sidebar-toggle" @click="toggleSidebar">
      <div style="padding-top: 13px;">AI助手</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import instance from '../axios'
import axios from 'axios'

interface Article {
  id: number
  title: string
  description: string
  image: string
  content: string
}

const articles = ref<Article[]>([]) // 文章数据数组
const currentPage = ref(1) // 当前页码
const pageSize = 5 // 每页显示的文章数
const dialogVisible = ref(false) // 控制弹窗的可见性
const selectedArticle = ref<Article | null>(null) // 选中的文章

// 计算当前页显示的文章
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return articles.value.slice(start, end)
})

// 获取文章列表数据
async function fetchArticles() {
  try {
    const response = await instance.get('/articles')
    articles.value = response.data.reverse()
  } catch (error) {
    console.error('获取文章失败', error)
  }
}

// 在组件挂载时调用API获取数据
onMounted(() => {
  fetchArticles()
})

// 切换页面
function handlePageChange(page: number) {
  currentPage.value = page
}

// 查看文章详情，弹出弹窗
function viewArticle(article: Article) {
  console.log('Article selected:', article) // 调试输出
  selectedArticle.value = article
  dialogVisible.value = true
  console.log('Dialog visible:', dialogVisible.value) // 调试输出
}

interface AiInfo {
  from: string
  text: string
}

const userMessage = ref('');
const messages = ref<AiInfo[]>([]);

// 控制AI助手侧边栏的显示与隐藏
const isSidebarVisible = ref(false);

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
}

const sendMessage = async () => {
  if (userMessage.value.trim()) {
    // 将用户消息添加到消息列表
    messages.value.push({ from: 'user', text: userMessage.value });

    try {
      // 调用后端接口来获取 AI 的回应
      const response = await axios.post('http://10.29.86.126:8088/chat', {
        message: userMessage.value,
      });
      messages.value.push({ from: 'ai', text: response.data.reply });
      userMessage.value = '';

      // 将 AI 的回复添加到消息列表
    } catch (error) {
      console.error("Error:", error);
      messages.value.push({ from: 'ai', text: "抱歉，出现了问题，请稍后再试。" });
    }

    // 清空输入框
  }
};
</script>

<style scoped>

.article-list-container {
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
  padding: 30px;
  background-color: transparent;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.article-list {
  margin-top: 20px;
}

.article-item {
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  margin-bottom: 20px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.article-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.article-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.article-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  margin-left: auto;
  margin-right: auto;
}

.article-content {
  padding: 15px;
  flex: 1;
}

h3 {
  font-size: 22px;
  margin-bottom: 10px;
  color: #333;
}

p {
  color: #777;
  font-size: 16px;
  line-height: 1.6;
}

.pagination {
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  text-align: center;
  background-color: transparent;
}

.dialog-article-image {
  width: 40%;
  height: auto;
  object-fit: cover;
  margin-top: 10px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
  border-radius: 10px;
}

.indented-text {
  text-indent: 2em;
  text-align: center;
}

/* AI助手部分 */
.chat-container {
  position: fixed;
  right: 0;
  top: 50px;
  width: 350px;
  height: 600px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: -2px 2px 10px rgba(0, 0, 0, 0.1);
}

.messages {
  height: 490px;
  max-height: 490px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.message {
  margin: 10px 0;
}

.message-content {
  padding: 10px;
  border-radius: 5px;
  max-width: 80%;
}

.message-content.user {
  background-color: #cce5ff;
  margin-left: auto;
}

.message-content.ai {
  background-color: #e9ecef;
}

.input-container {
  display: flex;
  justify-content: space-between;
}

input {
  width: 80%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

button {
  width: 15%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

/* 侧边栏切换按钮 */
.sidebar-toggle {
  height: 45px;
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 15px 15px;
  border-radius: 50%;
  cursor: pointer;
}

.sidebar-toggle:hover {
  background-color: #0056b3;
}
</style>
