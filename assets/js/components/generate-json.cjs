const fs = require("fs");
const path = require("path");

// Path to your image folder
const folder = path.join(__dirname, "../../images/outfits/fyp/friends");

// Path where images.json should be saved
const outputPath = path.join(__dirname, "../../../data/images.json");

fs.readdir(folder, (err, files) => {
  if (err) throw err;

  // Only include image files
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  // Create JSON array with relative paths
  const json = JSON.stringify(
    imageFiles.map(file => "/assets/images/outfits/fyp/friends/" + file),
    null,
    2
  );

  // Write JSON file
  fs.writeFileSync(outputPath, json);

  console.log(`✅ images.json generated with ${imageFiles.length} images at ${outputPath}`);
});