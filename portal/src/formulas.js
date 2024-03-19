import { Form, Notification } from 'element-ui';
import utils from "@/utils.js";
import moment from 'moment';
const Formulas = {
    d1900: new Date(Date.UTC(1900, 0, 1)),
    WEEK_STARTS: [
        undefined,
        0,
        1,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        1,
        2,
        3,
        4,
        5,
        6,
        0
    ],
    /**
    * 冀中能源业务开发的计算公式
     */
    //根据传入的年月得到上月的月份
    LastMonth: (y, m) => {

        m = parseInt(m);
        y = parseInt(y);
        if (m > 0 && m < 13 && y > 0) {
            if (m === 1) {
                return 12;
            }
            let v = m - 1;
            if (v < 10) {
                v = "0" + v;
            }
            return v;
        }

    },
    //根据传入的年月得到上个月的年份
    LastYear: (y, m) => {

        m = parseInt(m);
        y = parseInt(y);
        if (m > 0 && m < 13 && y > 0) {
            if (m === 1) {
                return y - 1;
            }
            return y;
        }
    },

    /**
     * 数学公式
     */
    ABS: (number) => {
        number = Formulas.parseNumber(number);
        return Math.abs(number);
    },
    AVERAGE: (...number) => {
        let avg = 0;
        number.forEach(item => {
            avg += Formulas.parseNumber(item);
        })
        if (number.length === 0)
            return 0;
        return avg / number.length;
    },
    AVERAGESUB: (obj) => {
        let array = Formulas.getArrayByPath(obj);
        return Formulas.AVERAGE(...array);
    },
    CEILING: (number, significance) => {
        number = Formulas.parseNumber(number);
        significance = Formulas.ABS(significance);
        if (significance === 0) {
            return 0;
        }
        let precision = -Math.floor(Math.log(significance) / Math.log(10));
        if (number > 0) {
            return Formulas.ROUND(Math.ceil(number / significance) * significance, precision);
        } else {
            return Formulas.ROUND(Math.floor(number / significance) * significance, precision);
        }
    },
    COUNT: (...args) => {
        return args.length;
    },
    COUNTSUB: (obj) => {
        let array = obj.data;
        return array.length;
    },
    COUNTIF: (list, condition) => {
        if (!condition.startsWith(">") && !condition.startsWith("<")) {
            if (isNaN(condition)) {
                condition = "==='" + condition + "'";
            } else {
                condition = "===" + condition;
            }
        }
        let i = 0;
        list.forEach(item => {
            if (eval('item' + condition)) {
                i++;
            }
        })
        return i;
    },
    COUNTIFSUB: (obj, condition) => {
        let array = Formulas.getArrayByPath(obj);
        return Formulas.COUNTIF(array, condition);
    },
    FIXED: (decimal, digits) => {
        decimal = Formulas.parseNumber(decimal);
        digits = Formulas.parseNumber(digits);
        return Number(decimal).toFixed(digits);
    },
    FLOOR: (number, significance) => {
        number = Formulas.parseNumber(number);
        significance = Formulas.ABS(significance);

        if (significance === 0) {
            return 0;
        }
        let precision = -Math.floor(Math.log(significance) / Math.log(10));
        if (number > 0) {
            return Formulas.ROUND(Math.floor(number / significance) * significance, precision);
        } else {
            return Formulas.ROUND(Math.ceil(number / significance) * significance, precision)
        }
    },
    INT: (number) => {
        number = Formulas.parseNumber(number);
        return parseInt(number);
    },
    LARGE: (array, index) => {
        index = Formulas.parseNumber(index);
        return array.sort(function (a, b) {
            return b - a;
        })[index - 1];
    },
    LARGESUB: (obj, index) => {
        let array = Formulas.getArrayByPath(obj);
        return Formulas.LARGE(array, index);
    },
    LOG: (number, base) => {
        number = Formulas.parseNumber(number);
        base = Formulas.parseNumber(base);
        if (base === 0)
            return 0;
        return Math.log(number) / Math.log(base);
    },
    MAX: (...args) => {
        args = Formulas.parseNumberArray(args);
        if (args.length === 0) {
            return 0;
        }
        return Math.max(...args);
    },
    MAXSUB: (obj) => {
        let array = Formulas.getArrayByPath(obj);
        return Formulas.MAX(...array);
    },
    MIN: (...args) => {
        args = Formulas.parseNumberArray(args);
        if (args.length === 0) {
            return 0;
        }
        return Math.min(...args);
    },
    MINSUB: (obj) => {
        let array = Formulas.getArrayByPath(obj);
        return Formulas.MIN(...array);
    },
    MOD: (dividend, divisor) => {
        dividend = Formulas.parseNumber(dividend);
        divisor = Formulas.parseNumber(divisor);
        let modules = Math.abs(dividend % divisor);
        return (divisor > 0) ? modules : -modules;
    },
    POWER: (number, power) => {
        number = Formulas.parseNumber(number);
        power = Formulas.parseNumber(power);
        return Math.pow(number, power);
    },
    PRODUCT: (...args) => {
        let total = 1;
        args.forEach(item => {
            item = Formulas.parseNumber(item);
            total *= item;
        })
        return args.length === 0 ? 0 : total;
    },
    PRODUCTSUB: (obj) => {
        let array = Formulas.getArrayByPath(obj);
        return Formulas.PRODUCT(...array);
    },
    RAND: () => {
        return Math.random();
    },
    ROUND: (number, digit) => {
        return Math.round(number * 10 ** digit) / 10 ** digit;
    },
    SMALL: (array, index) => {
        array = Formulas.parseNumberArray(array);
        return array.sort(function (a, b) {
            return a - b;
        })[index - 1];
    },
    SMALLSUB: (obj, index) => {
        let array = Formulas.getArrayByPath(obj);
        return Formulas.SMALL(array, index);
    },
    SQRT: (number) => {
        number = Formulas.parseNumber(number);
        return Math.sqrt(number);
    },
    SUM: (...args) => {
        let num = 0;
        args.forEach(item => {
            item = Formulas.parseNumber(item);
            num += item;
        })
        return num;
    },
    SUMSUB: (obj) => {
        let array = Formulas.getArrayByPath(obj);
        return Formulas.SUM(...array);
    },
    SUMPRODUCT: (...arrays) => {
        if (!arrays)
            return 0;
        let min = Number.MAX_VALUE;
        let total = 0;
        arrays.forEach(array => {
            if (array.length < min) {
                min = array.length;
            }
        });
        for (let i = 0; i < min; i++) {
            let p = 1;
            for (let j = 0; j < arrays.length; j++) {
                p *= Formulas.parseNumber(arrays[j][i]);
            }
            total += p;
        }
        return total;
    },
    SUMPRODUCTSUB: (...arrays) => {
        if (!arrays)
            return 0;
        let newArrays = [];
        arrays.forEach(obj => {
            newArrays.push(Formulas.getArrayByPath(obj));
        })
        return Formulas.SUMPRODUCT(...newArrays);
    },
    /**
     * 文本函数
     * @param args
     * @returns {string}
     * @constructor
     */
    TOARRAY:(str,split,isStr)=>{
        // debugger;
        // console.log('directive===>TOARRAY')
        if(isStr==undefined) isStr=false;
        if(!str) return str;
        debugger;
    //     //,分割的转为数组形式
        split=split || ','
        const list=str.split(split);
        const rtn=list.length? list:[]
       return  rtn.toString()
    },
    SUBTOARRAY:(obj,split,isStr=false)=>{
        split=split||',';
        isStr=isStr===undefined? false:isStr;
        let array = Formulas.getArrayByPath(obj);
        let rtn=array;
        if(isStr){
            return array.join(split);
        }
        return array;
    },
    LEFTCHAR(str,char){
        if(!str) return '';
        const index =str.indexOf(char);
        if(index==-1){
            return str
        }
        return str.substr(str,index);
    },
    CONCATENATE: (...args) => {
        let str = "";
        args.forEach(item => {
            if (item) {
                str += item;
            }
        })
        return str;
    },
    CHAR: (number) => {
        number = Formulas.parseNumber(number);
        return String.fromCharCode(number);
    },
    EXACT: (str1, str2) => {
        return str1 === str2;
    },
    ISEMPTY: (str) => {
        return str ? true : false;
    },
    LEFT: (str, number) => {
        number = Formulas.parseNumber(number);
        return str.substr(str, number);
    },
    LEN: (str) => {
        return str.length;
    },
    LOWER: (str) => {
        return str.toLowerCase();
    },
    MID: (str, start, length) => {
        return str.substr(start - 1, length);
    },
    REPLACE: (str, start, length, newStr) => {
        let replaceStr = Formulas.MID(str, start, length);
        if (!replaceStr)
            return str + newStr;
        return str.replace(replaceStr, newStr);
    },
    REPT: (str, count) => {
        let result = "";
        for (let i = 0; i < Formulas.parseNumber(count); i++) {
            result += str;
        }
        return result;
    },
    RIGHT: (str, length) => {
        return str.substr(str.length - length, str.length);
    },
    UPPER: (str) => {
        return str.toUpperCase();
    },
    TEXT: (number) => {
        return number + "";
    },
    VALUE: (str) => {
        return Formulas.parseNumber(str);
    },
    TRIM: (str) => {
        return str.trim();
    },
    COUNTNO: (field, char) => {
        if (field == "") {
            return 0;
        } else if (field.indexOf(char) > -1) {
            return field.split(char).length;
        } else {
            return 1;
        }
    },
    //逻辑函数
    AND: (...args) => {
        let result = true;
        args.forEach(arg => {
            if (!arg) {
                result = false;
            }
        });
        return result;
    },
    FALSE: () => {
        return false;
    },
    IF: (arg, then_value, otherwise_value) => {
        return arg ? then_value : otherwise_value;
    },
    NOT: (arg) => {
        return !arg;
    },
    OR: (...args) => {
        let result = false;
        args.forEach(arg => {
            if (arg) {
                result = true;
            }
        });
        return result;
    },
    TRUE: () => {
        return true;
    },
    XOR: (...args) => {
        let count = 0;
        args.forEach(arg => {
            if (!arg) {
                count++;
            }
        });
        return count !== args.length && count !== 0;
    },
    //时间函数
    DATE: (timestamp) => {
        let date = Formulas.parseDate(timestamp);
        if (date == 'Invalid Date') {
            Notification.error({
                title: '错误',
                message: '无效日期'
            });
            return;
        }
        return date;
    },
    DATEDELTA: (string, days) => {
        let timestamp = new Date(string).getTime();
        timestamp += days * 86400000;
        return Formulas.DATE(timestamp);
    },
    HALFDAY: (startDate, endDate) => {
        let half = 0.5;
        let startDay = Formulas.second(Formulas.parseStringToDate(startDate));
        let endDay = Formulas.second(Formulas.parseStringToDate(endDate));
        if (isNaN(startDay) || isNaN(endDay)) {
            return "";
        }
        let halfDay = Math.ceil((endDay - startDay) / 43200);
        return halfDay * half;
    },
    COUNTHOURS: (startDate, endDate) => {
        let startDay = Formulas.second(Formulas.parseStringToDate(startDate));
        let endDay = Formulas.second(Formulas.parseStringToDate(endDate));
        if (isNaN(startDay) || isNaN(endDay)) {
            return "";
        }
        let hours = Math.ceil((endDay - startDay) / 3600);
        return hours;
    },
    DAY: (timestamp) => {
        let date = Formulas.DATE(timestamp);
        return date.getDate();
    },
    DAYS: (startDate, endDate) => {
        let startDay = Formulas.serial(Formulas.parseStringToDate(startDate));
        let endDay = Formulas.serial(Formulas.parseStringToDate(endDate));
        if (isNaN(startDay) || isNaN(endDay)) {
            return "";
        }
        return endDay - startDay;
    },
    DAYS360: (startDate, endDate, method) => {
        if (!startDate || !endDate) {
            return 0;
        }
        startDate = Formulas.parseStringToDate(startDate);
        endDate = Formulas.parseStringToDate(endDate);
        let sm = startDate.getMonth();
        let em = endDate.getMonth();
        let sd, ed;
        if (method) {
            sd = startDate.getDate() === 31 ? 30 : startDate.getDate();
            ed = endDate.getDate() === 31 ? 30 : endDate.getDate();
        } else {
            let smd = new Date(startDate.getFullYear(), sm + 1, 0).getDate();
            let emd = new Date(endDate.getFullYear(), em + 1, 0).getDate();
            sd = startDate.getDate() === smd ? 30 : startDate.getDate();
            if (endDate.getDate() === emd) {
                if (sd < 30) {
                    em++;
                    ed = 1;
                } else {
                    ed = 30;
                }
            } else {
                ed = endDate.getDate();
            }
        }

        return 360 * (endDate.getFullYear() - startDate.getFullYear()) +
            30 * (em - sm) + (ed - sd);
    },
    HOUR: (timestamp) => {
        let date = Formulas.DATE(timestamp);
        return date.getHours();
    },
    ISOWEEKNUM: (date) => {
        date = Formulas.parseStringToDate(date);
        date.setHours(0, 0, 0);
        date.setDate(date.getDate() + 4 - (date.getDay() || 7));
        let yearStart = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    },
    MINUTE: (timestamp) => {
        let date = Formulas.DATE(timestamp);
        return date.getMinutes();
    },
    MONTH: (timestamp) => {
        let date = Formulas.DATE(timestamp);
        return date.getMonth() + 1;
    },
    NOW: () => {
        return Formulas.parseDate(new Date().getTime());
    },
    SECOND: (timestamp) => {
        let date = Formulas.DATE(timestamp);
        return date.getSeconds();
    },
    SYSTIME: () => {
        //todo
    },
    TIME: (hour, minute, second) => {
        hour = Formulas.parseNumber(hour);
        minute = Formulas.parseNumber(minute);
        second = Formulas.parseNumber(second);
        hour = hour < 0 ? 0 : hour;
        minute = minute < 0 ? 0 : minute;
        second = second < 0 ? 0 : second;
        return (3600 * hour + 60 * minute + second) / 86400;
    },
    TIMESTAMP: (date) => {
        if (date) {
            date = Formulas.parseStringToDate(date);
            return date.getTime();
        }
    },
    TODAY: () => {
        return new Date().toLocaleDateString();
    },
    WEEKNUM: (date, returnType) => {
        if (!date) {
            return;
        }
        date = Formulas.parseStringToDate(date);
        if (returnType === undefined) {
            returnType = 1;
        }
        if (returnType === 21)
            return Formulas.ISOWEEKNUM(date);
        let week_start = Formulas.WEEK_STARTS[returnType];
        let jan = new Date(date.getFullYear(), 0, 1);
        let inc = jan.getDay() < week_start ? 1 : 0;
        jan -= Math.abs(jan.getDay() - week_start) * 24 * 60 * 60 * 1000;

        return Math.floor(((date - jan) / (1000 * 60 * 60 * 24)) / 7 + 1) + inc;
    },
    YEAR: (timestamp) => {
        let date = new Date(timestamp);
        return date.getFullYear();
    },

    UUID: () => {
        function u4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return u4() + u4() + "-" + u4() + "-" + u4() + "-" + u4() + "-" + u4() + u4() + u4();
    },
    //高级函数:
    CURRENCY: (x) => {
        let tmp = Formulas.parseNumber(x);

        return utils.convertCurrency(tmp);
    },
    THOUSAND: (x) => {
        if (x || x === 0) {
            x = x + "";
        }
        //let tmp = Formulas.parseNumber(x);
        let reg = /(\d)(?=(?:\d{3})+\b)/g
        return x.replace(reg, '$1,')
    },
    /**
     * 异常统一处理
     * @param {*} err
     * @param {*} typeName
     */
    throwErr(err, typeName) {
        Notification.error({
            title: typeName + '公式运算错误',
            message: err
        }); if (isNaN(startDay) || isNaN(endDay)) {
            return "";
        }
        throw err;
    },
    /**
     * 类型判断
     * @param {*} value
     * @param {*} type
     */
    typeofType(value, type) {
        if (value !== "" && typeof value != type) {
            throw "传入参数必须是" + type + "类型";
        }
    },
    parseNumber(number) {
        number = parseFloat(number);
        if (isNaN(number)) return 0;
        return number;
    },
    parseNumberArray(array) {
        return array.map(item => {
            return Formulas.parseNumber(item);
        });
    },
    parseDate(timestamp) {
        timestamp = Formulas.parseNumber(timestamp);
        return new Date(timestamp);
    },
    parseStringToDate(str) {
        if (!str) {
            return new Date("");
        }
        return new Date(Date.parse(str.replace(/-/g, "/")));
    },
    getArrayByPath(obj) {
        let array = [];
        if (!obj.data)
            return array;
        obj.data.forEach(item => {
            array.push(Formulas.parseNumber(item[obj.path]));
        });
        return array;
    },
    serial(date) {
        let addOn = (date > -2203891200000) ? 2 : 1;
        return Math.ceil((date - Formulas.d1900) / 86400000) + addOn;
    },
    second(date) {
        let addOn = (date > -2203891200000) ? 2 : 1;
        return Math.ceil((date - Formulas.d1900) / 1000) + addOn;
    },
    //ccwgq 2022-02-25   增加日期格式化函数
    formatDate(value, pattern) {
        return moment(value).format(pattern);
    },
    //ccwgq 2022-04-12 增加空对象判断(直接借用JQuery的判断)
    isEmptyObj(obj) {
        return typeof obj == 'object' ? $.isEmptyObject(obj) : Formulas.ISEMPTY(obj)
    }
};

Formulas.install = (Vue) => {
    Vue.prototype.$Formulas = Formulas;
};

export default Formulas;
