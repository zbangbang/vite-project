import { reactive } from 'vue'

type listItem = {
  name: string
  type: string
}

const list = reactive<listItem[]>([
  { name: '111', type: '1' },
  {
    name: '222',
    type: '2'
  }
])

const listDom = () => {
  return (
    <>
      {list.map((item, index) => {
        return <div onClick={click}>{item.name}</div>
      })}
    </>
  )
}

const click = (e: MouseEvent) => {
  console.log(e)
}

export default listDom
