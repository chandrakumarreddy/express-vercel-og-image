const express = require("express");
const app = express();
const path = require("path");
const ogImage = require("./api/og-image");
const getImage = require("./api/get-image");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ extended: false }));

app.use("/api/og-image", ogImage);
app.use("/api/get-image", getImage);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
