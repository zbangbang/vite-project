export enum BtnType {
  Matrix2,
  Camera,
  Texture,
  TextureCube,
  MultiObject,
  TextCanvas,
  Text
}

export const Matrix2Shader = {
  vertexShaderSource: `#version 300 es
    in vec4 a_position;
    in vec4 a_color;
    uniform mat4 u_matrix;

    out vec4 v_color;

    void main() {
      gl_Position = u_matrix * a_position;
      v_color = a_color;
    }
  `,
  fragmentShaderSource: `#version 300 es
    precision highp float;

    in vec4 v_color;
    out vec4 outColor;
    void main() {
      // outColor = vec4(v_color.xyz / 255.0, 1.0);
      outColor = v_color;
    }
  `,
}
export const CameraShader = {
  vertexShaderSource: `#version 300 es
    in vec4 a_position;
    in vec4 a_color;
    uniform mat4 u_projMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_modelMatrix;

    out vec4 v_color;

    void main() {
      gl_Position = u_projMatrix * u_viewMatrix * u_modelMatrix * a_position;
      v_color = a_color;
    }
  `,
  fragmentShaderSource: `#version 300 es
    precision highp float;

    in vec4 v_color;
    out vec4 outColor;
    void main() {
      // outColor = vec4(v_color.xyz / 255.0, 1.0);
      outColor = v_color;
    }
  `,
}
export const TextureShader = {
  vertexShaderSource: `#version 300 es
    in vec4 a_position;
    in vec2 a_texcoord;
    uniform mat4 u_projMatrix;
    uniform mat4 u_modelMatrix;

    out vec2 v_texcoord;

    void main() {
      gl_Position = u_projMatrix * u_modelMatrix * a_position;
      v_texcoord = a_texcoord;
    }
  `,
  fragmentShaderSource: `#version 300 es
    precision highp float;

    in vec2 v_texcoord;
    uniform sampler2D u_texture;
    out vec4 outColor;
    void main() {
      outColor = texture(u_texture, v_texcoord);
    }
  `,
}
export const MultiObjectShader = {
  vertexShaderSource: `#version 300 es
    in vec4 a_position;
    in vec4 a_color;
    uniform mat4 u_mvpMatrix;

    out vec4 v_color;

    void main() {
      gl_Position = u_mvpMatrix * a_position;
      v_color = a_color;
    }
  `,
  fragmentShaderSource: `#version 300 es
    precision highp float;

    in vec4 v_color;
    uniform vec4 u_multiColor;

    out vec4 outColor;
    void main() {
      outColor = v_color * u_multiColor;
    }
  `,
}
export const TextShader = {
  vertexShaderSource: `#version 300 es
    in vec4 a_position;
    in vec2 a_texcoord;
    uniform mat4 u_mvpMatrix;

    out vec2 v_texcoord;

    void main() {
      gl_Position = u_mvpMatrix * a_position;
      v_texcoord = a_texcoord;
    }
  `,
  fragmentShaderSource: `#version 300 es
    precision highp float;

    in vec2 v_texcoord;
    uniform sampler2D u_texture;
    uniform vec4 u_color;

    out vec4 outColor;
    void main() {
      outColor = texture(u_texture, v_texcoord);
    }
  `,
}

