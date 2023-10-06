<template>
  <div class="content">
    <transition mode="out-in">
      <div ref="onLineAnswer" class="onLineAnswer">
        <div class="answer_header">
          <div>
            <span class="bigFontSize">智能客服</span>
            <span class="smallFontSize">聆听您的每一次需求</span>
          </div>
          <div>
            <Minus class="smallIcon" style="margin-right: 10px" @click="state.show = !state.show" />
          </div>
        </div>
        <div class="answer_body smallFontSize" @scroll="bodyScroll">
          <div class="answer_body_history">
            <el-button v-if="!state.showHistory" type="text" @click="showHistory()">点击查看历史咨询记录</el-button>
            <!--  需要进行长度判断 -->
            <div
                v-if="state.showHistory && !state.hasMore"
                class="answer_body_history_message"
                v-loading="state.showHistoryLoading"
                :element-loading-spinner="Loading"
            >
              {{ state.msg }}
            </div>
            <el-button v-if="state.showHistory && state.hasMore" type="text" size="small" @click="showHistory()"> 加载更多~ </el-button>
          </div>
          <div v-if="state.historyList && state.historyList.length > 0">
            <div v-for="item in state.historyList" :key="item">
              <div>
                <div v-if="item.type == '0'" class="answer_body_list_right">
                  <span class="answer_body_list_question">{{ item.replayContent }}</span>
                </div>
                <div v-else class="answer_body_list_left">
                  <img v-if="item.icon" src="../../../assets/robot.png" class="answer_icon" />
                  <div v-if="!Array.isArray(item.replayContent)" class="flex">
                    <div class="answer_body_list_answer answer">
                      <div v-if="item.typeName == 'image'">
                        <el-image
                            style="width: 100px; height: 100px; margin-right: 10px"
                            v-for="(imageItem, index) in item.replayContent.split(',')"
                            :key="imageItem"
                            :src="imageItem"
                            :initial-index="index"
                            :preview-src-list="item.replayContent.split(',')"
                        ></el-image>
                      </div>
                      <div class="fileItem" v-else-if="item.typeName == 'file'">
                        <el-button
                            @click="downLoadFile(fileItem)"
                            v-for="fileItem in item.replayContent.split(',')"
                            :key="fileItem"
                            type="text"
                            primary
                        >{{ fileItem.split('@')[1] }}
                        </el-button>
                      </div>
                      <div v-else-if="item.typeName == 'video'">
                        <video
                            id="video"
                            @click="autoFullScreen"
                            :src="item.replayContent"
                            :autoplay="true"
                            controls
                            preload
                            style="width: 300px; height: 200px"
                        ></video>
                      </div>
                      <el-link v-else-if="item.typeName == 'link'" :href="item.replayContent" target="_blank">
                        {{ item.replayContent }}
                      </el-link>
                      <!-- 后续处理一下文件,图片 -->
                      <div class="richText" v-else-if="item.typeName == 'richText'" v-html="item.replayContent"></div>
                      <span v-else>{{ item.replayContent }}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; margin-left: 8px" v-if="item.showIcon">
                      <f-svg v-if="!item.commend" class="smallIcon" name="commend" @click="commend(true, item)"></f-svg>
                      <f-svg v-if="!item.uncommend" class="smallIcon" name="uncommend" @click="commend(false, item)"></f-svg>
                    </div>
                  </div>
                  <div v-if="Array.isArray(item.replayContent)" class="answer_body_list_answer">
                    <div style="display: flex">
                      <div style="padding: 12px 10px; border-right: 1px solid #ccc; line-height: 20px">猜您<br />想问</div>
                      <div>
                        <div
                            class="answer_body_list_list"
                            v-for="replayItem in item.replayContent"
                            :key="replayItem"
                            @click="addQuestion(replayItem)"
                        >
                          <div>{{ replayItem.questionContent }}</div>
                          <div>
                            <ArrowRight style="width: 14px; height: 14px" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="answer_footer">
          <el-input ref="answerReplay" v-model="state.question" @keydown.enter="sendQuestion" maxlength="255"></el-input>
          <el-button :disabled="!state.question" color="#626aef" size="small" style="margin-left: 10px" @click="sendQuestion">发送 </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
// const onLineAnswer: any = ref(null);
// const answerReplay: any = ref(null);
// const noAnswer = '该问题暂无搜索到相应回答，抱歉~';
// const commendMsg = '谢谢您给我的赞，我会继续努力。';
// const uncommendMsg = '抱歉，给您带来不好的体验，我会继续学习，下次为您提供更好的服务。';
// const replayType = {
//   label: '文本',
//   richText: '富文本',
//   file: '文件',
//   image: '图片',
//   link: '链接',
// };
const state = reactive({
  showHistory: false,
  hasMore: true,
  historyList: [] as any[]
})
</script>

<style scoped lang="scss">
:deep(.el-button + .el-button) {
  margin-left: 0px !important;
}

//.onLineService {
//  position: absolute;
//  bottom: 50px;
//  right: 30px;
//  z-index: 999999;
//  cursor: move;
//  .onLineServiceImg {
//    position: fixed;
//    right: 15px;
//    width: 40px;
//    height: 40px;
//  }
//}

.bigFontSize {
  margin: 0 10px;
  font-size: 20px;
  font-weight: 900;
}

.smallFontSize {
  font-size: 13px;
}

.smallIcon {
  width: 16px;
  height: 16px;
  cursor: pointer;
  background: #fff;
  padding: 1px;
  margin-bottom: 2px;
  border-radius: 50%;
}

.onLineAnswer {
  width: 100%;
  height: 100%;
  margin: 10px;
  z-index: 999999;
  border: 1px solid #cccccc;
  border-radius: 10px;

  .answer_header {
    height: 40px;
    background: #fff;
    border-bottom: 1px solid #cccccc;
    border-radius: 10px 10px 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .answer_body {
    width: 100%;
    height: calc(100% - 40px - 60px);
    background: #f7f8fa;
    padding: 0 20px;
    overflow: auto;

    .answer_body_history {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .answer_body_history_message {
        margin-top: 10px;
        padding: 5px;
        border-radius: 10px;
        background: #eff0f2;
      }
    }

    .answer_body_list_left,
    .answer_body_list_right {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 10px;
      border-radius: 10px;
      word-break: break-all;
    }

    .answer_body_list_left {
      justify-content: flex-start;
    }

    .answer_body_list_right {
      justify-content: flex-end;
    }

    .flex {
      display: flex;
      align-items: flex-end;
    }

    .answer {
      padding: 12px;
    }

    .answer_body_list_answer {
      background: #f2f3f7;
      border-radius: 15px;

      .answer_body_list_list {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: v-bind(bodyWidth);
        padding: 12px 12px 5px;
        border-bottom: 1px solid #e6e7eb;
        cursor: pointer;

        &:hover {
          background: #e9e9ed;
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .answer_body_list_question {
      align-items: center;
      background: #fff;
      padding: 10px;
    }
  }

  .answer_footer {
    height: 60px;
    width: 100%;
    background: #f2f3f7;
    display: flex;
    align-items: center;
    padding: 0 20px;
  }
}

.answer_icon {
  width: 25px;
  height: 25px;
  cursor: pointer;
  margin-right: 10px;
}

.fileItem {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

:deep(.richText) {
  table {
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
  }

  table td,
  table th {
    border-bottom: 1px solid #ccc;
    border-right: 1px solid #ccc;
    padding: 3px 5px;
  }

  table th {
    border-bottom: 2px solid #ccc;
    text-align: center;
  }
}
</style>