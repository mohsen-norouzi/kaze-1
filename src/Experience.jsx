import { OrbitControls, PerspectiveCamera, useHelper } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { Perf } from "r3f-perf";
import { useEffect, useRef } from "react";
import { KazeModel } from "./components/KazeModel";
import { SpotLightHelper } from "three";

export const Experience = () => {
	const { camera } = useThree();

	const { fov, near, far } = useControls(
		"Camera",
		{
			fov: { value: 45, min: 10, max: 120, step: 1 },
			near: { value: 0.1, min: 0.01, max: 10, step: 0.01 },
			far: { value: 50, min: 1, max: 200, step: 1 },
		},
		{ collapsed: true },
	);

	const spotLightTargetRef = useRef();
	const spotLightTargetRef2 = useRef();

	const { targetX, targetY, targetZ } = useControls(
		"Spot Light Target",
		{
			targetX: { value: -1, min: -20, max: 20, step: 0.1 },
			targetY: { value: -2, min: -20, max: 20, step: 0.1 },
			targetZ: { value: 5, min: -20, max: 20, step: 0.1 },
		},
		{ collapsed: true },
	);
	const { targetX2, targetY2, targetZ2 } = useControls(
		"Spot Light Target 2",
		{
			targetX2: { value: 0, min: -20, max: 20, step: 0.1 },
			targetY2: { value: 0, min: -20, max: 20, step: 0.1 },
			targetZ2: { value: 0, min: -20, max: 20, step: 0.1 },
		},
		{ collapsed: true },
	);

	const {
		lightX,
		lightY,
		lightZ,
		lightIntensity,
		lightColor,
		lightAngle,
		lightPenumbra,
		lightShadowBlur,
		lightShadowBlurSamples,
	} = useControls(
		"Spot Light",
		{
			lightX: { value: 18, min: -40, max: 40, step: 0.1 },
			lightY: { value: 10, min: -40, max: 40, step: 0.1 },
			lightZ: { value: 10, min: -40, max: 40, step: 0.1 },
			lightIntensity: { value: 500, min: 0, max: 1000, step: 0.1 },
			lightColor: { value: "#FFE8C0" },
			lightAngle: { value: 0.8, min: 0, max: Math.PI / 2, step: 0.01 },
			lightPenumbra: { value: 1, min: 0, max: 1, step: 0.01 },
			lightShadowBlur: { value: 22, min: 0, max: 100, step: 1 },
			lightShadowBlurSamples: { value: 25, min: 0, max: 100, step: 1 },
		},
		{ collapsed: true },
	);

	const {
		lightX2,
		lightY2,
		lightZ2,
		lightIntensity2,
		lightColor2,
		lightAngle2,
		lightPenumbra2,
		lightShadowBlur2,
		lightShadowBlurSamples2,
	} = useControls(
		"Spot Light 2",
		{
			lightX2: { value: 18, min: -40, max: 40, step: 0.1 },
			lightY2: { value: 10, min: -40, max: 40, step: 0.1 },
			lightZ2: { value: 10, min: -40, max: 40, step: 0.1 },
			lightIntensity2: { value: 500, min: 0, max: 1000, step: 0.1 },
			lightColor2: { value: "#FFE8C0" },
			lightAngle2: { value: 0.8, min: 0, max: Math.PI / 2, step: 0.01 },
			lightPenumbra2: { value: 1, min: 0, max: 1, step: 0.01 },
			lightShadowBlur2: { value: 22, min: 0, max: 100, step: 1 },
			lightShadowBlurSamples2: { value: 25, min: 0, max: 100, step: 1 },
		},
		{ collapsed: true },
	);

	const spotLightRef = useRef();
	const spotLightRef2 = useRef();
	useHelper(spotLightRef2, SpotLightHelper);

	useEffect(() => {
		camera.near = near;
		camera.far = far;
		camera.updateProjectionMatrix();
	}, [near, far, camera]);

	return (
		<>
			<Perf position="top-left" />

			<PerspectiveCamera makeDefault position={[0, 2, 20]} fov={fov} />

			<OrbitControls />

			<ambientLight intensity={1.5} />

			<object3D
				ref={spotLightTargetRef}
				position={[targetX, targetY, targetZ]}
			/>
			<object3D
				ref={spotLightTargetRef2}
				position={[targetX2, targetY2, targetZ2]}
			/>
			<spotLight
				ref={spotLightRef}
				position={[lightX, lightY, lightZ]}
				target={spotLightTargetRef.current}
				angle={lightAngle}
				penumbra={lightPenumbra}
				intensity={lightIntensity}
				color={lightColor}
				castShadow
				shadow-mapSize-width={4096}
				shadow-mapSize-height={4096}
				shadow-radius={lightShadowBlur}
				shadow-blurSamples={lightShadowBlurSamples}
			/>

			{/* spotlight for leva controls */}
			<spotLight
				ref={spotLightRef2}
				position={[lightX2, lightY2, lightZ2]}
				target={spotLightTargetRef2.current}
				angle={lightAngle2}
				penumbra={lightPenumbra2}
				intensity={lightIntensity2}
				color={lightColor2}
				castShadow
				shadow-mapSize-width={4096}
				shadow-mapSize-height={4096}
				shadow-radius={lightShadowBlur2}
				shadow-blurSamples={lightShadowBlurSamples2}
			/>

			<KazeModel />
		</>
	);
};
