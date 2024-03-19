import menuData from "@/api/mock/menu-data.js";
import store from "@/store";

export default {
    getMenus() {
        return menuData.getMenus();
    },
    getMenuByAlias(alias, cb) {
        let r = null;
        let _menu = store.state.menu.menus;
        if(!_menu || _menu.length==0 ){
            let storageMenus = sessionStorage.getItem("currentMenus");
			if(storageMenus){
              _menu = JSON.parse(storageMenus);
            } 
		}
        _menu.forEach( function(x) {
            if(x.children){
               if(!r || r.length==0 ){
                   r = x.children.filter(m => m.alias == alias);
                   if(r&&r.length==1){
                       r[0].parent = x;
                   }
               }
            }
        });
        cb(r&&r[0]);
    },
}