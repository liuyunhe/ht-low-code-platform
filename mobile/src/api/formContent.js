import req from "@/request.js";

const bpmRumtime = window.context.bpmRunTime;
const form = window.context.form;
export default {
    //根据taskId查找任务表单数据
    taskDetail(data, cb) {
		  if (data.taskId) {
			  req.get(bpmRumtime + `/runtime/task/v1/taskMobileDetail?taskId=` + data.taskId + "&reqParams=&leaderId="+data.leaderId).then(response => {
		            cb(response.data);
		        });
	      } else {
	    	  req.get(bpmRumtime + `/runtime/task/v1/taskMobileDetail?taskId=` + data + "&reqParams=").then(response => {
	              cb(response.data);
	          });
	      }
        
    },
    //根据isntId查找表单数据andBo
    getInstFormAndBO(data, cb) {
        if (data.instId) {
            req.get(bpmRumtime + `/runtime/instance/v1/getMobileInstFormAndBO?proInstId=` + data.instId+"&nodeId="+(data.nodeId || "")+"&includData="+(data.includData || false)+"&getStartForm="+(data.getStartForm || false)).then(response => {
                cb(response.data);
            });
        } else {
            req.get(bpmRumtime + `/runtime/instance/v1/getMobileInstFormAndBO?proInstId=` + data+"&nodeId=&includData=true").then(response => {
                cb(response.data);
            });
        }
    },
    //流程启动时获取bo和表单
    getFormAndBO(data, cb) {
        req.post(bpmRumtime +'/runtime/instance/v1/getMobileFormAndBO' ,data).then(response => {
            cb(response.data);
        });
    },
    //后台管理预览VUE表单
    previewDesignVue(id, cb) {
        req.get(form +'/form/form/v1/previewDesignVue?formId=' +id).then(response => {
            cb(response.data);
        });
    },
    //获取表单明显
    preview(id, cb){
        req.get(form +'/form/form/v1/getFormById?id='+id).then(response => {
            cb(response.data);
        });
    }
    
}