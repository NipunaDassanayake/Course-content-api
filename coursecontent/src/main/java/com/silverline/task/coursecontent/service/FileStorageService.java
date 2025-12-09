package com.silverline.task.coursecontent.service;

import com.silverline.task.coursecontent.exceptions.FileStorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    public FileStorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Upload file to S3 and return the generated object key.
     */
    public String storeFile(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        String key = generateKey(originalName);

        try {
            log.info("Uploading file to S3. bucket={}, key={}, size={}",
                    bucketName, key, file.getSize());

            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putReq, RequestBody.fromBytes(file.getBytes()));

            log.info("Upload to S3 successful. key={}", key);
            return key;
        } catch (IOException e) {
            log.error("Failed to upload file to S3: {}", e.getMessage(), e);
            throw new FileStorageException("Failed to upload file to S3");
        }
    }

    /**
     * Read file bytes from S3 by object key.
     */
    public byte[] readFile(String key) {
        try {
            log.info("Downloading file from S3. bucket={}, key={}", bucketName, key);

            GetObjectRequest getReq = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getReq);

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] data = new byte[8192];
            int nRead;
            while ((nRead = s3Object.read(data)) != -1) {
                buffer.write(data, 0, nRead);
            }
            buffer.flush();
            return buffer.toByteArray();
        } catch (NoSuchKeyException e) {
            log.warn("S3 object not found. key={}", key);
            throw new FileStorageException("File not found in S3: " + key);
        } catch (IOException e) {
            log.error("Error reading S3 object. key={}, error={}", key, e.getMessage(), e);
            throw new FileStorageException("Error reading file from S3: " + key);
        }
    }

    /**
     * Delete object from S3.
     */
    public void deleteFile(String key) {
        try {
            log.info("Deleting file from S3. bucket={}, key={}", bucketName, key);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);

            log.info("Successfully deleted from S3. key={}", key);
        } catch (S3Exception e) {
            log.error("Failed to delete file from S3. key={}, error={}", key, e.awsErrorDetails().errorMessage(), e);
            // optional: throw custom exception if you want the API call to fail
            // throw new FileStorageException("Error deleting file from S3: " + e.getMessage());
        }
    }

    /**
     * Optional: public URL if bucket/CloudFront is configured as public.
     */
    public String getPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName, region, key);
    }

    private String generateKey(String originalName) {
        String cleanName = (originalName == null || originalName.isBlank())
                ? "file"
                : originalName.replace(" ", "_");
        return UUID.randomUUID() + "_" + cleanName;
    }
}
