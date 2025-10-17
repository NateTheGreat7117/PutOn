import axios from "axios";

(async () => {
  try {
    const res = await axios.get("https://huggingface.co");
    console.log("Success:", res.status);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
