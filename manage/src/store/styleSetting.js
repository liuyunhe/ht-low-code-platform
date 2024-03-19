const state = {
	styleSetting: {
        tabsStyle:{
          tabType: null
        },
        elementUI:{
          theme:"day-theme"
        }
      }
}

let styleSetting = localStorage.getItem("styleSetting");
if (styleSetting && styleSetting != "null") {
	styleSetting = JSON.parse(styleSetting);
	state.styleSetting = styleSetting;
}

const getters = {
	tabsStyle: function (state) {
		let tabsStyle = state.styleSetting.tabsStyle;
		if (tabsStyle) {
			return tabsStyle;
		}
	},
	theme: function(state){
		return state.styleSetting.elementUI.theme;
	}
}

const actions = {
	actionStyleSetting({ commit, state }, styleSetting) {
		commit("mutationStyleSetting", styleSetting);
	}
}

const mutations = {
	mutationStyleSetting(state, styleSetting) {
		state.styleSetting = styleSetting
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
