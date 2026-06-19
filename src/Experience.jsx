import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import { Perf } from "r3f-perf";
import { useEffect, useRef } from "react";
import { KazeModel } from "./components/KazeModel";


export const Experience = () => {
	const { camera } = useThree();
	const controlsRef = useRef();

	const { fov, near, far } = useControls(
		"Camera",
		{
			fov: { value: 45, min: 10, max: 120, step: 1 },
			near: { value: 0.1, min: 0.01, max: 10, step: 0.01 },
			far: { value: 50, min: 1, max: 200, step: 1 },
			"Log camera": button(() => {
				if (!controlsRef.current) return;
				const { x: px, y: py, z: pz } = camera.position;
				const { x: tx, y: ty, z: tz } = controlsRef.current.target;
				console.log(
					`position={[${px.toFixed(2)}, ${py.toFixed(2)}, ${pz.toFixed(2)}]}\n` +
						`target={[${tx.toFixed(2)}, ${ty.toFixed(2)}, ${tz.toFixed(2)}]}`,
				);
			}),
		},
		{ collapsed: true },
	);

	const spotLightTargetRef = useRef();
	const { targetX, targetY, targetZ } = useControls(
		"Spot Light Target",
		{
			targetX: { value: -1, min: -20, max: 20, step: 0.1 },
			targetY: { value: -2, min: -20, max: 20, step: 0.1 },
			targetZ: { value: 5, min: -20, max: 20, step: 0.1 },
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

	const spotLightRef = useRef();
	// useHelper(spotLightRef, SpotLightHelper);

	useEffect(() => {
		camera.near = near;
		camera.far = far;
		camera.updateProjectionMatrix();
	}, [near, far, camera]);

	return (
		<>
			<Perf position="top-left" />

			<PerspectiveCamera makeDefault position={[0, 2, 20]} fov={fov} />

			<OrbitControls ref={controlsRef} />

			<ambientLight intensity={1.5} />

			<object3D
				ref={spotLightTargetRef}
				position={[targetX, targetY, targetZ]}
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

			<KazeModel />
		</>
	);
};
