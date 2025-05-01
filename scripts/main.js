const qrType = document.getElementById("qrType");
const inputFields = document.getElementById("inputFields");
const generateBtn = document.getElementById("generateBtn");
const qrResult = document.getElementById("qrResult");

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

function generateQR(data) {
  qrResult.innerHTML = "";
  const fgColor = document.getElementById("fgColor")?.value || "#000000";
  const bgColor = document.getElementById("bgColor")?.value || "#ffffff";

  QRCode.toCanvas(
    data,
    {
      color: {
        dark: fgColor,
        light: bgColor,
      },
    },
    (err, canvas) => {
      if (err) {
        console.error(err);
        qrResult.innerHTML = `<p class="error-message">QR generation failed.</p>`;
        return;
      }
      canvas.classList.add("generated-qr");
      qrResult.appendChild(canvas);
      document.getElementById("downloadBtn").disabled = false;
    }
  );
}

function handleGenerate() {
  const type = qrType.value;
  let data = "";

  if (type === "text") {
    data = document.getElementById("textInput")?.value || "";
  } else if (type === "url") {
    let url = document.getElementById("urlInput")?.value || "";
    if (url && !url.startsWith("http")) {
      url = "https://" + url;
    }
    data = url;
  } else if (type === "contact") {
    const name = document.getElementById("nameInput")?.value || "";
    const phone = document.getElementById("phoneInput")?.value || "";
    const email = document.getElementById("emailInput")?.value || "";
    const countryCode = document.getElementById("countryCode")?.value || "";
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
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (file.size > maxSize) {
    previewContainer.innerHTML = `
      <div class="upload-error-box">
        <i class="fas fa-exclamation-circle"></i>
        <p class="error-text">File too large (max 5MB)</p>
      </div>
    `;
    return;
  }

  // Show preview
  const reader = new FileReader();
  reader.onload = (event) => {
    previewContainer.innerHTML = `
      <div class="upload-success-box">
        <img src="${
          event.target.result
        }" alt="Uploaded Image" class="upload-preview-img" />
        <div class="upload-meta">
          <p class="file-name">${file.name}</p>
          <p class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    `;
  };
  reader.readAsDataURL(file);

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default");

  const cloudName = "djthtit8q";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.secure_url) throw new Error("Upload failed");

    // Generate QR from uploaded image URL
    QRCode.toDataURL(data.secure_url, {
      color: {
        dark: document.getElementById("fgColor")?.value || "#000000",
        light: document.getElementById("bgColor")?.value || "#ffffff",
      },
    })
      .then((qrUrl) => {
        qrResult.innerHTML = `<img src="${qrUrl}" alt="QR Code" class="generated-qr" />`;
        document.getElementById("downloadBtn").disabled = false;
      })
      .catch((err) => {
        console.error("QR Code Generation Failed:", err);
        qrResult.innerHTML = `<p class="error-message">QR generation failed.</p>`;
      });
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    previewContainer.innerHTML = `
      <div class="upload-error-box">
        <i class="fas fa-exclamation-circle"></i>
        <p class="error-text">Image upload failed</p>
      </div>
    `;
  }
}

// Event Listeners
qrType.addEventListener("change", () => {
  inputFields.innerHTML = getFields(qrType.value);
});

generateBtn.addEventListener("click", handleGenerate);

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "fileInput") {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  }
});

// Initialize
inputFields.innerHTML = getFields(qrType.value);



// Gradient Toggle Logic
document.querySelectorAll('.gradient-toggle').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const targetId = e.target.dataset.target;
    const colorInput = document.getElementById(targetId);
    colorInput.style.display = colorInput.style.display === 'none' ? 'block' : 'none';
    e.target.textContent = colorInput.style.display === 'none' ? '+ Gradient' : '× Remove';
  });
});

// Modified generateQR function
function generateQR(data) {
  const fgColor1 = document.getElementById('fgColor1').value;
  const fgColor2 = document.getElementById('fgColor2').value;
  const bgColor1 = document.getElementById('bgColor1').value;
  const bgColor2 = document.getElementById('bgColor2').value;
  const transparentBg = document.getElementById('transparentBg').checked;
  
  // Create gradient
  const fgGradient = fgColor1 !== fgColor2 
    ? `linear-gradient(135deg, ${fgColor1}, ${fgColor2})`
    : fgColor1;

  const options = {
    color: {
      dark: fgGradient,
      light: transparentBg ? '#00000000' : 
            (bgColor1 !== bgColor2 
              ? `linear-gradient(135deg, ${bgColor1}, ${bgColor2})`
              : bgColor1)
    },
    margin: 2,
    errorCorrectionLevel: 'H'
  };

  // Generate QR with options
  QRCode.toCanvas(data, options, (err, canvas) => {
    if (err) {
      console.error(err);
      showToast("QR generation failed", true);
      return;
    }
    
    if (document.getElementById('roundedCorners').checked) {
      roundQRDots(canvas);
    }
    
    qrResult.innerHTML = '';
    qrResult.appendChild(canvas);
  });
}

// Helper for rounded dots
function roundQRDots(canvas) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const moduleSize = size / (21 + 8); // 21 modules + 4px margin each side
  
  // Sample implementation - would need more precise module detection
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'black';
  
  // Draw rounded rectangles at module positions
  // (This is simplified - real implementation would need module detection)
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const px = 4 + x * moduleSize;
      const py = 4 + y * moduleSize;
      
      ctx.beginPath();
      ctx.roundRect(px, py, moduleSize, moduleSize, [moduleSize/2]);
      ctx.fill();
    }
  }
}