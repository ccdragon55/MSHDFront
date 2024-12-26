<template>
  <div>
    <section class="hero">
      <!-- <h1>致力于您的健康</h1>
      <p>我们提供优质的医疗健康服务，关爱每一个人</p> -->
      <h1>致力于高效灾情数据管理</h1>
      <p style="width: 80%;margin-left: auto;margin-right: auto;">本项目是国家震情应急管理系统的一部分，针对震后灾情获取缓慢且碎片化，
针对公众涉灾信息数据异构、多维、数据格式差异大、部分数据维度缺失导致的
数据无法得到综合利用的现状，研究基于异构公众涉灾信息，进行一体化编码，
利用开放接口技术和实时动态管理技术，对灾情信息进行管理，实现必要的可视
化。实现灾情数据统一管理和高效合理利用。</p>
      <!-- <a href="#">了解更多</a> -->
    </section>

    <section class="services">
      <div class="service">
        <img src="/home/b.webp" alt="记录血压">
        <!-- <h3>全科医生服务</h3>
        <p>我们的全科医生为您提供全面的健康咨询和治疗服务，关注您的整体健康。</p> -->
        <h3>数据可视化</h3>
        <p>可视化展示各种灾情数据，数据分析更便捷。</p>
      </div>
      <div class="service">
        <img src="/home/a.webp" alt="专科诊疗">
        <!-- <h3>专科诊疗</h3>
        <p>我们的专科医生团队为您提供精确的诊断和贴心的治疗，确保最佳的服务质量。</p> -->
        <h3>数据管理</h3>
        <p>向系统提供各种灾情数据，促进数据共享与使用。</p>
      </div>
      <div class="service">
        <img src="/home/c.webp" alt="健康体检">
        <!-- <h3>健康体检</h3>
        <p>定期健康体检让您时刻了解自己的健康状况，预防潜在疾病，保证身体健康。</p> -->
        <h3>灾情资讯</h3>
        <p>了解各地最新灾情消息。</p>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">

</script>

<style>
body {
  background-image: url('/back.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.hero {
  color: white;
  text-align: center;
  padding: 80px 0;
}

.hero h1 {
  margin: 0;
  font-size: 36px;
}

.hero p {
  margin: 20px 0;
  font-size: 20px;
}

.hero a {
  display: inline-block;
  padding: 10px 20px;
  background-color: #1ea5a5;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.services {
  display: flex;
  background-color: transparent;
  justify-content: space-around;
  margin: 20px 0;
  padding: 20px;
  position: relative;
}

.service {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 30%;
}

.service img {
  width: 100%;
  border-radius: 5px;
}

.service h3 {
  margin-top: 15px;
  font-size: 20px;
  text-align: center;
}

.service p {
  margin-top: 10px;
  font-size: 16px;
}

</style>