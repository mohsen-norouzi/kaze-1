import { useGLTF } from "@react-three/drei";

useGLTF.preload("/kaze.glb");

export const KazeModel = () => {
	const { nodes } = useGLTF("/kaze.glb");

	return (
		<group rotation={[0, Math.PI / 2, 0]}>
			<mesh
				geometry={nodes.wall.geometry}
				position={nodes.wall.position}
				rotation={nodes.wall.rotation}
				scale={nodes.wall.scale}
				receiveShadow
			>
				<meshStandardMaterial color="#E8E2D5" roughness={1} metalness={0} />
			</mesh>
			<mesh
				geometry={nodes.floor.geometry}
				position={nodes.floor.position}
				rotation={nodes.floor.rotation}
				scale={nodes.floor.scale}
				receiveShadow
			>
				<meshStandardMaterial color="#E8E2D5" roughness={1} metalness={0} />
			</mesh>
			<mesh
				geometry={nodes.plate_main.geometry}
				position={nodes.plate_main.position}
				rotation={nodes.plate_main.rotation}
				scale={nodes.plate_main.scale}
				castShadow
				receiveShadow
			>
				<meshStandardMaterial color="#F2EFE8" roughness={0.95} metalness={0} />
			</mesh>
			<mesh
				geometry={nodes.plate_contact.geometry}
				position={nodes.plate_contact.position}
				rotation={nodes.plate_contact.rotation}
				scale={nodes.plate_contact.scale}
				castShadow
				receiveShadow
			>
				<meshStandardMaterial color="#F2EFE8" roughness={0.95} metalness={0} />
			</mesh>
			<mesh
				geometry={nodes.contact_string.geometry}
				position={nodes.contact_string.position}
				rotation={nodes.contact_string.rotation}
				scale={nodes.contact_string.scale}
				castShadow
			>
				<meshStandardMaterial color="#C8C0B0" roughness={0.8} metalness={0.1} />
			</mesh>
			<mesh
				geometry={nodes.main_string_left.geometry}
				position={nodes.main_string_left.position}
				rotation={nodes.main_string_left.rotation}
				scale={nodes.main_string_left.scale}
				castShadow
			>
				<meshStandardMaterial color="#C8C0B0" roughness={0.8} metalness={0.1} />
			</mesh>
			<mesh
				geometry={nodes.main_string_right.geometry}
				position={nodes.main_string_right.position}
				rotation={nodes.main_string_right.rotation}
				scale={nodes.main_string_right.scale}
				castShadow
			>
				<meshStandardMaterial color="#C8C0B0" roughness={0.8} metalness={0.1} />
			</mesh>
		</group>
	);
};
