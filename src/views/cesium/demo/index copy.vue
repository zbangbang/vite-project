<template>
	<div class="w-full h-full relative">
		<div id="MapContainer"></div>
		<div class="absolute top-10 right-5 left-12 flex flex-wrap">
			<div
				class="bg-yellow-100 px-3 py-2 mr-1 mb-1 cursor-pointer"
				:class="[item.flag ? 'text-[#79d9ff]' : '']"
				v-for="(item, index) in btnList"
				:key="index"
				@click="changeItem(item)"
			>
				{{ item.label }}
			</div>
		</div>

		<div class="absolute left-4 bottom-32 bg-[#fff] rounded px-4 py-2">
			当前层级：{{ nowLevel }}
		</div>
		<div class="absolute left-4 bottom-48 bg-[#fff] rounded px-4 py-2">
			可视范围：
			<br />{{ rectangle.south }}~{{ rectangle.north }}<br />{{
				rectangle.west
			}}~{{ rectangle.east }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import testImg from '@/assets/tex.png'
import useCesium from '@/hooks/cesium/useCesium'
import { BtnType, IBtn, btnTypeList, imgList } from './config'
import * as Cesium from 'cesium'
const { viewer } = useCesium('MapContainer')

// 按钮切换
const btnList = ref(btnTypeList)
const changeItem = (btnItem: IBtn) => {
	btnItem.flag = !btnItem.flag
	switch (btnItem.value) {
		case BtnType.层级:
			openCesiumLevel()
			// openCesiumLevel2()
			break
		case BtnType.导出图片:
			saveToImage()
			break
		case BtnType.开启事件:
			openEvent()
			break
		case BtnType.表面坐标拾取:
			pickOnlyGlobe()
			break
		case BtnType.拾取几何体:
			// pickEntityPosition()
			addEntity()
			break
		default:
			break
	}
}

let tiles = new Set()
const nowLevel = ref(0)
/**
 * @Date: 2024-08-29 17:20:36
 * @Description: 计算最大层级
 * @return {*}
 */
const tileLevel = () => {
	tiles.clear()
	let tilesToRender = viewer.value.scene.globe._surface._tilesToRender
	if (Cesium.defined(tilesToRender)) {
		for (let i = 0; i < tilesToRender.length; i++) {
			tiles.add(tilesToRender[i].level)
		}
		nowLevel.value = Math.max(...tiles)
		console.log('当前地图瓦片级别为:')
		console.log(nowLevel.value)
	}
}

const rectangle = ref({
	east: '',
	north: '',
	south: '',
	west: '',
})
/**
 * @Date: 2024-08-25 16:26:26
 * @Description: 获取当前可视范围
 * @return {*}
 */
const getViewRectangle = () => {
	let rect = viewer.value.camera.computeViewRectangle()
	rectangle.value = {
		east: Number(Cesium.Math.toDegrees(rect.east).toFixed(4)),
		north: Number(Cesium.Math.toDegrees(rect.north).toFixed(4)),
		south: Number(Cesium.Math.toDegrees(rect.south).toFixed(4)),
		west: Number(Cesium.Math.toDegrees(rect.west).toFixed(4)),
	}
	console.log('可视范围为：', {
		east: Cesium.Math.toDegrees(rect.east),
		north: Cesium.Math.toDegrees(rect.north),
		south: Cesium.Math.toDegrees(rect.south),
		west: Cesium.Math.toDegrees(rect.west),
	})
}
/**
 * @Date: 2024-08-25 15:08:27
 * @Description: 层级监听
 * @return {*}
 */
const openCesiumLevel = () => {
	viewer.value.camera.changed.addEventListener(() => {
		tileLevel()
		getViewRectangle()
	})
}

/**
 * @Date: 2024-08-29 17:11:53
 * @Description: 高度转层级
 * @param {*} height
 * @return {*}
 */
const heightToZoom = (height: number) => {
	let A = 40487.57
	let B = 0.00007096758
	let C = 91610.74
	let D = -40467.74
	return Math.round(D + (A - D) / (1 + Math.pow(height / C, B)))
}
/**
 * @Date: 2024-08-25 15:33:21
 * @Description: 获取层级方法二
 * @return {*}
 */
const openCesiumLevel2 = () => {
	viewer.value.camera.changed.addEventListener(() => {
		const height = Math.ceil(viewer.value.camera.positionCartographic.height)
		nowLevel.value = heightToZoom(height)
	})
}

/**
 * @Date: 2024-08-25 16:19:04
 * @Description: 导出图片
 * @return {*}
 */
const saveToImage = () => {
	let canvas = viewer.value.scene.canvas
	let image = canvas.toDataURL('image/png')

	let link = document.createElement('a')
	link.download = 'scene.png'
	link.href = image
	link.click()
}

/**
 * @Date: 2024-08-27 23:10:56
 * @Description: 开启事件
 * @return {*}
 */
const openEvent = () => {
	const handler = new Cesium.ScreenSpaceEventHandler(viewer.value?.canvas)
	handler.setInputAction(
		(ev: any) => {
			console.log(ev)
			setTimeout(() => {
				handler && handler.destroy()
			})
		},
		Cesium.ScreenSpaceEventType.LEFT_CLICK,
		Cesium.KeyboardEventModifier.CTRL
	)

	viewer.value?.scene.preUpdate.addEventListener(() => {
		console.log('preUpdate')
	})
	viewer.value?.scene.postUpdate.addEventListener(() => {
		console.log('postUpdate')
	})
	viewer.value?.scene.preRender.addEventListener(() => {
		console.log('preRender')
		const cartesian3 = Cesium.Cartesian3.fromDegrees(115, 20)
		const heading = Cesium.Math.toRadians(60)
		const pitch = Cesium.Math.toRadians(30)
		const range = 5000
		viewer.value?.camera.lookAt(
			cartesian3,
			new Cesium.HeadingPitchRange(heading, pitch, range)
		)
	})

	const postRenderCallback = () => {
		console.log('postRender')
	}
	viewer.value?.scene.postRender.addEventListener(postRenderCallback)
	viewer.value?.scene.postRender.removeEventListener(postRenderCallback)
}

/**
 * @Date: 2024-08-27 23:12:17
 * @Description: 仅拾取球体表面坐标
 * @return {*}
 */
const pickOnlyGlobe = () => {
	const handler = new Cesium.ScreenSpaceEventHandler(viewer.value?.canvas)
	handler.setInputAction((ev: any) => {
		let position = viewer.value.scene.camera.pickEllipsoid(
			ev.position,
			viewer.value.scene.globe.ellipsoid
		)
		console.log(position)
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

/**
 * @Date: 2024-08-27 23:32:58
 * @Description: 拾取地形高程坐标
 * @return {*}
 */
const pickTerrainPos = () => {
	const handler = new Cesium.ScreenSpaceEventHandler(viewer.value?.canvas)
	handler.setInputAction((ev: any) => {
		let ray = viewer.value.camera.getPickRay(ev.position)
		let position = viewer.value.scene.globe.pick(ray, viewer.value.scene)
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

const addEntity = () => {
	// 让时间动起来
	viewer.value!.clock.shouldAnimate = true

	const colorList = [
		new Cesium.Color(0.0, 1.0, 0.0, 1.0),
		new Cesium.Color(1.0, 0.0, 0.0, 1.0),
		new Cesium.Color(0.0, 0.0, 1.0, 1.0),
	]
	let color = colorList[0]
	let index = 0
	setInterval(() => {
		index = (index + 1) % 3
		color = colorList[index]
	}, 1000)

	let lat, lon
	let testPos
	const testEntity = viewer.value.entities.add({
		name: 'entity',
		position: new Cesium.CallbackProperty(() => {
			lon = 117.0 + Math.sin(Cesium.JulianDate.now().secondsOfDay) * 10.0
			lat = 40.0 + Math.cos(Cesium.JulianDate.now().secondsOfDay) * 5.0
			testPos = Cesium.Cartesian3.fromDegrees(lon, lat, 300000.0)
			return testPos
		}, false),
		box: {
			dimensions: new Cesium.Cartesian3(500000.0, 500000.0, 500000.0),
			material: new Cesium.ColorMaterialProperty(
				new Cesium.CallbackProperty(() => {
					return color
				}, false)
			),
			outline: true,
		},
	})
	viewer.value?.scene.preUpdate.addEventListener(() => {
		viewer.value?.scene.camera.lookAt(
			testPos,
			new Cesium.HeadingPitchRange(
				Cesium.Math.toRadians(50.0),
				Cesium.Math.toRadians(-20.0),
				1500000
			)
		)
	})
	// viewer.value.trackedEntity = testEntity

	viewer.value?.scene.primitives.add(
		new Cesium.Primitive({
			geometryInstances: new Cesium.GeometryInstance({
				geometry: Cesium.BoxGeometry.fromDimensions({
					vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
					dimensions: new Cesium.Cartesian3(500000, 500000, 500000),
				}),
				modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
					Cesium.Cartesian3.fromDegrees(110, 25, 300000)
				),
				id: 'Primitive',
			}),
			appearance: new Cesium.EllipsoidSurfaceAppearance({
				material: new Cesium.Material({
					fabric: {
						type: 'Color',
						uniforms: {
							color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
						},
					},
				}),
			}),
		})
	)

	viewer.value?.scene.primitives.add(
		new Cesium.Primitive({
			geometryInstances: new Cesium.GeometryInstance({
				geometry: Cesium.BoxOutlineGeometry.fromDimensions({
					// vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
					dimensions: new Cesium.Cartesian3(500000, 500000, 500000),
				}),
				modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
					Cesium.Cartesian3.fromDegrees(110, 25, 300000)
				),
				id: 'PrimitiveOutline',
				attributes: {
					color: Cesium.ColorGeometryInstanceAttribute.fromColor(
						Cesium.Color.BLACK
					),
				},
			}),
			appearance: new Cesium.PerInstanceColorAppearance({
				flat: true,
				translucent: false,
				// renderState: {
				//   lineWidth: Math.min(4.0, scene.maximumAliasedLineWidth),
				// },
			}),
		})
	)
	// https://www.nirsoft.net/panel/

	const points = new Cesium.PointPrimitiveCollection()
	viewer.value?.scene.primitives.add(points)
	for (let i = 0; i < 20000; i++) {
		points.add({
			position: Cesium.Cartesian3.fromDegrees(
				Math.random() * 180,
				Math.random() * 80,
				100
			),
			color: Cesium.Color.YELLOW,
		})
	}
}
/**
 * @Date: 2024-08-29 16:26:32
 * @Description: 拾取几何体
 * @return {*}
 */
const pickEntity = () => {
	addEntity()
	const handler = new Cesium.ScreenSpaceEventHandler(viewer.value?.canvas)
	handler.setInputAction((ev: any) => {
		let entity = viewer.value.scene.pick(ev.position)
		if (Cesium.defined(entity)) {
			console.log(entity.id)
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

/**
 * @Date: 2024-08-29 16:53:59
 * @Description: 拾取位置坐标
 * @return {*}
 */
const pickEntityPosition = () => {
	addEntity()
	const handler = new Cesium.ScreenSpaceEventHandler(viewer.value?.canvas)
	handler.setInputAction((ev: any) => {
		let position = viewer.value.scene.pickPosition(ev.position)
		const cartographic = Cesium.Cartographic.fromCartesian(position)
		const lat = Cesium.Math.toDegrees(cartographic.latitude)
		const lon = Cesium.Math.toDegrees(cartographic.longitude)
		const alt = cartographic.height
		console.log(lat, lon, alt)
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}
</script>

<style lang="scss" scoped></style>
