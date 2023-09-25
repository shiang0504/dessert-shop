<script setup>
// Router
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="productNotFound">
    <div class="img">
      <img src="@/assets/003.png" alt="">
    </div>
    <div class="msg">Ooops!找不到商品</div>
    <RouterLink to="/">
      <div class="msg2">回去逛逛</div>
    </RouterLink>
  </main>
</template>

<style lang="scss" scoped>
@import "@/style.scss";
.productNotFound{
  padding: 160px 60px 60px 60px;
  @include flex_center;
  flex-direction: column;
  border-radius: 20px;
  background-color: rgb(255, 255, 255);
  .img{
    width: 30%;
    @include tablet-768{
      width: 40%;
    }
    img{
      width: 100%;
    }
  }
  .msg{
    margin-top: -30px;
    font-size: 30px;
    margin-bottom: 30px;
    @include tablet-768{
      margin-top: 0;
    }
  }
  .msg2{
    border-radius: 20px;
    padding: 10px;
    font-size: 20px;
    color: $color_orange;
    border: 2px solid $color_orange;
  }
}
</style>