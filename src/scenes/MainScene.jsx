import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { KazeModel } from "../components/KazeModel";

export default function MainScene() {
	const camera = useControls("Camera", {
		x: { value: 0, min: -20, max: 20, step: 0.1 },
		y: { value: 2, min: -20, max: 20, step: 0.1 },
		z: { value: 20, min: 0, max: 30, step: 0.1 },
		fov: { value: 45, min: 10, max: 120, step: 1 },
	});

	const { lightX, lightY, lightZ, lightIntensity, lightColor } = useControls(
		"Directional Light",
		{
			lightColor: { value: "#FFF5E0" },
			lightIntensity: { value: 2, min: 0, max: 10, step: 0.1 },
			lightX: { value: 5, min: -20, max: 20, step: 0.1 },
			lightY: { value: 1, min: -20, max: 20, step: 0.1 },
			lightZ: { value: 2.6, min: -20, max: 20, step: 0.1 },
		},
	);

	return (
		<Canvas shadows>
			<PerspectiveCamera
				makeDefault
				position={[camera.x, camera.y, camera.z]}
				fov={camera.fov}
			/>
			<OrbitControls />
			<KazeModel />
			<ambientLight intensity={0.4} />
			<directionalLight
				position={[lightX, lightY, lightZ]}
				intensity={lightIntensity}
				color={lightColor}
				castShadow
			/>
		</Canvas>
	);
}
