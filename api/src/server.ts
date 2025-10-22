import app from "./app.js";
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});