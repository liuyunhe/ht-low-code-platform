export const basicComponents = [
  //单行文本
  {
    ctrlType: 'input',
    name: '',
    desc: '单行文本',
    icon: 'icon-single',
    options: {
      width: '100%',
      isWidth: true,
      defaultValue: '',
      isCountDate: false,
      mathExp: '',
      isStartDate: '',
      isEndDate: '',
      countFormat: 'day',
      dataType: 'string|number',
      validateList: [],
      validate: '',
      validateType:
        'confirmed|email|regex|min|max|min_value|max_value|isAfter|isBefore|isStart|isEnd|numeric|between|is|digits|mobile|required|row_unique|alpha_spaces|alpha_dash|alpha_num|alpha|frontJSValidate|backendValidate',
      advancedProperty: 'isInputEdit|isBindIdentity|inputType|bindPreAndSufFix',
      placeholder: '',
      disabled: false,
      basicsProperty: 'input|dateCount|placeholder',
      bindIdentityjson: {}, //流水号对象
      isBindPreAndSufFix: false,
      bindPreAndSufFixjson: {preFix: '', sufSix: ''},
      formulasDiyJs: '',
      showCondition: {target: '', fieldPath: '', value: ''}
    }
  },
  //多行文本
  {
    ctrlType: 'textarea',
    name: '',
    desc: '多行文本',
    icon: 'icon-textarea',
    options: {
      width: '100%',
      isWidth: true,
      defaultValue: '',
      dataType: 'string|text',
      validateList: [],
      validateType:
        'regex|min|max|required|row_unique|frontJSValidate|backendValidate',
      advancedProperty: 'isEditor|isInputEdit',
      disabled: false,
      placeholder: '',
      basicsProperty: 'placeholder',
      formulasDiyJs: ''
    }
  },
  //属性文本
  {
    ctrlType: 'property-text',
    name: '',
    desc: '属性文本',
    icon: 'icon-textarea',
    options: {
      width: '100%',
      defaultValue: '',
      dataType: 'string|text',
      validateList: [],
      validateType:
        'regex|min|max|required|row_unique|frontJSValidate|backendValidate',
      disabled: false,
      placeholder: '',
      basicsProperty: 'property-text',
      advancedProperty: 'isEditor',
      textValue: '',
      formulasDiyJs: '',
      textAlign: 'left'
    }
  },
  //数字
  {
    ctrlType: 'number',
    name: '',
    desc: '数字',
    icon: 'icon-number',
    options: {
      width: '100%',
      isWidth: true,
      defaultValue: 0,
      validateType:
        'min_value|max_value|confirmed|numeric|between|digits|required|row_unique|frontJSValidate|mobile',
      validateList: [],
      dataType: 'number',
      filterthousandBit: '',
      filtercurrency: '',
      min: 0,
      max: 99999,
      step: 1,
      decimalDigits: 2,
      maxDecimalDigits: 0,
      mathExp: '',
      disabled: false,
      controlsPosition: '',
      advancedProperty: 'inputType|bindPreAndSufFix',
      basicsProperty: 'number|currency|placeholder|dateCount',
      company: '', //扩展单位配置项,
      formulasDiyJs: '',
      bindPreAndSufFixjson: {preFix: '', sufSix: ''}
    }
  },
  //货币
  {
    ctrlType: 'currency',
    name: '',
    desc: '货币',
    icon: 'icon-currency',
    options: {
      width: '100%',
      isWidth: true,
      required: false,
      dataType: 'number',
      defaultValue: 0,
      filterthousandBit: '',
      filtercurrency: '',
      min: 1,
      max: 99999,
      step: 1,
      decimalDigits: 0,
      maxDecimalDigits: 0,
      disabled: false,
      controlsPosition: '',
      mathExp: '',
      advancedProperty: 'currencyControl',
      basicsProperty: 'currency|placeholder',
      formulasDiyJs: '',
      validateType:
        'min_value|max_value|confirmed|numeric|between|digits|required|row_unique|frontJSValidate',
      validateList: []
    }
  },
  //单选框
  {
    ctrlType: 'radio',
    name: '',
    desc: '单选框',
    icon: 'icon-radio-active',
    options: {
      inline: false,
      defaultValue: '',
      dataType: 'string|number',
      showLabel: false,
      validateType: 'required|row_unique|frontJSValidate',
      validateList: [],
      validate: '',
      options: [],
      required: false,
      width: '',
      remote: false,
      remoteOptions: [],
      props: {
        value: 'value',
        label: 'label'
      },
      remoteFunc: '',
      disabled: false,
      advancedProperty: 'isVertical|choiceType', //高级属性
      choiceType: 'static', //默认固定值
      customQuery: {}, //动态值对象
      bind: [], //绑定的返回值
      linkage: [], //联动校验表达式
      formulasDiyJs: ''
    }
  },
  //多选框
  {
    ctrlType: 'checkbox',
    name: '',
    desc: '多选框',
    icon: 'icon-check-box',
    options: {
      inline: false,
      dataType: 'string|number',
      defaultValue: [],
      showLabel: false,
      validateType: 'required|row_unique|frontJSValidate',
      validateList: [],
      validate: '',
      options: [],
      required: false,
      width: '',
      remote: false,
      remoteOptions: [],
      props: {
        value: 'value',
        label: 'label'
      },
      remoteFunc: '',
      disabled: false,
      advancedProperty: 'isVertical|choiceType', //高级属性
      choiceType: 'static', //默认固定值
      customQuery: {}, //动态值对象
      bind: [], //绑定的返回值
      linkage: [], //联动校验表达式
      formulasDiyJs: ''
    }
  },
  //日期
  {
    ctrlType: 'date',
    name: '',
    desc: '日期',
    icon: 'icon-date',
    options: {
      width: '100%',
      isWidth: true,
      defaultValue: '',
      readonly: false,
      disabled: false,
      dataType: 'date',
      editable: true,
      clearable: true,
      placeholder: '',
      startPlaceholder: '',
      validateType:
        'isAfter|isBefore|isStart|isEnd|required|row_unique|frontJSValidate',
      validateList: [],
      validate: '',
      endPlaceholder: '',
      type: 'date',
      inputFormat: 'yyyy-MM-dd',
      timestamp: false,
      required: false,
      basicsProperty: 'date|placeholder',
      bindPreAndSufFixjson: {preFix: '', sufSix: ''},
      advancedProperty: 'bindPreAndSufFix',
      formulasDiyJs: ''
    }
  },
  //时间
  {
    ctrlType: 'time',
    name: '',
    desc: '时间',
    icon: 'icon-time',
    options: {
      width: '100%',
      isWidth: true,
      defaultValue: '21:19:56',
      readonly: false,
      dataType: 'date',
      disabled: false,
      editable: true,
      clearable: true,
      placeholder: '',
      startPlaceholder: '',
      type: 'select', //选择器格式
      endPlaceholder: '',
      isRange: false,
      arrowControl: true,
      format: 'HH:mm:ss',
      inputFormat: 'HH:mm:ss',
      required: false,
      basicsProperty: 'time',
      formulasDiyJs: '',
      validateList: [],
      validate: '',
      validateType: 'required'
    }
  },
  //选择器
  {
    ctrlType: 'selector',
    name: '',
    desc: '选择器',
    icon: 'icon-user',
    options: {
      width: '100%',
      isWidth: true,
      defaultValue: '',
      validateType: 'required|row_unique|frontJSValidate',
      validateList: [],
      validate: '',
      required: false,
      dataType: 'string',
      pattern: '',
      placeholder: '',
      disabled: false,
      selector: {type: {alias: 'eip-user-selector'}}, //选择器对象
      bind: [
        {
          alias: 'eip-user-selector',
          key: 'id',
          value: '用户ID'
        },
        {
          alias: 'eip-user-selector',
          key: 'account',
          value: '用户账号'
        },
        {
          alias: 'eip-user-selector',
          key: 'fullname',
          value: '用户姓名'
        },
        {
          alias: 'eip-user-selector',
          key: 'mobile',
          value: '用户手机'
        },
        {
          alias: 'eip-user-selector',
          key: 'email',
          value: '用户邮箱'
        }
      ],
      basicsProperty: 'selector'
    }
  },
  //业务条线对话框,支持追加功能
  {
    ctrlType: 'business-dialog',
    name: '',
    desc: '条线对话框',
    icon: 'icon-dialog',
    placeholder: '',
    options:{
      validate:'',
      defaultValue:'',
      customDialogjson:{
        name:'请选择',
        icon:'',
        selfTitle:'选择业务条线',
        alias:'',//管理端对话框的别名
        openHistory:true, //是否启用历史追加功能
        id:'',//id字段的路径
        selectType:'single' //选择类型：单选：single,多选：multiple
      }
    }
  },
  //对话框
  {
    ctrlType: 'dialog',
    name: '',
    desc: '对话框',
    icon: 'icon-dialog',
    placeholder: '',
    options: {
      validateType: 'required|row_unique|frontJSValidate',
      validateList: [],
      validate: '',
      defaultType: 'String',
      basicsProperty: 'custDialog|placeholder',
      expandAll: 'true', //默认展开所有的树形节点
      expandAllTreeNode: true, //默认展开所有的树形节点
      customDialogjson: {
        name: '请选择',
        icon: '',
        custDialog: {
          selectNum: '',
          conditions: [],
          mappingConf: [], //返回映射字段
          custQueryJson: []
        },
        resultField: [], //返回字段,
        //字段链接,可以映射到多个字段
        customLink: {
          selectTypeField: '',
          linkFieldName:'',//字段名而已
          linkFieldPath: '', //链接字段,将关联到的字段路径
          commonTmp: '', //通用的链接
          useCommon: false,
          linkingConf: [
            // {
            // field:"",//从返回数据中的字段取出一个值
            // value:"",//字段的值
            // linkTmp:"" //映射的路径模板(核心,占位符在此使用)
            // }
          ]
        },
        defineTitleText:"",//可以自定义对话框的title,而不是使用默认的title
        //唯一标识字段
        uniqueField:{
          target:'', //对应取值的字段路径
          targetName:'',//字段名，不是路径
          from:'',  //真实名称
          field:'' //返回字段字段名
        },
      },
      useCustomLink: false, //控制对话框链接
      openDialogNotes: false, //对话框说明
      dialogNotesContent: '', //说明内容
      saveHistory:false, //对话框支持已经选中的历史数据不可改动,
      openHistoryScript:false,
      selfHistoryScript:''
    }
  },
  //下拉框
  {
    ctrlType: 'select',
    name: '',
    desc: '下拉框',
    isMultiple: false,
    icon: 'icon-select',
    options: {
      width: '100%',
      isWidth: true,
      defaultValue: '',
      multiple: false,
      disabled: false,
      clearable: false,
      placeholder: '',
      required: false,
      showLabel: false,
      validateType: 'required|row_unique|frontJSValidate',
      validateList: [],
      dataType: 'string|number',
      validate: '',
      options: [],
      remote: false,
      filterable: false,
      allowCreate: false,
      remoteOptions: [],
      props: {
        value: 'value',
        label: 'label'
      },
      remoteFunc: '',
      basicsProperty: 'selectConfig|choiceType|placeholder',
      choiceType: 'static', //默认固定值
      customQuery: {
        custQueryJson: [],
        valueBind: '',
        labelBind: '',
        conditionfield: []
      }, //动态值对象
      bind: [], //绑定的返回值
      linkage: [], //联动校验表达式
      formulasDiyJs: ''
    }
  },
  //下拉树
  {
    ctrlType: 'dropdown',
    name: '',
    desc: '下拉树',
    icon: 'icon-dropdown-tree',
    isMultiple: false,
    options: {
      defaultValue: '',
      multiple: false,
      disabled: false,
      clearable: false,
      placeholder: '',
      required: false,
      showLabel: false,
      validateType: 'required|row_unique|frontJSValidate',
      validateList: [],
      validate: '',
      width: '',
      options: [],
      remote: false,
      filterable: false,
      allowCreate: false,
      cascade: true,
      dataType: 'string|number',
      remoteOptions: [],
      props: {
        value: 'value',
        label: 'label'
      },
      remoteFunc: '',
      basicsProperty: 'selectConfig|choiceType|placeholder',
      choiceType: 'dynamic', //默认固定值
      customQuery: {
        custQueryJson: [],
        valueBind: '',
        labelBind: '',
        conditionfield: []
      }, //动态值对象
      bind: [], //绑定的返回值
      formulasDiyJs: ''
    }
  },
  //附件
  {
    ctrlType: 'attachment',
    name: '',
    desc: '附件',
    icon: 'icon-attachment',
    options: {
      width: '100%',
      validateType: 'required',
      validateList: [],
      validate: '',
      defaultValue: '',
      required: false,
      dataType: 'string',
      pattern: '',
      placeholder: '',
      disabled: false,
      basicsProperty: 'fileupload',
      propConf: [
        {name: 'prop1'},
        {name: 'prop2'},
        {name: 'prop3'},
        {name: 'prop4'},
        {name: 'prop5'},
        {name: 'prop6'}
      ], //附件扩展属性配置
      file: {
        multiple: true,
        simplicity: true,
        limit: '5',
        acceptType: 'any',
        acceptStr: '',
        size: '50',
        allowDownload: false,
        allowPreview: true,
        accept: [
          'jpg',
          'jpeg',
          'png',
          'bmp',
          'pdf',
          'JPG',
          'JPEG',
          'PNG',
          'BMP',
          'PDF',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'ppt',
          'pptx',
          'rtf',
          'txt',
          'zip',
          'rar',
          'vsd',
          'dwg',
          'mp4',
          'avi',
          '3gp',
          'rmvb',
          'rm',
          'wmv'
        ]
      } //文件上传对象
    }
  },
  //开关
  {
    ctrlType: 'switch',
    name: '',
    desc: '开关',
    icon: 'icon-switch',
    options: {
      defaultValue: 'true',
      activeValue: 'true',
      inactiveValue: 'false',
      activeText: '',
      inactiveText: '',
      disabled: true,
      validateType: 'required',
      validateList: [],
      validate: '',
      dataType: 'string|number',
      formulasDiyJs: ''
    }
  },
  //数据字典
  {
    ctrlType: 'dic',
    name: '',
    desc: '数据字典',
    icon: 'icon-dic',
    options: {
      defaultValue: '',
      basicsProperty: 'dicConfig',
      bind: [], //绑定
      dic: '', //字典别名
      filterable: false, //字典是否可搜索
      placeholder: '',
      validateList: [],
      validate: '',
      validateType: 'required',
      dataType: 'string'
    }
  },
  //标签
  {
    ctrlType: 'tag',
    name: '',
    desc: '标签',
    icon: 'el-icon-news',
    options: {
      dataType: 'string',
      defaultValue: [],
      lableColor: '',
      basicsProperty: 'tagConfig',
      bind: [], //绑定
      tag: '', //标签别名
      filterable: false, //标签是否可搜索
      placeholder: '请选择',
      expand: false
    },
    isMultiple: true
  },
  //图片
  {
    ctrlType: 'imageViewer',
    name: '',
    desc: '图片',
    icon: 'icon-image',
    options: {
      defaultValue: [],
      size: {},
      isDisplay: false,
      uploadType: 'local',
      fileJson: '',
      tokenFunc: 'funcGetToken',
      basicsProperty: 'imageViewer',
      validateType: 'required',
      validateList: [],
      validate: '',
      file: {
        multiple: true,
        limit: '3',
        allowDownload: false,
        allowPreview: true
      }
    }
  },
  //高德地图
  {
    ctrlType: 'amap',
    name: '',
    desc: '高德地图',
    icon: 'icon-landmark',
    options: {
      width: '100%',
      defaultValue: '',
      addressMap: '',
      addressName: '',
      dataType: 'varchar',
      noBindModel: true,
      placeholder: '',
      heightMap: '350'
    }
  },
  //相关流程
  {
    ctrlType: 'related-process',
    name: '',
    desc: '相关流程',
    icon: 'icon-flow2',
    options: {
      defaultType: 'String',
      basicsProperty: 'isPaging',
      isPaging: true, //是否分页
      pageSize: 10 //默认分页大小
    }
  },
  //输入建议
  {
    ctrlType: 'autocomplete',
    name: '',
    desc: '输入建议',
    icon: 'icon-autocomplete',
    options: {
      dataType: 'string|number',
      validateType:
        'confirmed|email|regex|min|max|min_value|max_value|isAfter|isBefore|isStart|isEnd|numeric|between|is|digits|mobile|required|row_unique|alpha_spaces|alpha_dash|alpha_num|alpha|frontJSValidate',
      placeholder: '',
      defaultValue: '',
      validateList: [],
      disabled: false,
      validate: '',
      required: false,
      width: '100%',
      basicsProperty: 'selectConfig|choiceType', //高级属性
      choiceType: 'static', //默认固定值
      customQuery: {}, //动态值对象
      bind: [], //绑定的返回值
      options: []
    }
  },
  //签章
  {
    ctrlType: 'signature',
    name: '',
    desc: '签章',
    icon: 'icon-authorization',
    options: {
      required: false,
      validateType: 'required|row_unique|frontJSValidate',
      validateList: [],
      validate: '',
      defaultValue: [],
      width: '',
      maxPeople: 10
    }
  },
]

export const advanceComponents = [
  //按钮
  {
    ctrlType: 'button',
    tableName: '',
    boDefAlias: '',
    name: '',
    desc: '按钮',
    icon: 'icon-button',
    options: {
      noBindModel: false,
      defaultType: 'String',
      basicsProperty: 'onetextBtn',
      // lyzcw:添加按钮类别属性 2022-2-10
      bindEventjson: {
        name: '选择',
        icon: '',
        isShowInput: true,
        btnType: 'primary',
        autoClick:false, //控制按钮是否自动执行自身逻辑
      },
      formulasDiyJs: '',
      showCondition: {target: '', fieldPath: '', value: ''},
      // ccwgq 2022-8-4 按钮在只读时隐藏按钮
      readOnlyHideBtn: false,
       //ccwgq 2022-09-26 只读时控制按钮是否禁止
      notDisabled: false,
    },
    noTitle: false,
    noPlaceholder: false,
    noTooltip: false,
  },
  // {
  //     ctrlType: 'relation',
  //     name: '',
  //     desc: '关联数据',
  //     icon: 'icon-relation',
  //     options: {
  //         validateType: 'required|row_unique|frontJSValidate',
  //         validateList: [],
  //         validate: "",
  //         defaultType: 'String',
  //         basicsProperty:'relation',
  //         customQuery:{valueBind:"",labelBind:"",conditionfield:[]},//动态值对象
  //         bind:[],//绑定的返回值
  //     }
  // },
//实时单行
  {
    ctrlType: 'immediate-single',
    tableName: '',
    boDefAlias: '',
    name: '',
    desc: '实时单行',
    icon: 'icon-single2',
    options: {
      width: '100%',
      defaultType: 'String',
      noBindModel: true,
      advancedProperty: 'script'
    }
  },
  //实时多行
  {
    ctrlType: 'immediate-textarea',
    tableName: '',
    boDefAlias: '',
    name: '',
    desc: '实时多行',
    icon: 'icon-textarea2',
    options: {
      width: '100%',
      defaultValue: '',
      dataType: 'string|text',
      noBindModel: true,
      placeholder: '',
      basicsProperty: 'script'
    }
  },
  // 里程碑
  {
    ctrlType: 'milepost',
    name: '',
    desc: '里程碑',
    icon: 'icon-milepost',
    noTitle: true,
    noPlaceholder: true,
    noTooltip: true,
    options: {
      direction: 'horizontal',
      placeholder: '',
      defaultValue: '',
      width: '100%',
      basicsProperty: 'stepControl',
      steps: [{title: '', description: ''}]
    }
  },
  //级联
  {
    ctrlType: 'eip-cascader',
    name: '',
    desc: '级联',
    icon: 'icon-cascader',
    options: {
      required: false,
      validateType: 'required|row_unique|frontJSValidate',
      validateList: [],
      validate: '',
      defaultValue: [],
      width: '',
      placeholder: '',
      disabled: false,
      clearable: false,
      remote: true,
      remoteOptions: [],
      props: {
        value: 'value',
        label: 'label',
        children: 'children'
      },
      remoteFunc: '',
      basicsProperty: 'selectConfig|choiceType',
      choiceType: 'dynamic', //默认固定值
      customQuery: {valueBind: '', labelBind: '', conditionfield: []}, //动态值对象
      bind: [], //绑定的返回值
      linkage: [] //联动校验表达式
    }
  },
  //数据视图
  {
    ctrlType: 'dataView',
    name: '数据视图',
    desc: '数据视图',
    icon: 'icon-list',
    isLayout: true,
    templateKey: '',
    templateId: '',
    templateObj: {},
    templateField: [],
    options: {
      showLabel: true,
      boDefAlias: '',
      selectList: [],
      bindList: []
    },
    customDialogjson: {
      name: '数据视图',
      custDialog: {conditions: [], mappingConf: []},
      resultField: []
    },
    subtableBackfill: false
  },
  //文本
  {
    ctrlType: 'text',
    tableName: '',
    boDefAlias: '',
    name: '',
    desc: '文本',
    icon: 'icon-text',
    options: {
      defaultValue: 'This is a text',
      noBindModel: true,
      customClass: '',
      basicsProperty: 'textValue'
    }
  },
  //二维码
  {
    ctrlType: 'QRcode',
    name: '',
    desc: '二维码',
    icon: 'el-icon-s-grid',
    bindModelType: 'diyModel',
    noTitle: true,
    options: {
      noBindModel: true,
      customClass: ''
    }
  },
  //WF 图片展示二维码
  // {
  //   ctrlType: "imgQRcode",
  //   name: "",
  //   desc: "图片展示二维码",
  //   icon: "el-icon-s-grid",
  //   bindModelType: 'diyModel',
  //   noTitle: true,
  //   options: {
  //     noBindModel: true,
  //     butName: '',
  //     contentStr:''
  //   },
  // },
  //iframe面板
  {
    ctrlType: 'iframe',
    name: '',
    desc: 'iframe面板',
    icon: 'icon-iframe',
    noBasics: true,
    options: {
      iframeSrc: '',
      iframeSrcHeight: '300',
      noBindModel: true,
      iframeSrcWidth: '100%',
      frameborder: '1',
      lableColor: '',
      basicsProperty: 'iframe'
    }
  },
  //背景图片
  {
    ctrlType: 'image',
    name: '',
    desc: '背景图片',
    icon: 'icon-image',
    options: {
      defaultValue: [],
      size: {},
      isDisplay: false,
      noBindModel: true,
      imgSrc: '',
      fileJson: '',
      tokenFunc: 'funcGetToken',
      basicsProperty: 'img'
    }
  },
  //pdf预览
  {
    ctrlType: 'ou-pdf',
    name: '',
    desc: 'pdf预览',
    icon: 'el-icon-tickets',
    bindModelType: 'diyModel',
    options: {
      noBindModel: true
    }
  },
  //ccwgq 2022-05-25 流程附件
  {
    ctrlType: 'ou-attachment',
    name: '',
    desc: '流程附件',
    icon: 'icon-attachment',
    options: {
      width: '100%',
      validateType: 'required',
      validateList: [],
      validate: '',
      defaultValue: '',
      required: false,
      dataType: 'string',
      pattern: '',
      placeholder: '',
      disabled: false,
      basicsProperty: 'fileupload',
      showFlowInfo: true, //是否展示流程节点信息
      nodeName: '', //节点的名字
      nodeId: '', //节点的ID
      isCurrentUser: true, //只限制当前用户操作自己的附件
      isHistory: false, //启用历史版本限制,将在原基础覆盖附件，并记录历史信息而不是追加
      selfPermission: false, //通过第三方字段控制权限
      permissionField: '', //取值的字段
      //TODO:暂时没有用到propConf
      propConf: [
        {name: 'prop1'},
        {name: 'prop2'},
        {name: 'prop3'},
        {name: 'prop4'},
        {name: 'prop5'},
        {name: 'prop6'}
      ], //附件扩展属性配置
      //自定义的列
      defineColumns: [],
      watermark: false,
      defaultMarkText:'',//默认的水印文字
      serialNo: '',
      file: {
        multiple: true,
        simplicity: true,
        limit: '5',
        acceptType: 'any',
        acceptStr: '',
        size: '50',
        allowDownload: false,
        allowPreview: true,
        accept: [
          'jpg',
          'jpeg',
          'png',
          'bmp',
          'pdf',
          'JPG',
          'JPEG',
          'PNG',
          'BMP',
          'PDF',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'ppt',
          'pptx',
          'rtf',
          'txt',
          'zip',
          'rar',
          'vsd',
          'dwg',
          'mp4',
          'avi',
          '3gp',
          'rmvb',
          'rm',
          'wmv'
        ]
      } //文件上传对象
    }
  },
  //ccwgq 2022-10-09 流程意见
  {
    ctrlType: 'ou-opinion',
    name: '',
    desc: '流程意见',
    icon: 'icon-goutong',
    placeholder: '',
    options:{
      sort:'desc', //排序方式，正序/倒序
      showDepartInfo:true, //是否展示部门信息
      showDate:true,//是否显示日期
      showTime:true,//是否显示具体的时间
      datePattern:'',//自定义的日期格式
      timePattern:'',//自定义的时间格式
      dividerLine:'dashed', //意见之间的分割线样式，none表示不使用分割线,默认虚线分割
      userInfoAlign:'right',//底部的信息靠左/居中/靠右
      useTextJs:false,//启用自定义的js脚本
      selfDiyJs:'',//自定义的js脚本
      useDialog:false,//支持点击弹窗查看更多,当意见过多时可以使用弹窗的方式显示更多
      defaultNumber:3,//查看更多时默认渲染多少条意见？
      emptyText:'',//当意见为空时显示的默认文字

    }
  }

  // {
  //   ctrlType: "contractPreview",
  //   name: "",
  //   desc: "合同预览",
  //   icon: "icon-iframe",
  //   noBasics: true,
  //   options: {
  //     iframeSrc: "",
  //     iframeSrcHeight: "500",
  //     noBindModel: true,
  //     iframeSrcWidth: "100%",
  //     frameborder: "1",
  //     lableColor: "",
  //     basicsProperty: "contract"
  //   }
  // }
]

export const layoutComponents = [
  {
    ctrlType: 'tab',
    name: '',
    desc: 'tab布局',
    icon: 'icon-tab',
    isLayout: true,
    columns: [
      {
        span: '标签页1',
        list: [],
        permission: '',
        permissionPath: ''
      }
    ],
    options: {
      gutter: 0,
      nextCheck: '',
      type: '', //风格类型
      justify: 'start',
      align: 'top'
    }
  },
  {
    ctrlType: 'page',
    name: '',
    desc: '分页布局',
    icon: 'icon-page-seprator',
    isLayout: true,
    columns: [
      {
        list: []
      }
    ]
  },
  {
    ctrlType: 'accordion',
    name: '',
    desc: '折叠面板',
    icon: 'icon-accordion',
    isLayout: true,
    columns: [
      {
        span: '折叠面板',
        idKey: Date.parse(new Date()) + 'a',
        isOpen: false,
        list: []
      }
    ],
    options: {
      gutter: 0,
      justify: 'start',
      nextCheck: '',
      accordion: 'false',
      activeNames: [],
      align: 'top'
    }
  },
  // 栅格布局
  {
    ctrlType: 'grid',
    name: '',
    desc: '栅格布局',
    icon: 'icon-grid',
    isLayout: true,
    columns: [
      {
        span: 12,
        list: []
      },
      {
        span: 12,
        list: []
      }
    ],
    options: {
      gutter: 0,
      justify: 'start',
      align: 'top'
    }
  },
  // 表格布局
  {
    ctrlType: 'table',
    name: '',
    desc: '表格布局',
    icon: 'icon-grid',
    isLayout: true,
    rows: [
      {
        cols: [
          {
            colspan: 1,
            list: []
          },
          {
            colspan: 1,
            list: []
          }
        ]
      },
      {
        cols: [
          {
            colspan: 1,
            list: []
          },
          {
            colspan: 1,
            list: []
          }
        ]
      },
      {
        cols: [
          {
            colspan: 1,
            list: []
          },
          {
            colspan: 1,
            list: []
          }
        ]
      }
    ],
    options: {
      layOut: 'auto',
      gutter: 0,
      justify: 'start',
      align: 'top',
      lineHeight: 40,
      borderColor: '#b5b5b5',
      borderWidth: 1,
      fontColor: '#808080',
      labelWidthType: 'percent', //percent：百分比，px：像素
      labelWidth: 30,
      // 增加头部行和尾部行
      topLine: {
        open: false, //是否启用
        content: '', //内容设置
        bgColor: 'inherit', //背景颜色设置
        fontSize: '11pt',
        fontColor: '#808080',
        textAlign: 'left',
        padding: '10px',
        useBorder: true //使用边框
      },
      bottomLine: {
        open: false, //是否启用
        content: '', //内容设置
        bgColor: 'inherit', //背景颜色设置
        fontSize: '11pt',
        fontColor: '#808080',
        textAlign: 'left',
        padding: '10px',
        useBorder: true
      }
    }
  },
  // 子表布局
  {
    ctrlType: 'subtable',
    name: '子表',
    desc: '子表',
    icon: 'icon-table2',
    isLayout: true,
    customHeader: '',
    list: [],
    options: {
      showLabel: true,
      boSubEntity: '',
      subTablePath: '',
      relation: '',
      maxRow: 0,
      /*--- 头部 --- */
      headHeight: 30, //header height
      headHeightUnit: 'px', //px/pt/rem header height unit
      headLineHeight: 30, //header line-height
      headLineHeightUnit: 'px',
      counter: false, //计数
      bgColor: '', //背景色
      fontColor: '', //字体颜色
      fontSize: '12', //字体大小
      fontUnit: 'px', //字体单位
      fontWeight: 'bold', //字体宽度
      /* --- 分割线 ---*/
      showDivider:false,//控制分割线
      dividerDesc:"",//分割线内容
      dividerPosition:"left",//分割线:left,right,center
      useDividerIndex:true,//分割线使用逻辑下标  (index+1)
      /* --- 背景色交叉 --- */
      crossBgColor:false,
      crossCount:2, //两两交叉或者更多？ 三个三个交叉？
      bgColorList:[]//颜色控制数组
    },
    customQuery: {isUse: false, resultfield: []},
    customDialogjson: {
      name: '子表回填',
      icon: '',
      custDialog: {conditions: [], mappingConf: []},
      orgConfig: {name: '', code: '', id: ''},
      resultField: []
    },
    subtableBackfill: false,
    initTemplateData: false,
    initTemplateDataType: 'empty'
  },
  {
    ctrlType: 'subDiv',
    name: 'div子表',
    desc: 'div子表',
    icon: 'icon-table2',
    isLayout: true,
    customHeader: '',
    list: [],
    options: {
      showLabel: true,
      boSubEntity: '',
      subTablePath: '',
      subDivTablePath: '',
      relation: '',
      maxRow: 0,
      /*--- 头部 --- */
      headHeight: 30, //header height
      headHeightUnit: 'px', //px/pt/rem header height unit
      headLineHeight: 30, //header line-height
      headLineHeightUnit: 'px',
      counter: false, //计数
      bgColor: '', //背景色
      fontColor: '', //字体颜色
      fontSize: '12', //字体大小
      fontUnit: 'px', //字体单位
      fontWeight: 'bold' //字体宽度
    },
    customQuery: {isUse: false, resultfield: []},
    customDialogjson: {
      name: '子表回填',
      icon: '',
      custDialog: {conditions: [], mappingConf: []},
      orgConfig: {name: '', code: '', id: ''},
      resultField: []
    },
    subtableBackfill: false,
    initTemplateData: false,
    initTemplateDataType: 'empty'
  },
  {
    ctrlType: 'suntable',
    name: '孙表',
    desc: '孙表',
    icon: 'icon-table2',
    isLayout: true,
    customHeader: '',
    list: [],
    options: {
      showLabel: true,
      boSubEntity: '',
      subTablePath: '',
      relation: '',
      maxRow: 0,
      /*--- 头部 --- */
      headHeight: 30, //header height
      headHeightUnit: 'px', //px/pt/rem header height unit
      headLineHeight: 30, //header line-height
      headLineHeightUnit: 'px',
      counter: false, //计数
      bgColor: '', //背景色
      fontColor: '', //字体颜色
      fontSize: '12', //字体大小
      fontUnit: 'px', //字体单位
      fontWeight: 'bold', //字体宽度
       /* --- 分割线 ---*/
       showDivider:false,//控制分割线
       dividerDesc:"",//分割线内容
       dividerPosition:"left",//分割线:left,right,center
       useDividerIndex:true,//分割线使用逻辑下标  (index+1)
    },
    customDialogjson: {
      name: '孙表回填',
      icon: '',
      custDialog: {conditions: [], mappingConf: []},
      resultField: []
    },
    subtableBackfill: false
  },
  {
    ctrlType: 'sunDiv',
    name: 'div孙表',
    desc: 'div孙表',
    icon: 'icon-table2',
    isLayout: true,
    customHeader: '',
    list: [],
    options: {
      showLabel: true,
      boSubEntity: '',
      subTablePath: '',
      relation: '',
      maxRow: 0,
      /*--- 头部 --- */
      headHeight: 30, //header height
      headHeightUnit: 'px', //px/pt/rem header height unit
      headLineHeight: 30, //header line-height
      headLineHeightUnit: 'px',
      counter: false, //计数
      bgColor: '', //背景色
      fontColor: '', //字体颜色
      fontSize: '12', //字体大小
      fontUnit: 'px', //字体单位
      fontWeight: 'bold' //字体宽度
    },
    customDialogjson: {
      name: '孙表回填',
      icon: '',
      custDialog: {conditions: [], mappingConf: []},
      resultField: []
    },
    subtableBackfill: false
  },
  {
    ctrlType: 'hottable',
    name: 'hotTable',
    desc: 'hotTable',
    icon: 'icon-table2',
    isLayout: true,
    showTitle: true,
    customHeader: '',
    list: [],
    options: {
      showLabel: true,
      boSubEntity: '',
      subTablePath: '',
      relation: '',
      colHeadersRelations: [], //表头数据
      templateContent: {},
      initFillbackData: [],
      height: 80,
      crossMapping: [], //跨表取数
      nestedHeaders: [], //嵌套表头
      mainTableCalcs: [], //主表字段统计
      cellCalcs: [], //单元格计算公式
      initSumRowField: '', //统计行标签字段
      initSumRowValue: '' //统计行标签字段值
    },
    customDialogjson: {
      name: '子表回填',
      icon: '',
      custDialog: {conditions: [], mappingConf: []},
      resultField: [],
      orgConfig: {name: '', code: '', id: ''}
    },
    subtableBackfill: false,
    initTemplateData: false,
    initTemplateDataType: 'empty',
    addInitTemplateData: false, //允许添加初始化数据
    addInitBtnName: '添加初始化数据', //添加初始化数据按钮
    initSumRow: false //初始化统计行
  },
  {
    ctrlType: 'divider',
    isLayout: true,
    noTitle: true,
    name: '分割线',
    desc: '分割线',
    icon: 'el-icon-minus',
    options: {
      customDialogjson: {
        icon: ''
      },
      basicsProperty: 'divider',
      noBindModel: true,
      customClass: '',
      position: 'center',
      content: '',
      color: '#DCDFE6'
    }
  }
]

export const validateRules = [
  {
    key: 'confirmed',
    isInput: true,
    isBoData: true,
    type: 'string|number|text|date',
    inputType: 'select', //输入框类型
    name: '相同的值'
  },
  {
    key: 'email',
    name: '电子邮箱'
  },
  {
    key: 'regex',
    isInput: true,
    inputType: 'input', //输入框类型
    name: '*正则表达式'
  },
  {
    key: 'min',
    isInput: true,
    inputType: 'input', //输入框类型
    name: '*最小文本长度'
  },
  {
    key: 'max',
    isInput: true,
    inputType: 'input', //输入框类型
    name: '*最大文本长度'
  },
  {
    key: 'min_value',
    isInput: true,
    inputType: 'input', //输入框类型
    name: '最小数值'
  },

  {
    key: 'max_value',
    isInput: true,
    inputType: 'input', //输入框类型
    name: '最大数值'
  },
  {
    key: 'isAfter',
    isInput: true,
    inputType: 'select', //输入框类型
    type: 'date',
    name: '日期晚于'
  },
  {
    key: 'isBefore',
    isInput: true,
    inputType: 'select', //输入框类型
    type: 'date',
    name: '日期早于'
  },
  {
    key: 'isStart',
    isInput: true,
    inputType: 'select', //输入框类型
    type: 'date',
    name: '日期不早于'
  },
  {
    key: 'isEnd',
    isInput: true,
    inputType: 'select', //输入框类型
    type: 'date',
    name: '日期不晚于'
  },
  {
    key: 'numeric',
    name: '整数'
  },
  {
    key: 'between',
    isInput: true,
    inputType: 'twoInput', //输入框类型
    name: '指定范围的数字(包含最小/大值)'
  },
  {
    key: 'is',
    isInput: true,
    inputType: 'input', //输入框类型
    name: '*指定的值'
  },
  {
    key: 'digits',
    isInput: true,
    inputType: 'input', //输入框类型
    name: '指定位数的数字'
  },
  {
    key: 'mobile',
    name: '手机号码'
  },
  {
    key: 'required',
    name: '*必填'
  },
  //{
  //  isInput: true,
  //  key: "row_unique",
  //  name: "*行唯一"
  //},
  {
    key: 'alpha_spaces',
    name: '字母空格'
  },
  {
    key: 'alpha_dash',
    name: '字母数字横线下划线'
  },
  {
    key: 'alpha_num',
    name: '字母数字'
  },
  {
    key: 'alpha',
    name: '字母'
  },
  {
    key: 'frontJSValidate',
    isInput: true,
    inputType: 'button', //输入框类型
    name: 'JS方法校验'
  },
  {
    key: 'backendValidate',
    isInput: true,
    inputType: 'input', //输入框类型
    name: '后端校验'
  }
  // {
  //   key: "uniqueValidate",
  //   name: "唯一性校验"
  // }
]
export default {
  isLayoutComponents(type) {
    if (
      type == 'tab' ||
      type == 'subtable' ||
      type == 'subDiv' ||
      type == 'accordion' ||
      type == 'page' ||
      type == 'grid' ||
      type == 'dataView' ||
      type == 'table'
    ) {
      return true
    }
    return false
  },
  isGridLayoutComponents(type) {
    if (
      type == 'tab' ||
      type == 'accordion' ||
      type == 'page' ||
      type == 'sunDiv' ||
      type == 'suntable'
    ) {
      return true
    }
    return false
  },
  handleLayoutComponents(vueInst, layoutRow, fieldList, newFieldIndex) {
    //针对字段拖入的校验
    if (layoutRow && fieldList && fieldList[newFieldIndex]) {
      let field = fieldList[newFieldIndex]
      if (!this.validateLayoutField(vueInst, layoutRow, field)) {
        fieldList.splice(newFieldIndex, 1)
        return false
      }
    }
    let this_ = vueInst
    let isPass = true
    vueInst.data.list.forEach(l => {
      if (this.isLayoutComponents(l.ctrlType)) {
        if (l.columns) {
          l.columns.forEach(c => {
            if (c.list) {
              c.list = c.list.filter(element => {
                if (
                  l.ctrlType == 'tab' ||
                  l.ctrlType == 'accordion' ||
                  l.ctrlType == 'subtable'
                ) {
                  if (
                    this.isGridLayoutComponents(element.ctrlType) &&
                    !(l.ctrlType == 'accordion' && element.ctrlType == 'tab')
                  ) {
                    this_.$message.warning('布局字段中不允许再拖入布局字段')
                    isPass = false
                    return false
                  }
                } else {
                  if (
                    l.ctrlType == 'grid' &&
                    (element.ctrlType == 'sunDiv' ||
                      element.ctrlType == 'suntable')
                  ) {
                    this_.$message.warning('孙表只能存在子表中')
                    isPass = false
                    return false
                  }
                  if (this.isLayoutComponents(element.ctrlType)) {
                    this_.$message.warning('布局字段中不允许再拖入布局字段')
                    isPass = false
                    return false
                  }
                  if (l.ctrlType == 'grid' && element.ctrlType == 'hottable') {
                    this_.$message.warning('布局字段中不允许再拖入布局字段')
                    isPass = false
                    return false
                  }
                }

                return true
              })
            }
          })
        } else if (l.list) {
          if (l.ctrlType == 'subDiv') {
            l.list = l.list.filter(c => {
              if (this.isLayoutComponents(c.ctrlType) && c.ctrlType != 'grid') {
                this_.$message.warning('布局字段中不允许再拖入布局字段')
                isPass = false
                return false
              }
              return true
            })
          } else {
            l.list = l.list.filter(c => {
              if (this.isLayoutComponents(c.ctrlType)) {
                this_.$message.warning('布局字段中不允许再拖入布局字段')
                isPass = false
                return false
              }
              return true
            })
          }
        } else if (l.rows) {
          // 表格布局
          l.rows.forEach(row => {
            row.cols.forEach(col => {
              col.list = col.list.filter(c => {
                if (
                  this.isLayoutComponents(c.ctrlType) ||
                  c.ctrlType == 'sunDiv' ||
                  c.ctrlType == 'suntable' ||
                  c.ctrlType == 'divider'
                ) {
                  this_.$message.warning('布局字段中不允许再拖入布局字段')
                  isPass = false
                  return false
                }
                return true
              })
            })
          })
        }
      }
    })
    //布局字段中不允许再拖入布局字段时还原上传控件的顺序
    if (!isPass && window.panelList) {
      vueInst.data.list = window.panelList
    }
    return isPass
  },
  validateLayoutField(vueInst, layout, field) {
    //这里的校验只针对字段属性拖入和快速复用拖入的
    let _this = this
    if (field && (field.dragType == 'field' || field.dragType == 'copy')) {
      if (
        field.fieldPath.split('.').length == 2 &&
        field.fieldPath.indexOf('item.') != 0
      ) {
        //主表字段
        if (
          layout.parentNodeType == 'sub' ||
          layout.ctrlType == 'subtable' ||
          layout.ctrlType == 'subDiv'
        ) {
          vueInst.$message.warning('子表布局中不允许拖入主表字段。')
          return false
        } else if (
          layout.parentNodeType == 'sun' ||
          layout.ctrlType == 'suntable' ||
          layout.ctrlType == 'sunDiv'
        ) {
          vueInst.$message.warning('孙表布局中不允许拖入主表字段。')
          return false
        }
      } else if (
        field.fieldPath.split('.').length == 2 &&
        field.fieldPath.indexOf('item.') == 0
      ) {
        //子表字段
        if (
          (layout.ctrlType == 'subtable' || layout.ctrlType == 'subDiv') &&
          !layout.options.boSubEntity
        ) {
          vueInst.$message.warning('请先绑定子表。')
          return false
        } else if (
          !layout.parentNodeType &&
          !(layout.ctrlType == 'subtable' || layout.ctrlType == 'subDiv')
        ) {
          vueInst.$message.warning('主表布局中不允许拖入子表字段。')
          return false
        } else if (layout.parentNodeType == 'sun') {
          vueInst.$message.warning('孙表布局中不允许拖入子表字段。')
          return false
        } else if (
          layout.options.boSubEntity &&
          layout.options.boSubEntity != field.tableName
        ) {
          vueInst.$message.warning(
            '子表布局绑定的BO实体与拖入字段所属BO实体不一致。'
          )
          return false
        }
      } else if (field.fieldPath.split('.').length == 4) {
        //孙表字段
        if (
          (layout.ctrlType == 'suntable' || layout.ctrlType == 'sunDiv') &&
          !layout.options.boSubEntity
        ) {
          vueInst.$message.warning('请先绑定孙表。')
          return false
        } else if (!layout.parentNodeType) {
          vueInst.$message.warning('主表布局中不允许拖入孙表字段。')
          return false
        } else if (
          layout.parentNodeType == 'sub' &&
          !(layout.ctrlType == 'suntable' || layout.ctrlType == 'sunDiv')
        ) {
          vueInst.$message.warning('子表布局中不允许拖入孙表字段。')
          return false
        } else if (
          layout.options.boSubEntity &&
          layout.options.boSubEntity != field.tableName
        ) {
          vueInst.$message.warning(
            '孙表布局绑定的BO实体与拖入字段所属BO实体不一致。'
          )
          return false
        }
      }
    }
    return true
  }
}
