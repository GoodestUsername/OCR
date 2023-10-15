import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Camera, CameraType, ImageType } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import {
	Button,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const App = () => {
	const [type, setType] = useState(CameraType.back);
	const [scannedText, setScannedText] = useState<string>('');
	const [permission, requestPermission] = Camera.useCameraPermissions();
	const cameraRef = useRef<Camera>(null);

	const toggleCameraType = () => {
		setType(current =>
			current === CameraType.back ? CameraType.front : CameraType.back,
		);
	};

	const takePicture = () => {
		// TODO: implement upload via "react-native-background-upload
		// pause > resume > takepicture is used to create illusion of speed of capture.
		cameraRef.current?.pausePreview();
		cameraRef.current?.resumePreview();
		cameraRef.current?.takePictureAsync({
			quality: 1,
			base64: true,
			exif: false,
			imageType: ImageType.png,
			skipProcessing: false,
			onPictureSaved: newPhoto => {
				TextRecognition.recognize(newPhoto.uri).then(result => {
					setScannedText(result?.text);
				});
			},
		});
	};

	const clearText = () => {
		setScannedText('');
	};

	const ScannedTextSection = useMemo(() => {
		return (
			<ScrollView
				showsVerticalScrollIndicator={true}
				persistentScrollbar={true}
				style={styles.buttonContainer}>
				<Text selectable={true} style={[styles.scannedText]}>
					{scannedText}
				</Text>
			</ScrollView>
		);
	}, [scannedText]);

	const ButtonSection = useMemo(() => {
		return (
			<View style={styles.buttonContainer}>
				<TouchableOpacity style={styles.button} onPress={toggleCameraType}>
					<Text style={styles.text}>Flip Camera</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={takePicture}>
					<Text style={styles.text}>Take Picture</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={clearText}>
					<Text style={styles.text}>Clear Text</Text>
				</TouchableOpacity>
			</View>
		);
	}, []);

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

	return (
		<View style={styles.container}>
			<StatusBar />
			<Camera style={styles.camera} type={type} ref={cameraRef}>
				{ScannedTextSection}
				{ButtonSection}
			</Camera>
		</View>
	);
};

export default App;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
	camera: {
		flex: 1,
	},
	buttonContainer: {
		flexDirection: 'row',
		backgroundColor: 'transparent',
		margin: 32,
		marginTop: 0,
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
	scannedTextContainer: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: 'transparent',
		margin: 16,
		marginBottom: 0,
	},
	scannedText: {
		flex: 1,
		fontSize: 12,
		color: 'white',
	},
});
