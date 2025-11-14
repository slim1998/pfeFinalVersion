package com.securite.models;

import java.security.SecureRandom;

public class CodeGenerator {

    public static String generateUniqueCode() {
        SecureRandom random = new SecureRandom();
        int number = random.nextInt(100000000); // Génère un nombre entre 0 et 99999999
        return String.format("%08d", number); // Formatte le nombre pour qu'il ait toujours 8 chiffres
    }

    
    }

