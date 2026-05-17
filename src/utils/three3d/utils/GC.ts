// 材质销毁
const materialDispose = (material: any): void => {
  if (material instanceof Array) {
    material.forEach(materialDispose);
  } else {
    if (material.map) {
      material.map.dispose();
    }
    material.dispose();
  }
};
// 销毁
const deallocate = (obj: any): void => {
  if (obj.geometry) {
    obj.geometry.dispose();
  }
  if (obj.material) {
    materialDispose(obj.material);
  }
  if (obj.texture) {
    obj.texture.dispose();
  }
  if (obj.children) {
    obj.children.forEach(deallocate);
  }
};
// 清空对象
const emptyObject = (obj: any): void => {
  if (obj && obj.children)
    while (obj.children.length) {
      const childObj = obj.children[0];
      obj.remove(childObj);
      deallocate(childObj);
    }
};

export { emptyObject, deallocate };
