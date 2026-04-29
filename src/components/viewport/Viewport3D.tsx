import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Grid,
  Stage,
  useGLTF
} from '@react-three/drei';

const Model = ({ url, wireframe }: { url: string; wireframe?: boolean }) => {
  const { scene } = useGLTF(url);
  
  scene.traverse((child: any) => {
    if (child.isMesh) {
      child.material.wireframe = wireframe;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return <primitive object={scene} />;
};

const DefaultModel = ({ wireframe }: { wireframe?: boolean }) => (
  <mesh position={[0, 0, 0]} castShadow receiveShadow>
    <torusKnotGeometry args={[1, 0.35, 256, 32]} />
    <meshStandardMaterial 
      color="#06b6d4" 
      roughness={0.1}
      metalness={0.8}
      wireframe={wireframe}
    />
  </mesh>
);

export const Viewport3D: React.FC<{ url?: string; wireframe?: boolean }> = ({ url, wireframe = false }) => {
  return (
    <div className="w-full h-full cursor-crosshair bg-black">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={45} />
        
        {/* Professional Studio Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#06b6d4" />
        
        <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" adjustCamera={false}>
            {url ? <Model url={url} wireframe={wireframe} /> : <DefaultModel wireframe={wireframe} />}
          </Stage>
        </Suspense>
        
        <Grid 
          infiniteGrid 
          fadeDistance={40} 
          fadeStrength={5} 
          cellSize={1} 
          cellThickness={1} 
          sectionSize={5} 
          sectionThickness={1.5} 
          sectionColor="#3b82f6" 
          cellColor="#18181b" 
        />
        
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

