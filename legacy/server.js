const express = require('express');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const connectDB = require('./config/db');
connectDB();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/post', postRoutes);
app.use('/comment', commentRoutes);



app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
