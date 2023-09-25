<script setup>
import { ref, computed, watchEffect} from 'vue'
// pinia
import { storeToRefs } from 'pinia'

import { usetoggleStore } from '@/stores'
const toggleStore = usetoggleStore()

import { useCartProductsStore } from '@/stores/cartProducts'
const cartProductsStore = useCartProductsStore()
const { cartProducts } = storeToRefs(cartProductsStore)
const { deleteCart, correctCart } = cartProductsStore
// composables
import { getImageUrl } from '@/composables/getBackendAssets'



//// 其他邏輯
// 計算金額
const totalPrice = computed(()=>{
  let totle = 0
  cartProducts.value.forEach(i=>{
    if(i.select===true){
      totle += i.price*i.number
    }
  })
  return totle
})
// 運費
const freight=computed(()=>{
  if(totalPrice.value>=freightFree.value)return 0
  else return 80
})
// 免運門檻
const freightFree=ref(800)
// 距離免運門檻
const freightDeficiency = computed(()=>freightFree.value-totalPrice.value)
// 到達低消顯示百分比
const freightPercent = computed(()=>{
  if(totalPrice.value>=freightFree.value)return '100%'
  else return totalPrice.value / freightFree.value*100+'%'
})
// 折扣金額
const discount=computed(()=>{
  if(Object.keys(selectedCoupon.value).length===0){ //沒選到券
    return 0
  }else if(totalPrice.value<=selectedCoupon.value.min){ //沒超過低消 0
    return 0
  }else if(selectedCoupon.value.discount_percent){
    const discountPercent = 1 - selectedCoupon.value.discount_percent // 得到0.1折數
    if(selectedCoupon.value.discount_max===0){
      return Math.round(discountPercent*totalPrice.value)
    }else if((discountPercent*totalPrice.value)>selectedCoupon.value.discount_max){
      return selectedCoupon.value.discount_max
    }else{
      return Math.round(discountPercent*totalPrice.value)
    }
  }else if(selectedCoupon.value.discount_percent===''){
    return selectedCoupon.value.discount_minus
  }
})
// 計算總金額
const finalPrice = computed(()=>{
  let totle=totalPrice.value - discount.value + freight.value
  return totle
})
// 計算總件數
const totalItem = computed(()=>{
  let totle = 0
  cartProducts.value.forEach(i=>{
    if(i.select===true){
      totle += 1
    }
  })
  return totle})
// 購物車全選
const select=ref(true)
const selectAll=()=>{
  if(select.value){
    cartProducts.value.forEach(i=>{
    i.select=false
    })
  }else{
    cartProducts.value.forEach(i=>{
      i.select=true
    })
  }
}
// coupon折扣券
import couponsJson from '../../json/coupons.json'
const coupons = ref(couponsJson)

// 檢查折扣券日期是否在期限內+是否滿低消
watchEffect(()=>{
  const nowTime = new Date()
  coupons.value.forEach(i=>{
    const startTime = new Date(i.dateStart.year, i.dateStart.month-1, i.dateStart.date, i.dateStart.hours)
    const endTime = new Date(i.dateEnd.year, i.dateEnd.month-1, i.dateEnd.date, i.dateEnd.hours)
    if(nowTime>=startTime && nowTime<=endTime && totalPrice.value>=i.min){
      i.disabled= false
      i.remark=''
    }
    if(nowTime<startTime){
      i.disabled= true
      i.remark='折扣尚未開始'
      return
    }
    if(totalPrice.value<i.min){
      i.disabled= true
      i.remark='未達最低消費'
    }
  })
})
//過濾過期的折價券
const filterCoupons = computed(()=>{
  let arr = [...coupons.value] // 不動到原資料
  const nowTime = new Date()
  arr = arr.filter(i=>{
    const endTime = new Date(i.dateEnd.year, i.dateEnd.month-1, i.dateEnd.date, i.dateEnd.hours)
    return endTime>nowTime
  })
  return arr
})
//樣板使用
const selectedCoupon=ref({})
const couponsHide = ref(true)
const couponStatusToggle= computed(()=>{
  if(filterCoupons.value.length && Object.keys(selectedCoupon.value).length){
    return '已套用'
  }else if(filterCoupons.value.length){
    return '有'
  }else if(!filterCoupons.value.length){
    return '無'
  }
})
//totalPrice異動時，低於低消取消優惠券
watchEffect(()=>{
  if(Object.keys(selectedCoupon.value).length===0){
    return
  }else if(totalPrice.value < selectedCoupon.value.min){
    selectedCoupon.value={}
  }
})
// 加到最愛
// const moveProducts=(id)=>{
//   products.value.forEach(i=>{if(i.id===id)i.favorite=true})
//   //deleCartProducts(id)
// }
const checkout=()=>{
  alert('銘謝惠顧')
}
</script>

<template>
  <section class="cart" :class="{active: toggleStore.cartOpen}" @click.self="toggleStore.cartOpenToggle()">
    <div v-if="cartProducts.length" class="products">
      <i class="fa-solid fa-cart-shopping"></i>
      <i class="fa-regular fa-circle-xmark" @click="toggleStore.cartOpenToggle()"></i>
      <div class="item title">
        <div class="select">
          <input @click="selectAll" v-model="select" type="checkbox" name="" id="all">
          <label for="all">
            <div class="checkBox">
              <i class="fa-solid fa-check"></i>
            </div>
            <span>全選</span>
          </label>
        </div>
        <div class="img"></div>
        <div class="name">品名</div>
        <div class="price">單價</div>
        <div class="wrap">數量</div>
        <div class="totalPrice">總計</div>
        <div class="options"></div>
      </div>
      <TransitionGroup name="fadeOut" tag="div" mode='out-in' class="itemWrap">
      <div v-for="item in cartProducts" :key="item.id" class="item" >
        <div class="select">
          <input type="checkbox" name="" :id="item.id" v-model="item.select">
          <label :for="item.id">
            <div class="checkBox">
              <i class="fa-solid fa-check"></i>
            </div>
          </label>
        </div>
        <div class="img">
          <a :href="item.id"><img v-for="file in item.imgs.slice(0,2)" :src="getImageUrl(file)" alt=""></a>
        </div>
        <div class="name">
          <div><a :href="item.id">{{ item.name }}</a></div>
          <div>({{ item.unit }})</div>
        </div>
        <div class="price">{{ item.price }}</div>
        <div class="wrap">
          <div class="number">
            <i @click="correctCart(item.id, -1)" class="fa-solid fa-minus"></i>
            <div class="count">{{ item.number }}</div>
            <i @click="correctCart(item.id, 1)" class="fa-solid fa-plus"></i>
          </div>
        </div>
        <div class="totalPrice">{{ (item.price*item.number).toLocaleString() }}</div>
        <div class="options">
          <div @click="deleteCart(item.id)" class="delete"><i class="fa-solid fa-trash-can"></i></div>
          <!-- <div @click="moveProducts(item.id)" class="move">移至最愛</div> -->
        </div>
      </div>
      </TransitionGroup>
      <div v-if="totalPrice" class="check">
        <div class="freightWrap">
          <div class="freightBarWrap">
            <div class="freightBar"></div>
          </div>
          <Transition name="slideUp" mode="out-in">
            <h4 v-if="totalPrice>=freightFree" class="get"><i class="fa-solid fa-circle-check"></i>已達免運門檻!</h4>
            <h4 v-else>再消費{{ freightDeficiency }}元即享免運</h4>
          </Transition>
        </div>
        <div class="couponWrapCtrl" @click="couponsHide=!couponsHide">
          <div class="titles">
            <i class="fa-solid fa-caret-right" :class="{hide:couponsHide}"></i>
            <h4>折價券</h4>
          </div>
          <div class="status">
            <Transition name="slideUp" mode="out-in">
            <h4 v-if="couponStatusToggle==='已套用'" class="get">
              <i class="fa-solid fa-circle-check"></i>已套用折價券 (<span class="cancel" @click="selectedCoupon={}">取消</span>)</h4>
            <h4 v-else-if="couponStatusToggle==='有'">您有{{ filterCoupons.length }}張折價券</h4>
            <h4 v-else-if="couponStatusToggle==='無'">目前沒有折價券</h4>
            </Transition>
          </div>
        </div>
        <div class="couponWrap" :class="{hide:couponsHide}">
          <div v-for="coupon in filterCoupons" class="coupon" :class="{disabled:coupon.disabled}">
            <input type="radio" :id=coupon.id :value=coupon v-model="selectedCoupon" :disabled="coupon.disabled">
            <label :for=coupon.id>
              <div class="stub">
                <div class="radio">
                  <i class="fa-solid fa-check"></i>
                </div>
              </div>
              <div class="content">
                <span class="couponTitle">{{ coupon.title}}</span>
                <span class="expDate">{{coupon.dateStart.year}}/{{coupon.dateStart.month}}/{{coupon.dateStart.date}}/{{coupon.dateStart.hours}}:00-</span>
                <span class="expDate">{{coupon.dateEnd.year}}/{{coupon.dateEnd.month}}/{{coupon.dateEnd.date}}/{{coupon.dateEnd.hours}}:00</span>
                <span class="remark">{{ coupon.remark }}</span>
              </div>
            </label>
          </div>
        </div>
        <div class="checkoutDetail">
          <div class="checkoutPrice"><span class="checkoutTitle">小計：</span><span class="checkoutPrice">$ {{ totalPrice.toLocaleString() }}</span></div>
          <div v-if="!discount==0" class="checkoutDiscount"><span class="checkoutTitle">折扣：</span><span class="checkoutPrice">- $ {{ discount.toLocaleString() }}</span></div>
          <div class="checkoutFreight"><span class="checkoutTitle">運費：</span><span class="checkoutPrice">+ $ {{freight.toLocaleString()}}</span></div>
          <div class="checkoutFinalPrice"><span class="checkoutTitle">總金額({{ totalItem }}件商品)：</span><span class="checkoutPrice">NT$ {{ finalPrice.toLocaleString() }}</span></div>
          <div class="checkout fa-beat" @click="checkout">確認結帳</div>
        </div>
      </div>
      <div v-else class="noSelect">請選擇一項以上商品(勾選商品前方框框)</div>
    </div>
    <div v-else class="noProducts">
      <div class="img">
        <img src="@/assets/001.png" alt="">
      </div>
      <div class="msg">購物車是空的...</div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@import "@/assets/favorAndCart.scss";
</style>