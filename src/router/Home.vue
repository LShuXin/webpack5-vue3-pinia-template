<template>
  <h1>Home{{ state.count }}</h1>
  <button @click="addRecord">点击</button>
  <div v-for="(item, idx) in state.msgList">{{ item.a + '' + item.b }}</div>
</template>

<script>
import { reactive } from 'vue'
import db from '@/utils/db'
export default {
  // `setup` 是一个专门用于组合式 API 的特殊钩子函数
  setup() {
    const state = reactive({
      count: 0,
      msgList: [ {'a': 1, b: 2}],
      db: null
    })

    const addRecord = async () => {
      try {
        db.open()
        // db.add('sessionList', {symbol: +new Date(), belong: 'ddddd'})
        // db.add('messages', {symbol: +new Date(), content: '{}', type: Math.random()})
        // db.add('updateTime', {updateTime: +new Date(), userId: +new Date()})
      } catch (err) {
        console.log(`添加记录失败: ${err}`)
      }
    }

    



    function increment() {
      
      state.count++
    }



    // 不要忘记同时暴露 increment 函数
    return {
      state,
      increment,
      addRecord,
    }
  }
}
</script>