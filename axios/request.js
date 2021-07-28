const baseUrl = 'https://8.142.75.174';//测试
// const baseUrl = 'http://8.136.8.191:8866';//测试
// const baseUrl = 'https://8.136.8.191:8443';//测试
// const baseUrl = 'http://124.71.199.7';
// const baseUrl = 'https://www.chargestation.online';//正式
export default {
	request(option) {
		let _this = this;
		option.url = baseUrl + option.url;
		option.header = option.header || {};
		option.data = option.data || {};
		option.method = option.method || 'GET';
		option.dataType = option.dataType || '';
		if (uni.getStorageSync("token").access_token) {
			option.header.Authorization = `Bearer ${uni.getStorageSync("token").access_token}`;
			//option.header = Object.assign({},option.header)
		}
		return new Promise((resolve, reject) => {

			uni.request({
				url: option.url,
				data: option.data || {},
				header: option.header,
				method: option.method || "get",
				success(res) {
					if (res.data.code == 500) {
						uni.showToast({
							title: res.data.message,
							icon: "none",
							duration: 2000,
						});
					}
					resolve(res);
				},
				fail(err) {
					reject(err);
					console.log("err:" + JSON.stringify(err));
          uni.hideLoading();
				}
			});
		});
	},

}
