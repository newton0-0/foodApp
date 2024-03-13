const AWS = require('aws-sdk');
const fs = require('fs');

function uploadFileToS3(bucketName, filePath, keyName) {
    // Configure AWS credentials and region
    AWS.config.update({ accessKeyId: 'YOUR_ACCESS_KEY', secretAccessKey: 'YOUR_SECRET_ACCESS_KEY', region: 'YOUR_REGION' });

    // Create an instance of the S3 service
    const s3 = new AWS.S3();

    // Read the file from the local file system
    const fileContent = fs.readFileSync(filePath);

    // Set the parameters for the S3 upload
    const params = {
        Bucket: bucketName,
        Key: keyName,
        Body: fileContent
    };

    // Upload the file to S3
    s3.upload(params, function(err, data) {
        if (err) {
            console.error('Error uploading file:', err);
        } else {
            console.log('File uploaded successfully:', data.Location);
        }
    });
}

module.exports = {
    uploadFileToS3
};
