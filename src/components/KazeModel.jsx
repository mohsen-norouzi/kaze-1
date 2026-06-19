import { Text, useGLTF } from "@react-three/drei";
import { useControls } from "leva";

useGLTF.preload("/kaze.glb");

export const KazeModel = () => {
	const { nodes } = useGLTF("/kaze.glb");

	const {
		position: namePosition,
		rotation: nameRotation,
		color: nameColor,
	} = useControls("Name Text", {
		position: { value: [-0.35, 5.35, -1.86], step: 0.01 },
		rotation: { value: [0, -1.58, 0], step: 0.01 },
		color: "#655f52",
	});

	const {
		position: rolePosition,
		rotation: roleRotation,
		color: roleColor,
	} = useControls("Role Text", {
		position: { value: [-0.35, 5.35, 0.83], step: 0.01 },
		rotation: { value: [0, -1.58, 0], step: 0.01 },
		color: "#655f52",
	});

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

				<Text
					position={namePosition}
					rotation={nameRotation}
					fontSize={0.3}
					color={nameColor}
					letterSpacing={0.35}
					anchorX="left"
					anchorY="middle"
				>
					MOHSEN
				</Text>

				<Text
					position={rolePosition}
					rotation={roleRotation}
					fontSize={0.15}
					color={roleColor}
					letterSpacing={0.23}
					anchorX="left"
					anchorY="middle"
					maxWidth={0.8}
				>
					Web Designer & Developer
				</Text>
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
