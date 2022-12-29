/**
 * 数据库表结构
*/
const storeList = [
  {
    name: 'sessionList',
    key: 'symbol',           //主键sessionSymbol   g/u-1-belong groupId/fromuid-type-sessionOwnerId
    cursorIndex: [
      {
        name: 'belong',       //属于哪个用户的session
        unique: false
      }
    ]
  },
  {
    name: 'messages',
    autoIncrement: true,
    cursorIndex: [
      {
        name: 'symbol',       //其他id-type-主id
        unique: false
      }
   ]
  },
  {
    name: 'updateTime',
    key: 'userId'
  }
]

export default storeList
