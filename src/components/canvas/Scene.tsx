/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'
import { Canvas } from "@react-three/fiber";
import { 
    // OrbitControls, 
    Environment 
} from "@react-three/drei";
import { Textile } from "./Textile";
import { getProject } from '@theatre/core'
// import studio from '@theatre/studio'
// import extension from '@theatre/r3f/dist/extension'
// @ts-ignore
import { SheetProvider } from '@theatre/r3f'
import state from './state.json'


// studio.initialize()
// studio.extend(extension)
const demoSheet = getProject("Demo Sheet", {state: state}).sheet("Demo Sheet");



export function Scene() {
  return (
    <div className="fixed top-0 left-0 w-full h-full">
        <Canvas>
        <SheetProvider sheet={demoSheet}>
            <ambientLight intensity={0.5} />
            <Textile />
            {/* <OrbitControls /> */}
            <Environment preset="forest" />
            </SheetProvider>
        </Canvas>
    </div>
  );
}