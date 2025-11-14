package com.exeptions;

public class CertificationNotFoundException extends RuntimeException {
    public CertificationNotFoundException(String message) {
        super(message);
    }
}
