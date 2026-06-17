import { useGLTF } from "@react-three/drei";

useGLTF.preload("/kaze.glb");
// rotation x 90, y 0, z 0
export const KazeModel = () => {
	const { nodes } = useGLTF("/kaze.glb");

	return (
		<group rotation={[0, Math.PI / 2, 0]}>
			<mesh geometry={nodes.wall.geometry} receiveShadow>
				<meshStandardMaterial color="#F0EDE6" roughness={1} metalness={0} />
			</mesh>
			<mesh geometry={nodes.floor.geometry} receiveShadow>
				<meshStandardMaterial color="#EDE9E0" roughness={1} metalness={0} />
			</mesh>
			<mesh geometry={nodes.plate_main.geometry} castShadow receiveShadow>
				<meshStandardMaterial color="#F2EFE8" roughness={0.95} metalness={0} />
			</mesh>
		</group>
	);
};
