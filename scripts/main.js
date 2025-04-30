// Tab functionality
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    btn.classList.add("active");
    const tabId = btn.getAttribute("data-tab");
    document.getElementById(`${tabId}-tab`).classList.add("active");
    resetQRCode();
  });
});

// QR Code Generation
const qrCodeContainer = document.getElementById("qr-code");
const downloadBtn = document.getElementById("download-btn");
const saveBtn = document.getElementById("save-btn");

let currentQRCode = null;
let currentFileData = null;

// Text QR Code
document.getElementById("generate-text-btn").addEventListener("click", () => {
  const text = document.getElementById("text-input").value.trim();
  if (!text) return alert("Please enter some text");
  generateQRCode(text);
});

// URL QR Code
document.getElementById("generate-url-btn").addEventListener("click", () => {
  let url = document.getElementById("url-input").value.trim();
  if (!url) return alert("Please enter a URL");
  if (!url.startsWith("http")) url = "https://" + url;
  generateQRCode(url);
});

// Contact QR Code
document
  .getElementById("generate-contact-btn")
  .addEventListener("click", () => {
    const name = document.getElementById("contact-name").value.trim();
    const phone = document.getElementById("contact-phone").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const address = document.getElementById("contact-address").value.trim();

    if (!name && !phone && !email && !address) {
      return alert("Please enter at least one contact detail");
    }

    generateQRCode(
      `MECARD:N:${name};TEL:${phone};EMAIL:${email};ADR:${address};;`
    );
  });

// File QR Code
document.getElementById("file-input").addEventListener("change", (e) => {
  currentFileData = e.target.files[0];
  document.getElementById("generate-file-btn").disabled = !currentFileData;
});

document
  .getElementById("generate-file-btn")
  .addEventListener("click", async () => {
    if (!currentFileData) return alert("Please select a file first");

    try {
      const fileExt = currentFileData.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error } = await supabase.storage
        .from("qr-files")
        .upload(filePath, currentFileData);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = await supabase.storage.from("qr-files").getPublicUrl(filePath);

      generateQRCode(publicUrl);
    } catch (error) {
      console.error("Error:", error);
      alert("Error uploading file. Please try again.");
    }
  });

// Download QR Code
downloadBtn.addEventListener("click", () => {
  if (!currentQRCode) return;
  const canvas = document.querySelector("#qr-code canvas");
  const link = document.createElement("a");
  link.download = "qr-code.png";
  link.href = canvas.toDataURL();
  link.click();
});

// Save QR Code
saveBtn.addEventListener("click", async () => {
  if (!currentQRCode) return;
  try {
    const { error } = await supabase
      .from("saved_qr_codes")
      .insert([{ content: currentQRCode }]);
    if (error) throw error;
    alert("QR code saved!");
  } catch (error) {
    console.error("Error:", error);
    alert("Error saving QR code");
  }
});

// Helper functions
function generateQRCode(content) {
  qrCodeContainer.innerHTML = "";
  const qr = qrcode(0, "L");
  qr.addData(content);
  qr.make();
  qrCodeContainer.innerHTML = qr.createImgTag(10);
  downloadBtn.disabled = false;
  saveBtn.disabled = false;
  currentQRCode = content;
}

function resetQRCode() {
  qrCodeContainer.innerHTML = "<p>Generated QR code will appear here</p>";
  downloadBtn.disabled = true;
  saveBtn.disabled = true;
  currentQRCode = null;
  currentFileData = null;
}
