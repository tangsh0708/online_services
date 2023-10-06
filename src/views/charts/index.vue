<template>
  <div class="charts">
    <pc class="charts_info"></pc>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive} from "vue";
import pc from './component/pc.vue';
import { isMobile } from "/@/utils/other";
import Mobile from "/@/views/login/component/mobile.vue";

const state = reactive({
  type: false
})
onMounted(() => {
  state.type = isMobile()
})
</script>

<style scoped lang="scss">
.charts {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  .charts_info {
    width: 100%;
    flex-direction: column;
    flex: 1;
  }
}
</style>