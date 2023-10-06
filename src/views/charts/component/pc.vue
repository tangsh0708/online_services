<template>
  <div class="content">
    <transition mode="out-in">
      <div ref="onLineAnswer" class="onLineAnswer">
        <div class="answer_header" v-if="!isMobile()">
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
import { Loading, ArrowRight, Minus } from '@element-plus/icons-vue';
import { addChat, addScore, listChat, queryQuestion, selectReplayById } from '/@/api/onlineService';
import { historyVo, tableVo, replayVo } from '/@/interface/sysMenu';
import { Session } from '/@/utils/storage';
import { myDownLoad } from '/@/utils/fileEditFileNameAndUpload';
import { useDraggable, useWindowSize } from '@vueuse/core';
import onlineService from '/@/assets/onlineService.png';
import { isMobile } from "/@/utils/other";

const onLineAnswer: any = ref(null);
const answerReplay: any = ref(null);
const noQuestion = '您刚才的话，小柏没有理解。请您用一句话来描述您的问题～';
const noAnswer = '该问题暂无搜索到相应回答，抱歉~';
const commendMsg = '谢谢您给我的赞，我会继续努力。';
const uncommendMsg = '抱歉，给您带来不好的体验，我会继续学习，下次为您提供更好的服务。';
const replayType = {
  label: '文本',
  richText: '富文本',
  file: '文件',
  image: '图片',
  link: '链接',
};
const { width, height } = useWindowSize();
const onLineService = ref<HTMLElement | null>(null);
console.log(isMobile(), 'test')
let { style } = useDraggable(onLineService, {
  initialValue: { x: width - 80, y: height - 80 },
  axis: 'y',
});

const state = reactive({
  show: false,
  showHistory: false,
  historyList: [] as historyVo[],
  question: '',
  msg: '到底啦,您暂无更多历史消息',
  showHistoryLoading: false,
  nowCount: 0,
  totalCount: 0,
  hasMore: true,
  listQuery: {
    pageSize: 10,
    pageNum: 1,
    sysId: Session.get('sysType') ?? 'ef4a09bc786b424cb0635e41b37b1daa',
  },
});
// 声明dom节点，后续用于打开后页面直接在最底部
let answerBody: any = null;
// 页面宽度
const bodyWidth = computed(() => {
  if (onLineAnswer.value) {
    const width = onLineAnswer.value.offsetWidth * 0.4;
    return width + 'px';
  } else {
    return 0 + 'px';
  }
});
const showHistory = () => {
  state.showHistory = true;
  if (state.hasMore) {
    getHistoryList();
  }
};
// 插入历史数据
const getHistoryList = async () => {
  const { status, data } = await listChat(state.listQuery);
  if (status) {
    state.listQuery.pageNum++;
    state.nowCount += data.records.length;
    state.totalCount = data.total;
    state.hasMore = state.nowCount < state.totalCount;
    data.records.forEach((item: any) => {
      state.historyList.unshift({
        type: item.type,
        replayContent: tryParseFun(item.recordContent) ? JSON.parse(item.recordContent) : item.recordContent,
        typeName: item.recordType,
      });
    });
  }
};
// 判断JSON格式
const tryParseFun = (str: string) => {
  if (typeof str == 'string') {
    try {
      const arr = JSON.parse(str);
      return Array.isArray(arr);
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
};
// 保持页面在最底部的方法
const scrollToBottom = () => {
  answerBody = document.getElementsByClassName('answer_body')[0];
  nextTick(() => {
    answerBody.scrollTo(0, answerBody.scrollHeight);
  });
};
// 获取回答
const getAnswerList = async () => {
  const { status, data } = await queryQuestion(state.question, state.listQuery.sysId);
  if (status) {
    if (data) {
      // 没有回复
      if (data.length == 0) {
        setTimeout(() => {
          state.historyList.push({
            type: '1',
            replayContent: noQuestion,
            typeName: 'label',
            icon: true,
          });
          addHistory(null, 'label', replayType['label'], noQuestion, '1');
        }, 10);
      } else if (data.length == 1) {
        state.historyList.push({
          type: '1',
          replayContent: `猜您想问： ${data[0].questionContent}`,
          typeName: 'label',
        });
        getReplay(data[0].id);
      } else {
        state.historyList.push({ type: '1', replayContent: data, typeName: 'label' });
        addHistory(null, 'label', replayType['label'], JSON.stringify(data), '1');
      }
    }
    state.question = '';
    setTimeout(() => {
      scrollToBottom();
      answerReplay.value.focus();
    }, 20);
  }
};
// 模拟发送问题
const sendQuestion = () => {
  if (state.question) {
    state.historyList.push({ type: '0', replayContent: state.question });
    addHistory(null, 'label', replayType['label'], state.question, '0');
    scrollToBottom();
    getAnswerList();
  } else {
    return;
  }
};

// 当返回条数为一条时，查询回复
const getReplay = async (id: string) => {
  const { status, data } = await selectReplayById(id);
  if (status) {
    if (data) {
      state.historyList.push({
        type: '1',
        replayContent: data.replayContent,
        typeName: data.replayType,
        replayId: data.id,
        showIcon: true,
      });
      addHistory(null, data.replayType, replayType[data.replayType], data.replayContent, '1');
    } else {
      state.historyList.push({ type: '1', replayContent: noAnswer, typeName: 'label', icon: true });
      addHistory(null, 'label', replayType['label'], noAnswer, '1');
    }
    scrollToBottom();
  }
};
const addQuestion = (question: tableVo) => {
  state.question = question.questionContent;
  state.historyList.push({ type: '0', replayContent: state.question });
  addHistory(null, 'label', replayType['label'], state.question, '0');
  state.question = '';
  scrollToBottom();
  getReplay(question.id);
};
// 打开弹框
const showDialogBox = () => {
  state.show = true;
  nextTick(() => {
    scrollToBottom();
  });
};
// 页面滚动获取历史数据（分页）
const bodyScroll = (e: any) => {
  if (e.target.scrollTop == 0) {
    if (state.hasMore) {
      showHistory();
    }
  }
};
// 点赞/踩
const commend = async (type: boolean, value: historyVo) => {
  if (!value.uncommend && !value.commend) {
    type ? (value.uncommend = true) : (value.commend = true);
    state.historyList.push({ type: '1', replayContent: type ? commendMsg : uncommendMsg, typeName: 'label' });
    scrollToBottom();
    await addScore(type, value.replayId);
  }
};

// 统一处理传参
const addHistory = (recordId: string | null, recordType: string, recordTypeName: string, recordContent: string, type: string) => {
  const newData = {
    type: type,
    recordId: recordId,
    recordType: recordType,
    recordTypeName: recordTypeName,
    recordContent: recordContent,
  };
  addChatHistory(newData);
};
// 添加聊天记录
const addChatHistory = async (val: replayVo) => {
  const addData = {
    ...val,
    sysId: 'ef4a09bc786b424cb0635e41b37b1daa',
    userId: Session.get('full_token').userId,
  };
  const { status } = await addChat(addData);
  if (status) {
    console.log('success');
  }
};
const downLoadFile = (fileItem: string) => {
  myDownLoad(fileItem.split('@')[0], fileItem.split('@')[1]);
};
// 初始化时显示提示信息
onMounted(() => {
  state.historyList.push({ type: '1', replayContent: '亲，请问您遇到了什么问题，您可以简短描述~', icon: true });
});
</script>

<style scoped lang="scss">
:deep(.el-button + .el-button) {
  margin-left: 0px !important;
}

.content {
  width: 100%;
  display: flex;
  flex-direction: column;
}
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
  width: calc(100% - 20px);
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 10px;
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
    display: flex;
    flex: 1;
    flex-direction: column;
    background: #f7f8fa;
    padding: 0 20px;
    overflow: auto;

    .answer_body_history {
      width: 100%;
      display: flex;
      height: 40px;
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