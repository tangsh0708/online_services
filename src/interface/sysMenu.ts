export interface sysMenuVo {
	id: string;
	name: string;
	sysSimpleName: string;
}

export interface tableVo {
	id: string;
	questionContent: string;
	questionInfo: string;
	questionType: string;
	questionTypeName: string;
	sysId: string;
}

export interface answerSubmitVo {
	id?: string;
	questionId?: string;
	replayType?: string;
	replayTypeName?: string;
	replayContent?: string;
}

export interface dictVo {
	id: string;
	label: string;
	value: string;
}

export interface fileVo {
	fileId?: string;
	url: string;
	path: string;
	name?: string;
	size?: string;
	uid?: string;
}

export interface replayVo {
	type: string;
	recordId: string | null;
	recordType: string;
	recordTypeName: string;
	recordContent: string;
}

export interface historyVo {
	type: string;
	replayContent: string | object;
	typeName?: string;
	icon?: boolean;
	replayId?: string;
	showIcon?: boolean;
	commend?: boolean;
	uncommend?: boolean;
}

export interface activityTableVo {
	id?: string | undefined;
	activityName: string;
	activityStartDateTime: string;
	activityEndDateTime: string;
	activityDesc: string;
	activityCoverImg: string;
	activityAddress: string;
	activityImgs: string;
	pmId: string;
	pmName: string;
	pushToWxFlag: string;
	enterType: string;
	activityPhone: string;
}

export interface myProjectVo {
	proName: string;
	proId: string;
}
