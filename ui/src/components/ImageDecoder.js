import React, { useState } from "react";
import axios from "axios";

const ImageDecoder = () => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [count, setCount] = useState(null);
  const [oimage, setOimage] = useState(null);
  const [imageType, setImageType] = useState("");
  const [error, setError] = useState("");

  const imageTypes = ["wood", "box"];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setError("");
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

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <label htmlFor="imagePicker" style={{ display: "block", marginBottom: "10px" }}>
        Select an Image:
      </label>
      <input type="file" id="imagePicker" accept="image/*" onChange={handleFileChange} />

      <div style={{ marginTop: "20px" }}>
        {preview ? (
          <div style={{ textAlign: "center" }}>
            <h3>Preview:</h3>
            <img
              src={preview}
              alt="Selected Preview"
              style={{
                maxWidth: "300px",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        ) : (
          <p>No image selected</p>
        )}
      </div>

      <label htmlFor="imageType" style={{ display: "block", marginTop: "20px" }}>
        Select Image Type:
      </label>
      <select
        id="imageType"
        value={imageType}
        onChange={handleTypeChange}
        style={{
          marginTop: "10px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        <option value="">--Select Type--</option>
        {imageTypes.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase()+type.slice(1)}
          </option>
        ))}
      </select>

      <button
        onClick={handleUpload}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Upload Image
      </button>

      {error && <p style={{ marginTop: "20px", color: "red" }}>{error}</p>}

      {uploadStatus && (
        <p style={{ marginTop: "20px", color: uploadStatus === "Upload successful!" ? "green" : "red" }}>
          {uploadStatus}
        </p>
      )}

      {oimage && (
        <div>
          <h3>Processed Image:</h3>
          <img
            src={oimage}
            alt="Processed"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          />
        </div>
      )}

      {count !== null && (
        <div>
          <h2>Detection Count: {count}</h2>
        </div>
      )}
    </div>
  );
};

export default ImageDecoder;
