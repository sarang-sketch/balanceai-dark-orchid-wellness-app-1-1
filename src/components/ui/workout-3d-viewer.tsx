"use client";

import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { RotateCcw, ZoomIn, ZoomOut, Move3d, Play, Pause } from "lucide-react";

interface Workout3DViewerProps {
  exerciseType: "yoga" | "core" | "meditation" | "stretch";
  onClose: () => void;
}

// Simple placeholder 3D model component
function ExerciseModel({ exerciseType, isAnimating }: { exerciseType: string; isAnimating: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      // Different animations for different exercise types
      switch (exerciseType) {
        case "yoga":
          meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
          meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
          break;
        case "core":
          meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.2;
          break;
        case "meditation":
          meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
          break;
        case "stretch":
          meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.15;
          break;
      }
    }
  });

  // Different colors for different exercise types
  const getMaterialColor = () => {
    switch (exerciseType) {
      case "yoga": return "#8B5A8B"; // Orchid
      case "core": return "#C71585"; // Neon Pink
      case "meditation": return "#4A90E2"; // Blue
      case "stretch": return "#50C878"; // Green
      default: return "#8B5A8B";
    }
  };

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* Simple geometric shapes to represent different exercises */}
      {exerciseType === "yoga" && (
        <group>
          {/* Head */}
          <sphere position={[0, 2, 0]} args={[0.3]} />
          {/* Body */}
          <cylinder position={[0, 0.5, 0]} args={[0.4, 0.8, 2]} />
          {/* Arms in yoga pose */}
          <cylinder position={[-1.2, 1, 0]} args={[0.1, 0.1, 2]} rotation={[0, 0, Math.PI / 6]} />
          <cylinder position={[1.2, 1, 0]} args={[0.1, 0.1, 2]} rotation={[0, 0, -Math.PI / 6]} />
          {/* Legs */}
          <cylinder position={[-0.3, -1, 0]} args={[0.15, 0.15, 2]} />
          <cylinder position={[0.3, -1, 0]} args={[0.15, 0.15, 2]} />
        </group>
      )}

      {exerciseType === "core" && (
        <group>
          {/* Head */}
          <sphere position={[0, 1.5, 0]} args={[0.3]} />
          {/* Torso */}
          <cylinder position={[0, 0, 0]} args={[0.4, 0.6, 1.5]} />
          {/* Legs raised */}
          <cylinder position={[-0.3, 0.5, 1]} args={[0.15, 0.15, 2]} rotation={[Math.PI / 3, 0, 0]} />
          <cylinder position={[0.3, 0.5, 1]} args={[0.15, 0.15, 2]} rotation={[Math.PI / 3, 0, 0]} />
        </group>
      )}

      {exerciseType === "meditation" && (
        <group>
          {/* Head */}
          <sphere position={[0, 1, 0]} args={[0.3]} />
          {/* Body - sitting position */}
          <cylinder position={[0, 0, 0]} args={[0.4, 0.6, 1]} />
          {/* Legs crossed */}
          <cylinder position={[-0.5, -0.8, 0]} args={[0.15, 0.15, 1.5]} rotation={[0, 0, Math.PI / 4]} />
          <cylinder position={[0.5, -0.8, 0]} args={[0.15, 0.15, 1.5]} rotation={[0, 0, -Math.PI / 4]} />
          {/* Hands in meditation pose */}
          <sphere position={[0, 0.2, 0.5]} args={[0.2]} />
        </group>
      )}

      {exerciseType === "stretch" && (
        <group>
          {/* Head */}
          <sphere position={[0, 2, 0]} args={[0.3]} />
          {/* Body */}
          <cylinder position={[0, 0.8, 0]} args={[0.4, 0.7, 2]} />
          {/* Arms stretching up */}
          <cylinder position={[0, 3, 0]} args={[0.1, 0.1, 2]} rotation={[0, 0, 0]} />
          {/* Legs */
          <cylinder position={[-0.3, -1.2, 0]} args={[0.15, 0.15, 2.4]} />
          <cylinder position={[0.3, -1.2, 0]} args={[0.15, 0.15, 2.4]} />
        </group>
      )}

      <meshStandardMaterial color={getMaterialColor()} emissive={getMaterialColor()} emissiveIntensity={0.2} />
    </mesh>
  );
}

export default function Workout3DViewer({ exerciseType, onClose }: Workout3DViewerProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(5);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.max(2, prev - 1));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.min(10, prev + 1));
  };

  const handleReset = () => {
    setZoomLevel(5);
    setAutoRotate(false);
  };

  const getExerciseTitle = () => {
    switch (exerciseType) {
      case "yoga": return "Morning Yoga Pose";
      case "core": return "Core Strengthening";
      case "meditation": return "Meditation Position";
      case "stretch": return "Evening Stretch";
      default: return "Exercise Demonstration";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800/50">
        <div>
          <h2 className="text-xl font-semibold text-white">{getExerciseTitle()}</h2>
          <p className="text-sm text-zinc-400">Interactive 3D demonstration</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Animation Controls */}
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="p-2 bg-orchid-neon/20 hover:bg-orchid-neon/30 text-orchid-neon rounded-lg transition-colors"
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* View Controls */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg transition-colors ${
              autoRotate
                ? "bg-orchid-neon/20 text-orchid-neon"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomIn}
            className="p-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-white rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-white rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-white rounded-lg transition-colors"
          >
            <Move3d className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-white rounded-lg transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [0, 2, zoomLevel], fov: 60 }}>
          <PerspectiveCamera makeDefault position={[0, 2, zoomLevel]} />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            color="#8B5A8B"
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#C71585" />

          {/* Environment */}
          <Environment preset="studio" />

          {/* 3D Model */}
          <Suspense fallback={null}>
            <ExerciseModel exerciseType={exerciseType} isAnimating={isAnimating} />
          </Suspense>

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />

          {/* Grid Helper */}
          <gridHelper args={[20, 20, "#8B5A8B", "#374151"]} rotation={[Math.PI / 2, 0, 0]} />
        </Canvas>

        {/* Instructions Overlay */}
        <div className="absolute bottom-4 left-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 max-w-xs">
          <h3 className="text-white font-medium mb-2">Controls</h3>
          <ul className="text-sm text-zinc-400 space-y-1">
            <li>• Drag to rotate view</li>
            <li>• Scroll to zoom in/out</li>
            <li>• Right-click drag to pan</li>
            <li>• Use buttons for quick actions</li>
          </ul>
        </div>

        {/* Exercise Info */}
        <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 max-w-xs">
          <h3 className="text-white font-medium mb-2">Exercise Tips</h3>
          <ul className="text-sm text-zinc-400 space-y-1">
            <li>• Maintain proper form</li>
            <li>• Breathe deeply and steadily</li>
            <li>• Hold positions as needed</li>
            <li>• Listen to your body</li>
          </ul>
        </div>
      </div>
    </div>
  );
}