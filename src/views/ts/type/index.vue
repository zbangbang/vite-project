<template>
  <div>类型</div>
  <div>交叉类型：{{ p }}</div>
  <div>Pick：（联合类型约束）{{ user }}</div>
</template>

<script setup lang="ts">
import { stringLiteral } from '@babel/types'
import { ref } from 'vue'

/* 交叉类型 */
type Minix<M, N> = M & N

interface IPeople {
  name: string
  age: number
}

interface ITeacher {
  major: string
  grade: string
}

interface IStudent {
  class: string
}

type MinixPeople<T> = Minix<IPeople, T>

interface IPeopleConfig {
  teacher: MinixPeople<ITeacher>
  student: MinixPeople<IStudent>
}

let p = ref<IPeopleConfig>()
p.value = {
  student: {
    name: '1',
    age: 18,
    class: '班级一'
  },
  teacher: {
    name: 't1',
    age: 30,
    major: '语文',
    grade: '7年级'
  }
}
/* 交叉类型 */

/* 模拟pick，联合类型约束 */
interface IUser {
  name: string
  age: number
  weight: string
}

type MyPick<T, K extends keyof T> = {
  [S in K]: T[K]
}

type User = Pick<IUser, 'name' | 'age'>

let user = ref<User>({
  name: 'zzz',
  age: 16
})

/* 模拟pick，联合类型约束 */

/**
 * extends理解：
 * 例：A extends B => A中属性必须符合B中属性的要求，符合即为true，不符合即为false
 */

// ==> 参考  T extends Lengthwise  的理解
interface Lengthwise {
  length: number
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)
  return arg
}

// <== 参考  T extends Lengthwise  的理解

// ==> Test1<string | undefined> 传入不确定变量
//      string走一遍三元表达式；undefined走一遍三元表达式
type Other = boolean | number
type Test1<T> = T extends string ? T : Other
// 这里需要分别对比，T1出两个结果的结合
type T1 = Test1<string | undefined>
// 输出：string | boolean | number

type Test2<T> = T extends string ? Other : T
type T2 = Test2<string | undefined>
// 输出：boolean | number | undefined
// <== Test1<string | undefined> 传入不确定变量

type UType = string | number
type MyExclude<M, N> = M extends N ? never : M
type UType1 = MyExclude<UType, string>

type A2 = 'x' | 'y' extends 'x' ? string : number // string | number
/* extends */

/* 排除null undefined */
type NonNullable<T> = T extends null | undefined ? never : T
type E = NonNullable<string | null | number>
/* 排除null undefined */

/* 所有属性边可选 */
type Partial<T> = { [P in keyof T]?: T[P] }
interface Person {
  a: string
  b: number
}
type Per = Partial<Person>
let per: Per = {}
/* 所有属性边可选 */
</script>

<style lang="scss" scoped></style>
