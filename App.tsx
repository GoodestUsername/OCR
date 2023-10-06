import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Camera, CameraType, ImageType } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
	const [type, setType] = useState(CameraType.back);
	const [permission, requestPermission] = Camera.useCameraPermissions();
	const cameraRef = useRef<Camera>(null);

	if (!permission) {
		// Camera permissions are still loading
		return <View />;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet
		return (
			<View style={styles.container}>
				<Text style={{ textAlign: 'center' }}>
					We need your permission to show the camera
				</Text>
				<Button onPress={requestPermission} title="grant permission" />
			</View>
		);
	}

	function toggleCameraType() {
		setType(current =>
			current === CameraType.back ? CameraType.front : CameraType.back,
		);
	}
	function takePicture() {
		// TODO: implement upload via "react-native-background-upload
		const start = performance.now();
		cameraRef.current?.pausePreview();
		cameraRef.current?.resumePreview();
		console.log('start ', start);
		const options: any = {
			forceUpOrientation: true,
			fixOrientation: true,
			quality: 1,
			base64: true,
			exif: false,
			autoFocus: false,
			imageType: ImageType.png,
			skipProcessing: false,
			onPictureSaved: (newPhoto: { uri: string; base64: string | any[] }) => {
				const end = performance.now();
				console.log('end ', end);
				console.log(
					`time elapsed: ${(end - start) * 0.001} seconds ${start}, ${end}`,
				);
				TextRecognition.recognize(newPhoto.uri).then(result => {
					console.log('Recognized text:', result.text);

					for (const block of result.blocks) {
						console.log('Block text:', block.text);
						console.log('Block frame:', block.frame);

						for (const line of block.lines) {
							console.log('Line text:', line.text);
							console.log('Line frame:', line.frame);
						}
					}
				});
			},
		};
		cameraRef.current?.takePictureAsync(options);
	}
	return (
		<View style={styles.container}>
			<Camera style={styles.camera} type={type} ref={cameraRef}>
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={toggleCameraType}>
						<Text style={styles.text}>Flip Camera</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button} onPress={takePicture}>
						<Text style={styles.text}>Take picture</Text>
					</TouchableOpacity>
				</View>
			</Camera>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
	camera: {
		flex: 1,
	},
	buttonContainer: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: 'transparent',
		margin: 64,
	},
	button: {
		flex: 1,
		alignSelf: 'flex-end',
		alignItems: 'center',
	},
	text: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'white',
	},
});
