import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ImageDecoder.css";

const ImageDecoder = () => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [count, setCount] = useState(null);
  const [oimage, setOimage] = useState(null);
  const [imageType, setImageType] = useState("");
  const [error, setError] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [cameraId, setCameraId] = useState(null); // Store selected camera ID
  const [devices, setDevices] = useState([]); // List of media devices
  const canvasRef = useRef(null);

  const imageTypes = ["wood", "box"];

  useEffect(() => {
    // Enumerate devices when component mounts
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter((device) => device.kind === "videoinput");
        setDevices(videoDevices);

        if (videoDevices.length > 0) {
          setCameraId(videoDevices[0].deviceId); // Default to the first camera
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };
    getDevices();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setError("");
      stopCamera(); // Stop the camera if a file is selected
    } else {
      setError("Please select a valid image file.");
      setImageFile(null);
      setPreview(null);
    }
  };

  const handleTypeChange = (event) => {
    setImageType(event.target.value);
    setError("");
  };

  const handleUpload = async () => {
    if (!imageFile) {
      setError("Image is required.");
      return;
    }

    if (!imageType) {
      setError("Image type is required.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("type", imageType);

    try {
      setUploadStatus("Uploading...");
      setError("");

      const response = await axios.post("http://127.0.0.1:8000/image-scan/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setUploadStatus("Upload successful!");
        setCount(response.data.count);
        setOimage(response.data.image_path);
      } else {
        setUploadStatus("Upload failed.");
      }
    } catch (error) {
      setUploadStatus("An error occurred while uploading.");
    }
  };

  const startCamera = async () => {
    try {
      const cameraContainer = document.getElementById("cameraContainer");
      cameraContainer.innerHTML = ""; // Clear previous camera container

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: cameraId } },
      });
      setVideoStream(stream);
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      videoElement.play();

      const containerWidth = cameraContainer.clientWidth;
      const videoWidth = containerWidth * 0.5; // 50% width of the container
      videoElement.width = videoWidth;
      videoElement.height = videoWidth * (480 / 640); // Maintain aspect ratio
      videoElement.id = "videoElement";
      setIsCameraActive(true);

      // Append video element to the DOM
      cameraContainer.appendChild(videoElement);
    } catch (error) {
      console.error("An error occurred while accessing the camera:", error);
    }
  };

  const captureImage = () => {
    if (canvasRef.current && videoStream) {
      const videoElement = document.getElementById("videoElement");
      const canvas = canvasRef.current;
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL("image/png");

      // Create a File from the canvas image data URL
      fetch(imageUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "captured_image.png", { type: "image/png" });
          setImageFile(file);
          setPreview(imageUrl);
          stopCamera(); // Stop the camera after capturing
        })
        .catch(() => setError("Error capturing image."));
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
      setIsCameraActive(false);

      const cameraContainer = document.getElementById("cameraContainer");
      cameraContainer.innerHTML = ""; // Clear the camera container
    }
  };

  const handleCapture = () => {
    if (!isCameraActive) {
      startCamera();
    } else {
      captureImage();
    }
  };

  const handleCameraSwitch = (deviceId) => {
    setCameraId(deviceId);
    stopCamera(); // Stop the current camera stream
    startCamera(); // Restart with the selected camera
  };

  return (
    <div className="container">
      <div className="wrapper">
        <label htmlFor="imageType" className="select-type-label">
          Select Type of Image:
        </label>
        <select
          id="imageType"
          value={imageType}
          onChange={handleTypeChange}
          className="select-type"
        >
          <option value="">--Select Type--</option>
          {imageTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <div className="space-buttons1">
          <button onClick={handleCapture} className="capture-button">
            {isCameraActive ? "Capture Image" : "Use Camera to Capture Image"}
          </button>

          <label htmlFor="fileInput" className="custom-upload-button">
            Upload from Device
          </label>
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
            className="input-file"
            style={{ display: "none" }}
          />
        </div>

        {/* Show camera canvas if camera is active */}
        {isCameraActive ? (
          <div className="camera-container">
            <canvas ref={canvasRef}></canvas>
          </div>
        ) : (
          preview && (
            <div className="preview-section">
              <h3>Preview:</h3>
              <img src={preview} alt="Selected Preview" className="preview-image" />
            </div>
          )
        )}

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleUpload} className="upload-button">
          Upload Image
        </button>

        {uploadStatus && (
          <p
            className={`status-message ${
              uploadStatus === "Upload successful!" ? "status-success" : "status-fail"
            }`}
          >
            {uploadStatus}
          </p>
        )}

        {oimage && (
          <div className="processed-section">
            <h3>Processed Image:</h3>
            <img src={oimage} alt="Processed" className="processed-image" />
          </div>
        )}

        {count !== null && (
          <div className="detection-count">
            <h2>Detection Count: {count}</h2>
          </div>
        )}

        {devices.length > 1 && (
          <div className="camera-switch">
            <label>Select Camera:</label>
            <select
              onChange={(e) => handleCameraSwitch(e.target.value)}
              value={cameraId}
              className="camera-select"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div id="cameraContainer"></div>
    </div>
  );
};

export default ImageDecoder;
