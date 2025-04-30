const qrType = document.getElementById("qrType");
const inputFields = document.getElementById("inputFields");
const generateBtn = document.getElementById("generateBtn");
const qrResult = document.getElementById("qrResult");

function getFields(type) {
  switch (type) {
    case "text":
      return `<input type="text" id="textInput" placeholder="Enter your text" />`;
    case "url":
      return `<input type="url" id="urlInput" placeholder="Enter your URL" />`;
    case "contact":
      return `
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
          <select id="countryCode">
            <option value="+1">+1 (US)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+91">+91 (India)</option>
            <!-- Add more country codes -->
          </select>
          <input type="tel" id="phoneInput" placeholder="Phone Number" />
        </div>
        <input type="text" id="nameInput" placeholder="Full Name" />
        <input type="email" id="emailInput" placeholder="Email Address" />
      `;
    case "file":
      return `
        <input type="file" id="fileInput" accept="image/*" />
        <div id="filePreview" style="margin-top: 10px;">
          <p>No file selected</p>
        </div>
      `;
    default:
      return "";
  }
}

function generateQR(data) {
  qrResult.innerHTML = "";
  QRCode.toCanvas(data, (err, canvas) => {
    if (err) {
      console.error(err);
      qrResult.innerHTML = `<p style="color:red;">QR generation failed.</p>`;
      return;
    }
    qrResult.appendChild(canvas);
  });
}

function handleGenerate() {
  const type = qrType.value;
  let data = "";

  if (type === "text") {
    data = document.getElementById("textInput").value;
  } else if (type === "url") {
    data = document.getElementById("urlInput").value;
  } else if (type === "contact") {
    const name = document.getElementById("nameInput").value;
    const phone = document.getElementById("phoneInput").value;
    const email = document.getElementById("emailInput").value;
    const countryCode = document.getElementById("countryCode").value;
    data = `MECARD:N:${name};TEL:${countryCode}${phone};EMAIL:${email};;`;
  }

  if (data.trim()) {
    generateQR(data);
  } else {
    alert("Please fill in the required fields.");
  }
}

async function handleFileUpload(file) {
  const previewContainer = document.getElementById("filePreview");

  // Show preview
  const reader = new FileReader();
  reader.onload = (event) => {
    previewContainer.innerHTML = `
  <div class="upload-success-box">
    <img src="${event.target.result}" alt="Uploaded Image" class="upload-preview-img" />
    <p class="upload-status-text">✅ Image Uploaded Successfully</p>
  </div>
`;
  };
  reader.readAsDataURL(file);

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default"); // Replace with your preset

  const cloudName = "djthtit8q"; // Replace with your Cloudinary cloud name
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.secure_url) throw new Error("Upload failed");

    console.log("Uploaded Image URL:", data.secure_url);

    // Generate QR from uploaded image URL
    QRCode.toDataURL(data.secure_url)
      .then((qrUrl) => {
        qrResult.innerHTML = `<img src="${qrUrl}" alt="QR Code" />`;
      })
      .catch((err) => {
        console.error("QR Code Generation Failed:", err);
        qrResult.innerHTML = `<p style="color:red;">QR generation failed.</p>`;
      });
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    previewContainer.innerHTML = `<p style="color:red;">Image upload failed.</p>`;
  }
}

// Handle file input change
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "fileInput") {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  }
});

// Handle QR type change
qrType.addEventListener("change", () => {
  inputFields.innerHTML = getFields(qrType.value);
});

// Initial load
inputFields.innerHTML = getFields(qrType.value);
generateBtn.addEventListener("click", handleGenerate);

previewContainer.innerHTML = `
  <div class="upload-success-box">
    <img src="${event.target.result}" alt="Uploaded Image" class="upload-preview-img" />
    <p class="upload-status-text">✅ Image Uploaded Successfully</p>
  </div>
`;
