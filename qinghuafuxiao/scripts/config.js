/* 考试模式 */
var ExamCategory = {
    ec_Normal: 'ec_Normal', // 列表
    ec_Outline: 'ec_Outline', // 大纲
    ec_StudyTask: 'ec_StudyTask', // 学习计划
    ec_Random: 'ec_Random', // 随机组卷
    ec_Comment: 'ec_Comment' // 讲评试卷
};

/* 考试类型 */
var ExamType = {
    et_Exam: 'et_Exam', // 考试模式
    et_Practise: 'et_Practise', // 练习模式
    et_ListenAll: 'et_ListenAll', // 听力
    et_ListenDialog: 'et_ListenDialog', // 听对话回答问题
    et_ListenPassage: 'et_ListenPassage', // 听短文回答问题
    et_SpeakAll: 'et_SpeakAll', // 口语
    et_SpeakRead: 'et_SpeakRead', // 朗读短文
    et_SpeakResponse: 'et_SpeakResponse', // 情景反应
    et_SpeakTopic: 'et_SpeakTopic' // 话题表述
};

/* 当前配置 */
var config = {
    ExamType: "et_Exam",
    CanNextOrPrev: "4",//4表示不可以跳题
    ExamCategory: "none",
    SectionRoot: "Scripts/action/",
    //ExamFont: "fonts/monaco/monaco.css",
    ExamFont:"",
    //ExamCss: "support/none.css",
    ExamCss: "",
    DefaultCss:"support/default.css"
};

BuildLibrary.loadCSS(config.DefaultCss);
BuildLibrary.loadCSS(config.ExamFont);
BuildLibrary.loadCSS(config.ExamCss);