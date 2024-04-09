
const cloudinary = require('cloudinary').v2;


// import {v2 as cloudinary} from 'cloudinary';
          
// cloudinary.config({ 
//   cloud_name: 'diwunv4ge', 
//   api_key: '573215452166651', 
//   api_secret: '_fQCGNIjuAQUt9bC1DnzAR-LA98' 
// });
 const configCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return cloudinary;
};

module.exports = configCloudinary;