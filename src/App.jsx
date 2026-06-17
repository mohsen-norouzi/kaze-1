import "./App.css";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { Experience } from "./Experience";

function App() {
	return (
		<Canvas
			shadows
			camera={{
				fov: 45,
				near: 0.1,
				far: 20,
				position: [-4, 3, 6],
			}}
			gl={{
				toneMapping: ACESFilmicToneMapping,
				toneMappingExposure: 1.2,
				outputColorSpace: SRGBColorSpace,
			}}
		>
			<Experience />
		</Canvas>
	);
}

export default App;
