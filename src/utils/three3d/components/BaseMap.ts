import {
  Mesh,
  Vector2,
  Color,
  Group,
  Object3D,
  BufferAttribute,
  Shape,
  ExtrudeGeometry,
  MeshBasicMaterial,
  DoubleSide,
  ShapeGeometry,
  Vector3,
} from "three";
import { transfromMapGeoJSON, getBoundBox } from "../utils/utils";
import { geoMercator } from "d3-geo";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export class BaseMap {
  mapGroup: Group;
  coordinates: any[];
  config: any;

  constructor({}: any, config: any = {}) {
    this.mapGroup = new Group();
    this.coordinates = [];
    this.config = Object.assign(
      {
        position: new Vector3(0, 0, 0),
        geoProjectionCenter: new Vector2(0, 0),
        geoProjectionScale: 120,
        data: "",
        renderOrder: 1,
        merge: false,
        material: new MeshBasicMaterial({
          color: 0x18263b,
          transparent: true,
          opacity: 1,
        }),
      },
      config
    );
    this.mapGroup.position.copy(this.config.position);
    let mapData = transfromMapGeoJSON(this.config.data);
    this.create(mapData);
  }
  geoProjection(args: any): any {
    return geoMercator()
      .center(this.config.geoProjectionCenter)
      .scale(this.config.geoProjectionScale)
      .translate([0, 0])(args);
  }
  create(mapData: any): void {
    let { merge } = this.config;
    let shapes: any[] = [];
    mapData.features.forEach((feature: any) => {
      const group = new Object3D();

      let { name, center = [], centroid = [] } = feature.properties;
      this.coordinates.push({ name, center, centroid });
      group.userData.name = name;
      feature.geometry.coordinates.forEach((multiPolygon: any) => {
        multiPolygon.forEach((polygon: any) => {
          const shape = new Shape();
          for (let i = 0; i < polygon.length; i++) {
            if (!polygon[i][0] || !polygon[i][1]) {
              return false;
            }
            const [x, y] = this.geoProjection(polygon[i]);
            if (i === 0) {
              shape.moveTo(x, -y);
            }
            shape.lineTo(x, -y);
          }

          const geometry = new ShapeGeometry(shape);
          if (merge) {
            shapes.push(geometry);
          } else {
            const mesh = new Mesh(geometry, this.config.material);
            mesh.renderOrder = this.config.renderOrder;
            mesh.userData.name = name;
            group.add(mesh);
          }
        });
      });
      if (!merge) {
        this.mapGroup.add(group);
      }
    });
    if (merge) {
      let geometry = mergeGeometries(shapes);
      const mesh = new Mesh(geometry, this.config.material);
      mesh.renderOrder = this.config.renderOrder;
      this.mapGroup.add(mesh);
    }
  }

  getCoordinates(): any[] {
    return this.coordinates;
  }
  setParent(parent: any): void {
    parent.add(this.mapGroup);
  }
}
