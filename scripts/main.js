const qrType = document.getElementById("qrType");
const inputFields = document.getElementById("inputFields");
const generateBtn = document.getElementById("generateBtn");
const qrResult = document.getElementById("qrResult");
const downloadBtn = document.getElementById("downloadBtn");

// Cloudinary upload preset and API details (update if needed)
const CLOUD_NAME = "djthtit8q"; // Replace with your Cloudinary cloud name
const UPLOAD_PRESET = "ml_default"; // Replace with your unsigned upload preset

const gradientPresets = {
  solid: { colors: ["#000000", "#000000"], background: "#ffffff" }, // black on white
  gradient1: { colors: ["#4361ee", "#3a0ca3"] },
  gradient2: { colors: ["#7209b7", "#f72585"] },
  gradient3: { colors: ["#2ec4b6", "#e71d36"] },
};

function init() {
  inputFields.innerHTML = getFields(qrType.value);
  setupEventListeners();
}

function setupEventListeners() {
  qrType.addEventListener("change", () => {
    inputFields.innerHTML = getFields(qrType.value);
  });

  generateBtn.addEventListener("click", handleGenerate);
  downloadBtn.addEventListener("click", downloadQRCode);

  document.addEventListener("change", (e) => {
    if (e.target && e.target.id === "fileInput") {
      const file = e.target.files[0];
      if (file) handleFileUpload(file);
    }
  });
}

function getFields(type) {
  switch (type) {
    case "text":
      return `<input type="text" id="textInput" class="form-control" placeholder="Enter your text" />`;
    case "url":
      return `<input type="url" id="urlInput" class="form-control" placeholder="Enter your URL" />`;
    case "contact":
      return `
        <div class="contact-input-group">
          <select id="countryCode" class="form-control">
            <option value="+1">+1 (US)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+91">+91 (India)</option>
          </select>
          <input type="tel" id="phoneInput" class="form-control" placeholder="Phone Number" />
        </div>
        <input type="text" id="nameInput" class="form-control" placeholder="Full Name" />
        <input type="email" id="emailInput" class="form-control" placeholder="Email Address" />
      `;
    case "image":
      return `
        <div class="file-upload-wrapper">
          <label for="fileInput" class="file-upload-label">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Choose Image File</span>
            <input type="file" id="fileInput" accept="image/*" />
          </label>
          <div id="filePreview" class="file-preview">
            <div class="preview-placeholder">
              <i class="fas fa-image"></i>
              <p>No image selected</p>
            </div>
          </div>
        </div>
      `;
    case "wifi":
      return `
        <input type="text" id="wifiSsid" class="form-control" placeholder="Wi-Fi Name (SSID)" />
        <select id="wifiEncryption" class="form-control">
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="">None (Open)</option>
        </select>
        <input type="password" id="wifiPassword" class="form-control" placeholder="Password" />
      `;
    default:
      return "";
  }
}

function handleGenerate() {
  const type = qrType.value;
  let data = "";

  if (type === "text") {
    data = document.getElementById("textInput")?.value || "";
  } else if (type === "url") {
    let url = document.getElementById("urlInput")?.value || "";
    if (url && !url.startsWith("http")) url = "https://" + url;
    data = url;
  } else if (type === "contact") {
    const name = document.getElementById("nameInput")?.value || "";
    const phone = document.getElementById("phoneInput")?.value || "";
    const email = document.getElementById("emailInput")?.value || "";
    const countryCode = document.getElementById("countryCode")?.value || "";
    data = `MECARD:N:${name};TEL:${countryCode}${phone};EMAIL:${email};;`;
  } else if (type === "wifi") {
    const ssid = document.getElementById("wifiSsid")?.value || "";
    const encryption = document.getElementById("wifiEncryption")?.value || "";
    const password = document.getElementById("wifiPassword")?.value || "";
    data = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
  }

  if (data.trim()) {
    generateQR(data);
  } else {
    showToast("Please fill in the required fields", true);
  }
}

function generateQR(data) {
  qrResult.innerHTML =
    '<div class="spinner"><i class="fas fa-spinner fa-spin"></i> Generating...</div>';

  const style = document.getElementById("qrStyle").value;
  const preset = gradientPresets[style];
  const bgColor = preset?.background || "transparent";

  QRCode.toCanvas(
    data,
    {
      color: {
        dark: "#000000",
        light: bgColor === "transparent" ? "#00000000" : bgColor,
      },
      width: 300,
      margin: 1,
      errorCorrectionLevel: "H",
    },
    (err, canvas) => {
      if (err) {
        console.error(err);
        showToast("QR generation failed", true);
        return;
      }

      applyStyle(canvas, style, bgColor);
      qrResult.innerHTML = "";
      qrResult.appendChild(canvas);
      downloadBtn.disabled = false;
    }
  );
}

function applyStyle(canvas, style, bgColor) {
  const ctx = canvas.getContext("2d");
  const size = canvas.width;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = size;
  tempCanvas.height = size;
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.drawImage(canvas, 0, 0);
  tempCtx.globalCompositeOperation = "source-in";

  if (style === "solid") {
    tempCtx.fillStyle = "#000000";
    tempCtx.fillRect(0, 0, size, size);

    // White background layer
    tempCtx.globalCompositeOperation = "destination-over";
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, size, size);
  } else {
    const gradient = tempCtx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, gradientPresets[style].colors[0]);
    gradient.addColorStop(1, gradientPresets[style].colors[1]);
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, size, size);
  }

  ctx.clearRect(0, 0, size, size);
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(tempCanvas, 0, 0);
}




function downloadQRCode() {
  const canvas = qrResult.querySelector("canvas");
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = "qr-code.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : "success"}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Upload file to Cloudinary and use the returned URL
async function handleFileUpload(file) {
  const previewContainer = document.getElementById("filePreview");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const loadingHTML = `<p>Uploading to Cloudinary...</p>`;
  previewContainer.innerHTML = loadingHTML;

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();

    const imageUrl = data.secure_url;
    previewContainer.innerHTML = `
      <div class="upload-success-box">
        <img src="${imageUrl}" alt="Uploaded Image" class="upload-preview-img" />
        <div class="upload-meta">
          <p class="file-name">${file.name}</p>
          <p class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>`;
    generateQR(imageUrl);
  } catch (error) {
    console.error(error);
    previewContainer.innerHTML = "<p>Upload failed</p>";
    showToast("Cloud upload failed", true);
  }
}

init();
