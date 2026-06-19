import { Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useRef } from "react";
import layout from "../data/layout.json";

useGLTF.preload("/kaze.glb");

const RAIL_Y = 16;

// Gentle wind-chime sway: speed of swing, max angle in radians, applied on
// top of each plate's own Leva rotation.y.
const SWING_SPEED = 0.5;
const SWING_AMPLITUDE = 0.2;

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

// A single sine repeats identically every cycle and reads as mechanical.
// Layering a smaller, differently-timed second sine on top breaks that
// perfect periodicity so the sway feels more like real wind than a metronome.
const swingAngle = (t, speed, amplitude, phase) =>
	Math.sin(t * speed + phase) * amplitude +
	Math.sin(t * speed * 2.63 + phase * 1.7) * amplitude * 0.35;

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

// Attach point swings with the plate's yaw. A Y-axis swing never changes
// attachY (the offset's own Y stays 0, and the plate's Y position is
// constant), so only x/z need a per-frame update - scale/centerY are fixed.
const StringMesh = ({
	geometry,
	plateOrigin,
	plateRotationY,
	offset,
	phaseOffset = 0,
	swingSpeed = SWING_SPEED,
	swingAmplitude = SWING_AMPLITUDE,
	color,
}) => {
	const meshRef = useRef();

	const [x, attachY, z] = addVec3(
		plateOrigin,
		rotateOffsetY(offset, plateRotationY),
	);
	const scaleY = (RAIL_Y - attachY) / STRING_LOCAL_LENGTH;
	const centerY = attachY - STRING_LOCAL_BOTTOM * scaleY;

	useFrame((state) => {
		if (!meshRef.current) return;
		const t = state.clock.elapsedTime;
		const swingY =
			plateRotationY +
			swingAngle(t, swingSpeed, swingAmplitude, phaseOffset);
		const [swungX, , swungZ] = addVec3(
			plateOrigin,
			rotateOffsetY(offset, swingY),
		);
		meshRef.current.position.x = swungX;
		meshRef.current.position.z = swungZ;
	});

	return (
		<mesh
			ref={meshRef}
			geometry={geometry}
			position={[x, centerY, z]}
			scale={[1, scaleY, 1]}
		>
			<meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
		</mesh>
	);
};

// A single text label for a plate, positioned in world space off the plate's
// own position/rotation (like StringMesh) rather than nested inside the
// plate's non-uniformly-scaled mesh, which would distort both placement and
// apparent font size. Runs its own swing in sync with the plate's (same
// formula/phase) since it isn't a child of the swinging mesh.
const PlateLabelText = ({
	label,
	plateOrigin,
	plateRotation,
	defaultText,
	phaseOffset = 0,
	swingSpeed = SWING_SPEED,
	swingAmplitude = SWING_AMPLITUDE,
}) => {
	const groupRef = useRef();

	const { content, offset, rotationOffset, color, fontSize } = useControls(
		`Text ${label}`,
		{
			content: defaultText.content,
			offset: { value: defaultText.offset, step: 0.01 },
			rotationOffset: { value: defaultText.rotationOffset, step: 0.01 },
			color: defaultText.color,
			fontSize: { value: defaultText.fontSize, min: 0.01, max: 1, step: 0.01 },
		},
		{ collapsed: true },
	);

	const position = addVec3(
		plateOrigin,
		rotateOffsetY(offset, plateRotation[1]),
	);
	const rotation = [
		plateRotation[0] + rotationOffset[0],
		plateRotation[1] + rotationOffset[1],
		plateRotation[2] + rotationOffset[2],
	];

	useFrame((state) => {
		if (!groupRef.current) return;
		const t = state.clock.elapsedTime;
		const swingY =
			plateRotation[1] +
			swingAngle(t, swingSpeed, swingAmplitude, phaseOffset);
		const [swungX, , swungZ] = addVec3(
			plateOrigin,
			rotateOffsetY(offset, swingY),
		);
		groupRef.current.position.x = swungX;
		groupRef.current.position.z = swungZ;
		groupRef.current.rotation.y = swingY + rotationOffset[1];
	});

	if (!content) return null;

	return (
		<group ref={groupRef} position={position} rotation={rotation}>
			<Text fontSize={fontSize} color={color} anchorX="center" anchorY="middle">
				{content}
			</Text>
		</group>
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
	text,
	phaseOffset = 0,
	swingSpeed: fixedSwingSpeed,
	swingAmplitude: fixedSwingAmplitude,
	roughness = 0.95,
	metalness = 0,
	castShadow = true,
	receiveShadow = true,
	children,
}) => {
	const meshRef = useRef();

	// Randomized once per plate (stable across re-renders) so each plate
	// swings at its own speed/amplitude, not just out of phase - unless a
	// fixed value is given (e.g. from layout.json), which always wins.
	const swingParamsRef = useRef(null);
	if (!swingParamsRef.current) {
		swingParamsRef.current = {
			speed: fixedSwingSpeed ?? SWING_SPEED * (0.6 + Math.random() * 0.8),
			amplitude:
				fixedSwingAmplitude ?? SWING_AMPLITUDE * (0.6 + Math.random() * 0.8),
		};
	}
	const { speed: swingSpeed, amplitude: swingAmplitude } = swingParamsRef.current;

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

	useFrame((state) => {
		if (!meshRef.current) return;
		const t = state.clock.elapsedTime;
		meshRef.current.rotation.y =
			rotation[1] + swingAngle(t, swingSpeed, swingAmplitude, phaseOffset);
	});

	return (
		<>
			{stringOffsets.map((offset) => (
				<StringMesh
					key={offset.join(",")}
					geometry={stringGeometry}
					plateOrigin={position}
					plateRotationY={rotation[1]}
					offset={offset}
					phaseOffset={phaseOffset}
					swingSpeed={swingSpeed}
					swingAmplitude={swingAmplitude}
					color={stringColor}
				/>
			))}
			<mesh
				ref={meshRef}
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
			{text && (
				<PlateLabelText
					label={label}
					plateOrigin={position}
					plateRotation={rotation}
					defaultText={text}
					phaseOffset={phaseOffset}
					swingSpeed={swingSpeed}
					swingAmplitude={swingAmplitude}
				/>
			)}
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
					text: {
						content: get(`Text Plate ${plate.label}.content`),
						offset: get(`Text Plate ${plate.label}.offset`),
						rotationOffset: get(`Text Plate ${plate.label}.rotationOffset`),
						color: get(`Text Plate ${plate.label}.color`),
						fontSize: get(`Text Plate ${plate.label}.fontSize`),
					},
				})),
				decorativePlates: layout.decorativePlates.map((plate, index) => ({
					id: plate.id,
					position: get(`Decorative ${index + 1}.position`),
					rotation: get(`Decorative ${index + 1}.rotation`),
					color: get(`Decorative ${index + 1}.color`),
					text: {
						content: get(`Text Decorative ${index + 1}.content`),
						offset: get(`Text Decorative ${index + 1}.offset`),
						rotationOffset: get(`Text Decorative ${index + 1}.rotationOffset`),
						color: get(`Text Decorative ${index + 1}.color`),
						fontSize: get(`Text Decorative ${index + 1}.fontSize`),
					},
				})),
				plateRound: {
					position: get("Plate Round.position"),
					rotation: get("Plate Round.rotation"),
					color: get("Plate Round.color"),
					text: {
						content: get("Text Plate Round.content"),
						offset: get("Text Plate Round.offset"),
						rotationOffset: get("Text Plate Round.rotationOffset"),
						color: get("Text Plate Round.color"),
						fontSize: get("Text Plate Round.fontSize"),
					},
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
				phaseOffset={layout.plateMain.phaseOffset}
				swingSpeed={layout.plateMain.swingSpeed}
				swingAmplitude={layout.plateMain.swingAmplitude}
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
					text={plate.text}
					phaseOffset={plate.phaseOffset}
					swingSpeed={plate.swingSpeed}
					swingAmplitude={plate.swingAmplitude}
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
					text={plate.text}
					phaseOffset={plate.phaseOffset}
					swingSpeed={plate.swingSpeed}
					swingAmplitude={plate.swingAmplitude}
				/>
			))}

			<PlateWithStrings
				label="Plate Round"
				geometry={nodes.plate_round.geometry}
				scale={nodes.plate_round.scale}
				defaultPosition={layout.plateRound.position}
				defaultRotation={layout.plateRound.rotation}
				defaultColor={layout.plateRound.color}
				text={layout.plateRound.text}
				phaseOffset={layout.plateRound.phaseOffset}
				swingSpeed={layout.plateRound.swingSpeed}
				swingAmplitude={layout.plateRound.swingAmplitude}
				stringGeometry={nodes.string.geometry}
				stringColor={stringColor}
				stringOffsets={SINGLE_STRING_OFFSET}
			/>
		</group>
	);
};
