package com.filestorage;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageService {



        private final String uploadDir = "uploads/";

        public String saveFile(MultipartFile file, Long moduleId) throws IOException {
            String moduleFolder = uploadDir + "module_" + moduleId;
            File directory = new File(moduleFolder);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String filePath = moduleFolder + "/" + file.getOriginalFilename();
            Path path = Paths.get(filePath);
            Files.write(path, file.getBytes());

            return filePath;
        }


}
