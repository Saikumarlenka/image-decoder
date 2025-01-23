import React, { useState } from "react";
import axios from "axios";

const ImageDecoder = () => {
  const [image, setImage] = useState(null);
  const [oimage,setOimage] = useState(null);
  const [count,Setcount]=useState(null)
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the selected file

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = () => {
        setImage({ file, preview: reader.result, name: file.name });
      };

      reader.onerror = () => {
        alert("There was an error reading the file.");
      };

      reader.readAsDataURL(file); // Generate a preview for the image
    } else {
      alert("Please select a valid image file.");
      setImage(null);
    }
  };



  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image before uploading.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", image.file);
  
    try {
      setUploadStatus("Uploading...");
  
      const response = await axios.post("http://127.0.0.1:8000/image-scan/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log(response);
  
      if (response.status === 200) {
        setUploadStatus("Upload successful!");
        // Assuming the response contains an updated image or detection count:
        // setOimage(response.data.image);
        // Setcount(response.data.count);
        Setcount(count); // Your logic remains here
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
      <input
        type="file"
        id="imagePicker"
        accept="image/*"
        onChange={handleFileChange}
      />
      <div style={{ marginTop: "20px" }}>
        {image ? (
          <div style={{ textAlign: "center" }}>
            <h3>Preview:</h3>
            <img
              src={image.preview}
              alt={image.name}
              style={{
                maxWidth: "300px",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
            <p style={{ fontSize: "14px", marginTop: "10px", wordBreak: "break-word" }}>
              {image.name}
            </p>
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
      <div>
  {oimage !== null && (
    <img
      src={oimage}
      alt="Selected"
      style={{
        maxWidth: "100%",
        maxHeight: "300px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    />
  )}
</div>
<div>{
    count && (
        <h2>Count:{count}</h2>
    )
    }
</div>

    </div>
  );
};

export default ImageDecoder;
