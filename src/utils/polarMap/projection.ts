// projection.ts
import proj4 from 'proj4'

// 定义 EPSG:3413（北半球极地投影）
proj4.defs(
  'EPSG:3413',
  '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
)

export function latLonToPolar(lat: number, lon: number): [number, number] {
  const source = 'EPSG:4326' // WGS84
  const dest = 'EPSG:3413' // 极地投影
  return proj4(source, dest, [lon, lat]) as [number, number]
}
