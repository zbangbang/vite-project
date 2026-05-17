import { Material, Texture, Object3D, Mesh } from "three";

interface DisposableResource {
  dispose?: () => void;
  clear?: () => void;
  type?: number | string;
}

interface ShaderMaterial extends Material {
  uniforms?: Record<string, { value: any }>;
}

export class ResourceTracker {
  resources = new Set<any>();
  constructor() {}
  track(resource: any): any {
    if (!resource) {
      return resource;
    }

    // handle children and when material is an array of materials or
    // uniform is array of textures
    if (Array.isArray(resource)) {
      resource.forEach((resource) => this.track(resource));
      return resource;
    }

    if (
      resource.type !== "Scene" &&
      (resource.dispose || resource instanceof Object3D)
    ) {
      this.resources.add(resource);
    }
    if (resource instanceof Object3D) {
      // Type assertion for Mesh to access geometry and material
      if ("geometry" in resource) {
        this.track((resource as any).geometry);
      }
      if ("material" in resource) {
        this.track((resource as any).material);
      }
      this.track(resource.children);
    } else if (resource instanceof Material) {
      // We have to check if there are any textures on the material
      for (const value of Object.values(resource)) {
        if (value instanceof Texture) {
          this.track(value);
        }
      }
      // We also have to check if any uniforms reference textures or arrays of textures

      if ((resource as ShaderMaterial).uniforms) {
        for (const value of Object.values(
          (resource as ShaderMaterial).uniforms!
        )) {
          if (value) {
            const uniformValue = (value as any).value;
            if (
              uniformValue instanceof Texture ||
              Array.isArray(uniformValue)
            ) {
              this.track(uniformValue);
            }
          }
        }
      }
    }
    return resource;
  }
  untrack(resource: any): void {
    this.resources.delete(resource);
  }
  dispose() {
    try {
      for (const resource of this.resources) {
        if (resource instanceof Object3D) {
          if (resource.parent) {
            resource.parent.remove(resource);
          }
        }
        const disposableResource = resource as DisposableResource;
        if (disposableResource.dispose) {
          if (disposableResource.type === 1009) {
            disposableResource.dispose();
          }
          disposableResource.dispose();
        }
        !!disposableResource.clear && disposableResource.clear();
      }
      this.resources.clear();
    } catch (error) {
      console.log(error);
    }
  }
}
