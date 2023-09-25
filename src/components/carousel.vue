<script setup>
import { ref, computed } from 'vue'

// pinia
import { useProductsStore } from '@/stores/products'
const productsStore = useProductsStore()
// productsStore.getProducts()
// composables
import { touchstartHandler, touchendHandler } from '@/composables/touchHandler'
import { getBgStyle } from '@/composables/getBackendAssets'
// Router
import { RouterLink } from 'vue-router'


// 輪播定時器
let stop = setInterval(()=>{
  carouselIndexChange(1)
},5000)

const carouselNowIndex = ref(0)
//箭頭切換index
const carouselIndexChange=(n)=>{
  carouselNowIndex.value = (carouselNowIndex.value + n + productsStore.products.length) % productsStore.products.length
  clearInterval(stop)
  stop = setInterval(()=>{
    carouselIndexChange(1)
  },5000)
}
//點擊index切換index
const carouselIndexpress=(n)=>{
  carouselNowIndex.value = n
  clearInterval(stop)
  stop = setInterval(()=>{
    carouselIndexChange(1)
  },5000)
}
//依據index位置決定輪播容器移動的距離
const move = computed(()=>{
  const x =100*carouselNowIndex.value
  return `transform:translateX(-${x}%)`
})
</script>

<template>
  <div class="carousel" @touchstart="touchstartHandler" @touchend="touchendHandler(carouselIndexChange, $event)">
    <div class="itemWrap" :style="move">
      <div class="item" v-for="(product,i) in productsStore.products" :class="{selected:i===carouselNowIndex}">
        <RouterLink :to="'/'+product.id">
          <div class="img" v-for="img in product.imgs.slice(0,2)" :style="getBgStyle(img)"></div>
          <h3>{{ product.name }}</h3>
        </RouterLink>
      </div>
    </div>
    <div class="controlWrap">
      <div class="control" @click="carouselIndexChange(-1)"><i class="fa-solid fa-chevron-left"></i></div>
      <div class="control" @click="carouselIndexChange(+1)"><i class="fa-solid fa-chevron-right"></i></div>
    </div>
  </div>
  <div class="carouselIndex">
    <ul>
      <li v-for="n in productsStore.products.length" @click="carouselIndexpress(n-1)" :class="{ now:n-1 === carouselNowIndex }"></li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@import "@/style.scss";
.carousel{
  width: 100%;
  overflow: hidden;
  position: relative;
  border-radius: 20px;
  box-shadow: 0px 0px 15px -10px black;
  .itemWrap{ 
    width: 100%;
    display: flex;
    transform: translateX(0%); //JS計算移動距離
    transition: all 0.5s;
    .item{
      flex-shrink: 0;
      width: 100%;
      position: relative;
      background-color:white;
      @include flex_center;
      a{
        width: 100%;
        height: 100%;
        @include flex_center;
        &::after{
          content: '';
          width: 100%;
          height: 100%;
          position: absolute;
          z-index: 2;
          background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,1) 100%);
        }
        .img:nth-child(1){
          flex: 0 0 auto;
          width: 50%;
          padding-top: 40%; //高自動等於flex給的寬
          border-radius: 20px;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: rotate(0deg) translateX(5px) scale(1.3);
          transition: all 1s .5s;
        }
        .img:nth-child(2){
          flex: 0 0 auto;
          width: 50%;
          padding-top: 40%;
          border-radius: 20px;
          background-color: rgb(51, 255, 0);
          position: relative;
          opacity: 0;
          transform: rotate(-8deg) translateX(20px) scale(1.2);
          transition: all 1s .5s;
        }
        h3{
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          text-align: center;
          padding: 5px;
          border-radius: 10px;
          z-index: 2;
          background-color: #ffffffd3;
          opacity: 0;
          transition: all 1s .7s;
        }
      }
      &.selected{
        .img:nth-child(1){
          transform: rotate(-5deg) translateX(-15px) scale(1.2);
          opacity: 1;
        }
        .img:nth-child(2){
          transform: scale(1.1);
          opacity: 1;
        }
        h3{
          opacity: 1;
        }
      }
    }
  }
  .controlWrap{
    .control{
      position: absolute;
      top: 0;
      bottom: 0;
      left: 10px;
      margin: auto;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid rgb(199, 199, 199);
      cursor: pointer;
      transition: all .5s;
      &:hover{
        transform: scale(1.2);
      }
      &:last-child{
        left: unset;
        right: 10px;
      }
      @include flex_center;
      i{
        font-size: 16px;
        color: rgb(199, 199, 199);
      }
    }
  }
}
.carouselIndex{
  margin-top: 20px;
  ul{
    margin: auto;
    @include flex_center;
    flex-wrap: wrap;
    li{
      width: 20px;
      height: 20px;
      background-color: rgb(233, 233, 233);
      border-radius: 50%;
      margin: 5px;
      cursor: pointer;
      &:hover{
        background-color: rgb(241, 184, 184);
      }
      &:last-child{
        margin-right: 0;
      }
      @include tablet-768{
        display: none;
      }
      &.now{
        background-color: $color_orange;
      }
    }
  }
}
</style>