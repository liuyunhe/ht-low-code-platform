//动态计算智能审核窗口的高度
//导入剪贴板功能
import Clipboard from 'clipboard';
export default {
    data() {
        return {
            visibleHeight: parseInt($(document.documentElement).innerHeight()),
        }
    },
    computed: {
        dialogHeight: {
            get() {
                return this.visibleHeight
            },
            set(val) {
                this.visibleHeight = (typeof val === 'number') ?
                    val : parseInt(val)
            }
        }
    },
    mounted() {
        window.addEventListener('resize', this.computeDialogHeight);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.computeDialogHeight)
    },
    methods: {
        //动态计算窗口高度
        computeDialogHeight() {
            this.dialogHeight = $(document.documentElement).innerHeight()
        },
        //一键复制粘贴公用方法
        /**
         * 
         * @param {string} selector 选择器
         * @param {object} data 一键复制数据
         * @param {string} msg 正确的消息提示
         * @param {string} err 错误的消息提示
         */
        pasteData(selector, data, msg, err) {
            const cb = new Clipboard(selector, {
                text: () => {
                    return data;
                }
            }).on('success', () => {
                this.$message.success(msg);
                cb.destroy();
            }).on("error", () => {
                err && this.$message.error(err);
                cb.destroy();
            })
        }
    },
}