const cors = require("cors");

const corsConfig = cors({
  origin: ["http://localhost:3000", "https://jolly-pavlova-b9c744.netlify.app"],
  methods: "GET, POST, PATCH, DELETE",
  credentials: true,
});

module.exports = corsConfig;
