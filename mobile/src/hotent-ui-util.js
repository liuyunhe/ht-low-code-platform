var utils = {
    isEmpty: (value) => {
        if (value === null || value === undefined || value === "") {
            return true;
        }
        else if (value.constructor == Object) {
            return Object.keys(value).length == 0;
        }
        else if (value.constructor == Array) {
            return value.length == 0;
        }
        return false;
    },
    // 解析URL地址，如果url地址包含了${form}这样的占位符，会按照sso.js中配置的对应服务的地址替换。
    parseUrl: (url) => {
        if (url === "") return;
        var ctx = window.context,
            reg = /^(\$\{(\w+)\})\/.*$/;

        var match = reg.exec(url);
        if (match != null) {
            var name = match[2],
                mc = match[1],
                val = ctx[name];
            if (!val) {
                throw new Error(
                    "The '" +
                    name +
                    "' in url:" +
                    url +
                    " does not defined in context provider."
                );
            }
            return url.replace(mc, val);
        } else {
            return url;
        }
    },
    // 使用ctx对象中的值替换掉exp中所有的${key}
    parseExp: (exp, ctx) => {
        if (!exp || exp.constructor != String) return exp;
        ctx = ctx || {};
        var reg = /(\$\{(\w+)\})/,
            match = null,
            count = 0;

        while (match = reg.exec(exp)) {
            count++;
            // 避免死循环
            if (count > 999) {
                break;
            }
            if (match != null) {
                exp = exp.replace(match[1], ctx.hasOwnProperty(match[2]) ? ctx[match[2]] : "");
            }
        }
        return exp;
    },
    // 获取随机的名称
    getName: () => {
        return Math.random().toString(36).substr(2, 10)
    },
    // 获取控件是否可编辑
    getWriteable: (permission) => {
        if (permission === 'n' || permission === 'r') {
            return false;
        }
        return true;
    },
    // 合并验证规则(如果rules和appendRules均为字符串格式，合并后仍为字符串格式；如果其中一个为Object格式，合并后为Object格式。)
    mergeValidate: (rules, appendRules) => {
        if (!appendRules || (appendRules.constructor !== Object && appendRules.constructor !== String)) {
            return rules;
        }
        let rulesTypeIsString = true,
            appendTypeIsString = (appendRules.constructor === String),
            finalTypeIsString = true;
        if (rules === undefined || rules === null) {
            rulesTypeIsString = appendTypeIsString;
            rules = appendTypeIsString ? "" : {};
        }
        else if (rules.constructor === Object || rules.constructor === String) {
            rulesTypeIsString = (rules.constructor === String);
        }
        else {
            throw `rules的类型为${typeof rules}，只能为Object类型或String类型。`;
        }
        finalTypeIsString = (rulesTypeIsString && appendTypeIsString);
        // 仍然以String格式
        if (finalTypeIsString) {
            const ruleAry = utils.stringSplit(rules, "|");
            const appendAry = utils.stringSplit(appendRules, "|");
            let ruleObj = {}, appendObj = {};
            ruleAry.forEach(r => {
                const k = utils.stringSplit(r, ":")[0];
                ruleObj[k] = r;
            });
            appendAry.forEach(a => {
                const k = utils.stringSplit(a, ":")[0];
                appendObj[k] = a;
            });
            // 如果旧规则中存在与追加规则中的同名规则，则使用追加规则覆盖旧规则。
            const mergeObj = Object.assign(ruleObj, appendObj);
            return Object.values(mergeObj).join("|");
        }
        // 转换为Object格式
        else {
            let ruleObj = {}, appendObj = {};
            if (rulesTypeIsString) {
                ruleObj = utils.validateString2Object(rules);
            }
            else {
                ruleObj = { ...rules };
            }
            if (appendTypeIsString) {
                appendObj = utils.validateString2Object(appendRules);
            }
            else {
                appendObj = { ...appendRules };
            }
            return Object.assign(ruleObj, appendObj);
        }
    },
    // 减少校验规则
    reduceValidate: (rules, reduceRules) => {
        if (!rules || !reduceRules || (reduceRules.constructor !== Object && reduceRules.constructor !== String)) {
            return rules;
        }
        // 要减少的校验规则的名称集合
        let reduceRuleNames = [];
        if (reduceRules.constructor === String) {
            const reduceRuleObj = utils.validateString2Object(reduceRules);
            reduceRuleNames = Object.keys(reduceRuleObj);
        }
        else {
            reduceRuleNames = Object.keys(reduceRules);
        }

        if (rules.constructor === Object) {
            Object.keys(rules).forEach(k => {
                if (reduceRuleNames.some(n => n == k)) {
                    delete rules[k];
                }
            });
            return rules;
        }
        else if (rules.constructor === String) {
            const ruleAry = utils.stringSplit(rules, "|");
            const nRuleAry = ruleAry.reduce((ary, r) => {
                const name = utils.stringSplit(r, ":")[0];
                if (reduceRuleNames.every(m => m != name)) {
                    ary.push(r);
                }
                return ary;
            }, []);
            return nRuleAry.join("|");
        }
        else {
            throw `rules的类型为${typeof rules}，只能为Object类型或String类型。`;
        }
    },
    // 字符串格式的校验规则转为对象格式
    validateString2Object: (rule) => {
        if (!rule || rule.constructor !== String) {
            return rule;
        }
        let obj = {};
        const ary = utils.stringSplit(rule, '|');
        ary.forEach(m => {
            const regAndArgs = utils.stringSplit(m, ':');
            if (regAndArgs.length == 1) {
                obj[regAndArgs[0]] = true;
            }
            else if (regAndArgs.length > 1) {
                const args = utils.stringSplit(regAndArgs[1], ",");
                obj[regAndArgs[0]] = args;
            }
        });
        return obj;
    },
    // 字符串str按照sep分割为数组，并清理掉数组结果中的空白项。
    stringSplit: (str, sep) => {
        if (!str || str.constructor !== String || !sep || sep.constructor !== String) {
            return [];
        }
        let ary = str.split(sep);
        ary = ary.map(p => {
            return p.trim();
        });
        ary = ary.trim();
        return ary;
    },
    // 获取控件是否添加必填校验
    addRequiredOrNot: (permission, validate) => {
        if (permission !== 'b') {
            return validate;
        }
        if (validate === undefined || validate === null) {
            validate = "";
        }
        return utils.mergeValidate("required", validate);
    },
    // 格式化日期时间
    formatDate: (value) => {
        let date = null;
        if (!value) {
            return date;
        }
        if (value.constructor == Date && !isNaN(value.getTime())) {
            date = value;
        }
        else if (value.constructor == String || value.constructor == Number) {
            date = new Date(value);
        }
        else {
            throw "格式化日期时，传入的数据格式不正确。";
        }
        let y = date.getFullYear();
        let MM = date.getMonth() + 1;
        MM = MM < 10 ? ('0' + MM) : MM;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let m = date.getMinutes();
        m = m < 10 ? ('0' + m) : m;
        let s = date.getSeconds();
        s = s < 10 ? ('0' + s) : s;
        return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
    },
    // 格式化日期 
    formatDateYear: (value) => {
        let date = new Date(value);
        let y = date.getFullYear();
        let MM = date.getMonth() + 1;
        MM = MM < 10 ? ('0' + MM) : MM;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        return y + '-' + MM + '-' + d;
    },
    // 日期1是否早于日期2
    dateIsBefore: (dateOne, dateTwo, canEquals) => {
        if (!dateOne || !dateTwo) {
            return true;
        }
        var date1 = new Date(dateOne).getTime() || new Date(new Date().format("yyyy-MM-dd") + " " + dateOne).getTime();
        var date2 = new Date(dateTwo).getTime() || new Date(new Date().format("yyyy-MM-dd") + " " + dateTwo).getTime();
        if (!canEquals) {
            //大于。v2>v1 。
            if (date2 > date1) {
                return true;
            } else {
                return false;
            }
        } else {
            //大于等于。v2>=v1 。只要v1不大于v2即可
            if (date1 > date2) {
                return false;
            } else {
                return true;
            }
        }
    },
    // 日期计算，不传单位时，默认以'天'为单位计算
    dateCalc: (startDate, endDate, op) => {
        if (!startDate || !endDate || startDate.length == 0 || endDate.length == 0) {
            return 0;
        }
        if (!op || op.constructor != String) {
            op = "day";
        }
        const opAry = ['year', 'month', 'day', 'hour', 'minute', 'second'];
        if (opAry.indexOf(op) == -1) {
            throw `计算日期的单位只能从${opAry}中选择`;
        }
        let date1 = new Date(Date.parse(startDate.replace(/-/g, "/"))).getTime();
        let date2 = new Date(Date.parse(endDate.replace(/-/g, "/"))).getTime();
        if (!Number.isInteger(date1) || !Number.isInteger(date2)) {
            const now = new Date();
            let nowStr = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
            if (!Number.isInteger(date1)) {
                date1 = new Date(`${nowStr} ${startDate}`).getTime();
            }
            if (!Number.isInteger(date1)) {
                date2 = new Date(`${nowStr} ${endDate}`).getTime();
            }
            if (!Number.isInteger(date1) || !Number.isInteger(date2)) {
                return 0;
            }
        }

        let res = 0;
        let days = date2 - date1;
        switch (op) {
            case "year":
                res = parseInt(days / (1000 * 60 * 60 * 24 * 30 * 12));
                break;
            case "month":
                res = parseInt(days / (1000 * 60 * 60 * 24 * 30));
                break;
            case "day":
                res = parseInt(days / (1000 * 60 * 60 * 24));
                break;
            case "hour":
                res = parseInt(days / (1000 * 60 * 60));
                break;
            case "minute":
                res = parseInt(days / (1000 * 60));
                break;
            case "second":
                res = parseInt(days / 1000);
        }
        return res;

    },
    nest2tile: (arr, childrenKey, obtainChildren) => {
        if (!childrenKey) {
            childrenKey = "children";
        }
        return [].concat(...arr.map(item => {
            let _item = { ...item };
            if (obtainChildren == undefined || obtainChildren == false) {
                delete _item[childrenKey]
            }
            return [].concat(_item, ...utils.nest2tile(item[childrenKey]));

        }));
    },
    // 平铺结构转嵌套结构
    tile2nest: (array, key, pKey, childrenKey) => {
        if (!array || array.constructor !== Array) {
            return array;
        }
        // 复制一份，避免修改原始数组
        let ary = [...array];
        key = key || "id";
        pKey = pKey || "parentId";
        childrenKey = childrenKey || "children";
        // 定义一个待移除数组
        let ary2remove = [];
        ary.map(item => {
            if (item[key] !== item[pKey]) {
                // 找父节点
                let p = ary.filter(c => c[key] === item[pKey]);
                if (p && p.length == 1) {
                    p[0][childrenKey] = p[0][childrenKey] || [];
                    // 将子节点放到父节点中
                    p[0][childrenKey].push(item);
                    ary2remove.push(item[key]);
                }
            }
        });
        // 遍历移除待删除对象
        ary2remove.map(item => {
            ary = ary.filter(c => c[key] !== item);
        });
        return ary;
    },
    // 获取控件所在表单对应的实例对象
    getOnlineFormInstance: (instance) => {
        if (instance == instance.$root) {
            return instance;
        }
        if (!instance) {
            throw "VueComponent实例为空.";
        }
        if (instance.hasOwnProperty("watchMap")) {
            return instance;
        } else if (instance.$parent) {
            return utils.getOnlineFormInstance(instance.$parent);
        }
    },
    // 获取子表每一行所在的作用域元素及索引
    getSubScopeElAndIndex: (el) => {
        const subScopeEl = utils.getParentElementByAttribute(
            el,
            "data-subname"
        );
        if (!subScopeEl) {
            return { subScopeEl: null, index: null };
        }
        let index = subScopeEl.dataset["index"];
        if (index === undefined) {
            throw "要计算的子表行未获取到index属性.";
        }
        index = Number.parseInt(index);
        return { subScopeEl, index };
    },
    // 在子表指定行中通过v-model表达式获取input对应的vue实例
    getSubInputScopeByModelExpression: (subScopeEl, expression) => {
        const inputAry = subScopeEl.getElementsByClassName("inputs");
        let result = null;
        for (var i = 0, c; c = inputAry[i++];) {
            let expressionName = c.__vue__.$vnode.data.model.expression;
            // 兼容front端使用
            if (c.__vue__.$vnode && c.__vue__.$vnode.componentOptions && c.__vue__.$vnode.componentOptions.propsData && c.__vue__.$vnode.componentOptions.propsData.modelExpression) {
                expressionName = c.__vue__.$vnode.componentOptions.propsData.modelExpression;
            }
            if (c && c.__vue__ && c.__vue__.$vnode.data.model && expressionName === expression) {
                result = c.__vue__;
            }
        }
        return result;
    },
    // 获取在线表单的json格式字符串的表单数据(validate参数决定是否需要对表单进行验证)
    validateForm: (instance, scopeName) => {
        return new Promise((resolve, reject) => {
            instance.$root.$validator.validateAll(scopeName).then(result => {
                if (result) {
                    resolve(result);
                }
                else {
                    reject(instance.$root.$validator.errors.items);
                }
            });
        });
    },
    // 获取指定dom元素的父级中具有指定属性的dom元素
    getParentElementByAttribute: (el, attribute) => {
        if (el === null || el === undefined) {
            return null;
        }
        if (!el.hasAttribute || typeof el.hasAttribute != 'function') {
            throw "传入的元素el不能为空且必须为HTMLHtmlElement类型.";
        }
        if (!attribute || attribute.constructor !== String) {
            throw "传入的属性attribute不能为空且必须为String类型.";
        }
        if (el.hasAttribute(attribute)) {
            return el;
        } else if (el.tagName === 'HTML') {
            return null;
        }
        else {
            return utils.getParentElementByAttribute(el.parentElement, attribute);
        }
    },
    // 从父级dom元素中获取指定属性的值
    getSomeAttributeFromParentElement: (el, attribute) => {
        let pEl = utils.getParentElementByAttribute(el, attribute);
        if (pEl && pEl.getAttribute && pEl.getAttribute.constructor === Function) {
            return pEl.getAttribute(attribute);
        }
        return null;
    },
    // 将子表属性路径转换为完整的属性路径，例如：item.name => data.sub[0].name
    getWholePathOfSub: function getWholePathOfSub(subPath, mainPath, index) {
        if (!subPath || !mainPath || index === null || !Number.isInteger(index)) {
            return null;
        }

        var match = subPath.split('.');

        if (match && match.length > 1) {
            return "".concat(mainPath, "[").concat(index, "].").concat(match[match.length - 1]);
        }

        return null;
    },
    // 通过路径取得对象中的属性
    getValueByPath: (obj, path, subIndex) => {
        if (!obj || !path || path.constructor != String) {
            return null;
        }
        if (!/^\w?.*[\w|\]]$/.test(path)) {
            return null;
        }
        let pathAry = path.split(".");
        if (pathAry.length == 1) {
            return obj[path];
        }
        else if (pathAry.length > 1) {
            let ret = obj;
            for (var i = 0; i < pathAry.length; i++) {
                if (ret === null || ret === undefined) {
                    return null;
                }
                const key = pathAry[i];
                const match = /^(\w+)\[(\d+)\]$/.exec(key);
                if (match) {
                    ret = ret[match[1]][match[2]];
                }
                else if (ret && ret.constructor === Array) {
                    let index = 0;
                    if (subIndex != null && subIndex != undefined) {
                        let preIndex = Number.parseInt(subIndex);
                        if (!isNaN(preIndex)) {
                            index = preIndex;
                        }
                    }
                    ret = ret[index][key];
                }
                else {
                    ret = ret[key];
                }
            }
            return ret;
        }
        return null;
    },
    // 通过路径设置对象中的属性
    setValueByPath: (obj, path, value, subIndex) => {
        if (!obj || !path || path.constructor != String) {
            return;
        }
        if (!/^\w?.*[\w|\]]$/.test(path)) {
            return;
        }
        let pathAry = path.split(".");
        if (pathAry.length == 1) {
            obj[path] = value;
        }
        else if (pathAry.length > 1) {
            let ret = obj;
            for (var i = 0; i < pathAry.length; i++) {
                const key = pathAry[i];
                const match = /^(\w+)\[(\d+)\]$/.exec(key);
                if (i == pathAry.length - 1) {
                    if (match) {
                        ret[match[1]][match[2]] = value;
                    }
                    else if (ret && ret.constructor === Array) {
                        let index = 0;
                        if (subIndex != null && subIndex != undefined) {
                            let preIndex = Number.parseInt(subIndex);
                            if (!isNaN(preIndex)) {
                                index = preIndex;
                            }
                        }
                        ret[index][key] = value;
                    }
                    else {
                        ret[key] = value;
                    }
                }
                else {
                    if (match) {
                        ret = ret[match[1]][match[2]];
                    }
                    else {
                        ret = ret[key];
                    }
                }

            }
        }

    },
    /**
    * 将字符串转为json对象。
    * @param jsonStr
    * @param type  可不填写parseToJson
    * @returns
    */
    parseToJson: (jsonStr, type) => {
        type = type || 1;
        if (!jsonStr || jsonStr === "" || type > 3) return null;
        try {
            switch (type) {
                case 1:
                    return JSON.parse(jsonStr);
                    break;
                case 2:
                    return eval(`(${jsonStr})`);
                    break;
                default:
                    throw ("解析json对象错误");
                    break;
            }
        } catch (e) {
            return utils.parseToJson(jsonStr, type + 1);
        }
    },
    /**
    * 将数字转换成人名币大写。
    * 
    * @param currencyDigits
    * @returns
    */
    convertCurrency: (currencyDigits) => {
        var MAXIMUM_NUMBER = 99999999999.99;
        var CN_ZERO = "零";
        var CN_ONE = "壹";
        var CN_TWO = "贰";
        var CN_THREE = "叁";
        var CN_FOUR = "肆";
        var CN_FIVE = "伍";
        var CN_SIX = "陆";
        var CN_SEVEN = "柒";
        var CN_EIGHT = "捌";
        var CN_NINE = "玖";
        var CN_TEN = "拾";
        var CN_HUNDRED = "佰";
        var CN_THOUSAND = "仟";
        var CN_TEN_THOUSAND = "万";
        var CN_HUNDRED_MILLION = "亿";
        var CN_SYMBOL = "";
        var CN_DOLLAR = "元";
        var CN_TEN_CENT = "角";
        var CN_CENT = "分";
        var CN_INTEGER = "整";
        var integral;
        var decimal;
        var outputCharacters;
        var parts;
        var digits, radices, bigRadices, decimals;
        var zeroCount;
        var i, p, d;
        var quotient, modulus;
        currencyDigits = currencyDigits.toString();
        if (currencyDigits == "") {
            return "";
        }
        if (currencyDigits.match(/[^,.\d]/) != null) {
            return "";
        }
        if ((currencyDigits)
            .match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
            return "";
        }
        currencyDigits = currencyDigits.replace(/,/g, "");
        currencyDigits = currencyDigits.replace(/^0+/, "");

        if (Number(currencyDigits) > MAXIMUM_NUMBER) {
            return "";
        }

        parts = currencyDigits.split(".");
        if (parts.length > 1) {
            integral = parts[0];
            decimal = parts[1];

            decimal = decimal.substr(0, 2);
        } else {
            integral = parts[0];
            decimal = "";
        }

        digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE,
            CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
        radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
        bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
        decimals = new Array(CN_TEN_CENT, CN_CENT);

        outputCharacters = "";

        if (Number(integral) > 0) {
            zeroCount = 0;
            for (i = 0; i < integral.length; i++) {
                p = integral.length - i - 1;
                d = integral.substr(i, 1);
                quotient = p / 4;
                modulus = p % 4;
                if (d == "0") {
                    zeroCount++;
                } else {
                    if (zeroCount > 0) {
                        outputCharacters += digits[0];
                    }
                    zeroCount = 0;
                    outputCharacters += digits[Number(d)] + radices[modulus];
                }
                if (modulus == 0 && zeroCount < 4) {
                    outputCharacters += bigRadices[quotient];
                }
            }
            outputCharacters += CN_DOLLAR;
        }

        if (decimal != "") {
            for (i = 0; i < decimal.length; i++) {
                d = decimal.substr(i, 1);
                if (d != "0") {
                    outputCharacters += digits[Number(d)] + decimals[i];
                }
            }
        }

        if (outputCharacters == "") {
            outputCharacters = CN_ZERO + CN_DOLLAR;
        }
        if (decimal == "") {
            outputCharacters += CN_INTEGER;
        }
        outputCharacters = CN_SYMBOL + outputCharacters;
        return outputCharacters;
    },
    /**
     * 通过name获取页面url地址参数
     * @param name
     * @returns
     * 
     */
    getUrlKey: (name) => {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null;
    },
    // 返回调整顺序后的数组 part：数组中的一个或多个元素， direct：调整的方向  up：向上  down：向下
    arrayMove: (ary, part, direct) => {
        direct = direct || "down";
        if (!part || (part.constructor !== Object && part.constructor !== Array)) {
            return ary;
        }
        if (part.constructor === Object) {
            part = [part];
        }
        if (direct == "up") {
            part.forEach(m => {
                let index = ary.indexOf(m, 1);
                if (index > 0) {
                    let newAry = [...ary];
                    newAry[index - 1] = ary[index];
                    newAry[index] = ary[index - 1];
                    ary = newAry;
                }
            });
        } else if (direct == "down") {
            for (var i = part.length - 1, m; (m = part[i--]);) {
                let index = ary.indexOf(m, 0);
                if (index > -1 && index < ary.length - 1) {
                    let newAry = [...ary];
                    newAry[index + 1] = ary[index];
                    newAry[index] = ary[index + 1];
                    ary = newAry;
                }
            }
        }
        return ary;
    },
    // 通过配置中指定的key所对应的属性路径在当前表单中获取对应的值，支持通过data.main.name 或者是 item.name来分别获取主表数据及子表数据的情况
    getValueByConfigKey: (inst, config, key) => {
        if (!config.hasOwnProperty(key)) {
            throw `config对象中未找到属性${key}`;
        }
        const keyPath = config[key];
        // 获取当前组件所在的表单
        const formInst = utils.getOnlineFormInstance(inst.$parent);
        // 获取当前组件是否在子表中的某一行
        const { subScopeEl, index } = utils.getSubScopeElAndIndex(inst.$el);
        if (subScopeEl) {
            //判断是否有孙表
            let paths = subScopeEl.dataset["subname"];
            if (paths.split(".").length == 4 && paths.indexOf("[") == -1) {
                //孙表回填路径
                paths = paths.split(".")[0] + "." + paths.split(".")[1] + "." + paths.split(".")[2]
                    + "[" + parseInt(utils.getSomeAttributeFromParentElement(inst.$el, "sub-index")) + "]" + "." + paths.split(".")[3];
            }
            // 将item.name这样的路径替换为data.sub[0].name这样的全路径格式
            let wholeKeyPath = utils.getWholePathOfSub(
                keyPath,
                paths,
                index
            );
            return utils.getValueByPath(formInst, wholeKeyPath);
        }
        else {
            return utils.getValueByPath(formInst, keyPath);
        }
    },
    // 通过配置中指定的key来设置值到对应的属性路径上，支持设置主表数据data.main.name 或设置子表数据item.name
    setValueByConfigKey: (inst, config, key, value) => {
        if (!config.hasOwnProperty(key)) {
            return;
        }
        const keyPath = config[key];
        // 获取当前组件所在的表单
        const formInst = utils.getOnlineFormInstance(inst.$parent);
        // 获取当前组件是否在子表中的某一行
        const { subScopeEl, index } = utils.getSubScopeElAndIndex(inst.$el);
        if (subScopeEl) {
            //判断是否有孙表
            let paths = subScopeEl.dataset["subname"];
            if (paths.split(".").length == 4 && paths.indexOf("[") == -1) {
                //孙表回填路径
                paths = paths.split(".")[0] + "." + paths.split(".")[1] + "." + paths.split(".")[2]
                    + "[" + parseInt(utils.getSomeAttributeFromParentElement(inst.$el, "sub-index")) + "]" + "." + paths.split(".")[3];
            }
            // 将item.name这样的路径替换为data.sub[0].name这样的全路径格式
            let wholeKeyPath = utils.getWholePathOfSub(
                keyPath,
                paths,
                index
            );
            utils.setValueByPath(formInst, wholeKeyPath, value);
        }
        else {
            utils.setValueByPath(formInst, keyPath, value);
        }
    },
    // 判断两个对象是否相等（props为属性数组，有传入时，只比对传入的属性是否相等）
    objectEquals: (obj1, obj2, props) => {
        if (!props || props.constructor !== Array) {
            props = [];
        }
        if (!obj1 || !obj2) {
            return obj1 === obj2;
        }
        for (var propName in obj1) {
            if (props.length > 0 && props.indexOf(propName) === -1) {
                continue;
            }
            if (obj1.hasOwnProperty(propName) != obj2.hasOwnProperty(propName)) {
                return false;
            }
            else if (typeof obj1[propName] != typeof obj2[propName]) {
                return false;
            }
        }
        for (var propName in obj2) {
            if (props.length > 0 && props.indexOf(propName) === -1) {
                continue;
            }
            if (obj1.hasOwnProperty(propName) != obj2.hasOwnProperty(propName)) {
                return false;
            }
            else if (typeof obj1[propName] != typeof obj2[propName]) {
                return false;
            }
            if (!obj1.hasOwnProperty(propName)) {
                continue;
            }
            if (obj1[propName] instanceof Array && obj2[propName] instanceof Array) {
                if (!utils.arrayEquals(obj1[propName], obj2[propName])) {
                    return false;
                }
            }
            else if (obj1[propName] instanceof Object && obj2[propName] instanceof Object) {
                if (!utils.objectEquals(obj1[propName], obj2[propName])) {
                    return false;
                }
            }
            else if (obj1[propName] != obj2[propName]) {
                return false;
            }
        }
        return true;
    },
    // 判断两个数组是否相等，支持数组中元素为对象时的深度对比
    arrayEquals: (ary1, ary2) => {
        if (!ary1 || !ary2) {
            return ary1 === ary2;
        }

        if (ary1.length != ary2.length) {
            return false;
        }

        for (var i = 0, l = ary1.length; i < l; i++) {
            if (ary1[i] instanceof Array && ary2[i] instanceof Array) {
                if (!utils.arrayEquals(ary1[i], ary2[i])) {
                    return false;
                }
            }
            else if (ary1[i] instanceof Object && ary2[i] instanceof Object) {
                if (!utils.objectEquals(ary1[i], ary2[i])) {
                    return false;
                }
            }
            else if (ary1[i] != ary2[i]) {
                return false;
            }
        }
        return true;
    },
    // 以第一行文本的缩进空格数为基准，后续的每一行都去掉这个基准所对应的空格。
    trimEachLine: (text) => {
        if (!text || text.constructor != String || text.indexOf("\n") == -1) {
            return text;
        }
        let ary = text.split("\n"), totem = 0;
        return ary.reduce((prev, cur, index) => {
            if (index == 1) {
                const match = /^(\s+).*$/.exec(cur);
                match && match.length == 2 && (totem = match[1].length);
            }
            return prev + "\n" + cur.slice(totem, cur.length);
        });
    },
    // 获取字符串的哈希编码
    hashCode: text => {
        var hash = 0, char;
        if (text.length == 0) return hash;
        for (var i = 0; i < text.length; i++) {
            char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
};

// 在数组上扩展一个删除指定项的方法
Array.prototype.remove = function (item) {
    let index = this.findIndex(v => v === item);
    if (index > -1) {
        this.splice(index, 1);
    }
}

// 清空数组
Array.prototype.empty = function () {
    this.splice(0, this.length);
}

// 在数组上扩展一个去重的方法
Array.prototype.unique = function (arg) {
    const res = new Map();
    return this.filter(m => {
        if (arg) {
            return !res.has(m[arg]) && res.set(m[arg], 1);
        }
        else {
            return !res.has(m) && res.set(m, 1);
        }
    });
}

// 去除数组中的空字符串选项
Array.prototype.trim = function () {
    return this.filter(m => m !== '');
}

// 按照数组中的指定key将数组进行分组
Array.prototype.groupByKey = function (key) {
    let res = {};
    this.forEach(m => {
        let group = res[m[key]];
        if (!group) {
            group = [];
            res[m[key]] = group;
        }
        group.push(m);
    });
    return res;
}

// 按照数组中的指定key将数组进行分组
Array.prototype.groupByKey = function (key) {
    let res = {};
    this.forEach(m => {
        let group = res[m[key]];
        if (!group) {
            group = [];
            res[m[key]] = group;
        }
        group.push(m);
    });
    return res;
}

// 将数组对象中的某一个属性值单独抽取出来成为一个新的数组  [{id:'1',name:'苹果'},{id:'2',name:'香蕉'}].extractByKey("id") ==> ['1','2']
Array.prototype.extractByKey = function (key) {
    let set = new Set();
    this.forEach(m => {
        if (key && m[key]) {
            set.add(m[key]);
        }
    });
    return Array.from(set);
}

/**
 * 日期格式化。
 * 日期格式：
 * yyyy，yy 年份
 * MM 大写表示月份
 * dd 表示日期
 * hh 表示小时
 * mm 表示分钟
 * ss 表示秒
 * q  表示季度
 * 实例如下：
 * var now = new Date(); 
 * var nowStr = now.format("yyyy-MM-dd hh:mm:ss"); 
 */
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month 
        "d+": this.getDate(), //day 
        "h+": this.getHours(), //hour 
        "H+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute 
        "s+": this.getSeconds(), //second 
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
        "S": this.getMilliseconds() //millisecond 
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

export default utils;
