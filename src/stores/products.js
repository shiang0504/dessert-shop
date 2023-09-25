import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
// import axios from 'axios'
import productsJson from '../../json/products.json'

export const useProductsStore = defineStore('products', () => {
  // State: 商品資料
  const products = ref([])
  const isBusy = ref(false)
  const serverError = ref(false)
  // Action: 跟後端api拿資料的方法
  async function getProducts(){
    try{
      isBusy.value = true
      // const res = await axios.get('/api/products')
      // products.value = res.data
      // console.log(productsJson)
      products.value = JSON.parse(localStorage.getItem('products')) || productsJson
      console.log(products.value)
      isBusy.value = false
    }catch(err){
      serverError.value = true
    }
  }
  watch(products, (renew)=>{
    localStorage.setItem('products', JSON.stringify(renew))
  },{ deep: true })

  // Getter: 取得最愛商品
  const favoriteProducts = computed(()=> products.value.filter(i=>i.favorite===true))
  
  return { products, getProducts, isBusy, serverError, favoriteProducts }
})