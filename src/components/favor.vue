<script setup>
// pinia
import { usetoggleStore } from '@/stores'
const toggleStore = usetoggleStore()

import { useProductsStore } from '@/stores/products'
const productsStore = useProductsStore()
// productsStore.getProducts()

import { useCartProductsStore } from '@/stores/cartProducts'
const cartProductsStore = useCartProductsStore()
const { addCart, infoToggle } = cartProductsStore

// composables
import { updateFavorite } from '@/composables/updateFavorite'
import { getImageUrl } from '@/composables/getBackendAssets'

</script>
<template>
  <section class="favor" :class="{active:toggleStore.favoriteOpen}" @click.self="toggleStore.favoriteOpenToggle()">
    <div v-if="productsStore.favoriteProducts.length" class="products">
      <i class="fa-solid fa-heart"></i>
      <i class="fa-regular fa-circle-xmark" @click="toggleStore.favoriteOpenToggle()"></i>
      <div class="item title">
        <div class="img"></div>
        <div class="name">品名</div>
        <div class="price">單價</div>
        <div class="wrap">數量</div>
        <div class="totalPrice">總計</div>
        <div class="options"></div>
      </div>
      <TransitionGroup name="fadeOut" tag="div" mode='out-in'>
      <div v-for="item in productsStore.favoriteProducts" :key="item.id" class="item" >
        <div class="img">
          <a :href="item.id"><img v-for="file in item.imgs.slice(0,2)" :src=getImageUrl(file) alt=""></a>
        </div>
        <div class="name">
          <div><a :href="item.id">{{ item.name }}</a></div>
          <div>({{ item.unit }})</div>
        </div>
        <div class="price">{{ item.price }}</div>
        <div class="wrap">
          <div class="number">
            <i @click="item.number<=1?item.number:item.number--" class="fa-solid fa-minus"></i>
            <div class="count">{{ item.number }}</div>
            <i @click="item.number>=20?item.number:item.number++" class="fa-solid fa-plus"></i>
          </div>
        </div>
        <div class="totalPrice">{{ (item.price*item.number).toLocaleString() }}</div>
        <div class="options">
          <div @click="addCart(item)">
          <Transition name="slideUp" @after-leave="infoToggle(item)" mode="out-in">
            <div v-if="item.animation">加入成功!</div>
            <div v-else>加入購物車</div>
          </Transition>
          </div>
          <!-- <div @click="item.favorite=!item.favorite">移出最愛</div> -->
          <div @click="updateFavorite(item)">移出最愛</div>
        </div>
      </div>
      </TransitionGroup>
    </div>
    <div v-else class="noProducts">
      <div class="img">
        <img src="@/assets/002.png" alt="">
      </div>
      <div class="msg">最愛項目是空的...</div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
@import "@/assets/favorAndCart.scss";
</style>