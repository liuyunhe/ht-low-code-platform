/**ccwgq 2022-08-10将公式计算的选项单独拆分出来便于维护 */

export const config = [
  {
    label: '数学函数',
    children: [
      {
        value: '$Formulas.ABS()',
        label: 'ABS(绝对值)',
        helpDesc:
          'ABS函数可以获取一个数的绝对值\n用法：ABS(数字)\n示例：ABS(-8)可以返回8，也就是-8的绝对值'
      },
      {
        value: '$Formulas.AVERAGE()',
        label: 'AVERAGE(取平均值)',
        helpDesc:
          'AVERAGE函数可以获取一组数值的算术平均值\n用法：AVERAGE(数字1,数字2,...)\n示例：AVERAGE({语文成绩},{数学成绩}, {英语成绩})返回三\n门课程的平均分',
        subValue: '$Formulas.AVERAGESUB()'
      },
      {
        value: '$Formulas.CEILING()',
        label: 'CEILING(将数字增大到最接近原值的指定因数的倍数)',
        helpDesc:
          'CEILING函数可以将数字增大到最接近原值的指定因数的倍数\n用法：CEILING(数字,因数)\n示例：CEILING(7,6)返回12，因为12比7大的同时，也是6的\n倍数中最接近7的数字'
      },
      {
        value: '$Formulas.COUNT()',
        label: 'COUNT(取参数的数量)',
        helpDesc:
          'COUNT函数可以获取参数的数量\n用法：COUNT(值,值,...)\n示例：COUNT(小明,小王,小张,小李)返回4，也就是人员的数\n量',
        subValue: '$Formulas.COUNTSUB()'
      },
      {
        value: '$Formulas.COUNTIF()',
        label: 'COUNTIF(取数组中满足条件的参数个数)',
        helpDesc:
          "COUNTIF函数可以获取数组中满足条件的参数个数\n用法：COUNTIF(数组,'条件')\n示例：COUNTIF(子表单.性别, '女')，可得到子表单中性别填\n的是'女'的数据条数；COUNTIF([1,2,3,4],'>2')，可得到1,2,3,\n4中大于2的数字数量，结果为2。",
        subValue: '$Formulas.COUNTIFSUB()'
      },
      {
        value: '$Formulas.FIXED()',
        label: 'FIXED(数字舍入到指定的小数位数并输出为文本)',
        helpDesc:
          "FIXED函数可将数字舍入到指定的小数位数并输出为文本\n用法：FIXED(数字,小数位数)\n示例：FIXED(3.1415,2)返回'3.14'"
      },
      {
        value: '$Formulas.FLOOR()',
        label: 'FLOOR(将数字减小到最接近原值的指定因数的倍数)',
        helpDesc:
          'FLOOR函数可将数字减小到最接近原值的指定因数的倍数\n用法：FLOOR(数字,因数)\n示例：FLOOR(7,6)返回6，因为6比7小的同时，也是6的倍数\n中最接近7的数字'
      },
      {
        value: '$Formulas.INT()',
        label: 'INT(取一个数的整数部分)',
        helpDesc:
          'INT函数可以获取一个数的整数部分\n用法：INT(数字)\n示例：INT(3.1415)返回3，也就是3.1415的整数部分'
      },
      {
        value: '$Formulas.LARGE()',
        label: 'LARGE(取数据集中第k个最大值)',
        helpDesc:
          "LARGE函数可以获取数据集中第k个最大值\n用法：LARGE(数组,k)\n示例：LARGE({学生成绩.数学成绩},1)返回子表单'学生成绩'\n中排名第1的'数学成绩'",
        subValue: '$Formulas.LARGESUB()'
      },
      {
        value: '$Formulas.LOG()',
        label: 'LOG(指定底数返回数字的对数)',
        helpDesc:
          'LOG函数可以根据指定底数返回数字的对数\n用法：LOG(数字,底数)\n示例：LOG(100,10)返回2，也就是以10为底数100的对数'
      },
      {
        value: '$Formulas.MAX()',
        label: 'MAX(最大值)',
        helpDesc:
          'MAX函数可以获取一组数值的最大值\n用法：MAX(数字1,数字2,...)\n示例：MAX({语文成绩},{数学成绩},{英语成绩})返回三门课程\n中的最高分',
        subValue: '$Formulas.MAXSUB()'
      },
      {
        value: '$Formulas.MIN()',
        label: 'MIN(最小值)',
        helpDesc:
          'MIN函数可以获取一组数值的最小值\n用法：MIN(数字1,数字2,...)\n示例：MIN({语文成绩},{数学成绩},{英语成绩})返回三门课程\n中的最低分',
        subValue: '$Formulas.MINSUB()'
      },
      {
        value: '$Formulas.MOD()',
        label: 'MOD(取余数)',
        helpDesc:
          'MOD函数可以获取两数相除的余数\n用法：MOD(被除数,除数)\n示例：MOD(4,3)返回1，也就是4/3的余数'
      },
      {
        value: '$Formulas.POWER()',
        label: 'POWER(乘幂)',
        helpDesc:
          'POWER函数可以获取数字乘幂的结果\n用法：POWER(数字,指数)\n示例：POWER(3，2)返回9，也就是3的2次方'
      },
      {
        value: '$Formulas.PRODUCT()',
        label: 'PRODUCT(乘积)',
        helpDesc:
          'PRODUCT函数可以获取一组数值的乘积\n用法：PRODUCT(数字1,数字2,...)\n示例：PRODUCT({单价}, {数量})获取总价，也就是单价和\n数量的乘积',
        subValue: '$Formulas.PRODUCTSUB()'
      },
      {
        value: '$Formulas.RAND()',
        label: 'RAND(返回大于等于0且小于1的均匀分布随机实数)',
        helpDesc:
          'RAND函数可返回大于等于0且小于1的均匀分布随机实数\n用法：RAND()\n示例：RAND()返回0.424656'
      },
      {
        value: '$Formulas.ROUND()',
        label: 'ROUND(四舍五入到指定的位数)',
        helpDesc:
          'ROUND函数可以将数字四舍五入到指定的位数\n用法：ROUND(数字,数字位数)\n示例：ROUND(3.1485,2)返回3.15'
      },
      {
        value: '$Formulas.SMALL()',
        label: 'SMALL(返回数据集中第k个最小值)',
        helpDesc:
          "SMALL函数可以返回数据集中第k个最小值\n用法：SMALL(数组,k)\n示例：SMALL({学生成绩.数学成绩}, 1)返回子表单'学生成\n绩'中排名倒数第一的'数学成绩'",
        subValue: '$Formulas.SMALLSUB()'
      },
      {
        value: '$Formulas.SQRT()',
        label: 'SQRT(数字的正平方根)',
        helpDesc:
          'SQRT函数可以获取一个数字的正平方根\n用法：SQRT(数字)\n示例：SQRT(9)返回3，也就是9的正平方根'
      },
      {
        value: '$Formulas.SUM()',
        label: 'SUM(求和)',
        helpDesc:
          'SUM函数可以获取一组数值的总和\n用法：SUM(数字1,数字2,...)\n示例：SUM({语文成绩},{数学成绩}, {英语成绩})返回三门课\n程的总分',
        subValue: '$Formulas.SUMSUB()'
      },
      {
        value: '$Formulas.SUMPRODUCT()',
        label: 'SUMPRODUCT(加权求和)',
        helpDesc:
          'SUMPRODUCT函数可以将数组间对应的元素相乘，并返\n回乘积之和，适用于加权求和\n用法：SUMPRODUCT(数组,数组...)\n示例：SUMPRODUCT([1,2,3],[0.1,0.2,0.3])返回1.4，也就\n是 1×0.1 + 2×0.2 + 3×0.3的值',
        subValue: '$Formulas.SUMPRODUCTSUB()'
      }
    ]
  },
  {
    label: '文本函数',
    children: [
        {
            value:'#Formulas.TOARRAY()',
            label:'TOARRAY(将使用分割符号split分割的文本转为数组字符串)',
            helpDesc:"示例:TOARRAY('张三,李四',',')返回['张三','李四']",
            subValue:'$Formulas.SUBTOARRAY()'
        },
      {
        value: '$Formulas.CONCATENATE()',
        label: 'CONCATENATE(多个文本合并成一个文本)',
        helpDesc:
          "CONCATENATE函数可以将多个文本合并成一个文本\n用法：CONCATENATE(文本1,文本2,...)\n示例：CONCATENATE('三年二班','周杰伦')会返回'三年二班周杰伦'"
      },
      {
        value: '$Formulas.COUNTNO()',
        label: 'COUNTNO(计算选择记录数)',
        helpDesc:
          "COUNTNO函数可以将对话框、关联查询等选择记录数自动计算\n用法：COUNTNO(文本,'分隔符')\n示例：COUNTNO('张三,李四,王五',',')会返回'3'"
      },
      {
        value: '$Formulas.CHAR()',
        label: 'CHAR(计算机字符集的数字代码转换为对应字符)',
        helpDesc:
          'CHAR函数可以将计算机字符集的数字代码转换为对应字符\n用法：CHAR(数字)\n示例：CHAR(10)会返回换行字符'
      },
      {
        value: '$Formulas.EXACT()',
        label: 'EXACT(文本比较)',
        helpDesc:
          'EXACT函数可以比较两个文本是否完全相同，完全相同则\n返回true，否则返回false\n用法：EXACT(文本1, 文本2)\n示例：EXACT(手机号,中奖手机号)，如果两者相同，返\n回true，如果不相同，返回false'
      },
      {
        value: '$Formulas.ISEMPTY()',
        label: 'ISEMPTY(判断值是否为空)',
        helpDesc:
          'ISEMPTY函数可以用来判断值是否为空文本、空对象或者空数组\n用法：ISEMPTY(文本)\n示例：略'
      },
      {
        value: '$Formulas.LEFT()',
        label: 'LEFT(从文本开始返回指定个数的字符)',
        helpDesc:
          "LEFT函数可以从一个文本的第一个字符开始返回指定个数的字符\n用法：LEFT(文本,文本长度)\n示例：LEFT('三年二班周杰伦',2)返回'三年'，也就是'三年二班周杰伦'的从左往右的前2个字符"
      },
      {
        value: '$Formulas.LEN()',
        label: 'LEN(取文本中的字符个数)',
        helpDesc:
          "LEN函数可以获取文本中的字符个数\n用法：LEN(文本)\n示例：LEN('朝辞白帝彩云间')返回7，因为这句诗中有7个字符"
      },
      {
        value: '$Formulas.LOWER()',
        label: 'LOWER(字母由大写转为小写)',
        helpDesc:
          "LOWER函数可以将一个文本中的所有大写字母转换为小写字母\n用法：LOWER(文本)\n示例：LOWER('JAYZ')返回'jayz'"
      },
      {
        value: '$Formulas.MID()',
        label: 'MID(指定位置开始的指定数目的字符)',
        helpDesc:
          "MID返回文本中从指定位置开始的指定数目的字符\n用法：MID(文本,开始位置_数字,指定数目)\n示例：MID('快速开发平台',3,6)返回'快速开发平台'"
      },
      {
        value: '$Formulas.REPLACE()',
        label: 'REPLACE(替换文本内容)',
        helpDesc:
          "REPLACE函数可以根据指定的字符数，将部分文本替换为不同的文本\n用法：REPLACE(文本,开始位置,替换长度,新文本)\n示例：REPLACE('开联快速开发平台',3,6,'企业数据管理平台')返回'开联企业数据管理平台'"
      },
      {
        value: '$Formulas.REPT()',
        label: 'REPT(文本重复使用)',
        helpDesc:
          "REPT函数可以将文本重复一定次数\n用法：REPT(文本,重复次数)\n示例：REPT('开联',3)返回''"
      },
      {
        value: '$Formulas.RIGHT()',
        label: 'RIGHT(取文本指定内容)',
        helpDesc:
          "RIGHT函数可以获取由给定文本右端指定数量的字符构成的文本值\n用法：RIGHT(文本,文本长度)\n示例：RIGHT('三年二班周杰伦',3)返回'周杰伦'，也就是'三年二班周杰伦'从右往左的前3个字符"
      },
      // {
      //   value: "$Formulas.SEARCH()",
      //   label: "SEARCH",
      //   helpDesc:"SEARCH函数可以获取文本1在文本2中的开始位置\n用法：SEARCH(文本1,文本2)\n示例：SEARCH('2016','2016')返回4"
      // },{
      //   value: "$Formulas.SPLIT()",
      //   label: "SPLIT",
      //   helpDesc:"SPLIT函数可以将文本按指定分割符分割成数组\n用法：SPLIT(文本,分隔符_文本)\n示例：SPLIT('快速开发平台','-')返回'，快速开发平台'"
      // },
      {
        value: '$Formulas.TEXT()',
        label: 'TEXT(数字转化成文本)',
        helpDesc:
          "TEXT函数可以将数字转化成文本\n用法：TEXT(数字)\n示例：TEXT(3.1415)返回'3.1415'"
      },
      {
        value: '$Formulas.TRIM()',
        label: 'TRIM(删除首尾空格)',
        helpDesc:
          "TRIM函数可以删除文本首尾的空格\n用法：TRIM(文本)\n示例：TRIM('  ')返回''"
      },
      {
        value: '$Formulas.UPPER()',
        label: 'UPPER(小写字母转换成大写)',
        helpDesc:
          "UPPER函数可以将一个文本中的所有小写字母转换为大写字母\n用法：UPPER(文本)\n示例：UPPER('jayz')返回'JAYZ'"
      },
      {
        value: '$Formulas.VALUE()',
        label: 'VALUE(文本转为数字)',
        helpDesc:
          "VALUE函数可以将文本转化为数字\n用法：VALUE(文本)\n示例：VALUE('3.1415')返回3.1415"
      }
    ]
  },
  {
    label: '日期函数',
    children: [
      {
        value: '$Formulas.DATE()',
        label: 'DATE(时间戳转换为日期对象)',
        helpDesc:
          'DATE函数可以将时间戳转换为日期对象\n用法：DATE(时间戳)\n示例：略'
      },
      {
        value: '$Formulas.DATEDELTA()',
        label: 'DATEDELTA(指定日期加/减指定天数)',
        helpDesc:
          'DATEDELTA函数可以将指定日期加/减指定天数\n用法：DATEDELTA(指定日期,需要加减的天数)\n示例：略'
      },
      {
        value: '$Formulas.HALFDAY()',
        label: 'HALFDAY(半天计算)',
        helpDesc:
          'HALFDAY函数计算两个日期间天数，最小维度0.5，不满半天按半天计算\n用法：HALFDAY(开始日期,结束日期)\n示例：略'
      },
      {
        value: '$Formulas.COUNTHOURS()',
        label: 'COUNTHOURS(两个日期间的小时数)',
        helpDesc:
          'COUNTHOURS函数获取两个日期间的小时数\n用法：COUNTHQURS(开始时间,结束时间)\n示例：略'
      },
      {
        value: '$Formulas.DAY()',
        label: 'DAY(取日期在当月的第几日)',
        helpDesc:
          'DAY函数可以获取某日期是当月的第几日\n用法：DAY(时间戳)\n示例：略'
      },
      {
        value: '$Formulas.DAYS()',
        label: 'DAYS(取天数差值)',
        helpDesc:
          'DAYS函数可以返回两个日期之间相差的天数。\n用法：DAYS(开始日期,结束日期)\n示例：略'
      },
      {
        value: '$Formulas.DAYS360()',
        label: 'DAYS360(按360天取天数差)',
        helpDesc:
          'DAYS360按照一年 360 天的算法，返回两个日期间相差的天数\n用法：DAYS360(开始日期,结束日期)\n示例：略'
      },
      {
        value: '$Formulas.HOUR()',
        label: 'HOUR(小时数)',
        helpDesc: 'HOUR函数可以返回某日期的小时数\n用法：HOUR(时间戳)\n示例：略'
      },
      {
        value: '$Formulas.ISOWEEKNUM()',
        label: 'ISOWEEKNUM(指定日期在全年中的ISO周数)',
        helpDesc:
          'ISOWEEKNUM函数可以返回指定日期在全年中的ISO周数\n用法：ISOWEEKNUM(指定日期)\n示例：略'
      },
      {
        value: '$Formulas.MINUTE()',
        label: 'MINUTE(分钟数)',
        helpDesc:
          'MINUTE函数可以返回某日期的分钟数\n用法：MINUTE(时间戳)\n示例：略'
      },
      {
        value: '$Formulas.MONTH()',
        label: 'MONTH(月份)',
        helpDesc: 'MONTH返回某日期的月份\n用法：MONTH(时间戳)\n示例：略'
      },
      // {
      //   value: "$Formulas.NOW()",
      //   label: "NOW",
      //   helpDesc:"NOW函数可以获取当前时间\n用法：NOW()\n示例：略"
      // },
      {
        value: '$Formulas.SECOND()',
        label: 'SECOND(秒数)',
        helpDesc:
          'SECOND函数可以返回某日期的秒数\n用法：SECOND(时间戳)\n示例：略'
      },
      // {
      //   value: "$Formulas.SYSTIME()",
      //   label: "SYSTIME",
      //   helpDesc:"SYSTIME函数可以获取当前服务器时间\n用法：SYSTIME()\n示例：略"
      // },
      {
        value: '$Formulas.TIME()',
        label: 'TIME(特定时间的十进制数字)',
        helpDesc:
          'TIME函数可以返回特定时间的十进制数字\n用法：TIME(时_数字,分_数字,秒_数字)\n示例：略'
      },
      {
        value: '$Formulas.TIMESTAMP()',
        label: 'TIMESTAMP(将日期对象转换成时间戳)',
        helpDesc:
          'TIMESTAMP函数可以将日期对象转换成时间戳。\n用法：TIMESTAMP(日期)\n示例：略'
      },
      {
        value: '$Formulas.TODAY()',
        label: 'TODAY(取当天日期)',
        helpDesc: 'TODAY函数可以返回今天\n用法：TODAY()\n示例：略'
      },
      {
        value: '$Formulas.WEEKNUM()',
        label: 'WEEKNUM(返回指定日期在当年是第几周)',
        helpDesc:
          'WEEKNUM函数可以返回指定日期在当年是第几周\n用法：WEEKNUM(指定日期)\n示例：略'
      },
      {
        value: '$Formulas.YEAR()',
        label: 'YEAR(年份)',
        helpDesc:
          "YEAR函数可以返回某日期的年份\n用法：YEAR(时间戳)\n示例：YEAR('2020-10-01') 或者是YEAR('1601481600') 得到2020"
      }
    ]
  },
  {
    label: '逻辑函数',
    children: [
      {
        value: '$Formulas.AND()',
        label: 'AND(与运算)',
        helpDesc:
          '如果所有参数都为真，AND函数返回布尔值true，否则返回布尔值 false\n用法：AND(逻辑表达式1,逻辑表达式2,...)\n示例：AND(语文成绩>90,数学成绩>90,英语成绩>90)，如果三门课成绩都> 90，返回true，否则返回false'
      },
      {
        value: '$Formulas.FALSE()',
        label: 'FALSE(布尔值false)',
        helpDesc: 'FALSE函数返回布尔值false\n用法：FALSE()\n示例：略'
      },
      {
        value: '$Formulas.IF()',
        label: 'IF(判断)',
        helpDesc:
          "IF函数判断一个条件能否满足；如果满足返回一个值，如果不满足则返回另外一个值\n用法：IF(逻辑表达式,为true时返回的值,为false时返回的值)\n示例：IF(语文成绩>60,'及格','不及格')，当语文成绩>60时返回及格，否则返回不及格。"
      },
      {
        value: '$Formulas.NOT()',
        label: 'NOT(返回与指定表达式相反的布尔值)',
        helpDesc:
          'NOT函数返回与指定表达式相反的布尔值。\n用法：NOT(逻辑表达式)\n示例：NOT(语文成绩>60)，如果语文成绩大于60返回false，否则返回true'
      },
      {
        value: '$Formulas.OR()',
        label: 'OR(或运算)',
        helpDesc:
          '如果任意参数为真，OR 函数返回布尔值true；如果所有参数为假，返回布尔值false。\n用法：OR(逻辑表达式1,逻辑表达式2,...)\n示例：OR(语文成绩>90,数学成绩>90,英语成绩>90)，任何一门课成绩> 90，返回true，否则返回false'
      },
      {
        value: '$Formulas.TRUE()',
        label: 'TRUE(布尔值true)',
        helpDesc: 'TRUE函数返回布尔值true\n用法：TRUE()\n示例：略'
      },
      {
        value: '$Formulas.XOR()',
        label: 'XOR(异或运算)',
        helpDesc:
          'XOR函数可以返回所有参数的异或值\n用法：XOR(逻辑表达式1, 逻辑表达式2,...)\n示例：XOR(语文成绩>90,数学成绩>90)，如果两门成绩都>90,返回false；如果两门成绩都<90，返回false；如果其中一门>90，另外一门<90，返回true'
      }
    ]
  },
  {
    label: '高级函数',
    children: [
      {
        value: '$Formulas.CURRENCY()',
        label: 'CURRENCY(转换指定字段为大写人民币)',
        helpDesc: '指定一个字段,把此字段转换为人民币大写格式'
      },
      {
        value: '$Formulas.THOUSAND()',
        label: 'THOUSAND(转换指定字段为千分符的字符串)',
        helpDesc: '指定一个字段,把此字段数字格式成带有千分符的字符串'
      }
    ]
  }
]
