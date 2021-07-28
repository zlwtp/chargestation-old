<template>
  <view> </view>
</template>

<script>
export default {
  data() {
    return {};
  },
  onLoad(option) {
    //公众号跳转使用applets 是stop 停止预约
    let vm = this;
    if (option.applets != null || option.applets != undefined) {
      uni.setStorage({
        key: "applets",
        data: option.applets,
        success() {},
      });
    } else {
      uni.setStorage({
        key: "applets",
        data: "",
        success() {},
      });
    }
    uni.switchTab({
      url: "/pages/index/index",
    });
  },
  mounted() {},
  methods: {},
};
</script>
