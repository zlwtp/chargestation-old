import Vue from 'vue'
import Vuex from 'vuex'
import shop from './shop.js'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        appName: '智汇充电',
        userInfo: {},//微信用户信息
		websiteUrl: 'https://8.142.75.174/upload',//图片地址—测试
		//websiteUrl: 'https://www.chargestation.online/upload'//图片地址—生产
    },
    mutations: {
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo;
            console.log("wx", state.userInfo);
        },
    },
    modules: {
        shop
    }
})

export default store
