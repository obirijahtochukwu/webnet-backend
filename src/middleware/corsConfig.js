const cors = require("cors");

const corsConfig = cors({
  origin: "http://localhost:3000",
  methods: "GET, POST, PATCH, DELETE",
  allowedHeaders:['Content-type','Authorization']
  credentials: true,
});

module.exports = corsConfig;
