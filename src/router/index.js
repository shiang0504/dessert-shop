import { createRouter, createWebHistory } from "vue-router";
import productAll from "../views/productAll.vue"
import id from "../views/[id].vue"
import productNotFound from "../views/productNotFound.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),   // 決定Router的呈現形式
  routes: [
    {
      path: "/",           // [2-1] 對應RouterLink的to(a href的目標)
      name: "All",         // 識別名稱
      component: productAll,
    },
    {
      path: "/:id",
      name: "id",
      component: id,

    }, 
    {
      path: "/:pathMatch(.*)*",
      name: "notFound",
      component: productNotFound,
    }, 
  ]
})
export default router