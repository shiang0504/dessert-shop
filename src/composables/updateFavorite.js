// import axios from 'axios'

export const updateFavorite=(item)=>{
  // const { id, favorite } = item
  // axios.patch(`/api/products/${id}/${favorite}`)  //改資料庫資料
  item.favorite = !item.favorite  //改前端資料
}