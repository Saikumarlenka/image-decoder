import React, { useState, useRef } from "react";
import axios from "axios";
import "./ImageDecoder.css"; // Import the CSS file

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
  const [imageQuality, setImageQuality] = useState(0.5); // Add state for image quality
  const canvasRef = useRef(null);

  const imageTypes = ["wood", "box"];

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

  const handleQualityChange = (event) => {
    setImageQuality(event.target.value);
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
    formData.append("confidence_threshold", imageQuality); // Append image quality to form data

    try {
      setUploadStatus("Uploading...");
      setError("");

      const response = await axios.post(
        "http://127.0.0.1:8000/image-scan/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
      setPreview(null);
      setImageFile(null);
      setOimage(null);
      setCount(null);
      const cameraContainer = document.getElementById("cameraContainer");
      cameraContainer.innerHTML = ""; // Clear previous camera container

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
          const file = new File([blob], "captured_image.png", {
            type: "image/png",
          });
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

  return (
    <div className="container">
      <div className="wrapper">
        <div className="input-items">
          <label htmlFor="imageType" className="select-type-label inline-block">
            Select Type of Image:
          </label>
          <select
            id="imageType"
            value={imageType}
            onChange={handleTypeChange}
            className="select-type inline-block ml-2"
          >
            <option value="">--Select Type--</option>
            {imageTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <label htmlFor="" className="select-type-label">
          Pick up Image via:
        </label>

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
        <div id="cameraContainer"></div>

        {preview && (
          <div className="preview-section">
            <h3>Preview:</h3>
            <img
              src={preview}
              alt="Selected Preview"
              className="preview-image"
            />
          </div>
        )}

        <label htmlFor="imageQuality" className="select-type-label">
          Select Image Quality:
        </label>
        <input
          type="range"
          id="imageQuality"
          min="0.5"
          max="1"
          step="0.1"
          value={imageQuality}
          onChange={handleQualityChange}
          className="quality-slider"
        />
        <span>{imageQuality}</span>

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleUpload} className="upload-button">
          Upload Image
        </button>

        {uploadStatus && (
          <p
            className={`status-message ${
              uploadStatus === "Upload successful!"
                ? "status-success"
                : "status-fail"
            }`}
          >
            {uploadStatus}
          </p>
        )}

        {oimage && isCameraActive === false && (
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
      </div>

      {/* Hidden canvas for capturing image */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
  );
};

export default ImageDecoder;
