import React, { useState } from "react";
import axios from "axios";

const ImageDecoder = () => {
  const [imageFile, setImageFile] = useState(null); // State to hold the actual file
  const [preview, setPreview] = useState(null); // State for preview URL
  const [uploadStatus, setUploadStatus] = useState("");
  const [count, setCount] = useState(null); // Example API response data
  const [oimage, setOimage] = useState(null); // Example of processed image response

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (file && file.type.startsWith("image/")) {
      setImageFile(file); // Set the selected file in state
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl); // Set the preview URL
    } else {
      alert("Please select a valid image file.");
      setImageFile(null);
      setPreview(null);
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!imageFile) {
      alert("Please select an image before uploading.");
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("file", imageFile);
 
    
    try {
      setUploadStatus("Uploading...");

      // Upload via Axios
      const response = await axios.post("http://127.0.0.1:8000/image-scan/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response);

      if (response.status === 200) {
        setUploadStatus("Upload successful!");
        setCount(response.data.count); // Assume 'count' is part of the API response
        setOimage(response.data.image); // Assume 'image' is part of the API response
      } else {
        setUploadStatus("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
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
