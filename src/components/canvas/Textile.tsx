/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useTexture, shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { useLenis } from "lenis/react";
import * as THREE from "three";
import { useRef } from "react";
// @ts-ignore
import { editable as e, useCurrentSheet } from '@theatre/r3f'
import { val } from "@theatre/core";
const WaveShaderMaterial = shaderMaterial(
    // Uniform
    {
      uTime: 0,
      uColor: new THREE.Color(0.0, 0.0, 0.0),
      uTexture: new THREE.Texture()
    },
    // Vertex Shader
    `
      precision mediump float;
   
      varying vec2 vUv;
      varying float vWave;
  
      uniform float uTime;
  
      //	Simplex 3D Noise 
//	by Ian McEwan, Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
  
      void main() {
        vUv = uv;
  
        vec3 pos = position;
        float noiseFreq = 2.0;
        float noiseAmp = 0.4;
        vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
        pos.z += snoise(noisePos) * noiseAmp;
        vWave = pos.z;
  
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);  
      }
    `,
    // Fragment Shader
    `
      precision mediump float;
  
      uniform vec3 uColor;
      uniform float uTime;
      uniform sampler2D uTexture;
  
      varying vec2 vUv;
      varying float vWave;
  
      void main() {
        float wave = vWave * 0.2;
        vec3 texture = texture2D(uTexture, vUv).rgb;
        gl_FragColor = vec4(texture, 1.0); 
      }
    `
  );
  
  extend({ WaveShaderMaterial });

export function Textile() {
    const texture = useTexture("/textures/nylon_texture.jpg");
    const gridTexture = useTexture("/textures/grid_texture.jpg");
    const netTexture = useTexture("/textures/net_texture.jpg");
    const sheet = useCurrentSheet();

    const ref = useRef();
    const ref2 = useRef();
    const ref3 = useRef();
    // useFrame(({ clock }) => {
    //     ref.current.uTime = clock.getElapsedTime()
    //     ref2.current.uTime = clock.getElapsedTime()
    //     ref3.current.uTime = clock.getElapsedTime()
    // });
    useLenis(({ time, progress }) => {
        console.log(time)
        const lerpedTime = THREE.MathUtils.lerp(0, 1, time / 500)
        const sequenceLength = val(sheet.sequence.pointer.length);
        // @ts-ignore
        ref.current.uTime = lerpedTime
        // @ts-ignore
        ref2.current.uTime = lerpedTime
        // @ts-ignore
        ref3.current.uTime = lerpedTime
        // @ts-ignore
        sheet.sequence.position = progress * sequenceLength;
    }, [ref, ref2, ref3]);

    
  return (
    <e.group theatreKey="texture_group">
        <e.mesh theatreKey="texture3" position={[0,0,-0.4]}>
            <boxGeometry args={[4, 6, 0.05]} />
            {/* @ts-ignore */}
            <waveShaderMaterial ref={ref} uTexture={netTexture} uColor={'grey'} />
        </e.mesh>
        <e.mesh theatreKey="texture2" position={[0,0,-0.2]}>
            <boxGeometry args={[4, 6, 0.05]} />
            {/* @ts-ignore */}
            <waveShaderMaterial ref={ref2} uTexture={gridTexture} uColor={'white'} />
        </e.mesh>
        <e.mesh theatreKey="texture">
            <boxGeometry args={[4, 6, 0.05]} />
            {/* @ts-ignore */}
            <waveShaderMaterial ref={ref3} uTexture={texture} />
        </e.mesh>
    </e.group>
  );
}