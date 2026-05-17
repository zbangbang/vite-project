import * as Cesium from 'cesium'
import * as THREE from 'three';

// ---------- 输入数据 ----------
const rawPositions = [
  { latitude: "31.5163235", longitude: "121.1042889", height: 0, name: "点1", id: "" },
  { latitude: "31.5163235", longitude: "121.1042889", height: 35, name: "", id: "" },
  { latitude: "31.5160144", longitude: "121.103856",  height: 35, name: "", id: "" },
  { latitude: "31.5148551", longitude: "121.1035628", height: 110, name: "", id: "" },
  { latitude: "31.5143795", longitude: "121.1028375", height: 110, name: "", id: "" },
  { latitude: "31.5139704", longitude: "121.1032281", height: 120, name: "", id: "" },
];

// ---------- 主函数 ----------
export function buildRoundedHybridPipe(viewer, raw, opt = {}) {
  const options = {
    pipeRadius: 0.45,           // 管径半径(m)
    bendRadius: 2.0,            // 转弯圆角半径(m)
    verticalTolerance: 0.03,    // 判定“垂直段”的水平容差(m)
    minVerticalLength: 0.2,     // 最短垂直段(m)
    minPointDistance: 0.01,     // 去重阈值(m)
    shapeSteps: 24,
    seamOverlap: 0.02,          // 接缝重叠，避免缝隙(m)
    material: Cesium.Color.ORANGE.withAlpha(0.95),
    ...opt
  };

  const base = dedupeConsecutive(raw.map(toCartesian), options.minPointDistance);
  const centerline = buildSmoothedCenterline(base, options.bendRadius, options.minPointDistance);
  const shape = makeCircleShape(options.pipeRadius, options.shapeSteps);

  const entities = [];
  let run = [centerline[0]];

  for (let i = 0; i < centerline.length - 1; i++) {
    const a = centerline[i];
    const b = centerline[i + 1];

    if (isVerticalSegment(a, b, options.verticalTolerance, options.minVerticalLength)) {
      if (run.length >= 2) {
        entities.push(viewer.entities.add({
          polylineVolume: {
            positions: run,
            shape,
            cornerType: Cesium.CornerType.ROUNDED,
            material: options.material
          }
        }));
      }
      run = [b];

      const ab = Cesium.Cartesian3.subtract(b, a, new Cesium.Cartesian3());
      const dir = Cesium.Cartesian3.normalize(ab, new Cesium.Cartesian3());
      const a2 = Cesium.Cartesian3.add(
        a,
        Cesium.Cartesian3.multiplyByScalar(dir, -options.seamOverlap, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );
      const b2 = Cesium.Cartesian3.add(
        b,
        Cesium.Cartesian3.multiplyByScalar(dir, options.seamOverlap, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );
      const mid = Cesium.Cartesian3.lerp(a2, b2, 0.5, new Cesium.Cartesian3());
      const len = Cesium.Cartesian3.distance(a2, b2);

      entities.push(viewer.entities.add({
        position: mid,
        cylinder: {
          length: len,
          topRadius: options.pipeRadius,
          bottomRadius: options.pipeRadius,
          material: options.material
        }
      }));
    } else {
      run.push(b);
    }
  }

  if (run.length >= 2) {
    entities.push(viewer.entities.add({
      polylineVolume: {
        positions: run,
        shape,
        cornerType: Cesium.CornerType.ROUNDED,
        material: options.material
      }
    }));
  }

  return { entities, centerline };
}

// ---------- 几何辅助 ----------
function toCartesian(p) {
  return Cesium.Cartesian3.fromDegrees(
    Number(p.longitude),
    Number(p.latitude),
    Number(p.height ?? 0)
  );
}

function dedupeConsecutive(points, minDist) {
  if (!points.length) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (Cesium.Cartesian3.distance(out[out.length - 1], points[i]) > minDist) out.push(points[i]);
  }
  return out;
}

function makeCircleShape(r, steps = 24) {
  const shape = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    shape.push(new Cesium.Cartesian2(Math.cos(a) * r, Math.sin(a) * r));
  }
  return shape;
}

function isVerticalSegment(a, b, horizontalTol = 0.03, minDz = 0.2) {
  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(a);
  const inv = Cesium.Matrix4.inverse(enu, new Cesium.Matrix4());
  const lb = Cesium.Matrix4.multiplyByPoint(inv, b, new Cesium.Cartesian3());
  const h = Math.hypot(lb.x, lb.y);
  const dz = Math.abs(lb.z);
  return h < horizontalTol && dz > minDz;
}

function buildSmoothedCenterline(points, bendRadius, eps = 0.01) {
  if (points.length < 3) return points.slice();
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const fillet = filletAt(points[i - 1], points[i], points[i + 1], bendRadius);
    if (!fillet) {
      if (Cesium.Cartesian3.distance(out[out.length - 1], points[i]) > eps) out.push(points[i]);
      continue;
    }
    if (Cesium.Cartesian3.distance(out[out.length - 1], fillet.A) > eps) out.push(fillet.A);
    out.push(...fillet.arc);
    if (Cesium.Cartesian3.distance(out[out.length - 1], fillet.B) > eps) out.push(fillet.B);
  }
  if (Cesium.Cartesian3.distance(out[out.length - 1], points[points.length - 1]) > eps) {
    out.push(points[points.length - 1]);
  }
  return out;
}

function filletAt(prev, curr, next, R) {
  const MIN_ANGLE = Cesium.Math.toRadians(3.0);
  const DEG10 = Math.PI / 18.0;

  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(curr);
  const inv = Cesium.Matrix4.inverse(enu, new Cesium.Matrix4());

  const p0 = Cesium.Matrix4.multiplyByPoint(inv, prev, new Cesium.Cartesian3());
  const p1 = Cesium.Matrix4.multiplyByPoint(inv, curr, new Cesium.Cartesian3());
  const p2 = Cesium.Matrix4.multiplyByPoint(inv, next, new Cesium.Cartesian3());

  const v1 = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(p0, p1, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );
  const v2 = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );

  const dot = Cesium.Math.clamp(Cesium.Cartesian3.dot(v1, v2), -1.0, 1.0);
  const theta = Math.acos(dot);
  if (theta < MIN_ANGLE || Math.PI - theta < MIN_ANGLE) return null;

  const len1 = Cesium.Cartesian3.distance(p0, p1);
  const len2 = Cesium.Cartesian3.distance(p2, p1);

  let t = R / Math.tan(theta / 2.0);
  const maxT = Math.min(len1, len2) * 0.45;
  t = Math.min(t, maxT);
  if (!isFinite(t) || t <= 0.01) return null;

  const A = Cesium.Cartesian3.add(p1, Cesium.Cartesian3.multiplyByScalar(v1, t, new Cesium.Cartesian3()), new Cesium.Cartesian3());
  const B = Cesium.Cartesian3.add(p1, Cesium.Cartesian3.multiplyByScalar(v2, t, new Cesium.Cartesian3()), new Cesium.Cartesian3());

  const bis = Cesium.Cartesian3.add(v1, v2, new Cesium.Cartesian3());
  if (Cesium.Cartesian3.magnitude(bis) < 1e-6) return null;
  Cesium.Cartesian3.normalize(bis, bis);

  const centerDist = R / Math.sin(theta / 2.0);
  const C = Cesium.Cartesian3.add(p1, Cesium.Cartesian3.multiplyByScalar(bis, centerDist, new Cesium.Cartesian3()), new Cesium.Cartesian3());

  const aDir = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(A, C, new Cesium.Cartesian3()), new Cesium.Cartesian3());
  const bDir = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(B, C, new Cesium.Cartesian3()), new Cesium.Cartesian3());

  let n = Cesium.Cartesian3.cross(aDir, bDir, new Cesium.Cartesian3());
  if (Cesium.Cartesian3.magnitude(n) < 1e-7) return null;
  n = Cesium.Cartesian3.normalize(n, n);

  const crossAB = Cesium.Cartesian3.cross(aDir, bDir, new Cesium.Cartesian3());
  const sweep = Math.atan2(Cesium.Cartesian3.dot(n, crossAB), Cesium.Cartesian3.dot(aDir, bDir));
  const segs = Math.max(8, Math.min(24, Math.ceil(theta / DEG10)));

  const arc = [];
  for (let i = 1; i < segs; i++) {
    const ang = (sweep * i) / segs;
    const d = rotateAroundAxis(aDir, n, ang);
    const local = Cesium.Cartesian3.add(C, Cesium.Cartesian3.multiplyByScalar(d, R, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    arc.push(Cesium.Matrix4.multiplyByPoint(enu, local, new Cesium.Cartesian3()));
  }

  return {
    A: Cesium.Matrix4.multiplyByPoint(enu, A, new Cesium.Cartesian3()),
    arc,
    B: Cesium.Matrix4.multiplyByPoint(enu, B, new Cesium.Cartesian3())
  };
}

function rotateAroundAxis(v, axis, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const term1 = Cesium.Cartesian3.multiplyByScalar(v, cos, new Cesium.Cartesian3());
  const term2 = Cesium.Cartesian3.multiplyByScalar(
    Cesium.Cartesian3.cross(axis, v, new Cesium.Cartesian3()),
    sin,
    new Cesium.Cartesian3()
  );
  const term3 = Cesium.Cartesian3.multiplyByScalar(
    axis,
    Cesium.Cartesian3.dot(axis, v) * (1 - cos),
    new Cesium.Cartesian3()
  );
  return Cesium.Cartesian3.add(Cesium.Cartesian3.add(term1, term2, new Cesium.Cartesian3()), term3, new Cesium.Cartesian3());
}


function createSmoothPipelinePath(points, radius = 2, segments = 12) {
    const newPoints = [];

    for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[i + 1];
        const prev = points[i - 1];

        if (!prev || !next) {
            // 起点和终点直接加入
            newPoints.push(current);
            continue;
        }

        // --- 计算倒角 ---
        // 指向前一个点的向量
        const vecToPrev = new THREE.Vector3().subVectors(prev, current).normalize();
        // 指向后一个点的向量
        const vecToNext = new THREE.Vector3().subVectors(next, current).normalize();

        // 计算实际可用的倒角距离（防止半径超过线段长度的一半）
        const distPrev = current.distanceTo(prev);
        const distNext = current.distanceTo(next);
        const actualRadius = Math.min(radius, distPrev / 2, distNext / 2);

        // 找到圆弧的两个切点
        const startPoint = new THREE.Vector3().addVectors(current, vecToPrev.multiplyScalar(actualRadius));
        const endPoint = new THREE.Vector3().addVectors(current, vecToNext.multiplyScalar(actualRadius));

        // 使用二次贝塞尔曲线模拟圆弧
        // 控制点就是原始的转角点 current
        const curve = new THREE.QuadraticBezierCurve3(startPoint, current, endPoint);

        // 将圆弧上的点加入数组
        const arcPoints = curve.getPoints(segments);
        newPoints.push(...arcPoints);
    }

    return newPoints;
}

/**
 * 自动计算半径并平滑路径
 * @param {THREE.Vector3[]} points 原始点
 * @param {Number} maxRadiusFactor 最大半径因子（0.1~0.5），表示圆角最多占用短边长度的比例
 */
function createSmoothPipelinePathAuto(points, maxRadiusFactor = 0.4) {
    const newPoints = [];

    for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[i + 1];
        const prev = points[i - 1];

        if (!prev || !next) {
            newPoints.push(current);
            continue;
        }

        // 1. 获取向量和长度
        const v1 = new THREE.Vector3().subVectors(prev, current);
        const v2 = new THREE.Vector3().subVectors(next, current);
        const len1 = v1.length();
        const len2 = v2.length();

        // 2. 计算夹角 (Radians)
        const angle = v1.angleTo(v2);

        // 3. 自动计算半径逻辑：
        // 夹角越小（越尖锐），需要的转弯空间越小
        // 半径不能超过相邻两段路程最短者的设定比例（maxRadiusFactor）
        const shortestSide = Math.min(len1, len2);
        let autoRadius = shortestSide * maxRadiusFactor;

        // 如果夹角非常钝（接近180度），几乎不需要平滑，可以进一步减小半径
        // 这里可以根据需求调整：autoRadius *= Math.sin(angle / 2);

        // 4. 寻找切点
        const vecToPrev = v1.clone().normalize();
        const vecToNext = v2.clone().normalize();

        const startPoint = new THREE.Vector3().addVectors(current, vecToPrev.multiplyScalar(autoRadius));
        const endPoint = new THREE.Vector3().addVectors(current, vecToNext.multiplyScalar(autoRadius));

        // 5. 使用贝塞尔曲线生成平滑点
        // 这里的 segments 可以根据 autoRadius 的大小动态调整，半径越大点越多
        const segments = Math.max(8, Math.floor(autoRadius * 2));
        const curve = new THREE.QuadraticBezierCurve3(startPoint, current, endPoint);

        const arcPoints = curve.getPoints(segments);

        // 避免重复添加切点
        if (newPoints.length > 0 && newPoints[newPoints.length - 1].equals(arcPoints[0])) {
            arcPoints.shift();
        }
        newPoints.push(...arcPoints);
    }

    return newPoints;
}
export function PolylineVolumeGeometryThree(
  positions: any[]
): Cesium.Geometry {
  let car3
	let arr = positions.map((item) => {
		car3 = Cesium.Cartesian3.fromDegrees(
			Number(item.longitude),
			Number(item.latitude),
			Number(item.height),
		)
		return new THREE.Vector3( car3.x, car3.y, car3.z )
	})
	// 2. 处理路径
  const smoothPath = createSmoothPipelinePathAuto(arr);

  const finalCurve = new THREE.CatmullRomCurve3(smoothPath);
	let tubeGeometry = new THREE.TubeGeometry( finalCurve, 50, 10, 12, false )

  const pos = new Float64Array(tubeGeometry.attributes.position.array);
  const indices = new Uint16Array(tubeGeometry.index?.array ?? pos.map((_, index) => index));
  const boundingSphere = Cesium.BoundingSphere.fromVertices(pos);
  const geometry = Cesium.GeometryPipeline.computeNormal(
      new Cesium.Geometry({
        attributes: {
          position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: tubeGeometry.attributes.position.itemSize,
            values: pos,
          }),
        },
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere,
      })
    );
  return geometry;
}