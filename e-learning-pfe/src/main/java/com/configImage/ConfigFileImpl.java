package com.configImage;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.stream.Stream;

@Service("UserImageStorageImpl")
public class ConfigFileImpl implements ImageStorage {

    private final Path imageLocation;

    public ConfigFileImpl(FileStorageProperties fileStorageProperties) {
        this.imageLocation = Paths.get(fileStorageProperties.getUploadImgUsersDir()).toAbsolutePath().normalize();
        try {
            // Ensure directory exists
            Files.createDirectories(this.imageLocation);
        } catch (Exception e) {
            throw new FileStorageException("Could not create the directory where the uploaded images will be stored", e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        try {
            // Ensure directory exists
            Files.createDirectories(this.imageLocation);
            
            if (fileName.contains("..")) {
                throw new FileStorageException("File name contains invalid path sequence " + fileName);
            }
            
            // Validate file is not empty
            if (file.isEmpty()) {
                throw new FileStorageException("Failed to store empty file " + fileName);
            }
            
            Path targetLocation = this.imageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to store file: " + fileName, e);
        }
    }

    @Override
    public Resource loadResource(String filename) {
        try {
            // Ensure directory exists
            Files.createDirectories(this.imageLocation);
            
            Path path = imageLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(path.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                // Return a default resource or throw specific exception
                throw new FileNotFoundException("File not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Malformed URL for file: " + filename, e);
        } catch (IOException e) {
            throw new RuntimeException("Could not create directory for file: " + filename, e);
        }
    }

    // Add this method to check if file exists
    public boolean fileExists(String filename) {
        try {
            Path path = imageLocation.resolve(filename).normalize();
            return Files.exists(path) && Files.isRegularFile(path);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void deleteAll() {
        try {
            FileSystemUtils.deleteRecursively(imageLocation.toFile());
            // Recreate the directory after deletion
            Files.createDirectories(this.imageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete files", e);
        }
    }

    @Override
    public void init() {
        try {
            Files.createDirectories(imageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @Override
    public Stream<Path> loadFiles() {
        try {
            // Ensure directory exists
            Files.createDirectories(this.imageLocation);
            
            return Files.walk(this.imageLocation, 1)
                    .filter(item -> !item.equals(this.imageLocation))
                    .map(this.imageLocation::relativize);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read stored images", e);
        }
    }

    @Override
    public ResponseEntity<Resource> downloadUserImage(String imageName, HttpServletRequest request) {
        try {
            // Check if file exists first
            if (!fileExists(imageName)) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = this.loadResource(imageName);
            String contentType = null;
            
            try {
                if (resource != null && resource.exists()) {
                    contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
                }
            } catch (IOException e) {
                // Use default content type if cannot determine
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            // Fallback content type
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Resource> downloadUserVideo(String videoName, HttpServletRequest request) {
        try {
            // Check if file exists first
            if (!fileExists(videoName)) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = this.loadResource(videoName);
            String contentType = null;
            
            try {
                if (resource != null && resource.exists()) {
                    contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
                }
            } catch (IOException e) {
                // Use default content type for video
                contentType = "video/mp4";
            }

            // Fallback content type for video
            if (contentType == null) {
                contentType = "video/mp4";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

// Add this custom exception class if not exists
class FileNotFoundException extends RuntimeException {
    public FileNotFoundException(String message) {
        super(message);
    }
    
    public FileNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}