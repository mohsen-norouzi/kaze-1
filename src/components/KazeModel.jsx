import { Text, useGLTF } from "@react-three/drei";
import { button, useControls } from "leva";
import layout from "../data/layout.json";

useGLTF.preload("/kaze.glb");

const RAIL_Y = 16;

// String geometry's local bounding box along Y (Cylinder.005), measured from the
// GLB: the pivot is NOT centered, it sits near the bottom of the mesh.
const STRING_LOCAL_BOTTOM = -3.8091812133789062;
const STRING_LOCAL_TOP = 26.142597198486328;
const STRING_LOCAL_LENGTH = STRING_LOCAL_TOP - STRING_LOCAL_BOTTOM;

const addVec3 = ([ax, ay, az], [bx, by, bz]) => [ax + bx, ay + by, az + bz];

// Rotates an XZ offset around Y only - strings only need to track plate yaw.
const rotateOffsetY = ([ox, oy, oz], rotationY) => {
	const cos = Math.cos(rotationY);
	const sin = Math.sin(rotationY);
	return [ox * cos + oz * sin, oy, oz * cos - ox * sin];
};

const ControllableMesh = ({
	label,
	geometry,
	scale,
	defaultPosition,
	defaultRotation = [0, 0, 0],
	defaultColor,
	roughness = 0.95,
	metalness = 0,
	castShadow = true,
	receiveShadow = true,
	children,
}) => {
	const [{ position, rotation, color }, set] = useControls(
		label,
		() => ({
			position: { value: defaultPosition, step: 0.01 },
			rotation: { value: defaultRotation, step: 0.01 },
			color: defaultColor,
			Reset: button(() =>
				set({
					position: defaultPosition,
					rotation: defaultRotation,
					color: defaultColor,
				}),
			),
		}),
		{ collapsed: true },
	);

	return (
		<mesh
			geometry={geometry}
			position={position}
			rotation={rotation}
			scale={scale}
			castShadow={castShadow}
			receiveShadow={receiveShadow}
		>
			<meshStandardMaterial
				color={color}
				roughness={roughness}
				metalness={metalness}
			/>
			{children}
		</mesh>
	);
};

const StringMesh = ({ geometry, attachPosition, color }) => {
	const [x, attachY, z] = attachPosition;
	const scaleY = (RAIL_Y - attachY) / STRING_LOCAL_LENGTH;
	const centerY = attachY - STRING_LOCAL_BOTTOM * scaleY;

	return (
		<mesh geometry={geometry} position={[x, centerY, z]} scale={[1, scaleY, 1]}>
			<meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
		</mesh>
	);
};

// A plate whose strings follow its own position (xyz) and rotation (y only)
// when moved/rotated in Leva, instead of each string having an independent
// position control.
const PlateWithStrings = ({
	label,
	geometry,
	scale,
	defaultPosition,
	defaultRotation = [0, 0, 0],
	defaultColor,
	stringGeometry,
	stringColor,
	stringOffsets = [[0, 0, 0]],
	roughness = 0.95,
	metalness = 0,
	castShadow = true,
	receiveShadow = true,
	children,
}) => {
	const [{ position, rotation, color }, set] = useControls(
		label,
		() => ({
			position: { value: defaultPosition, step: 0.01 },
			rotation: { value: defaultRotation, step: 0.01 },
			color: defaultColor,
			Reset: button(() =>
				set({
					position: defaultPosition,
					rotation: defaultRotation,
					color: defaultColor,
				}),
			),
		}),
		{ collapsed: true },
	);

	return (
		<>
			{stringOffsets.map((offset) => (
				<StringMesh
					key={offset.join(",")}
					geometry={stringGeometry}
					attachPosition={addVec3(position, rotateOffsetY(offset, rotation[1]))}
					color={stringColor}
				/>
			))}
			<mesh
				geometry={geometry}
				position={position}
				rotation={rotation}
				scale={scale}
				castShadow={castShadow}
				receiveShadow={receiveShadow}
			>
				<meshStandardMaterial
					color={color}
					roughness={roughness}
					metalness={metalness}
				/>
				{children}
			</mesh>
		</>
	);
};

const MAIN_STRING_OFFSETS = [
	[0, 0, -1.8],
	[0, 0, 1.8],
];
const SINGLE_STRING_OFFSET = [[0, 0, 0]];

export const KazeModel = () => {
	const { nodes } = useGLTF("/kaze.glb");

	const {
		position: namePosition,
		rotation: nameRotation,
		color: nameColor,
	} = useControls("Name Text", {
		position: { value: layout.nameText.position, step: 0.01 },
		rotation: { value: layout.nameText.rotation, step: 0.01 },
		color: layout.nameText.color,
	});

	const {
		position: rolePosition,
		rotation: roleRotation,
		color: roleColor,
	} = useControls("Role Text", {
		position: { value: layout.roleText.position, step: 0.01 },
		rotation: { value: layout.roleText.rotation, step: 0.01 },
		color: layout.roleText.color,
	});

	const { color: stringColor } = useControls(
		"Strings",
		{ color: layout.stringColor },
		{ collapsed: true },
	);

	useControls("Export", {
		"Copy All Positions": button((get) => {
			const data = {
				wall: {
					position: get("Wall.position"),
					rotation: get("Wall.rotation"),
					color: get("Wall.color"),
				},
				floor: {
					position: get("Floor.position"),
					rotation: get("Floor.rotation"),
					color: get("Floor.color"),
				},
				nameText: {
					position: get("Name Text.position"),
					rotation: get("Name Text.rotation"),
					color: get("Name Text.color"),
				},
				roleText: {
					position: get("Role Text.position"),
					rotation: get("Role Text.rotation"),
					color: get("Role Text.color"),
				},
				stringColor: get("Strings.color"),
				plateMain: {
					position: get("Plate Main.position"),
					rotation: get("Plate Main.rotation"),
					color: get("Plate Main.color"),
				},
				navPlates: layout.navPlates.map((plate) => ({
					label: plate.label,
					position: get(`Plate ${plate.label}.position`),
					rotation: get(`Plate ${plate.label}.rotation`),
					color: get(`Plate ${plate.label}.color`),
				})),
				decorativePlates: layout.decorativePlates.map((plate, index) => ({
					id: plate.id,
					position: get(`Decorative ${index + 1}.position`),
					rotation: get(`Decorative ${index + 1}.rotation`),
					color: get(`Decorative ${index + 1}.color`),
				})),
				plateRound: {
					position: get("Plate Round.position"),
					rotation: get("Plate Round.rotation"),
					color: get("Plate Round.color"),
				},
			};
			navigator.clipboard.writeText(JSON.stringify(data, null, "\t"));
		}),
	});

	return (
		<group rotation={[0, Math.PI / 2, 0]}>
			<ControllableMesh
				label="Wall"
				geometry={nodes.wall.geometry}
				scale={nodes.wall.scale}
				defaultPosition={layout.wall.position}
				defaultRotation={layout.wall.rotation}
				defaultColor={layout.wall.color}
				roughness={1}
				castShadow={false}
			/>

			<ControllableMesh
				label="Floor"
				geometry={nodes.floor.geometry}
				scale={nodes.floor.scale}
				defaultPosition={layout.floor.position}
				defaultRotation={layout.floor.rotation}
				defaultColor={layout.floor.color}
				roughness={1}
				castShadow={false}
			/>

			<PlateWithStrings
				label="Plate Main"
				geometry={nodes.plate_main.geometry}
				scale={nodes.plate_main.scale}
				defaultPosition={layout.plateMain.position}
				defaultRotation={layout.plateMain.rotation}
				defaultColor={layout.plateMain.color}
				stringGeometry={nodes.string.geometry}
				stringColor={stringColor}
				stringOffsets={MAIN_STRING_OFFSETS}
			>
				<Text
					position={namePosition}
					rotation={nameRotation}
					fontSize={0.2}
					color={nameColor}
					anchorX="left"
					anchorY="middle"
					fontWeight={250}
				>
					MOHSEN
				</Text>

				<Text
					position={rolePosition}
					rotation={roleRotation}
					fontSize={0.1}
					color={roleColor}
					letterSpacing={0.23}
					anchorX="left"
					anchorY="middle"
					maxWidth={0.8}
				>
					Web Designer & Developer
				</Text>
			</PlateWithStrings>

			{layout.navPlates.map((plate) => (
				<PlateWithStrings
					key={plate.label}
					label={`Plate ${plate.label}`}
					geometry={nodes.plate_small.geometry}
					scale={nodes.plate_small.scale}
					defaultPosition={plate.position}
					defaultRotation={plate.rotation}
					defaultColor={plate.color}
					stringGeometry={nodes.string.geometry}
					stringColor={stringColor}
					stringOffsets={SINGLE_STRING_OFFSET}
				/>
			))}

			{layout.decorativePlates.map((plate, index) => (
				<PlateWithStrings
					key={plate.id}
					label={`Decorative ${index + 1}`}
					geometry={nodes["plate-thin"].geometry}
					scale={nodes["plate-thin"].scale}
					defaultPosition={plate.position}
					defaultRotation={plate.rotation}
					defaultColor={plate.color}
					stringGeometry={nodes.string.geometry}
					stringColor={stringColor}
					stringOffsets={SINGLE_STRING_OFFSET}
				/>
			))}

			<PlateWithStrings
				label="Plate Round"
				geometry={nodes.plate_round.geometry}
				scale={nodes.plate_round.scale}
				defaultPosition={layout.plateRound.position}
				defaultRotation={layout.plateRound.rotation}
				defaultColor={layout.plateRound.color}
				stringGeometry={nodes.string.geometry}
				stringColor={stringColor}
				stringOffsets={SINGLE_STRING_OFFSET}
			/>
		</group>
	);
};
