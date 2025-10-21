import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.HUGGINGFACE_API_KEY;
const URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base";

async function testImage() {
  const imagePath = "./assets/images/outfits/fyp/friends/IMG_4717.jpg";  // adjust path as needed
  const imageData = fs.readFileSync(imagePath);

  try {
    const res = await axios.post(URL, imageData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/octet-stream"
      },
      timeout: 30000
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.error("ERROR:", {
      status: err.response?.status,
      data: err.response?.data
    });
  }
}

testImage();
