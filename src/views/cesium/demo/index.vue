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
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import * as Cesium from 'cesium'
import * as THREE from 'three'
import testImg from '@/assets/tex.png'
import useCesium from '@/hooks/cesium/useCesium'
import { BtnType, IBtn, btnTypeList, imgList } from './config'
import {buildRoundedHybridPipe, PolylineVolumeGeometryThree} from './line'
const { viewer } = useCesium('MapContainer')

// 按钮切换
const btnList = ref(btnTypeList)
const changeItem = (btnItem: IBtn) => {
	btnItem.flag = !btnItem.flag
	switch (btnItem.value) {
		case BtnType.空间线:
			loadPolylineVolume()
			loadThreeLine()
			break
		default:
			break
	}
}
const points = [
	{
		latitude: '31.5163235',
		name: '点1',
		id: '',
		height: 0,
		longitude: '121.1042889',
	},
	{
		latitude: '31.5163235',
		name: '',
		id: '',
		height: 35,
		longitude: '121.1042889',
	},
	{
		latitude: '31.5160144',
		name: '',
		id: '',
		height: 35,
		longitude: '121.103856',
	},
	{
		latitude: '31.5148551',
		name: '',
		id: '',
		height: 110,
		longitude: '121.1035628',
	},
	{
		latitude: '31.5143795',
		name: '',
		id: '',
		height: 110,
		longitude: '121.1028375',
	},
	{
		latitude: '31.5139704',
		name: '',
		id: '',
		height: 120,
		longitude: '121.1032281',
	},
]
// 绘制管道
const createLineVolume = (id: string, positions: any, options: any) => {
	const { dis, color } = options
	const pipleCollection = new Cesium.PrimitiveCollection()
	viewer.value!.scene.primitives.add(pipleCollection)

	function computeCircle(radius: number) {
		const positions = []
		for (let i = 0; i < 360; i++) {
			const radians = Cesium.Math.toRadians(i)
			positions.push(
				new Cesium.Cartesian2(
					radius * Math.cos(radians),
					radius * Math.sin(radians),
				),
			)
		}
		console.log(positions);
		return positions
	}
	const lineVolumeGeometry = new Cesium.GeometryInstance({
		geometry: new Cesium.PolylineVolumeGeometry({
			polylinePositions: positions,
			vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
			shapePositions: computeCircle(dis),
			// granularity: Cesium.Math.RADIANS_PER_DEGREE,
			cornerType: Cesium.CornerType.MITERED,
		}),
		attributes: {
			color: Cesium.ColorGeometryInstanceAttribute.fromColor(
				Cesium.Color.fromCssColorString(color) ||
					Cesium.Color.fromCssColorString('rgba(44, 105, 154, 0.7)'),
			),
		},
	})
	const lineVolume = new Cesium.Primitive({
		geometryInstances: [lineVolumeGeometry],
		appearance: new Cesium.PerInstanceColorAppearance({
			translucent: true,
			// closed: true,
		}),
	})
	pipleCollection.add(lineVolume)
}
const createLine = (id: string, positions: any, options: any) => {
	const { color } = options
	const pipleCollection = new Cesium.PrimitiveCollection()
	viewer.value!.scene.primitives.add(pipleCollection)

	const lineVolumeGeometry = new Cesium.GeometryInstance({
		geometry: new Cesium.PolylineGeometry({
			positions: positions,
			width: 2.0,
			vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
		}),
		attributes: {
			color: Cesium.ColorGeometryInstanceAttribute.fromColor(
				new Cesium.Color(1.0, 0.0, 0.0, 0.8),
			),
		},
	})
	const lineVolume = new Cesium.Primitive({
		geometryInstances: [lineVolumeGeometry],
		appearance: new Cesium.PolylineColorAppearance(),
	})
	pipleCollection.add(lineVolume)
}
const loadPolylineVolume = () => {
	let arr = points.map((item) => {
		return Cesium.Cartesian3.fromDegrees(
			Number(item.longitude),
			Number(item.latitude),
			Number(item.height),
		)
	})
	// createLineVolume('lineVolume', arr, {
	// 	dis: 6,
	// 	color: 'rgba(44, 105, 154, 0.7)',
	// })
	createLine('lineVolume', arr, {
		color: 'rgba(255, 0, 0, 0.7)',
	})

	viewer.value!.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(121.1042889, 31.5163235, 500),
		duration: 1,
	})

}

const loadThreeLine = () => {
	const testCollection = new Cesium.PrimitiveCollection()
	viewer.value!.scene.primitives.add(testCollection)

	const geometry= PolylineVolumeGeometryThree(points)


	// const pipeSpline = new THREE.CatmullRomCurve3(arr)
	// pipeSpline.closed = false;
	// const extrudeSettings1 = {
	// 				steps: 1000,
	// 				bevelEnabled: true,
	// 				extrudePath: pipeSpline,
	// 			};

	// 			const pts1 = []
	// const l = 20;
	// 			for (let i = 0; i < 360; i++) {
	// 				const a = (i / 360) * Math.PI * 2;
	// 				pts1.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
	// 			}

	// 			const shape1 = new THREE.Shape(pts1);

	// 			const geometry1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings1);
	// 			const geometry= geometryThreeToCesium(geometry1)

	const lineVolumeGeometry = new Cesium.GeometryInstance({
		geometry: geometry,
		attributes: {
			color: Cesium.ColorGeometryInstanceAttribute.fromColor(
				Cesium.Color.fromCssColorString('rgba(44, 105, 154, 0.7)') ||
					Cesium.Color.fromCssColorString('rgba(44, 105, 154, 0.7)'),
			),
		},
	})
	const lineVolume = new Cesium.Primitive({
		geometryInstances: [lineVolumeGeometry],
		appearance: new Cesium.PerInstanceColorAppearance({
			translucent: true,
			// closed: true,
		}),
		asynchronous: false,
		compressVertices: false
	})
	testCollection.add(lineVolume)
}
</script>

<style lang="scss" scoped></style>
