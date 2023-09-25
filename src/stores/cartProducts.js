import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useCartProductsStore = defineStore('cartProducts', () => {
  //State
  const cartProducts = ref(JSON.parse(localStorage.getItem('cartProducts')) || [])
  
  watch(cartProducts, (newData)=>{
    localStorage.setItem('cartProducts',JSON.stringify(newData))
  },{ deep: true })
  
  //Action
  function addCart(item){
    if(item.animation===true)return
    const index = cartProducts.value.findIndex(i=>i.id===item.id)
    if(index===-1){
      cartProducts.value.push({...item})
    }else{
      cartProducts.value[index].number += item.number
    }
    item.number=1
    item.animation=true
  }
  function infoToggle(item){
    setTimeout(()=>{
      item.animation=false
    },2000)  
  }
  function deleteCart(id){
    const index = cartProducts.value.findIndex(i=>i.id===id)
    cartProducts.value.splice(index,1)
  }
  function correctCart(id, cor){
    const index = cartProducts.value.findIndex(i=>i.id===id)
    let item = cartProducts.value[index].number
    if(cor===1) item >=20 ? item : cartProducts.value[index].number++
    else item === 1 ? deleteCart(id) : cartProducts.value[index].number--
  }
  return { cartProducts, addCart, infoToggle, deleteCart, correctCart }
})