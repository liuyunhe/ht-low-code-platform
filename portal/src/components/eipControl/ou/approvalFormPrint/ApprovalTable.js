import moment from "moment";
export default {
    name: 'ApprovalTable',
    props: ['taskList', 'formKey', 'foData'],
    filters: {
        dateFormat: function (val) {
            if (!val || val == "") {
                return "";
            } else {
                return moment(val).format("YYYY年MM月DD日 HH时mm分");
            }
        },
    },
    // 之所以用渲染函数，主要是为了内联css,防止样式的丢失问题,这里的dom结构参考ApprFormPrint.vue的模板部分
    render(h) {
        //渲染函数来渲染表格
        //为了简单地实现内联css
        //定义一些默认的staticStyle
        const boldBorder = "3px solid black";
        const foData = this.foData;
        const taskList = this.taskList;
        const normalBorder = "1px solid black";
        /*  ---- 第一行 ---  */
        let a1, a2, a3, a4;
        // 标准合同
        if (["ht", "htsp"].includes(this.formKey)) {
            // A1
            a1 = h('td', {
                staticStyle: {
                    fontWeight: 'bolder',
                    borderLeft: boldBorder,
                    borderTop: boldBorder,
                    minWidth: 'fit-content'
                },
            }, ['合同编号']);
            // A2
            a2 = h("td", {
                staticStyle: {
                    borderLeft: normalBorder,
                    borderTop: boldBorder,
                    textAlign: 'center',
                    minWidth: '120px'
                },
            }, [foData.serial_no ? foData.serial_no : '']);
            // A3
            a3 = h('td', {
                staticStyle: {
                    fontWeight: 'bolder',
                    borderLeft: normalBorder,
                    borderTop: boldBorder,
                }
            }, ['我方名称']);
            // A4
            a4 = h('td', {
                staticStyle: {
                    borderLeft: normalBorder,
                    borderTop: boldBorder,
                    borderRight: boldBorder
                }
            }, [foData.our_nm ? foData.our_nm : ''])
        }
        //打包合同
        else {
            // A1
            a1 = h('td', {
                staticStyle: {
                    fontWeight: 'bolder',
                    borderLeft: boldBorder,
                    borderTop: boldBorder,
                    minWidth: 'fit-content'
                }
            }, ['合同份数']);
            // A2
            a2 = h("td", {
                staticStyle: {
                    borderLeft: normalBorder,
                    borderTop: boldBorder,
                    textAlign: 'center',
                    minWidth: '120px'
                },
            }, [foData.sub_d_cont.length]);
            // A3  "合同编号”标签
            a3 = h('td', {
                staticStyle: {
                    fontWeight: 'bolder',
                    borderLeft: normalBorder,
                    borderTop: boldBorder,
                }
            }, ['合同编号']);
            //A4  合同编号的值
            a4 = h('td', {
                staticStyle: {
                    borderLeft: normalBorder,
                    borderTop: boldBorder,
                    borderRight: boldBorder
                }
            }, [foData.serial_no]);
        }
        let firstLine = h('tr', {
            staticStyle: {
                height: "50px",
                lineHeight: "50px",
                textAlign: 'center'
            }
        }, [a1, a2, a3, a4]);
        /*  第一行结束  */
        /* --- 第二行 合同总金额 */
        let b1, b2;
        b1 = h('td', {
            staticStyle: {
                borderLeft: boldBorder,
                borderTop: normalBorder,
                borderBottom: normalBorder,
                fontWeight: 'bold',
                minWidth: 'fit-content'
            },
            attrs: {
                noWrap: 'nowrap'
            }
        }, ['合同总金额']);
        b2 = h('td', {
            attrs: {
                colSpan: 3
            },
            staticStyle: {
                borderLeft: normalBorder,
                borderTop: normalBorder,
                borderBottom: normalBorder,
                borderRight: boldBorder
            }
        }, [foData.matter_amt_cap ? foData.matter_amt_cap : '']);
        //  高度50px;
        let secondLine = h('tr', {
            staticStyle: {
                height: "50px",
                lineHeight: "50px",
                textAlign: 'center'
            }
        }, [b1, b2]);
        /* 第二行结束 */
        /**   第三行审批记录 */
        let thirdLine = h('td', {
            attrs: {
                colSpan: 5
            },
            staticStyle: {
                borderLeft: boldBorder,
                borderRight: boldBorder,
                borderBottom: normalBorder,
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '6px',
                height: '50px',
                lineHeight: '50px'
            }
        }, '审批记录')
        /**   第三行结束 */
        /* --- 第四行开始审批记录 ---*/
        let taskLines = [];
        // 审批记录
        // let c1 = h('td', {
        //     attrs: { rowSpan: taskList.length },
        //     staticStyle: {
        //         borderLeft: boldBorder,
        //         writingMode: 'vertical-lr',
        //         textAlign: 'center',
        //         letterSpacing: taskList.length > 1 ? '20px' : '',
        //         fontSize: "large",
        //         margin: "20px 0"
        //     },
        //     ref: 'recordTitle'
        // }, ['审批记录']);
        taskList.forEach((task, index) => {
            let t1, t2, opTitle, opContext, personTitle, person, dateTitle, date;
            let taskLine;
            opTitle = h('h4', {
                staticStyle: {
                    margin: '5px 10px',
                    fontWeight: 'bold'
                }
            }, ['审批意见：']);
            // 审批意见 合同起草的审批意见（打包合同是经办人提交）是合同起草同意
            opContext = h('p', {
                staticStyle: {
                    marginLeft: "5px",
                    textIndent: "2em",
                    minWidth: "30px",
                    minHeight: "30px"
                }
            }, [task.opinion ?
                (['合同起草', '经办人提交'].includes(task.taskName) ? '合同起草同意' : task.opinion) :
                ''
            ]);
            personTitle = h('el-col', {
                props: {
                    span: 4
                },
                staticStyle: {
                    fontWeight: 'bold',
                    paddingLeft: '10px'
                }
            }, ['审批人：'])
            //   审批人具体节点 约定默认占位空间
            person = h('el-col', {
                props: {
                    span: 4,
                    pull: 1
                }
            }, [task.auditorName ?
                h('span', [task.auditorName]) :
                h('div', {
                    staticStyle: {
                        minWidth: '10px',
                        minHeight: '10px'
                    }
                })
            ])
            dateTitle = h('el-col', {
                props: { span: 5 },
                staticStyle: {
                    fontWeight: "bold"
                }
            }, ['审批日期：']);
            date = h('el-col', {
                props: {
                    span: 11,
                    pull: 1
                }
            }, [task.completeTime ?
                moment(task.completeTime).format("YYYY年MM月DD日 HH时mm分") :
                ''
            ])
            let sign = h('div', {}, [h('el-row', {}, [personTitle, person, dateTitle, date])]);
            t1 = h('td', {
                staticStyle: {
                    borderLeft: boldBorder,
                    borderBottom: normalBorder,
                    textAlign: 'center',
                    fontWeight: 'bold'
                }
            }, [task.taskName]);
            // 审批意见,审批人，审批日期
            t2 = h('td', {
                attrs: {
                    colSpan: 4
                },
                staticStyle: {
                    borderLeft: normalBorder,
                    borderBottom: normalBorder,
                    borderRight: boldBorder
                }
            }, [opTitle, opContext, sign]);
            if (index === 0) {
                taskLine = h('tr', {}, [t1, t2]);
            } else {
                taskLine = h('tr', {}, [t1, t2]);
            }
            taskLines.push(taskLine);
        })
        /*  --- 审批记录结束 */
        /* --- 最后一行 备注 --- */
        let lastLine, l1, l2;
        l1 = h('td', {
            staticStyle: {
                borderLeft: boldBorder,
                borderBottom: boldBorder,
                textAlign: 'center',
                fontWeight: 'bold'
            }
        }, ['备注']);
        l2 = h('td', {
            attrs: { colSpan: 3 },
            staticStyle: {
                borderRight: boldBorder,
                borderBottom: boldBorder,
                borderLeft: normalBorder
            }
        }, [h('p', {
            staticStyle: {
                margin: '0',
                textIndent: '2em'
            }
        }, [foData.notes ? foData.notes : ''])])
        lastLine = h('tr', {
            staticStyle: {
                height: '90px',
            }
        }, [l1, l2]);
        /*  --最后一行结束  --- */
        return h("table", {
            staticStyle: {
                width: '98%',
                margin: '0 auto',
                padding: "10px 0"
            },
            attrs: {
                cellspacing: 0
            }
        }, [h('thead'), h('tbody', [firstLine, secondLine, thirdLine, ...taskLines, lastLine]), h('tfoot')]);
    }
}