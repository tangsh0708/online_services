import request from '/@/utils/request';

// 在线客服问答列表查询
export function getOnlineServiceList(data: any) {
	return request({
		url: '/cloud-chat/question-list/listQuestion',
		method: 'post',
		data,
	});
}

// 在线客服添加问题
export function addQuestion(data: any) {
	return request({
		url: '/cloud-chat/question-list/addQuestion',
		method: 'post',
		data,
	});
}

// 在线客服根据问题获取回答
export function queryQuestion(question: string, sysId: string) {
	return request({
		url: '/cloud-chat/question-list/queryQuestion',
		method: 'get',
		params: {
			question,
			sysId,
		},
	});
}

// 获取所有系统
export function getAllAppList(params: any) {
	return request({
		url: '/cloud-admin/sys/app/getAllList',
		method: 'get',
		params,
	});
}

// 删除问题接口
export function deleteQuestionById(id: string) {
	return request({
		url: '/cloud-chat/question-list/deleteQuestionById',
		method: 'delete',
		params: {
			id,
		},
	});
}

export function deleteQuestionByIds(ids: string) {
	return request({
		url: '/cloud-chat/question-list/deleteQuestionByIds',
		method: 'delete',
		params: {
			ids,
		},
	});
}

export function updateQuestion(data: any) {
	return request({
		url: '/cloud-chat/question-list/updateQuestion',
		method: 'put',
		data,
	});
}

// 添加回复
export function addReplay(data: any) {
	return request({
		url: '/cloud-chat/replay-list/addReplay',
		method: 'post',
		data,
	});
}

// 根据问题id查询回复
export function selectReplayById(questionId: string) {
	return request({
		url: '/cloud-chat/replay-list/selectReplayById',
		method: 'get',
		params: {
			questionId,
		},
	});
}

// 添加聊天记录
export function addChat(data: any) {
	return request({
		url: '/cloud-chat/chat-list/addChat',
		method: 'post',
		data,
	});
}

export function listChat(data: any) {
	return request({
		url: '/cloud-chat/chat-list/listChat',
		method: 'post',
		data,
	});
}

// 修改回复
export function updateReplay(data: any) {
	return request({
		url: '/cloud-chat/replay-list/updateReplay',
		method: 'put',
		data,
	});
}

// 点赞/踩
export function addScore(isGood: boolean, replayId: string | undefined) {
	return request({
		url: '/cloud-chat/replay-score-list/addScore',
		method: 'post',
		params: {
			isGood,
			replayId,
		},
	});
}
