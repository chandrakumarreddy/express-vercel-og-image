const express = require("express");
const app = express();
const ogImage = require("./api/og-image");

app.use(express.json({ extended: false }));

app.use("/api/og-image", ogImage);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
