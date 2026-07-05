// Restrained hero backdrop: faint teal caustics drifting across paper.
// Degrades by removing the canvas — the static molecular SVG behind it remains.
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { prefersReduced, isTouch } from './motion';

const frag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;

float n(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  float a=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5);
  float b=fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5);
  float c=fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5);
  float d=fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=uv*3.0;
  p+=(uMouse-0.5)*0.35;
  float v=n(p+uTime*0.06)+0.5*n(p*2.3-uTime*0.04);
  float caustic=smoothstep(0.62,0.98,v);
  vec3 col=mix(vec3(0.969,0.973,0.980), vec3(0.890,0.937,0.937), caustic*0.65);
  gl_FragColor=vec4(col,1.0);
}
`;

const vert = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
void main(){
  gl_Position=vec4(position,0,1);
}
`;

let raf = 0;
let cleanup: (() => void) | null = null;

export function initShader() {
  const canvas = document.querySelector<HTMLCanvasElement>('.hero-canvas');
  if (!canvas) return;
  // Touch devices get the static molecular SVG only — per-frame WebGL on
  // phone CPUs costs more in jank than the effect is worth.
  if (prefersReduced() || isTouch()) {
    canvas.remove();
    return;
  }

  try {
    const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 1.5) });
    const gl = renderer.gl;
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [0.5, 0.5] },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / innerWidth;
      mouse.ty = 1 - e.clientY / innerHeight;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    resize();
    window.addEventListener('resize', resize);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      program.uniforms.uTime.value = t / 1000;
      program.uniforms.uMouse.value = [mouse.x, mouse.y];
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(loop);

    cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      io.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  } catch {
    canvas.remove();
  }
}

export function destroyShader() {
  cleanup?.();
  cleanup = null;
}
